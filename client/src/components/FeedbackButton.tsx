import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageSquarePlus, X, Bug, Lightbulb, HelpCircle, ThumbsUp, Send, Loader2 } from "lucide-react";

type FeedbackType = "bug" | "suggestion" | "question" | "praise";

interface Props {
  lang?: string;
  page?: string;
}

const types: { key: FeedbackType; icon: any; labelAr: string; labelEn: string; color: string; bg: string }[] = [
  { key: "bug", icon: Bug, labelAr: "مشكلة", labelEn: "Bug", color: "text-red-600", bg: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800" },
  { key: "suggestion", icon: Lightbulb, labelAr: "اقتراح", labelEn: "Idea", color: "text-amber-600", bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800" },
  { key: "question", icon: HelpCircle, labelAr: "سؤال", labelEn: "Question", color: "text-blue-600", bg: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800" },
  { key: "praise", icon: ThumbsUp, labelAr: "إطراء", labelEn: "Praise", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800" },
];

export default function FeedbackButton({ lang = "ar", page }: Props) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("bug");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/feedback", { type, message, page }),
    onSuccess: () => {
      toast({
        title: lang === "ar" ? "شكراً على تواصلك! 🙏" : "Thanks for your feedback! 🙏",
        description: lang === "ar" ? "سنراجع رسالتك ونعمل على تحسين تجربتك." : "We'll review and improve your experience.",
      });
      setOpen(false);
      setMessage("");
      setType("bug");
    },
    onError: () => {
      toast({ title: lang === "ar" ? "فشل الإرسال" : "Failed to submit", variant: "destructive" });
    },
  });

  const placeholder = {
    bug: lang === "ar" ? "صف المشكلة التي واجهتها بالتفصيل..." : "Describe the issue you encountered in detail...",
    suggestion: lang === "ar" ? "شاركنا اقتراحك لتحسين الخدمة..." : "Share your idea to improve the service...",
    question: lang === "ar" ? "اكتب سؤالك هنا..." : "Write your question here...",
    praise: lang === "ar" ? "أخبرنا بما أعجبك! 😊" : "Tell us what you loved! 😊",
  };

  return (
    <>
      {/* Floating trigger button — hidden on mobile inside editor (too cramped) */}
      <button
        onClick={() => setOpen(true)}
        data-testid="button-feedback"
        className={`fixed z-50 flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-xs font-semibold px-3 py-2.5 rounded-full shadow-lg shadow-violet-500/30 transition-all hover:scale-105 active:scale-95 ${
          page === "editor"
            ? "hidden md:flex md:bottom-6 md:end-4"
            : "bottom-6 end-4 flex"
        }`}
        style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Inter', sans-serif" }}
      >
        <MessageSquarePlus className="w-4 h-4 shrink-0" />
        <span>{lang === "ar" ? "أبلغ عن مشكلة" : "Feedback"}</span>
      </button>

      {/* Overlay + Dialog */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-end p-4 md:items-center md:justify-center"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="w-full max-w-md bg-background rounded-2xl shadow-2xl border overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
            style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Inter', sans-serif", direction: lang === "ar" ? "rtl" : "ltr" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-violet-600 to-purple-600">
              <div className="flex items-center gap-2 text-white">
                <MessageSquarePlus className="w-5 h-5" />
                <h2 className="font-bold text-base">
                  {lang === "ar" ? "تواصل معنا" : "Send Feedback"}
                </h2>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Type selector */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  {lang === "ar" ? "نوع الرسالة" : "Message Type"}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {types.map(({ key, icon: Icon, labelAr, labelEn, color, bg }) => (
                    <button
                      key={key}
                      onClick={() => setType(key)}
                      className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        type === key ? `${bg} ${color}` : "border-border text-muted-foreground hover:border-muted-foreground"
                      }`}
                      data-testid={`button-feedback-type-${key}`}
                    >
                      <Icon className="w-4 h-4" />
                      {lang === "ar" ? labelAr : labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message textarea */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  {lang === "ar" ? "رسالتك" : "Your Message"}
                </p>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={placeholder[type]}
                  rows={4}
                  className="resize-none text-sm"
                  data-testid="input-feedback-message"
                />
              </div>

              {/* Send button */}
              <Button
                onClick={() => mutation.mutate()}
                disabled={!message.trim() || mutation.isPending}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold"
                data-testid="button-feedback-submit"
              >
                {mutation.isPending ? (
                  <><Loader2 className="w-4 h-4 me-2 animate-spin" />{lang === "ar" ? "جاري الإرسال..." : "Sending..."}</>
                ) : (
                  <><Send className="w-4 h-4 me-2" />{lang === "ar" ? "إرسال" : "Send"}</>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                {lang === "ar"
                  ? "رسالتك ستصل مباشرة للفريق وسنرد في أقرب وقت ✨"
                  : "Your message goes directly to our team and we'll respond ASAP ✨"}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
