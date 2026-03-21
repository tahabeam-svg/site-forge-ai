import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useSEO } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Globe2, Server, Check, ChevronRight, ChevronLeft, Shield,
  Zap, Star, Lock, Headphones, Package, ArrowRight, RefreshCw
} from "lucide-react";
import BrandName from "@/components/brand-name";
import { motion } from "framer-motion";

const FAQ_ITEMS = [
  {
    q: "ما الفرق بين الدومين والاستضافة؟",
    a: "الدومين هو عنوان موقعك على الإنترنت (مثل arabyweb.net)، بينما الاستضافة هي المساحة التي تُخزَّن فيها ملفات موقعك. تحتاج إلى كليهما لتشغيل موقع إلكتروني."
  },
  {
    q: "هل يمكنني شراء الدومين والاستضافة معاً؟",
    a: "نعم، نقدّم باقات مدمجة للدومين والاستضافة بأسعار مخفضة. دومين مجاني مع أي خطة استضافة سنوية."
  },
  {
    q: "كم تكلفة الدومين والاستضافة في ArabyWeb؟",
    a: "تبدأ باقات الدومين من 29 ريال سنوياً، والاستضافة من 29 ريال شهرياً. الباقة المدمجة توفر عليك ما يصل إلى 30%."
  },
  {
    q: "هل الموقع مستضاف في السعودية؟",
    a: "نستخدم Vercel Edge Network الذي يخدم المحتوى من أقرب خادم لزوارك — مما يضمن سرعة عالية للمستخدمين في السعودية والخليج."
  },
  {
    q: "كيف أربط دوميني بموقع ArabyWeb؟",
    a: "بعد شراء الدومين من لوحتك، اضغط 'ربط بالموقع' واختر مشروعك. سيتم الإعداد التلقائي خلال 24 ساعة."
  },
  {
    q: "هل يوجد دعم فني للإعداد؟",
    a: "نعم، فريقنا متاح 24/7 لمساعدتك في كل مرحلة من إعداد الدومين حتى نشر الموقع وتشغيله."
  },
];

const BUNDLES = [
  {
    name: "الباقة الأساسية",
    domainExt: ".com أو .net",
    hostingPlan: "خطة المبتدئ",
    price: "58",
    originalPrice: "74",
    save: "16",
    features: ["دومين مجاني لسنة كاملة", "SSL مجاني", "10 جيجابايت تخزين", "بلا حدود للزوار", "دعم فني"],
    highlight: false,
    color: "blue",
  },
  {
    name: "الباقة الاحترافية",
    domainExt: ".com أو .sa",
    hostingPlan: "خطة الاحترافي",
    price: "78",
    originalPrice: "104",
    save: "26",
    features: ["دومين مجاني لسنة كاملة", "SSL + نسخ احتياطية", "30 جيجابايت تخزين", "بريد إلكتروني احترافي", "إحصائيات تفصيلية", "أولوية الدعم"],
    highlight: true,
    color: "purple",
  },
  {
    name: "باقة الأعمال",
    domainExt: "أي امتداد",
    hostingPlan: "خطة الأعمال",
    price: "128",
    originalPrice: "174",
    save: "46",
    features: ["دومين مجاني + تجديد سنة", "CDN عالمي", "50 جيجابايت تخزين", "قواعد بيانات متعددة", "API كامل", "مدير حساب مخصص"],
    highlight: false,
    color: "emerald",
  },
];

const WHY_US = [
  { icon: Zap, title: "إعداد سريع", desc: "دومينك وموقعك جاهزان في أقل من ساعة" },
  { icon: Shield, title: "أمان متكامل", desc: "SSL + WAF + حماية DDoS مجاناً" },
  { icon: Globe2, title: "ربط تلقائي", desc: "الدومين يتصل بموقعك تلقائياً بلا تعقيدات تقنية" },
  { icon: RefreshCw, title: "تجديد تلقائي", desc: "لا تخسر دومينك أو استضافتك بنسيان التجديد" },
  { icon: Headphones, title: "دعم عربي 24/7", desc: "فريق عربي متخصص يساعدك في أي وقت" },
  { icon: Star, title: "أسعار تنافسية", desc: "أفضل الأسعار في السوق السعودي بجودة عالمية" },
];

const colorMap: Record<string, string> = {
  blue: "border-blue-500 shadow-blue-500/10 text-blue-500 bg-blue-600",
  purple: "border-violet-500 shadow-violet-500/10 text-violet-500 bg-violet-600",
  emerald: "border-emerald-500 shadow-emerald-500/10 text-emerald-500 bg-emerald-600",
};

export default function SeoDomainsHostingPage() {
  const { language } = useAuth();
  const isAr = language !== "en";
  const [, navigate] = useLocation();

  useSEO({
    title: "دومين واستضافة في السعودية — باقات مدمجة بأفضل الأسعار 2026 | ArabyWeb",
    description: "اشترِ دوميناً واستضافة معاً بأفضل الأسعار في السعودية. دومين مجاني مع كل باقة استضافة، SSL مجاني، ربط تلقائي بموقعك ArabyWeb. ابدأ من 58 ريال شهرياً.",
    keywords: "دومين واستضافة السعودية, شراء دومين واستضافة, domain and hosting saudi arabia, باقات الدومين والاستضافة, استضافة موقع رخيص, دومين مجاني مع استضافة, domain hosting arabic",
    canonical: "https://arabyweb.net/domains-hosting-saudi",
    lang: "ar",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "دومين واستضافة في السعودية — ArabyWeb",
      "url": "https://arabyweb.net/domains-hosting-saudi",
      "description": "باقات مدمجة للدومين والاستضافة في السعودية والخليج بأسعار تنافسية",
      "provider": { "@type": "Organization", "name": "ArabyWeb.net", "url": "https://arabyweb.net" },
      "areaServed": { "@type": "Country", "name": "Saudi Arabia" },
      "offers": BUNDLES.map(b => ({
        "@type": "Offer",
        "name": b.name,
        "price": b.price,
        "priceCurrency": "SAR",
        "description": `${b.domainExt} + ${b.hostingPlan}`,
      })),
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "920" },
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
              {isAr ? "شاهد الباقات" : "View Packages"}
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-violet-950 via-purple-950 to-background">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #8b5cf6 0%, transparent 60%)" }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-violet-600/20 text-violet-300 border-violet-600/30">
              🌐🖥️ {isAr ? "دومين + استضافة في السعودية" : "Domain + Hosting Saudi Arabia"}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-5 text-white leading-tight">
              {isAr
                ? "دومين واستضافة معاً\nبأفضل الأسعار في السعودية"
                : "Domain + Hosting Together\nAt the Best Prices in Saudi Arabia"}
            </h1>
            <p className="text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
              {isAr
                ? "احصل على دومين مجاني مع كل باقة استضافة. ربط تلقائي بموقعك، SSL مجاني، ودعم عربي على مدار الساعة."
                : "Get a free domain with every hosting plan. Auto-linking to your site, free SSL, and 24/7 Arabic support."}
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              <Button size="lg" className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                onClick={() => navigate("/domains")} data-testid="btn-domains-hosting-hero">
                <Package className="w-5 h-5" />
                {isAr ? "اختر باقتك الآن" : "Choose Your Package"}
                <Arrow className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-violet-400 text-violet-200 hover:bg-violet-900/30"
                onClick={() => navigate("/auth")} data-testid="btn-login-dh-hero">
                {isAr ? "تسجيل الدخول" : "Login"}
              </Button>
            </div>
            <div className="flex justify-center gap-6 text-violet-200/70 text-sm">
              <span>✓ {isAr ? "دومين مجاني" : "Free Domain"}</span>
              <span>✓ {isAr ? "SSL مجاني" : "Free SSL"}</span>
              <span>✓ {isAr ? "ربط تلقائي" : "Auto-Link"}</span>
              <span>✓ {isAr ? "دعم 24/7" : "24/7 Support"}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Bundles ── */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">
              {isAr ? "باقات الدومين والاستضافة" : "Domain + Hosting Bundles"}
            </h2>
            <p className="text-muted-foreground">
              {isAr ? "وفّر حتى 30% عند الاشتراك في باقة مدمجة" : "Save up to 30% with a bundled package"}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {BUNDLES.map((bundle, i) => {
              const colors = colorMap[bundle.color];
              const [borderC, shadowC, textC, bgC] = colors.split(" ");
              return (
                <motion.div key={i} whileHover={{ scale: 1.02 }}>
                  <Card className={`p-6 h-full flex flex-col ${bundle.highlight
                    ? `${borderC} shadow-lg ${shadowC} ring-1`
                    : "hover:border-violet-500/40"} transition-all`}>
                    {bundle.highlight && (
                      <Badge className={`self-center mb-3 ${bgC} text-white text-xs`}>
                        {isAr ? "الأكثر توفيراً" : "Best Value"}
                      </Badge>
                    )}
                    <h3 className="text-xl font-bold text-center mb-2">{bundle.name}</h3>
                    <div className="text-center text-sm text-muted-foreground mb-1">
                      <Globe2 className={`w-4 h-4 inline ${textC}`} /> {bundle.domainExt}
                    </div>
                    <div className="text-center text-sm text-muted-foreground mb-4">
                      <Server className={`w-4 h-4 inline ${textC}`} /> {bundle.hostingPlan}
                    </div>
                    <div className="text-center mb-2">
                      <span className={`text-4xl font-extrabold ${textC}`}>{bundle.price}</span>
                      <span className="text-muted-foreground text-sm"> ريال/شهر</span>
                    </div>
                    <div className="text-center mb-6">
                      <span className="text-muted-foreground line-through text-sm">{bundle.originalPrice} ريال</span>
                      <Badge className="ms-2 bg-green-600/20 text-green-400 text-xs">
                        {isAr ? `وفّر ${bundle.save} ريال` : `Save ${bundle.save} SAR`}
                      </Badge>
                    </div>
                    <ul className="space-y-2 mb-6 flex-1">
                      {bundle.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm">
                          <Check className={`w-4 h-4 ${textC} flex-shrink-0`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button className={`w-full ${bundle.highlight ? `${bgC} hover:opacity-90` : ""}`}
                      variant={bundle.highlight ? "default" : "outline"}
                      onClick={() => navigate("/domains")}
                      data-testid={`btn-bundle-${bundle.name}`}>
                      {isAr ? "اشترِ الباقة" : "Get Bundle"}
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Why us ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            {isAr ? "لماذا تختار ArabyWeb للدومين والاستضافة؟" : "Why Choose ArabyWeb for Domain & Hosting?"}
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {WHY_US.map((f, i) => (
              <motion.div key={i} whileHover={{ y: -4 }}>
                <Card className="p-5 h-full">
                  <f.icon className="w-8 h-8 text-violet-500 mb-3" />
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {isAr ? "كيف يعمل؟" : "How Does It Work?"}
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { num: "١", title: "اختر الباقة", desc: "اختر الباقة المناسبة لاحتياجاتك" },
              { num: "٢", title: "ابحث عن الدومين", desc: "تحقق من توافر اسم دومينك المفضّل" },
              { num: "٣", title: "أتمّ الدفع", desc: "ادفع بأمان بالريال السعودي" },
              { num: "٤", title: "اربط بموقعك", desc: "الدومين والاستضافة تعملان خلال 24 ساعة" },
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-3">
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

      {/* ── FAQ ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            {isAr ? "أسئلة شائعة" : "Frequently Asked Questions"}
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
                <Card className="p-5">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-violet-500">س:</span> {item.q}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    <span className="text-violet-500 font-semibold">ج: </span>{item.a}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-4 bg-gradient-to-r from-violet-900 to-purple-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center gap-2 mb-4">
            <Globe2 className="w-10 h-10 text-violet-300" />
            <ArrowRight className="w-6 h-6 text-violet-400 self-center" />
            <Server className="w-10 h-10 text-violet-300" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            {isAr ? "أطلق موقعك مع الدومين والاستضافة اليوم" : "Launch Your Site with Domain + Hosting Today"}
          </h2>
          <p className="text-violet-200 mb-8">
            {isAr ? "دومين مجاني مع أي باقة استضافة. وفّر أكثر واحصل على أكثر." : "Free domain with any hosting plan. Save more, get more."}
          </p>
          <Button size="lg" className="bg-white text-violet-900 hover:bg-violet-50 gap-2"
            onClick={() => navigate("/domains")} data-testid="btn-cta-dh-final">
            <Package className="w-5 h-5" />
            {isAr ? "اختر باقتك الآن" : "Choose Your Package Now"}
            <Arrow className="w-4 h-4" />
          </Button>
          <p className="text-violet-300/70 text-sm mt-4">
            {isAr ? "✓ دومين مجاني ✓ SSL مجاني ✓ ربط تلقائي ✓ دعم 24/7" : "✓ Free domain ✓ Free SSL ✓ Auto-link ✓ 24/7 support"}
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 py-6 px-4 text-center text-sm text-muted-foreground">
        <p>
          © 2026 <BrandName /> — {isAr ? "باقات الدومين والاستضافة في السعودية والخليج" : "Domain & Hosting Packages in Saudi Arabia"}
        </p>
        <div className="flex gap-4 justify-center mt-2">
          <button onClick={() => navigate("/terms")} className="hover:text-primary">{isAr ? "الشروط" : "Terms"}</button>
          <button onClick={() => navigate("/privacy")} className="hover:text-primary">{isAr ? "الخصوصية" : "Privacy"}</button>
          <button onClick={() => navigate("/domain-registration-saudi")} className="hover:text-primary">{isAr ? "تسجيل دومين" : "Domain Registration"}</button>
          <button onClick={() => navigate("/web-hosting-saudi")} className="hover:text-primary">{isAr ? "استضافة مواقع" : "Web Hosting"}</button>
        </div>
      </footer>
    </div>
  );
}
