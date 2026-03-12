import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import type { Project, Template } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import FeedbackButton from "@/components/FeedbackButton";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Rocket,
  Sparkles,
  Loader2,
  FolderOpen,
  Download,
  Upload,
  Zap,
  Check,
  Crown,
  LayoutTemplate,
} from "lucide-react";

const INSTANT_STEPS = {
  ar: [
    "جاري تحليل وصف موقعك...",
    "اخترنا تصميماً مناسباً لنشاطك...",
    "نكتب محتوى الصفحة الرئيسية...",
    "نبني قسم الخدمات والمميزات...",
    "نصيغ معلومات الاتصال...",
    "نضبط الألوان والخطوط...",
    "نراجع الكود النهائي...",
    "الموقع جاهز! 🎉",
  ],
  en: [
    "Analyzing your website description...",
    "Picking the perfect design for you...",
    "Writing the hero section content...",
    "Building services & features section...",
    "Formatting contact information...",
    "Fine-tuning colors & typography...",
    "Reviewing the final code...",
    "Your website is ready! 🎉",
  ],
};

export default function DashboardPage() {
  const { language } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const lang = language;
  const [showNewProject, setShowNewProject] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const [instantDialogOpen, setInstantDialogOpen] = useState(false);
  const [instantPrompt, setInstantPrompt] = useState("");
  const [instantProgress, setInstantProgress] = useState(0);
  const [instantStep, setInstantStep] = useState(0);
  const [isInstantGenerating, setIsInstantGenerating] = useState(false);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
    staleTime: 10 * 60 * 1000,
  });
  const dialogTemplates = templates.slice(0, 9);

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/projects", {
        name: newName,
        description: newDesc,
        templateId: selectedTemplate?.id || undefined,
      });
      const data = await res.json();
      if (res.status === 402) {
        throw new Error(lang === "ar" ? (data.messageAr || data.message) : (data.messageEn || data.message));
      }
      if (!res.ok) throw new Error(data.message || "Failed to create project");
      if (selectedTemplate) {
        await apiRequest("PUT", `/api/projects/${data.id}`, {
          generatedHtml: selectedTemplate.previewHtml,
          generatedCss: selectedTemplate.previewCss || "",
          status: "generated",
        });
      }
      return data;
    },
    onSuccess: (project: Project) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setShowNewProject(false);
      setNewName("");
      setNewDesc("");
      setSelectedTemplate(null);
      navigate(`/editor/${project.id}`);
    },
    onError: (err: Error) => {
      toast({ title: t("error", lang), description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setDeleteId(null);
      toast({ title: lang === "ar" ? "تم الحذف" : "Deleted", description: lang === "ar" ? "تم حذف المشروع بنجاح" : "Project deleted successfully" });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/projects/${id}/publish`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: lang === "ar" ? "تم النشر" : "Published", description: lang === "ar" ? "تم نشر موقعك بنجاح" : "Your website has been published" });
    },
  });

  function startProgressAnimation() {
    setInstantProgress(5);
    setInstantStep(0);
    let progress = 5;
    let step = 0;
    const steps = INSTANT_STEPS[lang as "ar" | "en"] || INSTANT_STEPS.ar;

    progressInterval.current = setInterval(() => {
      progress += Math.random() * 3 + 1.5;
      if (progress >= 90) progress = 89;
      setInstantProgress(Math.min(progress, 89));

      const newStep = Math.floor((progress / 100) * (steps.length - 1));
      if (newStep !== step && newStep < steps.length - 1) {
        step = newStep;
        setInstantStep(step);
      }
    }, 400);
  }

  function stopProgressAnimation(success: boolean) {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    const steps = INSTANT_STEPS[lang as "ar" | "en"] || INSTANT_STEPS.ar;
    setInstantProgress(100);
    setInstantStep(steps.length - 1);
  }

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  async function handleInstantGenerate() {
    if (!instantPrompt.trim()) return;

    setIsInstantGenerating(true);
    startProgressAnimation();

    try {
      const projectName = instantPrompt.trim().slice(0, 50);
      const createRes = await apiRequest("POST", "/api/projects", {
        name: projectName,
        description: instantPrompt.trim(),
      });
      const project: Project = await createRes.json();

      const genRes = await apiRequest("POST", `/api/projects/${project.id}/generate-instant`, {
        description: instantPrompt.trim(),
        language: lang,
      });
      if (!genRes.ok) {
        const errData = await genRes.json();
        throw new Error(errData.message || "Generation failed");
      }

      stopProgressAnimation(true);

      await new Promise((r) => setTimeout(r, 700));
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });

      setIsInstantGenerating(false);
      setInstantDialogOpen(false);
      setInstantPrompt("");
      setInstantProgress(0);

      navigate(`/editor/${project.id}`);
      toast({
        title: lang === "ar" ? "تم إنشاء الموقع ✨" : "Website Created ✨",
        description: lang === "ar" ? "موقعك جاهز للتعديل والنشر" : "Your website is ready to edit and publish",
      });
    } catch (err: any) {
      stopProgressAnimation(false);
      setIsInstantGenerating(false);
      toast({
        title: t("error", lang),
        description: err.message || (lang === "ar" ? "حدث خطأ في الإنشاء" : "Generation failed"),
        variant: "destructive",
      });
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "published": return "default";
      case "generated": return "secondary";
      case "generating": return "outline";
      default: return "outline";
    }
  };

  const statusLabel = (status: string) => {
    const labels: Record<string, Record<string, string>> = {
      en: { draft: "Draft", generating: "Generating...", generated: "Ready", published: "Published", error: "Error" },
      ar: { draft: "مسودة", generating: "جاري الإنشاء...", generated: "جاهز", published: "منشور", error: "خطأ" },
    };
    return labels[lang]?.[status] || status;
  };

  const instantSteps = INSTANT_STEPS[lang as "ar" | "en"] || INSTANT_STEPS.ar;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">
              {t("projects", lang)}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {lang === "ar"
                ? `${projects.length} مشروع`
                : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10"
              onClick={() => setInstantDialogOpen(true)}
              data-testid="button-instant-generate"
            >
              <Zap className="w-4 h-4" />
              {lang === "ar" ? "إنشاء فوري" : "Instant Generate"}
            </Button>
            <Button onClick={() => setShowNewProject(true)} data-testid="button-new-project">
              <Plus className="w-4 h-4 me-2" />
              {t("newProject", lang)}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2" data-testid="text-no-projects">
              {t("noProjects", lang)}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t("noProjectsDesc", lang)}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90"
                onClick={() => setInstantDialogOpen(true)}
                data-testid="button-instant-first"
              >
                <Zap className="w-4 h-4" />
                {lang === "ar" ? "إنشاء موقع فوراً" : "Generate Instantly"}
              </Button>
              <Button onClick={() => setShowNewProject(true)} data-testid="button-create-first">
                <Sparkles className="w-4 h-4 me-2" />
                {t("startFromScratch", lang)}
              </Button>
              <Button variant="outline" onClick={() => navigate("/templates")} data-testid="button-browse-templates">
                {t("useTemplate", lang)}
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence>
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="hover-elevate group" data-testid={`card-project-${project.id}`}>
                    <div className="relative h-40 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-pink-500/10 rounded-t-lg overflow-hidden">
                      {project.generatedHtml ? (
                        <div className="absolute inset-0 p-2 overflow-hidden pointer-events-none">
                          <iframe
                            srcDoc={`<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,sans-serif;transform:scale(0.4);transform-origin:top left;width:250%;height:250%}${project.generatedCss||""}</style></head><body>${project.generatedHtml}</body></html>`}
                            className="w-full h-full rounded bg-white border-0"
                            sandbox="allow-same-origin"
                            title="Project thumbnail"
                          />
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute top-3 end-3">
                        <Badge variant={statusColor(project.status)} data-testid={`badge-status-${project.id}`}>
                          {statusLabel(project.status)}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1 truncate" data-testid={`text-project-name-${project.id}`}>
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/editor/${project.id}`)}
                          data-testid={`button-edit-${project.id}`}
                        >
                          <Pencil className="w-3.5 h-3.5 me-1" />
                          {t("edit", lang)}
                        </Button>
                        {project.generatedHtml && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/preview/${project.id}`)}
                            data-testid={`button-preview-${project.id}`}
                          >
                            <Eye className="w-3.5 h-3.5 me-1" />
                            {t("preview", lang)}
                          </Button>
                        )}
                        {project.generatedHtml && project.status !== "published" && (
                          <Button
                            size="sm"
                            onClick={() => publishMutation.mutate(project.id)}
                            disabled={publishMutation.isPending}
                            data-testid={`button-publish-${project.id}`}
                          >
                            <Rocket className="w-3.5 h-3.5 me-1" />
                            {t("publish", lang)}
                          </Button>
                        )}
                        {project.generatedHtml && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              window.open(`/api/projects/${project.id}/export?type=static`, "_blank");
                            }}
                            data-testid={`button-download-${project.id}`}
                          >
                            <Download className="w-3.5 h-3.5 me-1" />
                            {lang === "ar" ? "تحميل" : "Download"}
                          </Button>
                        )}
                        {project.generatedHtml && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/deploy-guide/${project.id}`)}
                            className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                            data-testid={`button-deploy-guide-${project.id}`}
                          >
                            <Upload className="w-3.5 h-3.5 me-1" />
                            {lang === "ar" ? "انشر موقعك" : "Deploy"}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(project.id)}
                          className="ms-auto text-muted-foreground"
                          data-testid={`button-delete-${project.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Instant Generate Dialog */}
      <Dialog open={instantDialogOpen} onOpenChange={(open) => { if (!isInstantGenerating) { setInstantDialogOpen(open); if (!open) { setInstantProgress(0); setInstantStep(0); } } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              {lang === "ar" ? "إنشاء موقع فوري" : "Instant Website Generator"}
            </DialogTitle>
            <DialogDescription>
              {lang === "ar"
                ? "صف نشاطك التجاري بجملة أو جملتين وسنبني موقعاً كاملاً في ثوانٍ"
                : "Describe your business in 1-2 sentences and we'll build a complete website in seconds"}
            </DialogDescription>
          </DialogHeader>

          {!isInstantGenerating ? (
            <div className="space-y-4 pt-2">
              <Textarea
                value={instantPrompt}
                onChange={(e) => setInstantPrompt(e.target.value)}
                placeholder={
                  lang === "ar"
                    ? "مثال: مطعم مشويات سعودي في الرياض يقدم أفضل المشويات والوجبات الشعبية بأسعار معقولة"
                    : "Example: A modern digital marketing agency in Dubai specializing in social media and SEO services for SMEs"
                }
                className="resize-none min-h-[110px]"
                rows={4}
                data-testid="input-instant-prompt"
                disabled={isInstantGenerating}
              />
              <div className="flex items-center gap-2 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <Sparkles className="w-4 h-4 text-violet-500 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  {lang === "ar"
                    ? "سيتم إنشاء موقع كامل مع تصميم احترافي وقسم خدمات وتواصل خلال 15-20 ثانية"
                    : "A full website with professional design, services & contact section will be ready in 15-20 seconds"}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setInstantDialogOpen(false)} data-testid="button-cancel-instant">
                  {t("cancel", lang)}
                </Button>
                <Button
                  disabled={!instantPrompt.trim()}
                  onClick={handleInstantGenerate}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90 gap-2"
                  data-testid="button-confirm-instant"
                >
                  <Zap className="w-4 h-4" />
                  {lang === "ar" ? "أنشئ موقعي الآن" : "Generate My Website"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-violet-600 dark:text-violet-400">
                    {instantSteps[instantStep]}
                  </span>
                  <span className="text-muted-foreground font-mono">{Math.round(instantProgress)}%</span>
                </div>
                <Progress value={instantProgress} className="h-2" />
              </div>

              <div className="space-y-2">
                {instantSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: lang === "ar" ? 10 : -10 }}
                    animate={{ opacity: i <= instantStep ? 1 : 0.3 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center gap-2 text-sm ${i <= instantStep ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      i < instantStep
                        ? "bg-emerald-500"
                        : i === instantStep
                        ? "bg-violet-500"
                        : "bg-muted"
                    }`}>
                      {i < instantStep ? (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1 4L3 6L7 2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      ) : i === instantStep ? (
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      ) : null}
                    </div>
                    <span>{step}</span>
                  </motion.div>
                ))}
              </div>

              <p className="text-xs text-center text-muted-foreground">
                {lang === "ar" ? "الرجاء الانتظار، لا تغلق هذه النافذة..." : "Please wait, don't close this window..."}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("createProject", lang)}</DialogTitle>
            <DialogDescription>
              {lang === "ar"
                ? "صف موقعك وسيقوم الذكاء الاصطناعي ببنائه لك"
                : "Describe your website and AI will build it for you"}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newName) createMutation.mutate();
            }}
            className="space-y-4"
          >
            {/* Template quick-picker */}
            {dialogTemplates.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <LayoutTemplate className="w-3.5 h-3.5 text-muted-foreground" />
                  {lang === "ar" ? "ابدأ من قالب (اختياري)" : "Start from template (optional)"}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {/* AI/blank option */}
                  <button
                    type="button"
                    onClick={() => setSelectedTemplate(null)}
                    className={`aspect-video rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all text-[10px] font-medium ${
                      !selectedTemplate
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                        : "border-border hover:border-emerald-300 dark:hover:border-emerald-700 text-muted-foreground"
                    }`}
                    data-testid="button-select-blank-template"
                  >
                    <Sparkles className={`w-4 h-4 ${!selectedTemplate ? "text-emerald-500" : "text-muted-foreground"}`} />
                    {lang === "ar" ? "ذكاء" : "AI"}
                  </button>
                  {/* Template thumbnails */}
                  {dialogTemplates.map((tpl) => (
                    <button
                      type="button"
                      key={tpl.id}
                      onClick={() => {
                        setSelectedTemplate(tpl);
                        if (!newName) setNewName(lang === "ar" && tpl.nameAr ? tpl.nameAr : tpl.name);
                        if (!newDesc) setNewDesc(lang === "ar" && tpl.descriptionAr ? tpl.descriptionAr : tpl.description || "");
                      }}
                      className={`aspect-video rounded-lg border-2 overflow-hidden relative transition-all focus:outline-none ${
                        selectedTemplate?.id === tpl.id
                          ? "border-emerald-500 shadow-md shadow-emerald-500/20"
                          : "border-border hover:border-emerald-300 dark:hover:border-emerald-700"
                      }`}
                      data-testid={`button-select-template-${tpl.id}`}
                    >
                      <img
                        src={tpl.thumbnail || ""}
                        alt={lang === "ar" && tpl.nameAr ? tpl.nameAr : tpl.name}
                        className="w-full h-full object-cover"
                      />
                      {selectedTemplate?.id === tpl.id && (
                        <div className="absolute inset-0 bg-emerald-500/25 flex items-center justify-center">
                          <div className="bg-emerald-500 rounded-full p-0.5">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                      {tpl.isPremium && (
                        <div className="absolute top-0.5 end-0.5">
                          <Crown className="w-2.5 h-2.5 text-amber-400" />
                        </div>
                      )}
                    </button>
                  ))}
                  {/* Browse more */}
                  <button
                    type="button"
                    onClick={() => { setShowNewProject(false); navigate("/templates"); }}
                    className="aspect-video rounded-lg border-2 border-dashed border-border hover:border-emerald-400/60 flex flex-col items-center justify-center gap-1 transition-all text-[10px] text-muted-foreground hover:text-foreground"
                    data-testid="button-browse-more-templates"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {lang === "ar" ? "المزيد" : "More"}
                  </button>
                </div>
                {selectedTemplate && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {lang === "ar"
                      ? `تم اختيار: ${selectedTemplate.nameAr || selectedTemplate.name}`
                      : `Selected: ${selectedTemplate.name}`}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("projectName", lang)}</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={lang === "ar" ? "معرض العطور" : "Perfume Exhibition"}
                required
                data-testid="input-project-name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("projectDescription", lang)}</label>
              <Textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder={t("descriptionPlaceholder", lang)}
                className="resize-none"
                rows={2}
                data-testid="input-project-description"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setShowNewProject(false); setSelectedTemplate(null); }} data-testid="button-cancel-create">
                {t("cancel", lang)}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || !newName} data-testid="button-confirm-create">
                {createMutation.isPending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                {selectedTemplate
                  ? (lang === "ar" ? "إنشاء من القالب" : "Create from Template")
                  : t("createProject", lang)}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("areYouSure", lang)}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteConfirm", lang)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">{t("cancel", lang)}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              data-testid="button-confirm-delete"
            >
              {t("delete", lang)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <FeedbackButton lang={lang} page="dashboard" />
    </DashboardLayout>
  );
}
