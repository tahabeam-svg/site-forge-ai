import { db } from "./db";
import { sql, eq } from "drizzle-orm";
import { templates, platformSettings } from "@shared/schema";
import { generateFullTemplate } from "./template-generator";
import { allCategories, gradients, accents, commonTestimonials } from "./seed-data";

export async function seedDatabase() {
  try {
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 5`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR DEFAULT 'free'`);
    await db.execute(sql`UPDATE users SET credits = 5 WHERE credits IS NULL`);
    await db.execute(sql`UPDATE users SET plan = 'free' WHERE plan IS NULL`);
    console.log("Migration: credits & plan columns ensured");
  } catch (e: any) {
    console.error("Migration warning:", e.message);
  }

  // Anti-fraud & admin columns
  try {
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS registration_ip VARCHAR`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS suspend_reason VARCHAR`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS github_token VARCHAR`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS github_username VARCHAR`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`);
    console.log("Migration: anti-fraud & profile columns ensured");
  } catch (e: any) {
    console.error("Migration warning (anti-fraud):", e.message);
  }

  // Migrate pricing to new values: Pro 9900 halalas (99 SAR), Business 19900 halalas (199 SAR)
  try {
    await db.execute(sql`
      INSERT INTO platform_settings (key, value) VALUES ('price_pro', '9900')
      ON CONFLICT (key) DO UPDATE SET value = '9900'
      WHERE platform_settings.value IN ('4900', '4500', '3900')
    `);
    await db.execute(sql`
      INSERT INTO platform_settings (key, value) VALUES ('price_business', '19900')
      ON CONFLICT (key) DO UPDATE SET value = '19900'
      WHERE platform_settings.value IN ('9900', '8900', '7900')
    `);
    console.log("Migration: pricing updated to Pro=99 SAR, Business=199 SAR");
  } catch (e: any) {
    console.error("Pricing migration warning:", e.message);
  }

  // Ensure session table exists (connect-pg-simple)
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid") DEFERRABLE INITIALLY IMMEDIATE
      ) WITH (OIDS=FALSE)
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire")`);
    console.log("Migration: session table ensured");
  } catch (e: any) {
    console.error("Session table warning:", e.message);
  }

  // Ensure all chatbot & platform tables exist
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS visitor_questions (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        detected_language TEXT DEFAULT 'ar',
        detected_dialect TEXT DEFAULT 'msa',
        ai_response TEXT,
        session_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS auto_learned_knowledge (
        id SERIAL PRIMARY KEY,
        question_pattern TEXT NOT NULL,
        answer TEXT NOT NULL,
        usage_count INTEGER DEFAULT 1,
        language TEXT DEFAULT 'ar',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS knowledge_base (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        language TEXT DEFAULT 'ar',
        is_approved BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS chatbot_conversations (
        id SERIAL PRIMARY KEY,
        session_id TEXT NOT NULL,
        user_id TEXT,
        detected_language TEXT DEFAULT 'ar',
        detected_dialect TEXT DEFAULT 'msa',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS chatbot_messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT,
        business_type TEXT,
        session_id TEXT,
        source TEXT DEFAULT 'chatbot',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        discount_type TEXT NOT NULL,
        discount_value INTEGER NOT NULL,
        max_uses INTEGER DEFAULT 0,
        used_count INTEGER DEFAULT 0,
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        plan VARCHAR NOT NULL DEFAULT 'free',
        status VARCHAR NOT NULL DEFAULT 'active',
        paymob_order_id VARCHAR,
        paymob_transaction_id VARCHAR,
        amount_cents INTEGER,
        currency VARCHAR DEFAULT 'SAR',
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS platform_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR NOT NULL UNIQUE,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("Migration: all platform tables ensured");
  } catch (e: any) {
    console.error("Platform tables migration warning:", e.message);
  }

  // Credit purchases table
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS credit_purchases (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        credits INTEGER NOT NULL,
        amount_cents INTEGER NOT NULL,
        currency VARCHAR DEFAULT 'SAR',
        status VARCHAR NOT NULL DEFAULT 'pending',
        paymob_order_id VARCHAR,
        paymob_transaction_id VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("Migration: credit_purchases table ensured");
  } catch (e: any) {
    console.error("Credit purchases migration warning:", e.message);
  }

  // Projects table column migrations
  try {
    await db.execute(sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0`);
    await db.execute(sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS website_language VARCHAR DEFAULT 'ar'`);
    await db.execute(sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS color_palette JSONB`);
    await db.execute(sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS sections JSONB`);
    await db.execute(sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS seo_title TEXT`);
    await db.execute(sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS seo_description TEXT`);
    await db.execute(sql`UPDATE projects SET edit_count = 0 WHERE edit_count IS NULL`);
    console.log("Migration: projects table columns ensured");
  } catch (e: any) {
    console.error("Projects migration warning:", e.message);
  }

  // Template versioning — bump TEMPLATE_VERSION to force regeneration
  const TEMPLATE_VERSION = "v3-gulf-avatars";
  try {
    const [versionRow] = await db.select().from(platformSettings).where(eq(platformSettings.key, "template_version"));
    const currentVersion = versionRow?.value ?? null;
    if (currentVersion === TEMPLATE_VERSION) {
      const [firstTemplate] = await db.select({ id: templates.id }).from(templates).limit(1);
      if (firstTemplate) {
        console.log("Templates already at version:", TEMPLATE_VERSION);
        return;
      }
    } else {
      // Clear old templates for regeneration
      await db.delete(templates);
      console.log("Templates cleared for regeneration to version:", TEMPLATE_VERSION);
    }
  } catch {
    // If version check fails, check if templates exist
    const [firstTemplate] = await db.select({ id: templates.id }).from(templates).limit(1);
    if (firstTemplate) return;
  }

  const allTemplates: any[] = [];

  for (const cat of allCategories) {
    for (let i = 0; i < 20; i++) {
      const name = cat.names[i];
      const desc = cat.descriptions[i];
      const gradient = gradients[i % gradients.length];
      const accent = accents[i % accents.length];
      const imageId = cat.heroImages[i % cat.heroImages.length];
      const isPremium = i >= 5;
      const serviceSet = cat.services[i % cat.services.length];
      const testimonialSet = [
        cat.testimonials[(i * 2) % cat.testimonials.length],
        cat.testimonials[(i * 2 + 1) % cat.testimonials.length],
        cat.testimonials[(i * 2 + 2) % cat.testimonials.length],
      ];
      const gallerySet = cat.galleryImages.map((img, j) =>
        cat.galleryImages[(j + i) % cat.galleryImages.length]
      );

      const html = generateFullTemplate({
        heroTitle: cat.heroTitles[i],
        heroSubtitle: cat.heroSubtitles[i],
        ctaText: cat.ctaTexts[i],
        services: serviceSet,
        testimonials: testimonialSet,
        galleryImages: gallerySet,
        heroImageId: imageId,
        gradient,
        accent: accent.color,
        accentDark: accent.dark,
        variant: i,
      });

      allTemplates.push({
        name: name.en,
        nameAr: name.ar,
        description: desc.en,
        descriptionAr: desc.ar,
        category: cat.key,
        thumbnail: `https://images.unsplash.com/${imageId}?w=400&h=300&fit=crop`,
        isPremium,
        previewHtml: html,
        previewCss: "",
      });
    }
  }

  for (let i = 0; i < allTemplates.length; i += 50) {
    const batch = allTemplates.slice(i, i + 50);
    await db.insert(templates).values(batch);
  }

  // Save template version
  await db.insert(platformSettings)
    .values({ key: "template_version", value: TEMPLATE_VERSION })
    .onConflictDoUpdate({ target: platformSettings.key, set: { value: TEMPLATE_VERSION } });

  console.log(`Database seeded with ${allTemplates.length} templates across ${allCategories.length} categories (${TEMPLATE_VERSION})`);
}
