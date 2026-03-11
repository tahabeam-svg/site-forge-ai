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
    // Ensure smooth scroll is added to CSS if not present
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

export async function editWebsiteWithAI(currentHtml: string, currentCss: string, editCommand: string, language: string = "ar"): Promise<{ html: string; css: string; summary: string }> {
  const isArabic = language === "ar";

  const response = await openai.chat.completions.create({
    model: getModel(),
    messages: [
      {
        role: "system",
        content: `You are a professional web designer assistant for the Saudi/Arab market. The user will give you their current website HTML and CSS, along with an edit instruction. Apply the changes and return the updated HTML and CSS.

GUIDELINES:
- Maintain the existing design quality
- Use professional fonts: ${isArabic ? "Cairo, Tajawal" : "Inter, Poppins, Montserrat"}
- Use Unsplash images when adding new images: https://images.unsplash.com/photo-{ID}?w=800&h=600&fit=crop
- Use Lucide-style SVG icons inline when adding icons
- Preserve responsive design
- Keep all existing sections unless asked to remove
- Support both Arabic and English content
- If asked to embed a YouTube video, use an iframe with the embed URL
- If asked to embed media from a URL, create an appropriate embed

Return ONLY a JSON object with 3 fields:
- 'html': the updated full HTML
- 'css': the updated full CSS
- 'summary': a short ${isArabic ? "Arabic" : "English"} message (1-2 sentences) describing exactly what was changed/added/removed. Be specific and friendly. ${isArabic ? "مثال: 'تم تغيير لون الخلفية إلى أسود وإضافة تأثيرات ذهبية على العناوين ✅'" : "Example: 'Background color changed to black and golden effects added to headings ✅'"}

No markdown, no extra explanation outside the JSON.`,
      },
      {
        role: "user",
        content: `Current HTML:\n${currentHtml}\n\nCurrent CSS:\n${currentCss}\n\nEdit instruction: "${editCommand}"\n\nLanguage: ${isArabic ? "Arabic (RTL)" : "English (LTR)"}`,
      },
    ],
    max_completion_tokens: 16384,
    temperature: 0.5,
  });

  const content = response.choices[0]?.message?.content || "";
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
