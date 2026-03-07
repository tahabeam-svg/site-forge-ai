import { db } from "./db";
import { templates } from "@shared/schema";

export async function seedDatabase() {
  const existing = await db.select().from(templates);
  if (existing.length > 0) return;

  await db.insert(templates).values([
    {
      name: "Corporate Pro",
      nameAr: "الشركات المحترف",
      description: "Clean, professional template for corporate businesses and enterprises",
      descriptionAr: "قالب نظيف واحترافي للشركات والمؤسسات",
      category: "corporate",
      thumbnail: "/templates/corporate.svg",
      isPremium: false,
      previewHtml: `<div style="font-family: Inter, sans-serif; max-width: 1200px; margin: 0 auto;">
        <header style="padding: 4rem 2rem; text-align: center; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; border-radius: 0.5rem;">
          <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">Your Company Name</h1>
          <p style="opacity: 0.8; font-size: 1.1rem;">Professional solutions for your business needs</p>
        </header>
        <section style="padding: 3rem 2rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;">
          <div style="padding: 2rem; background: #f8f9fa; border-radius: 0.5rem; text-align: center;">
            <h3>Consulting</h3><p style="color: #666;">Expert advice for growth</p>
          </div>
          <div style="padding: 2rem; background: #f8f9fa; border-radius: 0.5rem; text-align: center;">
            <h3>Strategy</h3><p style="color: #666;">Strategic planning solutions</p>
          </div>
          <div style="padding: 2rem; background: #f8f9fa; border-radius: 0.5rem; text-align: center;">
            <h3>Innovation</h3><p style="color: #666;">Innovative technology</p>
          </div>
        </section>
      </div>`,
      previewCss: "* { margin: 0; padding: 0; box-sizing: border-box; }",
    },
    {
      name: "Exhibition Showcase",
      nameAr: "عرض المعارض",
      description: "Elegant template designed for exhibitions, events, and showcases",
      descriptionAr: "قالب أنيق مصمم للمعارض والفعاليات والعروض",
      category: "exhibition",
      thumbnail: "/templates/exhibition.svg",
      isPremium: false,
      previewHtml: `<div style="font-family: Inter, sans-serif; max-width: 1200px; margin: 0 auto;">
        <header style="padding: 5rem 2rem; text-align: center; background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%); color: white; border-radius: 0.5rem;">
          <h1 style="font-size: 3rem; margin-bottom: 1rem; letter-spacing: 0.1em;">EXHIBITION 2026</h1>
          <p style="font-size: 1.2rem; opacity: 0.8;">Discover Innovation & Excellence</p>
        </header>
        <section style="padding: 3rem 2rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem;">
          <div style="padding: 2rem; background: linear-gradient(135deg, #f093fb, #f5576c); border-radius: 0.5rem; color: white;">
            <h3>Featured Artists</h3><p>World-class creators</p>
          </div>
          <div style="padding: 2rem; background: linear-gradient(135deg, #4facfe, #00f2fe); border-radius: 0.5rem; color: white;">
            <h3>Live Events</h3><p>Interactive experiences</p>
          </div>
        </section>
      </div>`,
      previewCss: "* { margin: 0; padding: 0; box-sizing: border-box; }",
    },
    {
      name: "Restaurant Delight",
      nameAr: "مطعم فاخر",
      description: "Warm and inviting template for restaurants, cafes, and food businesses",
      descriptionAr: "قالب دافئ وجذاب للمطاعم والمقاهي",
      category: "restaurant",
      thumbnail: "/templates/restaurant.svg",
      isPremium: false,
      previewHtml: `<div style="font-family: Inter, sans-serif; max-width: 1200px; margin: 0 auto;">
        <header style="padding: 5rem 2rem; text-align: center; background: linear-gradient(135deg, #3c1053 0%, #ad5389 100%); color: white; border-radius: 0.5rem;">
          <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">La Maison</h1>
          <p style="font-size: 1.1rem; opacity: 0.9;">Fine Dining Experience</p>
        </header>
        <section style="padding: 3rem 2rem; text-align: center;">
          <h2 style="margin-bottom: 2rem;">Our Menu</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
            <div style="padding: 1.5rem; border: 1px solid #eee; border-radius: 0.5rem;">
              <h4>Appetizers</h4><p style="color: #666;">From $12</p>
            </div>
            <div style="padding: 1.5rem; border: 1px solid #eee; border-radius: 0.5rem;">
              <h4>Main Course</h4><p style="color: #666;">From $24</p>
            </div>
            <div style="padding: 1.5rem; border: 1px solid #eee; border-radius: 0.5rem;">
              <h4>Desserts</h4><p style="color: #666;">From $8</p>
            </div>
          </div>
        </section>
      </div>`,
      previewCss: "* { margin: 0; padding: 0; box-sizing: border-box; }",
    },
    {
      name: "Startup Launch",
      nameAr: "إطلاق شركة ناشئة",
      description: "Bold and modern template for startups, SaaS products, and tech companies",
      descriptionAr: "قالب جريء وحديث للشركات الناشئة ومنتجات SaaS",
      category: "startup",
      thumbnail: "/templates/startup.svg",
      isPremium: true,
      previewHtml: `<div style="font-family: Inter, sans-serif; max-width: 1200px; margin: 0 auto;">
        <header style="padding: 5rem 2rem; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 0.5rem;">
          <h1 style="font-size: 3rem; margin-bottom: 1rem;">Launch Your Vision</h1>
          <p style="font-size: 1.2rem; opacity: 0.9; margin-bottom: 2rem;">The platform that scales with you</p>
          <div style="display: inline-block; padding: 0.75rem 2rem; background: white; color: #667eea; border-radius: 2rem; font-weight: 600;">Get Started Free</div>
        </header>
        <section style="padding: 3rem 2rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;">
          <div style="padding: 2rem; text-align: center;"><h3 style="color: #667eea;">10x</h3><p>Faster Development</p></div>
          <div style="padding: 2rem; text-align: center;"><h3 style="color: #667eea;">99.9%</h3><p>Uptime Guaranteed</p></div>
          <div style="padding: 2rem; text-align: center;"><h3 style="color: #667eea;">24/7</h3><p>Support Available</p></div>
        </section>
      </div>`,
      previewCss: "* { margin: 0; padding: 0; box-sizing: border-box; }",
    },
    {
      name: "Creative Portfolio",
      nameAr: "معرض إبداعي",
      description: "Stunning portfolio template for designers, photographers, and creatives",
      descriptionAr: "قالب محفظة مذهل للمصممين والمصورين والمبدعين",
      category: "portfolio",
      thumbnail: "/templates/portfolio.svg",
      isPremium: true,
      previewHtml: `<div style="font-family: Inter, sans-serif; max-width: 1200px; margin: 0 auto;">
        <header style="padding: 5rem 2rem; text-align: center; background: #111; color: white; border-radius: 0.5rem;">
          <h1 style="font-size: 3rem; margin-bottom: 1rem; font-weight: 300;">John Smith</h1>
          <p style="font-size: 1.2rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.2em;">Creative Director</p>
        </header>
        <section style="padding: 3rem 2rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
          <div style="aspect-ratio: 1; background: linear-gradient(135deg, #f093fb, #f5576c); border-radius: 0.25rem;"></div>
          <div style="aspect-ratio: 1; background: linear-gradient(135deg, #4facfe, #00f2fe); border-radius: 0.25rem;"></div>
          <div style="aspect-ratio: 1; background: linear-gradient(135deg, #43e97b, #38f9d7); border-radius: 0.25rem;"></div>
          <div style="aspect-ratio: 1; background: linear-gradient(135deg, #fa709a, #fee140); border-radius: 0.25rem;"></div>
          <div style="aspect-ratio: 1; background: linear-gradient(135deg, #a18cd1, #fbc2eb); border-radius: 0.25rem;"></div>
          <div style="aspect-ratio: 1; background: linear-gradient(135deg, #ffecd2, #fcb69f); border-radius: 0.25rem;"></div>
        </section>
      </div>`,
      previewCss: "* { margin: 0; padding: 0; box-sizing: border-box; }",
    },
    {
      name: "Landing Page Pro",
      nameAr: "صفحة هبوط احترافية",
      description: "High-converting landing page template for marketing campaigns and products",
      descriptionAr: "قالب صفحة هبوط عالي التحويل لحملات التسويق",
      category: "landing",
      thumbnail: "/templates/landing.svg",
      isPremium: false,
      previewHtml: `<div style="font-family: Inter, sans-serif; max-width: 1200px; margin: 0 auto;">
        <header style="padding: 5rem 2rem; text-align: center; background: linear-gradient(135deg, #0c0c1d 0%, #1a1a3e 100%); color: white; border-radius: 0.5rem;">
          <span style="display: inline-block; padding: 0.25rem 1rem; background: rgba(255,255,255,0.1); border-radius: 2rem; font-size: 0.85rem; margin-bottom: 1rem;">NEW RELEASE</span>
          <h1 style="font-size: 3rem; margin-bottom: 1rem;">Supercharge Your Growth</h1>
          <p style="font-size: 1.1rem; opacity: 0.8; max-width: 600px; margin: 0 auto 2rem;">The all-in-one platform to accelerate your business</p>
          <div style="display: flex; gap: 1rem; justify-content: center;">
            <span style="padding: 0.75rem 2rem; background: #667eea; color: white; border-radius: 0.5rem;">Start Free Trial</span>
            <span style="padding: 0.75rem 2rem; border: 1px solid rgba(255,255,255,0.3); color: white; border-radius: 0.5rem;">Watch Demo</span>
          </div>
        </header>
      </div>`,
      previewCss: "* { margin: 0; padding: 0; box-sizing: border-box; }",
    },
  ]);

  console.log("Database seeded with templates");
}
