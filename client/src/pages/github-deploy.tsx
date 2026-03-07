import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Github,
  Rocket,
  Loader2,
  Plus,
  ExternalLink,
  CheckCircle2,
  Globe,
  FolderGit2,
  ArrowRight,
  Info,
  Server,
} from "lucide-react";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  private: boolean;
  updated_at: string;
}

interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
}

export default function GitHubDeployPage() {
  const { language } = useAuth();
  const lang = language;
  const { toast } = useToast();

  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoDesc, setNewRepoDesc] = useState("");
  const [showNewRepo, setShowNewRepo] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState<string | null>(null);

  const { data: ghUser, isLoading: ghUserLoading } = useQuery<GitHubUser>({
    queryKey: ["/api/github/user"],
  });

  const { data: reposData, isLoading: reposLoading } = useQuery<GitHubRepo[]>({
    queryKey: ["/api/github/repos"],
    enabled: !!ghUser,
  });
  const repos = Array.isArray(reposData) ? reposData : [];

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const generatedProjects = projects.filter((p) => p.generatedHtml);

  const createRepoMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/github/repos", {
        name: newRepoName,
        description: newRepoDesc,
        isPrivate: false,
      });
      return res.json();
    },
    onSuccess: (data: GitHubRepo) => {
      queryClient.invalidateQueries({ queryKey: ["/api/github/repos"] });
      setSelectedRepo(data.full_name);
      setShowNewRepo(false);
      setNewRepoName("");
      setNewRepoDesc("");
      toast({
        title: lang === "ar" ? "تم الإنشاء" : "Created!",
        description: lang === "ar" ? `تم إنشاء المستودع ${data.name}` : `Repository ${data.name} created`,
      });
    },
    onError: (err: Error) => {
      toast({ title: t("error", lang), description: err.message, variant: "destructive" });
    },
  });

  const deployMutation = useMutation({
    mutationFn: async () => {
      const [owner, repo] = selectedRepo.split("/");
      const res = await apiRequest("POST", `/api/github/deploy/${selectedProject}`, {
        owner,
        repo,
      });
      return res.json();
    },
    onSuccess: (data: { repoUrl: string }) => {
      setDeploySuccess(data.repoUrl);
      toast({
        title: lang === "ar" ? "تم النشر" : "Deployed!",
        description: lang === "ar" ? "تم رفع الموقع إلى GitHub بنجاح" : "Website pushed to GitHub successfully",
      });
    },
    onError: (err: Error) => {
      toast({ title: t("error", lang), description: err.message, variant: "destructive" });
    },
  });

  const hostingerSteps = lang === "ar" ? [
    { step: "1", title: "ادخل إلى Hostinger", desc: "سجل دخول إلى حسابك في هوستينجر واذهب إلى لوحة التحكم" },
    { step: "2", title: "اختر الاستضافة", desc: "اختر خطة الاستضافة الخاصة بك واذهب إلى إدارة الموقع" },
    { step: "3", title: "اربط GitHub", desc: "من القائمة الجانبية اذهب إلى Git ثم اربط حسابك على GitHub" },
    { step: "4", title: "اختر المستودع", desc: "اختر المستودع الذي رفعت عليه الموقع والفرع main" },
    { step: "5", title: "حدد المجلد", desc: "حدد المجلد الجذر (/) كمجلد النشر" },
    { step: "6", title: "انشر", desc: "اضغط على نشر وسيتم تحديث موقعك تلقائياً مع كل تغيير" },
  ] : [
    { step: "1", title: "Login to Hostinger", desc: "Sign in to your Hostinger account and go to the dashboard" },
    { step: "2", title: "Select Hosting", desc: "Choose your hosting plan and go to website management" },
    { step: "3", title: "Connect GitHub", desc: "From the sidebar, go to Git and connect your GitHub account" },
    { step: "4", title: "Select Repository", desc: "Choose the repository where you pushed the website and the main branch" },
    { step: "5", title: "Set Directory", desc: "Set the root directory (/) as the deployment folder" },
    { step: "6", title: "Deploy", desc: "Click deploy and your site will auto-update with every change" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-github-deploy-title">
            <Github className="w-6 h-6" />
            {lang === "ar" ? "النشر عبر GitHub" : "Deploy via GitHub"}
          </h1>
          <p className="text-muted-foreground mt-1" data-testid="text-github-deploy-desc">
            {lang === "ar"
              ? "ارفع موقعك إلى GitHub وانشره على هوستينجر أو أي خدمة استضافة"
              : "Push your website to GitHub and deploy it on Hostinger or any hosting service"}
          </p>
        </div>

        {ghUserLoading ? (
          <Card className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">{lang === "ar" ? "جاري الاتصال بـ GitHub..." : "Connecting to GitHub..."}</p>
          </Card>
        ) : ghUser ? (
          <>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <img src={ghUser.avatar_url} alt="" className="w-10 h-10 rounded-full" data-testid="img-github-avatar" />
                <div>
                  <p className="font-semibold" data-testid="text-github-username">{ghUser.name || ghUser.login}</p>
                  <p className="text-sm text-muted-foreground">@{ghUser.login}</p>
                </div>
                <Badge variant="secondary" className="ms-auto">
                  <CheckCircle2 className="w-3.5 h-3.5 me-1 text-emerald-500" />
                  {lang === "ar" ? "متصل" : "Connected"}
                </Badge>
              </div>
            </Card>

            <Card className="p-6 space-y-5">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Rocket className="w-5 h-5 text-emerald-500" />
                {lang === "ar" ? "نشر مشروع إلى GitHub" : "Deploy Project to GitHub"}
              </h2>

              <div className="space-y-3">
                <label className="text-sm font-medium">
                  {lang === "ar" ? "اختر المشروع" : "Select Project"}
                </label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger data-testid="select-project">
                    <SelectValue placeholder={lang === "ar" ? "اختر مشروعاً..." : "Choose a project..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {generatedProjects.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)} data-testid={`option-project-${p.id}`}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {lang === "ar" ? "اختر المستودع" : "Select Repository"}
                  </label>
                  <Dialog open={showNewRepo} onOpenChange={setShowNewRepo}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" data-testid="button-new-repo">
                        <Plus className="w-3.5 h-3.5 me-1" />
                        {lang === "ar" ? "مستودع جديد" : "New Repo"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{lang === "ar" ? "إنشاء مستودع جديد" : "Create New Repository"}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 pt-2">
                        <Input
                          placeholder={lang === "ar" ? "اسم المستودع (بالإنجليزية)" : "Repository name"}
                          value={newRepoName}
                          onChange={(e) => setNewRepoName(e.target.value.replace(/[^a-zA-Z0-9-_]/g, "-"))}
                          data-testid="input-new-repo-name"
                        />
                        <Input
                          placeholder={lang === "ar" ? "وصف المستودع (اختياري)" : "Description (optional)"}
                          value={newRepoDesc}
                          onChange={(e) => setNewRepoDesc(e.target.value)}
                          data-testid="input-new-repo-desc"
                        />
                        <Button
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
                          onClick={() => createRepoMutation.mutate()}
                          disabled={!newRepoName || createRepoMutation.isPending}
                          data-testid="button-create-repo"
                        >
                          {createRepoMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin me-2" />
                          ) : (
                            <FolderGit2 className="w-4 h-4 me-2" />
                          )}
                          {lang === "ar" ? "إنشاء المستودع" : "Create Repository"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {reposLoading ? (
                  <div className="text-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                  </div>
                ) : (
                  <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                    <SelectTrigger data-testid="select-repo">
                      <SelectValue placeholder={lang === "ar" ? "اختر مستودعاً..." : "Choose a repository..."} />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="max-h-[200px]">
                        {repos.map((r) => (
                          <SelectItem key={r.id} value={r.full_name} data-testid={`option-repo-${r.id}`}>
                            <span className="flex items-center gap-2">
                              <FolderGit2 className="w-3.5 h-3.5 text-muted-foreground" />
                              {r.full_name}
                              {r.private && (
                                <Badge variant="outline" className="text-[10px] py-0 px-1">
                                  {lang === "ar" ? "خاص" : "Private"}
                                </Badge>
                              )}
                            </span>
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <Button
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                size="lg"
                onClick={() => deployMutation.mutate()}
                disabled={!selectedProject || !selectedRepo || deployMutation.isPending}
                data-testid="button-deploy-github"
              >
                {deployMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin me-2" />
                    {lang === "ar" ? "جاري الرفع..." : "Deploying..."}
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 me-2" />
                    {lang === "ar" ? "رفع الموقع إلى GitHub" : "Push Website to GitHub"}
                  </>
                )}
              </Button>

              {deploySuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4" data-testid="div-deploy-success">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      {lang === "ar" ? "تم الرفع بنجاح!" : "Successfully Deployed!"}
                    </span>
                  </div>
                  <a
                    href={deploySuccess}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-emerald-600 hover:underline flex items-center gap-1"
                    data-testid="link-repo-url"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {deploySuccess}
                  </a>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <Server className="w-5 h-5 text-blue-500" />
                {lang === "ar" ? "ربط GitHub بهوستينجر" : "Connect GitHub to Hostinger"}
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                {lang === "ar"
                  ? "بعد رفع موقعك إلى GitHub، اتبع هذه الخطوات لربطه بهوستينجر والنشر تلقائياً:"
                  : "After pushing your website to GitHub, follow these steps to connect it to Hostinger for automatic deployment:"}
              </p>

              <div className="space-y-4">
                {hostingerSteps.map((s, i) => (
                  <div key={i} className="flex gap-3" data-testid={`div-hostinger-step-${i}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{s.title}</h4>
                      <p className="text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-5" />

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-700 dark:text-blue-400 mb-1">
                      {lang === "ar" ? "نصيحة مهمة" : "Important Tip"}
                    </p>
                    <p className="text-blue-600 dark:text-blue-300">
                      {lang === "ar"
                        ? "في Hostinger اذهب إلى المواقع > إدارة > متقدم > Git لربط المستودع. تأكد من اختيار الفرع main والمجلد الجذر /public_html"
                        : "In Hostinger go to Websites > Manage > Advanced > Git to connect the repo. Make sure to select the main branch and /public_html as root directory"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <a
                  href="https://www.hostinger.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:underline"
                  data-testid="link-hostinger"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {lang === "ar" ? "زيارة هوستينجر" : "Visit Hostinger"}
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </Card>
          </>
        ) : (
          <Card className="p-8 text-center">
            <Github className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-1">
              {lang === "ar" ? "لم يتم الاتصال بـ GitHub" : "GitHub Not Connected"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? "يرجى ربط حسابك على GitHub أولاً" : "Please connect your GitHub account first"}
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
