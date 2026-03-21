import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { registerAiBuilderRoutes } from "./ai-builder";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { generateWebsite, editWebsiteWithAI, generateSocialContent, generateSocialPostImage, generateVideoScript, generateTrendContent, GenerateWebsiteOptions, tryDirectFontChange } from "./ai";
import { processChat, getChatbotStats, getCacheStats, runSelfImprovementCycle, detectLanguageAndDialect, getConversationHistory } from "./chatbot";
import { validateToken, getGitHubUser, listUserRepos, createRepo, pushWebsiteToRepo } from "./github";
import { runIndustryEngine, detectIndustry, mapActivityToIndustry } from "./industry-engine";
import { deployToVercel, isVercelConfigured } from "./vercel-deploy";
import { checkDomainAvailability, HOSTING_PLANS, DEFAULT_TLD_PRICES, isConfigured as isRcConfigured } from "./resellerclub";
import { ensureLearningTables, getLearningStats, getPatternsByIndustry, signalSatisfied, signalRegeneration, logGenerationInsight } from "./learning-engine";
import { detectDesignStyle } from "./image-system";
import { createPaymobOrder, getPaymentKey, getIframeUrl, verifyHmac, isPaymobConfigured, PLAN_PRICES } from "./paymob";
import { sendPaymentSuccessEmail, sendLowCreditsEmail, sendInvoiceEmail, type InvoiceData, sendSupportTicketToTeam, sendSupportTicketConfirmation, sendFeedbackNotificationToTeam } from "./email";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import archiver from "archiver";
import crypto from "crypto";
import { db, pool } from "./db";
import { users, subscriptions, creditPurchases } from "@shared/schema";
import { eq, sql, and, gte, desc, lt } from "drizzle-orm";

if (!process.env.SESSION_SECRET) {
  console.error("[FATAL] SESSION_SECRET environment variable is not set. Token encryption is disabled.");
}
const ENCRYPTION_KEY = process.env.SESSION_SECRET
  ? crypto.createHash("sha256").update(process.env.SESSION_SECRET).digest()
  : null;
const IV_LENGTH = 16;

// Per-user AI rate limiter: max 8 requests per minute per user
const _aiRateLimiter = new Map<string, { count: number; resetAt: number }>();
const AI_RATE_LIMIT_MAX = 8;
const AI_RATE_LIMIT_WINDOW_MS = 60 * 1000;
function checkAiRateLimit(userId: string): boolean {
  const now = Date.now();
  const rec = _aiRateLimiter.get(userId);
  if (!rec || now > rec.resetAt) {
    _aiRateLimiter.set(userId, { count: 1, resetAt: now + AI_RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (rec.count >= AI_RATE_LIMIT_MAX) return false;
  rec.count++;
  return true;
}
// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Array.from(_aiRateLimiter).forEach(([uid, rec]) => {
    if (now > rec.resetAt) _aiRateLimiter.delete(uid);
  });
}, 5 * 60 * 1000);

function encryptToken(text: string): string {
  if (!ENCRYPTION_KEY) throw new Error("SESSION_SECRET is not set; token encryption unavailable.");
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decryptToken(text: string): string {
  if (!ENCRYPTION_KEY) throw new Error("SESSION_SECRET is not set; token decryption unavailable.");
  const [ivHex, encrypted] = text.split(":");
  if (!ivHex || !encrypted) throw new Error("Invalid encrypted token format");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

const BUILD_VERSION = Date.now().toString(36);

// ─── Admin Impersonation Helpers ─────────────────────────────────────────────
/** Returns the target user ID: impersonated user when admin is acting, else own ID */
function getEffectiveUserId(req: any): string {
  return req.session?.impersonatingUserId || req.user?.id;
}
/** True when an admin has activated impersonation for another user */
function isAdminActingForUser(req: any): boolean {
  return !!(req.session?.impersonatingUserId && req.session.impersonatingUserId !== req.user?.id);
}

async function isAdmin(req: any, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (user?.isAdmin) return next();
    if (user?.email === "tahabeam@gmail.com") {
      await db.update(users).set({ isAdmin: true }).where(eq(users.id, userId));
      return next();
    }
    return res.status(403).json({ message: "Admin access required" });
  } catch {
    res.status(500).json({ message: "Authorization error" });
  }
}

// Use memory storage so uploaded images survive server restarts as base64 data URLs
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".svg", ".webp", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

// Per-plan free edit limits per project (after which credits are consumed)
const PLAN_EDIT_LIMITS: Record<string, number> = {
  free: 10,
  pro: 5,
  business: 10,
};

// Free plan: max projects a free user can create
const FREE_PLAN_MAX_PROJECTS = 1;

// ─── Chatbot Rate Limiter (IP-based, in-memory) ───────────────────────────────
const chatbotRateMap = new Map<string, { count: number; resetAt: number }>();
const CHATBOT_MAX_PER_HOUR = 40;
// Clean up expired entries every 30 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  Array.from(chatbotRateMap.entries()).forEach(([key, val]) => {
    if (val.resetAt < now) chatbotRateMap.delete(key);
  });
}, 30 * 60 * 1000);
function checkChatbotRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = chatbotRateMap.get(ip);
  if (!entry || entry.resetAt < now) {
    chatbotRateMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= CHATBOT_MAX_PER_HOUR) return false;
  entry.count++;
  return true;
}

// Helper: fetch user plan info in one place (with subscription expiry check)
async function getUserPlanInfo(userId: string): Promise<{ isFreePlan: boolean; isUserAdmin: boolean; planName: string; credits: number }> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const isUserAdmin = user?.isAdmin === true;
  const credits = user?.credits ?? 0;

  if (user?.plan && user.plan !== "free") {
    const now = new Date();
    const [activeSub] = await db.select().from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
      .orderBy(desc(subscriptions.endDate))
      .limit(1);
    if (!activeSub || (activeSub.endDate && new Date(activeSub.endDate) < now)) {
      await db.update(users).set({ plan: "free", updatedAt: new Date() }).where(eq(users.id, userId));
      return { isFreePlan: true, isUserAdmin, planName: "free", credits };
    }
  }

  const planName = user?.plan || "free";
  const isFreePlan = planName === "free";
  return { isFreePlan, isUserAdmin, planName, credits };
}

const OVERFLOW_FIX_CSS = `<style id="aw-overflow-fix">html,body{overflow-x:hidden!important;max-width:100%!important}*,*::before,*::after{box-sizing:border-box}img,video,embed,object,iframe{max-width:100%!important;height:auto}[class*="grid"]>*,.card>*,[class*="-card"]>*{min-width:0;overflow-wrap:break-word;word-break:break-word}#aw-nav{position:fixed!important;top:0!important;left:0!important;right:0!important;width:100%!important;z-index:9999!important;}@media(max-width:768px){#aw-menu-btn{display:block!important}.aw-nav-links{display:none!important}[class*="-grid"],[class*="grid-"],[class*="cards-"],[class*="-cards"],[class*="services"],[class*="gallery"],[class*="features"],[class*="speakers"]{grid-template-columns:1fr!important}[class*="two-col"],[class*="about-wrap"],[class*="contact-wrap"],[class*="footer-wrap"]{grid-template-columns:1fr!important;flex-direction:column!important}.service-card,.gallery-item,.testi-card,.feature-card{width:100%!important}}</style>`;

const MOBILE_NAV_SCRIPT = `<script id="aw-mobile-nav">(function(){if(window.innerWidth>768)return;var mSvg='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';var cSvg='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';function init(){if(document.getElementById('aw-menu-btn'))return;var nav=document.querySelector('nav');if(!nav){var hdrs=document.querySelectorAll('header');for(var h=0;h<hdrs.length;h++){if(hdrs[h].querySelector('nav,ul,[class*="nav"],[class*="menu"]')){nav=hdrs[h];break;}}}if(!nav)return;var eb=nav.querySelectorAll('[class*="toggle"],[class*="hamburger"],[class*="burger"],[class*="menu-btn"],[aria-controls*="menu"],[aria-controls*="nav"]');eb.forEach(function(b){b.style.display='none';});var lc=nav.querySelector('.nav-links,.aw-nav-links,.navbar-links,.menu-links,.nav-menu,.nav-list,.header-links,[class*="nav-links"],[class*="nav-menu"],[class*="navbar-nav"],[class*="menu-links"]');if(!lc){var kids=nav.querySelectorAll('div,ul');for(var k=0;k<kids.length;k++){if(kids[k].querySelectorAll('a').length>=2&&kids[k]!==nav){lc=kids[k];break;}}}if(!lc)return;var anchors=Array.from(lc.querySelectorAll('a'));if(!anchors.length)return;lc.style.cssText+='display:none!important;visibility:hidden!important;';var brand=nav.querySelector('[class*="brand"],[class*="logo"],.nav-brand,.logo');if(brand){brand.style.cssText+='white-space:nowrap!important;overflow:visible!important;flex-shrink:0!important;max-width:70%!important;';}var bg=window.getComputedStyle(nav).backgroundColor;var m=bg.match(/\\d+/g);var isDark=true;if(m&&m.length>=3){var lum=0.299*+m[0]+0.587*+m[1]+0.114*+m[2];isDark=lum<160;}var iconColor=isDark?'#ffffff':'#1e293b';var btnBg=isDark?'rgba(0,0,0,0.35)':'rgba(255,255,255,0.95)';var dir=document.documentElement.getAttribute('dir')||document.body.getAttribute('dir')||'rtl';var mm=document.createElement('div');mm.id='aw-mobile-menu';mm.setAttribute('dir',dir);mm.style.cssText='display:none;flex-direction:column;background:#fff;padding:0.5rem 0;position:fixed;left:0;right:0;top:60px;z-index:2147483646;box-shadow:0 8px 32px rgba(0,0,0,0.25);border-top:3px solid #10b981;max-height:80vh;overflow-y:auto;';anchors.forEach(function(a){var text=(a.textContent||'').trim();if(!text)return;var li=document.createElement('a');li.href=a.getAttribute('href')||'#';li.textContent=text;li.style.cssText='padding:0.9rem 1.5rem;font-size:1rem;font-weight:600;display:block;border-bottom:1px solid #f1f5f9;text-decoration:none;color:#1e293b;font-family:inherit;';li.addEventListener('click',function(){mm.style.display='none';btn.innerHTML=mSvg;btn.style.color=iconColor;});mm.appendChild(li);});if(!mm.children.length)return;var btn=document.createElement('button');btn.id='aw-menu-btn';btn.setAttribute('aria-label','القائمة');btn.innerHTML=mSvg;btn.style.cssText='border:none;border-radius:8px;cursor:pointer;padding:7px;display:block!important;flex-shrink:0;line-height:1;background:'+btnBg+';color:'+iconColor+';';btn.addEventListener('click',function(e){e.stopPropagation();var isOpen=mm.style.display==='flex';if(!isOpen){var r=btn.getBoundingClientRect();mm.style.top=r.bottom+'px';mm.style.display='flex';btn.innerHTML=cSvg;}else{mm.style.display='none';btn.innerHTML=mSvg;}btn.style.color=iconColor;});document.addEventListener('click',function(e){if(mm.style.display==='flex'&&!mm.contains(e.target)&&e.target!==btn){mm.style.display='none';btn.innerHTML=mSvg;}});window.addEventListener('scroll',function(){if(mm.style.display==='flex'){var r=btn.getBoundingClientRect();mm.style.top=r.bottom+'px';}},{passive:true});var navPos=window.getComputedStyle(nav).position;var isNavFixed=(navPos==='fixed'||navPos==='sticky');if(isNavFixed){var ni=nav.querySelector('.nav-inner,.nav-container,.navbar-inner,.nav-wrap,.container,[class*="nav-inner"],[class*="nav-container"],[class*="nav-wrap"]')||nav;ni.appendChild(btn);}else{btn.style.position='fixed';btn.style.top='10px';btn.style.zIndex='2147483647';btn.style.boxShadow='0 2px 12px rgba(0,0,0,0.18)';if(dir==='rtl'){btn.style.left='12px';}else{btn.style.right='12px';}document.body.appendChild(btn);}document.body.appendChild(mm);}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{setTimeout(init,0);}})();</script>`;

const FA_CDN = `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W==" crossorigin="anonymous" referrerpolicy="no-referrer"/>`;

function injectAwScripts(html: string): string {
  let result = html;
  result = result.replace(/<style id="aw-overflow-fix">[\s\S]*?<\/style>/gi, "");
  result = result.replace(/<script id="aw-mobile-nav">[\s\S]*?<\/script>/gi, "");
  const inject = `${OVERFLOW_FIX_CSS}\n${MOBILE_NAV_SCRIPT}`;
  if (result.includes("</head>")) {
    // Add Font Awesome if not already present
    if (!result.includes("font-awesome")) {
      result = result.replace("<head>", `<head>\n${FA_CDN}`);
    }
    return result.replace("</head>", `${inject}\n</head>`);
  }
  return inject + result;
}

function injectFreePlanWatermark(html: string): string {
  let result = injectAwScripts(html);
  if (result.includes('id="aw-free-badge"')) return result;
  const badge = `<div id="aw-free-badge" style="position:fixed;bottom:0;left:0;right:0;background:linear-gradient(90deg,#0f172a 0%,#1e293b 100%);color:#fff;text-align:center;padding:9px 16px;font-family:'Inter','Cairo',sans-serif;font-size:13px;z-index:2147483647;direction:ltr;display:flex;align-items:center;justify-content:center;gap:10px;border-top:2px solid #10b981;box-shadow:0 -2px 12px rgba(16,185,129,0.3);">Built with <strong style="color:#10b981;margin:0 4px;">ArabyWeb</strong><a href="https://arabyWeb.net/pricing" target="_blank" style="background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;padding:4px 14px;border-radius:20px;text-decoration:none;font-size:12px;font-weight:bold;margin-left:6px;">Upgrade to remove</a></div>`;
  if (result.includes("</body>")) return result.replace("</body>", `${badge}\n</body>`);
  return result + badge;
}

function removeFreePlanWatermark(html: string): string {
  let result = html.replace(/<div id="aw-free-badge"[\s\S]*?<\/div>/gi, "");
  return injectAwScripts(result);
}

const GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Tajawal:wght@300;400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Noto+Sans+Arabic:wght@300;400;500;600;700;800&family=Amiri:wght@400;700&family=Readex+Pro:wght@300;400;500;600;700&family=El+Messiri:wght@400;500;600;700&family=Almarai:wght@300;400;700;800&family=Reem+Kufi:wght@400;500;600;700&family=Lateef:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&family=Montserrat:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800&family=Raleway:wght@300;400;500;600;700;800&family=Roboto:wght@300;400;500;700&family=Nunito:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=Josefin+Sans:wght@300;400;500;600;700&display=swap";

function buildPreviewHtml(project: { generatedHtml: string | null; generatedCss: string | null; seoTitle: string | null; seoDescription: string | null; name: string }): string {
  const rawStored = project.generatedHtml || "";

  // Strip any previously injected scripts so we can inspect the actual content
  let rawHtml = rawStored
    .replace(/<style id="aw-overflow-fix">[\s\S]*?<\/style>/gi, "")
    .replace(/<script id="aw-mobile-nav">[\s\S]*?<\/script>/gi, "")
    .trim();

  // Detect language from HTML attributes
  const isArabic = /dir=["']rtl["']|lang=["']ar/.test(rawHtml) || /[\u0600-\u06FF]/.test(rawHtml.slice(0, 500));
  const lang = isArabic ? "ar" : "en";
  const dir = isArabic ? "rtl" : "ltr";
  const fontFamily = isArabic ? "'Cairo', 'Tajawal', 'IBM Plex Sans Arabic'" : "'Inter', 'Poppins', 'Montserrat'";

  // If stored HTML is already a full document, re-inject scripts and return
  if (rawHtml.startsWith("<!DOCTYPE") || rawHtml.startsWith("<html")) {
    return injectAwScripts(rawHtml);
  }

  // Build complete HTML document from fragment
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${project.seoTitle || project.name}</title>
<meta name="description" content="${(project.seoDescription || "").replace(/"/g, "&quot;")}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${GOOGLE_FONTS_URL}" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W==" crossorigin="anonymous" referrerpolicy="no-referrer"/>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; scroll-behavior: smooth; }
body { font-family: ${fontFamily}, sans-serif; }
img { max-width: 100%; height: auto; display: block; }
a { color: inherit; text-decoration: none; }
${project.generatedCss || ""}
</style>
${OVERFLOW_FIX_CSS}
${MOBILE_NAV_SCRIPT}
</head>
<body>
${rawHtml}
</body>
</html>`;
}

// ── User Feedback: DB migration ────────────────────────────────────────────────

async function ensureUserFeedbackTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_feedback (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR,
        user_name TEXT,
        user_email TEXT,
        type TEXT NOT NULL DEFAULT 'bug',
        message TEXT NOT NULL,
        page TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        admin_note TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log("Migration: user_feedback table ensured");
  } catch (e: any) {
    console.error("[Feedback] Table init failed:", e?.message);
  }
}

// ── Support Tickets: DB migration ─────────────────────────────────────────────

async function ensureSupportTicketsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        user_name TEXT NOT NULL,
        user_email TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'general',
        priority TEXT NOT NULL DEFAULT 'medium',
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log("Migration: support_tickets table ensured");
  } catch (e: any) {
    console.error("[Support] Table init failed:", e?.message);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ── Self-improving learning system: ensure DB tables on startup ─────────────
  ensureLearningTables().catch(e => console.error("[Learning] Startup table init failed:", e?.message));
  ensureSupportTicketsTable().catch(e => console.error("[Support] Startup init failed:", e?.message));
  ensureUserFeedbackTable().catch(e => console.error("[Feedback] Startup init failed:", e?.message));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", version: BUILD_VERSION, timestamp: new Date().toISOString() });
  });

  // ── SEO: robots.txt ────────────────────────────────────────────────────────
  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(`User-agent: *
Allow: /
Allow: /templates
Allow: /pricing
Allow: /contact
Allow: /about
Allow: /privacy
Allow: /terms
Allow: /faq
Allow: /free-website
Allow: /free-store
Allow: /blog
Allow: /blog/
Allow: /ai-website-builder
Allow: /digital-marketing-ai
Allow: /website-saudi-arabia
Allow: /domain-registration-saudi
Allow: /web-hosting-saudi
Allow: /domains-hosting-saudi
Disallow: /dashboard
Disallow: /admin
Disallow: /auth
Disallow: /billing
Disallow: /api/
Disallow: /payment-test
Disallow: /payment-methods
Disallow: /reset-password
Disallow: /settings
Disallow: /deploy-guide
Disallow: /github-deploy

Sitemap: https://arabyweb.net/sitemap.xml

# AI Agents
User-agent: GPTBot
Allow: /
Allow: /templates
Allow: /faq
Allow: /free-website
Allow: /free-store

User-agent: ClaudeBot
Allow: /
Allow: /templates

User-agent: anthropic-ai
Allow: /

User-agent: CCBot
Allow: /

# Block bad bots
User-agent: AhrefsBot
Crawl-delay: 10

User-agent: MJ12bot
Disallow: /
`);
  });

  // ── SEO: sitemap.xml ────────────────────────────────────────────────────────
  app.get("/sitemap.xml", (_req, res) => {
    const base = "https://arabyweb.net";
    const now = new Date().toISOString().split("T")[0];

    const pages = [
      // Homepage
      { loc: "/", lastmod: now, changefreq: "daily", priority: "1.0" },
      // Core pages
      { loc: "/auth", lastmod: now, changefreq: "monthly", priority: "0.8" },
      { loc: "/pricing", lastmod: now, changefreq: "monthly", priority: "0.9" },
      { loc: "/faq", lastmod: now, changefreq: "monthly", priority: "0.75" },
      { loc: "/terms", lastmod: now, changefreq: "yearly", priority: "0.3" },
      { loc: "/privacy", lastmod: now, changefreq: "yearly", priority: "0.3" },
      // Free landing pages
      { loc: "/free-website", lastmod: now, changefreq: "weekly", priority: "0.95" },
      { loc: "/free-store", lastmod: now, changefreq: "weekly", priority: "0.95" },
      { loc: "/templates", lastmod: now, changefreq: "weekly", priority: "0.85" },
      // SEO landing pages — highest priority
      { loc: "/ai-website-builder", lastmod: now, changefreq: "weekly", priority: "0.98" },
      { loc: "/digital-marketing-ai", lastmod: now, changefreq: "weekly", priority: "0.97" },
      { loc: "/website-saudi-arabia", lastmod: now, changefreq: "weekly", priority: "0.97" },
      // Domain & Hosting SEO pages
      { loc: "/domain-registration-saudi", lastmod: now, changefreq: "weekly", priority: "0.97" },
      { loc: "/web-hosting-saudi", lastmod: now, changefreq: "weekly", priority: "0.97" },
      { loc: "/domains-hosting-saudi", lastmod: now, changefreq: "weekly", priority: "0.96" },
      // Blog
      { loc: "/blog", lastmod: now, changefreq: "weekly", priority: "0.90" },
      { loc: "/blog/how-to-create-website-with-ai-free", lastmod: "2026-03-10", changefreq: "monthly", priority: "0.85" },
      { loc: "/blog/free-digital-marketing-small-business", lastmod: "2026-03-08", changefreq: "monthly", priority: "0.85" },
      { loc: "/blog/ai-website-builder-vs-wordpress", lastmod: "2026-03-05", changefreq: "monthly", priority: "0.82" },
      { loc: "/blog/seo-guide-arabic-websites-2026", lastmod: "2026-03-01", changefreq: "monthly", priority: "0.85" },
      { loc: "/blog/free-online-store-saudi-arabia", lastmod: "2026-02-25", changefreq: "monthly", priority: "0.82" },
      { loc: "/blog/ai-content-marketing-instagram-tiktok", lastmod: "2026-02-20", changefreq: "monthly", priority: "0.80" },
      { loc: "/blog/website-design-restaurants-shops-saudi", lastmod: "2026-02-15", changefreq: "monthly", priority: "0.80" },
      { loc: "/blog/whatsapp-marketing-business-saudi", lastmod: "2026-02-10", changefreq: "monthly", priority: "0.78" },
      { loc: "/blog/website-hosting-options-saudi-businesses", lastmod: "2026-02-05", changefreq: "monthly", priority: "0.78" },
      // New blog posts — Saudi market high-priority keywords
      { loc: "/blog/website-design-prices-saudi-arabia-2026", lastmod: "2026-03-18", changefreq: "monthly", priority: "0.88" },
      { loc: "/blog/medical-clinic-website-saudi-arabia", lastmod: "2026-03-15", changefreq: "monthly", priority: "0.86" },
      { loc: "/blog/beauty-salon-website-saudi-arabia", lastmod: "2026-03-12", changefreq: "monthly", priority: "0.84" },
      { loc: "/blog/start-online-business-saudi-arabia-2026", lastmod: "2026-03-10", changefreq: "monthly", priority: "0.87" },
      { loc: "/blog/lawyers-consultants-website-saudi-arabia", lastmod: "2026-03-08", changefreq: "monthly", priority: "0.83" },
      { loc: "/blog/vision-2030-digital-transformation-business", lastmod: "2026-03-05", changefreq: "monthly", priority: "0.85" },
      { loc: "/blog/real-estate-website-saudi-arabia", lastmod: "2026-03-02", changefreq: "monthly", priority: "0.85" },
    ];

    const urlTags = pages.map(p => `  <url>
    <loc>${base}${p.loc}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlTags}\n</urlset>`;

    res.set({
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Robots-Tag": "noindex",
    }).send(xml);
  });

  // ── AI Agents: llms.txt ────────────────────────────────────────────────────
  app.get("/llms.txt", (_req, res) => {
    res.type("text/plain; charset=utf-8").send(`# ArabyWeb.net — AI-Powered Arabic Website Builder

## About
ArabyWeb.net is the first AI-powered website and online store builder for the Arab world and Saudi Arabia.
We help businesses, restaurants, clinics, and individuals create professional websites for free in under 2 minutes — no coding required.

## Key Features
- Free website creation using AI
- Free online store builder
- RTL Arabic + LTR English support (bilingual websites)
- 50+ professional templates
- One-click publishing
- AI marketing content generation
- Saudi Arabia & GCC market focused
- Compliant with Saudi PDPL and SAMA regulations

## Services
- Free Plan: Build unlimited AI websites, 5 AI sessions/month
- Pro Plan (49 SAR/month): 50 AI sessions, priority publishing
- Business Plan (99 SAR/month): 200 AI sessions, advanced analytics

## Target Keywords (Arabic)
موقع مجاني، بناء موقع الكتروني مجاني، انشاء موقع مجاني، متجر مجاني، متاجر مجانية، موقع بالذكاء الاصطناعي، بناء موقع بدون برمجة، موقع احترافي مجاني، استضافة مجانية، منصة بناء مواقع السعودية

## Target Keywords (English)
free website Saudi Arabia, Arabic website builder, AI website builder Arabic, free online store builder Saudi, RTL website builder, no-code website builder Arabic

## Contact
- Website: https://arabyweb.net
- Email: support@arabyweb.net
- Region: Saudi Arabia (Primary), Arab World

## Content Policy
- This service does NOT generate adult content, gambling, or illegal materials
- All generated websites must comply with Saudi regulations
- User data is protected per PDPL/SAMA standards

## API
- Public templates: GET https://arabyweb.net/api/templates
- Pricing info: GET https://arabyweb.net/api/payments/config

## Structured Data
Full JSON-LD schema available at: https://arabyweb.net/
Sitemap: https://arabyweb.net/sitemap.xml
`);
  });

  // ── SEO: OpenGraph image (SVG served as branded image) ─────────────────────
  app.get("/og-image.png", (_req, res) => {
    const pngPath = path.join(process.cwd(), "client", "public", "og-image.png");
    if (fs.existsSync(pngPath)) {
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.sendFile(pngPath);
    } else {
      const distPath = path.join(process.cwd(), "dist", "public", "og-image.png");
      if (fs.existsSync(distPath)) {
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.sendFile(distPath);
      } else {
        res.redirect("/og-image.svg");
      }
    }
  });

  // ── Load dynamic plan prices from DB on startup so they survive server restarts ──
  try {
    const proPrice = await storage.getSetting("price_pro");
    const businessPrice = await storage.getSetting("price_business");
    if (proPrice) PLAN_PRICES.pro = parseInt(proPrice);
    if (businessPrice) PLAN_PRICES.business = parseInt(businessPrice);
    console.log("[Paymob] Plan prices loaded from DB:", PLAN_PRICES);
  } catch (e) {
    console.warn("[Paymob] Could not load plan prices from DB on startup:", e);
  }

  await setupAuth(app);
  registerAuthRoutes(app);

  app.post("/api/upload", isAuthenticated, upload.array("files", 10), (req: any, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    // Convert to base64 data URLs so images persist across server restarts
    const urls = (req.files as Express.Multer.File[]).map(f => {
      const base64 = f.buffer.toString("base64");
      return `data:${f.mimetype};base64,${base64}`;
    });
    res.json({ urls });
  });

  app.get("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getEffectiveUserId(req);
      const userProjects = await storage.getProjectsByUser(userId);
      res.json(userProjects);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).json({ message: "Project not found" });
      const userId = getEffectiveUserId(req);
      if (project.userId !== userId && !isAdminActingForUser(req)) return res.status(403).json({ message: "Forbidden" });
      res.json(project);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Preview HTML endpoint — serves complete HTML document directly (avoids srcDoc issues on mobile)
  app.get("/api/projects/:id/preview-html", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).send("Not found");
      const userId = getEffectiveUserId(req);
      if (project.userId !== userId && !isAdminActingForUser(req)) return res.status(403).send("Forbidden");
      if (!project.generatedHtml) return res.status(404).send("No preview available");
      const html = buildPreviewHtml(project);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      // If a version param is provided the URL is unique per update — cache it for 30 minutes
      if (req.query.v) {
        res.setHeader("Cache-Control", "private, max-age=1800, immutable");
      } else {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      }
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.send(html);
    } catch (err) {
      res.status(500).send("Failed to build preview");
    }
  });

  const createProjectSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(8000).optional(),
    templateId: z.number().optional(),
  });

  const editCommandSchema = z.object({
    command: z.string().min(1).max(5000),
    language: z.string().optional(),
    imageDataUrl: z.string().optional(), // base64 image for logo/image uploads
  });

  app.post("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getEffectiveUserId(req);
      const parsed = createProjectSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

      const { isFreePlan, isUserAdmin } = await getUserPlanInfo(userId);
      if (isFreePlan && !isUserAdmin) {
        const userProjects = await storage.getProjectsByUser(userId);
        if (userProjects.length >= FREE_PLAN_MAX_PROJECTS) {
          return res.status(402).json({
            message: "upgrade_required",
            messageAr: `الخطة المجانية تتيح موقعاً واحداً فقط. اشترك الآن لإنشاء مواقع غير محدودة.`,
            messageEn: `Free plan allows 1 website only. Upgrade now for unlimited websites.`,
          });
        }
      }

      const { name, description, templateId } = parsed.data;
      const project = await storage.createProject({
        userId,
        name,
        description,
        status: "draft",
        templateId: templateId || 0,
        generatedHtml: null,
        generatedCss: null,
        seoTitle: null,
        seoDescription: null,
        colorPalette: null,
        sections: null,
      });
      res.status(201).json(project);
    } catch (err: any) {
      console.error("Create project error:", err?.message || err);
      res.status(500).json({ message: "Failed to create project", detail: err?.message || "Unknown error" });
    }
  });

  app.post("/api/projects/:id/generate", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).json({ message: "Project not found" });
      const userId = getEffectiveUserId(req);
      if (project.userId !== userId && !isAdminActingForUser(req)) return res.status(403).json({ message: "Forbidden" });
      // If stuck in "generating" for > 5 minutes, auto-reset and allow re-generation
      if (project.status === "generating") {
        const stuckMs = Date.now() - new Date(project.updatedAt ?? project.createdAt).getTime();
        if (stuckMs < 5 * 60 * 1000) {
          return res.status(409).json({ message: "Already generating", messageAr: "موقعك قيد التوليد حالياً، يرجى الانتظار لحظة ثم المحاولة مجدداً.", messageEn: "Your website is being generated right now. Please wait a moment and try again." });
        }
        // Stuck > 5 min — reset status
        await storage.updateProject(project.id, { status: "error" });
      }
      if (!checkAiRateLimit(userId)) {
        return res.status(429).json({ message: "rate_limit_exceeded", messageAr: "تجاوزت الحد المسموح به من الطلبات. انتظر دقيقة ثم أعد المحاولة.", messageEn: "Too many requests. Please wait a moment and try again." });
      }

      const language = req.body.language || "ar";
      const description = req.body.description || project.description || project.name;

      await storage.updateProject(project.id, { status: "generating" });

      await storage.addChatMessage({ projectId: project.id, role: "user", content: description });

      // ─── Credit check for ALL users before generation ────────────────────────
      const { isFreePlan, isUserAdmin, credits: userCreditsGen } = await getUserPlanInfo(userId);
      if (!isUserAdmin && userCreditsGen <= 0) {
        await storage.updateProject(project.id, { status: "error" });
        return res.status(402).json({
          message: "insufficient_credits",
          messageAr: "نفد رصيد الذكاء لديك. يرجى شراء جلسات إضافية أو ترقية خطتك.",
          messageEn: "Your AI credits are depleted. Please top up AI credits or upgrade your plan.",
        });
      }

      const generated = await generateWebsite(description, language, {
        projectId: project.id,
        userId: String(userId),
      });
      const finalHtml = (isFreePlan && !isUserAdmin)
        ? injectFreePlanWatermark(generated.html)
        : removeFreePlanWatermark(generated.html);

      const freePlanNote = isFreePlan && !isUserAdmin
        ? (language === "ar"
          ? "\n\n💡 **ملاحظة:** موقعك على الخطة المجانية يحتوي على شعار عربي ويب. [اشترك الآن](/pricing) لإزالته."
          : "\n\n💡 **Note:** Your free plan site includes the ArabyWeb badge. [Upgrade now](/pricing) to remove it.")
        : "";

      await storage.addChatMessage({
        projectId: project.id,
        role: "assistant",
        content: (language === "ar" ? "تم إنشاء الموقع بنجاح ✨" : "Website generated successfully ✨") + freePlanNote,
      });

      const updated = await storage.updateProject(project.id, {
        generatedHtml: finalHtml,
        generatedCss: generated.css,
        seoTitle: generated.seoTitle,
        seoDescription: generated.seoDescription,
        colorPalette: generated.colorPalette,
        sections: generated.sections,
        status: "generated",
        editCount: 0,
        designStyle: detectDesignStyle(description, ""),
        htmlHistory: [] as any,
      });

      if (!isUserAdmin && !isAdminActingForUser(req)) {
        await db.update(users).set({ credits: sql`GREATEST(credits - 10, 0)`, updatedAt: new Date() }).where(eq(users.id, userId));
        // Fire-and-forget: notify user if credits hit 0
        db.select({ credits: users.credits, email: users.email }).from(users).where(eq(users.id, userId)).then(([u]) => {
          if (u?.credits === 0 && u?.email) sendLowCreditsEmail(u.email, 0, true).catch(() => {});
        }).catch(() => {});
      }

      res.json(updated);

      // ─── Learning System: Log insight so signal-export can find it ────────────
      setImmediate(async () => {
        try {
          const { industryId: detectedIndustry } = runIndustryEngine(description, language === "ar", "");
          await logGenerationInsight({
            userId: String(userId),
            projectId: project.id,
            industry: detectedIndustry || "general",
            language,
            prompt: description.slice(0, 500),
            spec: { tagline: generated.seoTitle, seoTitle: generated.seoTitle, seoDescription: generated.seoDescription } as any,
            primaryColor: generated.colorPalette?.primary,
            accentColor: generated.colorPalette?.accent,
            generationMs: 0,
          });
        } catch (e: any) {
          console.warn("[Learning] /generate insight log warning:", e?.message);
        }
      });
    } catch (err: any) {
      console.error("Generation error:", err?.message || err);
      const project = await storage.getProject(parseInt(req.params.id));
      if (project) await storage.updateProject(project.id, { status: "error" });
      const errorMsg = err?.message || "Unknown error";
      res.status(500).json({ message: "Failed to generate website", detail: errorMsg });
    }
  });

  app.post("/api/projects/:id/generate-instant", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).json({ message: "Project not found" });
      const instantUserId = getEffectiveUserId(req);
      if (project.userId !== instantUserId && !isAdminActingForUser(req)) return res.status(403).json({ message: "Forbidden" });
      // If stuck in "generating" for > 5 minutes, auto-reset and allow re-generation
      if (project.status === "generating") {
        const stuckMs = Date.now() - new Date(project.updatedAt ?? project.createdAt).getTime();
        if (stuckMs < 5 * 60 * 1000) {
          return res.status(409).json({ message: "Already generating", messageAr: "موقعك قيد التوليد حالياً، يرجى الانتظار لحظة ثم المحاولة مجدداً.", messageEn: "Your website is being generated right now. Please wait a moment and try again." });
        }
        // Stuck > 5 min — reset status and proceed
        await storage.updateProject(project.id, { status: "error" });
      }
      if (!checkAiRateLimit(req.user.id)) {
        return res.status(429).json({ message: "rate_limit_exceeded", messageAr: "تجاوزت الحد المسموح به من الطلبات. انتظر دقيقة ثم أعد المحاولة.", messageEn: "Too many requests. Please wait a moment and try again." });
      }

      const language = req.body.language || "ar";
      const websiteLanguage: string = req.body.websiteLanguage || "ar";
      const websiteLanguages: string[] = Array.isArray(req.body.websiteLanguages) && req.body.websiteLanguages.length > 0
        ? req.body.websiteLanguages
        : [websiteLanguage];
      const description = req.body.description || project.description || project.name;
      const logoDataUrl: string | undefined = req.body.logoDataUrl;
      const whatsappNumber: string | undefined = req.body.whatsapp ? String(req.body.whatsapp).replace(/\s/g, "") : undefined;
      const activityType: string = req.body.activityType || "other";
      const designStyle: string = req.body.designStyle || "dark-modern";
      const primaryColor: string | undefined = req.body.primaryColor && /^#[0-9a-f]{3,8}$/i.test(req.body.primaryColor) ? req.body.primaryColor : undefined;
      const accentColor: string | undefined = req.body.accentColor && /^#[0-9a-f]{3,8}$/i.test(req.body.accentColor) ? req.body.accentColor : undefined;

      // ─── Credit check for ALL users before generation ────────────────────────
      const { isFreePlan: isFreePlan2, isUserAdmin: isUserAdmin2, credits: userCreditsInst } = await getUserPlanInfo(req.user.id);
      if (!isUserAdmin2 && userCreditsInst <= 0) {
        return res.status(402).json({
          message: "insufficient_credits",
          messageAr: "نفد رصيد الذكاء لديك. يرجى شراء جلسات إضافية أو ترقية خطتك.",
          messageEn: "Your AI credits are depleted. Please top up AI credits or upgrade your plan.",
        });
      }

      await storage.updateProject(project.id, { status: "generating" });
      await storage.addChatMessage({ projectId: project.id, role: "user", content: description });

      // ─── AI Industry Engine: detect industry (for logging/learning only) ────
      const isArabicUI = language === "ar";
      const mappedIndustryId = mapActivityToIndustry(activityType);
      const { industryId } = runIndustryEngine(
        description,
        isArabicUI,
        mappedIndustryId
      );

      const genStartTime = Date.now();
      // Pass the raw user description to generateWebsite — it has its own
      // expert system prompt. Adding structured metadata here caused the AI
      // to render it as literal website text. We only append WhatsApp naturally.
      const cleanPrompt = whatsappNumber
        ? `${description}\n\nأضف زر واتساب عائم (bottom-right) يفتح الواتساب: ${whatsappNumber}`
        : description;
      const genColorOptions: GenerateWebsiteOptions = {
        ...(primaryColor ? { primaryColor } : {}),
        ...(accentColor ? { accentColor } : {}),
        ...(designStyle !== "dark-modern" ? { designStyle } : {}),
        projectId: project.id,
        userId: String(req.user?.id),
      };
      const generated = await generateWebsite(cleanPrompt, websiteLanguage, genColorOptions);
      const genMs = Date.now() - genStartTime;
      let baseHtml = generated.html;

      // Inject user logo into the site if provided
      if (logoDataUrl && logoDataUrl.startsWith("data:image/")) {
        const logoStyle = "height:44px;width:auto;object-fit:contain;display:block;mix-blend-mode:multiply;";
        const logoStyleFooter = "height:32px;width:auto;object-fit:contain;display:block;mix-blend-mode:multiply;";
        const logoImg = `<img id="aw-ai-logo" src="${logoDataUrl}" alt="logo" style="${logoStyle}">`;
        const logoImgFooter = `<img id="aw-ai-logo-footer" src="${logoDataUrl}" alt="logo" style="${logoStyleFooter}">`;
        if (baseHtml.includes('id="aw-ai-logo"') || baseHtml.includes("id='aw-ai-logo'")) {
          baseHtml = baseHtml.replace(/<svg[^>]*id=["']aw-ai-logo["'][^>]*>[\s\S]*?<\/svg>/gi, logoImg);
          baseHtml = baseHtml.replace(/<img[^>]*id=["']aw-ai-logo["'][^>]*\/?>/gi, logoImg);
          baseHtml = baseHtml.replace(/<svg[^>]*id=["']aw-ai-logo-footer["'][^>]*>[\s\S]*?<\/svg>/gi, logoImgFooter);
          baseHtml = baseHtml.replace(/<img[^>]*id=["']aw-ai-logo-footer["'][^>]*\/?>/gi, logoImgFooter);
        } else if (baseHtml.includes('class="aw-brand-group"') || baseHtml.includes("class='aw-brand-group'")) {
          // Replace auto-icon with logo, add aw-logo-mode to hide brand text
          baseHtml = baseHtml.replace(
            /<div[^>]*class=["']aw-auto-icon["'][^>]*>[\s\S]*?<\/div>/i,
            `<img src="${logoDataUrl}" alt="logo" style="height:44px;width:auto;object-fit:contain;flex-shrink:0;border-radius:8px;">`
          );
          baseHtml = baseHtml.replace(
            /(<div[^>]*class=["'])aw-brand-group(["'][^>]*>)/gi,
            `$1aw-brand-group aw-logo-mode$2`
          );
        } else if (baseHtml.includes("__AW_IMG_001__")) {
          baseHtml = baseHtml.replace(/__AW_IMG_001__/g, logoDataUrl);
        } else {
          const heroImgTag = `<img src="${logoDataUrl}" alt="logo" style="height:64px;width:auto;object-fit:contain;margin:0 auto 16px;display:block;mix-blend-mode:multiply;">`;
          baseHtml = baseHtml.replace(/(<section[^>]*class=["'][^"']*aw-hero[^"']*["'][^>]*>)/i, `$1${heroImgTag}`);
        }
      }

      // ─── Inject / override WhatsApp number if user provided one ──────────────
      if (whatsappNumber) {
        const waNumDigits = whatsappNumber.replace(/\D/g, "");
        if (waNumDigits) {
          const hadExistingWa = baseHtml.includes("wa.me/");
          // Replace any existing wa.me links with the user-supplied number
          baseHtml = baseHtml.replace(/https:\/\/wa\.me\/\d*/g, `https://wa.me/${waNumDigits}`);

          // If no floating WhatsApp button existed before, inject one before </body>
          if (!hadExistingWa) {
            const floatingBtn = `<a href="https://wa.me/${waNumDigits}" target="_blank" rel="noreferrer noopener" style="position:fixed;bottom:1.75rem;left:1.75rem;z-index:999;background:#25D366;color:#fff;width:58px;height:58px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 25px rgba(37,211,102,0.5);transition:transform 0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" aria-label="WhatsApp"><svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='white'><path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z'/></svg></a>`;
            baseHtml = baseHtml.replace(/<\/body>/i, `${floatingBtn}</body>`);
          }
        }
      }

      const finalHtml2 = (isFreePlan2 && !isUserAdmin2)
        ? injectFreePlanWatermark(baseHtml)
        : removeFreePlanWatermark(baseHtml);

      const freePlanNote2 = isFreePlan2 && !isUserAdmin2
        ? (language === "ar"
          ? "\n\n💡 **ملاحظة:** موقعك على الخطة المجانية يحتوي على شعار عربي ويب. [اشترك الآن](/pricing) لإزالته."
          : "\n\n💡 **Note:** Free plan site includes the ArabyWeb badge. [Upgrade](/pricing) to remove it.")
        : "";

      await storage.addChatMessage({
        projectId: project.id,
        role: "assistant",
        content: (language === "ar" ? "تم إنشاء الموقع فورياً ✨" : "Website generated instantly ✨") + freePlanNote2,
      });

      // Auto-detect design style from description + activity type, save to project
      const detectedDesignStyle = detectDesignStyle(description, activityType);

      const updated = await storage.updateProject(project.id, {
        generatedHtml: finalHtml2,
        generatedCss: generated.css,
        seoTitle: generated.seoTitle,
        seoDescription: generated.seoDescription,
        colorPalette: generated.colorPalette,
        sections: generated.sections,
        status: "generated",
        editCount: 0,
        designStyle: detectedDesignStyle,
        htmlHistory: [] as any,
        websiteLanguage,
        websiteLanguages,
      });

      if (!isUserAdmin2 && !isAdminActingForUser(req)) {
        const creditUserId2 = getEffectiveUserId(req);
        await db.update(users).set({ credits: sql`GREATEST(credits - 10, 0)`, updatedAt: new Date() }).where(eq(users.id, creditUserId2));
        // Fire-and-forget: notify user if credits hit 0
        db.select({ credits: users.credits, email: users.email }).from(users).where(eq(users.id, creditUserId2)).then(([u]) => {
          if (u?.credits === 0 && u?.email) sendLowCreditsEmail(u.email, 0, true).catch(() => {});
        }).catch(() => {});
      }

      // ─── Learning System: Auto-save to component library (async, non-blocking) ──
      setImmediate(async () => {
        try {
          await storage.saveGeneratedBlock({
            businessType: activityType,
            designStyle,
            websiteLanguage,
            prompt: description.slice(0, 500),
            htmlContent: finalHtml2,
            seoTitle: generated.seoTitle,
            colorPalette: generated.colorPalette,
          });
          await storage.logGeneration({
            userId: req.user.id,
            businessType: activityType || industryId,
            designStyle,
            websiteLanguage,
            prompt: description.slice(0, 500),
            success: true,
            generationMs: genMs,
            usedCachedBlock: false,
          });
          // ─── Log insight so signal-export can find it for learning quality signals ─
          await logGenerationInsight({
            userId: String(req.user.id),
            projectId: project.id,
            industry: industryId || activityType || "general",
            language: websiteLanguage,
            prompt: description.slice(0, 500),
            spec: { tagline: generated.seoTitle, seoTitle: generated.seoTitle, seoDescription: generated.seoDescription } as any,
            primaryColor: primaryColor || generated.colorPalette?.primary,
            accentColor: accentColor || generated.colorPalette?.accent,
            generationMs: genMs,
          });
        } catch (e: any) {
          console.warn("Learning system save warning:", e?.message);
        }
      });

      res.json(updated);
    } catch (err: any) {
      console.error("Instant generation error:", err?.message || err);
      try {
        await storage.logGeneration({
          userId: req.user?.id,
          businessType: req.body?.activityType || "other",
          designStyle: req.body?.designStyle,
          prompt: (req.body?.description || "").slice(0, 200),
          success: false,
        });
      } catch {}
      const project = await storage.getProject(parseInt(req.params.id));
      if (project) await storage.updateProject(project.id, { status: "error" });
      res.status(500).json({ message: "Failed to generate website instantly", detail: err?.message || "Unknown error" });
    }
  });

  app.post("/api/projects/:id/edit", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).json({ message: "Project not found" });
      const userId = getEffectiveUserId(req);
      if (project.userId !== userId && !isAdminActingForUser(req)) return res.status(403).json({ message: "Forbidden" });
      if (!checkAiRateLimit(userId)) {
        return res.status(429).json({ message: "rate_limit_exceeded", messageAr: "تجاوزت الحد المسموح به من الطلبات. انتظر دقيقة ثم أعد المحاولة.", messageEn: "Too many requests. Please wait a moment and try again." });
      }

      const parsed = editCommandSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Edit command is required" });
      const { command, language, imageDataUrl } = parsed.data;
      const lang = language || "ar";

      // ─── Design Style Change Detection ─────────────────────────────────────
      const styleChangeMap: Record<string, string> = {
        "luxury": "luxury", "فاخر": "luxury", "راقي": "luxury", "ذهبي": "luxury",
        "corporate": "corporate", "احترافي": "corporate", "شركة": "corporate", "مؤسسي": "corporate",
        "modern": "modern", "عصري": "modern", "حديث": "modern",
        "minimal": "minimal", "بسيط": "minimal", "نظيف": "minimal", "مينيمال": "minimal",
        "creative": "creative", "إبداعي": "creative", "ابداعي": "creative", "فني": "creative",
      };
      const styleChangeKw = ["change style", "change the style", "غير النمط", "بدّل النمط", "غير الأسلوب", "change design", "غير التصميم", "switch style", "style to", "النمط إلى", "النمط الى"];
      const isStyleChangeCmd = styleChangeKw.some(kw => command.toLowerCase().includes(kw));
      if (isStyleChangeCmd) {
        let newStyle: string | null = null;
        for (const [kw, style] of Object.entries(styleChangeMap)) {
          if (command.toLowerCase().includes(kw)) { newStyle = style; break; }
        }
        if (newStyle) {
          await storage.addChatMessage({ projectId: project.id, role: "user", content: command });
          await storage.updateProject(project.id, { designStyle: newStyle });
          const styleLabels: Record<string, Record<string, string>> = {
            luxury: { ar: "فاخر (ذهبي وداكن)", en: "Luxury (Gold & Dark)" },
            corporate: { ar: "احترافي (أزرق)", en: "Corporate (Blue)" },
            modern: { ar: "عصري (بنفسجي)", en: "Modern (Purple)" },
            minimal: { ar: "بسيط (أبيض وأسود)", en: "Minimal (B&W)" },
            creative: { ar: "إبداعي (وردي وذهبي)", en: "Creative (Pink & Gold)" },
          };
          const lbl = styleLabels[newStyle] || { ar: newStyle, en: newStyle };
          await storage.addChatMessage({
            projectId: project.id, role: "assistant",
            content: lang === "ar"
              ? `🎨 تم تغيير أسلوب التصميم إلى **${lbl.ar}**. أعد توليد الموقع لتطبيق الأسلوب الجديد.`
              : `🎨 Design style changed to **${lbl.en}**. Regenerate the site to apply the new style.`,
          });
          return res.json(project);
        }
      }

      // ─── Undo Command Detection ──────────────────────────────────────────────
      const undoKeywords = ["تراجع", "undo", "ارجع للسابق", "ارجع", "الخطوة السابقة", "استرجع", "رجّع", "رجع", "undone", "revert", "rollback"];
      const isUndoCommand = undoKeywords.some(kw => command.toLowerCase().includes(kw));

      if (isUndoCommand) {
        const history = (project.htmlHistory as Array<{ html: string; css: string; ts: number }>) || [];
        if (history.length === 0) {
          await storage.addChatMessage({ projectId: project.id, role: "user", content: command });
          await storage.addChatMessage({
            projectId: project.id,
            role: "assistant",
            content: lang === "ar"
              ? "⚠️ لا يوجد إصدار سابق للرجوع إليه. هذا هو أول نسخة من الموقع."
              : "⚠️ No previous version to undo. This is the first version of your site.",
          });
          return res.json(project);
        }
        const prev = history[history.length - 1];
        const newHistory = history.slice(0, -1);
        await storage.addChatMessage({ projectId: project.id, role: "user", content: command });
        await storage.addChatMessage({
          projectId: project.id,
          role: "assistant",
          content: lang === "ar"
            ? `↩️ تم التراجع عن آخر تعديل. (${history.length - 1} نسخ محفوظة)`
            : `↩️ Last edit undone. (${history.length - 1} saved version${history.length - 1 !== 1 ? "s" : ""} remaining)`,
        });
        const undone = await storage.updateProject(project.id, {
          generatedHtml: prev.html,
          generatedCss: prev.css,
          htmlHistory: newHistory as any,
          editCount: Math.max(0, (project.editCount ?? 1) - 1),
        });
        return res.json(undone);
      }

      // ─── Plan-based edit limits with credit deduction ───────────────────────
      const { isUserAdmin: isAdminEdit, planName: planNameEdit, credits: userCreditsEdit } = await getUserPlanInfo(userId);
      const isFreePlanEdit = planNameEdit === "free";
      const editLimit = PLAN_EDIT_LIMITS[planNameEdit] ?? PLAN_EDIT_LIMITS.free;
      const currentEditCount = project.editCount ?? 0;
      const isOverLimit = currentEditCount >= editLimit;

      if (!isAdminEdit && isOverLimit) {
        // Over the free edits for this plan — need credits
        if (userCreditsEdit <= 0) {
          const limitMsgs: Record<string, Record<string, string>> = {
            free: {
              ar: `وصلت للحد المجاني (${editLimit} تعديلات) لهذا الموقع. اشحن رصيد الذكاء أو اشترك للحصول على جلسات إضافية.`,
              en: `You've used your ${editLimit} free edits for this website. Top up AI credits or upgrade to continue editing.`,
            },
            pro: {
              ar: `وصلت للحد المجاني (${editLimit} تعديلات) في خطتك الاحترافية. كل تعديل إضافي يخصم جلسة ذكاء واحدة. اشحن رصيدك للمتابعة.`,
              en: `You've used your ${editLimit} free edits on the Pro plan. Each extra edit costs 1 AI session. Top up to continue.`,
            },
            business: {
              ar: `وصلت للحد المجاني (${editLimit} تعديلات) في خطة الأعمال. كل تعديل إضافي يخصم جلسة ذكاء واحدة. اشحن رصيدك للمتابعة.`,
              en: `You've used your ${editLimit} free edits on the Business plan. Each extra edit costs 1 AI session. Top up to continue.`,
            },
          };
          const msgs = limitMsgs[planNameEdit] || limitMsgs.free;
          return res.status(402).json({
            message: "limit_reached",
            messageAr: msgs.ar,
            messageEn: msgs.en,
            editCount: currentEditCount,
            editLimit,
            remaining: 0,
          });
        }
        // Has credits — deduct 10 credits for this extra edit
        await db.update(users).set({ credits: sql`GREATEST(credits - 10, 0)`, updatedAt: new Date() }).where(eq(users.id, userId));
      }

      await storage.addChatMessage({ projectId: project.id, role: "user", content: command });

      // Strip injected ArabyWeb scripts before sending to AI — the AI should only see the website content
      const cleanHtmlForAI = (project.generatedHtml || "")
        .replace(/<style id="aw-overflow-fix">[\s\S]*?<\/style>/gi, "")
        .replace(/<script id="aw-mobile-nav">[\s\S]*?<\/script>/gi, "")
        .replace(/<div id="aw-free-badge"[\s\S]*?<\/div>/gi, "")
        .trim();

      // ── Font change shortcut: apply directly in code, skip GPT entirely ─────
      const fontResult = tryDirectFontChange(command, cleanHtmlForAI);
      if (fontResult) {
        console.log("[Font] Direct font change applied:", fontResult.summary);
        const finalFontHtml = isFreePlanEdit && !isAdminEdit
          ? injectFreePlanWatermark(fontResult.html)
          : removeFreePlanWatermark(fontResult.html);
        await storage.updateProject(project.id, { generatedHtml: finalFontHtml, generatedCss: project.generatedCss || "" });
        const currentHistoryFont = (project.htmlHistory as any[]) || [];
        const fontHistoryEntry = { html: finalFontHtml, css: project.generatedCss || "", summary: fontResult.summary, ts: Date.now() };
        await storage.updateProject(project.id, { htmlHistory: [...currentHistoryFont.slice(-9), fontHistoryEntry] });
        await storage.addChatMessage({ projectId: project.id, role: "assistant", content: fontResult.summary });
        return res.json({ html: finalFontHtml, css: project.generatedCss || "", summary: fontResult.summary });
      }
      // ────────────────────────────────────────────────────────────────────────

      const result = await editWebsiteWithAI(
        cleanHtmlForAI,
        project.generatedCss || "",
        command,
        lang,
        imageDataUrl,
        project.name,
        project.description || ""
      );

      // Replace image placeholder with actual data URL (server-side, keeps AI prompt compact)
      let editedHtml = result.html;
      if (imageDataUrl && editedHtml.includes("__AW_IMG_001__")) {
        editedHtml = editedHtml.replace(/__AW_IMG_001__/g, imageDataUrl);
      }

      // Maintain free-plan watermark in edited HTML
      let finalEditHtml = editedHtml;
      if (isFreePlanEdit && !isAdminEdit) {
        finalEditHtml = injectFreePlanWatermark(finalEditHtml);
      } else {
        finalEditHtml = removeFreePlanWatermark(finalEditHtml);
      }

      // Increment edit count for this project
      const newEditCount = currentEditCount + 1;
      const remainingFree = Math.max(0, editLimit - newEditCount);
      const creditDeducted = isOverLimit && !isAdminEdit && !isAdminActingForUser(req);

      // Build informative remaining-edits note
      let remainingNote = "";
      if (!isAdminEdit) {
        if (creditDeducted) {
          remainingNote = lang === "ar"
            ? `\n\n🧠 تم خصم جلسة ذكاء واحدة لهذا التعديل الإضافي.`
            : `\n\n🧠 1 AI session deducted for this extra edit.`;
        } else if (remainingFree === 0) {
          remainingNote = lang === "ar"
            ? `\n\n⚠️ انتهت تعديلاتك المجانية لهذا الموقع (${editLimit}/${editLimit}). التعديلات الإضافية تخصم جلسة ذكاء واحدة.`
            : `\n\n⚠️ You've used all ${editLimit} free edits for this site. Extra edits will cost 1 AI session each.`;
        } else if (remainingFree <= 2) {
          remainingNote = lang === "ar"
            ? `\n\n⚡ تبقى **${remainingFree}** تعديل${remainingFree === 1 ? "" : "ات"} مجانية لهذا الموقع.`
            : `\n\n⚡ **${remainingFree}** free edit${remainingFree === 1 ? "" : "s"} remaining for this site.`;
        }
      }

      await storage.addChatMessage({
        projectId: project.id,
        role: "assistant",
        content: result.summary + remainingNote,
      });

      // ─── Save current version to history before overwriting (max 10 versions) ──
      const currentHistory = (project.htmlHistory as Array<{ html: string; css: string; ts: number }>) || [];
      const newHistoryEntry = { html: project.generatedHtml || "", css: project.generatedCss || "", ts: Date.now() };
      const newHistory = [...currentHistory, newHistoryEntry].slice(-10);

      const updated = await storage.updateProject(project.id, {
        generatedHtml: finalEditHtml,
        generatedCss: result.css,
        editCount: newEditCount,
        htmlHistory: newHistory as any,
      });

      res.json(updated);
    } catch (err: any) {
      console.error("Edit error:", err?.message || err, err?.status, err?.code);
      const errMsg = err?.message || "Failed to edit website";
      res.status(500).json({ message: errMsg.includes("token") || errMsg.includes("limit") ? "الرسالة طويلة جداً، جرب تقصير الأمر" : "Failed to edit website" });
    }
  });

  app.get("/api/projects/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).json({ message: "Project not found" });
      const userId = getEffectiveUserId(req);
      if (project.userId !== userId && !isAdminActingForUser(req)) return res.status(403).json({ message: "Forbidden" });
      const messages = await storage.getChatMessages(project.id);
      res.json(messages);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  const updateProjectSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    generatedHtml: z.string().optional(),
    generatedCss: z.string().optional(),
    status: z.enum(["draft", "generated", "published"]).optional(),
  });

  app.put("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).json({ message: "Project not found" });
      const userId = getEffectiveUserId(req);
      if (project.userId !== userId && !isAdminActingForUser(req)) return res.status(403).json({ message: "Forbidden" });
      const parsed = updateProjectSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
      const data = { ...parsed.data };
      // Apply/remove watermark if HTML is being updated (e.g. template applied via browser)
      if (data.generatedHtml) {
        const { isFreePlan: isFreePlanPut, isUserAdmin: isAdminPut } = await getUserPlanInfo(userId);
        if (isFreePlanPut && !isAdminPut) {
          data.generatedHtml = injectFreePlanWatermark(data.generatedHtml);
        } else {
          data.generatedHtml = removeFreePlanWatermark(data.generatedHtml);
        }
      }
      const updated = await storage.updateProject(project.id, data);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).json({ message: "Project not found" });
      const userId = getEffectiveUserId(req);
      if (project.userId !== userId && !isAdminActingForUser(req)) return res.status(403).json({ message: "Forbidden" });
      await storage.deleteProject(project.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  app.post("/api/projects/:id/publish", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).json({ message: "Project not found" });
      const userId = getEffectiveUserId(req);
      if (project.userId !== userId && !isAdminActingForUser(req)) return res.status(403).json({ message: "Forbidden" });

      if (!project.generatedHtml) {
        return res.status(400).json({ message: "لا يوجد محتوى للنشر. قم بتوليد الموقع أولاً." });
      }

      // ── Deploy to Vercel if configured ────────────────────────────────────
      let publishedUrl: string | undefined = (project as any).publishedUrl || undefined;
      let vercelDeploymentId: string | undefined = (project as any).vercelDeploymentId || undefined;

      if (isVercelConfigured()) {
        try {
          const result = await deployToVercel({
            projectId: project.id,
            projectName: project.name,
            html: project.generatedHtml,
            existingDeploymentId: vercelDeploymentId,
          });
          publishedUrl = result.url;
          vercelDeploymentId = result.deploymentId;
          console.log(`[Publish] Vercel URL: ${publishedUrl}`);
        } catch (vercelErr: any) {
          console.error("[Publish] Vercel error:", vercelErr?.message);
          // Fall through — still mark as published without external URL
        }
      }

      const updated = await storage.updateProject(project.id, {
        status: "published",
        ...(publishedUrl ? { publishedUrl } : {}),
        ...(vercelDeploymentId ? { vercelDeploymentId } : {}),
      });

      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to publish project" });
    }
  });

  app.get("/api/templates", async (req, res) => {
    try {
      if (req.query.summary === "true") {
        const page = req.query.page ? parseInt(req.query.page as string) : undefined;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
        const category = req.query.category as string | undefined;
        if (page !== undefined) {
          const result = await storage.getTemplatesSummary({ category, page, limit: limit || 24 });
          return res.json(result);
        }
        const result = await storage.getTemplatesSummary({ category });
        return res.json(result.data);
      }
      const allTemplates = await storage.getTemplates();
      res.json(allTemplates);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(parseInt(req.params.id));
      if (!template) return res.status(404).json({ message: "Template not found" });
      res.json(template);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // ── Learning System: Admin Stats ────────────────────────────────────────────
  app.get("/api/admin/learning-stats", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const [rawStats, genStats, topBlocks] = await Promise.all([
        getLearningStats(),
        storage.getGenerationStats(),
        storage.getTopBlocks(20),
      ]);

      // Shape into UI-friendly format
      const learningStats = {
        totalPatterns: rawStats.totalPatterns,
        totalInsights: rawStats.totalInsights,
        industriesCount: rawStats.topIndustries.length,
        avgQualityScore: rawStats.topIndustries.length
          ? rawStats.topIndustries.reduce((s, i) => s + i.avgQuality, 0) / rawStats.topIndustries.length
          : 0,
        byIndustry: rawStats.topIndustries.map(i => ({
          industry: i.industry,
          count: i.count,
          avgScore: i.avgQuality,
        })),
        recentHighQuality: rawStats.recentHighQuality,
        qualityDistribution: rawStats.qualityDistribution,
      };

      res.json({ learningStats, generationStats: genStats, topBlocks });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch learning stats" });
    }
  });

  // ── Learning System: Patterns by Industry ────────────────────────────────────
  app.get("/api/admin/learning-patterns/:industry", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { industry } = req.params;
      const patterns = await getPatternsByIndustry(industry, 100);
      res.json({ industry, patterns, count: patterns.length });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch patterns" });
    }
  });

  // ── Quality Signal: user exported their site ─────────────────────────────────
  app.post("/api/projects/:id/signal-export", isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      if (!project || (project.userId !== getEffectiveUserId(req) && !isAdminActingForUser(req))) return res.status(403).json({ message: "Forbidden" });

      const { db: database } = await import("./db");
      const { generationInsights } = await import("@shared/schema");
      const { desc: descOrder, eq: eqOp } = await import("drizzle-orm");

      // 1. Try to find insight by projectId (works for new generations)
      let [insight] = await database
        .select({ id: generationInsights.id, industry: generationInsights.industry })
        .from(generationInsights)
        .where(eqOp(generationInsights.projectId, projectId))
        .orderBy(descOrder(generationInsights.createdAt))
        .limit(1);

      // 2. Fallback: find most recent insight for this user (for older generations)
      if (!insight) {
        [insight] = await database
          .select({ id: generationInsights.id, industry: generationInsights.industry })
          .from(generationInsights)
          .where(eqOp(generationInsights.userId, String(req.user.id)))
          .orderBy(descOrder(generationInsights.createdAt))
          .limit(1);
        if (insight) {
          console.log(`[Learning] Export signal fallback (userId) → insightId:${insight.id}`);
        }
      }

      if (insight?.id) {
        await signalSatisfied(insight.id, "export");
        console.log(`[Learning] ✅ Export signal → insightId:${insight.id} | industry:${insight.industry}`);
      } else {
        // 3. No insight at all: still boost any recent patterns for this user's projects
        console.log(`[Learning] Export signal: no insight found for projectId:${projectId} userId:${req.user.id}`);
      }

      res.json({ ok: true, insightId: insight?.id ?? null });
    } catch (e: any) {
      console.error("[Learning] signal-export error:", e?.message);
      res.status(500).json({ message: e?.message });
    }
  });

  // ── Support Tickets ───────────────────────────────────────────────────────────

  app.post("/api/support", isAuthenticated, async (req: any, res) => {
    const schema = z.object({
      category: z.enum(["billing", "technical", "website", "account", "other"]),
      priority: z.enum(["low", "medium", "high"]),
      subject: z.string().min(5).max(200),
      message: z.string().min(20).max(3000),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "بيانات غير صحيحة", errors: parsed.error.issues });

    try {
      const user = req.user;
      const { category, priority, subject, message } = parsed.data;
      const userName = user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : (user.email?.split("@")[0] || "User");
      const userEmail = user.email || "";

      const result = await pool.query(
        `INSERT INTO support_tickets (user_id, user_name, user_email, category, priority, subject, message)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [user.id, userName, userEmail, category, priority, subject, message]
      );
      const ticketId = result.rows[0].id;

      // Send notifications (non-blocking — don't fail the request if email fails)
      Promise.all([
        sendSupportTicketToTeam({ ticketId, userName, userEmail, userId: user.id, category, subject, message, priority }),
        userEmail ? sendSupportTicketConfirmation({ ticketId, to: userEmail, userName, subject, isAr: true }) : Promise.resolve(false),
      ]).catch(e => console.error("[Support] Email send failed:", e?.message));

      console.log(`[Support] ✅ Ticket #${ticketId} created — user:${user.id} priority:${priority}`);
      res.json({ ok: true, ticketId, message: "تم استلام بلاغك بنجاح" });
    } catch (e: any) {
      console.error("[Support] Create ticket error:", e?.message);
      res.status(500).json({ message: "حدث خطأ، يرجى المحاولة مجدداً" });
    }
  });

  app.get("/api/support/my-tickets", isAuthenticated, async (req: any, res) => {
    try {
      const result = await pool.query(
        `SELECT id, category, priority, subject, status, created_at FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
        [req.user.id]
      );
      res.json({ tickets: result.rows });
    } catch (e: any) {
      res.status(500).json({ message: e?.message });
    }
  });

  // Admin: view all tickets
  app.get("/api/admin/support-tickets", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const status = req.query.status || "open";
      const result = await pool.query(
        `SELECT * FROM support_tickets WHERE ($1 = 'all' OR status = $1) ORDER BY
         CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
         created_at DESC LIMIT 100`,
        [status]
      );
      res.json({ tickets: result.rows, total: result.rowCount });
    } catch (e: any) {
      res.status(500).json({ message: e?.message });
    }
  });

  app.patch("/api/admin/support-tickets/:id/status", isAuthenticated, isAdmin, async (req: any, res) => {
    const { status } = req.body;
    if (!["open", "in_progress", "resolved", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    try {
      await pool.query(
        `UPDATE support_tickets SET status = $1, updated_at = NOW() WHERE id = $2`,
        [status, req.params.id]
      );
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ message: e?.message });
    }
  });

  // Industry Engine: list all industry profiles + test detection
  app.get("/api/admin/industry-engine", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { INDUSTRY_ENGINE } = await import("./industry-engine");
      const profiles = Object.entries(INDUSTRY_ENGINE).map(([id, p]) => ({
        id,
        nameAr: p.nameAr,
        nameEn: p.nameEn,
        serviceCount: p.typicalServices.length,
        keywordCount: p.keywords.length + p.keywordsEn.length,
        designMood: p.designHints.mood,
        colorPalette: p.designHints.colorPalette,
      }));
      res.json({ industries: profiles, total: profiles.length });
    } catch (err) {
      res.status(500).json({ message: "Failed to load industry engine" });
    }
  });

  // Industry Engine: test detection on a prompt
  app.post("/api/industry-detect", isAuthenticated, async (req: any, res) => {
    try {
      const { prompt, isArabicUI } = req.body;
      if (!prompt) return res.status(400).json({ message: "prompt required" });
      const { enrichedPrompt, industryId, industryProfile } = runIndustryEngine(
        String(prompt).slice(0, 1000),
        isArabicUI !== false,
      );
      res.json({
        detectedIndustry: industryId,
        industryNameAr: industryProfile.nameAr,
        industryNameEn: industryProfile.nameEn,
        typicalServices: industryProfile.typicalServices,
        trustSignals: industryProfile.trustSignals,
        ctaVariants: industryProfile.ctaVariants,
        designHints: industryProfile.designHints,
        seoKeywords: industryProfile.seoKeywords,
      });
    } catch (err: any) {
      res.status(500).json({ message: "Detection failed", detail: err?.message });
    }
  });

  // Business clarity analysis: detect if user needs to clarify their business type
  app.post("/api/analyze-business", isAuthenticated, async (req: any, res) => {
    try {
      const { activityType, businessName } = req.body as { activityType?: string; businessName?: string };
      if (!businessName?.trim()) {
        return res.json({ needsClarification: false });
      }
      // For specific categories with multi-word names that contain a clear type indicator, skip check
      const specificCategories = ["restaurant", "medical", "realestate", "automotive", "education", "hotel"];
      const wordCount = businessName.trim().split(/\s+/).length;
      if (specificCategories.includes(activityType || "") && wordCount >= 3) {
        return res.json({ needsClarification: false });
      }
      const { openai } = await import("./ai");
      const model = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ? "gpt-5.2" : "gpt-4o-mini";
      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: `You are an expert Arabic business name analyzer for a Saudi website builder.

Given a business name and its selected category, determine if the business type needs clarification.

Return JSON: { "clear": true/false, "question_ar": "Arabic question", "options_ar": ["option1","option2","option3","option4"] }

Rules:
- Set clear:TRUE when:
  • The name clearly describes the business (e.g. "مطعم الريف", "عيادة الدكتور سعيد", "شركة النقل السريع")
  • The category strongly matches the name's obvious meaning
  • The name contains a clear activity word (مطعم، عيادة، صالون، شركة، مدرسة، فندق، صيدلية...)
  
- Set clear:FALSE when:
  • The name is a single abstract word (نغم، نور، أمل، لمسة، رؤية، إبداع، سمو...)
  • The name could equally represent multiple different industries
  • The selected category is "other" or "general"
  • The name gives no indication of the business activity

When asking for clarification:
- Write the question naturally in Arabic
- Provide exactly 4 specific, realistic options for what this business could be
- Options should be specific activities, not generic categories`,
          },
          {
            role: "user",
            content: `Business name: "${businessName.trim()}" | Selected category: "${activityType || "other"}"`,
          },
        ],
        max_completion_tokens: 300,
        temperature: 0.3,
        response_format: { type: "json_object" },
      });
      const analysis = JSON.parse(response.choices[0]?.message?.content || "{}");
      if (analysis.clear === false) {
        return res.json({
          needsClarification: true,
          question: analysis.question_ar || `ما هو نشاط "${businessName}" تحديداً؟`,
          options: analysis.options_ar || [],
        });
      }
      return res.json({ needsClarification: false });
    } catch {
      return res.json({ needsClarification: false });
    }
  });

  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      // Strip password hashes from admin response
      const safeUsers = allUsers.map(({ password: _, ...u }) => u);
      res.json(safeUsers);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/projects", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const allProjects = await storage.getAllProjects();
      res.json(allProjects);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/admin/coupons", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const allCoupons = await storage.getCoupons();
      res.json(allCoupons);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  const createCouponSchema = z.object({
    code: z.string().min(1).max(50),
    discountType: z.enum(["percentage", "fixed"]),
    discountValue: z.number().min(1),
    maxUses: z.number().min(0).optional(),
    expiresAt: z.string().optional(),
    isActive: z.boolean().optional(),
  });

  app.post("/api/admin/coupons", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const parsed = createCouponSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
      const { code, discountType, discountValue, maxUses, expiresAt, isActive } = parsed.data;
      const coupon = await storage.createCoupon({
        code: code.toUpperCase(),
        discountType,
        discountValue,
        maxUses: maxUses || 0,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive ?? true,
      });
      res.status(201).json(coupon);
    } catch (err: any) {
      if (err?.code === "23505") return res.status(409).json({ message: "Coupon code already exists" });
      res.status(500).json({ message: "Failed to create coupon" });
    }
  });

  app.delete("/api/admin/coupons/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      await storage.deleteCoupon(parseInt(req.params.id));
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete coupon" });
    }
  });

  const updateCouponSchema = z.object({
    isActive: z.boolean().optional(),
    maxUses: z.number().min(0).optional(),
    expiresAt: z.string().optional(),
    discountValue: z.number().min(1).optional(),
  });

  app.patch("/api/admin/coupons/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const parsed = updateCouponSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
      const data: any = { ...parsed.data };
      if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);
      const updated = await storage.updateCoupon(parseInt(req.params.id), data);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to update coupon" });
    }
  });

  // ── Suspend user ────────────────────────────────────────────────────────────
  app.patch("/api/admin/users/:id/suspend", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const { reason } = req.body;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.isAdmin) return res.status(403).json({ message: "Cannot suspend admin accounts" });
      const [updated] = await db.update(users).set({
        isSuspended: true,
        suspendReason: reason || "مخالفة شروط الاستخدام",
        updatedAt: new Date(),
      }).where(eq(users.id, userId)).returning();
      console.log(`[ADMIN] Suspended user ${user.email} (${userId}). Reason: ${reason}`);
      res.json({ message: "User suspended", user: updated });
    } catch (err) {
      res.status(500).json({ message: "Failed to suspend user" });
    }
  });

  // ── Unsuspend user ───────────────────────────────────────────────────────────
  app.patch("/api/admin/users/:id/unsuspend", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) return res.status(404).json({ message: "User not found" });
      const [updated] = await db.update(users).set({
        isSuspended: false,
        suspendReason: null,
        updatedAt: new Date(),
      }).where(eq(users.id, userId)).returning();
      console.log(`[ADMIN] Unsuspended user ${user.email} (${userId})`);
      res.json({ message: "User unsuspended", user: updated });
    } catch (err) {
      res.status(500).json({ message: "Failed to unsuspend user" });
    }
  });

  // ── Admin: Add credits to a user ─────────────────────────────────────────────
  app.post("/api/admin/users/:id/credits", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const targetUserId = req.params.id;
      const amount = parseInt(req.body.amount);
      if (!amount || isNaN(amount) || amount <= 0 || amount > 100000) {
        return res.status(400).json({ message: "Invalid amount. Must be 1–100000." });
      }
      const [user] = await db.select().from(users).where(eq(users.id, targetUserId));
      if (!user) return res.status(404).json({ message: "User not found" });
      const [updated] = await db.update(users)
        .set({ credits: sql`credits + ${amount}`, updatedAt: new Date() })
        .where(eq(users.id, targetUserId))
        .returning({ credits: users.credits });
      const reason = req.body.reason || "Admin grant";
      console.log(`[ADMIN] Added ${amount} credits to ${user.email} (${targetUserId}). Reason: ${reason}. New balance: ${updated?.credits}`);
      res.json({ message: "Credits added", newBalance: updated?.credits, added: amount });
    } catch (err) {
      console.error("Add credits error:", err);
      res.status(500).json({ message: "Failed to add credits" });
    }
  });

  // ── Admin: Start impersonating a user ─────────────────────────────────────────
  app.post("/api/admin/impersonate/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const targetUserId = req.params.id;
      if (targetUserId === req.user.id) {
        return res.status(400).json({ message: "Cannot impersonate yourself" });
      }
      const [targetUser] = await db.select().from(users).where(eq(users.id, targetUserId));
      if (!targetUser) return res.status(404).json({ message: "User not found" });
      if (targetUser.isAdmin) return res.status(403).json({ message: "Cannot impersonate another admin" });

      req.session.impersonatingUserId = targetUserId;
      req.session.impersonatingUserEmail = targetUser.email;
      console.log(`[ADMIN] ${req.user?.id} started impersonating ${targetUser.email} (${targetUserId})`);
      res.json({
        message: "Impersonation started",
        targetUser: { id: targetUser.id, email: targetUser.email, firstName: targetUser.firstName, lastName: targetUser.lastName },
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to start impersonation" });
    }
  });

  // ── Admin: Stop impersonating ─────────────────────────────────────────────────
  app.delete("/api/admin/impersonate", isAuthenticated, isAdmin, async (req: any, res) => {
    const was = req.session.impersonatingUserEmail;
    req.session.impersonatingUserId = undefined;
    req.session.impersonatingUserEmail = undefined;
    console.log(`[ADMIN] ${req.user?.id} stopped impersonating ${was}`);
    res.json({ message: "Impersonation stopped" });
  });

  // ── Admin: Get current impersonation status ───────────────────────────────────
  app.get("/api/admin/impersonation-status", isAuthenticated, async (req: any, res) => {
    if (!isAdminActingForUser(req)) return res.json({ active: false });
    res.json({
      active: true,
      targetUserId: req.session.impersonatingUserId,
      targetUserEmail: req.session.impersonatingUserEmail,
    });
  });

  // ── Fraud detection: accounts sharing the same registration IP ──────────────
  app.get("/api/admin/fraud/suspicious", isAuthenticated, isAdmin, async (_req: any, res) => {
    try {
      // Find IPs with more than 1 account registered
      const suspiciousIps = await db.execute(sql`
        SELECT
          registration_ip as ip,
          COUNT(*)::int as account_count,
          json_agg(json_build_object(
            'id', id,
            'email', email,
            'plan', plan,
            'is_suspended', is_suspended,
            'created_at', created_at,
            'last_login_ip', last_login_ip
          ) ORDER BY created_at DESC) as accounts
        FROM users
        WHERE registration_ip IS NOT NULL
          AND registration_ip NOT IN ('127.0.0.1', '::1', 'unknown')
        GROUP BY registration_ip
        HAVING COUNT(*) > 1
        ORDER BY account_count DESC
        LIMIT 100
      `);

      // Users who have registered but never upgraded (potential abusers)
      const since48h = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const recentFreeUsers = await db.execute(sql`
        SELECT
          u.id,
          u.email,
          u.registration_ip,
          u.last_login_ip,
          u.plan,
          u.is_suspended,
          u.created_at,
          COUNT(p.id)::int as project_count
        FROM users u
        LEFT JOIN projects p ON p.user_id = u.id
        WHERE u.plan = 'free'
          AND u.is_admin = false
          AND u.created_at > ${since48h}
        GROUP BY u.id
        ORDER BY u.created_at DESC
        LIMIT 50
      `);

      res.json({
        suspiciousIps: suspiciousIps.rows,
        recentFreeUsers: recentFreeUsers.rows,
      });
    } catch (err) {
      console.error("Fraud detection error:", err);
      res.status(500).json({ message: "Failed to run fraud detection" });
    }
  });

  // ── Bulk suspend all accounts from a suspicious IP ──────────────────────────
  app.post("/api/admin/fraud/suspend-ip", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { ip, reason } = req.body;
      if (!ip) return res.status(400).json({ message: "IP is required" });
      const suspended = await db.update(users)
        .set({
          isSuspended: true,
          suspendReason: reason || `تعليق تلقائي: IP مشبوه (${ip})`,
          updatedAt: new Date(),
        })
        .where(and(eq(users.registrationIp, ip), eq(users.isAdmin, false)))
        .returning({ id: users.id, email: users.email });
      console.log(`[ADMIN] Bulk suspended ${suspended.length} accounts from IP ${ip}`);
      res.json({ message: `تم تعليق ${suspended.length} حساب من IP ${ip}`, suspended });
    } catch (err) {
      res.status(500).json({ message: "Failed to bulk suspend" });
    }
  });

  const socialContentSchema = z.object({
    topic: z.string().min(1).max(1000),
    platform: z.enum(["instagram", "facebook", "linkedin", "twitter", "tiktok", "youtube"]),
    language: z.string().optional(),
    tone: z.string().optional(),
  });

  // Allowed platforms per plan
  const MARKETING_PLATFORMS: Record<string, string[]> = {
    free: [],
    pro: ["instagram", "twitter"],
    business: ["instagram", "twitter", "facebook"],
  };

  app.post("/api/marketing/generate", isAuthenticated, async (req: any, res) => {
    try {
      if (!checkAiRateLimit(req.user.id)) {
        return res.status(429).json({ message: "rate_limit_exceeded", messageAr: "تجاوزت الحد المسموح به من الطلبات. انتظر دقيقة ثم أعد المحاولة.", messageEn: "Too many requests. Please wait a moment and try again." });
      }

      const { isFreePlan, isUserAdmin, planName, credits } = await getUserPlanInfo(req.user.id);

      if (isFreePlan && !isUserAdmin) {
        return res.status(402).json({
          message: "upgrade_required",
          messageAr: "أداة التسويق بالذكاء الاصطناعي متاحة للخطط المدفوعة فقط. اشترك الآن للوصول إليها.",
          messageEn: "AI Marketing Tool is available on paid plans only. Upgrade now to access it.",
        });
      }

      if (!isUserAdmin && credits <= 0) {
        return res.status(402).json({
          message: "insufficient_credits",
          messageAr: "انتهى رصيد جلسات الذكاء. اشحن رصيدك لمتابعة توليد المحتوى التسويقي.",
          messageEn: "Your AI credits are depleted. Top up to continue generating marketing content.",
        });
      }

      // Platform restriction per plan
      if (!isUserAdmin) {
        const allowedPlatforms = MARKETING_PLATFORMS[planName] || [];
        const requestedPlatform = (req.body?.platform || "").toLowerCase();
        if (!allowedPlatforms.includes(requestedPlatform)) {
          const planLabel = planName === "pro"
            ? { ar: "الاحترافية (Instagram + X/Twitter)", en: "Pro (Instagram + X/Twitter)" }
            : { ar: "الأعمال (Instagram + X/Twitter + Facebook)", en: "Business (Instagram + X/Twitter + Facebook)" };
          return res.status(403).json({
            message: "platform_not_allowed",
            messageAr: `هذه المنصة غير متاحة في خطتك الحالية. خطة ${planLabel.ar} تتيح لك المنصات المحددة فقط. قم بالترقية للوصول إلى المزيد.`,
            messageEn: `This platform is not available in your current plan. The ${planLabel.en} plan includes specific platforms only. Upgrade to access more.`,
            allowedPlatforms,
          });
        }
      }

      const parsed = socialContentSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
      const { topic, platform, language, tone } = parsed.data;
      const content = await generateSocialContent(topic, platform, language || "ar", tone || "professional");

      if (!isUserAdmin && !isAdminActingForUser(req)) {
        const cu = getEffectiveUserId(req);
        await db.update(users).set({ credits: sql`GREATEST(credits - 10, 0)`, updatedAt: new Date() }).where(eq(users.id, cu));
        db.select({ credits: users.credits, email: users.email }).from(users).where(eq(users.id, cu)).then(([u]) => {
          if (u?.credits === 0 && u?.email) sendLowCreditsEmail(u.email, 0, true).catch(() => {});
        });
      }

      res.json(content);
    } catch (err) {
      console.error("Marketing generation error:", err);
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  // ── Generate social media post image (DALL-E 3) ────────────────────────────
  app.post("/api/marketing/generate-image", isAuthenticated, async (req: any, res) => {
    try {
      if (!checkAiRateLimit(req.user.id)) {
        return res.status(429).json({ message: "rate_limit_exceeded", messageAr: "تجاوزت الحد المسموح به. انتظر دقيقة.", messageEn: "Too many requests. Please wait a moment." });
      }

      const { isFreePlan, isUserAdmin, credits } = await getUserPlanInfo(req.user.id);

      if (isFreePlan && !isUserAdmin) {
        return res.status(402).json({ message: "upgrade_required", messageAr: "توليد الصور متاح للخطط المدفوعة فقط.", messageEn: "Image generation is available on paid plans only." });
      }

      if (!isUserAdmin && credits <= 0) {
        return res.status(402).json({ message: "insufficient_credits", messageAr: "انتهى رصيد جلسات الذكاء.", messageEn: "Your AI credits are depleted." });
      }

      const { topic, platform, language, postContent } = req.body;
      if (!topic || !platform) return res.status(400).json({ message: "topic and platform are required" });

      const result = await generateSocialPostImage(topic, platform, language || "ar", postContent);

      if (!isUserAdmin && !isAdminActingForUser(req)) {
        await db.update(users).set({ credits: sql`GREATEST(credits - 20, 0)`, updatedAt: new Date() }).where(eq(users.id, getEffectiveUserId(req)));
      }

      res.json(result);
    } catch (err: any) {
      console.error("Image generation error:", err);
      const isContentPolicy = err?.message?.includes("content_policy") || err?.message?.includes("safety");
      if (isContentPolicy) {
        return res.status(400).json({ message: "content_policy", messageAr: "لا يمكن توليد هذه الصورة. حاول بموضوع مختلف.", messageEn: "Cannot generate this image. Try a different topic." });
      }
      res.status(500).json({ message: "Failed to generate image" });
    }
  });

  // ── Generate video script ──────────────────────────────────────────────────
  app.post("/api/marketing/generate-script", isAuthenticated, async (req: any, res) => {
    try {
      if (!checkAiRateLimit(req.user.id)) {
        return res.status(429).json({ message: "rate_limit_exceeded", messageAr: "تجاوزت الحد المسموح به. انتظر دقيقة.", messageEn: "Too many requests. Please wait a moment." });
      }

      const { isFreePlan, isUserAdmin, credits } = await getUserPlanInfo(req.user.id);

      if (isFreePlan && !isUserAdmin) {
        return res.status(402).json({ message: "upgrade_required", messageAr: "سكريبت الفيديو متاح للخطط المدفوعة فقط.", messageEn: "Video scripts are available on paid plans only." });
      }

      if (!isUserAdmin && credits <= 0) {
        return res.status(402).json({ message: "insufficient_credits", messageAr: "انتهى رصيد جلسات الذكاء.", messageEn: "Your AI credits are depleted." });
      }

      const { topic, platform, language, tone } = req.body;
      if (!topic || !platform) return res.status(400).json({ message: "topic and platform are required" });

      const script = await generateVideoScript(topic, platform, language || "ar", tone || "casual");

      if (!isUserAdmin && !isAdminActingForUser(req)) {
        const cu2 = getEffectiveUserId(req);
        await db.update(users).set({ credits: sql`GREATEST(credits - 10, 0)`, updatedAt: new Date() }).where(eq(users.id, cu2));
        db.select({ credits: users.credits, email: users.email }).from(users).where(eq(users.id, cu2)).then(([u]) => {
          if (u?.credits === 0 && u?.email) sendLowCreditsEmail(u.email, 0, true).catch(() => {});
        });
      }

      res.json(script);
    } catch (err) {
      console.error("Video script generation error:", err);
      res.status(500).json({ message: "Failed to generate video script" });
    }
  });

  // ── Trend Generator (Business plan only) ──────────────────────────────────
  app.post("/api/marketing/trend", isAuthenticated, async (req: any, res) => {
    try {
      if (!checkAiRateLimit(req.user.id)) {
        return res.status(429).json({ message: "rate_limit_exceeded", messageAr: "تجاوزت الحد المسموح به. انتظر دقيقة.", messageEn: "Too many requests. Please wait a moment." });
      }

      const { isFreePlan, isUserAdmin, planName, credits } = await getUserPlanInfo(req.user.id);

      if (!isUserAdmin && planName !== "business") {
        return res.status(402).json({ message: "upgrade_required", messageAr: "مولد الترند حصري لخطة الأعمال. رقِّ إلى Business للوصول.", messageEn: "Trend Generator is exclusive to the Business plan. Upgrade to access." });
      }

      if (!isUserAdmin && credits <= 0) {
        return res.status(402).json({ message: "insufficient_credits", messageAr: "انتهى رصيد جلسات الذكاء.", messageEn: "Your AI credits are depleted." });
      }

      const { niche, language } = req.body;
      if (!niche) return res.status(400).json({ message: "niche is required" });

      const trends = await generateTrendContent(niche, language || "ar");

      if (!isUserAdmin && !isAdminActingForUser(req)) {
        const cu3 = getEffectiveUserId(req);
        await db.update(users).set({ credits: sql`GREATEST(credits - 2, 0)`, updatedAt: new Date() }).where(eq(users.id, cu3));
        db.select({ credits: users.credits, email: users.email }).from(users).where(eq(users.id, cu3)).then(([u]) => {
          if (u?.credits === 0 && u?.email) sendLowCreditsEmail(u.email, 0, true).catch(() => {});
        });
      }

      res.json({ niche, trends, generatedAt: new Date().toISOString() });
    } catch (err) {
      console.error("Trend generation error:", err);
      res.status(500).json({ message: "Failed to generate trends" });
    }
  });

  app.get("/api/payments/config", isAuthenticated, async (req: any, res) => {
    try {
      const configured = await isPaymobConfigured();
      const testMode = (await storage.getSetting("paymob_test_mode")) === "true";
      res.json({ configured: configured || testMode, testMode });
    } catch (err) {
      res.status(500).json({ message: "Failed to check payment config" });
    }
  });

  app.get("/api/subscription", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (user?.isAdmin) {
        return res.json({
          plan: "business",
          status: "active",
          credits: 999999,
          endDate: null,
          isAdmin: true,
        });
      }
      const sub = await storage.getSubscriptionByUser(userId);
      res.json({
        plan: user?.plan || "free",
        status: sub?.status || "active",
        credits: user?.credits ?? 50,
        endDate: sub?.endDate || null,
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // /api/me — quick user info for sidebar (credits, plan)
  // When admin is impersonating, returns the impersonated user's data so dashboard reflects their account
  app.get("/api/me", isAuthenticated, async (req: any, res) => {
    try {
      const effectiveId = getEffectiveUserId(req);
      const [user] = await db.select().from(users).where(eq(users.id, effectiveId));
      if (!user) return res.status(404).json({ message: "User not found" });
      const isImpersonating = isAdminActingForUser(req);
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        // When impersonating, show the target user's real plan/credits so admin sees accurate data
        plan: (!isImpersonating && user.isAdmin) ? "business" : (user.plan || "free"),
        credits: (!isImpersonating && user.isAdmin) ? 999999 : (user.credits ?? 0),
        isAdmin: user.isAdmin ?? false,
        isImpersonating,
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch user info" });
    }
  });

  app.get("/api/credits", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (user?.isAdmin) {
        return res.json({ credits: 999999, plan: "business", isAdmin: true });
      }
      res.json({ credits: user?.credits ?? 50, plan: user?.plan || "free" });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch credits" });
    }
  });

  const invoiceInfoSchema = z.object({
    isCompany: z.boolean().optional().default(false),
    companyName: z.string().optional(),
    taxNumber: z.string().optional(),
  });

  const initiatePaymentSchema = z.object({
    plan: z.enum(["pro", "business"]),
    billingCycle: z.enum(["monthly", "yearly"]).optional().default("monthly"),
    invoiceInfo: invoiceInfoSchema.optional(),
  });

  app.post("/api/payments/initiate", isAuthenticated, async (req: any, res) => {
    try {
      const testMode = (await storage.getSetting("paymob_test_mode")) === "true";
      const configured = await isPaymobConfigured();
      if (!configured && !testMode) return res.status(400).json({ message: "Payment gateway not configured" });

      const parsed = initiatePaymentSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid plan" });

      const { plan, billingCycle, invoiceInfo } = parsed.data;
      const amountCents = PLAN_PRICES[plan];
      if (!amountCents) return res.status(400).json({ message: "Invalid plan" });

      const userId = req.user.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) return res.status(404).json({ message: "User not found" });

      if (testMode) {
        const sub = await storage.createSubscription({
          userId,
          plan,
          status: "pending",
          paymobOrderId: `TEST-${Date.now()}`,
          amountCents,
          currency: "SAR",
          startDate: null,
          endDate: null,
          paymobTransactionId: null,
        });
        return res.json({ testMode: true, testUrl: `/payment-test?type=plan&plan=${plan}&subId=${sub.id}&amount=${Math.round(amountCents / 100)}` });
      }

      const merchantOrderId = `ARABYWEB-${userId}-${Date.now()}`;
      const { orderId, token: authToken } = await createPaymobOrder(amountCents, "SAR", merchantOrderId);

      const paymentToken = await getPaymentKey(authToken, orderId, amountCents, "SAR", {
        email: user.email || "user@arabyweb.net",
        firstName: user.firstName || "User",
        lastName: user.lastName || "ArabyWeb",
      });

      const sub = await storage.createSubscription({
        userId,
        plan,
        status: "pending",
        paymobOrderId: String(orderId),
        amountCents,
        currency: "SAR",
        startDate: null,
        endDate: null,
        paymobTransactionId: null,
        invoiceIsCompany: invoiceInfo?.isCompany || false,
        invoiceCompanyName: invoiceInfo?.companyName || null,
        invoiceTaxNumber: invoiceInfo?.taxNumber || null,
        invoiceCustomerName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
      });

      const iframeUrl = await getIframeUrl(paymentToken);
      res.json({ iframeUrl, orderId, subscriptionId: sub.id });
    } catch (err: any) {
      console.error("Payment initiation error:", err);
      if (err.message === "PAYMOB_AUTH_FAILED") {
        return res.status(503).json({
          message: "PAYMOB_AUTH_FAILED",
          messageAr: "بوابة الدفع غير متاحة مؤقتاً. يرجى المحاولة لاحقاً أو التواصل مع الدعم.",
          messageEn: "Payment gateway is temporarily unavailable. Please try again later or contact support.",
        });
      }
      res.status(500).json({ message: err.message || "Failed to initiate payment" });
    }
  });

  // ─── Buy Credits (top-up) ────────────────────────────────────────────────
  const buyCreditSchema = z.object({
    credits: z.number().int().min(500).refine((n) => n % 50 === 0, { message: "Credits must be a multiple of 50" }),
    invoiceInfo: z.object({
      isCompany: z.boolean().optional().default(false),
      companyName: z.string().optional(),
      taxNumber: z.string().optional(),
    }).optional(),
  });

  app.post("/api/payments/buy-credits", isAuthenticated, async (req: any, res) => {
    try {
      const testMode = (await storage.getSetting("paymob_test_mode")) === "true";
      const configured = await isPaymobConfigured();
      if (!configured && !testMode) return res.status(400).json({ message: "Payment gateway not configured" });

      const parsed = buyCreditSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "كمية جلسات الذكاء يجب أن تكون 500 على الأقل ومضاعفاً للرقم 50" });

      const { credits, invoiceInfo } = parsed.data;
      const amountCents = Math.round((credits / 10) * 1.15 * 100);
      const userId = req.user.id;

      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) return res.status(404).json({ message: "User not found" });

      // ── Free plan users cannot purchase extra credits ──────────────────────
      if (!user.isAdmin) {
        const [activeSub] = await db.select().from(subscriptions)
          .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
          .orderBy(desc(subscriptions.endDate))
          .limit(1);
        const isPaid = activeSub && (activeSub.plan === "pro" || activeSub.plan === "business");
        if (!isPaid) {
          return res.status(403).json({
            message: "يجب الاشتراك في خطة مدفوعة أولاً قبل شراء جلسات إضافية",
            messageEn: "You must have an active paid subscription before purchasing additional AI sessions.",
            requiresUpgrade: true,
          });
        }
      }

      if (testMode) {
        const purchase = await storage.createCreditPurchase({
          userId,
          credits,
          amountCents,
          currency: "SAR",
          status: "pending",
          paymobOrderId: `TEST-CREDITS-${Date.now()}`,
          paymobTransactionId: null,
        });
        const amountSAR = parseFloat(((credits / 10) * 1.15).toFixed(2));
        return res.json({ testMode: true, testUrl: `/payment-test?type=credits&credits=${credits}&purchaseId=${purchase.id}&amount=${amountSAR}` });
      }

      const merchantOrderId = `ARABYWEB-CREDITS-${userId}-${Date.now()}`;
      const { orderId, token: authToken } = await createPaymobOrder(amountCents, "SAR", merchantOrderId);

      const paymentToken = await getPaymentKey(authToken, orderId, amountCents, "SAR", {
        email: user.email || "user@arabyweb.net",
        firstName: user.firstName || "User",
        lastName: user.lastName || "ArabyWeb",
      });

      await storage.createCreditPurchase({
        userId,
        credits,
        amountCents,
        currency: "SAR",
        status: "pending",
        paymobOrderId: String(orderId),
        paymobTransactionId: null,
        invoiceIsCompany: invoiceInfo?.isCompany || false,
        invoiceCompanyName: invoiceInfo?.companyName || null,
        invoiceTaxNumber: invoiceInfo?.taxNumber || null,
        invoiceCustomerName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
      });

      const iframeUrl = await getIframeUrl(paymentToken);
      res.json({ iframeUrl, orderId, credits, amountSAR: parseFloat(((credits / 10) * 1.15).toFixed(2)) });
    } catch (err: any) {
      console.error("Buy credits error:", err);
      if (err.message === "PAYMOB_AUTH_FAILED") {
        return res.status(503).json({
          message: "PAYMOB_AUTH_FAILED",
          messageAr: "بوابة الدفع غير متاحة مؤقتاً. يرجى المحاولة لاحقاً أو التواصل مع الدعم.",
          messageEn: "Payment gateway is temporarily unavailable. Please try again later or contact support.",
        });
      }
      res.status(500).json({ message: err.message || "Failed to initiate credit purchase" });
    }
  });

  // ─── Test Payment Complete (test mode only) ───────────────────────────────
  app.post("/api/payments/test-complete", isAuthenticated, async (req: any, res) => {
    try {
      const testMode = (await storage.getSetting("paymob_test_mode")) === "true";
      if (!testMode) return res.status(403).json({ message: "Test mode not enabled" });

      const { type, subId, purchaseId, credits, plan } = req.body;
      const userId = req.user.id;

      if (type === "plan" && subId && plan) {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 1);
        await storage.updateSubscription(Number(subId), {
          status: "active",
          startDate: now,
          endDate: endDate,
          paymobTransactionId: `TEST-TXN-${Date.now()}`,
        });
        const planCredits = plan === "business" ? 200 : 50;
        await db.execute(sql`UPDATE users SET plan = ${plan}, credits = ${planCredits} WHERE id = ${userId}`);
        // Send invoice email for test subscription
        try {
          const [subRow] = await db.select().from(subscriptions).where(eq(subscriptions.id, Number(subId)));
          const [userRow] = await db.select().from(users).where(eq(users.id, userId));
          if (userRow?.email && subRow) {
            const amountSar = (subRow.amountCents || 0) / 100;
            const planNameAr = plan === "business" ? "Business" : "Pro";
            const invoiceData: InvoiceData = {
              invoiceNumber: `AW-SUB-${subRow.id}`,
              invoiceDate: now,
              customerEmail: userRow.email,
              customerName: (subRow as any).invoiceCustomerName || `${userRow.firstName || ""} ${userRow.lastName || ""}`.trim() || userRow.email,
              isCompany: !!(subRow as any).invoiceIsCompany,
              companyName: (subRow as any).invoiceCompanyName || undefined,
              taxNumber: (subRow as any).invoiceTaxNumber || undefined,
              description: `اشتراك خطة ${planNameAr} — ArabyWeb.net (شهري)`,
              amountWithVatSar: parseFloat(amountSar.toFixed(2)),
              invoiceType: "subscription",
              planOrCredits: planNameAr,
            };
            sendInvoiceEmail(invoiceData, true).catch(() => {});
          }
        } catch { /* non-critical */ }
        return res.json({ success: true, message: "تم تفعيل الاشتراك بنجاح" });
      }

      if (type === "credits" && purchaseId && credits) {
        await storage.updateCreditPurchase(Number(purchaseId), {
          status: "completed",
          paymobTransactionId: `TEST-TXN-${Date.now()}`,
        });
        await db.execute(sql`UPDATE users SET credits = credits + ${Number(credits)} WHERE id = ${userId}`);
        // Send invoice email for test credit purchase
        try {
          const [purchase] = await db.select().from(creditPurchases).where(eq(creditPurchases.id, Number(purchaseId)));
          const [userRow] = await db.select().from(users).where(eq(users.id, userId));
          if (userRow?.email && purchase) {
            const amountSar = (purchase.amountCents || 0) / 100;
            const invoiceData: InvoiceData = {
              invoiceNumber: `AW-CR-${purchase.id}`,
              invoiceDate: new Date(),
              customerEmail: userRow.email,
              customerName: (purchase as any).invoiceCustomerName || `${userRow.firstName || ""} ${userRow.lastName || ""}`.trim() || userRow.email,
              isCompany: !!(purchase as any).invoiceIsCompany,
              companyName: (purchase as any).invoiceCompanyName || undefined,
              taxNumber: (purchase as any).invoiceTaxNumber || undefined,
              description: `شراء ${purchase.credits} جلسة ذكاء اصطناعي — ArabyWeb.net`,
              amountWithVatSar: parseFloat(amountSar.toFixed(2)),
              invoiceType: "credits",
              planOrCredits: `${purchase.credits} جلسة`,
            };
            sendInvoiceEmail(invoiceData, true).catch(() => {});
          }
        } catch { /* non-critical */ }
        return res.json({ success: true, message: "تم إضافة الرصيد بنجاح" });
      }

      return res.status(400).json({ message: "Invalid request" });
    } catch (err: any) {
      console.error("Test complete error:", err);
      res.status(500).json({ message: err.message || "Failed to complete test payment" });
    }
  });

  app.get("/api/payments/credit-history", isAuthenticated, async (req: any, res) => {
    try {
      const purchases = await storage.getCreditPurchasesByUser(req.user.id);
      res.json(purchases);
    } catch {
      res.status(500).json({ message: "Failed to fetch credit history" });
    }
  });

  app.post("/api/payments/callback", async (req: any, res) => {
    try {
      const data = req.body?.obj;
      const hmac = req.query.hmac as string;

      if (!data) return res.status(400).json({ message: "Missing data" });

      const hmacConfigured = !!(await storage.getSetting("paymob_hmac_secret"));
      if (hmacConfigured) {
        if (!hmac) return res.status(403).json({ message: "Missing HMAC" });
        const valid = await verifyHmac(data, hmac);
        if (!valid) return res.status(403).json({ message: "Invalid HMAC" });
      }

      const orderId = String(data.order?.id ?? data.order ?? "");
      if (!orderId) return res.status(400).json({ message: "Missing order ID" });

      // Check if this is a credit purchase order first
      const creditPurchase = await storage.getCreditPurchaseByOrderId(orderId);
      if (creditPurchase) {
        if (creditPurchase.amountCents && data.amount_cents !== creditPurchase.amountCents) {
          console.error("Credit purchase amount mismatch:", data.amount_cents, "vs", creditPurchase.amountCents);
          return res.status(400).json({ message: "Amount mismatch" });
        }
        if (data.success === true) {
          await storage.updateCreditPurchase(creditPurchase.id, {
            status: "completed",
            paymobTransactionId: String(data.id),
          });
          // Add credits to user balance
          await db.update(users)
            .set({ credits: sql`credits + ${creditPurchase.credits}`, updatedAt: new Date() })
            .where(eq(users.id, creditPurchase.userId));
          console.log(`[Credits] Added ${creditPurchase.credits} credits to user ${creditPurchase.userId}`);
          // Send Saudi VAT invoice email (fire-and-forget)
          try {
            const [buyer] = await db.select().from(users).where(eq(users.id, creditPurchase.userId));
            if (buyer?.email) {
              const amountSar = (creditPurchase.amountCents || 0) / 100;
              const invoiceData: InvoiceData = {
                invoiceNumber: `AW-CR-${creditPurchase.id}`,
                invoiceDate: new Date(),
                customerEmail: buyer.email,
                customerName: (creditPurchase as any).invoiceCustomerName || `${buyer.firstName || ""} ${buyer.lastName || ""}`.trim() || buyer.email,
                isCompany: !!(creditPurchase as any).invoiceIsCompany,
                companyName: (creditPurchase as any).invoiceCompanyName || undefined,
                taxNumber: (creditPurchase as any).invoiceTaxNumber || undefined,
                description: `شراء ${creditPurchase.credits} جلسة ذكاء اصطناعي — ArabyWeb.net`,
                amountWithVatSar: parseFloat(amountSar.toFixed(2)),
                invoiceType: "credits",
                planOrCredits: `${creditPurchase.credits} جلسة`,
              };
              sendInvoiceEmail(invoiceData, true).catch(() => {});
            }
          } catch { /* non-critical */ }
        } else {
          await storage.updateCreditPurchase(creditPurchase.id, {
            status: "failed",
            paymobTransactionId: String(data.id || ""),
          });
        }
        return res.json({ message: "OK" });
      }

      // Otherwise, treat as subscription — query directly by orderId (no N+1)
      const sub = await storage.getSubscriptionByOrderId(orderId);
      if (!sub) return res.json({ message: "OK" });

      if (sub.amountCents && data.amount_cents !== sub.amountCents) {
        console.error("Amount mismatch:", data.amount_cents, "vs", sub.amountCents);
        return res.status(400).json({ message: "Amount mismatch" });
      }

      if (data.success === true) {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 1);
        await storage.updateSubscription(sub.id, {
          status: "active",
          paymobTransactionId: String(data.id),
          startDate: now,
          endDate,
        });
        const planCredits: Record<string, number> = { pro: 500, business: 2000 };
        const newCredits = planCredits[sub.plan] || 50;
        const [existingUser] = await db.select({ credits: users.credits, email: users.email }).from(users).where(eq(users.id, sub.userId));
        // SET credits to plan allocation (not ADD) so free→pro gives exactly 50, not 55
        await db.update(users).set({ plan: sub.plan, credits: newCredits, updatedAt: new Date() }).where(eq(users.id, sub.userId));
        // Send Saudi VAT invoice email for subscription (fire-and-forget)
        try {
          if (existingUser?.email) {
            const amountSar = (sub.amountCents || 0) / 100;
            const planNameAr = sub.plan === "business" ? "Business" : "Pro";
            const invoiceData: InvoiceData = {
              invoiceNumber: `AW-SUB-${sub.id}`,
              invoiceDate: new Date(),
              customerEmail: existingUser.email,
              customerName: (sub as any).invoiceCustomerName || existingUser.email,
              isCompany: !!(sub as any).invoiceIsCompany,
              companyName: (sub as any).invoiceCompanyName || undefined,
              taxNumber: (sub as any).invoiceTaxNumber || undefined,
              description: `اشتراك خطة ${planNameAr} — ArabyWeb.net (شهري)`,
              amountWithVatSar: parseFloat(amountSar.toFixed(2)),
              invoiceType: "subscription",
              planOrCredits: planNameAr,
            };
            sendInvoiceEmail(invoiceData, true).catch(() => {});
          }
        } catch { /* non-critical */ }
      } else {
        await storage.updateSubscription(sub.id, {
          status: "failed",
          paymobTransactionId: String(data.id || ""),
        });
      }

      res.json({ message: "OK" });
    } catch (err) {
      console.error("Payment callback error:", err);
      res.status(500).json({ message: "Callback processing failed" });
    }
  });

  app.get("/api/payments/status/:orderId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const sub = await storage.getSubscriptionByUser(userId);
      if (!sub || sub.paymobOrderId !== req.params.orderId) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      res.json(sub);
    } catch (err) {
      res.status(500).json({ message: "Failed to check payment status" });
    }
  });

  const paymobSettingsSchema = z.object({
    apiKey: z.string().optional(),
    integrationId: z.string().optional(),
    iframeId: z.string().optional(),
    hmacSecret: z.string().optional(),
  });

  app.get("/api/admin/settings/paymob", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const settings = await storage.getSettingsByPrefix("paymob_");
      const result: Record<string, string> = {};
      settings.forEach((s) => {
        const key = s.key.replace("paymob_", "");
        const v = s.value;
        result[key] = v.length <= 4 ? v : v.slice(0, 4) + "*".repeat(Math.min(v.length - 4, 20));
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/admin/settings/paymob", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const parsed = paymobSettingsSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

      const { apiKey, integrationId, iframeId, hmacSecret } = parsed.data;
      if (apiKey) await storage.setSetting("paymob_api_key", apiKey);
      if (integrationId) await storage.setSetting("paymob_integration_id", integrationId);
      if (iframeId) await storage.setSetting("paymob_iframe_id", iframeId);
      if (hmacSecret) await storage.setSetting("paymob_hmac_secret", hmacSecret);

      res.json({ message: "Settings saved" });
    } catch (err) {
      res.status(500).json({ message: "Failed to save settings" });
    }
  });

  app.post("/api/admin/settings/paymob/test-mode", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { enabled } = req.body;
      await storage.setSetting("paymob_test_mode", enabled ? "true" : "false");
      res.json({ testMode: enabled });
    } catch (err) {
      res.status(500).json({ message: "Failed to update test mode" });
    }
  });

  // ─── Paymob Connection Test ────────────────────────────────────────────────
  app.post("/api/admin/settings/paymob/test-connection", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const apiKey = (await storage.getSetting("paymob_api_key") || "").trim();
      const integrationId = await storage.getSetting("paymob_integration_id");
      const iframeId = await storage.getSetting("paymob_iframe_id");
      if (!apiKey) return res.status(400).json({ ok: false, message: "API key not set" });

      const authRes = await fetch("https://accept.paymob.com/api/auth/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey }),
      });
      const body = await authRes.text();
      if (!authRes.ok) {
        return res.json({ ok: false, httpStatus: authRes.status, message: `Auth failed: ${body.slice(0, 300)}` });
      }
      let data: any = {};
      try { data = JSON.parse(body); } catch {}
      if (!data.token) {
        return res.json({ ok: false, message: "Auth response missing token", raw: body.slice(0, 300) });
      }
      return res.json({
        ok: true,
        message: "Paymob connection successful",
        integrationId: integrationId || "not set",
        iframeId: iframeId || "not set",
        tokenPrefix: (data.token as string).slice(0, 20) + "...",
      });
    } catch (err: any) {
      return res.status(500).json({ ok: false, message: err.message || "Connection test failed" });
    }
  });

  // ─── SMTP Settings ────────────────────────────────────────────────────────
  app.get("/api/admin/settings/smtp", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const [host, port, user, pass] = await Promise.all([
        storage.getSetting("smtp_host"),
        storage.getSetting("smtp_port"),
        storage.getSetting("smtp_user"),
        storage.getSetting("smtp_pass"),
      ]);
      // Never return the actual password — mask it
      res.json({
        host: host || "",
        port: port || "587",
        user: user || "",
        passConfigured: !!pass,
        fromEnv: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch SMTP settings" });
    }
  });

  app.put("/api/admin/settings/smtp", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { host, port, user, pass } = req.body;
      if (host !== undefined) await storage.setSetting("smtp_host", String(host));
      if (port !== undefined) await storage.setSetting("smtp_port", String(port));
      if (user !== undefined) await storage.setSetting("smtp_user", String(user));
      if (pass !== undefined && pass !== "") await storage.setSetting("smtp_pass", String(pass));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to save SMTP settings" });
    }
  });

  app.post("/api/admin/settings/smtp/test", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const adminUser = req.user;
      const email = adminUser?.email;
      if (!email) return res.status(400).json({ message: "No admin email found" });
      const { sendTestEmail } = await import("./email");
      const sent = await sendTestEmail(email, true);
      if (sent) {
        res.json({ success: true, message: `Test email sent to ${email}` });
      } else {
        res.status(400).json({ message: "Failed to send test email — check SMTP settings" });
      }
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Failed to send test email" });
    }
  });

  app.get("/api/admin/subscriptions", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const subs = await storage.getSubscriptions();
      res.json(subs);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.get("/api/admin/credit-purchases", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const purchases = await storage.getAllCreditPurchases();
      res.json(purchases);
    } catch {
      res.status(500).json({ message: "Failed to fetch credit purchases" });
    }
  });

  app.get("/api/admin/pricing", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const proPrice = await storage.getSetting("price_pro");
      const businessPrice = await storage.getSetting("price_business");
      const proCredits = await storage.getSetting("credits_pro");
      const businessCredits = await storage.getSetting("credits_business");
      const freeCredits = await storage.getSetting("credits_free");
      res.json({
        pro: { price: proPrice ? parseInt(proPrice) : 4900, credits: proCredits ? parseInt(proCredits) : 500 },
        business: { price: businessPrice ? parseInt(businessPrice) : 9900, credits: businessCredits ? parseInt(businessCredits) : 2000 },
        free: { credits: freeCredits ? parseInt(freeCredits) : 50 },
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch pricing" });
    }
  });

  app.put("/api/admin/pricing", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { proPrice, businessPrice, proCredits, businessCredits, freeCredits } = req.body;
      if (proPrice !== undefined) {
        await storage.setSetting("price_pro", String(proPrice));
        PLAN_PRICES.pro = proPrice;
      }
      if (businessPrice !== undefined) {
        await storage.setSetting("price_business", String(businessPrice));
        PLAN_PRICES.business = businessPrice;
      }
      if (proCredits !== undefined) await storage.setSetting("credits_pro", String(proCredits));
      if (businessCredits !== undefined) await storage.setSetting("credits_business", String(businessCredits));
      if (freeCredits !== undefined) await storage.setSetting("credits_free", String(freeCredits));
      res.json({ message: "Pricing updated" });
    } catch (err) {
      res.status(500).json({ message: "Failed to update pricing" });
    }
  });

  app.get("/api/admin/promotions", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const promoData = await storage.getSetting("active_promotions");
      res.json(promoData ? JSON.parse(promoData) : []);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch promotions" });
    }
  });

  app.put("/api/admin/promotions", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { promotions } = req.body;
      await storage.setSetting("active_promotions", JSON.stringify(promotions || []));
      res.json({ message: "Promotions updated" });
    } catch (err) {
      res.status(500).json({ message: "Failed to update promotions" });
    }
  });

  app.get("/api/public/pricing", async (req, res) => {
    try {
      const proPrice = await storage.getSetting("price_pro");
      const businessPrice = await storage.getSetting("price_business");
      const proCredits = await storage.getSetting("credits_pro");
      const businessCredits = await storage.getSetting("credits_business");
      const freeCredits = await storage.getSetting("credits_free");
      const promoData = await storage.getSetting("active_promotions");
      const promotions = promoData ? JSON.parse(promoData) : [];
      const now = new Date();
      const activePromos = promotions.filter((p: any) => {
        if (!p.isActive) return false;
        if (p.expiresAt && new Date(p.expiresAt) < now) return false;
        return true;
      });
      res.json({
        pro: { price: proPrice ? parseInt(proPrice) : 4900, credits: proCredits ? parseInt(proCredits) : 500 },
        business: { price: businessPrice ? parseInt(businessPrice) : 9900, credits: businessCredits ? parseInt(businessCredits) : 2000 },
        free: { credits: freeCredits ? parseInt(freeCredits) : 50 },
        promotions: activePromos,
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch pricing" });
    }
  });

  async function getUserGitHubToken(req: any): Promise<string | null> {
    const userId = req.user?.id;
    if (!userId) return null;
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user?.githubToken) return null;
    try {
      return decryptToken(user.githubToken);
    } catch {
      return null;
    }
  }

  app.post("/api/github/connect", isAuthenticated, async (req: any, res) => {
    try {
      const { token } = req.body;
      if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Token is required" });
      }
      const result = await validateToken(token.trim());
      if (!result.valid || !result.user) {
        return res.status(401).json({ message: "Invalid GitHub token. Please check your token and try again." });
      }
      const userId = req.user.id;
      const encryptedToken = encryptToken(token.trim());
      await db.update(users).set({
        githubToken: encryptedToken,
        githubUsername: result.user.login,
        updatedAt: new Date(),
      }).where(eq(users.id, userId));
      res.json({ login: result.user.login, avatar_url: result.user.avatar_url, name: result.user.name });
    } catch (err) {
      console.error("GitHub connect error:", err);
      res.status(500).json({ message: "Failed to connect GitHub account" });
    }
  });

  app.post("/api/github/disconnect", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await db.update(users).set({
        githubToken: null,
        githubUsername: null,
        updatedAt: new Date(),
      }).where(eq(users.id, userId));
      res.json({ success: true });
    } catch (err) {
      console.error("GitHub disconnect error:", err);
      res.status(500).json({ message: "Failed to disconnect GitHub" });
    }
  });

  app.get("/api/github/user", isAuthenticated, async (req: any, res) => {
    try {
      const token = await getUserGitHubToken(req);
      if (!token) return res.status(401).json({ message: "GitHub not connected" });
      const user = await getGitHubUser(token);
      res.json(user);
    } catch (err: any) {
      console.error("GitHub user error:", err);
      if (err?.status === 401) {
        return res.status(401).json({ message: "GitHub token expired or invalid. Please reconnect." });
      }
      res.status(500).json({ message: "Failed to fetch GitHub user" });
    }
  });

  app.get("/api/github/repos", isAuthenticated, async (req: any, res) => {
    try {
      const token = await getUserGitHubToken(req);
      if (!token) return res.status(401).json({ message: "GitHub not connected" });
      const repos = await listUserRepos(token);
      res.json(repos);
    } catch (err: any) {
      console.error("GitHub repos error:", err);
      if (err?.status === 401) {
        return res.status(401).json({ message: "GitHub token expired or invalid. Please reconnect." });
      }
      res.status(500).json({ message: "Failed to list repositories" });
    }
  });

  app.post("/api/github/repos", isAuthenticated, async (req: any, res) => {
    try {
      const token = await getUserGitHubToken(req);
      if (!token) return res.status(401).json({ message: "GitHub not connected" });
      const { name, description, isPrivate } = req.body;
      if (!name) return res.status(400).json({ message: "Repository name is required" });
      const repo = await createRepo(token, name, description || "", isPrivate || false);
      res.json(repo);
    } catch (err) {
      console.error("GitHub create repo error:", err);
      res.status(500).json({ message: "Failed to create repository" });
    }
  });

  app.post("/api/github/deploy/:projectId", isAuthenticated, async (req: any, res) => {
    try {
      const token = await getUserGitHubToken(req);
      if (!token) return res.status(401).json({ message: "GitHub not connected" });

      const project = await storage.getProject(parseInt(req.params.projectId));
      if (!project) return res.status(404).json({ message: "Project not found" });
      const userId = req.user.id;
      if (project.userId !== userId) return res.status(403).json({ message: "Forbidden" });
      if (!project.generatedHtml) return res.status(400).json({ message: "Project has no generated content" });

      const deploySchema = z.object({
        owner: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
        repo: z.string().min(1).max(100).regex(/^[a-zA-Z0-9._-]+$/),
      });
      const parsed = deploySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid owner or repo name" });

      const ghUser = await getGitHubUser(token);
      if (parsed.data.owner !== ghUser.login) {
        return res.status(403).json({ message: "You can only deploy to your own repositories" });
      }

      const result = await pushWebsiteToRepo(
        token,
        parsed.data.owner,
        parsed.data.repo,
        project.generatedHtml,
        project.generatedCss || "",
        project.name,
        project.seoTitle || undefined,
        project.seoDescription || undefined
      );
      res.json(result);
    } catch (err) {
      console.error("GitHub deploy error:", err);
      res.status(500).json({ message: "Failed to deploy to GitHub" });
    }
  });

  app.get("/api/projects/:id/export", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).json({ message: "Project not found" });
      const userId = req.user.id;
      if (project.userId !== userId) return res.status(403).json({ message: "Forbidden" });
      if (!project.generatedHtml) return res.status(400).json({ message: "Project has no generated content" });

      const exportType = req.query.type || "static";

      // Filename must be ASCII-only for HTTP headers — strip non-ASCII chars
      const safeFilename = (project.name.replace(/[^a-zA-Z0-9\-_]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "") || "website") + "_website.zip";
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(project.name + "_website.zip")}`);

      const archive = archiver("zip", { zlib: { level: 6 } });

      // Handle archiver errors before piping
      archive.on("error", (err) => {
        console.error("Archive error:", err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Failed to create archive" });
        }
      });

      archive.pipe(res);

      // Build clean export HTML using buildPreviewHtml for consistent output
      const fullHtml = buildPreviewHtml(project);

      archive.append(fullHtml, { name: "website/index.html" });
      archive.append(project.generatedCss || "", { name: "website/css/style.css" });

      archive.append("", { name: "website/assets/images/.gitkeep" });
      archive.append("", { name: "website/assets/js/.gitkeep" });
      archive.append("", { name: "website/assets/fonts/.gitkeep" });

      const readme = `========================================
  ${project.name} - Website Export
  Generated by ArabyWeb.net
========================================

ENGLISH INSTRUCTIONS
--------------------
1. Download the website ZIP file.
2. Extract the files.
3. Log in to your hosting control panel (e.g., Hostinger, cPanel).
4. Open File Manager.
5. Upload all files from the "website" folder into the public_html folder.
6. Make sure index.html is in the root directory.
7. Open your domain in a browser and the website will work.

For Netlify/Vercel:
1. Go to netlify.com or vercel.com
2. Drag and drop the "website" folder
3. Your site will be live instantly

========================================

تعليمات باللغة العربية
--------------------
1. قم بتحميل ملف الموقع المضغوط.
2. فك الضغط عن الملف.
3. ادخل إلى لوحة تحكم الاستضافة (مثل Hostinger أو cPanel).
4. افتح File Manager.
5. ارفع جميع الملفات من مجلد "website" إلى مجلد public_html.
6. تأكد أن ملف index.html موجود في المجلد الرئيسي.
7. افتح الدومين في المتصفح وسيعمل الموقع.

للنشر على Netlify أو Vercel:
1. اذهب إلى netlify.com أو vercel.com
2. اسحب وأفلت مجلد "website"
3. سيتم نشر موقعك فوراً

========================================
`;

      archive.append(readme, { name: "README.txt" });

      if (exportType === "full") {
        const packageJson = JSON.stringify({
          name: project.name.toLowerCase().replace(/\s+/g, "-"),
          version: "1.0.0",
          scripts: { dev: "npx serve website", build: "echo 'Static site - no build needed'" },
          description: project.seoDescription || project.name,
        }, null, 2);
        archive.append(packageJson, { name: "package.json" });
      }

      await archive.finalize();
    } catch (err) {
      console.error("Export error:", err);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to export project" });
      }
    }
  });

  // ─── Chatbot Routes ─────────────────────────────────────────────────────────

  // Main chat endpoint (public — for landing page widget)
  app.post("/api/chatbot/message", async (req: any, res) => {
    try {
      const { message, sessionId, conversationId, history, pageLang } = req.body;
      if (!message || !sessionId) return res.status(400).json({ message: "message and sessionId required" });

      const clientIp = (req.headers["x-forwarded-for"] as string || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
      if (!checkChatbotRateLimit(clientIp)) {
        return res.status(429).json({
          reply: pageLang === "en"
            ? "Too many messages. Please wait a while before sending more."
            : "لقد أرسلت رسائل كثيرة. يرجى الانتظار قليلاً.",
          conversationId: conversationId || 0,
          source: "rate_limit",
        });
      }

      const result = await processChat({ message, sessionId, conversationId, history, pageLang });
      res.json(result);
    } catch (err: any) {
      console.error("Chatbot error:", err?.message, err?.status, err?.code);
      const { pageLang } = req.body;
      res.json({
        reply: pageLang === "en"
          ? "Sorry, a temporary error occurred. Please try again in a moment."
          : "عذراً، حدث خطأ مؤقت. يرجى المحاولة مرة أخرى بعد لحظة.",
        conversationId: 0,
        source: "error",
      });
    }
  });

  // Save lead
  app.post("/api/chatbot/lead", async (req, res) => {
    try {
      const { name, email, businessType, sessionId } = req.body;
      const lead = await storage.createLead({ name, email, businessType, sessionId, source: "chatbot" });
      res.json(lead);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Get conversation history
  app.get("/api/chatbot/conversation/:id", async (req, res) => {
    try {
      const messages = await getConversationHistory(parseInt(req.params.id));
      res.json(messages);
    } catch {
      res.json([]);
    }
  });

  // ─── Admin Chatbot Routes ────────────────────────────────────────────────────
  app.get("/api/admin/chatbot/stats", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const stats = await getChatbotStats();
      const cacheStats = getCacheStats();
      res.json({ ...stats, cacheStats });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/chatbot/questions", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const questions = await storage.getVisitorQuestions(limit);
      res.json(questions);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/admin/chatbot/questions/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      await storage.deleteVisitorQuestion(parseInt(req.params.id));
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/chatbot/knowledge-base", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const entries = await storage.getKnowledgeBase();
      res.json(entries);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/chatbot/knowledge-base", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const entry = await storage.createKnowledgeEntry(req.body);
      res.json(entry);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/admin/chatbot/knowledge-base/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const entry = await storage.updateKnowledgeEntry(parseInt(req.params.id), req.body);
      res.json(entry);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/admin/chatbot/knowledge-base/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      await storage.deleteKnowledgeEntry(parseInt(req.params.id));
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/chatbot/auto-learned", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const items = await storage.getAutoLearnedKnowledge();
      res.json(items);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/chatbot/auto-learned/:id/approve", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      await storage.approveAutoLearned(parseInt(req.params.id));
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/admin/chatbot/auto-learned/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      await storage.deleteAutoLearned(parseInt(req.params.id));
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/chatbot/leads", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/chatbot/leads/export.csv", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const leads = await storage.getLeads();
      const header = "ID,Name,Email,Business Type,Session,Source,Created At\n";
      const rows = leads.map((l: any) =>
        [l.id, `"${(l.name || "").replace(/"/g, '""')}"`, `"${(l.email || "").replace(/"/g, '""')}"`, `"${(l.businessType || "").replace(/"/g, '""')}"`, l.sessionId || "", l.source || "chatbot", l.createdAt].join(",")
      ).join("\n");
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="leads-${new Date().toISOString().split("T")[0]}.csv"`);
      res.send("\uFEFF" + header + rows); // BOM for Excel Arabic support
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/chatbot/retrain", isAuthenticated, isAdmin, async (req: any, res) => {
    res.json({ ok: true, message: "Self-improvement cycle started" });
    runSelfImprovementCycle().catch(console.error);
  });

  // Run self-improvement every 6 hours
  setInterval(() => runSelfImprovementCycle().catch(console.error), 6 * 60 * 60 * 1000);

  // ─── Feedback API ───
  app.post("/api/feedback", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      const { type, message, page } = req.body;
      if (!message?.trim()) return res.status(400).json({ message: "Message required" });
      const userName = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : null;
      const fb = await storage.createFeedback({
        userId,
        userName: userName || user?.email || null,
        userEmail: user?.email || null,
        type: type || "bug",
        message: message.trim(),
        page: page || null,
      });
      // Send email notification to support team (non-blocking)
      sendFeedbackNotificationToTeam({
        id: fb.id,
        userName: fb.userName,
        userEmail: fb.userEmail,
        type: fb.type,
        message: fb.message,
        page: fb.page,
      }).catch(e => console.error("[Feedback] Email notification failed:", e?.message));
      res.json(fb);
    } catch (e) {
      console.error("Feedback error:", e);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  app.get("/api/admin/feedback", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const fb = await storage.getFeedback();
      res.json(fb);
    } catch (e) {
      res.status(500).json({ message: "Failed to load feedback" });
    }
  });

  app.get("/api/admin/feedback/count", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const count = await storage.getNewFeedbackCount();
      res.json({ count });
    } catch (e) {
      res.status(500).json({ count: 0 });
    }
  });

  app.patch("/api/admin/feedback/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, adminNote } = req.body;
      await storage.updateFeedbackStatus(id, status, adminNote);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ message: "Failed to update feedback" });
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Domain & Hosting Store (ResellerClub)
  // ══════════════════════════════════════════════════════════════════════════

  // Check domain availability
  app.post("/api/domains/check", isAuthenticated, async (req: any, res) => {
    try {
      const { name, tlds } = req.body;
      if (!name) return res.status(400).json({ message: "Domain name required" });
      const validTlds = Array.isArray(tlds) && tlds.length > 0
        ? tlds.filter((t: string) => Object.keys(DEFAULT_TLD_PRICES).includes(t))
        : [".com", ".net", ".sa", ".store", ".online", ".site"];
      const results = await checkDomainAvailability(name.trim(), validTlds);
      res.json({ results, demo: !isRcConfigured() });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Get TLD prices & hosting plans (with admin overrides from DB)
  app.get("/api/domains/catalog", async (_req, res) => {
    try {
      // Merge DB overrides into defaults
      const tldPrices: Record<string, any> = { ...DEFAULT_TLD_PRICES };
      for (const tld of Object.keys(DEFAULT_TLD_PRICES)) {
        const key = `domain_price_${tld.replace(/\./g, "_")}`;
        const val = await storage.getSetting(key);
        if (val) {
          try { const p = JSON.parse(val); tldPrices[tld] = p; } catch {}
        }
      }
      // Hosting plan price overrides from DB
      const plans = await Promise.all(HOSTING_PLANS.map(async p => {
        const mVal = await storage.getSetting(`hosting_${p.id}_monthly`);
        const yVal = await storage.getSetting(`hosting_${p.id}_yearly`);
        return {
          ...p,
          priceMonthly: mVal ? parseInt(mVal) : p.priceMonthly,
          priceYearly: yVal ? parseInt(yVal) : p.priceYearly,
        };
      }));
      res.json({ tlds: tldPrices, hosting: plans, demo: !isRcConfigured() });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Admin: get domain/hosting pricing settings
  app.get("/api/admin/settings/domains", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const tldPrices: Record<string, any> = { ...DEFAULT_TLD_PRICES };
      for (const tld of Object.keys(DEFAULT_TLD_PRICES)) {
        const key = `domain_price_${tld.replace(/\./g, "_")}`;
        const val = await storage.getSetting(key);
        if (val) { try { tldPrices[tld] = JSON.parse(val); } catch {} }
      }
      const hostingPrices: Record<string, any> = {};
      for (const plan of HOSTING_PLANS) {
        const m = await storage.getSetting(`hosting_${plan.id}_monthly`);
        const y = await storage.getSetting(`hosting_${plan.id}_yearly`);
        hostingPrices[plan.id] = {
          monthly: m ? parseInt(m) : plan.priceMonthly,
          yearly: y ? parseInt(y) : plan.priceYearly,
        };
      }
      res.json({ tlds: tldPrices, hosting: hostingPrices });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Admin: save domain/hosting pricing
  app.put("/api/admin/settings/domains", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { tlds, hosting } = req.body;
      if (tlds) {
        for (const [tld, prices] of Object.entries(tlds)) {
          const key = `domain_price_${tld.replace(/\./g, "_")}`;
          await storage.setSetting(key, JSON.stringify(prices));
        }
      }
      if (hosting) {
        for (const [planId, prices] of Object.entries(hosting as any)) {
          const p = prices as any;
          if (p.monthly) await storage.setSetting(`hosting_${planId}_monthly`, String(p.monthly));
          if (p.yearly) await storage.setSetting(`hosting_${planId}_yearly`, String(p.yearly));
        }
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Link domain to project
  app.post("/api/domains/link-site", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getEffectiveUserId(req);
      const { domainOrderId, projectId } = req.body;
      if (!domainOrderId || !projectId) return res.status(400).json({ message: "domainOrderId and projectId required" });
      // Verify order belongs to user
      const orders = await storage.getDomainOrdersByUser(userId);
      const order = orders.find(o => o.id === domainOrderId);
      if (!order) return res.status(403).json({ message: "Order not found" });
      // Update domain order with linked project
      await storage.updateDomainOrder(domainOrderId, { linkedProjectId: projectId } as any);
      res.json({ success: true, domain: order.domain, projectId });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Create domain order
  app.post("/api/domains/order", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getEffectiveUserId(req);
      const { domain, tld, years = 1, type = "register" } = req.body;
      if (!domain || !tld) return res.status(400).json({ message: "domain and tld required" });
      const prices = DEFAULT_TLD_PRICES[tld] || { register: 49, renew: 49 };
      const priceAr = type === "renew" ? prices.renew * years : prices.register * years;
      const order = await storage.createDomainOrder({
        userId,
        domain,
        tld,
        years,
        type,
        status: "pending",
        priceAr,
        customerEmail: req.user?.email || null,
      });
      res.json({ order });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Create hosting order
  app.post("/api/hosting/order", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getEffectiveUserId(req);
      const { planId, billingCycle = "yearly", domainName } = req.body;
      const plan = HOSTING_PLANS.find(p => p.id === planId);
      if (!plan) return res.status(400).json({ message: "Invalid plan" });
      const priceAr = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
      const order = await storage.createHostingOrder({
        userId,
        planId,
        billingCycle,
        status: "pending",
        priceAr,
        domainName: domainName || null,
        customerEmail: req.user?.email || null,
      });
      res.json({ order });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // My domain orders
  app.get("/api/domains/my-orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getEffectiveUserId(req);
      const [domOrders, hostOrders] = await Promise.all([
        storage.getDomainOrdersByUser(userId),
        storage.getHostingOrdersByUser(userId),
      ]);
      res.json({ domains: domOrders, hosting: hostOrders });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Admin: all orders
  app.get("/api/admin/domain-orders", isAuthenticated, isAdmin, async (_req, res) => {
    try {
      const [domOrders, hostOrders] = await Promise.all([
        storage.getAllDomainOrders(),
        storage.getAllHostingOrders(),
      ]);
      res.json({ domains: domOrders, hosting: hostOrders });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Admin: update order status
  app.patch("/api/admin/domain-orders/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { type } = req.query; // type=domain|hosting
      const id = parseInt(req.params.id);
      if (type === "hosting") {
        await storage.updateHostingOrder(id, req.body);
      } else {
        await storage.updateDomainOrder(id, req.body);
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ── AI Builder Module (additive, does not modify existing routes) ──────────
  registerAiBuilderRoutes(app, isAuthenticated);

  return httpServer;
}
