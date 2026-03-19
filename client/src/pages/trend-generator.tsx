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
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Sparkles,
  TrendingUp,
  Crown,
  Lock,
  BrainCircuit,
  Hash,
  Megaphone,
  Clock,
  Copy,
  Check,
  Target,
  Lightbulb,
  ShoppingCart,
} from "lucide-react";

interface TrendIdea {
  title: string;
  hook: string;
  caption: string;
  hashtags: string[];
  contentType: string;
  bestPlatform: string;
  bestTimeToPost: string;
  whyItWorks: string;
  engagementTip: string;
}

interface TrendResult {
  niche: string;
  trends: TrendIdea[];
  generatedAt: string;
}

export default function TrendGeneratorPage() {
  const { language } = useAuth();
  const lang = language;
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const [niche, setNiche] = useState("");
  const [result, setResult] = useState<TrendResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const { data: subscription } = useQuery<{ plan: string; credits: number; isAdmin?: boolean }>({
    queryKey: ["/api/subscription"],
  });

  const { data: creditsData } = useQuery<{ credits: number; plan: string; isAdmin?: boolean }>({
    queryKey: ["/api/credits"],
  });

  const planName = subscription?.plan || "free";
  const isAdmin = subscription?.isAdmin === true;
  const isBusinessOrAdmin = isAdmin || planName === "business";
  const credits = creditsData?.credits ?? subscription?.credits ?? 0;
  const noCredits = !isAdmin && credits <= 0 && planName !== "free";

  const trendMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/marketing/trend", {
        niche,
        language: lang,
      });
      if (!res.ok) {
        const err = await res.json();
        throw err;
      }
      return res.json();
    },
    onSuccess: (data: TrendResult) => {
      setResult(data);
      qc.invalidateQueries({ queryKey: ["/api/credits"] });
      qc.invalidateQueries({ queryKey: ["/api/subscription"] });
      qc.invalidateQueries({ queryKey: ["/api/me"] });
      toast({
        title: lang === "ar" ? "تم إنشاء أفكار الترند!" : "Trend ideas generated!",
        description: lang === "ar" ? "تم خصم 2 جلسة ذكاء من رصيدك." : "2 AI sessions deducted from your balance.",
      });
    },
    onError: (err: any) => {
      if (err?.message === "upgrade_required") {
        toast({
          title: lang === "ar" ? "يلزم باقة Business" : "Business Plan Required",
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
          title: lang === "ar" ? "فشل إنشاء أفكار الترند" : "Failed to generate trends",
          variant: "destructive",
        });
      }
    },
  });

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!isBusinessOrAdmin) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-2xl mx-auto">
          <Card className="p-8 text-center space-y-4 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold" data-testid="text-upgrade-title">
              {lang === "ar" ? "مولّد الترند السعودي" : "Saudi Trend Generator"}
            </h2>
            <p className="text-muted-foreground">
              {lang === "ar"
                ? "هذه الأداة حصرية لباقة Business — تُنشئ 3 أفكار ترند جاهزة مصمَّمة للسوق السعودي والخليجي."
                : "This tool is exclusive to the Business plan — generates 3 ready-to-use trend ideas designed for the Saudi & Gulf market."}
            </p>
            <div className="grid grid-cols-1 gap-3 text-sm text-start bg-white dark:bg-card rounded-xl p-4 border border-amber-200 dark:border-amber-800">
              {[
                lang === "ar" ? "3 أفكار ترند جاهزة في ثوانٍ" : "3 ready trend ideas in seconds",
                lang === "ar" ? "خطاف جذاب + كابشن + هاشتاقات" : "Viral hook + caption + hashtags",
                lang === "ar" ? "مصمم للسوق السعودي والخليجي" : "Designed for Saudi & Gulf market",
                lang === "ar" ? "أفضل وقت نشر + نصائح تفاعل" : "Best posting time + engagement tips",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                onClick={() => setLocation("/billing")}
                data-testid="button-upgrade-business"
              >
                <Crown className="w-4 h-4 me-2" />
                {lang === "ar" ? "الترقية إلى Business" : "Upgrade to Business"}
              </Button>
              <Button variant="outline" onClick={() => setLocation("/ai-marketing")} data-testid="button-back-marketing">
                {lang === "ar" ? "العودة للتسويق" : "Back to Marketing"}
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-trend-title">
              <TrendingUp className="w-6 h-6 text-amber-500" />
              {lang === "ar" ? "مولّد الترند السعودي" : "Saudi Trend Generator"}
            </h1>
            <Badge className="bg-amber-500 text-white">
              <Crown className="w-3 h-3 me-1" />
              Business
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {lang === "ar"
              ? "أدخل مجالك واحصل على 3 أفكار ترند جاهزة مصمَّمة للسوق السعودي والخليجي"
              : "Enter your niche and get 3 ready-to-use trend ideas designed for the Saudi & Gulf market"}
          </p>
        </div>

        <Card className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {lang === "ar" ? "مجال نشاطك التجاري" : "Your Business Niche"}
            </label>
            <Textarea
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder={
                lang === "ar"
                  ? "مثال: مطعم مأكولات بحرية في جدة، أو متجر عباءات فاخرة في الرياض..."
                  : "e.g. Seafood restaurant in Jeddah, or luxury abayas store in Riyadh..."
              }
              className="min-h-[100px]"
              data-testid="input-trend-niche"
            />
          </div>
          <Button
            onClick={() => trendMutation.mutate()}
            disabled={!niche.trim() || trendMutation.isPending || noCredits}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white"
            data-testid="button-generate-trends"
          >
            {trendMutation.isPending ? (
              <><Loader2 className="w-4 h-4 me-2 animate-spin" />{lang === "ar" ? "جاري توليد أفكار الترند..." : "Generating trend ideas..."}</>
            ) : (
              <>
                <Sparkles className="w-4 h-4 me-2" />
                {lang === "ar" ? "توليد 3 أفكار ترند" : "Generate 3 Trend Ideas"}
                {!isAdmin && <span className="ms-2 text-xs opacity-75 flex items-center gap-0.5">(<BrainCircuit className="w-3 h-3" /> 2)</span>}
              </>
            )}
          </Button>
        </Card>

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-lg">
                {lang === "ar" ? "أفكار الترند لمجال: " : "Trend ideas for: "}
                <span className="text-amber-600">{result.niche}</span>
              </h2>
            </div>
            {result.trends?.map((trend, idx) => (
              <Card key={idx} className="p-5 space-y-4 border-amber-200 dark:border-amber-800/50" data-testid={`card-trend-${idx}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{idx + 1}</span>
                    </div>
                    <h3 className="font-semibold" data-testid={`text-trend-title-${idx}`}>{trend.title}</h3>
                  </div>
                  <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs shrink-0">
                    {trend.contentType}
                  </Badge>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
                    🎣 {lang === "ar" ? "الخطاف الجذاب:" : "Viral Hook:"}
                  </p>
                  <p className="text-sm font-medium" data-testid={`text-trend-hook-${idx}`}>{trend.hook}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Megaphone className="w-3 h-3" />
                      {lang === "ar" ? "الكابشن:" : "Caption:"}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(trend.caption, `caption-${idx}`)}
                      data-testid={`button-copy-caption-${idx}`}
                    >
                      {copied === `caption-${idx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                  <p className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap" data-testid={`text-trend-caption-${idx}`}>
                    {trend.caption}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {lang === "ar" ? "الهاشتاقات:" : "Hashtags:"}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(trend.hashtags?.join(" "), `hashtags-${idx}`)}
                      data-testid={`button-copy-hashtags-${idx}`}
                    >
                      {copied === `hashtags-${idx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5" data-testid={`text-trend-hashtags-${idx}`}>
                    {trend.hashtags?.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag.startsWith("#") ? tag : `#${tag}`}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                    <Target className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">{lang === "ar" ? "أفضل منصة:" : "Best Platform:"}</p>
                      <p className="font-medium">{trend.bestPlatform}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">{lang === "ar" ? "أفضل وقت نشر:" : "Best Post Time:"}</p>
                      <p className="font-medium">{trend.bestTimeToPost}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3">
                    <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        {lang === "ar" ? "لماذا سينجح هذا الترند:" : "Why This Will Work:"}
                      </p>
                      <p className="text-sm mt-0.5" data-testid={`text-trend-why-${idx}`}>{trend.whyItWorks}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                    <BrainCircuit className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
                        {lang === "ar" ? "نصيحة زيادة التفاعل:" : "Engagement Tip:"}
                      </p>
                      <p className="text-sm mt-0.5">{trend.engagementTip}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
