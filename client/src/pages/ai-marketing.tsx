import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Sparkles,
  Copy,
  Check,
  Hash,
  Clock,
  Megaphone,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Crown,
  Lock,
  BrainCircuit,
  ShoppingCart,
  AlertTriangle,
  ImageIcon,
  Download,
  RefreshCw,
} from "lucide-react";
import { SiTiktok } from "react-icons/si";

interface SocialContent {
  post: string;
  caption: string;
  hashtags: string[];
  callToAction: string;
  bestTimeToPost: string;
  contentType: string;
}

// Platforms included in paid plans
const platforms = [
  { id: "instagram", label: "Instagram", labelAr: "إنستغرام", icon: Instagram, color: "from-pink-500 to-purple-600" },
  { id: "twitter", label: "X / Twitter", labelAr: "إكس / تويتر", icon: Twitter, color: "from-gray-700 to-gray-900" },
  { id: "facebook", label: "Facebook", labelAr: "فيسبوك", icon: Facebook, color: "from-blue-600 to-blue-700" },
];

// Platforms not yet available in any plan — shown as "coming soon"
const comingSoonPlatforms = [
  { id: "tiktok", label: "TikTok", labelAr: "تيك توك", icon: SiTiktok },
  { id: "linkedin", label: "LinkedIn", labelAr: "لينكدإن", icon: Linkedin },
  { id: "youtube", label: "YouTube", labelAr: "يوتيوب", icon: Youtube },
];

// Platforms allowed per plan (mirrors server/routes.ts MARKETING_PLATFORMS)
const ALLOWED_PLATFORMS: Record<string, string[]> = {
  free: [],
  pro: ["instagram", "twitter"],
  business: ["instagram", "twitter", "facebook"],
};

const tones = [
  { id: "professional", label: "Professional", labelAr: "احترافي" },
  { id: "casual", label: "Casual", labelAr: "عفوي" },
  { id: "humorous", label: "Humorous", labelAr: "فكاهي" },
  { id: "inspirational", label: "Inspirational", labelAr: "ملهم" },
  { id: "urgent", label: "Urgent", labelAr: "عاجل" },
];

export default function AIMarketingPage() {
  const { language } = useAuth();
  const lang = language;
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const [topic, setTopic] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [result, setResult] = useState<SocialContent | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [postImageUrl, setPostImageUrl] = useState<string | null>(null);

  const { data: subscription } = useQuery<{ plan: string; credits: number; isAdmin?: boolean }>({
    queryKey: ["/api/subscription"],
  });

  const { data: creditsData } = useQuery<{ credits: number; plan: string; isAdmin?: boolean }>({
    queryKey: ["/api/credits"],
  });

  const isFreePlan = !subscription?.plan || subscription.plan === "free";
  const isAdmin = subscription?.isAdmin === true;
  const planName = subscription?.plan || "free";
  const needsUpgrade = isFreePlan && !isAdmin;
  const credits = creditsData?.credits ?? subscription?.credits ?? 0;
  const isLowCredits = !isAdmin && credits <= 5 && credits > 0;
  const noCredits = !isAdmin && credits <= 0 && !isFreePlan;

  // Compute allowed platforms for this user's plan
  const allowedPlatforms = isAdmin ? platforms.map((p) => p.id) : (ALLOWED_PLATFORMS[planName] ?? []);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/marketing/generate", {
        topic,
        platform: selectedPlatform,
        language: lang,
        tone: selectedTone,
      });
      if (!res.ok) {
        const err = await res.json();
        throw err;
      }
      return res.json();
    },
    onSuccess: (data: SocialContent) => {
      setResult(data);
      setPostImageUrl(null);
      qc.invalidateQueries({ queryKey: ["/api/credits"] });
      qc.invalidateQueries({ queryKey: ["/api/subscription"] });
      qc.invalidateQueries({ queryKey: ["/api/me"] });
      toast({
        title: lang === "ar" ? "تم إنشاء المحتوى!" : "Content generated!",
        description: lang === "ar" ? "تم خصم جلسة ذكاء واحدة من رصيدك." : "1 AI session deducted from your balance.",
      });
    },
    onError: (err: any) => {
      if (err?.message === "upgrade_required") {
        toast({
          title: lang === "ar" ? "يلزم الترقية" : "Upgrade Required",
          description: lang === "ar" ? err.messageAr : err.messageEn,
          variant: "destructive",
        });
      } else if (err?.message === "insufficient_credits") {
        toast({
          title: lang === "ar" ? "رصيدك منتهٍ" : "Credits Depleted",
          description: lang === "ar" ? err.messageAr : err.messageEn,
          variant: "destructive",
        });
        setTimeout(() => setLocation("/billing"), 1500);
      } else {
        toast({
          title: lang === "ar" ? "فشل إنشاء المحتوى" : "Failed to generate content",
          variant: "destructive",
        });
      }
    },
  });

  const imageMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/marketing/generate-image", {
        topic,
        platform: selectedPlatform,
        language: lang,
        postContent: result?.post,
      });
      if (!res.ok) {
        const err = await res.json();
        throw err;
      }
      return res.json() as Promise<{ url: string }>;
    },
    onSuccess: (data) => {
      setPostImageUrl(data.url);
      qc.invalidateQueries({ queryKey: ["/api/credits"] });
      qc.invalidateQueries({ queryKey: ["/api/subscription"] });
      qc.invalidateQueries({ queryKey: ["/api/me"] });
      toast({ title: lang === "ar" ? "تم توليد الصورة!" : "Image generated!", description: lang === "ar" ? "تم خصم جلستَي ذكاء (توليد الصور = 2 جلسات)." : "2 AI sessions deducted (image generation = 2 sessions)." });
    },
    onError: (err: any) => {
      toast({
        title: lang === "ar" ? "فشل توليد الصورة" : "Image generation failed",
        description: lang === "ar" ? (err.messageAr || "حاول مجدداً") : (err.messageEn || "Please try again"),
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-marketing-title">
            <Sparkles className="w-6 h-6 text-emerald-600" />
            {lang === "ar" ? "أداة التسويق بالذكاء الاصطناعي" : "AI Marketing Tool"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {lang === "ar"
              ? "أنشئ محتوى تسويقي احترافي لوسائل التواصل الاجتماعي بقوة الذكاء الاصطناعي"
              : "Generate professional social media marketing content powered by AI"}
          </p>
        </div>

        {needsUpgrade && (
          <Card className="p-8 border-2 border-dashed border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 text-center" data-testid="card-upgrade-marketing">
            <div className="flex flex-col items-center gap-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold flex items-center justify-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  {lang === "ar" ? "ميزة حصرية للخطط المدفوعة" : "Premium Feature"}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {lang === "ar"
                    ? "أداة التسويق بالذكاء الاصطناعي متاحة لمشتركي خطة برو وبزنس فقط. اشترك الآن للحصول على محتوى تسويقي احترافي لإنستغرام، فيسبوك، لينكدإن وأكثر."
                    : "AI Marketing Tool is available on Pro and Business plans. Upgrade to generate professional marketing content for Instagram, Facebook, LinkedIn, and more."}
                </p>
              </div>
              <div className="flex gap-3 mt-2">
                <Button
                  onClick={() => setLocation("/pricing")}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                  data-testid="button-upgrade-marketing"
                >
                  <Crown className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {lang === "ar" ? "اشترك الآن" : "Upgrade Now"}
                </Button>
                <Button variant="outline" onClick={() => setLocation("/dashboard")}>
                  {lang === "ar" ? "العودة للرئيسية" : "Go to Dashboard"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {noCredits && (
          <Card className="p-5 border-amber-300 bg-amber-50 dark:bg-amber-950/30" data-testid="card-no-credits-marketing">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-amber-800 dark:text-amber-200">
                  {lang === "ar" ? "انتهى رصيد جلسات الذكاء" : "AI Credits Depleted"}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                  {lang === "ar"
                    ? "اشحن رصيدك لمتابعة توليد المحتوى التسويقي. كل توليد يخصم جلسة ذكاء واحدة."
                    : "Top up your AI credits to continue generating marketing content. Each generation costs 1 session."}
                </p>
              </div>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shrink-0" onClick={() => setLocation("/billing")} data-testid="button-buy-credits-marketing">
                <ShoppingCart className="w-3.5 h-3.5 me-1.5" />
                {lang === "ar" ? "شراء رصيد" : "Buy Credits"}
              </Button>
            </div>
          </Card>
        )}

        <div className={`grid lg:grid-cols-2 gap-6 ${needsUpgrade ? "opacity-50 pointer-events-none select-none" : ""}`}>
          <div className="space-y-4">
            <Card className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {lang === "ar" ? "اختر المنصة" : "Select Platform"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {platforms.map((p) => {
                    const isLocked = !needsUpgrade && !isAdmin && !allowedPlatforms.includes(p.id);
                    const isActive = selectedPlatform === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (isLocked) {
                            setLocation("/billing");
                          } else {
                            setSelectedPlatform(p.id);
                          }
                        }}
                        title={
                          isLocked
                            ? lang === "ar"
                              ? `هذه المنصة غير متاحة في خطتك — قم بالترقية`
                              : `Not available in your plan — upgrade to unlock`
                            : undefined
                        }
                        className={`relative flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-sm ${
                          isLocked
                            ? "border-border opacity-50 cursor-not-allowed bg-muted"
                            : isActive
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                            : "border-border hover:border-emerald-300"
                        }`}
                        data-testid={`button-platform-${p.id}`}
                      >
                        {isLocked ? (
                          <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                        ) : (
                          <p.icon className="w-4 h-4 shrink-0" />
                        )}
                        <span className="truncate">{lang === "ar" ? p.labelAr : p.label}</span>
                        {isLocked && (
                          <Crown className="w-3 h-3 text-amber-500 absolute top-1 end-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {!isAdmin && !isFreePlan && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {lang === "ar"
                      ? planName === "pro"
                        ? "خطتك: Instagram + X/Twitter — قم بالترقية للأعمال لإضافة Facebook"
                        : "خطتك: Instagram + X/Twitter + Facebook"
                      : planName === "pro"
                        ? "Your plan: Instagram + X/Twitter — upgrade to Business to add Facebook"
                        : "Your plan: Instagram + X/Twitter + Facebook"
                    }
                  </p>
                )}
                {/* Coming soon platforms */}
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">
                    {lang === "ar" ? "قريباً:" : "Coming soon:"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {comingSoonPlatforms.map((p) => (
                      isAdmin ? (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPlatform(p.id)}
                          className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border-2 text-xs transition-all ${
                            selectedPlatform === p.id
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                              : "border-dashed border-border hover:border-emerald-300"
                          }`}
                          data-testid={`button-platform-${p.id}`}
                        >
                          <p.icon className="w-3 h-3" />
                          <span>{lang === "ar" ? p.labelAr : p.label}</span>
                          <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1 rounded font-medium">admin</span>
                        </button>
                      ) : (
                        <div
                          key={p.id}
                          title={lang === "ar" ? "قريباً — غير متاح حالياً" : "Coming soon — not yet available"}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-dashed border-border bg-muted/50 text-muted-foreground text-xs cursor-default select-none"
                          data-testid={`coming-soon-platform-${p.id}`}
                        >
                          <p.icon className="w-3 h-3 opacity-50" />
                          <span className="opacity-70">{lang === "ar" ? p.labelAr : p.label}</span>
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1 rounded font-medium">
                            {lang === "ar" ? "قريباً" : "soon"}
                          </span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {lang === "ar" ? "نبرة المحتوى" : "Content Tone"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {tones.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTone(t.id)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        selectedTone === t.id
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : "border-border hover:border-emerald-300"
                      }`}
                      data-testid={`button-tone-${t.id}`}
                    >
                      {lang === "ar" ? t.labelAr : t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {lang === "ar" ? "موضوع المحتوى" : "Content Topic"}
                </label>
                <Textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={
                    lang === "ar"
                      ? "مثال: إطلاق مجموعة عطور فاخرة جديدة في الرياض..."
                      : "e.g. Launching a new luxury perfume collection in Riyadh..."
                  }
                  className="min-h-[100px]"
                  data-testid="input-marketing-topic"
                />
              </div>

              <Button
                onClick={() => generateMutation.mutate()}
                disabled={!topic.trim() || generateMutation.isPending || noCredits}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                data-testid="button-generate-content"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 me-2 animate-spin" />
                    {lang === "ar" ? "جاري الإنشاء..." : "Generating..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 me-2" />
                    {lang === "ar" ? "إنشاء المحتوى" : "Generate Content"}
                    {!isAdmin && (
                      <span className="ms-2 text-xs opacity-75 flex items-center gap-0.5">
                        (<BrainCircuit className="w-3 h-3" /> 1)
                      </span>
                    )}
                  </>
                )}
              </Button>
            </Card>

            {!needsUpgrade && (
              <Card className="p-4" data-testid="card-credits-marketing">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-violet-600" />
                    <span className="text-sm font-medium">
                      {lang === "ar" ? "رصيد الذكاء المتبقي" : "Remaining AI Credits"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin ? (
                      <Badge className="bg-violet-600 text-white">∞</Badge>
                    ) : (
                      <Badge className={`${isLowCredits || noCredits ? "bg-red-500" : "bg-emerald-600"} text-white`}>
                        {credits}
                      </Badge>
                    )}
                    {!isAdmin && !isFreePlan && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => setLocation("/billing")}
                        data-testid="button-topup-credits"
                      >
                        <ShoppingCart className="w-3 h-3 me-1" />
                        {lang === "ar" ? "شراء رصيد" : "Buy Credits"}
                      </Button>
                    )}
                  </div>
                </div>
                {isLowCredits && (
                  <p className="text-xs text-amber-600 mt-2">
                    {lang === "ar"
                      ? `⚠️ رصيدك منخفض (${credits} جلسة متبقية). اشحن الآن قبل النفاذ.`
                      : `⚠️ Low credits (${credits} remaining). Top up before they run out.`}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {lang === "ar"
                    ? "• توليد محتوى نصي = جلسة ذكاء واحدة · توليد صورة البوست = جلستَان"
                    : "• Text content = 1 AI session · Post image generation = 2 AI sessions"}
                </p>
              </Card>
            )}
          </div>

          <div>
            {result ? (
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-emerald-600" />
                    {lang === "ar" ? "المحتوى المُنشأ" : "Generated Content"}
                  </h3>
                  <Badge variant="outline">{result.contentType}</Badge>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        {lang === "ar" ? "المنشور" : "Post"}
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(result.post, "post")}
                        data-testid="button-copy-post"
                      >
                        {copied === "post" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    <ScrollArea className="h-[120px]">
                      <p className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap" data-testid="text-generated-post">
                        {result.post}
                      </p>
                    </ScrollArea>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        {lang === "ar" ? "الوصف" : "Caption"}
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(result.caption, "caption")}
                        data-testid="button-copy-caption"
                      >
                        {copied === "caption" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    <p className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap" data-testid="text-generated-caption">
                      {result.caption}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {lang === "ar" ? "الهاشتاقات" : "Hashtags"}
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(result.hashtags.join(" "), "hashtags")}
                        data-testid="button-copy-hashtags"
                      >
                        {copied === "hashtags" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5" data-testid="text-generated-hashtags">
                      {result.hashtags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag.startsWith("#") ? tag : `#${tag}`}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {lang === "ar" ? "دعوة للعمل" : "Call to Action"}
                    </label>
                    <p className="text-sm bg-emerald-50 dark:bg-emerald-950 p-3 rounded-lg text-emerald-700 dark:text-emerald-300" data-testid="text-generated-cta">
                      {result.callToAction}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{lang === "ar" ? "أفضل وقت للنشر:" : "Best time to post:"}</span>
                    <span className="font-medium text-foreground">{result.bestTimeToPost}</span>
                  </div>

                  {/* WhatsApp share button */}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      [result.post, result.caption, result.hashtags.join(" ")].filter(Boolean).join("\n\n")
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full rounded-lg py-2.5 px-4 text-white font-semibold text-sm transition-all"
                    style={{ background: "#25D366" }}
                    data-testid="button-share-whatsapp"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    {lang === "ar" ? "مشاركة على واتساب" : "Share on WhatsApp"}
                  </a>
                </div>
              </Card>
            )}

            {/* ─── Standalone Image Generation Card (always visible) ─── */}
            {!needsUpgrade && (
              <Card className="p-5 space-y-4 mt-4" data-testid="card-image-generation">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-violet-600" />
                    {lang === "ar" ? "توليد صورة البوست" : "Post Image Generator"}
                  </h3>
                  <Badge variant="outline" className="text-violet-600 border-violet-300 text-xs">
                    DALL-E 3 · {lang === "ar" ? "2 جلسات" : "2 sessions"}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground">
                  {lang === "ar"
                    ? "أنشئ صورة مربعة احترافية مناسبة للنشر على منصات التواصل الاجتماعي. يمكنك توليدها قبل أو بعد توليد المحتوى النصي."
                    : "Generate a professional square image for social media posts. You can generate it before or after creating text content."}
                </p>

                <Button
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                  onClick={() => {
                    if (!topic.trim()) {
                      toast({
                        title: lang === "ar" ? "أدخل موضوع المحتوى أولاً" : "Enter a topic first",
                        description: lang === "ar" ? "اكتب موضوع المحتوى في الحقل على اليسار ثم اضغط توليد الصورة." : "Write a topic in the field on the left, then click Generate Image.",
                        variant: "destructive",
                      });
                      return;
                    }
                    imageMutation.mutate();
                  }}
                  disabled={imageMutation.isPending || noCredits}
                  data-testid="button-generate-post-image"
                >
                  {imageMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 me-2 animate-spin" />{lang === "ar" ? "جاري التوليد..." : "Generating..."}</>
                  ) : postImageUrl ? (
                    <><RefreshCw className="w-4 h-4 me-2" />{lang === "ar" ? "توليد صورة جديدة" : "Regenerate Image"}</>
                  ) : (
                    <><Sparkles className="w-4 h-4 me-2" />{lang === "ar" ? "توليد صورة البوست" : "Generate Post Image"}</>
                  )}
                </Button>

                {postImageUrl ? (
                  <div className="relative group rounded-xl overflow-hidden border border-border">
                    <img
                      src={postImageUrl}
                      alt="Generated post image"
                      className="w-full aspect-square object-cover"
                      data-testid="img-generated-post"
                    />
                    <a
                      href={postImageUrl}
                      download="post-image.png"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-3 end-3 flex items-center gap-1.5 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid="button-download-post-image"
                    >
                      <Download className="w-3 h-3" />
                      {lang === "ar" ? "تنزيل الصورة" : "Download Image"}
                    </a>
                  </div>
                ) : (
                  <div className="w-full aspect-square rounded-xl border-2 border-dashed border-violet-200 dark:border-violet-800 bg-violet-50/30 dark:bg-violet-950/10 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center opacity-20">
                      <ImageIcon className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-xs text-center px-6 leading-relaxed">
                      {lang === "ar"
                        ? "أدخل موضوع المحتوى أعلاه ثم اضغط «توليد صورة البوست» لإنشاء صورة مربعة احترافية"
                        : "Enter a content topic above, then click «Generate Post Image» to create a professional square image"}
                    </p>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
