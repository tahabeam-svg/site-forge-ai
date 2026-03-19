import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import {
  Download,
  Eye,
  Pencil,
  Trash2,
  Globe2,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import type { Project } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

function statusLabel(s: string, lang: string) {
  if (lang === "ar")
    return (
      {
        draft: "مسودة",
        generating: "قيد الإنشاء",
        generated: "جاهز",
        published: "منشور",
        error: "خطأ",
      }[s] || s
    );
  return s;
}

export default function DownloadCenterPage() {
  const { language } = useAuth();
  const lang = language;
  const isAr = lang === "ar";
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<Set<number>>(new Set());

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: isAr ? "تم الحذف" : "Deleted",
        description: isAr ? "تم حذف الموقع بنجاح" : "Website deleted successfully",
      });
      setDeleteId(null);
    },
    onError: () => {
      toast({
        title: isAr ? "خطأ" : "Error",
        description: isAr ? "فشل الحذف، حاول مرة أخرى" : "Delete failed, try again",
        variant: "destructive",
      });
    },
  });

  const handleDownload = async (project: Project) => {
    if (!project.generatedHtml || downloadingId === project.id) return;
    setDownloadingId(project.id);
    try {
      const res = await fetch(`/api/projects/${project.id}/export?type=static`, {
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "فشل التحميل" }));
        throw new Error(err.message || "Download failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name || "website"}_static.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadedIds(prev => new Set(prev).add(project.id));

      fetch(`/api/projects/${project.id}/signal-export`, {
        method: "POST",
        credentials: "include",
      }).catch(() => {});

      toast({
        title: isAr ? "تم التحميل ✓" : "Downloaded ✓",
        description: isAr
          ? `تم تحميل "${project.name}" بنجاح`
          : `"${project.name}" downloaded successfully`,
      });
    } catch (err: any) {
      toast({
        title: isAr ? "خطأ في التحميل" : "Download Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const generatedProjects = projects.filter(p => p.generatedHtml);
  const draftProjects = projects.filter(p => !p.generatedHtml);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6" dir={isAr ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center">
              <Download className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold" data-testid="text-download-center-title">
                {isAr ? "مركز التحميل" : "Download Center"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isAr
                  ? "حمّل مواقعك أو احذف ما لا تحتاجه"
                  : "Download your websites or delete the ones you no longer need"}
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
              <Sparkles className="w-9 h-9 text-emerald-500/40" />
            </div>
            <p className="text-base font-semibold mb-2">
              {isAr ? "لا توجد مواقع بعد" : "No websites yet"}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {isAr
                ? "أنشئ موقعك الأول باستخدام الذكاء الاصطناعي"
                : "Create your first website using AI"}
            </p>
            <Button onClick={() => navigate("/ai-builder")} data-testid="button-create-first-site">
              <Sparkles className="w-4 h-4 me-2" />
              {isAr ? "إنشاء موقع جديد" : "Create New Site"}
            </Button>
          </div>
        ) : (
          <>
            {/* Ready to download */}
            {generatedProjects.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {isAr ? "جاهزة للتحميل" : "Ready to Download"} ({generatedProjects.length})
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {generatedProjects.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isAr={isAr}
                      isDownloading={downloadingId === project.id}
                      wasDownloaded={downloadedIds.has(project.id)}
                      onDownload={() => handleDownload(project)}
                      onEdit={() => navigate(`/editor/${project.id}`)}
                      onPreview={() => window.open(`/preview/${project.id}`, "_blank")}
                      onDelete={() => setDeleteId(project.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Draft projects */}
            {draftProjects.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Globe2 className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {isAr ? "مسودات" : "Drafts"} ({draftProjects.length})
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {draftProjects.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isAr={isAr}
                      isDownloading={false}
                      wasDownloaded={false}
                      onDownload={() => {}}
                      onEdit={() => navigate(`/editor/${project.id}`)}
                      onPreview={() => {}}
                      onDelete={() => setDeleteId(project.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent dir={isAr ? "rtl" : "ltr"}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isAr ? "حذف الموقع؟" : "Delete Website?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isAr
                ? "سيتم حذف هذا الموقع نهائياً ولا يمكن التراجع عن هذا الإجراء."
                : "This website will be permanently deleted. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isAr ? "flex-row-reverse sm:flex-row-reverse" : ""}>
            <AlertDialogCancel data-testid="button-cancel-delete">
              {isAr ? "إلغاء" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                isAr ? "حذف نهائياً" : "Delete Permanently"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

function ProjectCard({
  project,
  isAr,
  isDownloading,
  wasDownloaded,
  onDownload,
  onEdit,
  onPreview,
  onDelete,
}: {
  project: Project;
  isAr: boolean;
  isDownloading: boolean;
  wasDownloaded: boolean;
  onDownload: () => void;
  onEdit: () => void;
  onPreview: () => void;
  onDelete: () => void;
}) {
  const hasHtml = !!project.generatedHtml;
  const thumbRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.28);

  useEffect(() => {
    if (!thumbRef.current || !hasHtml) return;
    const ro = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / 1280);
    });
    ro.observe(thumbRef.current);
    return () => ro.disconnect();
  }, [hasHtml]);

  return (
    <Card
      className="overflow-hidden flex flex-col group border hover:border-emerald-500/40 transition-all duration-200"
      data-testid={`card-project-${project.id}`}
    >
      {/* Thumbnail */}
      <div
        ref={thumbRef}
        className="relative h-44 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 overflow-hidden cursor-pointer shrink-0"
        onClick={hasHtml ? onPreview : onEdit}
      >
        {hasHtml ? (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <iframe
              srcDoc={project.generatedHtml}
              className="absolute top-0 left-0 border-0 bg-white"
              style={{
                width: "1280px",
                height: `${Math.ceil(176 / scale)}px`,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
              sandbox="allow-same-origin"
              title={project.name}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Sparkles className="w-7 h-7 text-emerald-400/30" />
            <span className="text-xs text-muted-foreground/40">
              {isAr ? "لم يُنشأ بعد" : "Not generated"}
            </span>
          </div>
        )}
        {/* Hover overlay */}
        {hasHtml && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white/90 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <Eye className="w-3 h-3" />
              {isAr ? "معاينة" : "Preview"}
            </div>
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-2 start-2">
          <Badge
            variant={
              project.status === "published"
                ? "default"
                : project.status === "generated"
                ? "secondary"
                : "outline"
            }
            className="text-[10px] h-5 px-1.5 shadow-sm"
          >
            {project.status === "published" && (
              <span className="w-1.5 h-1.5 rounded-full bg-current me-1 animate-pulse inline-block" />
            )}
            {statusLabel(project.status, isAr ? "ar" : "en")}
          </Badge>
        </div>
        {/* Downloaded badge */}
        {wasDownloaded && (
          <div className="absolute top-2 end-2">
            <Badge className="text-[10px] h-5 px-1.5 bg-emerald-500 shadow-sm gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" />
              {isAr ? "تم التحميل" : "Downloaded"}
            </Badge>
          </div>
        )}
      </div>

      {/* Info + Actions */}
      <div className="p-3 flex flex-col gap-3 flex-1">
        <div>
          <h3
            className="text-sm font-semibold truncate cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            onClick={onEdit}
            data-testid={`text-project-name-${project.id}`}
          >
            {project.name}
          </h3>
          {project.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{project.description}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-auto">
          {/* Download — primary action */}
          {hasHtml ? (
            <Button
              size="sm"
              className="flex-1 h-8 text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-sm shadow-emerald-500/20"
              onClick={onDownload}
              disabled={isDownloading}
              data-testid={`button-download-${project.id}`}
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 me-1.5" />
              )}
              {isDownloading
                ? isAr ? "جارٍ التحميل..." : "Downloading..."
                : isAr ? "تحميل ZIP" : "Download ZIP"}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs"
              onClick={onEdit}
              data-testid={`button-generate-${project.id}`}
            >
              <Sparkles className="w-3.5 h-3.5 me-1.5" />
              {isAr ? "إنشاء" : "Generate"}
            </Button>
          )}

          {/* Edit */}
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 shrink-0"
            onClick={onEdit}
            title={isAr ? "تعديل" : "Edit"}
            data-testid={`button-edit-${project.id}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>

          {/* Delete */}
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
            onClick={onDelete}
            title={isAr ? "حذف" : "Delete"}
            data-testid={`button-delete-${project.id}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
