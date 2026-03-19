/**
 * website-builder.ts
 * Two-stage website generation:
 *   Stage 1 → AI generates structured content JSON (fast, focused)
 *   Stage 2 → TypeScript builds premium HTML from that spec (guaranteed correct layout)
 *
 * Why this architecture:
 *   - CSS Grid / layout: TypeScript handles it → always correct
 *   - Images: injected at TypeScript level → no hallucinations
 *   - Nav duplication: impossible by construction
 *   - AI's job: creative text only → better output, smaller prompt
 */

import OpenAI from "openai";

function getOpenAI() {
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  return new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });
}

// ─── Content Spec Types ──────────────────────────────────────────────────────

export interface WebsiteContentSpec {
  businessName: string;
  tagline: string;
  subtitle: string;
  ctaText: string;
  ctaSecondary: string;
  navCtaText: string;
  navLinks: Array<{ text: string; href: string }>;
  aboutTitle: string;
  aboutParagraph1: string;
  aboutParagraph2: string;
  aboutFeatures: string[];
  services: Array<{ title: string; description: string; icon: string }>;
  stats: Array<{ number: string; suffix: string; label: string }>;
  testimonials: Array<{ name: string; text: string; rating: number }>;
  ctaBandTitle: string;
  ctaBandSub: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  whatsapp: string;
  faqItems: Array<{ question: string; answer: string }>;
  footerTagline: string;
  seoTitle: string;
  seoDescription: string;
  primaryColor: string;
  accentColor: string;
}

export interface WebsiteImages {
  hero: string;
  gallery: string[];
  about?: string;
}

// ─── Stage 1: AI Content Generation ─────────────────────────────────────────

export async function generateContentSpec(
  description: string,
  options: {
    primaryColor?: string;
    accentColor?: string;
    designStyle?: string;
    whatsapp?: string;
  } = {}
): Promise<WebsiteContentSpec> {
  const openai = getOpenAI();
  const isArabic = /[\u0600-\u06FF]/.test(description);
  const lang = isArabic ? "Arabic" : "English";

  const systemPrompt = `You are a professional Arabic website copywriter and business consultant. You generate website content in ${lang} as a structured JSON object. Output ONLY valid JSON — no explanations, no markdown, no code blocks.`;

  const userPrompt = `Generate professional website content for this business:

"${description}"

${options.primaryColor ? `Brand colors: Primary ${options.primaryColor}, Accent ${options.accentColor}` : ""}
${options.whatsapp ? `WhatsApp: ${options.whatsapp}` : ""}

Return a JSON object matching this EXACT structure. All text fields must be in ${lang === "Arabic" ? "Arabic" : "English"}:

{
  "businessName": "Specific business name (invent a creative Arabic name if not given)",
  "tagline": "Powerful, emotion-driven hero headline (max 70 chars) — NOT generic",
  "subtitle": "Hero subtitle — 1 sentence describing what they offer and their edge (max 120 chars)",
  "ctaText": "Primary CTA button text relevant to this business (e.g. احجز موعدك / اطلب الآن)",
  "ctaSecondary": "Secondary CTA text (e.g. تعرف علينا / اكتشف المزيد)",
  "navCtaText": "Nav CTA button text (short, action-oriented, specific to this business)",
  "navLinks": [
    { "text": "من نحن", "href": "#about" },
    { "text": "خدماتنا", "href": "#services" },
    { "text": "أعمالنا", "href": "#gallery" },
    { "text": "آراء العملاء", "href": "#testimonials" }
  ],
  "aboutTitle": "Section heading for About (e.g. قصتنا / رحلتنا / من نحن)",
  "aboutParagraph1": "First about paragraph — brand story, founding, mission (2-3 sentences, SPECIFIC to this business)",
  "aboutParagraph2": "Second about paragraph — values, approach, what makes them different (2-3 sentences)",
  "aboutFeatures": ["Feature 1 (short phrase)", "Feature 2", "Feature 3", "Feature 4"],
  "services": [
    { "title": "Service name SPECIFIC to this business", "description": "2-sentence description", "icon": "fa-solid fa-stethoscope" },
    { "title": "...", "description": "...", "icon": "fa-solid fa-heart-pulse" },
    { "title": "...", "description": "...", "icon": "fa-solid fa-microscope" },
    { "title": "...", "description": "...", "icon": "fa-solid fa-pills" },
    { "title": "...", "description": "...", "icon": "fa-solid fa-user-doctor" },
    { "title": "...", "description": "...", "icon": "fa-solid fa-hospital" }
  ],
  "stats": [
    { "number": "15", "suffix": "+", "label": "سنة خبرة" },
    { "number": "3500", "suffix": "+", "label": "عميل سعيد" },
    { "number": "98", "suffix": "%", "label": "رضا العملاء" },
    { "number": "24", "suffix": "/7", "label": "خدمة متواصلة" }
  ],
  "testimonials": [
    { "name": "عبدالرحمن الغامدي", "text": "Specific testimonial mentioning the actual service used and a real outcome — NOT generic praise", "rating": 5 },
    { "name": "ريم السهلي", "text": "Specific testimonial from a female client", "rating": 5 },
    { "name": "خالد الدوسري", "text": "Specific testimonial with a concrete detail or result", "rating": 5 }
  ],
  "ctaBandTitle": "Persuasive call-to-action headline tailored to this specific business",
  "ctaBandSub": "Supporting sentence under the CTA band headline",
  "phone": "+966 5X XXX XXXX",
  "email": "info@businessname.sa",
  "address": "City, Saudi Arabia",
  "workingHours": "السبت–الخميس: 9ص – 10م",
  "whatsapp": "${options.whatsapp || "+966500000000"}",
  "faqItems": [
    { "question": "SPECIFIC question customers ask about THIS business", "answer": "Helpful, detailed answer" },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." }
  ],
  "footerTagline": "Short brand tagline for footer (max 60 chars)",
  "seoTitle": "${lang === "Arabic" ? "Arabic" : "English"} SEO title 50-60 chars",
  "seoDescription": "${lang === "Arabic" ? "Arabic" : "English"} meta description 150-160 chars",
  "primaryColor": "${options.primaryColor || "#0f4c81"}",
  "accentColor": "${options.accentColor || "#06b6d4"}"
}

IMPORTANT RULES:
- Services MUST be specific to this exact business type — NEVER generic "خدمة 1"
- Stats MUST be realistic and business-appropriate (small cafe won't have 50,000 clients)
- Testimonials MUST mention specific details about the business
- Choose Font Awesome 6 icons relevant to each service (fa-solid fa-...)
- Phone format: +966 5X XXX XXXX (Saudi format)`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_completion_tokens: 3000,
  });

  const raw = response.choices[0]?.message?.content || "{}";
  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");
  const jsonStr = jsonStart !== -1 && jsonEnd !== -1 ? raw.slice(jsonStart, jsonEnd + 1) : raw;

  try {
    return JSON.parse(jsonStr) as WebsiteContentSpec;
  } catch {
    throw new Error("Failed to parse content spec from AI response");
  }
}

// ─── Stage 2: TypeScript HTML Builder ────────────────────────────────────────
// Layout is 100% guaranteed correct here — AI has NO control over CSS/HTML structure

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function darken(hex: string, amount = 40): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function buildWebsiteHTML(
  spec: WebsiteContentSpec,
  images: WebsiteImages,
  options: { isArabic?: boolean } = {}
): string {
  const isArabic = options.isArabic !== false;
  const dir = isArabic ? 'rtl' : 'ltr';
  const lang = isArabic ? 'ar' : 'en';
  const fontImport = isArabic
    ? "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Tajawal:wght@400;500;700&display=swap"
    : "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600&display=swap";
  const bodyFont = isArabic ? "'Tajawal', sans-serif" : "'Inter', sans-serif";
  const headFont = isArabic ? "'Cairo', sans-serif" : "'Montserrat', sans-serif";

  const pc = spec.primaryColor || "#0f4c81";
  const ac = spec.accentColor || "#06b6d4";
  const pcRgb = hexToRgb(pc);
  const acRgb = hexToRgb(ac);
  const darkPc = darken(pc, 30);
  const heroImg = images.hero;
  const galleryImgs = images.gallery.slice(0, 6);
  while (galleryImgs.length < 6) galleryImgs.push(images.gallery[0] || heroImg);

  const aboutImg = images.about || images.gallery[0] || heroImg;
  const whatsappNum = spec.whatsapp?.replace(/[^0-9]/g, "") || "";
  const year = new Date().getFullYear();

  const services = (spec.services || []).slice(0, 6);
  const stats = (spec.stats || []).slice(0, 4);
  const testimonials = (spec.testimonials || []).slice(0, 3);
  const faqItems = (spec.faqItems || []).slice(0, 5);

  const servicesHTML = services.map((s, i) => `
        <div class="service-card aw-reveal" style="animation-delay:${i * 0.1}s">
          <div class="service-icon">
            <i class="${s.icon || 'fa-solid fa-star'}"></i>
          </div>
          <h3 class="service-title">${s.title}</h3>
          <p class="service-desc">${s.description}</p>
        </div>`).join("");

  const statsHTML = stats.map(s => `
        <div class="stat-item aw-reveal">
          <div class="stat-number"><span class="aw-counter" data-target="${s.number}" data-suffix="${s.suffix || ''}">${s.number}</span>${s.suffix || ''}</div>
          <div class="stat-label">${s.label}</div>
        </div>`).join("");

  const galleryHTML = galleryImgs.map((url, i) => `
        <div class="gallery-item aw-reveal" onclick="openLightbox('${url}', ${i})">
          <img src="${url}" alt="صورة ${i + 1}" loading="lazy">
          <div class="gallery-overlay">
            <i class="fa-solid fa-expand"></i>
          </div>
        </div>`).join("");

  const testimonialsHTML = testimonials.map((t, i) => `
        <div class="testimonial-card aw-reveal" style="animation-delay:${i * 0.15}s">
          <div class="testimonial-stars">
            ${'<i class="fa-solid fa-star"></i>'.repeat(t.rating || 5)}
          </div>
          <p class="testimonial-text">"${t.text}"</p>
          <div class="testimonial-author">
            <div class="author-avatar">${(t.name || '?')[0]}</div>
            <span class="author-name">${t.name}</span>
          </div>
        </div>`).join("");

  const faqHTML = faqItems.map((item, i) => `
        <div class="faq-item aw-reveal">
          <div class="faq-q" onclick="toggleFaq(this)">
            <span>${item.question}</span>
            <span class="faq-icon">+</span>
          </div>
          <div class="faq-answer">
            <p>${item.answer}</p>
          </div>
        </div>`).join("");

  const navLinksHTML = (spec.navLinks || []).map(l => `
            <a href="${l.href}" class="nav-link" onclick="closeMenu()">${l.text}</a>`).join("");

  const mobileNavLinksHTML = (spec.navLinks || []).map(l => `
          <a href="${l.href}" class="mobile-nav-link" onclick="closeMenu()">${l.text}</a>`).join("");

  const featuresHTML = (spec.aboutFeatures || []).map(f => `
              <div class="feature-item">
                <div class="feature-check">
                  <i class="fa-solid fa-check"></i>
                </div>
                <span>${f}</span>
              </div>`).join("");

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${spec.seoTitle || spec.businessName}</title>
  <meta name="description" content="${spec.seoDescription || spec.subtitle}">
  <meta property="og:title" content="${spec.seoTitle || spec.businessName}">
  <meta property="og:description" content="${spec.seoDescription || spec.subtitle}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${fontImport}" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <style>
    @import url('${fontImport}');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; overflow-x: hidden; }
    body {
      font-family: ${bodyFont};
      background: #fff;
      color: #1a1a2e;
      overflow-x: hidden;
      direction: ${dir};
    }
    h1, h2, h3, h4 { font-family: ${headFont}; }

    :root {
      --primary: ${pc};
      --primary-rgb: ${pcRgb};
      --accent: ${ac};
      --accent-rgb: ${acRgb};
      --dark-primary: ${darkPc};
    }

    img { max-width: 100%; display: block; }
    a { text-decoration: none; color: inherit; }

    /* ── Section helpers ── */
    .section-header { text-align: center; margin-bottom: 3rem; }
    .section-label {
      display: inline-block;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--accent);
      background: rgba(var(--accent-rgb), 0.1);
      padding: 4px 16px;
      border-radius: 20px;
      margin-bottom: 1rem;
    }
    .section-title {
      font-size: clamp(1.8rem, 4vw, 2.8rem);
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }
    .section-title.light { color: #fff; }
    .section-divider {
      width: 60px; height: 4px;
      background: linear-gradient(90deg, var(--primary), var(--accent));
      border-radius: 2px;
      margin: 1rem auto 0;
    }
    .section-divider.right { margin-${isArabic ? 'left' : 'right'}: auto; margin-${isArabic ? 'right' : 'left'}: 0; }

    /* ── Reveal animation ── */
    .aw-reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1); }
    .aw-visible { opacity: 1; transform: none; }

    /* ── Buttons ── */
    .btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 14px 28px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: #fff;
      font-family: ${headFont};
      font-weight: 700;
      font-size: 1rem;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.35);
      text-decoration: none;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(var(--primary-rgb), 0.45); }
    .btn-primary:active { transform: translateY(1px); }

    .btn-outline {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 13px 28px;
      background: transparent;
      color: #fff;
      font-family: ${headFont};
      font-weight: 600;
      font-size: 1rem;
      border-radius: 12px;
      border: 2px solid rgba(255,255,255,0.5);
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      backdrop-filter: blur(8px);
    }
    .btn-outline:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.8); }

    /* ── NAVBAR ── */
    .navbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1000;
      padding: 0 5%;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(var(--primary-rgb), 0.1);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.1);
      transition: background 0.3s ease, box-shadow 0.3s ease;
    }
    .navbar.scrolled {
      background: rgba(${Math.max(0,parseInt(pc.slice(1,3),16)-20)}, ${Math.max(0,parseInt(pc.slice(3,5),16)-20)}, ${Math.max(0,parseInt(pc.slice(5,7),16)-20)}, 0.97);
      box-shadow: 0 4px 30px rgba(0,0,0,0.2);
    }
    .nav-brand {
      display: flex; align-items: center; gap: 10px;
      font-family: ${headFont};
      font-weight: 800;
      font-size: 1.15rem;
      color: #fff;
    }
    .nav-brand svg { flex-shrink: 0; }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 2rem;
    }
    .nav-link {
      color: rgba(255,255,255,0.85);
      font-weight: 500;
      font-size: 0.95rem;
      transition: color 0.2s;
      position: relative;
    }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -4px;
      ${isArabic ? 'right' : 'left'}: 0;
      width: 0; height: 2px;
      background: var(--accent);
      transition: width 0.3s ease;
    }
    .nav-link:hover { color: #fff; }
    .nav-link:hover::after { width: 100%; }

    .nav-cta {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 10px 22px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: #fff;
      font-family: ${headFont};
      font-weight: 700;
      font-size: 0.9rem;
      border-radius: 10px;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.4);
    }
    .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(var(--primary-rgb), 0.5); }

    .hamburger {
      display: none;
      background: none; border: none;
      color: #fff; cursor: pointer;
      padding: 8px;
      font-size: 1.4rem;
    }

    .mobile-menu {
      display: none;
      position: absolute;
      top: 72px; left: 0; right: 0;
      background: rgba(${Math.max(0,parseInt(pc.slice(1,3),16)-20)}, ${Math.max(0,parseInt(pc.slice(3,5),16)-20)}, ${Math.max(0,parseInt(pc.slice(5,7),16)-20)}, 0.98);
      backdrop-filter: blur(20px);
      padding: 1.5rem 5%;
      flex-direction: column;
      gap: 1rem;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    .mobile-menu.open { display: flex; }
    .mobile-nav-link {
      color: rgba(255,255,255,0.85);
      font-size: 1.05rem;
      font-weight: 500;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      transition: color 0.2s;
    }
    .mobile-nav-link:hover { color: #fff; }

    /* ── HERO ── */
    .hero {
      min-height: 100vh;
      position: relative;
      display: flex;
      align-items: center;
      background-image: url('${heroImg}');
      background-size: cover;
      background-position: center;
      background-attachment: scroll;
    }
    .hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(135deg,
        rgba(var(--primary-rgb), 0.88) 0%,
        rgba(${parseInt(pc.slice(1,3),16)}, ${parseInt(pc.slice(3,5),16)}, ${parseInt(pc.slice(5,7),16)}, 0.65) 60%,
        rgba(0,0,0,0.5) 100%);
      z-index: 1;
    }
    .hero-content {
      position: relative;
      z-index: 2;
      padding: 0 5%;
      max-width: 780px;
      ${isArabic ? '' : 'margin-left: auto; margin-right: auto;'}
    }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.25);
      color: rgba(255,255,255,0.95);
      padding: 6px 18px;
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      letter-spacing: 0.05em;
    }
    .hero-title {
      font-size: clamp(2.4rem, 6vw, 5rem);
      font-weight: 900;
      color: #fff;
      line-height: 1.1;
      letter-spacing: -0.025em;
      margin-bottom: 1.2rem;
    }
    .hero-title span {
      background: linear-gradient(135deg, #fff, rgba(var(--accent-rgb), 0.9));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-subtitle {
      font-size: clamp(1rem, 2.5vw, 1.2rem);
      color: rgba(255,255,255,0.8);
      line-height: 1.7;
      margin-bottom: 2.5rem;
      max-width: 560px;
    }
    .hero-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
    }
    .hero-scroll {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2;
      animation: bounce 2s infinite;
      color: rgba(255,255,255,0.6);
      font-size: 1.4rem;
    }

    /* ── STATS ── */
    .stats-section {
      background: linear-gradient(135deg, ${darkPc} 0%, var(--primary) 50%, ${darken(pc, 15)} 100%);
      padding: 4rem 5%;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .stat-item { text-align: center; }
    .stat-number {
      font-family: ${headFont};
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 900;
      background: linear-gradient(135deg, #fff, rgba(var(--accent-rgb), 0.9));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
      margin-bottom: 0.5rem;
    }
    .stat-label {
      color: rgba(255,255,255,0.75);
      font-size: 0.9rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    /* ── ABOUT ── */
    .about-section {
      padding: 6rem 5%;
      background: #fff;
    }
    .about-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
    }
    .about-image-wrapper {
      position: relative;
    }
    .about-image {
      width: 100%;
      height: 480px;
      object-fit: cover;
      border-radius: 20px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.15);
    }
    .about-image-badge {
      position: absolute;
      bottom: -20px;
      ${isArabic ? 'right' : 'left'}: 20px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: #fff;
      padding: 16px 24px;
      border-radius: 16px;
      font-family: ${headFont};
      font-weight: 800;
      font-size: 1.1rem;
      box-shadow: 0 8px 24px rgba(var(--primary-rgb), 0.4);
    }
    .about-content { padding-top: 1rem; }
    .about-text {
      color: #475569;
      line-height: 1.8;
      margin-bottom: 1.2rem;
      font-size: 1rem;
    }
    .features-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.8rem;
      margin-top: 1.8rem;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      color: #1e293b;
      font-size: 0.9rem;
    }
    .feature-check {
      width: 24px; height: 24px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      color: #fff;
      font-size: 0.7rem;
    }

    /* ── SERVICES ── */
    .services-section {
      padding: 6rem 5%;
      background: #f8fafc;
    }
    .services-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .service-card {
      background: #fff;
      border-radius: 20px;
      padding: 2rem;
      border: 1.5px solid transparent;
      background-clip: padding-box;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
      cursor: default;
      position: relative;
      overflow: hidden;
    }
    .service-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 20px;
      padding: 1.5px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .service-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
    .service-card:hover::before { opacity: 1; }
    .service-icon {
      width: 56px; height: 56px;
      background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.1), rgba(var(--accent-rgb), 0.1));
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem;
      color: var(--primary);
      margin-bottom: 1.2rem;
      transition: all 0.3s ease;
    }
    .service-card:hover .service-icon {
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: #fff;
      transform: rotate(5deg);
    }
    .service-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.6rem;
    }
    .service-desc {
      color: #64748b;
      font-size: 0.9rem;
      line-height: 1.65;
    }

    /* ── GALLERY ── */
    .gallery-section {
      padding: 6rem 5%;
      background: #fff;
    }
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .gallery-item {
      position: relative;
      overflow: hidden;
      border-radius: 16px;
      aspect-ratio: 4 / 3;
      cursor: pointer;
      background: #e2e8f0;
    }
    .gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.5s ease;
    }
    .gallery-item:hover img { transform: scale(1.08); }
    .gallery-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(var(--primary-rgb), 0.75) 0%, transparent 60%);
      display: flex; align-items: center; justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      font-size: 2rem;
      color: #fff;
    }
    .gallery-item:hover .gallery-overlay { opacity: 1; }

    /* ── CTA BAND ── */
    .cta-band {
      padding: 5rem 5%;
      background: linear-gradient(135deg, var(--primary) 0%, ${darken(pc, 20)} 50%, var(--accent) 100%);
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .cta-band::before {
      content: '';
      position: absolute;
      width: 600px; height: 600px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
      ${isArabic ? 'left' : 'right'}: -200px;
      top: -200px;
    }
    .cta-band-title {
      font-size: clamp(1.8rem, 4vw, 2.8rem);
      font-weight: 900;
      color: #fff;
      margin-bottom: 0.8rem;
      position: relative;
    }
    .cta-band-sub {
      color: rgba(255,255,255,0.8);
      font-size: 1.05rem;
      margin-bottom: 2rem;
      position: relative;
    }

    /* ── TESTIMONIALS ── */
    .testimonials-section {
      padding: 6rem 5%;
      background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
    }
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .testimonial-card {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 2rem;
      position: relative;
      overflow: hidden;
      transition: transform 0.3s ease, border-color 0.3s;
    }
    .testimonial-card:hover {
      transform: translateY(-6px);
      border-color: rgba(var(--accent-rgb), 0.3);
    }
    .testimonial-stars { color: #f59e0b; font-size: 0.85rem; margin-bottom: 1rem; letter-spacing: 2px; }
    .testimonial-text {
      color: rgba(255,255,255,0.8);
      font-size: 0.95rem;
      line-height: 1.75;
      margin-bottom: 1.5rem;
    }
    .testimonial-author { display: flex; align-items: center; gap: 12px; }
    .author-avatar {
      width: 44px; height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      display: flex; align-items: center; justify-content: center;
      font-family: ${headFont};
      font-weight: 700;
      font-size: 1.1rem;
      color: #fff;
      flex-shrink: 0;
    }
    .author-name { color: #fff; font-weight: 700; font-size: 0.95rem; }

    /* ── FAQ ── */
    .faq-section {
      padding: 6rem 5%;
      background: #f8fafc;
    }
    .faq-list {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .faq-item {
      background: #fff;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
    }
    .faq-q {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.2rem 1.5rem;
      cursor: pointer;
      font-weight: 600;
      color: #0f172a;
      font-size: 0.95rem;
      transition: color 0.2s;
      gap: 1rem;
    }
    .faq-q:hover { color: var(--primary); }
    .faq-icon {
      font-size: 1.4rem;
      color: var(--primary);
      transition: transform 0.3s;
      flex-shrink: 0;
      line-height: 1;
    }
    .faq-answer {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.4s ease;
    }
    .faq-answer p {
      padding: 0 1.5rem 1.2rem;
      color: #475569;
      line-height: 1.75;
      font-size: 0.9rem;
    }

    /* ── CONTACT ── */
    .contact-section {
      padding: 6rem 5%;
      background: linear-gradient(180deg, #0f172a 0%, ${darkPc} 100%);
    }
    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .contact-info-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.2rem;
      background: rgba(255,255,255,0.05);
      border-radius: 14px;
      margin-bottom: 1rem;
      border: 1px solid rgba(255,255,255,0.06);
      transition: background 0.2s;
    }
    .contact-info-item:hover { background: rgba(255,255,255,0.08); }
    .contact-icon {
      width: 46px; height: 46px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      display: flex; align-items: center; justify-content: center;
      color: #fff;
      font-size: 1rem;
      flex-shrink: 0;
    }
    .contact-info-text h4 { color: rgba(255,255,255,0.6); font-size: 0.75rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2px; }
    .contact-info-text p, .contact-info-text a { color: #fff; font-size: 0.95rem; font-weight: 500; }
    .whatsapp-btn {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 24px;
      background: #25D366;
      color: #fff;
      font-weight: 700;
      font-size: 1rem;
      border-radius: 12px;
      transition: all 0.2s;
      margin-top: 1.5rem;
      box-shadow: 0 6px 20px rgba(37,211,102,0.3);
    }
    .whatsapp-btn:hover { background: #20b858; transform: translateY(-2px); box-shadow: 0 10px 28px rgba(37,211,102,0.4); }
    .contact-form {
      background: #fff;
      border-radius: 20px;
      padding: 2.5rem;
    }
    .form-group { margin-bottom: 1.2rem; }
    .form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.4rem; }
    .form-group input, .form-group textarea {
      width: 100%;
      padding: 12px 16px;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-family: ${bodyFont};
      font-size: 0.95rem;
      color: #0f172a;
      background: #f8fafc;
      transition: border-color 0.2s, box-shadow 0.2s;
      direction: ${dir};
    }
    .form-group input:focus, .form-group textarea:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
      background: #fff;
    }
    .form-group textarea { height: 120px; resize: vertical; }
    .form-success { display: none; text-align: center; padding: 2rem; }
    .form-success i { font-size: 3rem; color: #22c55e; margin-bottom: 1rem; display: block; }

    /* ── FOOTER ── */
    .footer {
      background: #050814;
      padding: 4rem 5% 2rem;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr;
      gap: 3rem;
      max-width: 1200px;
      margin: 0 auto 3rem;
    }
    .footer-brand { }
    .footer-tagline { color: rgba(255,255,255,0.55); font-size: 0.9rem; margin-top: 0.8rem; line-height: 1.6; }
    .footer-social { display: flex; gap: 10px; margin-top: 1.5rem; }
    .social-link {
      width: 38px; height: 38px;
      border-radius: 10px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      display: flex; align-items: center; justify-content: center;
      color: rgba(255,255,255,0.6);
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .social-link:hover { background: var(--primary); border-color: var(--primary); color: #fff; }
    .footer-heading { color: #fff; font-weight: 700; font-size: 1rem; margin-bottom: 1.2rem; }
    .footer-links { display: flex; flex-direction: column; gap: 0.6rem; }
    .footer-link { color: rgba(255,255,255,0.55); font-size: 0.875rem; transition: color 0.2s; }
    .footer-link:hover { color: var(--accent); }
    .footer-contact-item { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.55); font-size: 0.875rem; margin-bottom: 0.6rem; }
    .footer-contact-item i { color: var(--accent); width: 16px; }
    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.06);
      padding-top: 1.5rem;
      text-align: center;
      color: rgba(255,255,255,0.3);
      font-size: 0.8rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* ── WhatsApp float ── */
    .whatsapp-float {
      position: fixed;
      ${isArabic ? 'left' : 'right'}: 1.5rem;
      bottom: 1.5rem;
      z-index: 999;
      width: 58px; height: 58px;
      background: #25D366;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: #fff;
      font-size: 1.6rem;
      box-shadow: 0 6px 20px rgba(37,211,102,0.5);
      animation: pulse 2.5s infinite;
      transition: transform 0.2s;
    }
    .whatsapp-float:hover { transform: scale(1.1); }

    /* ── Lightbox ── */
    #aw-lightbox {
      display: none;
      position: fixed; inset: 0;
      z-index: 10000;
      background: rgba(0,0,0,0.95);
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 1rem;
    }
    #aw-lightbox.open { display: flex; }
    #aw-lb-img { max-width: 90vw; max-height: 80vh; border-radius: 12px; object-fit: contain; }
    .lb-controls { display: flex; gap: 1rem; }
    .lb-btn {
      width: 48px; height: 48px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 50%;
      color: #fff;
      font-size: 1.1rem;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
    }
    .lb-btn:hover { background: rgba(255,255,255,0.2); }

    /* ── Animations ── */
    @keyframes bounce {
      0%, 100% { transform: translateX(-50%) translateY(0); }
      50% { transform: translateX(-50%) translateY(-10px); }
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 6px 20px rgba(37,211,102,0.5); }
      50% { box-shadow: 0 6px 30px rgba(37,211,102,0.8), 0 0 0 8px rgba(37,211,102,0.15); }
    }

    /* ── Responsive ── */
    @media (max-width: 1024px) {
      .about-grid { grid-template-columns: 1fr; }
      .about-image-wrapper { max-width: 500px; margin: 0 auto; }
      .services-grid { grid-template-columns: repeat(2, 1fr); }
      .testimonials-grid { grid-template-columns: repeat(2, 1fr); }
      .footer-grid { grid-template-columns: 1fr 1fr; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .nav-links, .nav-cta { display: none; }
      .hamburger { display: flex; }
      .gallery-grid { grid-template-columns: repeat(2, 1fr); }
      .services-grid { grid-template-columns: 1fr; }
      .testimonials-grid { grid-template-columns: 1fr; }
      .contact-grid { grid-template-columns: 1fr; }
      .footer-grid { grid-template-columns: 1fr; }
      .features-grid { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .hero-buttons { flex-direction: column; align-items: flex-start; }
    }
    @media (max-width: 480px) {
      .gallery-grid { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>

  <!-- NAVBAR -->
  <nav class="navbar" id="navbar">
    <a href="#" class="nav-brand">
      <svg id="aw-ai-logo" width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="38" height="38" rx="10" fill="url(#logoGrad)"/>
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop stop-color="${pc}"/>
            <stop offset="1" stop-color="${ac}"/>
          </linearGradient>
        </defs>
        <text x="19" y="26" text-anchor="middle" font-family="${headFont}" font-size="18" font-weight="800" fill="white">${(spec.businessName || 'A')[0]}</text>
      </svg>
      <span>${spec.businessName}</span>
    </a>

    <div class="nav-links">
      ${navLinksHTML}
    </div>

    <a href="#contact" class="nav-cta">${spec.navCtaText || 'تواصل معنا'}</a>

    <button class="hamburger" onclick="toggleMenu()" aria-label="القائمة">
      <i class="fa-solid fa-bars"></i>
    </button>

    <div class="mobile-menu" id="mobile-menu">
      ${mobileNavLinksHTML}
      <a href="#contact" class="nav-cta" style="width:fit-content" onclick="closeMenu()">${spec.navCtaText || 'تواصل معنا'}</a>
    </div>
  </nav>

  <!-- HERO -->
  <section class="hero" id="hero">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <div class="hero-badge aw-reveal">
        <i class="fa-solid fa-shield-halved"></i>
        ${spec.businessName}
      </div>
      <h1 class="hero-title aw-reveal">
        ${spec.tagline}
      </h1>
      <p class="hero-subtitle aw-reveal">${spec.subtitle}</p>
      <div class="hero-buttons aw-reveal">
        <a href="#contact" class="btn-primary">
          <i class="fa-solid fa-calendar-check"></i>
          ${spec.ctaText}
        </a>
        <a href="#about" class="btn-outline">
          ${spec.ctaSecondary}
          <i class="fa-solid fa-arrow-${isArabic ? 'left' : 'right'}"></i>
        </a>
      </div>
    </div>
    <div class="hero-scroll">
      <i class="fa-solid fa-chevron-down"></i>
    </div>
  </section>

  <!-- STATS -->
  <section class="stats-section">
    <div class="stats-grid">
      ${statsHTML}
    </div>
  </section>

  <!-- ABOUT -->
  <section class="about-section" id="about">
    <div class="about-grid">
      <div class="about-image-wrapper aw-reveal">
        <img src="${aboutImg}" alt="${spec.businessName}" class="about-image" loading="lazy">
        <div class="about-image-badge">
          <div style="font-size:0.75rem;opacity:0.85;margin-bottom:2px">${isArabic ? 'منذ' : 'Since'}</div>
          <div>${new Date().getFullYear() - 8}+</div>
        </div>
      </div>
      <div class="about-content aw-reveal">
        <div class="section-label">${isArabic ? 'من نحن' : 'About Us'}</div>
        <h2 class="section-title" style="text-align:${isArabic ? 'right' : 'left'};margin-bottom:1.5rem">${spec.aboutTitle}</h2>
        <div class="section-divider right"></div>
        <p class="about-text" style="margin-top:1.5rem">${spec.aboutParagraph1}</p>
        <p class="about-text">${spec.aboutParagraph2}</p>
        <div class="features-grid">
          ${featuresHTML}
        </div>
        <div style="margin-top:2rem">
          <a href="#contact" class="btn-primary">${spec.ctaText}</a>
        </div>
      </div>
    </div>
  </section>

  <!-- SERVICES -->
  <section class="services-section" id="services">
    <div class="section-header aw-reveal">
      <div class="section-label">${isArabic ? 'خدماتنا' : 'Our Services'}</div>
      <h2 class="section-title">${isArabic ? 'ما نقدمه لك' : 'What We Offer'}</h2>
      <div class="section-divider"></div>
    </div>
    <div class="services-grid">
      ${servicesHTML}
    </div>
  </section>

  <!-- GALLERY -->
  <section class="gallery-section" id="gallery">
    <div class="section-header aw-reveal">
      <div class="section-label">${isArabic ? 'معرضنا' : 'Our Gallery'}</div>
      <h2 class="section-title">${isArabic ? 'لقطات من عالمنا' : 'From Our World'}</h2>
      <div class="section-divider"></div>
    </div>
    <div class="gallery-grid">
      ${galleryHTML}
    </div>
  </section>

  <!-- CTA BAND -->
  <section class="cta-band">
    <div class="cta-band-title aw-reveal">${spec.ctaBandTitle}</div>
    <p class="cta-band-sub aw-reveal">${spec.ctaBandSub}</p>
    <div class="aw-reveal">
      <a href="https://wa.me/${whatsappNum}" target="_blank" class="btn-primary" style="margin:0 auto;display:inline-flex">
        <i class="fa-brands fa-whatsapp"></i>
        ${isArabic ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
      </a>
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section class="testimonials-section" id="testimonials">
    <div class="section-header aw-reveal">
      <div class="section-label" style="color:rgba(var(--accent-rgb),0.9)">${isArabic ? 'آراء العملاء' : 'Testimonials'}</div>
      <h2 class="section-title light">${isArabic ? 'ماذا يقول عملاؤنا' : 'What Our Clients Say'}</h2>
      <div class="section-divider"></div>
    </div>
    <div class="testimonials-grid">
      ${testimonialsHTML}
    </div>
  </section>

  <!-- FAQ -->
  <section class="faq-section" id="faq">
    <div class="section-header aw-reveal">
      <div class="section-label">${isArabic ? 'الأسئلة الشائعة' : 'FAQ'}</div>
      <h2 class="section-title">${isArabic ? 'أسئلة يسألها عملاؤنا' : 'Frequently Asked Questions'}</h2>
      <div class="section-divider"></div>
    </div>
    <div class="faq-list">
      ${faqHTML}
    </div>
  </section>

  <!-- CONTACT -->
  <section class="contact-section" id="contact">
    <div class="section-header aw-reveal">
      <div class="section-label" style="color:rgba(var(--accent-rgb),0.9)">${isArabic ? 'تواصل معنا' : 'Contact Us'}</div>
      <h2 class="section-title light">${isArabic ? 'نحن هنا لخدمتك' : 'We Are Here For You'}</h2>
      <div class="section-divider"></div>
    </div>
    <div class="contact-grid">
      <div class="aw-reveal">
        <div class="contact-info-item">
          <div class="contact-icon"><i class="fa-solid fa-phone"></i></div>
          <div class="contact-info-text">
            <h4>${isArabic ? 'هاتف' : 'Phone'}</h4>
            <a href="tel:${spec.phone}">${spec.phone}</a>
          </div>
        </div>
        <div class="contact-info-item">
          <div class="contact-icon"><i class="fa-solid fa-envelope"></i></div>
          <div class="contact-info-text">
            <h4>${isArabic ? 'بريد إلكتروني' : 'Email'}</h4>
            <a href="mailto:${spec.email}">${spec.email}</a>
          </div>
        </div>
        <div class="contact-info-item">
          <div class="contact-icon"><i class="fa-solid fa-location-dot"></i></div>
          <div class="contact-info-text">
            <h4>${isArabic ? 'الموقع' : 'Location'}</h4>
            <p>${spec.address}</p>
          </div>
        </div>
        <div class="contact-info-item">
          <div class="contact-icon"><i class="fa-solid fa-clock"></i></div>
          <div class="contact-info-text">
            <h4>${isArabic ? 'ساعات العمل' : 'Working Hours'}</h4>
            <p>${spec.workingHours}</p>
          </div>
        </div>
        <a href="https://wa.me/${whatsappNum}" target="_blank" class="whatsapp-btn">
          <i class="fa-brands fa-whatsapp" style="font-size:1.4rem"></i>
          ${isArabic ? 'تواصل عبر واتساب الآن' : 'Chat on WhatsApp Now'}
        </a>
      </div>
      <div class="aw-reveal">
        <div class="contact-form">
          <h3 style="font-size:1.3rem;font-weight:800;color:#0f172a;margin-bottom:1.5rem">${isArabic ? 'أرسل لنا رسالة' : 'Send Us a Message'}</h3>
          <form id="contact-form" onsubmit="submitForm(event)">
            <div class="form-group">
              <label>${isArabic ? 'الاسم الكامل' : 'Full Name'}</label>
              <input type="text" placeholder="${isArabic ? 'أدخل اسمك' : 'Enter your name'}" required>
            </div>
            <div class="form-group">
              <label>${isArabic ? 'رقم الهاتف' : 'Phone Number'}</label>
              <input type="tel" placeholder="${isArabic ? '+966 5X XXX XXXX' : '+1 (555) 000-0000'}" required>
            </div>
            <div class="form-group">
              <label>${isArabic ? 'رسالتك' : 'Your Message'}</label>
              <textarea placeholder="${isArabic ? 'كيف يمكننا مساعدتك؟' : 'How can we help you?'}" required></textarea>
            </div>
            <button type="submit" class="btn-primary" style="width:100%;justify-content:center">
              <i class="fa-solid fa-paper-plane"></i>
              ${isArabic ? 'إرسال الرسالة' : 'Send Message'}
            </button>
          </form>
          <div class="form-success" id="contact-form-success">
            <i class="fa-solid fa-circle-check"></i>
            <h3 style="color:#0f172a;margin-bottom:0.5rem">${isArabic ? 'شكراً لتواصلك!' : 'Thank you!'}</h3>
            <p style="color:#64748b">${isArabic ? 'سنتواصل معك خلال 24 ساعة' : 'We will contact you within 24 hours'}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="footer-grid">
      <div class="footer-brand">
        <svg id="aw-ai-logo-footer" width="32" height="32" viewBox="0 0 38 38" fill="none">
          <rect width="38" height="38" rx="10" fill="url(#logoGrad2)"/>
          <defs>
            <linearGradient id="logoGrad2" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
              <stop stop-color="${pc}"/>
              <stop offset="1" stop-color="${ac}"/>
            </linearGradient>
          </defs>
          <text x="19" y="26" text-anchor="middle" font-family="${headFont}" font-size="18" font-weight="800" fill="white">${(spec.businessName || 'A')[0]}</text>
        </svg>
        <p class="footer-tagline">${spec.footerTagline}</p>
        <div class="footer-social">
          <a href="#" class="social-link"><i class="fa-brands fa-instagram"></i></a>
          <a href="#" class="social-link"><i class="fa-brands fa-x-twitter"></i></a>
          <a href="#" class="social-link"><i class="fa-brands fa-snapchat"></i></a>
          <a href="https://wa.me/${whatsappNum}" class="social-link"><i class="fa-brands fa-whatsapp"></i></a>
        </div>
      </div>
      <div>
        <h4 class="footer-heading">${isArabic ? 'روابط سريعة' : 'Quick Links'}</h4>
        <div class="footer-links">
          ${(spec.navLinks || []).map(l => `<a href="${l.href}" class="footer-link">${l.text}</a>`).join('')}
        </div>
      </div>
      <div>
        <h4 class="footer-heading">${isArabic ? 'معلومات التواصل' : 'Contact Info'}</h4>
        <div class="footer-contact-item"><i class="fa-solid fa-phone"></i>${spec.phone}</div>
        <div class="footer-contact-item"><i class="fa-solid fa-envelope"></i>${spec.email}</div>
        <div class="footer-contact-item"><i class="fa-solid fa-location-dot"></i>${spec.address}</div>
        <div class="footer-contact-item"><i class="fa-solid fa-clock"></i>${spec.workingHours}</div>
      </div>
    </div>
    <div class="footer-bottom">
      جميع الحقوق محفوظة &copy; ${year} ${spec.businessName} | Powered by <a href="https://arabyweb.net" style="color:var(--accent)">ArabyWeb.net</a>
    </div>
  </footer>

  <!-- WhatsApp Float -->
  <a href="https://wa.me/${whatsappNum}" target="_blank" class="whatsapp-float" aria-label="WhatsApp">
    <i class="fa-brands fa-whatsapp"></i>
  </a>

  <!-- Lightbox -->
  <div id="aw-lightbox" onclick="closeLightbox()">
    <img id="aw-lb-img" src="" alt="Gallery">
    <div class="lb-controls" onclick="event.stopPropagation()">
      <button class="lb-btn" onclick="prevImg()"><i class="fa-solid fa-chevron-${isArabic ? 'right' : 'left'}"></i></button>
      <button class="lb-btn" onclick="closeLightbox()"><i class="fa-solid fa-xmark"></i></button>
      <button class="lb-btn" onclick="nextImg()"><i class="fa-solid fa-chevron-${isArabic ? 'left' : 'right'}"></i></button>
    </div>
  </div>

  <script>
    // Reveal on scroll
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('aw-visible'); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.aw-reveal').forEach(el => revealObs.observe(el));

    // Navbar scroll
    window.addEventListener('scroll', () => {
      document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
    });

    // Counter animation
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.aw-counter').forEach(counter => {
            const target = parseInt(counter.dataset.target);
            const suffix = counter.dataset.suffix || '';
            let start = 0;
            const duration = 1800;
            const startTime = performance.now();
            function update(now) {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              counter.textContent = Math.floor(eased * target).toLocaleString('ar-SA');
              if (progress < 1) requestAnimationFrame(update);
              else counter.textContent = target.toLocaleString('ar-SA');
            }
            requestAnimationFrame(update);
          });
          counterObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) counterObs.observe(statsSection);

    // Mobile menu
    function toggleMenu() {
      document.getElementById('mobile-menu').classList.toggle('open');
    }
    function closeMenu() {
      document.getElementById('mobile-menu').classList.remove('open');
    }

    // FAQ
    function toggleFaq(el) {
      const answer = el.nextElementSibling;
      const isOpen = answer.style.maxHeight;
      document.querySelectorAll('.faq-answer').forEach(a => a.style.maxHeight = '');
      document.querySelectorAll('.faq-icon').forEach(i => i.style.transform = '');
      if (!isOpen) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        el.querySelector('.faq-icon').style.transform = 'rotate(45deg)';
      }
    }

    // Gallery lightbox
    const galleryImgs = ${JSON.stringify(galleryImgs)};
    let currentIndex = 0;
    function openLightbox(src, idx) {
      currentIndex = idx;
      document.getElementById('aw-lb-img').src = src;
      document.getElementById('aw-lightbox').classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      document.getElementById('aw-lightbox').classList.remove('open');
      document.body.style.overflow = '';
    }
    function prevImg() {
      currentIndex = (currentIndex - 1 + galleryImgs.length) % galleryImgs.length;
      document.getElementById('aw-lb-img').src = galleryImgs[currentIndex];
    }
    function nextImg() {
      currentIndex = (currentIndex + 1) % galleryImgs.length;
      document.getElementById('aw-lb-img').src = galleryImgs[currentIndex];
    }
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') ${isArabic ? 'nextImg' : 'prevImg'}();
      if (e.key === 'ArrowRight') ${isArabic ? 'prevImg' : 'nextImg'}();
    });

    // Contact form
    function submitForm(e) {
      e.preventDefault();
      let valid = true;
      e.target.querySelectorAll('[required]').forEach(f => {
        if (!f.value.trim()) { f.style.borderColor = '#ef4444'; valid = false; }
        else f.style.borderColor = '';
      });
      if (valid) {
        document.getElementById('contact-form').style.display = 'none';
        document.getElementById('contact-form-success').style.display = 'flex';
      }
    }

    // Smooth scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  </script>
</body>
</html>`;
}
