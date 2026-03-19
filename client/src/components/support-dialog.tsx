import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, HeadphonesIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SupportDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lang?: "ar" | "en";
}

const CATEGORIES = {
  ar: [
    { value: "billing",   label: "فواتير ومدفوعات" },
    { value: "technical", label: "مشكلة تقنية" },
    { value: "website",   label: "مشكلة في موقعي" },
    { value: "account",   label: "مشكلة في الحساب" },
    { value: "other",     label: "أخرى" },
  ],
  en: [
    { value: "billing",   label: "Billing & Payments" },
    { value: "technical", label: "Technical Issue" },
    { value: "website",   label: "My Website Issue" },
    { value: "account",   label: "Account Issue" },
    { value: "other",     label: "Other" },
  ],
};

const PRIORITIES = {
  ar: [
    { value: "low",    label: "منخفضة", color: "bg-emerald-100 text-emerald-700" },
    { value: "medium", label: "متوسطة", color: "bg-amber-100 text-amber-700" },
    { value: "high",   label: "عالية",  color: "bg-red-100 text-red-700" },
  ],
  en: [
    { value: "low",    label: "Low",    color: "bg-emerald-100 text-emerald-700" },
    { value: "medium", label: "Medium", color: "bg-amber-100 text-amber-700" },
    { value: "high",   label: "High",   color: "bg-red-100 text-red-700" },
  ],
};

export function SupportDialog({ open, onOpenChange, lang = "ar" }: SupportDialogProps) {
  const { toast } = useToast();
  const isAr = lang === "ar";

  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/support", { category, priority, subject, message }),
    onSuccess: async (res) => {
      const data = await res.json();
      setTicketId(data.ticketId);
      setSubmitted(true);
    },
    onError: async (err: any) => {
      const msg = isAr ? "حدث خطأ، يرجى المحاولة مجدداً" : "Something went wrong, please try again.";
      toast({ title: msg, variant: "destructive" });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) {
      toast({ title: isAr ? "يرجى اختيار تصنيف" : "Please select a category", variant: "destructive" });
      return;
    }
    if (subject.length < 5) {
      toast({ title: isAr ? "الموضوع قصير جداً" : "Subject is too short", variant: "destructive" });
      return;
    }
    if (message.length < 20) {
      toast({ title: isAr ? "الرسالة قصيرة جداً (20 حرف على الأقل)" : "Message is too short (min 20 chars)", variant: "destructive" });
      return;
    }
    mutation.mutate();
  }

  function handleClose() {
    onOpenChange(false);
    setTimeout(() => {
      setSubmitted(false);
      setTicketId(null);
      setCategory("");
      setPriority("medium");
      setSubject("");
      setMessage("");
    }, 300);
  }

  const categories = CATEGORIES[lang];
  const priorities = PRIORITIES[lang];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-md"
        dir={isAr ? "rtl" : "ltr"}
        data-testid="dialog-support"
      >
        {submitted ? (
          <div className="flex flex-col items-center text-center py-6 gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold">
                {isAr ? "تم استلام بلاغك!" : "Request Received!"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isAr
                  ? "سيتواصل معك فريق الدعم خلال 24 ساعة عمل."
                  : "Our support team will reach you within 24 business hours."}
              </p>
            </div>
            {ticketId && (
              <Badge variant="outline" className="text-sm font-mono px-3 py-1">
                {isAr ? `رقم البلاغ: #${ticketId}` : `Ticket #${ticketId}`}
              </Badge>
            )}
            <p className="text-xs text-muted-foreground max-w-xs">
              {isAr
                ? "أُرسل إشعار بريد إلكتروني لبريدك وللدعم الفني. احتفظ برقم البلاغ للمتابعة."
                : "An email confirmation was sent to you and to our support team."}
            </p>
            <Button onClick={handleClose} className="mt-2 w-full" data-testid="button-close-support">
              {isAr ? "إغلاق" : "Close"}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                  <HeadphonesIcon className="w-4 h-4 text-emerald-600" />
                </div>
                <DialogTitle className="text-base">
                  {isAr ? "إبلاغ عن مشكلة" : "Report an Issue"}
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs">
                {isAr
                  ? "سيصل بلاغك مباشرةً للدعم الفني وستتلقى رداً على بريدك."
                  : "Your report will be sent directly to our support team and you'll receive a reply by email."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{isAr ? "التصنيف" : "Category"}</Label>
                <Select value={category} onValueChange={setCategory} dir={isAr ? "rtl" : "ltr"}>
                  <SelectTrigger data-testid="select-category" className="h-8 text-xs">
                    <SelectValue placeholder={isAr ? "اختر..." : "Select..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">{isAr ? "الأولوية" : "Priority"}</Label>
                <Select value={priority} onValueChange={setPriority} dir={isAr ? "rtl" : "ltr"}>
                  <SelectTrigger data-testid="select-priority" className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(p => (
                      <SelectItem key={p.value} value={p.value} className="text-xs">
                        <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium ${p.color}`}>
                          {p.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{isAr ? "موضوع المشكلة" : "Issue Subject"}</Label>
              <Input
                data-testid="input-support-subject"
                className="h-8 text-xs"
                placeholder={isAr ? "مثال: لا أستطيع تنزيل موقعي" : "e.g. Cannot download my website"}
                value={subject}
                onChange={e => setSubject(e.target.value)}
                maxLength={200}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">
                {isAr ? "تفاصيل المشكلة" : "Issue Details"}
                <span className="text-muted-foreground ms-1">({message.length}/3000)</span>
              </Label>
              <Textarea
                data-testid="input-support-message"
                className="text-xs min-h-[100px] resize-none"
                placeholder={isAr
                  ? "اشرح المشكلة بوضوح: ماذا فعلت؟ ماذا حصل؟ ما الخطأ الذي ظهر؟"
                  : "Describe the issue clearly: What did you do? What happened? Any error messages?"}
                value={message}
                onChange={e => setMessage(e.target.value)}
                maxLength={3000}
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                type="submit"
                className="flex-1 h-9 text-sm bg-emerald-600 hover:bg-emerald-700"
                disabled={mutation.isPending}
                data-testid="button-submit-support"
              >
                {mutation.isPending ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" />{isAr ? "جاري الإرسال..." : "Sending..."}</>
                ) : (
                  isAr ? "إرسال البلاغ" : "Send Report"
                )}
              </Button>
              <Button type="button" variant="outline" className="h-9 text-sm" onClick={handleClose} data-testid="button-cancel-support">
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
