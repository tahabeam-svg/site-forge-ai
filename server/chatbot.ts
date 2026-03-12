import OpenAI from "openai";
import { db } from "./db";
import { storage } from "./storage";
import {
  visitorQuestions, autoLearnedKnowledge, knowledgeBase,
  chatbotConversations, chatbotMessages, leads,
} from "@shared/schema";
import { eq, desc, sql, like, ilike } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "placeholder",
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const MODEL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ? "gpt-5.2" : "gpt-4.1-mini";

// ─── Response Cache ───────────────────────────────────────────────────────────
const responseCache = new Map<string, { response: string; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCached(key: string): string | null {
  const cached = responseCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.ts > CACHE_TTL) { responseCache.delete(key); return null; }
  return cached.response;
}

function setCache(key: string, response: string) {
  responseCache.set(key, { response, ts: Date.now() });
}

// ─── Language & Dialect Detection ─────────────────────────────────────────────
export interface LanguageInfo {
  language: "ar" | "en" | "other";
  dialect: "msa" | "gulf" | "egyptian" | "levantine" | "maghrebi" | "none";
  dialectLabel: string;
}

const ARABIC_GULF_PATTERNS = /يبغى|ابغى|وش|كيف اسوي|اسوي|ابي|وين|شلون|كذا|الحين|يلا/i;
const ARABIC_EGYPTIAN_PATTERNS = /ازيك|عايز|مش|ازاي|بتاع|بقى|معلش|ده|دي|هو ده|علشان|مش كده/i;
const ARABIC_LEVANTINE_PATTERNS = /كيفك|شو|هلق|بدي|منيح|شي|ليش|وين|هلا|يلا|اشي|بدك|بدنا/i;
const ARABIC_MAGHREBI_PATTERNS = /واش|كيفاش|بزاف|غادي|راه|نتا|نتي|دابا|هاد|هادو/i;
const ARABIC_SCRIPT = /[\u0600-\u06FF]/;
const ENGLISH_PATTERN = /^[a-zA-Z\s\d\.,!?'"@#$%^&*()\-_+=<>{}[\]|\\/:;]+$/;

export function detectLanguageAndDialect(text: string): LanguageInfo {
  const hasArabic = ARABIC_SCRIPT.test(text);
  const trimmed = text.trim();

  if (!hasArabic) {
    const looksEnglish = ENGLISH_PATTERN.test(trimmed) || /^[a-zA-Z]/.test(trimmed);
    return { language: looksEnglish ? "en" : "other", dialect: "none", dialectLabel: "English" };
  }

  // Detect Arabic dialect
  if (ARABIC_GULF_PATTERNS.test(text)) {
    return { language: "ar", dialect: "gulf", dialectLabel: "Gulf Arabic" };
  }
  if (ARABIC_EGYPTIAN_PATTERNS.test(text)) {
    return { language: "ar", dialect: "egyptian", dialectLabel: "Egyptian Arabic" };
  }
  if (ARABIC_LEVANTINE_PATTERNS.test(text)) {
    return { language: "ar", dialect: "levantine", dialectLabel: "Levantine Arabic" };
  }
  if (ARABIC_MAGHREBI_PATTERNS.test(text)) {
    return { language: "ar", dialect: "maghrebi", dialectLabel: "Maghrebi Arabic" };
  }
  return { language: "ar", dialect: "msa", dialectLabel: "Modern Standard Arabic" };
}

// ─── Knowledge Base Search ─────────────────────────────────────────────────────
async function searchKnowledgeBase(question: string, language: string): Promise<string | null> {
  try {
    const lowerQ = question.toLowerCase();
    const keywords = lowerQ.split(/\s+/).filter(w => w.length > 2);

    for (const kw of keywords) {
      const results = await db.select().from(knowledgeBase)
        .where(ilike(knowledgeBase.question, `%${kw}%`))
        .limit(3);

      const match = results.find(r =>
        r.isApproved &&
        (r.language === language || r.language === "both")
      );
      if (match) return match.answer;
    }
    return null;
  } catch (err: any) {
    console.error("searchKnowledgeBase error:", err?.message);
    return null;
  }
}

// ─── Auto-Learned Knowledge Search ────────────────────────────────────────────
async function searchAutoLearned(question: string, language: string): Promise<string | null> {
  try {
    const words = question.split(/\s+/).filter(w => w.length > 3).slice(0, 3);
    for (const word of words) {
      const [match] = await db.select().from(autoLearnedKnowledge)
        .where(
          sql`${ilike(autoLearnedKnowledge.questionPattern, `%${word}%`)} AND (${autoLearnedKnowledge.language} = ${language} OR ${autoLearnedKnowledge.language} = 'both')`
        )
        .orderBy(desc(autoLearnedKnowledge.usageCount))
        .limit(1);
      if (match) {
        await db.update(autoLearnedKnowledge)
          .set({ usageCount: (match.usageCount || 1) + 1 })
          .where(eq(autoLearnedKnowledge.id, match.id));
        return match.answer;
      }
    }
    return null;
  } catch (err: any) {
    console.error("searchAutoLearned error:", err?.message);
    return null;
  }
}

// ─── Fetch Live Pricing ────────────────────────────────────────────────────────
interface PricingInfo {
  proPrice: number;    // in SAR
  businessPrice: number; // in SAR
  proCredits: number;
  businessCredits: number;
}

async function getLivePricing(): Promise<PricingInfo> {
  try {
    const [proP, businessP, proC, businessC] = await Promise.all([
      storage.getSetting("price_pro"),
      storage.getSetting("price_business"),
      storage.getSetting("credits_pro"),
      storage.getSetting("credits_business"),
    ]);
    // prices stored in halalas (1 SAR = 100 halalas), e.g. 9900 = 99 SAR
    const proPrice = proP ? Math.round(parseInt(proP) / 100) : 99;
    const businessPrice = businessP ? Math.round(parseInt(businessP) / 100) : 199;
    const proCredits = proC ? parseInt(proC) : 50;
    const businessCredits = businessC ? parseInt(businessC) : 200;
    return { proPrice, businessPrice, proCredits, businessCredits };
  } catch {
    return { proPrice: 99, businessPrice: 199, proCredits: 50, businessCredits: 200 };
  }
}

// ─── Build System Prompt ───────────────────────────────────────────────────────
async function buildSystemPrompt(langInfo: LanguageInfo): Promise<string> {
  const pricing = await getLivePricing();

  const dialectInstruction = langInfo.language === "ar" ? `
You must respond in Arabic. Specifically use ${langInfo.dialectLabel} dialect naturally.
- Gulf Arabic: use words like "تقدر", "وش", "الحين", "يبغى"
- Egyptian Arabic: use words like "عايز", "ازاي", "بقى", "معلش"
- Levantine Arabic: use words like "بدك", "شو", "كيفك", "هلق"
- Maghrebi Arabic: use words like "واش", "بزاف", "كيفاش"
- MSA: use formal Modern Standard Arabic
` : `Respond in clear, friendly English.`;

  return `You are the official ArabyWeb (عربي ويب) sales & support assistant — the #1 AI-powered website builder AND digital marketing platform for the Arab world.

LANGUAGE RULES (strictly follow):
- NEVER use the word "ترميز" — always say "برمجة" or "كود برمجي"
- Example: say "بدون أي برمجة" NOT "بدون أي ترميز"
- When a visitor seems interested or asks how to start: IMMEDIATELY direct them to sign up free — say "سجّل مجاناً الآن وجرّب بنفسك" with a strong push to try it directly.
- NEVER say "سيتواصل معك فريقنا" or "تواصل مع الفريق" — always push for self-service free trial UNLESS the user explicitly asks for human consultation.

CONSULTATION TRIGGER (very important):
- If the user explicitly asks for a consultation, to speak with someone, or says "أريد استشارة" / "تواصل معي" / "اتصل بي" / "أبغى أحد يساعدني" / "I want to talk to someone" / "I need help" → add the exact text [CONSULTATION] at the very END of your reply.
- If after 2 attempts you still cannot understand what the user wants or their questions are very unclear and confusing → add [CONSULTATION] at the very END of your reply.
- [CONSULTATION] must appear only at the very end, on its own, nothing after it.

═══ PLATFORM SERVICES ═══

【1. Website Builder】
- AI generates a complete, professional website from a text description in under 90 seconds
- 100% visual editor — no coding (كود برمجي) required — zero برمجة needed
- Arabic RTL + English support
- One-click publishing
- Custom domains, SEO optimization, e-commerce, contact forms
- Plans:
  * Free: 1 website, basic AI generation, community support — great for testing (free forever)
  * Pro: ${pricing.proPrice} SAR/month — 10 websites, advanced AI editor, 24/7 technical support, analytics dashboard
  * Business: ${pricing.businessPrice} SAR/month — 30 websites, advanced AI editor, 24/7 priority support, premium templates, team collaboration

【2. AI Marketing & Social Media Content】
- AI generates ready-to-post social media content (Instagram, Twitter/X, TikTok, Snapchat, LinkedIn)
- Supports Arabic dialects, formal Arabic, and English
- Generates captions, hashtags, stories, campaigns, and monthly content calendars
- Tailored per business type (restaurant, clinic, store, startup, etc.)
- Marketing Plans:
  * Starter: $9/month — 20 posts/month
  * Growth (most popular): $19/month — 60 posts/month  
  * Pro: $39/month — Unlimited posts + full content calendar + campaign planning

═══ YOUR SALES MISSION ═══

You are a PROACTIVE SALES ASSISTANT. Your job is to CONVERT visitors into paying subscribers.

CONVERSION STRATEGY:
1. Always start by asking what type of business the visitor has
2. Then ask which service interests them MORE: website or marketing content
3. Based on answers, recommend the most suitable plan with a specific example
4. Always highlight the VALUE and ROI, not just features
5. Create urgency: "10,000+ businesses already use ArabyWeb"
6. End every response with a CTA question that moves them forward

SMART QUALIFYING QUESTIONS (use these naturally):
- "ما نوع نشاطك التجاري؟" / "What's your business type?"
- "هل عندك موقع حالياً؟" / "Do you currently have a website?"
- "كم عدد منشوراتك على السوشيال ميديا أسبوعياً؟"
- "ما المنصات التي تستخدمها؟ انستقرام / تويتر / تيك توك؟"
- "هل تبحث عن موقع أم محتوى تسويقي أم الاثنين؟"
- "ما ميزانيتك التقريبية للتسويق الرقمي شهرياً؟"

RESPONSE RULES:
- Keep responses SHORT (2-3 sentences max) unless explaining pricing/plans
- Always end with a question or a DIRECT call-to-action to try free
- Use emojis sparingly but effectively
- Never be pushy — be consultative and helpful
- NEVER offer to "have our team contact them" — always push them to try it themselves
- If they seem ready or interested: STRONGLY push "سجّل مجاناً الآن وجرّب بنفسك خلال دقيقتين!" / "Sign up free now and try it yourself in 2 minutes!"
- When recommending a plan, always follow with: "ابدأ بالنسخة المجانية الآن — لا تحتاج بطاقة بنكية"

${dialectInstruction}

IMPORTANT: Always ask follow-up questions to understand their needs before recommending a plan. The goal is to find the RIGHT solution for THEIR business. End every conversation thread by pushing them to START the free trial immediately.`;
}

// ─── Main Chat Function ────────────────────────────────────────────────────────
export interface ChatRequest {
  message: string;
  conversationId?: number;
  sessionId: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  pageLang?: string;
}

export interface ChatResponse {
  reply: string;
  conversationId: number;
  langInfo: LanguageInfo;
  source: "cache" | "knowledge_base" | "auto_learned" | "openai";
}

// Detect if message is about pricing — always use live data
function isPricingQuestion(message: string): boolean {
  return /سعر|اسعار|أسعار|تكلفة|كم الاشتراك|كم السعر|how much|price|pricing|cost|plan|باقة|باقات|اشتراك|pro|business|تسويق|marketing|منشور|post|محتوى|content|starter|growth/i.test(message);
}

export async function processChat(req: ChatRequest): Promise<ChatResponse> {
  const { message, sessionId, history = [], pageLang } = req;

  // Detect language from message, then override with page language if provided
  let langInfo = detectLanguageAndDialect(message);
  if (pageLang === "ar") {
    langInfo = { language: "ar", dialect: langInfo.dialect === "msa" ? "gulf" : langInfo.dialect, dialectLabel: langInfo.dialectLabel };
  } else if (pageLang === "en") {
    langInfo = { language: "en", dialect: "none", dialectLabel: "English" };
  }

  const pricingQ = isPricingQuestion(message);
  const cacheKey = `${langInfo.language}:${message.trim().toLowerCase()}`;

  // 1. Check cache (skip for pricing questions — always need fresh prices)
  if (!pricingQ) {
    const cached = getCached(cacheKey);
    if (cached) {
      await saveInteraction(message, langInfo, cached, sessionId);
      const convId = await ensureConversation(req.conversationId, sessionId, langInfo);
      await saveMessages(convId, message, cached);
      return { reply: cached, conversationId: convId, langInfo, source: "cache" };
    }
  }

  // 2. Search KnowledgeBase (skip for pricing questions — KB may have stale prices)
  if (!pricingQ) {
    const kbAnswer = await searchKnowledgeBase(message, langInfo.language);
    if (kbAnswer) {
      setCache(cacheKey, kbAnswer);
      await saveInteraction(message, langInfo, kbAnswer, sessionId);
      const convId = await ensureConversation(req.conversationId, sessionId, langInfo);
      await saveMessages(convId, message, kbAnswer);
      return { reply: kbAnswer, conversationId: convId, langInfo, source: "knowledge_base" };
    }
  }

  // 3. Search Auto-Learned (skip for pricing questions)
  if (!pricingQ) {
    const autoAnswer = await searchAutoLearned(message, langInfo.language);
    if (autoAnswer) {
      setCache(cacheKey, autoAnswer);
      await saveInteraction(message, langInfo, autoAnswer, sessionId);
      const convId = await ensureConversation(req.conversationId, sessionId, langInfo);
      await saveMessages(convId, message, autoAnswer);
      return { reply: autoAnswer, conversationId: convId, langInfo, source: "auto_learned" };
    }
  }

  // 4. Call OpenAI (with retry + fallback model)
  const systemPrompt = await buildSystemPrompt(langInfo);
  const messages: any[] = [
    { role: "system", content: systemPrompt },
    ...history.slice(-6),
    { role: "user", content: message },
  ];

  let completion: any;
  const FALLBACK_MODEL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ? "gpt-4o" : "gpt-4o-mini";
  const models = [MODEL, FALLBACK_MODEL];
  let lastError: any;
  for (const model of models) {
    try {
      completion = await openai.chat.completions.create({
        model,
        messages,
        max_completion_tokens: 500,
        temperature: 0.7,
      } as any);
      if (completion?.choices?.[0]?.message?.content) break;
    } catch (err: any) {
      lastError = err;
      console.error(`Chatbot OpenAI error (model=${model}):`, err?.message || err);
      if (model === models[models.length - 1]) throw lastError;
    }
  }

  const reply = completion?.choices[0]?.message?.content || 
    (langInfo.language === "ar" ? "عذراً، لم أفهم سؤالك. هل يمكنك إعادة صياغته؟" : "Sorry, I didn't understand. Could you rephrase?");

  setCache(cacheKey, reply);
  await saveInteraction(message, langInfo, reply, sessionId);
  const convId = await ensureConversation(req.conversationId, sessionId, langInfo);
  await saveMessages(convId, message, reply);

  return { reply, conversationId: convId, langInfo, source: "openai" };
}

// ─── Helper Functions ──────────────────────────────────────────────────────────
async function saveInteraction(question: string, langInfo: LanguageInfo, response: string, sessionId: string) {
  try {
    await db.insert(visitorQuestions).values({
      question,
      detectedLanguage: langInfo.language,
      detectedDialect: langInfo.dialect,
      aiResponse: response,
      sessionId,
    });
  } catch {}
}

async function ensureConversation(convId: number | undefined, sessionId: string, langInfo: LanguageInfo): Promise<number> {
  if (convId) return convId;
  try {
    const [conv] = await db.insert(chatbotConversations).values({
      sessionId,
      detectedLanguage: langInfo.language,
      detectedDialect: langInfo.dialect,
    }).returning();
    return conv?.id || 0;
  } catch (err: any) {
    console.error("ensureConversation error:", err?.message);
    return 0;
  }
}

async function saveMessages(convId: number, userMsg: string, botMsg: string) {
  try {
    await db.insert(chatbotMessages).values([
      { conversationId: convId, sender: "user", message: userMsg },
      { conversationId: convId, sender: "bot", message: botMsg },
    ]);
  } catch {}
}

// ─── Admin Analytics ────────────────────────────────────────────────────────────
export async function getChatbotStats() {
  const [totalQ] = await db.select({ count: sql<number>`count(*)::int` }).from(visitorQuestions);
  const [totalConv] = await db.select({ count: sql<number>`count(*)::int` }).from(chatbotConversations);
  const [totalLeads] = await db.select({ count: sql<number>`count(*)::int` }).from(leads);

  const langDist = await db.execute(sql`
    SELECT detected_language, COUNT(*)::int as count 
    FROM visitor_questions 
    GROUP BY detected_language
  `);

  const dialectDist = await db.execute(sql`
    SELECT detected_dialect, COUNT(*)::int as count 
    FROM visitor_questions 
    WHERE detected_language = 'ar'
    GROUP BY detected_dialect
  `);

  const topQuestions = await db.select()
    .from(visitorQuestions)
    .orderBy(desc(visitorQuestions.createdAt))
    .limit(20);

  return {
    totalQuestions: totalQ.count,
    totalConversations: totalConv.count,
    totalLeads: totalLeads.count,
    languageDistribution: langDist.rows,
    dialectDistribution: dialectDist.rows,
    topQuestions,
  };
}

// ─── Self-Improvement: Auto-Learn from Frequent Questions ─────────────────────
export async function runSelfImprovementCycle() {
  try {
    const frequent = await db.execute(sql`
      SELECT question, detected_language, COUNT(*) as cnt
      FROM visitor_questions
      WHERE ai_response IS NOT NULL
      GROUP BY question, detected_language
      HAVING COUNT(*) >= 3
      ORDER BY cnt DESC
      LIMIT 10
    `);

    for (const row of frequent.rows as any[]) {
      const existing = await db.select().from(autoLearnedKnowledge)
        .where(ilike(autoLearnedKnowledge.questionPattern, row.question))
        .limit(1);
      if (existing.length > 0) continue;

      // Generate improved answer
      const langInfo = { language: row.detected_language as "ar" | "en", dialect: "msa" as const, dialectLabel: "Arabic" };
      const systemP = buildSystemPrompt(langInfo);
      const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemP + "\nGive a perfect, comprehensive answer to this FAQ." },
          { role: "user", content: row.question },
        ],
        max_completion_tokens: 300,
        temperature: 0.5,
      } as any);
      const answer = completion.choices[0]?.message?.content || "";
      if (!answer) continue;

      await db.insert(autoLearnedKnowledge).values({
        questionPattern: row.question,
        answer,
        usageCount: parseInt(row.cnt),
        language: row.detected_language,
      });
    }
  } catch (err) {
    console.error("Self-improvement error:", err);
  }
}

export async function getConversationHistory(conversationId: number) {
  return db.select().from(chatbotMessages)
    .where(eq(chatbotMessages.conversationId, conversationId))
    .orderBy(chatbotMessages.createdAt)
    .limit(20);
}
