import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useSEO } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Globe2, Check, ChevronRight, ChevronLeft, Shield, Clock,
  Star, Zap, Lock, Search, RefreshCw, Headphones
} from "lucide-react";
import BrandName from "@/components/brand-name";
import { motion } from "framer-motion";

const FAQ_ITEMS = [
  {
    q: "كيف أسجّل دومين في السعودية؟",
    a: "عبر ArabyWeb: ابحث عن الدومين المتاح، أضفه للسلة، وأتمّ الدفع بالريال السعودي. يُفعَّل الدومين خلال دقائق."
  },
  {
    q: "ما الفرق بين .com و .sa و .net؟",
    a: ".com الأكثر انتشاراً عالمياً، .sa يُعطيك هوية سعودية قوية، .net مناسب للتقنية والخدمات. ننصح بـ .com لأغلب الأعمال."
  },
  {
    q: "كم تكلفة تسجيل الدومين؟",
    a: "تبدأ من 29 ريال سعودي سنوياً للدومينات الشائعة. نُقدّم أسعاراً تنافسية بدون رسوم خفية."
  },
  {
    q: "هل يمكن نقل دومين موجود إلى ArabyWeb؟",
    a: "نعم، نقبل نقل الدومينات من أي مزوّد آخر. فقط تواصل معنا وسنتولى العملية بالكامل."
  },
  {
    q: "هل الدومين مرتبط تلقائياً بالموقع؟",
    a: "نعم، عند ربط الدومين بمشروعك على ArabyWeb يُفعَّل تلقائياً خلال 24 ساعة بدون أي إعدادات تقنية."
  },
  {
    q: "ماذا يحدث عند انتهاء الاشتراك؟",
    a: "نرسل تنبيهات قبل 30 يوم من انتهاء الدومين. يمكنك تجديده بسهولة من لوحة التحكم."
  },
];

const TLDS = [
  { ext: ".com", price: "45", desc: "الأشهر عالمياً" },
  { ext: ".sa", price: "75", desc: "الهوية السعودية" },
  { ext: ".net", price: "55", desc: "مثالي للخدمات" },
  { ext: ".org", price: "49", desc: "للمؤسسات" },
  { ext: ".store", price: "65", desc: "للمتاجر الإلكترونية" },
  { ext: ".online", price: "39", desc: "عصري وبأسعار مناسبة" },
];

const FEATURES = [
  { icon: Search, titleAr: "بحث فوري عن التوفر", descAr: "اعرف إن كان دومينك متاحاً في ثوانٍ" },
  { icon: Zap, titleAr: "تفعيل سريع", descAr: "الدومين يعمل خلال دقائق من الشراء" },
  { icon: Lock, titleAr: "حماية WHOIS", descAr: "بياناتك محمية ومخفية عن العموم" },
  { icon: RefreshCw, titleAr: "تجديد تلقائي", descAr: "لا تخسر دومينك بنسيان التجديد" },
  { icon: Globe2, titleAr: "ربط تلقائي بالموقع", descAr: "اربط دومينك بموقعك ArabyWeb بنقرة" },
  { icon: Headphones, titleAr: "دعم فني 7/24", descAr: "فريقنا يساعدك في إعداد الدومين" },
  { icon: Shield, titleAr: "SSL مجاني", descAr: "شهادة HTTPS تُفعَّل تلقائياً مع الدومين" },
  { icon: Star, titleAr: "أسعار تنافسية", descAr: "أرخص أسعار تسجيل دومين في السعودية" },
];

const STEPS = [
  { num: "١", title: "ابحث عن دومينك", desc: "اكتب الاسم الذي تريده وشاهد التوافر فوراً" },
  { num: "٢", title: "اختر اللاحقة المناسبة", desc: ".com أو .sa أو أي لاحقة تناسب نشاطك" },
  { num: "٣", title: "أتمّ الدفع بالريال", desc: "ادفع بأمان عبر Visa أو Mada أو Apple Pay" },
  { num: "٤", title: "اربط بموقعك", descAr: "ربط الدومين بموقعك على ArabyWeb خلال 24 ساعة" },
];

export default function SeoDomainRegistrationPage() {
  const { language } = useAuth();
  const isAr = language !== "en";
  const [, navigate] = useLocation();

  useSEO({
    title: "تسجيل دومين في السعودية — أرخص أسعار 2026 | ArabyWeb",
    description: "سجّل دومينك (.com, .sa, .net) بأرخص الأسعار في السعودية والخليج. تفعيل فوري، SSL مجاني، ربط تلقائي بموقعك. ابدأ من 29 ريال سعودي.",
    keywords: "تسجيل دومين السعودية, شراء دومين, سجل اسم نطاق, دومين .com .sa .net, اسم نطاق رخيص السعودية, تسجيل موقع الكتروني, domain registration saudi arabia",
    canonical: "https://arabyweb.net/domain-registration-saudi",
    lang: "ar",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "تسجيل دومين في السعودية — ArabyWeb",
      "url": "https://arabyweb.net/domain-registration-saudi",
      "description": "خدمة تسجيل أسماء النطاقات (دومين) في السعودية والخليج بأسعار تنافسية",
      "provider": { "@type": "Organization", "name": "ArabyWeb.net", "url": "https://arabyweb.net" },
      "areaServed": { "@type": "Country", "name": "Saudi Arabia" },
      "offers": { "@type": "Offer", "price": "29", "priceCurrency": "SAR", "priceValidUntil": "2026-12-31" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "870" },
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

  const dir = isAr ? "rtl" : "ltr";
  const Arrow = isAr ? ChevronLeft : ChevronRight;

  return (
    <div dir={dir} className="min-h-screen bg-background text-foreground">
      {/* ── Nav ── */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="font-bold text-xl text-primary">
            <BrandName />
          </button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
              {isAr ? "تسجيل الدخول" : "Login"}
            </Button>
            <Button size="sm" onClick={() => navigate("/domains")}>
              {isAr ? "سجّل الآن" : "Register Now"}
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-blue-950 via-indigo-950 to-background">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #3b82f6 0%, transparent 60%)" }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-blue-600/20 text-blue-300 border-blue-600/30">
              🌐 {isAr ? "تسجيل دومين في السعودية" : "Domain Registration Saudi Arabia"}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-5 text-white leading-tight">
              {isAr
                ? "سجّل دومينك بأرخص الأسعار\nفي السعودية والخليج"
                : "Register Your Domain\nAt the Best Price in Saudi Arabia"}
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {isAr
                ? "دومينات .com و .sa و .net بأسعار تنافسية. تفعيل فوري، SSL مجاني، ربط تلقائي بموقعك على ArabyWeb."
                : "Competitive domain prices. Instant activation, free SSL, auto-linking to your ArabyWeb site."}
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => navigate("/domains")} data-testid="btn-register-domain-hero">
                <Globe2 className="w-5 h-5" />
                {isAr ? "ابحث عن دومينك الآن" : "Search Your Domain"}
                <Arrow className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-blue-400 text-blue-200 hover:bg-blue-900/30"
                onClick={() => navigate("/auth")} data-testid="btn-login-domain-hero">
                {isAr ? "تسجيل الدخول" : "Login"}
              </Button>
            </div>
            <p className="text-blue-200/70 text-sm">
              {isAr ? "⭐ 4.9/5 — بناءً على أكثر من 870 تقييم من عملائنا في السعودية" : "⭐ 4.9/5 — Based on 870+ reviews"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── TLD Prices ── */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">
              {isAr ? "أسعار تسجيل الدومين" : "Domain Registration Prices"}
            </h2>
            <p className="text-muted-foreground">
              {isAr ? "أرخص الأسعار في السعودية — شامل الضريبة، بدون رسوم خفية" : "Best prices in Saudi Arabia — VAT included, no hidden fees"}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {TLDS.map(tld => (
              <motion.div key={tld.ext} whileHover={{ scale: 1.02 }}>
                <Card className="p-5 text-center border hover:border-blue-500/50 transition-all hover:shadow-md">
                  <div className="text-2xl font-extrabold text-blue-500 mb-1">{tld.ext}</div>
                  <div className="text-sm text-muted-foreground mb-3">{tld.desc}</div>
                  <div className="text-xl font-bold mb-1">{tld.price} ريال</div>
                  <div className="text-xs text-muted-foreground mb-4">{isAr ? "سنوياً" : "per year"}</div>
                  <Button size="sm" className="w-full" onClick={() => navigate("/domains")}
                    data-testid={`btn-register-tld-${tld.ext.replace(".", "")}`}>
                    {isAr ? "سجّل الآن" : "Register"}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {isAr ? "كيف تسجّل دومينك؟" : "How to Register Your Domain?"}
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-3">
                    {step.num}
                  </div>
                  <h3 className="font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            {isAr ? "لماذا ArabyWeb لتسجيل الدومين؟" : "Why ArabyWeb for Domain Registration?"}
          </h2>
          <div className="grid md:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i} whileHover={{ y: -4 }}>
                <Card className="p-5 h-full">
                  <f.icon className="w-8 h-8 text-blue-500 mb-3" />
                  <h3 className="font-semibold mb-1 text-sm">{f.titleAr}</h3>
                  <p className="text-xs text-muted-foreground">{f.descAr}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            {isAr ? "أسئلة شائعة عن الدومين" : "Domain FAQ"}
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
                <Card className="p-5">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-blue-500">س:</span> {item.q}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    <span className="text-blue-500 font-semibold">ج: </span>{item.a}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <Globe2 className="w-12 h-12 mx-auto mb-4 text-blue-300" />
          <h2 className="text-3xl font-bold mb-4">
            {isAr ? "سجّل دومينك اليوم واحجز اسمك على الإنترنت" : "Register Your Domain Today"}
          </h2>
          <p className="text-blue-200 mb-8">
            {isAr ? "كل دقيقة تنتظر قد يأخذ فيها شخص آخر اسمك. اسرع وسجّل الآن!" : "Don't wait — register now before someone takes your name!"}
          </p>
          <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 gap-2"
            onClick={() => navigate("/domains")} data-testid="btn-cta-domain-final">
            <Globe2 className="w-5 h-5" />
            {isAr ? "ابحث عن دومينك الآن" : "Search Your Domain"}
            <Arrow className="w-4 h-4" />
          </Button>
          <p className="text-blue-300/70 text-sm mt-4">
            {isAr ? "✓ دفع آمن بالريال السعودي ✓ تفعيل فوري ✓ دعم 24/7" : "✓ Secure SAR payment ✓ Instant activation ✓ 24/7 support"}
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 py-6 px-4 text-center text-sm text-muted-foreground">
        <p>
          © 2026 <BrandName /> — {isAr ? "تسجيل الدومينات في السعودية والخليج" : "Domain Registration in Saudi Arabia"}
        </p>
        <div className="flex gap-4 justify-center mt-2">
          <button onClick={() => navigate("/terms")} className="hover:text-primary">{isAr ? "الشروط" : "Terms"}</button>
          <button onClick={() => navigate("/privacy")} className="hover:text-primary">{isAr ? "الخصوصية" : "Privacy"}</button>
          <button onClick={() => navigate("/faq")} className="hover:text-primary">{isAr ? "الأسئلة الشائعة" : "FAQ"}</button>
          <button onClick={() => navigate("/domains")} className="hover:text-primary">{isAr ? "الدومينات" : "Domains"}</button>
        </div>
      </footer>
    </div>
  );
}
