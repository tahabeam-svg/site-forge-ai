import { db } from "./db";
import { templates } from "@shared/schema";
import { generateFullTemplate } from "./template-generator";
import { allCategories, gradients, accents } from "./seed-data";

export async function seedDatabase() {
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
