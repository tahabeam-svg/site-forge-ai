import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Globe2, Minimize2 } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: Date;
}

const QUICK_REPLIES_AR = [
  "كيف أنشئ موقعي؟",
  "ما هي الأسعار؟",
  "ما مميزات المنصة؟",
  "كيف أنشر موقعي؟",
];

const QUICK_REPLIES_EN = [
  "How do I create a website?",
  "What are the pricing plans?",
  "What are the features?",
  "How do I publish my site?",
];

const WELCOME_AR = "مرحباً بك في عربي ويب! 👋\nأنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟";
const WELCOME_EN = "Welcome to ArabyWeb! 👋\nI'm your AI assistant. How can I help you today?";

function generateSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function detectInputLang(text: string): "ar" | "en" {
  return /[\u0600-\u06FF]/.test(text) ? "ar" : "en";
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | undefined>();
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [uiLang, setUiLang] = useState<"ar" | "en">("ar");
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadBusiness, setLeadBusiness] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const sessionId = useRef(generateSessionId());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const history = useRef<Array<{ role: "user" | "assistant"; content: string }>>([]);

  useEffect(() => {
    if (open) {
      setUnreadCount(0);
      if (messages.length === 0) {
        const lang = document.documentElement.lang === "en" ? "en" : "ar";
        setUiLang(lang);
        addBotMessage(lang === "ar" ? WELCOME_AR : WELCOME_EN);
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

    const detectedLang = detectInputLang(msgText);
    setUiLang(detectedLang);
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
        }),
      });
      const data = await res.json();

      history.current.push({ role: "user", content: msgText });
      history.current.push({ role: "assistant", content: data.reply });
      if (history.current.length > 12) history.current = history.current.slice(-12);

      if (data.conversationId) setConversationId(data.conversationId);

      addBotMessage(data.reply);

      // Show lead capture after 3 messages if not captured
      if (history.current.length >= 6 && !leadCaptured) {
        setTimeout(() => setShowLeadForm(true), 1000);
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

  async function saveLead() {
    if (!leadEmail) return;
    try {
      await fetch("/api/chatbot/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName,
          email: leadEmail,
          businessType: leadBusiness,
          sessionId: sessionId.current,
        }),
      });
      setLeadCaptured(true);
      setShowLeadForm(false);
      addBotMessage(uiLang === "ar"
        ? "شكراً! سيتواصل معك فريقنا قريباً. هل يمكنني مساعدتك بأي شيء آخر؟"
        : "Thank you! Our team will reach out soon. Anything else I can help with?");
    } catch {}
  }

  const isRTL = uiLang === "ar";

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 end-6 z-50" dir="ltr">
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
          onClick={() => setOpen(o => !o)}
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

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-24 end-6 z-50 w-[340px] sm:w-[380px] flex flex-col"
            style={{ maxHeight: "calc(100vh - 120px)" }}
            dir={isRTL ? "rtl" : "ltr"}
          >
            <div className="flex flex-col bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl shadow-black/20 border border-border overflow-hidden" style={{ maxHeight: "580px", height: "580px" }}>

              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 flex items-center gap-3 flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Globe2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm leading-none">{isRTL ? "مساعد عربي ويب" : "ArabyWeb Assistant"}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                    <p className="text-white/80 text-xs">{isRTL ? "متاح الآن" : "Online now"}</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors p-1">
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "'Inter', sans-serif" }}>
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.sender === "bot" && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 me-2 mt-auto">
                        <Globe2 className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
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
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center me-2">
                      <Globe2 className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-es-sm px-4 py-3 flex items-center gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-2 h-2 rounded-full bg-muted-foreground/50"
                          animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Lead form */}
                {showLeadForm && !leadCaptured && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {isRTL ? "تبدو مهتماً! هل تريد أن نتواصل معك؟" : "You seem interested! Want us to reach out?"}
                    </p>
                    <input value={leadName} onChange={e => setLeadName(e.target.value)}
                      placeholder={isRTL ? "اسمك" : "Your name"}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background outline-none" />
                    <input value={leadEmail} onChange={e => setLeadEmail(e.target.value)}
                      type="email" placeholder={isRTL ? "بريدك الإلكتروني" : "Your email"}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background outline-none" dir="ltr" />
                    <input value={leadBusiness} onChange={e => setLeadBusiness(e.target.value)}
                      placeholder={isRTL ? "نوع نشاطك التجاري" : "Your business type"}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background outline-none" />
                    <div className="flex gap-2">
                      <button onClick={saveLead} disabled={!leadEmail}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 rounded-lg font-medium disabled:opacity-50 transition-colors">
                        {isRTL ? "إرسال" : "Send"}
                      </button>
                      <button onClick={() => setShowLeadForm(false)}
                        className="text-xs text-muted-foreground px-3 py-2 rounded-lg hover:bg-muted transition-colors">
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
                    className="px-3 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
                    {(isRTL ? QUICK_REPLIES_AR : QUICK_REPLIES_EN).map(reply => (
                      <button key={reply} onClick={() => sendMessage(reply)}
                        className="text-xs px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors whitespace-nowrap">
                        {reply}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input */}
              <div className="border-t px-3 py-3 flex items-center gap-2 flex-shrink-0 bg-background">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={isRTL ? "اكتب رسالتك..." : "Type a message..."}
                  className="flex-1 text-sm bg-muted rounded-xl px-4 py-2.5 outline-none border border-transparent focus:border-emerald-500/40 transition-colors min-w-0"
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
