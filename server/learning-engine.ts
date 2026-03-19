/**
 * learning-engine.ts
 * Self-improving AI Website Generation Learning System
 *
 * How it works:
 *  1. After every successful generation, extract content patterns from the spec
 *     and store them in `industry_patterns` table.
 *  2. Before generating, fetch top-rated patterns for the detected industry.
 *  3. Inject those patterns as "proven examples" into the AI content spec prompt
 *     so GPT-4o-mini produces better, more contextually grounded content.
 *  4. Quality signals (regeneration = bad, export/publish = excellent) adjust
 *     each pattern's quality score over time.
 *
 * Result: The system automatically improves with every user — patterns that
 * produce satisfied users bubble to the top, poor patterns fade away.
 */

import { db } from "./db";
import { industryPatterns, generationInsights } from "@shared/schema";
import { eq, desc, and, gte, sql, lt } from "drizzle-orm";
import type { WebsiteContentSpec } from "./website-builder.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type PatternType =
  | "tagline"
  | "service_title"
  | "cta_text"
  | "about_opening"
  | "faq_question"
  | "stat_label"
  | "footer_tagline";

export interface LearnedPattern {
  patternType: PatternType;
  content: string;
  qualityScore: number;
  usageCount: number;
}

export interface IndustryInsights {
  industry: string;
  taglines: string[];
  serviceTitles: string[];
  ctaTexts: string[];
  aboutOpenings: string[];
  faqQuestions: string[];
  totalPatterns: number;
}

// ─── DB Migration ─────────────────────────────────────────────────────────────

export async function ensureLearningTables(): Promise<void> {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS industry_patterns (
        id SERIAL PRIMARY KEY,
        industry TEXT NOT NULL,
        pattern_type TEXT NOT NULL,
        content TEXT NOT NULL,
        language TEXT DEFAULT 'ar',
        usage_count INTEGER DEFAULT 1 NOT NULL,
        quality_score INTEGER DEFAULT 50 NOT NULL,
        source_prompt TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_industry_patterns_industry
        ON industry_patterns(industry, pattern_type, quality_score DESC)
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS generation_insights (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR,
        project_id INTEGER,
        industry TEXT,
        language TEXT DEFAULT 'ar',
        prompt TEXT,
        spec_json JSONB,
        primary_color VARCHAR(10),
        accent_color VARCHAR(10),
        generation_ms INTEGER,
        quality_score INTEGER DEFAULT 50,
        regenerated_after_ms INTEGER,
        exported_at TIMESTAMP,
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("[Learning] ✅ Learning tables ready");
  } catch (e: any) {
    console.error("[Learning] Table migration error:", e?.message);
  }
}

// ─── Core Learning: Extract & Store Patterns ─────────────────────────────────

/**
 * Extract valuable content patterns from a generated spec and store them.
 * Called after every successful website generation.
 */
export async function learnFromSpec(
  industry: string,
  spec: WebsiteContentSpec,
  sourcePrompt: string,
  insightId?: number
): Promise<void> {
  if (!spec || !industry) return;
  const lang = /[\u0600-\u06FF]/.test(spec.tagline || "") ? "ar" : "en";
  const patterns: Array<{ type: PatternType; content: string }> = [];

  // Extract tagline
  if (spec.tagline?.length > 10 && spec.tagline.length < 100) {
    patterns.push({ type: "tagline", content: spec.tagline });
  }

  // Extract CTA text
  if (spec.ctaText?.length > 2 && spec.ctaText.length < 50) {
    patterns.push({ type: "cta_text", content: spec.ctaText });
  }
  if (spec.navCtaText?.length > 2 && spec.navCtaText.length < 40) {
    patterns.push({ type: "cta_text", content: spec.navCtaText });
  }

  // Extract service titles (specific ones only — skip generic)
  const genericTitles = ["خدمة", "service", "خدماتنا", "our services", "خدمة 1", "خدمة 2"];
  for (const s of spec.services || []) {
    if (
      s.title?.length > 4 &&
      s.title.length < 60 &&
      !genericTitles.some(g => s.title.toLowerCase().includes(g))
    ) {
      patterns.push({ type: "service_title", content: s.title });
    }
  }

  // Extract about opening (first 200 chars of paragraph)
  const aboutOpener = spec.aboutParagraph1?.slice(0, 200);
  if (aboutOpener && aboutOpener.length > 30) {
    patterns.push({ type: "about_opening", content: aboutOpener });
  }

  // Extract FAQ questions
  for (const faq of spec.faqItems || []) {
    if (faq.question?.length > 10 && faq.question.length < 120) {
      patterns.push({ type: "faq_question", content: faq.question });
    }
  }

  // Extract stat labels
  for (const stat of spec.stats || []) {
    if (stat.label?.length > 2 && stat.label.length < 50) {
      patterns.push({ type: "stat_label", content: `${stat.number}${stat.suffix || ""} ${stat.label}` });
    }
  }

  // Extract footer tagline
  if (spec.footerTagline?.length > 5 && spec.footerTagline.length < 80) {
    patterns.push({ type: "footer_tagline", content: spec.footerTagline });
  }

  // Upsert each pattern: if same content+industry+type exists → increment usage_count
  for (const p of patterns) {
    try {
      const existing = await db
        .select()
        .from(industryPatterns)
        .where(
          and(
            eq(industryPatterns.industry, industry),
            eq(industryPatterns.patternType, p.type),
            eq(industryPatterns.content, p.content)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(industryPatterns)
          .set({
            usageCount: sql`${industryPatterns.usageCount} + 1`,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(eq(industryPatterns.id, existing[0].id));
      } else {
        await db.insert(industryPatterns).values({
          industry,
          patternType: p.type,
          content: p.content,
          language: lang,
          usageCount: 1,
          qualityScore: 50,
          sourcePrompt: sourcePrompt.slice(0, 200),
        });
      }
    } catch (e: any) {
      // Non-fatal — skip this pattern
      console.warn(`[Learning] Pattern insert skip: ${e?.message?.slice(0, 80)}`);
    }
  }

  console.log(`[Learning] ✅ Learned ${patterns.length} patterns for industry: ${industry}`);
}

// ─── Quality Signals ─────────────────────────────────────────────────────────

/**
 * Call this when user regenerates shortly after — signals previous generation was poor.
 * Reduces quality scores of patterns from that insight.
 */
export async function signalRegeneration(insightId: number, afterMs: number): Promise<void> {
  try {
    await db
      .update(generationInsights)
      .set({ regeneratedAfterMs: afterMs, qualityScore: 20 })
      .where(eq(generationInsights.id, insightId));

    // Penalize patterns from that generation's industry slightly
    const insight = await db
      .select()
      .from(generationInsights)
      .where(eq(generationInsights.id, insightId))
      .limit(1);

    if (insight[0]?.industry) {
      // Lower quality of recently added patterns from this industry (last 1 hour)
      await db.execute(sql`
        UPDATE industry_patterns
        SET quality_score = GREATEST(quality_score - 5, 10)
        WHERE industry = ${insight[0].industry}
          AND created_at > NOW() - INTERVAL '1 hour'
      `);
    }
  } catch (e: any) {
    console.warn("[Learning] Signal regen error:", e?.message);
  }
}

/**
 * Call this when user exports or publishes — strong positive signal.
 * Boosts quality scores of patterns from that insight.
 */
export async function signalSatisfied(insightId: number, signal: "export" | "publish"): Promise<void> {
  try {
    const update = signal === "publish"
      ? { publishedAt: new Date(), qualityScore: 95 }
      : { exportedAt: new Date(), qualityScore: 85 };

    await db
      .update(generationInsights)
      .set(update)
      .where(eq(generationInsights.id, insightId));

    // Boost patterns from this generation's industry
    const insight = await db
      .select()
      .from(generationInsights)
      .where(eq(generationInsights.id, insightId))
      .limit(1);

    if (insight[0]?.industry) {
      await db.execute(sql`
        UPDATE industry_patterns
        SET quality_score = LEAST(quality_score + 10, 100),
            updated_at = CURRENT_TIMESTAMP
        WHERE industry = ${insight[0].industry}
          AND created_at > ${insight[0].createdAt}
          AND created_at < NOW()
      `);
    }
  } catch (e: any) {
    console.warn("[Learning] Signal satisfied error:", e?.message);
  }
}

// ─── Insight Logging ─────────────────────────────────────────────────────────

export async function logGenerationInsight(data: {
  userId?: string;
  projectId?: number;
  industry: string;
  language: string;
  prompt: string;
  spec: WebsiteContentSpec;
  primaryColor?: string;
  accentColor?: string;
  generationMs: number;
}): Promise<number | null> {
  try {
    const [row] = await db
      .insert(generationInsights)
      .values({
        userId: data.userId,
        projectId: data.projectId,
        industry: data.industry,
        language: data.language,
        prompt: data.prompt.slice(0, 500),
        specJson: data.spec as any,
        primaryColor: data.primaryColor,
        accentColor: data.accentColor,
        generationMs: data.generationMs,
        qualityScore: 50,
      })
      .returning({ id: generationInsights.id });
    return row?.id ?? null;
  } catch (e: any) {
    console.warn("[Learning] Insight log error:", e?.message);
    return null;
  }
}

// ─── Fetch Industry Insights ──────────────────────────────────────────────────

/**
 * Fetch top-rated patterns for a given industry to inject into AI prompts.
 * Returns the best examples learned from past successful generations.
 */
export async function getIndustryInsights(
  industry: string,
  lang: "ar" | "en" = "ar",
  limit = 6
): Promise<IndustryInsights> {
  const base: IndustryInsights = {
    industry,
    taglines: [],
    serviceTitles: [],
    ctaTexts: [],
    aboutOpenings: [],
    faqQuestions: [],
    totalPatterns: 0,
  };

  try {
    const rows = await db
      .select()
      .from(industryPatterns)
      .where(
        and(
          eq(industryPatterns.industry, industry),
          gte(industryPatterns.qualityScore, 40),
          eq(industryPatterns.language, lang)
        )
      )
      .orderBy(desc(industryPatterns.qualityScore), desc(industryPatterns.usageCount))
      .limit(limit * 5);

    base.totalPatterns = rows.length;

    for (const r of rows) {
      switch (r.patternType as PatternType) {
        case "tagline":
          if (base.taglines.length < limit) base.taglines.push(r.content);
          break;
        case "service_title":
          if (base.serviceTitles.length < limit * 2) base.serviceTitles.push(r.content);
          break;
        case "cta_text":
          if (base.ctaTexts.length < limit) base.ctaTexts.push(r.content);
          break;
        case "about_opening":
          if (base.aboutOpenings.length < 3) base.aboutOpenings.push(r.content);
          break;
        case "faq_question":
          if (base.faqQuestions.length < limit) base.faqQuestions.push(r.content);
          break;
      }
    }
  } catch (e: any) {
    console.warn("[Learning] Fetch insights error:", e?.message);
  }

  return base;
}

/**
 * Format industry insights into a prompt section to inject into the AI content spec prompt.
 * The AI uses these examples as inspiration — producing more grounded, industry-specific content.
 */
export function buildInsightsPromptSection(insights: IndustryInsights): string {
  if (insights.totalPatterns === 0) return "";

  const lines: string[] = [
    `\n[LEARNING SYSTEM — ${insights.totalPatterns} patterns learned for "${insights.industry}" industry]`,
    `The following examples come from past successful generations for this industry.`,
    `Use them as inspiration — adapt, don't copy verbatim:\n`,
  ];

  if (insights.taglines.length > 0) {
    lines.push(`PROVEN TAGLINES for this industry:`);
    insights.taglines.forEach((t, i) => lines.push(`  ${i + 1}. "${t}"`));
    lines.push("");
  }

  if (insights.serviceTitles.length > 0) {
    lines.push(`PROVEN SERVICE NAMES for this industry:`);
    insights.serviceTitles.slice(0, 8).forEach((s, i) => lines.push(`  ${i + 1}. ${s}`));
    lines.push("");
  }

  if (insights.ctaTexts.length > 0) {
    lines.push(`PROVEN CTA TEXTS for this industry:`);
    insights.ctaTexts.forEach((c, i) => lines.push(`  ${i + 1}. "${c}"`));
    lines.push("");
  }

  if (insights.faqQuestions.length > 0) {
    lines.push(`FREQUENTLY ASKED QUESTIONS customers have in this industry:`);
    insights.faqQuestions.forEach((q, i) => lines.push(`  ${i + 1}. "${q}"`));
    lines.push("");
  }

  lines.push(`INSTRUCTION: Generate content that matches or surpasses the quality above. Be specific and creative.\n`);

  return lines.join("\n");
}

// ─── Admin Stats ──────────────────────────────────────────────────────────────

export async function getLearningStats(): Promise<{
  totalPatterns: number;
  totalInsights: number;
  topIndustries: Array<{ industry: string; count: number; avgQuality: number }>;
  recentHighQuality: Array<{ industry: string; type: string; content: string; score: number }>;
  qualityDistribution: { excellent: number; good: number; neutral: number; poor: number };
}> {
  try {
    const [patternCount] = await db.execute(sql`SELECT COUNT(*) as n FROM industry_patterns`) as any;
    const [insightCount] = await db.execute(sql`SELECT COUNT(*) as n FROM generation_insights`) as any;

    const topIndustriesRows = await db.execute(sql`
      SELECT industry,
             COUNT(*) as count,
             ROUND(AVG(quality_score)) as avg_quality
      FROM industry_patterns
      GROUP BY industry
      ORDER BY count DESC
      LIMIT 10
    `) as any;

    const recentHighRows = await db.execute(sql`
      SELECT industry, pattern_type as type, content, quality_score as score
      FROM industry_patterns
      WHERE quality_score >= 70
      ORDER BY updated_at DESC
      LIMIT 15
    `) as any;

    const qualityRows = await db.execute(sql`
      SELECT
        SUM(CASE WHEN quality_score >= 85 THEN 1 ELSE 0 END) as excellent,
        SUM(CASE WHEN quality_score >= 60 AND quality_score < 85 THEN 1 ELSE 0 END) as good,
        SUM(CASE WHEN quality_score >= 40 AND quality_score < 60 THEN 1 ELSE 0 END) as neutral,
        SUM(CASE WHEN quality_score < 40 THEN 1 ELSE 0 END) as poor
      FROM industry_patterns
    `) as any;

    const qd = qualityRows[0] || {};

    return {
      totalPatterns: parseInt(patternCount[0]?.n || "0"),
      totalInsights: parseInt(insightCount[0]?.n || "0"),
      topIndustries: (topIndustriesRows as any[]).map((r: any) => ({
        industry: r.industry,
        count: parseInt(r.count),
        avgQuality: parseInt(r.avg_quality),
      })),
      recentHighQuality: (recentHighRows as any[]).map((r: any) => ({
        industry: r.industry,
        type: r.type,
        content: r.content,
        score: parseInt(r.score),
      })),
      qualityDistribution: {
        excellent: parseInt(qd.excellent || "0"),
        good: parseInt(qd.good || "0"),
        neutral: parseInt(qd.neutral || "0"),
        poor: parseInt(qd.poor || "0"),
      },
    };
  } catch (e: any) {
    console.error("[Learning] Stats error:", e?.message);
    return {
      totalPatterns: 0,
      totalInsights: 0,
      topIndustries: [],
      recentHighQuality: [],
      qualityDistribution: { excellent: 0, good: 0, neutral: 0, poor: 0 },
    };
  }
}

export async function getPatternsByIndustry(industry: string, limit = 50) {
  try {
    return await db
      .select()
      .from(industryPatterns)
      .where(eq(industryPatterns.industry, industry))
      .orderBy(desc(industryPatterns.qualityScore), desc(industryPatterns.usageCount))
      .limit(limit);
  } catch {
    return [];
  }
}
