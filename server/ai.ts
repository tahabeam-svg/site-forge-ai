import OpenAI from "openai";
import { runQualityCheck, validateAndCorrectColors, validatePageStructure } from "./design-system.js";
import { generateContentSpec, buildWebsiteHTML, type WebsiteImages } from "./website-builder.js";

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
  const portfolio = ["بورتفوليو","portfolio","موهبتي","مصور","مصمم","فنان","شخصي","personal","resume","cv","سيرة ذاتية","شاعر","موسيقي","فريلانسر","freelancer","مستقل","مطور","developer","ux designer","ui designer","influencer","مؤثر","youtuber","content creator","صانع محتوى"];
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

Output a COMPLETE <!DOCTYPE html> document with all CSS in a <style> tag in <head>, Google Fonts @import, Font Awesome 6 CDN link, all animations, responsive breakpoints, and all JS in a <script> at end of <body>. Output ONLY pure HTML. No JSON. No markdown code blocks.`;
  }

  if (category === "portfolio") {
    return `You are a world-class creative director building a STUNNING personal portfolio website — Awwwards-worthy, Dribbble top-shot quality. The result must feel like a premium 2025 personal brand, not a template.

Request: "${description}"

⛔ ABSOLUTE RULE: NEVER copy the user's request phrase as website content. Extract name + field from it, then write fresh professional content.

STEP 0 — MANDATORY: EXTRACT FIRST
- Person's name → brand identity
- Field/specialty (photographer, designer, developer, content creator, etc.)
- City if mentioned (default: الرياض)
- Specific skills/tools/achievements if mentioned

═══════════════════════════════════
STOCK IMAGES — PRE-SELECTED FOR THIS REQUEST
═══════════════════════════════════
USE_IMAGES_PLACEHOLDER

⚠️ MANDATORY IMAGE RULES:
• Image #1 (marked "HERO") → place as hero section CSS background-image. The hero MUST have a real photo, NOT a CSS gradient as background.
• Images #2-#7 (marked "GALLERY") → use in the portfolio/works section — each used ONCE
• NEVER use placeholder gradients or blob shapes instead of real images

═══ SECTIONS (in order) ═══

1. NAVBAR: Fixed, glassmorphism (background:rgba(5,8,22,0.82);backdrop-filter:blur(24px);border-bottom:1px solid rgba(255,255,255,0.07)). Brand = inline SVG (id="aw-ai-logo", 32×32px, initials or field icon) + person's name in gradient text (font-weight:800). Links: عن نفسي (#about), مهاراتي (#skills), أعمالي (#portfolio), تواصل معي (#contact). One CTA button: "تواصل الآن" → #contact. Mobile hamburger required.

2. HERO: min-height:100vh; position:relative. 
   ⚠️ MANDATORY HERO BACKGROUND: Set background-image to Image #1 URL from the list above. Add a dark overlay: background:linear-gradient(135deg,rgba(5,8,22,0.88) 0%,rgba(15,5,40,0.75) 100%). 
   Add 2 subtle orb blobs (position:absolute, z-index:1, filter:blur(80px), opacity:0.15) as atmospheric depth ONLY — they must NOT hide the photo.
   Content (z-index:2, position:relative): animated name text (clamp(3rem,8vw,5.5rem), font-weight:900, gradient text). Role/title badge (glass effect, border-radius:100px). Short 1-line tagline (rgba(255,255,255,0.7)). Two CTA buttons: gradient solid "شاهد أعمالي" + ghost outline "تواصل معي".
   WhatsApp floating button (position:fixed;bottom:1.75rem;${isArabic ? "left" : "right"}:1.75rem;z-index:9999;background:#25D366;color:#fff;width:62px;height:62px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 25px rgba(37,211,102,0.55)).

3. ABOUT (id="about"): Light section (#f8fafc bg). 2-column layout. LEFT: Use Image #2 from the pre-selected list — style it with double gradient border (::before/::after pseudo-elements), floating "متاح للعمل" badge (gradient bg, bottom corner). RIGHT: personal bio (2 paragraphs, warm personal tone), 4 key stats (years experience, projects done, clients, rating), social links with colored icons (LinkedIn, GitHub/Behance/Instagram based on field).

4. SKILLS (id="skills"): Dark section. Title "مهاراتي ودرجة إتقاني". Grid of skill cards (3-4 per row). Each card: icon + skill name + animated progress bar (CSS width 0→percentage triggered by IntersectionObserver). Use specific skills matching their field (e.g. designer: Figma 95%, Adobe XD 90%, Photoshop 88%, After Effects 80%).

5. PORTFOLIO (id="portfolio"): Dark-navy section. Title "أحدث أعمالي". 3-column grid. Use Images #3–#7 from the pre-selected list (one per card). Each card: image (object-fit:cover, height:240px), gradient overlay on hover with translateY(-8px) + scale(1.02), card title, category tag (badge), "مشاهدة التفاصيل" button. Generate 5-6 realistic project titles matching their specialty. Each card hover reveals: project title, 1-line result metric ("زيادة المبيعات 120%"), view button.

6. SERVICES (id="services"): Light section. "ماذا أقدم؟" — 3-column grid with gradient border cards. Each: relevant Font Awesome icon (gradient icon box), title, description (2 lines). Services must be SPECIFIC to their field.

7. CONTACT (id="contact"): Dark gradient section. Two-column. LEFT: contact info boxes (WhatsApp, Email, City, Social links). RIGHT: clean contact form (name, phone, message, send button with gradient). Form validation with success message.

8. FOOTER: Dark (#050814). SVG logo (id="aw-ai-logo-footer", 28×28px) + tagline. Social icons. Copyright © ${new Date().getFullYear()} [Person Name]. "Powered by ArabyWeb.net".

═══ DESIGN SYSTEM — 2025 PREMIUM ═══
- Color: Field-based palette —
  Designer/Creative: electric violet (#7c3aed) + pink (#ec4899)
  Developer/Tech: violet (#6366f1) + cyan (#06b6d4)  
  Photographer/Art: charcoal (#0a0a0a) + warm gold (#d4a843)
  Business/Other: deep navy (#1e3a5f) + teal (#0d9488)
- Typography: headings font-weight:900, letter-spacing:-0.03em, clamp sizing
- Glassmorphism: backdrop-filter:blur(16px); background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1)
- Gradient text: -webkit-background-clip:text; -webkit-text-fill-color:transparent
- All transitions: cubic-bezier(.22,1,.36,1) 0.3s
- Scroll reveals: .aw-reveal{opacity:0;transform:translateY(30px)} → .aw-visible{opacity:1;transform:none} via IntersectionObserver
- Navbar scroll: adds class "scrolled" → background darkens
- Skill bars: animate on IntersectionObserver trigger

Language: ${lang}
Font: ${font}
Mobile hamburger: ${mobileMenu}
${MOBILE_RESPONSIVE_MANDATORY}

Output ONLY a complete <!DOCTYPE html> document. No markdown. No explanations. Start with <!DOCTYPE html> immediately.`;
  }

  if (category === "event") {
    return `You are a world-class event website designer specializing in Saudi/Arab events. Build a PREMIUM, visually stunning, production-ready event website.

Request: "${description}"

⛔ ABSOLUTE RULE: Extract event name/type/date from the request — NEVER display the raw request text as content.

STEP 0 — MANDATORY: EXTRACT FIRST
- Event name/title → use prominently throughout
- Event type (wedding, conference, graduation, exhibition, festival, product launch, birthday, etc.)
- Date if mentioned → display in countdown timer
- Location/venue if mentioned → city + venue name
- Organizer name if mentioned

═══════════════════════════════════
STOCK IMAGES — PRE-SELECTED FOR THIS REQUEST
═══════════════════════════════════
USE_IMAGES_PLACEHOLDER

⚠️ MANDATORY IMAGE RULES:
• Image #1 (marked "HERO") → hero section CSS background-image ONLY — MUST be a real photo, NOT a CSS gradient alone
• Images #2-#7 (marked "GALLERY") → use in the gallery section — one per card, never repeat

═══ SECTIONS (in order) ═══

1. NAVBAR: Fixed glassmorphism (rgba(5,8,22,0.82) + blur(24px)). Brand = SVG icon (id="aw-ai-logo", 32×32) + event name gradient text. Links: عن الفعالية (#about), البرنامج (#schedule), الصور (#gallery), التسجيل (#register). Mobile hamburger required. FOOTER: SVG only (id="aw-ai-logo-footer") — NEVER repeat event name as text.

2. HERO: min-height:100vh; position:relative; background-image:url("IMAGE_#1_URL") center/cover no-repeat.
   Add dark overlay (position:absolute;inset:0;background:linear-gradient(135deg,rgba(5,8,22,0.85) 0%,rgba(15,5,40,0.7) 100%);z-index:1).
   Content (z-index:2): Event name in massive gradient text (clamp(2.5rem,7vw,6rem), font-weight:900). Date and location badge (glass pill). If date is future: LIVE COUNTDOWN TIMER in 4 boxes (أيام / ساعات / دقائق / ثواني) using JS setInterval. CTA: "سجّل الآن" (gradient) + "عرف أكثر" (glass outline).

3. ABOUT EVENT (id="about"): Light section (#f8fafc). 2-column. LEFT: Use Image #2 with gradient border overlay. RIGHT: Event description, key highlights checklist, expected attendees count, organizer name. 

4. SCHEDULE (id="schedule"): Dark section. Title "برنامج الفعالية". Vertical timeline with numbered circles + connecting line. Generate a REALISTIC schedule for this specific event type (conference=Registration→Opening→Keynote→Break→Sessions→Networking; wedding=Reception→Ceremony→Dinner→Dance; etc.).

5. GALLERY (id="gallery"): Light section. "معرض الصور" — 3-column masonry grid. Use Images #2–#7 from the pre-selected list. Hover: scale(1.05) + dark overlay + eye icon. Lightbox on click (fullscreen overlay, prev/next buttons, ESC to close).

6. SPEAKERS/GUESTS (if conference/summit/graduation): Dark section. 3-4 speaker cards with professional appearance, names, titles/roles.

7. REGISTER (id="register"): Gradient section. Large CTA "احجز مقعدك الآن". Registration form: Name, Phone, Email, Submit. Show WhatsApp link prominently.

8. FOOTER: Dark (#050814). SVG logo + tagline + social icons. Copyright © ${new Date().getFullYear()} [Event Name]. "Powered by ArabyWeb.net".

═══ DESIGN NOTES ═══
- Color: Wedding=rose+gold (#be185d+#d4a843), Conference=navy+gold (#1e3a5f+#d4a843), Festival=violet+amber (#7c3aed+#f59e0b), Exhibition=teal+green (#0d9488+#059669), Graduation=navy+gold
- All sections alternate dark/light backgrounds for rhythm
- Add confetti particles CSS animation for celebrations (weddings, graduations)
- Countdown timer: JS setInterval every 1000ms, updates seconds/minutes/hours/days
- Include Font Awesome 6 CDN

Language: ${lang}
Font: ${font}
Mobile hamburger: ${mobileMenu}
${MOBILE_RESPONSIVE_MANDATORY}

Output ONLY a complete <!DOCTYPE html> document. No markdown. No explanations. Start with <!DOCTYPE html>.`;
  }

  // Default: business
  return `You are a world-class creative director and front-end engineer building AWARD-WINNING business websites — the quality of Awwwards, Dribbble top shots, and top SaaS landing pages. Your output for the Saudi/Arab market must be visually stunning, modern, and technically excellent.

Generate a COMPLETE, premium single-page website based on: "${description}"`;
}

// ─── Large Image Bank — 30+ Industries ─────────────────────────────────────
const IMAGE_BANK: Record<string, string[]> = {
  restaurant: [
    "photo-1517248135467-4c7edcad34c4","photo-1414235077428-338989a2e8c0","photo-1565299624946-b28f40a0ae38",
    "photo-1476224203421-9ac39bcb3327","photo-1504674900247-0877df9cc836","photo-1555396273-367ea4eb4db5",
    "photo-1551218808-94e220e084d2","photo-1490818387583-1baba5e638af","photo-1544025162-d76694265947",
    "photo-1567620905732-2d1ec7ab7445","photo-1540189549336-e6e99c3679fe","photo-1565958011703-44f9829ba187",
    "photo-1559339352-11d035aa65de","photo-1484723091739-30a097e8f929","photo-1482049016688-2d3e1b311543",
    "photo-1473093295043-cdd812d0e601","photo-1498837167922-ddd27525d352","photo-1607877361964-d8d7aa0c5d1e",
  ],
  cafe: [
    "photo-1495474472287-4d71bcdd2085","photo-1501339847302-ac426a4a7cbb","photo-1511920170033-f8396924c348",
    "photo-1442512595331-e89e73853f31","photo-1509042239860-f550ce710b93","photo-1572119865084-43c285814d63",
    "photo-1453614512568-c4024d13c247","photo-1461023058943-07fcbe16d735","photo-1447933601403-0c6688de566e",
    "photo-1521302080334-4bebac2763a6","photo-1534040385115-33dcb3acba5b",
  ],
  grill: [
    "photo-1529193591184-b1d58069ecdd","photo-1544025162-d76694265947","photo-1432139555190-58524dae6a55",
    "photo-1558030137-a56c1b3b9498","photo-1555939594-58d7cb561ad1","photo-1599487488170-d11ec9c172f0",
    "photo-1513185041617-8ab03f83d6c5","photo-1601050690597-df0568f70950","photo-1544551763-46a013bb70d5",
    "photo-1569070577-2b7b5dbfcbc4",
  ],
  agency: [
    "photo-1497366216548-37526070297c","photo-1486406146926-c627a92ad1ab","photo-1542744173-8e7e53415bb0",
    "photo-1553877522-43269d4ea984","photo-1522071820081-009f0129c71c","photo-1524758631624-e2822e304c36",
    "photo-1497366754035-f200581393ab","photo-1552664730-d307ca884978","photo-1531482615713-2afd69097998",
    "photo-1557804506-669a67965ba0","photo-1560250097-0dc05c0f61e6","photo-1521737711867-e3b97375f902",
    "photo-1573497019940-1c28c88b4f3e","photo-1568992688065-536aad8a12f6","photo-1507003211169-0a1dd7228f2d",
    "photo-1519389950473-47ba0277781c","photo-1522202176988-66273c2fd55f","photo-1423666639041-f56000c27a9a",
  ],
  luxury: [
    "photo-1541643600914-78b084683601","photo-1523293182086-7651a899d37f","photo-1588776814546-1ffbb7c4f58a",
    "photo-1615634260167-c8cdede054de","photo-1600210492486-724fe5c67fb0","photo-1571019613454-1cb2f99b2d8b",
    "photo-1585771724684-38269d6639fd","photo-1617038220319-276d3cfab638","photo-1523779105320-d1cd346ff52b",
    "photo-1619559378823-8e05a2c3de1e","photo-1553361371-9b22f78e8b1d","photo-1581235720704-06d3acfcb36f",
  ],
  tech: [
    "photo-1518770660439-4636190af475","photo-1552664730-d307ca884978","photo-1451187580459-43490279c0fa",
    "photo-1461749280684-dccba630e2f6","photo-1504639725590-34d0984388bd","photo-1498050108023-c5249f4df085",
    "photo-1555099962-4199c345e5dd","photo-1551650975-87deedd944c3","photo-1535378917042-10a22c95931a",
    "photo-1542831371-29b0f74f9713","photo-1519389950473-47ba0277781c","photo-1504384308090-c894fdcc538d",
    "photo-1526374965328-7f61d4dc18c5","photo-1487017159836-4e23ece2e4cf","photo-1517694712202-14dd9538aa97",
  ],
  realestate: [
    "photo-1560518883-ce09059eeffa","photo-1582407947304-fd86f028f716","photo-1512917774080-9991f1c4c750",
    "photo-1570129477492-45c003edd2be","photo-1600596542815-ffad4c1539a9","photo-1613490493576-7fde63acd811",
    "photo-1560448204-e02f11c3d0e2","photo-1600585154340-be6161a56a0c","photo-1605276374104-dee2a0ed3cd6",
    "photo-1600566753190-17f0baa2a6c3","photo-1583608205776-bfd35f0d9f83","photo-1516455590571-18256e5bb9ff",
    "photo-1558618666-fcd25c85cd64","photo-1570129477492-45c003edd2be","photo-1600047509807-ba8f99d2cdde",
  ],
  medical: [
    "photo-1576091160399-112ba8d25d1d","photo-1579684385127-1ef15d508118","photo-1631217868264-e5b90bb7e133",
    "photo-1559757148-5c350d0d3c56","photo-1519494026892-80bbd2d6fd0d","photo-1576091160550-2173dba999ef",
    "photo-1530026405186-ed1f139313f8","photo-1551601651-2a8555f1a136","photo-1588776814546-1ffbb172d4a8",
    "photo-1581595220892-b0739db3ba8c","photo-1559757125-2fa8c7c8c78a","photo-1434030216411-0b793f4b4173",
    "photo-1504813184591-01572f98c85f","photo-1612349317150-e413f6a5b16d",
  ],
  beauty: [
    "photo-1560066984-138dadb4c035","photo-1522337360788-8b13dee7a37e","photo-1487412947147-5cebf100ffc2",
    "photo-1519014816548-bf5fe059798b","photo-1519415510236-718bdfcd89c8","photo-1502781252888-9143ba7f074e",
    "photo-1516975080664-ed2fc6a32937","photo-1562322140-8baeececf3df","photo-1596755389378-c31d21fd1273",
    "photo-1487412947147-5cebf100ffc2","photo-1571875257727-256c39da42af","photo-1492106087820-71f1a00d2b11",
    "photo-1512290923902-8a9f81dc236c","photo-1522338242992-e1a54906a8da",
  ],
  education: [
    "photo-1523050854058-8df90110c9f1","photo-1509062522246-3755977927d7","photo-1427504494785-3a9ca7044f45",
    "photo-1456513080510-7bf3a84b82f8","photo-1524178232363-1fb2b075b655","photo-1503676260728-1c00da094a0b",
    "photo-1488190211105-8b0e65b80b4e","photo-1580582932707-520aed937b7b","photo-1546410531-bb4caa6b424d",
    "photo-1564981797816-1043664bf78d","photo-1434030216411-0b793f4b4173",
  ],
  automotive: [
    "photo-1492144534655-ae79c964c9d7","photo-1469854523086-cc02fe5d8800","photo-1511919884226-fd3cad34687c",
    "photo-1503376780353-7e6692767b70","photo-1549317661-bd32c8ce0db2","photo-1580273916550-e323be2ae537",
    "photo-1559416523-140ddc3d238c","photo-1541899481282-d53bffe3c35d","photo-1568605117036-5fe5e7bab0b7",
    "photo-1525609004556-c46c7d6cf023","photo-1544636331-e26879cd4d9b",
  ],
  events: [
    "photo-1540575467063-178a50c2df87","photo-1505236858219-8359eb29e329","photo-1519741497674-611481863552",
    "photo-1492684223066-81342ee5ff30","photo-1514525253161-7a46d19cd819","photo-1429962714451-bb934ecdc4ec",
    "photo-1501281668745-f7f57925c3b4","photo-1523580494863-6f3031224c42","photo-1511578314322-379afb476865",
    "photo-1516450360452-9312f5e86fc7","photo-1496337589254-7e19d01cec44",
  ],
  photography: [
    "photo-1452587925148-ce544e77e70d","photo-1516035069371-29a1b244cc32","photo-1506905925346-21bda4d32df4",
    "photo-1500622944204-b135684e99fd","photo-1501854140801-50d01698950b","photo-1529778873920-4da4926a72c2",
    "photo-1504700610630-ac6aba3536d3","photo-1543466835-00a7907e9de1","photo-1491553895911-0055eca6402d",
    "photo-1576671081837-49000212a370","photo-1558403194-611308249627",
  ],
  gym: [
    "photo-1534438327276-14e5300c3a48","photo-1571019614242-c5c5dee9f50b","photo-1517836357463-d25dfeac3438",
    "photo-1547592180-85f173990554","photo-1581009146145-b5ef050c2e1e","photo-1590239926044-4131f5d0654b",
    "photo-1570829460005-c840387bb1ca","photo-1546483875-ad9014c88eba","photo-1526506118085-60122a929d55",
    "photo-1581009137042-c552e485697a","photo-1549060279-7e168fcee0c2",
  ],
  finance: [
    "photo-1554224155-6726b3ff858f","photo-1560472355-536de3962603","photo-1611974789855-9c2a0a7236a3",
    "photo-1579621970563-ebec7560ff3e","photo-1486406146926-c627a92ad1ab","photo-1507003211169-0a1dd7228f2d",
    "photo-1454165804606-c3d57bc86b40","photo-1444653614773-995cb1ef9efa","photo-1565514020179-026b92b84bb6",
    "photo-1520333789090-1afc82db536a",
  ],
  // ── New categories ──────────────────────────────────────────────────────────
  manufacturing: [
    "photo-1504328345606-18bbc8c9d7d1","photo-1581091226825-a6a2a5aee158","photo-1565793298595-6a879b1d9492",
    "photo-1504917595217-d4dc5ebe6122","photo-1519583272095-6433daf26b6e","photo-1552664688-cf412ec27db2",
    "photo-1567306301408-9b74779a11af","photo-1530685932526-48ec92998eaa","photo-1562408590-e32931084e23",
    "photo-1581092918056-0c4c3acd3789","photo-1565610222536-ef125c59da2e","photo-1541888946425-d81bb19240f5",
  ],
  construction: [
    "photo-1504307651254-35680f356dfd","photo-1590579491624-f98f36d4c763","photo-1503387762-592deb58ef4e",
    "photo-1541888946425-d81bb19240f5","photo-1581091226825-a6a2a5aee158","photo-1487958449943-2429e8be8625",
    "photo-1558618666-fcd25c85cd64","photo-1485083269755-a7b559a4fe5e","photo-1497366811353-6870744d04b2",
    "photo-1508450859948-4e04fabaa4ea","photo-1526304640581-d334cdbbf45e","photo-1600585154340-be6161a56a0c",
  ],
  cleaning: [
    "photo-1563453392212-326f5e854473","photo-1558618666-fcd25c85cd64","photo-1527515637462-cff94eecc1ac",
    "photo-1581578731548-c64695cc6952","photo-1628177142898-93e36e4e3a50","photo-1585771724684-38269d6639fd",
    "photo-1556909114-f6e7ad7d3136","photo-1600566752355-35792bedcfea","photo-1583847268964-b28dc8f51f92",
    "photo-1585771724684-38269d6639fd","photo-1527515545081-5db817172677",
  ],
  logistics: [
    "photo-1586528116311-ad8dd3c8310d","photo-1578575437130-527eed3abbec","photo-1601584115197-04ecc0da31d7",
    "photo-1494412574643-ff11b0a5c1c3","photo-1519003722824-194d4455a60c","photo-1553413077-190dd305871c",
    "photo-1416879595882-3373a0480b5b","photo-1558618047-f4f3ed48a4f9","photo-1568605114967-8130f3a36994",
    "photo-1587293852726-70cdb56c2866","photo-1473655521523-a9b65b3c8be6",
  ],
  furniture: [
    "photo-1555041469-a586c61ea9bc","photo-1524758631624-e2822e304c36","photo-1493663284031-b7e3aefcae8e",
    "photo-1556909114-f6e7ad7d3136","photo-1538688525198-9b88f6f53126","photo-1507089947368-19c1da9775ae",
    "photo-1616486338812-3dadae4b4ace","photo-1586105251261-72a756497a11","photo-1565182999561-18d7dc61c393",
    "photo-1540518614846-7eded433c457","photo-1503602642458-232111445657","photo-1567016376408-0226e4d0c1ea",
  ],
  food_production: [
    "photo-1504674900247-0877df9cc836","photo-1556909172-54557c7e4fb7","photo-1490818387583-1baba5e638af",
    "photo-1565299624946-b28f40a0ae38","photo-1606787366850-de6330128bfc","photo-1547592166-23ac45744acd",
    "photo-1565958011703-44f9829ba187","photo-1482049016688-2d3e1b311543","photo-1576097449798-7c7f90e1248a",
    "photo-1498654896293-37aacf113fd9","photo-1490645935967-10de6ba17061",
  ],
  agriculture: [
    "photo-1500937386664-56d1dfef3854","photo-1416879595882-3373a0480b5b","photo-1464226184884-fa280b87c399",
    "photo-1500595046743-cd271d694d30","photo-1536657464919-892534f60d6e","photo-1501004318641-b39e6451bec6",
    "photo-1542601906990-b4d3fb778b09","photo-1523348837708-15d4a09cfac2","photo-1471193945509-9ad0617afabf",
    "photo-1530836369250-ef72a3f5cda8","photo-1574323347407-f5e1ad6d020b",
  ],
  legal: [
    "photo-1589829545856-d10d557cf95f","photo-1453945619913-79ec89a82c51","photo-1505664194779-8beaceb5bb4c",
    "photo-1507679799987-c73779587ccf","photo-1521791055366-0d553381ad47","photo-1542744094-3a31f272c490",
    "photo-1450101499163-c8848c66ca85","photo-1593115057322-e94b77572f20","photo-1575505586569-646b2ca898fc",
    "photo-1568605114967-8130f3a36994","photo-1559136555-9303baea8ebd",
  ],
  hotel: [
    "photo-1566073771259-6a8506099945","photo-1542314831-068cd1dbfeeb","photo-1455587734955-081b22074882",
    "photo-1520250497591-112f2f40a3f4","photo-1496417263034-38ec4f0b665a","photo-1582719508461-905c673771fd",
    "photo-1525610553991-2bede1a236e2","photo-1534595038511-9f219fe0d4f3","photo-1551882547-ff40c63fe5fa",
    "photo-1621293954908-907159247fc8","photo-1605346576237-1a02428e9827",
  ],
  printing: [
    "photo-1562408590-e32931084e23","photo-1588681664899-f142ff2dc9b1","photo-1586282391129-76a6df230234",
    "photo-1467293622093-9f15c96be70f","photo-1588681664899-f142ff2dc9b1","photo-1561998338-13ad7883b20f",
    "photo-1527153818091-1a9638521e2a","photo-1535585209827-a15fcdbc4c2d","photo-1558618047-3c8c76ca7d13",
    "photo-1506905925346-21bda4d32df4","photo-1471897488648-5eae4ac6686b",
  ],
  security: [
    "photo-1558618047-3c8c76ca7d13","photo-1557597774-9d273605dfa9","photo-1521791136064-7986c2920216",
    "photo-1609902726285-00668009f004","photo-1563013544-824ae1b704d3","photo-1558494949-ef010cbdcc31",
    "photo-1485827404703-89b55fcc595e","photo-1519003722824-194d4455a60c","photo-1526374965328-7f61d4dc18c5",
    "photo-1550751827-4bd374173514","photo-1555949963-ff9fe0c870eb",
  ],
  decor: [
    "photo-1616486338812-3dadae4b4ace","photo-1586105251261-72a756497a11","photo-1493663284031-b7e3aefcae8e",
    "photo-1555041469-a586c61ea9bc","photo-1524758631624-e2822e304c36","photo-1507089947368-19c1da9775ae",
    "photo-1540518614846-7eded433c457","photo-1565182999561-18d7dc61c393","photo-1567016376408-0226e4d0c1ea",
    "photo-1600121848594-d8644e57abab","photo-1600585154526-990dced4db0d","photo-1560448204-603b3fc33ddc",
  ],
  travel: [
    "photo-1488085061387-422e29b40080","photo-1476514525535-07fb3b4ae5f1","photo-1469854523086-cc02fe5d8800",
    "photo-1500835556837-99ac94a94552","photo-1507525428034-b723cf961d3e","photo-1530521954074-e64f6810b32d",
    "photo-1548574505-5e239809ee19","photo-1528360983277-13d401cdc186","photo-1436491865332-7a61a109cc05",
    "photo-1467269204594-f00a6c4a7bf9","photo-1520466809213-7b9a56adcd45",
  ],
  supermarket: [
    "photo-1534723452862-4c874018d66d","photo-1542838132-92c53300491e","photo-1604719312566-8912e9227c6a",
    "photo-1578916171728-46686eac8d58","photo-1604719312566-8912e9227c6a","photo-1556742049-0cfed4f6a45d",
    "photo-1606914501449-5a96b6ce24ca","photo-1488459716781-31db52582fe9","photo-1562967914-608f82629710",
    "photo-1578916171728-46686eac8d58","photo-1526170375885-4d8ecf77b99f",
  ],
  tailoring: [
    "photo-1558618047-f4f3ed48a4f9","photo-1558769132-cb1aea458c5e","photo-1515886657613-9f3515b0c78f",
    "photo-1596483901962-7c43a2f42853","photo-1445205170230-053b83016050","photo-1483985988355-763728e1935b",
    "photo-1558618666-fcd25c85cd64","photo-1469334031218-e382a71b716b","photo-1618354691373-d851c5c3a990",
    "photo-1578681994506-b8f463906a58","photo-1467453678174-768ec283a940",
  ],
  plastic: [
    "photo-1504328345606-18bbc8c9d7d1","photo-1581091226825-a6a2a5aee158","photo-1565793298595-6a879b1d9492",
    "photo-1504917595217-d4dc5ebe6122","photo-1519583272095-6433daf26b6e","photo-1552664688-cf412ec27db2",
    "photo-1562408590-e32931084e23","photo-1581092918056-0c4c3acd3789","photo-1565610222536-ef125c59da2e",
    "photo-1530685932526-48ec92998eaa","photo-1567306301408-9b74779a11af","photo-1541888946425-d81bb19240f5",
  ],
  pharmacy: [
    "photo-1584308666744-24d5c474f2ae","photo-1587854692152-cbe660dbde88","photo-1576671081837-49000212a370",
    "photo-1471864190281-a93a3070b6de","photo-1576091160399-112ba8d25d1d","photo-1583947215259-38e31be8751f",
    "photo-1585435557343-3b092031a831","photo-1576091160550-2173dba999ef","photo-1579684385127-1ef15d508118",
    "photo-1434494878577-86c23bcb06b9","photo-1612349317150-e413f6a5b16d",
  ],
};

const DEFAULT_IMAGES = [
  "photo-1497366216548-37526070297c","photo-1552664730-d307ca884978","photo-1542744173-8e7e53415bb0",
  "photo-1557804506-669a67965ba0","photo-1519389950473-47ba0277781c","photo-1507003211169-0a1dd7228f2d",
  "photo-1560250097-0dc05c0f61e6","photo-1573497019940-1c28c88b4f3e","photo-1521737711867-e3b97375f902",
  "photo-1504384308090-c894fdcc538d","photo-1423666639041-f56000c27a9a","photo-1455661f47f62baef40b3c9ac76a93f",
];

function detectImageCategory(description: string): string {
  const d = description.toLowerCase();
  // ── Food & Beverage ─────────────────────────────────────────────────────────
  if (/مطعم|شاورما|كبسة|مندي|طعام|وجبة|برگر|بيتزا|كنتاكي|مأكولات|food|restaurant|kebab|burger|pizza/.test(d)) {
    if (/مشوي|مشاوي|جريل|grill|bbq|شيش|منقل/.test(d)) return "grill";
    if (/قهوة|كافيه|cafe|coffee|كابتشينو|لاتيه/.test(d)) return "cafe";
    return "restaurant";
  }
  if (/قهوة|كافيه|cafe|coffee|كابتشينو|لاتيه|espresso/.test(d)) return "cafe";
  if (/مشوي|مشاوي|جريل|grill|bbq|شيش|منقل/.test(d)) return "grill";
  if (/إنتاج غذائي|مصنع أغذية|food production|food factory|معلبات|تعبئة وتغليف أغذية/.test(d)) return "food_production";
  if (/سوبرماركت|بقالة|متجر|محل|supermarket|grocery|mart|hypermarket|هايبر|ماركت/.test(d)) return "supermarket";
  // ── Industrial & Manufacturing ───────────────────────────────────────────────
  if (/بلاستيك|plastic|بولي|poly|مواد بلاستيكية|تصنيع بلاستيك/.test(d)) return "plastic";
  if (/مصنع|تصنيع|صناعة|صناعية|manufacturing|factory|industrial|معمل/.test(d)) return "manufacturing";
  if (/مقاولات|إنشاءات|بناء|تشييد|هندسة مدنية|construction|contracting|building/.test(d)) return "construction";
  if (/أثاث|موبيليا|كنب|غرف نوم|مطابخ|furniture|sofa|bedroom|kitchen interior/.test(d)) return "furniture";
  if (/ديكور|تصميم داخلي|interior design|decoration|decor/.test(d)) return "decor";
  if (/خياطة|ملابس|أزياء|موضة|fashion|clothing|tailoring|boutique/.test(d)) return "tailoring";
  if (/طباعة|مطبعة|دعائي|printing|press|signage/.test(d)) return "printing";
  // ── Services ─────────────────────────────────────────────────────────────────
  if (/نظافة|تنظيف|cleaning|مكافحة حشرات|pest control|laundry|غسيل/.test(d)) return "cleaning";
  if (/أمن|حماية|مراقبة|security|guard|cctv|surveillance/.test(d)) return "security";
  if (/شحن|لوجستيك|توصيل|نقل بضائع|logistics|shipping|freight|supply chain|warehouse/.test(d)) return "logistics";
  if (/قانون|محامي|مستشار قانوني|law|legal|attorney|lawyer/.test(d)) return "legal";
  if (/صيدلية|دواء|pharmacy|drugstore/.test(d)) return "pharmacy";
  // ── Professional Services ────────────────────────────────────────────────────
  if (/وكالة|وكاله|دعاية|إعلان|تسويق|agency|marketing|creative|advertising/.test(d)) return "agency";
  if (/تقنية|برمجة|تطبيق|ديجيتال|tech|software|app|startup|digital/.test(d)) return "tech";
  if (/مالية|استثمار|بنك|محاسبة|finance|investment|bank|accounting/.test(d)) return "finance";
  if (/طب|عيادة|مستشفى|medical|clinic|hospital|health|dental|أسنان/.test(d)) return "medical";
  if (/تجميل|صالون|سبا|مكياج|beauty|salon|spa|makeup/.test(d)) return "beauty";
  if (/تعليم|تدريب|معهد|مدرسة|أكاديمية|education|training|academy|school|course/.test(d)) return "education";
  // ── Real World ──────────────────────────────────────────────────────────────
  if (/عقار|شقق|فلل|عقارات|real estate|property|apartment|villa/.test(d)) return "realestate";
  if (/سيارة|سيارات|نقل|شحن|مواصلات|car|automotive|transport/.test(d)) return "automotive";
  if (/فندق|شاليه|استراحة|hotel|resort|chalet/.test(d)) return "hotel";
  if (/سفر|سياحة|رحلة|travel|tourism|tour/.test(d)) return "travel";
  if (/جيم|رياضة|لياقة|gym|fitness|sport/.test(d)) return "gym";
  if (/فاخر|ساعة|عطر|مجوهر|luxury|perfume|jewelry|watch/.test(d)) return "luxury";
  if (/مصور|تصوير|photography|photo|studio/.test(d)) return "photography";
  if (/فعالية|حفل|مؤتمر|event|wedding|conference|party/.test(d)) return "events";
  if (/زراعة|مزرعة|agriculture|farm|crops/.test(d)) return "agriculture";
  return "agency";
}

function shuffleAndPick<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

// ─── Unsplash Search Terms — 30+ categories ─────────────────────────────────
const UNSPLASH_SEARCH_TERMS: Record<string, string[]> = {
  restaurant:      ["restaurant interior elegant dining","fine dining food plating arabic","modern restaurant table setup","restaurant kitchen professional","food dish presentation elegant","arabic cuisine traditional"],
  grill:           ["bbq grill steakhouse interior","charcoal grill grilled meat","steakhouse dining elegant","barbecue restaurant setup","open grill kitchen fire","grilled skewers food presentation"],
  cafe:            ["coffee shop cafe interior modern","specialty coffee latte art","cozy coffee bar aesthetic","barista making coffee","cafe seating area comfortable","coffee beans roasting"],
  agency:          ["creative agency office modern","marketing team workspace","advertising agency branding","design studio creative workspace","digital agency team","marketing campaign visuals"],
  tech:            ["technology startup office modern","software company workspace","tech team coding screens","data center servers","tech startup minimal office","coding workspace monitors"],
  realestate:      ["luxury villa exterior architecture","modern apartment interior design","real estate property aerial","luxury home living room","villa garden outdoor","penthouse city view"],
  medical:         ["modern clinic reception area interior","hospital hallway modern","medical equipment technology","clinic waiting room design","healthcare facility clean","operating room modern hospital"],
  beauty:          ["luxury beauty salon interior","spa treatment room relaxation","modern hair salon aesthetic","nail salon clean interior","beauty parlor elegant","cosmetics studio lighting"],
  education:       ["modern classroom university interior","library books study academic","academy training center","lecture hall modern","school campus architecture","students learning environment"],
  automotive:      ["luxury car showroom interior","car dealership modern","sports car garage","automotive service bay","car workshop professional","vehicle maintenance center"],
  events:          ["elegant event hall ballroom","conference venue luxury interior","wedding venue decoration flowers","banquet hall setup","event stage lighting","gala dinner table setting"],
  photography:     ["photography studio professional setup","camera equipment studio lighting","photo studio backdrop","portrait studio professional","creative studio workspace","studio gear equipment"],
  gym:             ["modern gym fitness center interior","workout equipment weights","crossfit training facility","gym floor machines","yoga studio peaceful","swimming pool fitness"],
  luxury:          ["luxury boutique store high-end interior","jewelry showcase elegant","luxury brand retail interior","high-end watch display","designer store interior","luxury shopping experience"],
  finance:         ["modern bank office interior","corporate financial workspace","accounting office professional","business meeting boardroom","financial district building","trading floor modern"],
  manufacturing:   ["factory production line industrial","manufacturing plant interior","industrial machinery modern","assembly line workers","production facility clean","industrial warehouse interior"],
  construction:    ["construction site building modern","architecture blueprint engineering","building under construction","crane construction tower","modern building facade","construction workers site"],
  cleaning:        ["professional cleaning service equipment","office cleaning sparkle","cleaning supplies organized","janitorial service professional","clean modern office after cleaning","pressure washing exterior"],
  logistics:       ["warehouse logistics interior organized","cargo freight transport","delivery truck fleet","supply chain distribution center","logistics hub aerial","shipping containers port"],
  furniture:       ["modern furniture showroom elegant interior","luxury sofa living room","interior furniture design","bedroom furniture modern","dining room furniture elegant","office furniture workspace"],
  food_production: ["food factory production line clean","food processing facility modern","packaged food products","food manufacturing hygiene","kitchen industrial scale","food quality control lab"],
  agriculture:     ["farm agriculture green fields aerial","farming crops harvest","modern agricultural field","greenhouse plants growing","irrigation system farm","organic farm produce"],
  legal:           ["law office professional interior","legal books library","courthouse architecture","lawyer desk professional","legal firm meeting room","justice scales office"],
  hotel:           ["luxury hotel lobby interior","hotel room elegant suite","resort pool area","hotel restaurant fine dining","hotel spa wellness","hotel exterior architecture"],
  printing:        ["printing press machine professional","print shop production floor","graphic design printing","digital printing modern","offset printing process","design studio workspace"],
  security:        ["security control room monitors","surveillance cameras professional","security operations center","cybersecurity office modern","data center security","security gate entrance"],
  decor:           ["interior design modern decor living room","luxury home decoration","interior design showroom","home decor elegant","architecture interior beautiful","design studio samples"],
  travel:          ["travel destination scenic landscape","airplane travel airport","beach resort aerial","mountain travel adventure","travel agency modern office","tropical destination paradise"],
  supermarket:     ["supermarket grocery store aisle organized","fresh produce market colorful","grocery store interior clean","hypermarket shopping","market stalls fresh food","organic grocery store"],
  tailoring:       ["fashion boutique elegant clothes display","tailor shop fabric rolls","clothing boutique interior","sewing workshop professional","fashion design studio","textile fabric elegant"],
  plastic:         ["plastic factory manufacturing clean","plastic products industrial","polymer manufacturing plant","industrial plastic molding","plastic packaging production","factory quality control"],
  pharmacy:        ["pharmacy store interior organized","medicine shelves clean modern","drugstore professional","pharmacy counter service","medical supplies display","health products store"],
};

/** Fetch multiple Unsplash images for a given query. Returns base URLs (without params). */
async function fetchUnsplashImages(query: string, count: number = 6): Promise<string[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return [];
  try {
    const apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20&orientation=landscape&content_filter=high`;
    const resp = await fetch(apiUrl, { headers: { Authorization: `Client-ID ${accessKey}` } });
    if (!resp.ok) { console.warn(`[Unsplash] HTTP ${resp.status} for "${query}"`); return []; }
    const data = await resp.json() as { results: Array<{ id: string; urls: { raw: string } }> };
    if (!data.results?.length) return [];
    const pool = data.results.slice(0, Math.min(15, data.results.length));
    const shuffled = shuffleAndPick(pool, count);
    return shuffled.map(r => r.urls.raw.split("?")[0]);
  } catch { return []; }
}

/** Fetch images from Pexels API — used as fallback when Unsplash returns nothing. */
async function fetchPexelsImages(query: string, count: number = 6): Promise<string[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return [];
  try {
    const apiUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${Math.min(count * 3, 30)}&orientation=landscape`;
    const resp = await fetch(apiUrl, { headers: { Authorization: apiKey } });
    if (!resp.ok) { console.warn(`[Pexels] HTTP ${resp.status} for "${query}"`); return []; }
    const data = await resp.json() as { photos: Array<{ src: { large2x: string; landscape: string; large: string } }> };
    if (!data.photos?.length) return [];
    const pool = data.photos.slice(0, Math.min(15, data.photos.length));
    const shuffled = shuffleAndPick(pool, count);
    return shuffled.map(p => p.src.landscape || p.src.large2x || p.src.large);
  } catch { return []; }
}

async function buildImagePromptSection(description: string): Promise<string> {
  const cat = detectImageCategory(description);
  const pool = IMAGE_BANK[cat] || DEFAULT_IMAGES;
  const bankImages = shuffleAndPick(pool, 10);
  const bankUrls = bankImages.map(id =>
    `https://images.unsplash.com/${id}?w=1600&h=900&fit=crop&q=85&auto=format`
  );

  // ── Live Unsplash fetch: hero + gallery images ─────────────────────────────
  const terms = UNSPLASH_SEARCH_TERMS[cat] || UNSPLASH_SEARCH_TERMS["agency"];
  const heroQuery = terms[0]; // most specific query for hero

  // Use UP TO 3 different gallery queries to ensure diverse images
  // Each query fetches 2 images → total 6 gallery images from 3 distinct search contexts
  const galleryQueries = shuffleAndPick(
    terms.length > 1 ? terms.slice(1) : terms, // skip hero query if possible
    Math.min(3, terms.length)
  );

  const [heroUrls, ...galleryBatches] = await Promise.all([
    fetchUnsplashImages(heroQuery, 2),
    ...galleryQueries.map(q => fetchUnsplashImages(q, 3)),
  ]);

  // Combine gallery results, deduplicate, take first 6
  const combinedGallery = Array.from(new Set(galleryBatches.flat()));

  // ── Pexels fallback if Unsplash returned nothing ────────────────────────────
  let liveHeroBase = heroUrls[0] || null;
  let liveGalleryBases = combinedGallery.length >= 4 ? combinedGallery : [];
  let imageSource = "Unsplash";

  if (!liveHeroBase) {
    const fallbackGalleryQuery = galleryQueries[0] || terms[0];
    const [pexHero, pexGallery] = await Promise.all([
      fetchPexelsImages(heroQuery, 2),
      fetchPexelsImages(fallbackGalleryQuery, 6),
    ]);
    if (pexHero[0]) {
      liveHeroBase = pexHero[0];
      liveGalleryBases = pexGallery.length >= 4 ? pexGallery : [];
      imageSource = "Pexels";
    }
  }

  let lines: string;

  if (liveHeroBase) {
    const isUnsplashUrl = liveHeroBase.includes("unsplash.com");
    const heroUrl = isUnsplashUrl
      ? `${liveHeroBase}?w=1920&h=1080&fit=crop&q=90&auto=format`
      : liveHeroBase;
    const heroLine = `  1. ${heroUrl}  ← USE THIS AS HERO BACKGROUND (category:${cat})`;

    let galleryLines: string;
    if (liveGalleryBases.length >= 4) {
      galleryLines = liveGalleryBases.map((base, i) => {
        const isUnsplash = base.includes("unsplash.com") && !base.includes("?");
        const url = isUnsplash ? `${base}?w=700&h=500&fit=crop&q=85&auto=format` : base;
        return `  ${i + 2}. ${url}  ← GALLERY image ${i + 1}`;
      }).join("\n");
    } else {
      galleryLines = bankUrls.slice(0, 8).map((url, i) =>
        `  ${i + 2}. ${url}`
      ).join("\n");
    }
    lines = `${heroLine}\n${galleryLines}`;
    console.log(`[${imageSource}] ✓ cat:${cat} hero+gallery fetched. gallery:${liveGalleryBases.length} imgs`);
  } else {
    lines = bankUrls.map((url, i) => `  ${i + 1}. ${url}`).join("\n");
    console.log(`[Images] Fallback IMAGE_BANK for cat:${cat}`);
  }

  return `Business category detected: "${cat}"
⚠️ ALL images below are PRE-SELECTED for "${cat}" — they are 100% relevant to this business type.
USE THESE EXACT FULL URLs (copy as-is into src="" or background-image:url(...)):
${lines}

CRITICAL IMAGE RULES:
• Image #1 (marked HERO) → use ONLY as hero section background-image CSS
• Images #2-7 (marked GALLERY) → use ONLY in gallery/portfolio section
• For gallery: use each image ONCE — NEVER repeat the same URL
• DO NOT use any other images, stock photos, or placeholder gradients instead of real images
• The images are already cropped and sized correctly — use them directly`;
}

/** Fetch real images as structured data (hero URL + gallery URLs). Used by the new two-stage builder. */
async function buildImageData(description: string): Promise<WebsiteImages> {
  const cat = detectImageCategory(description);
  const pool = IMAGE_BANK[cat] || DEFAULT_IMAGES;
  const bankImages = shuffleAndPick(pool, 10);
  const bankUrls = bankImages.map(id =>
    `https://images.unsplash.com/${id}?w=1200&h=800&fit=crop&q=85&auto=format`
  );

  const terms = UNSPLASH_SEARCH_TERMS[cat] || UNSPLASH_SEARCH_TERMS["agency"];
  const heroQuery = terms[0];
  const galleryQueries = shuffleAndPick(
    terms.length > 1 ? terms.slice(1) : terms,
    Math.min(3, terms.length)
  );

  const [heroUrls, ...galleryBatches] = await Promise.all([
    fetchUnsplashImages(heroQuery, 2),
    ...galleryQueries.map(q => fetchUnsplashImages(q, 3)),
  ]);

  const combinedGallery = Array.from(new Set(galleryBatches.flat()));
  let liveHeroBase = heroUrls[0] || null;
  let liveGalleryBases: string[] = combinedGallery.length >= 4 ? combinedGallery : [];

  if (!liveHeroBase) {
    const fallbackGalleryQuery = galleryQueries[0] || terms[0];
    const [pexHero, pexGallery] = await Promise.all([
      fetchPexelsImages(heroQuery, 2),
      fetchPexelsImages(fallbackGalleryQuery, 6),
    ]);
    if (pexHero[0]) {
      liveHeroBase = pexHero[0];
      liveGalleryBases = pexGallery.length >= 4 ? pexGallery : [];
    }
  }

  const fmt = (base: string, w: number, h: number) => {
    const isUnsplashRaw = base.includes("unsplash.com") && !base.includes("?");
    return isUnsplashRaw ? `${base}?w=${w}&h=${h}&fit=crop&q=85&auto=format` : base;
  };

  const hero = liveHeroBase ? fmt(liveHeroBase, 1920, 1080) : bankUrls[0];
  const galleryBase = liveGalleryBases.length >= 4 ? liveGalleryBases : bankUrls;
  const gallery = galleryBase.slice(0, 6).map(u => fmt(u, 800, 600));
  const about = gallery[1] || gallery[0];

  console.log(`[ImageData] cat:${cat} hero:${hero.slice(0, 60)}... gallery:${gallery.length}`);
  return { hero, gallery, about };
}

/**
 * Extracts the actual business name from a user request string.
 * e.g. "أريد تصميم موقع لوكالة دعاية اسمها بريميوم تارجت" → "بريميوم تارجت"
 */
function extractBusinessName(desc: string): string {
  // Arabic: "اسمها X", "اسمه X", "اسمها: X", "بإسم X", "باسم X"
  const arNameMatch = desc.match(/(?:اسم[هاهماته]*|بإسم|باسم)[:\s]+([^\s،,\.؟!]{2,}(?:\s+[^\s،,\.؟!]{2,})?)/i);
  if (arNameMatch) return arNameMatch[1].trim();
  // English: "named X", "called X", "name is X"
  const enNameMatch = desc.match(/(?:named?|called?|name\s+is)\s+"?([A-Za-z][^"،,\.]{2,}(?:\s+[A-Za-z][^"،,\.]{2,})?)"?/i);
  if (enNameMatch) return enNameMatch[1].trim();
  // Arabic quoted name: "X" (Arabic letters inside quotes)
  const quotedAr = desc.match(/[""]([^\s""][^\s"",\.]{1,}(?:\s+[^\s"",\.]{1,})?)[""]/);
  if (quotedAr) return quotedAr[1].trim();
  return "";
}

/**
 * Extracts the business type from a user request string.
 * e.g. "أريد تصميم موقع لوكالة دعاية اسمها..." → "وكالة دعاية"
 */
function extractBusinessType(desc: string): string {
  const patterns = [
    /(?:موقع|تصميم موقع|أنشئ موقع|صمم موقع|أريد موقع)\s+(?:ل|لـ)?([^،,\.؟!\d]{3,40}?)(?:\s+(?:في|اسم|بـ)|$)/i,
    /(?:website for|site for|build.*for)\s+([A-Za-z\s]{3,40}?)(?:\s+(?:in|named|called)|$)/i,
  ];
  for (const p of patterns) {
    const m = desc.match(p);
    if (m) return m[1].trim();
  }
  return "";
}

// ─── Categories where a physical location map makes sense ────────────────────
const LOCATION_CATEGORIES = new Set([
  "restaurant", "cafe", "grill", "medical", "hotel", "gym", "beauty",
  "automotive", "supermarket", "pharmacy", "legal", "education", "events",
  "furniture", "decor", "travel", "security", "printing",
]);

/** Extract a city or area name from the user description. */
function extractLocationQuery(desc: string, businessName: string): string {
  const citiesAr = ["الرياض","جدة","الدمام","مكة","المدينة","أبها","الطائف","تبوك","الخبر","القطيف","الجبيل","ينبع","نجران","جازان","الباحة","سكاكا","عرعر","بريدة","عنيزة","الاحساء","القصيم","حائل","ظهران","العليا","حفر الباطن"];
  const citiesEn = ["Riyadh","Jeddah","Dammam","Mecca","Medina","Abha","Taif","Tabuk","Khobar","Jubail","Yanbu","Najran","Jazan","Baha","Sakaka","Arar","Buraidah","Hail","Dhahran","Al-Hasa"];
  for (const city of citiesAr) {
    if (desc.includes(city)) {
      return [businessName, city, "Saudi Arabia"].filter(Boolean).join(" ");
    }
  }
  for (const city of citiesEn) {
    if (desc.toLowerCase().includes(city.toLowerCase())) {
      return [businessName, city, "Saudi Arabia"].filter(Boolean).join(" ");
    }
  }
  const inMatch = desc.match(/(?:في|بـ?)\s+([^\s،,\.؟!]{3,20})/);
  if (inMatch) return [businessName, inMatch[1], "Saudi Arabia"].filter(Boolean).join(" ");
  return businessName ? `${businessName} Saudi Arabia` : "";
}

/** Google Places API result shape */
interface PlacesResult {
  name?: string;
  address?: string;
  phone?: string;
  rating?: number;
  totalRatings?: number;
  hours?: string[];
  lat?: number;
  lng?: number;
}

/** Fetch real business data from Google Places Text Search + Details. */
async function fetchGooglePlacesData(query: string): Promise<PlacesResult | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || !query) return null;
  try {
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=ar&region=SA&key=${apiKey}`;
    const searchResp = await fetch(searchUrl);
    if (!searchResp.ok) return null;
    const searchData = await searchResp.json() as any;
    if (searchData.status !== "OK" || !searchData.results?.length) return null;
    const place = searchData.results[0];

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,opening_hours&language=ar&key=${apiKey}`;
    const detailsResp = await fetch(detailsUrl);
    let phone = "", hours: string[] = [];
    if (detailsResp.ok) {
      const det = await detailsResp.json() as any;
      if (det.status === "OK" && det.result) {
        phone = det.result.formatted_phone_number || "";
        hours = det.result.opening_hours?.weekday_text || [];
      }
    }
    return {
      name: place.name,
      address: place.formatted_address,
      phone,
      rating: place.rating,
      totalRatings: place.user_ratings_total,
      hours,
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
    };
  } catch (e) {
    console.warn("[Places] Error:", e);
    return null;
  }
}

/** Build a prompt section telling the AI to embed a real Google Map. */
function buildMapsPromptSection(locationQuery: string, isArabic: boolean, places?: PlacesResult | null): string {
  let embedUrl: string;
  if (places?.lat && places?.lng) {
    embedUrl = `https://maps.google.com/maps?q=${places.lat},${places.lng}&z=16&output=embed&hl=${isArabic ? "ar" : "en"}`;
  } else {
    embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(locationQuery)}&output=embed&hl=${isArabic ? "ar" : "en"}`;
  }
  return `
GOOGLE MAP REQUIREMENT — MANDATORY:
Add an interactive Google Map iframe inside the contact section (id="contact").
This is FREE — no API key required. Use this EXACT iframe embed (copy verbatim):

<iframe
  src="${embedUrl}"
  width="100%" height="380"
  style="border:0;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.14);display:block;margin-top:24px;"
  allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade">
</iframe>

Place the map below the contact info / form, spanning full width. On mobile (max-width:768px), keep height:280px.`;
}

/** Build a prompt section with real business data from Google Places. */
function buildPlacesPromptSection(data: PlacesResult): string {
  const lines = ["REAL BUSINESS DATA (verified from Google Maps — use this in the website, do NOT invent placeholders):"];
  if (data.name)         lines.push(`• Business Name: ${data.name}`);
  if (data.address)      lines.push(`• Address: ${data.address}`);
  if (data.phone)        lines.push(`• Phone: ${data.phone}`);
  if (data.rating)       lines.push(`• Google Rating: ${data.rating}/5 ⭐ (${data.totalRatings || 0} reviews)`);
  if (data.hours?.length) lines.push(`• Working Hours:\n  ${data.hours.slice(0, 7).join("\n  ")}`);
  lines.push("Use the above real address in the contact section footer. Use the real phone number for WhatsApp & call buttons.");
  return lines.join("\n");
}

export interface GenerateWebsiteOptions {
  primaryColor?: string;
  accentColor?: string;
  designStyle?: string;
}

export async function generateWebsite(description: string, language: string = "ar", options: GenerateWebsiteOptions = {}): Promise<GeneratedWebsite> {
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

Generate a COMPLETE, premium single-page website based on this user request: "${description}"

⛔⛔⛔ ABSOLUTE RULE — READ BEFORE ANYTHING ELSE ⛔⛔⛔
The text above is a USER REQUEST/INSTRUCTION — it is NOT the website title, NOT the hero heading, NOT any content to display.
You MUST NEVER copy, echo, or repeat the user's request phrase anywhere in the website output.
❌ FORBIDDEN: Using "أريد تصميم موقع..." or "I want a website for..." or any part of the request as website content.
✅ CORRECT: Extract only the business NAME and TYPE from the request, then write fresh, professional website content.
⛔⛔⛔ END OF ABSOLUTE RULE ⛔⛔⛔

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
STEP 1 — SMART SECTION SELECTION (READ BEFORE WRITING HTML)
═══════════════════════════════════════
Based on the business type you detected, SELECT the relevant BONUS sections from the list below and include them in the page — in addition to the mandatory 8 sections:

🍽️ RESTAURANT / CAFE / GRILL → Add:
  A. INTERACTIVE MENU SECTION (id="menu"): Tabbed menu with JavaScript tab switching. Tabs = food categories specific to this restaurant (e.g. مشاوي | أرز | مقبلات | مشروبات | حلويات). Each tab shows a 3-column card grid with: food photo (Unsplash), dish name, 1-line description, price in SAR. Tab switching via onclick class toggle (no page reload). Add to navbar: "القائمة" → #menu
  B. DELIVERY PLATFORMS STRIP: مرسول | هنقرستيشن | كريم | شبيب logos as clickable badges
  C. RESERVATION FORM: Small section with: Date picker, Time selector, Guest count (1-2, 3-5, 6+), Name, Phone, Reserve button

🏥 CLINIC / MEDICAL / PHARMACY → Add:
  A. DOCTORS/TEAM SECTION: 3-4 doctor cards. Each: professional photo (Unsplash medical), doctor name (Arabic), specialty, credentials badge (MBBS, MD, etc.), book appointment button
  B. APPOINTMENT BOOKING SECTION (id="booking"): Modern form: patient name, phone, date picker, specialty dropdown, doctor dropdown, notes textarea. Submit shows success message via JavaScript.
  C. FAQ ACCORDION: 5 questions specific to this medical field (e.g. for dental: "هل تبييض الأسنان آمن؟")

🏢 AGENCY / MARKETING / CREATIVE → Add:
  A. PORTFOLIO/CASE STUDIES (id="portfolio"): Filterable grid by project type. Filter buttons: الكل | هوية بصرية | تصميم مواقع | تسويق رقمي. On filter click: hide/show items with CSS transition. Each item: project image, title, brief result ("زيادة المبيعات 340%")
  B. PROCESS SECTION: 4-step numbered visual process. Each step: number (big gradient), title, description. Connected by dashed line.
  C. CLIENTS LOGO STRIP: 8 well-known brand logos as SVG placeholders with grayscale filter, color on hover

🏠 REAL ESTATE → Add:
  A. PROPERTY LISTINGS (id="properties"): Filter bar: نوع (شقة/فيلا/أرض) | المدينة | السعر. Grid of 6 property cards: photo, price, beds/baths/sqm specs, location, "اتصل الآن" + "احجز جولة" buttons
  B. MAP EMBED PLACEHOLDER: Styled div with Google Maps look and "موقعنا في خريطة غوغل" button
  C. MORTGAGE CALCULATOR: Simple JS calculator — price, down payment, years → monthly installment result

💄 BEAUTY / SALON / SPA → Add:
  A. SERVICE MENU WITH PRICES: 2-column table with categories. Each service: name, description, duration, price range in SAR. Styled as beautiful price list.
  B. BEFORE/AFTER GALLERY: CSS-based image comparison slider (clip-path technique)
  C. ONLINE BOOKING MINI-FORM: Service select, date, time, stylist preference

💪 GYM / FITNESS → Add:
  A. CLASS SCHEDULE TABLE: Weekly timetable (Sat-Thu). Each cell: class name, instructor, time, available spots. Color-coded by type.
  B. MEMBERSHIP PLANS: 3 tiers (شهري | ربع سنوي | سنوي) with features checklist and price. Middle plan highlighted as "الأفضل قيمة".
  C. TRANSFORMATION GALLERY: Before/after client results with testimonial

🎓 EDUCATION / ACADEMY → Add:
  A. COURSES GRID: Cards with: course image, title, instructor, duration (hours), level (مبتدئ/متوسط/متقدم), price, "سجل الآن" button
  B. INSTRUCTORS SECTION: 3-4 instructor profiles with specialty and rating
  C. ENROLLMENT FORM: Course select, name, phone, experience level, submit

🚗 AUTOMOTIVE → Add:
  A. VEHICLES/SERVICES GRID with filter by type
  B. BOOKING SERVICE APPOINTMENT: date, car model, service type
  C. COMPARE PACKAGES: side-by-side comparison table

🌐 TECH / SOFTWARE / STARTUP → Add:
  A. PRODUCT FEATURES with screenshots/mockup
  B. PRICING TIERS: 3 plans (مجاني | احترافي | مؤسسي) with feature comparison table
  C. INTEGRATION LOGOS: compatible platforms strip

⛔ UNIVERSAL for ALL business types — ALWAYS include:
  D. FAQ ACCORDION: 5–6 questions unique to this exact business. Each Q/A uses JS onclick toggle (max-height:0 → max-height:500px; transition:max-height 0.4s ease). Styled with gradient icon and expand/collapse arrow.
  E. WORKING CONTACT FORM: JavaScript validation — check empty fields, show red border + error message. On submit: hide form, show success animation + "شكراً! سنتواصل معك قريباً" message.

═══════════════════════════════════════
VISUAL DESIGN STANDARD 2025 — PREMIUM QUALITY
═══════════════════════════════════════
The website MUST look like it was designed in 2025 by a top-tier agency. Think Notion, Linear, Vercel, Stripe landing pages — but adapted for the Arab market. Each website should feel UNIQUE — not copy-pasted from a template.

▸ NAVBAR: position:fixed; glassmorphism effect — backdrop-filter:blur(20-28px); semi-transparent background derived from brand primary color (NOT always rgba(5,8,22,0.72)). Border-bottom: subtle separator. On scroll: increase opacity of background.
  Adapt navbar style to brand identity: a luxury brand can have black+gold nav, a fresh startup can have light frosted nav, a medical site can have white+brand-color nav.
  LOGO RULE — REQUIRED:
  • Generate a small inline SVG logo as the brand mark in the navbar. Add id="aw-ai-logo" to the SVG element. The SVG should be 36×36px, use the brand's primary/accent colors, and include the first letter(s) or a simple icon that represents the business (e.g., a fork for restaurants, a star for luxury, a house for real estate). The business name in text follows the SVG logo.
  • Example structure: <a href="#" style="display:flex;align-items:center;gap:10px;text-decoration:none;"><svg id="aw-ai-logo" width="36" height="36" viewBox="0 0 36 36">...</svg><span style="font-weight:800;font-size:1.1rem;background:linear-gradient(90deg,#fff,ACCENT);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">BUSINESS_NAME</span></a>
  • The SVG MUST be meaningful and unique — NO generic circles. Create something that fits the business type.
  • CRITICAL: The business name text MUST appear ONLY ONCE in the entire website — in the navbar only. NEVER repeat it in the footer or any other section. Footer uses only the SVG logo (id="aw-ai-logo-footer" — a smaller copy of the same SVG, 28×28px) followed by a tagline, NOT the business name text.

▸ HERO (FULL VIEWPORT):
  Requirements (functional, not stylistic):
  • id="hero", min-height:100vh, background-image uses Image #1 from the stock list, photo MUST be visible (not hidden by overlay)
  • Dark overlay on top of photo for text readability — derive overlay colors from brand palette, not hardcoded dark navy
  • Position overlay: position:absolute;inset:0;z-index:1 — text content z-index:2
  • Optional: 2-3 decorative orbs (blur, low opacity) behind text for depth — NEVER as replacement for the photo
  
  Creative freedom — choose the best layout for this specific business:
  • Centered layout (hero content centered): works for clinics, agencies
  • Left-aligned layout (content left, image right): works for tech, SaaS
  • Split layout (50% text, 50% full-height image): works for restaurants, real estate
  • Text heavy with subtle texture: works for education, legal
  
  Hero text: font-size clamp(2.8rem,6.5vw,5.5rem), font-weight:900, letter-spacing:-0.025em. Subtitle: lower opacity.
  Two CTA buttons: one solid gradient (primary action), one ghost/outline (secondary action).
  CTA text MUST match business type — NOT just "اكتشف أكثر":
  • Clinic: "احجز موعدك الآن" + "تعرف علينا"
  • Restaurant: "اطلب الآن" + "شاهد القائمة"
  • Agency: "احصل على عرض مجاني" + "أعمالنا"
  • Tech/SaaS: "ابدأ مجاناً" + "شاهد كيف يعمل"

▸ CTA BUTTONS — PREMIUM DESIGN STANDARDS:
  ✅ Primary button: Use the brand's primary/accent colors in gradient. Keep colors harmonious:
    - Same-hue gradients: linear-gradient(135deg, DARKER_SHADE, LIGHTER_SHADE)
    - Brand-primary to brand-accent: acceptable if they share visual harmony
    - Examples: navy→blue, teal→cyan, maroon→amber, dark-green→emerald, purple→violet
  ❌ AVOID (not forbidden, just bad taste):
    - Rainbow multi-stop gradients on a single button
    - Neon combinations with no contrast (yellow on white, cyan on light-bg)
    - Colors that clash with the background section
  ✅ Button base style (quality minimum):
    border-radius:12px; padding:14px 26px; font-weight:600; letter-spacing:0.02em;
    box-shadow:0 6px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15);
    transition:transform 0.2s ease, box-shadow 0.2s ease; cursor:pointer;
  ✅ Hover: transform:translateY(-2px); stronger shadow
  ✅ Active: onmousedown="this.style.transform='translateY(1px)'"
  ✅ Secondary/outline: transparent bg, 2px solid border, same border-radius

▸ STATS BAR: Dark gradient background. 4 animated counters. Numbers use gradient text (background-clip:text). Labels uppercase letter-spacing.
  ⚠️ STATS MUST BE 100% ORIGINAL — invented fresh from THIS description. NEVER copy template numbers like "200+ مشروع" or "98% رضا العملاء" that you've seen in training data.
  Rules for original stats:
  - Infer the business AGE from description clues (if "founded 2015" → 10+ سنة). If unknown, use a plausible range (3–8 years for a startup, 10–25 for established).
  - Infer SCALE from description (small shop ≠ international chain). A small cafe won't have "500+ وجبة يومياً".
  - Use DIFFERENT STAT TYPES based on what makes THIS business unique: could be # clients, # products, # cities served, # certifications, delivery speed, response time, etc.
  - VARY the percentage stats — not all businesses have "98%". Use realistic numbers: 91%, 96%, 4.8/5, etc.
  - At least 2 stats must be specific to the EXACT product/service mentioned (e.g. if "مطعم مندي" → "مندي" related stat, not generic food stat).

▸ ABOUT: 2-column layout. LEFT column: Use image #2 from the pre-selected list above — wrap it with a double-layer gradient border (::before/::after pseudo-elements). Add a floating experience badge (gradient bg, bottom corner). RIGHT column: checklist of key strengths with colored check icons + 2-paragraph brand story mentioning the actual business name and city. CRITICAL: Use the image URL from the pre-selected list — NEVER a placeholder or random gradient.
⛔ STANDALONE IMAGE SECTION BAN — CRITICAL:
  • NEVER add a <section> or <div> between the Stats and the Services/About sections that contains ONLY a background image or <img> with no text, heading, or meaningful content.
  • Every section in the page MUST contain at least: a heading + body text + (optionally) an image. A section with ONLY an image and nothing else is FORBIDDEN.
  • Specifically forbidden pattern: <section style="background-image:url(...)"><img src="..."/></section> with nothing else inside.
  • If you want to show a full-bleed image, it MUST have a dark overlay + heading + subtext on top of it (minimum).

▸ SERVICES: 3-column responsive grid of cards. 

  REQUIRED CSS (ensures 3-column grid on desktop, NOT a vertical list):
  .aw-services-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  .aw-service-card {
    background: linear-gradient(white,white) padding-box,
                linear-gradient(135deg, PRIMARY, ACCENT) border-box;
    border: 1.5px solid transparent;
    border-radius: 16px;
    padding: 2rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .aw-service-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.12);
  }
  @media(max-width: 768px) { .aw-services-grid { grid-template-columns: 1fr; } }
  @media(max-width: 1024px) { .aw-services-grid { grid-template-columns: repeat(2, 1fr); } }

  Each card: gradient icon box (48×48px), service title, 2-line description. Icon box with small rotation on hover.
  Show 6 services (or 3 if the business is simple) — ALWAYS use specific service names for THIS business.
  SERVICES MUST BE 100% SPECIFIC: if "مطعم مشاوي" → "مشاوي لحم", "دجاج مشوي", "أرز سعودي", etc. NEVER "خدمة احترافية" or "Service 1".

▸ GALLERY (id="gallery"): Responsive image grid with hover lightbox effects.

  REQUIRED CSS (copy exactly — this ensures a proper 3-column grid, NOT a single column):
  .aw-gallery-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .aw-gallery-item {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    aspect-ratio: 4/3;
    cursor: pointer;
  }
  .aw-gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.4s ease;
  }
  .aw-gallery-item:hover img { transform: scale(1.08); }
  .aw-gallery-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%);
    opacity: 0; transition: opacity 0.3s ease;
    display: flex; align-items: center; justify-content: center;
  }
  .aw-gallery-item:hover .aw-gallery-overlay { opacity: 1; }
  @media(max-width: 768px) { .aw-gallery-grid { grid-template-columns: repeat(2, 1fr); } }
  @media(max-width: 480px) { .aw-gallery-grid { grid-template-columns: 1fr; } }

  HTML structure:
  <div class="aw-gallery-grid">
    <div class="aw-gallery-item aw-reveal" onclick="openLightbox('IMAGE_URL', 0)">
      <img src="IMAGE_URL" alt="Gallery image" loading="lazy">
      <div class="aw-gallery-overlay"><i class="fa-solid fa-expand" style="color:white;font-size:2rem;"></i></div>
    </div>
    <!-- Repeat for each of the 6 gallery images -->
  </div>

  Use images #2 through #7 from the pre-selected image list (marked "GALLERY image N").
  LIGHTBOX: Full-screen overlay with prev/next navigation, ESC closes.
  CRITICAL: Use ONLY the pre-selected URLs. Each gallery item uses a DIFFERENT image from that list.

▸ CTA BAND: Full-width gradient background. Large bold headline personalized for THIS business (e.g. for a restaurant: "هل أنت جائع؟ اطلب أشهى المشاوي الآن"). Decorative radial glow orb in corner.

▸ TESTIMONIALS: Dark section, glassmorphism cards (rgba background + backdrop-filter). Bottom gradient border appears on hover (scaleX animation). Quote icon with low opacity. Write 3 REALISTIC testimonials with:
  ⚠️ NAMES MUST BE VARIED — NEVER use the same 3 names repeatedly. Pick 3 different names from this diverse bank:
  Male names: عبدالرحمن الغامدي، تركي المالكي، سلطان الزهراني، حمد العنزي، خالد الدوسري، ماجد الحربي، فيصل السلمي، عمر الرشيدي، ياسر البقمي، سعود الشهري، نواف الصبيحي، عادل القرني
  Female names: ريم السهلي، لجين الحمدان، مها الصالح، دانة العمري، أريج الخالدي، سارة الجهني، شيخة المطيري، رنا الثمالي، فاطمة الشريف، نوف العسيري
  - Vary between male/female — minimum 1 female per page
  - Each testimonial MUST mention a SPECIFIC detail about the business (not generic praise): what exact service they used, a specific result or outcome, timeframe
  - Do NOT use: "خدمة ممتازة"، "جودة رائعة"، "أوصي بهم" as standalone sentences — add specific details after
  * 5-star ratings using fa-star icons

▸ CONTACT (id="contact"): 2-column section on dark background. LEFT COLUMN — real contact info boxes with gradient icon circles:
  • Phone (fa-phone): Use number from description OR default +966 51 234 5678
  • WhatsApp (fa-whatsapp): SAME number as phone — big green WhatsApp button with "تواصل عبر واتساب" text
  • Email (fa-envelope): Use email from description OR default info@[businessname].sa
  • Address (fa-location-dot): Use city from description OR الرياض، المملكة العربية السعودية
  • Working hours (fa-clock): السبت–الخميس: 9ص – 10م (adapt to business type)
  RIGHT COLUMN — white card (gradient border) with clean contact form: Full name, Phone, Message, Submit button (primary gradient color).

▸ FOOTER: Required on every website. Creative freedom on layout and color. Structure minimum:
  • Background: dark, derived from brand palette (NOT always hardcoded #050814 — use darkened primary or charcoal)
  • 2-3 column grid: [Brand+tagline+social] [Quick links] [Contact info or newsletter]
  • Brand: SVG logo (id="aw-ai-logo-footer", 28×28px) + tagline text (NOT the business name again)
  • Social links: relevant to this business type (Instagram, Twitter/X, Snapchat, LinkedIn, YouTube)
  • Bottom bar: thin border, "جميع الحقوق محفوظة © ${new Date().getFullYear()} | Powered by ArabyWeb.net"
  • Optional extras: newsletter signup input, payment icons (MADA, Apple Pay), back-to-top button

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
- Nav links (inside .aw-nav-links): Choose 4-6 CONTEXTUALLY RELEVANT links for this specific business. Examples:
  • Medical: من نحن | خدماتنا | فريقنا | احجز موعد | آراء العملاء
  • Restaurant: من نحن | القائمة | أعمالنا | آراء العملاء
  • Agency: من نحن | خدماتنا | أعمالنا | عملاؤنا | آراء العملاء
  • Education: من نحن | كورساتنا | المدربون | آراء العملاء
  • Default: ${isArabic ? "من نحن (#about), خدماتنا (#services), أعمالنا (#gallery), آراء العملاء (#testimonials)" : "About (#about), Services (#services), Gallery (#gallery), Testimonials (#testimonials)"}
- After .aw-nav-links div, add ONE standalone CTA button. Use a BUSINESS-SPECIFIC action text, NOT just "تواصل معنا":
  • Clinic → "احجز موعدك"  |  Restaurant → "اطلب الآن"  |  Agency → "احصل على عرض"
  • Education → "سجّل الآن"  |  Real Estate → "استفسر الآن"  |  Beauty → "احجزي الآن"
  • Default → ${isArabic ? '"تواصل معنا"' : '"Contact Us"'}

⛔ CRITICAL — NO-DUPLICATE RULE (READ CAREFULLY):
  The nav structure has TWO distinct zones:
  ZONE A: <div class="aw-nav-links"> → contains page-section links ONLY (from نحن, خدمات, gallery, testimonials, etc.)
  ZONE B: AFTER the closing </div> of Zone A → ONE standalone <a> or <button> acting as CTA (احجز / اطلب / تواصل)

  ⚠️ The CTA text (احجز موعدك / اطلب الآن / تواصل معنا / etc.) must NEVER appear INSIDE Zone A (.aw-nav-links).
  ⚠️ If you add the CTA text as a link inside .aw-nav-links, you are duplicating it — this is a CRITICAL ERROR.
  ⚠️ Check your output: count how many times the CTA text appears in <nav>. It must be EXACTLY ONCE.
- NEVER use "نشر", "معاينة", "تعديل", "publish", "preview", "edit" as nav text

═══════════════════════════════════════
MOBILE HAMBURGER MENU — REQUIRED (EXACT PATTERN — DO NOT DEVIATE)
═══════════════════════════════════════
⚠️ This EXACT implementation is MANDATORY. The hamburger MUST work on mobile. DO NOT use inline display:none on the button.

STEP A — Add this CSS rule (NO inline style on the button, only CSS controls visibility):
.aw-hamburger { display:none; background:none; border:none; cursor:pointer; padding:8px; color:inherit; }
.aw-nav-links { display:flex; gap:2rem; align-items:center; }
@media(max-width:768px) {
  .aw-nav-links { display:none; }
  .aw-hamburger { display:flex; align-items:center; justify-content:center; }
  #aw-mobile-menu { display:none; flex-direction:column; position:absolute; top:100%; left:0; right:0; background:rgba(5,8,22,0.97); backdrop-filter:blur(16px); padding:1.5rem; gap:1rem; border-top:1px solid rgba(255,255,255,0.1); }
  #aw-mobile-menu.open { display:flex; }
}

STEP B — Inside the <nav>, add EXACTLY:
<button class="aw-hamburger" aria-label="القائمة" onclick="var m=document.getElementById('aw-mobile-menu');m.classList.toggle('open')">
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
</button>
<div id="aw-mobile-menu">
  <!-- Repeat nav links here, each closes menu on click: onclick="document.getElementById('aw-mobile-menu').classList.remove('open')" -->
</div>

STEP C — The .aw-nav-links div wraps the desktop nav links and is hidden on mobile via CSS (NOT inline style).

═══════════════════════════════════════
JAVASCRIPT — COMPLETE INTERACTIVE FEATURES (ALL REQUIRED)
═══════════════════════════════════════
Include ONE <script> tag at end of body with ALL of these features:

1. SCROLL ANIMATIONS (IntersectionObserver):
   .aw-reveal{opacity:0;transform:translateY(40px);transition:opacity 0.7s cubic-bezier(.22,1,.36,1),transform 0.7s cubic-bezier(.22,1,.36,1);}
   .aw-visible{opacity:1;transform:none;}
   Observer threshold:0.15 — adds "aw-visible" when element enters viewport.

2. NAVBAR SCROLL EFFECT:
   scroll > 60px → nav gets class "scrolled" → increase navbar background opacity (brand-appropriate dark, match the nav's initial color scheme), box-shadow:0 4px 30px rgba(0,0,0,0.3)

3. COUNTER ANIMATION (for stats section):
   On IntersectionObserver trigger, animate from 0 to data-target over 1800ms using requestAnimationFrame.
   HTML: <span class="aw-counter" data-target="500" data-suffix="+">0</span>
   JS parses data-target and data-suffix, animates smoothly, adds suffix when done.

4. GALLERY LIGHTBOX:
   const galleryImgs = []; // Populate with all gallery image src URLs on DOMContentLoaded
   function openLightbox(src, idx) { ... show overlay with img, set currentIndex }
   function closeLightbox() { ... hide overlay }
   function prevImg() { currentIndex = (currentIndex - 1 + galleryImgs.length) % galleryImgs.length; ... }
   function nextImg() { currentIndex = (currentIndex + 1) % galleryImgs.length; ... }
   document.addEventListener('keydown', e => { if e.key==='ArrowLeft' prevImg(); if ArrowRight nextImg(); if Escape closeLightbox() })
   Lightbox HTML (add to body): <div id="aw-lightbox" onclick="closeLightbox()" style="display:none;position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.92);align-items:center;justify-content:center;flex-direction:column;gap:1rem;"><img id="aw-lb-img" style="max-width:90vw;max-height:80vh;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.5)"><div style="display:flex;gap:1rem;"><button onclick="event.stopPropagation();prevImg()" style="...">&#8592;</button><button onclick="event.stopPropagation();closeLightbox()" style="...">&#10005;</button><button onclick="event.stopPropagation();nextImg()" style="...">&#8594;</button></div></div>

5. FAQ ACCORDION:
   function toggleFaq(el) { var answer = el.nextElementSibling; var isOpen = answer.style.maxHeight; answer.style.maxHeight = isOpen ? '' : answer.scrollHeight+'px'; el.querySelector('.faq-icon').style.transform = isOpen ? 'rotate(0)' : 'rotate(45deg)'; }
   CSS: .faq-answer{max-height:0;overflow:hidden;transition:max-height 0.4s ease;}
   Each FAQ item: <div class="faq-q" onclick="toggleFaq(this)"><span>السؤال</span><span class="faq-icon" style="transition:transform 0.3s">+</span></div><div class="faq-answer"><p>الجواب</p></div>

6. CONTACT FORM VALIDATION:
   function validateForm(formId) {
     let valid = true;
     document.querySelectorAll('#'+formId+' [required]').forEach(field => {
       if (!field.value.trim()) { field.style.borderColor='#ef4444'; valid = false; }
       else { field.style.borderColor=''; }
     });
     if (valid) { document.getElementById(formId).style.display='none'; document.getElementById(formId+'-success').style.display='flex'; }
     return false; // prevent real submit
   }
   Success message div (hidden by default): <div id="FORMID-success" style="display:none;flex-direction:column;align-items:center;gap:1rem;padding:3rem;text-align:center;"><i class="fa-solid fa-circle-check" style="font-size:3rem;color:#22c55e;"></i><h3>شكراً! سنتواصل معك خلال 24 ساعة</h3></div>

7. TABS SYSTEM (for restaurant menu, packages, etc.):
   function switchTab(tabGroup, tabId) {
     document.querySelectorAll('[data-tab-group="'+tabGroup+'"]').forEach(el => el.classList.remove('active'));
     document.querySelectorAll('[data-tab-content="'+tabGroup+'"]').forEach(el => el.style.display='none');
     document.querySelector('[data-tab="'+tabId+'"]').classList.add('active');
     document.getElementById(tabId).style.display='grid';
   }
   // Set first tab active by default on DOMContentLoaded

8. PORTFOLIO FILTER (for agencies):
   function filterProjects(category) {
     document.querySelectorAll('.portfolio-item').forEach(item => {
       item.style.display = (category === 'all' || item.dataset.category === category) ? 'block' : 'none';
     });
     document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.filter === category));
   }

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
STOCK IMAGES — PRE-SELECTED FOR THIS REQUEST
═══════════════════════════════════════
The following Unsplash image URLs have been pre-fetched for THIS specific request.
USE_IMAGES_PLACEHOLDER

⚠️ IMPORTANT — USE URLS EXACTLY AS PROVIDED:
  • Each entry is a COMPLETE ready-to-use URL — copy it directly into src="" or background-image:url(...)
  • DO NOT modify the URLs. DO NOT reconstruct them from IDs. Use as-is.
  • Item #1 marked "← USE THIS FOR HERO BACKGROUND" = place directly as hero background-image CSS
  • For gallery cards, adjust the w/h params: replace w=1920&h=1080 with w=700&h=500 on the same base URL
  • Use at least 7 DIFFERENT images. NEVER reuse the same URL twice on the page.

═══════════════════════════════════════
WHATSAPP FLOATING BUTTON — ABSOLUTELY MANDATORY ⚠️
═══════════════════════════════════════
⛔ This element is REQUIRED on EVERY website. NEVER omit it. Place it BEFORE the closing </body> tag.
Copy this EXACT code — do NOT change the structure, only update the phone number if provided:

<a id="aw-whatsapp-btn" href="https://wa.me/966512345678" target="_blank" rel="noopener" style="position:fixed;bottom:1.75rem;${isArabic ? "left" : "right"}:1.75rem;z-index:9999;background:#25D366;color:#fff;width:62px;height:62px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 25px rgba(37,211,102,0.55),0 4px 10px rgba(0,0,0,0.15);transition:transform 0.3s,box-shadow 0.3s;text-decoration:none;" onmouseover="this.style.transform='scale(1.12)';this.style.boxShadow='0 12px 32px rgba(37,211,102,0.65),0 6px 14px rgba(0,0,0,0.18)'" onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 8px 25px rgba(37,211,102,0.55),0 4px 10px rgba(0,0,0,0.15)'">
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
</a>

═══════════════════════════════════════
COLOR PALETTE GUIDELINES
═══════════════════════════════════════
⚠️ CRITICAL: If mandatory colors were specified at the TOP of this prompt, use THOSE EXACT colors. Skip this section if colors were already given.
Otherwise, choose a UNIQUE palette from the options below. NEVER default to generic #2196f3 blue. NEVER repeat the same palette for the same industry — pick a DIFFERENT option each time.

RESTAURANT / GRILL / FOOD (pick ONE variety):
  A: Deep mahogany + amber (#7c2d12 primary, #f59e0b accent) — bold, Saudi BBQ
  B: Noir charcoal + hot orange (#1a0a00 primary, #ea580c accent) — street food modern
  C: Dark espresso + gold (#3b1106 primary, #fbbf24 accent) — fine dining
  D: Warm coffee brown + cream gold (#6f4e37 primary, #d4a843 accent) — cafe chic

MEDICAL / CLINIC / PHARMACY (pick ONE variety — NEVER always use #0f4c81):
  A: Deep teal + sky (#0d9488 primary, #0284c7 accent) — clean modern clinic
  B: Rich navy + electric cyan (#1e40af primary, #22d3ee accent) — high-tech hospital
  C: Dark slate-blue + emerald (#164e63 primary, #34d399 accent) — wellness center
  D: Deep purple + violet (#4c1d95 primary, #7c3aed accent) — specialty clinic
  E: Forest teal + gold (#0c4a6e primary, #f59e0b accent) — premium healthcare

LUXURY / PERFUME / JEWELRY (pick ONE variety):
  A: Near-black + warm gold (#0a0a0a primary, #d4a843 accent) — classic luxury
  B: Midnight navy + rose-gold (#1a1a2e primary, #c9a96e accent) — refined elegance
  C: Deep violet + champagne (#1c0a2e primary, #e879f9 accent) — avant-garde fashion
  D: Pure charcoal + platinum (#18181b primary, #a1a1aa accent) — ultra-minimal luxury

TECH / STARTUP / SOFTWARE (pick ONE variety):
  A: Indigo + cyan (#3730a3 primary, #22d3ee accent) — SaaS product
  B: Electric violet + teal (#7c3aed primary, #06b6d4 accent) — AI/tech startup
  C: Near-black + electric green (#030712 primary, #22c55e accent) — developer tool
  D: Deep slate + aurora purple (#0f172a primary, #a855f7 accent) — dark modern SaaS

BEAUTY / SALON / SPA (pick ONE variety):
  A: Deep rose + hot pink (#831843 primary, #f472b6 accent) — vibrant beauty
  B: Crimson + coral (#be185d primary, #f43f5e accent) — bold salon
  C: Royal purple + fuchsia (#581c87 primary, #e879f9 accent) — luxury spa
  D: Deep plum + lavender (#4a0072 primary, #c084fc accent) — premium wellness

REAL ESTATE / PROPERTY (pick ONE variety):
  A: Navy + gold (#1e3a5f primary, #d4af37 accent) — established agency
  B: Forest green + emerald (#1a2e1a primary, #059669 accent) — sustainable property
  C: Charcoal + amber (#0f172a primary, #f59e0b accent) — premium listings
  D: Deep indigo + lavender (#312e81 primary, #a78bfa accent) — modern realty

EDUCATION / ACADEMY (pick ONE variety):
  A: Deep blue + orange (#1e3a8a primary, #f97316 accent) — dynamic learning
  B: Emerald + gold (#064e3b primary, #fbbf24 accent) — prestigious academy
  C: Royal navy + lime (#1e3a5f primary, #22c55e accent) — online education
  D: Deep indigo + amber (#312e81 primary, #f59e0b accent) — professional training

AGENCY / MARKETING (pick ONE variety):
  A: Deep navy + electric blue (#1e3a5f primary, #2563eb accent) — corporate
  B: Slate black + indigo (#0f172a primary, #6366f1 accent) — creative studio
  C: Dark stone + orange (#1c1917 primary, #f97316 accent) — bold agency
  D: Near-black + aurora violet (#18181b primary, #a78bfa accent) — premium agency

AUTOMOTIVE (pick ONE variety):
  A: Steel slate + blue (#1e293b primary, #3b82f6 accent) — modern dealer
  B: Racing red + crimson (#7f1d1d primary, #ef4444 accent) — performance
  C: Midnight + electric blue (#0c1445 primary, #60a5fa accent) — luxury auto

HOTEL / RESORT (pick ONE variety):
  A: Deep warm black + gold (#1a0a00 primary, #d4a843 accent) — 5-star resort
  B: Forest + teal (#064e3b primary, #10b981 accent) — eco-luxury
  C: Deep ocean + sky (#0c4a6e primary, #38bdf8 accent) — seaside resort

GYM / FITNESS (pick ONE variety):
  A: Deep red + blood orange (#1a0000 primary, #ef4444 accent) — intense energy
  B: Pitch black + neon green (#0a0a0a primary, #22c55e accent) — CrossFit/performance
  C: Dark stone + electric orange (#1c1917 primary, #f97316 accent) — lifestyle fitness

⚠️ SECTION CONTRAST RULE (for readability and visual rhythm):
• Alternate between dark and light sections to create visual breathing room
• Typical pattern: dark hero → light about/services → dark testimonials/CTA → light FAQ → dark footer
• You can break this pattern INTENTIONALLY for brand reasons (e.g., a luxury brand is all-dark, a medical brand is mostly white)
• NEVER have more than 3 consecutive same-background sections without a tonal change
• Section backgrounds should feel like they BELONG to the brand palette — not random

${MOBILE_RESPONSIVE_MANDATORY}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT — MANDATORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Output a COMPLETE, production-ready <!DOCTYPE html> document. Rules:
• Start with exactly: <!DOCTYPE html>
• Include ALL CSS inside a single <style> tag in <head> — Google Fonts @import MUST be first line of CSS, then full reset (*, box-sizing:border-box, overflow-x:hidden on html/body, img max-width:100%), then ALL component styles, then ALL @keyframes animations, then ALL responsive @media queries
• Responsive breakpoints MANDATORY in CSS: @media(max-width:1024px){2-col grids} @media(max-width:768px){1-col, hide nav-links, show hamburger} @media(max-width:480px){font-size clamp adjustments}
• Include Font Awesome 6 CDN <link> in <head>
• <title> = ${isArabic ? "Arabic" : "English"} SEO title (50-60 chars)
• <meta name="description"> = ${isArabic ? "Arabic" : "English"} meta description (150-160 chars)
• Include ALL required sections: navbar, hero, stats/highlights, about, services, gallery, testimonials, contact, footer — plus any industry-specific bonus sections
• Section ORDER: adapt to what makes sense for this business type. Suggestions:
  - Clinic: navbar → hero → about/team → services → gallery → testimonials → FAQ → contact → footer
  - Restaurant: navbar → hero → about → menu → gallery → testimonials → contact → footer
  - Agency: navbar → hero → stats → services/portfolio → about → process → testimonials → contact → footer
  - Default order: navbar → hero → stats → about → services → gallery → testimonials → contact → footer
• All animations in a <script> tag at the END of <body> — IntersectionObserver for scroll reveals, counter animation for stats, navbar scroll effect
• Do NOT output JSON. Do NOT use markdown code blocks. Output ONLY pure HTML starting with <!DOCTYPE html> and ending with </html>.

═══════════════════════════════════════
PROFESSIONAL CONTENT DEPTH — MANDATORY
═══════════════════════════════════════
Use your knowledge of this specific business type to write expert-level, realistic content that ONLY an industry insider would write:

• SERVICES: Write the actual service names professionals use in this industry. A dental clinic lists "تركيب التيجان الزركونية", "تبييض الأسنان بالليزر", not "خدمة طبية 1".
• ABOUT: Write a compelling brand story. For a restaurant: mention the chef's origins, the secret recipe, the sourcing of ingredients. For a clinic: mention the doctor's specialty, years of residency, certifications.
• HERO HEADLINE: Write a desire-triggering headline that speaks to the customer's deepest want. For a grills restaurant: "أشهى المشاوي الحجازية — بنكهة البيت وجودة المطاعم الفاخرة". NEVER use a generic tagline.
• STATS: Research-calibrated numbers. A local café won't have "500 عميل يومياً". Think realistically.
• CTA: Write the specific action relevant to THIS business. Restaurant = "اطلب الآن", Clinic = "احجز موعدك", Agency = "احصل على عرض مجاني".
• WORKING HOURS: Adapt realistically. Restaurant = till 2AM. Clinic = 8AM-8PM. Gym = 5AM-12AM.
• PRICING HINTS: Mention price tier signals (لا تكشف أسعاراً محددة بالضرورة) that match the business positioning.

═══════════════════════════════════════
⚠️ PRE-FLIGHT CHECKLIST — VERIFY BEFORE CLOSING </html>
═══════════════════════════════════════
Before ending the HTML, confirm ALL of these exist in your output:

STRUCTURE:
□ <nav> with SVG logo (id="aw-ai-logo") + business name + .aw-nav-links (EXACTLY 4 links: من نحن, خدماتنا, أعمالنا, آراء العملاء) + ONE CTA contact button + .aw-hamburger button + #aw-mobile-menu div
  ↳ VERIFY: "تواصل معنا" / "Contact" appears ONLY as the CTA button — NOT as a 5th item inside .aw-nav-links
□ <section id="hero"> with background-image, dark overlay, animated orbs, large hero text, 2 CTA buttons
□ Stats bar/section with 4 animated counters using data-target + data-suffix attributes
□ NO bare image section exists anywhere — every section between hero and footer has both an image AND text content
□ <section id="about"> with 2-column, image with gradient border, checklist items, brand story text
□ <section id="services"> with 6+ specific service cards using Font Awesome icons (NOT generic names)
□ <section id="gallery"> with 6 images from the PRE-SELECTED list (GALLERY images #2–#7) + lightbox onclick — NEVER random or invented URLs
□ ABOUT section LEFT image uses one of the pre-selected URLs — NOT a broken placeholder
□ FAQ section with 5 accordion items using toggleFaq() — questions specific to this business
□ <section id="testimonials"> with 3 glassmorphism cards + specific testimonial text
□ <section id="contact"> with contact info (phone/WhatsApp/email/address/hours) + form with validateForm()
□ Form success div (id="contact-form-success" or similar) hidden by default
□ 1–3 category-specific BONUS sections from STEP 1 list above
□ <footer> with 3-column, SVG logo (id="aw-ai-logo-footer"), tagline, social icons, copyright + "Powered by ArabyWeb.net"
□ WhatsApp floating button (id="aw-whatsapp-btn") position:fixed — MUST be before </body>
□ Lightbox div (id="aw-lightbox") injected in body

JAVASCRIPT (single <script> at end):
□ IntersectionObserver scroll reveals (aw-reveal → aw-visible)
□ Counter animation using requestAnimationFrame + data-target
□ Navbar scroll effect (class "scrolled" on scroll > 60px)
□ toggleFaq() function for FAQ accordion
□ validateForm() function for contact form + success message display
□ Lightbox functions: openLightbox(), closeLightbox(), prevImg(), nextImg() + keyboard listener
□ Tab switching function (if menu/tabs used)
□ Portfolio filter function (if agency/portfolio used)
□ Hamburger: classList.toggle('open') on #aw-mobile-menu

CSS:
□ @media(max-width:768px): .aw-nav-links{display:none} + .aw-hamburger{display:flex}
□ .faq-answer{max-height:0;overflow:hidden;transition:max-height 0.4s ease}
□ #aw-lightbox when open: display:flex
□ All hover states and transitions defined`;

  // ══════════════════════════════════════════════════════════════════════════
  // NEW TWO-STAGE PIPELINE (non-special categories — all business types)
  // Stage 1: AI generates structured content JSON (fast, focused, GPT-4o-mini)
  // Stage 2: TypeScript builds premium HTML (guaranteed correct CSS Grid, RTL, etc.)
  // ══════════════════════════════════════════════════════════════════════════
  if (!isSpecialCategory) {
    const imgCatNew = detectImageCategory(description);
    const businessNameNew = extractBusinessName(description);
    const locationQueryNew = extractLocationQuery(description, businessNameNew);

    console.log(`[Builder] Two-stage pipeline | cat:${category} | imgCat:${imgCatNew}`);

    // Parallel: fetch images + generate content spec simultaneously
    const [images, spec] = await Promise.all([
      buildImageData(description),
      generateContentSpec(description, {
        primaryColor: options.primaryColor,
        accentColor: options.accentColor,
        designStyle: options.designStyle,
      }),
    ]);

    // Optionally enrich spec with verified Google Places data
    if (LOCATION_CATEGORIES.has(imgCatNew) && locationQueryNew) {
      try {
        const placesData = await fetchGooglePlacesData(locationQueryNew);
        if (placesData) {
          if (placesData.phone) spec.phone = placesData.phone;
          if (placesData.address) spec.address = placesData.address;
          if (placesData.name) spec.businessName = spec.businessName || placesData.name;
          if (placesData.hours?.length) spec.workingHours = placesData.hours.slice(0, 2).join(" | ");
          console.log(`[Places] ✓ Enriched spec: ${placesData.name} | ${placesData.address}`);
        }
      } catch (e) {
        console.warn("[Places] Enrich failed:", e);
      }
    }

    // Force brand colors from options into spec (user selection takes priority over AI)
    if (options.primaryColor) spec.primaryColor = options.primaryColor;
    if (options.accentColor)  spec.accentColor  = options.accentColor;

    // Build guaranteed premium HTML from spec + verified images
    const html = buildWebsiteHTML(spec, images, { isArabic });

    console.log(`[Builder] ✅ HTML built: ${html.length} chars | ${spec.businessName}`);

    return {
      html,
      css: "",
      seoTitle: spec.seoTitle || spec.businessName,
      seoDescription: spec.seoDescription || spec.subtitle,
      sections: isArabic
        ? ["الرئيسية", "من نحن", "خدماتنا", "أعمالنا", "آراء العملاء", "تواصل معنا"]
        : ["Hero", "About", "Services", "Gallery", "Testimonials", "Contact"],
      colorPalette: {
        primary: spec.primaryColor || "#0f4c81",
        secondary: "#1e293b",
        accent: spec.accentColor || "#06b6d4",
        background: "#050814",
        text: "#ffffff",
      },
    };
  }

  // ── LEGACY PIPELINE (special categories: wedding, freelancer, event) ─────────
  // Inject randomized images — tries Unsplash Search API first, then Pexels, then IMAGE_BANK
  const imageSection = await buildImagePromptSection(description);

  // ── Google Places + Maps integration ────────────────────────────────────────
  const imgCat = detectImageCategory(description);
  const businessName = extractBusinessName(description);
  const locationQuery = extractLocationQuery(description, businessName);
  let placesSection = "";
  let mapsSection = "";

  if (LOCATION_CATEGORIES.has(imgCat)) {
    let placesData: PlacesResult | null = null;
    if (locationQuery) {
      placesData = await fetchGooglePlacesData(locationQuery);
      if (placesData) {
        placesSection = buildPlacesPromptSection(placesData);
        console.log(`[Places] ✓ ${placesData.name} | ${placesData.address}`);
      }
    }
    const mapsQuery = locationQuery || extractBusinessType(description) + " Saudi Arabia";
    if (mapsQuery) {
      mapsSection = buildMapsPromptSection(mapsQuery, isArabic, placesData);
      console.log(`[Maps] Embed URL built for: ${mapsQuery}`);
    }
  }

  const variationToken = `\n[Variation seed: ${Date.now()}-${Math.random().toString(36).slice(2,7)}]`;

  // ── Mandatory brand color injection ─────────────────────────────────────────
  let colorOverride = "";
  if (options.primaryColor || options.accentColor) {
    const pc = options.primaryColor || "#1e293b";
    const ac = options.accentColor || "#6366f1";
    colorOverride = `⛔⛔⛔ MANDATORY BRAND COLORS ⛔⛔⛔\nPRIMARY: ${pc}\nACCENT: ${ac}\nUse these EVERYWHERE — buttons, icons, gradients, text highlights.\n⛔⛔⛔ END ⛔⛔⛔\n\n`;
  }

  let prompt = colorOverride + basePrompt.replace("USE_IMAGES_PLACEHOLDER", imageSection);
  if (placesSection) prompt = placesSection + "\n\n" + prompt;
  if (mapsSection)   prompt = prompt + "\n\n" + mapsSection;
  prompt += variationToken;

  const model = getModel();
  console.log("[Legacy AI] model:", model, "| cat:", category, "| imgCat:", imgCat);
  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "You are a professional web developer. Output ONLY raw HTML starting with <!DOCTYPE html>. No markdown, no explanations.",
      },
      { role: "user", content: prompt },
    ],
    max_completion_tokens: 16384,
    temperature: 0.85,
  });

  const rawContent = response.choices[0]?.message?.content || "";
  const htmlStartIndex = rawContent.indexOf("<!DOCTYPE");
  const htmlAltIndex = rawContent.indexOf("<html");
  const htmlBegin = htmlStartIndex !== -1 ? htmlStartIndex
                  : htmlAltIndex !== -1 ? htmlAltIndex
                  : -1;
  const content = htmlBegin !== -1 ? rawContent.slice(htmlBegin) : rawContent;

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

  /**
   * Post-processing: remove ALL duplicate CTA/contact links from inside the main nav link list.
   * The AI sometimes adds "تواصل معنا" / "احجز موعدك" / "Contact" as BOTH a regular nav link AND a CTA button.
   * Strategy: keep only the LAST occurrence of any #contact-pointing link in <nav> (the standalone CTA),
   * and remove earlier duplicates that landed inside the nav links list.
   */
  function removeNavContactDuplicate(html: string): string {
    // Pass 1: Remove #contact links from inside .aw-nav-links div
    let result = html.replace(
      /(<div[^>]*class="[^"]*aw-nav-links[^"]*"[^>]*>)([\s\S]*?)(<\/div>)/gi,
      (_match, open, content, close) => {
        const cleaned = content
          .replace(/<li[^>]*>\s*<a[^>]*href=["']#contact["'][^>]*>[\s\S]*?<\/a>\s*<\/li>/gi, "")
          .replace(/<a[^>]*href=["']#contact["'][^>]*>[\s\S]*?<\/a>/gi, "");
        return open + cleaned + close;
      }
    );

    // Pass 2: Find <nav> block and detect if #contact CTA appears more than once → keep only last
    result = result.replace(
      /(<nav[^>]*>)([\s\S]*?)(<\/nav>)/gi,
      (_match, navOpen, navContent, navClose) => {
        // Count how many times #contact appears in the nav
        const contactMatches = (navContent.match(/href=["']#contact["']/gi) || []).length;
        if (contactMatches <= 1) return navOpen + navContent + navClose;

        // More than one: remove all but the last #contact link
        let removeCount = contactMatches - 1;
        const cleaned = navContent.replace(
          /<(?:li[^>]*>\s*)?<a[^>]*href=["']#contact["'][^>]*>[\s\S]*?<\/a>(?:\s*<\/li>)?/gi,
          (match) => {
            if (removeCount > 0) { removeCount--; return ""; }
            return match;
          }
        );
        return navOpen + cleaned + navClose;
      }
    );

    // Pass 3: Remove #contact links from inside #aw-mobile-menu ONLY if they duplicate
    // the contact CTA — keep one instance so mobile users can reach contact section
    // (Do nothing here — the mobile menu is allowed to have the contact link once)

    return result;
  }

  function sanitizeCss(css: string): string {
    if (!css.includes("scroll-behavior")) {
      return "html { scroll-behavior: smooth; }\n" + css;
    }
    return css;
  }

  // Parse full HTML document response
  function parseFullHtmlResponse(rawContent: string): GeneratedWebsite {
    const cleaned = rawContent.replace(/^```html\n?|^```\n?|```\n?$/gm, "").trim();
    // Find the DOCTYPE or <html> start
    const htmlStart = cleaned.indexOf("<!DOCTYPE") !== -1 ? cleaned.indexOf("<!DOCTYPE") :
                      cleaned.indexOf("<html") !== -1 ? cleaned.indexOf("<html") : -1;
    const fullHtml = htmlStart >= 0 ? cleaned.slice(htmlStart) : cleaned;

    if (!fullHtml || fullHtml.length < 500) throw new Error("Empty HTML response");

    const sanitized = removeNavContactDuplicate(sanitizeNavLinks(fullHtml));
    const titleMatch = sanitized.match(/<title>([^<]*)<\/title>/i);
    const descMatch = sanitized.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)/i)
                   || sanitized.match(/<meta[^>]*content=["']([^"']*)[^>]*name=["']description["']/i);
    return {
      html: sanitized,
      css: "",
      seoTitle: titleMatch?.[1]?.trim() || description.slice(0, 60),
      seoDescription: descMatch?.[1]?.trim() || "",
      sections: isArabic
        ? ["الرئيسية", "من نحن", "خدماتنا", "أعمالنا", "آراء العملاء", "تواصل معنا"]
        : ["Hero", "About", "Services", "Gallery", "Testimonials", "Contact"],
      colorPalette: { primary: "#7c3aed", secondary: "#4f46e5", accent: "#06b6d4", background: "#050814", text: "#ffffff" },
    };
  }

  try {
    return parseFullHtmlResponse(content);
  } catch {
    const _fbName = extractBusinessName(description) || (isArabic ? "موقعنا الاحترافي" : "Our Business");
    const _fbType = extractBusinessType(description) || (isArabic ? "خدماتنا الاحترافية" : "Professional Services");
    return {
      html: `<div ${dirAttr} style="font-family: ${fontFamily}; max-width: 1200px; margin: 0 auto; padding: 2rem;">
        <header style="text-align: center; padding: 5rem 2rem; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: white; border-radius: 1rem; margin-bottom: 2rem; position: relative; overflow: hidden;">
          <div style="position: absolute; inset: 0; background: url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop') center/cover; opacity: 0.2;"></div>
          <div style="position: relative; z-index: 1;">
            <h1 style="font-size: 3rem; margin-bottom: 1rem; font-weight: 800;">${_fbName}</h1>
            <p style="font-size: 1.2rem; opacity: 0.9; max-width: 600px; margin: 0 auto 2rem;">${isArabic ? `نقدم لكم ${_fbType} بأعلى معايير الجودة` : `Delivering ${_fbType} with the highest quality standards`}</p>
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
      seoTitle: `${_fbName} - ${isArabic ? "موقع احترافي" : "Professional Website"}`,
      seoDescription: isArabic ? `${_fbName} — نقدم ${_fbType} بأعلى معايير الجودة في المملكة العربية السعودية` : `${_fbName} — Professional ${_fbType} services`,
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

IMPORTANT — DETECT HTML FORMAT:
- If the input HTML starts with "<!DOCTYPE html>" or "<html": it is a COMPLETE HTML document with CSS embedded in <style> tags. Return the ENTIRE modified document in the "html" field, and return "" (empty string) for "css".
- If the input HTML is a fragment (no <!DOCTYPE>): return the modified HTML fragment in "html" and the updated CSS in "css".

Return ONLY a JSON object with these 3 fields:
{
  "html": "complete updated HTML (full document if input was full document, fragment otherwise)",
  "css": "updated CSS (empty string if CSS is embedded in the HTML document)",
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

    // ── Color Auto-Correction (before quality check) ──────────
    if (parsed.primary_color || parsed.accent_color) {
      const corrected = validateAndCorrectColors(
        parsed.primary_color || "#1a56db",
        parsed.accent_color  || "#7c3aed",
      );
      parsed.primary_color = corrected.primary;
      parsed.accent_color  = corrected.accent;
    }

    // ── Design System Quality Gate ────────────────────────────
    const qReport = runQualityCheck({
      ar: parsed.ar,
      primary_color: parsed.primary_color || "#000",
      accent_color:  parsed.accent_color  || "#000",
      testimonials:  parsed.testimonials,
    });
    if (qReport.passed) {
      console.log(`[AI Quality] ✓ Score ${qReport.score}/100${qReport.warnings.length ? ` | Warnings: ${qReport.warnings.join("; ")}` : ""}`);
    } else {
      console.warn(`[AI Quality] ✗ Score ${qReport.score}/100 — Issues: ${qReport.issues.join("; ")}`);
      // Patch fallback values so the template still renders gracefully
      if (parsed.ar.services.length < 6) {
        while (parsed.ar.services.length < 6) parsed.ar.services.push({ title: "خدمة إضافية", desc: "خدمة متميزة مصممة لتلبية احتياجاتكم" });
        while (parsed.en.services.length < 6) parsed.en.services.push({ title: "Additional Service", desc: "A premium service designed to meet your needs" });
      }
      if (!parsed.testimonials || parsed.testimonials.length < 3) {
        parsed.testimonials = (parsed.testimonials || []).concat([
          { name: "عبدالله الحارثي", role_ar: "عميل مميز", role_en: "Premium Client", text_ar: "تجربة رائعة واحترافية عالية جداً، أنصح بشدة بالتعامل مع هذه الشركة المتميزة.", text_en: "Amazing experience and very high professionalism. I highly recommend dealing with this distinguished company." },
          { name: "سارة المطيري", role_ar: "رائدة أعمال", role_en: "Entrepreneur", text_ar: "خدمة لا مثيل لها وفريق عمل محترف، ساعدوني كثيراً في تحقيق أهدافي.", text_en: "Unmatched service and professional team, they helped me greatly in achieving my goals." },
          { name: "محمد الغامدي", role_ar: "مدير تنفيذي", role_en: "Executive Manager", text_ar: "سعيد جداً بنتائج التعاون، الجودة والدقة في العمل تستحق كل الثقة والاحترام.", text_en: "Very satisfied with the results of our cooperation, the quality and accuracy deserve full trust and respect." },
        ].slice(0, 3 - (parsed.testimonials?.length || 0)));
      }
    }

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
