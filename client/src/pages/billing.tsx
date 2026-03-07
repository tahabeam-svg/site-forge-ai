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
} from "lucide-react";

export default function BillingPage() {
  const { language } = useAuth();
  const lang = language;
  const { toast } = useToast();
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  const { data: subscription } = useQuery<{ plan: string; status: string; endDate?: string }>({
    queryKey: ["/api/subscription"],
  });

  const { data: paymentConfig } = useQuery<{ configured: boolean }>({
    queryKey: ["/api/payments/config"],
  });

  const currentPlan = subscription?.plan || "free";

  const upgradeMutation = useMutation({
    mutationFn: async (plan: string) => {
      const res = await apiRequest("POST", "/api/payments/initiate", { plan });
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

  const plans = [
    {
      id: "free",
      name: lang === "ar" ? "مجاني" : "Free",
      price: lang === "ar" ? "مجاناً" : "Free",
      priceNum: "0",
      icon: Zap,
      features: lang === "ar"
        ? ["موقع واحد", "نطاق فرعي مجاني", "إنشاء أساسي بالذكاء الاصطناعي", "دعم المجتمع"]
        : ["1 website", "Platform subdomain", "Basic AI generation", "Community support"],
    },
    {
      id: "pro",
      name: lang === "ar" ? "احترافي" : "Pro",
      price: lang === "ar" ? "49 ر.س" : "49 SAR",
      priceNum: "49",
      icon: Crown,
      features: lang === "ar"
        ? ["حتى 10 مواقع", "نطاق مخصص (.sa)", "لوحة تحليلات", "تعديل متقدم بالذكاء الاصطناعي"]
        : ["Up to 10 websites", "Custom domain (.sa)", "Analytics dashboard", "Advanced AI editing"],
    },
    {
      id: "business",
      name: lang === "ar" ? "أعمال" : "Business",
      price: lang === "ar" ? "99 ر.س" : "99 SAR",
      priceNum: "99",
      icon: Building2,
      features: lang === "ar"
        ? ["مواقع غير محدودة", "قوالب حصرية", "تعاون الفريق", "علامة بيضاء"]
        : ["Unlimited websites", "Premium templates", "Team collaboration", "White-label"],
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
            {lang === "ar" ? "إدارة خطتك وفواتيرك" : "Manage your plan and invoices"}
          </p>
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between">
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
                    : (lang === "ar" ? "اشتراك مجاني بدون تاريخ انتهاء" : "Free plan — no expiry")}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700" data-testid="badge-plan-status">
              {subscription?.status === "active" ? (lang === "ar" ? "نشط" : "Active") : (lang === "ar" ? "غير نشط" : "Inactive")}
            </Badge>
          </div>
        </Card>

        <div>
          <h2 className="text-lg font-semibold mb-4" data-testid="text-plans-title">
            {lang === "ar" ? "خطط الاشتراك" : "Subscription Plans"}
          </h2>
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
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-3">
                      <plan.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <div className="mt-1">
                      <span className="text-2xl font-bold">{plan.price}</span>
                      {plan.priceNum !== "0" && (
                        <span className="text-sm text-muted-foreground">
                          {lang === "ar" ? "/شهرياً" : "/month"}
                        </span>
                      )}
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
