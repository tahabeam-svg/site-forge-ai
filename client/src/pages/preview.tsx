import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";

export default function PreviewPage() {
  const { language } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id || "0");
  const lang = language;

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
  });

  const getPreviewHtml = () => {
    if (!project?.generatedHtml) return "";
    return `<!DOCTYPE html>
<html lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${project.seoTitle || project.name}</title>
<meta name="description" content="${project.seoDescription || ""}">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: ${lang === "ar" ? "'Cairo'" : "'Inter'"}, sans-serif; }
img { max-width: 100%; height: auto; }
${project.generatedCss || ""}
</style>
</head>
<body>
${project.generatedHtml}
</body>
</html>`;
  };

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

  return (
    <div className="h-screen flex flex-col bg-background" style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Inter', sans-serif" }}>
      <header className="flex items-center justify-between gap-2 px-4 py-2.5 border-b bg-background shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-sm gap-2"
            size="sm"
            onClick={() => navigate(`/editor/${project.id}`)}
            data-testid="button-back-editor"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === "ar" ? "العودة للتحرير" : "Back to Editor"}
          </Button>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold leading-none" data-testid="text-preview-name">{project.name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t("preview", lang)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const blob = new Blob([getPreviewHtml()], { type: "text/html" });
              const url = URL.createObjectURL(blob);
              window.open(url, "_blank");
            }}
            data-testid="button-open-new-tab"
          >
            <ExternalLink className="w-4 h-4 me-1" />
            {lang === "ar" ? "فتح في نافذة جديدة" : "Open in new tab"}
          </Button>
        </div>
      </header>
      <div className="flex-1">
        <iframe
          srcDoc={getPreviewHtml()}
          className="w-full h-full border-0"
          sandbox="allow-same-origin"
          title="Full Preview"
          data-testid="iframe-full-preview"
        />
      </div>
    </div>
  );
}
