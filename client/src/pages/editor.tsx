import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Project, ChatMessage } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  "اجعل التصميم أكثر فخامة",
  "غيّر الألوان إلى أسود وذهبي",
  "أضف تأثيرات حركية للأقسام",
  "اجعل الخلفية داكنة",
  "أضف معلومات التواصل",
  "حسّن الخطوط والتنسيق",
  "أضف أيقونات للخدمات",
  "اجعل التصميم متجاوباً أكثر",
];

const SUGGESTED_COMMANDS_EN = [
  "Make the design more luxurious",
  "Change colors to black and gold",
  "Add section animations",
  "Make the background dark",
  "Add contact information",
  "Improve typography and spacing",
  "Add service icons",
  "Make the design more responsive",
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
  });

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/projects", projectId, "messages"],
    enabled: !!project?.generatedHtml,
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const editMutation = useMutation({
    mutationFn: async (command?: string) => {
      const cmd = command || editCommand;
      const res = await apiRequest("POST", `/api/projects/${projectId}/edit`, {
        command: cmd,
        language: lang,
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

  const chatUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("files", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: (data: { urls: string[] }) => {
      const url = data.urls[0];
      const userCmd = editCommand.trim();
      let cmd: string;
      if (userCmd) {
        cmd = lang === "ar"
          ? `${userCmd} - استخدم هذه الصورة: ${url}`
          : `${userCmd} - Use this image: ${url}`;
      } else {
        cmd = lang === "ar"
          ? `أضف هذا الشعار/الصورة في الموقع: ${url}`
          : `Add this logo/image to the website: ${url}`;
      }
      setEditCommand("");
      setChatImagePreview(null);
      setChatImageFile(null);
      editMutation.mutate(cmd);
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
    if (chatImageFile) {
      chatUploadMutation.mutate(chatImageFile);
    } else if (editCommand.trim()) {
      editMutation.mutate(editCommand);
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

  const getPreviewHtml = () => {
    if (!project?.generatedHtml) return "";
    if (project.generatedHtml.trimStart().startsWith('<!DOCTYPE')) {
      return project.generatedHtml;
    }
    return `<!DOCTYPE html>
<html lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${project.seoTitle || project.name}</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Tajawal:wght@300;400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Noto+Sans+Arabic:wght@300;400;500;600;700;800&family=Amiri:wght@400;700&family=Readex+Pro:wght@300;400;500;600;700&family=El+Messiri:wght@400;500;600;700&family=Almarai:wght@300;400;700;800&family=Reem+Kufi:wght@400;500;600;700&family=Lateef:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&family=Montserrat:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800&family=Raleway:wght@300;400;500;600;700;800&family=Roboto:wght@300;400;500;700&family=Nunito:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=Josefin+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
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

  const sectionTypes = lang === "ar" ? SECTION_TYPES_AR : SECTION_TYPES_EN;
  const suggestedCmds = lang === "ar" ? SUGGESTED_COMMANDS_AR : SUGGESTED_COMMANDS_EN;

  return (
    <div className="h-screen flex flex-col bg-background" style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Inter', sans-serif" }}>
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

      <header className="flex items-center justify-between gap-2 px-3 md:px-4 py-2 border-b bg-background shrink-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate("/dashboard")} data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate" data-testid="text-project-name">{project.name}</h1>
            <p className="text-xs text-muted-foreground truncate hidden sm:block">{project.description || ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {project.generatedHtml && (
            <div className="flex md:hidden items-center gap-1 bg-muted rounded-md p-0.5">
              <Button
                variant={mobileView === "panel" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setMobileView("panel")}
                className="text-xs px-2 h-7"
                data-testid="button-mobile-panel"
              >
                <Wand2 className="w-3.5 h-3.5 me-1" />
                {lang === "ar" ? "تعديل" : "Edit"}
              </Button>
              <Button
                variant={mobileView === "preview" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setMobileView("preview")}
                className="text-xs px-2 h-7"
                data-testid="button-mobile-preview"
              >
                <Eye className="w-3.5 h-3.5 me-1" />
                {lang === "ar" ? "معاينة" : "Preview"}
              </Button>
            </div>
          )}
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
              <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => navigate(`/preview/${project.id}`)} data-testid="button-preview">
                <Eye className="w-4 h-4 me-1" />
                {t("preview", lang)}
              </Button>
              {project.status !== "published" && (
                <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700" onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending} data-testid="button-publish">
                  <Rocket className="w-4 h-4 me-1" />
                  <span className="hidden sm:inline">{t("publish", lang)}</span>
                </Button>
              )}
            </>
          )}
          {project.status === "published" && (
            <Badge className="bg-emerald-500" data-testid="badge-published">{t("published", lang)}</Badge>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className={`w-full md:w-[540px] shrink-0 border-e bg-background flex flex-col overflow-hidden ${mobileView === "preview" ? "hidden md:flex" : "flex"}`}>
          {!project.generatedHtml ? (
            <div className="p-4">
              <Card className="p-5">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold" data-testid="text-generate-title">
                    {t("generate", lang)}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {lang === "ar"
                      ? "صف موقعك وسنبنيه لك فوراً"
                      : "Describe your website and we'll build it instantly"}
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
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
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
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              <TabsList className="mx-3 mt-3 shrink-0 grid grid-cols-4">
                <TabsTrigger value="chat" className="text-xs gap-1" data-testid="tab-chat">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {lang === "ar" ? "محادثة" : "Chat"}
                </TabsTrigger>
                <TabsTrigger value="sections" className="text-xs gap-1" data-testid="tab-sections">
                  <Layout className="w-3.5 h-3.5" />
                  {lang === "ar" ? "أقسام" : "Sections"}
                </TabsTrigger>
                <TabsTrigger value="media" className="text-xs gap-1" data-testid="tab-media">
                  <Image className="w-3.5 h-3.5" />
                  {lang === "ar" ? "وسائط" : "Media"}
                </TabsTrigger>
                <TabsTrigger value="style" className="text-xs gap-1" data-testid="tab-style">
                  <Palette className="w-3.5 h-3.5" />
                  {lang === "ar" ? "تنسيق" : "Style"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden mt-0 px-4 pb-3">
                <ScrollArea className="flex-1 mt-3">
                  <div className="space-y-4 pe-2">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${msg.role === "user" ? "" : ""}`}
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
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>

                <div className="mt-2 space-y-2 shrink-0">
                  <div className="flex flex-wrap gap-1">
                    {suggestedCmds.slice(0, 4).map((cmd, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={() => setEditCommand(cmd)}
                        data-testid={`button-suggestion-${i}`}
                      >
                        <Sparkles className="w-3 h-3 me-1 text-emerald-500" />
                        <span className="truncate max-w-[120px]">{cmd}</span>
                      </Button>
                    ))}
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
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0 mb-0.5"
                      onClick={() => chatFileInputRef.current?.click()}
                      disabled={editMutation.isPending || chatUploadMutation.isPending || limitReached}
                      title={lang === "ar" ? "ارفع شعار أو صورة" : "Upload logo or image"}
                      data-testid="button-chat-attach"
                    >
                      {chatUploadMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ImagePlus className="w-4 h-4" />
                      )}
                    </Button>
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
                      rows={3}
                      disabled={limitReached}
                      className="text-sm resize-none leading-relaxed disabled:opacity-60 disabled:cursor-not-allowed"
                      data-testid="input-edit-command"
                    />
                    <Button
                      size="icon"
                      className="shrink-0 bg-gradient-to-r from-emerald-500 to-teal-600 mb-0.5"
                      onClick={handleSendWithImage}
                      disabled={(!editCommand && !chatImageFile) || editMutation.isPending || chatUploadMutation.isPending || limitReached}
                      data-testid="button-apply-edit"
                    >
                      {(editMutation.isPending || chatUploadMutation.isPending) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sections" className="flex-1 overflow-y-auto mt-0 px-3 pb-3">
                <div className="mt-2 space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">
                      {lang === "ar" ? "الأقسام الحالية" : "Current Sections"}
                    </h3>
                    {project.sections && Array.isArray(project.sections) ? (
                      <div className="space-y-1">
                        {(project.sections as string[]).map((s, i) => (
                          <div key={i} className="text-sm px-3 py-2 rounded-lg bg-muted flex items-center justify-between group" data-testid={`text-section-${i}`}>
                            <span>{s}</span>
                            <span className="text-xs text-muted-foreground">{i + 1}</span>
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
                    <h3 className="text-sm font-semibold mb-2">
                      {lang === "ar" ? "إضافة قسم جديد" : "Add New Section"}
                    </h3>
                    <div className="grid grid-cols-1 gap-1.5">
                      {sectionTypes.map((section, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs h-9"
                          onClick={() => editMutation.mutate(section.command)}
                          disabled={editMutation.isPending}
                          data-testid={`button-add-section-${i}`}
                        >
                          <Plus className="w-3.5 h-3.5 me-2 text-emerald-500" />
                          {section.name}
                        </Button>
                      ))}
                    </div>
                  </div>

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
                </div>
              </TabsContent>

              <TabsContent value="media" className="flex-1 overflow-y-auto mt-0 px-3 pb-3">
                <div className="mt-2 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {lang === "ar" ? "رفع ملفات" : "Upload Files"}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {lang === "ar"
                        ? "ارفع صور وشعارات لاستخدامها في موقعك"
                        : "Upload images and logos to use in your website"}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full h-24 border-dashed"
                      onClick={handleFileUpload}
                      disabled={uploadMutation.isPending}
                      data-testid="button-upload"
                    >
                      {uploadMutation.isPending ? (
                        <div className="text-center">
                          <Loader2 className="w-6 h-6 mx-auto mb-1 animate-spin" />
                          <span className="text-xs">{lang === "ar" ? "جاري الرفع..." : "Uploading..."}</span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {lang === "ar" ? "اضغط لرفع صور (JPG, PNG, SVG)" : "Click to upload images (JPG, PNG, SVG)"}
                          </span>
                        </div>
                      )}
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      {lang === "ar" ? "إضافة فيديو" : "Embed Video"}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {lang === "ar"
                        ? "ألصق رابط يوتيوب أو فيميو"
                        : "Paste a YouTube or Vimeo URL"}
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        placeholder={lang === "ar" ? "https://youtube.com/watch?v=..." : "https://youtube.com/watch?v=..."}
                        className="text-sm"
                        data-testid="input-media-url"
                      />
                      <Button
                        size="icon"
                        onClick={handleMediaEmbed}
                        disabled={!mediaUrl || editMutation.isPending}
                        data-testid="button-embed-media"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      {lang === "ar" ? "صور احترافية" : "Stock Images"}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {lang === "ar"
                        ? "اطلب من الذكاء الاصطناعي إضافة صور مناسبة"
                        : "Ask AI to add relevant stock images"}
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
                          className="text-xs h-8 px-2"
                          onClick={() => editMutation.mutate(cmd)}
                          disabled={editMutation.isPending}
                          data-testid={`button-stock-image-${i}`}
                        >
                          <Image className="w-3 h-3 me-1" />
                          <span className="truncate">{cmd}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="style" className="flex-1 overflow-y-auto mt-0 px-3 pb-3">
                <div className="mt-2 space-y-4">
                  {project.colorPalette && typeof project.colorPalette === "object" && (
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
              </TabsContent>
            </Tabs>
          )}
        </div>

        <div className={`flex-1 bg-muted/30 flex items-start justify-center p-4 overflow-auto ${mobileView === "panel" ? "hidden md:flex" : "flex"}`}>
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
