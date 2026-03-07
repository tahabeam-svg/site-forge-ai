import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  Globe,
  LayoutTemplate,
  TrendingUp,
  Loader2,
  Eye,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  publishedProjects: number;
}

interface AdminUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: string | null;
}

interface AdminProject {
  id: number;
  userId: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
}

export default function AdminPage() {
  const { language } = useAuth();
  const lang = language;

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery<AdminProject[]>({
    queryKey: ["/api/admin/projects"],
  });

  const statCards = [
    {
      label: lang === "ar" ? "المستخدمين" : "Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: lang === "ar" ? "المشاريع" : "Projects",
      value: stats?.totalProjects || 0,
      icon: Globe,
      color: "from-emerald-500 to-teal-600",
    },
    {
      label: lang === "ar" ? "المنشورة" : "Published",
      value: stats?.publishedProjects || 0,
      icon: TrendingUp,
      color: "from-purple-500 to-violet-600",
    },
    {
      label: lang === "ar" ? "القوالب" : "Templates",
      value: 6,
      icon: LayoutTemplate,
      color: "from-amber-500 to-orange-600",
    },
  ];

  const statusLabel = (status: string) => {
    if (lang === "ar") {
      switch (status) {
        case "draft": return "مسودة";
        case "generating": return "قيد الإنشاء";
        case "generated": return "مُنشأ";
        case "published": return "منشور";
        case "error": return "خطأ";
        default: return status;
      }
    }
    return status;
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-emerald-100 text-emerald-700";
      case "generated": return "bg-blue-100 text-blue-700";
      case "draft": return "bg-gray-100 text-gray-700";
      case "error": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (statsLoading) {
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
          <h1 className="text-2xl font-bold" data-testid="text-admin-title">
            {lang === "ar" ? "لوحة الإدارة" : "Admin Dashboard"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {lang === "ar" ? "إدارة المنصة والمستخدمين" : "Platform management and analytics"}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <Card key={i} className="p-4" data-testid={`card-stat-${i}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users" data-testid="tab-admin-users">
              <Users className="w-4 h-4 me-1" />
              {lang === "ar" ? "المستخدمين" : "Users"}
            </TabsTrigger>
            <TabsTrigger value="projects" data-testid="tab-admin-projects">
              <Globe className="w-4 h-4 me-1" />
              {lang === "ar" ? "المشاريع" : "Projects"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <ScrollArea className="h-[400px]">
                <div className="divide-y">
                  {usersLoading ? (
                    <div className="p-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </div>
                  ) : users.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      {lang === "ar" ? "لا يوجد مستخدمين" : "No users found"}
                    </div>
                  ) : (
                    users.map((user, i) => (
                      <div key={user.id} className="flex items-center justify-between p-4" data-testid={`row-user-${i}`}>
                        <div className="flex items-center gap-3">
                          {user.profileImageUrl ? (
                            <img src={user.profileImageUrl} alt="" className="w-8 h-8 rounded-full" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                              <Users className="w-4 h-4 text-emerald-700" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              {user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : (user.email || user.id.slice(0, 8))}
                            </p>
                            <p className="text-xs text-muted-foreground">{user.email || "—"}</p>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <ScrollArea className="h-[400px]">
                <div className="divide-y">
                  {projectsLoading ? (
                    <div className="p-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </div>
                  ) : projects.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      {lang === "ar" ? "لا توجد مشاريع" : "No projects found"}
                    </div>
                  ) : (
                    projects.map((project, i) => (
                      <div key={project.id} className="flex items-center justify-between p-4" data-testid={`row-project-${i}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <Globe className="w-4 h-4 text-emerald-700" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{project.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {project.description?.slice(0, 50) || "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={`text-xs ${statusColor(project.status)}`}>
                            {statusLabel(project.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
