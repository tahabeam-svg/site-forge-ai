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
import { LayoutDashboard, FolderOpen, LayoutTemplate, Settings, LogOut, Code2 } from "lucide-react";
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
    { title: t("projects", lang), url: "/dashboard", icon: FolderOpen },
    { title: t("templates", lang), url: "/templates", icon: LayoutTemplate },
    { title: t("settings", lang), url: "/dashboard", icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Inter', sans-serif" }}>
      <SidebarProvider style={sidebarStyle}>
        <div className="flex h-screen w-full">
          <Sidebar>
            <SidebarHeader className="p-4">
              <button onClick={() => navigate("/")} className="flex items-center gap-2" data-testid="link-brand-sidebar">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Code2 className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">{t("brand", lang)}</span>
              </button>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
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
                <div className="text-sm text-muted-foreground truncate px-2" data-testid="text-sidebar-user">
                  {user.displayName || user.username}
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
