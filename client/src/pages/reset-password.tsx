import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, KeyRound, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [token, setToken] = useState("");

  const lang = localStorage.getItem("arabyweb-lang") || "ar";
  const isAr = lang === "ar";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      toast({ title: isAr ? "رابط غير صالح" : "Invalid link", variant: "destructive" });
      setLocation("/auth");
    } else {
      setToken(t);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: isAr ? "كلمة المرور قصيرة جداً" : "Password too short", description: isAr ? "6 أحرف على الأقل" : "At least 6 characters", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: isAr ? "كلمات المرور غير متطابقة" : "Passwords don't match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/reset-password", { token, password });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      setDone(true);
      setTimeout(() => setLocation("/auth"), 3000);
    } catch (err: any) {
      toast({ title: isAr ? "خطأ" : "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-950 dark:to-gray-900 p-4"
      dir={isAr ? "rtl" : "ltr"}
      style={{ fontFamily: "'Cairo', 'Inter', sans-serif" }}
    >
      <Card className="w-full max-w-md p-8 shadow-xl">
        {done ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-bold">{isAr ? "تم تغيير كلمة المرور!" : "Password Changed!"}</h2>
            <p className="text-muted-foreground text-sm">{isAr ? "سيتم تحويلك لصفحة الدخول..." : "Redirecting to login..."}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{isAr ? "تعيين كلمة مرور جديدة" : "Set New Password"}</h1>
                <p className="text-xs text-muted-foreground">{isAr ? "اختر كلمة مرور قوية" : "Choose a strong password"}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder={isAr ? "كلمة المرور الجديدة" : "New password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  data-testid="input-new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute end-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>

              <Input
                type="password"
                placeholder={isAr ? "تأكيد كلمة المرور" : "Confirm password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                data-testid="input-confirm-password"
              />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                disabled={loading}
                data-testid="button-reset-password-submit"
              >
                {loading ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : null}
                {isAr ? "تغيير كلمة المرور" : "Change Password"}
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
