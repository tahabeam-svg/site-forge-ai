import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { generateWebsite, editWebsiteWithAI, generateSocialContent } from "./ai";
import { validateToken, getGitHubUser, listUserRepos, createRepo, pushWebsiteToRepo } from "./github";
import { createPaymobOrder, getPaymentKey, getIframeUrl, verifyHmac, isPaymobConfigured, PLAN_PRICES } from "./paymob";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import archiver from "archiver";
import crypto from "crypto";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const ENCRYPTION_KEY = crypto.createHash("sha256").update(process.env.SESSION_SECRET || "arabyweb-fallback-key").digest();
const IV_LENGTH = 16;

function encryptToken(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decryptToken(text: string): string {
  const [ivHex, encrypted] = text.split(":");
  if (!ivHex || !encrypted) throw new Error("Invalid encrypted token format");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

async function isAdmin(req: any, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });
    next();
  } catch {
    res.status(500).json({ message: "Authorization error" });
  }
}

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
      cb(null, name);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".svg", ".webp", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.use("/uploads", isAuthenticated, (req: any, res, next) => {
    const filePath = path.join(uploadDir, path.basename(req.path));
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  app.post("/api/upload", isAuthenticated, upload.array("files", 10), (req: any, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    const urls = (req.files as Express.Multer.File[]).map(f => `/uploads/${f.filename}`);
    res.json({ urls });
  });

  app.get("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
      if (project.userId !== userId) return res.status(403).json({ message: "Forbidden" });
      res.json(project);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  const createProjectSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    templateId: z.number().optional(),
  });

  const editCommandSchema = z.object({
    command: z.string().min(1).max(2000),
    language: z.string().optional(),
  });

  app.post("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const parsed = createProjectSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
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
    } catch (err) {
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.post("/api/projects/:id/generate", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).json({ message: "Project not found" });
      const userId = req.user.id;
      if (project.userId !== userId) return res.status(403).json({ message: "Forbidden" });

      const language = req.body.language || "ar";
      const description = req.body.description || project.description || project.name;

      await storage.updateProject(project.id, { status: "generating" });

      await storage.addChatMessage({ projectId: project.id, role: "user", content: description });

      const generated = await generateWebsite(description, language);

      await storage.addChatMessage({
        projectId: project.id,
        role: "assistant",
        content: language === "ar" ? "تم إنشاء الموقع بنجاح ✨" : "Website generated successfully ✨",
      });

      const updated = await storage.updateProject(project.id, {
        generatedHtml: generated.html,
        generatedCss: generated.css,
        seoTitle: generated.seoTitle,
        seoDescription: generated.seoDescription,
        colorPalette: generated.colorPalette,
        sections: generated.sections,
        status: "generated",
      });

      res.json(updated);
    } catch (err) {
      console.error("Generation error:", err);
      const project = await storage.getProject(parseInt(req.params.id));
      if (project) await storage.updateProject(project.id, { status: "error" });
      res.status(500).json({ message: "Failed to generate website" });
    }
  });

  app.post("/api/projects/:id/edit", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).json({ message: "Project not found" });
      const userId = req.user.id;
      if (project.userId !== userId) return res.status(403).json({ message: "Forbidden" });

      const parsed = editCommandSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Edit command is required" });
      const { command, language } = parsed.data;

      await storage.addChatMessage({ projectId: project.id, role: "user", content: command });

      const result = await editWebsiteWithAI(
        project.generatedHtml || "",
        project.generatedCss || "",
        command,
        language || "ar"
      );

      await storage.addChatMessage({
        projectId: project.id,
        role: "assistant",
        content: language === "ar" ? "تم تطبيق التعديلات ✅" : "Changes applied ✅",
      });

      const updated = await storage.updateProject(project.id, {
        generatedHtml: result.html,
        generatedCss: result.css,
      });

      res.json(updated);
    } catch (err) {
      console.error("Edit error:", err);
      res.status(500).json({ message: "Failed to edit website" });
    }
  });

  app.get("/api/projects/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).json({ message: "Project not found" });
      const userId = req.user.id;
      if (project.userId !== userId) return res.status(403).json({ message: "Forbidden" });
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
      const userId = req.user.id;
      if (project.userId !== userId) return res.status(403).json({ message: "Forbidden" });
      const parsed = updateProjectSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
      const updated = await storage.updateProject(project.id, parsed.data);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).json({ message: "Project not found" });
      const userId = req.user.id;
      if (project.userId !== userId) return res.status(403).json({ message: "Forbidden" });
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
      const userId = req.user.id;
      if (project.userId !== userId) return res.status(403).json({ message: "Forbidden" });
      const updated = await storage.updateProject(project.id, { status: "published" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to publish project" });
    }
  });

  app.get("/api/templates", async (_req, res) => {
    try {
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

  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
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

  app.patch("/api/admin/users/:id/suspend", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) return res.status(404).json({ message: "User not found" });
      await db.update(users).set({ updatedAt: new Date() }).where(eq(users.id, userId));
      res.json({ message: "User suspended", userId });
    } catch (err) {
      res.status(500).json({ message: "Failed to suspend user" });
    }
  });

  const socialContentSchema = z.object({
    topic: z.string().min(1).max(1000),
    platform: z.enum(["instagram", "facebook", "linkedin", "twitter", "tiktok", "youtube"]),
    language: z.string().optional(),
    tone: z.string().optional(),
  });

  app.post("/api/marketing/generate", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = socialContentSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
      const { topic, platform, language, tone } = parsed.data;
      const content = await generateSocialContent(topic, platform, language || "ar", tone || "professional");
      res.json(content);
    } catch (err) {
      console.error("Marketing generation error:", err);
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  app.get("/api/payments/config", isAuthenticated, async (req: any, res) => {
    try {
      const configured = await isPaymobConfigured();
      res.json({ configured });
    } catch (err) {
      res.status(500).json({ message: "Failed to check payment config" });
    }
  });

  app.get("/api/subscription", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      const sub = await storage.getSubscriptionByUser(userId);
      res.json({
        plan: user?.plan || "free",
        status: sub?.status || "active",
        credits: user?.credits ?? 5,
        endDate: sub?.endDate || null,
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.get("/api/credits", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      res.json({ credits: user?.credits ?? 5, plan: user?.plan || "free" });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch credits" });
    }
  });

  const initiatePaymentSchema = z.object({
    plan: z.enum(["pro", "business"]),
  });

  app.post("/api/payments/initiate", isAuthenticated, async (req: any, res) => {
    try {
      const configured = await isPaymobConfigured();
      if (!configured) return res.status(400).json({ message: "Payment gateway not configured" });

      const parsed = initiatePaymentSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid plan" });

      const { plan } = parsed.data;
      const amountCents = PLAN_PRICES[plan];
      if (!amountCents) return res.status(400).json({ message: "Invalid plan" });

      const userId = req.user.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) return res.status(404).json({ message: "User not found" });

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
      });

      const iframeUrl = await getIframeUrl(paymentToken);
      res.json({ iframeUrl, orderId, subscriptionId: sub.id });
    } catch (err: any) {
      console.error("Payment initiation error:", err);
      res.status(500).json({ message: err.message || "Failed to initiate payment" });
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

      const subs = await storage.getSubscriptions();
      const sub = subs.find((s) => s.paymobOrderId === orderId);
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
        const planCredits: Record<string, number> = { pro: 50, business: 9999 };
        const newCredits = planCredits[sub.plan] || 5;
        await db.update(users).set({ plan: sub.plan, credits: newCredits, updatedAt: new Date() }).where(eq(users.id, sub.userId));
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
        result[key] = s.value.replace(/./g, (c, i) => (i < 4 ? c : "*"));
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

  app.get("/api/admin/subscriptions", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const subs = await storage.getSubscriptions();
      res.json(subs);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch subscriptions" });
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

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${project.name.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_")}_website.zip"`);

      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.pipe(res);

      const isFullDoc = project.generatedHtml!.trimStart().startsWith('<!DOCTYPE');
      const fullHtml = isFullDoc ? project.generatedHtml! : `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.seoTitle || project.name}</title>
  <meta name="description" content="${project.seoDescription || ""}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Tajawal:wght@400;500;700&family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
${project.generatedHtml}
</body>
</html>`;

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

  return httpServer;
}
