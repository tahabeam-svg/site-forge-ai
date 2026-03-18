import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useSEO } from "@/hooks/use-seo";
import { BLOG_POSTS } from "@/data/blog-posts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, Calendar, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import BrandName from "@/components/brand-name";

export default function BlogPostPage() {
  const { language } = useAuth();
  const isAr = language !== "en";
  const [, navigate] = useLocation();
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";

  const post = BLOG_POSTS.find(p => p.slug === slug);
  const related = BLOG_POSTS.filter(p => p.slug !== slug && p.category === post?.category).slice(0, 3);

  useSEO({
    title: post ? (isAr ? post.titleAr : post.titleEn) : "مقال غير موجود",
    description: post ? (isAr ? post.excerptAr : post.excerptEn) : "",
    keywords: post?.keywords.join("، ") || "",
    canonical: `https://arabyweb.net/blog/${slug}`,
    lang: isAr ? "ar" : "en",
    structuredData: post ? {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": isAr ? post.titleAr : post.titleEn,
      "description": isAr ? post.excerptAr : post.excerptEn,
      "url": `https://arabyweb.net/blog/${post.slug}`,
      "datePublished": post.publishedAt,
      "dateModified": post.publishedAt,
      "author": {
        "@type": "Organization",
        "name": "ArabyWeb.net",
        "url": "https://arabyweb.net"
      },
      "publisher": {
        "@type": "Organization",
        "name": "ArabyWeb.net",
        "logo": { "@type": "ImageObject", "url": "https://arabyweb.net/logo.png" }
      },
      "mainEntityOfPage": { "@type": "WebPage", "@id": `https://arabyweb.net/blog/${post.slug}` },
      "keywords": post.keywords.join(", "),
      "articleSection": isAr ? post.categoryAr : post.category,
    } : {}
  });

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" dir={isAr ? "rtl" : "ltr"}>
        <h1 className="text-2xl font-bold mb-4">{isAr ? "المقال غير موجود" : "Article not found"}</h1>
        <Button onClick={() => navigate("/blog")}>{isAr ? "العودة للمدونة" : "Back to Blog"}</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center">
            <BrandName lang={isAr ? "ar" : "en"} className="text-sm" logoSize={36} />
          </a>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/blog")}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              {isAr ? "المدونة" : "Blog"}
            </button>
            <Button size="sm" onClick={() => navigate("/auth")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isAr ? "ابدأ مجاناً" : "Start Free"}
            </Button>
          </div>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="breadcrumb">
          <a href="/" className="hover:text-foreground">ArabyWeb</a>
          <span>/</span>
          <a href="/blog" className="hover:text-foreground">{isAr ? "المدونة" : "Blog"}</a>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{isAr ? post.titleAr : post.titleEn}</span>
        </nav>

        {/* Category & Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            {isAr ? post.categoryAr : post.category}
          </Badge>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(post.publishedAt).toLocaleDateString(isAr ? "ar-SA" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            {post.readingTime} {isAr ? "دقائق قراءة" : "min read"}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-6">
          {isAr ? post.titleAr : post.titleEn}
        </h1>

        {/* Excerpt highlight */}
        <div className="border-r-4 border-emerald-500 pr-4 mb-8 text-muted-foreground italic text-lg leading-relaxed">
          {isAr ? post.excerptAr : post.excerptEn}
        </div>

        {/* Content */}
        <div
          className="prose prose-slate dark:prose-invert max-w-none
            prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4
            prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
            prose-p:leading-relaxed prose-p:mb-4
            prose-ul:my-4 prose-li:mb-1
            prose-table:text-sm prose-th:bg-muted prose-th:p-2 prose-td:p-2 prose-td:border prose-th:border
            prose-strong:text-foreground"
          dangerouslySetInnerHTML={{ __html: isAr ? post.contentAr : post.contentEn }}
        />

        {/* Keywords */}
        <div className="mt-10 pt-6 border-t">
          <p className="text-sm text-muted-foreground mb-2">{isAr ? "الكلمات المفتاحية:" : "Keywords:"}</p>
          <div className="flex flex-wrap gap-2">
            {post.keywords.map(kw => (
              <span key={kw} className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* CTA Box */}
        <div className="mt-10 p-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl text-white text-center">
          <h3 className="text-xl font-bold mb-2">
            {isAr ? "جرّب ArabyWeb مجاناً اليوم" : "Try ArabyWeb Free Today"}
          </h3>
          <p className="opacity-90 mb-4 text-sm">
            {isAr
              ? "أنشئ موقعك الاحترافي بالذكاء الاصطناعي في أقل من دقيقتين — بدون برمجة"
              : "Create your professional website with AI in under 2 minutes — no coding needed"}
          </p>
          <Button variant="secondary" size="lg" onClick={() => navigate("/auth")}
            className="font-bold" data-testid="btn-post-cta">
            {isAr ? "ابدأ مجاناً ←" : "Start Free →"}
          </Button>
        </div>
      </article>

      {/* Related Articles */}
      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <h2 className="text-xl font-bold mb-6 text-center">
            {isAr ? "مقالات ذات صلة" : "Related Articles"}
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {related.map(p => (
              <Card
                key={p.slug}
                className="p-4 cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all"
                onClick={() => navigate(`/blog/${p.slug}`)}
              >
                <Badge variant="secondary" className="mb-2 text-xs">{isAr ? p.categoryAr : p.category}</Badge>
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{isAr ? p.titleAr : p.titleEn}</h3>
                <span className="text-emerald-600 text-xs flex items-center gap-1">
                  {isAr ? "اقرأ المزيد" : "Read more"}
                  {isAr ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </span>
              </Card>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4">
          <p>© 2026 ArabyWeb.net · <a href="/privacy" className="hover:text-foreground">سياسة الخصوصية</a> · <a href="/terms" className="hover:text-foreground">الشروط</a></p>
        </div>
      </footer>
    </div>
  );
}
