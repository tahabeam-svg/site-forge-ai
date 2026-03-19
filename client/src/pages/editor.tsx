import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Project, ChatMessage } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Download,
  User,
  X,
  ImagePlus,
  Crown,
  Lock,
  RefreshCw,
  AlertTriangle,
  Undo2,
} from "lucide-react";
import { ArabyLogoThinking } from "@/components/araby-logo";

type ViewportSize = "desktop" | "tablet" | "mobile";
type MobileView = "chat" | "preview";

const REGEN_KEYWORDS_AR = ["أعد توليد", "ابنِ من جديد", "أعد بناء", "ابن من جديد", "غير الموقع كليا", "من الصفر", "جدد الموقع", "أنشئ من جديد", "أعد إنشاء"];
const REGEN_KEYWORDS_EN = ["regenerate", "rebuild", "start over", "from scratch", "redo the site", "redo the website", "create new", "new website", "full redesign"];

function isBrokenHtml(html: string | null | undefined): boolean {
  if (!html) return false;
  return html.includes("[Industry Engine Context]") || html.includes("معلومات إضافية لمحرك الصناعة") || html.includes("[Industry Engine");
}

function isRegenCommand(cmd: string, lang: string): boolean {
  const lower = cmd.toLowerCase();
  const keywords = lang === "ar" ? REGEN_KEYWORDS_AR : REGEN_KEYWORDS_EN;
  return keywords.some(k => lower.includes(k.toLowerCase()));
}

export default function EditorPage() {
  const { language } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id || "0");
  const lang = language;

  const [editCommand, setEditCommand] = useState("");
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [mobileView, setMobileView] = useState<MobileView>("chat");
  const [generateDesc, setGenerateDesc] = useState("");
  const [chatImagePreview, setChatImagePreview] = useState<string | null>(null);
  const [chatImageFile, setChatImageFile] = useState<File | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const chatInputAreaRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatMsgsRef = useRef<HTMLDivElement>(null);
  const [msgAreaHeight, setMsgAreaHeight] = useState<number | null>(null);
  const [pendingUserMsg, setPendingUserMsg] = useState<string | null>(null);

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
  });

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/projects", projectId, "messages"],
    enabled: !!project?.generatedHtml,
  });

  // Push messages to bottom
  useEffect(() => {
    let raf1: number, raf2: number;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const container = chatScrollRef.current;
        const msgs = chatMsgsRef.current;
        if (!container || !msgs) return;
        msgs.style.paddingTop = "0px";
        const pad = Math.max(0, container.clientHeight - msgs.scrollHeight - 8);
        msgs.style.paddingTop = `${pad}px`;
        container.scrollTop = container.scrollHeight;
      });
    });
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  }, [messages, pendingUserMsg]);

  // Prevent body scroll on editor
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.style.overflow = "";
    };
  }, []);

  // JS-calculated heights
  useEffect(() => {
    const calc = () => {
      const inputH = chatInputAreaRef.current?.offsetHeight ?? 112;
      if (window.innerWidth >= 768) {
        const desktopHeaderH = 48;
        setMsgAreaHeight(window.innerHeight - desktopHeaderH - inputH);
      } else {
        const headerH = 44;
        setMsgAreaHeight(window.innerHeight - headerH - inputH);
      }
    };
    calc();
    window.addEventListener("resize", calc);
    window.addEventListener("orientationchange", calc);
    return () => {
      window.removeEventListener("resize", calc);
      window.removeEventListener("orientationchange", calc);
    };
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const inputH = chatInputAreaRef.current?.offsetHeight ?? 112;
      if (window.innerWidth >= 768) {
        setMsgAreaHeight(window.innerHeight - 48 - inputH);
      } else {
        setMsgAreaHeight(window.innerHeight - 44 - inputH);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [limitReached, chatImagePreview]);

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

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const desc = project?.description || project?.name;
      const projLang = (project as any)?.language || lang;
      const savedPalette = (project as any)?.colorPalette as { primary?: string; accent?: string } | null;
      const res = await apiRequest("POST", `/api/projects/${projectId}/generate-instant`, {
        description: desc,
        language: lang,
        websiteLanguage: projLang,
        websiteLanguages: [projLang],
        ...(savedPalette?.primary ? { primaryColor: savedPalette.primary } : {}),
        ...(savedPalette?.accent ? { accentColor: savedPalette.accent } : {}),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 409) {
          throw new Error(lang === "ar"
            ? (body.messageAr || "موقعك قيد التوليد حالياً، انتظر لحظة ثم أعد المحاولة.")
            : (body.messageEn || "Your website is being generated right now. Please wait a moment and try again."));
        }
        if (res.status === 402) {
          throw new Error(lang === "ar"
            ? (body.messageAr || "نفد رصيد الذكاء لديك. يرجى ترقية خطتك.")
            : (body.messageEn || "Your AI credits are depleted. Please upgrade your plan."));
        }
        throw new Error(body.messageAr || body.message || "Error");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "messages"] });
      toast({
        title: lang === "ar" ? "تم إعادة التوليد ✨" : "Regenerated! ✨",
        description: lang === "ar" ? "تم إنشاء موقعك بتصميم جديد كلياً" : "Your website has been fully regenerated with a fresh design",
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
    onMutate: (input) => {
      const cmd = typeof input === "object" && input !== null ? (input as any).cmd : (input || editCommand);
      if (cmd) setPendingUserMsg(cmd);
      setEditCommand("");
    },
    onSuccess: () => {
      setPendingUserMsg(null);
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
    },
    onError: (err: any) => {
      setPendingUserMsg(null);
      if (err.message === "limit_reached") {
        setLimitReached(true);
      } else {
        toast({ title: t("error", lang), description: err.message, variant: "destructive" });
      }
    },
  });

  // Cycle loading steps while editMutation or regenerateMutation is pending
  useEffect(() => {
    const isPending = editMutation.isPending || regenerateMutation.isPending;
    if (!isPending) { setLoadingStep(0); return; }
    const id = setInterval(() => setLoadingStep(s => (s + 1) % 3), 2800);
    return () => clearInterval(id);
  }, [editMutation.isPending, regenerateMutation.isPending]);

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

  function removeWhiteBackground(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, threshold = 230): boolean {
    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const d = imageData.data;
    const sampleIdxs = [0, (width - 1) * 4, (height - 1) * width * 4, ((height - 1) * width + width - 1) * 4, Math.floor(width / 2) * 4];
    let whiteCount = 0;
    for (const idx of sampleIdxs) {
      if (d[idx] > threshold && d[idx + 1] > threshold && d[idx + 2] > threshold && d[idx + 3] > 200) whiteCount++;
    }
    if (whiteCount < 3) return false;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      if (r > threshold && g > threshold && b > threshold) d[i + 3] = 0;
    }
    ctx.putImageData(imageData, 0, 0);
    return true;
  }

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const isLikelyLogo = file.type === "image/png" || file.type === "image/svg+xml" || Math.max(img.width, img.height) <= 800;
          const MAX = isLikelyLogo ? 400 : 600;
          const ratio = Math.min(1, MAX / Math.max(img.width, img.height));
          const w = Math.round(img.width * ratio);
          const h = Math.round(img.height * ratio);
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas not available"));
          ctx.drawImage(img, 0, 0, w, h);
          if (isLikelyLogo) {
            const removed = removeWhiteBackground(canvas, ctx);
            resolve(canvas.toDataURL(removed ? "image/png" : "image/jpeg", removed ? undefined : 0.8));
          } else {
            resolve(canvas.toDataURL("image/jpeg", 0.75));
          }
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

  // Handle paste events — supports pasting images directly from clipboard (e.g. screenshots)
  const handleChatPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        // Rename to something meaningful
        const namedFile = new File([file], `pasted-image-${Date.now()}.png`, { type: file.type });
        setChatImageFile(namedFile);
        const reader = new FileReader();
        reader.onload = () => setChatImagePreview(reader.result as string);
        reader.readAsDataURL(namedFile);
        toast({
          title: lang === "ar" ? "تم لصق الصورة" : "Image pasted",
          description: lang === "ar" ? "يمكنك الآن إضافة تعليمات للصورة أو إرسالها مباشرةً" : "Add instructions or send directly",
        });
        return;
      }
    }
    // Plain text paste — let default textarea behavior handle it
  };

  const handleSend = () => {
    const trimmed = editCommand.trim();
    if (chatImageFile) {
      chatUploadMutation.mutate(chatImageFile);
    } else if (trimmed) {
      if (isRegenCommand(trimmed, lang)) {
        setEditCommand("");
        regenerateMutation.mutate();
      } else {
        editMutation.mutate(trimmed);
      }
    }
  };

  const previewSrc = project?.generatedHtml
    ? `/api/projects/${projectId}/preview-html?v=${encodeURIComponent(String(project.updatedAt || Date.now()))}`
    : "";

  const viewportWidth = viewport === "desktop" ? "100%" : viewport === "tablet" ? "768px" : "375px";

  const isRegenerating = regenerateMutation.isPending;
  const brokenHtml = isBrokenHtml(project?.generatedHtml);

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
    <TooltipProvider delayDuration={400}>
    <div
      className="flex flex-col bg-background overflow-hidden"
      style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Inter', sans-serif", height: "100dvh" }}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <input ref={chatFileInputRef} type="file" className="hidden" accept="image/*,.svg" onChange={handleChatImageSelect} />

      {/* ═══ MOBILE HEADER ═══ */}
      <header className="md:hidden flex items-center gap-2 px-2 border-b bg-background shrink-0 h-11">
        <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => navigate("/dashboard")} data-testid="button-back">
          {lang === "ar" ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        </Button>
        <h1 className="flex-1 min-w-0 text-sm font-semibold truncate" data-testid="text-project-name">{project.name}</h1>
        {project.generatedHtml && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className={`shrink-0 h-8 w-8 ${mobileView === "preview" ? "text-emerald-600" : "text-muted-foreground"}`}
              onClick={() => setMobileView(mobileView === "chat" ? "preview" : "chat")}
              data-testid="button-mobile-toggle"
            >
              {mobileView === "chat" ? <Eye className="w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
            </Button>
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
                {publishMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Rocket className="w-3 h-3 me-1" />{lang === "ar" ? "نشر" : "Publish"}</>}
              </Button>
            )}
          </>
        )}
      </header>

      {/* ═══ DESKTOP HEADER ═══ */}
      <header className="hidden md:flex items-center justify-between gap-3 px-4 py-2 border-b bg-background shrink-0 h-12">
        <div className="flex items-center gap-3 min-w-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate("/dashboard")} data-testid="button-back-desktop">
                {lang === "ar" ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{lang === "ar" ? "العودة إلى مواقعي" : "Back to My Sites"}</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="h-6" />
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate" data-testid="text-project-name-desktop">{project.name}</h1>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-muted-foreground truncate">{project.description || ""}</p>
              {(project as any).designStyle && (project as any).designStyle !== "dark-modern" && (
                <Badge variant="outline" className="text-[9px] px-1 h-3.5 shrink-0 font-normal border-violet-300 text-violet-500 dark:border-violet-700 dark:text-violet-400" data-testid="badge-design-style">
                  {({luxury:"✨",corporate:"🏢",modern:"⚡",minimal:"◻️",creative:"🎨"} as Record<string,string>)[(project as any).designStyle] || "🎨"} {(project as any).designStyle}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Viewport switcher */}
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => regenerateMutation.mutate()}
                    disabled={isRegenerating || editMutation.isPending}
                    data-testid="button-regenerate"
                    className="gap-1.5 hover:border-violet-400 hover:text-violet-600"
                  >
                    {isRegenerating
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <RefreshCw className="w-3.5 h-3.5" />}
                    {lang === "ar" ? "إعادة توليد" : "Regenerate"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{lang === "ar" ? "أعد بناء الموقع بالكامل من الصفر" : "Rebuild the entire site from scratch"}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => window.open(`/preview/${project.id}`, "_blank")} data-testid="button-preview" className="hover:border-emerald-400 hover:text-emerald-600">
                    <Eye className="w-4 h-4 me-1" />
                    {t("preview", lang)}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{lang === "ar" ? "معاينة في نافذة جديدة" : "Preview in full screen"}</TooltipContent>
              </Tooltip>
              {project.status === "published" && (project as any).publishedUrl && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = (project as any).publishedUrl;
                        const msg = lang === "ar"
                          ? `شاهد موقعي الجديد الذي صممته بالذكاء الاصطناعي: ${url}`
                          : `Check out my new AI-built website: ${url}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
                      }}
                      data-testid="button-whatsapp-share"
                      className="hover:border-green-400 hover:text-green-600"
                    >
                      <svg className="w-4 h-4 me-1" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      {lang === "ar" ? "واتساب" : "WhatsApp"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{lang === "ar" ? "مشاركة عبر واتساب" : "Share via WhatsApp"}</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => navigate("/download-center")} data-testid="button-download-center-desktop" className="hover:border-emerald-400 hover:text-emerald-600">
                    <Download className="w-4 h-4 me-1" />
                    {lang === "ar" ? "مركز التحميل" : "Download Center"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{lang === "ar" ? "اذهب إلى مركز التحميل لتحميل ملفات موقعك" : "Go to Download Center to get your website files"}</TooltipContent>
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

      {/* ═══ MAIN BODY ═══ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ──── LEFT: CHAT PANEL ──── */}
        <div className={`w-full md:w-[420px] lg:w-[460px] shrink-0 border-e bg-background flex flex-col overflow-hidden ${mobileView === "preview" ? "hidden md:flex" : "flex"}`}>

          {/* ── Not generated yet: show generate prompt ── */}
          {!project.generatedHtml ? (
            <div className="p-4 flex flex-col items-center justify-center h-full">
              <div className="w-full max-w-sm space-y-4">
                {generateMutation.isPending ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                    <h3 className="font-bold text-lg mb-2" data-testid="text-generate-title">
                      {lang === "ar" ? "الذكاء الاصطناعي يبني موقعك..." : "AI is building your site..."}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {lang === "ar" ? "قد يستغرق ذلك 30 ثانية تقريباً" : "This may take about 30 seconds"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-500/30">
                        <Sparkles className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="font-bold text-lg" data-testid="text-generate-title">
                        {lang === "ar" ? "جاهز لإنشاء موقعك" : "Ready to build your site"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {lang === "ar"
                          ? "الذكاء الاصطناعي سيبني موقعك من الوصف المدخل"
                          : "AI will build from your description"}
                      </p>
                    </div>
                    <Textarea
                      value={generateDesc}
                      onChange={(e) => setGenerateDesc(e.target.value)}
                      placeholder={project.description || project.name || t("descriptionPlaceholder", lang)}
                      className="resize-none"
                      rows={3}
                      data-testid="input-generate-description"
                    />
                    <Button
                      onClick={() => generateMutation.mutate()}
                      disabled={generateMutation.isPending}
                      className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 text-white gap-2 h-11"
                      data-testid="button-generate"
                    >
                      <Sparkles className="w-4 h-4" />
                      {lang === "ar" ? "أنشئ الموقع الآن ✨" : "Generate Website ✨"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* ── Chat messages area ── */}
              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto px-4 py-3 flex flex-col min-h-0"
                style={msgAreaHeight !== null ? { height: msgAreaHeight } : {}}
              >
                <div ref={chatMsgsRef} className="flex flex-col gap-4">

                  {/* Welcome message if no messages */}
                  {messages.length === 0 && !pendingUserMsg && (
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-950/40 flex items-center justify-center shrink-0 overflow-hidden">
                        <img src="/logo.png" alt="ArabyWeb AI" className="w-6 h-6 object-contain" />
                      </div>
                      <div className="text-[0.9rem] leading-relaxed rounded-xl px-4 py-3 bg-muted text-muted-foreground max-w-[88%]">
                        {lang === "ar"
                          ? <span>✅ تم إنشاء موقعك! يمكنك الآن طلب أي تعديل — جرّب مثلاً: <strong className="text-foreground">"غيّر اللون الرئيسي إلى الأزرق الداكن"</strong> أو <strong className="text-foreground">"أضف قسم الخدمات"</strong></span>
                          : <span>✅ Your site is ready! Ask me anything — try: <strong className="text-foreground">"Change the primary color to dark blue"</strong> or <strong className="text-foreground">"Add a services section"</strong></span>
                        }
                      </div>
                    </div>
                  )}

                  {/* Chat messages */}
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex gap-2" data-testid={`chat-message-${msg.id}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${
                        msg.role === "user"
                          ? "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300"
                          : "bg-green-50 dark:bg-green-950/40"
                      }`}>
                        {msg.role === "user"
                          ? <User className="w-4 h-4" />
                          : <img src="/logo.png" alt="ArabyWeb AI" className="w-6 h-6 object-contain" />
                        }
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

                  {/* Optimistic pending message */}
                  {pendingUserMsg && (
                    <div className="flex gap-2" data-testid="chat-message-pending">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="text-[0.9rem] leading-relaxed rounded-xl px-4 py-2.5 max-w-[88%] bg-emerald-50 dark:bg-emerald-950/30 text-foreground">
                        {pendingUserMsg}
                      </div>
                    </div>
                  )}

                  {/* AI thinking indicator */}
                  {(editMutation.isPending || isRegenerating) && (
                    <div className="flex gap-2 items-start">
                      <ArabyLogoThinking size={36} />
                      <div className="text-[0.9rem] bg-muted rounded-xl px-4 py-2.5 flex items-center gap-2 min-w-0">
                        <span className="truncate text-muted-foreground text-sm">
                          {isRegenerating
                            ? (lang === "ar" ? "جاري إنشاء تصميم جديد كلياً..." : "Building a brand new design...")
                            : (lang === "ar"
                                ? (["جاري تحليل طلبك...", "جاري تطبيق التعديلات...", "اللمسات الأخيرة..."][loadingStep])
                                : (["Analyzing your request...", "Applying changes...", "Final touches..."][loadingStep]))}
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* ── Chat Input Area ── */}
              <div ref={chatInputAreaRef} className="shrink-0 px-3 pb-3 pt-2 space-y-2 border-t border-border/50 bg-background">

                {/* Broken HTML warning */}
                {brokenHtml && !isRegenerating && (
                  <div className="rounded-xl border border-amber-400/60 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 flex items-center gap-2.5" data-testid="banner-broken-html">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-xs text-amber-700 dark:text-amber-400 flex-1">
                      {lang === "ar" ? "الموقع يحتاج إعادة توليد" : "This site needs regeneration"}
                    </span>
                    <button
                      onClick={() => regenerateMutation.mutate()}
                      className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline shrink-0"
                      data-testid="button-fix-broken"
                    >
                      {lang === "ar" ? "أصلح الآن ←" : "Fix now →"}
                    </button>
                  </div>
                )}

                {/* Regenerating banner */}
                {isRegenerating && (
                  <div className="rounded-xl border border-violet-400/50 bg-violet-50 dark:bg-violet-950/30 px-3 py-2 flex items-center gap-2.5">
                    <Loader2 className="w-4 h-4 text-violet-500 shrink-0 animate-spin" />
                    <span className="text-xs text-violet-700 dark:text-violet-400">
                      {lang === "ar" ? "جاري إعادة بناء الموقع من الصفر..." : "Rebuilding site from scratch..."}
                    </span>
                  </div>
                )}

                {/* Limit reached banner */}
                {limitReached && (
                  <div className="rounded-xl border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30 p-3 text-center space-y-2" data-testid="banner-limit-reached">
                    <div className="flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4 text-amber-500" />
                      <span className="font-bold text-sm text-amber-700 dark:text-amber-400">
                        {lang === "ar" ? "انتهت تعديلاتك المجانية" : "Free edits limit reached"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {lang === "ar"
                        ? "اشترك للحصول على تعديلات غير محدودة وإزالة شعار عربي ويب"
                        : "Upgrade for unlimited edits and remove the ArabyWeb badge"}
                    </p>
                    <Button
                      className="bg-gradient-to-r from-violet-600 to-purple-600 text-white gap-2 h-8 text-xs"
                      onClick={() => window.location.href = "/billing"}
                      data-testid="button-upgrade-from-limit"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      {lang === "ar" ? "اشترك الآن" : "Upgrade Now"}
                    </Button>
                  </div>
                )}

                {/* Image preview */}
                {chatImagePreview && (
                  <div className="relative inline-block">
                    <img src={chatImagePreview} alt="Preview" className="h-14 w-auto rounded-lg border object-cover" data-testid="img-chat-preview" />
                    <button
                      onClick={() => { setChatImagePreview(null); setChatImageFile(null); }}
                      className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center"
                      data-testid="button-remove-chat-image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Undo bar — show when history has entries */}
                {(() => {
                  const historyLen = ((project as any)?.htmlHistory as any[] | null)?.length ?? 0;
                  return historyLen > 0 ? (
                    <div className="flex items-center gap-2 mb-1.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2.5 text-xs gap-1.5 rounded-lg border-violet-200 dark:border-violet-800/40 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                            onClick={() => {
                              editMutation.mutate(lang === "ar" ? "تراجع" : "undo");
                            }}
                            disabled={editMutation.isPending || isRegenerating}
                            data-testid="button-undo-edit"
                          >
                            <Undo2 className="w-3 h-3" />
                            {lang === "ar" ? `تراجع (${historyLen})` : `Undo (${historyLen})`}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {lang === "ar" ? "الرجوع للتعديل السابق" : "Revert to previous edit"}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  ) : null;
                })()}

                {/* Input row */}
                <div className="flex gap-1.5 items-end">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-[52px] w-[44px] rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-md shadow-violet-500/30 border-0 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                        onClick={() => chatFileInputRef.current?.click()}
                        disabled={editMutation.isPending || chatUploadMutation.isPending || isRegenerating || limitReached}
                        data-testid="button-chat-attach"
                      >
                        {chatUploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">{lang === "ar" ? "ارفع صورة أو شعار" : "Upload image or logo"}</TooltipContent>
                  </Tooltip>

                  <Textarea
                    value={editCommand}
                    onChange={(e) => setEditCommand(e.target.value)}
                    onPaste={handleChatPaste}
                    placeholder={
                      limitReached
                        ? (lang === "ar" ? "🔒 يجب الاشتراك للمتابعة..." : "🔒 Upgrade to continue...")
                        : chatImageFile
                          ? (lang === "ar" ? "أضف تعليمات للصورة... (Ctrl+V للصق صورة أخرى)" : "Add instructions for the image... (Ctrl+V to paste another image)")
                          : lang === "ar"
                            ? t("editCommandPlaceholder", lang) + " — يمكنك لصق الصور مباشرةً"
                            : t("editCommandPlaceholder", lang) + " — paste images directly"
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (!limitReached) handleSend();
                      }
                    }}
                    rows={2}
                    disabled={limitReached || isRegenerating}
                    className="text-sm resize-none leading-relaxed disabled:opacity-60 disabled:cursor-not-allowed max-h-[90px] rounded-xl border-violet-200 dark:border-violet-800/40 focus-visible:ring-violet-400"
                    data-testid="input-edit-command"
                  />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        className="shrink-0 h-[52px] w-[44px] rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-500/30 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                        onClick={handleSend}
                        disabled={(!editCommand.trim() && !chatImageFile) || editMutation.isPending || chatUploadMutation.isPending || isRegenerating || limitReached}
                        data-testid="button-apply-edit"
                      >
                        {(editMutation.isPending || chatUploadMutation.isPending || isRegenerating) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">{lang === "ar" ? "إرسال (Enter)" : "Send (Enter)"}</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ──── RIGHT: PREVIEW PANE ──── */}
        <div className={`flex-1 flex flex-col overflow-hidden bg-[#1e1e2e] ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}>
          {/* Browser chrome bar */}
          <div className="shrink-0 flex items-center gap-2 px-3 py-2 bg-[#2a2a3d] border-b border-white/10">
            <div className="hidden md:flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1 flex items-center gap-2 bg-[#1e1e2e]/80 rounded-md px-3 py-1 border border-white/10 min-w-0">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
              <span className="text-xs text-white/50 font-mono truncate">
                {project.status === "published" && (project as any).publishedUrl
                  ? (project as any).publishedUrl
                  : lang === "ar" ? "معاينة مباشرة — موقعك" : "Live Preview — your site"}
              </span>
            </div>
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
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                  title="Website Preview"
                  data-testid="iframe-preview"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-10 h-10 text-violet-400 opacity-60" />
                  </div>
                  <p className="text-base font-medium text-white/50 mb-1">
                    {lang === "ar" ? "ابدأ بإنشاء موقعك" : "Start by generating your website"}
                  </p>
                  <p className="text-sm text-white/30">
                    {lang === "ar" ? "استخدم اللوحة الجانبية لوصف موقعك" : "Use the sidebar to describe your website"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      <FeedbackButton lang={lang} page="editor" />
    </div>
    </TooltipProvider>
  );
}
