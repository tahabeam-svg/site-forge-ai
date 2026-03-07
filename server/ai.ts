import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface GeneratedWebsite {
  html: string;
  css: string;
  seoTitle: string;
  seoDescription: string;
  sections: string[];
  colorPalette: { primary: string; secondary: string; accent: string; background: string; text: string };
}

export async function generateWebsite(description: string, language: string = "en"): Promise<GeneratedWebsite> {
  const isArabic = language === "ar";
  const dirAttr = isArabic ? 'dir="rtl"' : 'dir="ltr"';
  const fontFamily = isArabic ? "'Cairo', sans-serif" : "'Inter', sans-serif";

  const prompt = `You are a professional web designer. Generate a complete, modern, responsive single-page website based on this description: "${description}"

Requirements:
- Language: ${isArabic ? "Arabic (RTL layout)" : "English (LTR layout)"}
- Must be fully responsive
- Modern, clean, professional design
- Include these sections: Hero/Header, About, Services/Features, Gallery/Portfolio, Contact, Footer
- Use semantic HTML5
- Include smooth scroll behavior
- Use a cohesive color palette

Return a JSON object with exactly these fields:
{
  "html": "Complete HTML body content (no <html>, <head>, or <body> tags - just the inner content). Use inline styles or class names that match the CSS. Include ${dirAttr} on the root div. Use font-family: ${fontFamily}.",
  "css": "Complete CSS styles. Include responsive breakpoints, animations, and hover effects. Use the color palette consistently.",
  "seoTitle": "SEO-optimized page title",
  "seoDescription": "SEO meta description (150-160 chars)",
  "sections": ["list", "of", "section", "names"],
  "colorPalette": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex"
  }
}

IMPORTANT: Return ONLY the JSON object, no markdown, no code blocks.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages: [{ role: "user", content: prompt }],
    max_completion_tokens: 16384,
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content || "";

  try {
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return parsed as GeneratedWebsite;
  } catch {
    return {
      html: `<div ${dirAttr} style="font-family: ${fontFamily}; max-width: 1200px; margin: 0 auto; padding: 2rem;">
        <header style="text-align: center; padding: 4rem 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 1rem; margin-bottom: 2rem;">
          <h1 style="font-size: 3rem; margin-bottom: 1rem;">${description}</h1>
          <p style="font-size: 1.2rem; opacity: 0.9;">${isArabic ? "مرحباً بكم في موقعنا" : "Welcome to our website"}</p>
        </header>
        <section style="padding: 3rem 0; text-align: center;">
          <h2 style="font-size: 2rem; margin-bottom: 1rem;">${isArabic ? "من نحن" : "About Us"}</h2>
          <p style="color: #666; max-width: 600px; margin: 0 auto;">${isArabic ? "نحن نقدم أفضل الخدمات لعملائنا" : "We provide the best services for our clients"}</p>
        </section>
        <section style="padding: 3rem 0; text-align: center; background: #f8f9fa; border-radius: 1rem;">
          <h2 style="font-size: 2rem; margin-bottom: 1rem;">${isArabic ? "خدماتنا" : "Our Services"}</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; padding: 1rem;">
            <div style="padding: 2rem; background: white; border-radius: 0.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h3>${isArabic ? "خدمة 1" : "Service 1"}</h3>
              <p style="color: #666;">${isArabic ? "وصف الخدمة الأولى" : "Description of service one"}</p>
            </div>
            <div style="padding: 2rem; background: white; border-radius: 0.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h3>${isArabic ? "خدمة 2" : "Service 2"}</h3>
              <p style="color: #666;">${isArabic ? "وصف الخدمة الثانية" : "Description of service two"}</p>
            </div>
            <div style="padding: 2rem; background: white; border-radius: 0.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h3>${isArabic ? "خدمة 3" : "Service 3"}</h3>
              <p style="color: #666;">${isArabic ? "وصف الخدمة الثالثة" : "Description of service three"}</p>
            </div>
          </div>
        </section>
        <footer style="text-align: center; padding: 2rem 0; margin-top: 2rem; border-top: 1px solid #eee;">
          <p style="color: #999;">${isArabic ? "جميع الحقوق محفوظة" : "All rights reserved"} © 2026</p>
        </footer>
      </div>`,
      css: "* { margin: 0; padding: 0; box-sizing: border-box; }",
      seoTitle: description,
      seoDescription: `${description} - Professional website`,
      sections: ["Hero", "About", "Services", "Footer"],
      colorPalette: { primary: "#667eea", secondary: "#764ba2", accent: "#f093fb", background: "#ffffff", text: "#333333" },
    };
  }
}

export async function editWebsiteWithAI(currentHtml: string, currentCss: string, editCommand: string, language: string = "en"): Promise<{ html: string; css: string }> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages: [
      {
        role: "system",
        content: "You are a web designer assistant. The user will give you their current website HTML and CSS, along with an edit instruction. Apply the changes and return the updated HTML and CSS as a JSON object with 'html' and 'css' fields. Return ONLY JSON, no markdown.",
      },
      {
        role: "user",
        content: `Current HTML:\n${currentHtml}\n\nCurrent CSS:\n${currentCss}\n\nEdit instruction: "${editCommand}"\n\nLanguage: ${language === "ar" ? "Arabic" : "English"}`,
      },
    ],
    max_completion_tokens: 16384,
    temperature: 0.5,
  });

  const content = response.choices[0]?.message?.content || "";
  try {
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return { html: currentHtml, css: currentCss };
  }
}
