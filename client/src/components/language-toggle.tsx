import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
  const { language, setLanguage } = useAuth();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "en" ? "ar" : "en")}
      data-testid="button-language-toggle"
    >
      <Globe className="w-4 h-4 me-1" />
      {language === "en" ? "العربية" : "EN"}
    </Button>
  );
}
