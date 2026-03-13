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

const platforms = [
  { id: "instagram", label: "Instagram", labelAr: "إنستغرام", icon: Instagram, color: "from-pink-500 to-purple-600" },
  { id: "tiktok", label: "TikTok", labelAr: "تيك توك", icon: SiTiktok, color: "from-gray-900 to-gray-800" },
  { id: "facebook", label: "Facebook", labelAr: "فيسبوك", icon: Facebook, color: "from-blue-600 to-blue-700" },
  { id: "twitter", label: "X / Twitter", labelAr: "إكس / تويتر", icon: Twitter, color: "from-gray-700 to-gray-900" },
  { id: "linkedin", label: "LinkedIn", labelAr: "لينكدإن", icon: Linkedin, color: "from-blue-500 to-blue-600" },
  { id: "youtube", label: "YouTube", labelAr: "يوتيوب", icon: Youtube, color: "from-red-500 to-red-700" },
];

// Platforms allowed per plan (mirrors server/routes.ts MARKETING_PLATFORMS)
const ALLOWED_PLATFORMS: Record<string, string[]> = {
  free: [],
  pro: ["instagram", "tiktok"],
  business: ["instagram", "tiktok", "facebook"],
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
                        ? "خطتك: Instagram + TikTok — قم بالترقية للأعمال لإضافة Facebook"
                        : "خطتك: Instagram + TikTok + Facebook"
                      : planName === "pro"
                        ? "Your plan: Instagram + TikTok — upgrade to Business to add Facebook"
                        : "Your plan: Instagram + TikTok + Facebook"
                    }
                  </p>
                )}
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
                    ? "• كل توليد محتوى تسويقي يخصم جلسة ذكاء واحدة من رصيدك المشترك مع منشئ المواقع"
                    : "• Each marketing content generation costs 1 AI session, shared with the website builder"}
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
                </div>
              </Card>
            ) : (
              <Card className="p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {lang === "ar" ? "أنشئ محتوى تسويقي مذهل" : "Create Amazing Marketing Content"}
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  {lang === "ar"
                    ? "اختر المنصة، حدد النبرة، واكتب موضوعك — الذكاء الاصطناعي سيتولى الباقي"
                    : "Choose a platform, select a tone, and write your topic — AI will do the rest"}
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
