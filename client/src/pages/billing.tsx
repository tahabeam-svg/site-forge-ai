import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import DashboardLayout from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { SUPPORT_WHATSAPP_URL } from "@/lib/constants";
import {
  CreditCard,
  Crown,
  Check,
  Zap,
  Building2,
  Loader2,
  ExternalLink,
  BrainCircuit,
  ToggleLeft,
  ToggleRight,
  Receipt,
  FileText,
  ShoppingCart,
  History,
  Plus,
  Minus,
  MessageCircle,
  Server,
  Database,
  Store,
  Lock,
  HeadphonesIcon,
} from "lucide-react";

export default function BillingPage() {
  const { language } = useAuth();
  const lang = language;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isCompany, setIsCompany] = useState(false);
  const [taxNumber, setTaxNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [creditAmount, setCreditAmount] = useState(50);

  const VAT_RATE = 0.15;

  const { data: subscription } = useQuery<{ plan: string; status: string; credits: number; endDate?: string }>({
    queryKey: ["/api/subscription"],
  });

  const { data: paymentConfig } = useQuery<{ configured: boolean }>({
    queryKey: ["/api/payments/config"],
  });

  const currentPlan = subscription?.plan || "free";

  const parseErrMsg = (err: any): string => {
    try {
      const raw: string = err?.message || "";
      const jsonPart = raw.slice(raw.indexOf("{"));
      const parsed = JSON.parse(jsonPart);
      return parsed?.message || raw;
    } catch {
      return err?.message || (lang === "ar" ? "حدث خطأ غير متوقع" : "An unexpected error occurred");
    }
  };

  const upgradeMutation = useMutation({
    mutationFn: async (plan: string) => {
      const res = await apiRequest("POST", "/api/payments/initiate", {
        plan,
        billingCycle,
        invoiceInfo: { isCompany, companyName: companyName || undefined, taxNumber: taxNumber || undefined },
      });
      return res.json();
    },
    onSuccess: (data: { iframeUrl?: string; testMode?: boolean; testUrl?: string }) => {
      if (data.testMode && data.testUrl) {
        setLocation(data.testUrl);
      } else if (data.iframeUrl) {
        window.open(data.iframeUrl, "_blank");
      }
      setUpgradingPlan(null);
    },
    onError: (err: any) => {
      toast({
        title: lang === "ar" ? "فشل بدء الدفع" : "Payment initiation failed",
        description: parseErrMsg(err),
        variant: "destructive",
      });
      setUpgradingPlan(null);
    },
  });

  const { data: creditHistory } = useQuery<{id: number; credits: number; amountCents: number; status: string; createdAt: string}[]>({
    queryKey: ["/api/payments/credit-history"],
  });

  const buyCreditsM = useMutation({
    mutationFn: async (credits: number) => {
      const res = await apiRequest("POST", "/api/payments/buy-credits", {
        credits,
        invoiceInfo: { isCompany, companyName: companyName || undefined, taxNumber: taxNumber || undefined },
      });
      return res.json();
    },
    onSuccess: (data: { iframeUrl?: string; testMode?: boolean; testUrl?: string }) => {
      if (data.testMode && data.testUrl) {
        setLocation(data.testUrl);
      } else if (data.iframeUrl) {
        window.open(data.iframeUrl, "_blank");
      }
      qc.invalidateQueries({ queryKey: ["/api/payments/credit-history"] });
      qc.invalidateQueries({ queryKey: ["/api/subscription"] });
    },
    onError: (err: any) => {
      toast({
        title: lang === "ar" ? "فشل بدء الدفع" : "Payment failed",
        description: parseErrMsg(err),
        variant: "destructive",
      });
    },
  });

  const adjustCredits = (delta: number) => {
    setCreditAmount(prev => {
      const next = prev + delta;
      if (next < 50) return 50;
      if (next % 5 !== 0) return Math.round(next / 5) * 5;
      return next;
    });
  };

  const handleCreditInput = (val: string) => {
    const n = parseInt(val);
    if (isNaN(n)) return;
    setCreditAmount(Math.max(50, Math.round(n / 5) * 5));
  };

  const handleUpgrade = (plan: string) => {
    if (!paymentConfig?.configured) {
      toast({
        title: lang === "ar" ? "بوابة الدفع غير مفعّلة" : "Payment gateway not configured",
        description: lang === "ar" ? "يرجى التواصل مع الإدارة" : "Please contact the administrator",
        variant: "destructive",
      });
      return;
    }
    setUpgradingPlan(plan);
    upgradeMutation.mutate(plan);
  };

  const autoTriggered = useRef(false);
  useEffect(() => {
    if (autoTriggered.current) return;
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get("plan");
    if (planParam && (planParam === "pro" || planParam === "business") && paymentConfig?.configured && subscription) {
      const current = subscription.plan || "free";
      if (current !== planParam) {
        autoTriggered.current = true;
        handleUpgrade(planParam);
        window.history.replaceState({}, "", "/billing");
      }
    }
  }, [paymentConfig, subscription]);

  const isYearly = billingCycle === "yearly";
  const discount = 0.8;

  const proMonthly = 49;
  const businessMonthly = 99;
  const proYearly = Math.round(proMonthly * 12 * discount);
  const businessYearly = Math.round(businessMonthly * 12 * discount);
  const proYearlyPerMonth = Math.round(proYearly / 12);
  const businessYearlyPerMonth = Math.round(businessYearly / 12);

  const plans = [
    {
      id: "free",
      name: lang === "ar" ? "مجاني" : "Free",
      price: lang === "ar" ? "مجاناً" : "Free",
      priceNum: 0,
      yearlyTotal: 0,
      icon: Zap,
      credits: 5,
      features: lang === "ar"
        ? ["موقع واحد", "2 تعديل ذكاء مجاني/موقع", "لا وصول لأداة التسويق", "دعم المجتمع", "يتضمن شعار عربي ويب"]
        : ["1 website", "2 free AI edits/site", "No AI marketing access", "Community support", "ArabyWeb badge on site"],
    },
    {
      id: "pro",
      name: lang === "ar" ? "احترافي" : "Pro",
      price: isYearly
        ? `${proYearlyPerMonth} ر.س`
        : `${proMonthly} ر.س`,
      priceNum: isYearly ? proYearlyPerMonth : proMonthly,
      yearlyTotal: proYearly,
      icon: Crown,
      credits: 50,
      features: lang === "ar"
        ? ["10 مواقع", "5 تعديلات مجانية/موقع", "🚀 تسويق AI — إنستغرام + إكس/تويتر", "50 جلسة ذكاء/شهر", "لوحة تحليلات متقدمة", "بدون شعار عربي ويب"]
        : ["10 websites", "5 free AI edits/site", "🚀 AI Marketing — Instagram + X/Twitter", "50 AI sessions/month", "Analytics dashboard", "No ArabyWeb badge"],
    },
    {
      id: "business",
      name: lang === "ar" ? "أعمال" : "Business",
      price: isYearly
        ? `${businessYearlyPerMonth} ر.س`
        : `${businessMonthly} ر.س`,
      priceNum: isYearly ? businessYearlyPerMonth : businessMonthly,
      yearlyTotal: businessYearly,
      icon: Building2,
      credits: 200,
      features: lang === "ar"
        ? ["30 موقعاً", "10 تعديلات مجانية/موقع", "🚀 تسويق AI — إنستغرام + إكس/تويتر + فيسبوك", "200 جلسة ذكاء/شهر", "دعم أولوية 24/7", "قوالب حصرية وتعاون الفريق", "بدون شعار عربي ويب"]
        : ["30 websites", "10 free AI edits/site", "🚀 AI Marketing — Instagram + X/Twitter + Facebook", "200 AI sessions/month", "Priority 24/7 support", "Premium templates & team collaboration", "No ArabyWeb badge"],
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-billing-title">
            {lang === "ar" ? "الفوترة والاشتراك" : "Billing & Subscription"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {lang === "ar" ? "إدارة خطتك ورصيد الذكاء" : "Manage your plan and AI credits"}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold" data-testid="text-current-plan">
                  {lang === "ar" ? `الخطة الحالية: ${currentPlan === "free" ? "مجاني" : currentPlan === "pro" ? "احترافي" : "أعمال"}` : `Current Plan: ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}`}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {subscription?.endDate
                    ? (lang === "ar" ? `ينتهي في ${new Date(subscription.endDate).toLocaleDateString("ar")}` : `Expires on ${new Date(subscription.endDate).toLocaleDateString()}`)
                    : (lang === "ar" ? "اشتراك مجاني" : "Free plan")}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold" data-testid="text-credits-balance">
                  {lang === "ar" ? "رصيد الذكاء" : "AI Credits"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {lang === "ar"
                    ? `${subscription?.credits ?? 5} جلسة ذكاء متاحة`
                    : `${subscription?.credits ?? 5} AI sessions available`}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="mt-2 bg-emerald-100 text-emerald-700" data-testid="badge-plan-status">
              {subscription?.status === "active" ? (lang === "ar" ? "نشط" : "Active") : (lang === "ar" ? "غير نشط" : "Inactive")}
            </Badge>
          </Card>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-violet-500" />
            {lang === "ar" ? "كيف يعمل رصيد الذكاء؟" : "How do AI credits work?"}
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            {lang === "ar"
              ? "كل تفاعل مع الذكاء الاصطناعي يستهلك جلسات ذكاء — توليد الصور يستهلك جلستَين لاستخدامه نموذج أقوى."
              : "Each AI interaction consumes AI sessions — image generation costs 2 sessions as it uses a more powerful model."}
          </p>
          <div className="grid sm:grid-cols-4 gap-3 text-xs text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">{lang === "ar" ? "إنشاء موقع" : "Generate website"}</p>
              <p>{lang === "ar" ? "1 جلسة ذكاء" : "1 AI session"}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{lang === "ar" ? "تعديل بالذكاء الاصطناعي" : "AI editing"}</p>
              <p>{lang === "ar" ? "1 جلسة ذكاء" : "1 AI session"}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{lang === "ar" ? "محتوى تسويقي" : "Marketing content"}</p>
              <p>{lang === "ar" ? "1 جلسة ذكاء" : "1 AI session"}</p>
            </div>
            <div className="relative">
              <p className="font-medium text-foreground">{lang === "ar" ? "توليد صورة بوست" : "Post image (DALL-E)"}</p>
              <p className="text-violet-600 dark:text-violet-400 font-semibold">{lang === "ar" ? "2 جلسة ذكاء" : "2 AI sessions"}</p>
            </div>
          </div>
        </div>

        {/* ─── Buy Credits Section ─── */}
        <Card className="p-5 relative overflow-hidden" data-testid="card-buy-credits">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <ShoppingCart className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-base">
                {lang === "ar" ? "شراء جلسات ذكاء إضافية" : "Buy Extra AI Sessions"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {lang === "ar" ? "1 جلسة = 1 ريال سعودي • الحد الأدنى 50 جلسة" : "1 session = 1 SAR • Minimum 50 sessions"}
              </p>
            </div>
          </div>

          {/* Free plan lock overlay */}
          {currentPlan === "free" && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 rounded-xl p-6 text-center" data-testid="div-credits-locked">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
                <Lock className="w-7 h-7 text-amber-500" />
              </div>
              <h4 className="font-bold text-lg mb-1">
                {lang === "ar" ? "متاح للمشتركين فقط" : "Available for Subscribers Only"}
              </h4>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                {lang === "ar"
                  ? "لشراء جلسات ذكاء إضافية يجب الاشتراك في خطة Pro أو Business أولاً."
                  : "To purchase extra AI sessions, you must first subscribe to a Pro or Business plan."}
              </p>
              <Button
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                onClick={() => {
                  const el = document.getElementById("plans-section");
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                data-testid="button-upgrade-for-credits"
              >
                <Crown className="w-4 h-4 me-2" />
                {lang === "ar" ? "اشترك الآن واحصل على جلسات" : "Subscribe Now & Get Sessions"}
              </Button>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => adjustCredits(-5)}
              disabled={creditAmount <= 50}
              className="w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
              data-testid="button-credits-minus"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex-1 text-center">
              <Input
                type="number"
                value={creditAmount}
                min={50}
                step={5}
                onChange={(e) => handleCreditInput(e.target.value)}
                className="text-center text-xl font-bold h-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                data-testid="input-credit-amount"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {lang === "ar" ? "جلسة ذكاء" : "AI sessions"}
              </p>
            </div>
            <button
              onClick={() => adjustCredits(5)}
              className="w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-muted transition-colors"
              data-testid="button-credits-plus"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {[50, 100, 200, 500].map(preset => (
              <button
                key={preset}
                onClick={() => setCreditAmount(preset)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  creditAmount === preset
                    ? "bg-violet-600 text-white border-violet-600"
                    : "hover:border-violet-400 hover:text-violet-600"
                }`}
                data-testid={`button-preset-${preset}`}
              >
                {preset} {lang === "ar" ? "جلسة" : "s"}
              </button>
            ))}
          </div>

          <Separator className="my-3" />

          <div className="space-y-1.5 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{lang === "ar" ? `${creditAmount} جلسة ذكاء` : `${creditAmount} AI sessions`}</span>
              <span className="font-medium">{creditAmount} ر.س</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{lang === "ar" ? "ضريبة القيمة المضافة (15%)" : "VAT (15%)"}</span>
              <span className="font-medium">{(creditAmount * 0.15).toFixed(2)} ر.س</span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between font-bold text-base">
              <span>{lang === "ar" ? "الإجمالي" : "Total"}</span>
              <span className="text-violet-600">{(creditAmount * 1.15).toFixed(2)} ر.س</span>
            </div>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
            onClick={() => {
              if (!paymentConfig?.configured) {
                toast({ title: lang === "ar" ? "بوابة الدفع غير مفعّلة" : "Payment not configured", variant: "destructive" });
                return;
              }
              buyCreditsM.mutate(creditAmount);
            }}
            disabled={buyCreditsM.isPending || currentPlan === "free"}
            data-testid="button-buy-credits"
          >
            {buyCreditsM.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin me-2" />
            ) : (
              <ShoppingCart className="w-4 h-4 me-2" />
            )}
            {lang === "ar"
              ? `شراء ${creditAmount} جلسة ذكاء مقابل ${(creditAmount * 1.15).toFixed(2)} ر.س`
              : `Buy ${creditAmount} AI sessions for SAR ${(creditAmount * 1.15).toFixed(2)}`}
            <ExternalLink className="w-3.5 h-3.5 ms-2 opacity-70" />
          </Button>
        </Card>

        <div id="plans-section">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold" data-testid="text-plans-title">
              {lang === "ar" ? "خطط الاشتراك" : "Subscription Plans"}
            </h2>
            <div className="flex items-center gap-2 bg-muted rounded-full p-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  billingCycle === "monthly"
                    ? "bg-white dark:bg-zinc-800 shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="button-billing-monthly"
              >
                {lang === "ar" ? "شهري" : "Monthly"}
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  billingCycle === "yearly"
                    ? "bg-white dark:bg-zinc-800 shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="button-billing-yearly"
              >
                {lang === "ar" ? "سنوي" : "Yearly"}
                <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0">
                  -20%
                </Badge>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {plans.map((plan, i) => {
              const isCurrent = currentPlan === plan.id;
              return (
                <Card key={i} className={`p-5 relative ${isCurrent ? "border-emerald-500 border-2" : ""}`} data-testid={`card-plan-${i}`}>
                  {isCurrent && (
                    <Badge className="absolute -top-2.5 start-4 bg-emerald-500">
                      {lang === "ar" ? "الحالية" : "Current"}
                    </Badge>
                  )}
                  {isYearly && plan.id !== "free" && !isCurrent && (
                    <Badge className="absolute -top-2.5 end-4 bg-amber-500">
                      {lang === "ar" ? "وفّر 20%" : "Save 20%"}
                    </Badge>
                  )}
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-3">
                      <plan.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <div className="mt-1">
                      <span className="text-2xl font-bold">{plan.price}</span>
                      {plan.priceNum !== 0 && (
                        <span className="text-sm text-muted-foreground">/شهرياً</span>
                      )}
                    </div>
                    {isYearly && plan.priceNum !== 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {`${plan.yearlyTotal} ر.س/سنوياً`}
                        <span className="line-through ms-1.5 text-red-400">
                          {`${plan.id === "pro" ? proMonthly * 12 : businessMonthly * 12} ر.س`}
                        </span>
                      </p>
                    )}
                    {plan.priceNum !== 0 && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {lang === "ar" ? "* لا تشمل ضريبة القيمة المضافة" : "* Excl. VAT"}
                      </p>
                    )}
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        <BrainCircuit className="w-3 h-3 me-1" />
                        {lang === "ar" ? `${plan.credits} جلسة ذكاء/شهرياً` : `${plan.credits} AI sessions/month`}
                      </Badge>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, fi) => (
                      <li key={fi} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={isCurrent ? "outline" : "default"}
                    className={`w-full ${!isCurrent ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700" : ""}`}
                    disabled={isCurrent || plan.id === "free" || upgradeMutation.isPending}
                    onClick={() => !isCurrent && plan.id !== "free" && handleUpgrade(plan.id)}
                    data-testid={`button-plan-${i}`}
                  >
                    {upgradingPlan === plan.id ? (
                      <Loader2 className="w-4 h-4 animate-spin me-1" />
                    ) : null}
                    {isCurrent
                      ? (lang === "ar" ? "الخطة الحالية" : "Current Plan")
                      : plan.id === "free"
                        ? (lang === "ar" ? "مجاني" : "Free")
                        : (lang === "ar" ? "ترقية" : "Upgrade")}
                    {!isCurrent && plan.id !== "free" && <ExternalLink className="w-3.5 h-3.5 ms-1" />}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ── Technical Support Card ── */}
        <Card className="p-5 border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/60 to-teal-50/40 dark:from-emerald-950/30 dark:to-teal-950/20" data-testid="card-tech-support">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shrink-0">
              <HeadphonesIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base mb-0.5">
                {lang === "ar" ? "دعم فني متخصص من فريق عربي ويب" : "Dedicated Technical Support from ArabyWeb Team"}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {lang === "ar"
                  ? "فريقنا مستعد لمساعدتك في رفع موقعك على الاستضافة، وبناء المنصات المعقدة والمتاجر الإلكترونية الضخمة التي تحتاج إلى قواعد بيانات متطورة."
                  : "Our team is ready to help you deploy your site to hosting, build complex platforms and large e-commerce stores that require advanced databases."}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  { icon: Server, label: lang === "ar" ? "رفع على الاستضافة" : "Hosting Deployment" },
                  { icon: Store, label: lang === "ar" ? "متاجر إلكترونية" : "E-commerce Stores" },
                  { icon: Database, label: lang === "ar" ? "قواعد بيانات معقدة" : "Complex Databases" },
                ].map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-xs bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-emerald-700 rounded-full px-3 py-1 font-medium text-emerald-700 dark:text-emerald-400">
                    <item.icon className="w-3 h-3" />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 shrink-0">
              {currentPlan !== "free" ? (
                <a
                  href={SUPPORT_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b858] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                  data-testid="link-whatsapp-support"
                >
                  <MessageCircle className="w-4 h-4" />
                  {lang === "ar" ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
                </a>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="inline-flex items-center gap-2 bg-muted border border-dashed border-muted-foreground/30 text-muted-foreground text-sm px-5 py-2.5 rounded-xl">
                    <Lock className="w-4 h-4" />
                    {lang === "ar" ? "متاح للمشتركين المدفوعين" : "For paid subscribers"}
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-xs"
                    onClick={() => handleUpgrade("pro")}
                    disabled={upgradeMutation.isPending}
                    data-testid="button-upgrade-for-support"
                  >
                    {lang === "ar" ? "ترقية للوصول" : "Upgrade to Access"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {currentPlan !== "free" || true ? (
          <Card className="p-5" data-testid="card-invoice-details">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-lg">
                {lang === "ar" ? "تفاصيل الفاتورة" : "Invoice Details"}
              </h3>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setIsCompany(false)}
                className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                  !isCompany
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "border-muted hover:border-foreground/20"
                }`}
                data-testid="button-individual"
              >
                {lang === "ar" ? "فرد" : "Individual"}
              </button>
              <button
                onClick={() => setIsCompany(true)}
                className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  isCompany
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "border-muted hover:border-foreground/20"
                }`}
                data-testid="button-company"
              >
                <Building2 className="w-4 h-4" />
                {lang === "ar" ? "شركة / مؤسسة" : "Company"}
              </button>
            </div>

            {isCompany && (
              <div className="space-y-3 mb-4 p-4 rounded-lg bg-muted/50 border">
                <div>
                  <Label className="text-sm mb-1.5 block">
                    {lang === "ar" ? "اسم الشركة / المؤسسة" : "Company Name"}
                  </Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={lang === "ar" ? "مثال: شركة التقنية المتقدمة" : "e.g. Advanced Tech Co."}
                    data-testid="input-company-name"
                  />
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">
                    <FileText className="w-3.5 h-3.5 inline me-1" />
                    {lang === "ar" ? "الرقم الضريبي (VAT Number)" : "Tax Registration Number (VAT)"}
                  </Label>
                  <Input
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    placeholder={lang === "ar" ? "مثال: 300000000000003" : "e.g. 300000000000003"}
                    className="font-mono"
                    maxLength={15}
                    data-testid="input-tax-number"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {lang === "ar"
                      ? "الرقم الضريبي المكون من 15 رقم الصادر من هيئة الزكاة والضريبة والجمارك"
                      : "15-digit VAT number issued by ZATCA (Zakat, Tax and Customs Authority)"}
                  </p>
                </div>
              </div>
            )}

            <Separator className="my-4" />

            {(() => {
              const selectedPlan = plans.find(p => p.id === (currentPlan !== "free" ? currentPlan : "pro"));
              if (!selectedPlan || selectedPlan.priceNum === 0) return null;
              const subtotal = isYearly ? selectedPlan.yearlyTotal : selectedPlan.priceNum;
              const period = isYearly
                ? (lang === "ar" ? "سنوياً" : "yearly")
                : (lang === "ar" ? "شهرياً" : "monthly");
              const vatAmount = Math.round(subtotal * VAT_RATE * 100) / 100;
              const total = subtotal + vatAmount;

              return (
                <div className="space-y-2 text-sm" data-testid="invoice-breakdown">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {lang === "ar" ? `خطة ${selectedPlan.name} (${period})` : `${selectedPlan.name} Plan (${period})`}
                    </span>
                    <span className="font-medium">{subtotal} ر.س</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {lang === "ar" ? "ضريبة القيمة المضافة (15%)" : "VAT (15%)"}
                    </span>
                    <span className="font-medium">{vatAmount.toFixed(2)} ر.س</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between text-base font-bold">
                    <span>{lang === "ar" ? "الإجمالي شامل الضريبة" : "Total (incl. VAT)"}</span>
                    <span className="text-emerald-600">{total.toFixed(2)} ر.س</span>
                  </div>
                </div>
              );
            })()}

            <p className="text-xs text-muted-foreground mt-4">
              {lang === "ar"
                ? "الأسعار المعروضة لا تشمل ضريبة القيمة المضافة. تُضاف الضريبة (15%) عند الدفع وفقاً لنظام هيئة الزكاة والضريبة والجمارك في المملكة العربية السعودية."
                : "Prices shown are exclusive of VAT. VAT (15%) is added at checkout in accordance with ZATCA regulations in the Kingdom of Saudi Arabia."}
            </p>
          </Card>
        ) : null}

        {/* ─── Credit History ─── */}
        {creditHistory && creditHistory.length > 0 && (
          <Card className="p-5" data-testid="card-credit-history">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-violet-600" />
              <h3 className="font-semibold">
                {lang === "ar" ? "سجل شراء جلسات الذكاء" : "AI Session Purchase History"}
              </h3>
            </div>
            <div className="space-y-2">
              {creditHistory.slice(0, 10).map((p) => {
                const date = new Date(p.createdAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US");
                const statusColor = p.status === "completed" ? "bg-emerald-100 text-emerald-700" : p.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
                const statusLabel = p.status === "completed"
                  ? (lang === "ar" ? "مكتمل" : "Completed")
                  : p.status === "pending"
                    ? (lang === "ar" ? "في الانتظار" : "Pending")
                    : (lang === "ar" ? "فشل" : "Failed");
                return (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm" data-testid={`row-credit-${p.id}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                        <BrainCircuit className="w-4 h-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          +{p.credits} {lang === "ar" ? "جلسة ذكاء" : "AI sessions"}
                        </p>
                        <p className="text-xs text-muted-foreground">{date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{(p.amountCents / 100).toFixed(0)} ر.س</span>
                      <Badge className={`text-[10px] ${statusColor}`}>{statusLabel}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {!paymentConfig?.configured && (
          <Card className="p-4 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {lang === "ar"
                ? "بوابة الدفع غير مفعّلة حالياً. يرجى التواصل مع مسؤول النظام لتفعيلها."
                : "Payment gateway is not configured yet. Please contact the system administrator to enable it."}
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
