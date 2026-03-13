import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Lock,
  Shield,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Clock,
} from "lucide-react";

interface Project {
  id: number;
  name: string;
  status: string;
}

export default function DomainsPage() {
  const { language } = useAuth();
  const lang = language;

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const publishedProjects = projects.filter((p) => p.status === "published");

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-domains-title">
              <Globe className="w-6 h-6 text-emerald-600" />
              {lang === "ar" ? "النطاقات" : "Domains"}
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-[11px] px-2 py-0.5 ms-1">
                <Clock className="w-3 h-3 me-1" />
                {lang === "ar" ? "قريباً" : "Coming Soon"}
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-1">
              {lang === "ar" ? "إدارة نطاقات مواقعك المنشورة" : "Manage domains for your published websites"}
            </p>
          </div>

          <Button
            disabled
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white opacity-50 cursor-not-allowed"
            data-testid="button-add-domain"
          >
            <Lock className="w-4 h-4 me-1" />
            {lang === "ar" ? "إضافة نطاق" : "Add Domain"}
          </Button>
        </div>

        {/* Coming Soon Banner */}
        <Card className="p-6 border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30" data-testid="card-coming-soon">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-amber-800 dark:text-amber-300">
                {lang === "ar" ? "ميزة النطاقات المخصصة قادمة قريباً!" : "Custom Domains Feature Coming Soon!"}
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                {lang === "ar"
                  ? "نعمل حالياً على تفعيل ميزة ربط النطاقات المخصصة (.sa، .com، .net) مع شهادة SSL مجانية. سيتم الإشعار فور الإطلاق."
                  : "We're currently working on enabling custom domain connections (.sa, .com, .net) with free SSL certificates. You'll be notified upon launch."}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {(lang === "ar"
                  ? ["ربط نطاق مخصص", "SSL مجاني", "إدارة DNS تلقائية", "نطاقات .sa"]
                  : ["Custom domain linking", "Free SSL", "Automatic DNS management", ".sa domains"]
                ).map((feat) => (
                  <Badge key={feat} variant="outline" className="text-xs border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400">
                    {feat}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Active Domains (preview — locked) */}
        <Card className="p-5 opacity-60 select-none" data-testid="card-active-domains">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            {lang === "ar" ? "النطاقات النشطة" : "Active Domains"}
            <Lock className="w-4 h-4 text-muted-foreground" />
          </h3>
          {publishedProjects.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {lang === "ar"
                  ? "لا توجد مواقع منشورة بعد. انشر موقعاً للحصول على نطاق."
                  : "No published websites yet. Publish a site to get a domain."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {publishedProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                  data-testid={`row-domain-${project.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {project.name.toLowerCase().replace(/\s+/g, "-")}.arabyweb.net
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3 me-1" />
                      {lang === "ar" ? "نشط" : "Active"}
                    </Badge>
                    <Button variant="ghost" size="sm" disabled data-testid={`button-visit-${project.id}`}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upgrade card */}
        <Card className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800" data-testid="card-domain-upgrade">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">
                {lang === "ar" ? "نطاقات مخصصة متاحة في الخطة الاحترافية" : "Custom domains available on Pro plan"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {lang === "ar"
                  ? "قم بالترقية لربط نطاقك المخصص (.sa, .com) مع شهادة SSL مجانية"
                  : "Upgrade to connect your custom domain (.sa, .com) with free SSL certificate"}
              </p>
              <Button size="sm" className="mt-3 bg-emerald-600" data-testid="button-upgrade-domains">
                {lang === "ar" ? "ترقية الآن" : "Upgrade Now"}
              </Button>
            </div>
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
}
