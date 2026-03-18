import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useSEO } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Building2, MapPin, Globe2, Shield, Rocket, Star, ChevronLeft,
  CheckCircle2, Phone, Users, TrendingUp, Clock, Sparkles
} from "lucide-react";
import BrandName from "@/components/brand-name";
import { motion } from "framer-motion";

const CITIES = [
  { name: "الرياض", emoji: "🏙️", count: "4,200+" },
  { name: "جدة", emoji: "🌊", count: "2,800+" },
  { name: "الدمام", emoji: "🏗️", count: "1,500+" },
  { name: "مكة المكرمة", emoji: "🕌", count: "900+" },
  { name: "المدينة المنورة", emoji: "🌿", count: "750+" },
  { name: "تبوك", emoji: "🏔️", count: "600+" },
];

const SECTORS = [
  { icon: "🍽️", title: "المطاعم والكافيهات", desc: "موقع مع القائمة والحجز الأونلاين" },
  { icon: "🏥", title: "العيادات والمستشفيات", desc: "بوابة حجز مواعيد احترافية" },
  { icon: "🏗️", title: "شركات المقاولات", desc: "معرض أعمال ومحفظة مشاريع" },
  { icon: "🛍️", title: "المتاجر التجارية", desc: "متجر إلكتروني متكامل" },
  { icon: "⚖️", title: "مكاتب المحاماة", desc: "موقع رسمي يعكس الاحترافية" },
  { icon: "🏠", title: "شركات العقار", desc: "بوابة عقارية مع قوائم العقارات" },
  { icon: "🎓", title: "المراكز التعليمية", desc: "منصة تسجيل ومتابعة" },
  { icon: "💰", title: "الخدمات المالية", desc: "موقع مؤسسي موثوق وآمن" },
];

const FAQ_ITEMS = [
  {
    q: "كم تكلفة إنشاء موقع للشركات السعودية؟",
    a: "مع ArabyWeb يمكنك إنشاء موقعك مجاناً. للخطط المدفوعة تبدأ من 49 ريال شهرياً فقط، وهو أقل بكثير من تكلفة التصميم التقليدي."
  },
  {
    q: "هل الموقع متوافق مع نظام الفوترة الإلكترونية السعودي؟",
    a: "نعم، يمكن إضافة أنظمة الفوترة والدفع الإلكتروني المتوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك."
  },
  {
    q: "هل يمكن الحصول على نطاق .sa ؟",
    a: "نعم، يمكنك ربط موقعك بأي نطاق تمتلكه، بما في ذلك النطاقات السعودية .sa و .com.sa."
  },
  {
    q: "هل يدعم الموقع اللغتين العربية والإنجليزية؟",
    a: "نعم، ArabyWeb يدعم المواقع ثنائية اللغة بشكل كامل، مثالي للشركات التي تتعامل مع عملاء دوليين."
  },
  {
    q: "هل يمكنني ربط الموقع بالسجل التجاري؟",
    a: "يمكنك عرض معلومات سجلك التجاري وترخيصك في الموقع لزيادة مصداقيتك."
  },
];

export default function SeoWebsiteSaudiArabiaPage() {
  const { language } = useAuth();
  const isAr = language !== "en";
  const [, navigate] = useLocation();

  useSEO({
    title: "موقع إلكتروني للشركات السعودية — بناء مواقع في السعودية | ArabyWeb",
    description: "أنشئ موقعاً إلكترونياً احترافياً لشركتك في السعودية. تصميم عصري، دعم عربي كامل، متوافق مع الجوال. للرياض وجدة والدمام وجميع مدن المملكة.",
    keywords: "موقع إلكتروني للشركات السعودية, تصميم مواقع السعودية, موقع شركة الرياض, موقع جدة, موقع الدمام, تصميم موقع احترافي",
    canonical: "https://arabyweb.net/website-saudi-arabia",
    lang: "ar",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "مواقع الشركات السعودية — ArabyWeb",
      "url": "https://arabyweb.net/website-saudi-arabia",
      "description": "منصة بناء المواقع الإلكترونية للشركات السعودية",
      "areaServed": {
        "@type": "Country",
        "name": "Saudi Arabia",
        "sameAs": "https://www.wikidata.org/wiki/Q851"
      },
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
            <a href="/pricing" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">الأسعار</a>
            <Button size="sm" onClick={() => navigate("/auth")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white">
              ابدأ مجاناً
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-teal-900 text-white py-20 md:py-28">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <Badge className="mb-6 bg-teal-500/20 text-teal-300 border-teal-500/40 text-sm px-4 py-1.5">
            <MapPin className="w-3.5 h-3.5 ml-1" />
            مخصص للشركات السعودية
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            موقعك الإلكتروني الاحترافي<br />
            <span className="text-teal-400">للشركات السعودية</span>
          </h1>
          <p className="text-xl text-blue-100/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            أنشئ موقعاً إلكترونياً يليق بشركتك في الرياض أو جدة أو الدمام أو أي مدينة سعودية. بالذكاء الاصطناعي، في دقيقتين، بأسعار في متناول الجميع.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}
              className="bg-teal-500 hover:bg-teal-400 text-white font-bold text-lg px-8"
              data-testid="btn-saudi-start">
              <Rocket className="w-5 h-5 ml-2" />
              أنشئ موقع شركتك
            </Button>
            <Button size="lg" variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => navigate("/templates")}>
              استعرض النماذج
            </Button>
          </div>
          <p className="mt-5 text-sm text-teal-300/70">✓ دعم عربي كامل · ✓ RTL احترافي · ✓ متوافق مع الجوال</p>
        </div>
      </section>

      {/* Cities */}
      <section className="py-16 bg-white dark:bg-background">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-4">نخدم جميع مدن المملكة</h2>
          <p className="text-muted-foreground text-center mb-10">آلاف المشاريع السعودية تثق في ArabyWeb</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {CITIES.map((city, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                className="text-center p-4 border rounded-xl hover:border-teal-400 hover:shadow-sm transition-all">
                <div className="text-3xl mb-2">{city.emoji}</div>
                <div className="font-semibold text-sm">{city.name}</div>
                <div className="text-xs text-teal-600 mt-1">{city.count} موقع</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="py-20 bg-gray-50 dark:bg-muted/10">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-3">لجميع القطاعات</h2>
          <p className="text-muted-foreground text-center mb-12">ArabyWeb يفهم احتياجات كل نشاط تجاري</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SECTORS.map((s, i) => (
              <Card key={i} className="p-5 hover:shadow-md hover:border-teal-300 transition-all text-center">
                <div className="text-4xl mb-3">{s.icon}</div>
                <h3 className="font-bold mb-1 text-sm">{s.title}</h3>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Saudi businesses need a website */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">لماذا تحتاج شركتك في السعودية موقعاً الآن؟</h2>
          <div className="space-y-6">
            <div className="p-6 border-r-4 border-teal-500 bg-teal-50 dark:bg-teal-950/20 rounded-r-xl">
              <h3 className="font-bold text-lg mb-2">رؤية 2030 والتحول الرقمي</h3>
              <p className="text-muted-foreground leading-relaxed">
                المملكة العربية السعودية تسير بخطى متسارعة نحو الاقتصاد الرقمي في إطار رؤية 2030. الشركات التي لا تملك حضوراً رقمياً قوياً ستتأخر عن المنافسة. الموقع الإلكتروني هو أساس هذا الحضور.
              </p>
            </div>
            <div className="p-6 border-r-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20 rounded-r-xl">
              <h3 className="font-bold text-lg mb-2">السعوديون يبحثون على الإنترنت أولاً</h3>
              <p className="text-muted-foreground leading-relaxed">
                95% من السعوديين يبحثون على جوجل قبل اتخاذ أي قرار شراء. إذا لم يجدوا موقعك، فستخسر هؤلاء العملاء لصالح منافسيك. موقع احترافي = ظهور في البحث = عملاء أكثر.
              </p>
            </div>
            <div className="p-6 border-r-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 rounded-r-xl">
              <h3 className="font-bold text-lg mb-2">المصداقية والثقة التجارية</h3>
              <p className="text-muted-foreground leading-relaxed">
                الموقع الإلكتروني الاحترافي يرفع مصداقية شركتك بشكل كبير. العملاء والشركاء يبحثون عن الشركات التي تملك حضوراً رقمياً راسخاً قبل التعامل معها.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What your website includes */}
      <section className="py-20 bg-gray-50 dark:bg-muted/10">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">ما يتضمنه موقعك</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "صفحة رئيسية بتصميم عصري",
              "صفحة من نحن تعرّف بشركتك",
              "صفحة الخدمات أو المنتجات",
              "نموذج تواصل وطلب عروض",
              "معرض أعمال ومشاريع",
              "تكامل مع جوجل ماب",
              "روابط التواصل الاجتماعي",
              "تحسين SEO للظهور في جوجل",
              "توافق كامل مع الجوال",
              "دعم العربية والإنجليزية",
              "شهادة SSL مجانية",
              "نطاق فرعي مجاني",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">شركات سعودية تثق بنا</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "شركة الرشيد للمقاولات", city: "الرياض", text: "أنشأنا موقعنا في يوم واحد وحصلنا على طلبات عروض من عملاء جدد خلال الأسبوع الأول." },
              { name: "مجمع الشفاء الطبي", city: "جدة", text: "الموقع ساعد مرضانا على حجز المواعيد أونلاين. انخفضت المكالمات الهاتفية وزادت الكفاءة." },
              { name: "بيوت الأحلام للعقارات", city: "الدمام", text: "قائمة عقاراتنا الآن متاحة 24/7 أونلاين. تضاعفت الاستفسارات بعد إطلاق الموقع." },
            ].map((t, i) => (
              <Card key={i} className="p-5">
                <div className="flex mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {t.city}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50 dark:bg-muted/10">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">أسئلة الشركات السعودية</h2>
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

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">أطلق موقع شركتك اليوم</h2>
          <p className="text-xl opacity-90 mb-8">انضم لآلاف الشركات السعودية التي تبني حضورها الرقمي مع ArabyWeb</p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/auth")}
            className="font-bold text-lg px-10" data-testid="btn-saudi-cta">
            أنشئ موقعي مجاناً ←
          </Button>
          <div className="mt-6 flex justify-center gap-6 text-sm opacity-80">
            <span>✓ مجاني للبدء</span>
            <span>✓ دعم عربي كامل</span>
            <span>✓ لجميع المدن</span>
          </div>
        </div>
      </section>

      {/* Internal Links */}
      <section className="py-10 bg-white dark:bg-background border-t">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: "/ai-website-builder", label: "إنشاء موقع بالذكاء الاصطناعي" },
              { href: "/digital-marketing-ai", label: "تسويق رقمي مجاني" },
              { href: "/free-website", label: "موقع مجاني" },
              { href: "/free-store", label: "متجر مجاني" },
              { href: "/templates", label: "قوالب المواقع" },
              { href: "/pricing", label: "الأسعار" },
              { href: "/blog", label: "المدونة" },
            ].map(link => (
              <a key={link.href} href={link.href}
                className="px-4 py-2 border rounded-full text-sm hover:border-teal-400 hover:text-teal-600 transition-colors">
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
