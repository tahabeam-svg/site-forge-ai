import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight, Sparkles, Loader2, Send, Monitor, Tablet,
  Smartphone, Wand2, Upload, RefreshCw, ExternalLink,
  Bot, User, Check, X, ChevronRight, ImagePlus, Paperclip,
  Zap, Globe, MapPin, Phone, Palette, CheckSquare, Square,
} from "lucide-react";

type Step = "welcome" | "parsing" | "clarifying" | "confirming" | "creating" | "editing";
type Viewport = "desktop" | "tablet" | "mobile";
type MobileTab = "chat" | "preview";

interface ExtractedInfo {
  businessNameAr: string;
  businessNameEn: string;
  activityType: string;
  descriptionAr: string;
  descriptionEn: string;
  primaryColor: string;
  accentColor: string;
  location: string;
  phone: string;
  whatsapp: string;
  websiteLanguages: string[];
  designStyle: string;
  suggestions: string[];
  siteGoal?: string;
  requestedSections?: string[];
}

interface SmartQuestion {
  id: string;
  field: string;
  question: string;
  type: "choice" | "multi-choice";
  options: { label: string; value: string }[];
  allowCustom: boolean;
  customPlaceholder?: string;
  customFirst?: boolean;
  minSelect?: number;
  hint?: string;
}

interface ChatEntry {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "confirm-card" | "progress" | "error" | "image" | "quick-reply" | "multi-choice";
  data?: ExtractedInfo;
  question?: SmartQuestion;
  imageUrl?: string;
  timestamp?: Date;
  answered?: boolean;
}

const DESIGN_STYLES = [
  { id: "luxury",      labelAr: "فخم",      labelEn: "Luxury",      icon: "✨", desc: "ذهبي وداكن", color: "#c9a96e" },
  { id: "dark-modern", labelAr: "حديث",     labelEn: "Modern",      icon: "⚡", desc: "عصري وجريء", color: "#6366f1" },
  { id: "corporate",   labelAr: "مؤسسي",    labelEn: "Corporate",   icon: "🏢", desc: "احترافي ومنظم", color: "#0ea5e9" },
  { id: "minimal",     labelAr: "بسيط",     labelEn: "Minimal",     icon: "○",  desc: "نظيف ومرتب", color: "#10b981" },
];

const EXAMPLE_PROMPTS_AR = [
  "أريد موقع لمطعم سعودي اسمه مطعم الديوان في جدة، يقدم مأكولات شعبية",
  "موقع لعيادة أسنان اسمها عيادة الابتسامة في الرياض، برقم جوال 0555000000",
  "محل عطور فاخر اسمه ليالي العطور في الطائف، يبيع العود والبخور",
];

const EXAMPLE_PROMPTS_EN = [
  "A luxury perfume store called Layali Perfumes in Riyadh with WhatsApp contact",
  "Medical clinic named Smile Dental in Jeddah, modern and professional look",
  "Restaurant called Al-Diwan serving Saudi cuisine in Riyadh",
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const isLogo = file.type === "image/png" || file.type === "image/svg+xml" || Math.max(img.width, img.height) <= 800;
        const MAX = isLogo ? 400 : 600;
        const ratio = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not available"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL(isLogo ? "image/png" : "image/jpeg", 0.82));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function AIBuilderPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const lang = "ar";
  const isAr = lang === "ar";

  const [step, setStep] = useState<Step>("welcome");
  const [userInput, setUserInput] = useState("");
  const [editInput, setEditInput] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("dark-modern");
  const [chatEntries, setChatEntries] = useState<ChatEntry[]>([]);
  const [extractedInfo, setExtractedInfo] = useState<ExtractedInfo | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const [isBusy, setIsBusy] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<{ dataUrl: string; name: string } | null>(null);

  // Smart questions state
  const [pendingQuestions, setPendingQuestions] = useState<SmartQuestion[]>([]);
  const [collectedAnswers, setCollectedAnswers] = useState<Record<string, string | string[]>>({});
  const [multiSelectBuffer, setMultiSelectBuffer] = useState<string[]>([]);
  const [customInputValue, setCustomInputValue] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  const previewSrc = projectId
    ? `/api/projects/${projectId}/preview-html?v=${previewKey}`
    : "";

  const viewportWidth = viewport === "desktop" ? "100%" : viewport === "tablet" ? "768px" : "375px";

  useEffect(() => {
    if (step === "editing") {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [step]);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    });
  }, [chatEntries]);

  function addEntry(entry: Omit<ChatEntry, "id" | "timestamp">) {
    setChatEntries(prev => [...prev, { ...entry, id: uid(), timestamp: new Date() }]);
  }

  function markLastQuestionAnswered() {
    setChatEntries(prev =>
      prev.map((e, i) =>
        i === prev.length - 1 && (e.type === "quick-reply" || e.type === "multi-choice")
          ? { ...e, answered: true }
          : e
      )
    );
  }

  async function handleSendPrompt() {
    const prompt = userInput.trim();
    if (!prompt || isBusy) return;

    setIsBusy(true);
    setStep("parsing");
    addEntry({ role: "user", content: prompt });
    addEntry({ role: "assistant", content: "أقرأ وصفك وأحلله...", type: "progress" });
    setUserInput("");

    try {
      const res = await apiRequest("POST", "/api/ai-builder/parse-prompt", { prompt });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Failed");

      const info: ExtractedInfo = body.data;
      info.designStyle = selectedStyle || info.designStyle;
      setExtractedInfo(info);
      setChatEntries(prev => prev.filter(e => e.type !== "progress"));

      // Add confirmation that we understood the basics
      addEntry({
        role: "assistant",
        content: `فهمت! سأبني موقع **${info.businessNameAr}** (${ACTIVITY_LABELS[info.activityType] || info.activityType}).\n\nلأبني لك الموقع الأمثل، أحتاج بعض التفاصيل:`,
        type: "text",
      });

      // Fetch smart questions
      const qRes = await apiRequest("POST", "/api/ai-builder/smart-questions", { parsedInfo: info });
      const qBody = await qRes.json();
      if (!qRes.ok) throw new Error(qBody.message || "Failed to get questions");

      const questions: SmartQuestion[] = qBody.questions || [];

      if (questions.length === 0) {
        // No questions needed → show confirm card directly
        addEntry({ role: "assistant", content: "هذا ما سأبنيه لك:", type: "text" });
        addEntry({ role: "assistant", content: "", type: "confirm-card", data: info });
        setStep("confirming");
      } else {
        setPendingQuestions(questions);
        setCollectedAnswers({});
        setStep("clarifying");
        // Ask first question
        askNextQuestion(questions, 0);
      }
    } catch (err: any) {
      setChatEntries(prev => prev.filter(e => e.type !== "progress"));
      addEntry({ role: "assistant", content: "حدث خطأ أثناء تحليل الوصف. أعد المحاولة.", type: "error" });
      setStep("welcome");
    } finally {
      setIsBusy(false);
    }
  }

  function askNextQuestion(questions: SmartQuestion[], index: number) {
    if (index >= questions.length) return;
    const q = questions[index];
    addEntry({
      role: "assistant",
      content: q.question,
      type: q.type === "multi-choice" ? "multi-choice" : "quick-reply",
      question: q,
      answered: false,
    });
  }

  async function handleQuickReply(question: SmartQuestion, value: string, label: string) {
    if (value === "__custom__") {
      setShowCustomInput(true);
      setCustomInputValue("");
      setTimeout(() => customInputRef.current?.focus(), 100);
      return;
    }

    markLastQuestionAnswered();
    setShowCustomInput(false);

    // Add user reply bubble
    addEntry({ role: "user", content: label });

    const newAnswers = { ...collectedAnswers };
    if (value !== "__skip__") {
      newAnswers[question.field] = value;
    }
    setCollectedAnswers(newAnswers);

    // Move to next question
    const currentIndex = pendingQuestions.findIndex(q => q.id === question.id);
    const nextIndex = currentIndex + 1;

    if (nextIndex < pendingQuestions.length) {
      setTimeout(() => askNextQuestion(pendingQuestions, nextIndex), 400);
    } else {
      await finalizeClarification(newAnswers);
    }
  }

  async function handleCustomInputSubmit(question: SmartQuestion) {
    const val = customInputValue.trim();
    if (!val) return;

    setShowCustomInput(false);
    markLastQuestionAnswered();

    addEntry({ role: "user", content: val });

    const newAnswers = { ...collectedAnswers, [question.field]: val };
    setCollectedAnswers(newAnswers);

    const currentIndex = pendingQuestions.findIndex(q => q.id === question.id);
    const nextIndex = currentIndex + 1;

    if (nextIndex < pendingQuestions.length) {
      setTimeout(() => askNextQuestion(pendingQuestions, nextIndex), 400);
    } else {
      await finalizeClarification(newAnswers);
    }
  }

  function handleMultiSelectToggle(value: string) {
    setMultiSelectBuffer(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  }

  async function handleMultiSelectConfirm(question: SmartQuestion) {
    const selected = multiSelectBuffer.length > 0 ? multiSelectBuffer : ["services", "contact"];
    const labels = selected.map(v => question.options.find(o => o.value === v)?.label || v).join("، ");

    markLastQuestionAnswered();
    setMultiSelectBuffer([]);

    addEntry({ role: "user", content: `الأقسام المختارة: ${labels}` });

    const newAnswers = { ...collectedAnswers, [question.field]: selected };
    setCollectedAnswers(newAnswers);

    const currentIndex = pendingQuestions.findIndex(q => q.id === question.id);
    const nextIndex = currentIndex + 1;

    if (nextIndex < pendingQuestions.length) {
      setTimeout(() => askNextQuestion(pendingQuestions, nextIndex), 400);
    } else {
      await finalizeClarification(newAnswers);
    }
  }

  async function finalizeClarification(answers: Record<string, string | string[]>) {
    if (!extractedInfo) return;

    setIsBusy(true);
    addEntry({ role: "assistant", content: "ممتاز! أجمع كل المعلومات...", type: "progress" });

    try {
      const res = await apiRequest("POST", "/api/ai-builder/merge-answers", {
        parsedInfo: extractedInfo,
        answers,
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Merge failed");

      const merged: ExtractedInfo = body.data;
      setExtractedInfo(merged);

      setChatEntries(prev => prev.filter(e => e.type !== "progress"));
      addEntry({ role: "assistant", content: "رائع! هذا ما سأبنيه لك:", type: "text" });
      addEntry({ role: "assistant", content: "", type: "confirm-card", data: merged });
      setStep("confirming");
    } catch (err: any) {
      setChatEntries(prev => prev.filter(e => e.type !== "progress"));
      // Fallback: use original info
      addEntry({ role: "assistant", content: "هذا ما سأبنيه لك:", type: "text" });
      addEntry({ role: "assistant", content: "", type: "confirm-card", data: extractedInfo });
      setStep("confirming");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleConfirm() {
    if (!extractedInfo || isBusy) return;
    setIsBusy(true);
    setStep("creating");

    addEntry({ role: "user", content: "تأكيد — ابدأ الإنشاء ✓" });
    addEntry({ role: "assistant", content: "ممتاز! جاري إنشاء موقعك الآن...", type: "progress" });

    try {
      const createRes = await apiRequest("POST", "/api/projects", {
        name: extractedInfo.businessNameAr,
        description: extractedInfo.descriptionAr || extractedInfo.businessNameAr,
      });
      const project = await createRes.json();
      if (!createRes.ok) {
        const errMsg = project.messageAr || project.messageEn || project.message;
        throw new Error(errMsg);
      }

      const pid = project.id;
      setProjectId(pid);

      // Build enriched description with sections and goal
      let enrichedDesc = extractedInfo.descriptionAr;
      if (extractedInfo.requestedSections?.length) {
        enrichedDesc += ` | الأقسام المطلوبة: ${extractedInfo.requestedSections.join(", ")}`;
      }
      if (extractedInfo.siteGoal) {
        const goalMap: Record<string, string> = {
          leads: "هدف الموقع: استقبال اتصالات واستفسارات",
          sales: "هدف الموقع: بيع منتجات وخدمات",
          bookings: "هدف الموقع: حجز مواعيد",
          portfolio: "هدف الموقع: عرض الأعمال",
          branding: "هدف الموقع: التعريف بالنشاط",
        };
        enrichedDesc += ` | ${goalMap[extractedInfo.siteGoal] || ""}`;
      }

      const genRes = await apiRequest("POST", `/api/projects/${pid}/generate-instant`, {
        language: "ar",
        websiteLanguage: extractedInfo.websiteLanguages[0] || "ar",
        websiteLanguages: extractedInfo.websiteLanguages,
        description: enrichedDesc,
        activityType: extractedInfo.activityType,
        designStyle: extractedInfo.designStyle,
        whatsapp: extractedInfo.whatsapp || extractedInfo.phone || "",
      });
      const generated = await genRes.json();
      if (!genRes.ok) {
        const errMsg = generated.messageAr || generated.messageEn || generated.message;
        throw new Error(errMsg);
      }

      setPreviewKey(k => k + 1);
      setChatEntries(prev => prev.filter(e => e.type !== "progress"));
      addEntry({
        role: "assistant",
        content: `✨ موقعك جاهز! يمكنك الآن تعديله من خلال المحادثة.\n\nجرّب مثلاً:\n${extractedInfo.suggestions.map(s => `• ${s}`).join("\n")}`,
      });
      setStep("editing");
      setMobileTab("preview");
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    } catch (err: any) {
      setChatEntries(prev => prev.filter(e => e.type !== "progress"));
      addEntry({
        role: "assistant",
        content: "حدث خطأ: " + (err?.message || "Unknown error"),
        type: "error",
      });
      setStep("confirming");
    } finally {
      setIsBusy(false);
    }
  }

  function handleCancel() {
    setExtractedInfo(null);
    setStep("welcome");
    setChatEntries([]);
    setUserInput("");
    setPendingQuestions([]);
    setCollectedAnswers({});
    setMultiSelectBuffer([]);
    setShowCustomInput(false);
  }

  async function handleEdit() {
    const cmd = editInput.trim();
    if ((!cmd && !uploadedImage) || !projectId || isBusy) return;

    const finalCmd = cmd || "أضف هذه الصورة في الموقع";
    setIsBusy(true);
    setEditInput("");

    addEntry({
      role: "user",
      content: finalCmd,
      ...(uploadedImage ? { type: "image" as const, imageUrl: uploadedImage.dataUrl } : {}),
    });
    const imageDataUrl = uploadedImage?.dataUrl;
    setUploadedImage(null);

    addEntry({ role: "assistant", content: "جاري تطبيق التعديل...", type: "progress" });

    try {
      const res = await apiRequest("POST", `/api/projects/${projectId}/edit`, {
        command: finalCmd,
        language: "ar",
        ...(imageDataUrl ? { imageDataUrl } : {}),
      });
      const body = await res.json();
      if (!res.ok) {
        const errMsg = body.messageAr || body.messageEn || body.message || "Edit failed";
        throw new Error(errMsg);
      }
      setPreviewKey(k => k + 1);
      setChatEntries(prev => prev.filter(e => e.type !== "progress"));

      let aiMsg = "✅ تم التعديل بنجاح!";
      try {
        const msgsRes = await fetch(`/api/projects/${projectId}/messages`);
        if (msgsRes.ok) {
          const msgs: Array<{ role: string; content: string }> = await msgsRes.json();
          const lastAi = [...msgs].reverse().find(m => m.role === "assistant");
          if (lastAi?.content) aiMsg = lastAi.content;
        }
      } catch {}
      addEntry({ role: "assistant", content: aiMsg });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
    } catch (err: any) {
      setChatEntries(prev => prev.filter(e => e.type !== "progress"));
      addEntry({
        role: "assistant",
        content: "⚠️ " + (err?.message || "Edit failed"),
        type: "error",
      });
    } finally {
      setIsBusy(false);
    }
  }

  async function handleFileUpload(file: File) {
    try {
      const dataUrl = await compressImage(file);
      setUploadedImage({ dataUrl, name: file.name });
      toast({ description: `تم رفع الصورة: ${file.name}` });
    } catch {
      toast({ description: "فشل رفع الصورة", variant: "destructive" });
    }
  }

  const onFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFileUpload(file);
  }, []);

  // Find the current active question (last unanswered quick-reply/multi-choice)
  const activeQuestion = step === "clarifying"
    ? chatEntries.findLast(e => (e.type === "quick-reply" || e.type === "multi-choice") && !e.answered)
    : null;

  if (step === "welcome" || step === "parsing" || step === "clarifying" || step === "confirming") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950 flex flex-col" dir="rtl">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-black/20 backdrop-blur-sm sticky top-0 z-20">
          <button
            onClick={() => setLocation("/dashboard")}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
            data-testid="btn-back-to-dashboard"
          >
            <ArrowRight className="w-4 h-4" />
            <span>لوحة التحكم</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white/90">المبني AI</span>
          </div>
          <div className="w-24" />
        </header>

        <div className="flex-1 flex flex-col items-center justify-start px-4 py-10 overflow-y-auto">
          <div className="w-full max-w-2xl flex flex-col gap-5">

            {/* Welcome hero */}
            {chatEntries.length === 0 && (
              <div className="text-center mb-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 border border-violet-500/30 mb-4 mx-auto">
                  <Sparkles className="w-8 h-8 text-violet-400" />
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  أنشئ موقعك بجملة واحدة
                </h1>
                <p className="text-white/50 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                  أخبرني عن نشاطك التجاري وسأبني لك موقعاً احترافياً خلال ثوانٍ — بدون كود، بدون تصميم
                </p>
              </div>
            )}

            {/* Chat entries */}
            <div ref={chatScrollRef} className="flex flex-col gap-4">
              {chatEntries.map((entry, idx) => (
                <ChatBubble
                  key={entry.id}
                  entry={entry}
                  isAr={isAr}
                  onConfirm={entry.type === "confirm-card" ? handleConfirm : undefined}
                  onCancel={entry.type === "confirm-card" ? handleCancel : undefined}
                  confirmBusy={step === "creating"}
                  activityLabels={ACTIVITY_LABELS}
                />
              ))}

              {/* Active question UI */}
              {activeQuestion && !isBusy && (
                <div className="flex flex-col gap-2 pr-9">
                  {activeQuestion.type === "quick-reply" && activeQuestion.question && (
                    <QuickReplyButtons
                      question={activeQuestion.question}
                      onSelect={(val, label) => handleQuickReply(activeQuestion.question!, val, label)}
                      showCustomInput={showCustomInput}
                      customInputValue={customInputValue}
                      onCustomInputChange={setCustomInputValue}
                      onCustomInputSubmit={() => handleCustomInputSubmit(activeQuestion.question!)}
                      customInputRef={customInputRef}
                    />
                  )}
                  {activeQuestion.type === "multi-choice" && activeQuestion.question && (
                    <MultiChoiceButtons
                      question={activeQuestion.question}
                      selected={multiSelectBuffer}
                      onToggle={handleMultiSelectToggle}
                      onConfirm={() => handleMultiSelectConfirm(activeQuestion.question!)}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Welcome screen: style selector + input */}
            {(step === "welcome" || step === "parsing") && (
              <>
                {/* Design Style Selector */}
                <div>
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">نمط التصميم</p>
                  <div className="grid grid-cols-4 gap-2">
                    {DESIGN_STYLES.map(style => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`rounded-xl p-3 text-center border transition-all duration-200 ${
                          selectedStyle === style.id
                            ? "border-violet-500 bg-violet-500/10"
                            : "border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5"
                        }`}
                        data-testid={`btn-style-${style.id}`}
                      >
                        <div className="text-xl mb-1">{style.icon}</div>
                        <div className="text-xs font-bold text-white/80">{style.labelAr}</div>
                        <div className="text-[10px] text-white/40 mt-0.5">{style.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main input */}
                <div className="relative">
                  <Textarea
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendPrompt();
                      }
                    }}
                    placeholder="مثال: أريد موقع لمتجر عطور فاخر اسمه ليالي في الرياض، مع رقم واتساب"
                    className="min-h-[110px] resize-none text-sm bg-white/5 border-white/10 text-white placeholder:text-white/25 rounded-xl pr-4 pl-4 pt-4 pb-14 focus:border-violet-500/50 focus:ring-0 leading-relaxed"
                    disabled={isBusy}
                    data-testid="input-prompt"
                  />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-xs text-white/20">Enter للإرسال</span>
                    <Button
                      onClick={handleSendPrompt}
                      disabled={!userInput.trim() || isBusy}
                      size="sm"
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 rounded-lg px-4 h-8 gap-2"
                      data-testid="btn-send-prompt"
                    >
                      {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                      ابدأ الإنشاء
                    </Button>
                  </div>
                </div>

                {/* Example prompts */}
                <div>
                  <p className="text-xs text-white/30 mb-2">أمثلة:</p>
                  <div className="flex flex-col gap-1.5">
                    {EXAMPLE_PROMPTS_AR.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => setUserInput(ex)}
                        className="text-right text-xs text-white/40 hover:text-white/70 py-2 px-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200 leading-relaxed"
                        data-testid={`btn-example-${i}`}
                      >
                        <span className="text-violet-400 me-1.5">→</span> {ex}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ════════ EDITING STATE ════════
  return (
    <div className="h-screen w-full flex flex-col bg-[#0d1117] overflow-hidden" dir="rtl">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 h-12 border-b border-white/8 bg-black/40 backdrop-blur-sm flex-shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation("/dashboard")}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
            data-testid="btn-back-editing"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">لوحة التحكم</span>
          </button>
          <Separator orientation="vertical" className="h-4 bg-white/10" />
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold text-white/80 truncate max-w-[150px]">
              {extractedInfo?.businessNameAr || "موقعي"}
            </span>
          </div>
        </div>

        {/* Viewport switcher */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
          {(["desktop", "tablet", "mobile"] as Viewport[]).map(v => {
            const Icon = v === "desktop" ? Monitor : v === "tablet" ? Tablet : Smartphone;
            return (
              <button
                key={v}
                onClick={() => setViewport(v)}
                className={`p-1.5 rounded-md transition-all ${viewport === v ? "bg-violet-600 text-white" : "text-white/30 hover:text-white/60"}`}
                data-testid={`btn-viewport-${v}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {projectId && (
            <>
              <button
                onClick={() => { setPreviewKey(k => k + 1); }}
                className="hidden sm:flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                data-testid="btn-refresh-preview"
                title="تحديث المعاينة"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLocation(`/editor/${projectId}`)}
                className="hidden sm:flex items-center gap-1.5 text-xs bg-white/8 hover:bg-white/12 text-white/60 hover:text-white/90 border border-white/10 rounded-lg px-3 py-1.5 transition-all"
                data-testid="btn-open-editor"
              >
                <ExternalLink className="w-3 h-3" />
                فتح المحرر
              </button>
            </>
          )}
        </div>
      </header>

      {/* Mobile tab bar */}
      <div className="md:hidden flex border-b border-white/8 bg-black/30 flex-shrink-0">
        {(["chat", "preview"] as MobileTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              mobileTab === tab ? "text-violet-400 border-b-2 border-violet-500" : "text-white/40"
            }`}
            data-testid={`btn-tab-${tab}`}
          >
            {tab === "chat" ? "💬 المحادثة" : "👁 المعاينة"}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ── Chat Panel ── */}
        <div className={`flex flex-col border-r border-white/8 bg-black/20 ${mobileTab === "preview" ? "hidden md:flex" : "flex"} w-full md:w-[380px] lg:w-[420px] flex-shrink-0`}>
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3 min-h-0"
          >
            {chatEntries.map(entry => (
              <ChatBubble
                key={entry.id}
                entry={entry}
                isAr={isAr}
                activityLabels={ACTIVITY_LABELS}
              />
            ))}
          </div>

          {/* Quick suggestions in editing */}
          {step === "editing" && extractedInfo?.suggestions && chatEntries.filter(e => e.role === "user").length <= 1 && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-1.5">
                {extractedInfo.suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setEditInput(s); editInputRef.current?.focus(); }}
                    className="text-xs bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-300 rounded-full px-3 py-1.5 transition-all"
                    data-testid={`btn-suggestion-${i}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-white/8 bg-black/30 p-3 flex-shrink-0">
            {uploadedImage && (
              <div className="mb-2 flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/10">
                <img src={uploadedImage.dataUrl} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                <span className="text-xs text-white/60 truncate flex-1">{uploadedImage.name}</span>
                <button onClick={() => setUploadedImage(null)} className="text-white/30 hover:text-white/60">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div
              className="relative rounded-xl bg-white/5 border border-white/10 focus-within:border-violet-500/40 transition-colors"
              onDragOver={e => e.preventDefault()}
              onDrop={onFileDrop}
            >
              <Textarea
                ref={editInputRef}
                value={editInput}
                onChange={e => setEditInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleEdit();
                  }
                }}
                placeholder="اطلب أي تعديل... (مثال: غيّر اللون إلى ذهبي)"
                disabled={isBusy}
                className="min-h-[72px] max-h-[160px] resize-none bg-transparent border-0 text-sm text-white placeholder:text-white/20 rounded-xl py-3 px-3 focus-visible:ring-0 leading-relaxed"
                data-testid="input-edit-command"
              />
              <div className="flex items-center justify-between px-2 pb-2 pt-0">
                <div className="flex gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ""; }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/35 hover:text-white/60 transition-all"
                    title="رفع صورة"
                    data-testid="btn-upload-image"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={handleEdit}
                  disabled={(!editInput.trim() && !uploadedImage) || isBusy}
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all"
                  data-testid="btn-send-edit"
                >
                  {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <p className="text-[10px] text-white/20 text-center mt-1.5">
              اسحب وأفلت صورة لرفعها • Enter للإرسال
            </p>
          </div>
        </div>

        {/* ── Preview Panel ── */}
        <div className={`flex-1 flex flex-col bg-slate-900/50 overflow-hidden min-w-0 ${mobileTab === "chat" ? "hidden md:flex" : "flex"}`}>
          {previewSrc ? (
            <div className="flex-1 flex items-start justify-center overflow-hidden p-4">
              <div
                className="bg-white rounded-xl shadow-2xl overflow-hidden border border-white/5 transition-all duration-300 h-full"
                style={{ width: viewportWidth, maxWidth: "100%" }}
              >
                <iframe
                  src={previewSrc}
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                  title="Website Preview"
                  data-testid="iframe-preview"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-8">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
                  {step === "creating"
                    ? <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                    : <Sparkles className="w-8 h-8 text-violet-400/40" />
                  }
                </div>
                <p className="text-sm font-medium text-white/40">
                  {step === "creating" ? "جاري إنشاء موقعك..." : "المعاينة ستظهر هنا بعد الإنشاء"}
                </p>
                {step === "creating" && (
                  <div className="mt-4 w-48 mx-auto">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full animate-pulse" style={{ width: "65%" }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Activity Labels ──────────────────────────────────────────────────────────
const ACTIVITY_LABELS: Record<string, string> = {
  restaurant: "مطعم / كافيه", medical: "طبي / عيادة", retail: "متجر / تجزئة",
  services: "خدمات", realestate: "عقارات", education: "تعليم / تدريب",
  hotel: "فندق / ضيافة", automotive: "سيارات", beauty: "تجميل / صالون",
  technology: "تقنية / برمجة", other: "أخرى",
};

// ─── Quick Reply Buttons Component ───────────────────────────────────────────
function QuickReplyButtons({
  question, onSelect, showCustomInput, customInputValue,
  onCustomInputChange, onCustomInputSubmit, customInputRef,
}: {
  question: SmartQuestion;
  onSelect: (value: string, label: string) => void;
  showCustomInput: boolean;
  customInputValue: string;
  onCustomInputChange: (v: string) => void;
  onCustomInputSubmit: () => void;
  customInputRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {question.options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value, opt.label)}
            className="text-sm bg-white/5 hover:bg-violet-500/15 border border-white/15 hover:border-violet-500/40 text-white/75 hover:text-white rounded-xl px-4 py-2 transition-all duration-200 font-medium"
            style={{ fontFamily: "'Cairo', sans-serif" }}
            data-testid={`btn-reply-${opt.value}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {showCustomInput && (
        <div className="flex gap-2 mt-1">
          <input
            ref={customInputRef}
            type="text"
            value={customInputValue}
            onChange={e => onCustomInputChange(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") onCustomInputSubmit(); }}
            placeholder={question.customPlaceholder || "اكتب إجابتك..."}
            className="flex-1 bg-white/5 border border-white/15 focus:border-violet-500/50 text-white text-sm rounded-xl px-4 py-2.5 outline-none placeholder:text-white/25"
            style={{ fontFamily: "'Cairo', sans-serif" }}
            data-testid="input-custom-reply"
          />
          <button
            onClick={onCustomInputSubmit}
            disabled={!customInputValue.trim()}
            className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 flex items-center justify-center text-white transition-all"
            data-testid="btn-submit-custom-reply"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Multi-Choice Buttons Component ──────────────────────────────────────────
function MultiChoiceButtons({
  question, selected, onToggle, onConfirm,
}: {
  question: SmartQuestion;
  selected: string[];
  onToggle: (value: string) => void;
  onConfirm: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {question.hint && (
        <p className="text-xs text-white/40" style={{ fontFamily: "'Cairo', sans-serif" }}>{question.hint}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {question.options.map(opt => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => onToggle(opt.value)}
              className={`text-sm border rounded-xl px-4 py-2 transition-all duration-200 font-medium flex items-center gap-2 ${
                isSelected
                  ? "bg-violet-500/20 border-violet-500/50 text-violet-200"
                  : "bg-white/5 border-white/15 text-white/70 hover:border-white/30 hover:bg-white/8"
              }`}
              style={{ fontFamily: "'Cairo', sans-serif" }}
              data-testid={`btn-section-${opt.value}`}
            >
              {isSelected
                ? <CheckSquare className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                : <Square className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
              }
              {opt.label}
            </button>
          );
        })}
      </div>
      <Button
        onClick={onConfirm}
        size="sm"
        className="self-start bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 rounded-xl px-5 h-9 gap-2 text-sm"
        data-testid="btn-confirm-sections"
      >
        <Check className="w-3.5 h-3.5" />
        {selected.length > 0 ? `تأكيد ${selected.length} أقسام` : "تأكيد الاختيار"}
      </Button>
    </div>
  );
}

// ─── Chat Bubble Component ────────────────────────────────────────────────────
function ChatBubble({
  entry, isAr, onConfirm, onCancel, confirmBusy, activityLabels,
}: {
  entry: ChatEntry;
  isAr: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmBusy?: boolean;
  activityLabels?: Record<string, string>;
}) {
  const isUser = entry.role === "user";

  if (entry.type === "progress") {
    return (
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="bg-white/5 border border-white/8 rounded-2xl rounded-ss-sm px-4 py-3 max-w-[85%]">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Loader2 className="w-4 h-4 animate-spin text-violet-400 flex-shrink-0" />
            <span style={{ fontFamily: "'Cairo', sans-serif" }}>{entry.content}</span>
          </div>
        </div>
      </div>
    );
  }

  if (entry.type === "confirm-card" && entry.data) {
    const info = entry.data;
    const DESIGN_STYLES_MAP: Record<string, string> = {
      luxury: "فخم", "dark-modern": "حديث", corporate: "مؤسسي", minimal: "بسيط",
    };
    const SECTION_LABELS: Record<string, string> = {
      gallery: "معرض الصور", pricing: "الأسعار", team: "الفريق",
      testimonials: "آراء العملاء", faq: "الأسئلة الشائعة", map: "الخريطة",
      contact: "تواصل", services: "الخدمات",
    };
    const GOAL_LABELS: Record<string, string> = {
      leads: "📞 استقبال اتصالات", sales: "🛒 بيع منتجات",
      bookings: "🗓️ حجز مواعيد", portfolio: "🖼️ عرض أعمال", branding: "ℹ️ تعريف",
    };
    return (
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 max-w-[92%]">
          <div className="bg-white/5 border border-white/10 rounded-2xl rounded-ss-sm overflow-hidden">
            <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${info.primaryColor}, ${info.accentColor})` }} />
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-bold text-white text-base" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    {info.businessNameAr}
                  </h3>
                  <p className="text-xs text-white/40">{info.businessNameEn}</p>
                </div>
                <Badge className="text-xs bg-white/10 text-white/60 border-0 flex-shrink-0">
                  {activityLabels?.[info.activityType] || info.activityType}
                </Badge>
              </div>

              <div className="space-y-2 text-xs text-white/60 mb-4">
                {info.descriptionAr && (
                  <p className="text-white/50 text-xs leading-relaxed line-clamp-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                    {info.descriptionAr}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {info.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-violet-400 flex-shrink-0" />
                      <span>{info.location}</span>
                    </div>
                  )}
                  {(info.phone || info.whatsapp) && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-violet-400 flex-shrink-0" />
                      <span dir="ltr">{info.phone || info.whatsapp}</span>
                    </div>
                  )}
                  {info.websiteLanguages?.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3 h-3 text-violet-400 flex-shrink-0" />
                      <span>{info.websiteLanguages.map((l: string) => l.toUpperCase()).join(" + ")}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Palette className="w-3 h-3 text-violet-400 flex-shrink-0" />
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full flex-shrink-0 border border-white/20" style={{ background: info.primaryColor }} />
                      <span className="w-3 h-3 rounded-full flex-shrink-0 border border-white/20" style={{ background: info.accentColor }} />
                      {DESIGN_STYLES_MAP[info.designStyle] || info.designStyle}
                    </span>
                  </div>
                </div>

                {/* Goal badge */}
                {info.siteGoal && (
                  <div className="pt-1">
                    <span className="text-xs bg-violet-500/15 border border-violet-500/25 text-violet-300 rounded-full px-2.5 py-1">
                      {GOAL_LABELS[info.siteGoal] || info.siteGoal}
                    </span>
                  </div>
                )}

                {/* Sections */}
                {info.requestedSections && info.requestedSections.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-1">
                    {info.requestedSections.map(s => (
                      <span key={s} className="text-[10px] bg-white/8 border border-white/10 text-white/50 rounded-full px-2 py-0.5">
                        {SECTION_LABELS[s] || s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {onConfirm && (
                <div className="flex gap-2">
                  <Button
                    onClick={onConfirm}
                    disabled={confirmBusy}
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 h-8 text-xs gap-1.5"
                    data-testid="btn-confirm-build"
                  >
                    {confirmBusy
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />جاري الإنشاء...</>
                      : <><Check className="w-3.5 h-3.5" />ابنِ الموقع</>
                    }
                  </Button>
                  {onCancel && !confirmBusy && (
                    <Button
                      onClick={onCancel}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-white/10 text-white/50 hover:text-white/80 hover:bg-white/5 gap-1.5"
                      data-testid="btn-cancel-build"
                    >
                      <X className="w-3.5 h-3.5" />
                      تعديل
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="flex items-start gap-2.5 flex-row-reverse">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="bg-violet-600/20 border border-violet-500/20 rounded-2xl rounded-se-sm px-4 py-2.5 max-w-[85%]">
          {entry.imageUrl && (
            <img src={entry.imageUrl} alt="" className="w-20 h-20 rounded-lg object-cover mb-2" />
          )}
          <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {entry.content}
          </p>
        </div>
      </div>
    );
  }

  // Assistant text / quick-reply question bubble
  const isError = entry.type === "error";
  const isQuestion = entry.type === "quick-reply" || entry.type === "multi-choice";

  return (
    <div className="flex items-start gap-2.5">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isError ? "bg-red-500/20 border border-red-500/30" : "bg-gradient-to-br from-violet-500 to-indigo-600"}`}>
        {isError ? <X className="w-3.5 h-3.5 text-red-400" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div className={`rounded-2xl rounded-ss-sm px-4 py-2.5 max-w-[85%] ${
        isError ? "bg-red-500/10 border border-red-500/20"
        : isQuestion ? "bg-indigo-500/10 border border-indigo-500/20"
        : "bg-white/5 border border-white/8"
      }`}>
        <p
          className={`text-sm leading-relaxed whitespace-pre-wrap ${isError ? "text-red-300" : isQuestion ? "text-white/90 font-medium" : "text-white/85"}`}
          style={{ fontFamily: "'Cairo', sans-serif" }}
        >
          {entry.content}
        </p>
        {isQuestion && entry.answered && (
          <span className="text-[10px] text-white/30 mt-1 block">✓ تم الإجابة</span>
        )}
      </div>
    </div>
  );
}
