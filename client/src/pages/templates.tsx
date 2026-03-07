import { useState } from "react";
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
import { Crown, Sparkles, Loader2 } from "lucide-react";

const categories = [
  "all", "corporate", "ecommerce", "exhibition", "restaurant", "startup", "portfolio",
  "medical", "realestate", "marketing", "consulting", "education", "construction",
  "logistics", "beauty", "fitness", "travel", "automotive", "legal", "nonprofit", "localservices"
] as const;

export default function TemplatesPage() {
  const { language } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const lang = language;
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const createFromTemplate = useMutation({
    mutationFn: async (template: Template) => {
      const res = await apiRequest("POST", "/api/projects", {
        name: lang === "ar" && template.nameAr ? template.nameAr : template.name,
        description: lang === "ar" && template.descriptionAr ? template.descriptionAr : template.description,
        templateId: template.id,
      });
      const project = await res.json();

      await apiRequest("PUT", `/api/projects/${project.id}`, {
        generatedHtml: template.previewHtml,
        generatedCss: template.previewCss,
        status: "generated",
      });

      return project;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      navigate(`/editor/${project.id}`);
    },
    onError: (err: Error) => {
      toast({ title: t("error", lang), description: err.message, variant: "destructive" });
    },
  });

  const filtered = activeCategory === "all"
    ? templates
    : templates.filter((t) => t.category === activeCategory);

  const categoryLabel = (cat: string) => {
    const key = cat as keyof ReturnType<typeof t>;
    return t(key as any, lang) || cat;
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" data-testid="text-templates-title">
            {t("templates", lang)}
          </h1>
          <p className="text-muted-foreground">
            {lang === "ar"
              ? "اختر قالباً للبدء بسرعة أو استخدم الذكاء الاصطناعي لإنشاء تصميم فريد"
              : "Choose a template to start quickly or use AI to create a unique design"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((template, i) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.5) }}
              >
                <Card className="hover-elevate group" data-testid={`card-template-${template.id}`}>
                  <div className="relative h-48 bg-muted rounded-t-lg overflow-hidden">
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={lang === "ar" && template.nameAr ? template.nameAr : template.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        data-testid={`img-template-${template.id}`}
                      />
                    ) : template.previewHtml ? (
                      <div className="absolute inset-0 p-2 overflow-hidden pointer-events-none">
                        <iframe
                          srcDoc={template.previewHtml?.startsWith('<!DOCTYPE')
                            ? template.previewHtml.replace('</head>', `<style>body{transform:scale(0.25);transform-origin:top left;width:400%;height:400%;}</style></head>`)
                            : `<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,sans-serif;transform:scale(0.35);transform-origin:top left;width:285%;height:285%}${template.previewCss||""}</style></head><body>${template.previewHtml}</body></html>`
                          }
                          className="w-full h-full rounded bg-white border-0"
                          sandbox="allow-same-origin"
                          title="Template preview"
                        />
                      </div>
                    ) : null}
                    {template.isPremium && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-amber-500/90 text-white">
                          <Crown className="w-3 h-3 me-1" />
                          {t("premium", lang)}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1" data-testid={`text-template-name-${template.id}`}>
                      {lang === "ar" && template.nameAr ? template.nameAr : template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {lang === "ar" && template.descriptionAr ? template.descriptionAr : template.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {categoryLabel(template.category)}
                      </Badge>
                      <Button
                        size="sm"
                        className="ms-auto"
                        onClick={() => createFromTemplate.mutate(template)}
                        disabled={createFromTemplate.isPending}
                        data-testid={`button-use-template-${template.id}`}
                      >
                        {createFromTemplate.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
