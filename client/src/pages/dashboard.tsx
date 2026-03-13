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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  LayoutTemplate,
  MoreHorizontal,
  Globe2,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  ImageIcon,
  X,
  Phone,
  Mail,
  MapPin,
  AtSign,
  Building2,
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
    "جاري تحليل بيانات موقعك...",
    "اخترنا تصميماً مناسباً لنشاطك...",
    "نكتب محتوى الصفحة الرئيسية...",
    "نبني قسم الخدمات والمميزات...",
    "نصيغ معلومات الاتصال...",
    "نضبط الألوان والخطوط...",
    "نراجع الكود النهائي...",
    "الموقع جاهز! 🎉",
  ],
  en: [
    "Analyzing your website data...",
    "Picking the perfect design for you...",
    "Writing the hero section content...",
    "Building services & features section...",
    "Formatting contact information...",
    "Fine-tuning colors & typography...",
    "Reviewing the final code...",
    "Your website is ready! 🎉",
  ],
};

const ACTIVITY_TYPES_AR = [
  { value: "personal", label: "موقع شخصي" },
  { value: "romantic", label: "رومانسي / هدية" },
  { value: "restaurant", label: "مطعم وكافيه" },
  { value: "medical", label: "عيادة وصحة" },
  { value: "realestate", label: "عقارات" },
  { value: "tech", label: "تقنية ومتاجر إلكترونية" },
  { value: "design", label: "تصميم وإبداع" },
  { value: "beauty", label: "تجميل وعناية" },
  { value: "education", label: "تعليم وتدريب" },
  { value: "events", label: "فعاليات ومناسبات" },
  { value: "services", label: "خدمات وأعمال حرة" },
  { value: "legal", label: "محاماة واستشارات" },
  { value: "other", label: "أخرى" },
];

const ACTIVITY_TYPES_EN = [
  { value: "personal", label: "Personal Website" },
  { value: "romantic", label: "Romantic / Gift" },
  { value: "restaurant", label: "Restaurant & Cafe" },
  { value: "medical", label: "Medical & Healthcare" },
  { value: "realestate", label: "Real Estate" },
  { value: "tech", label: "Tech & E-commerce" },
  { value: "design", label: "Design & Creative" },
  { value: "beauty", label: "Beauty & Salon" },
  { value: "education", label: "Education & Training" },
  { value: "events", label: "Events & Occasions" },
  { value: "services", label: "Services & Business" },
  { value: "legal", label: "Legal & Consulting" },
  { value: "other", label: "Other" },
];

const ACTIVITY_TYPE_MAP_AR: Record<string, string> = {
  personal: "موقع شخصي",
  romantic: "موقع رومانسي / هدية",
  restaurant: "مطعم وكافيه",
  medical: "عيادة وطب",
  realestate: "عقارات",
  tech: "تقنية ومتاجر إلكترونية",
  design: "تصميم وإبداع",
  beauty: "تجميل وعناية",
  education: "تعليم وتدريب",
  events: "فعاليات ومناسبات",
  services: "خدمات وأعمال",
  legal: "محاماة واستشارات",
  other: "نشاط تجاري",
};

const ACTIVITY_TYPE_MAP_EN: Record<string, string> = {
  personal: "Personal Website",
  romantic: "Romantic / Gift Website",
  restaurant: "Restaurant & Cafe",
  medical: "Medical & Healthcare",
  realestate: "Real Estate",
  tech: "Tech & E-commerce",
  design: "Design & Creative",
  beauty: "Beauty & Salon",
  education: "Education & Training",
  events: "Events & Occasions",
  services: "Services & Business",
  legal: "Legal & Consulting",
  other: "Business",
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

interface WizardForm {
  siteName: string;
  activityType: string;
  websiteLanguage: string;
  websiteExtraLangs: string[];
  phone: string;
  email: string;
  city: string;
  instagram: string;
  twitterX: string;
  tiktok: string;
  snapchat: string;
  youtube: string;
  linkedin: string;
  extraNotes: string;
  logoDataUrl: string;
  logoPreview: string;
}

const defaultWizardForm: WizardForm = {
  siteName: "",
  activityType: "",
  websiteLanguage: "ar",
  websiteExtraLangs: [],
  phone: "",
  email: "",
  city: "",
  instagram: "",
  twitterX: "",
  tiktok: "",
  snapchat: "",
  youtube: "",
  linkedin: "",
  extraNotes: "",
  logoDataUrl: "",
  logoPreview: "",
};

function buildStructuredPrompt(form: WizardForm, isArabic: boolean): string {
  const lines: string[] = [];
  const typeMapAr = ACTIVITY_TYPE_MAP_AR;
  const typeMapEn = ACTIVITY_TYPE_MAP_EN;
  const actType = form.activityType
    ? (isArabic ? typeMapAr[form.activityType] : typeMapEn[form.activityType]) || form.activityType
    : "";

  // Website language directive
  const langObj = WEBSITE_LANGUAGES.find((l) => l.code === form.websiteLanguage);
  if (langObj && form.websiteLanguage !== "ar") {
    lines.push(isArabic
      ? `لغة الموقع المطلوبة: ${langObj.native} (${langObj.flag}) — يجب أن يكون جميع محتوى الموقع باللغة ${langObj.native} فقط`
      : `Website language: ${langObj.native} (${langObj.flag}) — all website content must be in ${langObj.native} only`
    );
  }

  if (actType) lines.push(isArabic ? `نوع النشاط: ${actType}` : `Activity type: ${actType}`);
  if (form.siteName) lines.push(isArabic ? `الاسم: ${form.siteName}` : `Name: ${form.siteName}`);
  if (form.city) lines.push(isArabic ? `المدينة: ${form.city}` : `City: ${form.city}`);
  if (form.phone) lines.push(isArabic ? `الهاتف/واتساب: ${form.phone}` : `Phone/WhatsApp: ${form.phone}`);
  if (form.email) lines.push(isArabic ? `البريد الإلكتروني: ${form.email}` : `Email: ${form.email}`);

  const socials: string[] = [];
  if (form.instagram) socials.push(`Instagram: @${form.instagram.replace(/^@/, "")}`);
  if (form.twitterX) socials.push(`Twitter/X: @${form.twitterX.replace(/^@/, "")}`);
  if (form.tiktok) socials.push(`TikTok: @${form.tiktok.replace(/^@/, "")}`);
  if (form.snapchat) socials.push(`Snapchat: @${form.snapchat.replace(/^@/, "")}`);
  if (form.youtube) socials.push(`YouTube: ${form.youtube}`);
  if (form.linkedin) socials.push(`LinkedIn: ${form.linkedin}`);
  if (socials.length > 0) {
    lines.push(isArabic ? `\nحسابات التواصل الاجتماعي:\n${socials.join("\n")}` : `\nSocial media:\n${socials.join("\n")}`);
  }

  if (form.logoDataUrl) {
    lines.push(isArabic ? "الشعار: مُرفق (ضعه في مكان بارز في الموقع)" : "Logo: attached (place it prominently on the website)");
  }

  if (form.extraNotes) {
    lines.push(isArabic ? `\nتفاصيل إضافية: ${form.extraNotes}` : `\nAdditional details: ${form.extraNotes}`);
  }

  return lines.join("\n");
}

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
  const [wizardForm, setWizardForm] = useState<WizardForm>(defaultWizardForm);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [wizardTemplate, setWizardTemplate] = useState<Template | null>(null);
  const [instantProgress, setInstantProgress] = useState(0);
  const [instantStep, setInstantStep] = useState(0);
  const [isInstantGenerating, setIsInstantGenerating] = useState(false);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  function updateWizard(field: keyof WizardForm, value: string) {
    setWizardForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleLogoUpload(file: File) {
    try {
      const compressed = await compressImageForUpload(file);
      setWizardForm((prev) => ({ ...prev, logoDataUrl: compressed, logoPreview: compressed }));
    } catch {
      toast({ title: lang === "ar" ? "خطأ" : "Error", description: lang === "ar" ? "تعذّر رفع الشعار" : "Failed to upload logo", variant: "destructive" });
    }
  }

  const { data: rawProjects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  const projects = rawProjects.filter((p, idx, arr) => arr.findIndex(x => x.id === p.id) === idx);

  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["/api/templates?summary=true"],
    staleTime: 10 * 60 * 1000,
  });
  const dialogTemplates = templates.slice(0, 9);

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
    if (!wizardForm.siteName.trim()) return;

    const isAr = lang === "ar";
    const structuredDesc = buildStructuredPrompt(wizardForm, isAr);
    const projectName = wizardForm.siteName.trim().slice(0, 60);

    setIsInstantGenerating(true);
    startProgressAnimation();

    try {
      const createPayload: Record<string, unknown> = {
        name: projectName,
        description: structuredDesc,
      };
      if (wizardTemplate) createPayload.templateId = wizardTemplate.id;

      const createRes = await apiRequest("POST", "/api/projects", createPayload);
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

      if (!createRes.ok) throw new Error(createData.message || "Failed to create project");
      const project: Project = createData;

      const allLangs = [wizardForm.websiteLanguage, ...wizardForm.websiteExtraLangs].filter(Boolean);
      const genPayload: Record<string, unknown> = {
        description: structuredDesc,
        language: lang,
        websiteLanguage: wizardForm.websiteLanguage || "ar",
        websiteLanguages: allLangs.length > 0 ? allLangs : [wizardForm.websiteLanguage || "ar"],
      };
      if (wizardForm.logoDataUrl) genPayload.logoDataUrl = wizardForm.logoDataUrl;

      const genRes = await apiRequest("POST", `/api/projects/${project.id}/generate-instant`, genPayload);
      if (!genRes.ok) {
        const errData = await genRes.json();
        throw new Error(errData.message || "Generation failed");
      }

      stopProgressAnimation();

      await new Promise((r) => setTimeout(r, 700));
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });

      setIsInstantGenerating(false);
      setInstantDialogOpen(false);
      setWizardForm(defaultWizardForm);
      setWizardStep(1);
      setInstantProgress(0);
      setWizardTemplate(null);

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
                <Plus className="w-4 h-4" />
                {lang === "ar" ? "أنشئ موقعك الآن ✨" : "Create Your Website ✨"}
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

      {/* Instant Generate Dialog — Structured Wizard */}
      <Dialog open={instantDialogOpen} onOpenChange={(open) => {
        if (!isInstantGenerating) {
          setInstantDialogOpen(open);
          if (!open) { setInstantProgress(0); setInstantStep(0); setWizardStep(1); setWizardTemplate(null); }
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              {lang === "ar" ? "إنشاء موقع جديد" : "Create New Website"}
            </DialogTitle>
            <DialogDescription>
              {lang === "ar"
                ? "أجب على بعض الأسئلة وسيبني الذكاء الاصطناعي موقعك الاحترافي خلال ثوانٍ"
                : "Answer a few questions and AI will build your professional website in seconds"}
            </DialogDescription>
          </DialogHeader>

          {!isInstantGenerating ? (
            <div dir={lang === "ar" ? "rtl" : "ltr"} className="space-y-5 pt-1">

              {/* Step Indicator */}
              <div className="flex items-center gap-2">
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { if (s === 2 && !wizardForm.siteName.trim()) return; setWizardStep(s as 1 | 2); }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        wizardStep === s
                          ? "bg-violet-600 text-white shadow-md shadow-violet-500/30"
                          : s < wizardStep
                          ? "bg-emerald-500 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s < wizardStep ? <Check className="w-3.5 h-3.5" /> : s}
                    </button>
                    <span className={`text-xs font-medium ${wizardStep === s ? "text-foreground" : "text-muted-foreground"}`}>
                      {s === 1
                        ? (lang === "ar" ? "المعلومات الأساسية" : "Basic Info")
                        : (lang === "ar" ? "التواصل والشعار" : "Social & Logo")}
                    </span>
                    {s < 2 && <div className="flex-1 h-px bg-border w-8" />}
                  </div>
                ))}
              </div>

              {/* ───── STEP 1: Basic Info ───── */}
              {wizardStep === 1 && (
                <div className="space-y-4">

                  {/* Optional Template Picker */}
                  {dialogTemplates.length > 0 && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                        <LayoutTemplate className="w-3.5 h-3.5" />
                        {lang === "ar" ? "ابدأ من قالب (اختياري)" : "Start from a template (optional)"}
                      </Label>
                      <div className="grid grid-cols-5 gap-2">
                        <button
                          type="button"
                          onClick={() => setWizardTemplate(null)}
                          className={`aspect-video rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all text-[10px] font-medium ${
                            !wizardTemplate
                              ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400"
                              : "border-border hover:border-violet-300 text-muted-foreground"
                          }`}
                        >
                          <Sparkles className={`w-4 h-4 ${!wizardTemplate ? "text-violet-500" : "text-muted-foreground"}`} />
                          {lang === "ar" ? "ذكاء اصطناعي" : "AI Only"}
                        </button>
                        {dialogTemplates.slice(0, 3).map((tpl) => (
                          <button
                            type="button"
                            key={tpl.id}
                            onClick={() => setWizardTemplate(tpl)}
                            className={`aspect-video rounded-lg border-2 overflow-hidden relative transition-all ${
                              wizardTemplate?.id === tpl.id
                                ? "border-violet-500 shadow-md shadow-violet-500/20"
                                : "border-border hover:border-violet-300"
                            }`}
                          >
                            <img src={tpl.thumbnail || ""} alt={lang === "ar" && tpl.nameAr ? tpl.nameAr : tpl.name} className="w-full h-full object-cover" />
                            {wizardTemplate?.id === tpl.id && (
                              <div className="absolute inset-0 bg-violet-500/25 flex items-center justify-center">
                                <div className="bg-violet-500 rounded-full p-0.5">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => { setInstantDialogOpen(false); navigate("/templates"); }}
                          className="aspect-video rounded-lg border-2 border-dashed border-border hover:border-violet-400/60 flex flex-col items-center justify-center gap-1 transition-all text-[10px] text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {lang === "ar" ? "المزيد" : "More"}
                        </button>
                      </div>
                      {wizardTemplate && (
                        <p className="text-xs text-violet-600 dark:text-violet-400 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          {lang === "ar" ? `قالب مختار: ${wizardTemplate.nameAr || wizardTemplate.name}` : `Template: ${wizardTemplate.name}`}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Activity Type */}
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-sm font-medium">
                      <Building2 className="w-3.5 h-3.5 text-violet-500" />
                      {lang === "ar" ? "نوع النشاط" : "Activity Type"}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={wizardForm.activityType}
                      onValueChange={(v) => updateWizard("activityType", v)}
                    >
                      <SelectTrigger data-testid="select-activity-type" className="w-full">
                        <SelectValue placeholder={lang === "ar" ? "اختر نوع النشاط..." : "Select activity type..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {(lang === "ar" ? ACTIVITY_TYPES_AR : ACTIVITY_TYPES_EN).map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Website Language */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-1.5 text-sm font-medium">
                      <Globe2 className="w-3.5 h-3.5 text-violet-500" />
                      {lang === "ar" ? "لغات الموقع" : "Website Languages"}
                      <span className="text-red-500">*</span>
                    </Label>
                    {/* Primary Language */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">{lang === "ar" ? "اللغة الرئيسية" : "Primary Language"}</p>
                      <div className="flex flex-wrap gap-2" data-testid="group-website-language">
                        {WEBSITE_LANGUAGES.map((wl) => (
                          <button
                            key={wl.code}
                            type="button"
                            onClick={() => {
                              // Remove new primary from extra langs if it was there
                              const newExtra = wizardForm.websiteExtraLangs.filter(c => c !== wl.code);
                              setWizardForm(prev => ({ ...prev, websiteLanguage: wl.code, websiteExtraLangs: newExtra }));
                            }}
                            data-testid={`button-lang-${wl.code}`}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                              wizardForm.websiteLanguage === wl.code
                                ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/30"
                                : "border-border bg-background text-foreground hover:border-violet-400 hover:text-violet-600"
                            }`}
                          >
                            <span>{wl.flag}</span>
                            <span>{wl.native}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Additional Languages */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {lang === "ar"
                          ? `لغات إضافية (اختياري — حتى لغتين)`
                          : `Additional Languages (optional — up to 2)`}
                        {wizardForm.websiteExtraLangs.length > 0 && (
                          <span className="ml-1 rtl:mr-1 text-violet-500 font-medium">
                            {" "}· {lang === "ar" ? `${wizardForm.websiteExtraLangs.length} مختارة` : `${wizardForm.websiteExtraLangs.length} selected`}
                          </span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-2" data-testid="group-extra-languages">
                        {WEBSITE_LANGUAGES.filter(wl => wl.code !== wizardForm.websiteLanguage).map((wl) => {
                          const isSelected = wizardForm.websiteExtraLangs.includes(wl.code);
                          const isMaxed = wizardForm.websiteExtraLangs.length >= 2 && !isSelected;
                          return (
                            <button
                              key={wl.code}
                              type="button"
                              disabled={isMaxed}
                              onClick={() => {
                                if (isSelected) {
                                  setWizardForm(prev => ({ ...prev, websiteExtraLangs: prev.websiteExtraLangs.filter(c => c !== wl.code) }));
                                } else if (!isMaxed) {
                                  setWizardForm(prev => ({ ...prev, websiteExtraLangs: [...prev.websiteExtraLangs, wl.code] }));
                                }
                              }}
                              data-testid={`button-extra-lang-${wl.code}`}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all ${
                                isSelected
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/30"
                                  : isMaxed
                                    ? "border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                                    : "border-border bg-background text-foreground hover:border-emerald-400 hover:text-emerald-600"
                              }`}
                            >
                              <span>{wl.flag}</span>
                              <span>{wl.native}</span>
                              {isSelected && <span className="text-xs">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                      {wizardForm.websiteExtraLangs.length > 0 && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5">
                          {lang === "ar"
                            ? `✨ سيحتوي موقعك على زر تبديل اللغة بين ${[wizardForm.websiteLanguage, ...wizardForm.websiteExtraLangs].map(c => WEBSITE_LANGUAGES.find(l => l.code === c)?.native).filter(Boolean).join(" ← ")}`
                            : `✨ Your site will have a language switcher: ${[wizardForm.websiteLanguage, ...wizardForm.websiteExtraLangs].map(c => WEBSITE_LANGUAGES.find(l => l.code === c)?.native).filter(Boolean).join(" → ")}`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Site Name */}
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-sm font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                      {lang === "ar" ? "اسم الموقع / المشروع / الشخص" : "Website / Project / Person Name"}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={wizardForm.siteName}
                      onChange={(e) => updateWizard("siteName", e.target.value)}
                      placeholder={lang === "ar" ? "مثال: مطعم البيك — د. أحمد الغامدي — متجر سلة" : "e.g. Al Baik Restaurant — Ahmed's Studio — Salla Store"}
                      data-testid="input-site-name"
                      className="text-base"
                    />
                  </div>

                  {/* City & Phone in a row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-sm font-medium">
                        <MapPin className="w-3.5 h-3.5 text-violet-500" />
                        {lang === "ar" ? "المدينة" : "City"}
                      </Label>
                      <Input
                        value={wizardForm.city}
                        onChange={(e) => updateWizard("city", e.target.value)}
                        placeholder={lang === "ar" ? "الرياض، جدة..." : "Riyadh, Jeddah..."}
                        data-testid="input-city"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-sm font-medium">
                        <Phone className="w-3.5 h-3.5 text-violet-500" />
                        {lang === "ar" ? "رقم الهاتف / واتساب" : "Phone / WhatsApp"}
                      </Label>
                      <Input
                        value={wizardForm.phone}
                        onChange={(e) => updateWizard("phone", e.target.value)}
                        placeholder="+966 5X XXX XXXX"
                        data-testid="input-phone"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-sm font-medium">
                      <Mail className="w-3.5 h-3.5 text-violet-500" />
                      {lang === "ar" ? "البريد الإلكتروني" : "Email Address"}
                    </Label>
                    <Input
                      value={wizardForm.email}
                      onChange={(e) => updateWizard("email", e.target.value)}
                      placeholder="info@example.com"
                      data-testid="input-email"
                      dir="ltr"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      disabled={!wizardForm.siteName.trim()}
                      onClick={() => setWizardStep(2)}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90 gap-2"
                      data-testid="button-next-step"
                    >
                      {lang === "ar" ? "التالي" : "Next"}
                      {lang === "ar" ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}

              {/* ───── STEP 2: Socials + Logo + Notes ───── */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  {/* Social Media */}
                  <div>
                    <Label className="flex items-center gap-1.5 text-sm font-semibold mb-3">
                      <AtSign className="w-3.5 h-3.5 text-violet-500" />
                      {lang === "ar" ? "حسابات التواصل الاجتماعي" : "Social Media Accounts"}
                      <span className="text-xs font-normal text-muted-foreground ms-1">({lang === "ar" ? "اختياري" : "optional"})</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { field: "instagram" as const, label: "Instagram", placeholder: "@username", icon: "📸" },
                        { field: "twitterX" as const, label: "Twitter / X", placeholder: "@username", icon: "🐦" },
                        { field: "tiktok" as const, label: "TikTok", placeholder: "@username", icon: "🎵" },
                        { field: "snapchat" as const, label: "Snapchat", placeholder: "@username", icon: "👻" },
                        { field: "youtube" as const, label: "YouTube", placeholder: lang === "ar" ? "رابط القناة" : "Channel URL", icon: "▶️" },
                        { field: "linkedin" as const, label: "LinkedIn", placeholder: lang === "ar" ? "رابط الملف" : "Profile URL", icon: "💼" },
                      ].map(({ field, label, placeholder, icon }) => (
                        <div key={field} className="space-y-1">
                          <Label className="text-xs text-muted-foreground">{icon} {label}</Label>
                          <Input
                            value={wizardForm[field]}
                            onChange={(e) => updateWizard(field, e.target.value)}
                            placeholder={placeholder}
                            dir="ltr"
                            className="text-sm h-9"
                            data-testid={`input-social-${field}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-sm font-semibold">
                      <ImageIcon className="w-3.5 h-3.5 text-violet-500" />
                      {lang === "ar" ? "شعار الموقع (اختياري)" : "Website Logo (optional)"}
                    </Label>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      data-testid="input-logo-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoUpload(file);
                      }}
                    />
                    {wizardForm.logoPreview ? (
                      <div className="relative inline-block">
                        <img
                          src={wizardForm.logoPreview}
                          alt="logo preview"
                          className="h-20 w-auto max-w-[200px] object-contain rounded-lg border bg-white p-2"
                        />
                        <button
                          type="button"
                          onClick={() => setWizardForm((p) => ({ ...p, logoDataUrl: "", logoPreview: "" }))}
                          className="absolute -top-2 -end-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="w-full h-20 rounded-xl border-2 border-dashed border-violet-300 dark:border-violet-700 hover:border-violet-500 hover:bg-violet-500/5 transition-all flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-violet-600 group"
                        data-testid="button-upload-logo"
                      >
                        <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-xs">{lang === "ar" ? "انقر لرفع الشعار" : "Click to upload logo"}</span>
                      </button>
                    )}
                  </div>

                  {/* Extra Notes */}
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-sm font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                      {lang === "ar" ? "تفاصيل إضافية (اختياري)" : "Additional Details (optional)"}
                    </Label>
                    <Textarea
                      value={wizardForm.extraNotes}
                      onChange={(e) => updateWizard("extraNotes", e.target.value)}
                      placeholder={
                        lang === "ar"
                          ? "أي معلومات إضافية تريد إضافتها... خدماتك، رسالتك، شعارك..."
                          : "Any extra info... your services, mission, tagline..."
                      }
                      className="resize-none min-h-[80px] text-sm"
                      rows={3}
                      data-testid="input-extra-notes"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <Button
                      variant="outline"
                      onClick={() => setWizardStep(1)}
                      className="gap-2"
                      data-testid="button-prev-step"
                    >
                      {lang === "ar" ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                      {lang === "ar" ? "السابق" : "Back"}
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setInstantDialogOpen(false)} data-testid="button-cancel-instant">
                        {t("cancel", lang)}
                      </Button>
                      <Button
                        disabled={!wizardForm.siteName.trim()}
                        onClick={handleInstantGenerate}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90 gap-2"
                        data-testid="button-confirm-instant"
                      >
                        <Zap className="w-4 h-4" />
                        {lang === "ar" ? "أنشئ موقعي الآن" : "Generate My Website"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
