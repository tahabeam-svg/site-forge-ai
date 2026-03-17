import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
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
  Globe2,
  TrendingUp,
  ImageIcon,
  X,
  MoreHorizontal,
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
    "جاري تحليل وصفك بالذكاء الاصطناعي...",
    "نختار التصميم المثالي لنشاطك...",
    "نكتب محتوى الصفحة الرئيسية...",
    "نبني قسم الخدمات والمميزات...",
    "نضيف قسم الشهادات والتواصل...",
    "نضبط الألوان والخطوط الاحترافية...",
    "نراجع الكود النهائي...",
    "موقعك جاهز! 🎉",
  ],
  en: [
    "Analyzing your description with AI...",
    "Picking the perfect design...",
    "Writing the hero section content...",
    "Building services & features...",
    "Adding testimonials & contact...",
    "Fine-tuning colors & typography...",
    "Reviewing the final code...",
    "Your website is ready! 🎉",
  ],
};

const WEBSITE_LANGUAGES = [
  { code: "ar", label: "عربي", flag: "🇸🇦", native: "العربية" },
  { code: "en", label: "English", flag: "🇬🇧", native: "English" },
  { code: "fr", label: "Français", flag: "🇫🇷", native: "Français" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷", native: "Türkçe" },
  { code: "ru", label: "Русский", flag: "🇷🇺", native: "Русский" },
  { code: "de", label: "Deutsch", flag: "🇩🇪", native: "Deutsch" },
  { code: "zh", label: "中文", flag: "🇨🇳", native: "中文" },
];

interface SimpleForm {
  description: string;
  websiteLanguage: string;
  whatsapp: string;
  logoDataUrl: string;
  logoPreview: string;
}

const defaultSimpleForm: SimpleForm = {
  description: "",
  websiteLanguage: "ar",
  whatsapp: "",
  logoDataUrl: "",
  logoPreview: "",
};

function compressImageForUpload(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 600;
        let { width, height } = img;
        if (width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = reject;
      img.src = ev.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DashboardPage() {
  const { language } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const lang = language;
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [instantDialogOpen, setInstantDialogOpen] = useState(false);
  const [simpleForm, setSimpleForm] = useState<SimpleForm>(defaultSimpleForm);
  const [instantProgress, setInstantProgress] = useState(0);
  const [instantStep, setInstantStep] = useState(0);
  const [isInstantGenerating, setIsInstantGenerating] = useState(false);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  async function handleLogoUpload(file: File) {
    try {
      const compressed = await compressImageForUpload(file);
      setSimpleForm((prev) => ({ ...prev, logoDataUrl: compressed, logoPreview: compressed }));
    } catch {
      toast({ title: lang === "ar" ? "خطأ" : "Error", description: lang === "ar" ? "تعذّر رفع الشعار" : "Failed to upload logo", variant: "destructive" });
    }
  }

  const { data: rawProjects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  const projects = rawProjects.filter((p, idx, arr) => arr.findIndex(x => x.id === p.id) === idx);

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
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to publish");
      return data;
    },
    onSuccess: (project: Project) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: lang === "ar" ? "✅ تم وضع علامة منشور" : "✅ Marked as Published",
        description: lang === "ar"
          ? "لنشر موقعك فعلياً على الإنترنت، استخدم زر «انشر موقعك» أو حمّل ملف HTML"
          : "To go live on the internet, use «Deploy Guide» or download the HTML file",
      });
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

  function stopProgressAnimation() {
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
    const desc = simpleForm.description.trim();
    if (!desc || desc.length < 5) return;

    setIsInstantGenerating(true);
    startProgressAnimation();

    try {
      // 1. Parse description with AI to extract business type, style, name
      let activityType = "other";
      let designStyle = "dark-modern";
      let projectName = desc.split(/\n|،|\./).find(s => s.trim().length > 2)?.trim().slice(0, 60) || desc.slice(0, 60);

      try {
        const parseRes = await fetch("/api/ai-builder/parse-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: desc, language: lang }),
          credentials: "include",
        });
        if (parseRes.ok) {
          const parsed = await parseRes.json();
          if (parsed.activityType) activityType = parsed.activityType;
          if (parsed.designStyle) designStyle = parsed.designStyle;
          const parsedName = lang === "ar" ? parsed.businessNameAr : parsed.businessNameEn;
          if (parsedName && parsedName.trim().length > 1) projectName = parsedName.trim().slice(0, 60);
        }
      } catch {
        // Fail silently — proceed with defaults
      }

      // 2. Create project
      const createRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName, description: desc }),
        credentials: "include",
      });
      const createData = await createRes.json();

      if (createRes.status === 402) {
        stopProgressAnimation();
        setIsInstantGenerating(false);
        setInstantDialogOpen(false);
        toast({
          title: lang === "ar" ? "تحتاج إلى ترقية الخطة" : "Upgrade Required",
          description: lang === "ar" ? (createData.messageAr || createData.message) : (createData.messageEn || createData.message),
          variant: "destructive",
        });
        navigate("/billing");
        return;
      }
      if (!createRes.ok) throw new Error(createData.detail || createData.message || "Failed to create project");

      const project: Project = createData;

      // 3. Generate website with AI
      const genPayload: Record<string, unknown> = {
        description: desc,
        language: lang,
        websiteLanguage: simpleForm.websiteLanguage || "ar",
        websiteLanguages: [simpleForm.websiteLanguage || "ar"],
        activityType,
        designStyle,
      };
      if (simpleForm.logoDataUrl) genPayload.logoDataUrl = simpleForm.logoDataUrl;
      if (simpleForm.whatsapp) genPayload.whatsapp = simpleForm.whatsapp;

      const genRes = await fetch(`/api/projects/${project.id}/generate-instant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(genPayload),
        credentials: "include",
      });
      if (!genRes.ok) {
        const errData = await genRes.json().catch(() => ({}));
        if (genRes.status === 402) {
          stopProgressAnimation();
          setIsInstantGenerating(false);
          setInstantDialogOpen(false);
          const isCreditsErr = errData.message === "insufficient_credits";
          toast({
            title: lang === "ar"
              ? (isCreditsErr ? "نفد رصيد الذكاء" : "تحتاج إلى ترقية الخطة")
              : (isCreditsErr ? "AI Credits Depleted" : "Upgrade Required"),
            description: lang === "ar" ? (errData.messageAr || errData.message) : (errData.messageEn || errData.message),
            variant: "destructive",
          });
          navigate("/billing");
          return;
        }
        throw new Error(errData.detail || errData.message || "Generation failed");
      }

      stopProgressAnimation();
      await new Promise((r) => setTimeout(r, 700));
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });

      setIsInstantGenerating(false);
      setInstantDialogOpen(false);
      setSimpleForm(defaultSimpleForm);
      setInstantProgress(0);

      navigate(`/editor/${project.id}`);
      toast({
        title: lang === "ar" ? "تم إنشاء الموقع ✨" : "Website Created ✨",
        description: lang === "ar" ? "موقعك جاهز للتعديل والنشر" : "Your website is ready to edit and publish",
      });
    } catch (err: any) {
      stopProgressAnimation();
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
              size="sm"
              variant="outline"
              className="gap-1.5 h-8 text-xs border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10"
              onClick={() => navigate("/ai-builder")}
              data-testid="button-ai-builder"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {lang === "ar" ? "المبني AI" : "AI Builder"}
            </Button>
            <Button size="sm" className="gap-1.5 h-8 text-xs bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90" onClick={() => setInstantDialogOpen(true)} data-testid="button-new-project">
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
                className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90 shadow-sm shadow-violet-500/25"
                onClick={() => setInstantDialogOpen(true)}
                data-testid="button-instant-first"
              >
                <Sparkles className="w-4 h-4" />
                {lang === "ar" ? "أنشئ موقعك بالذكاء الاصطناعي ✨" : "Create with AI ✨"}
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
                      className="relative h-44 bg-gradient-to-br from-emerald-500/8 via-teal-500/8 to-cyan-500/8 overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/editor/${project.id}`)}
                    >
                      {project.generatedHtml ? (
                        <div className="absolute inset-0 overflow-hidden pointer-events-none transition-transform duration-500 group-hover:scale-105">
                          <iframe
                            srcDoc={`<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,sans-serif;transform:scale(0.42);transform-origin:top left;width:238%;height:238%;overflow:hidden}${project.generatedCss||""}</style></head><body>${(project.generatedHtml||"").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<style id="aw-[^"]*">[\s\S]*?<\/style>/gi,"")}</body></html>`}
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
                      {/* Hover overlay with action buttons */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <div className="bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                            <Pencil className="w-3 h-3" />
                            {lang === "ar" ? "تعديل" : "Edit"}
                          </div>
                          {project.generatedHtml && (
                            <div
                              className="bg-slate-800/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 hover:bg-slate-700 transition-colors cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); window.open(`/preview/${project.id}`, "_blank"); }}
                            >
                              <Eye className="w-3 h-3" />
                              {lang === "ar" ? "معاينة" : "Preview"}
                            </div>
                          )}
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
                      <div className="flex flex-col gap-1.5">
                        {/* Row 1: Edit + Preview + Download */}
                        <div className="flex gap-1.5">
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
                          {project.generatedHtml && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-8 text-xs"
                                onClick={() => navigate(`/preview/${project.id}`)}
                                data-testid={`button-preview-${project.id}`}
                              >
                                <Eye className="w-3 h-3 me-1" />
                                {lang === "ar" ? "معاينة" : "Preview"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 px-0 shrink-0"
                                onClick={() => window.open(`/api/projects/${project.id}/export?type=static`, "_blank")}
                                data-testid={`button-download-${project.id}`}
                                title={lang === "ar" ? "تحميل HTML" : "Download HTML"}
                              >
                                <Download className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                        {/* Row 2: Publish (full width) */}
                        {project.generatedHtml && project.status !== "published" && (
                          <Button
                            size="sm"
                            className="w-full h-8 text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 shadow-sm shadow-emerald-500/20"
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
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* AI Generate Dialog — Simple Durable-style */}
      <Dialog open={instantDialogOpen} onOpenChange={(open) => {
        if (!isInstantGenerating) {
          setInstantDialogOpen(open);
          if (!open) { setInstantProgress(0); setInstantStep(0); setSimpleForm(defaultSimpleForm); }
        }
      }}>
        <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              {lang === "ar" ? "أنشئ موقعك بالذكاء الاصطناعي" : "Create Your Website with AI"}
            </DialogTitle>
            <DialogDescription>
              {lang === "ar"
                ? "فقط صف نشاطك في سطرين وسيبني الذكاء الاصطناعي موقعك الاحترافي الكامل خلال ثوانٍ"
                : "Just describe your business in 2 lines and AI will build your complete professional website in seconds"}
            </DialogDescription>
          </DialogHeader>

          {!isInstantGenerating ? (
            <div dir={lang === "ar" ? "rtl" : "ltr"} className="space-y-4 pt-1">

              {/* ───── STEP 1: Basic Info ───── */}
              {/* ═══ DESCRIPTION TEXTAREA ═══ */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                  {lang === "ar" ? "صف نشاطك التجاري" : "Describe Your Business"}
                  <span className="text-red-500 ms-1">*</span>
                </Label>
                <div className="relative">
                  <Textarea
                    value={simpleForm.description}
                    onChange={(e) => setSimpleForm(p => ({ ...p, description: e.target.value }))}
                    placeholder={lang === "ar"
                      ? "مثال: مطعم سعودي متخصص في المأكولات النجدية الأصيلة في الرياض، نقدم أفضل الكبسة والمندي بأسعار مناسبة مع توصيل سريع للمنازل..."
                      : "e.g. A modern dental clinic in Riyadh specializing in cosmetic dentistry and teeth whitening. We offer affordable prices and flexible appointments..."}
                    className="resize-none min-h-[130px] text-sm leading-relaxed"
                    rows={5}
                    maxLength={600}
                    data-testid="input-description"
                  />
                  <div className="absolute bottom-2 end-2 text-[10px] text-muted-foreground pointer-events-none">
                    {simpleForm.description.length}/600
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {lang === "ar"
                    ? "💡 الذكاء الاصطناعي سيستخرج اسم نشاطك ونوعه ويختار الألوان المناسبة تلقائياً"
                    : "💡 AI will automatically extract your business name, type, and pick the perfect colors"}
                </p>
              </div>

              {/* ═══ WEBSITE LANGUAGE ═══ */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-violet-500" />
                  {lang === "ar" ? "لغة الموقع" : "Website Language"}
                </Label>
                <div className="flex flex-wrap gap-2" data-testid="group-website-language">
                  {WEBSITE_LANGUAGES.map((wl) => (
                    <button
                      key={wl.code}
                      type="button"
                      onClick={() => setSimpleForm(p => ({ ...p, websiteLanguage: wl.code }))}
                      data-testid={"button-lang-" + wl.code}
                      className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all " + (
                        simpleForm.websiteLanguage === wl.code
                          ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/30"
                          : "border-border bg-background text-foreground hover:border-violet-400 hover:text-violet-600"
                      )}
                    >
                      <span>{wl.flag}</span>
                      <span>{wl.native}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ═══ WHATSAPP ═══ */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm font-medium">
                  <span className="text-[#25D366] font-bold text-base leading-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </span>
                  {lang === "ar" ? "رقم واتساب" : "WhatsApp Number"}
                  <span className="text-[10px] font-normal text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-1.5 py-0.5 rounded-full ms-1">
                    {lang === "ar" ? "اختياري — يُفعّل زر واتساب" : "optional — activates WhatsApp button"}
                  </span>
                </Label>
                <Input
                  value={simpleForm.whatsapp}
                  onChange={(e) => setSimpleForm(p => ({ ...p, whatsapp: e.target.value }))}
                  placeholder="+966 5X XXX XXXX"
                  data-testid="input-whatsapp"
                  dir="ltr"
                  className={simpleForm.whatsapp ? "border-[#25D366] focus-visible:ring-[#25D366]/30" : ""}
                />
              </div>

              {/* ═══ LOGO UPLOAD ═══ */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm font-medium">
                  <ImageIcon className="w-3.5 h-3.5 text-violet-500" />
                  {lang === "ar" ? "شعار (اختياري)" : "Logo (optional)"}
                </Label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  data-testid="input-logo-upload"
                  onChange={(e) => { const file = e.target.files?.[0]; if (file) handleLogoUpload(file); }}
                />
                {simpleForm.logoPreview ? (
                  <div className="relative inline-block">
                    <img src={simpleForm.logoPreview} alt="logo preview" className="h-16 w-auto max-w-[180px] object-contain rounded-lg border bg-white p-2" />
                    <button
                      type="button"
                      onClick={() => setSimpleForm(p => ({ ...p, logoDataUrl: "", logoPreview: "" }))}
                      className="absolute -top-2 -end-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full h-16 rounded-xl border-2 border-dashed border-violet-300 dark:border-violet-700 hover:border-violet-500 hover:bg-violet-500/5 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-violet-600 group"
                    data-testid="button-upload-logo"
                  >
                    <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-xs">{lang === "ar" ? "انقر لرفع الشعار (PNG/SVG)" : "Click to upload logo (PNG/SVG)"}</span>
                  </button>
                )}
              </div>

              {/* ═══ ACTION BUTTONS ═══ */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  disabled={!simpleForm.description.trim() || simpleForm.description.trim().length < 5}
                  onClick={() => handleInstantGenerate()}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90 gap-2 h-11 text-sm font-semibold"
                  data-testid="button-confirm-instant"
                >
                  <Sparkles className="w-4 h-4" />
                  {lang === "ar" ? "أنشئ موقعي الآن ✨" : "Generate My Website ✨"}
                </Button>
                <Button variant="outline" onClick={() => setInstantDialogOpen(false)} data-testid="button-cancel-instant">
                  {t("cancel", lang)}
                </Button>
              </div>
            </div>
          ) : (
            /* ───── GENERATING STATE ───── */
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-violet-600 dark:text-violet-400">
                    {(INSTANT_STEPS[lang as "ar" | "en"] || INSTANT_STEPS.ar)[instantStep]}
                  </span>
                  <span className="text-muted-foreground font-mono">{Math.round(instantProgress)}%</span>
                </div>
                <Progress value={instantProgress} className="h-2" />
              </div>

              <div className="space-y-2">
                {(INSTANT_STEPS[lang as "ar" | "en"] || INSTANT_STEPS.ar).map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: lang === "ar" ? 10 : -10 }}
                    animate={{ opacity: i <= instantStep ? 1 : 0.3 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center gap-2 text-sm ${i <= instantStep ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      i < instantStep ? "bg-emerald-500" : i === instantStep ? "bg-violet-500" : "bg-muted"
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
