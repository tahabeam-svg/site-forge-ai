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

      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
            <Badge variant="secondary" className="mb-5 sm:mb-6 px-3 sm:px-4 py-1.5 text-xs sm:text-sm border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 max-w-[90vw] text-center" data-testid="badge-new">
              <Zap className="w-3.5 h-3.5 me-1 sm:me-1.5 shrink-0" />
              {t("heroBadge", lang)}
            </Badge>
          </motion.div>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="font-extrabold tracking-tight mb-5 sm:mb-6"
            data-testid="text-hero-title"
          >
            <span className="block text-[2.2rem] leading-[1.2] sm:text-5xl lg:text-7xl bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent sm:leading-tight">
              {t("tagline", lang)}
            </span>
            <span className="block text-lg sm:text-xl lg:text-2xl mt-3 sm:mt-3 font-medium bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent leading-relaxed" style={{ fontFamily: "'Inter', 'Tajawal', sans-serif" }}>
              {t("taglineSub", lang)}
            </span>
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed px-1"
            data-testid="text-hero-subtitle"
          >
            {t("subtitle", lang)}
          </motion.p>

          <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={handleCTA}
              className="text-base sm:text-base px-8 py-6 sm:py-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 rounded-xl"
              data-testid="button-hero-cta"
            >
              {!isAuthenticated && <SiGoogle className="w-4 h-4 me-2" />}
              {t("getStarted", lang)}
              <ArrowRight className="w-4 h-4 ms-2" />
            </Button>
          </motion.div>

          <motion.div custom={3.5} initial="hidden" animate="visible" variants={fadeUp} className="mt-6 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 text-sm sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              {lang === "ar" ? "بدون بطاقة ائتمان" : "No credit card required"}
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              {lang === "ar" ? "مجاني للأبد" : "Free forever plan"}
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              {lang === "ar" ? "تسجيل دخول بحساب جوجل" : "Sign in with Google"}
            </span>
          </motion.div>

          <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="mt-10 sm:mt-16">
            <div className="grid grid-cols-3 gap-3 sm:gap-8 max-w-md sm:max-w-lg mx-auto">
              {[
                { value: t("heroStat1", lang), label: t("heroStat1Label", lang) },
                { value: t("heroStat2", lang), label: t("heroStat2Label", lang) },
                { value: t("heroStat3", lang), label: t("heroStat3Label", lang) },
              ].map((stat, i) => (
                <div key={i} className="text-center bg-card border rounded-xl p-3 sm:p-0 sm:border-0 sm:bg-transparent" data-testid={`stat-${i}`}>
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1 leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp} className="mt-10 sm:mt-16 relative max-w-4xl mx-auto hidden sm:block">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-2xl blur-2xl" />
            <Card className="relative rounded-xl border-2 overflow-hidden">
              <div className="bg-card p-3 border-b flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xs text-muted-foreground bg-muted rounded-md px-3 py-1 inline-block">arabyweb.net/dashboard</div>
                </div>
              </div>
              <div className="p-6 sm:p-10 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background rounded-lg p-4 border">
                    <div className="w-full h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-md mb-3 flex items-center justify-center">
                      <Building2 className="w-10 h-10 text-white/60" />
                    </div>
                    <div className="h-3 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-2 bg-muted rounded w-1/2" />
                  </div>
                  <div className="bg-background rounded-lg p-4 border">
                    <div className="w-full h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-md mb-3 flex items-center justify-center">
                      <Gem className="w-10 h-10 text-white/60" />
                    </div>
                    <div className="h-3 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-2 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.p custom={6} initial="hidden" animate="visible" variants={fadeUp} className="mt-8 text-sm text-muted-foreground hidden sm:block">
            {t("trustedBy", lang)}
          </motion.p>
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
                <Card className={`p-5 h-full relative ${plan.popular ? "border-2 border-purple-500 shadow-lg shadow-purple-500/10" : ""}`} data-testid={`card-marketing-plan-${i}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 bg-gradient-to-r from-purple-500 to-indigo-600">
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
                name: t("freePlan", lang),
                price: t("freePlanPrice", lang),
                desc: t("freePlanDesc", lang),
                features: [t("free1", lang), t("free2", lang), t("free3", lang), t("free4", lang)],
                cta: t("currentPlan", lang),
                popular: false,
              },
              {
                name: t("proPlan", lang),
                price: t("proPlanPrice", lang),
                desc: t("proPlanDesc", lang),
                features: [t("pro1", lang), t("pro2", lang), t("pro3", lang), t("pro4", lang)],
                cta: t("upgrade", lang),
                popular: true,
              },
              {
                name: t("businessPlan", lang),
                price: t("businessPlanPrice", lang),
                desc: t("businessPlanDesc", lang),
                features: [t("business1", lang), t("business2", lang), t("business3", lang), t("business4", lang)],
                cta: t("contactSales", lang),
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
                  className={`p-6 h-full relative hover:shadow-lg transition-shadow ${plan.popular ? "border-2 border-emerald-500 shadow-lg shadow-emerald-500/10" : ""}`}
                  data-testid={`card-plan-${i}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 bg-gradient-to-r from-emerald-500 to-teal-600">
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
                    onClick={handleCTA}
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

      <footer className="py-10 border-t bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Globe2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {t("brand", lang)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"} &copy; 2026 {t("brand", lang)}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
