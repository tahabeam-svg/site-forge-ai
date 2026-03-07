import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";
import type { Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Eye,
  Send,
  Rocket,
  Monitor,
  Tablet,
  Smartphone,
  Wand2,
} from "lucide-react";

type ViewportSize = "desktop" | "tablet" | "mobile";

export default function EditorPage() {
  const { language } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id || "0");
  const lang = language;
  const [editCommand, setEditCommand] = useState("");
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [generateDesc, setGenerateDesc] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const desc = generateDesc || project?.description || project?.name;
      const res = await apiRequest("POST", `/api/projects/${projectId}/generate`, {
        description: desc,
        language: lang,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      toast({
        title: lang === "ar" ? "تم الإنشاء" : "Generated!",
        description: lang === "ar" ? "تم إنشاء موقعك بنجاح" : "Your website has been generated successfully",
      });
    },
    onError: (err: Error) => {
      toast({ title: t("error", lang), description: err.message, variant: "destructive" });
    },
  });

  const editMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/edit`, {
        command: editCommand,
        language: lang,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      setEditCommand("");
      toast({
        title: lang === "ar" ? "تم التعديل" : "Updated!",
        description: lang === "ar" ? "تم تطبيق التعديلات" : "Changes applied successfully",
      });
    },
    onError: (err: Error) => {
      toast({ title: t("error", lang), description: err.message, variant: "destructive" });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/publish`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      toast({
        title: lang === "ar" ? "تم النشر" : "Published!",
        description: lang === "ar" ? "تم نشر موقعك" : "Your website is live",
      });
    },
  });

  const getPreviewHtml = () => {
    if (!project?.generatedHtml) return "";
    return `<!DOCTYPE html>
<html lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${project.seoTitle || project.name}</title>
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

  const viewportWidth = viewport === "desktop" ? "100%" : viewport === "tablet" ? "768px" : "375px";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Inter', sans-serif" }}>
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Inter', sans-serif" }}>
        <p className="text-muted-foreground">{lang === "ar" ? "المشروع غير موجود" : "Project not found"}</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background" style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Inter', sans-serif" }}>
      <header className="flex items-center justify-between gap-2 px-4 py-2 border-b bg-background shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-sm font-semibold" data-testid="text-project-name">{project.name}</h1>
            <p className="text-xs text-muted-foreground">{project.description || ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-muted rounded-md p-0.5">
            {[
              { size: "desktop" as const, icon: Monitor },
              { size: "tablet" as const, icon: Tablet },
              { size: "mobile" as const, icon: Smartphone },
            ].map(({ size, icon: Icon }) => (
              <Button
                key={size}
                variant={viewport === size ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewport(size)}
                data-testid={`button-viewport-${size}`}
              >
                <Icon className="w-4 h-4" />
              </Button>
            ))}
          </div>
          {project.generatedHtml && (
            <>
              <Button variant="outline" size="sm" onClick={() => navigate(`/preview/${project.id}`)} data-testid="button-preview">
                <Eye className="w-4 h-4 me-1" />
                {t("preview", lang)}
              </Button>
              {project.status !== "published" && (
                <Button size="sm" onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending} data-testid="button-publish">
                  <Rocket className="w-4 h-4 me-1" />
                  {t("publish", lang)}
                </Button>
              )}
            </>
          )}
          {project.status === "published" && (
            <Badge data-testid="badge-published">{t("published", lang)}</Badge>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 shrink-0 border-e bg-background flex flex-col overflow-y-auto">
          <div className="p-4 space-y-4">
            {!project.generatedHtml ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-5">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold" data-testid="text-generate-title">
                      {t("generate", lang)}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {lang === "ar"
                        ? "صف موقعك وسنبنيه لك"
                        : "Describe your website and we'll build it"}
                    </p>
                  </div>
                  <Textarea
                    value={generateDesc}
                    onChange={(e) => setGenerateDesc(e.target.value)}
                    placeholder={t("descriptionPlaceholder", lang)}
                    className="resize-none mb-3"
                    rows={4}
                    data-testid="input-generate-description"
                  />
                  <Button
                    onClick={() => generateMutation.mutate()}
                    disabled={generateMutation.isPending}
                    className="w-full"
                    data-testid="button-generate"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 me-2 animate-spin" />
                        {t("generating", lang)}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 me-2" />
                        {t("generate", lang)}
                      </>
                    )}
                  </Button>
                </Card>
              </motion.div>
            ) : (
              <>
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    {lang === "ar" ? "تعديل بالذكاء الاصطناعي" : "AI Edit"}
                  </h3>
                  <div className="flex gap-2">
                    <Input
                      value={editCommand}
                      onChange={(e) => setEditCommand(e.target.value)}
                      placeholder={t("editCommandPlaceholder", lang)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && editCommand) editMutation.mutate();
                      }}
                      data-testid="input-edit-command"
                    />
                    <Button
                      size="icon"
                      onClick={() => editMutation.mutate()}
                      disabled={!editCommand || editMutation.isPending}
                      data-testid="button-apply-edit"
                    >
                      {editMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold mb-2">
                    {lang === "ar" ? "أوامر مقترحة" : "Suggested Commands"}
                  </h3>
                  <div className="space-y-1.5">
                    {(lang === "ar"
                      ? [
                          "اجعل التصميم أكثر فخامة",
                          "أضف قسم معرض صور",
                          "غيّر الألوان إلى أسود وذهبي",
                          "أضف قسم شهادات العملاء",
                        ]
                      : [
                          "Make the design more luxurious",
                          "Add a photo gallery section",
                          "Change colors to black and gold",
                          "Add a testimonials section",
                        ]
                    ).map((cmd, i) => (
                      <Button
                        key={i}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => setEditCommand(cmd)}
                        data-testid={`button-suggestion-${i}`}
                      >
                        <Sparkles className="w-3 h-3 me-2 shrink-0 text-violet-500" />
                        <span className="truncate">{cmd}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {project.sections && Array.isArray(project.sections) && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold mb-2">
                        {lang === "ar" ? "الأقسام" : "Sections"}
                      </h3>
                      <div className="space-y-1">
                        {(project.sections as string[]).map((s, i) => (
                          <div key={i} className="text-sm px-2 py-1.5 rounded bg-muted" data-testid={`text-section-${i}`}>
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {project.colorPalette && typeof project.colorPalette === "object" && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold mb-2">
                        {lang === "ar" ? "لوحة الألوان" : "Color Palette"}
                      </h3>
                      <div className="flex gap-1.5 flex-wrap">
                        {Object.entries(project.colorPalette as Record<string, string>).map(([name, color]) => (
                          <div key={name} className="flex items-center gap-1.5 text-xs" data-testid={`color-${name}`}>
                            <div className="w-5 h-5 rounded-md border" style={{ background: color }} />
                            <span className="text-muted-foreground capitalize">{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                  data-testid="button-regenerate"
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 me-2" />
                  )}
                  {lang === "ar" ? "إعادة الإنشاء" : "Regenerate"}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 bg-muted/30 flex items-start justify-center p-4 overflow-auto">
          {project.generatedHtml ? (
            <div
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300"
              style={{ width: viewportWidth, maxWidth: "100%", height: "calc(100vh - 8rem)" }}
            >
              <iframe
                ref={iframeRef}
                srcDoc={getPreviewHtml()}
                className="w-full h-full border-0"
                sandbox="allow-same-origin"
                title="Website Preview"
                data-testid="iframe-preview"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center text-muted-foreground">
                <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium mb-1">
                  {lang === "ar" ? "ابدأ بإنشاء موقعك" : "Start by generating your website"}
                </p>
                <p className="text-sm opacity-70">
                  {lang === "ar"
                    ? "استخدم اللوحة الجانبية لوصف موقعك"
                    : "Use the sidebar panel to describe your website"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
