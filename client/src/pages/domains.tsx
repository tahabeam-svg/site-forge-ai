import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Globe, Search, Server, CheckCircle2, XCircle, Loader2,
  ShoppingCart, Star, Zap, Shield, Clock, Package,
  AlertCircle, ChevronDown, ChevronUp, Link2, CheckCheck,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DomainResult {
  domain: string;
  tld: string;
  available: boolean | "unknown";
  price: number;
  renewPrice: number;
  status?: string;
}

interface HostingPlan {
  id: string;
  nameAr: string;
  nameEn: string;
  priceMonthly: number;
  priceYearly: number;
  features: { ar: string[]; en: string[] };
}

interface CatalogData {
  tlds: Record<string, { register: number; renew: number; transfer: number }>;
  hosting: HostingPlan[];
  demo: boolean;
}

interface MyOrdersData {
  domains: any[];
  hosting: any[];
}

const POPULAR_TLDS = [".com", ".net", ".sa", ".store", ".online", ".site"];
const ALL_TLDS = [".com", ".net", ".org", ".sa", ".com.sa", ".store", ".online", ".site", ".tech", ".io", ".ai", ".app"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  paid: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const STATUS_LABELS: Record<string, { ar: string; en: string }> = {
  pending: { ar: "قيد المعالجة", en: "Pending" },
  paid: { ar: "مدفوع", en: "Paid" },
  active: { ar: "نشط", en: "Active" },
  failed: { ar: "فشل", en: "Failed" },
  cancelled: { ar: "ملغي", en: "Cancelled" },
};

const DEFAULT_TLD_FALLBACK: Record<string, { register: number; renew: number; transfer: number }> = {
  ".com": { register: 49, renew: 49, transfer: 49 },
  ".net": { register: 55, renew: 55, transfer: 55 },
  ".sa": { register: 299, renew: 299, transfer: 299 },
  ".store": { register: 39, renew: 79, transfer: 39 },
  ".online": { register: 29, renew: 69, transfer: 29 },
  ".site": { register: 29, renew: 69, transfer: 29 },
};

export default function DomainsPage() {
  const { language } = useAuth();
  const lang = language || "ar";
  const isAr = lang === "ar";
  const { toast } = useToast();

  const [searchName, setSearchName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{ type: "domain" | "hosting"; item: any; price: number }[]>([]);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [showAllTlds, setShowAllTlds] = useState(false);
  const [selectedTlds, setSelectedTlds] = useState<string[]>(POPULAR_TLDS);
  const [linkingDomainId, setLinkingDomainId] = useState<number | null>(null);
  const [linkProjectId, setLinkProjectId] = useState<string>("");

  const { data: catalog } = useQuery<CatalogData>({
    queryKey: ["/api/domains/catalog"],
  });

  const { data: myOrders, refetch: refetchOrders } = useQuery<MyOrdersData>({
    queryKey: ["/api/domains/my-orders"],
  });

  const { data: myProjects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  const linkSiteMutation = useMutation({
    mutationFn: (data: { domainOrderId: number; projectId: string }) =>
      apiRequest("POST", "/api/domains/link-site", data).then(r => r.json()),
    onSuccess: (data) => {
      refetchOrders();
      setLinkingDomainId(null);
      setLinkProjectId("");
      toast({
        title: isAr ? "✅ تم الربط بنجاح" : "✅ Linked successfully",
        description: isAr
          ? `الدومين ${data.domain} مرتبط بموقعك — فريقنا سيطبق إعدادات DNS قريباً`
          : `Domain ${data.domain} linked to your site — our team will apply DNS settings soon`,
      });
    },
    onError: () => toast({ title: isAr ? "فشل الربط" : "Link failed", variant: "destructive" }),
  });

  const checkMutation = useMutation({
    mutationFn: (data: { name: string; tlds: string[] }) =>
      apiRequest("POST", "/api/domains/check", data).then(r => r.json()),
    onError: () => toast({ title: isAr ? "خطأ في البحث" : "Search error", variant: "destructive" }),
  });

  const orderDomainMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/domains/order", data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/domains/my-orders"] });
      refetchOrders();
    },
  });

  const orderHostingMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/hosting/order", data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/domains/my-orders"] });
      refetchOrders();
    },
  });

  const handleSearch = () => {
    if (!searchName.trim()) return;
    setSearchQuery(searchName.trim());
    checkMutation.mutate({ name: searchName.trim(), tlds: selectedTlds });
  };

  const toggleTld = (tld: string) => {
    setSelectedTlds(prev =>
      prev.includes(tld) ? prev.filter(t => t !== tld) : [...prev, tld]
    );
  };

  const inCart = (type: "domain" | "hosting", id: string) =>
    cart.some(c => c.type === type && (type === "domain" ? c.item.domain === id : c.item.id === id));

  const addToCart = (type: "domain" | "hosting", item: any, price: number) => {
    if (inCart(type, type === "domain" ? item.domain : item.id)) {
      setCart(prev => prev.filter(c => !(c.type === type && (type === "domain" ? c.item.domain === item.domain : c.item.id === item.id))));
    } else {
      setCart(prev => [...prev, { type, item, price }]);
    }
  };

  const checkout = async () => {
    for (const c of cart) {
      if (c.type === "domain") {
        await orderDomainMutation.mutateAsync({ domain: c.item.domain, tld: c.item.tld, years: 1, type: "register" });
      } else {
        await orderHostingMutation.mutateAsync({ planId: c.item.id, billingCycle });
      }
    }
    setCart([]);
    toast({
      title: isAr ? "✓ تم إرسال طلباتك" : "✓ Orders submitted",
      description: isAr ? "سيتواصل معك فريق عرابي ويب لإتمام الدفع والتفعيل" : "Our team will contact you to complete payment and activation",
    });
  };

  const results: DomainResult[] = checkMutation.data?.results || [];
  const isDemo = !!(checkMutation.data?.demo || catalog?.demo);
  const hosting = catalog?.hosting || [];
  const tldPrices = catalog?.tlds || DEFAULT_TLD_FALLBACK;
  const totalCart = cart.reduce((s, c) => s + c.price, 0);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8" dir={isAr ? "rtl" : "ltr"}>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-domains-title">
            {isAr ? "🌐 دومينات واستضافة" : "🌐 Domains & Hosting"}
          </h1>
          <p className="text-muted-foreground">
            {isAr ? "احجز دومينك واختر خطة الاستضافة المناسبة لموقعك" : "Register your domain and choose the perfect hosting plan"}
          </p>
          {isDemo && (
            <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm px-4 py-2 rounded-full border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-4 h-4" />
              {isAr
                ? "يعمل في وضع العرض — سيتواصل معك الفريق لإتمام الطلب"
                : "Running in demo mode — team will contact you to complete order"}
            </div>
          )}
        </div>

        <Tabs defaultValue="domains">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="domains" data-testid="tab-domains">
              <Globe className="w-4 h-4 me-1" />
              {isAr ? "دومينات" : "Domains"}
            </TabsTrigger>
            <TabsTrigger value="hosting" data-testid="tab-hosting">
              <Server className="w-4 h-4 me-1" />
              {isAr ? "استضافة" : "Hosting"}
            </TabsTrigger>
            <TabsTrigger value="my-orders" data-testid="tab-orders">
              <Package className="w-4 h-4 me-1" />
              {isAr ? "طلباتي" : "My Orders"}
            </TabsTrigger>
          </TabsList>

          {/* ══════════ DOMAINS TAB ══════════ */}
          <TabsContent value="domains" className="space-y-6 mt-6">

            {/* Search */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      data-testid="input-domain-search"
                      className="ps-9 text-lg h-12"
                      placeholder={isAr ? "اكتب اسم الدومين... مثال: mystore" : "Type domain name... e.g. mystore"}
                      value={searchName}
                      onChange={e => setSearchName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      onKeyDown={e => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  <Button
                    data-testid="button-search-domain"
                    className="h-12 px-6"
                    onClick={handleSearch}
                    disabled={checkMutation.isPending || !searchName.trim()}
                  >
                    {checkMutation.isPending
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <><Search className="w-4 h-4 me-1" />{isAr ? "بحث" : "Search"}</>}
                  </Button>
                </div>

                {/* TLD filters */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">{isAr ? "الامتدادات المطلوب البحث فيها:" : "Search in:"}</p>
                  <div className="flex flex-wrap gap-2">
                    {(showAllTlds ? ALL_TLDS : POPULAR_TLDS).map(tld => (
                      <button
                        key={tld}
                        data-testid={`tld-${tld.replace(".", "")}`}
                        onClick={() => toggleTld(tld)}
                        className={`px-3 py-1 rounded-full text-sm border transition-all ${
                          selectedTlds.includes(tld)
                            ? "bg-primary text-primary-foreground border-primary font-medium"
                            : "bg-background border-border text-muted-foreground hover:border-primary/60"
                        }`}
                      >
                        {tld}
                      </button>
                    ))}
                    <button
                      onClick={() => setShowAllTlds(!showAllTlds)}
                      className="px-3 py-1 rounded-full text-sm border border-dashed border-border text-muted-foreground hover:border-primary flex items-center gap-1"
                    >
                      {showAllTlds ? (isAr ? "أقل" : "Less") : (isAr ? "المزيد" : "More")}
                      {showAllTlds ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search results */}
            {results.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-semibold text-foreground">
                  {isAr ? `نتائج البحث عن "${searchQuery}"` : `Results for "${searchQuery}"`}
                </h2>
                {results.map(r => (
                  <Card
                    key={r.domain}
                    data-testid={`domain-result-${r.tld.replace(".", "")}`}
                    className={`border-2 transition-colors ${
                      r.available === true ? "border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10"
                        : r.available === false ? "border-red-200 dark:border-red-800 opacity-70"
                        : "border-border"
                    }`}
                  >
                    <CardContent className="py-4 flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        {r.available === true ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        ) : r.available === false ? (
                          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                        )}
                        <div>
                          <p className="font-bold text-lg text-foreground">{r.domain}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.available === true
                              ? (isAr ? "✅ متاح للتسجيل" : "✅ Available")
                              : r.available === false
                              ? (isAr ? "❌ محجوز" : "❌ Taken")
                              : (isAr ? "⚠️ غير معروف" : "⚠️ Unknown")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {r.available === true && (
                          <div className={isAr ? "text-end" : "text-start"}>
                            <p className="font-bold text-primary text-xl">{r.price} ر.س</p>
                            <p className="text-xs text-muted-foreground">
                              {isAr ? `تجديد: ${r.renewPrice} ر.س/سنة` : `Renew: ${r.renewPrice} SAR/yr`}
                            </p>
                          </div>
                        )}
                        {r.available === true ? (
                          <Button
                            data-testid={`button-add-domain-${r.tld.replace(".", "")}`}
                            size="sm"
                            variant={inCart("domain", r.domain) ? "secondary" : "default"}
                            onClick={() => addToCart("domain", r, r.price)}
                          >
                            {inCart("domain", r.domain)
                              ? (isAr ? "✓ في السلة" : "✓ In Cart")
                              : (isAr ? "أضف للسلة" : "Add to Cart")}
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            {isAr ? "غير متاح" : "Unavailable"}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pricing table (shown before search) */}
            {results.length === 0 && !checkMutation.isPending && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    {isAr ? "أسعار الدومينات" : "Domain Pricing"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {Object.entries(tldPrices).map(([tld, prices]) => (
                      <div key={tld} className="text-center p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer" onClick={() => { setSelectedTlds(prev => prev.includes(tld) ? prev : [...prev, tld]); }}>
                        <p className="font-bold text-primary text-lg">{tld}</p>
                        <p className="text-sm font-semibold text-foreground mt-1">{prices.register} ر.س</p>
                        <p className="text-xs text-muted-foreground">{isAr ? "للسنة" : "/year"}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ══════════ HOSTING TAB ══════════ */}
          <TabsContent value="hosting" className="space-y-6 mt-6">

            {/* Billing toggle */}
            <div className="flex justify-center">
              <div className="inline-flex items-center bg-muted rounded-full p-1 gap-1">
                <button
                  data-testid="billing-monthly"
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === "monthly" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {isAr ? "شهري" : "Monthly"}
                </button>
                <button
                  data-testid="billing-yearly"
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${billingCycle === "yearly" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {isAr ? "سنوي" : "Yearly"}
                  <span className="text-xs text-green-600 dark:text-green-400 font-bold">{isAr ? "وفر 15%" : "-15%"}</span>
                </button>
              </div>
            </div>

            {/* Plans */}
            <div className="grid md:grid-cols-3 gap-6">
              {hosting.map((plan, idx) => {
                const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
                const pricePerMonth = billingCycle === "yearly" ? Math.round(plan.priceYearly / 12) : plan.priceMonthly;
                const isBusiness = idx === 1;
                return (
                  <Card
                    key={plan.id}
                    data-testid={`hosting-plan-${plan.id}`}
                    className={`relative border-2 transition-all ${isBusiness ? "border-primary shadow-lg" : "border-border"}`}
                  >
                    {isBusiness && (
                      <div className="absolute -top-3 inset-x-0 flex justify-center">
                        <Badge className="bg-primary text-primary-foreground px-4 shadow">
                          <Star className="w-3 h-3 me-1" />
                          {isAr ? "الأكثر طلباً" : "Most Popular"}
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-3 pt-6">
                      <CardTitle className="text-xl">{isAr ? plan.nameAr : plan.nameEn}</CardTitle>
                      <div className="mt-3">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold text-primary">{pricePerMonth}</span>
                          <span className="text-muted-foreground text-sm">{isAr ? "ر.س/شهر" : "SAR/mo"}</span>
                        </div>
                        {billingCycle === "yearly" && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {isAr ? `يُدفع ${plan.priceYearly} ر.س سنوياً` : `${plan.priceYearly} SAR billed yearly`}
                          </p>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {(isAr ? plan.features.ar : plan.features.en).map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Button
                        data-testid={`button-order-hosting-${plan.id}`}
                        className="w-full"
                        variant={isBusiness ? "default" : "outline"}
                        onClick={() => addToCart("hosting", plan, price)}
                      >
                        {inCart("hosting", plan.id)
                          ? (isAr ? "✓ في السلة" : "✓ In Cart")
                          : (isAr ? "اطلب الآن" : "Order Now")}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Features row */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: Shield, ar: "SSL مجاني مع كل خطة", en: "Free SSL with every plan" },
                { icon: Zap, ar: "سيرفرات سريعة في السعودية", en: "Fast servers in Saudi Arabia" },
                { icon: Clock, ar: "دعم فني على مدار الساعة", en: "24/7 Technical support" },
              ].map(({ icon: Icon, ar, en }) => (
                <Card key={ar} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{isAr ? ar : en}</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ══════════ MY ORDERS TAB ══════════ */}
          <TabsContent value="my-orders" className="space-y-6 mt-6">
            {(!myOrders?.domains?.length && !myOrders?.hosting?.length) ? (
              <div className="text-center py-16 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">{isAr ? "لا توجد طلبات بعد" : "No orders yet"}</p>
                <p className="text-sm mt-1">{isAr ? "ابدأ بالبحث عن دومينك أو اختر خطة استضافة" : "Start by searching for a domain or choosing a hosting plan"}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {(myOrders?.domains || []).length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      {isAr ? "طلبات الدومينات" : "Domain Orders"}
                    </h3>
                    {(myOrders?.domains || []).map((order: any) => (
                      <Card key={order.id} data-testid={`order-domain-${order.id}`}>
                        <CardContent className="py-4 space-y-3">
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div>
                              <p className="font-bold text-foreground">{order.domain}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {order.type} · {order.years} {isAr ? "سنة" : "yr"} · {new Date(order.createdAt).toLocaleDateString(isAr ? "ar-SA" : "en-US")}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="font-semibold">{order.priceAr} ر.س</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                                {isAr ? STATUS_LABELS[order.status]?.ar || order.status : STATUS_LABELS[order.status]?.en || order.status}
                              </span>
                              {order.status === "active" && (
                                <Button
                                  size="sm"
                                  variant={order.linkedProjectId ? "secondary" : "outline"}
                                  className="gap-1 text-xs"
                                  onClick={() => setLinkingDomainId(linkingDomainId === order.id ? null : order.id)}
                                  data-testid={`button-link-domain-${order.id}`}
                                >
                                  {order.linkedProjectId ? <CheckCheck className="w-3 h-3 text-green-500" /> : <Link2 className="w-3 h-3" />}
                                  {order.linkedProjectId
                                    ? (isAr ? "مرتبط" : "Linked")
                                    : (isAr ? "ربط بموقع" : "Link Site")}
                                </Button>
                              )}
                            </div>
                          </div>
                          {/* Link site panel */}
                          {linkingDomainId === order.id && (
                            <div className="bg-muted/50 rounded-lg p-4 space-y-3 border border-border">
                              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                                <Link2 className="w-4 h-4 text-primary" />
                                {isAr ? "اختر الموقع الذي تريد ربطه بالدومين" : "Choose the site to link with this domain"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {isAr
                                  ? "بعد الربط، سيقوم فريقنا بضبط إعدادات DNS تلقائياً خلال 24 ساعة"
                                  : "After linking, our team will configure DNS settings automatically within 24 hours"}
                              </p>
                              <div className="flex gap-2">
                                <Select value={linkProjectId} onValueChange={setLinkProjectId}>
                                  <SelectTrigger className="flex-1" data-testid="select-link-project">
                                    <SelectValue placeholder={isAr ? "اختر موقعاً..." : "Select a site..."} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {myProjects.filter((p: any) => p.status === "published" || p.publishedUrl).map((p: any) => (
                                      <SelectItem key={p.id} value={String(p.id)} data-testid={`option-project-${p.id}`}>
                                        {p.name} {p.publishedUrl ? `— ${p.publishedUrl}` : ""}
                                      </SelectItem>
                                    ))}
                                    {myProjects.filter((p: any) => p.status !== "published" && !p.publishedUrl).map((p: any) => (
                                      <SelectItem key={p.id} value={String(p.id)} disabled>
                                        {p.name} ({isAr ? "غير منشور" : "not published"})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  disabled={!linkProjectId || linkSiteMutation.isPending}
                                  onClick={() => linkSiteMutation.mutate({ domainOrderId: order.id, projectId: linkProjectId })}
                                  data-testid="button-confirm-link"
                                >
                                  {linkSiteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (isAr ? "ربط" : "Link")}
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {(myOrders?.hosting || []).length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Server className="w-4 h-4 text-primary" />
                      {isAr ? "طلبات الاستضافة" : "Hosting Orders"}
                    </h3>
                    {(myOrders?.hosting || []).map((order: any) => (
                      <Card key={order.id} data-testid={`order-hosting-${order.id}`}>
                        <CardContent className="py-4 flex items-center justify-between gap-4 flex-wrap">
                          <div>
                            <p className="font-bold text-foreground capitalize">{order.planId} {isAr ? "بلان" : "Plan"}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {order.billingCycle} · {order.domainName || (isAr ? "بدون دومين" : "No domain")} · {new Date(order.createdAt).toLocaleDateString(isAr ? "ar-SA" : "en-US")}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">{order.priceAr} ر.س</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                              {isAr ? STATUS_LABELS[order.status]?.ar || order.status : STATUS_LABELS[order.status]?.en || order.status}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* ══════════ FLOATING CART ══════════ */}
        {cart.length > 0 && (
          <div className="fixed bottom-6 inset-x-4 md:inset-x-auto md:end-6 md:w-80 z-50" dir={isAr ? "rtl" : "ltr"}>
            <Card className="border-2 border-primary shadow-2xl">
              <CardContent className="pt-4 pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-primary" />
                    {isAr ? "السلة" : "Cart"}
                    <Badge className="bg-primary text-primary-foreground">{cart.length}</Badge>
                  </h3>
                  <button onClick={() => setCart([])} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                    {isAr ? "مسح الكل" : "Clear all"}
                  </button>
                </div>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {cart.map((c, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-foreground truncate me-2">{c.type === "domain" ? c.item.domain : (isAr ? c.item.nameAr : c.item.nameEn)}</span>
                      <span className="font-semibold text-foreground shrink-0">{c.price} ر.س</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 flex items-center justify-between font-bold text-foreground">
                  <span>{isAr ? "الإجمالي" : "Total"}</span>
                  <span className="text-primary">{totalCart} ر.س</span>
                </div>
                <Button
                  data-testid="button-checkout"
                  className="w-full"
                  onClick={checkout}
                  disabled={orderDomainMutation.isPending || orderHostingMutation.isPending}
                >
                  {(orderDomainMutation.isPending || orderHostingMutation.isPending)
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : (isAr ? "تأكيد الطلب" : "Confirm Order")}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  {isAr ? "سيتواصل معك فريق عرابي ويب لإتمام الدفع" : "Our team will contact you to complete payment"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
