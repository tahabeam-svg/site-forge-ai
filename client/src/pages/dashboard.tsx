import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import FeedbackButton from "@/components/FeedbackButton";
import {
  Sparkles,
  Loader2,
  Globe2,
  Send,
  Eye,
  Pencil,
  Trash2,
  Download,
  Upload,
  MoreHorizontal,
  Image as ImageIcon,
  X,
  Phone,
  Languages,
  ChevronDown,
} from "lucide-react";

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
  { code: "ar", label: "عربي", flag: "🇸🇦" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
];

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
        canvas.width = width; canvas.height = height;
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

const statusLabel = (status: string, lang: string) => {
  const labels: Record<string, Record<string, string>> = {
    en: { draft: "Draft", generating: "Generating...", generated: "Ready", published: "Published", error: "Error" },
    ar: { draft: "مسودة", generating: "جاري الإنشاء...", generated: "جاهز", published: "منشور", error: "خطأ" },
  };
  return labels[lang]?.[status] || status;
};

export default function DashboardPage() {
  const { language } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const lang = language;
  const isAr = lang === "ar";

  const [mySitesOpen, setMySitesOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [description, setDescription] = useState("");
  const [websiteLanguage, setWebsiteLanguage] = useState("ar");
  const [whatsapp, setWhatsapp] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [showExtra, setShowExtra] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: rawProjects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  const projects = rawProjects.filter((p, i, a) => a.findIndex(x => x.id === p.id) === i);

  useEffect(() => {
    const handler = () => navigate("/download-center");
    window.addEventListener("openMySites", handler);
    return () => window.removeEventListener("openMySites", handler);
  }, []);

  useEffect(() => () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/projects/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setDeleteId(null);
      toast({ title: isAr ? "تم الحذف" : "Deleted" });
    },
  });

  async function handleLogoUpload(file: File) {
    try {
      const compressed = await compressImageForUpload(file);
      setLogoDataUrl(compressed);
      setLogoPreview(compressed);
    } catch {
      toast({ title: isAr ? "خطأ في رفع الشعار" : "Logo upload failed", variant: "destructive" });
    }
  }

  function startProgress() {
    setProgress(5); setStepIdx(0);
    let p = 5; let s = 0;
    const steps = INSTANT_STEPS[lang as "ar" | "en"] || INSTANT_STEPS.ar;
    progressInterval.current = setInterval(() => {
      p += Math.random() * 3 + 1.5;
      if (p >= 90) p = 89;
      setProgress(Math.min(p, 89));
      const ns = Math.floor((p / 100) * (steps.length - 1));
      if (ns !== s && ns < steps.length - 1) { s = ns; setStepIdx(s); }
    }, 400);
  }

  function stopProgress() {
    if (progressInterval.current) { clearInterval(progressInterval.current); progressInterval.current = null; }
    const steps = INSTANT_STEPS[lang as "ar" | "en"] || INSTANT_STEPS.ar;
    setProgress(100); setStepIdx(steps.length - 1);
  }

  async function handleGenerate() {
    const desc = description.trim();
    if (!desc || desc.length < 5) {
      textareaRef.current?.focus();
      return;
    }
    setIsGenerating(true);
    startProgress();

    try {
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
          const parsedName = isAr ? parsed.businessNameAr : parsed.businessNameEn;
          if (parsedName?.trim().length > 1) projectName = parsedName.trim().slice(0, 60);
        }
      } catch { /* fail silently */ }

      const createRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName, description: desc }),
        credentials: "include",
      });
      const createData = await createRes.json();

      if (createRes.status === 402) {
        stopProgress(); setIsGenerating(false);
        toast({
          title: isAr ? "تحتاج إلى ترقية الخطة" : "Upgrade Required",
          description: isAr ? (createData.messageAr || createData.message) : (createData.messageEn || createData.message),
          variant: "destructive",
        });
        navigate("/billing"); return;
      }
      if (!createRes.ok) throw new Error(createData.detail || createData.message || "Failed to create project");

      const project: Project = createData;

      const genPayload: Record<string, unknown> = {
        description: desc, language: lang,
        websiteLanguage, websiteLanguages: [websiteLanguage],
        activityType, designStyle,
      };
      if (logoDataUrl) genPayload.logoDataUrl = logoDataUrl;
      if (whatsapp) genPayload.whatsapp = whatsapp;

      const genRes = await fetch(`/api/projects/${project.id}/generate-instant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(genPayload),
        credentials: "include",
      });

      if (!genRes.ok) {
        const errData = await genRes.json().catch(() => ({}));
        if (genRes.status === 402) {
          stopProgress(); setIsGenerating(false);
          toast({
            title: isAr ? "نفد رصيد الذكاء" : "AI Credits Depleted",
            description: isAr ? (errData.messageAr || errData.message) : (errData.messageEn || errData.message),
            variant: "destructive",
          });
          navigate("/billing"); return;
        }
        throw new Error(errData.detail || errData.message || "Generation failed");
      }

      stopProgress();
      await new Promise(r => setTimeout(r, 700));
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });

      setIsGenerating(false);
      setDescription(""); setWhatsapp(""); setLogoDataUrl(""); setLogoPreview(""); setProgress(0);
      navigate(`/editor/${project.id}`);
      toast({ title: isAr ? "تم إنشاء الموقع ✨" : "Website Created ✨" });
    } catch (err: any) {
      stopProgress(); setIsGenerating(false);
      toast({ title: t("error", lang), description: err.message, variant: "destructive" });
    }
  }

  const instantSteps = INSTANT_STEPS[lang as "ar" | "en"] || INSTANT_STEPS.ar;

  return (
    <DashboardLayout>
      {/* ── MAIN: Centered Chat Interface ── */}
      <div className="relative flex flex-col items-center justify-center h-full min-h-[calc(100vh-57px)] px-4 py-10 overflow-hidden">

        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-emerald-500/5 blur-[100px]" />
          <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[300px] rounded-full bg-teal-500/5 blur-[80px]" />
        </div>

        {/* Generating overlay */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center max-w-sm px-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30">
                  <Sparkles className="w-7 h-7 text-white animate-pulse" />
                </div>
                <h3 className="text-lg font-bold mb-1">{isAr ? "جاري إنشاء موقعك" : "Building Your Website"}</h3>
                <p className="text-sm text-muted-foreground mb-5 min-h-[20px]">
                  {instantSteps[stepIdx]}
                </p>
                <Progress value={progress} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Hero Content ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-2xl"
        >
          {/* Logo + Headline */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
              <Globe2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2" data-testid="text-dashboard-title">
              {isAr ? "أنشئ موقعك بالذكاء الاصطناعي" : "Build Your Website with AI"}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {isAr
                ? "صف نشاطك التجاري في سطرين وسيبني الذكاء الاصطناعي موقعك كاملاً"
                : "Describe your business in two lines and AI will build your complete website"}
            </p>
          </div>

          {/* Chat Input Card */}
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            {/* Textarea */}
            <div className="p-4">
              <Textarea
                ref={textareaRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleGenerate();
                }}
                placeholder={isAr
                  ? "مثال: أنا أمتلك مطعم مشويات سعودي في الرياض، يقدم أفضل الكبسة والمندي بأسعار معقولة..."
                  : "e.g. I own a Saudi grills restaurant in Riyadh offering the best Kabsa and Mandi at affordable prices..."}
                className="min-h-[110px] resize-none border-0 shadow-none focus-visible:ring-0 text-sm bg-transparent p-0"
                data-testid="input-description"
                dir={isAr ? "rtl" : "ltr"}
                disabled={isGenerating}
              />
            </div>

            {/* Expandable extras */}
            <AnimatePresence>
              {showExtra && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t pt-3">
                    {/* Website Language */}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                        <Languages className="w-3 h-3" />
                        {isAr ? "لغة الموقع" : "Website Language"}
                      </Label>
                      <div className="flex flex-wrap gap-1.5">
                        {WEBSITE_LANGUAGES.map(wl => (
                          <button
                            key={wl.code}
                            onClick={() => setWebsiteLanguage(wl.code)}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${websiteLanguage === wl.code ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium" : "border-border hover:border-muted-foreground/50 text-muted-foreground"}`}
                            data-testid={`button-lang-${wl.code}`}
                          >
                            {wl.flag} {wl.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {isAr ? "واتساب (اختياري)" : "WhatsApp (optional)"}
                      </Label>
                      <Input
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="+966 5XX XXX XXXX"
                        className="h-8 text-xs"
                        dir="ltr"
                        data-testid="input-whatsapp"
                      />
                    </div>

                    {/* Logo upload */}
                    <div className="sm:col-span-2">
                      <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        {isAr ? "شعار النشاط (اختياري)" : "Business Logo (optional)"}
                      </Label>
                      {logoPreview ? (
                        <div className="flex items-center gap-2">
                          <img src={logoPreview} className="w-10 h-10 rounded-lg object-contain border bg-white" alt="logo" />
                          <Button
                            variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive"
                            onClick={() => { setLogoDataUrl(""); setLogoPreview(""); }}
                          >
                            <X className="w-3 h-3 me-1" />
                            {isAr ? "حذف" : "Remove"}
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => logoInputRef.current?.click()}
                          className="flex items-center gap-2 text-xs text-muted-foreground border border-dashed border-border rounded-xl px-4 py-2.5 hover:border-emerald-500 hover:text-emerald-600 transition-colors w-full"
                          data-testid="button-logo-upload"
                        >
                          <ImageIcon className="w-4 h-4" />
                          {isAr ? "اضغط لرفع الشعار" : "Click to upload logo"}
                        </button>
                      )}
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); e.target.value = ""; }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer bar */}
            <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-t bg-muted/30">
              <button
                onClick={() => setShowExtra(v => !v)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-toggle-extra"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showExtra ? "rotate-180" : ""}`} />
                {isAr ? "خيارات إضافية" : "More options"}
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground hidden sm:block">
                  {isAr ? "Ctrl+Enter للإرسال" : "Ctrl+Enter to send"}
                </span>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !description.trim() || description.trim().length < 5}
                  size="sm"
                  className="gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 shadow-sm shadow-emerald-500/30 px-5"
                  data-testid="button-generate"
                >
                  {isGenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  {isAr ? "أنشئ الموقع" : "Generate Site"}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick prompts */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {(isAr ? [
              "مطعم سعودي متخصص في الكبسة والمندي",
              "شركة نظافة احترافية في جدة",
              "عيادة أسنان في الرياض للعائلات",
              "متجر ملابس نسائية عصرية",
            ] : [
              "Saudi restaurant specializing in Kabsa",
              "Professional cleaning company",
              "Family dental clinic in Riyadh",
              "Modern women's clothing store",
            ]).map((prompt) => (
              <button
                key={prompt}
                onClick={() => { setDescription(prompt); textareaRef.current?.focus(); }}
                className="text-xs text-muted-foreground border border-border rounded-full px-3 py-1 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                data-testid="button-quick-prompt"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* My Sites hint */}
          {projects.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-center"
            >
              <button
                onClick={() => navigate("/download-center")}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-open-download-center-hint"
              >
                <Globe2 className="w-3.5 h-3.5" />
                {isAr
                  ? `لديك ${projects.length} موقع — اذهب إلى مركز التحميل`
                  : `You have ${projects.length} site${projects.length !== 1 ? "s" : ""} — go to Download Center`}
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── MY SITES SHEET ── */}
      <Sheet open={mySitesOpen} onOpenChange={setMySitesOpen}>
        <SheetContent
          side={isAr ? "left" : "right"}
          className="w-full sm:max-w-xl p-0 flex flex-col"
          data-testid="sheet-mysites"
        >
          <SheetHeader className="px-5 py-4 border-b shrink-0">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Globe2 className="w-4 h-4 text-emerald-500" />
              {isAr ? "مواقعي" : "My Sites"}
              {projects.length > 0 && (
                <Badge variant="secondary" className="text-xs h-5 px-1.5">{projects.length}</Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4">
            {projectsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-emerald-500/50" />
                </div>
                <p className="text-sm font-medium mb-1">{isAr ? "لا توجد مواقع بعد" : "No sites yet"}</p>
                <p className="text-xs text-muted-foreground">
                  {isAr ? "أنشئ موقعك الأول من الشاشة الرئيسية" : "Create your first site from the main screen"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: isAr ? -12 : 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-xl border bg-card overflow-hidden group"
                    data-testid={`card-project-${project.id}`}
                  >
                    {/* Thumbnail */}
                    <div
                      className="relative h-36 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 overflow-hidden cursor-pointer"
                      onClick={() => { setMySitesOpen(false); navigate(`/editor/${project.id}`); }}
                    >
                      {project.generatedHtml ? (
                        <div className="absolute inset-0 overflow-hidden pointer-events-none transition-transform duration-500 group-hover:scale-105">
                          <iframe
                            srcDoc={`<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,sans-serif;transform:scale(0.4);transform-origin:top left;width:250%;height:250%;overflow:hidden}${project.generatedCss || ""}</style></head><body>${(project.generatedHtml || "").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style id="aw-[^"]*">[\s\S]*?<\/style>/gi, "")}</body></html>`}
                            className="w-full h-full bg-white border-0"
                            sandbox="allow-same-origin"
                            title={project.name}
                          />
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <Sparkles className="w-6 h-6 text-emerald-400/40" />
                          <span className="text-xs text-muted-foreground/50">{isAr ? "لم يُنشأ بعد" : "Not generated yet"}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                          <Pencil className="w-3 h-3" />
                          {isAr ? "تعديل" : "Edit"}
                        </div>
                      </div>
                      <div className="absolute top-2 start-2">
                        <Badge
                          variant={project.status === "published" ? "default" : project.status === "generated" ? "secondary" : "outline"}
                          className="text-[10px] h-5 px-1.5 shadow-sm"
                        >
                          {project.status === "published" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-current me-1 animate-pulse inline-block" />
                          )}
                          {statusLabel(project.status, lang)}
                        </Badge>
                      </div>
                    </div>

                    {/* Card info */}
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-sm font-semibold truncate cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          onClick={() => { setMySitesOpen(false); navigate(`/editor/${project.id}`); }}
                          data-testid={`text-project-name-${project.id}`}
                        >
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{project.description}</p>
                        )}
                      </div>

                      {/* Quick actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => { setMySitesOpen(false); navigate(`/editor/${project.id}`); }}
                          data-testid={`button-edit-${project.id}`}
                          title={isAr ? "تعديل" : "Edit"}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        {project.generatedHtml && (
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => window.open(`/preview/${project.id}`, "_blank")}
                            data-testid={`button-preview-${project.id}`}
                            title={isAr ? "معاينة" : "Preview"}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"
                              data-testid={`button-menu-${project.id}`}
                            >
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isAr ? "start" : "end"} className="w-48">
                            {project.generatedHtml && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => { setMySitesOpen(false); navigate("/download-center"); }}
                                  data-testid={`menu-download-center-${project.id}`}
                                >
                                  <Download className="w-3.5 h-3.5 me-2 text-emerald-500" />
                                  {isAr ? "مركز التحميل" : "Download Center"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => { setMySitesOpen(false); navigate(`/deploy-guide/${project.id}`); }}
                                  data-testid={`menu-deploy-${project.id}`}
                                >
                                  <Upload className="w-3.5 h-3.5 me-2" />
                                  {isAr ? "انشر موقعك" : "Deploy Guide"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
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
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isAr ? "حذف المشروع؟" : "Delete Project?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isAr ? "سيتم حذف هذا المشروع نهائياً ولا يمكن التراجع عن هذا الإجراء." : "This project will be permanently deleted. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isAr ? "إلغاء" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {isAr ? "حذف" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FeedbackButton />
    </DashboardLayout>
  );
}
