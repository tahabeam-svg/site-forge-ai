import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ExternalLink, Loader2 } from "lucide-react";

export default function PreviewPage() {
  const { language } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id || "0");
  const lang = language;

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project || !project.generatedHtml) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            {lang === "ar" ? "لا يوجد محتوى للمعاينة" : "No content to preview"}
          </p>
          <Button onClick={() => navigate("/dashboard")} data-testid="button-back-dashboard">
            {t("backToDashboard", lang)}
          </Button>
        </div>
      </div>
    );
  }

  const previewSrc = `/api/projects/${projectId}/preview-html?v=${encodeURIComponent(String(project.updatedAt || Date.now()))}`;

  return (
    <div className="h-screen flex flex-col bg-background" style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Inter', sans-serif" }}>
      <header className="flex items-center justify-between gap-2 px-3 py-2 border-b bg-background shrink-0 shadow-sm">
        <Button
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-sm gap-1.5 shrink-0"
          size="sm"
          onClick={() => navigate(`/editor/${project.id}`)}
          data-testid="button-back-editor"
        >
          {lang === "ar" ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span className="hidden xs:inline">{lang === "ar" ? "تحرير" : "Edit"}</span>
          <span className="xs:hidden">{lang === "ar" ? "تحرير" : "Edit"}</span>
        </Button>
        <h1 className="text-sm font-semibold truncate max-w-[120px] sm:max-w-xs" data-testid="text-preview-name">{project.name}</h1>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={() => window.open(previewSrc, "_blank")}
          data-testid="button-open-new-tab"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden sm:inline">{lang === "ar" ? "فتح" : "Open"}</span>
        </Button>
      </header>
      <div className="flex-1">
        <iframe
          src={previewSrc}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          title="Full Preview"
          data-testid="iframe-full-preview"
        />
      </div>
    </div>
  );
}
