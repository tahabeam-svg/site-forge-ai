import { db } from "./db";
import { sql } from "drizzle-orm";
import { templates } from "@shared/schema";
import { generateFullTemplate } from "./template-generator";
import { allCategories, gradients, accents } from "./seed-data";

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

  const existing = await db.select().from(templates);
  if (existing.length > 0) return;

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

  console.log(`Database seeded with ${allTemplates.length} templates across ${allCategories.length} categories`);
}
