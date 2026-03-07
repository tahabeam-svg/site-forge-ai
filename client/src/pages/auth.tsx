import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Code2, Loader2 } from "lucide-react";
import LanguageToggle from "@/components/language-toggle";

export default function AuthPage({ mode }: { mode: "login" | "register" }) {
  const { login, register, language } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const lang = language;
  const isRegister = mode === "register";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setIsLoading(true);
    try {
      if (isRegister) {
        await register(username, password, displayName);
      } else {
        await login(username, password);
      }
      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: t("error", lang),
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Inter', sans-serif" }}
    >
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4aDEydjEySDM2em0tMTIgMGgxMnYxMkgyNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="relative z-10 text-white max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Code2 className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">{t("brand", lang)}</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            {lang === "ar"
              ? "أنشئ مواقع ويب مذهلة في دقائق"
              : "Create stunning websites in minutes"}
          </h2>
          <p className="text-lg opacity-80">
            {lang === "ar"
              ? "قوة الذكاء الاصطناعي تجعل إنشاء المواقع سهلاً للجميع"
              : "AI-powered website creation made easy for everyone"}
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4">
            {[
              { value: "10K+", label: lang === "ar" ? "موقع" : "Websites" },
              { value: "<2min", label: lang === "ar" ? "للبناء" : "To Build" },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-sm opacity-70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-muted-foreground text-sm"
              data-testid="link-back-home"
            >
              <div className="w-7 h-7 rounded bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Code2 className="w-3.5 h-3.5 text-white" />
              </div>
              {t("brand", lang)}
            </button>
            <LanguageToggle />
          </div>

          <Card>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl" data-testid="text-auth-title">
                {isRegister ? t("signUpTitle", lang) : t("signInTitle", lang)}
              </CardTitle>
              <CardDescription>
                {isRegister ? t("signUpSubtitle", lang) : t("signInSubtitle", lang)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
                  <div className="space-y-2">
                    <Label htmlFor="displayName">{t("displayName", lang)}</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      data-testid="input-display-name"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="username">{t("username", lang)}</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    data-testid="input-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t("password", lang)}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="input-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-submit-auth">
                  {isLoading && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                  {isRegister ? t("createAccountBtn", lang) : t("login", lang)}
                </Button>
              </form>
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {isRegister ? t("hasAccount", lang) : t("noAccount", lang)}{" "}
                <button
                  onClick={() => navigate(isRegister ? "/login" : "/register")}
                  className="text-primary font-medium"
                  data-testid="link-toggle-auth"
                >
                  {isRegister ? t("login", lang) : t("register", lang)}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
