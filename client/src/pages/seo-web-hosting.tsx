import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useSEO } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Server, Check, ChevronRight, ChevronLeft, Shield, Clock,
  Star, Zap, Globe2, Headphones, Database, Cpu, BarChart3, Lock
} from "lucide-react";
import BrandName from "@/components/brand-name";
import { motion } from "framer-motion";

const FAQ_ITEMS = [
  {
    q: "ما الفرق بين استضافة المواقع وتسجيل الدومين؟",
    a: "الدومين هو عنوان موقعك (مثل arabyweb.net)، والاستضافة هي المكان الذي يُخزَّن فيه محتوى موقعك. تحتاج إليهما معاً."
  },
  {
    q: "هل يمكنني استضافة أي موقع على ArabyWeb؟",
    a: "المواقع المُنشأة عبر ArabyWeb تُستضاف تلقائياً على Vercel بأداء عالمي. لا تحتاج إعداد يدوياً."
  },
  {
    q: "ما سرعة استضافة مواقع ArabyWeb؟",
    a: "نستخدم Vercel Edge Network — من أسرع شبكات الاستضافة في العالم، مع خوادم في المنطقة العربية."
  },
  {
    q: "هل الاستضافة تشمل شهادة SSL؟",
    a: "نعم، شهادة HTTPS مجانية تُفعَّل تلقائياً لجميع المواقع المستضافة دون أي تكلفة إضافية."
  },
  {
    q: "كم مساحة التخزين المتاحة؟",
    a: "تبدأ من 10 جيجابايت في خطة المبتدئين، وتصل إلى 50 جيجابايت في خطة الأعمال."
  },
  {
    q: "ماذا لو احتجت المساعدة في الإعداد؟",
    a: "فريق الدعم الفني متاح 24/7 لمساعدتك في كل خطوة — من إعداد الدومين حتى نشر الموقع."
  },
];

const PLANS = [
  {
    name: "المبتدئ",
    price: "29",
    desc: "مثالي للمواقع الشخصية والمدونات",
    features: ["مواقع مُنشأة بالذكاء الاصطناعي", "SSL مجاني", "10 جيجابايت تخزين", "بلا حدود للزوار", "دومين مجاني أول سنة", "دعم فني"],
    highlight: false,
  },
  {
    name: "الاحترافي",
    price: "49",
    desc: "للشركات الصغيرة والمتوسطة",
    features: ["كل ما في المبتدئ", "30 جيجابايت تخزين", "قواعد بيانات متعددة", "نطاق البريد الإلكتروني", "نسخ احتياطية يومية", "إحصائيات تفصيلية"],
    highlight: true,
  },
  {
    name: "الأعمال",
    price: "99",
    desc: "للمشاريع الكبيرة والتجارة الإلكترونية",
    features: ["كل ما في الاحترافي", "50 جيجابايت تخزين", "CDN عالمي", "أولوية الدعم الفني", "تقارير متقدمة", "وصول API كامل"],
    highlight: false,
  },
];

const FEATURES = [
  { icon: Zap, titleAr: "أداء فائق السرعة", descAr: "Vercel Edge Network لتحميل صفحات أقل من ثانية" },
  { icon: Shield, titleAr: "أمان متكامل", descAr: "HTTPS + WAF + حماية من DDoS تلقائياً" },
  { icon: Database, titleAr: "نسخ احتياطية", descAr: "بياناتك محفوظة ومنسوخة يومياً" },
  { icon: Globe2, titleAr: "CDN عالمي", descAr: "محتواك يُقدَّم من أقرب خادم لزوارك" },
  { icon: Cpu, titleAr: "تحجيم تلقائي", descAr: "الموقع يتحمل الضغط حتى ملايين الزيارات" },
  { icon: BarChart3, titleAr: "إحصائيات مفصّلة", descAr: "تتبّع زوارك ومصادر الترافيك لحظة بلحظة" },
  { icon: Lock, titleAr: "SSL مجاني", descAr: "شهادة HTTPS تُجدَّد تلقائياً دون أي تدخل" },
  { icon: Headphones, titleAr: "دعم 24/7", descAr: "خبراء جاهزون لمساعدتك في أي وقت" },
];

export default function SeoWebHostingPage() {
  const { language } = useAuth();
  const isAr = language !== "en";
  const [, navigate] = useLocation();

  useSEO({
    title: "استضافة مواقع في السعودية — أسرع وأرخص استضافة 2026 | ArabyWeb",
    description: "استضافة مواقع احترافية في السعودية. SSL مجاني، سرعة فائقة، دعم عربي 24/7. استضف موقعك من 29 ريال شهرياً. Vercel Edge Network للأداء الأمثل.",
    keywords: "استضافة مواقع السعودية, استضافة موقع, web hosting saudi arabia, استضافة رخيصة, استضافة احترافية, سيرفر سعودي, استضافة بالريال السعودي, استضافة عربية",
    canonical: "https://arabyweb.net/web-hosting-saudi",
    lang: "ar",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "استضافة مواقع في السعودية — ArabyWeb",
      "url": "https://arabyweb.net/web-hosting-saudi",
      "description": "خدمة استضافة مواقع إلكترونية في السعودية والخليج بأسعار تنافسية وأداء عالمي",
      "provider": { "@type": "Organization", "name": "ArabyWeb.net", "url": "https://arabyweb.net" },
      "areaServed": { "@type": "Country", "name": "Saudi Arabia" },
      "offers": [
        { "@type": "Offer", "name": "خطة المبتدئ", "price": "29", "priceCurrency": "SAR" },
        { "@type": "Offer", "name": "خطة الاحترافي", "price": "49", "priceCurrency": "SAR" },
        { "@type": "Offer", "name": "خطة الأعمال", "price": "99", "priceCurrency": "SAR" },
      ],
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "1050" },
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
              {isAr ? "ابدأ الآن" : "Get Started"}
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-950 to-background">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #10b981 0%, transparent 60%)" }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-emerald-600/20 text-emerald-300 border-emerald-600/30">
              🖥️ {isAr ? "استضافة مواقع في السعودية" : "Web Hosting Saudi Arabia"}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-5 text-white leading-tight">
              {isAr
                ? "استضافة مواقع احترافية\nبأسعار تنافسية في السعودية"
                : "Professional Web Hosting\nAt Competitive Prices in Saudi Arabia"}
            </h1>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              {isAr
                ? "سرعة فائقة، SSL مجاني، دعم عربي 24/7، ونسخ احتياطية يومية. كل ما تحتاجه لإطلاق موقعك الاحترافي."
                : "Blazing speed, free SSL, Arabic support 24/7, and daily backups. Everything you need for a professional website."}
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => navigate("/domains")} data-testid="btn-hosting-hero">
                <Server className="w-5 h-5" />
                {isAr ? "اختر خطة الاستضافة" : "Choose Hosting Plan"}
                <Arrow className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-emerald-400 text-emerald-200 hover:bg-emerald-900/30"
                onClick={() => navigate("/auth")} data-testid="btn-login-hosting-hero">
                {isAr ? "تسجيل الدخول" : "Login"}
              </Button>
            </div>
            <p className="text-emerald-200/70 text-sm">
              {isAr ? "⭐ 4.8/5 — يثق بنا أكثر من 1,050 عميل في السعودية والخليج" : "⭐ 4.8/5 — Trusted by 1,050+ customers"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Plans ── */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">
              {isAr ? "خطط الاستضافة" : "Hosting Plans"}
            </h2>
            <p className="text-muted-foreground">
              {isAr ? "اختر الخطة المناسبة لاحتياجات موقعك — يمكنك الترقية في أي وقت" : "Choose the plan that fits your needs — upgrade anytime"}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <motion.div key={i} whileHover={{ scale: 1.02 }}>
                <Card className={`p-6 h-full flex flex-col ${plan.highlight
                  ? "border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/20"
                  : "hover:border-emerald-500/40"} transition-all`}>
                  {plan.highlight && (
                    <Badge className="self-center mb-3 bg-emerald-600 text-white text-xs">
                      {isAr ? "الأكثر شيوعاً" : "Most Popular"}
                    </Badge>
                  )}
                  <h3 className="text-xl font-bold text-center mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">{plan.desc}</p>
                  <div className="text-center mb-6">
                    <span className="text-4xl font-extrabold text-emerald-500">{plan.price}</span>
                    <span className="text-muted-foreground text-sm"> ريال/شهر</span>
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full ${plan.highlight ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                    variant={plan.highlight ? "default" : "outline"}
                    onClick={() => navigate("/domains")}
                    data-testid={`btn-plan-${plan.name}`}>
                    {isAr ? "ابدأ الآن" : "Get Started"}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            {isAr ? "مميزات استضافة ArabyWeb" : "ArabyWeb Hosting Features"}
          </h2>
          <div className="grid md:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i} whileHover={{ y: -4 }}>
                <Card className="p-5 h-full">
                  <f.icon className="w-8 h-8 text-emerald-500 mb-3" />
                  <h3 className="font-semibold mb-1 text-sm">{f.titleAr}</h3>
                  <p className="text-xs text-muted-foreground">{f.descAr}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            {isAr ? "أسئلة شائعة عن الاستضافة" : "Hosting FAQ"}
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
                <Card className="p-5">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-emerald-500">س:</span> {item.q}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    <span className="text-emerald-500 font-semibold">ج: </span>{item.a}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-12 px-4 bg-emerald-950/50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { num: "99.9%", label: isAr ? "ضمان التشغيل" : "Uptime SLA" },
              { num: "<1s", label: isAr ? "سرعة التحميل" : "Load Speed" },
              { num: "1,050+", label: isAr ? "عميل راضٍ" : "Happy Clients" },
              { num: "24/7", label: isAr ? "دعم فني" : "Tech Support" },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl font-extrabold text-emerald-400 mb-1">{s.num}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-900 to-teal-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <Server className="w-12 h-12 mx-auto mb-4 text-emerald-300" />
          <h2 className="text-3xl font-bold mb-4">
            {isAr ? "ابدأ باستضافة موقعك اليوم" : "Start Hosting Your Website Today"}
          </h2>
          <p className="text-emerald-200 mb-8">
            {isAr ? "اختر خطتك وأطلق موقعك خلال دقائق. بدون عقود طويلة، بدون رسوم خفية." : "Choose your plan and launch in minutes. No long contracts, no hidden fees."}
          </p>
          <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 gap-2"
            onClick={() => navigate("/domains")} data-testid="btn-cta-hosting-final">
            <Server className="w-5 h-5" />
            {isAr ? "ابدأ الاستضافة الآن" : "Start Hosting Now"}
            <Arrow className="w-4 h-4" />
          </Button>
          <p className="text-emerald-300/70 text-sm mt-4">
            {isAr ? "✓ ضمان استرداد 30 يوم ✓ إلغاء في أي وقت ✓ دعم عربي" : "✓ 30-day money back ✓ Cancel anytime ✓ Arabic support"}
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 py-6 px-4 text-center text-sm text-muted-foreground">
        <p>
          © 2026 <BrandName /> — {isAr ? "استضافة مواقع احترافية في السعودية والخليج" : "Professional Web Hosting in Saudi Arabia"}
        </p>
        <div className="flex gap-4 justify-center mt-2">
          <button onClick={() => navigate("/terms")} className="hover:text-primary">{isAr ? "الشروط" : "Terms"}</button>
          <button onClick={() => navigate("/privacy")} className="hover:text-primary">{isAr ? "الخصوصية" : "Privacy"}</button>
          <button onClick={() => navigate("/faq")} className="hover:text-primary">{isAr ? "الأسئلة الشائعة" : "FAQ"}</button>
          <button onClick={() => navigate("/domains")} className="hover:text-primary">{isAr ? "الدومينات والاستضافة" : "Domains & Hosting"}</button>
        </div>
      </footer>
    </div>
  );
}
