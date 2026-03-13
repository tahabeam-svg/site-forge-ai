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
const openai = new Proxy({} as OpenAI, {
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
  const romantic = ["حبيبت","حبيبي","حبيبه","عشيقت","زوجت","زوجي","girlfriend","boyfriend","lover","sweetheart","my love","بحبك","احبك","أحبك","ذكرى زواج","عيد زواج","عيد حب","valentine","anniversary","قلبي","رفيقت","رفيقي","لحبيبي","لحبيبتي","لزوجتي","لزوجي","أميرت","أميرتي","نغم","نور","ريم","لين","روان","ريان","هند","سارة","مريم","فاطمة","ياسمين","لحبيب","صديقتي","girlfriend website","love website"];
  const portfolio = ["بورتفوليو","portfolio","أعمالي","موهبتي","مصور","مصمم","فنان","معلم","مدرس","طبيب","مهندس","محامي","شخصي","personal","resume","cv","سيرة ذاتية","شاعر","كاتب","موسيقي"];
  const event = ["حفل","مناسبة","زفاف","خطوبة","عقد قران","حفلة","wedding","party","event","exhibition","معرض","مهرجان","festival","سوق","قرن","ختان","تخرج","graduation","عيد ميلاد موقع","birthday website"];
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
    return `You are a world-class creative director building a stunning personal portfolio website. Style: modern 2025, minimal yet impactful — like top Dribbble portfolios.

Request: "${description}"

SECTIONS (in order):
1. NAVBAR: Fixed glassmorphism. Links: About, Skills, Portfolio, Contact. Brand = person's name. Mobile menu required.
2. HERO: Full viewport. Animated gradient background (no photo needed — use CSS mesh gradient). Large name + title/role in gradient text. Short tagline. Two CTAs: "أعمالي" + "تواصل معي". Animated orb blobs.
3. ABOUT (id="about"): 2-column. Professional photo left. Bio right with skills summary and a fun fact about them.
4. SKILLS (id="skills"): Grid of skill badges with icons. Animated progress bars or percentage badges. NO "years of experience" count unless they mention it.
5. PORTFOLIO (id="portfolio"): 3-column grid of work cards. Each with image, title, tag badges, hover overlay.
6. CONTACT (id="contact"): Simple clean contact section with social links and a minimal form.
7. FOOTER: Minimal dark footer.

DESIGN: Modern, clean, professional. Color: based on their field (tech=violet/cyan, design=pink/orange, etc.)
Language: ${lang}
Font: ${font}
Mobile hamburger: ${mobileMenu}
${MOBILE_RESPONSIVE_MANDATORY}

Return EXACTLY this JSON (no markdown):
{"html":"complete HTML (no html/head/body tags, ${dirAttr} on root div, inline <script> at bottom)","css":"complete CSS: Google Fonts @import, full reset, all components, animations, MANDATORY @media(max-width:768px) collapsing ALL grids/columns to 1 column, @media(max-width:480px) font fixes. overflow-x:hidden on body.","seoTitle":"title max 60 chars","seoDescription":"description 150-160 chars","sections":["names"],"colorPalette":{"primary":"#hex","secondary":"#hex","accent":"#hex","background":"#hex","text":"#hex"}}`;
  }

  if (category === "event") {
    return `You are a world-class event website designer. Build a premium event/occasion website.

Request: "${description}"

SECTIONS:
1. NAVBAR: Fixed glassmorphism. Links: About Event, Schedule, Gallery, Register. Mobile menu required.
2. HERO: Full viewport with event imagery. Countdown timer if it's a future event. Event name in large bold gradient text. Date and location prominently displayed. CTA: "سجّل الآن".
3. ABOUT EVENT: 2-column. Event description with beautiful imagery. Key highlights.
4. SCHEDULE/PROGRAM: Timeline of event activities with icons and times.
5. GALLERY: Photo grid of past events or preparation photos.
6. SPEAKERS/HOSTS (if applicable): Card grid with photos, names, titles.
7. REGISTER/CONTACT: Registration form or contact details.
8. FOOTER: Dark, event branding.

DESIGN: Elegant, exciting, event-appropriate. Use colors fitting the event type.
Language: ${lang}
Font: ${font}
Mobile hamburger: ${mobileMenu}
${MOBILE_RESPONSIVE_MANDATORY}

Return EXACTLY this JSON (no markdown):
{"html":"complete HTML (no html/head/body tags, ${dirAttr} on root div, inline <script> at bottom)","css":"complete CSS: Google Fonts @import, full reset, all components, animations, MANDATORY @media(max-width:768px) all grids collapse to 1 column, @media(max-width:480px) font fixes. overflow-x:hidden on body.","seoTitle":"title max 60 chars","seoDescription":"description 150-160 chars","sections":["names"],"colorPalette":{"primary":"#hex","secondary":"#hex","accent":"#hex","background":"#hex","text":"#hex"}}`;
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
VISUAL DESIGN STANDARD 2025 — MANDATORY
═══════════════════════════════════════
The website MUST look like it was designed in 2025 by a top-tier agency. Think Notion, Linear, Vercel, Stripe landing pages — but adapted for the Arab market.

▸ NAVBAR (GLASSMORPHISM): position:fixed; background:rgba(5,8,22,0.72); backdrop-filter:blur(24px); border-bottom:1px solid rgba(255,255,255,0.08). ALWAYS visible and glassy — even at top of page. On scroll: background:rgba(5,8,22,0.97). Brand name uses white-to-accent gradient text.

▸ HERO (FULL VIEWPORT + ANIMATED ORBS): min-height:100vh. Dark gradient overlay on background image. Add 2–3 large blurred orb blobs (CSS radial-gradient circles, 400–700px, filter:blur(80px), position:absolute, animated with @keyframes orbFloat). Hero text: clamp(2.8rem,6.5vw,5.5rem), font-weight:900, letter-spacing:-0.025em, color:#fff. Subtitle: rgba(255,255,255,0.68). Two CTA buttons: solid gradient + ghost outline with backdrop-filter.

▸ STATS BAR: Dark gradient background. 4 animated counters. Numbers use gradient text (background-clip:text). Labels uppercase letter-spacing.

▸ ABOUT: 2-column. Image with double-layer gradient border effect using ::before/::after pseudo-elements. Floating experience badge (gradient bg, bottom corner). Checklist items with colored check icons.

▸ SERVICES: 3-column grid. Cards use CSS GRADIENT BORDER trick: background:linear-gradient(white,white) padding-box, linear-gradient(135deg,PRIMARY,ACCENT) border-box; border:1.5px solid transparent. On hover: translateY(-12px), stronger shadow, full gradient border revealed. Icon box rotates on hover, fills with gradient.

▸ GALLERY: 3-column grid with border-radius:1.25rem. Hover: image scale(1.1) + dark gradient overlay + eye icon appears (scale from 0.5 to 1).

▸ CTA BAND: Full-width gradient background. Large bold headline. Decorative radial glow orb in corner.

▸ TESTIMONIALS: Dark section, glassmorphism cards (rgba background + backdrop-filter). Bottom gradient border appears on hover (scaleX animation). Quote icon with low opacity.

▸ CONTACT: 2-column. Contact info with icon boxes. WhatsApp button. Right side: white card with gradient border, clean form inputs with focus ring.

▸ FOOTER: Very dark background with radial glow orb. 3-column layout. Brand uses gradient text. Subtle dividers. Social icons circle on hover.

▸ ANIMATIONS: Use cubic-bezier(.22,1,.36,1) for all transitions. @keyframes fadeUp, orbFloat, pulse, scrollBounce. IntersectionObserver for scroll reveals.

▸ TYPOGRAPHY: Letter-spacing:-0.02em on all headings. Line-height:1.1 for hero, 1.2 for section titles. Use font-weight:900 for hero/stats numbers.

▸ COLOR DEPTH: Use 3 opacity levels of your primary: full, 40%, 15%. Never use flat solid colors for backgrounds — always use gradients.

Language: ${isArabic ? "Arabic RTL — add dir='rtl' on root element. All text in Arabic." : "English LTR — all text in English."}
Font: ${isArabic ? "Import Cairo (headings, weight 700-900) + Tajawal (body) from Google Fonts" : "Import Montserrat (headings, weight 700-900) + Inter (body) from Google Fonts"}

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
- Restaurant/Cafe: photo-1517248135467-4c7edcad34c4, photo-1414235077428-338989a2e8c0, photo-1565299624946-b28f40a0ae38
- Business/Corporate: photo-1497366216548-37526070297c, photo-1486406146926-c627a92ad1ab, photo-1542744173-8e7e53415bb0
- Luxury/Perfume: photo-1541643600914-78b084683601, photo-1523293182086-7651a899d37f, photo-1588776814546-1ffbb7c4f58a
- Technology/Startup: photo-1518770660439-4636190af475, photo-1552664730-d307ca884978, photo-1451187580459-43490279c0fa
- Real Estate: photo-1560518883-ce09059eeffa, photo-1582407947304-fd86f028f716, photo-1512917774080-9991f1c4c750
- Medical/Health: photo-1576091160399-112ba8d25d1d, photo-1579684385127-1ef15d508118, photo-1631217868264-e5b90bb7e133
- Fashion/Retail: photo-1558618666-fcd25c85f82e, photo-1445205170230-053b83016050, photo-1490481651871-ab68de25d43d
- Events/Exhibition: photo-1540575467063-178a50c2df87, photo-1505236858219-8359eb29e329
- Use at least 6 relevant Unsplash images throughout the page

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
- Restaurant: warm reds/oranges (#c0392b + #e67e22)
- Luxury/Perfume: near-black dark with gold (#0a0a0a + #d4a843)
- Medical: teal/cyan (#0d9488 + #0284c7)
- Tech/Startup: violet/purple (#7c3aed + #06b6d4)
- Corporate/Agency: deep navy/royal (#1e3a5f + #2563eb)
- Beauty/Fashion: rose/mauve (#be185d + #f43f5e)
- Real Estate: charcoal/emerald (#1a2e1a + #059669)
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
            <a href="#contact" style="display: inline-block; padding: 0.875rem 2.5rem; background: linear-gradient(135deg, #e2b04a, #d4a843); color: #1a1a2e; border-radius: 2rem; font-weight: 700; text-decoration: none; font-size: 1rem;">${isArabic ? "تواصل معنا" : "Contact Us"}</a>
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
    instagram: "Max 2200 chars, visual-first, use emojis, 20-30 hashtags",
    facebook: "Longer form OK, engaging questions, 3-5 hashtags",
    linkedin: "Professional tone, industry insights, 3-5 hashtags",
    twitter: "Max 280 chars, concise, 2-3 hashtags, punchy",
    tiktok: "Trendy, Gen-Z friendly, viral hooks, 5-10 hashtags",
    youtube: "SEO-optimized title/description, compelling hook",
  };

  const prompt = `You are an expert social media marketer for the Saudi/Arab market.

Generate a ${platform} post about: "${topic}"

Language: ${isArabic ? "Arabic" : "English"}
Tone: ${tone}
Platform guidelines: ${platformGuidelines[platform] || "Standard social media post"}

Return a JSON object with:
{
  "post": "The main post text with emojis",
  "caption": "Extended caption/description",
  "hashtags": ["hashtag1", "hashtag2", ...],
  "callToAction": "A compelling call to action",
  "bestTimeToPost": "Recommended posting time for Saudi audience",
  "contentType": "carousel/reel/story/post/video"
}

IMPORTANT: Return ONLY the JSON object, no markdown, no code blocks.`;

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

// ─── Smart command pre-processor ────────────────────────────────────────────

function extractBusinessTypeFromHtml(html: string): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").toLowerCase();
  const map: Array<[string, string[]]> = [
    ["مطعم أو مقهى",     ["مطعم","مقهى","أكل","وجبات","قهوة","مشوي","شاورما","برغر","restaurant","cafe","coffee","food","menu","شيف"]],
    ["عيادة طبية",       ["عيادة","دكتور","طبيب","صحة","مريض","استشارة طبية","clinic","doctor","medical","health","pharma"]],
    ["وكالة تسويق وإعلانات", ["تسويق","إعلانات","برندينج","محتوى","ميديا","نشر تجاري","marketing","agency","advertising","branding","media"]],
    ["متجر إلكتروني",    ["متجر","تسوق","منتج","شراء","سلة","تجارة","store","shop","cart","product","ecommerce"]],
    ["شركة تقنية",       ["تقنية","برمجة","تطبيق","سوفتوير","ذكاء اصطناعي","tech","software","app","saas","ai","development"]],
    ["مكتب قانوني",      ["محامي","قانون","مستشار قانوني","law","lawyer","legal","attorney"]],
    ["شركة عقارية",      ["عقار","شقق","مباني","عمارة","أراضي","real estate","property","realty"]],
    ["صالون تجميل",      ["صالون","مكياج","تجميل","كوافير","spa","salon","beauty","makeup","hair"]],
    ["شركة سياحة",       ["سياحة","رحلات","حجز","فندق","سفر","tourism","travel","hotel","booking"]],
    ["مدرسة أو مركز تعليمي", ["تعليم","دروس","تدريب","أكاديمية","دورات","school","academy","training","education","courses"]],
  ];
  for (const [type, keywords] of map) {
    if (keywords.some(k => text.includes(k))) return type;
  }
  return "خدمات متنوعة";
}

function enhanceVagueCommand(command: string, html: string, projectName: string, desc: string, lang: string): string {
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
- Maintain existing design quality and style
- Use professional fonts: ${isArabic ? "Cairo (headings), Tajawal (body)" : "Inter/Poppins (headings), Inter (body)"}
- Use Unsplash: https://images.unsplash.com/photo-{ID}?w=800&h=600&fit=crop
- Use inline SVG Lucide-style icons when adding icons
- Preserve responsive design (add @media queries for new content)
- Keep all existing sections unless explicitly asked to remove
${imageDataUrl ? `- IMAGE ATTACHED: Replace the src of the logo <img> (or hero image if there is no logo) with the exact string __AW_IMG_001__ — the system will automatically replace it with the real image. Example: <img src="__AW_IMG_001__" alt="logo" style="height:48px;object-fit:contain;">` : ""}

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
      max_completion_tokens: 16384,
      temperature: 0.5,
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
          max_completion_tokens: 16384,
          temperature: 0.5,
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

  const systemPrompt = `You are a multilingual website content generator for Saudi/Arab businesses. Generate professional website copy in Arabic, English${extraLangName ? `, and ${extraLangName}` : ""} from a user prompt.
Return ONLY valid JSON, no markdown, no explanation.`;

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

  const userPrompt = `User prompt: "${prompt}"

Generate complete multilingual website content. Return this EXACT JSON structure:
{
  "business_name_ar": "brand name in Arabic",
  "business_name_en": "brand name in English",${extraLangBlock}
  "business_type": "one of: restaurant, agency, startup, portfolio, medical, general",
  "ar": {
    "hero_title": "compelling Arabic headline, max 8 words",
    "hero_subtitle": "engaging Arabic subtitle, 1-2 sentences",
    "about_title": "Arabic about section heading",
    "about_text": "2-3 Arabic sentences about the business",
    "services": [
      {"title": "Arabic service name", "desc": "Arabic short description"},
      {"title": "Arabic service name", "desc": "Arabic short description"},
      {"title": "Arabic service name", "desc": "Arabic short description"},
      {"title": "Arabic service name", "desc": "Arabic short description"},
      {"title": "Arabic service name", "desc": "Arabic short description"},
      {"title": "Arabic service name", "desc": "Arabic short description"}
    ],
    "cta_text": "Arabic CTA button text, 2-4 words",
    "contact_description": "1-2 Arabic sentences inviting contact",
    "address": "المملكة العربية السعودية",
    "seo_title": "Arabic SEO title max 60 chars",
    "seo_description": "Arabic meta description 150-155 chars"
  },
  "en": {
    "hero_title": "compelling English headline, max 8 words",
    "hero_subtitle": "engaging English subtitle, 1-2 sentences",
    "about_title": "English about section heading",
    "about_text": "2-3 English sentences about the business",
    "services": [
      {"title": "English service name", "desc": "English short description"},
      {"title": "English service name", "desc": "English short description"},
      {"title": "English service name", "desc": "English short description"},
      {"title": "English service name", "desc": "English short description"},
      {"title": "English service name", "desc": "English short description"},
      {"title": "English service name", "desc": "English short description"}
    ],
    "cta_text": "English CTA button text, 2-4 words",
    "contact_description": "1-2 English sentences inviting contact",
    "address": "Saudi Arabia",
    "seo_title": "English SEO title max 60 chars",
    "seo_description": "English meta description 150-155 chars"
  },
  "phone": "+966 5X XXX XXXX",
  "email": "info@${emailSlug}.sa",
  "primary_color": "#hexcolor that fits the business type",
  "accent_color": "#hexcolor complementary accent"
}

Rules:
- business_type must be exactly one of: restaurant, agency, startup, portfolio, medical, general
- Colors must match the business personality (warm for restaurant, professional for agency, etc.)
- ALL services must be specific to this exact business type, not generic
- hero_title must be exciting and benefit-driven${extraLangCode ? `\n- Include the "${extraLangCode}" section with authentic, natural ${extraLangName} translations` : ""}`;

  const model = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ? "gpt-5.2" : "gpt-4.1-mini";
  console.log("Instant generation using model:", model, "| languages:", languages.join(","));

  const tokenLimit = extraLangCode ? 3200 : 2000;
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
    if (!parsed.ar || !parsed.en) throw new Error("Missing language sections");
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

  const { html, css } = buildInstantWebsite(bilingualContent, primaryWebsiteLang, extraLang ? [extraLang] : undefined);

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
