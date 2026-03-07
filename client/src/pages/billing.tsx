import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import DashboardLayout from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

export default function BillingPage() {
  const { language } = useAuth();
  const lang = language;
  const { toast } = useToast();
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

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
        ? (lang === "ar" ? `${proYearlyPerMonth} ر.س` : `${proYearlyPerMonth} SAR`)
        : (lang === "ar" ? `${proMonthly} ر.س` : `${proMonthly} SAR`),
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
        ? (lang === "ar" ? `${businessYearlyPerMonth} ر.س` : `${businessYearlyPerMonth} SAR`)
        : (lang === "ar" ? `${businessMonthly} ر.س` : `${businessMonthly} SAR`),
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

          <div className="grid md:grid-cols-3 gap-4">
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
                        <span className="text-sm text-muted-foreground">
                          {lang === "ar" ? "/شهرياً" : "/month"}
                        </span>
                      )}
                    </div>
                    {isYearly && plan.priceNum !== 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {lang === "ar"
                          ? `${plan.yearlyTotal} ر.س/سنوياً`
                          : `${plan.yearlyTotal} SAR/year`}
                        <span className="line-through ms-1.5 text-red-400">
                          {lang === "ar"
                            ? `${plan.id === "pro" ? proMonthly * 12 : businessMonthly * 12} ر.س`
                            : `${plan.id === "pro" ? proMonthly * 12 : businessMonthly * 12} SAR`}
                        </span>
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
