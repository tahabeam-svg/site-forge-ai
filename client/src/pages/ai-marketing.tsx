import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
  Zap,
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
  { id: "facebook", label: "Facebook", labelAr: "فيسبوك", icon: Facebook, color: "from-blue-600 to-blue-700" },
  { id: "linkedin", label: "LinkedIn", labelAr: "لينكدإن", icon: Linkedin, color: "from-blue-500 to-blue-600" },
  { id: "twitter", label: "X / Twitter", labelAr: "إكس / تويتر", icon: Twitter, color: "from-gray-700 to-gray-900" },
  { id: "tiktok", label: "TikTok", labelAr: "تيك توك", icon: SiTiktok, color: "from-gray-900 to-gray-800" },
  { id: "youtube", label: "YouTube", labelAr: "يوتيوب", icon: Youtube, color: "from-red-500 to-red-700" },
];

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
  const [topic, setTopic] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [result, setResult] = useState<SocialContent | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/marketing/generate", {
        topic,
        platform: selectedPlatform,
        language: lang,
        tone: selectedTone,
      });
      return res.json();
    },
    onSuccess: (data: SocialContent) => {
      setResult(data);
      toast({
        title: lang === "ar" ? "تم إنشاء المحتوى!" : "Content generated!",
      });
    },
    onError: () => {
      toast({
        title: lang === "ar" ? "فشل إنشاء المحتوى" : "Failed to generate content",
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

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {lang === "ar" ? "اختر المنصة" : "Select Platform"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {platforms.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlatform(p.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-sm ${
                        selectedPlatform === p.id
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                          : "border-border hover:border-emerald-300"
                      }`}
                      data-testid={`button-platform-${p.id}`}
                    >
                      <p.icon className="w-4 h-4" />
                      <span className="truncate">{lang === "ar" ? p.labelAr : p.label}</span>
                    </button>
                  ))}
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
                disabled={!topic.trim() || generateMutation.isPending}
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
                  </>
                )}
              </Button>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                {lang === "ar" ? "خطط التسويق" : "Marketing Plans"}
              </h3>
              <div className="space-y-3">
                {[
                  {
                    name: lang === "ar" ? "المبتدئ" : "Starter",
                    price: "$9",
                    posts: lang === "ar" ? "٢٠ منشور/شهر" : "20 posts/month",
                  },
                  {
                    name: lang === "ar" ? "النمو" : "Growth",
                    price: "$19",
                    posts: lang === "ar" ? "٦٠ منشور/شهر" : "60 posts/month",
                    popular: true,
                  },
                  {
                    name: lang === "ar" ? "احترافي" : "Pro Marketing",
                    price: "$39",
                    posts: lang === "ar" ? "غير محدود" : "Unlimited posts",
                  },
                ].map((plan, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      plan.popular ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950" : "border-border"
                    }`}
                    data-testid={`card-marketing-plan-${i}`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{plan.name}</span>
                        {plan.popular && (
                          <Badge className="bg-emerald-500 text-white text-xs">
                            {lang === "ar" ? "الأكثر شعبية" : "Popular"}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{plan.posts}</span>
                    </div>
                    <span className="font-bold text-emerald-600">{plan.price}/{lang === "ar" ? "شهر" : "mo"}</span>
                  </div>
                ))}
              </div>
            </Card>
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
