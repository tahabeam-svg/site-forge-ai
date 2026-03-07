import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Rocket,
  Sparkles,
  Loader2,
  FolderOpen,
  Download,
} from "lucide-react";

export default function DashboardPage() {
  const { language } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const lang = language;
  const [showNewProject, setShowNewProject] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/projects", { name: newName, description: newDesc });
      return res.json();
    },
    onSuccess: (project: Project) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setShowNewProject(false);
      setNewName("");
      setNewDesc("");
      navigate(`/editor/${project.id}`);
    },
    onError: (err: Error) => {
      toast({ title: t("error", lang), description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setDeleteId(null);
      toast({ title: lang === "ar" ? "تم الحذف" : "Deleted", description: lang === "ar" ? "تم حذف المشروع بنجاح" : "Project deleted successfully" });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/projects/${id}/publish`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: lang === "ar" ? "تم النشر" : "Published", description: lang === "ar" ? "تم نشر موقعك بنجاح" : "Your website has been published" });
    },
  });

  const statusColor = (status: string) => {
    switch (status) {
      case "published": return "default";
      case "generated": return "secondary";
      case "generating": return "outline";
      default: return "outline";
    }
  };

  const statusLabel = (status: string) => {
    const labels: Record<string, Record<string, string>> = {
      en: { draft: "Draft", generating: "Generating...", generated: "Ready", published: "Published", error: "Error" },
      ar: { draft: "مسودة", generating: "جاري الإنشاء...", generated: "جاهز", published: "منشور", error: "خطأ" },
    };
    return labels[lang]?.[status] || status;
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">
              {t("projects", lang)}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {lang === "ar"
                ? `${projects.length} مشروع`
                : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Button onClick={() => setShowNewProject(true)} data-testid="button-new-project">
            <Plus className="w-4 h-4 me-2" />
            {t("newProject", lang)}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2" data-testid="text-no-projects">
              {t("noProjects", lang)}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t("noProjectsDesc", lang)}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button onClick={() => setShowNewProject(true)} data-testid="button-create-first">
                <Sparkles className="w-4 h-4 me-2" />
                {t("startFromScratch", lang)}
              </Button>
              <Button variant="outline" onClick={() => navigate("/templates")} data-testid="button-browse-templates">
                {t("useTemplate", lang)}
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence>
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="hover-elevate group" data-testid={`card-project-${project.id}`}>
                    <div className="relative h-40 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-pink-500/10 rounded-t-lg overflow-hidden">
                      {project.generatedHtml ? (
                        <div className="absolute inset-0 p-2 overflow-hidden pointer-events-none">
                          <iframe
                            srcDoc={`<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,sans-serif;transform:scale(0.4);transform-origin:top left;width:250%;height:250%}${project.generatedCss||""}</style></head><body>${project.generatedHtml}</body></html>`}
                            className="w-full h-full rounded bg-white border-0"
                            sandbox="allow-same-origin"
                            title="Project thumbnail"
                          />
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge variant={statusColor(project.status)} data-testid={`badge-status-${project.id}`}>
                          {statusLabel(project.status)}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1 truncate" data-testid={`text-project-name-${project.id}`}>
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/editor/${project.id}`)}
                          data-testid={`button-edit-${project.id}`}
                        >
                          <Pencil className="w-3.5 h-3.5 me-1" />
                          {t("edit", lang)}
                        </Button>
                        {project.generatedHtml && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/preview/${project.id}`)}
                            data-testid={`button-preview-${project.id}`}
                          >
                            <Eye className="w-3.5 h-3.5 me-1" />
                            {t("preview", lang)}
                          </Button>
                        )}
                        {project.generatedHtml && project.status !== "published" && (
                          <Button
                            size="sm"
                            onClick={() => publishMutation.mutate(project.id)}
                            disabled={publishMutation.isPending}
                            data-testid={`button-publish-${project.id}`}
                          >
                            <Rocket className="w-3.5 h-3.5 me-1" />
                            {t("publish", lang)}
                          </Button>
                        )}
                        {project.generatedHtml && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              window.open(`/api/projects/${project.id}/export?type=static`, "_blank");
                            }}
                            data-testid={`button-download-${project.id}`}
                          >
                            <Download className="w-3.5 h-3.5 me-1" />
                            {lang === "ar" ? "تحميل" : "Download"}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(project.id)}
                          className="ms-auto text-muted-foreground"
                          data-testid={`button-delete-${project.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("createProject", lang)}</DialogTitle>
            <DialogDescription>
              {lang === "ar"
                ? "صف موقعك وسيقوم الذكاء الاصطناعي ببنائه لك"
                : "Describe your website and AI will build it for you"}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newName) createMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("projectName", lang)}</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={lang === "ar" ? "معرض العطور" : "Perfume Exhibition"}
                required
                data-testid="input-project-name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("projectDescription", lang)}</label>
              <Textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder={t("descriptionPlaceholder", lang)}
                className="resize-none"
                rows={3}
                data-testid="input-project-description"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowNewProject(false)} data-testid="button-cancel-create">
                {t("cancel", lang)}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || !newName} data-testid="button-confirm-create">
                {createMutation.isPending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                {t("createProject", lang)}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("areYouSure", lang)}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteConfirm", lang)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">{t("cancel", lang)}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              data-testid="button-confirm-delete"
            >
              {t("delete", lang)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
