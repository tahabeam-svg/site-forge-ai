import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Globe,
  Plus,
  ExternalLink,
  Shield,
  AlertCircle,
  CheckCircle2,
  Copy,
  Loader2,
} from "lucide-react";

interface Project {
  id: number;
  name: string;
  status: string;
}

export default function DomainsPage() {
  const { language } = useAuth();
  const lang = language;
  const [showAddDomain, setShowAddDomain] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const publishedProjects = projects.filter((p) => p.status === "published");

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-domains-title">
              <Globe className="w-6 h-6 text-emerald-600" />
              {lang === "ar" ? "النطاقات" : "Domains"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {lang === "ar" ? "إدارة نطاقات مواقعك المنشورة" : "Manage domains for your published websites"}
            </p>
          </div>
          <Button
            onClick={() => setShowAddDomain(!showAddDomain)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
            data-testid="button-add-domain"
          >
            <Plus className="w-4 h-4 me-1" />
            {lang === "ar" ? "إضافة نطاق" : "Add Domain"}
          </Button>
        </div>

        {showAddDomain && (
          <Card className="p-5 space-y-4 border-emerald-200 dark:border-emerald-800" data-testid="card-add-domain-form">
            <h3 className="font-semibold">
              {lang === "ar" ? "ربط نطاق مخصص" : "Connect Custom Domain"}
            </h3>
            <div className="flex gap-2">
              <Input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder={lang === "ar" ? "example.sa" : "example.sa"}
                className="flex-1"
                data-testid="input-custom-domain"
              />
              <Button className="bg-emerald-600" data-testid="button-connect-domain">
                {lang === "ar" ? "ربط" : "Connect"}
              </Button>
            </div>

            <div className="bg-muted rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                {lang === "ar" ? "إعدادات DNS المطلوبة" : "Required DNS Settings"}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-background rounded border">
                  <div>
                    <span className="text-muted-foreground">{lang === "ar" ? "النوع:" : "Type:"}</span>{" "}
                    <span className="font-mono font-medium">CNAME</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{lang === "ar" ? "القيمة:" : "Value:"}</span>{" "}
                    <span className="font-mono font-medium">proxy.arabyweb.net</span>
                    <Button variant="ghost" size="sm" className="ms-1 h-6 w-6 p-0" onClick={() => copyText("proxy.arabyweb.net")}>
                      {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-background rounded border">
                  <div>
                    <span className="text-muted-foreground">{lang === "ar" ? "النوع:" : "Type:"}</span>{" "}
                    <span className="font-mono font-medium">A</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{lang === "ar" ? "القيمة:" : "Value:"}</span>{" "}
                    <span className="font-mono font-medium">76.76.21.21</span>
                    <Button variant="ghost" size="sm" className="ms-1 h-6 w-6 p-0" onClick={() => copyText("76.76.21.21")}>
                      {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Badge variant="outline" className="text-xs">
              <Shield className="w-3 h-3 me-1" />
              {lang === "ar" ? "SSL مجاني يتم تفعيله تلقائياً" : "Free SSL automatically enabled"}
            </Badge>
          </Card>
        )}

        <Card className="p-5" data-testid="card-active-domains">
          <h3 className="font-semibold mb-4">
            {lang === "ar" ? "النطاقات النشطة" : "Active Domains"}
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
                    <Button variant="ghost" size="sm" data-testid={`button-visit-${project.id}`}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

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
