import { useState } from "react";
import { useSEO } from "@/hooks/use-seo";
import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";
import type { Template } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import { Crown, Sparkles, Loader2, ChevronLeft, ChevronRight, Lock } from "lucide-react";

type TemplateSummary = Omit<Template, "previewHtml" | "previewCss">;
type PaginatedTemplates = { data: TemplateSummary[]; total: number; page: number; limit: number };

const LIMIT = 24;

const categories = [
  "all", "corporate", "ecommerce", "exhibition", "restaurant", "startup", "portfolio",
  "medical", "realestate", "marketing", "consulting", "education", "construction",
  "logistics", "beauty", "fitness", "travel", "automotive", "legal", "nonprofit", "localservices"
] as const;

export default function TemplatesPage() {
  const { language, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const lang = language;
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [loadingTemplateId, setLoadingTemplateId] = useState<number | null>(null);
  const isAr = lang !== "en";

  useSEO({
    title: isAr ? "قوالب مواقع مجانية احترافية - مطاعم، متاجر، شركات" : "Free Professional Website Templates - Restaurants, Stores, Companies",
    description: isAr
      ? "اختر من أكثر من 50 قالب موقع إلكتروني مجاني احترافي: مطاعم، متاجر إلكترونية، شركات، عيادات، ومزيد. صمم موقعك في دقيقتين بالذكاء الاصطناعي."
      : "Choose from 50+ free professional website templates: restaurants, online stores, companies, clinics, and more. Build your site in 2 minutes with AI.",
    keywords: isAr
      ? "قوالب مواقع مجانية، قالب موقع مطعم، قالب متجر الكتروني، قالب موقع شركة، تصميم مواقع مجاني، قوالب عربية"
      : "free website templates Arabic, restaurant website template, store template, company website template",
    lang: isAr ? "ar" : "en",
  });

  const { data: meData } = useQuery<{ plan: string }>({
    queryKey: ["/api/me"],
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
  const userPlan = meData?.plan || "free";
  const isFree = userPlan === "free";

  const categoryParam = activeCategory !== "all" ? `&category=${activeCategory}` : "";
  const queryKey = [`/api/templates?summary=true&page=${page}&limit=${LIMIT}${categoryParam}`];

  const { data, isLoading } = useQuery<PaginatedTemplates>({
    queryKey,
  });

  const templates = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setPage(1);
  };

  const createFromTemplate = useMutation({
    mutationFn: async (templateId: number) => {
      setLoadingTemplateId(templateId);
      const fullRes = await fetch(`/api/templates/${templateId}`);
      const fullTemplate: Template = await fullRes.json();

      const res = await apiRequest("POST", "/api/projects", {
        name: lang === "ar" && fullTemplate.nameAr ? fullTemplate.nameAr : fullTemplate.name,
        description: lang === "ar" && fullTemplate.descriptionAr ? fullTemplate.descriptionAr : fullTemplate.description,
        templateId: fullTemplate.id,
      });
      const project = await res.json();

      await apiRequest("PUT", `/api/projects/${project.id}`, {
        generatedHtml: fullTemplate.previewHtml,
        generatedCss: fullTemplate.previewCss,
        status: "generated",
      });

      return project;
    },
    onSuccess: (project) => {
      setLoadingTemplateId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      navigate(`/editor/${project.id}`);
    },
    onError: (err: Error) => {
      setLoadingTemplateId(null);
      toast({ title: t("error", lang), description: err.message, variant: "destructive" });
    },
  });

  const categoryLabel = (cat: string) => {
    const key = cat as keyof ReturnType<typeof t>;
    return t(key as any, lang) || cat;
  };

  const handleUseTemplate = (template: TemplateSummary) => {
    if (!isAuthenticated) {
      toast({
        title: isAr ? "سجّل دخولك أولاً" : "Please login first",
        description: isAr ? "يجب تسجيل الدخول لاستخدام القوالب" : "You need to login to use templates",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    if (isFree && template.isPremium) {
      toast({
        title: isAr ? "🔒 قالب مميز" : "🔒 Premium Template",
        description: isAr ? "هذا القالب متاح للمشتركين في الخطة المدفوعة فقط. قم بالترقية للوصول إليه." : "This template is for paid plan subscribers only. Upgrade to access it.",
        variant: "destructive",
      });
      navigate("/billing");
      return;
    }
    createFromTemplate.mutate(template.id);
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" data-testid="text-templates-title">
            {t("templates", lang)}
          </h1>
          <p className="text-muted-foreground">
            {isAr
              ? `اختر من ${total} قالب احترافي للبدء بسرعة أو استخدم الذكاء الاصطناعي لإنشاء تصميم فريد`
              : `Choose from ${total} professional templates or use AI to create a unique design`}
          </p>
          {isFree && isAuthenticated && (
            <div className="mt-3 flex items-center gap-2 text-xs bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 text-amber-700 dark:text-amber-400">
              <Crown className="w-3.5 h-3.5 shrink-0" />
              <span>{isAr ? "القوالب المميزة 🔒 متاحة للخطط المدفوعة فقط." : "Premium templates 🔒 are for paid plans only."}</span>
              <button onClick={() => navigate("/billing")} className="underline font-semibold ms-1">
                {isAr ? "اشترك الآن" : "Upgrade"}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(cat)}
              data-testid={`button-category-${cat}`}
            >
              {categoryLabel(cat)}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {templates.map((template, i) => {
                const isPremiumLocked = isFree && template.isPremium;
                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.4) }}
                  >
                    <Card className={`hover-elevate group ${isPremiumLocked ? "opacity-85" : ""}`} data-testid={`card-template-${template.id}`}>
                      <div className="relative h-48 bg-muted rounded-t-lg overflow-hidden">
                        {template.thumbnail ? (
                          <img
                            src={template.thumbnail}
                            alt={isAr && template.nameAr ? template.nameAr : template.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            data-testid={`img-template-${template.id}`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-900">
                            <Sparkles className="w-12 h-12 text-emerald-400 opacity-40" />
                          </div>
                        )}
                        {template.isPremium && (
                          <div className="absolute top-3 right-3 z-10">
                            <Badge className="bg-amber-500/90 text-white">
                              <Crown className="w-3 h-3 me-1" />
                              {t("premium", lang)}
                            </Badge>
                          </div>
                        )}
                        {isPremiumLocked && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-[1px]">
                            <div className="bg-white/90 dark:bg-black/80 rounded-full p-2">
                              <Lock className="w-5 h-5 text-amber-600" />
                            </div>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-1" data-testid={`text-template-name-${template.id}`}>
                          {isAr && template.nameAr ? template.nameAr : template.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {isAr && template.descriptionAr ? template.descriptionAr : template.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {categoryLabel(template.category)}
                          </Badge>
                          <Button
                            size="sm"
                            className={`ms-auto ${isPremiumLocked ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}`}
                            onClick={() => handleUseTemplate(template)}
                            disabled={loadingTemplateId !== null}
                            data-testid={`button-use-template-${template.id}`}
                          >
                            {loadingTemplateId === template.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : isPremiumLocked ? (
                              <>
                                <Lock className="w-3.5 h-3.5 me-1" />
                                {isAr ? "ترقية" : "Upgrade"}
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 me-1" />
                                {t("selectTemplate", lang)}
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === 1}
                  data-testid="button-prev-page"
                >
                  <ChevronRight className="w-4 h-4" />
                  {isAr ? "السابق" : "Prev"}
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  {isAr ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === totalPages}
                  data-testid="button-next-page"
                >
                  {isAr ? "التالي" : "Next"}
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
