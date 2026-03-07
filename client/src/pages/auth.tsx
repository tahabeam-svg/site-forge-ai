import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, ArrowRight } from "lucide-react";
import { SiGoogle } from "react-icons/si";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const storedLang = localStorage.getItem("arabyweb-lang") || "ar";
  const lang = storedLang;

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
    onError: (err: Error) => {
      toast({ title: lang === "ar" ? "خطأ" : "Error", description: err.message, variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/register", { email, password, firstName, lastName });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
    onError: (err: Error) => {
      toast({ title: lang === "ar" ? "خطأ" : "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation.mutate();
    } else {
      registerMutation.mutate();
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
      }}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Site Forge AI</h1>
          <p className="text-gray-400">
            {lang === "ar"
              ? "منصة بناء المواقع بالذكاء الاصطناعي"
              : "AI-Powered Website Builder"}
          </p>
        </div>

        <Card className="p-6 bg-white/95 backdrop-blur-sm shadow-2xl">
          <div className="flex gap-2 mb-6">
            <Button
              variant={isLogin ? "default" : "outline"}
              className="flex-1"
              onClick={() => setIsLogin(true)}
              data-testid="button-tab-login"
            >
              {lang === "ar" ? "تسجيل الدخول" : "Login"}
            </Button>
            <Button
              variant={!isLogin ? "default" : "outline"}
              className="flex-1"
              onClick={() => setIsLogin(false)}
              data-testid="button-tab-register"
            >
              {lang === "ar" ? "حساب جديد" : "Register"}
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute start-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={lang === "ar" ? "الاسم الأول" : "First Name"}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="ps-9"
                    data-testid="input-first-name"
                  />
                </div>
                <div className="relative">
                  <User className="absolute start-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={lang === "ar" ? "اسم العائلة" : "Last Name"}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="ps-9"
                    data-testid="input-last-name"
                  />
                </div>
              </div>
            )}

            <div className="relative">
              <Mail className="absolute start-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder={lang === "ar" ? "البريد الإلكتروني" : "Email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ps-9"
                dir="ltr"
                required
                data-testid="input-email"
              />
            </div>

            <div className="relative">
              <Lock className="absolute start-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder={lang === "ar" ? "كلمة المرور" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ps-9"
                dir="ltr"
                required
                minLength={6}
                data-testid="input-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isPending}
              data-testid="button-submit-auth"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              {isLogin
                ? lang === "ar" ? "دخول" : "Login"
                : lang === "ar" ? "إنشاء حساب" : "Create Account"
              }
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                {lang === "ar" ? "أو" : "OR"}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => { window.location.href = "/api/auth/google"; }}
            data-testid="button-google-login"
          >
            <SiGoogle className="w-4 h-4" />
            {lang === "ar" ? "الدخول بحساب Google" : "Continue with Google"}
          </Button>
        </Card>

        <div className="text-center">
          <button
            onClick={() => {
              const newLang = lang === "ar" ? "en" : "ar";
              localStorage.setItem("arabyweb-lang", newLang);
              window.location.reload();
            }}
            className="text-gray-400 hover:text-white text-sm transition-colors"
            data-testid="button-lang-toggle"
          >
            {lang === "ar" ? "English" : "العربية"}
          </button>
        </div>
      </div>
    </div>
  );
}
