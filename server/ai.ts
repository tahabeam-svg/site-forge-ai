import OpenAI from "openai";

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OpenAI API key not configured");
    const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
    _openai = new OpenAI({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
    });
  }
  return _openai;
}
export const openai = new Proxy({} as OpenAI, {
  get: (_target, prop) => (getOpenAI() as any)[prop],
});

function getModel(): string {
  if (process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) return "gpt-5.2";
  return "gpt-4o";
}

export interface GeneratedWebsite {
  html: string;
  css: string;
  seoTitle: string;
  seoDescription: string;
  sections: string[];
  colorPalette: { primary: string; secondary: string; accent: string; background: string; text: string };
}

type WebsiteCategory = "romantic" | "portfolio" | "event" | "business";

function detectWebsiteCategory(description: string): WebsiteCategory {
  const d = description.toLowerCase();
  const romantic = ["حبيبت","حبيبي","حبيبه","عشيقت","زوجت","زوجي","girlfriend","boyfriend","lover","sweetheart","my love","بحبك","احبك","أحبك","ذكرى زواج","عيد زواج","عيد حب","valentine","anniversary","قلبي","رفيقت","رفيقي","لحبيبي","لحبيبتي","لزوجتي","لزوجي","أميرت","أميرتي","لحبيب","صديقتي","girlfriend website","love website","موقع هدية","هدية رقمية","gift for my","surprise for my"];
  const portfolio = ["بورتفوليو","portfolio","أعمالي","موهبتي","مصور","مصمم","فنان","معلم","مدرس","طبيب","مهندس","محامي","شخصي","personal","resume","cv","سيرة ذاتية","شاعر","كاتب","موسيقي","فريلانسر","freelancer","مستقل","مطور","developer","ux designer","ui designer","مترجم","translator","مدرب","coach","influencer","مؤثر","youtuber","content creator","صانع محتوى"];
  const event = ["حفل","مناسبة","زفاف","خطوبة","عقد قران","حفلة","wedding","party","event","exhibition","معرض","مهرجان","festival","سوق","قرن","ختان","تخرج","graduation","عيد ميلاد موقع","birthday website","ملتقى","مؤتمر","conference","summit","قمة","ندوة","seminar","workshop","ورشة عمل","launch event","حفل إطلاق"];
  if (romantic.some(k => d.includes(k))) return "romantic";
  if (portfolio.some(k => d.includes(k))) return "portfolio";
  if (event.some(k => d.includes(k))) return "event";
  return "business";
}

const MOBILE_RESPONSIVE_MANDATORY = `
═══════════════════════════════════════
MOBILE RESPONSIVE — NON-NEGOTIABLE RULES
═══════════════════════════════════════
Your CSS MUST include these rules EXACTLY:

* { box-sizing: border-box; }
body { overflow-x: hidden; }
img { max-width: 100%; height: auto; display: block; }

/* Prevent card text overflow in grid cells */
[class*="grid"] > * { min-width: 0; overflow-wrap: break-word; word-break: break-word; }
.card, .service-card, .feature-card, [class*="-card"] { overflow: hidden; word-break: break-word; }

@media (max-width: 768px) {
  /* EVERY multi-column grid collapses to 1 column — NO EXCEPTIONS */
  [class*="grid"], [class*="-grid"], .services-grid, .gallery-grid,
  .features-grid, .cards-wrap, .two-col, .about-grid, .stats-grid,
  .contact-grid, .footer-grid, .speakers-grid, .schedule-grid {
    grid-template-columns: 1fr !important;
    flex-direction: column !important;
  }
  /* Two-column flex/grid layouts also collapse */
  .about-wrap, .contact-wrap, .footer-wrap { grid-template-columns: 1fr !important; }
  /* No horizontal padding cuts off text */
  .container, .wrapper, [class*="container"], [class*="section"] { padding-left: 1rem !important; padding-right: 1rem !important; }
  /* Hamburger visible, desktop nav hidden */
  .nav-links, .desktop-nav { display: none !important; }
  #aw-menu-btn { display: block !important; }
}

@media (max-width: 480px) {
  h1, .hero-title { font-size: clamp(1.75rem, 8vw, 2.5rem) !important; }
  h2, .sec-title { font-size: clamp(1.4rem, 6vw, 2rem) !important; }
}
`;

function buildPromptByCategory(category: WebsiteCategory, description: string, isArabic: boolean, dirAttr: string): string {
  const dir = isArabic ? "rtl" : "ltr";
  const lang = isArabic
    ? "Arabic RTL — dir='rtl' on root element. ALL text in Arabic."
    : "English LTR — ALL text in English.";
  const font = isArabic
    ? "Import Cairo (headings 700-900) + Tajawal (body) from Google Fonts"
    : "Import Montserrat (headings 700-900) + Inter (body) from Google Fonts";
  const mobileMenu = `<button id="aw-menu-btn" onclick="(function(){var m=document.getElementById('aw-mobile-menu');var o=m.style.display==='flex';m.style.display=o?'none':'flex';})()" style="display:none;background:none;border:none;cursor:pointer;padding:8px;color:inherit;"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>`;

  if (category === "romantic") {
    return `You are a world-class creative web designer specializing in personal romantic & love websites. Build an emotionally beautiful, elegant, deeply personal website — NOT a business website.

Request: "${description}"

CRITICAL RULES — MANDATORY:
- This is a PERSONAL/ROMANTIC website, NOT a business. NEVER add: "years of experience", "clients count", "stats bar", "our services", "testimonials", "WhatsApp business button", pricing, or any corporate sections.
- The subject is a PERSON (likely a loved one). Treat them with warmth, love, and personalization.
- Extract the person's name from the request if mentioned. Use it throughout lovingly.

═══════════════════════════════════
REQUIRED SECTIONS (IN ORDER):
═══════════════════════════════════
1. NAVBAR: Fixed, glassmorphism (backdrop-filter:blur(20px); background:rgba(15,5,30,0.7)). Nav links: About, Memories, Messages, Wishes. Brand = person's name in gradient text. Mobile hamburger menu required.

2. HERO: Full viewport (min-height:100vh). Background: beautiful Unsplash romantic/nature image with deep dark overlay. Large animated title with the person's name in gradient text (use pink/rose/purple palette). Subtitle = a romantic sentence. One CTA button (gradient, rounded) → #memories. Animated floating heart particles or soft orb glows.

3. ABOUT (id="about"): "من هي [الاسم]" or "About [Name]" — A beautiful 2-column section. Left: elegant portrait-style image (Unsplash beautiful person/nature). Right: personal description — her personality traits, what makes her special, her hobbies. Style with a large decorative quote mark. NO bullet points about experience.

4. MEMORIES GALLERY (id="memories"): Title "لحظاتنا الجميلة" or "Beautiful Memories". A responsive photo grid: 3 columns on desktop, 2 on tablet (max-width:768px), 1 on mobile (max-width:480px). Use 6 real Unsplash photo URLs with ?w=600&h=400&fit=crop&q=75 parameters. Each with hover overlay and heart icon. NEVER use gradient placeholders instead of images.

5. LOVE MESSAGES (id="messages"): Title "رسائل من القلب" or "From the Heart". 3 beautiful cards with romantic messages/quotes. Dark section, glassmorphism cards with heart icons. Soft poetic text.

6. WISHES (id="wishes"): Full-width gradient section with a large personal wish/dedication. Decorative elements. One share button.

7. FOOTER: Dark, minimal. Name + tagline. Social media icons (Instagram, Twitter, Snapchat). Small copyright.

═══════════════════════════════════
DESIGN STYLE:
═══════════════════════════════════
- Color palette: Romantic — deep rose (#be185d), soft pink (#f9a8d4), purple (#7c3aed), with near-black backgrounds (#0f0818)
- Fonts: ${font}
- Hero title: clamp(3rem,7vw,6rem), font-weight:900, gradient text (rose to purple)
- Animated floating hearts in hero using CSS @keyframes floatHeart
- All transitions: cubic-bezier(.22,1,.36,1)
- Glassmorphism cards in messages section
- NO stats, NO services, NO testimonials, NO WhatsApp, NO business contact form

Language: ${lang}

MOBILE HAMBURGER (required inside nav):
${mobileMenu}
Mobile menu div: id="aw-mobile-menu"
CSS: @media(max-width:768px){ nav-links{display:none!important;} #aw-menu-btn{display:block!important;} }

JS (inline <script> at bottom):
- IntersectionObserver for scroll reveal (.aw-reveal → .aw-visible)
- Navbar scroll effect (add class on scroll > 60px)
- Floating heart animation trigger

IMAGES (Unsplash):
- Romantic/nature hero: photo-1518895949257-7621c3c786d7, photo-1490750967868-88df5691cc6c, photo-1529333166437-7750a6dd5a70
- Soft portrait/bokeh: photo-1529626455594-4ff0802cfb7e, photo-1524504388940-b1c1722653e1, photo-1488426862026-3ee34a7d66df
- Flowers/romantic: photo-1518199266791-5375a83190b7, photo-1487530811015-780eb9d5ee98, photo-1455661f47f62baef40b3c9ac76a93f

${MOBILE_RESPONSIVE_MANDATORY}

Return EXACTLY this JSON (no markdown, no explanation):
{"html":"complete HTML (no html/head/body tags, use ${dirAttr} on root div, inline <script> at bottom)","css":"complete CSS: Google Fonts @import, full reset (box-sizing:border-box, overflow-x:hidden), all components, all animations, MANDATORY mobile breakpoints @media(max-width:768px) collapsing ALL grids to 1 column, @media(max-width:480px) font size fixes. Include MOBILE_RESPONSIVE_MANDATORY rules.","seoTitle":"${isArabic ? "Arabic" : "English"} title max 60 chars","seoDescription":"description 150-160 chars","sections":["section names"],"colorPalette":{"primary":"#hex","secondary":"#hex","accent":"#hex","background":"#hex","text":"#hex"}}`;
  }

  if (category === "portfolio") {
    return `You are a world-class creative director building a stunning personal portfolio website for the Arab market. Style: modern 2025, minimal yet jaw-dropping — like top Dribbble portfolios, Awwwards winners. Build something this person will be PROUD to share.

Request: "${description}"

STEP 0 — MANDATORY: EXTRACT FIRST
- Person's name → use as brand name everywhere
- Their field/specialty (photographer, designer, developer, teacher, doctor, engineer, etc.)
- Their city if mentioned
- Specific skills/tools if mentioned

═══ SECTIONS (in order) ═══

1. NAVBAR: Fixed, glassmorphism (background:rgba(5,8,22,0.8);backdrop-filter:blur(24px)). Brand = small inline SVG (id="aw-ai-logo", 32×32px, initials or field icon) + person's name in gradient text. Links: عن نفسي (#about), مهاراتي (#skills), أعمالي (#portfolio), تواصل معي (#contact). Mobile hamburger required. FOOTER: uses SVG only (id="aw-ai-logo-footer") + tagline, NEVER repeat the name in text form again.

2. HERO: Full viewport. Background: stunning CSS mesh gradient (use 3 large animated orb blobs, filter:blur(80px), @keyframes orbFloat). Large animated name in gradient text (clamp(3rem,8vw,6rem), font-weight:900). Below: title/role badge with glass effect. Short powerful tagline. Two CTAs: gradient solid + glass outline. Include animated typing effect for the role using CSS.

3. ABOUT (id="about"): 2-column layout. LEFT: Professional Unsplash portrait with double gradient border (::before/::after pseudo-elements), floating "available for work" badge. RIGHT: personal bio (2-3 paragraphs, personal tone), checklist of key facts about them, social links (LinkedIn, GitHub/Behance/Instagram based on their field).

4. SKILLS (id="skills"): Clean section on light gray background. Title "مهاراتي ودرجة إتقاني". Grid of skill cards (3-4 per row on desktop). Each skill card: icon + skill name + animated progress bar (0→percentage on scroll). Group skills by category if multiple fields. Animate bars with IntersectionObserver.

5. PORTFOLIO (id="portfolio"): Dark section. Title "أحدث أعمالي". 3-column grid. Each card: Unsplash image relevant to their field, overlay on hover (translateY(-8px), gradient overlay, title appears), title badge, category tag, "مشاهدة المشروع" button. Generate 6 realistic projects matching their specialty (e.g. for designer: "تصميم هوية بصرية", "واجهة تطبيق موبايل", etc.)

6. SERVICES/WHAT I OFFER (id="services"): Light section. "ماذا أقدم؟" — 3 service cards with gradient borders, icons, titles, descriptions. Real services based on their specialty.

7. CONTACT (id="contact"): Dark section with gradient. Large CTA headline. Two-column: left side = contact info (WhatsApp link, email, city). Right side: minimal clean contact form (name, email, message, send button). Also link to their social platforms.

8. FOOTER: Dark minimal. Name + tagline. Social icons with circle hover effect. Copyright.

═══ DESIGN STYLE ═══
- Color: Based on field — Designer: pink/purple (#be185d + #7c3aed) | Developer: violet/cyan (#6366f1 + #06b6d4) | Photographer: near-black/gold (#0a0a0a + #d4a843) | Teacher/Doctor: teal/blue (#0d9488 + #2563eb)
- All transitions: cubic-bezier(.22,1,.36,1)
- IntersectionObserver scroll reveals (aw-reveal → aw-visible)
- Navbar scroll effect
- Counter animation for any numbers
- Include Font Awesome 6 CDN

Language: ${lang}
Font: ${font}
Mobile hamburger: ${mobileMenu}
${MOBILE_RESPONSIVE_MANDATORY}

Return EXACTLY this JSON (no markdown):
{"html":"complete HTML (no html/head/body tags, ${dirAttr} on root div, inline <script> at bottom with IntersectionObserver + skill bar animations + navbar scroll)","css":"complete CSS: Google Fonts @import, full reset (box-sizing:border-box, overflow-x:hidden, img max-width:100%), all components, animations, MANDATORY @media(max-width:768px) collapsing ALL grids to 1 column, @media(max-width:480px) font size fixes.","seoTitle":"Personal/Portfolio SEO title max 60 chars","seoDescription":"description 150-160 chars","sections":["section names"],"colorPalette":{"primary":"#hex","secondary":"#hex","accent":"#hex","background":"#hex","text":"#hex"}}`;
  }

  if (category === "event") {
    return `You are a world-class event website designer specializing in Saudi/Arab events. Build a premium, visually stunning event website.

Request: "${description}"

STEP 0 — MANDATORY: EXTRACT FIRST
- Event name/title → use prominently throughout
- Event type (wedding, conference, graduation, exhibition, festival, product launch, birthday, etc.)
- Date if mentioned → display in a countdown timer
- Location/venue if mentioned → city + venue name
- Organizer name if mentioned

═══ SECTIONS (in order) ═══

1. NAVBAR: Fixed glassmorphism (rgba dark + blur). Links: عن الفعالية (#about), البرنامج (#schedule), الصور (#gallery), التسجيل (#register). Mobile hamburger required. Brand = small inline SVG (id="aw-ai-logo", 32×32px, icon matching event type) + event name in gradient text. FOOTER: SVG logo only (id="aw-ai-logo-footer") + tagline, NEVER repeat event name as text again.

2. HERO: Full viewport. Background: high-quality event/venue Unsplash image with dark overlay gradient. 3 animated orb blobs for depth. Event name in massive gradient text (clamp(2.5rem,7vw,6rem), font-weight:900). Date and location badge prominently displayed. If date is future: add a live countdown timer (Days, Hours, Minutes, Seconds) with JS setInterval. CTA buttons: "سجّل الآن" (gradient) + "عرّف نفسك" (outline glass).

3. ABOUT EVENT (id="about"): 2-column. LEFT: Beautiful event imagery with gradient border overlay. RIGHT: Event description, key highlights as checklist with colored icons, expected attendees count, key sponsor/organizer name. Style: alternating section (light background).

4. SCHEDULE/PROGRAM (id="schedule"): Dark gradient section. Title "برنامج الفعالية". Vertical timeline with time + activity + icon for each item. Generate a realistic schedule based on event type (e.g. for conference: Registration 8:00, Opening 9:00, Keynote 10:00, etc.). Each item has a numbered circle and connecting line.

5. GALLERY (id="gallery"): Light section. Title "لحظات مميزة". 3-column masonry-style photo grid. Use 6 relevant Unsplash images matching the event type (conference=people in suits, wedding=flowers/venue, exhibition=booth setups, etc.).

6. SPEAKERS/GUESTS (if applicable): Dark section. Card grid with Unsplash portrait photos, names, roles/titles. Generate 3-4 realistic speakers matching the event context.

7. REGISTER/CONTACT (id="register"): Full-width gradient section. Large CTA headline "احجز مقعدك الآن". Registration form: Name, Phone, Email, How did you hear about us, Submit button. Also WhatsApp link and email prominently displayed.

8. FOOTER: Dark, event branding with logo and social links.

═══ DESIGN NOTES ═══
- Color: Wedding=rose/gold, Conference=navy/gold, Festival=electric purple/amber, Exhibition=teal/green, Graduation=navy/gold
- Add confetti or particle animation effect in hero for celebrations
- Countdown timer if it's a future event (use JS setInterval updating every 1 second)
- Include Font Awesome 6 CDN

Language: ${lang}
Font: ${font}
Mobile hamburger: ${mobileMenu}
${MOBILE_RESPONSIVE_MANDATORY}

Return EXACTLY this JSON (no markdown):
{"html":"complete HTML (no html/head/body tags, ${dirAttr} on root div, inline <script> at bottom with countdown timer, scroll reveals, navbar effect)","css":"complete CSS: Google Fonts @import, full reset (box-sizing:border-box, overflow-x:hidden, img max-width:100%), all components, animations (@keyframes fadeUp, orbFloat), MANDATORY @media(max-width:768px) all grids collapse to 1 column !important, @media(max-width:480px) font size clamp fixes.","seoTitle":"Event SEO title max 60 chars","seoDescription":"description 150-160 chars","sections":["section names"],"colorPalette":{"primary":"#hex","secondary":"#hex","accent":"#hex","background":"#hex","text":"#hex"}}`;
  }

  // Default: business
  return `You are a world-class creative director and front-end engineer building AWARD-WINNING business websites — the quality of Awwwards, Dribbble top shots, and top SaaS landing pages. Your output for the Saudi/Arab market must be visually stunning, modern, and technically excellent.

Generate a COMPLETE, premium single-page website based on: "${description}"`;
}

export async function generateWebsite(description: string, language: string = "ar"): Promise<GeneratedWebsite> {
  const isArabic = language === "ar";
  const dirAttr = isArabic ? 'dir="rtl"' : 'dir="ltr"';
  const arabicFonts = "'Cairo', 'Tajawal', 'IBM Plex Sans Arabic', sans-serif";
  const englishFonts = "'Inter', 'Poppins', 'Montserrat', sans-serif";
  const fontFamily = isArabic ? arabicFonts : englishFonts;

  const category = detectWebsiteCategory(description);
  console.log(`[AI] Website category detected: ${category} for: "${description.slice(0, 60)}"`);
  const isSpecialCategory = category !== "business";

  const basePrompt = isSpecialCategory
    ? buildPromptByCategory(category, description, isArabic, dirAttr)
    : `You are a world-class creative director and front-end engineer building AWARD-WINNING websites — the quality of Awwwards, Dribbble top shots, and top SaaS landing pages. Your output for the Saudi/Arab market must be visually stunning, modern, and technically excellent.

Generate a COMPLETE, premium single-page website based on: "${description}"

═══════════════════════════════════════
STEP 0 — MANDATORY: PARSE THE DESCRIPTION FIRST
═══════════════════════════════════════
Before writing a single line of HTML, extract these from the user description:

1. BUSINESS NAME: If the user mentions a name (e.g. "مطعم السعادة", "شركة النور", "Safa Clinic"), use it as the brand. If no name, invent a creative Arabic brand name that matches the business type. NEVER use "اسم الشركة" or "Your Business Name".
   ⚠️ BUSINESS NAME REPETITION RULE: The business name in TEXT form must appear EXACTLY ONCE — only in the navbar brand text. Do NOT write it again in the footer, hero section tagline, about section heading, or anywhere else. Use the SVG logo (id="aw-ai-logo-footer") in the footer instead of repeating the text name.

2. CITY/LOCATION: If mentioned (e.g. الرياض, جدة, Riyadh, مكة, الدمام), use it throughout — in hero subtitle, contact section, footer, Google Maps mention. Default: الرياض.

3. SPECIFIC SERVICES/PRODUCTS: If the user mentions specific items (e.g. "شاورما وكبسة", "تصميم شعارات وهويات", "عيادة أسنان"), use THOSE EXACT services as card titles, NOT generic ones.

4. UNIQUE SELLING POINT: If mentioned (e.g. "توصيل مجاني", "24 ساعة", "أسعار تنافسية"), use it in hero subtitle and CTA button.

5. TARGET AUDIENCE: Infer from context. Customize tone accordingly (luxury=formal Arabic, youth brand=friendly tone).

CRITICAL: Every section of this website must feel 100% custom-built for THIS specific business. Generic text like "نقدم أفضل الخدمات" or "خدمة 1" is ABSOLUTELY FORBIDDEN.

═══════════════════════════════════════
VISUAL DESIGN STANDARD 2025 — MANDATORY
═══════════════════════════════════════
The website MUST look like it was designed in 2025 by a top-tier agency. Think Notion, Linear, Vercel, Stripe landing pages — but adapted for the Arab market.

▸ NAVBAR (GLASSMORPHISM): position:fixed; background:rgba(5,8,22,0.72); backdrop-filter:blur(24px); border-bottom:1px solid rgba(255,255,255,0.08). ALWAYS visible and glassy — even at top of page. On scroll: background:rgba(5,8,22,0.97).
  LOGO RULE — MANDATORY:
  • Generate a small inline SVG logo as the brand mark in the navbar. Add id="aw-ai-logo" to the SVG element. The SVG should be 36×36px, use the brand's primary/accent colors, and include the first letter(s) or a simple icon that represents the business (e.g., a fork for restaurants, a star for luxury, a house for real estate). The business name in text follows the SVG logo.
  • Example structure: <a href="#" style="display:flex;align-items:center;gap:10px;text-decoration:none;"><svg id="aw-ai-logo" width="36" height="36" viewBox="0 0 36 36">...</svg><span style="font-weight:800;font-size:1.1rem;background:linear-gradient(90deg,#fff,ACCENT);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">BUSINESS_NAME</span></a>
  • The SVG MUST be meaningful and unique — NO generic circles. Create something that fits the business type.
  • CRITICAL: The business name text MUST appear ONLY ONCE in the entire website — in the navbar only. NEVER repeat it in the footer or any other section. Footer uses only the SVG logo (id="aw-ai-logo-footer" — a smaller copy of the same SVG, 28×28px) followed by a tagline, NOT the business name text.

▸ HERO (FULL VIEWPORT + ANIMATED ORBS): min-height:100vh. Dark gradient overlay on background image. Add 2–3 large blurred orb blobs (CSS radial-gradient circles, 400–700px, filter:blur(80px), position:absolute, animated with @keyframes orbFloat). Hero text: clamp(2.8rem,6.5vw,5.5rem), font-weight:900, letter-spacing:-0.025em, color:#fff. Subtitle: rgba(255,255,255,0.68). Two CTA buttons: solid gradient + ghost outline with backdrop-filter.

▸ CTA BUTTONS — MANDATORY PREMIUM DESIGN SYSTEM (NEVER VIOLATE):
  ✅ Primary button: Use a SINGLE-HUE gradient (2 shades of same color family), e.g.:
    - Violet: linear-gradient(135deg, #7c3aed, #4f46e5)
    - Gold/Amber: linear-gradient(135deg, #d4a843, #b8860b)
    - Red/Orange: linear-gradient(135deg, #dc2626, #ea580c)
    - Teal/Green: linear-gradient(135deg, #0d9488, #059669)
    - Navy/Blue: linear-gradient(135deg, #1e3a5f, #1d4ed8)
  ❌ ABSOLUTELY FORBIDDEN button gradients — NEVER mix unrelated hues:
    - blue → yellow/gold, green → red, orange → blue, purple → yellow, cyan → orange
    - ANY gradient spanning more than 90° of the color wheel
    - Childish rainbow gradients, garish neon, or low-contrast color combos
  ✅ PRIMARY BUTTON BASE STYLE (MANDATORY):
    border-radius:12px; padding:14px 26px; font-weight:600; letter-spacing:0.02em;
    box-shadow:0 6px 16px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.15);
    transition:transform 0.2s ease, box-shadow 0.2s ease; cursor:pointer;
  ✅ HOVER STATE (MANDATORY): transform:translateY(-2px); box-shadow:0 12px 28px rgba(PRIMARY,0.45), 0 4px 8px rgba(0,0,0,0.15);
  ✅ ACTIVE STATE (MANDATORY): add onmousedown="this.style.transform='translateY(1px)'" onmouseup="this.style.transform='translateY(-2px)'"
  ✅ Secondary/outline button: transparent background, 2px solid border matching primary color, same border-radius:12px

▸ STATS BAR: Dark gradient background. 4 animated counters. Numbers use gradient text (background-clip:text). Labels uppercase letter-spacing. STATS MUST BE RELEVANT TO THE SPECIFIC BUSINESS — Examples:
  * Restaurant/Cafe: "15+ سنة خبرة", "500+ وجبة يومياً", "98% رضا العملاء", "50+ طبق متنوع"
  * Medical/Clinic: "20+ طبيب متخصص", "10,000+ مريض تعالج", "15+ سنة خبرة", "98% نسبة الشفاء"
  * Agency/Marketing: "200+ مشروع منجز", "50+ عميل نشط", "8+ سنوات خبرة", "15+ خبير متخصص"
  * Real Estate: "500+ عقار مباع", "15+ سنة في السوق", "300+ عميل راضٍ", "50+ مشروع سكني"
  * Beauty/Salon: "10,000+ جلسة", "5+ فروع", "98% رضا العميلات", "100+ منتج فاخر"
  * Tech/Startup: "50+ تطبيق طورناه", "1M+ مستخدم", "99.9% وقت تشغيل", "10+ شراكة تقنية"
  * Education: "5,000+ طالب", "50+ معلم متخصص", "95% معدل نجاح", "10+ سنوات تميز"

▸ ABOUT: 2-column. Image with double-layer gradient border effect using ::before/::after pseudo-elements. Floating experience badge (gradient bg, bottom corner). Checklist items with colored check icons. The ABOUT text MUST reference the actual business name and city extracted from the description.

▸ SERVICES: 3-column grid. Cards use CSS GRADIENT BORDER trick: background:linear-gradient(white,white) padding-box, linear-gradient(135deg,PRIMARY,ACCENT) border-box; border:1.5px solid transparent. On hover: translateY(-12px), stronger shadow, full gradient border revealed. Icon box rotates on hover, fills with gradient.
SERVICES MUST BE 100% SPECIFIC TO THE BUSINESS — if user says "مطعم مشاوي", services should be "مشاوي لحم", "دجاج مشوي", "أرز سعودي", "مقبلات", "عصائر طازجة", "توصيل منزلي". NEVER use generic "خدمة احترافية" or "Service 1".

▸ GALLERY: 3-column grid with border-radius:1.25rem. Hover: image scale(1.1) + dark gradient overlay + eye icon appears (scale from 0.5 to 1). Use 6 REAL Unsplash images relevant to the specific business type (restaurant=food photos, clinic=medical, etc.).

▸ CTA BAND: Full-width gradient background. Large bold headline personalized for THIS business (e.g. for a restaurant: "هل أنت جائع؟ اطلب أشهى المشاوي الآن"). Decorative radial glow orb in corner.

▸ TESTIMONIALS: Dark section, glassmorphism cards (rgba background + backdrop-filter). Bottom gradient border appears on hover (scaleX animation). Quote icon with low opacity. Write 3 REALISTIC testimonials with:
  * Real Arab names (e.g. محمد العتيبي، نورة القحطاني، فيصل الدوسري)
  * Specific details matching the business (not generic praise)
  * 5-star ratings using fa-star icons

▸ CONTACT: 2-column. Contact info with icon boxes. WhatsApp button. Right side: white card with gradient border, clean form inputs with focus ring.

▸ FOOTER: Very dark background with radial glow orb. 3-column layout. Brand uses gradient text. Subtle dividers. Social icons circle on hover.

▸ ANIMATIONS: Use cubic-bezier(.22,1,.36,1) for all transitions. @keyframes fadeUp, orbFloat, pulse, scrollBounce. IntersectionObserver for scroll reveals.

▸ TYPOGRAPHY: Letter-spacing:-0.02em on all headings. Line-height:1.1 for hero, 1.2 for section titles. Use font-weight:900 for hero/stats numbers.

▸ COLOR DEPTH: Use 3 opacity levels of your primary: full, 40%, 15%. Never use flat solid colors for backgrounds — always use gradients.

═══════════════════════════════════════
DESIGN STYLE OVERRIDES (if specified in description)
═══════════════════════════════════════
If the description contains "نمط التصميم المطلوب" or "Design style", apply these overrides STRICTLY:

◆ داكن عصري / Dark Modern:
  - Background: #050814 to #0f0c29 gradient throughout
  - All sections use dark backgrounds — NO white sections
  - Primary accents: electric violet (#7c3aed) + cyan (#06b6d4)
  - Stats bar, service cards, testimonials: dark glass with neon border glow (box-shadow: 0 0 20px rgba(124,58,237,0.3))
  - Hero text: neon gradient (#a78bfa → #22d3ee)
  - Navbar: rgba(5,8,22,0.95) + neon border bottom

◆ فاتح نظيف / Clean & Light:
  - ALL sections use white (#ffffff) or very light gray (#f8fafc) backgrounds
  - NO dark sections except footer (which uses #1e293b)
  - Primary: sky blue (#0284c7) + teal (#0d9488)
  - Cards: white background, subtle border (#e2e8f0), gentle shadow (0 2px 8px rgba(0,0,0,0.06))
  - Hero: light gradient (#f0f9ff → #e0f2fe), dark text (#0f172a)
  - Typography: clean, airy — more line-height (1.8), softer weights

◆ سعودي أصيل / Saudi Warm:
  - Color palette: deep emerald green (#064e3b) + warm gold (#d4a843) + cream (#fef9e7)
  - Background: cream/white sections alternating with dark green (#064e3b)
  - Hero: dark olive green gradient with gold text accents
  - Cards: cream background (#fef9e7) with gold border (1.5px solid #d4a843)
  - Stats: dark green background, gold numbers
  - Pattern: add subtle Arabic geometric SVG pattern overlay (opacity 0.04) in hero and footer
  - Feel: authentic, trustworthy, traditional yet modern

◆ ألوان جريئة / Bold & Colorful:
  - Use VIVID multi-stop gradients everywhere: from #f43f5e via #8b5cf6 to #06b6d4
  - Hero: massive rainbow gradient background
  - Each section has its own bold gradient (alternate pink→purple, orange→yellow, teal→blue)
  - Cards: each card has its own gradient background color
  - Stats numbers: bright gradient text
  - CTAs: bright animated gradient buttons with pulse glow
  - Feel: energetic, youthful, social-media-ready

◆ فاخر بسيط / Luxury Minimal:
  - Background: pure black (#000000) or very dark charcoal (#0a0a0a) everywhere
  - NO colorful sections — only black, white, and gold (#d4a843)
  - Serif-inspired feel: increase letter-spacing on headings to 0.05em, use elegant thin weights
  - Services: pure white cards on black background with thin gold border (1px solid #d4a843)
  - Stats: black background, gold gradient numbers, thin dividers
  - Minimal animations — no heavy effects, only smooth fade-ins
  - CTA buttons: gold gradient (linear-gradient(135deg,#d4a843,#b8860b)), border-radius:12px, padding:14px 28px, font-weight:600, box-shadow:0 6px 16px rgba(212,168,67,0.35), 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.15), NEVER blue→yellow or any clashing hue combo; hover:transform:translateY(-2px) box-shadow stronger; active:translateY(1px)
  - Feel: luxury brand, high-end, exclusive

Language: ${isArabic ? "Arabic RTL — add dir='rtl' on root element. All text in Arabic." : "English LTR — all text in English."}
Font: ${isArabic ? "Import Cairo (headings, weight 700-900) + Tajawal (body) from Google Fonts" : "Import Montserrat (headings, weight 700-900) + Inter (body) from Google Fonts"}

═══════════════════════════════════════
SAUDI MARKET SPECIFICS — MANDATORY
═══════════════════════════════════════
- WhatsApp is the #1 contact method in Saudi Arabia — feature it prominently in hero, contact, and as a floating button
- Use SAR (ريال سعودي) for any prices mentioned, not USD or generic currency
- Working hours common pattern: السبت-الخميس 8ص-10م، الجمعة 2م-12م (adapt to business type)
- Use realistic Saudi phone numbers format: +966 5X XXX XXXX
- Cities commonly referenced: الرياض، جدة، الدمام، مكة المكرمة، المدينة المنورة
- If it's a restaurant: mention "متاح التوصيل" and delivery platforms (مرسول، هنقرستيشن، كريم)
- If it's a business: optionally mention VAT number "الرقم الضريبي" and CR "السجل التجاري" in footer
- Payment: MADA (مدى) is the most popular, followed by Apple Pay and credit cards

═══════════════════════════════════════
NAVIGATION — SINGLE-PAGE ANCHORS ONLY
═══════════════════════════════════════
- ALL nav links MUST use anchor href: #about, #services, #gallery, #testimonials, #contact
- NEVER use /path links in navigation
- Nav links: ${isArabic ? "من نحن (#about), خدماتنا (#services), أعمالنا (#gallery), آراء العملاء (#testimonials)" : "About (#about), Services (#services), Gallery (#gallery), Testimonials (#testimonials)"} + CTA button → #contact
- NEVER use "نشر", "معاينة", "تعديل", "publish", "preview", "edit" as nav text

═══════════════════════════════════════
MOBILE HAMBURGER MENU — REQUIRED
═══════════════════════════════════════
Add EXACTLY this hamburger button pattern inside the nav:
<button id="aw-menu-btn" onclick="(function(){var m=document.getElementById('aw-mobile-menu');var o=m.style.display==='flex';m.style.display=o?'none':'flex';})()" style="display:none;background:none;border:none;cursor:pointer;padding:8px;color:inherit;">
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
</button>
Mobile menu div: id="aw-mobile-menu", style="display:none;flex-direction:column;..." — each link closes menu on click.
CSS: @media(max-width:768px){ .aw-nav-links{display:none!important;} #aw-menu-btn{display:block!important;} }

═══════════════════════════════════════
JAVASCRIPT — MANDATORY INLINE SCRIPT
═══════════════════════════════════════
At the bottom of the HTML, include a <script> tag with:
1. Scroll-triggered animations using IntersectionObserver:
   - Add class "aw-reveal" to elements you want animated
   - Observer adds class "aw-visible" when element enters viewport
   - CSS: .aw-reveal{opacity:0;transform:translateY(40px);transition:opacity 0.7s ease,transform 0.7s ease;} .aw-visible{opacity:1;transform:translateY(0);}
2. Navbar scroll effect:
   - On scroll > 60px: add class "scrolled" to nav element
   - CSS .nav.scrolled: background:rgba(15,23,42,0.97);backdrop-filter:blur(16px);box-shadow:0 4px 30px rgba(0,0,0,0.25)
3. Counter animation for stats:
   - On IntersectionObserver trigger, animate number from 0 to target value over 1500ms

═══════════════════════════════════════
ICONS — FONT AWESOME 6 FREE (MANDATORY)
═══════════════════════════════════════
Include Font Awesome 6 CDN in the HTML: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" crossorigin="anonymous"/>
Use Font Awesome icons (<i class="fa-solid fa-[icon]">) for:
- Service card icons (fa-bullseye, fa-chart-line, fa-palette, fa-code, fa-mobile-screen, fa-globe, fa-star, fa-gem, etc.) — pick relevant icons for the business
- Contact section: fa-phone, fa-envelope, fa-location-dot
- Checklist items: fa-circle-check or fa-check
- Footer social links: fa-instagram, fa-twitter, fa-linkedin (if applicable)
- Testimonial cards: fa-quote-right decorative icon (position:absolute, opacity:0.15, font-size:3rem)
- Hero CTA arrow: fa-arrow-left (for RTL) or fa-arrow-right (for LTR)
- Gallery hover overlay icon: fa-eye
- Stats icons above numbers: fa-trophy, fa-users, fa-star, fa-clock etc.
Service icon CSS:
.service-icon-wrap{width:68px;height:68px;background:linear-gradient(135deg,PRIMARY15,ACCENT15);border-radius:1.25rem;display:flex;align-items:center;justify-content:center;margin-bottom:1.5rem;transition:all 0.35s;}
.service-icon-wrap i{font-size:1.65rem;color:PRIMARY;transition:all 0.35s;}
.service-card:hover .service-icon-wrap{background:linear-gradient(135deg,PRIMARY,ACCENT);box-shadow:0 8px 20px PRIMARY40;}
.service-card:hover .service-icon-wrap i{color:#fff;}

═══════════════════════════════════════
STOCK IMAGES — HIGH QUALITY UNSPLASH
═══════════════════════════════════════
Choose images that PRECISELY match the business topic. Use ?w=1600&h=900&fit=crop&q=85 for hero, ?w=800&h=600&fit=crop&q=80 for about, ?w=600&h=400&fit=crop&q=75 for gallery.
- Restaurant/Cafe/Food: photo-1517248135467-4c7edcad34c4, photo-1414235077428-338989a2e8c0, photo-1565299624946-b28f40a0ae38, photo-1476224203421-9ac39bcb3327, photo-1504674900247-0877df9cc836, photo-1555396273-367ea4eb4db5, photo-1551218808-94e220e084d2, photo-1490818387583-1baba5e638af, photo-1544025162-d76694265947, photo-1567620905732-2d1ec7ab7445
- Coffee/Cafe only: photo-1495474472287-4d71bcdd2085, photo-1501339847302-ac426a4a7cbb, photo-1511920170033-f8396924c348, photo-1442512595331-e89e73853f31
- Grills/BBQ/Meat: photo-1529193591184-b1d58069ecdd, photo-1544025162-d76694265947, photo-1432139555190-58524dae6a55, photo-1558030137-a56c1b3b9498
- Business/Corporate/Agency: photo-1497366216548-37526070297c, photo-1486406146926-c627a92ad1ab, photo-1542744173-8e7e53415bb0, photo-1553877522-43269d4ea984, photo-1522071820081-009f0129c71c, photo-1524758631624-e2822e304c36
- Luxury/Perfume/Fragrance: photo-1541643600914-78b084683601, photo-1523293182086-7651a899d37f, photo-1588776814546-1ffbb7c4f58a, photo-1615634260167-c8cdede054de
- Technology/Startup/Software: photo-1518770660439-4636190af475, photo-1552664730-d307ca884978, photo-1451187580459-43490279c0fa, photo-1461749280684-dccba630e2f6, photo-1504639725590-34d0984388bd
- Real Estate/Property: photo-1560518883-ce09059eeffa, photo-1582407947304-fd86f028f716, photo-1512917774080-9991f1c4c750, photo-1570129477492-45c003edd2be, photo-1600596542815-ffad4c1539a9
- Medical/Clinic/Health: photo-1576091160399-112ba8d25d1d, photo-1579684385127-1ef15d508118, photo-1631217868264-e5b90bb7e133, photo-1559757148-5c350d0d3c56, photo-1638202993928-7d4f3a8e4b6b
- Beauty/Salon/Spa: photo-1560066984-138dadb4c035, photo-1522337360788-8b13dee7a37e, photo-1487412947147-5cebf100d293, photo-1519014816548-bf5fe059798b
- Fashion/Retail/Store: photo-1558618666-fcd25c85f82e, photo-1445205170230-053b83016050, photo-1490481651871-ab68de25d43d, photo-1483985988355-763728e1935b
- Education/Training/Academy: photo-1523050854058-8df90110c9f1, photo-1509062522246-3755977927d7, photo-1427504494785-3a9ca7044f45, photo-1456513080510-7bf3a84b82f8
- Automotive/Car/Transport: photo-1492144534655-ae79c964c9d7, photo-1469854523086-cc02fe5d8800, photo-1511919884226-fd3cad34687c
- Events/Wedding: photo-1540575467063-178a50c2df87, photo-1505236858219-8359eb29e329, photo-1519741497674-611481863552
- Use at least 6 relevant Unsplash images throughout the page. MATCH images to the EXACT business type in the description.

═══════════════════════════════════════
WHATSAPP BUTTON — REQUIRED FOR ARAB MARKET
═══════════════════════════════════════
Add a WhatsApp floating button (bottom-right, fixed position) AND a WhatsApp link in the contact section.
Pattern: <a href="https://wa.me/966500000000" target="_blank" style="position:fixed;bottom:1.75rem;${isArabic ? "left" : "right"}:1.75rem;z-index:999;background:#25D366;color:#fff;width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 25px rgba(37,211,102,0.5);transition:transform 0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
  <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
</a>

═══════════════════════════════════════
COLOR PALETTE GUIDELINES
═══════════════════════════════════════
Pick a unique, business-appropriate palette. Avoid cliché generic blue (#2196f3 type):
- Restaurant/Grills/Food: warm reds/oranges (#c0392b + #e67e22) or deep charcoal with amber (#1a0a00 + #f59e0b)
- Coffee/Cafe: warm brown/cream (#6f4e37 + #d4a843)
- Luxury/Perfume/Jewelry: near-black with gold (#0a0a0a + #d4a843) or deep purple with rose-gold (#1a0033 + #b8860b)
- Medical/Clinic/Pharmacy: teal/cyan (#0d9488 + #0284c7) or deep blue (#1e40af + #06b6d4)
- Tech/Startup/Software: violet/purple (#7c3aed + #06b6d4) or dark with electric green (#030712 + #22c55e)
- Corporate/Agency/Consulting: deep navy (#1e3a5f + #2563eb) or slate with indigo (#0f172a + #6366f1)
- Beauty/Salon/Spa: rose/mauve (#be185d + #f43f5e) or blush with gold (#fdf2f8 dark sections + #be185d)
- Real Estate/Property: charcoal/emerald (#1a2e1a + #059669) or navy/gold (#0f172a + #f59e0b)
- Fashion/Retail: bold black/white with accent (#0a0a0a + #ef4444) or fashion purple (#4a0072 + #e879f9)
- Education/Academy: deep blue/orange (#1e3a8a + #f97316) or emerald/gold (#064e3b + #fbbf24)
- Automotive/Transport: steel blue (#1e293b + #3b82f6) or racing red (#7f1d1d + #ef4444)
- Events/Entertainment: electric purple (#4a0072 + #a855f7) or festival amber (#78350f + #f59e0b)
Dark background for: hero, stats bar, testimonials section, footer
Light/white background for: about, services
Subtle gray (#f8fafc) for alternating sections

${MOBILE_RESPONSIVE_MANDATORY}

Return EXACTLY this JSON object (no markdown, no explanation):
{
  "html": "Complete HTML (no <html>/<head>/<body> tags). Use ${dirAttr} on root div. Include WhatsApp float button. Include inline <script> at bottom for animations.",
  "css": "Complete CSS: Google Fonts @import at top, full reset (box-sizing:border-box on *, overflow-x:hidden on body, img max-width:100%), all components, animations (@keyframes fadeUp, @keyframes countUp, @keyframes orbFloat), MANDATORY breakpoints: @media(max-width:1024px){services/gallery → 2 cols} @media(max-width:768px){ALL grids/multi-col → 1 col !important, nav-links display:none, hamburger display:block, padding 1rem} @media(max-width:480px){font sizes clamped}. MUST include .aw-reveal and .aw-visible classes. MUST include min-width:0 on all grid children to prevent overflow.",
  "seoTitle": "${isArabic ? "Arabic" : "English"} SEO title (max 60 chars)",
  "seoDescription": "${isArabic ? "Arabic" : "English"} meta description (150-160 chars)",
  "sections": ["${isArabic ? "Arabic" : "English"} section names list"],
  "colorPalette": {"primary": "#hex", "secondary": "#hex", "accent": "#hex", "background": "#hex", "text": "#hex"}
}

IMPORTANT: Return ONLY the JSON object, no markdown, no code blocks, no explanation.`;

  const prompt = basePrompt;
  const model = getModel();
  console.log("Using AI model:", model, "| Category:", category);
  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    max_completion_tokens: 16384,
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content || "";

  // Sanitize nav links: replace path-based hrefs with anchor hrefs
  function sanitizeNavLinks(html: string): string {
    const navMap: Record<string, string> = {
      "/about": "#about", "/about-us": "#about", "/من-نحن": "#about", "/who-we-are": "#about",
      "/services": "#services", "/our-services": "#services", "/خدماتنا": "#services",
      "/gallery": "#gallery", "/portfolio": "#gallery", "/works": "#gallery", "/أعمالنا": "#gallery",
      "/testimonials": "#testimonials", "/reviews": "#testimonials", "/آراء-العملاء": "#testimonials",
      "/contact": "#contact", "/contact-us": "#contact", "/تواصل-معنا": "#contact",
    };
    let result = html;
    for (const [path, anchor] of Object.entries(navMap)) {
      result = result.replace(new RegExp(`href=["']${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`, "gi"), `href="${anchor}"`);
    }
    // Replace platform UI words that appear as nav link text with appropriate alternatives
    const platformWords: Array<[RegExp, string]> = [
      [/>نشر الآن</g, ">احجز الآن<"],
      [/>نشر</g, ">الرئيسية<"],
      [/>معاينة</g, ">خدماتنا<"],
      [/>تعديل</g, ">من نحن<"],
    ];
    result = result.replace(/<(nav|header)[^>]*>[\s\S]*?<\/(nav|header)>/gi, (navBlock) => {
      let replaced = navBlock;
      for (const [p, r] of platformWords) {
        replaced = replaced.replace(p, r);
      }
      return replaced;
    });
    return result;
  }

  function sanitizeCss(css: string): string {
    if (!css.includes("scroll-behavior")) {
      return "html { scroll-behavior: smooth; }\n" + css;
    }
    return css;
  }

  try {
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    parsed.html = sanitizeNavLinks(parsed.html || "");
    parsed.css = sanitizeCss(parsed.css || "");
    return parsed as GeneratedWebsite;
  } catch {
    return {
      html: `<div ${dirAttr} style="font-family: ${fontFamily}; max-width: 1200px; margin: 0 auto; padding: 2rem;">
        <header style="text-align: center; padding: 5rem 2rem; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: white; border-radius: 1rem; margin-bottom: 2rem; position: relative; overflow: hidden;">
          <div style="position: absolute; inset: 0; background: url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop') center/cover; opacity: 0.2;"></div>
          <div style="position: relative; z-index: 1;">
            <h1 style="font-size: 3rem; margin-bottom: 1rem; font-weight: 800;">${description}</h1>
            <p style="font-size: 1.2rem; opacity: 0.9; max-width: 600px; margin: 0 auto 2rem;">${isArabic ? "مرحباً بكم في موقعنا الاحترافي" : "Welcome to our professional website"}</p>
            <a href="#contact" style="display: inline-block; padding: 14px 26px; background: linear-gradient(135deg, #e2b04a, #d4a843); color: #1a1a2e; border-radius: 12px; font-weight: 600; text-decoration: none; font-size: 1rem; box-shadow: 0 6px 16px rgba(226,176,74,0.4), 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2); transition: transform 0.2s ease, box-shadow 0.2s ease;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 12px 28px rgba(226,176,74,0.5), 0 4px 8px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 6px 16px rgba(226,176,74,0.4), 0 2px 4px rgba(0,0,0,0.1)'" onmousedown="this.style.transform='translateY(1px)'" onmouseup="this.style.transform='translateY(-2px)'">${isArabic ? "تواصل معنا" : "Contact Us"}</a>
          </div>
        </header>
        <section style="padding: 4rem 2rem; text-align: center;">
          <h2 style="font-size: 2.2rem; margin-bottom: 0.5rem; color: #1a1a2e;">${isArabic ? "من نحن" : "About Us"}</h2>
          <div style="width: 60px; height: 3px; background: linear-gradient(90deg, #e2b04a, #d4a843); margin: 0 auto 1.5rem;"></div>
          <p style="color: #666; max-width: 700px; margin: 0 auto; line-height: 1.8; font-size: 1.1rem;">${isArabic ? "نحن نقدم أفضل الخدمات والحلول الاحترافية لعملائنا في المملكة العربية السعودية" : "We provide the best professional services and solutions for our clients in Saudi Arabia"}</p>
        </section>
        <section style="padding: 4rem 2rem; text-align: center; background: #f8f9fa; border-radius: 1rem;">
          <h2 style="font-size: 2.2rem; margin-bottom: 0.5rem; color: #1a1a2e;">${isArabic ? "خدماتنا" : "Our Services"}</h2>
          <div style="width: 60px; height: 3px; background: linear-gradient(90deg, #e2b04a, #d4a843); margin: 0 auto 2rem;"></div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; padding: 1rem;">
            <div style="padding: 2.5rem; background: white; border-radius: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); transition: transform 0.3s;">
              <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #e2b04a, #d4a843); border-radius: 1rem; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <h3 style="color: #1a1a2e; margin-bottom: 0.5rem;">${isArabic ? "خدمة احترافية" : "Professional Service"}</h3>
              <p style="color: #888; font-size: 0.95rem;">${isArabic ? "نقدم حلولاً مبتكرة وعالية الجودة" : "Innovative, high-quality solutions"}</p>
            </div>
            <div style="padding: 2.5rem; background: white; border-radius: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); transition: transform 0.3s;">
              <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #e2b04a, #d4a843); border-radius: 1rem; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              </div>
              <h3 style="color: #1a1a2e; margin-bottom: 0.5rem;">${isArabic ? "دعم متميز" : "Premium Support"}</h3>
              <p style="color: #888; font-size: 0.95rem;">${isArabic ? "فريق متخصص لخدمتكم على مدار الساعة" : "Dedicated team at your service 24/7"}</p>
            </div>
            <div style="padding: 2.5rem; background: white; border-radius: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); transition: transform 0.3s;">
              <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #e2b04a, #d4a843); border-radius: 1rem; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <h3 style="color: #1a1a2e; margin-bottom: 0.5rem;">${isArabic ? "سرعة التنفيذ" : "Fast Delivery"}</h3>
              <p style="color: #888; font-size: 0.95rem;">${isArabic ? "تنفيذ سريع وفعّال لجميع المشاريع" : "Fast and efficient execution"}</p>
            </div>
          </div>
        </section>
        <footer style="text-align: center; padding: 3rem 0; margin-top: 2rem; border-top: 1px solid #eee;">
          <p style="color: #999;">${isArabic ? "جميع الحقوق محفوظة" : "All rights reserved"} © 2026</p>
        </footer>
      </div>`,
      css: `* { margin: 0; padding: 0; box-sizing: border-box; scroll-behavior: smooth; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
section { animation: fadeIn 0.6s ease-out; }`,
      seoTitle: description,
      seoDescription: `${description} - ${isArabic ? "موقع احترافي" : "Professional website"}`,
      sections: isArabic
        ? ["الرئيسية", "من نحن", "خدماتنا", "التذييل"]
        : ["Hero", "About", "Services", "Footer"],
      colorPalette: { primary: "#1a1a2e", secondary: "#16213e", accent: "#e2b04a", background: "#ffffff", text: "#333333" },
    };
  }
}

export interface SocialContent {
  post: string;
  caption: string;
  hashtags: string[];
  callToAction: string;
  bestTimeToPost: string;
  contentType: string;
}

export async function generateSocialContent(topic: string, platform: string, language: string = "ar", tone: string = "professional"): Promise<SocialContent> {
  const isArabic = language === "ar";

  const platformGuidelines: Record<string, string> = {
    instagram: "Max 2200 chars, visual-first, use emojis generously, 20-30 relevant hashtags (mix Arabic + English), line breaks for readability, start with a hook",
    facebook: "Conversational, engaging storytelling, ask a question, 3-5 hashtags, 150-400 words ideal, include CTA",
    linkedin: "Professional insightful tone, add industry value, personal story + lesson format, 3-5 hashtags, 150-300 words",
    twitter: "Max 280 chars total (post must be under 250 chars to leave room), punchy, controversial or insightful, 1-2 hashtags max, hook in first 5 words",
    tiktok: "Trendy, Gen-Z friendly, MUST start with viral hook ('لن تصدق...', 'سر لا يعرفه أحد...'), 5-10 hashtags, short punchy sentences",
    youtube: "SEO-optimized title (60 chars max), compelling description with keywords, timestamps suggestion, include subscribe CTA",
  };

  const toneGuide: Record<string, string> = {
    professional: "Professional yet warm. Clear, confident, credible. No slang.",
    casual: "Friendly, conversational, like talking to a friend. Use light humor.",
    motivational: "Inspiring, energetic, action-oriented. Use power words.",
    promotional: "Sales-focused but not pushy. Highlight value and benefits. Urgency.",
    educational: "Informative, clear, teach something useful. Lists and steps work well.",
  };

  const prompt = `You are an elite social media marketer specializing in the Saudi Arabian and Arab markets. You know what goes viral in KSA, what resonates with Saudi audiences, and how to write content that gets engagement.

Generate a ${platform} post about: "${topic}"

Platform: ${platform.toUpperCase()}
Language: ${isArabic ? "Arabic (use Saudi/Gulf dialect if casual, Modern Standard Arabic if professional)" : "English"}
Tone: ${tone} — ${toneGuide[tone] || toneGuide.professional}
Platform guidelines: ${platformGuidelines[platform] || "Standard social media post"}

SAUDI MARKET CONTEXT:
- Saudi audiences respond well to: authenticity, local references (Riyadh, Jeddah, KSA), Arabic pride, quality emphasis, WhatsApp CTAs
- Peak engagement times: 7-11pm (AST) on weekdays, after Asr and Isha prayers
- Popular hashtags include Arabic versions (#الرياض #السعودية #جدة) mixed with English
- Avoid: exaggeration without proof, anything culturally insensitive, copying Western styles without localizing
- Strong CTAs: "تواصل معنا على واتساب", "احجز الآن", "اطلب عينتك المجانية"

Return a JSON object with:
{
  "post": "The COMPLETE main post text with emojis and line breaks — ready to copy-paste directly to ${platform}. Include hook, body, CTA.",
  "caption": "Extended caption/description with extra context if needed",
  "hashtags": ["hashtag1", "hashtag2", ...],
  "callToAction": "A compelling specific call to action for Saudi audience",
  "bestTimeToPost": "Recommended posting time for Saudi audience (e.g. الثلاثاء 8-10 مساءً بتوقيت الرياض)",
  "contentType": "${platform === 'instagram' ? 'reel/carousel/post/story' : platform === 'tiktok' ? 'video' : platform === 'youtube' ? 'video' : 'post'}"
}

IMPORTANT: Return ONLY the JSON object, no markdown, no code blocks. The post field must be complete and ready to publish.`;

  const response = await openai.chat.completions.create({
    model: getModel(),
    messages: [{ role: "user", content: prompt }],
    max_completion_tokens: 2048,
    temperature: 0.8,
  });

  const content = response.choices[0]?.message?.content || "";
  try {
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      post: isArabic ? "محتوى تسويقي رائع قادم قريباً! 🚀" : "Amazing marketing content coming soon! 🚀",
      caption: topic,
      hashtags: isArabic ? ["#تسويق", "#السعودية", "#أعمال"] : ["#marketing", "#SaudiArabia", "#business"],
      callToAction: isArabic ? "تابعنا للمزيد!" : "Follow us for more!",
      bestTimeToPost: isArabic ? "7-9 مساءً بتوقيت السعودية" : "7-9 PM Saudi time",
      contentType: "post",
    };
  }
}

// ─── Social Media Post Image Generation (DALL-E 3 with smart business detection) ─
function detectImageBusinessType(topic: string): { en: string; visualCues: string; forbidden: string } {
  const t = topic.toLowerCase();

  const map: Array<[string[], { en: string; visualCues: string; forbidden: string }]> = [
    [
      ["مقاولات","بناء","إنشاء","مشاريع إنشائية","هندسة مدنية","تشييد","عمران","بنية تحتية","construction","contracting","building"],
      { en: "construction and contracting",
        visualCues: "active construction site with cranes, steel structure being built, concrete columns, construction workers in helmets and safety vests, modern building under construction, architectural blueprints, heavy machinery like excavators. Real construction photography, dynamic industrial scene.",
        forbidden: "mosques, landscapes, phone mockups, abstract patterns, generic business icons" }
    ],
    [
      ["مطعم","مقهى","أكل","وجبات","قهوة","مشوي","شاورما","برغر","سوشي","حلويات","بيتزا","restaurant","cafe","food","coffee"],
      { en: "restaurant and food",
        visualCues: "beautifully plated food on elegant table, professional food photography, warm restaurant lighting, fresh ingredients, chef preparing food, appetizing close-up of the dish, rich colors and textures. Top-down or 45-degree food photography.",
        forbidden: "cartoon food, clipart, generic icons, phone mockups" }
    ],
    [
      ["عيادة","دكتور","طبيب","صحة","مستشفى","علاج","طب","clinic","doctor","medical","health","hospital"],
      { en: "medical and healthcare",
        visualCues: "clean modern clinic interior, professional doctor in white coat, medical equipment, healthcare professional consulting patient, bright sterile environment, trust-inspiring medical setting. Photorealistic medical photography.",
        forbidden: "cartoons, phone mockups, generic icons, mosques" }
    ],
    [
      ["عقار","شقق","مباني","فلل","أراضي","تطوير عقاري","real estate","property","villa","apartment"],
      { en: "real estate and property",
        visualCues: "stunning exterior of modern residential building or villa, luxury apartment interior with floor-to-ceiling windows, architectural photography, dramatic lighting on building facade, aerial view of real estate development, premium residential complex.",
        forbidden: "phone mockups, generic icons, abstract patterns" }
    ],
    [
      ["صالون","مكياج","تجميل","كوافير","عناية","سبا","spa","salon","beauty","makeup","hair","skincare"],
      { en: "beauty and salon",
        visualCues: "elegant beauty salon interior, professional makeup application, luxurious skincare products arranged beautifully, glamorous hair styling, soft pink and gold tones, premium beauty experience. Lifestyle beauty photography.",
        forbidden: "cartoon, generic icons, phone mockups" }
    ],
    [
      ["تسويق","إعلانات","برندينج","محتوى","ميديا","وكالة","marketing","agency","advertising","branding","media"],
      { en: "marketing and creative agency",
        visualCues: "modern creative workspace with large monitors showing design work, team brainstorming around whiteboard, colorful mood boards, creative director reviewing designs, sleek open-plan office, dynamic creative energy.",
        forbidden: "phone mockups, generic business icons, stock photo clichés" }
    ],
    [
      ["تقنية","برمجة","تطبيق","سوفتوير","ذكاء اصطناعي","استضافة","tech","software","app","ai","development","coding"],
      { en: "technology and software",
        visualCues: "developer working on multiple monitors with code, futuristic server room with glowing blue lights, abstract data visualization, close-up of hands typing on keyboard with holographic interface, modern tech startup office. Dark theme with neon highlights.",
        forbidden: "generic clipart, phone mockups, Islamic architecture" }
    ],
    [
      ["سياحة","رحلات","فندق","سفر","حجز","وجهة","tourism","travel","hotel","destination","resort"],
      { en: "tourism and travel",
        visualCues: "breathtaking travel destination landscape, luxury hotel pool overlooking scenic view, happy traveler at famous landmark, pristine beach or mountain view, premium resort experience. Vibrant travel photography.",
        forbidden: "phone mockups, generic icons, clipart" }
    ],
    [
      ["تعليم","دروس","تدريب","أكاديمية","دورات","مدرسة","education","school","academy","training","courses","learning"],
      { en: "education and training",
        visualCues: "engaged students in modern classroom, instructor teaching in professional setting, digital learning on tablet, books and study materials, graduation ceremony, inspiring educational environment. Warm motivational photography.",
        forbidden: "phone mockups, generic icons, cartoons" }
    ],
    [
      ["محامي","قانون","مستشار","law","lawyer","legal","attorney","justice"],
      { en: "legal services",
        visualCues: "professional lawyer at mahogany desk with law books, scales of justice, legal documents with professional pen, formal office with city view, authoritative and trustworthy setting. Dark professional tones.",
        forbidden: "cartoon, phone mockups, generic icons" }
    ],
    [
      ["لياقة","جيم","رياضة","تمرين","صالة","fitness","gym","workout","sport","training"],
      { en: "fitness and gym",
        visualCues: "athlete performing powerful workout, well-equipped modern gym interior, motivational fitness photography, person lifting weights or running, strong physique in dynamic pose, energy and determination. High contrast photography.",
        forbidden: "cartoon, generic icons, phone mockups" }
    ],
    [
      ["عطور","ساعات","مجوهرات","فاخر","luxury","perfume","watches","jewelry","fashion","couture"],
      { en: "luxury goods",
        visualCues: "product shot of luxury item on black marble with dramatic side lighting, close-up texture of premium material, elegant flat lay with gold accents, high-fashion editorial photography, opulence and exclusivity. Dark dramatic background.",
        forbidden: "cartoon, phone mockups, generic backgrounds" }
    ],
    [
      ["سيارات","مركبات","قطع غيار","تأجير سيارات","automotive","cars","vehicles","auto","rental"],
      { en: "automotive",
        visualCues: "sleek luxury car on dramatic road with motion blur, studio car photography with reflective floor, close-up of car interior with leather seats, car showroom with spotlights, dynamic driving shot on empty highway.",
        forbidden: "cartoon cars, phone mockups, generic icons" }
    ],
    [
      ["متجر","تسوق","منتجات","بيع","تجارة","ecommerce","store","shop","product","retail","online store"],
      { en: "retail and e-commerce",
        visualCues: "beautifully styled products flat lay on clean background, lifestyle product photography, colorful shopping experience, products arranged elegantly, premium packaging shot, modern retail environment, happy customer receiving package.",
        forbidden: "generic clipart, phone mockups, low quality stock photos" }
    ],
    [
      ["تقنية","برمجة","تطبيق","سوفتوير","استضافة","حلول رقمية","tech","software","it","programming","development","saas","digital"],
      { en: "technology and software",
        visualCues: "developer at dual-monitor workstation with code on screen, glowing server racks in data center, abstract data visualization with glowing nodes, team of developers collaborating, dark-theme coding environment with neon blue highlights.",
        forbidden: "phone mockups, cartoons, generic icons, Islamic architecture, unrelated objects" }
    ],
    [
      ["استشارات","استشارة أعمال","مستشار","إدارة","حلول تجارية","consulting","advisory","management","business solutions"],
      { en: "business consulting",
        visualCues: "confident business consultant presenting strategy on whiteboard, executive team in boardroom meeting, professional in suit pointing at charts and graphs, strategic planning session with city skyline in background, handshake sealing a deal.",
        forbidden: "cartoon, generic icons, phone mockups, unrelated backgrounds" }
    ],
    [
      ["شحن","لوجستيات","توصيل","نقل","مستودع","freight","logistics","shipping","delivery","warehouse","supply chain","cargo"],
      { en: "logistics and shipping",
        visualCues: "massive warehouse with forklifts and organized shelves, fleet of delivery trucks lined up, aerial view of shipping port with containers, driver handing package to smiling customer, logistics operations center with screens.",
        forbidden: "cartoon vehicles, generic icons, phone mockups" }
    ],
    [
      ["تنظيف","نظافة","جلي","تعقيم","مكافحة حشرات","cleaning","housekeeping","janitorial","sanitization","maid"],
      { en: "cleaning services",
        visualCues: "professional cleaner in uniform using high-powered equipment in sparkling clean space, before-and-after transformation of room, team of cleaners with eco-friendly supplies, gleaming hotel lobby or office after professional cleaning.",
        forbidden: "cartoon characters, generic icons, phone mockups" }
    ],
    [
      ["تصوير","فيديو","استوديو","مصور","إنتاج","photography","videography","studio","filmmaker","media production"],
      { en: "photography and videography",
        visualCues: "photographer framing a perfect shot with professional DSLR, elegant studio setup with professional lighting, beautiful portrait of subject in golden hour light, filmmaker with cinema camera on set, gallery wall of stunning photographs.",
        forbidden: "cartoon cameras, generic icons, phone mockups, clip art" }
    ],
    [
      ["مالية","محاسبة","استثمار","تأمين","ضرائب","بنك","finance","accounting","investment","insurance","bank","tax","financial"],
      { en: "financial services",
        visualCues: "professional financial advisor consulting client at modern desk, close-up of financial charts showing growth trends, confident executive with city skyline background, financial documents with gold pen, secure vault symbolizing trust.",
        forbidden: "cartoon money bags, generic icons, phone mockups, clichéd dollar signs" }
    ],
    [
      ["فندق","شقق مفروشة","منتجع","ضيافة","إقامة","hotel","resort","hospitality","accommodation","motel","inn"],
      { en: "hotel and hospitality",
        visualCues: "stunning hotel lobby with dramatic chandelier and marble floors, luxurious king bedroom with view, infinity pool overlooking city or sea, chef preparing gourmet dish in hotel restaurant, concierge welcoming guest.",
        forbidden: "cartoon hotel, phone mockups, generic icons, clip art" }
    ],
    [
      ["جمعية","خيرية","وقف","تبرع","منظمة","إنسانية","charity","foundation","nonprofit","ngo","donation","humanitarian"],
      { en: "charity and nonprofit",
        visualCues: "volunteers distributing aid to grateful community, children smiling after receiving help, hands of diverse people coming together in unity, community garden or school built by charity, emotional storytelling moment of impact.",
        forbidden: "generic icons, phone mockups, staged stock photos, clichéd imagery" }
    ],
    [
      ["فريلانسر","مستقل","عمل حر","خبير","محترف مستقل","freelance","freelancer","independent","solopreneur","remote worker"],
      { en: "freelancer and independent professional",
        visualCues: "creative professional working on laptop in stylish home office or co-working space, portfolio pieces displayed on sleek desk, focused individual with dual screens showing design work, comfortable modern workspace with personal branding elements.",
        forbidden: "generic office stock photos, phone mockups, cartoon characters" }
    ],
  ];

  for (const [keywords, config] of map) {
    if (keywords.some(k => t.includes(k))) return config;
  }

  // Generic fallback — still better than before
  return {
    en: topic,
    visualCues: `professional commercial photography directly representing: ${topic}. Real-world scene, high quality, modern Saudi/Gulf market aesthetic.`,
    forbidden: "phone mockups, mosque illustrations, abstract geometric patterns, generic business icons, unrelated subjects",
  };
}

export async function generateSocialPostImage(
  topic: string,
  platform: string,
  language: string = "ar",
  postContent?: string
): Promise<{ url: string; revisedPrompt?: string }> {

  const platformStyle: Record<string, string> = {
    instagram: "vibrant, high-contrast, Instagram-worthy, lifestyle photography, bright and aesthetic",
    twitter: "clean, bold, impactful, minimal, eye-catching, high contrast",
    facebook: "warm, engaging, professional yet approachable, community feel",
    linkedin: "professional, corporate, clean, polished, business-oriented",
    tiktok: "trendy, dynamic, youthful, energetic, Gen-Z aesthetic",
    youtube: "cinematic, thumbnail-style, high contrast, dramatic lighting",
  };

  const style = platformStyle[platform] || "professional, high quality, modern, commercial photography";
  const biz = detectImageBusinessType(topic);

  // Extract key action/subject from postContent for stronger relevance
  const contextHint = postContent
    ? `Additional context: ${postContent.slice(0, 150).replace(/[^\u0600-\u06FF\w\s.,!?]/g, "")}`
    : "";

  const imagePrompt = `Photorealistic professional social media image for ${platform}, square format (1:1).

SUBJECT: ${biz.en}
TOPIC: ${topic}
${contextHint}

WHAT TO SHOW IN THE IMAGE:
${biz.visualCues}

STYLE: ${style}, premium quality, Saudi/Gulf market

STRICT RULES:
- NO text, letters, words, or Arabic calligraphy anywhere in the image
- FORBIDDEN elements: ${biz.forbidden}
- The image MUST clearly and directly represent: ${topic}
- Real photography style, not illustration or clipart
- Single clear focal point, professional composition
- Image must be 100% relevant to the topic — NO generic or unrelated content`;

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: imagePrompt,
    n: 1,
    size: "1024x1024",
    quality: "hd",
  });

  const imageUrl = response.data?.[0]?.url;
  if (!imageUrl) throw new Error("No image generated");

  return {
    url: imageUrl,
    revisedPrompt: response.data?.[0]?.revised_prompt,
  };
}

// ─── Smart command pre-processor ────────────────────────────────────────────

function extractBusinessTypeFromHtml(html: string): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").toLowerCase();
  const map: Array<[string, string[]]> = [
    ["مطعم أو مقهى",              ["مطعم","مقهى","أكل","وجبات","قهوة","مشوي","شاورما","برغر","restaurant","cafe","coffee","food","menu","شيف"]],
    ["عيادة أو مستشفى",           ["عيادة","دكتور","طبيب","صحة","مريض","مستشفى","استشارة طبية","clinic","doctor","medical","health","hospital","pharma"]],
    ["وكالة تسويق وإعلانات",       ["تسويق","إعلانات","برندينج","محتوى","ميديا","نشر تجاري","marketing","agency","advertising","branding","media"]],
    ["متجر إلكتروني",              ["متجر","تسوق","منتج","شراء","سلة","تجارة إلكترونية","store","shop","cart","product","ecommerce","online store"]],
    ["شركة تقنية ومعلومات",        ["تقنية","برمجة","تطبيق","سوفتوير","ذكاء اصطناعي","استضافة","حلول رقمية","tech","software","app","saas","ai","development","it","programming"]],
    ["مكتب محاماة وقانوني",        ["محامي","قانون","مستشار قانوني","عقود","law","lawyer","legal","attorney","justice"]],
    ["شركة عقارية",               ["عقار","شقق","مباني","عمارة","أراضي","فلل","تطوير عقاري","real estate","property","realty","villa","apartment"]],
    ["صالون تجميل وعناية",         ["صالون","مكياج","تجميل","كوافير","عناية بالبشرة","سبا","spa","salon","beauty","makeup","hair","skincare","nail"]],
    ["فندق ومنتجع",               ["فندق","منتجع","شقق مفروشة","إقامة","ضيافة","hotel","resort","hospitality","accommodation","motel","inn"]],
    ["شركة سياحة وسفر",           ["سياحة","رحلات","حجز","سفر","وجهات","tourism","travel","booking","destination","tour"]],
    ["مدرسة أو أكاديمية",         ["تعليم","دروس","تدريب","أكاديمية","دورات","مدرسة","school","academy","training","education","courses","learning"]],
    ["شركة مقاولات وإنشاء",        ["مقاولات","بناء","إنشاء","تشييد","هندسة مدنية","عمران","بنية تحتية","construction","contracting","building","civil engineering"]],
    ["شركة لوجستية وشحن",         ["شحن","لوجستيات","توصيل","نقل بضائع","مستودع","freight","logistics","shipping","delivery","warehouse","supply chain","cargo"]],
    ["خدمات تنظيف",               ["تنظيف","نظافة","جلي","تعقيم","مكافحة حشرات","cleaning","housekeeping","janitorial","sanitization","pest control"]],
    ["استوديو تصوير",             ["تصوير","فيديو","استوديو","مصور","إنتاج مرئي","photography","videography","studio","filmmaker","media production"]],
    ["خدمات مالية ومحاسبة",        ["محاسبة","مالية","استثمار","تأمين","ضرائب","بنك","تدقيق","finance","accounting","investment","insurance","bank","tax","financial","audit"]],
    ["جمعية خيرية",               ["جمعية","خيرية","وقف","تبرع","إنسانية","منظمة غير ربحية","charity","foundation","nonprofit","ngo","donation","humanitarian"]],
    ["استشارات أعمال",             ["استشارات","استراتيجية","تطوير أعمال","إدارة","حلول تجارية","consulting","advisory","management consulting","business development","strategy"]],
    ["مستقل (فريلانسر)",           ["فريلانسر","مستقل","عمل حر","خبير مستقل","freelance","freelancer","independent","solopreneur","remote worker"]],
    ["صالة رياضية ولياقة",         ["لياقة","جيم","رياضة","تمرين","صالة رياضية","fitness","gym","workout","sport","training","crossfit"]],
    ["سيارات وخدمات السيارات",      ["سيارات","مركبات","قطع غيار","تأجير سيارات","صيانة سيارات","cars","automotive","vehicles","auto","car rental","garage"]],
    ["منتجات فاخرة وعطور",         ["عطور","ساعات","مجوهرات","فاخر","بريستيج","luxury","perfume","watches","jewelry","fashion","premium","couture"]],
    ["أحداث وفعاليات",            ["فعاليات","حفلات","مؤتمرات","أعراس","تنظيم فعاليات","events","conferences","weddings","parties","event planning"]],
    ["بورتفوليو إبداعي",           ["بورتفوليو","مصمم","فنان","إبداع","أعمالي","portfolio","designer","artist","creative","my work"]],
  ];
  for (const [type, keywords] of map) {
    if (keywords.some(k => text.includes(k))) return type;
  }
  return "خدمات متنوعة";
}

function enhanceVagueCommand(command: string, html: string, projectName: string, desc: string, lang: string): string {
  // ── "أين X" / "where is X" — user wants X ADDED, not existing content deleted ──
  const whereIsPatterns = [
    /^[أا]ين\s+(.+)$/i,
    /^وين\s+(.+)$/i,
    /^فين\s+(.+)$/i,
    /^where\s+is\s+(.+)$/i,
    /^where'?s\s+(.+)$/i,
  ];
  for (const p of whereIsPatterns) {
    const m = command.match(p);
    if (m) {
      const what = m[1].trim();
      // Burger menu special case
      const isBurger = /منيو\s*برجر|برجر\s*منيو|hamburger|burger\s*menu|قائمة.*جانب|قائمة.*منسدل/i.test(what);
      if (isBurger) {
        return lang === "ar"
          ? `أضف قائمة برجر (hamburger menu) في الناف بار للجوال إذا لم تكن موجودة بالفعل. لا تحذف أي عنصر موجود في الناف بار أو في الموقع.
[[[INTERNAL — HAMBURGER MENU ADD ONLY]]]
المستخدم يسأل "أين منيو برجر" — هذا يعني إضافته، وليس حذف الناف بار.
الإجراء المطلوب:
1. إذا كان id="aw-menu-btn" موجوداً بالفعل → لا تفعل شيئاً، وأخبر المستخدم أنه موجود
2. إذا لم يكن موجوداً → أضف زر الهامبرجر للناف بار فقط (انظر قواعد MOBILE HAMBURGER MENU في التعليمات)
❌ ممنوع تماماً حذف أي عنصر من الناف بار أو الموقع
[[[END INTERNAL]]]`
          : `Add a hamburger menu to the navbar for mobile if it doesn't already exist. Do NOT remove any existing navbar or page content.
[[[INTERNAL — HAMBURGER MENU ADD ONLY]]]
User asked "where is burger menu" — they want it ADDED, not any content deleted.
1. If id="aw-menu-btn" already exists → do nothing, tell user it's already there
2. If it doesn't exist → add hamburger button to navbar only
❌ NEVER delete any existing navbar element or page section
[[[END INTERNAL]]]`;
      }
      // Generic "where is X" → add X
      return lang === "ar"
        ? `أضف "${what}" إذا لم يكن موجوداً بالفعل في الموقع. لا تحذف أي محتوى موجود.
[[[INTERNAL — ADD MISSING ELEMENT]]]
المستخدم يسأل "أين ${what}" — هذا يعني أنه يريد إضافته إذا كان مفقوداً، وليس حذف أي شيء.
❌ ممنوع حذف أي عنصر موجود في الناف بار أو الموقع
✅ فقط أضف "${what}" بشكل لائق يتناسب مع تصميم الموقع الحالي
[[[END INTERNAL]]]`
        : `Add "${what}" to the website if it doesn't already exist. Do NOT remove any existing content.
[[[INTERNAL — ADD MISSING ELEMENT]]]
User is asking "where is ${what}" — they want it ADDED if missing, not any existing content deleted.
❌ NEVER delete any existing navbar element or page section
✅ Only ADD "${what}" in a way that fits the current design
[[[END INTERNAL]]]`;
    }
  }

  // ── Luxury/elegance upgrade patterns ──
  const luxuryPatterns = [
    /[أا]جعل?\s*(التصميم|الموقع|الشكل|المظهر)\s*(فخم|أنيق|راقي|احترافي|أجمل|أفضل|أكثر\s*فخامة|أكثر\s*أناقة)/i,
    /[أا]جعله?\s*(فخم|أنيق|راقي|أجمل|أفضل|احترافي)/i,
    /فخم\s*وأنيق|أنيق\s*وفخم|أكثر\s*فخامة|أكثر\s*أناقة/i,
    /make\s+(it|the\s+design|the\s+website)\s+(luxury|elegant|premium|beautiful|better|more\s+elegant)/i,
    /luxury\s*(design|style|look)|elegant\s*(design|style)|premium\s*(look|design)/i,
    /حسّن\s*(التصميم|الشكل|المظهر)/i,
    /upgrade\s+(the\s+)?(design|look|style)/i,
  ];
  const isLuxury = luxuryPatterns.some(p => p.test(command));
  if (isLuxury) {
    const biz = extractBusinessTypeFromHtml(html) || "business";
    return lang === "ar"
      ? `${command}
[[[INTERNAL — DO NOT SHOW — MANDATORY LUXURY REDESIGN]]]
اجعل التصميم يبدو فاخراً وراقياً بتطبيق هذه التغييرات بشكل شامل:

✅ لون الخلفية: استبدل كل الخلفيات الفاتحة بألوان داكنة عميقة (#0a0a0a أو #0f172a أو #060818)
✅ ألوان الأزرار: زر CTA الرئيسي يجب أن يكون بتدرج راقي من لون واحد (مثال: #d4a843 → #b8860b) أو (#7c3aed → #4f46e5). ممنوع تماماً أي تدرج يخلط ألوان غير متناسقة (أزرق + أصفر، أخضر + برتقالي، إلخ)
✅ الأزرار: استخدم border-radius:12px، padding:14px 26px، font-weight:600، box-shadow:0 6px 16px rgba(0,0,0,0.15) 0 2px 4px rgba(0,0,0,0.1) inset 0 1px 0 rgba(255,255,255,0.15)، hover: translateY(-2px)+ظل أقوى، active: translateY(1px)
✅ الكروت: خلفية داكنة، حدود رفيعة بلون ذهبي (#d4a843) أو Primary بشفافية 30%، ظل خفيف
✅ الخطوط: زد letter-spacing على العناوين، line-height أكثر راحة، font-weight:900 للعناوين الكبيرة
✅ أزل كل العناصر "الرخيصة": لا تدرجات قوس قزح، لا إطارات نيون بارزة، لا تجمّع بصري
✅ الأقسام: زد padding (6rem 2rem) ليشعر بالاتساع والفخامة
✅ احتفظ بكل المحتوى الحالي — غير الشكل فقط وليس المحتوى
[[[END INTERNAL]]]`
      : `${command}
[[[INTERNAL — DO NOT SHOW — MANDATORY LUXURY REDESIGN]]]
Transform the entire design into a luxury, high-end look:

✅ Background: Replace all light backgrounds with deep darks (#0a0a0a, #0f172a, #060818)
✅ CTA Buttons: Use single-hue elegant gradient (e.g., #d4a843 → #b8860b or #7c3aed → #4f46e5). NEVER mix unrelated hues (blue+yellow, green+orange, etc.)
✅ Button style: border-radius:12px, padding:14px 26px, font-weight:600, box-shadow:0 6px 16px rgba(0,0,0,0.15) and 0 2px 4px rgba(0,0,0,0.1) and inset 0 1px 0 rgba(255,255,255,0.15); hover:translateY(-2px)+stronger shadow; active:translateY(1px)
✅ Cards: dark background, thin gold/accent border, subtle shadow — no garish gradients inside cards
✅ Typography: increase letter-spacing on headings, more line-height, font-weight:900 for big titles
✅ Remove "cheap" elements: no rainbow gradients, no harsh neon, no cluttered layouts
✅ Sections: increase padding (6rem 2rem) for a spacious premium feel
✅ Preserve all existing content — change visual style only, not content
[[[END INTERNAL]]]`;
  }

  const vaguePatterns = [
    /[أا]ر?يدك?\s*([أا]ن\s*)?ت?ضيف?\s*(من\s*)?(محتوى|قسم|كونتنت)/i,
    /[أا]ضف?\s*محتوى\s*(احتراف|مميز|جيد)/i,
    /add\s+(professional|good|more)\s+content/i,
    /ضيف?\s*محتوى/i,
    /زود?\s*محتوى/i,
    /[أا]ضف\s+محتوى/i,
    /اضافة\s+محتوى/i,
    /حسّن\s+الموقع/i,
    /make\s+it\s+better/i,
    /improve\s+(the\s+)?website/i,
  ];
  const isVague = vaguePatterns.some(p => p.test(command));
  if (!isVague) return command;

  const biz = extractBusinessTypeFromHtml(html) || "خدمات متنوعة";

  return lang === "ar"
    ? `${command}
[[[INTERNAL — DO NOT SHOW THIS TEXT — MANDATORY INSTRUCTIONS FOR AI]]]
نوع النشاط التجاري المستخرج من الموقع: "${biz}"
اسم المشروع: "${projectName}"
الوصف: "${desc}"

أضف قسماً حقيقياً ومحدداً يناسب هذا النوع من المشاريع. أمثلة حسب النوع:
- مطعم/مقهى → قائمة طعام حقيقية مع أسماء الأطباق والأسعار بالريال (مثال: "شاورما دجاج مشوي - 25 ريال")
- عيادة → قائمة تخصصات طبية حقيقية مع أوقات الدوام وآلية الحجز
- وكالة تسويق → معرض أعمال حقيقي مع وصف مشاريع منجزة وأرقام النجاح
- متجر إلكتروني → عرض منتجات حقيقية مع صور وأسعار وتقييمات
- شركة تقنية → قائمة مميزات/منتجات حقيقية مع شرح تفصيلي
- مكتب قانوني → قائمة الخدمات القانونية مع الخبرات والتخصصات
- عقارية → عرض وحدات عقارية مع المواصفات والأسعار

محظور تماماً:
❌ لا تضف عنواناً يقول "محتوى احترافي" أو "قسم جديد" أو "Professional Content" أو "New Section"
❌ لا تستخدم محتوى مقتعباً (Lorem Ipsum أو "خدمة 1")
✅ استخدم محتوى حقيقياً يصلح لموقع فعلي ويعكس طبيعة النشاط
[[[END INTERNAL]]]`
    : `${command}
[[[INTERNAL — DO NOT SHOW THIS TEXT — MANDATORY INSTRUCTIONS FOR AI]]]
Detected business type from website: "${biz}"
Project name: "${projectName}"
Description: "${desc}"

Add a REAL, specific section matching this business type:
- Restaurant/cafe → Real menu with dish names & SAR prices
- Clinic → Real medical specialties with availability & booking
- Marketing agency → Real portfolio with project details & results
- E-commerce → Real products with images & prices
- Tech company → Real features/product list with detailed explanations
- Law firm → Real legal services with specializations

STRICTLY FORBIDDEN:
❌ Never use section titles like "محتوى احترافي", "Professional Content", "New Section", or "قسم جديد"
❌ Never use placeholder text
✅ Generate content that a real business owner would actually put on their site
[[[END INTERNAL]]]`;
}

// ────────────────────────────────────────────────────────────────────────────

export async function editWebsiteWithAI(currentHtml: string, currentCss: string, editCommand: string, language: string = "ar", imageDataUrl?: string, projectName?: string, projectDescription?: string): Promise<{ html: string; css: string; summary: string }> {
  const isArabic = language === "ar";

  // Pre-process vague commands before sending to AI
  const enhancedCommand = enhanceVagueCommand(editCommand, currentHtml, projectName || "", projectDescription || "", language);

  const businessContext = projectName || projectDescription
    ? `\nBUSINESS CONTEXT (use this to generate relevant real content):
- Business/Website Name: ${projectName || "Not specified"}
- Description: ${projectDescription || "Not specified"}
- Detected business type: ${extractBusinessTypeFromHtml(currentHtml)}
- Always use this context when generating content, names, services, pricing, etc.\n`
    : "";

  const systemPrompt = `You are a world-class AI web designer for the Saudi/Arab market — like a combination of Wix ADI and GitHub Copilot. You deeply understand the user's INTENT, not just their literal words.
${businessContext}
INTELLIGENT INTENT INTERPRETATION:
When the user gives a command, analyze what they ACTUALLY want:

- "أضف محتوى احترافي" / "add professional content" → Look at the existing website's industry/type and ADD REAL content:
  * For a restaurant: add a menu section with real dish names and prices
  * For a law firm: add a practice areas section with real legal services
  * For a clinic: add a services section with real medical specialties
  * For a tech company: add a features or product section with real benefits
  NEVER add a section literally called "محتوى احترافي" or "Professional Content"

- "حسّن الموقع" / "make it better" / "improve" → Upgrade design quality:
  * Improve typography (font sizes, weights, line-height)
  * Add smooth CSS animations (fadeIn, slideUp, hover effects)
  * Improve color contrast and visual hierarchy
  * Add subtle gradients and shadows
  * Make spacing more professional

- "أضف قسم الأسعار" / "add pricing section" → Add REAL pricing cards:
  * Generate 3 realistic pricing tiers (Basic/Pro/Business or similar)
  * Use prices appropriate for the market (e.g., 99 SAR / 199 SAR / 399 SAR)
  * Include realistic feature lists relevant to the business

- "أضف فريق العمل" / "add team section" → Add realistic team profiles:
  * Use Arab names (e.g., محمد الشمري, نورة القحطاني, خالد العتيبي)
  * Give them realistic roles matching the business type
  * Add professional Unsplash portrait photos

- "أضف شهادات العملاء" / "add testimonials" → Add 3 realistic reviews:
  * Arab names, realistic roles
  * Specific, detailed reviews (not generic)
  * 5-star ratings

- "غيّر الألوان" / "change colors" → Intelligently pick a professional new palette
- "أضف خريطة" / "add map" → Add a Google Maps embed for a relevant city
- "أضف فيديو" / "add video" → Add a YouTube embed with an appropriate video

CONTENT RULES (NEVER VIOLATE):
1. NEVER add a section with a generic/placeholder title like "محتوى احترافي", "Content Section", "New Section", "قسم جديد", "Section Title", "Placeholder", "قسم 1", etc.
2. ALWAYS generate REAL, specific content relevant to the website's business type
3. When adding services, use real service names, not "Service 1", "Service 2"
4. When adding team members, use real Arab names and realistic job titles
5. When adding testimonials, write specific, believable reviews
6. Use real Unsplash images with appropriate photo IDs based on the content type
7. NEVER use UI platform words as navigation links — the words "نشر", "معاينة", "تعديل", "dashboard", "editor" must NEVER appear as nav buttons/links in the generated website HTML. These words belong to the ArabyWeb editor interface, not to client websites. Use business-appropriate navigation like: "الرئيسية", "خدماتنا", "من نحن", "تواصل معنا", "أعمالنا", "المنتجات", etc.

TECHNICAL GUIDELINES:
- Maintain existing design quality and style UNLESS the command is asking for a full redesign (luxury/elegant/premium/better design) — in that case, apply full visual transformation
- Use professional fonts: ${isArabic ? "Cairo (headings), Tajawal (body)" : "Inter/Poppins (headings), Inter (body)"}
- Use Unsplash: https://images.unsplash.com/photo-{ID}?w=800&h=600&fit=crop
- Use inline SVG Lucide-style icons when adding icons
- Preserve responsive design (add @media queries for new content)
- Keep all existing sections unless explicitly asked to remove
${imageDataUrl ? `- IMAGE ATTACHED — LOGO REPLACEMENT (MANDATORY):
  1. Find the element with id="aw-ai-logo" (the AI-generated SVG logo in the navbar).
  2. REPLACE THE ENTIRE SVG ELEMENT (including opening <svg ...> and closing </svg>) with: <img id="aw-ai-logo" src="__AW_IMG_001__" alt="logo" style="height:44px;width:auto;object-fit:contain;display:block;">
  3. Also find id="aw-ai-logo-footer" and replace with: <img id="aw-ai-logo-footer" src="__AW_IMG_001__" alt="logo" style="height:32px;width:auto;object-fit:contain;display:block;">
  4. If neither id is found, replace the hero background image src with __AW_IMG_001__ instead.
  5. __AW_IMG_001__ is a placeholder — the system replaces it with the real image automatically. Never use a data:image URL.` : ""}

⚠️ CRITICAL ANTI-DESTRUCTIVE RULES (HIGHEST PRIORITY):
- NEVER delete or remove the navbar/nav element. If you need to modify it, only ADD to it.
- NEVER delete existing page sections (hero, services, gallery, contact, footer, etc.) unless the user EXPLICITLY says "remove" or "delete" or "احذف" or "أزل".
- If the user asks WHERE something is ("أين X"/"where is X"), they want it ADDED — never delete anything.
- "أين منيو برجر" = ADD a hamburger menu — do NOT touch, delete, or restructure the existing navbar.
- Preserve ALL existing content: text, images, links, and structure — only ADD or MODIFY as requested.

PRESERVE CRITICAL ELEMENTS (NEVER REMOVE OR MODIFY):
- NEVER remove or change the element with id="aw-lang-btn" (language toggle button). It must stay in the navbar exactly as-is.
- NEVER remove or change the element with id="aw-menu-btn" (hamburger button). It must stay in the navbar exactly as-is.
- NEVER remove or change the element with id="aw-mobile-menu" (mobile nav overlay). It must stay exactly as-is.
- If these elements don't exist in the current HTML, you may add them — but if they DO exist, preserve them completely.

MOBILE HAMBURGER MENU RULES:
- If the navbar ALREADY has id="aw-menu-btn" → do NOT touch it, do NOT add another hamburger anywhere.
- If the navbar does NOT have id="aw-menu-btn" → add hamburger ONLY to the <nav> element:
  * The <nav> MUST have style="position:fixed;top:0;left:0;right:0;z-index:9999"
  * Add: <button id="aw-menu-btn" style="display:none;background:none;border:none;cursor:pointer;padding:8px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
  * Add: <div id="aw-mobile-menu" style="display:none;position:fixed;top:60px;left:0;right:0;background:#fff;padding:0.5rem 0;z-index:9998;box-shadow:0 8px 24px rgba(0,0,0,0.15)"></div>
  * In CSS: @media(max-width:768px){.aw-nav-links{display:none!important;}#aw-menu-btn{display:block!important;}}
  * NEVER place the hamburger button or mobile menu outside the navbar or in page content sections.

Return ONLY a JSON object with these 3 fields:
{
  "html": "complete updated HTML",
  "css": "complete updated CSS",
  "summary": "${isArabic ? "رسالة قصيرة بالعربية (1-2 جملة) تصف ما تم تغييره بالضبط. كن محدداً وودياً. مثال: 'تم إضافة قسم الأسعار مع 3 باقات احترافية ✅'" : "Short English message (1-2 sentences) describing exactly what changed. Be specific. Example: 'Added a 3-tier pricing section with SAR prices tailored to your business ✅'"}"
}

No markdown, no code blocks, no explanation outside the JSON.`;

  // NOTE: We use a placeholder __AW_IMG_001__ instead of embedding the raw base64 data URL
  // in the prompt. The server replaces the placeholder with the real image after AI responds.
  const userContent = `Current HTML:\n${currentHtml}\n\nCurrent CSS:\n${currentCss}\n\nEdit instruction: "${enhancedCommand}"\n\nLanguage: ${isArabic ? "Arabic (RTL)" : "English (LTR)"}${imageDataUrl ? "\n\n[IMAGE ATTACHED — use src='__AW_IMG_001__' for it as instructed in the system prompt]" : ""}`;

  // Try primary model, fall back to gpt-4o on failure
  let rawContent = "";
  const primaryModel = getModel();
  const fallbackModels = primaryModel !== "gpt-4o" ? ["gpt-4o", "gpt-4o-mini"] : ["gpt-4o-mini"];

  try {
    const response = await openai.chat.completions.create({
      model: primaryModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent as any },
      ],
      max_completion_tokens: 10000,
      temperature: 0.3,
    });
    rawContent = response.choices[0]?.message?.content || "";
  } catch (primaryErr: any) {
    console.warn(`Primary model (${primaryModel}) failed: ${primaryErr?.message}. Trying fallback...`);
    let lastErr = primaryErr;
    for (const fallback of fallbackModels) {
      try {
        const resp = await openai.chat.completions.create({
          model: fallback,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent as any },
          ],
          max_completion_tokens: 10000,
          temperature: 0.3,
        });
        rawContent = resp.choices[0]?.message?.content || "";
        lastErr = null;
        break;
      } catch (fbErr: any) {
        console.warn(`Fallback model (${fallback}) also failed: ${fbErr?.message}`);
        lastErr = fbErr;
      }
    }
    if (lastErr) throw lastErr;
  }

  const content = rawContent;
  try {
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    // Sanitize nav links after edit too
    const navMap: Record<string, string> = {
      "/about": "#about", "/about-us": "#about", "/services": "#services",
      "/our-services": "#services", "/gallery": "#gallery", "/portfolio": "#gallery",
      "/testimonials": "#testimonials", "/reviews": "#testimonials",
      "/contact": "#contact", "/contact-us": "#contact",
    };
    let html = parsed.html || currentHtml;
    for (const [path, anchor] of Object.entries(navMap)) {
      html = html.replace(new RegExp(`href=["']${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`, "gi"), `href="${anchor}"`);
    }
    // Sanitize platform UI words from nav (in case AI added them)
    const platformWords: Array<[RegExp, string]> = [
      [/>نشر الآن</g, ">احجز الآن<"],
      [/>نشر</g, ">الرئيسية<"],
      [/>معاينة</g, ">خدماتنا<"],
      [/>تعديل</g, ">من نحن<"],
    ];
    html = html.replace(/<(nav|header)[^>]*>[\s\S]*?<\/(nav|header)>/gi, (navBlock: string) => {
      let replaced = navBlock;
      for (const [p, r] of platformWords) { replaced = replaced.replace(p, r); }
      return replaced;
    });
    let css = parsed.css || currentCss;
    if (!css.includes("scroll-behavior")) css = "html { scroll-behavior: smooth; }\n" + css;
    const summary = parsed.summary || (isArabic ? "تم تطبيق التعديلات ✅" : "Changes applied ✅");
    return { html, css, summary };
  } catch {
    return { html: currentHtml, css: currentCss, summary: isArabic ? "تم تطبيق التعديلات ✅" : "Changes applied ✅" };
  }
}

import { buildInstantWebsite, type BilingualBusinessContent, type ExtraLang } from "./instant-templates";

const EXTRA_LANG_NAMES: Record<string, string> = {
  fr: "French",
  tr: "Turkish",
  ru: "Russian",
  de: "German",
  zh: "Chinese (Simplified)",
};

export async function generateInstantWebsite(
  prompt: string,
  language: string = "ar",
  languages: string[] = ["ar"],
  primaryWebsiteLang: string = "ar"
): Promise<GeneratedWebsite> {
  const isArabic = language === "ar";
  const emailSlug = prompt.toLowerCase().replace(/[^a-z]/g, "").slice(0, 10) || "business";

  // Find extra language (first non-ar, non-en in languages array)
  const extraLangCode = languages.find(l => l !== "ar" && l !== "en");
  const extraLangName = extraLangCode ? (EXTRA_LANG_NAMES[extraLangCode] || extraLangCode) : null;

  const needsEnglish = languages.includes("en");
  const langsList = [
    "Arabic",
    ...(needsEnglish ? ["English"] : []),
    ...(extraLangName ? [extraLangName] : [])
  ].join(", ");

  const systemPrompt = `You are an elite website content strategist and copywriter specializing in the Saudi/Arab market. You produce conversion-optimized, psychologically compelling, 100% authentic website content — never generic filler, never clichés. Think like a top agency copywriter who deeply researches each business before writing a single word.

═══════════════════════════════════════
BUSINESS TYPE MAPPING (MANDATORY)
═══════════════════════════════════════
The prompt starts with "نوع النشاط: X" — this is the PRIMARY signal for business_type:
  مطعم وكافيه         → "restaurant"
  عيادة وصحة          → "medical"
  تجميل وعناية        → "beauty"
  تعليم وتدريب        → "education"
  عقارات              → "realestate"
  تقنية ومتاجر        → detect from desc: software/apps="tech", online store="ecommerce"
  تصميم وإبداع        → "agency"
  فعاليات             → "events"
  خدمات وأعمال        → detect: نظافة/تنظيف="cleaning", نقل/شحن="logistics", بناء/مقاولات="agency", كهرباء/صيانة="general"
  محاماة واستشارات    → "legal" or "consulting"
  موقع شخصي          → "portfolio"
  رومانسي / هدية      → "general"

NEVER use the business NAME to determine its type. "نور" could be a clinic, restaurant, or tech company.

═══════════════════════════════════════
QUALITY STANDARDS — NON-NEGOTIABLE
═══════════════════════════════════════
1. HERO TITLES must be VALUE PROPOSITIONS — what the customer GETS, not what you do:
   ✓ "أسنانك أبيض خلال 45 دقيقة فقط"  ✓ "وجبات أصيلة تُذكّرك بمطبخ جدتك"
   ✗ "عيادة أسنان متخصصة"              ✗ "مطعم متميز للعائلة"

2. ABOUT TEXT must tell a compelling STORY: why this business was founded, what problem it solves, what makes it different from competitors, why customers choose them specifically.

3. ALL 6 SERVICES must be hyper-specific to what this EXACT business offers — no generic "خدمة عملاء" or "جودة عالية". Real service names with real descriptions.

4. TESTIMONIALS must sound AUTHENTICALLY HUMAN:
   - Use realistic Saudi/Arab names (محمد القحطاني، نورة الشمري، عبدالله العتيبي، رنا المطيري...)
   - Include SPECIFIC details that make it feel real (timeframe, result, specific service used)
   - Natural speech, not marketing-speak
   - 3 testimonials covering different customer segments

5. COLORS must match the brand personality AND industry expectations:
   - Restaurant: warm oranges/reds, appetite-stimulating
   - Medical: trust blues, clean whites
   - Beauty: soft pinks/purples, feminine luxury  
   - Tech: modern blues/purples, professional
   - Legal: navy/gold, authority and trust
   - Education: optimistic greens/blues
   - Real estate: premium grays/golds

6. Generate content in ${langsList} — every field must be authentic translation, not just word-for-word literal copy.

7. Return ONLY valid JSON. No markdown, no explanation, no commentary.`;


  const extraLangBlock = extraLangCode && extraLangName ? `
  "business_name_${extraLangCode}": "brand name in ${extraLangName}",
  "${extraLangCode}": {
    "hero_title": "compelling ${extraLangName} headline, max 8 words",
    "hero_subtitle": "engaging ${extraLangName} subtitle, 1-2 sentences",
    "about_title": "${extraLangName} about section heading",
    "about_text": "2-3 ${extraLangName} sentences about the business",
    "services": [
      {"title": "${extraLangName} service name", "desc": "${extraLangName} short description"},
      {"title": "${extraLangName} service name", "desc": "${extraLangName} short description"},
      {"title": "${extraLangName} service name", "desc": "${extraLangName} short description"},
      {"title": "${extraLangName} service name", "desc": "${extraLangName} short description"},
      {"title": "${extraLangName} service name", "desc": "${extraLangName} short description"},
      {"title": "${extraLangName} service name", "desc": "${extraLangName} short description"}
    ],
    "cta_text": "${extraLangName} CTA button text, 2-4 words",
    "contact_description": "1-2 ${extraLangName} sentences inviting contact",
    "address": "${extraLangName === "Arabic" ? "المملكة العربية السعودية" : "Saudi Arabia"}",
    "seo_title": "${extraLangName} SEO title max 60 chars",
    "seo_description": "${extraLangName} meta description 150-155 chars"
  },` : "";

  const userPrompt = `Business request: "${prompt}"

Generate complete, professional, conversion-optimized website content. Return this EXACT JSON:
{
  "business_name_ar": "brand name in Arabic (keep original if given)",
  "business_name_en": "brand name in English",${extraLangBlock}
  "business_type": "EXACT match from: restaurant|agency|startup|portfolio|medical|general|legal|beauty|realestate|education|events|automotive|luxury|gym|ecommerce|tech|consulting|logistics|cleaning|photography|finance|hotel|charity|freelance",
  "ar": {
    "hero_title": "POWERFUL value-proposition headline in Arabic, max 8 words — what the customer GETS",
    "hero_subtitle": "1-2 compelling Arabic sentences that build desire and trust",
    "about_title": "Creative Arabic section heading (NOT just 'من نحن')",
    "about_text": "3 Arabic sentences: (1) founding story/mission, (2) what makes this business unique, (3) promise to the customer",
    "services": [
      {"title": "Specific service name", "desc": "Specific 1-sentence description mentioning a real benefit"},
      {"title": "Specific service name", "desc": "Specific 1-sentence description mentioning a real benefit"},
      {"title": "Specific service name", "desc": "Specific 1-sentence description mentioning a real benefit"},
      {"title": "Specific service name", "desc": "Specific 1-sentence description mentioning a real benefit"},
      {"title": "Specific service name", "desc": "Specific 1-sentence description mentioning a real benefit"},
      {"title": "Specific service name", "desc": "Specific 1-sentence description mentioning a real benefit"}
    ],
    "cta_text": "Action-oriented Arabic CTA, 2-4 words",
    "contact_description": "1-2 warm Arabic sentences inviting customers to reach out",
    "address": "المملكة العربية السعودية",
    "seo_title": "Arabic SEO title with business name + main keyword, max 60 chars",
    "seo_description": "Arabic meta description with main value prop + CTA, 150-155 chars"
  },
  ${needsEnglish ? `"en": {
    "hero_title": "POWERFUL English value-proposition headline, max 8 words",
    "hero_subtitle": "1-2 compelling English sentences that build desire and trust",
    "about_title": "Creative English section heading",
    "about_text": "3 English sentences: founding story, uniqueness, promise to customer",
    "services": [
      {"title": "Specific service name", "desc": "Specific 1-sentence description with a real benefit"},
      {"title": "Specific service name", "desc": "Specific 1-sentence description with a real benefit"},
      {"title": "Specific service name", "desc": "Specific 1-sentence description with a real benefit"},
      {"title": "Specific service name", "desc": "Specific 1-sentence description with a real benefit"},
      {"title": "Specific service name", "desc": "Specific 1-sentence description with a real benefit"},
      {"title": "Specific service name", "desc": "Specific 1-sentence description with a real benefit"}
    ],
    "cta_text": "Action-oriented English CTA, 2-4 words",
    "contact_description": "1-2 warm English sentences inviting customers to reach out",
    "address": "Saudi Arabia",
    "seo_title": "English SEO title with business name + main keyword, max 60 chars",
    "seo_description": "English meta description with main value prop + CTA, 150-155 chars"
  },` : ""}
  "testimonials": [
    {
      "name": "Realistic Saudi/Arab full name (e.g. محمد القحطاني)",
      "role_ar": "their job or description in Arabic (e.g. ربة منزل، رجل أعمال)",
      "role_en": "their role in English",
      "text_ar": "2-3 sentences in natural Arabic — specific details about their experience, result they got, why they recommend this business",
      "text_en": "2-3 sentences natural English translation"
    },
    {
      "name": "Different realistic Arabic name",
      "role_ar": "different customer segment role",
      "role_en": "role in English",
      "text_ar": "Different specific testimonial with a different angle/benefit",
      "text_en": "Natural English version"
    },
    {
      "name": "Third realistic Arabic name",
      "role_ar": "another customer type",
      "role_en": "role in English",
      "text_ar": "Third unique testimonial covering yet another benefit/feature",
      "text_en": "Natural English version"
    }
  ],
  "phone": "+966 5X XXX XXXX (realistic Saudi format)",
  "email": "info@${emailSlug}.sa",
  "primary_color": "#hexcolor — must fit the industry's visual language",
  "accent_color": "#hexcolor — complementary, creates visual harmony"
}

VALIDATION RULES — verify before returning:
✓ business_type is exactly one of the allowed values
✓ hero_title is benefit/outcome focused, NOT just a business description
✓ All 6 services are SPECIFIC to this exact business — zero generic items
✓ All 3 testimonials have different names, different customer roles, different specific details
✓ Colors match industry expectations (restaurant=warm, medical=blue, beauty=pink/purple, etc.)
✓ about_text tells a story, not just "we provide excellent services"${extraLangCode ? `\n✓ Include authentic "${extraLangCode}" section with natural ${extraLangName} content` : ""}`;

  const model = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ? "gpt-5.2" : "gpt-4.1-mini";
  console.log("Instant generation using model:", model, "| languages:", languages.join(","));

  const tokenLimit = extraLangCode ? 4500 : 3000;
  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_completion_tokens: tokenLimit,
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content || "{}";
  let bilingualContent: BilingualBusinessContent;
  let extraLang: ExtraLang | undefined;
  try {
    const parsed = JSON.parse(raw) as BilingualBusinessContent & Record<string, any>;
    if (!parsed.ar) throw new Error("Missing Arabic language section");
    // If English was not requested but AI included it anyway, that's fine.
    // If English was requested but missing, fall back to Arabic content
    if (needsEnglish && !parsed.en) {
      parsed.en = { ...parsed.ar };
      parsed.business_name_en = parsed.business_name_ar;
    }
    // If English not requested and not returned, create a minimal copy for template fallback
    if (!parsed.en) {
      parsed.en = { ...parsed.ar };
      parsed.business_name_en = parsed.business_name_ar;
    }
    bilingualContent = parsed;
    // Extract extra language content if present
    if (extraLangCode && parsed[extraLangCode]) {
      extraLang = {
        code: extraLangCode,
        content: parsed[extraLangCode],
        businessName: parsed[`business_name_${extraLangCode}`] || parsed.business_name_en,
      };
    }
  } catch {
    bilingualContent = {
      business_name_ar: prompt.slice(0, 30),
      business_name_en: prompt.slice(0, 30),
      business_type: "general",
      ar: {
        hero_title: "مرحباً بكم في موقعنا",
        hero_subtitle: "نقدم أفضل الخدمات والحلول الاحترافية",
        about_title: "من نحن",
        about_text: "نحن نقدم خدمات احترافية عالية الجودة لعملائنا في المملكة العربية السعودية.",
        services: [
          { title: "خدمة احترافية", desc: "نقدم حلولاً مبتكرة" },
          { title: "جودة عالية", desc: "معايير جودة متميزة" },
          { title: "دعم متواصل", desc: "نحن هنا دائماً" },
          { title: "خبرة واسعة", desc: "سنوات من الخبرة" },
          { title: "تسليم سريع", desc: "نلتزم بالمواعيد" },
          { title: "أسعار تنافسية", desc: "أفضل الأسعار" },
        ],
        cta_text: "تواصل معنا",
        contact_description: "نسعد بالتواصل معك والإجابة على جميع استفساراتك.",
        address: "الرياض، المملكة العربية السعودية",
        seo_title: prompt.slice(0, 60),
        seo_description: prompt.slice(0, 155),
      },
      en: {
        hero_title: "Welcome to Our Website",
        hero_subtitle: "We provide the best professional services and innovative solutions.",
        about_title: "About Us",
        about_text: "We provide high-quality professional services to our clients across Saudi Arabia.",
        services: [
          { title: "Professional Service", desc: "Innovative solutions" },
          { title: "High Quality", desc: "Premium quality standards" },
          { title: "Continuous Support", desc: "Always here to help" },
          { title: "Vast Experience", desc: "Years of industry experience" },
          { title: "Fast Delivery", desc: "Always on time" },
          { title: "Competitive Pricing", desc: "Best prices in the market" },
        ],
        cta_text: "Contact Us",
        contact_description: "We are happy to hear from you and answer all your questions.",
        address: "Riyadh, Saudi Arabia",
        seo_title: prompt.slice(0, 60),
        seo_description: prompt.slice(0, 155),
      },
      phone: "+966 50 000 0000",
      email: "info@business.sa",
      primary_color: "#059669",
      accent_color: "#0284c7",
    };
  }

  const { html, css } = buildInstantWebsite(bilingualContent, primaryWebsiteLang, extraLang ? [extraLang] : undefined, languages);

  const isPrimaryAr = primaryWebsiteLang === "ar";
  const isPrimaryEn = primaryWebsiteLang === "en";
  const seoContent = isPrimaryAr ? bilingualContent.ar : isPrimaryEn ? bilingualContent.en : (extraLang?.content ?? bilingualContent.ar);
  return {
    html,
    css,
    seoTitle: seoContent.seo_title,
    seoDescription: seoContent.seo_description,
    sections: ["الرئيسية", "من نحن", "خدماتنا", "تواصل معنا"],
    colorPalette: {
      primary: bilingualContent.primary_color || "#059669",
      secondary: bilingualContent.accent_color || "#0284c7",
      accent: bilingualContent.accent_color || "#0284c7",
      background: "#ffffff",
      text: "#1a1a2a",
    },
  };
}
