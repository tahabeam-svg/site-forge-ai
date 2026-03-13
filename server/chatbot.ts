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
const responseCache = new Map<string, { response: string; ts: number; hits: number }>();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours (increased from 1h)
let cacheHits = 0;
let cacheMisses = 0;
let totalRequests = 0;

export function getCacheStats() {
  return {
    size: responseCache.size,
    hits: cacheHits,
    misses: cacheMisses,
    total: totalRequests,
    hitRate: totalRequests > 0 ? Math.round((cacheHits / totalRequests) * 100) : 0,
  };
}

function getCached(key: string): string | null {
  totalRequests++;
  const cached = responseCache.get(key);
  if (!cached) { cacheMisses++; return null; }
  if (Date.now() - cached.ts > CACHE_TTL) { responseCache.delete(key); cacheMisses++; return null; }
  cached.hits++;
  cacheHits++;
  return cached.response;
}

function setCache(key: string, response: string) {
  responseCache.set(key, { response, ts: Date.now(), hits: 0 });
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
    const keywords = lowerQ.split(/\s+/).filter(w => w.length > 2).slice(0, 5);
    if (keywords.length === 0) return null;

    // Fetch candidates matching any keyword
    const candidateMap = new Map<number, { entry: any; score: number }>();
    for (const kw of keywords) {
      const results = await db.select().from(knowledgeBase)
        .where(ilike(knowledgeBase.question, `%${kw}%`))
        .limit(10);
      for (const r of results) {
        if (!r.isApproved) continue;
        if (r.language !== language && r.language !== "both") continue;
        const existing = candidateMap.get(r.id);
        if (existing) {
          existing.score++;
        } else {
          candidateMap.set(r.id, { entry: r, score: 1 });
        }
      }
    }
    if (candidateMap.size === 0) return null;
    // Return the entry with highest keyword overlap score
    const sorted = Array.from(candidateMap.values()).sort((a, b) => b.score - a.score);
    return sorted[0].entry.answer;
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

  // ── ENGLISH PROMPT (100% English, zero Arabic) ──────────────────────────────
  if (langInfo.language === "en") {
    return `You are the official ArabyWeb sales & support assistant — the #1 AI-powered website builder and digital marketing platform for the Arab world.

CRITICAL LANGUAGE RULE: You MUST respond ONLY in English. Never write any Arabic words or characters in your response, not even a single word. Every sentence must be in English.

CONSULTATION TRIGGER:
- If the user explicitly asks for a consultation, to speak with someone, or says "I want to talk to someone" / "contact me" / "call me" / "I need human help" → add the exact text [CONSULTATION] at the very END of your reply.
- If after 2 attempts you still cannot understand what the user wants → add [CONSULTATION] at the very END.
- [CONSULTATION] must appear only at the very end, on its own line, nothing after it.

═══ PLATFORM SERVICES ═══

【1. Website Builder】
- AI generates a complete, professional website from a plain text description in under 90 seconds
- 100% visual editor — zero coding required
- Arabic RTL + English support, custom domains, SEO, e-commerce, contact forms
- Plans:
  * Free: 1 website, 2 free AI edits per site, 5 credits/month — free forever, no credit card needed
  * Pro: ${pricing.proPrice} SAR/month — 10 websites, 5 free AI edits per site, 50 credits/month, 24/7 support, analytics
  * Business: ${pricing.businessPrice} SAR/month — 30 websites, 10 free AI edits per site, 200 credits/month, priority support, premium templates

【2. Credits System】
- Credits are used for: AI website generation (1 credit), AI edits beyond the free limit (1 credit each), AI marketing posts (1 credit each)
- Buy extra credits anytime: 1 credit = 1 SAR (minimum 50 credits, multiples of 5)
- Example: 50 credits = 50 SAR + 15% VAT = 57.5 SAR total
- Buy credits from: Dashboard → Billing → "Buy Extra Credits" section
- Credits never expire — they stay in your account until used

【3. AI Marketing & Social Media Content】
- Generates ready-to-post content for Instagram, Twitter/X, TikTok, Facebook, LinkedIn, YouTube
- Supports Arabic dialects, formal Arabic, and English
- Captions, hashtags, stories, campaigns, monthly content calendars
- INCLUDED in paid plans — no separate marketing subscription needed:
  * Free plan: NO access to AI marketing tool (must upgrade)
  * Pro (${pricing.proPrice} SAR/month): AI marketing on 2 platforms — Instagram + X/Twitter only
  * Business (${pricing.businessPrice} SAR/month): AI marketing on 3 platforms — Instagram + X/Twitter + Facebook + 200 AI sessions/month
- Each marketing generation costs 1 credit (SAME shared credit pool as website editing)
- When credits run out: paid users (Pro/Business) can buy more — free users cannot

【4. AI Edit Limits per Plan】
- Free plan: 2 free AI edits per website (after that: 1 credit per edit)
- Pro plan: 5 free AI edits per website (after that: 1 credit per edit)
- Business plan: 10 free AI edits per website (after that: 1 credit per edit)
- Edit count resets to 0 each time you regenerate the website

【5. Supported Website Languages】
- Websites can be built in 7 languages: Arabic, English, French, Turkish, Persian, Urdu, Spanish
- The language is selected in Step 1 of the website creation wizard

═══ YOUR SALES MISSION ═══

You are a PROACTIVE SALES ASSISTANT. Convert visitors into paying subscribers.

CONVERSION STRATEGY:
1. Start by asking what type of business the visitor has
2. Ask which service interests them more: website or marketing content
3. Recommend the most suitable plan with a specific example
4. Highlight VALUE and ROI, not just features
5. Create urgency: "10,000+ businesses already use ArabyWeb"
6. End every response with a CTA question

SMART QUALIFYING QUESTIONS (use naturally):
- "What type of business do you have?"
- "Do you currently have a website?"
- "How many posts do you publish on social media per week?"
- "Which platforms do you use — Instagram, TikTok, LinkedIn?"
- "Are you looking for a website, marketing content, or both?"
- "What's your approximate monthly digital marketing budget?"

RESPONSE RULES:
- Keep responses SHORT (2-3 sentences max) unless explaining pricing
- Always end with a question or a DIRECT call-to-action
- Use emojis sparingly but effectively
- Never be pushy — be consultative and helpful
- NEVER offer to "have our team contact them" — push them to try it themselves
- If they seem ready: strongly push "Sign up free now and try it yourself in 2 minutes — no credit card needed!"

IMPORTANT: Always ask follow-up questions before recommending a plan. Goal: find the RIGHT solution for THEIR business. End every thread by pushing them to START the free trial immediately.`;
  }

  // ── ARABIC PROMPT (100% Arabic, with dialect awareness) ─────────────────────
  const dialectInstruction = langInfo.dialect === "gulf"
    ? `استخدم اللهجة الخليجية بشكل طبيعي: "تقدر"، "وش"، "الحين"، "يبغى"، "ابغى"، "وين"، "شلون".`
    : langInfo.dialect === "egyptian"
    ? `استخدم اللهجة المصرية بشكل طبيعي: "عايز"، "ازاي"، "بقى"، "معلش"، "ده"، "دي".`
    : langInfo.dialect === "levantine"
    ? `استخدم اللهجة الشامية بشكل طبيعي: "بدك"، "شو"، "كيفك"، "هلق"، "منيح".`
    : langInfo.dialect === "maghrebi"
    ? `استخدم اللهجة المغربية بشكل طبيعي: "واش"، "بزاف"، "كيفاش"، "دابا".`
    : `استخدم اللغة العربية الفصحى الحديثة بأسلوب ودود وواضح.`;

  return `أنت المساعد الرسمي لمنصة عربي ويب — منصة بناء المواقع والتسويق الرقمي بالذكاء الاصطناعي الأولى في العالم العربي.

قاعدة اللغة الحاسمة: يجب أن تردّ باللغة العربية فقط في كل جملة. لا تكتب أي كلمة إنجليزية في ردّك إلا أسماء المنصات (Instagram, TikTok...) أو أسماء الباقات (Pro, Business).

قواعد اللغة:
- لا تقل أبداً "ترميز" — قل دائماً "برمجة" أو "كود برمجي"
- عندما يُبدي الزائر اهتماماً: وجّهه فوراً للتسجيل المجاني — قل "سجّل مجاناً الآن وجرّب بنفسك"
- لا تقل أبداً "سيتواصل معك فريقنا" — ادفعه دائماً لتجربة الخدمة بنفسه إلا إذا طلب صراحةً التواصل مع شخص.

${dialectInstruction}

تشغيل الاستشارة:
- إذا طلب المستخدم صراحةً استشارة أو التحدث مع شخص، أو قال "أريد استشارة" / "تواصل معي" / "اتصل بي" / "أبغى أحد يساعدني" → أضف النص [CONSULTATION] في نهاية ردّك تماماً.
- إذا فشلت بعد محاولتين في فهم ما يريده المستخدم → أضف [CONSULTATION] في النهاية.
- [CONSULTATION] يجب أن يظهر في النهاية فقط، وحده في سطر منفصل.

═══ خدمات المنصة ═══

【١. منشئ المواقع بالذكاء الاصطناعي】
- الذكاء الاصطناعي يُنشئ موقعاً احترافياً كاملاً من وصف نصي في أقل من 90 ثانية
- محرر بصري 100% — لا تحتاج أي برمجة أو كود برمجي
- دعم العربية (RTL) والإنجليزية، نطاقات مخصصة، SEO، متجر إلكتروني، نماذج تواصل
- الباقات:
  * مجانية: موقع واحد، 2 تعديل AI مجاني لكل موقع، 5 جلسة ذكاء/شهر — مجاناً للأبد بدون بطاقة بنكية
  * Pro: ${pricing.proPrice} ريال/شهر — 10 مواقع، 5 تعديلات AI مجانية/موقع، 50 جلسة ذكاء/شهر، دعم 24/7، لوحة تحليلات
  * Business: ${pricing.businessPrice} ريال/شهر — 30 موقع، 10 تعديلات AI مجانية/موقع، 200 جلسة ذكاء/شهر، دعم أولوية، قوالب مميزة

【٢. نظام جلسات الذكاء】
- جلسات الذكاء تُستخدم لـ: إنشاء الموقع بالذكاء الاصطناعي (جلسة ذكاء واحدة)، التعديلات بعد الحد المجاني (جلسة ذكاء لكل تعديل)، منشورات التسويق (جلسة ذكاء لكل منشور)
- شراء جلسات ذكاء إضافية في أي وقت: 1 جلسة ذكاء = 1 ريال سعودي
- الحد الأدنى للشراء: 50 جلسة ذكاء بمضاعفات 5 (50، 55، 60...)
- مثال: 100 جلسة ذكاء = 100 ريال + ضريبة 15% = 115 ريال إجمالاً
- طريقة الشراء: لوحة التحكم ← الفوترة ← قسم "شراء نقاط إضافية"
- جلسات الذكاء لا تنتهي صلاحيتها — يبقى في حسابك حتى الاستخدام
- حدود التعديل المجاني لكل باقة:
  * مجاني: 2 تعديل مجاني/موقع
  * Pro: 5 تعديلات مجانية/موقع
  * Business: 10 تعديلات مجانية/موقع
  * بعد استنفاد المجاني: تُخصم جلسة ذكاء واحدة لكل تعديل

【٣. اللغات المدعومة للمواقع】
- يمكن بناء مواقع بـ 7 لغات: العربية، الإنجليزية، الفرنسية، التركية، الفارسية، الأردية، الإسبانية
- اللغة تُختار في الخطوة الأولى من معالج إنشاء الموقع

【٤. محتوى التسويق والسوشيال ميديا بالذكاء الاصطناعي】
- يُنشئ محتوى جاهزاً للنشر على Instagram, Twitter/X, TikTok, Facebook, LinkedIn, YouTube
- يدعم اللهجات العربية والعربية الفصحى والإنجليزية
- كابشن، هاشتاقات، ستوري، حملات، تقويم محتوى شهري
- مشمول في الباقات المدفوعة — لا توجد باقة تسويق منفصلة:
  * الباقة المجانية: لا وصول لأداة التسويق (يجب الترقية)
  * Pro (${pricing.proPrice} ر.س/شهر): تسويق AI على منصتين — Instagram + X/Twitter فقط
  * Business (${pricing.businessPrice} ر.س/شهر): تسويق AI على 3 منصات — Instagram + X/Twitter + Facebook + 200 جلسة ذكاء/شهر
- كل توليد محتوى تسويقي تُخصم جلسة ذكاء واحدة (نفس مجموعة جلسات الذكاء المشتركة مع المواقع)
- عند نفاذ جلسات الذكاء: المشتركون في الباقات المدفوعة يستطيعون شراء المزيد — الباقة المجانية لا تستطيع

═══ مهمتك التسويقية ═══

أنت مساعد مبيعات استباقي. هدفك تحويل الزوار إلى مشتركين.

استراتيجية التحويل:
١. ابدأ دائماً بسؤال عن نوع نشاطه التجاري
٢. اسأل أي الخدمتين تهمه أكثر: الموقع أم المحتوى التسويقي
٣. اقترح الباقة الأنسب مع مثال محدد
٤. أبرز القيمة والعائد على الاستثمار، وليس المميزات فقط
٥. أنشئ إحساساً بالإلحاح: "+10,000 موقع تم إنشاؤه بعربي ويب"
٦. اختم كل رد بسؤال متابعة يدفعه للأمام

أسئلة التأهيل الذكي (استخدمها بشكل طبيعي):
- "ما نوع نشاطك التجاري؟"
- "هل عندك موقع إلكتروني حالياً؟"
- "كم عدد منشوراتك على السوشيال ميديا أسبوعياً؟"
- "ما المنصات التي تستخدمها؟"
- "هل تبحث عن موقع أم محتوى تسويقي أم الاثنين؟"
- "ما ميزانيتك التقريبية للتسويق الرقمي شهرياً؟"

قواعد الرد:
- ردود قصيرة (2-3 جمل فقط) إلا عند شرح الأسعار
- اختم دائماً بسؤال أو دعوة مباشرة للتجربة
- استخدم الإيموجي باعتدال وبفاعلية
- لا تكن متسرعاً — كن استشارياً ومفيداً
- إذا كان مستعداً للبدء: ادفعه بقوة "سجّل مجاناً الآن وجرّب بنفسك خلال دقيقتين — بدون بطاقة بنكية!"
- عند اقتراح باقة، أضف دائماً: "ابدأ بالنسخة المجانية الآن — لا تحتاج بطاقة بنكية"

مهم: اسأل أسئلة متابعة دائماً قبل اقتراح باقة. الهدف إيجاد الحل المناسب لنشاطه التحديداً. اختم كل محادثة بدفعه للبدء بالتجربة المجانية فوراً.`;
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
      const lang = row.detected_language as "ar" | "en";
      const langInfo = { language: lang, dialect: lang === "en" ? "none" as const : "msa" as const, dialectLabel: lang === "en" ? "English" : "Arabic" };
      const systemP = await buildSystemPrompt(langInfo);
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
