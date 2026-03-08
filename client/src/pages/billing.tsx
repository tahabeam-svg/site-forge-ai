import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import DashboardLayout from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  Crown,
  Check,
  Zap,
  Building2,
  Loader2,
  ExternalLink,
  Coins,
  ToggleLeft,
  ToggleRight,
  Receipt,
  FileText,
} from "lucide-react";

export default function BillingPage() {
  const { language } = useAuth();
  const lang = language;
  const { toast } = useToast();
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isCompany, setIsCompany] = useState(false);
  const [taxNumber, setTaxNumber] = useState("");
  const [companyName, setCompanyName] = useState("");

  const VAT_RATE = 0.15;

  const { data: subscription } = useQuery<{ plan: string; status: string; credits: number; endDate?: string }>({
    queryKey: ["/api/subscription"],
  });

  const { data: paymentConfig } = useQuery<{ configured: boolean }>({
    queryKey: ["/api/payments/config"],
  });

  const currentPlan = subscription?.plan || "free";

  const upgradeMutation = useMutation({
    mutationFn: async (plan: string) => {
      const res = await apiRequest("POST", "/api/payments/initiate", { plan, billingCycle });
      return res.json();
    },
    onSuccess: (data: { iframeUrl: string }) => {
      if (data.iframeUrl) {
        window.open(data.iframeUrl, "_blank");
      }
      setUpgradingPlan(null);
    },
    onError: (err: any) => {
      toast({
        title: lang === "ar" ? "فشل بدء الدفع" : "Payment initiation failed",
        description: err.message,
        variant: "destructive",
      });
      setUpgradingPlan(null);
    },
  });

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
        ? ["5 نقاط/شهرياً", "موقع واحد", "إنشاء أساسي بالذكاء الاصطناعي", "دعم المجتمع"]
        : ["5 credits/month", "1 website", "Basic AI generation", "Community support"],
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
        ? ["50 نقطة/شهرياً", "حتى 10 مواقع", "حتى 50 منشور تسويقي", "لوحة تحليلات متقدمة", "تعديل متقدم بالذكاء الاصطناعي"]
        : ["50 credits/month", "Up to 10 websites", "Up to 50 marketing posts", "Analytics dashboard", "Advanced AI editing"],
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
        ? ["200 نقطة/شهرياً", "حتى 50 موقع", "حتى 100 منشور تسويقي", "قوالب حصرية ومتميزة", "تعاون الفريق"]
        : ["200 credits/month", "Up to 50 websites", "Up to 100 marketing posts", "Premium templates", "Team collaboration"],
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
            {lang === "ar" ? "إدارة خطتك ونقاطك" : "Manage your plan and credits"}
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold" data-testid="text-credits-balance">
                  {lang === "ar" ? "رصيد النقاط" : "Credits Balance"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {lang === "ar"
                    ? `${subscription?.credits ?? 5} نقطة متاحة`
                    : `${subscription?.credits ?? 5} credits available`}
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
            <Coins className="w-4 h-4 text-amber-500" />
            {lang === "ar" ? "كيف تعمل النقاط؟" : "How do credits work?"}
          </h3>
          <div className="grid sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">{lang === "ar" ? "إنشاء موقع" : "Generate website"}</p>
              <p>{lang === "ar" ? "1 نقطة لكل إنشاء" : "1 credit per generation"}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{lang === "ar" ? "تعديل بالذكاء الاصطناعي" : "AI editing"}</p>
              <p>{lang === "ar" ? "1 نقطة لكل تعديل" : "1 credit per edit"}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{lang === "ar" ? "تسويق بالذكاء الاصطناعي" : "AI marketing"}</p>
              <p>{lang === "ar" ? "1 نقطة لكل منشور" : "1 credit per post"}</p>
            </div>
          </div>
        </div>

        <div>
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
                  {isYearly && plan.id !== "free" && (
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
                        <Coins className="w-3 h-3 me-1" />
                        {lang === "ar" ? `${plan.credits} نقطة/شهرياً` : `${plan.credits} credits/month`}
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
