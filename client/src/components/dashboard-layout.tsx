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
import { LayoutDashboard, FolderOpen, LayoutTemplate, Settings, LogOut, Globe2, CreditCard, Shield, Sparkles, BarChart3, Wallet, Github, Upload } from "lucide-react";
import LanguageToggle from "@/components/language-toggle";

const sidebarStyle = {
  "--sidebar-width": "16rem",
  "--sidebar-width-icon": "3rem",
} as React.CSSProperties;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, language, logout } = useAuth();
  const [location, navigate] = useLocation();
  const lang = language;

  const menuItems = [
    { title: t("dashboard", lang), url: "/dashboard", icon: LayoutDashboard },
    { title: t("templates", lang), url: "/templates", icon: LayoutTemplate },
    { title: lang === "ar" ? "التحليلات" : "Analytics", url: "/analytics", icon: BarChart3 },
    { title: t("billing", lang), url: "/billing", icon: CreditCard },
    { title: lang === "ar" ? "طرق الدفع" : "Payment Methods", url: "/payment-methods", icon: Wallet },
    { title: lang === "ar" ? "التسويق بالذكاء الاصطناعي" : "AI Marketing", url: "/marketing", icon: Sparkles },
    { title: lang === "ar" ? "نشر GitHub" : "GitHub Deploy", url: "/github-deploy", icon: Github },
    { title: lang === "ar" ? "انشر موقعك" : "Deploy Site", url: "/deploy-guide", icon: Upload },
    { title: t("settings", lang), url: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/auth";
  };

  return (
    <div style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Inter', sans-serif" }}>
      <SidebarProvider style={sidebarStyle}>
        <div className="flex h-screen w-full">
          <Sidebar side={lang === "ar" ? "right" : "left"}>
            <SidebarHeader className="p-4">
              <button onClick={() => navigate("/")} className="flex items-center gap-2" data-testid="link-brand-sidebar">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                  <Globe2 className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{t("brand", lang)}</span>
              </button>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.map((item) => (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          asChild
                          isActive={location === item.url}
                        >
                          <a
                            href={item.url}
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(item.url);
                            }}
                            data-testid={`link-sidebar-${item.url.replace("/", "")}`}
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4 space-y-2">
              {user && (
                <div className="flex items-center gap-2 px-2">
                  {user.profileImageUrl && (
                    <img src={user.profileImageUrl} alt="" className="w-7 h-7 rounded-full" />
                  )}
                  <div className="text-sm text-muted-foreground truncate" data-testid="text-sidebar-user">
                    {user.firstName || user.email || "User"}
                  </div>
                </div>
              )}
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="w-4 h-4 me-2" />
                {t("logout", lang)}
              </Button>
            </SidebarFooter>
          </Sidebar>
          <div className="flex flex-col flex-1 overflow-hidden">
            <header className="flex items-center justify-between gap-2 p-3 border-b bg-background/95 backdrop-blur shrink-0">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
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
