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

  const getPreviewHtml = () => {
    if (!project?.generatedHtml) return "";

    const overflowFix = `<style id="aw-overflow-fix">
html,body{overflow-x:hidden!important;max-width:100%!important}
*,*::before,*::after{box-sizing:border-box}
img,video,embed,object,iframe{max-width:100%!important;height:auto}
@media(max-width:768px){
  #aw-menu-btn{display:block !important;}
  .aw-nav-links{display:none !important;}
  nav a:not(.nav-logo):not(.btn-primary):not(.btn-outline):not([class*="logo"]):not([class*="brand"]){display:none;}
  [id*="menu-btn"],[id*="hamburger"],[class*="hamburger"],[class*="menu-toggle"]{display:block !important;}
}
</style>`;
    const awBadge = `<div id="aw-free-badge" style="position:fixed;bottom:0;left:0;right:0;background:linear-gradient(90deg,#0f172a 0%,#1e293b 100%);color:#fff;text-align:center;padding:9px 16px;font-family:'Inter','Cairo',sans-serif;font-size:13px;z-index:2147483647;direction:ltr;display:flex;align-items:center;justify-content:center;gap:10px;border-top:2px solid #10b981;box-shadow:0 -2px 12px rgba(16,185,129,0.3);">Built with <strong style="color:#10b981;margin:0 4px;">ArabyWeb</strong><a href="https://arabyWeb.net/pricing" target="_blank" style="background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;padding:4px 14px;border-radius:20px;text-decoration:none;font-size:12px;font-weight:bold;margin-left:6px;">Upgrade to remove</a></div>`;

    const applyFixes = (html: string) => {
      let fixed = html.replace(/<div id="aw-free-badge"[\s\S]*?<\/div>/i, awBadge);
      fixed = fixed.replace(/<style id="aw-overflow-fix">[\s\S]*?<\/style>/i, "");
      if (fixed.includes("</head>")) {
        fixed = fixed.replace("</head>", `${overflowFix}\n</head>`);
      } else {
        fixed = overflowFix + fixed;
      }
      return fixed;
    };

    if (project.generatedHtml.trimStart().startsWith("<!DOCTYPE")) {
      return applyFixes(project.generatedHtml);
    }

    return applyFixes(`<!DOCTYPE html>
<html lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${project.seoTitle || project.name}</title>
<meta name="description" content="${project.seoDescription || ""}">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Tajawal:wght@300;400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&family=Montserrat:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; scroll-behavior: smooth; }
body { font-family: ${lang === "ar" ? "'Cairo', 'Tajawal', 'IBM Plex Sans Arabic'" : "'Inter', 'Poppins', 'Montserrat'"}, sans-serif; }
img { max-width: 100%; height: auto; }
${project.generatedCss || ""}
</style>
</head>
<body>
${project.generatedHtml}
</body>
</html>`);
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
            {lang === "ar" ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
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
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          title="Full Preview"
          data-testid="iframe-full-preview"
        />
      </div>
    </div>
  );
}
