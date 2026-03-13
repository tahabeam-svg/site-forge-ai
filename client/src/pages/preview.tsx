import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ExternalLink, Globe2, Loader2 } from "lucide-react";

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
    <div className="h-screen flex flex-col">
      <header
        className="flex items-center justify-between gap-2 px-3 py-2 shrink-0 border-b"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}
        data-testid="preview-toolbar"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
            <Globe2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-bold text-emerald-400 shrink-0 hidden xs:inline">عربي ويب</span>
          <span className="text-slate-400 text-xs hidden xs:inline">|</span>
          <h1
            className="text-sm font-semibold truncate text-white max-w-[130px] sm:max-w-xs"
            data-testid="text-preview-name"
          >
            {project.name}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-white/10 gap-1.5 h-8"
            onClick={() => window.open(previewSrc, "_blank")}
            data-testid="button-open-new-tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">{lang === "ar" ? "فتح" : "Open"}</span>
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-sm gap-1.5 h-8"
            onClick={() => navigate(`/editor/${project.id}`)}
            data-testid="button-back-editor"
          >
            {lang === "ar" ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span className="text-xs">{lang === "ar" ? "تحرير" : "Edit"}</span>
          </Button>
        </div>
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
