import type { Express } from "express";
import { isAuthenticated } from "./replitAuth";
import { db } from "../../db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";

export function registerAuthRoutes(app: Express): void {

  // ── Session diagnostics (safe, read-only style) ─────────────────────────
  app.get("/api/session-test", async (req: any, res) => {
    const results: Record<string, any> = {};
    results.nodeEnv = process.env.NODE_ENV;
    results.hasDbUrl = !!process.env.DATABASE_URL;
    results.hasSecret = !!process.env.SESSION_SECRET;
    results.sessionStoreType = req.session?.store?.constructor?.name ?? req.sessionStore?.constructor?.name ?? "unknown";

    // Try writing to the session store directly
    const sid = "test-session-diag-" + Date.now();
    const testData: any = { cookie: { maxAge: 60000 }, _test: true };
    try {
      await new Promise<void>((resolve, reject) => {
        req.sessionStore.set(sid, testData, (err: any) => err ? reject(err) : resolve());
      });
      results.storeSet = "✅ OK";

      await new Promise<void>((resolve, reject) => {
        req.sessionStore.destroy(sid, (err: any) => err ? reject(err) : resolve());
      });
      results.storeDestroy = "✅ OK";
    } catch (e: any) {
      results.storeSet = "❌ " + (e?.message || String(e));
    }

    // Check current session
    results.currentSid = req.sessionID;
    results.isAuthenticated = req.isAuthenticated?.() ?? false;

    res.json(results);
  });
  // ────────────────────────────────────────────────────────────────────────

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) return res.status(404).json({ message: "User not found" });
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
