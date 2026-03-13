import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, ArrowRight, Globe, Sparkles, Zap, Code2, Palette, CheckCircle2, Play } from "lucide-react";
import { SiGoogle } from "react-icons/si";

function FloatingOrb({ className }: { className: string }) {
  return <div className={`absolute rounded-full blur-3xl animate-pulse ${className}`} />;
}

function LiveCodeDemo({ isAr }: { isAr: boolean }) {
  const [lines, setLines] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const codeSteps = [
    { text: '> arabyweb build --template "business"', color: "text-emerald-300" },
    { text: isAr ? "  تحليل الطلب..." : "  Analyzing request...", color: "text-gray-400" },
    { text: isAr ? "  إنشاء هيكل HTML..." : "  Generating HTML structure...", color: "text-cyan-300" },
    { text: '  <header class="hero-section">', color: "text-blue-300" },
    { text: '    <nav class="navbar">...</nav>', color: "text-blue-300/70" },
    { text: '    <h1>Welcome</h1>', color: "text-blue-300/70" },
    { text: "  </header>", color: "text-blue-300" },
    { text: isAr ? "  تطبيق الأنماط CSS..." : "  Applying CSS styles...", color: "text-cyan-300" },
    { text: "  .hero { background: linear-gradient(...) }", color: "text-purple-300" },
    { text: isAr ? "  إضافة التجاوب responsive..." : "  Adding responsive design...", color: "text-cyan-300" },
    { text: isAr ? "  تحسين SEO..." : "  Optimizing SEO...", color: "text-cyan-300" },
    { text: "", color: "" },
    { text: isAr ? "  موقعك جاهز للنشر!" : "  Your website is ready to deploy!", color: "text-emerald-400" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < codeSteps.length) {
          setLines(l => [...l, codeSteps[prev].text]);
          if (prev === codeSteps.length - 1) {
            setTimeout(() => setShowPreview(true), 400);
          }
          return prev + 1;
        }
        setLines([]);
        setShowPreview(false);
        return 0;
      });
    }, 600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="mt-8 bg-[#0d1117] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-[10px] text-white/30 font-mono">terminal</span>
        </div>
        <Play className="w-3 h-3 text-emerald-400/60" />
      </div>

      <div ref={containerRef} className="p-4 h-[180px] overflow-y-auto font-mono text-xs leading-relaxed" dir="ltr">
        {lines.map((line, i) => {
          const step = codeSteps[i];
          return (
            <div
              key={i}
              className={`${step?.color || "text-gray-400"} transition-opacity duration-300`}
              style={{ opacity: 1 }}
            >
              {line === "" ? "\u00A0" : line}
              {i === lines.length - 1 && currentStep < codeSteps.length && (
                <span className="inline-block w-2 h-4 bg-emerald-400 ms-0.5 animate-pulse" />
              )}
            </div>
          );
        })}
        {lines.length === 0 && (
          <div className="text-gray-500">
            <span className="text-emerald-400">$</span> <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse" />
          </div>
        )}
      </div>

      {showPreview && (
        <div className="border-t border-white/[0.06] px-4 py-3 bg-emerald-500/[0.05] flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-emerald-300 text-xs font-medium">
            {isAr ? "تم بناء الموقع بنجاح في 1.8 ثانية" : "Website built successfully in 1.8s"}
          </span>
          <div className="ms-auto flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400/60 text-[10px]">LIVE</span>
          </div>
        </div>
      )}
    </div>
  );
}

function SpeedCounter({ isAr }: { isAr: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = 2847;
    const duration = 2000;
    const step = target / (duration / 16);
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev >= target) { clearInterval(interval); return target; }
        return Math.min(prev + step, target);
      });
    }, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-6 mt-6">
      <div className="text-center">
        <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Cairo', sans-serif" }}>
          {Math.floor(count).toLocaleString()}+
        </div>
        <div className="text-[10px] text-white/50 mt-0.5">{isAr ? "موقع تم بناؤه" : "Sites Built"}</div>
      </div>
      <div className="w-px h-8 bg-white/10" />
      <div className="text-center">
        <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Cairo', sans-serif" }}>
          {"<"} 2{isAr ? " دقيقة" : " min"}
        </div>
        <div className="text-[10px] text-white/50 mt-0.5">{isAr ? "متوسط وقت البناء" : "Avg. Build Time"}</div>
      </div>
      <div className="w-px h-8 bg-white/10" />
      <div className="text-center">
        <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Cairo', sans-serif" }}>
          400+
        </div>
        <div className="text-[10px] text-white/50 mt-0.5">{isAr ? "قالب جاهز" : "Templates"}</div>
      </div>
    </div>
  );
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
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const storedLang = localStorage.getItem("arabyweb-lang") || "ar";
  const lang = storedLang;
  const isAr = lang === "ar";

  // Show error toast if redirected back from Google OAuth failure
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const reason = params.get("reason");
    const ar = localStorage.getItem("arabyweb-lang") !== "en";
    if (error === "google") {
      const reasonMap: Record<string, string> = {
        no_user: ar ? "لم يتم التعرف على حسابك في Google" : "Could not identify your Google account",
        session: ar ? "مشكلة في حفظ الجلسة، حاول مجدداً" : "Session error, please try again",
        redirect_uri_mismatch: ar ? "رابط التوجيه غير مطابق في إعدادات Google" : "Google OAuth redirect URI mismatch",
      };
      const msg = (reason && reasonMap[reason]) || (reason ? decodeURIComponent(reason) : (ar ? "فشل تسجيل الدخول عبر Google" : "Google login failed"));
      toast({ title: ar ? "خطأ في Google" : "Google Login Error", description: msg, variant: "destructive" });
      window.history.replaceState({}, "", window.location.pathname);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const forgotMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/forgot-password", { email: forgotEmail });
      return res.json();
    },
    onSuccess: () => { setForgotSent(true); },
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
        { icon: Sparkles, text: "ذكاء اصطناعي متقدم" },
        { icon: Zap, text: "نشر فوري" },
        { icon: Palette, text: "400+ قالب" },
        { icon: Code2, text: "تحكم كامل" },
      ]
    : [
        { icon: Sparkles, text: "Advanced AI" },
        { icon: Zap, text: "Instant Deploy" },
        { icon: Palette, text: "400+ Templates" },
        { icon: Code2, text: "Full Control" },
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

        <div className={`relative z-10 px-12 xl:px-16 max-w-2xl w-full transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2.5 mb-6">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="text-white/90 text-sm font-medium tracking-wide">ArabyWeb.net</span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {isAr ? (
              <>
                ابنِ موقعك
                <br />
                <span className="bg-gradient-to-l from-emerald-200 to-cyan-200 bg-clip-text text-transparent">
                  بسرعة البرق
                </span>
              </>
            ) : (
              <>
                Build Websites
                <br />
                <span className="bg-gradient-to-r from-emerald-200 to-cyan-200 bg-clip-text text-transparent">
                  Lightning Fast
                </span>
              </>
            )}
          </h2>

          <p className="text-base text-emerald-100/70 leading-relaxed max-w-md mb-6">
            {isAr
              ? "صِف موقعك بكلماتك، ودع الذكاء الاصطناعي يبنيه لك بكود احترافي في ثوانٍ."
              : "Describe your website in words, and let AI build it with professional code in seconds."}
          </p>

          <div className="flex flex-wrap gap-2 mb-2">
            {features.map((f, i) => (
              <div
                key={i}
                className={`inline-flex items-center gap-2 bg-white/[0.08] backdrop-blur-sm border border-white/[0.1] rounded-full px-4 py-2 transition-all duration-300 hover:bg-white/[0.15] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${(i + 1) * 100}ms` }}
              >
                <f.icon className="w-4 h-4 text-emerald-300" />
                <span className="text-white/90 text-sm font-medium" style={{ fontFamily: "'Cairo', sans-serif" }}>{f.text}</span>
              </div>
            ))}
          </div>

          <LiveCodeDemo isAr={isAr} />

          <SpeedCounter isAr={isAr} />
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
            <button type="button" onClick={() => setLocation("/")} className="inline-flex flex-col items-center cursor-pointer" data-testid="link-brand-auth-mobile">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent" style={{ fontFamily: "'Cairo', sans-serif" }}>
                ArabyWeb.net
              </h1>
            </button>
            <p className="text-muted-foreground mt-1 text-sm">
              {isAr ? "ابنِ موقعك الاحترافي بسرعة البرق" : "Build your website lightning fast"}
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

          {!forgotMode && <div className="bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-2xl flex gap-1 mb-8">
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
          </div>}

          {/* ── Forgot Password Flow ───────────────────────────────── */}
          {forgotMode && (
            <div className="space-y-4">
              {forgotSent ? (
                <div className="text-center space-y-4 py-6">
                  <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
                  <h3 className="font-bold text-lg" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    {isAr ? "تم إرسال الرابط!" : "Link Sent!"}
                  </h3>
                  <p className="text-muted-foreground text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    {isAr
                      ? "إذا كان البريد مسجلاً، ستستلم رابط إعادة تعيين كلمة المرور خلال دقائق."
                      : "If this email is registered, you'll receive a password reset link shortly."}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-xl"
                    onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(""); }}
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    {isAr ? "العودة لتسجيل الدخول" : "Back to Sign In"}
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="font-bold text-lg mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>
                      {isAr ? "نسيت كلمة المرور؟" : "Forgot Password?"}
                    </h3>
                    <p className="text-muted-foreground text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>
                      {isAr ? "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين." : "Enter your email and we'll send you a reset link."}
                    </p>
                  </div>
                  <div className="relative group">
                    <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <Input
                      type="email"
                      placeholder={isAr ? "البريد الإلكتروني" : "Email Address"}
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="ps-11 h-[52px] rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500/20 text-base"
                      style={{ fontFamily: "'Cairo', sans-serif" }}
                      dir="ltr"
                      required
                      data-testid="input-forgot-email"
                    />
                  </div>
                  <Button
                    type="button"
                    className="w-full h-[52px] rounded-xl text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                    disabled={forgotMutation.isPending || !forgotEmail}
                    onClick={() => forgotMutation.mutate()}
                    data-testid="button-send-reset"
                  >
                    {forgotMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin me-2" /> : <Mail className="w-5 h-5 me-2" />}
                    {isAr ? "إرسال رابط إعادة التعيين" : "Send Reset Link"}
                  </Button>
                  <button
                    type="button"
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                    onClick={() => { setForgotMode(false); setForgotEmail(""); }}
                  >
                    {isAr ? "← العودة لتسجيل الدخول" : "← Back to Sign In"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── Login / Register Form ──────────────────────────────── */}
          {!forgotMode && <form onSubmit={handleSubmit} className="space-y-4">
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
                <button
                  type="button"
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                  onClick={() => { setForgotMode(true); setForgotEmail(email); }}
                  data-testid="button-forgot-password"
                >
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
          </form>}

          {!forgotMode && <>
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
          </>}
        </div>
      </div>
    </div>
  );
}
