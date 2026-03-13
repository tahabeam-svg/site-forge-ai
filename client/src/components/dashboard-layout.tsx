import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LayoutDashboard,
  FolderOpen,
  LayoutTemplate,
  Settings,
  LogOut,
  Globe2,
  CreditCard,
  Shield,
  Sparkles,
  BarChart3,
  Wallet,
  Github,
  Upload,
  Crown,
  BrainCircuit,
  User,
} from "lucide-react";
import LanguageToggle from "@/components/language-toggle";
import { useQuery } from "@tanstack/react-query";

const sidebarStyle = {
  "--sidebar-width": "15rem",
  "--sidebar-width-icon": "3rem",
} as React.CSSProperties;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, language, logout } = useAuth();
  const [location, navigate] = useLocation();
  const lang = language;

  const { data: me } = useQuery<any>({
    queryKey: ["/api/me"],
    staleTime: 60 * 1000,
  });

  const credits = me?.credits ?? user?.credits ?? 0;
  const plan = me?.plan ?? user?.plan ?? "free";
  const maxCredits = plan === "pro" ? 50 : plan === "business" ? 200 : 5;
  const creditsPercent = Math.min((credits / maxCredits) * 100, 100);

  const menuItems = [
    { title: t("dashboard", lang), url: "/dashboard", icon: LayoutDashboard, group: "main" },
    { title: t("templates", lang), url: "/templates", icon: LayoutTemplate, group: "main" },
    { title: lang === "ar" ? "التحليلات" : "Analytics", url: "/analytics", icon: BarChart3, group: "main" },
    { title: lang === "ar" ? "التسويق بالذكاء الاصطناعي" : "AI Marketing", url: "/marketing", icon: Sparkles, group: "tools" },
    { title: lang === "ar" ? "نشر GitHub" : "GitHub Deploy", url: "/github-deploy", icon: Github, group: "tools" },
    { title: lang === "ar" ? "انشر موقعك" : "Deploy Site", url: "/deploy-guide", icon: Upload, group: "tools" },
    { title: t("billing", lang), url: "/billing", icon: CreditCard, group: "account" },
    { title: lang === "ar" ? "طرق الدفع" : "Payment Methods", url: "/payment-methods", icon: Wallet, group: "account" },
    { title: t("settings", lang), url: "/settings", icon: Settings, group: "account" },
  ];

  const planLabel = plan === "pro" ? "Pro" : plan === "business" ? "Business" : lang === "ar" ? "مجاني" : "Free";
  const planColor = plan === "pro" ? "bg-violet-500" : plan === "business" ? "bg-amber-500" : "bg-slate-400";

  const mainItems = menuItems.filter(i => i.group === "main");
  const toolItems = menuItems.filter(i => i.group === "tools");
  const accountItems = menuItems.filter(i => i.group === "account");

  const renderMenuItems = (items: typeof menuItems) => items.map((item) => (
    <SidebarMenuItem key={item.url}>
      <SidebarMenuButton
        asChild
        isActive={location === item.url || (item.url !== "/dashboard" && location.startsWith(item.url))}
      >
        <a
          href={item.url}
          onClick={(e) => { e.preventDefault(); navigate(item.url); }}
          data-testid={`link-sidebar-${item.url.replace("/", "")}`}
          className="flex items-center gap-2.5"
        >
          <item.icon className="w-4 h-4 shrink-0" />
          <span className="truncate">{item.title}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ));

  return (
    <div style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Inter', sans-serif" }}>
      <SidebarProvider style={sidebarStyle}>
        <div className="flex h-screen w-full">
          <Sidebar side={lang === "ar" ? "right" : "left"} className="border-e">
            {/* Brand Header */}
            <SidebarHeader className="px-4 py-3 border-b border-sidebar-border">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2.5 w-full"
                data-testid="link-brand-sidebar"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm shadow-emerald-500/30 shrink-0">
                  <Globe2 className="w-4 h-4 text-white" />
                </div>
                <div className="text-start min-w-0">
                  <div className="font-bold text-sm gradient-text leading-tight">{t("brand", lang)}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">{lang === "ar" ? "منشئ المواقع" : "Website Builder"}</div>
                </div>
              </button>
            </SidebarHeader>

            <SidebarContent className="py-2">
              {/* Main Navigation */}
              <SidebarGroup>
                <div className="px-3 py-1 mb-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {lang === "ar" ? "الرئيسية" : "Main"}
                  </span>
                </div>
                <SidebarGroupContent>
                  <SidebarMenu>{renderMenuItems(mainItems)}</SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Tools */}
              <SidebarGroup className="mt-1">
                <div className="px-3 py-1 mb-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {lang === "ar" ? "الأدوات" : "Tools"}
                  </span>
                </div>
                <SidebarGroupContent>
                  <SidebarMenu>{renderMenuItems(toolItems)}</SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Account */}
              <SidebarGroup className="mt-1">
                <div className="px-3 py-1 mb-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {lang === "ar" ? "الحساب" : "Account"}
                  </span>
                </div>
                <SidebarGroupContent>
                  <SidebarMenu>{renderMenuItems(accountItems)}</SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-3 border-t border-sidebar-border space-y-3">
              {/* Credits bar */}
              <div className={`rounded-xl p-3 space-y-2 ${credits <= 0 ? "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800" : credits <= 2 ? "bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800" : "bg-sidebar-accent/60"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <BrainCircuit className={`w-3.5 h-3.5 ${credits <= 0 ? "text-red-500" : credits <= 2 ? "text-amber-500" : "text-emerald-500"}`} />
                    <span className="text-[11px] font-semibold">{lang === "ar" ? "رصيد الذكاء" : "AI Credits"}</span>
                  </div>
                  <Badge className={`text-[9px] h-4 px-1.5 text-white ${planColor}`}>
                    {plan === "pro" && <Crown className="w-2.5 h-2.5 me-0.5" />}
                    {planLabel}
                  </Badge>
                </div>
                <Progress
                  value={creditsPercent}
                  className={`h-1.5 ${credits <= 0 ? "[&>div]:bg-red-500" : credits <= 2 ? "[&>div]:bg-amber-500" : ""}`}
                />
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-medium ${credits <= 0 ? "text-red-600 dark:text-red-400" : credits <= 2 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
                    {credits <= 0
                      ? (lang === "ar" ? "نفد رصيد الذكاء!" : "AI credits empty!")
                      : `${credits.toLocaleString()} ${lang === "ar" ? "جلسة متبقية" : "sessions left"}`}
                  </span>
                  <button
                    onClick={() => navigate("/billing")}
                    className={`text-[10px] font-semibold hover:underline ${credits <= 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}
                  >
                    {credits <= 0
                      ? (lang === "ar" ? "اشحن الآن" : "Top up")
                      : (lang === "ar" ? "ترقية" : "Upgrade")}
                  </button>
                </div>
                {credits <= 0 && (
                  <p className="text-[10px] text-red-600 dark:text-red-400 leading-tight">
                    {lang === "ar" ? "لا يمكنك إنشاء مواقع جديدة" : "Cannot generate new sites"}
                  </p>
                )}
              </div>

              {/* User info + logout */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 overflow-hidden">
                  {user?.profileImageUrl
                    ? <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover" />
                    : <User className="w-3.5 h-3.5 text-white" />
                  }
                </div>
                <div className="flex-1 min-w-0" data-testid="text-sidebar-user">
                  <div className="text-xs font-medium truncate">{user?.firstName || user?.email?.split("@")[0] || "User"}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{user?.email || ""}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={logout}
                  data-testid="button-logout"
                  title={t("logout", lang)}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            </SidebarFooter>
          </Sidebar>

          <div className="flex flex-col flex-1 overflow-hidden">
            <header className="flex items-center justify-between gap-2 px-4 py-2.5 border-b bg-background/95 backdrop-blur shrink-0">
              <div className="flex items-center gap-2">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                  {location.split("/").filter(Boolean).map((seg, i, arr) => (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <span>/</span>}
                      <span className={i === arr.length - 1 ? "text-foreground font-medium capitalize" : "capitalize"}>
                        {seg === "dashboard" ? (lang === "ar" ? "لوحة التحكم" : "Dashboard")
                         : seg === "editor" ? (lang === "ar" ? "المحرر" : "Editor")
                         : seg === "billing" ? (lang === "ar" ? "الفواتير" : "Billing")
                         : seg === "settings" ? (lang === "ar" ? "الإعدادات" : "Settings")
                         : seg === "templates" ? (lang === "ar" ? "القوالب" : "Templates")
                         : seg === "analytics" ? (lang === "ar" ? "التحليلات" : "Analytics")
                         : seg === "marketing" ? (lang === "ar" ? "التسويق" : "Marketing")
                         : seg}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <LanguageToggle />
            </header>
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
