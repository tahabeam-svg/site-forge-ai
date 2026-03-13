import { useState } from "react";
import { useAuth } from "@/lib/auth";
import DashboardLayout from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  User,
  Mail,
  Globe2,
  Shield,
  Palette,
  Bell,
  Lock,
  Save,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
} from "lucide-react";

export default function SettingsPage() {
  const { user, language, setLanguage } = useAuth();
  const lang = language;
  const { toast } = useToast();

  const [editingProfile, setEditingProfile] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const isGoogleUser = !!(user as any)?.googleId;

  const profileMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/me/profile", { firstName, lastName });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setEditingProfile(false);
      toast({
        title: lang === "ar" ? "تم الحفظ" : "Saved",
        description: lang === "ar" ? "تم تحديث الملف الشخصي بنجاح" : "Profile updated successfully",
      });
    },
    onError: (err: Error) => {
      toast({ title: lang === "ar" ? "خطأ" : "Error", description: err.message, variant: "destructive" });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/me/password", { currentPassword, newPassword });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message);
      }
      return res.json();
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: lang === "ar" ? "تم التغيير" : "Changed",
        description: lang === "ar" ? "تم تغيير كلمة المرور بنجاح" : "Password changed successfully",
      });
    },
    onError: (err: Error) => {
      toast({ title: lang === "ar" ? "خطأ" : "Error", description: err.message, variant: "destructive" });
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: lang === "ar" ? "كلمة المرور قصيرة" : "Short password", description: lang === "ar" ? "6 أحرف على الأقل" : "At least 6 characters", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: lang === "ar" ? "كلمات المرور غير متطابقة" : "Passwords don't match", variant: "destructive" });
      return;
    }
    passwordMutation.mutate();
  };

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

        {/* ── Profile Card ──────────────────────────────────────────── */}
        <Card className="p-6" data-testid="card-profile">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              {lang === "ar" ? "الملف الشخصي" : "Profile"}
            </h2>
            {!editingProfile && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFirstName(user?.firstName || "");
                  setLastName(user?.lastName || "");
                  setEditingProfile(true);
                }}
                data-testid="button-edit-profile"
              >
                <Pencil className="w-3.5 h-3.5 me-1" />
                {lang === "ar" ? "تعديل" : "Edit"}
              </Button>
            )}
          </div>

          <div className="flex items-start gap-6">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="" className="w-20 h-20 rounded-2xl object-cover" data-testid="img-profile-avatar" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                <User className="w-10 h-10 text-white" />
              </div>
            )}

            <div className="space-y-3 flex-1">
              {editingProfile ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        {lang === "ar" ? "الاسم الأول" : "First Name"}
                      </Label>
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder={lang === "ar" ? "الاسم الأول" : "First name"}
                        data-testid="input-first-name"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        {lang === "ar" ? "اسم العائلة" : "Last Name"}
                      </Label>
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder={lang === "ar" ? "اسم العائلة" : "Last name"}
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                      onClick={() => profileMutation.mutate()}
                      disabled={profileMutation.isPending}
                      data-testid="button-save-profile"
                    >
                      {profileMutation.isPending ? <Loader2 className="w-3.5 h-3.5 me-1 animate-spin" /> : <Save className="w-3.5 h-3.5 me-1" />}
                      {lang === "ar" ? "حفظ" : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingProfile(false)}
                      data-testid="button-cancel-profile"
                    >
                      {lang === "ar" ? "إلغاء" : "Cancel"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
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
                    <Badge
                      variant="secondary"
                      className={`mt-1 capitalize ${user?.plan && user.plan !== "free" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : ""}`}
                      data-testid="text-account-type"
                    >
                      {user?.plan === "pro" ? (lang === "ar" ? "برو" : "Pro") : user?.plan === "business" ? (lang === "ar" ? "أعمال" : "Business") : (lang === "ar" ? "مجاني" : "Free")}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* ── Change Password Card (only for email/password accounts) ── */}
        {!isGoogleUser && (
          <Card className="p-6" data-testid="card-change-password">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              {lang === "ar" ? "تغيير كلمة المرور" : "Change Password"}
            </h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {lang === "ar" ? "كلمة المرور الحالية" : "Current Password"}
                </Label>
                <div className="relative">
                  <Input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={lang === "ar" ? "••••••••" : "••••••••"}
                    required
                    data-testid="input-current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute end-1 top-1 h-8 w-8 p-0"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {lang === "ar" ? "كلمة المرور الجديدة" : "New Password"}
                </Label>
                <div className="relative">
                  <Input
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={lang === "ar" ? "6 أحرف على الأقل" : "At least 6 characters"}
                    required
                    minLength={6}
                    data-testid="input-new-password-settings"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute end-1 top-1 h-8 w-8 p-0"
                    onClick={() => setShowNewPw(!showNewPw)}
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {lang === "ar" ? "تأكيد كلمة المرور" : "Confirm New Password"}
                </Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={lang === "ar" ? "أعد كتابة كلمة المرور الجديدة" : "Re-enter new password"}
                  required
                  data-testid="input-confirm-password-settings"
                />
              </div>

              <Button
                type="submit"
                size="sm"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                disabled={passwordMutation.isPending}
                data-testid="button-change-password-submit"
              >
                {passwordMutation.isPending ? <Loader2 className="w-3.5 h-3.5 me-1 animate-spin" /> : <Save className="w-3.5 h-3.5 me-1" />}
                {lang === "ar" ? "تغيير كلمة المرور" : "Change Password"}
              </Button>
            </form>
          </Card>
        )}

        {/* ── Language Card ──────────────────────────────────────────── */}
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

        {/* ── Preferences Card ──────────────────────────────────────── */}
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
          </div>
        </Card>

        {/* ── Danger Zone ───────────────────────────────────────────── */}
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
