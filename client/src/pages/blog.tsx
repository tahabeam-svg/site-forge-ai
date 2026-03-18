import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useSEO } from "@/hooks/use-seo";
import { BLOG_POSTS, BLOG_CATEGORIES } from "@/data/blog-posts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Clock, ChevronLeft, ChevronRight, Search, Rss } from "lucide-react";
import BrandName from "@/components/brand-name";

export default function BlogPage() {
  const { language } = useAuth();
  const isAr = language !== "en";
  const [, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useSEO({
    title: isAr
      ? "مدونة ArabyWeb — مقالات في بناء المواقع والتسويق الرقمي"
      : "ArabyWeb Blog — Articles on Website Building & Digital Marketing",
    description: isAr
      ? "اكتشف مقالات احترافية حول بناء المواقع بالذكاء الاصطناعي، التسويق الرقمي، SEO، والتجارة الإلكترونية في السعودية."
      : "Discover professional articles on AI website building, digital marketing, SEO, and e-commerce in Saudi Arabia.",
    keywords: isAr
      ? "مدونة, بناء مواقع, تسويق رقمي, ذكاء اصطناعي, SEO, تجارة الكترونية, سعودية"
      : "blog, website building, digital marketing, AI, SEO, ecommerce, Saudi Arabia",
    canonical: "https://arabyweb.net/blog",
    lang: isAr ? "ar" : "en",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "ArabyWeb Blog",
      "url": "https://arabyweb.net/blog",
      "description": "مقالات في بناء المواقع والتسويق الرقمي بالذكاء الاصطناعي",
      "publisher": {
        "@type": "Organization",
        "name": "ArabyWeb.net",
        "url": "https://arabyweb.net",
        "logo": { "@type": "ImageObject", "url": "https://arabyweb.net/logo.png" }
      },
      "blogPost": BLOG_POSTS.slice(0, 5).map(p => ({
        "@type": "BlogPosting",
        "headline": p.titleAr,
        "url": `https://arabyweb.net/blog/${p.slug}`,
        "datePublished": p.publishedAt,
        "description": p.excerptAr,
      }))
    }
  });

  const filtered = BLOG_POSTS.filter(post => {
    const matchCat = activeCategory === "all" || post.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || post.titleAr.includes(q) || post.titleEn.toLowerCase().includes(q) || post.excerptAr.includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center">
            <BrandName lang={isAr ? "ar" : "en"} className="text-sm" logoSize={36} />
          </a>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {isAr ? "الرئيسية" : "Home"}
            </a>
            <Button size="sm" onClick={() => navigate("/auth")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isAr ? "ابدأ مجاناً" : "Start Free"}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 py-16 border-b">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Rss className="w-5 h-5 text-emerald-600" />
            <span className="text-emerald-600 font-medium text-sm">
              {isAr ? "مدونة ArabyWeb" : "ArabyWeb Blog"}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {isAr
              ? "مقالات احترافية في بناء المواقع والتسويق الرقمي"
              : "Professional Articles on Website Building & Digital Marketing"}
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            {isAr
              ? "كل ما تحتاج معرفته لتنمية مشروعك الرقمي في السعودية والخليج"
              : "Everything you need to know to grow your digital business in Saudi Arabia"}
          </p>
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isAr ? "right-3" : "left-3"}`} />
            <input
              type="text"
              placeholder={isAr ? "ابحث في المقالات..." : "Search articles..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full border rounded-xl py-3 bg-white dark:bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isAr ? "pr-10 pl-4" : "pl-10 pr-4"}`}
              data-testid="input-blog-search"
            />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {BLOG_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              data-testid={`btn-category-${cat.id}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                activeCategory === cat.id
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white dark:bg-background border-border hover:border-emerald-400 text-muted-foreground hover:text-foreground"
              }`}
            >
              {isAr ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {isAr ? "لا توجد مقالات مطابقة للبحث" : "No articles match your search"}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="h-full flex flex-col hover:shadow-md transition-shadow cursor-pointer border hover:border-emerald-300 overflow-hidden"
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  data-testid={`card-blog-${post.slug}`}
                >
                  {/* Color top bar based on category */}
                  <div className={`h-1.5 w-full ${
                    post.category === "ai-websites" ? "bg-emerald-500" :
                    post.category === "digital-marketing" ? "bg-violet-500" :
                    post.category === "seo" ? "bg-amber-500" :
                    post.category === "ecommerce" ? "bg-blue-500" :
                    post.category === "design" ? "bg-pink-500" :
                    "bg-teal-500"
                  }`} />
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {isAr ? post.categoryAr : post.category}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {post.readingTime} {isAr ? "د" : "min"}
                      </span>
                    </div>
                    <h2 className="font-bold text-base mb-2 leading-snug line-clamp-2 flex-1">
                      {isAr ? post.titleAr : post.titleEn}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {isAr ? post.excerptAr : post.excerptEn}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t">
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.publishedAt).toLocaleDateString(isAr ? "ar-SA" : "en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                      <span className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                        {isAr ? "اقرأ المزيد" : "Read more"}
                        {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-10 text-white">
          <h2 className="text-2xl font-bold mb-3">
            {isAr ? "هل أنت مستعد لبناء موقعك؟" : "Ready to Build Your Website?"}
          </h2>
          <p className="mb-6 opacity-90">
            {isAr
              ? "انشئ موقعك الاحترافي مجاناً بالذكاء الاصطناعي في أقل من دقيقتين"
              : "Create your professional website for free with AI in under 2 minutes"}
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/auth")}
            className="font-bold" data-testid="btn-blog-cta">
            {isAr ? "ابدأ مجاناً الآن ←" : "Start Free Now →"}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 mt-4 text-center text-sm text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4">
          <p>© 2026 ArabyWeb.net · <a href="/privacy" className="hover:text-foreground">سياسة الخصوصية</a> · <a href="/terms" className="hover:text-foreground">الشروط</a></p>
        </div>
      </footer>
    </div>
  );
}
