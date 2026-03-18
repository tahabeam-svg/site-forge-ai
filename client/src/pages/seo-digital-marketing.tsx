import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useSEO } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Megaphone, TrendingUp, Hash, Target, Zap, Star, ChevronLeft,
  Globe2, Users, MessageCircle, Sparkles, BarChart3, Rocket
} from "lucide-react";
import BrandName from "@/components/brand-name";
import { motion } from "framer-motion";

const FAQ_ITEMS = [
  {
    q: "ما هو التسويق الرقمي بالذكاء الاصطناعي؟",
    a: "هو استخدام تقنيات الذكاء الاصطناعي لإنشاء محتوى تسويقي تلقائي لمنصات التواصل الاجتماعي مثل إنستغرام وتيك توك وتويتر، موجه لجمهورك المستهدف."
  },
  {
    q: "هل التسويق الرقمي بالذكاء الاصطناعي مجاني؟",
    a: "نعم، يمكنك البدء مجاناً مع 5 جلسات لتوليد محتوى تسويقي احترافي لمشروعك."
  },
  {
    q: "كيف يفهم الذكاء الاصطناعي طبيعة مشروعي؟",
    a: "تصف مشروعك بالعربية والذكاء الاصطناعي يحلل نوع النشاط والجمهور المستهدف ليولّد محتوى مخصصاً ودقيقاً."
  },
  {
    q: "ما المنصات التي يدعمها الذكاء الاصطناعي؟",
    a: "يدعم إنستغرام، تيك توك، تويتر/إكس، لينكدإن، وسناب شات. لكل منصة نمط محتوى مختلف ومحسّن."
  },
  {
    q: "هل المحتوى المولّد باللغة العربية؟",
    a: "نعم، الذكاء الاصطناعي يولّد محتوى عربياً أصيلاً يراعي الثقافة المحلية واللهجة السعودية والخليجية."
  },
];

const MARKETING_FEATURES = [
  { icon: Hash, title: "هاشتاقات ذكية", desc: "هاشتاقات مستهدفة لزيادة الوصول في كل منصة" },
  { icon: Target, title: "استهداف دقيق", desc: "محتوى موجّه لجمهورك المحلي في السعودية والخليج" },
  { icon: Zap, title: "توليد فوري", desc: "10 منشورات جاهزة في دقيقة واحدة" },
  { icon: Globe2, title: "متعدد المنصات", desc: "إنستغرام، تيك توك، تويتر، لينكدإن" },
  { icon: Users, title: "محتوى أصيل", desc: "كتابة عربية طبيعية تناسب ثقافتك" },
  { icon: BarChart3, title: "محتوى محوّل", desc: "مصمم لزيادة التفاعل والمبيعات" },
];

export default function SeoDigitalMarketingPage() {
  const { language } = useAuth();
  const isAr = language !== "en";
  const [, navigate] = useLocation();

  useSEO({
    title: "تسويق رقمي بالذكاء الاصطناعي مجاناً — ArabyWeb",
    description: "أنشئ محتوى تسويقياً احترافياً لإنستغرام وتيك توك وتويتر بالذكاء الاصطناعي. تسويق مجاني للمشاريع الصغيرة في السعودية والخليج.",
    keywords: "تسويق رقمي مجاني, تسويق بالذكاء الاصطناعي, محتوى سوشيال ميديا, تسويق انستغرام, تسويق تيك توك, تسويق الكتروني",
    canonical: "https://arabyweb.net/digital-marketing-ai",
    lang: "ar",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "التسويق الرقمي بالذكاء الاصطناعي — ArabyWeb",
      "url": "https://arabyweb.net/digital-marketing-ai",
      "description": "منصة التسويق الرقمي بالذكاء الاصطناعي للمشاريع العربية",
      "publisher": { "@type": "Organization", "name": "ArabyWeb.net", "url": "https://arabyweb.net" },
      "mainEntity": {
        "@type": "FAQPage",
        "mainEntity": FAQ_ITEMS.map(item => ({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": { "@type": "Answer", "text": item.a }
        }))
      }
    }
  });

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/"><BrandName lang="ar" className="text-sm" logoSize={36} /></a>
          <div className="flex items-center gap-3">
            <a href="/ai-website-builder" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">بناء المواقع</a>
            <a href="/blog" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">المدونة</a>
            <Button size="sm" onClick={() => navigate("/auth")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white">
              ابدأ مجاناً
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-900 text-white py-20 md:py-28">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #8b5cf6 0%, transparent 50%), radial-gradient(circle at 70% 20%, #06b6d4 0%, transparent 50%)" }} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <Badge className="mb-6 bg-violet-500/20 text-violet-300 border-violet-500/40 text-sm px-4 py-1.5">
            <Megaphone className="w-3.5 h-3.5 ml-1" />
            تسويق رقمي بالذكاء الاصطناعي
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            سوّق مشروعك <span className="text-violet-400">مجاناً</span><br />
            بقوة <span className="text-cyan-400">الذكاء الاصطناعي</span>
          </h1>
          <p className="text-xl text-violet-100/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            أنشئ منشورات إنستغرام وتيك توك وتويتر احترافية في ثوانٍ. الذكاء الاصطناعي يكتب، أنت تنشر وتنمو.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}
              className="bg-violet-500 hover:bg-violet-400 text-white font-bold text-lg px-8"
              data-testid="btn-marketing-start">
              <Sparkles className="w-5 h-5 ml-2" />
              ابدأ التسويق مجاناً
            </Button>
            <Button size="lg" variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => navigate("/blog")}>
              اقرأ مقالات التسويق
            </Button>
          </div>
          <p className="mt-5 text-sm text-violet-300/70">✓ مجاني · ✓ عربي أصيل · ✓ لجميع المنصات</p>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-16 bg-white dark:bg-background border-b">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">يعمل مع منصاتك المفضلة</h2>
          <p className="text-muted-foreground mb-10">محتوى مخصص لكل منصة بأسلوبها ومتطلباتها</p>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { name: "إنستغرام", emoji: "📸", color: "from-pink-500 to-rose-500" },
              { name: "تيك توك", emoji: "🎵", color: "from-gray-900 to-gray-700" },
              { name: "تويتر/إكس", emoji: "🐦", color: "from-gray-800 to-gray-600" },
              { name: "لينكدإن", emoji: "💼", color: "from-blue-600 to-blue-700" },
              { name: "سناب شات", emoji: "👻", color: "from-yellow-400 to-amber-500" },
            ].map((p, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className={`w-28 h-28 rounded-2xl bg-gradient-to-br ${p.color} flex flex-col items-center justify-center text-white gap-2 shadow-lg`}>
                <span className="text-3xl">{p.emoji}</span>
                <span className="text-xs font-medium">{p.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 dark:bg-muted/10">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">مميزات أداة التسويق الذكي</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MARKETING_FEATURES.map((f, i) => (
              <Card key={i} className="p-5 hover:shadow-md hover:border-violet-300 transition-all">
                <f.icon className="w-8 h-8 text-violet-600 mb-3" />
                <h3 className="font-bold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Content Types */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">أنواع المحتوى الذي يولّده الذكاء الاصطناعي</h2>
          <div className="space-y-4">
            {[
              { title: "منشورات ترويجية", desc: "نصوص إعلانية جذابة لمنتجاتك وخدماتك مع الهاشتاقات المناسبة" },
              { title: "محتوى تعليمي", desc: "نصائح ومعلومات مفيدة تبني مصداقيتك أمام جمهورك" },
              { title: "قصص نجاح", desc: "كيفية تحويل تجارب عملائك إلى محتوى تسويقي قوي" },
              { title: "إعلانات العروض", desc: "نصوص مقنعة لإعلانات الخصومات والمناسبات" },
              { title: "سكريبتات الفيديو", desc: "نصوص فيديوهات تيك توك وريلز جاهزة للتصوير" },
              { title: "تغريدات خيطية", desc: "سلاسل تغريدات طويلة تشرح خدماتك بتفصيل" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 border rounded-xl hover:border-violet-300 transition-colors">
                <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 font-bold flex-shrink-0 text-sm">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "+1,200", label: "مشروع تسويقي" },
              { value: "+10,000", label: "منشور مولّد" },
              { value: "3 ث", label: "لتوليد منشور" },
              { value: "98%", label: "رضا العملاء" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-violet-600 mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">الأسئلة الشائعة</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <details key={i} className="group border rounded-xl bg-gray-50 dark:bg-muted/10 overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-medium list-none">
                  <span>{item.q}</span>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t pt-4">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">سوّق مشروعك باحترافية — مجاناً</h2>
          <p className="text-xl opacity-90 mb-8">محتوى تسويقي عربي احترافي في ثوانٍ</p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/auth")}
            className="font-bold text-lg px-10" data-testid="btn-marketing-cta">
            ابدأ التسويق مجاناً ←
          </Button>
        </div>
      </section>

      {/* Internal Links */}
      <section className="py-10 bg-white dark:bg-background border-t">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: "/ai-website-builder", label: "إنشاء موقع بالذكاء الاصطناعي" },
              { href: "/free-website", label: "موقع مجاني" },
              { href: "/free-store", label: "متجر مجاني" },
              { href: "/website-saudi-arabia", label: "مواقع للشركات السعودية" },
              { href: "/blog", label: "مقالات التسويق" },
              { href: "/faq", label: "الأسئلة الشائعة" },
            ].map(link => (
              <a key={link.href} href={link.href}
                className="px-4 py-2 border rounded-full text-sm hover:border-violet-400 hover:text-violet-600 transition-colors">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 ArabyWeb.net · <a href="/privacy" className="hover:text-foreground">سياسة الخصوصية</a> · <a href="/terms" className="hover:text-foreground">الشروط</a></p>
      </footer>
    </div>
  );
}
