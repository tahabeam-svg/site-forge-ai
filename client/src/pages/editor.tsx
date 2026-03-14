import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Project, ChatMessage, Template } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import FeedbackButton from "@/components/FeedbackButton";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Loader2,
  Eye,
  Send,
  Rocket,
  Monitor,
  Tablet,
  Smartphone,
  Wand2,
  Upload,
  Image,
  Video,
  Plus,
  Palette,
  Type,
  Layout,
  MessageSquare,
  Bot,
  User,
  X,
  Paperclip,
  ImagePlus,
  Crown,
  Lock,
  ChevronDown,
  LayoutTemplate,
  Check,
  Filter,
  Download,
} from "lucide-react";

type ViewportSize = "desktop" | "tablet" | "mobile";
type MobileView = "panel" | "preview";

const SECTION_TYPES_AR = [
  { name: "قسم رئيسي (Hero)", command: "أضف قسم رئيسي جديد مع عنوان جذاب وزر دعوة" },
  { name: "من نحن", command: "أضف قسم من نحن مع وصف تفصيلي" },
  { name: "الخدمات", command: "أضف قسم خدمات مع 3-4 خدمات وأيقونات" },
  { name: "معرض صور", command: "أضف قسم معرض صور احترافي" },
  { name: "شهادات العملاء", command: "أضف قسم شهادات العملاء مع 3 آراء" },
  { name: "الأسئلة الشائعة", command: "أضف قسم الأسئلة الشائعة مع 5 أسئلة وأجوبة" },
  { name: "تواصل معنا", command: "أضف قسم تواصل معنا مع نموذج اتصال" },
  { name: "فريق العمل", command: "أضف قسم فريق العمل مع 3-4 أعضاء وصورهم" },
  { name: "الأسعار", command: "أضف قسم أسعار مع 3 خطط" },
];

const SECTION_TYPES_EN = [
  { name: "Hero Section", command: "Add a hero section with a bold headline and CTA button" },
  { name: "About Us", command: "Add an about us section with a detailed description" },
  { name: "Services", command: "Add a services section with 3-4 services and icons" },
  { name: "Photo Gallery", command: "Add a professional photo gallery section" },
  { name: "Testimonials", command: "Add a testimonials section with 3 reviews" },
  { name: "FAQ", command: "Add an FAQ section with 5 questions and answers" },
  { name: "Contact Us", command: "Add a contact section with a contact form" },
  { name: "Team", command: "Add a team section with 3-4 members and photos" },
  { name: "Pricing", command: "Add a pricing section with 3 plans" },
];

const SUGGESTED_COMMANDS_AR = [
  "أريد مشاهدة القوالب",
  "اجعل التصميم أكثر فخامة",
  "غيّر الألوان إلى أسود وذهبي",
  "أضف تأثيرات حركية للأقسام",
  "اجعل الخلفية داكنة",
  "أضف معلومات التواصل",
  "حسّن الخطوط والتنسيق",
  "أضف أيقونات للخدمات",
];

const SUGGESTED_COMMANDS_EN = [
  "Show me templates",
  "Make the design more luxurious",
  "Change colors to black and gold",
  "Add section animations",
  "Make the background dark",
  "Add contact information",
  "Improve typography and spacing",
  "Add service icons",
];

export default function EditorPage() {
  const { language } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id || "0");
  const lang = language;
  const [editCommand, setEditCommand] = useState("");
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [mobileView, setMobileView] = useState<MobileView>("panel");
  const [generateDesc, setGenerateDesc] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [mediaUrl, setMediaUrl] = useState("");
  const [chatImagePreview, setChatImagePreview] = useState<string | null>(null);
  const [chatImageFile, setChatImageFile] = useState<File | null>(null);
  const [customPrimary, setCustomPrimary] = useState("#10b981");
  const [customSecondary, setCustomSecondary] = useState("#0f172a");
  const [customAccent, setCustomAccent] = useState("#8b5cf6");
  const [limitReached, setLimitReached] = useState(false);
  const [showStyleScrollHint, setShowStyleScrollHint] = useState(false);
  const styleScrollRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const chatInputAreaRef = useRef<HTMLDivElement>(null);
  const [msgAreaHeight, setMsgAreaHeight] = useState<number | null>(null);
  const [showTemplateBrowser, setShowTemplateBrowser] = useState(false);
  const [templateCategory, setTemplateCategory] = useState("all");

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
  });

  const { data: allTemplates = [] } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
    staleTime: 10 * 60 * 1000,
  });

  const TEMPLATE_KEYWORDS_AR = /قالب|قوالب|تصميم جاهز|نموذج جاهز|شكل جديد|غير الشكل|تغيير القالب|ابدأ من|اختر قالب|تصفح القوالب|شاهد القوالب|أريد قالب|بغيت قالب/i;
  const TEMPLATE_KEYWORDS_EN = /template|templates|browse template|change template|pick template|see template|show template|choose template|start from template/i;

  function isTemplateRequest(text: string): boolean {
    return TEMPLATE_KEYWORDS_AR.test(text) || TEMPLATE_KEYWORDS_EN.test(text);
  }

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/projects", projectId, "messages"],
    enabled: !!project?.generatedHtml,
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Prevent page body from scrolling on the editor (mobile fix)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.style.overflow = "";
    };
  }, []);

  // JS-calculated messages area height — bypasses ALL CSS inheritance issues
  useEffect(() => {
    const calc = () => {
      if (window.innerWidth >= 768) { setMsgAreaHeight(null); return; }
      const headerH = 48;       // mobile header h-12
      const bottomNavH = 60;    // fixed bottom nav
      const inputH = chatInputAreaRef.current?.offsetHeight ?? 112;
      setMsgAreaHeight(window.innerHeight - headerH - bottomNavH - inputH);
    };
    calc();
    window.addEventListener("resize", calc);
    window.addEventListener("orientationchange", calc);
    return () => {
      window.removeEventListener("resize", calc);
      window.removeEventListener("orientationchange", calc);
    };
  }, []);

  // Recalculate when input area changes (tab switch, limit banner, image preview)
  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth >= 768) return;
    // Defer slightly so the DOM is updated before measuring
    const id = requestAnimationFrame(() => {
      const headerH = 48;
      const bottomNavH = 60;
      const inputH = chatInputAreaRef.current?.offsetHeight ?? 112;
      setMsgAreaHeight(window.innerHeight - headerH - bottomNavH - inputH);
    });
    return () => cancelAnimationFrame(id);
  }, [limitReached, chatImagePreview, activeTab]);

  // One-time scroll hint for the style tab
  useEffect(() => {
    if (activeTab === "style") {
      const seen = localStorage.getItem("aw_style_scroll_hint_seen");
      if (!seen) {
        setShowStyleScrollHint(true);
        const timer = setTimeout(() => {
          setShowStyleScrollHint(false);
          localStorage.setItem("aw_style_scroll_hint_seen", "1");
        }, 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [activeTab]);

  // Auto-trigger generation when project loads with description but no HTML yet
  const autoGeneratedRef = useRef(false);
  useEffect(() => {
    if (
      project &&
      !project.generatedHtml &&
      (project.description || project.name) &&
      !autoGeneratedRef.current &&
      !generateMutation.isPending
    ) {
      autoGeneratedRef.current = true;
      const desc = project.description || project.name;
      setGenerateDesc(desc || "");
      setTimeout(() => generateMutation.mutate(), 300);
    }
  }, [project?.id, project?.generatedHtml]);

  const dismissStyleHint = () => {
    setShowStyleScrollHint(false);
    localStorage.setItem("aw_style_scroll_hint_seen", "1");
  };

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
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "messages"] });
      toast({
        title: lang === "ar" ? "تم الإنشاء" : "Generated!",
        description: lang === "ar" ? "تم إنشاء موقعك بنجاح" : "Your website has been generated successfully",
      });
    },
    onError: (err: Error) => {
      toast({ title: t("error", lang), description: err.message, variant: "destructive" });
    },
  });

  const applyTemplateMutation = useMutation({
    mutationFn: async (template: Template) => {
      const res = await apiRequest("PUT", `/api/projects/${projectId}`, {
        generatedHtml: template.previewHtml,
        generatedCss: template.previewCss || "",
        status: "generated",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      setShowTemplateBrowser(false);
      toast({
        title: lang === "ar" ? "تم تطبيق القالب ✅" : "Template applied ✅",
        description: lang === "ar" ? "يمكنك تخصيصه الآن" : "You can customize it now",
      });
    },
    onError: (err: Error) => {
      toast({ title: t("error", lang), description: err.message, variant: "destructive" });
    },
  });

  const editMutation = useMutation({
    mutationFn: async (input?: string | { cmd: string; imageDataUrl?: string }) => {
      let command: string;
      let imageDataUrl: string | undefined;
      if (typeof input === "object" && input !== null) {
        command = input.cmd;
        imageDataUrl = input.imageDataUrl;
      } else {
        command = input || editCommand;
      }
      const res = await apiRequest("POST", `/api/projects/${projectId}/edit`, {
        command,
        language: lang,
        ...(imageDataUrl ? { imageDataUrl } : {}),
      });
      if (res.status === 402) {
        const data = await res.json();
        throw Object.assign(new Error("limit_reached"), { data });
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      setEditCommand("");
    },
    onError: (err: any) => {
      if (err.message === "limit_reached") {
        setLimitReached(true);
      } else {
        toast({ title: t("error", lang), description: err.message, variant: "destructive" });
      }
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

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: (data: { urls: string[] }) => {
      const urls = data.urls;
      if (urls.length > 0) {
        const cmd = lang === "ar"
          ? `أضف هذه الصورة في الموقع: ${urls[0]}`
          : `Add this image to the website: ${urls[0]}`;
        editMutation.mutate(cmd);
      }
      toast({
        title: lang === "ar" ? "تم الرفع" : "Uploaded!",
        description: lang === "ar" ? `تم رفع ${urls.length} ملف` : `${urls.length} file(s) uploaded`,
      });
    },
    onError: (err: Error) => {
      toast({ title: t("error", lang), description: err.message, variant: "destructive" });
    },
  });

  // Compress image to max 600px wide, JPEG quality 0.75 — reduces base64 size drastically
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const MAX = 600;
          const ratio = Math.min(1, MAX / Math.max(img.width, img.height));
          const w = Math.round(img.width * ratio);
          const h = Math.round(img.height * ratio);
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas not available"));
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.75));
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.readAsDataURL(file);
    });
  };

  const chatUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const dataUrl = await compressImage(file);
      return { dataUrl };
    },
    onSuccess: (data: { dataUrl: string }) => {
      const dataUrl = data.dataUrl;
      const userCmd = editCommand.trim();
      const cmd = userCmd
        ? (lang === "ar" ? `${userCmd} - أضف/استخدم الصورة المرفقة` : `${userCmd} - Add/use the attached image`)
        : (lang === "ar" ? "أضف هذا الشعار في الموقع في الموضع المناسب" : "Add this logo/image to the website in the appropriate place");

      setChatImagePreview(null);
      setChatImageFile(null);
      setEditCommand("");

      // Pass image as separate imageDataUrl field — not embedded in the command text
      editMutation.mutate({ cmd, imageDataUrl: dataUrl } as any);
    },
    onError: (err: Error) => {
      toast({ title: t("error", lang), description: err.message, variant: "destructive" });
    },
  });

  const handleChatImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setChatImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setChatImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    if (chatFileInputRef.current) chatFileInputRef.current.value = "";
  };

  const handleSendWithImage = () => {
    const trimmed = editCommand.trim();
    if (chatImageFile) {
      chatUploadMutation.mutate(chatImageFile);
    } else if (trimmed && isTemplateRequest(trimmed)) {
      setShowTemplateBrowser(true);
      setEditCommand("");
      setActiveTab("chat");
      requestAnimationFrame(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }));
    } else if (trimmed) {
      editMutation.mutate(trimmed);
      setEditCommand("");
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadMutation.mutate(e.target.files);
    }
  };

  const handleMediaEmbed = () => {
    if (!mediaUrl.trim()) return;
    let embedCmd = "";
    if (mediaUrl.includes("youtube.com") || mediaUrl.includes("youtu.be")) {
      embedCmd = lang === "ar"
        ? `أضف فيديو يوتيوب في الموقع: ${mediaUrl}`
        : `Embed this YouTube video in the website: ${mediaUrl}`;
    } else if (mediaUrl.includes("vimeo.com")) {
      embedCmd = lang === "ar"
        ? `أضف فيديو Vimeo في الموقع: ${mediaUrl}`
        : `Embed this Vimeo video in the website: ${mediaUrl}`;
    } else {
      embedCmd = lang === "ar"
        ? `أضف هذا المحتوى في الموقع: ${mediaUrl}`
        : `Embed this content in the website: ${mediaUrl}`;
    }
    editMutation.mutate(embedCmd);
    setMediaUrl("");
  };

  // Use server-side preview endpoint for reliable rendering on all devices
  const previewSrc = project?.generatedHtml
    ? `/api/projects/${projectId}/preview-html?v=${encodeURIComponent(String(project.updatedAt || Date.now()))}`
    : "";

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

  const sectionTypes = lang === "ar" ? SECTION_TYPES_AR : SECTION_TYPES_EN;
  const suggestedCmds = lang === "ar" ? SUGGESTED_COMMANDS_AR : SUGGESTED_COMMANDS_EN;

  return (
    <TooltipProvider delayDuration={400}>
    <div className="flex flex-col bg-background overflow-hidden" style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Inter', sans-serif", height: '100dvh' }}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,.svg"
        multiple
        onChange={handleFilesSelected}
      />
      <input
        ref={chatFileInputRef}
        type="file"
        className="hidden"
        accept="image/*,.svg"
        onChange={handleChatImageSelect}
      />

      {/* ─── Mobile Header ─── */}
      <header className="md:hidden flex items-center gap-2 px-2 border-b bg-background shrink-0 h-11">
        {/* Back */}
        <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => navigate("/dashboard")} data-testid="button-back">
          {lang === "ar" ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        </Button>

        {/* Project name — takes remaining space */}
        <h1 className="flex-1 min-w-0 text-sm font-semibold truncate" data-testid="text-project-name">{project.name}</h1>

        {project.generatedHtml && (
          <>
            {/* Preview / Edit toggle — icon only */}
            <Button
              variant="ghost"
              size="icon"
              className={`shrink-0 h-8 w-8 ${mobileView === "preview" ? "text-emerald-600" : "text-muted-foreground"}`}
              onClick={() => setMobileView(mobileView === "panel" ? "preview" : "panel")}
              data-testid="button-mobile-toggle"
            >
              {mobileView === "panel" ? <Eye className="w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
            </Button>

            {/* Publish / Live — compact */}
            {project.status === "published" ? (
              <Badge className="bg-emerald-500 text-[10px] px-1.5 h-5 shrink-0" data-testid="badge-published">
                <span className="w-1.5 h-1.5 rounded-full bg-white me-1 animate-pulse inline-block" />
                {lang === "ar" ? "مباشر" : "Live"}
              </Badge>
            ) : (
              <Button
                size="sm"
                className="shrink-0 h-7 text-xs px-2.5 bg-gradient-to-r from-emerald-500 to-teal-600"
                onClick={() => publishMutation.mutate()}
                disabled={publishMutation.isPending}
                data-testid="button-publish"
              >
                {publishMutation.isPending
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <><Rocket className="w-3 h-3 me-1" />{lang === "ar" ? "نشر" : "Publish"}</>
                }
              </Button>
            )}
          </>
        )}
      </header>

      {/* ─── Desktop Header ─── */}
      <header className="hidden md:flex items-center justify-between gap-3 px-4 py-2 border-b bg-background shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" onClick={() => navigate("/dashboard")} data-testid="button-back-desktop">
                {lang === "ar" ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{lang === "ar" ? "العودة إلى لوحة التحكم" : "Back to Dashboard"}</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="h-6" />
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate" data-testid="text-project-name-desktop">{project.name}</h1>
            <p className="text-xs text-muted-foreground truncate">{project.description || ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Viewport Switcher */}
          <div className="flex items-center gap-0.5 bg-muted rounded-lg p-1 border">
            {[
              { size: "desktop" as const, icon: Monitor, labelAr: "سطح المكتب", labelEn: "Desktop", color: "text-blue-600" },
              { size: "tablet" as const, icon: Tablet, labelAr: "جهاز لوحي", labelEn: "Tablet", color: "text-violet-600" },
              { size: "mobile" as const, icon: Smartphone, labelAr: "جوال", labelEn: "Mobile", color: "text-emerald-600" },
            ].map(({ size, icon: Icon, labelAr, labelEn, color }) => (
              <Tooltip key={size}>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewport === size ? "secondary" : "ghost"}
                    size="icon"
                    className={`h-7 w-7 transition-all ${viewport === size ? `${color} bg-white dark:bg-zinc-800 shadow-sm` : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setViewport(size)}
                    data-testid={`button-viewport-${size}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{lang === "ar" ? labelAr : labelEn}</TooltipContent>
              </Tooltip>
            ))}
          </div>
          {project.generatedHtml && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => window.open(`/preview/${project.id}`, "_blank")} data-testid="button-preview" className="hover:border-emerald-400 hover:text-emerald-600">
                    <Eye className="w-4 h-4 me-1" />
                    {t("preview", lang)}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{lang === "ar" ? "معاينة الموقع في نافذة جديدة" : "Preview site in full screen"}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/api/projects/${project.id}/export?type=static`, "_blank")}
                    data-testid="button-download-desktop"
                    className="hover:border-blue-400 hover:text-blue-600"
                  >
                    <Download className="w-4 h-4 me-1" />
                    {lang === "ar" ? "تحميل" : "Download"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{lang === "ar" ? "تحميل الموقع كملف HTML" : "Download site as HTML file"}</TooltipContent>
              </Tooltip>
              {project.status !== "published" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-sm shadow-emerald-500/20" onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending} data-testid="button-publish-desktop">
                      {publishMutation.isPending ? <Loader2 className="w-4 h-4 me-1 animate-spin" /> : <Rocket className="w-4 h-4 me-1" />}
                      {t("publish", lang)}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{lang === "ar" ? "نشر الموقع والحصول على رابط مباشر" : "Publish site and get a live URL"}</TooltipContent>
                </Tooltip>
              )}
            </>
          )}
          {project.status === "published" && (
            <Badge className="bg-emerald-500 shadow-sm shadow-emerald-500/30" data-testid="badge-published-desktop">
              <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse inline-block" />
              {t("published", lang)}
            </Badge>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className={`w-full md:w-[480px] lg:w-[520px] shrink-0 border-e bg-background flex flex-col overflow-hidden ${mobileView === "preview" ? "hidden md:flex" : "flex"}`}>
          {!project.generatedHtml ? (
            <div className="p-4 flex flex-col items-center justify-center h-full">
              <Card className="p-6 w-full max-w-sm">
                {generateMutation.isPending ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                    <h3 className="font-bold text-lg mb-1" data-testid="text-generate-title">
                      {lang === "ar" ? "الذكاء الاصطناعي يبني موقعك..." : "AI is building your site..."}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {lang === "ar" ? "جاري تصميم الموقع بناءً على وصفك" : "Designing based on your description"}
                    </p>
                    <div className="mt-4 p-3 rounded-lg bg-muted text-xs text-muted-foreground text-start leading-relaxed">
                      <span className="font-medium">{lang === "ar" ? "الوصف:" : "Description:"}</span>{" "}
                      {generateDesc || project.description || project.name}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold" data-testid="text-generate-title">
                        {lang === "ar" ? "أضف تفاصيل إضافية (اختياري)" : "Add more details (optional)"}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {lang === "ar"
                          ? "الذكاء الاصطناعي سيبني موقعك من الوصف الذي أدخلته — يمكنك إضافة تفاصيل أو الضغط مباشرة"
                          : "AI will build from your description — add details or just click Generate"}
                      </p>
                    </div>
                    <Textarea
                      value={generateDesc}
                      onChange={(e) => setGenerateDesc(e.target.value)}
                      placeholder={generateDesc || project.description || project.name || t("descriptionPlaceholder", lang)}
                      className="resize-none mb-3"
                      rows={3}
                      data-testid="input-generate-description"
                    />
                    <Button
                      onClick={() => generateMutation.mutate()}
                      disabled={generateMutation.isPending}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                      data-testid="button-generate"
                    >
                      <Sparkles className="w-4 h-4 me-2" />
                      {t("generate", lang)}
                    </Button>
                  </>
                )}
              </Card>
            </div>
          ) : (
            <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden min-h-0">
              <TabsList className="hidden md:grid mx-3 mt-3 shrink-0 grid-cols-4 h-auto p-1 gap-0.5 rounded-xl">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="chat" className="text-xs gap-1 py-2 rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-sm" data-testid="tab-chat">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {lang === "ar" ? "محادثة" : "Chat"}
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{lang === "ar" ? "تعديل موقعك بالذكاء الاصطناعي" : "Edit your site with AI chat"}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="sections" className="text-xs gap-1 py-2 rounded-lg data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:shadow-sm" data-testid="tab-sections">
                      <Layout className="w-3.5 h-3.5" />
                      {lang === "ar" ? "أقسام" : "Sections"}
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{lang === "ar" ? "إضافة وإدارة أقسام الموقع" : "Add and manage page sections"}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="media" className="text-xs gap-1 py-2 rounded-lg data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-sm" data-testid="tab-media">
                      <Image className="w-3.5 h-3.5" />
                      {lang === "ar" ? "وسائط" : "Media"}
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{lang === "ar" ? "رفع صور وشعارات وفيديو" : "Upload images, logos & video"}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="style" className="text-xs gap-1 py-2 rounded-lg data-[state=active]:bg-violet-500 data-[state=active]:text-white data-[state=active]:shadow-sm" data-testid="tab-style">
                      <Palette className="w-3.5 h-3.5" />
                      {lang === "ar" ? "تنسيق" : "Style"}
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{lang === "ar" ? "ألوان وخطوط وأنماط التصميم" : "Colors, fonts & design styles"}</TooltipContent>
                </Tooltip>
              </TabsList>

              {/* Chat messages only — input is OUTSIDE Tabs below */}
              <TabsContent
                value="chat"
                className="overflow-y-auto mt-0 px-4 py-3 md:flex-1"
                style={msgAreaHeight !== null ? { height: msgAreaHeight, flex: "none" } : undefined}
              >
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="flex gap-2"
                      data-testid={`chat-message-${msg.id}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === "user"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-violet-100 text-violet-700"
                      }`}>
                        {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`text-[0.9rem] leading-relaxed rounded-xl px-4 py-2.5 max-w-[88%] ${
                        msg.role === "user"
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {msg.role === "assistant"
                          ? msg.content.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|\n)/).map((part, pi) => {
                              if (part.startsWith("**") && part.endsWith("**")) {
                                return <strong key={pi} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
                              }
                              const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                              if (linkMatch) {
                                return <a key={pi} href={linkMatch[2]} className="text-violet-600 dark:text-violet-400 underline font-medium">{linkMatch[1]}</a>;
                              }
                              if (part === "\n") return <br key={pi} />;
                              return <span key={pi}>{part}</span>;
                            })
                          : (
                            <>
                              {msg.content.match(/data:image\/[^;]+;base64,/i) && (
                                <img
                                  src={msg.content.match(/(data:image\/[^\s"']+)/i)?.[1]}
                                  alt=""
                                  className="h-12 w-auto rounded mb-1.5 object-cover"
                                  data-testid={`img-chat-uploaded-${msg.id}`}
                                />
                              )}
                              {msg.content}
                            </>
                          )
                        }
                      </div>
                    </div>
                  ))}
                  {editMutation.isPending && (
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="text-[0.9rem] bg-muted rounded-xl px-4 py-2.5 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {lang === "ar" ? "جاري التعديل..." : "Applying changes..."}
                      </div>
                    </div>
                  )}

                  {/* ─── Inline Template Browser ─── */}
                  {showTemplateBrowser && (
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 mt-1">
                        <LayoutTemplate className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0 bg-muted rounded-xl px-3 py-3">
                        <div className="flex items-center justify-between mb-2.5">
                          <p className="text-sm font-semibold">
                            {lang === "ar" ? "اختر قالباً لتطبيقه" : "Choose a template to apply"}
                          </p>
                          <button
                            onClick={() => setShowTemplateBrowser(false)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {/* Category filter */}
                        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: "none" }}>
                          {["all", "corporate", "ecommerce", "restaurant", "portfolio", "medical", "startup"].map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setTemplateCategory(cat)}
                              className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                                templateCategory === cat
                                  ? "bg-emerald-500 text-white border-emerald-500"
                                  : "border-border text-muted-foreground hover:border-emerald-400"
                              }`}
                            >
                              {cat === "all" ? (lang === "ar" ? "الكل" : "All")
                                : cat === "corporate" ? (lang === "ar" ? "شركات" : "Corporate")
                                : cat === "ecommerce" ? (lang === "ar" ? "متجر" : "Store")
                                : cat === "restaurant" ? (lang === "ar" ? "مطعم" : "Restaurant")
                                : cat === "portfolio" ? (lang === "ar" ? "أعمال" : "Portfolio")
                                : cat === "medical" ? (lang === "ar" ? "طبي" : "Medical")
                                : (lang === "ar" ? "ناشئة" : "Startup")}
                            </button>
                          ))}
                        </div>
                        {/* Template grid */}
                        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                          {(templateCategory === "all"
                            ? allTemplates.slice(0, 20)
                            : allTemplates.filter((t) => t.category === templateCategory).slice(0, 20)
                          ).map((tpl) => (
                            <div key={tpl.id} className="group relative rounded-lg overflow-hidden border border-border hover:border-emerald-400 transition-all">
                              <img
                                src={tpl.thumbnail || ""}
                                alt={lang === "ar" && tpl.nameAr ? tpl.nameAr : tpl.name}
                                className="w-full aspect-video object-cover"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                                <p className="text-white text-[11px] font-semibold text-center leading-tight">
                                  {lang === "ar" && tpl.nameAr ? tpl.nameAr : tpl.name}
                                </p>
                                <Button
                                  size="sm"
                                  className="h-7 text-[11px] px-2.5 bg-emerald-500 hover:bg-emerald-600"
                                  onClick={() => applyTemplateMutation.mutate(tpl)}
                                  disabled={applyTemplateMutation.isPending}
                                  data-testid={`button-apply-template-${tpl.id}`}
                                >
                                  {applyTemplateMutation.isPending
                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                    : (lang === "ar" ? "طبّق" : "Apply")}
                                </Button>
                              </div>
                              {tpl.isPremium && (
                                <div className="absolute top-1 end-1">
                                  <Crown className="w-3 h-3 text-amber-400" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {/* Browse all link */}
                        <a
                          href="/templates"
                          onClick={(e) => { e.preventDefault(); navigate("/templates"); }}
                          className="block text-center text-xs text-emerald-600 dark:text-emerald-400 hover:underline mt-2.5"
                        >
                          {lang === "ar" ? `تصفح جميع القوالب (${allTemplates.length})` : `Browse all templates (${allTemplates.length})`}
                        </a>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              </TabsContent>

              <TabsContent value="sections" className="flex-1 overflow-y-auto mt-0 px-3 pb-[72px] md:pb-3 pt-3 md:pt-0">
                <div className="mt-2 space-y-3">
                  {/* Colored header banner */}
                  <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/40 px-3 py-2.5 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                      <Layout className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{lang === "ar" ? "إدارة الأقسام" : "Manage Sections"}</p>
                      <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70">{lang === "ar" ? "أضف أو عدّل أقسام موقعك" : "Add or modify your page sections"}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                      {lang === "ar" ? "الأقسام الحالية" : "Current Sections"}
                    </h3>
                    {project.sections && Array.isArray(project.sections) ? (
                      <div className="space-y-1">
                        {(project.sections as string[]).map((s, i) => (
                          <div key={i} className="text-sm px-3 py-2 rounded-lg bg-muted flex items-center justify-between group border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors" data-testid={`text-section-${i}`}>
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</div>
                              <span className="text-sm">{s}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {lang === "ar" ? "لا توجد أقسام" : "No sections detected"}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                      {lang === "ar" ? "إضافة قسم جديد" : "Add New Section"}
                    </h3>
                    <div className="grid grid-cols-1 gap-1.5">
                      {sectionTypes.map((section, i) => (
                        <Tooltip key={i}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="justify-start text-xs h-9 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all"
                              onClick={() => editMutation.mutate(section.command)}
                              disabled={editMutation.isPending}
                              data-testid={`button-add-section-${i}`}
                            >
                              <Plus className="w-3.5 h-3.5 me-2 text-emerald-500 shrink-0" />
                              {section.name}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-[200px] text-xs">{lang === "ar" ? "اضغط لإضافة هذا القسم تلقائياً" : "Click to add this section with AI"}</TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20 hover:text-violet-700"
                        onClick={() => generateMutation.mutate()}
                        disabled={generateMutation.isPending}
                        data-testid="button-regenerate"
                      >
                        {generateMutation.isPending ? (
                          <Loader2 className="w-4 h-4 me-2 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 me-2 text-violet-500" />
                        )}
                        {lang === "ar" ? "إعادة الإنشاء بالذكاء الاصطناعي" : "Regenerate with AI"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">{lang === "ar" ? "إعادة إنشاء الموقع بالكامل بالذكاء الاصطناعي" : "Rebuild entire website from scratch with AI"}</TooltipContent>
                  </Tooltip>
                </div>
              </TabsContent>

              <TabsContent value="media" className="flex-1 overflow-y-auto mt-0 px-3 pb-[72px] md:pb-3 pt-3 md:pt-0">
                <div className="mt-2 space-y-4">
                  {/* Colored header banner */}
                  <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/40 px-3 py-2.5 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
                      <Image className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">{lang === "ar" ? "الصور والوسائط" : "Images & Media"}</p>
                      <p className="text-[10px] text-amber-600/70 dark:text-amber-500/70">{lang === "ar" ? "ارفع شعارك وصورك الخاصة" : "Upload your logo and custom images"}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <Upload className="w-3 h-3" />
                      {lang === "ar" ? "رفع ملفات" : "Upload Files"}
                    </h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-24 border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/10 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:border-amber-400 transition-all group"
                          onClick={handleFileUpload}
                          disabled={uploadMutation.isPending}
                          data-testid="button-upload"
                        >
                          {uploadMutation.isPending ? (
                            <div className="text-center">
                              <Loader2 className="w-7 h-7 mx-auto mb-1.5 animate-spin text-amber-500" />
                              <span className="text-xs text-amber-600">{lang === "ar" ? "جاري الرفع..." : "Uploading..."}</span>
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                <Upload className="w-5 h-5 text-amber-500" />
                              </div>
                              <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                                {lang === "ar" ? "اضغط لرفع صور وشعارات" : "Click to upload images & logos"}
                              </span>
                              <span className="block text-[10px] text-muted-foreground mt-0.5">JPG, PNG, SVG, WebP</span>
                            </div>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">{lang === "ar" ? "ارفع صورك وشعاراتك لإضافتها للموقع تلقائياً" : "Upload images and logos to automatically add to your site"}</TooltipContent>
                    </Tooltip>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <Video className="w-3 h-3" />
                      {lang === "ar" ? "تضمين فيديو" : "Embed Video"}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {lang === "ar" ? "ألصق رابط يوتيوب أو فيميو" : "Paste a YouTube or Vimeo URL"}
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="text-sm"
                        data-testid="input-media-url"
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            onClick={handleMediaEmbed}
                            disabled={!mediaUrl || editMutation.isPending}
                            className="bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shrink-0"
                            data-testid="button-embed-media"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">{lang === "ar" ? "إضافة الفيديو إلى الموقع" : "Embed video into site"}</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      {lang === "ar" ? "صور ذكية بالذكاء الاصطناعي" : "AI Smart Images"}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {lang === "ar" ? "اطلب من الذكاء الاصطناعي إضافة صور مناسبة" : "Ask AI to add relevant stock images"}
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(lang === "ar"
                        ? ["أضف صور فخمة مناسبة", "غيّر صورة الخلفية", "أضف صور للخدمات", "أضف شعار احترافي"]
                        : ["Add relevant luxury images", "Change the hero image", "Add service images", "Add a professional logo"]
                      ).map((cmd, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="text-xs h-9 px-2 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-700 transition-all"
                          onClick={() => editMutation.mutate(cmd)}
                          disabled={editMutation.isPending}
                          data-testid={`button-stock-image-${i}`}
                        >
                          <Image className="w-3 h-3 me-1 text-amber-500 shrink-0" />
                          <span className="truncate">{cmd}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="style" className="flex-1 flex flex-col overflow-hidden mt-0 pt-3 md:pt-0 relative pb-[72px] md:pb-0">
                <div
                  ref={styleScrollRef}
                  className="flex-1 overflow-y-auto px-3 pb-3"
                  onScroll={dismissStyleHint}
                >
                <div className="mt-2 space-y-4">
                  {/* Colored header banner */}
                  <div className="rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20 border border-rose-200 dark:border-rose-800/40 px-3 py-2.5 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-500 flex items-center justify-center shrink-0">
                      <Palette className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">{lang === "ar" ? "التصميم والتنسيق" : "Design & Style"}</p>
                      <p className="text-[10px] text-rose-600/70 dark:text-rose-500/70">{lang === "ar" ? "ألوان وخطوط وأنماط بصرية" : "Colors, fonts & visual themes"}</p>
                    </div>
                  </div>
                  {!!(project.colorPalette && typeof project.colorPalette === "object") && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        {lang === "ar" ? "لوحة الألوان" : "Color Palette"}
                      </h3>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(project.colorPalette as Record<string, string>).map(([name, color]) => (
                          <div key={name} className="flex flex-col items-center gap-1" data-testid={`color-${name}`}>
                            <div className="w-10 h-10 rounded-lg border shadow-sm" style={{ background: String(color) }} />
                            <span className="text-[10px] text-muted-foreground capitalize">{String(name)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      {lang === "ar" ? "منتقي الألوان المخصص" : "Custom Color Picker"}
                    </h3>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {[
                        { label: lang === "ar" ? "الرئيسي" : "Primary", value: customPrimary, set: setCustomPrimary, cmdAr: "غيّر اللون الرئيسي", cmdEn: "Change the primary color to" },
                        { label: lang === "ar" ? "الثانوي" : "Secondary", value: customSecondary, set: setCustomSecondary, cmdAr: "غيّر اللون الثانوي", cmdEn: "Change the secondary/background color to" },
                        { label: lang === "ar" ? "التمييز" : "Accent", value: customAccent, set: setCustomAccent, cmdAr: "غيّر لون التمييز", cmdEn: "Change the accent color to" },
                      ].map(({ label, value, set, cmdAr, cmdEn }) => (
                        <div key={label} className="flex flex-col items-center gap-1">
                          <label className="text-[11px] text-muted-foreground">{label}</label>
                          <div className="relative w-full h-9 rounded-lg overflow-hidden border border-border shadow-sm cursor-pointer">
                            <input
                              type="color"
                              value={value}
                              onChange={(e) => set(e.target.value)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              data-testid={`color-picker-${label}`}
                            />
                            <div className="w-full h-full rounded-lg" style={{ background: value }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">{value}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-[10px] h-6 px-1"
                            disabled={editMutation.isPending}
                            onClick={() => editMutation.mutate(lang === "ar" ? `${cmdAr} إلى ${value}` : `${cmdEn} ${value}`)}
                            data-testid={`button-apply-color-${label}`}
                          >
                            {lang === "ar" ? "تطبيق" : "Apply"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      {lang === "ar" ? "أنظمة ألوان جاهزة" : "Color Presets"}
                    </h3>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(lang === "ar"
                        ? [
                            { label: "أسود وذهبي", colors: ["#0f0f0f", "#e2b04a"] },
                            { label: "أزرق داكن وفضي", colors: ["#1e3a5f", "#c0c0c0"] },
                            { label: "أبيض وأخضر زمردي", colors: ["#ffffff", "#10b981"] },
                            { label: "بنفسجي وزهري", colors: ["#4c1d95", "#ec4899"] },
                            { label: "كحلي وذهبي", colors: ["#1e293b", "#f59e0b"] },
                            { label: "أخضر داكن وبيج", colors: ["#14532d", "#f5f0e8"] },
                          ]
                        : [
                            { label: "Black & Gold", colors: ["#0f0f0f", "#e2b04a"] },
                            { label: "Navy & Silver", colors: ["#1e3a5f", "#c0c0c0"] },
                            { label: "White & Emerald", colors: ["#ffffff", "#10b981"] },
                            { label: "Purple & Pink", colors: ["#4c1d95", "#ec4899"] },
                            { label: "Navy & Amber", colors: ["#1e293b", "#f59e0b"] },
                            { label: "Dark Green & Beige", colors: ["#14532d", "#f5f0e8"] },
                          ]
                      ).map((scheme, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="text-xs h-8 justify-start gap-2"
                          onClick={() => editMutation.mutate(
                            lang === "ar"
                              ? `غيّر الألوان: الرئيسي ${scheme.colors[0]} والتمييز ${scheme.colors[1]}`
                              : `Change colors: primary to ${scheme.colors[0]} and accent to ${scheme.colors[1]}`
                          )}
                          disabled={editMutation.isPending}
                          data-testid={`button-color-scheme-${i}`}
                        >
                          <div className="flex gap-0.5 shrink-0">
                            <div className="w-3 h-3 rounded-sm" style={{ background: scheme.colors[0] }} />
                            <div className="w-3 h-3 rounded-sm" style={{ background: scheme.colors[1] }} />
                          </div>
                          {scheme.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      {lang === "ar" ? "الخطوط العربية" : "Arabic Fonts"}
                    </h3>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(lang === "ar"
                        ? [
                            { name: "القاهرة — Cairo", cmd: "غيّر الخط إلى Cairo", family: "Cairo" },
                            { name: "تجول — Tajawal", cmd: "غيّر الخط إلى Tajawal", family: "Tajawal" },
                            { name: "IBM Plex Arabic", cmd: "غيّر الخط إلى IBM Plex Sans Arabic", family: "IBM Plex Sans Arabic" },
                            { name: "نوتو عربي", cmd: "غيّر الخط إلى Noto Sans Arabic", family: "Noto Sans Arabic" },
                            { name: "أميري — Amiri", cmd: "غيّر الخط إلى Amiri", family: "Amiri" },
                            { name: "ريدكس برو", cmd: "غيّر الخط إلى Readex Pro", family: "Readex Pro" },
                            { name: "المسيري", cmd: "غيّر الخط إلى El Messiri", family: "El Messiri" },
                            { name: "المراعي", cmd: "غيّر الخط إلى Almarai", family: "Almarai" },
                            { name: "ريم كوفي", cmd: "غيّر الخط إلى Reem Kufi", family: "Reem Kufi" },
                            { name: "لطيف — Lateef", cmd: "غيّر الخط إلى Lateef", family: "Lateef" },
                          ]
                        : [
                            { name: "Cairo (عربي)", cmd: "Change the font to Cairo", family: "Cairo" },
                            { name: "Tajawal (عربي)", cmd: "Change the font to Tajawal", family: "Tajawal" },
                            { name: "Readex Pro", cmd: "Change the font to Readex Pro", family: "Readex Pro" },
                            { name: "Almarai", cmd: "Change the font to Almarai", family: "Almarai" },
                            { name: "Amiri (Classic)", cmd: "Change the font to Amiri", family: "Amiri" },
                            { name: "El Messiri", cmd: "Change the font to El Messiri", family: "El Messiri" },
                          ]
                      ).map((font, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs h-8 overflow-hidden"
                          style={{ fontFamily: `'${font.family}', sans-serif` }}
                          onClick={() => editMutation.mutate(font.cmd)}
                          disabled={editMutation.isPending}
                          data-testid={`button-font-ar-${i}`}
                        >
                          {font.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      {lang === "ar" ? "الخطوط الإنجليزية" : "English Fonts"}
                    </h3>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { name: "Inter — Modern", cmd: lang === "ar" ? "غيّر الخط إلى Inter" : "Change the font to Inter", family: "Inter" },
                        { name: "Poppins — Rounded", cmd: lang === "ar" ? "غيّر الخط إلى Poppins" : "Change the font to Poppins", family: "Poppins" },
                        { name: "Montserrat — Bold", cmd: lang === "ar" ? "غيّر الخط إلى Montserrat" : "Change the font to Montserrat", family: "Montserrat" },
                        { name: "Playfair Display", cmd: lang === "ar" ? "غيّر الخط إلى Playfair Display" : "Change the font to Playfair Display", family: "Playfair Display" },
                        { name: "Raleway — Elegant", cmd: lang === "ar" ? "غيّر الخط إلى Raleway" : "Change the font to Raleway", family: "Raleway" },
                        { name: "Roboto — Clean", cmd: lang === "ar" ? "غيّر الخط إلى Roboto" : "Change the font to Roboto", family: "Roboto" },
                        { name: "Nunito — Friendly", cmd: lang === "ar" ? "غيّر الخط إلى Nunito" : "Change the font to Nunito", family: "Nunito" },
                        { name: "DM Sans — Pro", cmd: lang === "ar" ? "غيّر الخط إلى DM Sans" : "Change the font to DM Sans", family: "DM Sans" },
                        { name: "Josefin Sans", cmd: lang === "ar" ? "غيّر الخط إلى Josefin Sans" : "Change the font to Josefin Sans", family: "Josefin Sans" },
                      ].map((font, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs h-8 overflow-hidden"
                          style={{ fontFamily: `'${font.family}', sans-serif` }}
                          onClick={() => editMutation.mutate(font.cmd)}
                          disabled={editMutation.isPending}
                          data-testid={`button-font-en-${i}`}
                        >
                          {font.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-semibold mb-2">
                      {lang === "ar" ? "أنماط سريعة" : "Quick Styles"}
                    </h3>
                    <div className="grid grid-cols-1 gap-1.5">
                      {(lang === "ar"
                        ? [
                            "اجعل التصميم فخم وأنيق",
                            "اجعل التصميم عصري وبسيط",
                            "أضف تأثيرات ظل احترافية",
                            "أضف تأثيرات حركية متدرجة",
                            "اجعل الأزرار أكثر جاذبية",
                          ]
                        : [
                            "Make the design elegant and luxurious",
                            "Make the design modern and minimal",
                            "Add professional shadow effects",
                            "Add smooth entrance animations",
                            "Make buttons more attractive",
                          ]
                      ).map((cmd, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs h-8"
                          onClick={() => editMutation.mutate(cmd)}
                          disabled={editMutation.isPending}
                          data-testid={`button-quick-style-${i}`}
                        >
                          <Wand2 className="w-3 h-3 me-2 text-emerald-500" />
                          {cmd}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                </div>{/* end scrollRef div */}

                {/* One-time scroll hint overlay */}
                {showStyleScrollHint && (
                  <div
                    className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-4 pt-8 pointer-events-none"
                    style={{ background: "linear-gradient(to bottom, transparent, hsl(var(--background) / 0.97) 55%)" }}
                  >
                    <button
                      className="pointer-events-auto flex items-center gap-1.5 text-xs text-muted-foreground bg-background border border-border rounded-full px-3 py-1.5 shadow-md hover:text-foreground transition-colors"
                      onClick={dismissStyleHint}
                      data-testid="button-dismiss-scroll-hint"
                    >
                      <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
                      {lang === "ar" ? "مرّر للأسفل لخيارات أكثر" : "Scroll down for more options"}
                    </button>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* ─── Chat Input: OUTSIDE Tabs, always at bottom ─── */}
            {activeTab === "chat" && (
              <div ref={chatInputAreaRef} className="shrink-0 px-4 pb-[68px] md:pb-3 pt-2 space-y-2 border-t border-border/50 bg-background">
                {/* Suggestions row with label */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-medium shrink-0 hidden sm:block">
                    {lang === "ar" ? "اقتراحات:" : "Try:"}
                  </span>
                  <div className="flex gap-1.5 overflow-x-auto pb-0.5 flex-1" style={{ scrollbarWidth: "none" }}>
                    {suggestedCmds.slice(0, 6).map((cmd, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 px-2.5 shrink-0 whitespace-nowrap hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20 hover:text-violet-700 dark:hover:text-violet-400 transition-all"
                        onClick={() => {
                          if (isTemplateRequest(cmd)) {
                            setShowTemplateBrowser(true);
                            requestAnimationFrame(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }));
                          } else {
                            setEditCommand(cmd);
                          }
                        }}
                        data-testid={`button-suggestion-${i}`}
                      >
                        <Sparkles className="w-3 h-3 me-1 text-violet-500" />
                        {cmd}
                      </Button>
                    ))}
                  </div>
                </div>
                {limitReached && (
                  <div className="rounded-xl border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30 p-4 text-center space-y-2" data-testid="banner-limit-reached">
                    <div className="flex items-center justify-center gap-2">
                      <Lock className="w-5 h-5 text-amber-500" />
                      <span className="font-bold text-amber-700 dark:text-amber-400">
                        {lang === "ar" ? "انتهت تعديلاتك المجانية" : "Free edits limit reached"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {lang === "ar"
                        ? "لقد استخدمت جميع تعديلاتك المجانية. اشترك للحصول على تعديلات غير محدودة وإزالة شعار عربي ويب."
                        : "You've used all free edits. Upgrade for unlimited edits and remove the ArabyWeb badge."}
                    </p>
                    <Button
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white gap-2"
                      size="sm"
                      onClick={() => window.location.href = "/pricing"}
                      data-testid="button-upgrade-from-limit"
                    >
                      <Crown className="w-4 h-4" />
                      {lang === "ar" ? "اشترك الآن" : "Upgrade Now"}
                    </Button>
                  </div>
                )}
                {chatImagePreview && (
                  <div className="relative inline-block">
                    <img
                      src={chatImagePreview}
                      alt="Preview"
                      className="h-16 w-auto rounded-lg border object-cover"
                      data-testid="img-chat-preview"
                    />
                    <button
                      onClick={() => { setChatImagePreview(null); setChatImageFile(null); }}
                      className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center text-xs"
                      data-testid="button-remove-chat-image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div className="flex gap-1.5 items-end">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-[60px] w-[52px] rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-md shadow-violet-500/30 border-0 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                        onClick={() => chatFileInputRef.current?.click()}
                        disabled={editMutation.isPending || chatUploadMutation.isPending || limitReached}
                        data-testid="button-chat-attach"
                      >
                        {chatUploadMutation.isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <ImagePlus className="w-5 h-5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">{lang === "ar" ? "ارفع صورة أو شعار لإضافته للموقع" : "Upload an image or logo to add to your site"}</TooltipContent>
                  </Tooltip>
                  <Textarea
                    value={editCommand}
                    onChange={(e) => setEditCommand(e.target.value)}
                    placeholder={limitReached
                      ? (lang === "ar" ? "🔒 يجب الاشتراك للمتابعة..." : "🔒 Upgrade to continue...")
                      : chatImageFile
                        ? (lang === "ar" ? "أضف تعليمات للصورة (اختياري)..." : "Add instructions for the image (optional)...")
                        : t("editCommandPlaceholder", lang)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (!limitReached) handleSendWithImage();
                      }
                    }}
                    rows={2}
                    disabled={limitReached}
                    className="text-sm resize-none leading-relaxed disabled:opacity-60 disabled:cursor-not-allowed min-h-[40px] max-h-[100px] md:max-h-none rounded-xl border-violet-200 dark:border-violet-800/40 focus-visible:ring-violet-400"
                    data-testid="input-edit-command"
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        className="shrink-0 h-[60px] w-[52px] rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                        onClick={handleSendWithImage}
                        disabled={(!editCommand && !chatImageFile) || editMutation.isPending || chatUploadMutation.isPending || limitReached}
                        data-testid="button-apply-edit"
                      >
                        {(editMutation.isPending || chatUploadMutation.isPending) ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">{lang === "ar" ? "إرسال الأمر للذكاء الاصطناعي (Enter)" : "Send command to AI (Enter)"}</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}
            </>
          )}
        </div>

        {/* ─── Live Preview Pane ─── */}
        <div className={`flex-1 flex flex-col overflow-hidden bg-[#1e1e2e] ${mobileView === "panel" ? "hidden md:flex" : "flex"}`}>
          {/* Browser Chrome Bar */}
          <div className="shrink-0 flex items-center gap-2 px-3 py-2 bg-[#2a2a3d] border-b border-white/10">
            {/* Window dots */}
            <div className="hidden md:flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            {/* URL bar */}
            <div className="flex-1 flex items-center gap-2 bg-[#1e1e2e]/80 rounded-md px-3 py-1 border border-white/10 min-w-0">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
              <span className="text-xs text-white/50 font-mono truncate">
                {project.status === "published" && (project as any).publishedUrl
                  ? (project as any).publishedUrl
                  : lang === "ar" ? "معاينة مباشرة — موقعك" : "Live Preview — your site"}
              </span>
            </div>
            {/* Live badge + reload */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 h-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 inline-block animate-pulse" />
                {lang === "ar" ? "مباشر" : "Live"}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white/40 hover:text-white hover:bg-white/10"
                onClick={() => { if (iframeRef.current) iframeRef.current.src = iframeRef.current.src; }}
                title={lang === "ar" ? "تحديث" : "Reload"}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              </Button>
            </div>
          </div>

          {/* Preview area */}
          <div className="flex-1 flex items-start justify-center p-4 overflow-auto bg-[#1e1e2e]">
            {project.generatedHtml ? (
              <div
                className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 border border-white/10"
                style={{ width: viewportWidth, maxWidth: "100%", height: "calc(100vh - 10rem)" }}
              >
                <iframe
                  ref={iframeRef}
                  src={previewSrc}
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                  title="Website Preview"
                  data-testid="iframe-preview"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-10 h-10 text-emerald-400 opacity-60" />
                  </div>
                  <p className="text-base font-medium text-white/50 mb-1">
                    {lang === "ar" ? "ابدأ بإنشاء موقعك" : "Start by generating your website"}
                  </p>
                  <p className="text-sm text-white/30">
                    {lang === "ar" ? "استخدم اللوحة الجانبية لوصف موقعك" : "Use the sidebar panel to describe your website"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Mobile Bottom Navigation Bar ─── */}
      {project.generatedHtml && mobileView === "panel" && (
        <div className="md:hidden fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-md border-t z-50 flex h-[60px] shadow-lg" style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Inter', sans-serif" }}>
          {[
            { value: "chat", icon: MessageSquare, labelAr: "محادثة", labelEn: "Chat",
              activeColor: "text-violet-600 dark:text-violet-400", activeBg: "bg-violet-100 dark:bg-violet-950/50", activeDot: "bg-violet-500" },
            { value: "sections", icon: Layout, labelAr: "أقسام", labelEn: "Sections",
              activeColor: "text-emerald-600 dark:text-emerald-400", activeBg: "bg-emerald-100 dark:bg-emerald-950/50", activeDot: "bg-emerald-500" },
            { value: "media", icon: Image, labelAr: "وسائط", labelEn: "Media",
              activeColor: "text-amber-600 dark:text-amber-400", activeBg: "bg-amber-100 dark:bg-amber-950/50", activeDot: "bg-amber-500" },
            { value: "style", icon: Palette, labelAr: "تنسيق", labelEn: "Style",
              activeColor: "text-rose-600 dark:text-rose-400", activeBg: "bg-rose-100 dark:bg-rose-950/50", activeDot: "bg-rose-500" },
          ].map(({ value, icon: Icon, labelAr, labelEn, activeColor, activeBg, activeDot }) => {
            const isActive = activeTab === value;
            return (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all relative ${
                  isActive ? activeColor : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`tab-mobile-${value}`}
              >
                {/* Active top indicator line */}
                {isActive && (
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full ${activeDot}`} />
                )}
                <div className={`flex items-center justify-center w-10 h-7 rounded-xl transition-all ${
                  isActive ? `${activeBg} scale-110` : ""
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-semibold transition-all ${isActive ? "opacity-100" : "opacity-60"}`}>
                  {lang === "ar" ? labelAr : labelEn}
                </span>
              </button>
            );
          })}
        </div>
      )}
      <FeedbackButton lang={lang} page="editor" />
    </div>
    </TooltipProvider>
  );
}
