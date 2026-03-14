import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Minimize2, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: Date;
}

// Smart proactive messages shown in bubble before chat opens
const PROACTIVE_MSGS_AR = [
  "👋 هل تبحث عن موقع لنشاطك؟ الذكاء الاصطناعي يبنيه في 90 ثانية!",
  "💡 هل تعرف أن بإمكانك توليد محتوى السوشيال ميديا تلقائياً؟",
  "🚀 +10,000 موقع تم إنشاؤه — جرّب مجاناً الآن!",
];

const PROACTIVE_MSGS_EN = [
  "👋 Looking for a website for your business? AI builds it in 90 seconds!",
  "💡 Did you know you can auto-generate social media content with AI?",
  "🚀 10,000+ websites built — try it free today!",
];

// Opening welcome message — simple & warm
const OPENING_AR = `أهلاً وسهلاً بك في عربي ويب! 😊

أنا مساعدك الذكي، يسعدني مساعدتك في بناء موقعك الاحترافي أو إنشاء محتوى السوشيال ميديا بالذكاء الاصطناعي.

كيف يمكنني مساعدتك اليوم؟`;

const OPENING_EN = `Welcome to ArabyWeb! 😊

I'm your AI assistant — happy to help you build your professional website or generate social media content.

How can I help you today?`;

// Quick reply chips based on business type
const QUICK_REPLIES_AR = [
  "🍽️ مطعم أو كافيه",
  "🛍️ متجر إلكتروني",
  "🏥 عيادة أو مركز طبي",
  "💼 شركة أو مؤسسة",
  "📱 أريد محتوى سوشيال",
  "💰 كم الأسعار؟",
];

const QUICK_REPLIES_EN = [
  "🍽️ Restaurant or café",
  "🛍️ Online store",
  "🏥 Clinic or medical",
  "💼 Company or startup",
  "📱 Social media content",
  "💰 Pricing plans?",
];

const STORAGE_KEY = "aw_chat_seen";

function generateSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function detectInputLang(text: string): "ar" | "en" {
  return /[\u0600-\u06FF]/.test(text) ? "ar" : "en";
}

export default function ChatWidget() {
  const { language } = useAuth();
  const uiLang: "ar" | "en" = language === "en" ? "en" : "ar";

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | undefined>();
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [formType, setFormType] = useState<"trial" | "consultation">("trial");
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadPhoneError, setLeadPhoneError] = useState("");
  const [leadBusiness, setLeadBusiness] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [proactiveBubble, setProactiveBubble] = useState<string | null>(null);
  const sessionId = useRef(generateSessionId());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const history = useRef<Array<{ role: "user" | "assistant"; content: string }>>([]);

  // Proactive auto-open for new visitors
  useEffect(() => {
    const alreadySeen = sessionStorage.getItem(STORAGE_KEY);
    if (alreadySeen) return;

    const msgs = uiLang === "en" ? PROACTIVE_MSGS_EN : PROACTIVE_MSGS_AR;
    const msg = msgs[Math.floor(Math.random() * msgs.length)];

    // Show bubble after 4s
    const bubbleTimer = setTimeout(() => {
      setProactiveBubble(msg);
      setUnreadCount(1);
    }, 4000);

    return () => {
      clearTimeout(bubbleTimer);
    };
  }, [uiLang]);

  // Initialize chat when opened
  useEffect(() => {
    if (open) {
      setUnreadCount(0);
      setProactiveBubble(null);
      sessionStorage.setItem(STORAGE_KEY, "1");
      if (messages.length === 0) {
        addBotMessage(uiLang === "ar" ? OPENING_AR : OPENING_EN);
      }
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function addBotMessage(text: string) {
    const msg: Message = { id: Date.now().toString(), sender: "bot", text, time: new Date() };
    setMessages(prev => [...prev, msg]);
  }

  async function sendMessage(text?: string) {
    const msgText = (text || input).trim();
    if (!msgText || loading) return;

    setShowQuickReplies(false);
    setInput("");
    setLoading(true);

    const userMsg: Message = { id: Date.now().toString(), sender: "user", text: msgText, time: new Date() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch("/api/chatbot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msgText,
          sessionId: sessionId.current,
          conversationId,
          history: history.current,
          pageLang: uiLang,
        }),
      });
      const data = await res.json();

      if (data.conversationId) setConversationId(data.conversationId);

      // Detect [CONSULTATION] marker — strip it and show consultation form
      const CONSULT_TAG = "[CONSULTATION]";
      const rawReply: string = data.reply || "";
      const needsConsultation = rawReply.includes(CONSULT_TAG);
      const cleanReply = rawReply.replace(CONSULT_TAG, "").trim();

      history.current.push({ role: "user", content: msgText });
      history.current.push({ role: "assistant", content: cleanReply });
      if (history.current.length > 14) history.current = history.current.slice(-14);

      addBotMessage(cleanReply);

      if (needsConsultation && !leadCaptured) {
        setFormType("consultation");
        setTimeout(() => setShowLeadForm(true), 800);
      } else if (history.current.length >= 4 && !leadCaptured && !showLeadForm) {
        setFormType("trial");
        setTimeout(() => setShowLeadForm(true), 1500);
      }

      if (!open) setUnreadCount(c => c + 1);
    } catch {
      addBotMessage(uiLang === "ar"
        ? "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى."
        : "Sorry, something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function validatePhone(value: string): string {
    if (!value) return "";
    if (!/^05/.test(value)) return isRTL ? "يجب أن يبدأ الرقم بـ 05" : "Number must start with 05";
    if (!/^\d+$/.test(value)) return isRTL ? "أرقام فقط" : "Digits only";
    if (value.length !== 10) return isRTL ? "يجب أن يكون 10 أرقام" : "Must be exactly 10 digits";
    return "";
  }

  function handlePhoneChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setLeadPhone(digits);
    setLeadPhoneError(validatePhone(digits));
  }

  async function saveLead() {
    if (!leadEmail) return;
    if (formType === "consultation") {
      const phoneErr = validatePhone(leadPhone);
      if (phoneErr) { setLeadPhoneError(phoneErr); return; }
    }
    try {
      await fetch("/api/chatbot/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName,
          email: leadEmail,
          phone: leadPhone || undefined,
          businessType: leadBusiness,
          sessionId: sessionId.current,
        }),
      });
      setLeadCaptured(true);
      setShowLeadForm(false);
      const successMsg = uiLang === "ar"
        ? (formType === "consultation"
            ? "✅ تم! سيتواصل معك فريقنا خلال 24 ساعة لمساعدتك.\n\nفي انتظار ذلك، يمكنك تجربة المنصة مجاناً الآن 🚀"
            : "✅ تم الحفظ! الآن ابدأ تجربتك المجانية فوراً — أنشئ موقعك في أقل من 90 ثانية بدون أي برمجة 🚀\n\nاضغط على \"ابدأ مجاناً\" أعلى الصفحة الآن!")
        : (formType === "consultation"
            ? "✅ Done! Our team will reach out within 24 hours.\n\nMeanwhile, try the platform free 🚀"
            : "✅ Saved! Start your free trial now — build your website in under 90 seconds with zero coding 🚀\n\nClick 'Start Free' at the top of the page!");
      addBotMessage(successMsg);
    } catch {}
  }

  function handleOpen() {
    setOpen(o => !o);
  }

  const isRTL = uiLang === "ar";

  return (
    <>
      {/* ── Proactive Bubble ── */}
      <AnimatePresence>
        {proactiveBubble && !open && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="fixed bottom-36 left-20 md:left-24 z-50 max-w-[220px]"
            dir={isRTL ? "rtl" : "ltr"}
          >
            <button
              onClick={() => { setOpen(true); setProactiveBubble(null); }}
              className="bg-white dark:bg-zinc-900 border border-border rounded-2xl rounded-ee-sm shadow-xl px-4 py-3 text-xs text-foreground leading-relaxed text-start hover:shadow-2xl transition-shadow cursor-pointer"
            >
              {proactiveBubble}
              <div className="mt-2 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                {isRTL ? "اضغط للمحادثة ←" : "Click to chat →"}
              </div>
            </button>
            {/* Bubble tail */}
            <div className="absolute -bottom-1.5 end-3 w-3 h-3 bg-white dark:bg-zinc-900 border-e border-b border-border rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Button ── */}
      <div className="fixed bottom-20 left-6 z-50" dir="ltr">
        <AnimatePresence>
          {!open && unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold z-10"
            >
              {unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpen}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/40 flex items-center justify-center transition-all"
          data-testid="button-chat-open"
          aria-label="Open chat"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <MessageCircle className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-36 left-6 z-50 w-[340px] sm:w-[390px] flex flex-col"
            style={{ maxHeight: "calc(100vh - 160px)" }}
            dir={isRTL ? "rtl" : "ltr"}
          >
            <div className="flex flex-col bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl shadow-black/20 border border-border overflow-hidden" style={{ maxHeight: "600px", height: "600px" }}>

              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 flex items-center gap-3 flex-shrink-0">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -end-0.5 w-3.5 h-3.5 bg-emerald-300 rounded-full border-2 border-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm leading-none">{isRTL ? "مساعد عربي ويب" : "ArabyWeb Assistant"}</p>
                  <p className="text-white/80 text-xs mt-1">{isRTL ? "مساعدك الذكي لبناء الأعمال" : "Your AI business growth partner"}</p>
                </div>
                <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors p-1">
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Service pills */}
              <div className="px-3 pt-2 pb-1 flex gap-2 flex-shrink-0 bg-muted/30 border-b border-border/40">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                  🌐 {isRTL ? "بناء المواقع" : "Website Builder"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400 font-medium flex items-center gap-1">
                  📱 {isRTL ? "توليد المحتوى" : "Content AI"}
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "'Inter', sans-serif" }}>
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.sender === "bot" && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 me-2 mt-auto">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.sender === "user"
                          ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-ee-sm"
                          : "bg-muted text-foreground rounded-es-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center me-2 flex-shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-es-sm px-4 py-3 flex items-center gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-2 h-2 rounded-full bg-muted-foreground/50"
                          animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Lead capture form */}
                {showLeadForm && !leadCaptured && formType === "trial" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {isRTL ? "ابدأ تجربتك المجانية الآن! 🚀" : "Start your free trial now! 🚀"}
                      </p>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {isRTL ? "موقعك جاهز في 90 ثانية — بدون أي برمجة · بدون بطاقة بنكية" : "Your website ready in 90 seconds — zero coding · no credit card"}
                    </p>
                    <input value={leadEmail} onChange={e => setLeadEmail(e.target.value)}
                      type="email" placeholder={isRTL ? "بريدك الإلكتروني" : "Email address"}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background outline-none focus:border-emerald-400 transition-colors" dir="ltr" />
                    <div className="flex gap-2 pt-1">
                      <a href="/auth" onClick={() => { if (leadEmail) saveLead(); }}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs py-2.5 rounded-lg font-bold text-center transition-all shadow-sm">
                        {isRTL ? "🚀 ابدأ مجاناً الآن" : "🚀 Start Free Now"}
                      </a>
                      <button onClick={() => setShowLeadForm(false)}
                        className="text-xs text-muted-foreground px-2 py-2 rounded-lg hover:bg-muted transition-colors">
                        {isRTL ? "لاحقاً" : "Later"}
                      </button>
                    </div>
                  </motion.div>
                )}

                {showLeadForm && !leadCaptured && formType === "consultation" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200 dark:border-violet-800 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <span className="text-[10px] text-white">💬</span>
                      </div>
                      <p className="text-xs font-bold text-violet-700 dark:text-violet-400">
                        {isRTL ? "احجز استشارة مجانية مع خبرائنا" : "Book a free consultation"}
                      </p>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {isRTL ? "سيتواصل معك أحد خبرائنا خلال 24 ساعة لمساعدتك" : "Our expert will reach out within 24 hours"}
                    </p>
                    <input value={leadName} onChange={e => setLeadName(e.target.value)}
                      type="text" placeholder={isRTL ? "اسمك الكريم" : "Your name"}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background outline-none focus:border-violet-400 transition-colors" />
                    <input value={leadEmail} onChange={e => setLeadEmail(e.target.value)}
                      type="email" placeholder={isRTL ? "بريدك الإلكتروني" : "Email address"}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background outline-none focus:border-violet-400 transition-colors" dir="ltr" />
                    <div className="space-y-1">
                      <input value={leadPhone} onChange={e => handlePhoneChange(e.target.value)}
                        type="tel" inputMode="numeric" placeholder={isRTL ? "رقم الجوال (05XXXXXXXX)" : "Mobile (05XXXXXXXX)"}
                        maxLength={10}
                        className={`w-full text-xs px-3 py-2 rounded-lg border bg-background outline-none transition-colors ${leadPhoneError ? "border-red-400 focus:border-red-400" : "border-border focus:border-violet-400"}`}
                        dir="ltr" />
                      {leadPhoneError && (
                        <p className="text-[10px] text-red-500 px-1">{leadPhoneError}</p>
                      )}
                    </div>
                    <input value={leadBusiness} onChange={e => setLeadBusiness(e.target.value)}
                      type="text" placeholder={isRTL ? "نوع نشاطك التجاري" : "Your business type"}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background outline-none focus:border-violet-400 transition-colors" />
                    <div className="flex gap-2 pt-1">
                      <button onClick={saveLead} disabled={!leadEmail || !!leadPhoneError || !leadPhone}
                        className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-xs py-2.5 rounded-lg font-bold text-center transition-all shadow-sm disabled:opacity-50">
                        {isRTL ? "📅 احجز استشارتك المجانية" : "📅 Book Free Consultation"}
                      </button>
                      <button onClick={() => setShowLeadForm(false)}
                        className="text-xs text-muted-foreground px-2 py-2 rounded-lg hover:bg-muted transition-colors">
                        {isRTL ? "لاحقاً" : "Later"}
                      </button>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              <AnimatePresence>
                {showQuickReplies && messages.length <= 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="px-3 pb-2 flex flex-wrap gap-1.5 flex-shrink-0 border-t border-border/30 pt-2">
                    {(isRTL ? QUICK_REPLIES_AR : QUICK_REPLIES_EN).map(reply => (
                      <button key={reply} onClick={() => sendMessage(reply)}
                        className="text-xs px-2.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors whitespace-nowrap">
                        {reply}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input */}
              <div className="border-t px-3 py-2.5 flex items-center gap-2 flex-shrink-0 bg-background">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={isRTL ? "اكتب رسالتك..." : "Type a message..."}
                  className="flex-1 text-sm bg-muted rounded-xl px-3.5 py-2.5 outline-none border border-transparent focus:border-emerald-500/40 transition-colors min-w-0"
                  style={{ fontFamily: "inherit" }}
                  data-testid="input-chat-message"
                  disabled={loading}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:opacity-90 transition-opacity"
                  data-testid="button-chat-send"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>

              {/* Footer */}
              <div className="px-3 py-1.5 flex-shrink-0 bg-background/50 border-t">
                <p className="text-[10px] text-center text-muted-foreground">
                  {isRTL ? "مدعوم بالذكاء الاصطناعي · عربي ويب" : "Powered by AI · ArabyWeb"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
