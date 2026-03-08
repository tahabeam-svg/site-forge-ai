import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  Users,
  Globe2,
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
  Tag,
  Zap,
  Crown,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  ArrowRight,
  LogOut,
  Home,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Building2,
} from "lucide-react";

interface AdminStats { totalUsers: number; totalProjects: number; publishedProjects: number; }
interface AdminUser { id: string; email: string | null; firstName: string | null; lastName: string | null; profileImageUrl: string | null; plan?: string; credits?: number; createdAt: string | null; }
interface AdminProject { id: number; userId: string; name: string; description: string | null; status: string; createdAt: string; }
interface Coupon { id: number; code: string; discountType: string; discountValue: number; maxUses: number | null; usedCount: number | null; expiresAt: string | null; isActive: boolean | null; createdAt: string; }
interface PaymobSettings { api_key?: string; integration_id?: string; iframe_id?: string; hmac_secret?: string; }
interface AdminSubscription { id: number; userId: string; plan: string; status: string; paymobOrderId: string | null; amountCents: number | null; currency: string | null; startDate: string | null; endDate: string | null; createdAt: string; }
interface PricingData { pro: { price: number; credits: number }; business: { price: number; credits: number }; free: { credits: number }; }
interface Promotion { id: string; name: string; nameAr: string; discountPercent: number; appliesTo: "all" | "pro" | "business"; isActive: boolean; expiresAt: string | null; createdAt: string; }

type AdminSection = "overview" | "users" | "projects" | "coupons" | "pricing" | "promotions" | "payments" | "gateway";

export default function AdminPage() {
  const { language, logout } = useAuth();
  const lang = language;
  const { toast } = useToast();
  const isRTL = lang === "ar";

  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const [proPrice, setProPrice] = useState("");
  const [businessPrice, setBusinessPrice] = useState("");
  const [proCredits, setProCredits] = useState("");
  const [businessCredits, setBusinessCredits] = useState("");
  const [freeCredits, setFreeCredits] = useState("");

  const [showAddPromo, setShowAddPromo] = useState(false);
  const [promoName, setPromoName] = useState("");
  const [promoNameAr, setPromoNameAr] = useState("");
  const [promoDiscount, setPromoDiscount] = useState("");
  const [promoAppliesTo, setPromoAppliesTo] = useState<"all" | "pro" | "business">("all");
  const [promoExpiry, setPromoExpiry] = useState("");

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<AdminStats>({ queryKey: ["/api/admin/stats"] });
  const { data: adminUsers = [], isLoading: usersLoading } = useQuery<AdminUser[]>({ queryKey: ["/api/admin/users"], enabled: !statsError });
  const { data: projects = [], isLoading: projectsLoading } = useQuery<AdminProject[]>({ queryKey: ["/api/admin/projects"], enabled: !statsError });
  const { data: couponsData = [], isLoading: couponsLoading } = useQuery<Coupon[]>({ queryKey: ["/api/admin/coupons"], enabled: !statsError });
  const { data: paymobSettings } = useQuery<PaymobSettings>({ queryKey: ["/api/admin/settings/paymob"], enabled: !statsError });
  const { data: adminSubs = [] } = useQuery<AdminSubscription[]>({ queryKey: ["/api/admin/subscriptions"], enabled: !statsError });
  const { data: pricingData } = useQuery<PricingData>({ queryKey: ["/api/admin/pricing"], enabled: !statsError });
  const { data: promotions = [] } = useQuery<Promotion[]>({ queryKey: ["/api/admin/promotions"], enabled: !statsError });

  useEffect(() => {
    if (pricingData) {
      setProPrice(String(pricingData.pro.price / 100));
      setBusinessPrice(String(pricingData.business.price / 100));
      setProCredits(String(pricingData.pro.credits));
      setBusinessCredits(String(pricingData.business.credits));
      setFreeCredits(String(pricingData.free.credits));
    }
  }, [pricingData]);

  const createCouponMutation = useMutation({
    mutationFn: async () => { await apiRequest("POST", "/api/admin/coupons", { code: couponCode, discountType, discountValue: parseInt(discountValue), maxUses: maxUses ? parseInt(maxUses) : 0, expiresAt: expiresAt || undefined }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] }); setShowAddCoupon(false); setCouponCode(""); setDiscountValue(""); setMaxUses(""); setExpiresAt(""); toast({ title: lang === "ar" ? "تم إنشاء الكوبون" : "Coupon created" }); },
    onError: () => { toast({ title: lang === "ar" ? "فشل إنشاء الكوبون" : "Failed to create coupon", variant: "destructive" }); },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/coupons/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] }); toast({ title: lang === "ar" ? "تم حذف الكوبون" : "Coupon deleted" }); },
  });

  const toggleCouponMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => { await apiRequest("PATCH", `/api/admin/coupons/${id}`, { isActive }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] }); },
  });

  const suspendUserMutation = useMutation({
    mutationFn: async (userId: string) => { await apiRequest("PATCH", `/api/admin/users/${userId}/suspend`); },
    onSuccess: () => { toast({ title: lang === "ar" ? "تم إيقاف المستخدم" : "User suspended" }); },
  });

  const savePaymobMutation = useMutation({
    mutationFn: async () => { const body: Record<string, string> = {}; if (paymobApiKey) body.apiKey = paymobApiKey; if (paymobIntegrationId) body.integrationId = paymobIntegrationId; if (paymobIframeId) body.iframeId = paymobIframeId; if (paymobHmacSecret) body.hmacSecret = paymobHmacSecret; await apiRequest("PUT", "/api/admin/settings/paymob", body); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/paymob"] }); setPaymobApiKey(""); setPaymobIntegrationId(""); setPaymobIframeId(""); setPaymobHmacSecret(""); toast({ title: lang === "ar" ? "تم حفظ إعدادات Paymob" : "Paymob settings saved" }); },
    onError: () => { toast({ title: lang === "ar" ? "فشل حفظ الإعدادات" : "Failed to save settings", variant: "destructive" }); },
  });

  const savePricingMutation = useMutation({
    mutationFn: async () => { await apiRequest("PUT", "/api/admin/pricing", { proPrice: Math.round(parseFloat(proPrice) * 100), businessPrice: Math.round(parseFloat(businessPrice) * 100), proCredits: parseInt(proCredits), businessCredits: parseInt(businessCredits), freeCredits: parseInt(freeCredits) }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing"] }); toast({ title: lang === "ar" ? "تم تحديث الأسعار" : "Pricing updated" }); },
    onError: () => { toast({ title: lang === "ar" ? "فشل تحديث الأسعار" : "Failed to update pricing", variant: "destructive" }); },
  });

  const savePromoMutation = useMutation({
    mutationFn: async (updatedPromos: Promotion[]) => { await apiRequest("PUT", "/api/admin/promotions", { promotions: updatedPromos }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/promotions"] }); toast({ title: lang === "ar" ? "تم تحديث العروض" : "Promotions updated" }); },
    onError: () => { toast({ title: lang === "ar" ? "فشل تحديث العروض" : "Failed to update promotions", variant: "destructive" }); },
  });

  const addPromotion = () => {
    const newPromo: Promotion = { id: Date.now().toString(), name: promoName, nameAr: promoNameAr, discountPercent: parseInt(promoDiscount), appliesTo: promoAppliesTo, isActive: true, expiresAt: promoExpiry || null, createdAt: new Date().toISOString() };
    savePromoMutation.mutate([...promotions, newPromo]);
    setShowAddPromo(false); setPromoName(""); setPromoNameAr(""); setPromoDiscount(""); setPromoExpiry("");
  };

  const togglePromotion = (id: string) => { savePromoMutation.mutate(promotions.map((p) => p.id === id ? { ...p, isActive: !p.isActive } : p)); };
  const deletePromotion = (id: string) => { savePromoMutation.mutate(promotions.filter((p) => p.id !== id)); };

  if (statsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <Shield className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2" data-testid="text-admin-denied">{lang === "ar" ? "غير مصرح بالوصول" : "Access Denied"}</h2>
          <p className="text-zinc-400">{lang === "ar" ? "ليس لديك صلاحية الوصول إلى لوحة الإدارة" : "You do not have permission to access the admin panel"}</p>
          <Link href="/dashboard"><Button className="mt-4" variant="outline">{lang === "ar" ? "العودة" : "Go Back"}</Button></Link>
        </div>
      </div>
    );
  }

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const navItems: { key: AdminSection; icon: any; label: string; labelAr: string }[] = [
    { key: "overview", icon: TrendingUp, label: "Overview", labelAr: "نظرة عامة" },
    { key: "users", icon: Users, label: "Users", labelAr: "المستخدمين" },
    { key: "projects", icon: Globe2, label: "Projects", labelAr: "المشاريع" },
    { key: "coupons", icon: Ticket, label: "Coupons", labelAr: "الكوبونات" },
    { key: "pricing", icon: Tag, label: "Pricing", labelAr: "الأسعار" },
    { key: "promotions", icon: Sparkles, label: "Offers", labelAr: "العروض" },
    { key: "payments", icon: Receipt, label: "Payments", labelAr: "المدفوعات" },
    { key: "gateway", icon: CreditCard, label: "Gateway", labelAr: "بوابة الدفع" },
  ];

  const statusLabel = (s: string) => lang === "ar" ? ({ draft: "مسودة", generating: "قيد الإنشاء", generated: "مُنشأ", published: "منشور", error: "خطأ" }[s] || s) : s;
  const statusColor = (s: string) => ({ published: "bg-emerald-500/20 text-emerald-400", generated: "bg-blue-500/20 text-blue-400", draft: "bg-zinc-500/20 text-zinc-400", error: "bg-red-500/20 text-red-400", active: "bg-emerald-500/20 text-emerald-400", pending: "bg-yellow-500/20 text-yellow-400" }[s] || "bg-zinc-500/20 text-zinc-400");
  const appliesToLabel = (v: string) => lang === "ar" ? ({ all: "جميع الخطط", pro: "الاحترافية فقط", business: "الأعمال فقط" }[v] || v) : ({ all: "All Plans", pro: "Pro Only", business: "Business Only" }[v] || v);

  const totalRevenue = adminSubs.reduce((sum, s) => sum + (s.amountCents || 0), 0);
  const vatAmount = Math.round(totalRevenue * 0.15);
  const activeSubsCount = adminSubs.filter(s => s.status === "active").length;

  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className={`min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden ${isRTL ? "font-cairo" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center cursor-pointer"
              data-testid="button-mobile-menu"
            >
              <LayoutTemplate className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white" data-testid="text-admin-title">
                  {lang === "ar" ? "لوحة إدارة عربي ويب" : "ArabyWeb Admin"}
                </h1>
                <p className="text-[10px] text-zinc-500">{lang === "ar" ? "لوحة التحكم الإدارية" : "Administration Panel"}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800" data-testid="link-admin-dashboard">
                <Home className="w-4 h-4 me-1" />
                <span className="hidden sm:inline">{lang === "ar" ? "لوحة التحكم" : "Dashboard"}</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex overflow-x-hidden">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 min-h-[calc(100vh-57px)] bg-zinc-900 border-e border-zinc-800 sticky top-[57px]">
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                  activeSection === item.key
                    ? "bg-emerald-500/10 text-emerald-400 font-medium"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
                data-testid={`nav-admin-${item.key}`}
              >
                <item.icon className="w-4 h-4" />
                {lang === "ar" ? item.labelAr : item.label}
                {activeSection === item.key && <Chevron className="w-3 h-3 ms-auto" />}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-zinc-800">
            <div className="px-3 py-2 rounded-lg bg-zinc-800/50">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{lang === "ar" ? "المشرف" : "Admin"}</p>
              <p className="text-xs text-zinc-300 mt-0.5 truncate">tahabeam@gmail.com</p>
            </div>
          </div>
        </aside>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div className="absolute inset-0 bg-black/60" />
            <div className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-64 h-full bg-zinc-900 border-e border-zinc-800 p-4 space-y-1`} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-zinc-800">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-sm">{lang === "ar" ? "لوحة الإدارة" : "Admin Panel"}</span>
              </div>
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => { setActiveSection(item.key); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all cursor-pointer ${
                    activeSection === item.key
                      ? "bg-emerald-500/10 text-emerald-400 font-medium"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {lang === "ar" ? item.labelAr : item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 min-h-[calc(100vh-57px)]">
          {/* Mobile Section Selector */}
          <div className="lg:hidden overflow-x-auto border-b border-zinc-800 bg-zinc-900/50">
            <div className="flex p-2 gap-1.5 min-w-max">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer ${
                    activeSection === item.key
                      ? "bg-emerald-500/20 text-emerald-400 font-medium"
                      : "text-zinc-500 hover:text-zinc-300 bg-zinc-800/50"
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {lang === "ar" ? item.labelAr : item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 sm:p-6 max-w-5xl mx-auto space-y-4 sm:space-y-6 overflow-hidden">

            {/* OVERVIEW */}
            {activeSection === "overview" && (
              <>
                {/* Stats Grid - 2x2 on mobile */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                  {[
                    { label: lang === "ar" ? "المستخدمين" : "Users", value: stats?.totalUsers || 0, icon: Users, gradient: "from-blue-600 to-blue-800" },
                    { label: lang === "ar" ? "المشاريع" : "Projects", value: stats?.totalProjects || 0, icon: Globe2, gradient: "from-emerald-600 to-emerald-800" },
                    { label: lang === "ar" ? "المنشورة" : "Published", value: stats?.publishedProjects || 0, icon: TrendingUp, gradient: "from-violet-600 to-violet-800" },
                    { label: lang === "ar" ? "الاشتراكات" : "Subs", value: activeSubsCount, icon: Crown, gradient: "from-amber-600 to-amber-800" },
                  ].map((stat, i) => (
                    <Card key={i} className="bg-zinc-900 border-zinc-800 p-3 sm:p-4" data-testid={`card-stat-${i}`}>
                      <div className="flex items-center gap-2 sm:block">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center sm:mb-3 shrink-0`}>
                          <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xl sm:text-2xl font-bold text-white leading-tight">{stat.value}</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{stat.label}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Revenue Summary - stacked on mobile */}
                <Card className="bg-zinc-900 border-zinc-800 p-3 sm:p-5">
                  <h3 className="font-semibold text-white flex items-center gap-2 mb-3 sm:mb-4 text-sm sm:text-base">
                    <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                    {lang === "ar" ? "ملخص الإيرادات" : "Revenue Summary"}
                  </h3>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="p-2 sm:p-4 rounded-lg sm:rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-center">
                      <p className="text-[10px] sm:text-xs text-zinc-400 mb-1">{lang === "ar" ? "الإجمالي" : "Total"}</p>
                      <p className="text-base sm:text-xl font-bold text-white" dir="ltr">{(totalRevenue / 100).toFixed(0)}</p>
                      <p className="text-[10px] text-zinc-500">SAR</p>
                    </div>
                    <div className="p-2 sm:p-4 rounded-lg sm:rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-center">
                      <p className="text-[10px] sm:text-xs text-zinc-400 mb-1">{lang === "ar" ? "ضريبة 15%" : "VAT 15%"}</p>
                      <p className="text-base sm:text-xl font-bold text-amber-400" dir="ltr">{(vatAmount / 100).toFixed(0)}</p>
                      <p className="text-[10px] text-zinc-500">SAR</p>
                    </div>
                    <div className="p-2 sm:p-4 rounded-lg sm:rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-center">
                      <p className="text-[10px] sm:text-xs text-zinc-400 mb-1">{lang === "ar" ? "الصافي" : "Net"}</p>
                      <p className="text-base sm:text-xl font-bold text-emerald-400" dir="ltr">{((totalRevenue - vatAmount) / 100).toFixed(0)}</p>
                      <p className="text-[10px] text-zinc-500">SAR</p>
                    </div>
                  </div>
                </Card>

                {/* Quick Actions - 2x2 grid */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                  {[
                    { label: lang === "ar" ? "إنشاء كوبون" : "Create Coupon", icon: Ticket, section: "coupons" as AdminSection, color: "from-purple-600 to-violet-700" },
                    { label: lang === "ar" ? "تعديل الأسعار" : "Edit Pricing", icon: Tag, section: "pricing" as AdminSection, color: "from-emerald-600 to-teal-700" },
                    { label: lang === "ar" ? "إنشاء عرض" : "New Offer", icon: Sparkles, section: "promotions" as AdminSection, color: "from-amber-600 to-orange-700" },
                    { label: lang === "ar" ? "بوابة الدفع" : "Payment Setup", icon: CreditCard, section: "gateway" as AdminSection, color: "from-blue-600 to-indigo-700" },
                  ].map((action, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSection(action.section)}
                      className={`p-3 sm:p-4 rounded-xl bg-gradient-to-br ${action.color} text-white text-start hover:opacity-90 transition-opacity cursor-pointer`}
                      data-testid={`button-quick-${action.section}`}
                    >
                      <action.icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
                      <p className="text-xs sm:text-sm font-medium leading-tight">{action.label}</p>
                    </button>
                  ))}
                </div>

                {/* Recent Subscribers */}
                <Card className="bg-zinc-900 border-zinc-800">
                  <div className="p-3 sm:p-4 border-b border-zinc-800 flex items-center justify-between">
                    <h3 className="font-semibold text-white flex items-center gap-2 text-sm sm:text-base">
                      <Crown className="w-4 h-4 text-amber-400" />
                      {lang === "ar" ? "آخر المشتركين" : "Recent Subscribers"}
                    </h3>
                    <Button variant="ghost" size="sm" className="text-zinc-400 text-xs" onClick={() => setActiveSection("payments")} data-testid="button-view-all-subs">
                      {lang === "ar" ? "عرض الكل" : "View All"}
                      <Chevron className="w-3 h-3 ms-1" />
                    </Button>
                  </div>
                  <div className="divide-y divide-zinc-800">
                    {adminSubs.length === 0 ? (
                      <div className="p-6 sm:p-8 text-center text-zinc-500 text-sm">{lang === "ar" ? "لا توجد اشتراكات بعد" : "No subscriptions yet"}</div>
                    ) : adminSubs.slice(0, 5).map((sub, i) => {
                      const amount = sub.amountCents ? (sub.amountCents / 100) : 0;
                      const vat = Math.round(amount * 0.15);
                      return (
                        <div key={sub.id} className="flex items-center justify-between p-3 sm:p-4" data-testid={`row-recent-sub-${i}`}>
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 ${sub.plan === "business" ? "bg-violet-500/20" : "bg-emerald-500/20"}`}>
                              {sub.plan === "business" ? <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" /> : <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-zinc-200 truncate">{sub.userId.slice(0, 10)}...</p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Badge variant="secondary" className={`text-[9px] sm:text-[10px] ${sub.plan === "business" ? "bg-violet-500/20 text-violet-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                                  {sub.plan === "business" ? (lang === "ar" ? "أعمال" : "Biz") : "Pro"}
                                </Badge>
                                <span className="text-[10px] text-zinc-600">{new Date(sub.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-end shrink-0 ms-2">
                            <p className="text-xs sm:text-sm font-semibold text-white" dir="ltr">{amount.toFixed(0)} SAR</p>
                            <p className="text-[9px] sm:text-[10px] text-zinc-500" dir="ltr">+{vat.toFixed(0)} {lang === "ar" ? "ضريبة" : "VAT"}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </>
            )}

            {/* USERS */}
            {activeSection === "users" && (
              <Card className="bg-zinc-900 border-zinc-800">
                <div className="p-3 sm:p-4 border-b border-zinc-800">
                  <h3 className="font-semibold text-white flex items-center gap-2 text-sm sm:text-base">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    {lang === "ar" ? "إدارة المستخدمين" : "User Management"}
                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 ms-2 text-[10px] sm:text-xs">{adminUsers.length}</Badge>
                  </h3>
                </div>
                <ScrollArea className="h-[calc(100vh-200px)] sm:h-[500px]">
                  <div className="divide-y divide-zinc-800">
                    {usersLoading ? (
                      <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-zinc-500" /></div>
                    ) : adminUsers.length === 0 ? (
                      <div className="p-6 text-center text-zinc-500">
                        <Users className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
                        <p className="text-sm">{lang === "ar" ? "لا يوجد مستخدمين بعد" : "No users yet"}</p>
                      </div>
                    ) : adminUsers.map((user, i) => (
                      <div key={user.id} className="flex items-center justify-between p-3 sm:p-4 hover:bg-zinc-800/50 transition-colors" data-testid={`row-user-${i}`}>
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          {user.profileImageUrl ? (
                            <img src={user.profileImageUrl} alt="" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0" />
                          ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-zinc-200 truncate">
                              {user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : (user.email || user.id.slice(0, 8))}
                            </p>
                            <p className="text-[10px] sm:text-xs text-zinc-500 truncate">{user.email || "—"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-3 shrink-0 ms-2">
                          <span className="text-[10px] sm:text-xs text-zinc-500 hidden sm:inline">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</span>
                          <Button variant="ghost" size="sm" className="text-red-400 h-7 w-7 sm:h-8 sm:w-8 p-0" onClick={() => suspendUserMutation.mutate(user.id)} data-testid={`button-suspend-user-${i}`}>
                            <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            )}

            {/* PROJECTS */}
            {activeSection === "projects" && (
              <Card className="bg-zinc-900 border-zinc-800">
                <div className="p-4 border-b border-zinc-800">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Globe2 className="w-5 h-5 text-emerald-400" />
                    {lang === "ar" ? "جميع المشاريع" : "All Projects"}
                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 ms-2">{projects.length}</Badge>
                  </h3>
                </div>
                <ScrollArea className="h-[500px]">
                  <div className="divide-y divide-zinc-800">
                    {projectsLoading ? (
                      <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-zinc-500" /></div>
                    ) : projects.length === 0 ? (
                      <div className="p-8 text-center text-zinc-500">
                        <Globe2 className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
                        <p>{lang === "ar" ? "لا توجد مشاريع بعد" : "No projects yet"}</p>
                      </div>
                    ) : projects.map((project, i) => (
                      <div key={project.id} className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors" data-testid={`row-project-${i}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Globe2 className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-200">{project.name}</p>
                            <p className="text-xs text-zinc-500">{project.description?.slice(0, 60) || "—"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={`text-xs ${statusColor(project.status)}`}>{statusLabel(project.status)}</Badge>
                          <span className="text-xs text-zinc-500">{new Date(project.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            )}

            {/* COUPONS */}
            {activeSection === "coupons" && (
              <Card className="bg-zinc-900 border-zinc-800">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-purple-400" />
                    {lang === "ar" ? "إدارة الكوبونات" : "Manage Coupons"}
                  </h3>
                  <Button size="sm" onClick={() => setShowAddCoupon(!showAddCoupon)} className="bg-purple-600 hover:bg-purple-700" data-testid="button-add-coupon">
                    <Plus className="w-4 h-4 me-1" />
                    {lang === "ar" ? "كوبون جديد" : "New Coupon"}
                  </Button>
                </div>

                {showAddCoupon && (
                  <div className="p-4 border-b border-zinc-800 bg-zinc-800/30 space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium mb-1 block text-zinc-400">{lang === "ar" ? "رمز الكوبون" : "Coupon Code"}</label>
                        <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="WELCOME20" className="bg-zinc-800 border-zinc-700 text-white" data-testid="input-coupon-code" />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block text-zinc-400">{lang === "ar" ? "نوع الخصم" : "Discount Type"}</label>
                        <div className="flex gap-2">
                          <Button variant={discountType === "percentage" ? "default" : "outline"} size="sm" onClick={() => setDiscountType("percentage")} className={discountType === "percentage" ? "bg-purple-600" : "border-zinc-700 text-zinc-300"} data-testid="button-discount-percentage">
                            <Percent className="w-3 h-3 me-1" />{lang === "ar" ? "نسبة %" : "%"}
                          </Button>
                          <Button variant={discountType === "fixed" ? "default" : "outline"} size="sm" onClick={() => setDiscountType("fixed")} className={discountType === "fixed" ? "bg-purple-600" : "border-zinc-700 text-zinc-300"} data-testid="button-discount-fixed">
                            <DollarSign className="w-3 h-3 me-1" />{lang === "ar" ? "مبلغ" : "SAR"}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium mb-1 block text-zinc-400">{lang === "ar" ? "القيمة" : "Value"}</label>
                        <Input value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder="20" type="number" className="bg-zinc-800 border-zinc-700 text-white" data-testid="input-coupon-value" />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block text-zinc-400">{lang === "ar" ? "الحد الأقصى" : "Max Uses"}</label>
                        <Input value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="0 = ∞" type="number" className="bg-zinc-800 border-zinc-700 text-white" data-testid="input-coupon-max-uses" />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block text-zinc-400">{lang === "ar" ? "ينتهي في" : "Expires"}</label>
                        <Input value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} type="date" className="bg-zinc-800 border-zinc-700 text-white" data-testid="input-coupon-expiry" />
                      </div>
                    </div>
                    <Button onClick={() => createCouponMutation.mutate()} disabled={!couponCode || !discountValue || createCouponMutation.isPending} className="bg-purple-600 hover:bg-purple-700" data-testid="button-save-coupon">
                      {createCouponMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (lang === "ar" ? "إنشاء الكوبون" : "Create Coupon")}
                    </Button>
                  </div>
                )}

                <ScrollArea className="h-[400px]">
                  <div className="divide-y divide-zinc-800">
                    {couponsLoading ? (
                      <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-zinc-500" /></div>
                    ) : couponsData.length === 0 ? (
                      <div className="p-8 text-center text-zinc-500">
                        <Ticket className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
                        <p>{lang === "ar" ? "لا توجد كوبونات" : "No coupons yet"}</p>
                      </div>
                    ) : couponsData.map((coupon) => (
                      <div key={coupon.id} className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors" data-testid={`row-coupon-${coupon.id}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${coupon.isActive ? "bg-purple-500/15" : "bg-zinc-800"}`}>
                            <Ticket className={`w-5 h-5 ${coupon.isActive ? "text-purple-400" : "text-zinc-600"}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm text-white">{coupon.code}</span>
                              {coupon.isActive ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                            </div>
                            <p className="text-xs text-zinc-500">
                              {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `${coupon.discountValue} SAR`}
                              {" • "}{lang === "ar" ? "استخدام:" : "Used:"} {coupon.usedCount || 0}/{coupon.maxUses || "∞"}
                              {coupon.expiresAt && <>{" • "}{new Date(coupon.expiresAt).toLocaleDateString()}</>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => toggleCouponMutation.mutate({ id: coupon.id, isActive: !coupon.isActive })} className="hover:bg-zinc-800" data-testid={`button-toggle-coupon-${coupon.id}`}>
                            {coupon.isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-zinc-600" />}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => deleteCouponMutation.mutate(coupon.id)} data-testid={`button-delete-coupon-${coupon.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            )}

            {/* PRICING */}
            {activeSection === "pricing" && (
              <Card className="bg-zinc-900 border-zinc-800">
                <div className="p-4 border-b border-zinc-800">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Tag className="w-5 h-5 text-emerald-400" />
                    {lang === "ar" ? "إدارة الأسعار والأرصدة" : "Pricing & Credits"}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">{lang === "ar" ? "الأسعار لا تشمل ضريبة القيمة المضافة 15%" : "Prices are exclusive of 15% VAT"}</p>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5 text-zinc-500" />
                        <h4 className="font-semibold text-zinc-300">{lang === "ar" ? "المجانية" : "Free"}</h4>
                      </div>
                      <div className="text-lg font-bold text-zinc-400 mb-3">{lang === "ar" ? "مجاناً" : "Free"}</div>
                      <label className="text-xs text-zinc-500 mb-1 block">{lang === "ar" ? "الأرصدة / شهر" : "Credits / month"}</label>
                      <Input value={freeCredits} onChange={(e) => setFreeCredits(e.target.value)} type="number" className="bg-zinc-900 border-zinc-700 text-white" data-testid="input-free-credits" />
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Crown className="w-5 h-5 text-emerald-400" />
                        <h4 className="font-semibold text-emerald-400">{lang === "ar" ? "الاحترافية" : "Pro"}</h4>
                      </div>
                      <label className="text-xs text-zinc-500 mb-1 block">{lang === "ar" ? "السعر (ر.س / شهر)" : "Price (SAR/mo)"}</label>
                      <Input value={proPrice} onChange={(e) => setProPrice(e.target.value)} type="number" className="bg-zinc-900 border-zinc-700 text-white mb-3" data-testid="input-pro-price" />
                      <label className="text-xs text-zinc-500 mb-1 block">{lang === "ar" ? "الأرصدة / شهر" : "Credits / month"}</label>
                      <Input value={proCredits} onChange={(e) => setProCredits(e.target.value)} type="number" className="bg-zinc-900 border-zinc-700 text-white" data-testid="input-pro-credits" />
                    </div>
                    <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-violet-400" />
                        <h4 className="font-semibold text-violet-400">{lang === "ar" ? "الأعمال" : "Business"}</h4>
                      </div>
                      <label className="text-xs text-zinc-500 mb-1 block">{lang === "ar" ? "السعر (ر.س / شهر)" : "Price (SAR/mo)"}</label>
                      <Input value={businessPrice} onChange={(e) => setBusinessPrice(e.target.value)} type="number" className="bg-zinc-900 border-zinc-700 text-white mb-3" data-testid="input-business-price" />
                      <label className="text-xs text-zinc-500 mb-1 block">{lang === "ar" ? "الأرصدة / شهر" : "Credits / month"}</label>
                      <Input value={businessCredits} onChange={(e) => setBusinessCredits(e.target.value)} type="number" className="bg-zinc-900 border-zinc-700 text-white" data-testid="input-business-credits" />
                    </div>
                  </div>
                  <Button onClick={() => savePricingMutation.mutate()} disabled={savePricingMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700" data-testid="button-save-pricing">
                    {savePricingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin me-1" /> : <Save className="w-4 h-4 me-1" />}
                    {lang === "ar" ? "حفظ الأسعار" : "Save Pricing"}
                  </Button>
                </div>
              </Card>
            )}

            {/* PROMOTIONS */}
            {activeSection === "promotions" && (
              <Card className="bg-zinc-900 border-zinc-800">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    {lang === "ar" ? "العروض والخصومات" : "Promotions & Offers"}
                  </h3>
                  <Button size="sm" onClick={() => setShowAddPromo(!showAddPromo)} className="bg-amber-600 hover:bg-amber-700" data-testid="button-add-promo">
                    <Plus className="w-4 h-4 me-1" />
                    {lang === "ar" ? "عرض جديد" : "New Offer"}
                  </Button>
                </div>

                {showAddPromo && (
                  <div className="p-4 border-b border-zinc-800 bg-zinc-800/30 space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium mb-1 block text-zinc-400">{lang === "ar" ? "اسم العرض (EN)" : "Name (EN)"}</label>
                        <Input value={promoName} onChange={(e) => setPromoName(e.target.value)} placeholder="Summer Sale" className="bg-zinc-800 border-zinc-700 text-white" data-testid="input-promo-name" />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block text-zinc-400">{lang === "ar" ? "اسم العرض (AR)" : "Name (AR)"}</label>
                        <Input value={promoNameAr} onChange={(e) => setPromoNameAr(e.target.value)} placeholder="عرض الصيف" className="bg-zinc-800 border-zinc-700 text-white" data-testid="input-promo-name-ar" />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium mb-1 block text-zinc-400">{lang === "ar" ? "نسبة الخصم (%)" : "Discount (%)"}</label>
                        <Input value={promoDiscount} onChange={(e) => setPromoDiscount(e.target.value)} placeholder="30" type="number" min="1" max="100" className="bg-zinc-800 border-zinc-700 text-white" data-testid="input-promo-discount" />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block text-zinc-400">{lang === "ar" ? "يُطبّق على" : "Applies To"}</label>
                        <div className="flex gap-1">
                          {(["all", "pro", "business"] as const).map((v) => (
                            <Button key={v} variant={promoAppliesTo === v ? "default" : "outline"} size="sm" className={`text-xs ${promoAppliesTo === v ? "bg-amber-600" : "border-zinc-700 text-zinc-300"}`} onClick={() => setPromoAppliesTo(v)} data-testid={`button-promo-applies-${v}`}>
                              {v === "all" ? (lang === "ar" ? "الكل" : "All") : v === "pro" ? "Pro" : "Biz"}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block text-zinc-400">{lang === "ar" ? "ينتهي في" : "Expires"}</label>
                        <Input value={promoExpiry} onChange={(e) => setPromoExpiry(e.target.value)} type="date" className="bg-zinc-800 border-zinc-700 text-white" data-testid="input-promo-expiry" />
                      </div>
                    </div>
                    <Button onClick={addPromotion} disabled={!promoName || !promoDiscount || savePromoMutation.isPending} className="bg-amber-600 hover:bg-amber-700" data-testid="button-save-promo">
                      {savePromoMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (lang === "ar" ? "إنشاء العرض" : "Create Offer")}
                    </Button>
                  </div>
                )}

                <ScrollArea className="h-[400px]">
                  <div className="divide-y divide-zinc-800">
                    {promotions.length === 0 ? (
                      <div className="p-8 text-center text-zinc-500">
                        <Sparkles className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
                        <p>{lang === "ar" ? "لا توجد عروض" : "No promotions yet"}</p>
                      </div>
                    ) : promotions.map((promo) => (
                      <div key={promo.id} className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors" data-testid={`row-promo-${promo.id}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${promo.isActive ? "bg-amber-500/15" : "bg-zinc-800"}`}>
                            <Percent className={`w-5 h-5 ${promo.isActive ? "text-amber-400" : "text-zinc-600"}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-200">{lang === "ar" ? promo.nameAr || promo.name : promo.name}</p>
                            <p className="text-xs text-zinc-500">
                              <span className="font-semibold text-amber-400">{promo.discountPercent}%</span> {lang === "ar" ? "خصم" : "off"} • {appliesToLabel(promo.appliesTo)}
                              {promo.expiresAt && <> • {new Date(promo.expiresAt).toLocaleDateString()}</>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => togglePromotion(promo.id)} className="hover:bg-zinc-800" data-testid={`button-toggle-promo-${promo.id}`}>
                            {promo.isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-zinc-600" />}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => deletePromotion(promo.id)} data-testid={`button-delete-promo-${promo.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            )}

            {/* PAYMENTS */}
            {activeSection === "payments" && (
              <Card className="bg-zinc-900 border-zinc-800">
                <div className="p-3 sm:p-4 border-b border-zinc-800">
                  <h3 className="font-semibold text-white flex items-center gap-2 text-sm sm:text-base">
                    <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    {lang === "ar" ? "المدفوعات" : "Payments"}
                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 ms-2 text-[10px]">{adminSubs.length}</Badge>
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 sm:p-4 border-b border-zinc-800">
                  <div className="text-center p-2 sm:p-3 rounded-lg bg-zinc-800/50">
                    <p className="text-base sm:text-lg font-bold text-white" dir="ltr">{(totalRevenue / 100).toFixed(0)}</p>
                    <p className="text-[9px] sm:text-[10px] text-zinc-500">{lang === "ar" ? "إجمالي (ر.س)" : "Total (SAR)"}</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 rounded-lg bg-zinc-800/50">
                    <p className="text-base sm:text-lg font-bold text-amber-400" dir="ltr">{(vatAmount / 100).toFixed(0)}</p>
                    <p className="text-[9px] sm:text-[10px] text-zinc-500">{lang === "ar" ? "ضريبة 15%" : "VAT 15%"}</p>
                  </div>
                  <div className="text-center p-2 sm:p-3 rounded-lg bg-zinc-800/50">
                    <p className="text-base sm:text-lg font-bold text-emerald-400" dir="ltr">{activeSubsCount}</p>
                    <p className="text-[9px] sm:text-[10px] text-zinc-500">{lang === "ar" ? "نشط" : "Active"}</p>
                  </div>
                </div>

                <ScrollArea className="h-[calc(100vh-280px)] sm:h-[400px]">
                  <div className="divide-y divide-zinc-800">
                    {adminSubs.length === 0 ? (
                      <div className="p-6 text-center text-zinc-500 text-sm">{lang === "ar" ? "لا توجد مدفوعات بعد" : "No payments yet"}</div>
                    ) : adminSubs.map((sub, i) => {
                      const amount = sub.amountCents ? (sub.amountCents / 100) : 0;
                      const vat = Math.round(amount * 0.15);
                      return (
                        <div key={sub.id} className="flex items-center justify-between p-3 sm:p-4 hover:bg-zinc-800/50 transition-colors" data-testid={`row-subscription-${i}`}>
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${sub.plan === "business" ? "bg-violet-500/20" : "bg-emerald-500/20"}`}>
                              {sub.plan === "business" ? <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" /> : <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-zinc-200 truncate">{sub.userId.slice(0, 10)}...</p>
                              <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                <Badge variant="secondary" className={`text-[9px] sm:text-[10px] ${sub.plan === "business" ? "bg-violet-500/20 text-violet-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                                  {sub.plan.toUpperCase()}
                                </Badge>
                                <span className="text-[10px] text-zinc-600">{new Date(sub.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-end shrink-0 ms-2">
                            <p className="text-xs sm:text-sm font-semibold text-white" dir="ltr">{amount.toFixed(0)} SAR</p>
                            <p className="text-[9px] sm:text-[10px] text-zinc-500" dir="ltr">+{vat.toFixed(0)} {lang === "ar" ? "ضريبة" : "VAT"}</p>
                            <Badge variant="secondary" className={`text-[9px] sm:text-[10px] mt-0.5 ${statusColor(sub.status)}`}>
                              {sub.status === "active" ? (lang === "ar" ? "نشط" : "Active") : sub.status === "pending" ? (lang === "ar" ? "معلق" : "Pending") : sub.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </Card>
            )}

            {/* GATEWAY */}
            {activeSection === "gateway" && (
              <Card className="bg-zinc-900 border-zinc-800">
                <div className="p-3 sm:p-4 border-b border-zinc-800">
                  <h3 className="font-semibold text-white flex items-center gap-2 text-sm sm:text-base">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    {lang === "ar" ? "بوابة الدفع Paymob" : "Paymob Gateway"}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-zinc-500 mt-1">{lang === "ar" ? "أدخل بيانات Paymob لتفعيل الدفع" : "Enter Paymob credentials"}</p>
                </div>
                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {paymobSettings && Object.keys(paymobSettings).length > 0 && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-sm text-emerald-400 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{lang === "ar" ? "Paymob مُفعّل ومتصل" : "Paymob configured"}</p>
                      <div className="mt-2 space-y-1 text-xs text-zinc-500">
                        {paymobSettings.api_key && <p>API Key: ••••{paymobSettings.api_key.slice(-4)}</p>}
                        {paymobSettings.integration_id && <p>Integration: {paymobSettings.integration_id}</p>}
                        {paymobSettings.iframe_id && <p>iFrame: {paymobSettings.iframe_id}</p>}
                      </div>
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-zinc-300">{lang === "ar" ? "مفتاح API" : "API Key"}</label>
                      <div className="relative">
                        <Input value={paymobApiKey} onChange={(e) => setPaymobApiKey(e.target.value)} placeholder="API Key" type={showApiKey ? "text" : "password"} className="bg-zinc-800 border-zinc-700 text-white" data-testid="input-paymob-api-key" />
                        <Button variant="ghost" size="sm" className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-zinc-500" onClick={() => setShowApiKey(!showApiKey)}>
                          {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-zinc-300">{lang === "ar" ? "معرّف التكامل" : "Integration ID"}</label>
                      <Input value={paymobIntegrationId} onChange={(e) => setPaymobIntegrationId(e.target.value)} placeholder="123456" className="bg-zinc-800 border-zinc-700 text-white" data-testid="input-paymob-integration-id" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-zinc-300">{lang === "ar" ? "معرّف الإطار" : "iFrame ID"}</label>
                      <Input value={paymobIframeId} onChange={(e) => setPaymobIframeId(e.target.value)} placeholder="789012" className="bg-zinc-800 border-zinc-700 text-white" data-testid="input-paymob-iframe-id" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-zinc-300">{lang === "ar" ? "مفتاح HMAC" : "HMAC Secret"}</label>
                      <div className="relative">
                        <Input value={paymobHmacSecret} onChange={(e) => setPaymobHmacSecret(e.target.value)} placeholder="HMAC" type={showHmac ? "text" : "password"} className="bg-zinc-800 border-zinc-700 text-white" data-testid="input-paymob-hmac" />
                        <Button variant="ghost" size="sm" className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-zinc-500" onClick={() => setShowHmac(!showHmac)}>
                          {showHmac ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => savePaymobMutation.mutate()} disabled={(!paymobApiKey && !paymobIntegrationId && !paymobIframeId && !paymobHmacSecret) || savePaymobMutation.isPending} className="bg-blue-600 hover:bg-blue-700" data-testid="button-save-paymob">
                    {savePaymobMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin me-1" /> : <Save className="w-4 h-4 me-1" />}
                    {lang === "ar" ? "حفظ الإعدادات" : "Save Settings"}
                  </Button>
                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                    <h4 className="text-sm font-medium text-zinc-300 mb-2">{lang === "ar" ? "كيفية الحصول على البيانات:" : "How to get credentials:"}</h4>
                    <ol className="text-xs text-zinc-500 space-y-1 list-decimal list-inside">
                      <li>{lang === "ar" ? "سجّل في accept.paymob.com" : "Sign up at accept.paymob.com"}</li>
                      <li>{lang === "ar" ? "Dashboard > Settings > API Key" : "Dashboard > Settings > API Key"}</li>
                      <li>{lang === "ar" ? "أنشئ Integration (Online Card)" : "Create Integration (Online Card)"}</li>
                      <li>{lang === "ar" ? "أنشئ iFrame وانسخ المعرّف" : "Create iFrame, copy ID"}</li>
                    </ol>
                    <p className="text-xs text-zinc-500 mt-2">Callback: <code className="bg-zinc-900 px-1 py-0.5 rounded text-[10px] text-zinc-400">https://arabyweb.net/api/payments/callback</code></p>
                  </div>
                </div>
              </Card>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
