import { openai } from "./ai";

export function registerAiBuilderRoutes(app: any, isAuthenticated: any) {

  app.post("/api/ai-builder/parse-prompt", isAuthenticated, async (req: any, res: any) => {
    try {
      const { prompt } = req.body;
      if (!prompt?.trim()) return res.status(400).json({ message: "Prompt is required" });

      const model = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ? "gpt-5.2" : "gpt-4o-mini";
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: `You are an expert business extractor for an Arabic AI website builder platform.
Extract structured business info from ANY user prompt (Arabic, English, or mixed).
Return ONLY valid JSON with EXACTLY these fields:

{
  "businessNameAr": "Arabic business name",
  "businessNameEn": "English transliteration or translation",
  "activityType": "one of: restaurant | medical | retail | services | realestate | education | hotel | automotive | beauty | technology | other",
  "descriptionAr": "2-3 sentence Arabic description of the business",
  "descriptionEn": "2-3 sentence English description",
  "primaryColor": "#hex — choose a color that fits the business vibe",
  "accentColor": "#hex — complementary accent color",
  "location": "city or region if mentioned, else empty string",
  "phone": "phone number if mentioned, else empty string",
  "whatsapp": "WhatsApp number if mentioned (same as phone usually), else empty string",
  "websiteLanguages": ["ar"] or ["ar","en"] — include en if English is mentioned,
  "designStyle": "luxury | dark-modern | corporate | minimal",
  "suggestions": ["3 short Arabic edit suggestions the user can use after generation"]
}

Color & style guide — IMPORTANT: Pick ONE palette from the options below (vary your pick — do NOT always pick the first one):

LUXURY / PERFUME / JEWELRY / FASHION:
  Option A → primaryColor:#1a1a2e, accentColor:#c9a96e, designStyle:luxury
  Option B → primaryColor:#0a0a0a, accentColor:#d4a843, designStyle:luxury
  Option C → primaryColor:#1a0033, accentColor:#b8860b, designStyle:luxury
  Option D → primaryColor:#1c0a2e, accentColor:#e879f9, designStyle:luxury

RESTAURANT / CAFÉ / GRILL / FOOD:
  Option A → primaryColor:#7c2d12, accentColor:#f59e0b, designStyle:dark-modern
  Option B → primaryColor:#1a0a00, accentColor:#ea580c, designStyle:dark-modern
  Option C → primaryColor:#3b1106, accentColor:#fbbf24, designStyle:dark-modern
  Option D → primaryColor:#6f4e37, accentColor:#d4a843, designStyle:dark-modern

MEDICAL / CLINIC / PHARMACY / HOSPITAL:
  Option A → primaryColor:#0d9488, accentColor:#0284c7, designStyle:corporate
  Option B → primaryColor:#1e40af, accentColor:#22d3ee, designStyle:corporate
  Option C → primaryColor:#0c4a6e, accentColor:#06b6d4, designStyle:corporate
  Option D → primaryColor:#164e63, accentColor:#34d399, designStyle:corporate
  Option E → primaryColor:#4c1d95, accentColor:#7c3aed, designStyle:dark-modern

REAL ESTATE / PROPERTY:
  Option A → primaryColor:#1e3a5f, accentColor:#d4af37, designStyle:luxury
  Option B → primaryColor:#1a2e1a, accentColor:#059669, designStyle:luxury
  Option C → primaryColor:#0f172a, accentColor:#f59e0b, designStyle:luxury
  Option D → primaryColor:#312e81, accentColor:#a78bfa, designStyle:dark-modern

TECH / STARTUP / SOFTWARE / APP:
  Option A → primaryColor:#3730a3, accentColor:#22d3ee, designStyle:dark-modern
  Option B → primaryColor:#7c3aed, accentColor:#06b6d4, designStyle:dark-modern
  Option C → primaryColor:#030712, accentColor:#22c55e, designStyle:dark-modern
  Option D → primaryColor:#0f172a, accentColor:#a855f7, designStyle:dark-modern

BEAUTY / SALON / SPA:
  Option A → primaryColor:#831843, accentColor:#f472b6, designStyle:minimal
  Option B → primaryColor:#be185d, accentColor:#f43f5e, designStyle:minimal
  Option C → primaryColor:#581c87, accentColor:#e879f9, designStyle:dark-modern
  Option D → primaryColor:#4a0072, accentColor:#c084fc, designStyle:luxury

EDUCATION / ACADEMY / SCHOOL:
  Option A → primaryColor:#1e3a8a, accentColor:#f97316, designStyle:corporate
  Option B → primaryColor:#064e3b, accentColor:#fbbf24, designStyle:corporate
  Option C → primaryColor:#1e3a5f, accentColor:#22c55e, designStyle:corporate
  Option D → primaryColor:#312e81, accentColor:#f59e0b, designStyle:dark-modern

AGENCY / MARKETING / CREATIVE:
  Option A → primaryColor:#1e3a5f, accentColor:#2563eb, designStyle:dark-modern
  Option B → primaryColor:#0f172a, accentColor:#6366f1, designStyle:dark-modern
  Option C → primaryColor:#1c1917, accentColor:#f97316, designStyle:dark-modern
  Option D → primaryColor:#18181b, accentColor:#a78bfa, designStyle:dark-modern

AUTOMOTIVE / TRANSPORT:
  Option A → primaryColor:#1e293b, accentColor:#3b82f6, designStyle:dark-modern
  Option B → primaryColor:#7f1d1d, accentColor:#ef4444, designStyle:dark-modern
  Option C → primaryColor:#0c1445, accentColor:#60a5fa, designStyle:dark-modern

HOTEL / RESORT / TOURISM:
  Option A → primaryColor:#1a0a00, accentColor:#d4a843, designStyle:luxury
  Option B → primaryColor:#064e3b, accentColor:#10b981, designStyle:luxury
  Option C → primaryColor:#0c4a6e, accentColor:#38bdf8, designStyle:luxury

GYM / FITNESS / SPORT:
  Option A → primaryColor:#1a0000, accentColor:#ef4444, designStyle:dark-modern
  Option B → primaryColor:#0a0a0a, accentColor:#22c55e, designStyle:dark-modern
  Option C → primaryColor:#1c1917, accentColor:#f97316, designStyle:dark-modern

DEFAULT:
  Option A → primaryColor:#1e293b, accentColor:#6366f1, designStyle:dark-modern
  Option B → primaryColor:#0f172a, accentColor:#a855f7, designStyle:dark-modern
  Option C → primaryColor:#18181b, accentColor:#3b82f6, designStyle:dark-modern

IMPORTANT: Never return colors with luminance > 0.5 (no white/light primaries). Always pick a DIFFERENT option each call — rotate through options to create variety.`,
          },
          { role: "user", content: prompt.trim() },
        ],
        max_completion_tokens: 700,
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const raw = completion.choices[0]?.message?.content || "{}";
      let parsed: Record<string, any> = {};
      try { parsed = JSON.parse(raw); } catch {}

      const validActivities = ["restaurant","medical","retail","services","realestate","education","hotel","automotive","beauty","technology","other"];
      const validStyles = ["luxury","dark-modern","corporate","minimal"];

      res.json({
        success: true,
        data: {
          businessNameAr: String(parsed.businessNameAr || "موقعي الإلكتروني"),
          businessNameEn: String(parsed.businessNameEn || "My Website"),
          activityType: validActivities.includes(parsed.activityType) ? parsed.activityType : "other",
          descriptionAr: String(parsed.descriptionAr || ""),
          descriptionEn: String(parsed.descriptionEn || ""),
          primaryColor: /^#[0-9a-f]{3,8}$/i.test(parsed.primaryColor) ? parsed.primaryColor : "#1e293b",
          accentColor: /^#[0-9a-f]{3,8}$/i.test(parsed.accentColor) ? parsed.accentColor : "#6366f1",
          location: String(parsed.location || ""),
          phone: String(parsed.phone || ""),
          whatsapp: String(parsed.whatsapp || ""),
          websiteLanguages: Array.isArray(parsed.websiteLanguages) ? parsed.websiteLanguages : ["ar"],
          designStyle: validStyles.includes(parsed.designStyle) ? parsed.designStyle : "dark-modern",
          suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 3) : [
            "غيّر الألوان إلى أسود وذهبي",
            "أضف قسم الأسعار",
            "عدّل النصوص والعناوين",
          ],
        },
      });
    } catch (err: any) {
      console.error("[AI Builder] parse-prompt error:", err?.message || err);
      res.status(500).json({ message: "Failed to analyze prompt", detail: err?.message });
    }
  });

  // ─── Smart Clarification Questions ───────────────────────────────────────────
  // Analyzes parsed info and generates targeted questions for missing details
  app.post("/api/ai-builder/smart-questions", isAuthenticated, async (req: any, res: any) => {
    try {
      const { parsedInfo } = req.body;
      if (!parsedInfo) return res.status(400).json({ message: "parsedInfo is required" });

      const questions: SmartQuestion[] = [];

      // Q1: Location (if missing)
      if (!parsedInfo.location || parsedInfo.location.trim() === "") {
        questions.push({
          id: "location",
          field: "location",
          question: `أين يقع نشاطك التجاري "${parsedInfo.businessNameAr}"؟`,
          type: "choice",
          options: [
            { label: "🏙️ الرياض", value: "الرياض" },
            { label: "🌊 جدة", value: "جدة" },
            { label: "⚡ الدمام", value: "الدمام" },
            { label: "🕌 مكة المكرمة", value: "مكة المكرمة" },
            { label: "🌟 المدينة المنورة", value: "المدينة المنورة" },
            { label: "🗺️ مدينة أخرى", value: "__custom__" },
          ],
          allowCustom: true,
          customPlaceholder: "اكتب اسم المدينة...",
        });
      }

      // Q2: Website Goal (always ask — critical for content generation)
      questions.push({
        id: "goal",
        field: "goal",
        question: "ما الهدف الرئيسي من الموقع؟",
        type: "choice",
        options: [
          { label: "📞 استقبال اتصالات واستفسارات", value: "leads" },
          { label: "🛒 بيع منتجات أو خدمات", value: "sales" },
          { label: "🗓️ حجز مواعيد أونلاين", value: "bookings" },
          { label: "🖼️ عرض أعمالي ومشاريعي", value: "portfolio" },
          { label: "ℹ️ تعريف بالنشاط فقط", value: "branding" },
        ],
        allowCustom: false,
      });

      // Q3: Sections (always ask — determines site structure)
      questions.push({
        id: "sections",
        field: "sections",
        question: "اختر الأقسام التي تريدها في موقعك:",
        type: "multi-choice",
        options: [
          { label: "🖼️ معرض الصور", value: "gallery" },
          { label: "💰 الأسعار والباقات", value: "pricing" },
          { label: "👥 فريق العمل", value: "team" },
          { label: "⭐ آراء العملاء", value: "testimonials" },
          { label: "❓ الأسئلة الشائعة", value: "faq" },
          { label: "📍 الموقع على الخريطة", value: "map" },
          { label: "📱 تواصل معنا", value: "contact" },
          { label: "🎯 خدماتنا", value: "services" },
        ],
        allowCustom: false,
        minSelect: 1,
        hint: "اختر ما تحتاج (يمكن تعديله لاحقاً)",
      });

      // Note: WhatsApp/phone is collected after site generation via the chat editor

      res.json({ success: true, questions });
    } catch (err: any) {
      console.error("[AI Builder] smart-questions error:", err?.message || err);
      res.status(500).json({ message: "Failed to generate questions", detail: err?.message });
    }
  });

  // ─── Merge Answers into Info ──────────────────────────────────────────────────
  // Merges user's question answers back into the extracted info
  app.post("/api/ai-builder/merge-answers", isAuthenticated, async (req: any, res: any) => {
    try {
      const { parsedInfo, answers } = req.body;
      if (!parsedInfo || !answers) return res.status(400).json({ message: "parsedInfo and answers required" });

      const merged = { ...parsedInfo };

      // Apply each answer
      for (const [field, value] of Object.entries(answers)) {
        if (value === "__skip__" || value === null || value === undefined) continue;

        if (field === "location" && typeof value === "string") {
          merged.location = value;
        } else if (field === "whatsapp" && typeof value === "string") {
          merged.whatsapp = value;
          if (!merged.phone) merged.phone = value;
        } else if (field === "goal" && typeof value === "string") {
          // Enrich description and suggestions based on goal
          merged.siteGoal = value;
          const goalSuggestions: Record<string, string[]> = {
            leads:     ["أضف نموذج تواصل في الصفحة الرئيسية", "اجعل رقم الهاتف بارزاً", "أضف قسم لماذا تختارنا"],
            sales:     ["أضف قسم الأسعار والباقات", "أضف أزرار الشراء في كل قسم", "أضف شهادات العملاء"],
            bookings:  ["أضف نظام حجز مواعيد", "اجعل الحجز بارزاً في الصفحة الرئيسية", "أضف التقويم والمواعيد المتاحة"],
            portfolio: ["أضف معرض أعمالي بصور", "أضف قسم من أنا", "أضف شهادات العملاء"],
            branding:  ["أضف قصة النشاط", "اجعل الهوية البصرية أقوى", "أضف قسم رسالتنا ورؤيتنا"],
          };
          merged.suggestions = goalSuggestions[value] || merged.suggestions;
        } else if (field === "sections" && Array.isArray(value)) {
          merged.requestedSections = value;
        }
      }

      res.json({ success: true, data: merged });
    } catch (err: any) {
      console.error("[AI Builder] merge-answers error:", err?.message || err);
      res.status(500).json({ message: "Failed to merge answers", detail: err?.message });
    }
  });
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface SmartQuestion {
  id: string;
  field: string;
  question: string;
  type: "choice" | "multi-choice";
  options: { label: string; value: string }[];
  allowCustom: boolean;
  customPlaceholder?: string;
  customFirst?: boolean;
  minSelect?: number;
  hint?: string;
}
