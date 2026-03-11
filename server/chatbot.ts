import OpenAI from "openai";
import { db } from "./db";
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
}

// ─── Auto-Learned Knowledge Search ────────────────────────────────────────────
async function searchAutoLearned(question: string): Promise<string | null> {
  const words = question.split(/\s+/).filter(w => w.length > 3).slice(0, 3);
  for (const word of words) {
    const [match] = await db.select().from(autoLearnedKnowledge)
      .where(ilike(autoLearnedKnowledge.questionPattern, `%${word}%`))
      .orderBy(desc(autoLearnedKnowledge.usageCount))
      .limit(1);
    if (match) {
      // Increment usage count
      await db.update(autoLearnedKnowledge)
        .set({ usageCount: (match.usageCount || 1) + 1 })
        .where(eq(autoLearnedKnowledge.id, match.id));
      return match.answer;
    }
  }
  return null;
}

// ─── Build System Prompt ───────────────────────────────────────────────────────
function buildSystemPrompt(langInfo: LanguageInfo): string {
  const dialectInstruction = langInfo.language === "ar" ? `
You must respond in Arabic. Specifically use ${langInfo.dialectLabel} dialect naturally.
- Gulf Arabic: use words like "تقدر", "وش", "الحين", "يبغى"
- Egyptian Arabic: use words like "عايز", "ازاي", "بقى", "معلش"
- Levantine Arabic: use words like "بدك", "شو", "كيفك", "هلق"
- Maghrebi Arabic: use words like "واش", "بزاف", "كيفاش"
- MSA: use formal Modern Standard Arabic
` : `Respond in clear, friendly English.`;

  return `You are the official ArabyWeb (عربي ويب) assistant — the #1 AI-powered website builder for the Arab world.

Your goals:
1. Help visitors understand ArabyWeb and its features
2. Guide users to create their first website
3. Encourage upgrading to paid plans (Pro 99 SAR/mo, Business 299 SAR/mo)
4. Provide technical support for website building

Key facts about ArabyWeb:
- AI generates complete websites from a description in seconds
- No coding required — 100% visual editor
- Supports Arabic (RTL) and English
- Publishing with one click
- Plans: Free (limited), Pro (99 SAR/mo), Business (299 SAR/mo)
- 10,000+ websites created
- 100% made for the Saudi/Arab market

${dialectInstruction}

Be warm, helpful, and concise. Keep responses under 3 sentences unless explaining a process.
If someone seems interested in signing up, guide them to click "ابدأ مجاناً" / "Get Started".
If they ask about pricing, mention the free plan first then the paid plans.`;
}

// ─── Main Chat Function ────────────────────────────────────────────────────────
export interface ChatRequest {
  message: string;
  conversationId?: number;
  sessionId: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface ChatResponse {
  reply: string;
  conversationId: number;
  langInfo: LanguageInfo;
  source: "cache" | "knowledge_base" | "auto_learned" | "openai";
}

export async function processChat(req: ChatRequest): Promise<ChatResponse> {
  const { message, sessionId, history = [] } = req;

  // Detect language
  const langInfo = detectLanguageAndDialect(message);

  // 1. Check cache
  const cacheKey = `${langInfo.language}:${message.trim().toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) {
    await saveInteraction(message, langInfo, cached, sessionId);
    const convId = await ensureConversation(req.conversationId, sessionId, langInfo);
    await saveMessages(convId, message, cached);
    return { reply: cached, conversationId: convId, langInfo, source: "cache" };
  }

  // 2. Search KnowledgeBase
  const kbAnswer = await searchKnowledgeBase(message, langInfo.language);
  if (kbAnswer) {
    setCache(cacheKey, kbAnswer);
    await saveInteraction(message, langInfo, kbAnswer, sessionId);
    const convId = await ensureConversation(req.conversationId, sessionId, langInfo);
    await saveMessages(convId, message, kbAnswer);
    return { reply: kbAnswer, conversationId: convId, langInfo, source: "knowledge_base" };
  }

  // 3. Search Auto-Learned
  const autoAnswer = await searchAutoLearned(message);
  if (autoAnswer) {
    setCache(cacheKey, autoAnswer);
    await saveInteraction(message, langInfo, autoAnswer, sessionId);
    const convId = await ensureConversation(req.conversationId, sessionId, langInfo);
    await saveMessages(convId, message, autoAnswer);
    return { reply: autoAnswer, conversationId: convId, langInfo, source: "auto_learned" };
  }

  // 4. Call OpenAI
  const systemPrompt = buildSystemPrompt(langInfo);
  const messages: any[] = [
    { role: "system", content: systemPrompt },
    ...history.slice(-6), // last 6 messages for context
    { role: "user", content: message },
  ];

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages,
    max_completion_tokens: 400,
    temperature: 0.7,
  } as any);

  const reply = completion.choices[0]?.message?.content || 
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
  const [conv] = await db.insert(chatbotConversations).values({
    sessionId,
    detectedLanguage: langInfo.language,
    detectedDialect: langInfo.dialect,
  }).returning();
  return conv.id;
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
