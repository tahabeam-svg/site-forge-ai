import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useLocation } from "wouter";
import {
  Sparkles,
  Palette,
  Rocket,
  Globe,
  Smartphone,
  Search,
  ArrowRight,
  Check,
  Zap,
  Code2,
  Star,
} from "lucide-react";
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
  const { user, language } = useAuth();
  const [, navigate] = useLocation();
  const lang = language;

  const features = [
    { icon: Sparkles, title: t("aiGeneration", lang), desc: t("aiGenerationDesc", lang), gradient: "from-violet-500 to-purple-600" },
    { icon: Palette, title: t("visualEditor", lang), desc: t("visualEditorDesc", lang), gradient: "from-pink-500 to-rose-600" },
    { icon: Rocket, title: t("instantPublish", lang), desc: t("instantPublishDesc", lang), gradient: "from-orange-500 to-amber-600" },
    { icon: Globe, title: t("multiLanguage", lang), desc: t("multiLanguageDesc", lang), gradient: "from-blue-500 to-cyan-600" },
    { icon: Smartphone, title: t("responsiveDesign", lang), desc: t("responsiveDesignDesc", lang), gradient: "from-emerald-500 to-green-600" },
    { icon: Search, title: t("seoOptimized", lang), desc: t("seoOptimizedDesc", lang), gradient: "from-indigo-500 to-blue-600" },
  ];

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Inter', sans-serif" }}>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b" data-testid="nav-landing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold" data-testid="text-brand">{t("brand", lang)}</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground transition-colors" data-testid="link-features">{t("features", lang)}</a>
              <a href="#pricing" className="text-sm text-muted-foreground transition-colors" data-testid="link-pricing">{t("pricing", lang)}</a>
              <a href="#templates" className="text-sm text-muted-foreground transition-colors" data-testid="link-templates">{t("templates", lang)}</a>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              {user ? (
                <Button onClick={() => navigate("/dashboard")} data-testid="button-dashboard">
                  {t("dashboard", lang)}
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate("/login")} data-testid="button-login">
                    {t("login", lang)}
                  </Button>
                  <Button onClick={() => navigate("/register")} data-testid="button-register">
                    {t("getStarted", lang)}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm" data-testid="badge-new">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered Website Builder
            </Badge>
          </motion.div>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text"
            data-testid="text-hero-title"
          >
            {t("tagline", lang)}
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            data-testid="text-hero-subtitle"
          >
            {t("subtitle", lang)}
          </motion.p>

          <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" onClick={() => navigate(user ? "/dashboard" : "/register")} className="text-base px-8" data-testid="button-hero-cta">
              {t("getStarted", lang)}
              <ArrowRight className="w-4 h-4 ms-2" />
            </Button>
          </motion.div>

          <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: t("heroStat1", lang), label: t("heroStat1Label", lang) },
              { value: t("heroStat2", lang), label: t("heroStat2Label", lang) },
              { value: t("heroStat3", lang), label: t("heroStat3Label", lang) },
            ].map((stat, i) => (
              <div key={i} className="text-center" data-testid={`stat-${i}`}>
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp} className="mt-16 relative max-w-4xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-2xl" />
            <Card className="relative rounded-xl border-2 overflow-hidden">
              <div className="bg-card p-3 border-b flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xs text-muted-foreground bg-muted rounded-md px-3 py-1 inline-block">siteforge.ai/dashboard</div>
                </div>
              </div>
              <div className="p-6 sm:p-10 bg-gradient-to-br from-violet-500/5 to-purple-500/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-background rounded-lg p-4 border">
                    <div className="w-full h-24 bg-gradient-to-br from-violet-500 to-purple-600 rounded-md mb-3" />
                    <div className="h-3 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-2 bg-muted rounded w-1/2" />
                  </div>
                  <div className="bg-background rounded-lg p-4 border">
                    <div className="w-full h-24 bg-gradient-to-br from-pink-500 to-rose-600 rounded-md mb-3" />
                    <div className="h-3 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-2 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.p custom={6} initial="hidden" animate="visible" variants={fadeUp} className="mt-8 text-sm text-muted-foreground">
            {t("trustedBy", lang)}
          </motion.p>
        </div>
      </section>

      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.h2 custom={0} variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-features-title">
              {t("features", lang)}
            </motion.h2>
            <motion.p custom={1} variants={fadeUp} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {lang === "ar"
                ? "كل ما تحتاجه لإنشاء مواقع ويب احترافية في مكان واحد"
                : "Everything you need to create professional websites in one place"}
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={scaleIn}
              >
                <Card className="p-6 h-full hover-elevate" data-testid={`card-feature-${i}`}>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.h2 custom={0} variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-pricing-title">
              {t("pricing", lang)}
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
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
                  className={`p-6 h-full relative ${plan.popular ? "border-2 border-primary" : ""}`}
                  data-testid={`card-plan-${i}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3">
                      <Star className="w-3 h-3 mr-1" />
                      {lang === "ar" ? "الأكثر شعبية" : "Most Popular"}
                    </Badge>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.price !== "$0" && <span className="text-muted-foreground">{t("perMonth", lang)}</span>}
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full"
                    onClick={() => navigate(user ? "/dashboard" : "/register")}
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

      <section className="py-20 bg-gradient-to-br from-violet-500 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            {lang === "ar" ? "ابدأ ببناء موقعك اليوم" : "Start Building Your Website Today"}
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
            className="text-lg opacity-90 mb-8"
          >
            {lang === "ar"
              ? "انضم لآلاف المستخدمين الذين ينشئون مواقع احترافية بالذكاء الاصطناعي"
              : "Join thousands of users creating professional websites with AI"}
          </motion.p>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate(user ? "/dashboard" : "/register")}
              className="text-base px-8"
              data-testid="button-cta-bottom"
            >
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
              <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Code2 className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-semibold">{t("brand", lang)}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"} &copy; 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
