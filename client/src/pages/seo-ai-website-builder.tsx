import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useSEO } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Sparkles, Zap, Globe2, Smartphone, Check, ChevronRight, ChevronLeft,
  Clock, Star, Shield, Headphones, Code, Palette, Rocket
} from "lucide-react";
import BrandName from "@/components/brand-name";
import { motion } from "framer-motion";

const FAQ_ITEMS = [
  {
    q: "هل يمكنني إنشاء موقع بالذكاء الاصطناعي مجاناً؟",
    a: "نعم تماماً. ArabyWeb يمنحك 5 جلسات ذكاء اصطناعي مجانية لإنشاء موقعك بدون أي تكلفة أو بطاقة ائتمان."
  },
  {
    q: "كم من الوقت يستغرق إنشاء الموقع؟",
    a: "أقل من دقيقتين. تكتب وصفاً لمشروعك والذكاء الاصطناعي يولّد موقعاً كاملاً فورياً."
  },
  {
    q: "هل أحتاج خبرة في البرمجة؟",
    a: "لا على الإطلاق. المنصة مصممة للجميع — فقط اكتب ما تريد وسيتولى الذكاء الاصطناعي الباقي."
  },
  {
    q: "هل الموقع يعمل على الجوال؟",
    a: "نعم، جميع المواقع المولّدة متوافقة بشكل كامل مع الهواتف الذكية والأجهزة اللوحية وأجهزة سطح المكتب."
  },
  {
    q: "هل يدعم الذكاء الاصطناعي اللغة العربية؟",
    a: "نعم، ArabyWeb مصمم خصيصاً للعربية مع دعم كامل للكتابة من اليمين لليسار (RTL)."
  },
  {
    q: "هل يمكنني تعديل الموقع بعد إنشائه؟",
    a: "بالطبع. يمكنك تعديل أي جزء بالمحرر الذكي — فقط أخبر الذكاء الاصطناعي بما تريد تغييره."
  },
];

const FEATURES = [
  { icon: Sparkles, titleAr: "توليد تلقائي", descAr: "الذكاء الاصطناعي يصمم موقعك الكامل بناءً على وصفك" },
  { icon: Palette, titleAr: "تصميم احترافي", descAr: "قوالب عصرية مصممة وفق أحدث معايير التصميم" },
  { icon: Smartphone, titleAr: "متوافق مع الجوال", descAr: "يعمل بشكل مثالي على جميع الأجهزة" },
  { icon: Globe2, titleAr: "دعم العربية", descAr: "RTL كامل واللغة العربية مدعومان بالكامل" },
  { icon: Zap, titleAr: "سرعة فائقة", descAr: "نشر موقعك وتشغيله في دقائق" },
  { icon: Code, titleAr: "بدون برمجة", descAr: "لا تحتاج أي خبرة تقنية أو برمجية" },
  { icon: Shield, titleAr: "آمن ومحمي", descAr: "HTTPS وحماية كاملة لبياناتك" },
  { icon: Headphones, titleAr: "دعم فني", descAr: "فريق دعم متاح للمساعدة في أي وقت" },
];

export default function SeoAiWebsiteBuilderPage() {
  const { language } = useAuth();
  const isAr = language !== "en";
  const [, navigate] = useLocation();

  useSEO({
    title: "إنشاء موقع إلكتروني بالذكاء الاصطناعي مجاناً — ArabyWeb",
    description: "أنشئ موقعك الإلكتروني الاحترافي بالذكاء الاصطناعي في أقل من دقيقتين. بدون برمجة، بدون تصميم، مجاناً. الأول في السعودية والخليج.",
    keywords: "إنشاء موقع بالذكاء الاصطناعي, بناء موقع AI, موقع مجاني, انشاء موقع الكتروني, ذكاء اصطناعي, موقع احترافي, بدون برمجة",
    canonical: "https://arabyweb.net/ai-website-builder",
    lang: "ar",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "ArabyWeb AI Website Builder",
      "url": "https://arabyweb.net/ai-website-builder",
      "applicationCategory": "BusinessApplication",
      "description": "منصة بناء المواقع بالذكاء الاصطناعي للعالم العربي",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "SAR", "availability": "https://schema.org/InStock" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "1240" },
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
            <a href="/blog" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">المدونة</a>
            <a href="/pricing" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">الأسعار</a>
            <Button size="sm" onClick={() => navigate("/auth")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white">
              ابدأ مجاناً
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-800 text-white py-20 md:py-28">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 20%, #14b8a6 0%, transparent 50%)" }} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <Badge className="mb-6 bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-sm px-4 py-1.5">
            <Sparkles className="w-3.5 h-3.5 ml-1" />
            بالذكاء الاصطناعي — مجاناً
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            أنشئ <span className="text-emerald-400">موقعك الإلكتروني</span><br />
            بالذكاء الاصطناعي في دقيقتين
          </h1>
          <p className="text-xl text-emerald-100/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            لا تحتاج مبرمجاً أو مصمماً. فقط اكتب وصف مشروعك بالعربية وسيبني الذكاء الاصطناعي موقعاً احترافياً كاملاً فوراً.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg px-8"
              data-testid="btn-hero-start">
              <Rocket className="w-5 h-5 ml-2" />
              أنشئ موقعك مجاناً
            </Button>
            <Button size="lg" variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => navigate("/templates")}>
              استعرض القوالب
            </Button>
          </div>
          <p className="mt-5 text-sm text-emerald-300/70">✓ مجاني 100% · ✓ بدون بطاقة ائتمان · ✓ في أقل من دقيقتين</p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">كيف يعمل؟</h2>
            <p className="text-muted-foreground text-lg">3 خطوات بسيطة لموقع احترافي</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "١", icon: "✍️", title: "صِف مشروعك", desc: "اكتب وصفاً بسيطاً لنشاطك التجاري بالعربية — ما تفعله وأين تعمل" },
              { step: "٢", icon: "⚡", title: "الذكاء الاصطناعي يبني", desc: "في أقل من دقيقتين تحصل على موقع كامل بتصميم احترافي وصفحات متعددة" },
              { step: "٣", icon: "🚀", title: "انشر وشارك", desc: "راجع موقعك، خصّصه كما تريد، ثم انشره ليراه العالم" },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }} viewport={{ once: true }}
                className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-3xl flex items-center justify-center mx-auto mb-4">
                  {s.icon}
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center mx-auto -mt-6 mb-4 relative top-2 z-10">
                  {s.step}
                </div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 dark:bg-muted/10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">مميزات منصة ArabyWeb</h2>
            <p className="text-muted-foreground">كل ما تحتاجه لموقع احترافي في مكان واحد</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <Card key={i} className="p-5 hover:shadow-md hover:border-emerald-300 transition-all">
                <f.icon className="w-8 h-8 text-emerald-600 mb-3" />
                <h3 className="font-bold mb-1">{f.titleAr}</h3>
                <p className="text-sm text-muted-foreground">{f.descAr}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-14">من يستفيد من ArabyWeb؟</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { emoji: "🍽️", title: "المطاعم والكافيهات", desc: "موقع مع قائمة الطعام وبيانات الحجز في دقائق" },
              { emoji: "🏪", title: "المتاجر والمحلات", desc: "متجر إلكتروني لعرض منتجاتك وقبول الطلبات" },
              { emoji: "👨‍⚕️", title: "العيادات والأطباء", desc: "موقع احترافي مع نظام حجز المواعيد" },
              { emoji: "🏗️", title: "الشركات والمكاتب", desc: "واجهة رسمية لشركتك تعكس احترافيتك" },
              { emoji: "🎨", title: "المصممون والمبدعون", desc: "معرض أعمال احترافي يعرض إبداعاتك" },
              { emoji: "🎓", title: "المعلمون والمدربون", desc: "منصة لعرض دوراتك والتسجيل فيها" },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl border hover:border-emerald-300 transition-colors">
                <span className="text-3xl">{item.emoji}</span>
                <div>
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50 dark:bg-muted/10">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">الأسئلة الشائعة</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <details key={i} className="group border rounded-xl bg-white dark:bg-background overflow-hidden">
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

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">ماذا يقول مستخدمونا</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "أحمد العتيبي", role: "صاحب مطعم، الرياض", text: "أنشأت موقع مطعمي في 3 دقائق فقط! التصميم احترافي والموقع يعمل بشكل رائع على الجوال.", stars: 5 },
              { name: "نورة الشمري", role: "مصممة أزياء، جدة", text: "كنت أعتقد أن الموقع يحتاج مبرمجاً. ArabyWeb غيّر كل شيء. الآن لديّ معرض أعمال جميل.", stars: 5 },
              { name: "فيصل القحطاني", role: "مستشار أعمال، الدمام", text: "الذكاء الاصطناعي فهم طبيعة عملي وأنشأ موقعاً يعكس هويتي المهنية بالضبط.", stars: 5 },
            ].map((t, i) => (
              <Card key={i} className="p-5">
                <div className="flex mb-3">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">ابدأ الآن — مجاناً</h2>
          <p className="text-xl opacity-90 mb-8">أنشئ موقعك الاحترافي بالذكاء الاصطناعي في أقل من دقيقتين</p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/auth")}
            className="font-bold text-lg px-10" data-testid="btn-cta-bottom">
            أنشئ موقعي الآن ←
          </Button>
          <div className="mt-6 flex justify-center gap-8 text-sm opacity-80">
            <span>✓ مجاني 100%</span>
            <span>✓ بدون بطاقة ائتمان</span>
            <span>✓ دقيقتان فقط</span>
          </div>
        </div>
      </section>

      {/* Internal links section */}
      <section className="py-12 bg-white dark:bg-background border-t">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-lg font-bold mb-6 text-center text-muted-foreground">اكتشف المزيد</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: "/free-website", label: "موقع مجاني" },
              { href: "/free-store", label: "متجر مجاني" },
              { href: "/digital-marketing-ai", label: "تسويق رقمي بالذكاء الاصطناعي" },
              { href: "/website-saudi-arabia", label: "مواقع للشركات السعودية" },
              { href: "/templates", label: "قوالب المواقع" },
              { href: "/pricing", label: "الأسعار" },
              { href: "/blog", label: "المدونة" },
              { href: "/faq", label: "الأسئلة الشائعة" },
            ].map(link => (
              <a key={link.href} href={link.href}
                className="px-4 py-2 border rounded-full text-sm hover:border-emerald-400 hover:text-emerald-600 transition-colors">
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
