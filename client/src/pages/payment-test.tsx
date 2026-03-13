import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, ShieldCheck, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";

export default function PaymentTestPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { language } = useAuth();
  const lang = language;

  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") || "plan";
  const plan = params.get("plan") || "pro";
  const subId = params.get("subId");
  const purchaseId = params.get("purchaseId");
  const credits = params.get("credits");
  const amount = params.get("amount") || "0";

  const [cardNumber, setCardNumber] = useState("5123 4567 8901 2346");
  const [expiry, setExpiry] = useState("12/28");
  const [cvv, setCvv] = useState("123");
  const [name, setName] = useState("Test User");
  const [done, setDone] = useState(false);

  const planNames: Record<string, { ar: string; en: string }> = {
    pro: { ar: "الاحترافية", en: "Pro" },
    business: { ar: "الأعمال", en: "Business" },
  };

  const completeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/payments/test-complete", {
        type,
        subId: subId ? Number(subId) : undefined,
        purchaseId: purchaseId ? Number(purchaseId) : undefined,
        credits: credits ? Number(credits) : undefined,
        plan,
      });
    },
    onSuccess: () => {
      setDone(true);
      qc.invalidateQueries({ queryKey: ["/api/subscription"] });
      qc.invalidateQueries({ queryKey: ["/api/credits"] });
      qc.invalidateQueries({ queryKey: ["/api/payments/credit-history"] });
      setTimeout(() => setLocation("/billing"), 2500);
    },
    onError: (err: any) => {
      toast({ title: lang === "ar" ? "حدث خطأ" : "Error", description: err.message, variant: "destructive" });
    },
  });

  const formatCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})/g, "$1 ").trim();
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 flex items-center justify-center p-4">
        <Card className="bg-zinc-900 border-zinc-700 p-8 text-center max-w-sm w-full">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            {lang === "ar" ? "تمت العملية بنجاح!" : "Payment Successful!"}
          </h2>
          <p className="text-zinc-400 text-sm">
            {lang === "ar" ? "جاري تحويلك..." : "Redirecting..."}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 flex items-center justify-center p-4" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs px-3 py-1.5 rounded-full mb-4">
            <AlertCircle className="w-3.5 h-3.5" />
            {lang === "ar" ? "وضع الاختبار — لا تُجرى معاملات حقيقية" : "Test Mode — No real transactions"}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {lang === "ar" ? "إتمام الدفع" : "Complete Payment"}
          </h1>
          <p className="text-zinc-400 text-sm">
            {type === "plan"
              ? lang === "ar"
                ? `خطة ${planNames[plan]?.ar || plan} — ${amount} ر.س / شهر`
                : `${planNames[plan]?.en || plan} Plan — ${amount} SAR / month`
              : lang === "ar"
                ? `${credits} جلسة ذكاء — ${amount} ر.س`
                : `${credits} AI Sessions — ${amount} SAR`}
          </p>
        </div>

        <Card className="bg-zinc-900 border-zinc-700 p-6">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">
              {lang === "ar" ? "بيانات البطاقة" : "Card Details"}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-zinc-400 text-xs mb-1.5 block">
                {lang === "ar" ? "رقم البطاقة" : "Card Number"}
              </Label>
              <Input
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCard(e.target.value))}
                placeholder="1234 5678 9012 3456"
                className="bg-zinc-800 border-zinc-700 text-white font-mono tracking-widest"
                data-testid="input-card-number"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-zinc-400 text-xs mb-1.5 block">
                  {lang === "ar" ? "تاريخ الانتهاء" : "Expiry"}
                </Label>
                <Input
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  data-testid="input-expiry"
                />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs mb-1.5 block">CVV</Label>
                <Input
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="123"
                  type="password"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  data-testid="input-cvv"
                />
              </div>
            </div>

            <div>
              <Label className="text-zinc-400 text-xs mb-1.5 block">
                {lang === "ar" ? "اسم حامل البطاقة" : "Cardholder Name"}
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="bg-zinc-800 border-zinc-700 text-white"
                data-testid="input-card-name"
              />
            </div>
          </div>

          <div className="mt-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
            <p className="text-xs text-zinc-500 text-center">
              {lang === "ar"
                ? "بطاقة الاختبار: 5123 4567 8901 2346 | 12/28 | CVV: 123"
                : "Test card: 5123 4567 8901 2346 | 12/28 | CVV: 123"}
            </p>
          </div>

          <Button
            onClick={() => completeMutation.mutate()}
            disabled={completeMutation.isPending}
            className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold"
            data-testid="button-pay-now"
          >
            {completeMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin me-2" />
            ) : null}
            {lang === "ar" ? `ادفع ${amount} ر.س` : `Pay ${amount} SAR`}
          </Button>

          <div className="flex items-center justify-center gap-1.5 mt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-xs text-zinc-500">
              {lang === "ar" ? "دفع آمن — وضع اختبار" : "Secure payment — Test mode"}
            </span>
          </div>
        </Card>

        <button
          onClick={() => setLocation("/billing")}
          className="w-full mt-3 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          data-testid="button-cancel-payment"
        >
          {lang === "ar" ? "إلغاء والعودة" : "Cancel and go back"}
        </button>
      </div>
    </div>
  );
}
