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
import { getIndustryInsights, buildInsightsPromptSection } from "./learning-engine.js";

function getOpenAI() {
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  return new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });
}

// ─── Content Spec Types ──────────────────────────────────────────────────────

export interface WebsiteContentSpecEn {
  tagline: string;
  subtitle: string;
  ctaText: string;
  ctaSecondary: string;
  navCtaText: string;
  navLinks: Array<{ text: string }>;
  aboutTitle: string;
  aboutParagraph1: string;
  aboutParagraph2: string;
  aboutFeatures: string[];
  services: Array<{ title: string; description: string }>;
  stats: Array<{ label: string }>;
  testimonials: Array<{ name: string; text: string }>;
  ctaBandTitle: string;
  ctaBandSub: string;
  workingHours: string;
  faqItems: Array<{ question: string; answer: string }>;
  footerTagline: string;
}

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
  projects?: Array<{ title: string; description: string; category: string; location?: string; year?: string }>;
  clientLogos?: Array<{ name: string; initials: string; color: string }>;
  en?: WebsiteContentSpecEn;
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
    industry?: string;
  } = {}
): Promise<WebsiteContentSpec> {
  const openai = getOpenAI();
  const isArabic = /[\u0600-\u06FF]/.test(description);
  const lang = isArabic ? "Arabic" : "English";

  // ── Fetch past learnings for this industry to inject as examples ───────────
  let insightsSection = "";
  if (options.industry) {
    try {
      const insights = await getIndustryInsights(options.industry, isArabic ? "ar" : "en", 6);
      insightsSection = buildInsightsPromptSection(insights);
      if (insights.totalPatterns > 0) {
        console.log(`[Learning] 💡 Injecting ${insights.totalPatterns} patterns for industry: ${options.industry}`);
      }
    } catch (e) {
      // Non-fatal — generate without learnings
    }
  }

  // Detect if this business type benefits from portfolio/projects + client logos
  const descLower = description.toLowerCase();
  const needsPortfolio = /مقاولات|إنشاء|بناء|تشييد|هندسة|ديكور|تصميم داخلي|معماري|تصوير|فيديو|وكالة|ماركتينج|تسويق|برمجة|تطوير|agency|construction|contracting|building|architecture|interior|photography|video|marketing|design|developer/.test(descLower);

  const systemPrompt = `You are a professional Arabic website copywriter and business consultant. You generate bilingual (Arabic + English) website content as a structured JSON object. Output ONLY valid JSON — no explanations, no markdown, no code blocks.`;

  const userPrompt = `Generate professional bilingual website content for this business:

"${description}"

${options.primaryColor ? `Brand colors: Primary ${options.primaryColor}, Accent ${options.accentColor}` : ""}
${options.whatsapp ? `WhatsApp: ${options.whatsapp}` : ""}
${insightsSection}

Return a JSON object matching this EXACT structure. Primary text fields must be in ${lang === "Arabic" ? "Arabic" : "English"}. Also include an "en" object with English translations of all text fields:

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
    { "text": "${needsPortfolio ? 'مشاريعنا' : 'أعمالنا'}", "href": "${needsPortfolio ? '#projects' : '#gallery'}" },
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
  "accentColor": "${options.accentColor || "#06b6d4"}",${needsPortfolio ? `
  "projects": [
    { "title": "اسم المشروع الأول (حقيقي ومحدد)", "description": "وصف قصير 1-2 جملة للمشروع", "category": "سكني", "location": "الرياض", "year": "2024" },
    { "title": "اسم المشروع الثاني", "description": "وصف قصير", "category": "تجاري", "location": "جدة", "year": "2023" },
    { "title": "اسم المشروع الثالث", "description": "وصف قصير", "category": "سكني", "location": "الدمام", "year": "2023" },
    { "title": "اسم المشروع الرابع", "description": "وصف قصير", "category": "صناعي", "location": "الرياض", "year": "2022" },
    { "title": "اسم المشروع الخامس", "description": "وصف قصير", "category": "تجاري", "location": "مكة", "year": "2022" },
    { "title": "اسم المشروع السادس", "description": "وصف قصير", "category": "سكني", "location": "المدينة", "year": "2021" }
  ],
  "clientLogos": [
    { "name": "اسم شركة عميل حقيقي", "initials": "حر", "color": "#0f4c81" },
    { "name": "اسم شركة ثانية", "initials": "سع", "color": "#06b6d4" },
    { "name": "اسم شركة ثالثة", "initials": "رد", "color": "#7c3aed" },
    { "name": "اسم شركة رابعة", "initials": "نم", "color": "#0f4c81" },
    { "name": "اسم شركة خامسة", "initials": "تك", "color": "#059669" },
    { "name": "اسم شركة سادسة", "initials": "بن", "color": "#dc2626" }
  ],` : ""}
  "en": {
    "tagline": "English translation of the tagline",
    "subtitle": "English translation of the subtitle",
    "ctaText": "English CTA button text",
    "ctaSecondary": "English secondary CTA",
    "navCtaText": "English nav CTA",
    "navLinks": [
      { "text": "About" },
      { "text": "Services" },
      { "text": "Gallery" },
      { "text": "Testimonials" }
    ],
    "aboutTitle": "English about section title",
    "aboutParagraph1": "English translation of first about paragraph",
    "aboutParagraph2": "English translation of second about paragraph",
    "aboutFeatures": ["English feature 1", "English feature 2", "English feature 3", "English feature 4"],
    "services": [
      { "title": "English service title", "description": "English service description" },
      { "title": "...", "description": "..." },
      { "title": "...", "description": "..." },
      { "title": "...", "description": "..." },
      { "title": "...", "description": "..." },
      { "title": "...", "description": "..." }
    ],
    "stats": [
      { "label": "Years Experience" },
      { "label": "Happy Clients" },
      { "label": "Client Satisfaction" },
      { "label": "Continuous Service" }
    ],
    "testimonials": [
      { "name": "Abdullah Al-Ghamdi", "text": "English translation of testimonial 1" },
      { "name": "Reem Al-Sahli", "text": "English translation of testimonial 2" },
      { "name": "Khalid Al-Dossari", "text": "English translation of testimonial 3" }
    ],
    "ctaBandTitle": "English CTA band headline",
    "ctaBandSub": "English CTA band subtitle",
    "workingHours": "Sat–Thu: 9AM – 10PM",
    "faqItems": [
      { "question": "English FAQ question 1", "answer": "English FAQ answer 1" },
      { "question": "...", "answer": "..." },
      { "question": "...", "answer": "..." },
      { "question": "...", "answer": "..." },
      { "question": "...", "answer": "..." }
    ],
    "footerTagline": "English footer tagline"
  }
}

IMPORTANT RULES:
- Services MUST be specific to this exact business type — NEVER generic "خدمة 1"
- Stats MUST be realistic and business-appropriate (small cafe won't have 50,000 clients)
- Testimonials MUST mention specific details about the business
- Choose Font Awesome 6 icons relevant to each service (fa-solid fa-...)
- Phone format: +966 5X XXX XXXX (Saudi format)
- The "en" object MUST contain accurate English translations of all text fields
- Keep the same number of items in arrays (6 services, 4 stats, 3 testimonials, 5 faqItems)${needsPortfolio ? `
- "projects" MUST have 6 real, specific project titles matching this business — NOT generic "مشروع 1". For construction: use real project names like "فيلا سكنية حي النرجس" or "مجمع تجاري طريق الملك".
- "projects" categories MUST be varied (mix of سكني/تجاري/صناعي for construction, or the equivalent for other fields)
- "clientLogos" MUST have 6 real company/brand names that this type of business would serve
- "clientLogos" initials must be 2-3 Arabic letters (first letters of the client name)` : ""}
- Output ONLY valid JSON with no extra text`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_completion_tokens: 5000,
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

// ─── Arabic Font Selector ─────────────────────────────────────────────────────
interface ArabicFontConfig {
  head: string;
  body: string;
  importUrl: string;
}

function selectArabicFont(spec: WebsiteContentSpec): ArabicFontConfig {
  const haystack = [
    spec.seoTitle || "",
    spec.seoDescription || "",
    spec.tagline || "",
    ...(spec.services || []).map(s => s.title),
  ].join(" ").toLowerCase();

  const is = (...kw: string[]) => kw.some(k => haystack.includes(k));

  // Luxury / فاخر
  if (is("فاخر", "راقي", "luxury", "vip", "gold", "ذهب", "عطر", "perfume", "مجوهر", "jewelry", "jewel")) {
    return {
      head: "'Scheherazade New', serif",
      body: "'Tajawal', sans-serif",
      importUrl: "https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;500;600;700&family=Tajawal:wght@400;500;700&display=swap",
    };
  }
  // Construction / مقاولات / بناء
  if (is("مقاول", "إنشاء", "بناء", "هندسة", "معمار", "construct", "engineer", "build", "contracting")) {
    return {
      head: "'Almarai', sans-serif",
      body: "'Almarai', sans-serif",
      importUrl: "https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap",
    };
  }
  // Medical / clinic / pharmacy
  if (is("عيادة", "طبي", "صحة", "مستشفى", "دواء", "صيدل", "clinic", "medical", "health", "pharmacy", "doctor")) {
    return {
      head: "'Noto Kufi Arabic', sans-serif",
      body: "'Cairo', sans-serif",
      importUrl: "https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;500;600;700;800&family=Cairo:wght@400;500;600;700&display=swap",
    };
  }
  // Restaurant / food / café
  if (is("مطعم", "كافيه", "قهوة", "أكل", "طعام", "وجبة", "restaurant", "cafe", "coffee", "food", "kitchen")) {
    return {
      head: "'Tajawal', sans-serif",
      body: "'Tajawal', sans-serif",
      importUrl: "https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap",
    };
  }
  // Corporate / consulting / finance / legal
  if (is("شركة", "مؤسسة", "استشارات", "قانوني", "محاسب", "مالي", "consulting", "corporate", "legal", "finance", "accounting")) {
    return {
      head: "'IBM Plex Arabic', sans-serif",
      body: "'IBM Plex Arabic', sans-serif",
      importUrl: "https://fonts.googleapis.com/css2?family=IBM+Plex+Arabic:wght@300;400;500;600;700&display=swap",
    };
  }
  // Tech / software / digital / agency
  if (is("تقنية", "برمجة", "تطبيق", "ذكاء", "رقمي", "تطوير", "tech", "software", "app", "digital", "agency", "saas")) {
    return {
      head: "'Cairo', sans-serif",
      body: "'Cairo', sans-serif",
      importUrl: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap",
    };
  }
  // Default: Cairo (headings) + Tajawal (body)
  return {
    head: "'Cairo', sans-serif",
    body: "'Tajawal', sans-serif",
    importUrl: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Tajawal:wght@400;500;700&display=swap",
  };
}

export function buildWebsiteHTML(
  spec: WebsiteContentSpec,
  images: WebsiteImages,
  options: { isArabic?: boolean } = {}
): string {
  const isArabic = options.isArabic !== false;
  const dir = isArabic ? 'rtl' : 'ltr';
  const lang = isArabic ? 'ar' : 'en';

  const arabicFont = isArabic ? selectArabicFont(spec) : null;
  const fontImport = arabicFont
    ? arabicFont.importUrl
    : "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600&display=swap";
  const bodyFont = arabicFont ? arabicFont.body : "'Inter', sans-serif";
  const headFont = arabicFont ? arabicFont.head : "'Montserrat', sans-serif";

  // Google Maps embed
  const mapsApiKey = process.env.GOOGLE_API_KEY || "";
  const mapsAddress = encodeURIComponent(spec.address || (isArabic ? "السعودية" : "Saudi Arabia"));
  const mapsLang = isArabic ? "ar" : "en";
  const mapsEmbedUrl = mapsApiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${mapsApiKey}&q=${mapsAddress}&language=${mapsLang}&region=SA`
    : "";

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

  // ─── Bilingual helpers ────────────────────────────────────────────────────
  const enSpec = spec.en;
  const hasBi = !!enSpec;
  function esc(s: string): string { return (s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function da(ar: string, en: string | undefined): string {
    if (!hasBi || !en) return "";
    return ` data-ar="${esc(ar)}" data-en="${esc(en)}"`;
  }

  const servicesHTML = services.map((s, i) => {
    const enS = enSpec?.services?.[i];
    return `
        <div class="service-card aw-reveal" style="animation-delay:${i * 0.1}s">
          <div class="service-icon">
            <i class="${s.icon || 'fa-solid fa-star'}"></i>
          </div>
          <h3 class="service-title"${da(s.title, enS?.title)}>${s.title}</h3>
          <p class="service-desc"${da(s.description, enS?.description)}>${s.description}</p>
        </div>`;
  }).join("");

  const statsHTML = stats.map((s, i) => {
    const enS = enSpec?.stats?.[i];
    return `
        <div class="stat-item aw-reveal">
          <div class="stat-number"><span class="aw-counter" data-target="${s.number}" data-suffix="${s.suffix || ''}">${s.number}</span>${s.suffix || ''}</div>
          <div class="stat-label"${da(s.label, enS?.label)}>${s.label}</div>
        </div>`;
  }).join("");

  const galleryHTML = galleryImgs.map((url, i) => `
        <div class="gallery-item aw-reveal" onclick="openLightbox('${url}', ${i})">
          <img src="${url}" alt="صورة ${i + 1}" loading="lazy">
          <div class="gallery-overlay">
            <i class="fa-solid fa-expand"></i>
          </div>
        </div>`).join("");

  const testimonialsHTML = testimonials.map((t, i) => {
    const enT = enSpec?.testimonials?.[i];
    return `
        <div class="testimonial-card aw-reveal" style="animation-delay:${i * 0.15}s">
          <div class="testimonial-stars">
            ${'<i class="fa-solid fa-star"></i>'.repeat(t.rating || 5)}
          </div>
          <p class="testimonial-text"${da(`"${t.text}"`, enT?.text ? `"${enT.text}"` : undefined)}>"${t.text}"</p>
          <div class="testimonial-author">
            <div class="author-avatar">${(t.name || '?')[0]}</div>
            <span class="author-name"${da(t.name, enT?.name)}>${t.name}</span>
          </div>
        </div>`;
  }).join("");

  const faqHTML = faqItems.map((item, i) => {
    const enItem = enSpec?.faqItems?.[i];
    return `
        <div class="faq-item aw-reveal">
          <div class="faq-q" onclick="toggleFaq(this)">
            <span${da(item.question, enItem?.question)}>${item.question}</span>
            <span class="faq-icon">+</span>
          </div>
          <div class="faq-answer">
            <p${da(item.answer, enItem?.answer)}>${item.answer}</p>
          </div>
        </div>`;
  }).join("");

  // ─── Projects & Client Logos (for construction / agency / design businesses) ──
  const projects = (spec.projects || []).slice(0, 6);
  const clientLogos = (spec.clientLogos || []).slice(0, 6);
  const hasProjects = projects.length > 0;
  const hasClientLogos = clientLogos.length > 0;

  // Collect unique categories for filter buttons
  const projectCategories = hasProjects
    ? [isArabic ? 'الكل' : 'All', ...Array.from(new Set(projects.map(p => p.category)))]
    : [];

  const projectCardsHTML = projects.map((p, i) => `
        <div class="project-card aw-reveal" data-category="${p.category}" style="animation-delay:${i * 0.08}s">
          <div class="project-img-wrap">
            <img src="${galleryImgs[i % galleryImgs.length]}" alt="${p.title}" loading="lazy">
            <div class="project-overlay">
              <span class="project-year">${p.year || ''}</span>
            </div>
          </div>
          <div class="project-body">
            <span class="project-cat-badge">${p.category}</span>
            <h3 class="project-title">${p.title}</h3>
            <p class="project-desc">${p.description}</p>
            ${p.location ? `<div class="project-location"><i class="fa-solid fa-location-dot"></i> ${p.location}</div>` : ''}
          </div>
        </div>`).join('');

  const projectFiltersHTML = projectCategories.map((cat, i) =>
    `<button class="proj-filter-btn${i === 0 ? ' active' : ''}" onclick="filterProjects('${cat}', this)">${cat}</button>`
  ).join('');

  const projectsSectionHTML = hasProjects ? `
  <!-- PROJECTS -->
  <section class="projects-section" id="projects">
    <div class="section-header aw-reveal">
      <div class="section-label">${isArabic ? 'أعمالنا المنجزة' : 'Our Projects'}</div>
      <h2 class="section-title">${isArabic ? 'مشاريع نفخر بها' : 'Projects We Are Proud Of'}</h2>
      <div class="section-divider"></div>
    </div>
    <div class="proj-filters aw-reveal">
      ${projectFiltersHTML}
    </div>
    <div class="projects-grid">
      ${projectCardsHTML}
    </div>
  </section>` : '';

  const clientLogosHTML = clientLogos.map(cl => `
      <div class="client-logo-item">
        <div class="client-logo-badge" style="--cl-color: ${cl.color}">${cl.initials}</div>
        <span class="client-logo-name">${cl.name}</span>
      </div>`).join('');

  const clientLogosSectionHTML = hasClientLogos ? `
  <!-- CLIENT LOGOS -->
  <section class="clients-section">
    <div class="section-header aw-reveal">
      <div class="section-label">${isArabic ? 'شركاؤنا' : 'Our Clients'}</div>
      <h2 class="section-title">${isArabic ? 'عملاء تشرفنا بخدمتهم' : 'Clients We Are Proud to Serve'}</h2>
      <div class="section-divider"></div>
    </div>
    <div class="clients-strip aw-reveal">
      ${clientLogosHTML}
    </div>
  </section>` : '';

  const navLinksHTML = (spec.navLinks || []).map((l, i) => {
    const enL = enSpec?.navLinks?.[i];
    return `
            <a href="${l.href}" class="nav-link"${da(l.text, enL?.text)} onclick="closeMenu()">${l.text}</a>`;
  }).join("");

  const mobileNavLinksHTML = (spec.navLinks || []).map((l, i) => {
    const enL = enSpec?.navLinks?.[i];
    return `
          <a href="${l.href}" class="mobile-nav-link"${da(l.text, enL?.text)} onclick="closeMenu()">${l.text}</a>`;
  }).join("");

  const featuresHTML = (spec.aboutFeatures || []).map((f, i) => {
    const enF = enSpec?.aboutFeatures?.[i];
    return `
              <div class="feature-item">
                <div class="feature-check">
                  <i class="fa-solid fa-check"></i>
                </div>
                <span${da(f, enF)}>${f}</span>
              </div>`;
  }).join("");

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
  ${hasBi && isArabic ? `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">` : ""}
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <style>
    @import url('${fontImport}');
    ${hasBi && isArabic ? `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@400;500;600;700;800;900&display=swap');` : ""}

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

    #aw-lang-btn {
      background: rgba(255,255,255,0.12);
      border: 1.5px solid rgba(255,255,255,0.3);
      color: #fff;
      padding: 0.3rem 0.85rem;
      border-radius: 2rem;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
      font-family: inherit;
      flex-shrink: 0;
    }
    #aw-lang-btn:hover { background: rgba(255,255,255,0.22); border-color: rgba(255,255,255,0.55); }
    .navbar.scrolled #aw-lang-btn { background: rgba(var(--primary-rgb),0.12); border-color: rgba(var(--primary-rgb),0.3); color: var(--primary); }

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

    /* ── PROJECTS ── */
    .projects-section {
      padding: 6rem 5%;
      background: #f8fafc;
    }
    .proj-filters {
      display: flex;
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 2.5rem;
    }
    .proj-filter-btn {
      padding: 8px 20px;
      border-radius: 50px;
      border: 2px solid rgba(var(--primary-rgb), 0.2);
      background: #fff;
      color: var(--primary);
      font-family: ${headFont};
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.25s ease;
    }
    .proj-filter-btn:hover, .proj-filter-btn.active {
      background: var(--primary);
      color: #fff;
      border-color: var(--primary);
    }
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .project-card {
      background: #fff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border: 1px solid rgba(0,0,0,0.05);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .project-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 16px 40px rgba(var(--primary-rgb), 0.15);
    }
    .project-card.hidden { display: none; }
    .project-img-wrap {
      position: relative;
      overflow: hidden;
      height: 220px;
    }
    .project-img-wrap img {
      width: 100%; height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    .project-card:hover .project-img-wrap img { transform: scale(1.08); }
    .project-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(var(--primary-rgb),0.7) 0%, transparent 50%);
      display: flex; align-items: flex-end;
      padding: 12px 16px;
    }
    .project-year {
      font-size: 0.85rem;
      color: rgba(255,255,255,0.9);
      font-weight: 600;
    }
    .project-body { padding: 1.2rem 1.4rem 1.5rem; }
    .project-cat-badge {
      display: inline-block;
      padding: 3px 12px;
      border-radius: 50px;
      background: rgba(var(--primary-rgb), 0.1);
      color: var(--primary);
      font-size: 0.78rem;
      font-weight: 700;
      margin-bottom: 0.6rem;
    }
    .project-title {
      font-family: ${headFont};
      font-weight: 800;
      font-size: 1.05rem;
      color: #0f172a;
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }
    .project-desc {
      color: #64748b;
      font-size: 0.88rem;
      line-height: 1.6;
      margin-bottom: 0.75rem;
    }
    .project-location {
      color: var(--primary);
      font-size: 0.82rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    /* ── CLIENTS ── */
    .clients-section {
      padding: 5rem 5%;
      background: #fff;
    }
    .clients-strip {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }
    .client-logo-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      transition: transform 0.3s ease;
    }
    .client-logo-item:hover { transform: translateY(-4px); }
    .client-logo-badge {
      width: 72px; height: 72px;
      border-radius: 16px;
      background: var(--cl-color, var(--primary));
      display: flex; align-items: center; justify-content: center;
      font-family: ${headFont};
      font-weight: 800;
      font-size: 1.2rem;
      color: #fff;
      filter: grayscale(1) opacity(0.5);
      transition: filter 0.3s ease, box-shadow 0.3s ease;
    }
    .client-logo-item:hover .client-logo-badge {
      filter: grayscale(0) opacity(1);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }
    .client-logo-name {
      font-size: 0.8rem;
      color: #94a3b8;
      font-weight: 600;
      text-align: center;
      transition: color 0.3s ease;
    }
    .client-logo-item:hover .client-logo-name { color: #0f172a; }

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
      .projects-grid { grid-template-columns: repeat(2, 1fr); }
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
      .projects-grid { grid-template-columns: 1fr; }
      .clients-strip { gap: 1.2rem; }
      .client-logo-badge { width: 56px; height: 56px; font-size: 1rem; }
    }
    @media (max-width: 480px) {
      .gallery-grid { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .proj-filters { gap: 6px; }
      .proj-filter-btn { padding: 6px 14px; font-size: 0.82rem; }
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

    <a href="#contact" class="nav-cta"${da(spec.navCtaText || 'تواصل معنا', enSpec?.navCtaText)}>${spec.navCtaText || 'تواصل معنا'}</a>

    ${hasBi ? `<button id="aw-lang-btn" onclick="awToggleLang()" title="Switch Language">EN</button>` : ""}

    <button class="hamburger" onclick="toggleMenu()" aria-label="القائمة">
      <i class="fa-solid fa-bars"></i>
    </button>

    <div class="mobile-menu" id="mobile-menu">
      ${mobileNavLinksHTML}
      <a href="#contact" class="nav-cta" style="width:fit-content"${da(spec.navCtaText || 'تواصل معنا', enSpec?.navCtaText)} onclick="closeMenu()">${spec.navCtaText || 'تواصل معنا'}</a>
      ${hasBi ? `<button onclick="awToggleLang()" style="background:rgba(var(--primary-rgb),0.1);border:1.5px solid rgba(var(--primary-rgb),0.3);color:var(--primary);padding:0.35rem 1rem;border-radius:2rem;font-size:0.85rem;font-weight:700;cursor:pointer;width:fit-content;font-family:inherit" title="Switch Language">EN</button>` : ""}
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
      <h1 class="hero-title aw-reveal"${da(spec.tagline, enSpec?.tagline)}>
        ${spec.tagline}
      </h1>
      <p class="hero-subtitle aw-reveal"${da(spec.subtitle, enSpec?.subtitle)}>${spec.subtitle}</p>
      <div class="hero-buttons aw-reveal">
        <a href="#contact" class="btn-primary">
          <i class="fa-solid fa-calendar-check"></i>
          <span${da(spec.ctaText, enSpec?.ctaText)}>${spec.ctaText}</span>
        </a>
        <a href="#about" class="btn-outline">
          <span${da(spec.ctaSecondary, enSpec?.ctaSecondary)}>${spec.ctaSecondary}</span>
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
        <h2 class="section-title" style="text-align:${isArabic ? 'right' : 'left'};margin-bottom:1.5rem"${da(spec.aboutTitle, enSpec?.aboutTitle)}>${spec.aboutTitle}</h2>
        <div class="section-divider right"></div>
        <p class="about-text" style="margin-top:1.5rem"${da(spec.aboutParagraph1, enSpec?.aboutParagraph1)}>${spec.aboutParagraph1}</p>
        <p class="about-text"${da(spec.aboutParagraph2, enSpec?.aboutParagraph2)}>${spec.aboutParagraph2}</p>
        <div class="features-grid">
          ${featuresHTML}
        </div>
        <div style="margin-top:2rem">
          <a href="#contact" class="btn-primary"><span${da(spec.ctaText, enSpec?.ctaText)}>${spec.ctaText}</span></a>
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

  ${projectsSectionHTML}

  ${clientLogosSectionHTML}

  <!-- CTA BAND -->
  <section class="cta-band">
    <div class="cta-band-title aw-reveal"${da(spec.ctaBandTitle, enSpec?.ctaBandTitle)}>${spec.ctaBandTitle}</div>
    <p class="cta-band-sub aw-reveal"${da(spec.ctaBandSub, enSpec?.ctaBandSub)}>${spec.ctaBandSub}</p>
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
            <p${da(spec.workingHours, enSpec?.workingHours)}>${spec.workingHours}</p>
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
    ${mapsEmbedUrl ? `
    <div class="aw-reveal" style="max-width:1200px;margin:3rem auto 0;border-radius:20px;overflow:hidden;border:1.5px solid rgba(255,255,255,0.1);box-shadow:0 8px 32px rgba(0,0,0,0.3)">
      <iframe
        src="${mapsEmbedUrl}"
        width="100%"
        height="380"
        style="border:0;display:block"
        allowfullscreen
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        title="${isArabic ? 'موقعنا على الخريطة' : 'Our Location on Map'}"
      ></iframe>
    </div>` : ""}
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
        <p class="footer-tagline"${da(spec.footerTagline, enSpec?.footerTagline)}>${spec.footerTagline}</p>
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
          ${(spec.navLinks || []).map((l, i) => { const enL = enSpec?.navLinks?.[i]; return `<a href="${l.href}" class="footer-link"${da(l.text, enL?.text)}>${l.text}</a>`; }).join('')}
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

    // Projects filter
    function filterProjects(category, btn) {
      document.querySelectorAll('.proj-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const allLabel = '${isArabic ? 'الكل' : 'All'}';
      document.querySelectorAll('.project-card').forEach(card => {
        if (category === allLabel || card.dataset.category === category) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
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

    ${hasBi ? `// ── Bilingual Language Toggle ─────────────────────────────────────────────
    (function() {
      var AW_LANG_ORDER = ['${isArabic ? "ar" : "en"}', '${isArabic ? "en" : "ar"}'];
      var awLangIdx = 0;
      var FONTS = {
        ar: { body: "${bodyFont}", head: "${headFont}" },
        en: { body: "'Inter', sans-serif", head: "'Montserrat', sans-serif" }
      };
      function awApplyLang(lang) {
        var isAr = lang === 'ar';
        document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', lang);
        var btn = document.getElementById('aw-lang-btn');
        var nextCode = AW_LANG_ORDER[(awLangIdx + 1) % AW_LANG_ORDER.length];
        if (btn) btn.textContent = nextCode.toUpperCase();
        document.querySelectorAll('[data-ar]').forEach(function(el) {
          var val = el.getAttribute('data-' + lang) || el.getAttribute('data-ar');
          if (val !== null) el.textContent = val;
        });
        document.body.style.fontFamily = FONTS[lang].body;
        document.querySelectorAll('h1,h2,h3,h4,.hero-title,.section-title,.cta-band-title,.aw-brand').forEach(function(el) {
          el.style.fontFamily = FONTS[lang].head;
        });
      }
      window.awToggleLang = function() {
        awLangIdx = (awLangIdx + 1) % AW_LANG_ORDER.length;
        awApplyLang(AW_LANG_ORDER[awLangIdx]);
      };
      window.awCycleLang = window.awToggleLang;
    })();` : ""}
  </script>
</body>
</html>`;
}
