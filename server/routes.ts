import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { generateWebsite, editWebsiteWithAI } from "./ai";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

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

      const generated = await generateWebsite(description, language);

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

      const result = await editWebsiteWithAI(
        project.generatedHtml || "",
        project.generatedCss || "",
        command,
        language || "ar"
      );

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

  return httpServer;
}
