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

Color & style guide:
- Luxury perfume/fashion/jewelry → primaryColor:#1a1a2e, accentColor:#c9a96e, designStyle:luxury
- Restaurant/café → primaryColor:#7c2d12, accentColor:#f59e0b, designStyle:dark-modern
- Medical/clinic → primaryColor:#0f4c81, accentColor:#06b6d4, designStyle:corporate
- Real estate → primaryColor:#1e3a5f, accentColor:#d4af37, designStyle:luxury
- Tech/startup → primaryColor:#3730a3, accentColor:#06b6d4, designStyle:dark-modern
- Beauty/salon → primaryColor:#831843, accentColor:#f472b6, designStyle:minimal
- Education → primaryColor:#1e3a5f, accentColor:#22c55e, designStyle:corporate
- Default → primaryColor:#1e293b, accentColor:#6366f1, designStyle:dark-modern

IMPORTANT: Never return colors with luminance > 0.5 (no white/light primaries).`,
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
}
