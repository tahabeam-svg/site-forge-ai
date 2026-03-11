import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useLocation } from "wouter";
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
} from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LanguageToggle from "@/components/language-toggle";

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
  const lang = language;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    { icon: Sparkles, title: t("aiGeneration", lang), desc: t("aiGenerationDesc", lang), gradient: "from-violet-500 to-purple-600" },
    { icon: Palette, title: t("visualEditor", lang), desc: t("visualEditorDesc", lang), gradient: "from-pink-500 to-rose-600" },
    { icon: Rocket, title: t("instantPublish", lang), desc: t("instantPublishDesc", lang), gradient: "from-orange-500 to-amber-600" },
    { icon: Globe2, title: t("multiLanguage", lang), desc: t("multiLanguageDesc", lang), gradient: "from-emerald-500 to-teal-600" },
    { icon: Smartphone, title: t("responsiveDesign", lang), desc: t("responsiveDesignDesc", lang), gradient: "from-blue-500 to-cyan-600" },
    { icon: Search, title: t("seoOptimized", lang), desc: t("seoOptimizedDesc", lang), gradient: "from-indigo-500 to-blue-600" },
    { icon: ShoppingBag, title: t("ecommerceFeature", lang), desc: t("ecommerceFeatureDesc", lang), gradient: "from-amber-500 to-yellow-600" },
    { icon: Headphones, title: t("support247", lang), desc: t("support247Desc", lang), gradient: "from-green-500 to-emerald-600" },
  ];

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
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
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Globe2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent" data-testid="text-brand">
                {t("brand", lang)}
              </span>
            </button>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-features">{t("features", lang)}</a>
              <a href="#marketing" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-marketing">{lang === "ar" ? "التسويق" : "Marketing"}</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-pricing">{t("pricing", lang)}</a>
              <a href="/templates" onClick={(e) => { e.preventDefault(); navigate("/templates"); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-templates">{t("templates", lang)}</a>
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
                <Button onClick={() => navigate("/dashboard")} className="hidden sm:flex bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700" data-testid="button-dashboard">
                  {t("dashboard", lang)}
                </Button>
              ) : (
                <Button onClick={() => navigate("/auth")} className="hidden sm:flex bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700" data-testid="button-login">
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
            <a href="/templates" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigate("/templates"); }} className="block text-sm text-muted-foreground hover:text-foreground py-1.5">{t("templates", lang)}</a>
            <div className="pt-2 border-t">
              {isAuthenticated ? (
                <Button onClick={() => { setMobileMenuOpen(false); navigate("/dashboard"); }} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600" data-testid="button-dashboard-mobile">
                  {t("dashboard", lang)}
                </Button>
              ) : (
                <Button onClick={() => { setMobileMenuOpen(false); navigate("/auth"); }} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600" data-testid="button-login-mobile">
                  {t("login", lang)}
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-20 sm:pt-28 pb-14 sm:pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.04] via-violet-500/[0.04] to-amber-500/[0.04]" />
        <motion.div className="absolute top-0 start-[5%] w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none"
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute top-10 end-[5%] w-[400px] h-[400px] bg-violet-400/10 rounded-full blur-[100px] pointer-events-none"
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
        <motion.div className="absolute bottom-0 start-[30%] w-[350px] h-[350px] bg-teal-400/8 rounded-full blur-[80px] pointer-events-none"
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }} />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* ── Text Column ── */}
            <motion.div
              className="flex flex-col items-center text-center lg:items-start lg:text-start order-2 lg:order-1"
              initial="hidden" animate="visible" variants={{ hidden: {}, visible: {} }}
            >
              {/* Badge */}
              <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="mb-5 sm:mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium
                  bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300
                  border border-emerald-200/70 dark:border-emerald-700/50 shadow-sm" data-testid="badge-new">
                  <Zap className="w-3.5 h-3.5 shrink-0" />
                  {t("heroBadge", lang)}
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                custom={1} initial="hidden" animate="visible" variants={fadeUp}
                className="font-extrabold tracking-tight mb-5 sm:mb-6"
                data-testid="text-hero-title"
              >
                <span className="block text-foreground" style={{ fontSize: "clamp(2.6rem, 6vw, 4.5rem)", lineHeight: 1.15 }}>
                  {lang === "ar" ? "أنشئ موقعك" : "Build Your Website"}
                </span>
                <span
                  className="block bg-gradient-to-l from-emerald-500 via-teal-500 to-emerald-600 bg-clip-text text-transparent"
                  style={{ fontSize: "clamp(2.6rem, 6vw, 4.5rem)", lineHeight: 1.2, paddingBottom: "0.15em" }}
                >
                  {lang === "ar" ? "بالذكاء الاصطناعي" : "with AI — Free"}
                </span>
                <span className="block text-muted-foreground font-semibold mt-1"
                  style={{ fontSize: "clamp(1rem, 2vw, 1.35rem)", lineHeight: 1.6 }}>
                  {lang === "ar" ? "وأطلق محتوى السوشيال ميديا في دقائق" : "Launch social media content in minutes"}
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                custom={2} initial="hidden" animate="visible" variants={fadeUp}
                className="text-base sm:text-lg text-muted-foreground max-w-lg mb-7 sm:mb-9 leading-[1.8]"
                data-testid="text-hero-subtitle"
              >
                {t("subtitle", lang)}
              </motion.p>

              {/* CTA */}
              <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-5 w-full">
                <button
                  onClick={handleCTA}
                  className="relative text-base font-semibold text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl cursor-pointer border-0 outline-none
                    bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600
                    shadow-[0_5px_0_0_#0d7351,0_7px_18px_rgba(16,185,129,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)]
                    hover:shadow-[0_3px_0_0_#0d7351,0_5px_14px_rgba(16,185,129,0.45),inset_0_1px_1px_rgba(255,255,255,0.3)]
                    hover:translate-y-[2px]
                    active:shadow-[0_1px_0_0_#0d7351,0_2px_6px_rgba(16,185,129,0.3),inset_0_2px_4px_rgba(0,0,0,0.15)]
                    active:translate-y-[4px]
                    transition-all duration-150 ease-out
                    group overflow-hidden flex items-center justify-center gap-2"
                  data-testid="button-hero-cta"
                >
                  <span className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                  <span className="relative flex items-center gap-2">
                    {!isAuthenticated && <SiGoogle className="w-4.5 h-4.5" />}
                    {t("getStarted", lang)}
                    <ArrowRight className="w-4.5 h-4.5" />
                  </span>
                </button>
              </motion.div>

              {/* Trust badges */}
              <motion.div custom={3.5} initial="hidden" animate="visible" variants={fadeUp}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-sm text-muted-foreground mb-9 sm:mb-11">
                {[
                  { icon: Check, color: "text-emerald-500", text: lang === "ar" ? "بدون بطاقة ائتمان" : "No credit card" },
                  { icon: Check, color: "text-violet-500", text: lang === "ar" ? "خطة مجانية دائماً" : "Free forever plan" },
                  { icon: Check, color: "text-amber-500", text: lang === "ar" ? "تسجيل بجوجل" : "Google sign-in" },
                ].map(({ icon: Icon, color, text }, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${color}`} />
                    {text}
                  </span>
                ))}
              </motion.div>

              {/* Stats */}
              <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-sm lg:max-w-none">
                {[
                  { value: "10,000+", label: lang === "ar" ? "موقع تم إنشاؤه" : "Websites Created", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-800/40" },
                  { value: "< 2 min", label: lang === "ar" ? "وقت الإنشاء" : "Build Time", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/40 border-violet-100 dark:border-violet-800/40" },
                  { value: "100%", label: lang === "ar" ? "للسوق السعودي" : "Arabic-first", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-800/40" },
                ].map((stat, i) => (
                  <div key={i} className={`text-center rounded-xl p-3 sm:p-4 border ${stat.bg}`} data-testid={`stat-${i}`}>
                    <div className={`font-extrabold ${stat.color} leading-none mb-1`} style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)" }} dir="ltr">
                      {stat.value}
                    </div>
                    <div className="text-[0.65rem] sm:text-xs text-muted-foreground leading-snug font-medium">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* ── Visual Column ── */}
            <motion.div
              custom={2} initial="hidden" animate="visible" variants={fadeUp}
              className="order-1 lg:order-2 relative"
            >
              {/* Glow */}
              <div className="absolute -inset-6 bg-gradient-to-br from-emerald-500/15 via-violet-500/10 to-amber-500/10 rounded-3xl blur-3xl pointer-events-none" />

              {/* Browser window */}
              <div className="relative rounded-2xl border-2 border-border/60 overflow-hidden shadow-2xl bg-card">
                {/* Browser chrome */}
                <div className="bg-muted/80 backdrop-blur-sm px-4 py-2.5 border-b border-border/60 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/90" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/90" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/90" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="text-xs text-muted-foreground bg-background/80 border border-border/50 rounded-md px-3 py-1 inline-flex items-center gap-1.5 min-w-[160px] justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      arabyweb.net
                    </div>
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="bg-gradient-to-br from-background to-muted/30 p-5 sm:p-7">
                  {/* AI prompt area */}
                  <div className="mb-5 rounded-xl border border-border/70 bg-background p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">{lang === "ar" ? "أنشئ موقعك بالذكاء الاصطناعي" : "Generate with AI"}</span>
                    </div>
                    <div className="bg-muted/60 rounded-lg px-3 py-2.5 text-sm text-muted-foreground border border-border/40" dir="rtl">
                      {lang === "ar" ? "مطعم شاورما في الرياض، قائمة طعام وحجز طاولات..." : "A modern restaurant in Riyadh with menu and reservations..."}
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        animate={{ width: ["0%", "85%", "100%", "0%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }} />
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                      <Sparkles className="w-3 h-3" />
                      <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        {lang === "ar" ? "جاري إنشاء موقعك..." : "Generating your website..."}
                      </motion.span>
                    </div>
                  </div>

                  {/* Website cards */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { gradient: "from-emerald-500 to-teal-600", icon: Building2, name: lang === "ar" ? "مطعم الرياض" : "Riyadh Restaurant", status: lang === "ar" ? "منشور" : "Live", statusColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" },
                      { gradient: "from-violet-500 to-purple-600", icon: Gem, name: lang === "ar" ? "متجر الجوهرة" : "Gem Store", status: lang === "ar" ? "مسودة" : "Draft", statusColor: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-400" },
                    ].map((card, i) => (
                      <div key={i} className="bg-background rounded-xl p-3 border border-border/60 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`w-full h-20 sm:h-24 bg-gradient-to-br ${card.gradient} rounded-lg mb-3 flex items-center justify-center`}>
                          <card.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white/70" />
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-foreground truncate">{card.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${card.statusColor}`}>{card.status}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full mt-2 w-4/5" />
                      </div>
                    ))}
                  </div>

                  {/* Bottom bar */}
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
                    <span className="flex items-center gap-1.5">
                      <Globe2 className="w-3.5 h-3.5 text-emerald-500" />
                      {lang === "ar" ? "٢ موقع نشط" : "2 active sites"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      {lang === "ar" ? "٥ كريدت متبقي" : "5 credits left"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-violet-500" />
                      {lang === "ar" ? "١٢٤ زيارة" : "124 visits"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <motion.div
                className="absolute -top-4 -end-4 sm:-top-5 sm:-end-5 bg-white dark:bg-zinc-900 border border-border shadow-lg rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-semibold z-10"
                animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span className="text-foreground">{lang === "ar" ? "موقع جاهز في ٩٠ ثانية" : "Site ready in 90 sec"}</span>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -start-4 sm:-bottom-5 sm:-start-5 bg-white dark:bg-zinc-900 border border-border shadow-lg rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-semibold z-10"
                animate={{ y: [0, 6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Star className="w-3 h-3 text-white" />
                </div>
                <span className="text-foreground">{lang === "ar" ? "+١٠٠٠ موقع هذا الأسبوع" : "+1000 sites this week"}</span>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-10">
            {[
              { icon: Crown, text: t("saudiTrust1", lang) },
              { icon: Globe2, text: t("saudiTrust2", lang) },
              { icon: TrendingUp, text: t("saudiTrust3", lang) },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <item.icon className="w-5 h-5 text-emerald-500" />
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="marketing" className="py-14 sm:py-20 bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-cyan-50/50 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-cyan-950/20">
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
              { icon: Target, title: lang === "ar" ? "حملات" : "Campaigns", desc: lang === "ar" ? "حملات تسويقية متكاملة" : "Complete marketing campaigns", gradient: "from-emerald-500 to-teal-600" },
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 max-w-4xl mx-auto">
            {[
              {
                name: lang === "ar" ? "المبتدئ" : "Starter",
                price: "35 ر.س",
                yearly: "336 ر.س",
                features: lang === "ar"
                  ? ["20 منشور شهرياً", "تعليقات وهاشتاقات", "أفكار تسويقية أساسية"]
                  : ["20 posts/month", "Captions & hashtags", "Basic marketing ideas"],
              },
              {
                name: lang === "ar" ? "النمو" : "Growth",
                price: "69 ر.س",
                yearly: "662 ر.س",
                popular: true,
                features: lang === "ar"
                  ? ["60 منشور شهرياً", "تقويم محتوى", "أفكار حملات", "محتوى تفاعلي"]
                  : ["60 posts/month", "Content calendar", "Campaign ideas", "Engagement content"],
              },
              {
                name: lang === "ar" ? "احترافي" : "Pro Marketing",
                price: "149 ر.س",
                yearly: "1,430 ر.س",
                features: lang === "ar"
                  ? ["منشورات غير محدودة", "نصوص تسويقية متقدمة", "حملات إطلاق منتجات", "استراتيجيات تسويقية"]
                  : ["Unlimited posts", "Advanced copy", "Product launch campaigns", "Marketing strategies"],
              },
            ].map((plan, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}>
                <Card className={`p-5 h-full relative overflow-visible ${plan.popular ? "border-2 border-purple-500 shadow-lg shadow-purple-500/10 mt-4" : ""}`} data-testid={`card-marketing-plan-${i}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 start-3 sm:start-auto sm:left-1/2 sm:-translate-x-1/2 px-3 bg-gradient-to-r from-purple-500 to-indigo-600 whitespace-nowrap">
                      <Star className="w-3 h-3 me-1" />
                      {lang === "ar" ? "الأكثر شعبية" : "Most Popular"}
                    </Badge>
                  )}
                  <div className="text-center mb-4">
                    <h4 className="font-semibold mb-1">{plan.name}</h4>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground text-sm">/شهرياً</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {`${plan.yearly}/سنوياً`}
                    </p>
                  </div>
                  <div className="space-y-2 mb-4">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-center justify-center sm:justify-start gap-2 text-sm">
                        <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className={`w-full ${plan.popular ? "bg-gradient-to-r from-purple-500 to-indigo-600" : ""}`}
                    onClick={handleMarketingCTA}
                    data-testid={`button-marketing-plan-${i}`}
                  >
                    {lang === "ar" ? "ابدأ التسويق" : "Start Marketing"}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-14 sm:py-20">
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

      <section id="pricing" className="py-14 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10 sm:mb-16">
            <motion.h2 custom={0} variants={fadeUp} className="text-xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4" data-testid="text-pricing-title">
              {t("pricing", lang)}
            </motion.h2>
            <motion.p custom={1} variants={fadeUp} className="text-muted-foreground text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
              {lang === "ar"
                ? "أسعار تنافسية تناسب جميع الأعمال السعودية"
                : "Competitive pricing for all Saudi businesses"}
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto">
            {[
              {
                id: "free",
                name: t("freePlan", lang),
                price: t("freePlanPrice", lang),
                desc: t("freePlanDesc", lang),
                features: [t("free1", lang), t("free2", lang), t("free3", lang), t("free4", lang)],
                cta: t("currentPlan", lang),
                popular: false,
              },
              {
                id: "pro",
                name: t("proPlan", lang),
                price: t("proPlanPrice", lang),
                desc: t("proPlanDesc", lang),
                features: [t("pro1", lang), t("pro2", lang), t("pro3", lang), t("pro4", lang)],
                cta: t("upgrade", lang),
                popular: true,
              },
              {
                id: "business",
                name: t("businessPlan", lang),
                price: t("businessPlanPrice", lang),
                desc: t("businessPlanDesc", lang),
                features: [t("business1", lang), t("business2", lang), t("business3", lang), t("business4", lang)],
                cta: t("upgrade", lang),
                popular: false,
              },
            ].map((plan, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={scaleIn}
              >
                <Card
                  className={`p-6 h-full relative overflow-visible hover:shadow-lg transition-shadow ${plan.popular ? "border-2 border-emerald-500 shadow-lg shadow-emerald-500/10 mt-4" : ""}`}
                  data-testid={`card-plan-${i}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 start-3 sm:start-auto sm:left-1/2 sm:-translate-x-1/2 px-3 bg-gradient-to-r from-emerald-500 to-teal-600 whitespace-nowrap">
                      <Star className="w-3 h-3 me-1" />
                      {lang === "ar" ? "الأكثر شعبية" : "Most Popular"}
                    </Badge>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.price !== "مجاناً" && <span className="text-muted-foreground">{t("perMonth", lang)}</span>}
                    </div>
                    {plan.price !== "مجاناً" && (
                      <p className="text-[10px] text-muted-foreground">
                        {lang === "ar" ? "* لا تشمل ضريبة القيمة المضافة" : "* Excl. VAT"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3 mb-6">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-center justify-center sm:justify-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className={`w-full ${plan.popular ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700" : ""}`}
                    onClick={() => handlePlanCTA(plan.id)}
                    data-testid={`button-plan-${i}`}
                  >
                    {plan.cta}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-gradient-to-br from-emerald-500 to-teal-600">
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

      <footer className="py-12 border-t bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Globe2 className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {t("brand", lang)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {lang === "ar"
                  ? "المنصة الأولى لبناء المواقع بالذكاء الاصطناعي في العالم العربي"
                  : "The #1 AI website builder for the Arab world"}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
                {lang === "ar" ? "المنتج" : "Product"}
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-features">{lang === "ar" ? "المميزات" : "Features"}</a></li>
                <li><a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-pricing">{lang === "ar" ? "الأسعار" : "Pricing"}</a></li>
                <li><a href="/templates" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-templates">{lang === "ar" ? "القوالب" : "Templates"}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
                {lang === "ar" ? "الدعم" : "Support"}
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="/faq" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-faq">{lang === "ar" ? "الأسئلة المتكررة" : "FAQ"}</a></li>
                <li><a href="mailto:support@arabyweb.net" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-contact">{lang === "ar" ? "تواصل معنا" : "Contact Us"}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
                {lang === "ar" ? "قانوني" : "Legal"}
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-terms">{lang === "ar" ? "شروط الاستخدام" : "Terms of Service"}</a></li>
                <li><a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-privacy">{lang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              &copy; 2026 {t("brand", lang)}. {lang === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"}.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a href="/terms" className="hover:text-foreground transition-colors">{lang === "ar" ? "الشروط" : "Terms"}</a>
              <span className="text-muted-foreground/40">|</span>
              <a href="/privacy" className="hover:text-foreground transition-colors">{lang === "ar" ? "الخصوصية" : "Privacy"}</a>
              <span className="text-muted-foreground/40">|</span>
              <a href="/faq" className="hover:text-foreground transition-colors">{lang === "ar" ? "الأسئلة" : "FAQ"}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
