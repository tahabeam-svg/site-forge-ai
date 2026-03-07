import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Globe,
  LayoutTemplate,
  TrendingUp,
  Loader2,
  Ticket,
  Trash2,
  Plus,
  Ban,
  Percent,
  DollarSign,
  Calendar,
  Hash,
  CheckCircle2,
  XCircle,
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

interface Coupon {
  id: number;
  code: string;
  discountType: string;
  discountValue: number;
  maxUses: number | null;
  usedCount: number | null;
  expiresAt: string | null;
  isActive: boolean | null;
  createdAt: string;
}

export default function AdminPage() {
  const { language } = useAuth();
  const lang = language;
  const { toast } = useToast();

  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: adminUsers = [], isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery<AdminProject[]>({
    queryKey: ["/api/admin/projects"],
  });

  const { data: couponsData = [], isLoading: couponsLoading } = useQuery<Coupon[]>({
    queryKey: ["/api/admin/coupons"],
  });

  const createCouponMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/coupons", {
        code: couponCode,
        discountType,
        discountValue: parseInt(discountValue),
        maxUses: maxUses ? parseInt(maxUses) : 0,
        expiresAt: expiresAt || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      setShowAddCoupon(false);
      setCouponCode("");
      setDiscountValue("");
      setMaxUses("");
      setExpiresAt("");
      toast({ title: lang === "ar" ? "تم إنشاء الكوبون" : "Coupon created" });
    },
    onError: () => {
      toast({ title: lang === "ar" ? "فشل إنشاء الكوبون" : "Failed to create coupon", variant: "destructive" });
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/coupons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({ title: lang === "ar" ? "تم حذف الكوبون" : "Coupon deleted" });
    },
  });

  const suspendUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("PATCH", `/api/admin/users/${userId}/suspend`);
    },
    onSuccess: () => {
      toast({ title: lang === "ar" ? "تم إيقاف المستخدم" : "User suspended" });
    },
  });

  const statCards = [
    { label: lang === "ar" ? "المستخدمين" : "Users", value: stats?.totalUsers || 0, icon: Users, color: "from-blue-500 to-blue-600" },
    { label: lang === "ar" ? "المشاريع" : "Projects", value: stats?.totalProjects || 0, icon: Globe, color: "from-emerald-500 to-teal-600" },
    { label: lang === "ar" ? "المنشورة" : "Published", value: stats?.publishedProjects || 0, icon: TrendingUp, color: "from-purple-500 to-violet-600" },
    { label: lang === "ar" ? "القوالب" : "Templates", value: 6, icon: LayoutTemplate, color: "from-amber-500 to-orange-600" },
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
            <TabsTrigger value="coupons" data-testid="tab-admin-coupons">
              <Ticket className="w-4 h-4 me-1" />
              {lang === "ar" ? "الكوبونات" : "Coupons"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <ScrollArea className="h-[400px]">
                <div className="divide-y">
                  {usersLoading ? (
                    <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
                  ) : adminUsers.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      {lang === "ar" ? "لا يوجد مستخدمين" : "No users found"}
                    </div>
                  ) : (
                    adminUsers.map((user, i) => (
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
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => suspendUserMutation.mutate(user.id)}
                            data-testid={`button-suspend-user-${i}`}
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
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
                    <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
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
                            <p className="text-xs text-muted-foreground">{project.description?.slice(0, 50) || "—"}</p>
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

          <TabsContent value="coupons">
            <Card>
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-medium">
                  {lang === "ar" ? "إدارة الكوبونات" : "Manage Coupons"}
                </h3>
                <Button size="sm" onClick={() => setShowAddCoupon(!showAddCoupon)} data-testid="button-add-coupon">
                  <Plus className="w-4 h-4 me-1" />
                  {lang === "ar" ? "إنشاء كوبون" : "Create Coupon"}
                </Button>
              </div>

              {showAddCoupon && (
                <div className="p-4 border-b bg-muted/50 space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        {lang === "ar" ? "رمز الكوبون" : "Coupon Code"}
                      </label>
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="WELCOME20"
                        data-testid="input-coupon-code"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        {lang === "ar" ? "نوع الخصم" : "Discount Type"}
                      </label>
                      <div className="flex gap-2">
                        <Button
                          variant={discountType === "percentage" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDiscountType("percentage")}
                          data-testid="button-discount-percentage"
                        >
                          <Percent className="w-3 h-3 me-1" />
                          {lang === "ar" ? "نسبة" : "Percentage"}
                        </Button>
                        <Button
                          variant={discountType === "fixed" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDiscountType("fixed")}
                          data-testid="button-discount-fixed"
                        >
                          <DollarSign className="w-3 h-3 me-1" />
                          {lang === "ar" ? "مبلغ ثابت" : "Fixed"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        {lang === "ar" ? "قيمة الخصم" : "Discount Value"}
                      </label>
                      <Input
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        placeholder="20"
                        type="number"
                        data-testid="input-coupon-value"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {lang === "ar" ? "الحد الأقصى" : "Max Uses"}
                      </label>
                      <Input
                        value={maxUses}
                        onChange={(e) => setMaxUses(e.target.value)}
                        placeholder="100"
                        type="number"
                        data-testid="input-coupon-max-uses"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {lang === "ar" ? "تاريخ الانتهاء" : "Expiry Date"}
                      </label>
                      <Input
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        type="date"
                        data-testid="input-coupon-expiry"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => createCouponMutation.mutate()}
                    disabled={!couponCode || !discountValue || createCouponMutation.isPending}
                    className="bg-emerald-600"
                    data-testid="button-save-coupon"
                  >
                    {createCouponMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      lang === "ar" ? "إنشاء" : "Create"
                    )}
                  </Button>
                </div>
              )}

              <ScrollArea className="h-[300px]">
                <div className="divide-y">
                  {couponsLoading ? (
                    <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
                  ) : couponsData.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      {lang === "ar" ? "لا توجد كوبونات" : "No coupons found"}
                    </div>
                  ) : (
                    couponsData.map((coupon) => (
                      <div key={coupon.id} className="flex items-center justify-between p-4" data-testid={`row-coupon-${coupon.id}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                            <Ticket className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm">{coupon.code}</span>
                              {coupon.isActive ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-red-500" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                              {" • "}
                              {lang === "ar" ? "استخدام:" : "Used:"} {coupon.usedCount || 0}/{coupon.maxUses || "∞"}
                              {coupon.expiresAt && (
                                <>
                                  {" • "}
                                  {lang === "ar" ? "ينتهي:" : "Expires:"} {new Date(coupon.expiresAt).toLocaleDateString()}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteCouponMutation.mutate(coupon.id)}
                          data-testid={`button-delete-coupon-${coupon.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
