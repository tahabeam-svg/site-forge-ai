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
  Shield,
  Settings,
  CreditCard,
  Save,
  Eye,
  EyeOff,
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

interface PaymobSettings {
  api_key?: string;
  integration_id?: string;
  iframe_id?: string;
  hmac_secret?: string;
}

interface AdminSubscription {
  id: number;
  userId: string;
  plan: string;
  status: string;
  paymobOrderId: string | null;
  amountCents: number | null;
  currency: string | null;
  startDate: string | null;
  endDate: string | null;
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

  const [paymobApiKey, setPaymobApiKey] = useState("");
  const [paymobIntegrationId, setPaymobIntegrationId] = useState("");
  const [paymobIframeId, setPaymobIframeId] = useState("");
  const [paymobHmacSecret, setPaymobHmacSecret] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [showHmac, setShowHmac] = useState(false);

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: adminUsers = [], isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    enabled: !statsError,
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery<AdminProject[]>({
    queryKey: ["/api/admin/projects"],
    enabled: !statsError,
  });

  const { data: couponsData = [], isLoading: couponsLoading } = useQuery<Coupon[]>({
    queryKey: ["/api/admin/coupons"],
    enabled: !statsError,
  });

  const { data: paymobSettings } = useQuery<PaymobSettings>({
    queryKey: ["/api/admin/settings/paymob"],
    enabled: !statsError,
  });

  const { data: adminSubs = [] } = useQuery<AdminSubscription[]>({
    queryKey: ["/api/admin/subscriptions"],
    enabled: !statsError,
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

  const savePaymobMutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, string> = {};
      if (paymobApiKey) body.apiKey = paymobApiKey;
      if (paymobIntegrationId) body.integrationId = paymobIntegrationId;
      if (paymobIframeId) body.iframeId = paymobIframeId;
      if (paymobHmacSecret) body.hmacSecret = paymobHmacSecret;
      await apiRequest("PUT", "/api/admin/settings/paymob", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/paymob"] });
      setPaymobApiKey("");
      setPaymobIntegrationId("");
      setPaymobIframeId("");
      setPaymobHmacSecret("");
      toast({ title: lang === "ar" ? "تم حفظ إعدادات Paymob" : "Paymob settings saved" });
    },
    onError: () => {
      toast({ title: lang === "ar" ? "فشل حفظ الإعدادات" : "Failed to save settings", variant: "destructive" });
    },
  });

  if (statsError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2" data-testid="text-admin-denied">
              {lang === "ar" ? "غير مصرح بالوصول" : "Access Denied"}
            </h2>
            <p className="text-muted-foreground">
              {lang === "ar" ? "ليس لديك صلاحية الوصول إلى لوحة الإدارة" : "You do not have permission to access the admin panel"}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
      case "active": return "bg-emerald-100 text-emerald-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
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
          <TabsList className="flex-wrap">
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
            <TabsTrigger value="payments" data-testid="tab-admin-payments">
              <CreditCard className="w-4 h-4 me-1" />
              {lang === "ar" ? "المدفوعات" : "Payments"}
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-admin-settings">
              <Settings className="w-4 h-4 me-1" />
              {lang === "ar" ? "الإعدادات" : "Settings"}
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
                              {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `${coupon.discountValue} ر.س`}
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

          <TabsContent value="payments">
            <Card>
              <div className="p-4 border-b">
                <h3 className="font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {lang === "ar" ? "سجل المدفوعات والاشتراكات" : "Payments & Subscriptions"}
                </h3>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="divide-y">
                  {adminSubs.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      {lang === "ar" ? "لا توجد مدفوعات بعد" : "No payments yet"}
                    </div>
                  ) : (
                    adminSubs.map((sub, i) => (
                      <div key={sub.id} className="flex items-center justify-between p-4" data-testid={`row-subscription-${i}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-blue-700" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {sub.userId.slice(0, 8)}... — {sub.plan.toUpperCase()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {sub.amountCents ? `${(sub.amountCents / 100).toFixed(0)} ${sub.currency || "SAR"}` : "—"}
                              {" • "}
                              {lang === "ar" ? "الطلب:" : "Order:"} {sub.paymobOrderId || "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={`text-xs ${statusColor(sub.status)}`}>
                            {sub.status === "active" ? (lang === "ar" ? "نشط" : "Active") :
                             sub.status === "pending" ? (lang === "ar" ? "معلق" : "Pending") :
                             sub.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <div className="p-4 border-b">
                <h3 className="font-medium flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  {lang === "ar" ? "إعدادات بوابة الدفع Paymob" : "Paymob Payment Gateway Settings"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === "ar"
                    ? "أدخل بيانات حساب Paymob الخاص بك لتفعيل الدفع الإلكتروني"
                    : "Enter your Paymob account credentials to enable online payments"}
                </p>
              </div>

              <div className="p-4 space-y-4">
                {paymobSettings && Object.keys(paymobSettings).length > 0 && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      {lang === "ar" ? "Paymob مُفعّل ومتصل" : "Paymob is configured and connected"}
                    </p>
                    <div className="mt-2 space-y-1">
                      {paymobSettings.api_key && (
                        <p className="text-xs text-muted-foreground">API Key: {paymobSettings.api_key}</p>
                      )}
                      {paymobSettings.integration_id && (
                        <p className="text-xs text-muted-foreground">Integration ID: {paymobSettings.integration_id}</p>
                      )}
                      {paymobSettings.iframe_id && (
                        <p className="text-xs text-muted-foreground">iFrame ID: {paymobSettings.iframe_id}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      {lang === "ar" ? "مفتاح API" : "API Key"}
                    </label>
                    <div className="relative">
                      <Input
                        value={paymobApiKey}
                        onChange={(e) => setPaymobApiKey(e.target.value)}
                        placeholder={lang === "ar" ? "أدخل مفتاح API من Paymob" : "Enter Paymob API Key"}
                        type={showApiKey ? "text" : "password"}
                        data-testid="input-paymob-api-key"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      {lang === "ar" ? "معرّف التكامل" : "Integration ID"}
                    </label>
                    <Input
                      value={paymobIntegrationId}
                      onChange={(e) => setPaymobIntegrationId(e.target.value)}
                      placeholder={lang === "ar" ? "مثال: 123456" : "e.g. 123456"}
                      data-testid="input-paymob-integration-id"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      {lang === "ar" ? "معرّف الإطار" : "iFrame ID"}
                    </label>
                    <Input
                      value={paymobIframeId}
                      onChange={(e) => setPaymobIframeId(e.target.value)}
                      placeholder={lang === "ar" ? "مثال: 789012" : "e.g. 789012"}
                      data-testid="input-paymob-iframe-id"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      {lang === "ar" ? "مفتاح HMAC السري" : "HMAC Secret"}
                    </label>
                    <div className="relative">
                      <Input
                        value={paymobHmacSecret}
                        onChange={(e) => setPaymobHmacSecret(e.target.value)}
                        placeholder={lang === "ar" ? "أدخل مفتاح HMAC (اختياري)" : "Enter HMAC Secret (optional)"}
                        type={showHmac ? "text" : "password"}
                        data-testid="input-paymob-hmac"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => setShowHmac(!showHmac)}
                      >
                        {showHmac ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    onClick={() => savePaymobMutation.mutate()}
                    disabled={(!paymobApiKey && !paymobIntegrationId && !paymobIframeId && !paymobHmacSecret) || savePaymobMutation.isPending}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    data-testid="button-save-paymob"
                  >
                    {savePaymobMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin me-1" />
                    ) : (
                      <Save className="w-4 h-4 me-1" />
                    )}
                    {lang === "ar" ? "حفظ الإعدادات" : "Save Settings"}
                  </Button>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
                  <h4 className="text-sm font-medium mb-2">
                    {lang === "ar" ? "كيفية الحصول على بيانات Paymob:" : "How to get Paymob credentials:"}
                  </h4>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>{lang === "ar" ? "سجّل في accept.paymob.com" : "Sign up at accept.paymob.com"}</li>
                    <li>{lang === "ar" ? "اذهب إلى Dashboard > Settings > API Key" : "Go to Dashboard > Settings > API Key"}</li>
                    <li>{lang === "ar" ? "أنشئ Integration جديد (Online Card)" : "Create a new Integration (Online Card)"}</li>
                    <li>{lang === "ar" ? "أنشئ iFrame وانسخ المعرّف" : "Create an iFrame and copy the ID"}</li>
                    <li>{lang === "ar" ? "انسخ HMAC Secret من إعدادات الأمان" : "Copy HMAC Secret from security settings"}</li>
                  </ol>
                  <p className="text-xs text-muted-foreground mt-2">
                    {lang === "ar"
                      ? "رابط Callback للدفع: "
                      : "Payment Callback URL: "}
                    <code className="bg-muted px-1 py-0.5 rounded text-[10px]">
                      https://arabyweb.net/api/payments/callback
                    </code>
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
