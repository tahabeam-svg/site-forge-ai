import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import DashboardLayout from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Download,
  Crown,
  Check,
  Zap,
  Building2,
  FileText,
} from "lucide-react";

const invoices = [
  { id: "INV-2026-001", date: "2026-03-01", plan: "Pro", amount: "49 ر.س", status: "paid" },
  { id: "INV-2026-002", date: "2026-02-01", plan: "Pro", amount: "49 ر.س", status: "paid" },
  { id: "INV-2026-003", date: "2026-01-01", plan: "Pro", amount: "49 ر.س", status: "paid" },
];

export default function BillingPage() {
  const { language } = useAuth();
  const lang = language;

  const plans = [
    {
      name: lang === "ar" ? "مجاني" : "Free",
      price: lang === "ar" ? "مجاناً" : "Free",
      priceNum: "0",
      icon: Zap,
      current: true,
      features: lang === "ar"
        ? ["موقع واحد", "نطاق فرعي مجاني", "إنشاء أساسي بالذكاء الاصطناعي", "دعم المجتمع"]
        : ["1 website", "Platform subdomain", "Basic AI generation", "Community support"],
    },
    {
      name: lang === "ar" ? "احترافي" : "Pro",
      price: lang === "ar" ? "49 ر.س" : "49 SAR",
      priceNum: "49",
      icon: Crown,
      current: false,
      features: lang === "ar"
        ? ["حتى 10 مواقع", "نطاق مخصص (.sa)", "لوحة تحليلات", "تعديل متقدم بالذكاء الاصطناعي"]
        : ["Up to 10 websites", "Custom domain (.sa)", "Analytics dashboard", "Advanced AI editing"],
    },
    {
      name: lang === "ar" ? "أعمال" : "Business",
      price: lang === "ar" ? "99 ر.س" : "99 SAR",
      priceNum: "99",
      icon: Building2,
      current: false,
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
                  {lang === "ar" ? "الخطة الحالية: مجاني" : "Current Plan: Free"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {lang === "ar" ? "1 من 1 مواقع مستخدمة" : "1 of 1 websites used"}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700" data-testid="badge-plan-status">
              {lang === "ar" ? "نشط" : "Active"}
            </Badge>
          </div>
        </Card>

        <div>
          <h2 className="text-lg font-semibold mb-4" data-testid="text-plans-title">
            {lang === "ar" ? "خطط الاشتراك" : "Subscription Plans"}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan, i) => (
              <Card key={i} className={`p-5 relative ${plan.current ? "border-emerald-500 border-2" : ""}`} data-testid={`card-plan-${i}`}>
                {plan.current && (
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
                  variant={plan.current ? "outline" : "default"}
                  className={`w-full ${!plan.current ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700" : ""}`}
                  disabled={plan.current}
                  data-testid={`button-plan-${i}`}
                >
                  {plan.current
                    ? (lang === "ar" ? "الخطة الحالية" : "Current Plan")
                    : (lang === "ar" ? "ترقية" : "Upgrade")}
                </Button>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" data-testid="text-invoices-title">
            <FileText className="w-5 h-5" />
            {lang === "ar" ? "الفواتير" : "Invoices"}
          </h2>
          <Card>
            <div className="divide-y">
              {invoices.map((inv, i) => (
                <div key={inv.id} className="flex items-center justify-between p-4" data-testid={`row-invoice-${i}`}>
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{inv.id}</p>
                      <p className="text-xs text-muted-foreground">{inv.date} • {inv.plan}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{inv.amount}</span>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">
                      {lang === "ar" ? "مدفوع" : "Paid"}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-download-invoice-${i}`}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
