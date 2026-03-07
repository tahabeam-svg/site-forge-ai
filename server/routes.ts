import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { generateWebsite, editWebsiteWithAI } from "./ai";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
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

  return httpServer;
}
