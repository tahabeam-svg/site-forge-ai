import { useAuth } from "@/lib/auth";
import DashboardLayout from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Globe2,
  Shield,
  Palette,
  Bell,
  Lock,
} from "lucide-react";

export default function SettingsPage() {
  const { user, language, setLanguage } = useAuth();
  const lang = language;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-settings-title">
            {lang === "ar" ? "الإعدادات" : "Settings"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {lang === "ar" ? "إدارة حسابك وتفضيلاتك" : "Manage your account and preferences"}
          </p>
        </div>

        <Card className="p-6" data-testid="card-profile">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            {lang === "ar" ? "الملف الشخصي" : "Profile"}
          </h2>
          <div className="flex items-start gap-6">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="" className="w-20 h-20 rounded-2xl object-cover" data-testid="img-profile-avatar" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            <div className="space-y-3 flex-1">
              <div>
                <label className="text-xs text-muted-foreground">
                  {lang === "ar" ? "الاسم" : "Name"}
                </label>
                <p className="font-medium" data-testid="text-profile-name">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : (lang === "ar" ? "مستخدم" : "User")}
                </p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {lang === "ar" ? "البريد الإلكتروني" : "Email"}
                </label>
                <p className="text-sm" data-testid="text-profile-email">{user?.email || "—"}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {lang === "ar" ? "نوع الحساب" : "Account Type"}
                </label>
                <Badge variant="secondary" className="mt-1" data-testid="text-account-type">
                  {lang === "ar" ? "مجاني" : "Free"}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6" data-testid="card-language">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-emerald-600" />
            {lang === "ar" ? "اللغة" : "Language"}
          </h2>
          <div className="flex gap-3">
            <Button
              variant={lang === "ar" ? "default" : "outline"}
              onClick={() => setLanguage("ar")}
              className={lang === "ar" ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white" : ""}
              data-testid="button-lang-ar"
            >
              <Globe2 className="w-4 h-4 me-1" />
              العربية
            </Button>
            <Button
              variant={lang === "en" ? "default" : "outline"}
              onClick={() => setLanguage("en")}
              className={lang === "en" ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white" : ""}
              data-testid="button-lang-en"
            >
              <Globe2 className="w-4 h-4 me-1" />
              English
            </Button>
          </div>
        </Card>

        <Card className="p-6" data-testid="card-preferences">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-emerald-600" />
            {lang === "ar" ? "التفضيلات" : "Preferences"}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{lang === "ar" ? "الإشعارات" : "Notifications"}</p>
                  <p className="text-xs text-muted-foreground">
                    {lang === "ar" ? "تلقي إشعارات عن المشاريع والتحديثات" : "Receive notifications about projects and updates"}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" data-testid="button-toggle-notifications">
                {lang === "ar" ? "مفعّل" : "Enabled"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{lang === "ar" ? "الأمان" : "Security"}</p>
                  <p className="text-xs text-muted-foreground">
                    {lang === "ar" ? "إعدادات الأمان والخصوصية" : "Security and privacy settings"}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" data-testid="button-security-settings">
                {lang === "ar" ? "إدارة" : "Manage"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-red-200 dark:border-red-900" data-testid="card-danger-zone">
          <h2 className="text-lg font-semibold mb-2 text-red-600">
            {lang === "ar" ? "منطقة الخطر" : "Danger Zone"}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {lang === "ar" ? "إجراءات لا يمكن التراجع عنها" : "Actions that cannot be undone"}
          </p>
          <Button variant="destructive" size="sm" data-testid="button-delete-account">
            {lang === "ar" ? "حذف الحساب" : "Delete Account"}
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  );
}
