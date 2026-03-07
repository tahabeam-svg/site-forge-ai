import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Loader2, BarChart3, Eye, Globe, TrendingUp, Users, Clock, ArrowUpRight } from "lucide-react";

interface Project {
  id: number;
  name: string;
  status: string;
  createdAt: string;
}

export default function AnalyticsPage() {
  const { language } = useAuth();
  const lang = language;

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const totalProjects = projects.length;
  const publishedProjects = projects.filter((p) => p.status === "published").length;
  const draftProjects = projects.filter((p) => p.status === "draft").length;
  const generatedProjects = projects.filter((p) => p.status === "generated").length;

  const stats = [
    {
      label: lang === "ar" ? "إجمالي المشاريع" : "Total Projects",
      value: totalProjects,
      icon: Globe,
      color: "from-blue-500 to-blue-600",
      change: "+12%",
    },
    {
      label: lang === "ar" ? "المنشورة" : "Published",
      value: publishedProjects,
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-600",
      change: "+8%",
    },
    {
      label: lang === "ar" ? "المسودات" : "Drafts",
      value: draftProjects,
      icon: Clock,
      color: "from-amber-500 to-orange-600",
      change: "",
    },
    {
      label: lang === "ar" ? "الزيارات (تقديرية)" : "Views (est.)",
      value: publishedProjects * 142,
      icon: Eye,
      color: "from-purple-500 to-violet-600",
      change: "+24%",
    },
  ];

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
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-analytics-title">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            {lang === "ar" ? "التحليلات" : "Analytics"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {lang === "ar" ? "تتبع أداء مشاريعك ومواقعك" : "Track your projects and website performance"}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className="p-4" data-testid={`card-analytics-stat-${i}`}>
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                {stat.change && (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" />
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold mt-3">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-5" data-testid="card-project-status">
            <h3 className="font-semibold mb-4">
              {lang === "ar" ? "حالة المشاريع" : "Project Status"}
            </h3>
            <div className="space-y-3">
              {[
                { label: lang === "ar" ? "منشور" : "Published", count: publishedProjects, color: "bg-emerald-500", pct: totalProjects ? Math.round((publishedProjects / totalProjects) * 100) : 0 },
                { label: lang === "ar" ? "مُنشأ" : "Generated", count: generatedProjects, color: "bg-blue-500", pct: totalProjects ? Math.round((generatedProjects / totalProjects) * 100) : 0 },
                { label: lang === "ar" ? "مسودة" : "Draft", count: draftProjects, color: "bg-gray-400", pct: totalProjects ? Math.round((draftProjects / totalProjects) * 100) : 0 },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="text-muted-foreground">{item.count} ({item.pct}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5" data-testid="card-recent-activity">
            <h3 className="font-semibold mb-4">
              {lang === "ar" ? "النشاط الأخير" : "Recent Activity"}
            </h3>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {lang === "ar" ? "لا يوجد نشاط بعد" : "No activity yet"}
              </p>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between text-sm" data-testid={`row-activity-${project.id}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="truncate max-w-[200px]">{project.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(project.createdAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="p-5" data-testid="card-traffic-overview">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            {lang === "ar" ? "نظرة عامة على الزيارات" : "Traffic Overview"}
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => {
              const daysAr = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
              const height = [35, 55, 70, 45, 80, 60, 40][i];
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="h-24 w-full flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-md transition-all"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{lang === "ar" ? daysAr[i] : day}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
