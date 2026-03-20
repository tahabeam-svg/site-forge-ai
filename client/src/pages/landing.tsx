import { useState, useEffect } from "react";
import { useSEO } from "@/hooks/use-seo";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  Palette,
  Rocket,
  Globe2,
  Smartphone,
  Search,
  ArrowRight,
  Check,
  Zap,
  ShoppingBag,
  Headphones,
  Star,
  Crown,
  Building2,
  Gem,
  TrendingUp,
  Megaphone,
  Calendar,
  Hash,
  Target,
  Menu,
  X,
  Users,
  Clock,
  CheckCircle2,
  ChevronRight,
  Play,
  Mail,
  Linkedin,
  Instagram,
  Youtube,
  MessageCircle,
  Server,
  Database,
  Store,
  Lock,
  HeadphonesIcon,
} from "lucide-react";
import { SiGoogle, SiX, SiInstagram as SiBrandInstagram, SiFacebook as SiBrandFacebook } from "react-icons/si";
import { SUPPORT_WHATSAPP_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LanguageToggle from "@/components/language-toggle";
import BrandName from "@/components/brand-name";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function LandingPage() {
  const { isAuthenticated, language } = useAuth();
  const [, navigate] = useLocation();
  const isAr = language !== "en";

  useSEO({
    title: isAr
      ? "أنشئ موقعك وسوّق أعمالك بالذكاء الاصطناعي — مجاناً في السعودية"
      : "Build & Market Your Business with AI — Free in Saudi Arabia",
    description: isAr
      ? "أنشئ موقعك الإلكتروني المجاني وسوّق أعمالك بالذكاء الاصطناعي في أقل من دقيقتين. توليد محتوى تسويقي لإنستغرام وتيك توك وتويتر تلقائياً. بدون برمجة، بدون تكلفة. الأول في السعودية."
      : "Build your free website and market your business with AI in under 2 minutes. Auto-generate marketing content for Instagram, TikTok & Twitter. No coding needed. Saudi Arabia's #1 AI platform.",
    keywords: isAr
      ? "موقع مجاني، بناء موقع الكتروني مجاني، انشاء موقع مجاني، متجر مجاني، تسويق بالذكاء الاصطناعي، محتوى تسويقي، منشورات سوشيال ميديا، موقع بالذكاء الاصطناعي، بناء موقع بدون برمجة، موقع احترافي مجاني، استضافة مجانية، منصة بناء مواقع، موقع للشركات السعودية"
      : "free website Saudi Arabia, AI website builder Arabic, free online store, AI marketing content, social media posts AI, website builder no code, free website builder",
    lang: isAr ? "ar" : "en",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": isAr ? "أنشئ موقعك وسوّق أعمالك بالذكاء الاصطناعي — ArabyWeb" : "Build & Market with AI — ArabyWeb",
      "url": "https://arabyweb.net/",
      "description": isAr
        ? "المنصة الأولى لبناء المواقع والتسويق الرقمي بالذكاء الاصطناعي في السعودية والعالم العربي"
        : "Saudi Arabia's first AI platform for website building and digital marketing",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "الرئيسية", "item": "https://arabyweb.net/" }]
      }
    }
  });

  const { data: meData } = useQuery<{ plan: string }>({
    queryKey: ["/api/me"],
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
  const userPlan = meData?.plan || "free";
  const isPaidUser = isAuthenticated && userPlan !== "free";
  const lang = language;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [typeIndex, setTypeIndex] = useState(0);

  const businessWords = {
    ar: ["مطعمك", "متجرك", "عيادتك", "شركتك", "محلّك", "خدمتك"],
    en: ["Restaurant", "Online Store", "Clinic", "Startup", "Portfolio", "Business"],
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTypeIndex(i => (i + 1) % 6);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: Sparkles, title: t("aiGeneration", lang), desc: t("aiGenerationDesc", lang), gradient: "from-violet-500 to-purple-600" },
    { icon: Palette, title: t("visualEditor", lang), desc: t("visualEditorDesc", lang), gradient: "from-pink-500 to-rose-600" },
    { icon: Rocket, title: t("instantPublish", lang), desc: t("instantPublishDesc", lang), gradient: "from-orange-500 to-amber-600" },
    { icon: Globe2, title: t("multiLanguage", lang), desc: t("multiLanguageDesc", lang), gradient: "from-green-500 to-green-600" },
    { icon: Smartphone, title: t("responsiveDesign", lang), desc: t("responsiveDesignDesc", lang), gradient: "from-blue-500 to-cyan-600" },
    { icon: Search, title: t("seoOptimized", lang), desc: t("seoOptimizedDesc", lang), gradient: "from-indigo-500 to-blue-600" },
    { icon: ShoppingBag, title: t("ecommerceFeature", lang), desc: t("ecommerceFeatureDesc", lang), gradient: "from-amber-500 to-yellow-600" },
    { icon: Headphones, title: t("support247", lang), desc: t("support247Desc", lang), gradient: "from-green-500 to-emerald-600" },
  ];

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      window.location.href = "/api/auth/google";
    }
  };

  const handlePlanCTA = (planId: string) => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    if (planId === "free") {
      navigate("/dashboard");
      return;
    }
    navigate(`/billing?plan=${planId}`);
  };

  const handleMarketingCTA = () => {
    if (isAuthenticated) {
      navigate("/marketing");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Inter', sans-serif" }}>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b" data-testid="nav-landing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 h-16">
            <button onClick={() => { navigate("/"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex items-center gap-2.5 cursor-pointer" data-testid="link-brand-home">
              <BrandName lang={lang} className="text-lg" logoSize={64} />
            </button>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-features">{t("features", lang)}</a>
              <a href="#marketing" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-marketing">{lang === "ar" ? "التسويق" : "Marketing"}</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-pricing">{t("pricing", lang)}</a>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <button
                className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              {isAuthenticated ? (
                <Button onClick={() => navigate("/dashboard")} className="hidden sm:flex bg-gradient-to-r from-green-500 to-green-600 hover:from-emerald-600 hover:to-teal-700" data-testid="button-dashboard">
                  {t("dashboard", lang)}
                </Button>
              ) : (
                <Button onClick={() => navigate("/auth")} className="hidden sm:flex bg-gradient-to-r from-green-500 to-green-600 hover:from-emerald-600 hover:to-teal-700" data-testid="button-login">
                  {t("login", lang)}
                </Button>
              )}
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur-xl px-4 py-4 space-y-3" data-testid="mobile-menu">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground py-1.5">{t("features", lang)}</a>
            <a href="#marketing" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground py-1.5">{lang === "ar" ? "التسويق" : "Marketing"}</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground py-1.5">{t("pricing", lang)}</a>
            <div className="pt-2 border-t">
              {isAuthenticated ? (
                <Button onClick={() => { setMobileMenuOpen(false); navigate("/dashboard"); }} className="w-full bg-gradient-to-r from-green-500 to-green-600" data-testid="button-dashboard-mobile">
                  {t("dashboard", lang)}
                </Button>
              ) : (
                <Button onClick={() => { setMobileMenuOpen(false); navigate("/auth"); }} className="w-full bg-gradient-to-r from-green-500 to-green-600" data-testid="button-login-mobile">
                  {t("login", lang)}
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-20 sm:pt-24 pb-0 overflow-hidden bg-zinc-950">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        {/* Gradient fade at bottom */}
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-b from-transparent to-zinc-950 pointer-events-none z-10" />
        {/* Glow orbs — pure CSS (no JS animation overhead) */}
        <div className="aw-blob aw-blob-1 absolute top-[-100px] start-[10%]" />
        <div className="aw-blob aw-blob-2 absolute top-[50px] end-[5%]" />
        <div className="aw-blob aw-blob-3 absolute bottom-[100px] start-[30%]" />

        <div className="relative z-20 max-w-5xl mx-auto px-5 sm:px-6 text-center">

          {/* ── Announcement Badge ── */}
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
            <a href="#marketing" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold
              bg-white/[0.07] border border-white/[0.12] text-white/80 hover:bg-white/[0.12] transition-colors cursor-pointer">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 relative">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
              </span>
              {lang === "ar" ? "جديد — أداة توليد المحتوى التسويقي بالذكاء الاصطناعي 🎉" : "New — AI Marketing Content Generator launched 🎉"}
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </a>
          </motion.div>

          {/* ── Headline ── */}
          <motion.h1 custom={1} initial="hidden" animate="visible" variants={fadeUp}
            className="font-black tracking-tight text-white mb-10"
            style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)", lineHeight: 1.18, letterSpacing: "-0.02em" }}
            data-testid="text-hero-title"
          >
            {lang === "ar" ? (
              <>
                <span className="block mb-1">أنشئ وسوّق</span>
                <span className="block mb-1">
                  <span className="relative inline-block">
                    <span className="relative bg-gradient-to-r from-green-400 via-green-300 to-green-600 bg-clip-text text-transparent"
                      style={{ paddingBottom: "0.15em" }}>
                      <AnimatePresence mode="wait">
                        <motion.span key={typeIndex}
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          className="inline-block">
                          {businessWords.ar[typeIndex]}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </span>
                </span>
                <span className="block text-white/95" style={{ paddingBottom: "0.1em" }}>في 90 ثانية</span>
              </>
            ) : (
              <>
                <span className="block mb-1">Build & Market</span>
                <span className="block">
                  <span className="bg-gradient-to-r from-green-400 via-green-300 to-green-600 bg-clip-text text-transparent"
                    style={{ paddingBottom: "0.1em" }}>
                    <AnimatePresence mode="wait">
                      <motion.span key={typeIndex}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="inline-block">
                        {businessWords.en[typeIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </span>
                <span className="block text-white/95" style={{ paddingBottom: "0.1em" }}>in 90 Seconds</span>
              </>
            )}
          </motion.h1>

          {/* ── Subheadline ── */}
          <motion.p custom={2} initial="hidden" animate="visible" variants={fadeUp}
            className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-9 leading-relaxed"
            data-testid="text-hero-subtitle">
            {lang === "ar"
              ? "الذكاء الاصطناعي يبني موقعك الاحترافي من وصف بسيط — وأطلق حملاتك على انستقرام وتويتر تلقائياً"
              : "AI generates your professional website from a simple description — and auto-creates your social media campaigns"}
          </motion.p>

          {/* ── Star Rating ── */}
          <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}
            className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm font-bold text-white/80">4.9/5</span>
            <span className="text-sm text-white/40">—</span>
            <span className="text-sm text-white/50">
              {lang === "ar" ? "+2,000 عميل راضٍ" : "2,000+ satisfied customers"}
            </span>
          </motion.div>

          {/* ── CTA ── */}
          <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <button
              onClick={handleCTA}
              className="relative group text-base font-bold text-white px-8 sm:px-10 py-4 rounded-2xl cursor-pointer border-0 outline-none
                bg-gradient-to-b from-green-400 via-green-500 to-green-700
                shadow-[0_5px_0_0_#0d7351,0_8px_30px_rgba(16,185,129,0.5),inset_0_1px_1px_rgba(255,255,255,0.35)]
                hover:shadow-[0_3px_0_0_#0d7351,0_5px_20px_rgba(16,185,129,0.55),inset_0_1px_1px_rgba(255,255,255,0.35)]
                hover:translate-y-[2px]
                active:shadow-[0_1px_0_0_#0d7351,0_2px_8px_rgba(16,185,129,0.3),inset_0_2px_4px_rgba(0,0,0,0.15)]
                active:translate-y-[4px]
                transition-all duration-150 ease-out overflow-hidden flex items-center justify-center gap-2.5 min-w-[220px]"
              data-testid="button-hero-cta"
            >
              <span className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
              <span className="relative flex items-center gap-2.5">
                {!isAuthenticated && <SiGoogle className="w-4.5 h-4.5" />}
                <span>{lang === "ar" ? "ابدأ مجاناً الآن" : "Get Started Free"}</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </span>
            </button>
            <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white/90 transition-colors px-4 py-3">
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                <Play className="w-3.5 h-3.5 fill-current ms-0.5" />
              </div>
              {lang === "ar" ? "شاهد كيف يعمل" : "See how it works"}
            </button>
          </motion.div>

          {/* ── Micro trust ── */}
          <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-14 text-xs text-white/35">
            {[
              { icon: CheckCircle2, text: lang === "ar" ? "لا يلزم بطاقة ائتمان" : "No credit card required" },
              { icon: CheckCircle2, text: lang === "ar" ? "نشر فوري بنقرة واحدة" : "One-click publishing" },
              { icon: CheckCircle2, text: lang === "ar" ? "+10,000 موقع تم إنشاؤه" : "10,000+ sites built" },
            ].map(({ icon: Icon, text }, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-emerald-500" />
                {text}
              </span>
            ))}
          </motion.div>

        </div>

        <div className="relative z-20 max-w-5xl mx-auto px-5 sm:px-6 text-center">

          {/* ── Browser Mockup ── */}
          <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp}
            className="relative mx-auto max-w-4xl">
            {/* Glow behind browser */}
            <div className="absolute -inset-4 bg-gradient-to-b from-green-500/20 via-green-500/10 to-transparent rounded-3xl blur-2xl pointer-events-none" />

            {/* Browser chrome */}
            <div className="relative rounded-t-2xl border border-white/[0.12] overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.15)]">
              {/* Top bar */}
              <div className="bg-zinc-900/90 backdrop-blur-sm px-4 py-3 border-b border-white/[0.08] flex items-center gap-3">
                <div className="flex gap-1.5 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 bg-zinc-800/80 border border-white/[0.08] rounded-lg px-4 py-1.5 text-xs text-white/50 max-w-xs w-full justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span dir="ltr">arabyweb.net/my-restaurant</span>
                    <span className="ms-auto text-[10px] text-emerald-400/80 font-medium">
                      {lang === "ar" ? "منشور ✓" : "Live ✓"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Generated website preview */}
              <div className="bg-zinc-900 overflow-hidden" style={{ height: "400px" }}>
                {/* Site nav */}
                <div className="bg-zinc-900/95 border-b border-white/[0.06] px-6 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600" />
                    <span className="text-white font-bold text-sm">
                      {lang === "ar" ? "مطعم الشام" : "Al-Sham Restaurant"}
                    </span>
                  </div>
                  <div className="hidden sm:flex gap-5 text-xs text-white/50">
                    <span>{lang === "ar" ? "الرئيسية" : "Home"}</span>
                    <span>{lang === "ar" ? "قائمة الطعام" : "Menu"}</span>
                    <span>{lang === "ar" ? "حجز طاولة" : "Reservations"}</span>
                    <span>{lang === "ar" ? "تواصل معنا" : "Contact"}</span>
                  </div>
                  <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg">
                    {lang === "ar" ? "احجز الآن" : "Book Now"}
                  </div>
                </div>

                {/* Site hero */}
                <div className="relative h-48 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black overflow-hidden">
                  {/* Food image mockup with gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-zinc-900/60 to-zinc-950/90" />
                  <div className="absolute inset-0 flex items-center px-8" dir={lang === "ar" ? "rtl" : "ltr"}>
                    <div className="max-w-xs">
                      <div className="text-white/40 text-xs mb-2 uppercase tracking-widest">
                        {lang === "ar" ? "منذ 1995 · الرياض" : "Since 1995 · Riyadh"}
                      </div>
                      <h2 className="text-white font-black text-2xl sm:text-3xl leading-tight mb-3">
                        {lang === "ar" ? "أصالة الطعم\nالشرقي الأصيل" : "Authentic Flavors\nof the East"}
                      </h2>
                      <div className="flex gap-2">
                        <div className="bg-amber-500 text-black text-xs font-bold px-3 py-1.5 rounded-lg">
                          {lang === "ar" ? "استكشف القائمة" : "Explore Menu"}
                        </div>
                        <div className="border border-white/30 text-white/80 text-xs font-medium px-3 py-1.5 rounded-lg">
                          {lang === "ar" ? "حجز طاولة" : "Reserve Table"}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Decorative food icons */}
                  <div className="absolute end-8 top-1/2 -translate-y-1/2 text-5xl opacity-20">🍽️</div>
                  {/* AI generation progress overlay */}
                  <motion.div className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-500/40"
                    initial={{ scaleX: 0 }} animate={{ scaleX: [0, 1, 0] }}
                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                    style={{ transformOrigin: "left" }} />
                </div>

                {/* Feature cards row */}
                <div className="px-6 py-4 grid grid-cols-3 gap-3" dir={lang === "ar" ? "rtl" : "ltr"}>
                  {[
                    { emoji: "⭐", title: lang === "ar" ? "4.9/5 تقييم" : "4.9/5 Rating", sub: lang === "ar" ? "+500 مراجعة" : "500+ reviews" },
                    { emoji: "🚀", title: lang === "ar" ? "توصيل سريع" : "Fast Delivery", sub: lang === "ar" ? "خلال 30 دقيقة" : "Within 30 min" },
                    { emoji: "📱", title: lang === "ar" ? "طلب أونلاين" : "Order Online", sub: lang === "ar" ? "متاح 24/7" : "Available 24/7" },
                  ].map((card, i) => (
                    <div key={i} className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-center">
                      <div className="text-2xl mb-1">{card.emoji}</div>
                      <div className="text-white/90 text-xs font-bold leading-tight">{card.title}</div>
                      <div className="text-white/35 text-[10px] mt-0.5">{card.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI generation label */}
            <div className="absolute -top-3 start-6 bg-zinc-950 border border-emerald-500/30 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs text-emerald-400 font-medium shadow-lg">
              <motion.div className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
              {lang === "ar" ? "تم إنشاؤه بالذكاء الاصطناعي في 87 ثانية" : "Generated by AI in 87 seconds"}
            </div>

            {/* Floating activity cards */}
            <motion.div
              className="absolute -end-4 top-12 bg-zinc-900/95 border border-white/[0.12] rounded-xl shadow-2xl px-3 py-2.5 flex items-center gap-2.5 text-xs z-20 backdrop-blur-sm"
              animate={{ y: [0, -7, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-sm shrink-0">👨‍🍳</div>
              <div>
                <p className="text-white/90 font-semibold">{lang === "ar" ? "أحمد — الرياض" : "Ahmed — Riyadh"}</p>
                <p className="text-white/45">{lang === "ar" ? "نشر موقعه قبل 3 دقائق ✨" : "Published 3 min ago ✨"}</p>
              </div>
            </motion.div>

            <motion.div
              className="absolute -start-4 bottom-16 bg-zinc-900/95 border border-white/[0.12] rounded-xl shadow-2xl px-3 py-2.5 flex items-center gap-2.5 text-xs z-20 backdrop-blur-sm"
              animate={{ y: [0, 8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm shrink-0">📱</div>
              <div>
                <p className="text-white/90 font-semibold">{lang === "ar" ? "سارة — جدة" : "Sara — Jeddah"}</p>
                <p className="text-white/45">{lang === "ar" ? "أطلقت 60 منشور تسويقي 🚀" : "Launched 60 posts campaign 🚀"}</p>
              </div>
            </motion.div>

            {/* User avatars + count at bottom */}
            <motion.div custom={7} initial="hidden" animate="visible" variants={fadeUp}
              className="flex items-center justify-center gap-3 pt-6 pb-2">
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {["🧑‍💼","👩‍💻","👨‍🍳","👩‍🔬","🧑‍🎨"].map((emoji, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-sm">
                    {emoji}
                  </div>
                ))}
              </div>
              <div className="text-sm text-white/50">
                <span className="font-bold text-white/80">+1,247</span>{" "}
                {lang === "ar" ? "انضموا هذا الأسبوع" : "joined this week"}
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>



      {/* Transition band from dark hero to light sections */}
      <section className="py-10 bg-zinc-900 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-5 sm:gap-12">
            {[
              { icon: Crown, text: t("saudiTrust1", lang) },
              { icon: Globe2, text: t("saudiTrust2", lang) },
              { icon: TrendingUp, text: t("saudiTrust3", lang) },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-white/60">
                <item.icon className="w-5 h-5 text-emerald-400" />
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Color transition to light page */}
      <div className="h-20 bg-gradient-to-b from-zinc-900 to-background" />

      <section id="marketing" className="py-14 sm:py-20 bg-gradient-to-br from-green-50/50 via-green-50/30 to-green-50/20 dark:from-green-950/20 dark:via-green-950/10 dark:to-green-950/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10 sm:mb-12">
            <motion.div custom={0} variants={fadeUp}>
              <Badge variant="secondary" className="mb-4 px-3 py-1 text-sm border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800">
                <Sparkles className="w-3.5 h-3.5 me-1.5" />
                {lang === "ar" ? "جديد" : "NEW"}
              </Badge>
            </motion.div>
            <motion.h2 custom={0} variants={fadeUp} className="text-xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4" data-testid="text-marketing-section-title">
              {lang === "ar" ? "نمِّ أعمالك مع التسويق بالذكاء الاصطناعي" : "Grow Your Business with AI Marketing"}
            </motion.h2>
            <motion.p custom={1} variants={fadeUp} className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
              {lang === "ar"
                ? "أنشئ محتوى تسويقي احترافي لوسائل التواصل الاجتماعي تلقائياً بقوة الذكاء الاصطناعي"
                : "Generate professional social media marketing content automatically powered by AI"}
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-12 max-w-4xl mx-auto">
            {[
              { icon: Megaphone, title: lang === "ar" ? "منشورات ذكية" : "Smart Posts", desc: lang === "ar" ? "محتوى مخصص لكل منصة" : "Content tailored per platform", gradient: "from-pink-500 to-rose-600" },
              { icon: Hash, title: lang === "ar" ? "هاشتاقات" : "Hashtags", desc: lang === "ar" ? "هاشتاقات رائجة تلقائياً" : "Trending hashtags auto-generated", gradient: "from-blue-500 to-indigo-600" },
              { icon: Calendar, title: lang === "ar" ? "تقويم محتوى" : "Content Calendar", desc: lang === "ar" ? "خطة نشر شهرية" : "Monthly publishing plan", gradient: "from-amber-500 to-orange-600" },
              { icon: Target, title: lang === "ar" ? "حملات" : "Campaigns", desc: lang === "ar" ? "حملات تسويقية متكاملة" : "Complete marketing campaigns", gradient: "from-green-500 to-green-600" },
            ].map((item, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}>
                <Card className="p-5 text-center h-full hover:shadow-lg hover:-translate-y-1 transition-all" data-testid={`card-marketing-feature-${i}`}>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-3`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* ── Trend Generator Announcement ── */}
          <motion.div custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="mb-12 max-w-4xl mx-auto"
          >
            <Card className="p-6 sm:p-8 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/10 overflow-hidden relative">
              <div className="absolute top-0 end-0 w-32 h-32 bg-gradient-to-br from-amber-300/20 to-orange-300/20 rounded-full -translate-y-8 translate-x-8" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge className="bg-amber-500 text-white text-xs">
                      {lang === "ar" ? "جديد · حصري Business" : "New · Business Exclusive"}
                    </Badge>
                    <Badge variant="outline" className="text-amber-700 border-amber-300 dark:text-amber-300 dark:border-amber-700 text-xs">
                      {lang === "ar" ? "2 جلسة ذكاء فقط" : "Only 2 AI sessions"}
                    </Badge>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-amber-900 dark:text-amber-100" data-testid="text-trend-announcement">
                    {lang === "ar" ? "مولّد الترند السعودي 🔥" : "Saudi Trend Generator 🔥"}
                  </h3>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mt-1 max-w-xl">
                    {lang === "ar"
                      ? "أدخل مجالك واحصل فوراً على 3 أفكار ترند جاهزة مع خطاف جذاب، كابشن، هاشتاقات، وأفضل وقت نشر — مصمَّمة للسوق السعودي والخليجي."
                      : "Enter your niche and instantly get 3 ready-to-publish trend ideas with viral hook, caption, hashtags, and best posting time — designed for the Saudi & Gulf market."}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* ── Unified Pricing ── */}
          <div id="pricing" className="pt-6">
            <div className="text-center mb-10">
              <Badge className="mb-3 px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs">
                {lang === "ar" ? "موقع + تسويق في باقة واحدة" : "Website + Marketing — One Subscription"}
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3" data-testid="text-pricing-title">
                {lang === "ar" ? "اختر الباقة المناسبة لك" : "Choose the Right Plan for You"}
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
                {lang === "ar" ? "أسعار شاملة تناسب جميع الأعمال السعودية — بدون رسوم خفية" : "All-inclusive pricing for Saudi businesses — no hidden fees"}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto items-start">
              {(() => {
                type PlatformDef = { id: string; Icon: React.ComponentType<{ className?: string }>; bg: string; label: string };
                const pricingPlans: Array<{
                  id: string; name: string; price: string; desc: string; yearly: string;
                  features: string[]; cta: string; popular: boolean; platforms?: PlatformDef[];
                }> = [
                  {
                    id: "free",
                    name: lang === "ar" ? "مجاني" : "Free",
                    price: lang === "ar" ? "مجاناً" : "Free",
                    desc: lang === "ar" ? "للبدء والتجربة" : "Perfect for getting started",
                    yearly: "",
                    features: lang === "ar"
                      ? ["موقع واحد", "2 تعديل ذكاء مجاني/موقع", "❌ لا وصول لأداة التسويق", "يتضمن شعار عربي ويب"]
                      : ["1 website", "2 free AI edits/site", "❌ No AI marketing access", "ArabyWeb badge on site"],
                    cta: lang === "ar" ? "ابدأ مجاناً" : "Get Started Free",
                    popular: false,
                  },
                  {
                    id: "pro",
                    name: lang === "ar" ? "احترافي" : "Pro",
                    price: lang === "ar" ? "49 ر.س" : "49 SAR",
                    desc: lang === "ar" ? "بناء مواقع + تسويق AI مشمول" : "Website builder + AI marketing included",
                    yearly: lang === "ar" ? "470 ر.س/سنوياً" : "470 SAR/yr",
                    popular: true,
                    features: lang === "ar"
                      ? ["10 مواقع", "5 تعديلات مجانية/موقع", "🚀 تسويق AI — منصتان", "500 جلسة ذكاء/شهر", "لوحة تحليلات · دعم 24/7", "بدون شعار عربي ويب"]
                      : ["10 websites", "5 free AI edits/site", "🚀 AI Marketing — 2 platforms", "500 AI sessions/month", "Analytics · 24/7 support", "No ArabyWeb badge"],
                    platforms: [
                      { id: "instagram", Icon: SiBrandInstagram, bg: "from-pink-500 to-purple-600", label: "Instagram" },
                      { id: "twitter", Icon: SiX, bg: "from-gray-800 to-gray-950", label: "X / Twitter" },
                    ],
                    cta: lang === "ar" ? "اشترك الآن" : "Subscribe Now",
                  },
                  {
                    id: "business",
                    name: lang === "ar" ? "أعمال" : "Business",
                    price: lang === "ar" ? "99 ر.س" : "99 SAR",
                    desc: lang === "ar" ? "قوة كاملة — تسويق AI 3 منصات" : "Full power — AI marketing on 3 platforms",
                    yearly: lang === "ar" ? "950 ر.س/سنوياً" : "950 SAR/yr",
                    features: lang === "ar"
                      ? ["30 موقعاً", "10 تعديلات مجانية/موقع", "🚀 تسويق AI — 3 منصات", "🔥 مولّد الترند السعودي", "2000 جلسة ذكاء/شهر", "قوالب حصرية · دعم أولوية 24/7", "بدون شعار عربي ويب"]
                      : ["30 websites", "10 free AI edits/site", "🚀 AI Marketing — 3 platforms", "🔥 Saudi Trend Generator", "2000 AI sessions/month", "Premium templates · Priority 24/7", "No ArabyWeb badge"],
                    platforms: [
                      { id: "instagram", Icon: SiBrandInstagram, bg: "from-pink-500 to-purple-600", label: "Instagram" },
                      { id: "twitter", Icon: SiX, bg: "from-gray-800 to-gray-950", label: "X / Twitter" },
                      { id: "facebook", Icon: SiBrandFacebook, bg: "from-blue-600 to-blue-700", label: "Facebook" },
                    ],
                    cta: lang === "ar" ? "اشترك الآن" : "Subscribe Now",
                    popular: false,
                  },
                ];
                return pricingPlans.map((plan, i) => (
                  <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} className="flex">
                    <Card className={`p-6 flex flex-col w-full relative overflow-visible transition-all duration-200 hover:shadow-xl ${plan.popular ? "border-2 border-emerald-500 shadow-lg shadow-emerald-500/10 sm:-mt-4" : "hover:-translate-y-1"}`} data-testid={`card-plan-${i}`}>
                      {plan.popular && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md whitespace-nowrap text-xs">
                          <Star className="w-3 h-3 me-1" />
                          {lang === "ar" ? "الأكثر شعبية" : "Most Popular"}
                        </Badge>
                      )}
                      <div className="text-center mb-5 mt-2">
                        <h4 className="text-xl font-bold mb-1">{plan.name}</h4>
                        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{plan.desc}</p>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className={`font-extrabold ${plan.id === "free" ? "text-3xl" : "text-4xl"}`}>{plan.price}</span>
                          {plan.id !== "free" && <span className="text-muted-foreground text-sm">{lang === "ar" ? "/شهرياً" : "/mo"}</span>}
                        </div>
                        {plan.id !== "free" && (
                          <div className="mt-2 space-y-0.5">
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{plan.yearly}</p>
                            <p className="text-[10px] text-muted-foreground">{lang === "ar" ? "* لا تشمل ضريبة القيمة المضافة ١٥٪" : "* Excl. 15% VAT"}</p>
                          </div>
                        )}
                      </div>
                      <div className="border-t mb-5" />
                      <div className="space-y-3 mb-6 flex-1">
                        {plan.features.map((f, j) => {
                          const isMarketing = f.startsWith("🚀") && plan.platforms && plan.platforms.length > 0;
                          const isBad = f.startsWith("❌");
                          const isTrend = f.startsWith("🔥");
                          return (
                            <div key={j} className={`flex items-start gap-2.5 text-sm ${isTrend ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-2.5 py-1.5 -mx-0.5" : ""}`}>
                              {isBad ? (
                                <span className="w-4 h-4 shrink-0 mt-0.5 text-xs flex items-center justify-center text-red-500 font-bold">✕</span>
                              ) : isTrend ? (
                                <span className="shrink-0 mt-0.5 text-sm leading-none">🔥</span>
                              ) : (
                                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              )}
                              {isMarketing ? (
                                <div className="flex items-center gap-2 flex-wrap min-w-0">
                                  <span className="font-medium">{lang === "ar" ? "تسويق AI" : "AI Marketing"}</span>
                                  <div className="flex items-center gap-1">
                                    {plan.platforms!.map((p) => (
                                      <div key={p.id} title={p.label} className={`w-[22px] h-[22px] rounded-full bg-gradient-to-br ${p.bg} flex items-center justify-center shadow-sm`}>
                                        <p.Icon className="w-3 h-3 text-white" />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : isTrend ? (
                                <span className="font-semibold text-amber-700 dark:text-amber-300">{f.replace("🔥 ", "")}</span>
                              ) : (
                                <span className={isBad ? "text-muted-foreground" : ""}>{f.replace("❌ ", "")}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <Button
                        variant={plan.popular ? "default" : "outline"}
                        size="lg"
                        className={`w-full font-semibold ${plan.popular ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-emerald-600 hover:to-teal-700 shadow-md" : ""}`}
                        onClick={() => handlePlanCTA(plan.id)}
                        data-testid={`button-plan-${i}`}
                      >
                        {plan.cta}
                      </Button>
                    </Card>
                  </motion.div>
                ));
              })()}
            </div>
            <div className="flex items-center justify-center gap-5 sm:gap-8 mt-8 flex-wrap">
              {[
                { icon: "🔒", text: lang === "ar" ? "دفع آمن — Paymob" : "Secure payment — Paymob" },
                { icon: "💳", text: lang === "ar" ? "بدون رسوم خفية" : "No hidden fees" },
                { icon: "💬", text: lang === "ar" ? "دعم فني 24/7" : "24/7 Support" },
              ].map((g, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>{g.icon}</span>
                  <span>{g.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-14 sm:py-20 aw-below-fold">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10 sm:mb-16">
            <motion.h2 custom={0} variants={fadeUp} className="text-xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4" data-testid="text-features-title">
              {t("features", lang)}
            </motion.h2>
            <motion.p custom={1} variants={fadeUp} className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
              {lang === "ar"
                ? "كل ما تحتاجه لإنشاء مواقع ويب احترافية تناسب السوق السعودي والعربي"
                : "Everything you need to create professional websites for the Saudi and Arab market"}
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={scaleIn}
              >
                <Card className="p-4 sm:p-6 h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center sm:text-start" data-testid={`card-feature-${i}`}>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 sm:mb-4 shadow-lg mx-auto sm:mx-0`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technical Support Section ── */}
      <section className="py-12 sm:py-16 bg-white dark:bg-zinc-900 border-t border-border">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-8">
            <Badge className="mb-3 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700">
              <HeadphonesIcon className="w-3 h-3 me-1.5" />
              {lang === "ar" ? "دعم فني متخصص" : "Expert Technical Support"}
            </Badge>
            <motion.h2 custom={0} variants={fadeUp} className="text-xl sm:text-3xl font-bold mb-3" data-testid="text-tech-support-title">
              {lang === "ar" ? "فريقنا معك في كل خطوة" : "Our Team Is With You Every Step"}
            </motion.h2>
            <motion.p custom={1} variants={fadeUp} className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              {lang === "ar"
                ? "نقدم خدمات دعم فني شاملة لرفع مواقعك على الاستضافات، وبناء المنصات الرقمية المعقدة والمتاجر الإلكترونية الضخمة التي تحتاج إلى قواعد بيانات متطورة."
                : "We offer comprehensive technical support services for deploying your websites to hosting, building complex digital platforms and large e-commerce stores requiring advanced databases."}
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              {
                icon: Server,
                title: lang === "ar" ? "رفع على الاستضافة" : "Hosting Deployment",
                desc: lang === "ar" ? "نساعدك في نقل موقعك ورفعه على أي استضافة باحترافية" : "We help you migrate and deploy your site to any hosting professionally",
                gradient: "from-blue-500 to-cyan-600",
              },
              {
                icon: Store,
                title: lang === "ar" ? "متاجر إلكترونية ضخمة" : "Large E-commerce Stores",
                desc: lang === "ar" ? "بناء متاجر إلكترونية متكاملة بكل الميزات والمتطلبات" : "Build full-featured e-commerce stores with all requirements",
                gradient: "from-green-500 to-green-600",
              },
              {
                icon: Database,
                title: lang === "ar" ? "منصات معقدة" : "Complex Platforms",
                desc: lang === "ar" ? "تصميم وتطوير منصات رقمية بقواعد بيانات متطورة ومعقدة" : "Design and develop digital platforms with advanced complex databases",
                gradient: "from-violet-500 to-purple-600",
              },
            ].map((item, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Card className="p-5 h-full text-center hover:shadow-md transition-shadow">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-3`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2 text-sm">{item.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex flex-col items-center gap-3">
            {isPaidUser ? (
              <>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  {lang === "ar" ? "أنت مشترك — تواصل معنا مباشرة:" : "You're subscribed — contact us directly:"}
                </p>
                <a
                  href={SUPPORT_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20b858] text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-md text-sm"
                  data-testid="link-landing-whatsapp"
                >
                  <MessageCircle className="w-5 h-5" />
                  {lang === "ar" ? "تواصل عبر واتساب الآن" : "Chat on WhatsApp Now"}
                </a>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-2 rounded-full border border-dashed border-muted-foreground/30">
                  <Lock className="w-3.5 h-3.5" />
                  {lang === "ar" ? "رقم واتساب متاح للمشتركين بالباقات المدفوعة فقط" : "WhatsApp number available to paid plan subscribers only"}
                </div>
                <Button
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                  onClick={() => navigate(isAuthenticated ? "/billing" : "/auth")}
                  data-testid="button-upgrade-support"
                >
                  {lang === "ar" ? "اشترك للوصول للدعم المباشر" : "Subscribe for Direct Support"}
                  <ArrowRight className="w-4 h-4 ms-1.5" />
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-gradient-to-br from-green-500 to-green-600">
        <div className="max-w-4xl mx-auto px-5 text-center text-white">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4"
          >
            {t("ctaTitle", lang)}
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
            className="text-base sm:text-lg opacity-90 mb-6 sm:mb-8 leading-relaxed"
          >
            {t("ctaSubtitle", lang)}
          </motion.p>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
            <Button
              size="lg"
              variant="secondary"
              onClick={handleCTA}
              className="text-base px-8"
              data-testid="button-cta-bottom"
            >
              {!isAuthenticated && <SiGoogle className="w-4 h-4 me-2" />}
              {t("getStarted", lang)}
              <ArrowRight className="w-4 h-4 ms-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      <footer className="border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

          {/* ── Brand row (full width on mobile, left col on desktop) ── */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-8 sm:gap-12 mb-8 sm:mb-12">

            {/* Brand: logo + tagline + socials */}
            <div className="flex-shrink-0 flex flex-col items-center sm:items-start text-center sm:text-start sm:w-64">
              <BrandName lang={lang} className="text-xl mb-2" logoSize={56} />
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-xs">
                {lang === "ar"
                  ? "المنصة الأولى لبناء المواقع بالذكاء الاصطناعي في العالم العربي"
                  : "The #1 AI website builder for the Arab world"}
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                {[
                  { icon: SiX, href: "https://x.com/arabyweb", label: "X" },
                  { icon: Linkedin, href: "https://linkedin.com/company/arabyweb", label: "LinkedIn" },
                  { icon: Instagram, href: "https://instagram.com/arabyweb", label: "Instagram" },
                  { icon: Youtube, href: "https://youtube.com/@arabyweb", label: "YouTube" },
                ].map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-8 h-8 rounded-lg bg-background border flex items-center justify-center text-muted-foreground hover:text-emerald-600 hover:border-emerald-400 transition-all"
                    data-testid={`link-social-${label.toLowerCase()}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
                <a
                  href="mailto:support@arabyweb.net"
                  aria-label="Email"
                  className="w-8 h-8 rounded-lg bg-background border flex items-center justify-center text-muted-foreground hover:text-emerald-600 hover:border-emerald-400 transition-all"
                  data-testid="link-social-email"
                >
                  <Mail className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Links: 2-col grid on mobile, flex row on desktop */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 flex-1 sm:flex sm:flex-row sm:gap-12">

              {/* Product */}
              <div>
                <h4 className="font-semibold mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                  {lang === "ar" ? "المنتج" : "Product"}
                </h4>
                <ul className="space-y-2.5 text-sm">
                  <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-features">{lang === "ar" ? "المميزات" : "Features"}</a></li>
                  <li><a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-pricing">{lang === "ar" ? "الأسعار" : "Pricing"}</a></li>
                  <li><a href="/ai-builder" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-builder">{lang === "ar" ? "أنشئ موقعك" : "AI Builder"}</a></li>
                  <li><a href="/ai-website-builder" className="text-muted-foreground hover:text-foreground transition-colors">{lang === "ar" ? "بناء مواقع AI" : "AI Websites"}</a></li>
                  <li><a href="/digital-marketing-ai" className="text-muted-foreground hover:text-foreground transition-colors">{lang === "ar" ? "التسويق الرقمي" : "Digital Marketing"}</a></li>
                  <li><a href="/website-saudi-arabia" className="text-muted-foreground hover:text-foreground transition-colors">{lang === "ar" ? "مواقع الخليج" : "Gulf Websites"}</a></li>
                  <li><a href="/blog" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-blog">{lang === "ar" ? "المدونة" : "Blog"}</a></li>
                  <li><a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-dashboard">{lang === "ar" ? "مواقعي" : "My Sites"}</a></li>
                </ul>
              </div>

              {/* Support & Policies */}
              <div>
                <h4 className="font-semibold mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                  {lang === "ar" ? "الدعم" : "Support"}
                </h4>
                <ul className="space-y-2.5 text-sm">
                  <li><a href="/faq" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-faq">{lang === "ar" ? "الأسئلة الشائعة" : "FAQ"}</a></li>
                  <li><a href="mailto:support@arabyweb.net" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-contact">{lang === "ar" ? "تواصل معنا" : "Contact"}</a></li>
                  <li><a href="/blog/website-design-prices-saudi-arabia-2026" className="text-muted-foreground hover:text-foreground transition-colors">{lang === "ar" ? "أسعار التصميم" : "Pricing Guide"}</a></li>
                  <li><a href="/blog/seo-guide-arabic-websites-2026" className="text-muted-foreground hover:text-foreground transition-colors">{lang === "ar" ? "دليل SEO" : "SEO Guide"}</a></li>
                  <li><a href="/blog/start-online-business-saudi-arabia-2026" className="text-muted-foreground hover:text-foreground transition-colors">{lang === "ar" ? "ابدأ مشروعك" : "Start Business"}</a></li>
                  <li><a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-terms">{lang === "ar" ? "شروط الاستخدام" : "Terms"}</a></li>
                  <li><a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-privacy">{lang === "ar" ? "سياسة الخصوصية" : "Privacy"}</a></li>
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t bg-muted/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-1.5">
            <p className="text-xs text-muted-foreground">
              &copy; 2026 {t("brand", lang)}. {lang === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{lang === "ar" ? "صُنع بـ" : "Made with"}</span>
              <span className="text-emerald-500 mx-0.5">♥</span>
              <span>{lang === "ar" ? "للعالم العربي" : "for the Arab world"}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
