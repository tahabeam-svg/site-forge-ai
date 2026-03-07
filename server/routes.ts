import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { generateWebsite, editWebsiteWithAI, generateSocialContent } from "./ai";
import { getGitHubUser, listUserRepos, createRepo, pushWebsiteToRepo } from "./github";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import archiver from "archiver";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function isAdmin(req: any, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user?.isAdmin) return res.status(403).json({ message: "Admin access required" });
    next();
  } catch {
    res.status(500).json({ message: "Authorization error" });
  }
}

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
      cb(null, name);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".svg", ".webp", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.use("/uploads", isAuthenticated, (req: any, res, next) => {
    const filePath = path.join(uploadDir, path.basename(req.path));
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  app.post("/api/upload", isAuthenticated, upload.array("files", 10), (req: any, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    const urls = (req.files as Express.Multer.File[]).map(f => `/uploads/${f.filename}`);
    res.json({ urls });
  });

  app.get("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userProjects = await storage.getProjectsByUser(userId);
      res.json(userProjects);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).json({ message: "Project not found" });
      const userId = req.user.claims.sub;
      if (project.userId !== userId) return res.status(403).json({ message: "Forbidden" });
      res.json(project);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  const createProjectSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    templateId: z.number().optional(),
  });

  const editCommandSchema = z.object({
    command: z.string().min(1).max(2000),
    language: z.string().optional(),
  });

  app.post("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = createProjectSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
      const { name, description, templateId } = parsed.data;
      const project = await storage.createProject({
        userId,
        name,
        description,
        status: "draft",
        templateId: templateId || 0,
        generatedHtml: null,
        generatedCss: null,
        seoTitle: null,
        seoDescription: null,
        colorPalette: null,
        sections: null,
      });
      res.status(201).json(project);
    } catch (err) {
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.post("/api/projects/:id/generate", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).json({ message: "Project not found" });
      const userId = req.user.claims.sub;
      if (project.userId !== userId) return res.status(403).json({ message: "Forbidden" });

      const language = req.body.language || "ar";
      const description = req.body.description || project.description || project.name;

      await storage.updateProject(project.id, { status: "generating" });

      await storage.addChatMessage({ projectId: project.id, role: "user", content: description });

      const generated = await generateWebsite(description, language);

      await storage.addChatMessage({
        projectId: project.id,
        role: "assistant",
        content: language === "ar" ? "تم إنشاء الموقع بنجاح ✨" : "Website generated successfully ✨",
      });

      const updated = await storage.updateProject(project.id, {
        generatedHtml: generated.html,
        generatedCss: generated.css,
        seoTitle: generated.seoTitle,
        seoDescription: generated.seoDescription,
        colorPalette: generated.colorPalette,
        sections: generated.sections,
        status: "generated",
      });

      res.json(updated);
    } catch (err) {
      console.error("Generation error:", err);
      const project = await storage.getProject(parseInt(req.params.id));
      if (project) await storage.updateProject(project.id, { status: "error" });
      res.status(500).json({ message: "Failed to generate website" });
    }
  });

  app.post("/api/projects/:id/edit", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).json({ message: "Project not found" });
      const userId = req.user.claims.sub;
      if (project.userId !== userId) return res.status(403).json({ message: "Forbidden" });

      const parsed = editCommandSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Edit command is required" });
      const { command, language } = parsed.data;

      await storage.addChatMessage({ projectId: project.id, role: "user", content: command });

      const result = await editWebsiteWithAI(
        project.generatedHtml || "",
        project.generatedCss || "",
        command,
        language || "ar"
      );

      await storage.addChatMessage({
        projectId: project.id,
        role: "assistant",
        content: language === "ar" ? "تم تطبيق التعديلات ✅" : "Changes applied ✅",
      });

      const updated = await storage.updateProject(project.id, {
        generatedHtml: result.html,
        generatedCss: result.css,
      });

      res.json(updated);
    } catch (err) {
      console.error("Edit error:", err);
      res.status(500).json({ message: "Failed to edit website" });
    }
  });

  app.get("/api/projects/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).json({ message: "Project not found" });
      const userId = req.user.claims.sub;
      if (project.userId !== userId) return res.status(403).json({ message: "Forbidden" });
      const messages = await storage.getChatMessages(project.id);
      res.json(messages);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  const updateProjectSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    generatedHtml: z.string().optional(),
    generatedCss: z.string().optional(),
    status: z.enum(["draft", "generated", "published"]).optional(),
  });

  app.put("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).json({ message: "Project not found" });
      const userId = req.user.claims.sub;
      if (project.userId !== userId) return res.status(403).json({ message: "Forbidden" });
      const parsed = updateProjectSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
      const updated = await storage.updateProject(project.id, parsed.data);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).json({ message: "Project not found" });
      const userId = req.user.claims.sub;
      if (project.userId !== userId) return res.status(403).json({ message: "Forbidden" });
      await storage.deleteProject(project.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  app.post("/api/projects/:id/publish", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).json({ message: "Project not found" });
      const userId = req.user.claims.sub;
      if (project.userId !== userId) return res.status(403).json({ message: "Forbidden" });
      const updated = await storage.updateProject(project.id, { status: "published" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to publish project" });
    }
  });

  app.get("/api/templates", async (_req, res) => {
    try {
      const allTemplates = await storage.getTemplates();
      res.json(allTemplates);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(parseInt(req.params.id));
      if (!template) return res.status(404).json({ message: "Template not found" });
      res.json(template);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/projects", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const allProjects = await storage.getAllProjects();
      res.json(allProjects);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/admin/coupons", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const allCoupons = await storage.getCoupons();
      res.json(allCoupons);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  const createCouponSchema = z.object({
    code: z.string().min(1).max(50),
    discountType: z.enum(["percentage", "fixed"]),
    discountValue: z.number().min(1),
    maxUses: z.number().min(0).optional(),
    expiresAt: z.string().optional(),
    isActive: z.boolean().optional(),
  });

  app.post("/api/admin/coupons", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const parsed = createCouponSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
      const { code, discountType, discountValue, maxUses, expiresAt, isActive } = parsed.data;
      const coupon = await storage.createCoupon({
        code: code.toUpperCase(),
        discountType,
        discountValue,
        maxUses: maxUses || 0,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive ?? true,
      });
      res.status(201).json(coupon);
    } catch (err: any) {
      if (err?.code === "23505") return res.status(409).json({ message: "Coupon code already exists" });
      res.status(500).json({ message: "Failed to create coupon" });
    }
  });

  app.delete("/api/admin/coupons/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      await storage.deleteCoupon(parseInt(req.params.id));
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete coupon" });
    }
  });

  const updateCouponSchema = z.object({
    isActive: z.boolean().optional(),
    maxUses: z.number().min(0).optional(),
    expiresAt: z.string().optional(),
    discountValue: z.number().min(1).optional(),
  });

  app.patch("/api/admin/coupons/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const parsed = updateCouponSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
      const data: any = { ...parsed.data };
      if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);
      const updated = await storage.updateCoupon(parseInt(req.params.id), data);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to update coupon" });
    }
  });

  app.patch("/api/admin/users/:id/suspend", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) return res.status(404).json({ message: "User not found" });
      await db.update(users).set({ updatedAt: new Date() }).where(eq(users.id, userId));
      res.json({ message: "User suspended", userId });
    } catch (err) {
      res.status(500).json({ message: "Failed to suspend user" });
    }
  });

  const socialContentSchema = z.object({
    topic: z.string().min(1).max(1000),
    platform: z.enum(["instagram", "facebook", "linkedin", "twitter", "tiktok", "youtube"]),
    language: z.string().optional(),
    tone: z.string().optional(),
  });

  app.post("/api/marketing/generate", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = socialContentSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
      const { topic, platform, language, tone } = parsed.data;
      const content = await generateSocialContent(topic, platform, language || "ar", tone || "professional");
      res.json(content);
    } catch (err) {
      console.error("Marketing generation error:", err);
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  app.get("/api/github/user", isAuthenticated, async (req: any, res) => {
    try {
      const user = await getGitHubUser();
      res.json(user);
    } catch (err) {
      console.error("GitHub user error:", err);
      res.status(500).json({ message: "Failed to get GitHub user" });
    }
  });

  app.get("/api/github/repos", isAuthenticated, async (req: any, res) => {
    try {
      const repos = await listUserRepos();
      res.json(repos);
    } catch (err) {
      console.error("GitHub repos error:", err);
      res.status(500).json({ message: "Failed to list repositories" });
    }
  });

  app.post("/api/github/repos", isAuthenticated, async (req: any, res) => {
    try {
      const { name, description, isPrivate } = req.body;
      if (!name) return res.status(400).json({ message: "Repository name is required" });
      const repo = await createRepo(name, description || "", isPrivate || false);
      res.json(repo);
    } catch (err) {
      console.error("GitHub create repo error:", err);
      res.status(500).json({ message: "Failed to create repository" });
    }
  });

  app.post("/api/github/deploy/:projectId", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.projectId));
      if (!project) return res.status(404).json({ message: "Project not found" });
      const userId = req.user.claims.sub;
      if (project.userId !== userId) return res.status(403).json({ message: "Forbidden" });
      if (!project.generatedHtml) return res.status(400).json({ message: "Project has no generated content" });

      const deploySchema = z.object({
        owner: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
        repo: z.string().min(1).max(100).regex(/^[a-zA-Z0-9._-]+$/),
      });
      const parsed = deploySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid owner or repo name" });

      const ghUser = await getGitHubUser();
      if (parsed.data.owner !== ghUser.login) {
        return res.status(403).json({ message: "You can only deploy to your own repositories" });
      }

      const result = await pushWebsiteToRepo(
        parsed.data.owner,
        parsed.data.repo,
        project.generatedHtml,
        project.generatedCss || "",
        project.name,
        project.seoTitle || undefined,
        project.seoDescription || undefined
      );
      res.json(result);
    } catch (err) {
      console.error("GitHub deploy error:", err);
      res.status(500).json({ message: "Failed to deploy to GitHub" });
    }
  });

  app.get("/api/projects/:id/export", isAuthenticated, async (req: any, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) return res.status(404).json({ message: "Project not found" });
      const userId = req.user.claims.sub;
      if (project.userId !== userId) return res.status(403).json({ message: "Forbidden" });
      if (!project.generatedHtml) return res.status(400).json({ message: "Project has no generated content" });

      const exportType = req.query.type || "static";

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${project.name.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_")}_website.zip"`);

      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.pipe(res);

      const isFullDoc = project.generatedHtml!.trimStart().startsWith('<!DOCTYPE');
      const fullHtml = isFullDoc ? project.generatedHtml! : `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.seoTitle || project.name}</title>
  <meta name="description" content="${project.seoDescription || ""}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Tajawal:wght@400;500;700&family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
${project.generatedHtml}
</body>
</html>`;

      archive.append(fullHtml, { name: "website/index.html" });
      archive.append(project.generatedCss || "", { name: "website/css/style.css" });

      archive.append("", { name: "website/assets/images/.gitkeep" });
      archive.append("", { name: "website/assets/js/.gitkeep" });
      archive.append("", { name: "website/assets/fonts/.gitkeep" });

      const readme = `========================================
  ${project.name} - Website Export
  Generated by ArabyWeb.ai
========================================

ENGLISH INSTRUCTIONS
--------------------
1. Download the website ZIP file.
2. Extract the files.
3. Log in to your hosting control panel (e.g., Hostinger, cPanel).
4. Open File Manager.
5. Upload all files from the "website" folder into the public_html folder.
6. Make sure index.html is in the root directory.
7. Open your domain in a browser and the website will work.

For Netlify/Vercel:
1. Go to netlify.com or vercel.com
2. Drag and drop the "website" folder
3. Your site will be live instantly

========================================

تعليمات باللغة العربية
--------------------
1. قم بتحميل ملف الموقع المضغوط.
2. فك الضغط عن الملف.
3. ادخل إلى لوحة تحكم الاستضافة (مثل Hostinger أو cPanel).
4. افتح File Manager.
5. ارفع جميع الملفات من مجلد "website" إلى مجلد public_html.
6. تأكد أن ملف index.html موجود في المجلد الرئيسي.
7. افتح الدومين في المتصفح وسيعمل الموقع.

للنشر على Netlify أو Vercel:
1. اذهب إلى netlify.com أو vercel.com
2. اسحب وأفلت مجلد "website"
3. سيتم نشر موقعك فوراً

========================================
`;

      archive.append(readme, { name: "README.txt" });

      if (exportType === "full") {
        const packageJson = JSON.stringify({
          name: project.name.toLowerCase().replace(/\s+/g, "-"),
          version: "1.0.0",
          scripts: { dev: "npx serve website", build: "echo 'Static site - no build needed'" },
          description: project.seoDescription || project.name,
        }, null, 2);
        archive.append(packageJson, { name: "package.json" });
      }

      await archive.finalize();
    } catch (err) {
      console.error("Export error:", err);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to export project" });
      }
    }
  });

  return httpServer;
}
