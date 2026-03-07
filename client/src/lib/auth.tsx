import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth as useReplitAuth } from "@/hooks/use-auth";
import type { Language } from "./i18n";

interface AuthContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useReplitAuth();
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("arabyweb-lang") as Language) || "ar";
    }
    return "ar";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("arabyweb-lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, []);

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, language, setLanguage, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
