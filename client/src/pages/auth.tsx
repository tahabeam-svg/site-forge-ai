import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, ArrowRight, Globe, Sparkles, Zap, Shield } from "lucide-react";
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
  const isAr = lang === "ar";

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
      toast({ title: isAr ? "خطأ" : "Error", description: err.message, variant: "destructive" });
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
      toast({ title: isAr ? "خطأ" : "Error", description: err.message, variant: "destructive" });
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

  const features = isAr
    ? [
        { icon: Sparkles, text: "بناء مواقع بالذكاء الاصطناعي" },
        { icon: Zap, text: "نشر فوري بضغطة واحدة" },
        { icon: Shield, text: "قوالب احترافية جاهزة" },
      ]
    : [
        { icon: Sparkles, text: "AI-Powered Website Builder" },
        { icon: Zap, text: "One-Click Instant Deploy" },
        { icon: Shield, text: "Professional Ready Templates" },
      ];

  return (
    <div
      className="min-h-screen flex"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #059669 0%, #0d9488 30%, #0891b2 60%, #0284c7 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 start-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 end-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute top-1/2 start-1/2 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 px-12 max-w-lg text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-8">
            <Globe className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-4xl font-bold text-white mb-4">
            ArabyWeb.net
          </h2>
          <p className="text-xl text-emerald-100 mb-12">
            {isAr
              ? "ابنِ موقعك الاحترافي في دقائق"
              : "Build your professional website in minutes"}
          </p>

          <div className="space-y-6">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-4 text-white/90">
                <div className="flex-shrink-0 w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <feature.icon className="w-6 h-6" />
                </div>
                <span className="text-lg">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:hidden">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              ArabyWeb.net
            </h1>
            <p className="text-muted-foreground mt-1">
              {isAr ? "ابنِ موقعك الاحترافي في دقائق" : "Build your professional website in minutes"}
            </p>
          </div>

          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold text-foreground">
              {isLogin
                ? isAr ? "مرحباً بعودتك" : "Welcome Back"
                : isAr ? "إنشاء حساب جديد" : "Create an Account"
              }
            </h1>
            <p className="text-muted-foreground mt-1">
              {isLogin
                ? isAr ? "سجّل دخولك للمتابعة" : "Sign in to continue"
                : isAr ? "ابدأ رحلتك معنا اليوم" : "Start your journey today"
              }
            </p>
          </div>

          <div className="bg-muted/50 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                isLogin
                  ? "bg-white dark:bg-gray-800 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="button-tab-login"
            >
              {isAr ? "تسجيل الدخول" : "Sign In"}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                !isLogin
                  ? "bg-white dark:bg-gray-800 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="button-tab-register"
            >
              {isAr ? "حساب جديد" : "Sign Up"}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={isAr ? "الاسم الأول" : "First Name"}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="ps-10 h-12 rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    data-testid="input-first-name"
                  />
                </div>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={isAr ? "اسم العائلة" : "Last Name"}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="ps-10 h-12 rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    data-testid="input-last-name"
                  />
                </div>
              </div>
            )}

            <div className="relative">
              <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder={isAr ? "البريد الإلكتروني" : "Email Address"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ps-10 h-12 rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                dir="ltr"
                required
                data-testid="input-email"
              />
            </div>

            <div className="relative">
              <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder={isAr ? "كلمة المرور" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ps-10 h-12 rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                dir="ltr"
                required
                minLength={6}
                data-testid="input-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-semibold gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
              disabled={isPending}
              data-testid="button-submit-auth"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
              {isLogin
                ? isAr ? "دخول" : "Sign In"
                : isAr ? "إنشاء حساب" : "Create Account"
              }
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 px-3 text-muted-foreground">
                {isAr ? "أو" : "OR"}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-12 rounded-xl gap-3 text-base border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => { window.location.href = "/api/auth/google"; }}
            data-testid="button-google-login"
          >
            <SiGoogle className="w-5 h-5 text-[#4285F4]" />
            {isAr ? "المتابعة بحساب Google" : "Continue with Google"}
          </Button>

          <div className="text-center pt-2">
            <button
              onClick={() => {
                const newLang = lang === "ar" ? "en" : "ar";
                localStorage.setItem("arabyweb-lang", newLang);
                window.location.reload();
              }}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors inline-flex items-center gap-2"
              data-testid="button-lang-toggle"
            >
              <Globe className="w-3.5 h-3.5" />
              {isAr ? "English" : "العربية"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
