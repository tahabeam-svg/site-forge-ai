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
  Pencil,
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
  Bot,
  MessageSquare,
  Brain,
  BarChart3,
  RefreshCw,
  CheckCircle,
  ThumbsUp,
  AlertTriangle,
  Network,
  UserX,
  UserCheck,
  MessageSquarePlus,
  Inbox,
  CheckCheck,
  Clock,
  Bug,
  Lightbulb,
  HelpCircle,
  Coins,
  Mail,
  Send,
  Wifi,
} from "lucide-react";

interface AdminStats { totalUsers: number; totalProjects: number; publishedProjects: number; }
interface AdminUser { id: string; email: string | null; firstName: string | null; lastName: string | null; profileImageUrl: string | null; plan?: string; credits?: number; createdAt: string | null; isSuspended?: boolean; registrationIp?: string | null; }
interface AdminProject { id: number; userId: string; name: string; description: string | null; status: string; createdAt: string; }
interface Coupon { id: number; code: string; discountType: string; discountValue: number; maxUses: number | null; usedCount: number | null; expiresAt: string | null; isActive: boolean | null; createdAt: string; }
interface PaymobSettings { api_key?: string; integration_id?: string; iframe_id?: string; hmac_secret?: string; }
interface AdminSubscription { id: number; userId: string; plan: string; status: string; paymobOrderId: string | null; amountCents: number | null; currency: string | null; startDate: string | null; endDate: string | null; createdAt: string; }
interface PricingData { pro: { price: number; credits: number }; business: { price: number; credits: number }; free: { credits: number }; }
interface Promotion { id: string; name: string; nameAr: string; discountPercent: number; appliesTo: "all" | "pro" | "business"; isActive: boolean; expiresAt: string | null; createdAt: string; }
interface FraudAccount { id: string; email: string; plan: string; is_suspended: boolean; created_at: string; last_login_ip: string | null; }
interface SuspiciousIp { ip: string; account_count: number; accounts: FraudAccount[]; }
interface FraudData { suspiciousIps: SuspiciousIp[]; recentFreeUsers: (FraudAccount & { registration_ip: string | null; project_count: number })[]; }
interface UserFeedbackItem { id: number; userId: string | null; userName: string | null; userEmail: string | null; type: string; message: string; page: string | null; status: string; adminNote: string | null; createdAt: string; }

type AdminSection = "overview" | "users" | "projects" | "coupons" | "pricing" | "promotions" | "payments" | "gateway" | "smtp" | "chatbot" | "fraud" | "feedback" | "learning" | "domains";

export default function AdminPage() {
  const { language, logout, user } = useAuth();
  const lang = language;
  const { toast } = useToast();
  const isRTL = lang === "ar";

  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const [creditsTargetUserId, setCreditsTargetUserId] = useState<string | null>(null);
  const [creditsTargetEmail, setCreditsTargetEmail] = useState<string>("");
  const [creditsAmount, setCreditsAmount] = useState("50");
  const [creditsReason, setCreditsReason] = useState("");
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
  const [testModeEnabled, setTestModeEnabled] = useState(false);

  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [showSmtpPass, setShowSmtpPass] = useState(false);

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
  const { data: smtpSettings } = useQuery<{ host: string; port: string; user: string; passConfigured: boolean; fromEnv: boolean }>({ queryKey: ["/api/admin/settings/smtp"], enabled: !statsError });
  const { data: adminSubs = [] } = useQuery<AdminSubscription[]>({ queryKey: ["/api/admin/subscriptions"], enabled: !statsError });
  const { data: adminCreditPurchases = [] } = useQuery<{id: number; userId: string; credits: number; amountCents: number; status: string; createdAt: string}[]>({ queryKey: ["/api/admin/credit-purchases"], enabled: !statsError });
  const { data: pricingData } = useQuery<PricingData>({ queryKey: ["/api/admin/pricing"], enabled: !statsError });
  const { data: promotions = [] } = useQuery<Promotion[]>({ queryKey: ["/api/admin/promotions"], enabled: !statsError });
  const { data: fraudData, isLoading: fraudLoading, refetch: refetchFraud } = useQuery<FraudData>({
    queryKey: ["/api/admin/fraud/suspicious"],
    enabled: activeSection === "fraud" && !statsError,
    staleTime: 30000,
  });
  const { data: feedbackItems = [], isLoading: feedbackLoading, refetch: refetchFeedback } = useQuery<UserFeedbackItem[]>({
    queryKey: ["/api/admin/feedback"],
    enabled: activeSection === "feedback" && !statsError,
  });
  const { data: feedbackCountData } = useQuery<{ count: number }>({
    queryKey: ["/api/admin/feedback/count"],
    enabled: !statsError,
    refetchInterval: 60000,
  });
  const newFeedbackCount = feedbackCountData?.count ?? 0;

  const { data: learningStats, isLoading: learningLoading, refetch: refetchLearning } = useQuery<any>({
    queryKey: ["/api/admin/learning-stats"],
    enabled: activeSection === "learning" && !statsError,
    staleTime: 60000,
  });

  const { data: adminDomainOrders, isLoading: domainOrdersLoading, refetch: refetchDomainOrders } = useQuery<{ domains: any[]; hosting: any[] }>({
    queryKey: ["/api/admin/domain-orders"],
    enabled: activeSection === "domains" && !statsError,
  });
  const { data: domainPricing } = useQuery<{ tlds: Record<string, any>; hosting: Record<string, any> }>({
    queryKey: ["/api/admin/settings/domains"],
    enabled: activeSection === "domains" && !statsError,
  });
  const [editingTldPrices, setEditingTldPrices] = useState<Record<string, { register: string; renew: string; transfer: string }>>({});
  const [editingHostingPrices, setEditingHostingPrices] = useState<Record<string, { monthly: string; yearly: string }>>({});
  const [domainPricingEdited, setDomainPricingEdited] = useState(false);

  useEffect(() => {
    if (pricingData) {
      setProPrice(String(pricingData.pro.price / 100));
      setBusinessPrice(String(pricingData.business.price / 100));
      setProCredits(String(pricingData.pro.credits));
      setBusinessCredits(String(pricingData.business.credits));
      setFreeCredits(String(pricingData.free.credits));
    }
  }, [pricingData]);

  useEffect(() => {
    if (domainPricing) {
      const tldEdit: Record<string, { register: string; renew: string; transfer: string }> = {};
      for (const [tld, p] of Object.entries(domainPricing.tlds || {})) {
        tldEdit[tld] = { register: String(p.register), renew: String(p.renew), transfer: String(p.transfer) };
      }
      setEditingTldPrices(tldEdit);
      const hostingEdit: Record<string, { monthly: string; yearly: string }> = {};
      for (const [pid, p] of Object.entries(domainPricing.hosting || {})) {
        hostingEdit[pid] = { monthly: String((p as any).monthly), yearly: String((p as any).yearly) };
      }
      setEditingHostingPrices(hostingEdit);
    }
  }, [domainPricing]);

  const saveDomainPricingMutation = useMutation({
    mutationFn: async () => {
      const tlds: Record<string, any> = {};
      for (const [tld, p] of Object.entries(editingTldPrices)) {
        tlds[tld] = { register: parseInt(p.register) || 0, renew: parseInt(p.renew) || 0, transfer: parseInt(p.transfer) || 0 };
      }
      const hosting: Record<string, any> = {};
      for (const [pid, p] of Object.entries(editingHostingPrices)) {
        hosting[pid] = { monthly: parseInt(p.monthly) || 0, yearly: parseInt(p.yearly) || 0 };
      }
      await apiRequest("PUT", "/api/admin/settings/domains", { tlds, hosting });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/domains"] });
      queryClient.invalidateQueries({ queryKey: ["/api/domains/catalog"] });
      setDomainPricingEdited(false);
      toast({ title: lang === "ar" ? "✅ تم حفظ الأسعار" : "✅ Prices saved" });
    },
    onError: () => toast({ title: lang === "ar" ? "فشل حفظ الأسعار" : "Failed to save prices", variant: "destructive" }),
  });

  const updateDomainOrderMutation = useMutation({
    mutationFn: async ({ id, type, status }: { id: number; type: string; status: string }) => {
      await apiRequest("PATCH", `/api/admin/domain-orders/${id}?type=${type}`, { status });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/domain-orders"] }); refetchDomainOrders(); toast({ title: lang === "ar" ? "تم تحديث الطلب" : "Order updated" }); },
  });

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

  const impersonateMutation = useMutation({
    mutationFn: async (userId: string) => apiRequest("POST", `/api/admin/impersonate/${userId}`),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/impersonation-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      window.location.href = "/dashboard";
    },
    onError: (err: any) => {
      toast({ title: lang === "ar" ? "فشل الدخول" : "Access failed", description: err?.message, variant: "destructive" });
    },
  });

  const addCreditsMutation = useMutation({
    mutationFn: async ({ userId, amount, reason }: { userId: string; amount: number; reason?: string }) =>
      apiRequest("POST", `/api/admin/users/${userId}/credits`, { amount, reason }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setCreditsTargetUserId(null);
      setCreditsAmount("50");
      setCreditsReason("");
      toast({ title: lang === "ar" ? `تم إضافة ${data?.added} جلسة` : `Added ${data?.added} credits`, description: lang === "ar" ? `الرصيد الجديد: ${data?.newBalance}` : `New balance: ${data?.newBalance}` });
    },
    onError: () => { toast({ title: lang === "ar" ? "فشل إضافة الرصيد" : "Failed to add credits", variant: "destructive" }); },
  });

  const suspendUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      await apiRequest("PATCH", `/api/admin/users/${userId}/suspend`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fraud/suspicious"] });
      toast({ title: lang === "ar" ? "تم تعليق الحساب" : "Account suspended" });
    },
    onError: () => { toast({ title: lang === "ar" ? "فشل التعليق" : "Suspend failed", variant: "destructive" }); },
  });

  const unsuspendUserMutation = useMutation({
    mutationFn: async (userId: string) => { await apiRequest("PATCH", `/api/admin/users/${userId}/unsuspend`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fraud/suspicious"] });
      toast({ title: lang === "ar" ? "تم رفع التعليق" : "Account unsuspended" });
    },
  });

  const suspendIpMutation = useMutation({
    mutationFn: async ({ ip, reason }: { ip: string; reason?: string }) => {
      return await apiRequest("POST", `/api/admin/fraud/suspend-ip`, { ip, reason });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fraud/suspicious"] });
      toast({ title: lang === "ar" ? `تم تعليق جميع الحسابات من هذا IP` : `All accounts from this IP suspended` });
    },
    onError: () => { toast({ title: lang === "ar" ? "فشل التعليق الجماعي" : "Bulk suspend failed", variant: "destructive" }); },
  });

  const { data: paymentConfig } = useQuery<{ configured: boolean; testMode: boolean }>({ queryKey: ["/api/payments/config"], enabled: !statsError });
  useEffect(() => { if (paymentConfig) setTestModeEnabled(paymentConfig.testMode); }, [paymentConfig]);

  const savePaymobMutation = useMutation({
    mutationFn: async () => { const body: Record<string, string> = {}; if (paymobApiKey) body.apiKey = paymobApiKey; if (paymobIntegrationId) body.integrationId = paymobIntegrationId; if (paymobIframeId) body.iframeId = paymobIframeId; if (paymobHmacSecret) body.hmacSecret = paymobHmacSecret; await apiRequest("PUT", "/api/admin/settings/paymob", body); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/paymob"] }); setPaymobApiKey(""); setPaymobIntegrationId(""); setPaymobIframeId(""); setPaymobHmacSecret(""); toast({ title: lang === "ar" ? "تم حفظ إعدادات Paymob" : "Paymob settings saved" }); },
    onError: () => { toast({ title: lang === "ar" ? "فشل حفظ الإعدادات" : "Failed to save settings", variant: "destructive" }); },
  });

  const toggleTestModeMutation = useMutation({
    mutationFn: async (enabled: boolean) => { await apiRequest("POST", "/api/admin/settings/paymob/test-mode", { enabled }); return enabled; },
    onSuccess: (enabled) => { setTestModeEnabled(enabled); queryClient.invalidateQueries({ queryKey: ["/api/payments/config"] }); toast({ title: lang === "ar" ? (enabled ? "تم تفعيل وضع الاختبار" : "تم إيقاف وضع الاختبار") : (enabled ? "Test mode enabled" : "Test mode disabled") }); },
    onError: () => { toast({ title: lang === "ar" ? "فشل تحديث وضع الاختبار" : "Failed to update test mode", variant: "destructive" }); },
  });

  const [paymobTestResult, setPaymobTestResult] = useState<{ ok: boolean; message: string; httpStatus?: number } | null>(null);
  const testPaymobConnectionMutation = useMutation({
    mutationFn: async () => { const res = await apiRequest("POST", "/api/admin/settings/paymob/test-connection", {}); return res as any; },
    onSuccess: (data: any) => {
      setPaymobTestResult(data);
      toast({
        title: data.ok ? (lang === "ar" ? "✅ اتصال ناجح بـ Paymob" : "✅ Paymob connected") : (lang === "ar" ? "❌ فشل الاتصال بـ Paymob" : "❌ Paymob connection failed"),
        description: data.message,
        variant: data.ok ? "default" : "destructive",
      });
    },
    onError: (e: any) => { toast({ title: lang === "ar" ? "خطأ في الاختبار" : "Test error", description: e.message, variant: "destructive" }); },
  });

  const saveSmtpMutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, string> = {};
      if (smtpHost) body.host = smtpHost;
      if (smtpPort) body.port = smtpPort;
      if (smtpUser) body.user = smtpUser;
      if (smtpPass) body.pass = smtpPass;
      await apiRequest("PUT", "/api/admin/settings/smtp", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/smtp"] });
      setSmtpPass("");
      toast({ title: lang === "ar" ? "تم حفظ إعدادات البريد" : "SMTP settings saved" });
    },
    onError: () => { toast({ title: lang === "ar" ? "فشل حفظ إعدادات SMTP" : "Failed to save SMTP settings", variant: "destructive" }); },
  });

  const testSmtpMutation = useMutation({
    mutationFn: async () => { const r = await apiRequest("POST", "/api/admin/settings/smtp/test", {}); return r.json(); },
    onSuccess: (data: any) => { toast({ title: lang === "ar" ? "✅ تم إرسال رسالة الاختبار" : "✅ Test email sent", description: data.message }); },
    onError: (err: any) => { toast({ title: lang === "ar" ? "❌ فشل إرسال الاختبار" : "❌ Test failed", description: err.message, variant: "destructive" }); },
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
    { key: "smtp", icon: Mail, label: "Email/SMTP", labelAr: "البريد الإلكتروني" },
    { key: "chatbot", icon: Bot, label: "Chatbot AI", labelAr: "الشاتبوت الذكي" },
    { key: "fraud", icon: AlertTriangle, label: "Anti-Fraud", labelAr: "مكافحة الاحتيال" },
    { key: "feedback", icon: MessageSquarePlus, label: "Feedback", labelAr: "بلاغات المستخدمين" },
    { key: "learning", icon: Brain, label: "AI Learning", labelAr: "التعلم الذكي" },
    { key: "domains", icon: Globe2, label: "Domains", labelAr: "الدومينات" },
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
              <img src="/logo.png" alt="ArabyWeb" className="w-8 h-8 object-contain rounded-lg" />
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
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-start">{lang === "ar" ? item.labelAr : item.label}</span>
                {item.key === "feedback" && newFeedbackCount > 0 && (
                  <span className="ms-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                    {newFeedbackCount}
                  </span>
                )}
                {activeSection === item.key && item.key !== "feedback" && <Chevron className="w-3 h-3 ms-auto" />}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-zinc-800">
            <div className="px-3 py-2 rounded-lg bg-zinc-800/50">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{lang === "ar" ? "المشرف" : "Admin"}</p>
              <p className="text-xs text-zinc-300 mt-0.5 truncate">{(user as any)?.email || "admin"}</p>
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
                    { label: lang === "ar" ? "إعدادات البريد" : "Email Settings", icon: Mail, section: "smtp" as AdminSection, color: "from-emerald-600 to-teal-700" },
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
                            {user.credits !== undefined && (
                              <p className="text-[10px] text-amber-400">{lang === "ar" ? `${user.credits} جلسة` : `${user.credits} credits`}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0 ms-2">
                          <span className="text-[10px] sm:text-xs text-zinc-500 hidden sm:inline">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</span>
                          <Button
                            variant="ghost" size="sm"
                            className="text-amber-400 h-7 px-1.5 sm:h-8 sm:px-2 text-[10px] sm:text-xs gap-1"
                            onClick={() => { setCreditsTargetUserId(user.id); setCreditsTargetEmail(user.email || user.id.slice(0, 8)); }}
                            data-testid={`button-add-credits-user-${i}`}
                            title={lang === "ar" ? "إضافة رصيد" : "Add credits"}
                          >
                            <Coins className="w-3 h-3" />
                            <span className="hidden sm:inline">{lang === "ar" ? "رصيد" : "Credits"}</span>
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="text-blue-400 h-7 px-1.5 sm:h-8 sm:px-2 text-[10px] sm:text-xs gap-1"
                            onClick={() => impersonateMutation.mutate(user.id)}
                            disabled={impersonateMutation.isPending}
                            data-testid={`button-impersonate-user-${i}`}
                            title={lang === "ar" ? "دخول الحساب" : "Access account"}
                          >
                            <LogOut className="w-3 h-3 rotate-180" />
                            <span className="hidden sm:inline">{lang === "ar" ? "دخول" : "Enter"}</span>
                          </Button>
                          {user.isSuspended ? (
                            <Button variant="ghost" size="sm" className="text-emerald-400 h-7 w-7 sm:h-8 sm:w-8 p-0" onClick={() => unsuspendUserMutation.mutate(user.id)} data-testid={`button-unsuspend-user-${i}`} title={lang === "ar" ? "رفع التعليق" : "Unsuspend"}>
                              <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" className="text-red-400 h-7 w-7 sm:h-8 sm:w-8 p-0" onClick={() => suspendUserMutation.mutate({ userId: user.id, reason: lang === "ar" ? "قرار إداري" : "Admin action" })} data-testid={`button-suspend-user-${i}`} title={lang === "ar" ? "تعليق الحساب" : "Suspend"}>
                              <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                          )}
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

            {/* CREDIT PURCHASES */}
            {activeSection === "payments" && adminCreditPurchases.length > 0 && (
              <Card className="bg-zinc-900 border-zinc-800">
                <div className="p-3 sm:p-4 border-b border-zinc-800">
                  <h3 className="font-semibold text-white flex items-center gap-2 text-sm sm:text-base">
                    <Coins className="w-4 h-4 text-violet-400" />
                    {lang === "ar" ? "مشتريات النقاط" : "Credit Purchases"}
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {adminCreditPurchases.filter(p => p.status === "completed").length} {lang === "ar" ? "مكتمل" : "completed"} • {(adminCreditPurchases.filter(p => p.status === "completed").reduce((s, p) => s + p.amountCents, 0) / 100).toFixed(0)} {lang === "ar" ? "ر.س" : "SAR"} {lang === "ar" ? "إجمالي" : "total"}
                  </p>
                </div>
                <ScrollArea className="h-[250px]">
                  <div className="divide-y divide-zinc-800">
                    {adminCreditPurchases.map((p, i) => (
                      <div key={p.id} className="flex items-center justify-between p-3 hover:bg-zinc-800/50 transition-colors" data-testid={`row-credit-purchase-${i}`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                            <Coins className="w-3.5 h-3.5 text-violet-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-zinc-200 truncate">{p.userId.slice(0, 10)}...</p>
                            <p className="text-[10px] text-zinc-500">{new Date(p.createdAt).toLocaleDateString()} • +{p.credits} {lang === "ar" ? "نقطة" : "cr"}</p>
                          </div>
                        </div>
                        <div className="text-end shrink-0 ms-2">
                          <p className="text-xs font-semibold text-white" dir="ltr">{(p.amountCents / 100).toFixed(0)} SAR</p>
                          <Badge variant="secondary" className={`text-[9px] mt-0.5 ${p.status === "completed" ? "bg-emerald-500/20 text-emerald-400" : p.status === "pending" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
                            {p.status === "completed" ? (lang === "ar" ? "مكتمل" : "Done") : p.status === "pending" ? (lang === "ar" ? "معلق" : "Pending") : (lang === "ar" ? "فشل" : "Failed")}
                          </Badge>
                        </div>
                      </div>
                    ))}
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
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <Button onClick={() => savePaymobMutation.mutate()} disabled={(!paymobApiKey && !paymobIntegrationId && !paymobIframeId && !paymobHmacSecret) || savePaymobMutation.isPending} className="bg-blue-600 hover:bg-blue-700" data-testid="button-save-paymob">
                      {savePaymobMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin me-1" /> : <Save className="w-4 h-4 me-1" />}
                      {lang === "ar" ? "حفظ الإعدادات" : "Save Settings"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { setPaymobTestResult(null); testPaymobConnectionMutation.mutate(); }}
                      disabled={testPaymobConnectionMutation.isPending}
                      className="border-zinc-600 text-zinc-300 hover:text-white hover:bg-zinc-800"
                      data-testid="button-test-paymob"
                    >
                      {testPaymobConnectionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin me-1" /> : <Wifi className="w-4 h-4 me-1" />}
                      {lang === "ar" ? "اختبار الاتصال" : "Test Connection"}
                    </Button>
                    <button
                      onClick={() => toggleTestModeMutation.mutate(!testModeEnabled)}
                      disabled={toggleTestModeMutation.isPending}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${testModeEnabled ? "bg-amber-500/10 border-amber-500/40 text-amber-400" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"}`}
                      data-testid="button-toggle-test-mode"
                    >
                      {testModeEnabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      {lang === "ar" ? (testModeEnabled ? "وضع الاختبار: مفعّل" : "وضع الاختبار: معطّل") : (testModeEnabled ? "Test Mode: ON" : "Test Mode: OFF")}
                    </button>
                  </div>
                  {paymobTestResult && (
                    <div className={`p-3 rounded-lg border text-sm ${paymobTestResult.ok ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-red-500/10 border-red-500/30 text-red-300"}`}>
                      <p className="font-medium">{paymobTestResult.ok ? (lang === "ar" ? "✅ الاتصال يعمل بشكل صحيح" : "✅ Connection OK") : (lang === "ar" ? "❌ فشل الاتصال" : "❌ Connection Failed")}</p>
                      <p className="text-xs mt-1 opacity-80">{paymobTestResult.message}</p>
                      {paymobTestResult.httpStatus && <p className="text-xs mt-0.5 opacity-60">HTTP {paymobTestResult.httpStatus}</p>}
                    </div>
                  )}
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

            {/* ─── SMTP / Email Section ─────────────────────────────────────── */}
            {activeSection === "smtp" && (
              <Card className="bg-zinc-900 border-zinc-800">
                <div className="p-3 sm:p-4 border-b border-zinc-800">
                  <h3 className="font-semibold text-white flex items-center gap-2 text-sm sm:text-base">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                    {lang === "ar" ? "إعدادات البريد الإلكتروني SMTP" : "Email / SMTP Settings"}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-zinc-500 mt-1">
                    {lang === "ar" ? "أدخل بيانات SMTP لتفعيل الإشعارات التلقائية" : "Enter SMTP credentials to enable automatic email notifications"}
                  </p>
                </div>
                <div className="p-3 sm:p-4 space-y-4">
                  {smtpSettings?.fromEnv && (
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <p className="text-sm text-blue-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {lang === "ar" ? "SMTP مُهيَّأ من متغيرات البيئة (env vars) — الأولوية للإعدادات البيئية." : "SMTP configured via environment variables — env vars take priority."}
                      </p>
                    </div>
                  )}
                  {smtpSettings && !smtpSettings.fromEnv && smtpSettings.host && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-sm text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {lang === "ar" ? "SMTP مُفعّل ومتصل" : "SMTP configured and active"}
                      </p>
                      <div className="mt-2 space-y-1 text-xs text-zinc-500">
                        <p>Host: {smtpSettings.host}:{smtpSettings.port}</p>
                        <p>User: {smtpSettings.user}</p>
                        <p>Password: {smtpSettings.passConfigured ? "••••••••" : lang === "ar" ? "غير مُعيَّنة" : "Not set"}</p>
                      </div>
                    </div>
                  )}

                  {/* Sender accounts info */}
                  <div className="p-3 rounded-lg bg-zinc-800/60 border border-zinc-700/50">
                    <h4 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {lang === "ar" ? "عناوين الإرسال المُعدَّة مسبقاً" : "Preconfigured Sender Addresses"}
                    </h4>
                    <div className="space-y-1.5 text-xs text-zinc-500">
                      {[
                        ["noreply@arabyweb.net", lang === "ar" ? "الترحيب، التحقق، إعادة كلمة المرور، الأمان" : "Welcome, verification, password reset, security"],
                        ["bills@arabyweb.net", lang === "ar" ? "الدفع، الاشتراكات، الرصيد" : "Payments, subscriptions, credits"],
                        ["support@arabyweb.net", lang === "ar" ? "ردود الدعم الفني" : "Support replies"],
                        ["info@arabyweb.net", lang === "ar" ? "الإعلانات والتحديثات" : "Announcements & updates"],
                        ["privacy@arabyweb.net", lang === "ar" ? "تنبيهات النظام" : "System alerts"],
                      ].map(([email, desc]) => (
                        <div key={email} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-mono shrink-0">{email}</span>
                          <span>— {desc}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-zinc-600 mt-2">
                      {lang === "ar"
                        ? "يجب تكوين هذه الحسابات كـ Aliases أو صناديق بريد في مزود الاستضافة، وتوجيه الإرسال عبر SMTP بوصفها مُرسِلاً واحداً."
                        : "Configure these as aliases or inboxes in your hosting provider, sending via a single SMTP sender."}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-zinc-300">{lang === "ar" ? "خادم SMTP (Host)" : "SMTP Host"}</label>
                      <Input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder={smtpSettings?.host || "mail.arabyweb.net"} className="bg-zinc-800 border-zinc-700 text-white" data-testid="input-smtp-host" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-zinc-300">{lang === "ar" ? "المنفذ (Port)" : "Port"}</label>
                      <Input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder={smtpSettings?.port || "587"} className="bg-zinc-800 border-zinc-700 text-white" data-testid="input-smtp-port" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-zinc-300">{lang === "ar" ? "اسم المستخدم (البريد)" : "Username (Email)"}</label>
                      <Input value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder={smtpSettings?.user || "noreply@arabyweb.net"} className="bg-zinc-800 border-zinc-700 text-white" data-testid="input-smtp-user" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-zinc-300">{lang === "ar" ? "كلمة مرور البريد" : "Email Password"}</label>
                      <div className="relative">
                        <Input value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} placeholder={smtpSettings?.passConfigured ? "••••••••" : lang === "ar" ? "كلمة المرور" : "Password"} type={showSmtpPass ? "text" : "password"} className="bg-zinc-800 border-zinc-700 text-white" data-testid="input-smtp-pass" />
                        <Button variant="ghost" size="sm" className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-zinc-500" onClick={() => setShowSmtpPass(!showSmtpPass)}>
                          {showSmtpPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <Button onClick={() => saveSmtpMutation.mutate()} disabled={(!smtpHost && !smtpUser && !smtpPass) || saveSmtpMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700" data-testid="button-save-smtp">
                      {saveSmtpMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin me-1" /> : <Save className="w-4 h-4 me-1" />}
                      {lang === "ar" ? "حفظ الإعدادات" : "Save Settings"}
                    </Button>
                    <Button variant="outline" onClick={() => testSmtpMutation.mutate()} disabled={testSmtpMutation.isPending} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" data-testid="button-test-smtp">
                      {testSmtpMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin me-1" /> : <Send className="w-4 h-4 me-1" />}
                      {lang === "ar" ? "إرسال رسالة اختبار" : "Send Test Email"}
                    </Button>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                    <h4 className="text-sm font-medium text-zinc-300 mb-2">{lang === "ar" ? "إعدادات Hosting بريد Arabyweb.net:" : "Arabyweb.net Email Hosting Setup:"}</h4>
                    <ol className="text-xs text-zinc-500 space-y-1 list-decimal list-inside">
                      <li>{lang === "ar" ? "سجّل دخولك إلى لوحة cPanel أو Plesk" : "Log in to cPanel or Plesk"}</li>
                      <li>{lang === "ar" ? "Email Accounts → أنشئ حسابات البريد المطلوبة" : "Email Accounts → Create the required email accounts"}</li>
                      <li>{lang === "ar" ? "Host: mail.arabyweb.net | Port: 587 (TLS) أو 465 (SSL)" : "Host: mail.arabyweb.net | Port: 587 (TLS) or 465 (SSL)"}</li>
                      <li>{lang === "ar" ? "استخدم noreply@arabyweb.net للإرسال الرئيسي" : "Use noreply@arabyweb.net as main sender"}</li>
                    </ol>
                  </div>
                </div>
              </Card>
            )}

            {/* ─── Chatbot Section ──────────────────────────────────────────── */}
            {activeSection === "chatbot" && (
              <ChatbotAdminSection lang={lang} toast={toast} />
            )}

            {/* ─── Feedback Section ─────────────────────────────────────────── */}
            {activeSection === "feedback" && (
              <FeedbackAdminSection
                items={feedbackItems}
                loading={feedbackLoading}
                lang={lang}
                onRefresh={() => { refetchFeedback(); queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback/count"] }); }}
              />
            )}

            {/* ─── AI Learning Section ──────────────────────────────────────── */}
            {activeSection === "learning" && (
              <LearningAdminSection
                data={learningStats}
                loading={learningLoading}
                lang={lang}
                onRefresh={() => refetchLearning()}
              />
            )}

            {/* ─── Domains & Hosting Section ────────────────────────────────── */}
            {activeSection === "domains" && (
              <div className="space-y-6 p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Globe2 className="w-5 h-5 text-emerald-400" />
                    {isRTL ? "إدارة الدومينات والاستضافة" : "Domains & Hosting Management"}
                  </h2>
                  <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2"
                    onClick={() => refetchDomainOrders()} disabled={domainOrdersLoading} data-testid="button-refresh-domain-orders">
                    <RefreshCw className={`w-4 h-4 ${domainOrdersLoading ? "animate-spin" : ""}`} />
                    {isRTL ? "تحديث" : "Refresh"}
                  </Button>
                </div>

                {/* ── TLD Pricing ── */}
                <Card className="bg-zinc-900 border-zinc-800">
                  <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Tag className="w-4 h-4 text-blue-400" />
                      {isRTL ? "أسعار الدومينات (ر.س)" : "Domain Prices (SAR)"}
                    </h3>
                    {domainPricingEdited && (
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                        onClick={() => saveDomainPricingMutation.mutate()} disabled={saveDomainPricingMutation.isPending} data-testid="button-save-domain-pricing">
                        {saveDomainPricingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isRTL ? "حفظ الأسعار" : "Save Prices"}
                      </Button>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-zinc-800 text-zinc-400">
                            <th className="text-start py-2 px-2">{isRTL ? "الامتداد" : "TLD"}</th>
                            <th className="text-center py-2 px-2">{isRTL ? "التسجيل" : "Register"}</th>
                            <th className="text-center py-2 px-2">{isRTL ? "التجديد" : "Renew"}</th>
                            <th className="text-center py-2 px-2">{isRTL ? "النقل" : "Transfer"}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(editingTldPrices).map(([tld, prices]) => (
                            <tr key={tld} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                              <td className="py-2 px-2 font-bold text-emerald-400">{tld}</td>
                              {(["register", "renew", "transfer"] as const).map(field => (
                                <td key={field} className="py-2 px-2 text-center">
                                  <Input
                                    type="number"
                                    value={prices[field]}
                                    onChange={e => {
                                      setEditingTldPrices(prev => ({ ...prev, [tld]: { ...prev[tld], [field]: e.target.value } }));
                                      setDomainPricingEdited(true);
                                    }}
                                    className="h-8 w-20 text-center bg-zinc-800 border-zinc-700 text-white mx-auto"
                                    data-testid={`input-tld-${tld.replace(".", "")}-${field}`}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card>

                {/* ── Hosting Plan Pricing ── */}
                <Card className="bg-zinc-900 border-zinc-800">
                  <div className="p-4 border-b border-zinc-800">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      {isRTL ? "أسعار خطط الاستضافة (ر.س)" : "Hosting Plan Prices (SAR)"}
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid sm:grid-cols-3 gap-4">
                      {Object.entries(editingHostingPrices).map(([planId, prices]) => (
                        <div key={planId} className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                          <p className="font-semibold text-white capitalize">{planId}</p>
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs text-zinc-400 block mb-1">{isRTL ? "الشهري (ر.س)" : "Monthly (SAR)"}</label>
                              <Input type="number" value={prices.monthly}
                                onChange={e => { setEditingHostingPrices(prev => ({ ...prev, [planId]: { ...prev[planId], monthly: e.target.value } })); setDomainPricingEdited(true); }}
                                className="h-8 bg-zinc-800 border-zinc-700 text-white" data-testid={`input-hosting-${planId}-monthly`} />
                            </div>
                            <div>
                              <label className="text-xs text-zinc-400 block mb-1">{isRTL ? "السنوي (ر.س)" : "Yearly (SAR)"}</label>
                              <Input type="number" value={prices.yearly}
                                onChange={e => { setEditingHostingPrices(prev => ({ ...prev, [planId]: { ...prev[planId], yearly: e.target.value } })); setDomainPricingEdited(true); }}
                                className="h-8 bg-zinc-800 border-zinc-700 text-white" data-testid={`input-hosting-${planId}-yearly`} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {domainPricingEdited && (
                      <div className="mt-4 flex justify-end">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                          onClick={() => saveDomainPricingMutation.mutate()} disabled={saveDomainPricingMutation.isPending}>
                          {saveDomainPricingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          {isRTL ? "حفظ جميع الأسعار" : "Save All Prices"}
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>

                {/* ── Domain Orders ── */}
                <Card className="bg-zinc-900 border-zinc-800">
                  <div className="p-4 border-b border-zinc-800">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Globe2 className="w-4 h-4 text-blue-400" />
                      {isRTL ? `طلبات الدومينات (${adminDomainOrders?.domains?.length ?? 0})` : `Domain Orders (${adminDomainOrders?.domains?.length ?? 0})`}
                    </h3>
                  </div>
                  <div className="divide-y divide-zinc-800">
                    {domainOrdersLoading ? (
                      <div className="p-6 text-center text-zinc-500"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
                    ) : !adminDomainOrders?.domains?.length ? (
                      <div className="p-6 text-center text-zinc-500 text-sm">{isRTL ? "لا توجد طلبات دومينات" : "No domain orders yet"}</div>
                    ) : adminDomainOrders.domains.map((order: any) => (
                      <div key={order.id} className="p-4 flex flex-wrap items-center justify-between gap-3" data-testid={`admin-domain-order-${order.id}`}>
                        <div>
                          <p className="font-semibold text-white">{order.domain}</p>
                          <p className="text-xs text-zinc-400">{order.customerEmail} · {order.type} · {order.years}yr · {order.priceAr} SAR</p>
                          <p className="text-xs text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${{ pending: "bg-yellow-500/20 text-yellow-400", paid: "bg-blue-500/20 text-blue-400", active: "bg-emerald-500/20 text-emerald-400", failed: "bg-red-500/20 text-red-400" }[order.status] || "bg-zinc-500/20 text-zinc-400"}`}>
                            {order.status}
                          </span>
                          <select
                            className="text-xs bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1 cursor-pointer"
                            value={order.status}
                            onChange={e => updateDomainOrderMutation.mutate({ id: order.id, type: "domain", status: e.target.value })}
                            data-testid={`select-domain-status-${order.id}`}
                          >
                            {["pending", "paid", "active", "failed", "cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* ── Hosting Orders ── */}
                <Card className="bg-zinc-900 border-zinc-800">
                  <div className="p-4 border-b border-zinc-800">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-violet-400" />
                      {isRTL ? `طلبات الاستضافة (${adminDomainOrders?.hosting?.length ?? 0})` : `Hosting Orders (${adminDomainOrders?.hosting?.length ?? 0})`}
                    </h3>
                  </div>
                  <div className="divide-y divide-zinc-800">
                    {domainOrdersLoading ? (
                      <div className="p-6 text-center text-zinc-500"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
                    ) : !adminDomainOrders?.hosting?.length ? (
                      <div className="p-6 text-center text-zinc-500 text-sm">{isRTL ? "لا توجد طلبات استضافة" : "No hosting orders yet"}</div>
                    ) : adminDomainOrders.hosting.map((order: any) => (
                      <div key={order.id} className="p-4 flex flex-wrap items-center justify-between gap-3" data-testid={`admin-hosting-order-${order.id}`}>
                        <div>
                          <p className="font-semibold text-white capitalize">{order.planId} Plan</p>
                          <p className="text-xs text-zinc-400">{order.customerEmail} · {order.billingCycle} · {order.domainName || "—"} · {order.priceAr} SAR</p>
                          <p className="text-xs text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${{ pending: "bg-yellow-500/20 text-yellow-400", paid: "bg-blue-500/20 text-blue-400", active: "bg-emerald-500/20 text-emerald-400", failed: "bg-red-500/20 text-red-400" }[order.status] || "bg-zinc-500/20 text-zinc-400"}`}>
                            {order.status}
                          </span>
                          <select
                            className="text-xs bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1 cursor-pointer"
                            value={order.status}
                            onChange={e => updateDomainOrderMutation.mutate({ id: order.id, type: "hosting", status: e.target.value })}
                            data-testid={`select-hosting-status-${order.id}`}
                          >
                            {["pending", "paid", "active", "failed", "cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ─── Anti-Fraud Section ───────────────────────────────────────── */}
            {activeSection === "fraud" && (
              <div className="space-y-6">
                <Card className="bg-zinc-900 border-zinc-800">
                  <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      {isRTL ? "مكافحة الاحتيال — اكتشاف الحسابات المتعددة" : "Anti-Fraud — Multi-Account Detection"}
                    </h3>
                    <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2"
                      onClick={() => refetchFraud()} disabled={fraudLoading} data-testid="button-refresh-fraud">
                      <RefreshCw className={`w-4 h-4 ${fraudLoading ? "animate-spin" : ""}`} />
                      {isRTL ? "تحديث" : "Refresh"}
                    </Button>
                  </div>
                  <div className="p-4 bg-amber-500/5 border-b border-amber-500/20">
                    <div className="flex gap-3 text-sm text-amber-300/80">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                      <div>
                        {isRTL
                          ? "يتم تتبع عنوان IP عند التسجيل. الحد الأقصى: 3 حسابات لكل IP خلال 24 ساعة. الحسابات المعلقة لا تستطيع تسجيل الدخول."
                          : "IP is tracked on registration. Max: 3 accounts per IP per 24h. Suspended accounts cannot log in."}
                      </div>
                    </div>
                  </div>
                </Card>

                {fraudLoading ? (
                  <div className="flex items-center justify-center p-16"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>
                ) : (
                  <>
                    {/* Suspicious IPs */}
                    <Card className="bg-zinc-900 border-zinc-800">
                      <div className="p-4 border-b border-zinc-800">
                        <h4 className="font-semibold text-white flex items-center gap-2 text-sm">
                          <Network className="w-4 h-4 text-red-400" />
                          {isRTL ? "عناوين IP مشبوهة (أكثر من حساب)" : "Suspicious IPs (multiple accounts)"}
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 ms-2">{fraudData?.suspiciousIps?.length ?? 0}</Badge>
                        </h4>
                      </div>
                      {!fraudData?.suspiciousIps?.length ? (
                        <div className="p-8 text-center text-zinc-500">
                          <CheckCircle className="w-10 h-10 mx-auto mb-3 text-emerald-600" />
                          <p className="text-sm">{isRTL ? "لا توجد عناوين IP مشبوهة حالياً" : "No suspicious IPs detected"}</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-zinc-800">
                          {fraudData.suspiciousIps.map((entry) => (
                            <div key={entry.ip} className="p-4">
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <p className="font-mono text-sm text-amber-300 flex items-center gap-2">
                                  <Network className="w-3.5 h-3.5" />
                                  {entry.ip}
                                  <span className="text-zinc-500 font-sans text-xs">({entry.account_count} {isRTL ? "حسابات" : "accounts"})</span>
                                </p>
                                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1 shrink-0 text-xs"
                                  onClick={() => suspendIpMutation.mutate({ ip: entry.ip, reason: isRTL ? `IP مشبوه (${entry.ip})` : `Fraud: shared IP (${entry.ip})` })}
                                  disabled={suspendIpMutation.isPending} data-testid={`button-suspend-ip-${entry.ip}`}>
                                  <UserX className="w-3 h-3" />
                                  {isRTL ? "تعليق الكل" : "Suspend All"}
                                </Button>
                              </div>
                              <div className="grid gap-2">
                                {entry.accounts.map((acc: FraudAccount) => (
                                  <div key={acc.id} className="flex items-center justify-between bg-zinc-800/50 rounded-lg px-3 py-2 gap-2">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs text-zinc-200 truncate">{acc.email}</p>
                                      <p className="text-[10px] text-zinc-500">
                                        {new Date(acc.created_at).toLocaleDateString(isRTL ? "ar-SA" : "en-US")}
                                        {acc.last_login_ip && acc.last_login_ip !== entry.ip && (
                                          <span className="text-amber-500 ms-2">{isRTL ? "آخر دخول:" : "last login:"} {acc.last_login_ip}</span>
                                        )}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <Badge className={acc.plan === "free" ? "bg-zinc-700 text-zinc-300 text-[10px]" : "bg-emerald-500/20 text-emerald-400 text-[10px]"}>{acc.plan}</Badge>
                                      {acc.is_suspended ? (
                                        <Badge className="bg-red-500/20 text-red-400 text-[10px]">{isRTL ? "معلق" : "Suspended"}</Badge>
                                      ) : (
                                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                                          onClick={() => suspendUserMutation.mutate({ userId: acc.id, reason: isRTL ? `احتيال: IP مشترك (${entry.ip})` : `Fraud: shared IP (${entry.ip})` })}
                                          disabled={suspendUserMutation.isPending} data-testid={`button-suspend-fraud-${acc.id}`}>
                                          <Ban className="w-3 h-3" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>

                    {/* Recent free users (last 48h) */}
                    <Card className="bg-zinc-900 border-zinc-800">
                      <div className="p-4 border-b border-zinc-800">
                        <h4 className="font-semibold text-white flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-blue-400" />
                          {isRTL ? "مستخدمو الخطة المجانية (آخر 48 ساعة)" : "Recent Free Users (last 48h)"}
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 ms-2">{fraudData?.recentFreeUsers?.length ?? 0}</Badge>
                        </h4>
                      </div>
                      {!fraudData?.recentFreeUsers?.length ? (
                        <div className="p-8 text-center text-zinc-500">
                          <Users className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
                          <p className="text-sm">{isRTL ? "لا يوجد مستخدمون جدد في الـ 48 ساعة الماضية" : "No new free users in the last 48h"}</p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[400px]">
                          <div className="divide-y divide-zinc-800">
                            {fraudData.recentFreeUsers.map((user: FraudAccount & { registration_ip: string | null; project_count: number }, i: number) => (
                              <div key={user.id} className="flex items-center justify-between p-3 hover:bg-zinc-800/40 transition-colors" data-testid={`row-fraud-user-${i}`}>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm text-zinc-200 truncate">{user.email}</p>
                                  <p className="text-[10px] text-zinc-500 font-mono flex flex-wrap gap-2">
                                    {user.registration_ip && <span className="text-blue-400">{user.registration_ip}</span>}
                                    <span>{new Date(user.created_at).toLocaleString(isRTL ? "ar-SA" : "en-US")}</span>
                                    <span className="text-emerald-400">{user.project_count} {isRTL ? "مشاريع" : "projects"}</span>
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ms-2">
                                  {user.is_suspended ? (
                                    <Badge className="bg-red-500/20 text-red-400 text-[10px]">{isRTL ? "معلق" : "Suspended"}</Badge>
                                  ) : (
                                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                      onClick={() => suspendUserMutation.mutate({ userId: user.id, reason: isRTL ? "مشبوه: حساب مجاني جديد" : "Suspicious: new free account" })}
                                      disabled={suspendUserMutation.isPending} data-testid={`button-suspend-recent-${i}`}>
                                      <Ban className="w-3 h-3 me-1" />
                                      {isRTL ? "تعليق" : "Suspend"}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </Card>
                  </>
                )}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ── Add Credits Dialog ── */}
      {creditsTargetUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setCreditsTargetUserId(null)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-white text-base mb-1">
              {lang === "ar" ? "إضافة رصيد" : "Add Credits"}
            </h3>
            <p className="text-xs text-zinc-400 mb-4 truncate" dir="ltr">{creditsTargetEmail}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">{lang === "ar" ? "الكمية (جلسات ذكاء)" : "Amount (AI sessions)"}</label>
                <Input
                  type="number"
                  min="1"
                  max="100000"
                  value={creditsAmount}
                  onChange={e => setCreditsAmount(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  data-testid="input-credits-amount"
                />
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[10, 50, 100, 500, 1000].map(n => (
                    <button key={n} onClick={() => setCreditsAmount(String(n))} className={`text-[10px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors`}>+{n}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">{lang === "ar" ? "السبب (اختياري)" : "Reason (optional)"}</label>
                <Input
                  value={creditsReason}
                  onChange={e => setCreditsReason(e.target.value)}
                  placeholder={lang === "ar" ? "هدية / تعويض / ترقية..." : "Gift / Compensation / Upgrade..."}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  data-testid="input-credits-reason"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                  onClick={() => addCreditsMutation.mutate({ userId: creditsTargetUserId, amount: parseInt(creditsAmount) || 0, reason: creditsReason || undefined })}
                  disabled={addCreditsMutation.isPending || !creditsAmount || parseInt(creditsAmount) <= 0}
                  data-testid="button-confirm-add-credits"
                >
                  {addCreditsMutation.isPending ? (lang === "ar" ? "جارٍ الإضافة..." : "Adding...") : (lang === "ar" ? "إضافة الرصيد" : "Add Credits")}
                </Button>
                <Button variant="ghost" className="text-zinc-400" onClick={() => setCreditsTargetUserId(null)} data-testid="button-cancel-add-credits">
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Chatbot Admin Component ────────────────────────────────────────────────
function ChatbotAdminSection({ lang, toast }: { lang: string; toast: any }) {
  const isRTL = lang === "ar";
  const [activeTab, setActiveTab] = useState<"stats" | "questions" | "kb" | "auto" | "leads">("stats");
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [newCat, setNewCat] = useState("general");
  const [newLang, setNewLang] = useState("ar");
  const [editId, setEditId] = useState<number | null>(null);
  const [editA, setEditA] = useState("");

  const { data: stats, refetch: refetchStats } = useQuery({ queryKey: ["/api/admin/chatbot/stats"] });
  const { data: questions = [], refetch: refetchQ } = useQuery<any[]>({ queryKey: ["/api/admin/chatbot/questions"] });
  const { data: kb = [], refetch: refetchKb } = useQuery<any[]>({ queryKey: ["/api/admin/chatbot/knowledge-base"] });
  const { data: autoLearned = [], refetch: refetchAuto } = useQuery<any[]>({ queryKey: ["/api/admin/chatbot/auto-learned"] });
  const { data: leads = [] } = useQuery<any[]>({ queryKey: ["/api/admin/chatbot/leads"] });

  const addKbMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/chatbot/knowledge-base", { question: newQ, answer: newA, category: newCat, language: newLang });
    },
    onSuccess: () => { refetchKb(); setNewQ(""); setNewA(""); toast({ title: isRTL ? "تم الإضافة" : "Added" }); },
  });

  const deleteKbMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/chatbot/knowledge-base/${id}`); },
    onSuccess: () => { refetchKb(); toast({ title: isRTL ? "تم الحذف" : "Deleted" }); },
  });

  const updateKbMutation = useMutation({
    mutationFn: async ({ id, answer }: { id: number; answer: string }) => {
      await apiRequest("PATCH", `/api/admin/chatbot/knowledge-base/${id}`, { answer });
    },
    onSuccess: () => { refetchKb(); setEditId(null); toast({ title: isRTL ? "تم التحديث" : "Updated" }); },
  });

  const approveAutoMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("POST", `/api/admin/chatbot/auto-learned/${id}/approve`); },
    onSuccess: () => { refetchAuto(); refetchKb(); toast({ title: isRTL ? "تم الاعتماد ونقله للقاعدة" : "Approved & added to KB" }); },
  });

  const deleteAutoMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/chatbot/auto-learned/${id}`); },
    onSuccess: () => { refetchAuto(); toast({ title: isRTL ? "تم الحذف" : "Deleted" }); },
  });

  const deleteQMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/chatbot/questions/${id}`); },
    onSuccess: () => { refetchQ(); refetchStats(); },
  });

  const retrainMutation = useMutation({
    mutationFn: async () => { await apiRequest("POST", "/api/admin/chatbot/retrain"); },
    onSuccess: () => { toast({ title: isRTL ? "بدأ التحسين الذاتي" : "Self-improvement started" }); setTimeout(() => refetchAuto(), 3000); },
  });

  const tabs = [
    { key: "stats", icon: BarChart3, label: isRTL ? "الإحصائيات" : "Stats" },
    { key: "questions", icon: MessageSquare, label: isRTL ? "أسئلة الزوار" : "Visitor Questions" },
    { key: "kb", icon: Brain, label: isRTL ? "قاعدة المعرفة" : "Knowledge Base" },
    { key: "auto", icon: Sparkles, label: isRTL ? "التعلم التلقائي" : "Auto-Learned" },
    { key: "leads", icon: Users, label: isRTL ? "العملاء المحتملون" : "Leads" },
  ];

  const s = stats as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <img src="/logo.png" alt="ArabyWeb AI" className="w-6 h-6 object-contain" />
            {isRTL ? "لوحة إدارة الشاتبوت الذكي" : "AI Chatbot Dashboard"}
          </h2>
          <p className="text-zinc-400 text-sm mt-1">{isRTL ? "مراقبة وتحسين أداء الشاتبوت" : "Monitor and improve chatbot performance"}</p>
        </div>
        <Button onClick={() => retrainMutation.mutate()} disabled={retrainMutation.isPending}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <RefreshCw className={`w-4 h-4 ${retrainMutation.isPending ? "animate-spin" : ""}`} />
          {isRTL ? "تشغيل التحسين الذاتي" : "Run Self-Improvement"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-800/50 p-1 rounded-xl flex-wrap">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"
            }`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "stats" && s && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: isRTL ? "إجمالي الأسئلة" : "Total Questions", value: s.totalQuestions ?? 0, color: "text-emerald-400" },
              { label: isRTL ? "المحادثات" : "Conversations", value: s.totalConversations ?? 0, color: "text-blue-400" },
              { label: isRTL ? "العملاء المحتملون" : "Leads", value: s.totalLeads ?? 0, color: "text-amber-400" },
              { label: isRTL ? "قاعدة المعرفة" : "Knowledge Entries", value: kb.length, color: "text-violet-400" },
            ].map((stat, i) => (
              <Card key={i} className="bg-zinc-800/50 border-zinc-700/50 p-4">
                <div className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</div>
                <div className="text-zinc-400 text-sm mt-1">{stat.label}</div>
              </Card>
            ))}
          </div>

          {/* Cache Stats Card */}
          {s.cacheStats && (
            <Card className="bg-zinc-800/50 border-zinc-700/50 p-5">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                {isRTL ? "إحصاء الكاش — توفير استخدام AI" : "Cache Stats — AI Usage Savings"}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-zinc-700/40 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{s.cacheStats.hitRate}%</div>
                  <div className="text-zinc-400 text-xs mt-1">{isRTL ? "معدل الإصابة" : "Hit Rate"}</div>
                </div>
                <div className="bg-zinc-700/40 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-400">{s.cacheStats.hits}</div>
                  <div className="text-zinc-400 text-xs mt-1">{isRTL ? "استجابات من الكاش" : "Cache Hits"}</div>
                </div>
                <div className="bg-zinc-700/40 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-red-400">{s.cacheStats.misses}</div>
                  <div className="text-zinc-400 text-xs mt-1">{isRTL ? "طلبات OpenAI" : "OpenAI Calls"}</div>
                </div>
                <div className="bg-zinc-700/40 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-400">{s.cacheStats.size}</div>
                  <div className="text-zinc-400 text-xs mt-1">{isRTL ? "حجم الكاش" : "Cache Size"}</div>
                </div>
              </div>
              <p className="text-zinc-500 text-xs mt-3">
                {isRTL
                  ? `الكاش يوفّر تكاليف AI — كل إصابة = طلب OpenAI مُوفَّر. TTL: 6 ساعات`
                  : `Cache saves AI costs — each hit = one saved OpenAI call. TTL: 6 hours`}
              </p>
            </Card>
          )}

          {s.languageDistribution && s.languageDistribution.length > 0 && (
            <Card className="bg-zinc-800/50 border-zinc-700/50 p-5">
              <h3 className="text-white font-semibold mb-3">{isRTL ? "توزيع اللغات" : "Language Distribution"}</h3>
              <div className="flex gap-3 flex-wrap">
                {s.languageDistribution.map((d: any) => (
                  <div key={d.detected_language} className="flex items-center gap-2 bg-zinc-700/50 px-3 py-2 rounded-lg">
                    <span className="text-2xl">{d.detected_language === "ar" ? "🇸🇦" : "🇬🇧"}</span>
                    <div>
                      <div className="text-white font-bold">{d.count}</div>
                      <div className="text-zinc-400 text-xs">{d.detected_language === "ar" ? "عربي" : "English"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {s.dialectDistribution && s.dialectDistribution.length > 0 && (
            <Card className="bg-zinc-800/50 border-zinc-700/50 p-5">
              <h3 className="text-white font-semibold mb-3">{isRTL ? "توزيع اللهجات العربية" : "Arabic Dialect Distribution"}</h3>
              <div className="flex gap-2 flex-wrap">
                {s.dialectDistribution.map((d: any) => {
                  const labels: any = { msa: "فصحى", gulf: "خليجي", egyptian: "مصري", levantine: "شامي", maghrebi: "مغاربي" };
                  return (
                    <div key={d.detected_dialect} className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                      <span className="text-emerald-400 font-semibold">{d.count}</span>
                      <span className="text-zinc-400 text-xs ms-2">{labels[d.detected_dialect] || d.detected_dialect}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === "questions" && (
        <Card className="bg-zinc-800/50 border-zinc-700/50">
          <div className="p-4 border-b border-zinc-700/50 flex items-center justify-between">
            <h3 className="text-white font-semibold">{isRTL ? `أحدث ${questions.length} سؤال` : `Latest ${questions.length} Questions`}</h3>
            <span className="text-zinc-500 text-xs">{isRTL ? "احذف الأسئلة غير المفيدة لتنظيف البيانات" : "Delete irrelevant questions to clean data"}</span>
          </div>
          <ScrollArea className="h-[500px]">
            <div className="divide-y divide-zinc-700/30">
              {questions.map((q: any) => (
                <div key={q.id} className="p-4 hover:bg-zinc-700/20 transition-colors group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{q.question}</p>
                      {q.ai_response && (
                        <p className="text-zinc-500 text-xs mt-1 line-clamp-2">{q.ai_response}</p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0 items-center">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {q.detected_language === "ar" ? "عربي" : "EN"}
                      </span>
                      {q.detected_dialect && q.detected_dialect !== "none" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {q.detected_dialect}
                        </span>
                      )}
                      <button onClick={() => deleteQMutation.mutate(q.id)}
                        disabled={deleteQMutation.isPending}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-red-400 p-1 ms-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-zinc-600 text-[10px] mt-1">{new Date(q.created_at).toLocaleString(lang === "ar" ? "ar-SA" : "en-US")}</p>
                </div>
              ))}
              {questions.length === 0 && (
                <div className="p-8 text-center text-zinc-500 text-sm">{isRTL ? "لا توجد أسئلة بعد" : "No questions yet"}</div>
              )}
            </div>
          </ScrollArea>
        </Card>
      )}

      {activeTab === "kb" && (
        <div className="space-y-4">
          <Card className="bg-zinc-800/50 border-zinc-700/50 p-4">
            <h3 className="text-white font-semibold mb-3">{isRTL ? "إضافة إجابة جديدة" : "Add New Knowledge Entry"}</h3>
            <div className="space-y-3">
              <input value={newQ} onChange={e => setNewQ(e.target.value)}
                placeholder={isRTL ? "السؤال..." : "Question..."}
                className="w-full bg-zinc-700/50 text-white placeholder-zinc-500 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500/50" />
              <textarea value={newA} onChange={e => setNewA(e.target.value)} rows={3}
                placeholder={isRTL ? "الإجابة..." : "Answer..."}
                className="w-full bg-zinc-700/50 text-white placeholder-zinc-500 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500/50 resize-none" />
              <div className="flex gap-2">
                <select value={newCat} onChange={e => setNewCat(e.target.value)}
                  className="bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg px-3 py-2 text-sm outline-none flex-1">
                  <option value="general">General</option>
                  <option value="pricing">Pricing</option>
                  <option value="technical">Technical</option>
                  <option value="sales">Sales</option>
                </select>
                <select value={newLang} onChange={e => setNewLang(e.target.value)}
                  className="bg-zinc-700/50 text-white border border-zinc-600/50 rounded-lg px-3 py-2 text-sm outline-none">
                  <option value="ar">عربي</option>
                  <option value="en">English</option>
                </select>
                <Button onClick={() => addKbMutation.mutate()} disabled={!newQ || !newA || addKbMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {isRTL ? "إضافة" : "Add"}
                </Button>
              </div>
            </div>
          </Card>
          <Card className="bg-zinc-800/50 border-zinc-700/50">
            <ScrollArea className="h-[400px]">
              <div className="divide-y divide-zinc-700/30">
                {kb.map((item: any) => (
                  <div key={item.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">{item.question}</p>
                        {editId === item.id ? (
                          <div className="mt-2 space-y-2">
                            <textarea value={editA} onChange={e => setEditA(e.target.value)} rows={3}
                              className="w-full bg-zinc-700/50 text-white placeholder-zinc-500 border border-zinc-600/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500/50 resize-none" />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => updateKbMutation.mutate({ id: item.id, answer: editA })} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                {isRTL ? "حفظ" : "Save"}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditId(null)}>{isRTL ? "إلغاء" : "Cancel"}</Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-zinc-400 text-xs mt-1">{item.answer}</p>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => { setEditId(item.id); setEditA(item.answer); }}
                          className="text-zinc-400 hover:text-white transition-colors p-1">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteKbMutation.mutate(item.id)}
                          className="text-zinc-400 hover:text-red-400 transition-colors p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-400">{item.category}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-400">{item.language}</span>
                    </div>
                  </div>
                ))}
                {kb.length === 0 && (
                  <div className="p-8 text-center text-zinc-500 text-sm">{isRTL ? "قاعدة المعرفة فارغة" : "Knowledge base is empty"}</div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      )}

      {activeTab === "auto" && (
        <Card className="bg-zinc-800/50 border-zinc-700/50">
          <div className="p-4 border-b border-zinc-700/50">
            <h3 className="text-white font-semibold">{isRTL ? "إجابات تعلّمها الذكاء الاصطناعي تلقائياً" : "AI Auto-Learned Answers"}</h3>
            <p className="text-zinc-500 text-xs mt-1">
              {isRTL
                ? "راجع هذه الإجابات — اعتمدها لنقلها لقاعدة المعرفة (وتُحذف تلقائياً منها)، أو احذفها إن كانت غير صحيحة"
                : "Review — Approve to move to KB (auto-removed from here), or delete if incorrect"}
            </p>
          </div>
          <ScrollArea className="h-[450px]">
            <div className="divide-y divide-zinc-700/30">
              {autoLearned.map((item: any) => (
                <div key={item.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                          {item.usage_count}× {isRTL ? "مرات" : "times"}
                        </span>
                        <span className="text-[10px] text-zinc-500">{item.language === "ar" ? "عربي" : "EN"}</span>
                      </div>
                      <p className="text-white text-sm font-medium">{item.question_pattern}</p>
                      <p className="text-zinc-400 text-xs mt-1">{item.answer}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" onClick={() => approveAutoMutation.mutate(item.id)}
                        disabled={approveAutoMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {isRTL ? "اعتماد" : "Approve"}
                      </Button>
                      <button onClick={() => deleteAutoMutation.mutate(item.id)}
                        disabled={deleteAutoMutation.isPending}
                        className="text-zinc-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {autoLearned.length === 0 && (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  {isRTL ? "لا توجد إجابات تلقائية بعد. شغّل التحسين الذاتي لإنشاء إجابات" : "No auto-learned answers yet. Run self-improvement to generate some."}
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      )}

      {activeTab === "leads" && (
        <Card className="bg-zinc-800/50 border-zinc-700/50">
          <div className="p-4 border-b border-zinc-700/50 flex items-center justify-between gap-3">
            <h3 className="text-white font-semibold">{isRTL ? `${leads.length} عميل محتمل` : `${leads.length} Leads`}</h3>
            {leads.length > 0 && (
              <a
                href="/api/admin/chatbot/leads/export.csv"
                download
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
                data-testid="link-export-leads-csv"
              >
                <Save className="w-3.5 h-3.5" />
                {isRTL ? "تصدير CSV" : "Export CSV"}
              </a>
            )}
          </div>
          <ScrollArea className="h-[450px]">
            <div className="divide-y divide-zinc-700/30">
              {leads.map((lead: any) => (
                <div key={lead.id} className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(lead.name || lead.email || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{lead.name || (isRTL ? "غير محدد" : "Unknown")}</p>
                    <p className="text-zinc-400 text-xs" dir="ltr">{lead.email}</p>
                    {lead.business_type && <p className="text-zinc-500 text-xs">{lead.business_type}</p>}
                  </div>
                  <p className="text-zinc-600 text-xs flex-shrink-0">{new Date(lead.created_at).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}</p>
                </div>
              ))}
              {leads.length === 0 && (
                <div className="p-8 text-center text-zinc-500 text-sm">{isRTL ? "لا يوجد عملاء محتملون بعد" : "No leads yet"}</div>
              )}
            </div>
          </ScrollArea>
        </Card>
      )}


    </div>
  );
}

function FeedbackAdminSection({ items, loading, lang, onRefresh }: {
  items: UserFeedbackItem[];
  loading: boolean;
  lang: string;
  onRefresh: () => void;
}) {
  const { toast } = useToast();
  const [noteMap, setNoteMap] = useState<Record<number, string>>({});
  const isRTL = lang === "ar";

  const updateMutation = useMutation({
    mutationFn: ({ id, status, adminNote }: { id: number; status: string; adminNote?: string }) =>
      apiRequest("PATCH", `/api/admin/feedback/${id}`, { status, adminNote }),
    onSuccess: () => {
      toast({ title: isRTL ? "تم التحديث ✅" : "Updated ✅" });
      onRefresh();
    },
  });

  const typeConfig: Record<string, { label: string; labelAr: string; color: string; bg: string; icon: any }> = {
    bug: { label: "Bug", labelAr: "مشكلة", color: "text-red-400", bg: "bg-red-500/20", icon: Bug },
    suggestion: { label: "Idea", labelAr: "اقتراح", color: "text-amber-400", bg: "bg-amber-500/20", icon: Lightbulb },
    question: { label: "Question", labelAr: "سؤال", color: "text-blue-400", bg: "bg-blue-500/20", icon: HelpCircle },
    praise: { label: "Praise", labelAr: "إطراء", color: "text-emerald-400", bg: "bg-emerald-500/20", icon: ThumbsUp },
  };

  const statusConfig: Record<string, { label: string; labelAr: string; color: string }> = {
    new: { label: "New", labelAr: "جديد", color: "text-blue-400" },
    read: { label: "Read", labelAr: "مقروء", color: "text-zinc-400" },
    resolved: { label: "Resolved", labelAr: "محلول", color: "text-emerald-400" },
  };

  const newCount = items.filter(i => i.status === "new").length;
  const readCount = items.filter(i => i.status === "read").length;
  const resolvedCount = items.filter(i => i.status === "resolved").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: isRTL ? "جديدة" : "New", count: newCount, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: Inbox },
          { label: isRTL ? "مقروءة" : "Read", count: readCount, color: "text-zinc-300", bg: "bg-zinc-700/30 border-zinc-600/20", icon: Clock },
          { label: isRTL ? "محلولة" : "Resolved", count: resolvedCount, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCheck },
        ].map(({ label, count, color, bg, icon: Icon }) => (
          <Card key={label} className={`${bg} border p-4 text-center bg-zinc-900`}>
            <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
            <p className={`text-2xl font-bold ${color}`}>{count}</p>
            <p className="text-zinc-500 text-xs mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4 text-violet-400" />
            <h3 className="font-semibold text-white text-sm">
              {isRTL ? "بلاغات وملاحظات المستخدمين" : "User Feedback & Reports"}
            </h3>
            {newCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{newCount}</span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onRefresh} className="text-zinc-400 hover:text-white h-7 px-2">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>

        {loading ? (
          <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-zinc-500 mx-auto" /></div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquarePlus className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">{isRTL ? "لا يوجد بلاغات بعد" : "No feedback yet"}</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="divide-y divide-zinc-800">
              {items.map((item) => {
                const tc = typeConfig[item.type] || typeConfig.bug;
                const sc = statusConfig[item.status] || statusConfig.new;
                const TypeIcon = tc.icon;
                const note = noteMap[item.id] ?? (item.adminNote || "");
                return (
                  <div key={item.id} className={`p-4 space-y-3 ${item.status === "new" ? "bg-blue-500/5 border-s-2 border-blue-500" : ""}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full ${tc.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <TypeIcon className={`w-4 h-4 ${tc.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${tc.bg} ${tc.color}`}>
                            {isRTL ? tc.labelAr : tc.label}
                          </span>
                          <span className={`text-[11px] font-medium ${sc.color}`}>
                            {isRTL ? sc.labelAr : sc.label}
                          </span>
                          {item.page && (
                            <span className="text-[11px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{item.page}</span>
                          )}
                          <span className="text-[11px] text-zinc-600 ms-auto">
                            {new Date(item.createdAt).toLocaleDateString(isRTL ? "ar-SA" : "en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {item.userName && <span className="font-medium text-zinc-300">{item.userName}</span>}
                          {item.userEmail && <span className="text-zinc-500" dir="ltr"> · {item.userEmail}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="bg-zinc-800/50 rounded-xl p-3 text-sm text-zinc-200 leading-relaxed" dir={isRTL ? "rtl" : "ltr"}>
                      {item.message}
                    </div>
                    <div className="flex items-start gap-2">
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => setNoteMap(prev => ({ ...prev, [item.id]: e.target.value }))}
                        placeholder={isRTL ? "ملاحظة داخلية (اختياري)..." : "Internal note (optional)..."}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-500 transition-colors"
                        dir={isRTL ? "rtl" : "ltr"}
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(["new", "read", "resolved"] as const).map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={item.status === s ? "secondary" : "ghost"}
                          className={`h-7 text-xs px-3 ${item.status === s ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-white"}`}
                          disabled={updateMutation.isPending}
                          onClick={() => updateMutation.mutate({ id: item.id, status: s, adminNote: note })}
                          data-testid={`button-feedback-${s}-${item.id}`}
                        >
                          {s === "new" ? (isRTL ? "جديد" : "Mark New") : s === "read" ? (isRTL ? "مقروء" : "Mark Read") : (isRTL ? "محلول ✓" : "Resolved ✓")}
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </Card>
    </div>
  );
}

// ─── AI Learning Dashboard Section ────────────────────────────────────────────
function LearningAdminSection({ data, loading, lang, onRefresh }: {
  data: any;
  loading: boolean;
  lang: string;
  onRefresh: () => void;
}) {
  const isRTL = lang === "ar";
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const { data: patterns, isLoading: patternsLoading } = useQuery<any>({
    queryKey: ["/api/admin/learning-patterns", selectedIndustry],
    enabled: !!selectedIndustry,
    staleTime: 30000,
  });

  const ls = data?.learningStats;

  const patternTypeColor: Record<string, string> = {
    tagline: "text-violet-400 bg-violet-500/10",
    service: "text-blue-400 bg-blue-500/10",
    cta: "text-emerald-400 bg-emerald-500/10",
    faq: "text-amber-400 bg-amber-500/10",
    feature: "text-cyan-400 bg-cyan-500/10",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{isRTL ? "نظام التعلم الذكي" : "AI Self-Learning System"}</h2>
            <p className="text-xs text-zinc-500">{isRTL ? "الأنماط المستخلصة من كل موقع يُنشأ" : "Patterns extracted from every generated website"}</p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2"
          onClick={onRefresh} disabled={loading} data-testid="button-refresh-learning">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {isRTL ? "تحديث" : "Refresh"}
        </Button>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <div key={i} className="h-24 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />)}
        </div>
      ) : ls ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">{isRTL ? "إجمالي الأنماط" : "Total Patterns"}</p>
            <p className="text-3xl font-bold text-violet-400" data-testid="text-total-patterns">{ls.totalPatterns ?? "—"}</p>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">{isRTL ? "إجمالي الجلسات" : "Total Insights"}</p>
            <p className="text-3xl font-bold text-blue-400" data-testid="text-total-insights">{ls.totalInsights ?? "—"}</p>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">{isRTL ? "الصناعات المُغطاة" : "Industries"}</p>
            <p className="text-3xl font-bold text-emerald-400" data-testid="text-industries-count">{ls.industriesCount ?? "—"}</p>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 mb-1">{isRTL ? "متوسط التقييم" : "Avg Quality Score"}</p>
            <p className="text-3xl font-bold text-amber-400" data-testid="text-avg-quality">{ls.avgQualityScore != null ? Number(ls.avgQualityScore).toFixed(1) : "—"}</p>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12 text-zinc-500">
          <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{isRTL ? "لا توجد بيانات تعلم بعد — ابدأ بإنشاء بعض المواقع" : "No learning data yet — start generating websites"}</p>
        </div>
      )}

      {/* Industry breakdown */}
      {ls?.byIndustry && Array.isArray(ls.byIndustry) && ls.byIndustry.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              {isRTL ? "الأنماط حسب الصناعة" : "Patterns by Industry"}
            </h3>
          </div>
          <div className="divide-y divide-zinc-800">
            {ls.byIndustry.map((row: any) => (
              <div key={row.industry}
                className={`flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors ${selectedIndustry === row.industry ? "bg-zinc-800/70" : ""}`}
                onClick={() => setSelectedIndustry(selectedIndustry === row.industry ? null : row.industry)}
                data-testid={`row-industry-${row.industry}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{row.industry}</p>
                    <p className="text-xs text-zinc-500">{isRTL ? `متوسط التقييم: ${Number(row.avgScore ?? 0).toFixed(1)}` : `Avg score: ${Number(row.avgScore ?? 0).toFixed(1)}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-violet-400">{row.count}</span>
                  <span className="text-xs text-zinc-600">{isRTL ? "نمط" : "patterns"}</span>
                  <ChevronRight className={`w-4 h-4 text-zinc-600 transition-transform ${selectedIndustry === row.industry ? "rotate-90" : ""}`} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Patterns detail panel */}
      {selectedIndustry && (
        <Card className="bg-zinc-900 border-zinc-800">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="font-semibold text-white">
              {isRTL ? `أنماط صناعة: ${selectedIndustry}` : `Patterns — ${selectedIndustry}`}
            </h3>
            <Button size="sm" variant="ghost" className="text-zinc-400" onClick={() => setSelectedIndustry(null)}>✕</Button>
          </div>
          {patternsLoading ? (
            <div className="p-6 text-center text-zinc-500 animate-pulse">
              {isRTL ? "تحميل الأنماط..." : "Loading patterns..."}
            </div>
          ) : patterns?.patterns?.length ? (
            <div className="divide-y divide-zinc-800 max-h-96 overflow-y-auto">
              {patterns.patterns.map((p: any) => (
                <div key={p.id} className="flex items-start gap-3 p-3" data-testid={`pattern-${p.id}`}>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${patternTypeColor[p.patternType] ?? "text-zinc-400 bg-zinc-800"}`}>
                    {p.patternType}
                  </span>
                  <p className="text-sm text-zinc-300 flex-1" dir="auto">{p.content}</p>
                  <span className="text-xs text-zinc-600 shrink-0">⭐ {p.qualityScore}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-zinc-500 text-sm">
              {isRTL ? "لا توجد أنماط بعد لهذه الصناعة" : "No patterns yet for this industry"}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
