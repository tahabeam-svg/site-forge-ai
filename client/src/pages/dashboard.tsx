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
  MoreHorizontal,
  Globe2,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const { data: rawProjects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  // Deduplicate by ID to prevent any double-render issues
  const projects = rawProjects.filter((p, idx, arr) => arr.findIndex(x => x.id === p.id) === idx);

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

  const publishedCount = projects.filter(p => p.status === "published").length;
  const generatedCount = projects.filter(p => p.generatedHtml).length;

  return (
    <DashboardLayout>
      <div className="p-5 lg:p-7 max-w-7xl mx-auto">

        {/* ── Page Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight" data-testid="text-dashboard-title">
              {lang === "ar" ? "مشاريعي" : "My Projects"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {lang === "ar"
                ? `${projects.length} مشروع — ${publishedCount} منشور`
                : `${projects.length} project${projects.length !== 1 ? "s" : ""} — ${publishedCount} published`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 text-xs border-violet-400/40 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10"
              onClick={() => setInstantDialogOpen(true)}
              data-testid="button-instant-generate"
            >
              <Zap className="w-3.5 h-3.5" />
              {lang === "ar" ? "إنشاء فوري" : "Instant AI"}
            </Button>
            <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setShowNewProject(true)} data-testid="button-new-project">
              <Plus className="w-3.5 h-3.5" />
              {t("newProject", lang)}
            </Button>
          </div>
        </div>

        {/* ── Stats Row ── */}
        {projects.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              {
                icon: FolderOpen,
                value: projects.length,
                label: lang === "ar" ? "إجمالي المشاريع" : "Total Projects",
                color: "text-blue-500",
                bg: "bg-blue-500/10",
              },
              {
                icon: Globe2,
                value: publishedCount,
                label: lang === "ar" ? "المنشورة" : "Published",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
              },
              {
                icon: TrendingUp,
                value: generatedCount,
                label: lang === "ar" ? "جاهزة" : "Ready",
                color: "text-violet-500",
                bg: "bg-violet-500/10",
              },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border bg-card p-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-lg font-bold leading-tight">{stat.value}</div>
                  <div className="text-[11px] text-muted-foreground leading-tight">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
              <Sparkles className="w-9 h-9 text-emerald-500/60" />
            </div>
            <h3 className="text-lg font-semibold mb-2" data-testid="text-no-projects">
              {t("noProjects", lang)}
            </h3>
            <p className="text-muted-foreground mb-7 max-w-sm text-sm leading-relaxed">
              {t("noProjectsDesc", lang)}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-90 shadow-sm shadow-emerald-500/25"
                onClick={() => setInstantDialogOpen(true)}
                data-testid="button-instant-first"
              >
                <Zap className="w-4 h-4" />
                {lang === "ar" ? "أنشئ موقعاً فوراً ✨" : "Generate Site Instantly ✨"}
              </Button>
              <Button variant="outline" onClick={() => setShowNewProject(true)} data-testid="button-create-first">
                <Plus className="w-4 h-4 me-2" />
                {t("startFromScratch", lang)}
              </Button>
              <Button variant="ghost" onClick={() => navigate("/templates")} data-testid="button-browse-templates">
                <LayoutTemplate className="w-4 h-4 me-2" />
                {t("useTemplate", lang)}
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card
                    className="group overflow-hidden border bg-card card-hover"
                    data-testid={`card-project-${project.id}`}
                  >
                    {/* Thumbnail */}
                    <div
                      className="relative h-36 bg-gradient-to-br from-emerald-500/8 via-teal-500/8 to-cyan-500/8 overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/editor/${project.id}`)}
                    >
                      {project.generatedHtml ? (
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          <iframe
                            srcDoc={`<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,sans-serif;transform:scale(0.38);transform-origin:top left;width:263%;height:263%;overflow:hidden}${project.generatedCss||""}</style></head><body>${(project.generatedHtml||"").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style id="aw-[^"]*">[\s\S]*?<\/style>/gi,"")}</body></html>`}
                            className="w-full h-full bg-white border-0"
                            sandbox="allow-same-origin"
                            title="Project preview"
                          />
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <Sparkles className="w-8 h-8 text-emerald-400/40" />
                          <span className="text-xs text-muted-foreground/50">
                            {lang === "ar" ? "لم يُنشأ بعد" : "Not generated yet"}
                          </span>
                        </div>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <div className="bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                            {lang === "ar" ? "تعديل" : "Edit"}
                          </div>
                        </div>
                      </div>
                      {/* Status badge */}
                      <div className="absolute top-2.5 start-2.5">
                        <Badge
                          variant={statusColor(project.status)}
                          className="text-[10px] h-5 px-1.5 shadow-sm"
                          data-testid={`badge-status-${project.id}`}
                        >
                          {project.status === "published" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-current me-1 animate-pulse inline-block" />
                          )}
                          {statusLabel(project.status)}
                        </Badge>
                      </div>
                    </div>

                    {/* Card body */}
                    <CardContent className="p-3.5">
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="min-w-0">
                          <h3
                            className="font-semibold text-sm truncate cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            onClick={() => navigate(`/editor/${project.id}`)}
                            data-testid={`text-project-name-${project.id}`}
                          >
                            {project.name}
                          </h3>
                          {project.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {project.description}
                            </p>
                          )}
                        </div>
                        {/* Overflow menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                              data-testid={`button-menu-${project.id}`}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={lang === "ar" ? "start" : "end"} className="w-44">
                            <DropdownMenuItem
                              onClick={() => navigate(`/editor/${project.id}`)}
                              data-testid={`menu-edit-${project.id}`}
                            >
                              <Pencil className="w-3.5 h-3.5 me-2" />
                              {t("edit", lang)}
                            </DropdownMenuItem>
                            {project.generatedHtml && (
                              <DropdownMenuItem
                                onClick={() => navigate(`/preview/${project.id}`)}
                                data-testid={`menu-preview-${project.id}`}
                              >
                                <Eye className="w-3.5 h-3.5 me-2" />
                                {t("preview", lang)}
                              </DropdownMenuItem>
                            )}
                            {project.generatedHtml && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => window.open(`/api/projects/${project.id}/export?type=static`, "_blank")}
                                  data-testid={`menu-download-${project.id}`}
                                >
                                  <Download className="w-3.5 h-3.5 me-2" />
                                  {lang === "ar" ? "تحميل HTML" : "Download HTML"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => navigate(`/deploy-guide/${project.id}`)}
                                  data-testid={`menu-deploy-${project.id}`}
                                >
                                  <Upload className="w-3.5 h-3.5 me-2" />
                                  {lang === "ar" ? "انشر موقعك" : "Deploy Guide"}
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteId(project.id)}
                              className="text-destructive focus:text-destructive"
                              data-testid={`menu-delete-${project.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5 me-2" />
                              {t("delete", lang)}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Primary actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          onClick={() => navigate(`/editor/${project.id}`)}
                          data-testid={`button-edit-${project.id}`}
                        >
                          <Pencil className="w-3 h-3 me-1" />
                          {t("edit", lang)}
                        </Button>
                        {project.generatedHtml && project.status !== "published" ? (
                          <Button
                            size="sm"
                            className="flex-1 h-8 text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 shadow-sm shadow-emerald-500/20"
                            onClick={() => publishMutation.mutate(project.id)}
                            disabled={publishMutation.isPending}
                            data-testid={`button-publish-${project.id}`}
                          >
                            {publishMutation.isPending
                              ? <Loader2 className="w-3 h-3 me-1 animate-spin" />
                              : <Rocket className="w-3 h-3 me-1" />
                            }
                            {t("publish", lang)}
                          </Button>
                        ) : project.generatedHtml ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs"
                            onClick={() => navigate(`/preview/${project.id}`)}
                            data-testid={`button-preview-${project.id}`}
                          >
                            <Eye className="w-3 h-3 me-1" />
                            {t("preview", lang)}
                          </Button>
                        ) : null}
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
