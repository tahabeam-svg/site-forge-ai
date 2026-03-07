import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, ArrowRight, Globe, Sparkles, Zap, Shield, Layers, Code2, Palette } from "lucide-react";
import { SiGoogle } from "react-icons/si";

function FloatingOrb({ className }: { className: string }) {
  return <div className={`absolute rounded-full blur-3xl animate-pulse ${className}`} />;
}

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

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
        { icon: Sparkles, text: "بناء مواقع بالذكاء الاصطناعي", desc: "صِف موقعك واحصل عليه جاهزاً" },
        { icon: Zap, text: "نشر فوري بضغطة واحدة", desc: "انشر موقعك على الإنترنت فوراً" },
        { icon: Palette, text: "قوالب احترافية جاهزة", desc: "أكثر من 400 قالب عربي مميز" },
        { icon: Code2, text: "تحكم كامل بالكود", desc: "صدّر موقعك وعدّل عليه بحرية" },
      ]
    : [
        { icon: Sparkles, text: "AI-Powered Builder", desc: "Describe your site and get it ready" },
        { icon: Zap, text: "One-Click Deploy", desc: "Publish instantly to the web" },
        { icon: Palette, text: "400+ Templates", desc: "Professional Arabic-ready templates" },
        { icon: Code2, text: "Full Code Control", desc: "Export and customize freely" },
      ];

  return (
    <div
      className="min-h-screen flex"
      dir={isAr ? "rtl" : "ltr"}
      style={{ fontFamily: "'Cairo', 'Inter', sans-serif" }}
    >
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden items-center justify-center"
        style={{
          background: "linear-gradient(160deg, #064e3b 0%, #047857 25%, #0d9488 50%, #0891b2 75%, #0e7490 100%)",
        }}
      >
        <FloatingOrb className="w-[500px] h-[500px] bg-emerald-400/20 top-[-100px] start-[-100px]" />
        <FloatingOrb className="w-[400px] h-[400px] bg-teal-300/15 bottom-[-50px] end-[-50px]" />
        <FloatingOrb className="w-[300px] h-[300px] bg-cyan-400/10 top-[40%] start-[60%]" />

        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className={`relative z-10 px-16 max-w-xl transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="mb-10">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2.5 mb-8">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <span className="text-white/90 text-sm font-medium tracking-wide">ArabyWeb.net</span>
            </div>

            <h2 className="text-5xl font-bold text-white mb-5 leading-tight" style={{ fontFamily: "'Cairo', sans-serif" }}>
              {isAr ? (
                <>
                  ابنِ موقعك
                  <br />
                  <span className="bg-gradient-to-l from-emerald-200 to-cyan-200 bg-clip-text text-transparent">
                    بقوة الذكاء الاصطناعي
                  </span>
                </>
              ) : (
                <>
                  Build Your Website
                  <br />
                  <span className="bg-gradient-to-r from-emerald-200 to-cyan-200 bg-clip-text text-transparent">
                    Powered by AI
                  </span>
                </>
              )}
            </h2>
            <p className="text-lg text-emerald-100/80 leading-relaxed max-w-md">
              {isAr
                ? "المنصة الأولى عربياً لبناء المواقع الاحترافية بالذكاء الاصطناعي في ثوانٍ معدودة."
                : "The leading Arabic platform for building professional websites with AI in seconds."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`group bg-white/[0.07] hover:bg-white/[0.12] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${(i + 1) * 150}ms` }}
              >
                <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center mb-3 group-hover:bg-white/25 transition-colors">
                  <feature.icon className="w-5 h-5 text-emerald-200" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {feature.text}
                </h3>
                <p className="text-white/50 text-xs leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-2 rtl:space-x-reverse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-emerald-700 bg-gradient-to-br from-emerald-300 to-teal-400" />
              ))}
            </div>
            <div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-white/60 text-xs mt-0.5">
                {isAr ? "موثوق من آلاف المستخدمين" : "Trusted by thousands of users"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-10 bg-white dark:bg-gray-950 relative">
        <div className="absolute top-6 end-6">
          <button
            onClick={() => {
              const newLang = lang === "ar" ? "en" : "ar";
              localStorage.setItem("arabyweb-lang", newLang);
              window.location.reload();
            }}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1.5 rounded-full"
            data-testid="button-lang-toggle"
          >
            <Globe className="w-3.5 h-3.5" />
            {isAr ? "EN" : "عربي"}
          </button>
        </div>

        <div className={`w-full max-w-[400px] transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="text-center lg:hidden mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent" style={{ fontFamily: "'Cairo', sans-serif" }}>
              ArabyWeb.net
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {isAr ? "ابنِ موقعك الاحترافي بالذكاء الاصطناعي" : "Build your professional website with AI"}
            </p>
          </div>

          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
              {isLogin
                ? isAr ? "مرحباً بعودتك" : "Welcome Back"
                : isAr ? "انضم إلينا اليوم" : "Join Us Today"
              }
            </h1>
            <p className="text-muted-foreground">
              {isLogin
                ? isAr ? "سجّل دخولك للمتابعة إلى لوحة التحكم" : "Sign in to continue to your dashboard"
                : isAr ? "أنشئ حسابك وابدأ ببناء موقعك الاحترافي" : "Create your account and start building"
              }
            </p>
          </div>

          <div className="bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-2xl flex gap-1 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isLogin
                  ? "bg-white dark:bg-gray-900 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={{ fontFamily: "'Cairo', sans-serif" }}
              data-testid="button-tab-login"
            >
              {isAr ? "تسجيل الدخول" : "Sign In"}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                !isLogin
                  ? "bg-white dark:bg-gray-900 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={{ fontFamily: "'Cairo', sans-serif" }}
              data-testid="button-tab-register"
            >
              {isAr ? "حساب جديد" : "Sign Up"}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3">
                <div className="relative group">
                  <User className="absolute start-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  <Input
                    placeholder={isAr ? "الاسم الأول" : "First Name"}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="ps-11 h-[52px] rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500/20 text-base"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                    data-testid="input-first-name"
                  />
                </div>
                <div className="relative group">
                  <User className="absolute start-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  <Input
                    placeholder={isAr ? "اسم العائلة" : "Last Name"}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="ps-11 h-[52px] rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500/20 text-base"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                    data-testid="input-last-name"
                  />
                </div>
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                type="email"
                placeholder={isAr ? "البريد الإلكتروني" : "Email Address"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ps-11 h-[52px] rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500/20 text-base"
                style={{ fontFamily: "'Cairo', sans-serif" }}
                dir="ltr"
                required
                data-testid="input-email"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                type="password"
                placeholder={isAr ? "كلمة المرور" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ps-11 h-[52px] rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500/20 text-base"
                style={{ fontFamily: "'Cairo', sans-serif" }}
                dir="ltr"
                required
                minLength={6}
                data-testid="input-password"
              />
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {isAr ? "نسيت كلمة المرور؟" : "Forgot password?"}
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-[52px] rounded-xl text-base font-bold gap-2.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-700 text-white shadow-xl shadow-emerald-500/30 transition-all duration-200 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0"
              style={{ fontFamily: "'Cairo', sans-serif" }}
              disabled={isPending}
              data-testid="button-submit-auth"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
              {isLogin
                ? isAr ? "تسجيل الدخول" : "Sign In"
                : isAr ? "إنشاء حساب" : "Create Account"
              }
            </Button>
          </form>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-gray-950 px-4 text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: "'Cairo', sans-serif" }}>
                {isAr ? "أو" : "or"}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-[52px] rounded-xl gap-3 text-base font-semibold border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-300 transition-all duration-200"
            style={{ fontFamily: "'Cairo', sans-serif" }}
            onClick={() => { window.location.href = "/api/auth/google"; }}
            data-testid="button-google-login"
          >
            <SiGoogle className="w-5 h-5" style={{ color: "#4285F4" }} />
            {isAr ? "المتابعة بحساب Google" : "Continue with Google"}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-8" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {isAr
              ? "بالمتابعة، أنت توافق على شروط الاستخدام وسياسة الخصوصية"
              : "By continuing, you agree to our Terms of Service and Privacy Policy"
            }
          </p>
        </div>
      </div>
    </div>
  );
}
