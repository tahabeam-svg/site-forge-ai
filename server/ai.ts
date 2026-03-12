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

export async function generateWebsite(description: string, language: string = "ar"): Promise<GeneratedWebsite> {
  const isArabic = language === "ar";
  const dirAttr = isArabic ? 'dir="rtl"' : 'dir="ltr"';
  const arabicFonts = "'Cairo', 'Tajawal', 'IBM Plex Sans Arabic', sans-serif";
  const englishFonts = "'Inter', 'Poppins', 'Montserrat', sans-serif";
  const fontFamily = isArabic ? arabicFonts : englishFonts;

  const prompt = `You are a world-class web designer specializing in modern, premium Arabic and English websites for the Saudi market.

Generate a complete, production-quality, single-page website based on this description: "${description}"

CRITICAL REQUIREMENTS:
- Language: ${isArabic ? "Arabic (RTL layout with dir='rtl')" : "English (LTR layout)"}
- Must be fully responsive (mobile-first)
- Premium, modern, clean design with attention to detail
- Use beautiful gradients, subtle shadows, smooth animations
- Include professional stock images from Unsplash using URLs like: https://images.unsplash.com/photo-{ID}?w=800&h=600&fit=crop
  * Choose images that match the website topic
  * Use at least 3-4 relevant high-quality images
- Use Lucide-style SVG icons inline (simple line icons)
- Use Google Fonts: ${isArabic ? "Cairo (headings), Tajawal (body)" : "Montserrat (headings), Inter (body)"}

SINGLE-PAGE NAVIGATION — ABSOLUTELY MANDATORY:
- This is a SINGLE-PAGE website. ALL navigation links MUST use anchor href (e.g. href="#about", href="#services") — NEVER use href="/about" or href="/services" or any path-based links.
- Every anchor link in the navigation MUST have a matching section with that exact id attribute in the HTML.
- Required sections and their EXACT ids (use these exact ids, no variations):
  * id="about"       → ${isArabic ? "من نحن" : "About Us"} section
  * id="services"    → ${isArabic ? "خدماتنا" : "Services"} section
  * id="gallery"     → ${isArabic ? "معرض الأعمال" : "Gallery/Portfolio"} section
  * id="testimonials"→ ${isArabic ? "آراء العملاء" : "Testimonials"} section
  * id="contact"     → ${isArabic ? "تواصل معنا" : "Contact Us"} section
- The navigation bar MUST contain links to: #about, #services, #gallery, #testimonials, #contact
- Add to CSS: html { scroll-behavior: smooth; }
- NEVER generate href links that start with "/" or "http" in the navigation menu.
- NEVER use the words "نشر", "معاينة", "تعديل", "نشر الآن", or "publish" as navigation link text — these words belong to the ArabyWeb platform UI and confuse users. Use business navigation links like "الرئيسية", "خدماتنا", "من نحن", "تواصل معنا", "المنتجات", "معرض الأعمال", "احجز الآن".

MOBILE HAMBURGER MENU — MANDATORY (this is NOT optional, ALWAYS include):
- The navbar MUST have a hamburger menu button that appears only on mobile (hidden on desktop)
- Use this EXACT pattern for the hamburger button:
  <button id="aw-menu-btn" onclick="var m=document.getElementById('aw-mobile-menu');m.style.display=m.style.display==='flex'?'none':'flex'" style="display:none;background:none;border:none;cursor:pointer;padding:8px;">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
  </button>
- The mobile menu div MUST have id="aw-mobile-menu" and be hidden by default (display:none)
- When links in mobile menu are clicked, add onclick="document.getElementById('aw-mobile-menu').style.display='none'" to each link
- In CSS, add: @media(max-width:768px){ #aw-menu-btn{display:block !important;} .aw-nav-links{display:none !important;} }
- The mobile menu (id="aw-mobile-menu") must have: position:absolute; top:100%; left:0; right:0; flex-direction:column; background:white (or nav background color); padding:1rem; box-shadow:0 8px 24px rgba(0,0,0,0.12); z-index:1000;
- The nav container must have position:relative
- DO NOT use media query classes for the hamburger. Always use inline styles + the @media override above.
- This hamburger menu is CRITICAL for mobile usability. Never skip it.

SECTIONS TO INCLUDE (ALL REQUIRED — do not skip any):
1. Hero/Header   — Bold headline, subtitle, CTA button, full-screen hero image with dark overlay
2. About (#about)       — Company/brand story with image, key stats or highlights
3. Services (#services) — Grid of 4-6 cards with inline SVG icons, each with name + description
4. Gallery (#gallery)   — Responsive image grid (3 columns on desktop, 1 on mobile) with hover zoom
5. Testimonials (#testimonials) — 3 customer reviews with names, roles, star ratings
6. Contact (#contact)   — Contact form (name, email, phone, message) + address info + Google Maps iframe
7. Footer       — Logo, nav links anchors, copyright

DESIGN GUIDELINES:
- Use a cohesive, professional color palette (avoid generic blue)
- For luxury/premium sites: use dark backgrounds with gold/amber accents
- For corporate sites: use clean whites with professional accent colors
- For food/restaurant: use warm, inviting colors
- Include CSS animations (fadeIn, slideUp) for sections
- html { scroll-behavior: smooth; }
- Hover effects on buttons and cards
- Box shadows for depth
- Border-radius for modern feel
- Proper spacing and typography hierarchy

STOCK IMAGES - Use these Unsplash photo IDs based on topic:
- Business/Corporate: photo-1497366216548-37526070297c, photo-1486406146926-c627a92ad1ab
- Restaurant/Food: photo-1517248135467-4c7edcad34c4, photo-1414235077428-338989a2e8c0
- Perfume/Luxury: photo-1541643600914-78b084683601, photo-1523293182086-7651a899d37f
- Exhibition/Events: photo-1540575467063-178a50c2df87, photo-1505236858219-8359eb29e329
- Technology: photo-1518770660439-4636190af475, photo-1451187580459-43490279c0fa
- Real Estate: photo-1560518883-ce09059eeffa, photo-1582407947304-fd86f028f716
- Fashion: photo-1558618666-fcd25c85f82e, photo-1445205170230-053b83016050
- General/Startup: photo-1522071820081-009f0129c71c, photo-1552664730-d307ca884978

Return a JSON object with exactly these fields:
{
  "html": "Complete HTML body content (no <html>, <head>, or <body> tags). Use ${dirAttr} on root div. Use font-family: ${fontFamily}. Include real Unsplash image URLs.",
  "css": "Complete CSS with responsive breakpoints, animations (@keyframes), hover effects, gradients, shadows. Include font imports.",
  "seoTitle": "SEO-optimized title in ${isArabic ? 'Arabic' : 'English'}",
  "seoDescription": "SEO meta description (150-160 chars) in ${isArabic ? 'Arabic' : 'English'}",
  "sections": ["list", "of", "section", "names", "in", "${isArabic ? 'Arabic' : 'English'}"],
  "colorPalette": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex"
  }
}

IMPORTANT: Return ONLY the JSON object, no markdown, no code blocks, no explanation.`;

  const model = getModel();
  console.log("Using AI model:", model);
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
    /أر?يدك?\s*(أن\s*)?ت?ضيف?\s*(من\s*)?(محتوى|قسم|كونتنت)/i,
    /أضف?\s*محتوى\s*(احتراف|مميز|جيد)/i,
    /add\s+(professional|good|more)\s+content/i,
    /ضيف?\s*محتوى/i,
    /زود?\s*محتوى/i,
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
${imageDataUrl ? `- IMAGE ATTACHED: Embed the EXACT data URL provided under "IMAGE_DATA_URL:" as the src of the appropriate element. Do NOT use a placeholder.` : ""}

MOBILE HAMBURGER MENU — CHECK AND FIX:
- If the existing website navbar does NOT already have a hamburger menu (id="aw-menu-btn" or similar), ADD one to the navbar.
- The hamburger pattern to use:
  * Add a button with onclick: "var m=document.getElementById('aw-mobile-menu');m.style.display=m.style.display==='flex'?'none':'flex'"
  * Wrap the desktop nav links in a div with class="aw-nav-links"
  * Add a mobile menu div with id="aw-mobile-menu" style="display:none;position:absolute;top:100%;left:0;right:0;flex-direction:column;background:#fff;padding:1rem;box-shadow:0 8px 24px rgba(0,0,0,0.12);z-index:1000"
  * In CSS add: @media(max-width:768px){.aw-nav-links{display:none!important;}#aw-menu-btn{display:block!important;}}
- If the navbar already has a hamburger menu, leave it as-is and focus on the requested change.

Return ONLY a JSON object with these 3 fields:
{
  "html": "complete updated HTML",
  "css": "complete updated CSS",
  "summary": "${isArabic ? "رسالة قصيرة بالعربية (1-2 جملة) تصف ما تم تغييره بالضبط. كن محدداً وودياً. مثال: 'تم إضافة قسم الأسعار مع 3 باقات احترافية ✅'" : "Short English message (1-2 sentences) describing exactly what changed. Be specific. Example: 'Added a 3-tier pricing section with SAR prices tailored to your business ✅'"}"
}

No markdown, no code blocks, no explanation outside the JSON.`;

  const userContent = imageDataUrl
    ? `Current HTML:\n${currentHtml}\n\nCurrent CSS:\n${currentCss}\n\nEdit instruction: "${enhancedCommand}"\n\nLanguage: ${isArabic ? "Arabic (RTL)" : "English (LTR)"}\n\nIMAGE_DATA_URL: ${imageDataUrl}`
    : `Current HTML:\n${currentHtml}\n\nCurrent CSS:\n${currentCss}\n\nEdit instruction: "${enhancedCommand}"\n\nLanguage: ${isArabic ? "Arabic (RTL)" : "English (LTR)"}`;

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
    html = html.replace(/<(nav|header)[^>]*>[\s\S]*?<\/(nav|header)>/gi, (navBlock) => {
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

import { buildInstantWebsite, type BusinessContent } from "./instant-templates";

export async function generateInstantWebsite(
  prompt: string,
  language: string = "ar"
): Promise<GeneratedWebsite> {
  const isArabic = language === "ar";

  const systemPrompt = `You are a fast website content generator. Extract business info and generate website copy from a user prompt.
Return ONLY valid JSON, no markdown, no explanation.`;

  const userPrompt = `User prompt: "${prompt}"
Language: ${isArabic ? "Arabic" : "English"}

Return this exact JSON structure:
{
  "business_name": "brand/business name from prompt (in ${isArabic ? "Arabic" : "English"})",
  "business_type": "one of: restaurant, agency, startup, portfolio, medical, general",
  "hero_title": "compelling headline (in ${isArabic ? "Arabic" : "English"}, max 8 words)",
  "hero_subtitle": "engaging subtitle (in ${isArabic ? "Arabic" : "English"}, 1-2 sentences)",
  "about_title": "about section heading (in ${isArabic ? "Arabic" : "English"})",
  "about_text": "2-3 sentences about the business (in ${isArabic ? "Arabic" : "English"})",
  "services": [
    {"title": "service name", "desc": "short description"},
    {"title": "service name", "desc": "short description"},
    {"title": "service name", "desc": "short description"},
    {"title": "service name", "desc": "short description"},
    {"title": "service name", "desc": "short description"},
    {"title": "service name", "desc": "short description"}
  ],
  "cta_text": "call to action button text (in ${isArabic ? "Arabic" : "English"}, 2-4 words)",
  "contact_description": "1-2 sentences inviting contact (in ${isArabic ? "Arabic" : "English"})",
  "phone": "+966 5X XXX XXXX",
  "email": "info@${prompt.toLowerCase().replace(/[^a-z]/g, "").slice(0, 10) || "business"}.sa",
  "address": "${isArabic ? "المملكة العربية السعودية" : "Saudi Arabia"}",
  "seo_title": "SEO page title (in ${isArabic ? "Arabic" : "English"}, max 60 chars)",
  "seo_description": "meta description (in ${isArabic ? "Arabic" : "English"}, max 155 chars)",
  "primary_color": "#hexcolor",
  "accent_color": "#hexcolor"
}

Rules:
- All text must be in ${isArabic ? "Arabic" : "English"}
- Choose colors that fit the business type
- Make hero_title exciting and relevant
- Services must be specific to the business type`;

  const model = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ? "gpt-5.2" : "gpt-4.1-mini";
  console.log("Instant generation using model:", model);

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_completion_tokens: 2000,
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content || "{}";
  let content: BusinessContent;
  try {
    content = JSON.parse(raw) as BusinessContent;
  } catch {
    content = {
      business_name: prompt.slice(0, 30),
      business_type: "general",
      hero_title: isArabic ? "مرحباً بكم في موقعنا" : "Welcome to Our Website",
      hero_subtitle: isArabic ? "نقدم أفضل الخدمات والحلول الاحترافية" : "We provide the best professional services",
      about_title: isArabic ? "من نحن" : "About Us",
      about_text: isArabic ? "نحن نقدم خدمات احترافية عالية الجودة لعملائنا في المملكة العربية السعودية." : "We provide high-quality professional services to our clients.",
      services: [
        { title: isArabic ? "خدمة احترافية" : "Professional Service", desc: isArabic ? "نقدم حلولاً مبتكرة" : "Innovative solutions" },
        { title: isArabic ? "جودة عالية" : "High Quality", desc: isArabic ? "معايير جودة متميزة" : "Premium quality standards" },
        { title: isArabic ? "دعم متواصل" : "Continuous Support", desc: isArabic ? "نحن هنا دائماً لمساعدتك" : "We are always here to help" },
        { title: isArabic ? "خبرة واسعة" : "Vast Experience", desc: isArabic ? "سنوات من الخبرة في المجال" : "Years of industry experience" },
        { title: isArabic ? "تسليم سريع" : "Fast Delivery", desc: isArabic ? "نلتزم بالمواعيد دائماً" : "Always on time" },
        { title: isArabic ? "أسعار تنافسية" : "Competitive Pricing", desc: isArabic ? "أفضل الأسعار في السوق" : "Best prices in the market" },
      ],
      cta_text: isArabic ? "تواصل معنا" : "Contact Us",
      contact_description: isArabic ? "نسعد بالتواصل معك والإجابة على جميع استفساراتك." : "We are happy to hear from you and answer all your questions.",
      phone: "+966 50 000 0000",
      email: "info@business.sa",
      address: isArabic ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia",
      seo_title: prompt.slice(0, 60),
      seo_description: prompt.slice(0, 155),
      primary_color: "#059669",
      accent_color: "#0284c7",
    };
  }

  const { html, css } = buildInstantWebsite(content, isArabic);

  return {
    html,
    css,
    seoTitle: content.seo_title,
    seoDescription: content.seo_description,
    sections: isArabic
      ? ["الرئيسية", "من نحن", "خدماتنا", "تواصل معنا"]
      : ["Hero", "About", "Services", "Contact"],
    colorPalette: {
      primary: content.primary_color || "#059669",
      secondary: content.accent_color || "#0284c7",
      accent: content.accent_color || "#0284c7",
      background: "#ffffff",
      text: "#1a1a2a",
    },
  };
}
