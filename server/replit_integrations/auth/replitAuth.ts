import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import { Store } from "express-session";
import memorystore from "memorystore";
import { Pool } from "pg";
import type { Express, RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { db } from "../../db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";

const MemoryStore = memorystore(session);

// ── Custom PostgreSQL session store (no external files needed) ──────────────
class PgSessionStore extends Store {
  private pool: Pool;
  private ttlSeconds: number;

  constructor(pool: Pool, ttlSeconds: number) {
    super();
    this.pool = pool;
    this.ttlSeconds = ttlSeconds;
  }

  async get(sid: string, cb: (err: any, session?: session.SessionData | null) => void) {
    try {
      const { rows } = await this.pool.query(
        `SELECT sess FROM session WHERE sid=$1 AND expire > NOW()`,
        [sid]
      );
      cb(null, rows[0] ? rows[0].sess : null);
    } catch (e) { cb(e); }
  }

  async set(sid: string, sessionData: session.SessionData, cb?: (err?: any) => void) {
    const expire = new Date(Date.now() + this.ttlSeconds * 1000);
    try {
      await this.pool.query(
        `INSERT INTO session(sid, sess, expire) VALUES($1,$2,$3)
         ON CONFLICT(sid) DO UPDATE SET sess=$2, expire=$3`,
        [sid, JSON.stringify(sessionData), expire]
      );
      cb?.();
    } catch (e) { cb?.(e); }
  }

  async destroy(sid: string, cb?: (err?: any) => void) {
    try {
      await this.pool.query(`DELETE FROM session WHERE sid=$1`, [sid]);
      cb?.();
    } catch (e) { cb?.(e); }
  }

  async touch(sid: string, _session: session.SessionData, cb?: () => void) {
    const expire = new Date(Date.now() + this.ttlSeconds * 1000);
    try {
      await this.pool.query(
        `UPDATE session SET expire=$2 WHERE sid=$1`,
        [sid, expire]
      );
      cb?.();
    } catch { cb?.(); }
  }
}
// ────────────────────────────────────────────────────────────────────────────

let _pgPool: Pool | null = null;

async function getOrCreatePool(): Promise<Pool | null> {
  if (!process.env.DATABASE_URL) return null;
  if (_pgPool) return _pgPool;
  _pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    // Ensure session table exists
    await _pgPool.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid varchar NOT NULL PRIMARY KEY,
        sess json NOT NULL,
        expire timestamp(6) NOT NULL
      )
    `);
    await _pgPool.query(
      `CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON session (expire)`
    );
    console.log("Session table ready (custom PgSessionStore)");
    return _pgPool;
  } catch (err: any) {
    console.error("Session table init failed:", err.message);
    await _pgPool.end().catch(() => {});
    _pgPool = null;
    return null;
  }
}

async function buildSessionMiddleware() {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }
  const sessionTtl = 30 * 24 * 60 * 60 * 1000;
  const ttlSec = sessionTtl / 1000;

  const pool = await getOrCreatePool();
  const store = pool
    ? new PgSessionStore(pool, ttlSec)
    : new MemoryStore({ checkPeriod: sessionTtl });

  if (!pool) {
    console.warn("⚠️  Using MemoryStore for sessions (sessions will reset on restart)");
  }

  return session({
    secret: process.env.SESSION_SECRET,
    store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(await buildSessionMiddleware());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
          if (!user) return done(null, false, { message: "البريد الإلكتروني غير مسجل" });
          if (!user.password) return done(null, false, { message: "هذا الحساب مسجل عبر Google، استخدم تسجيل الدخول بـ Google" });
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) return done(null, false, { message: "كلمة المرور غير صحيحة" });
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // Use explicit callback URL from env, or auto-build from DOMAIN, or fallback to relative
    const callbackURL = process.env.GOOGLE_CALLBACK_URL ||
      (process.env.DOMAIN ? `https://${process.env.DOMAIN}/api/auth/google/callback` : "/api/auth/google/callback");
    console.log("Google OAuth callback URL:", callbackURL);
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL,
          proxy: true, // trust X-Forwarded-Proto from Nginx (Hostinger)
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value?.toLowerCase();
            const googleId = profile.id;
            const [existing] = await db.select().from(users).where(eq(users.googleId, googleId));
            if (existing) {
              return done(null, existing);
            }
            if (email) {
              const [byEmail] = await db.select().from(users).where(eq(users.email, email));
              if (byEmail) {
                const [updated] = await db.update(users).set({
                  googleId,
                  profileImageUrl: profile.photos?.[0]?.value || byEmail.profileImageUrl,
                  updatedAt: new Date(),
                }).where(eq(users.id, byEmail.id)).returning();
                return done(null, updated);
              }
            }
            const [newUser] = await db.insert(users).values({
              email,
              googleId,
              firstName: profile.name?.givenName || profile.displayName,
              lastName: profile.name?.familyName || "",
              profileImageUrl: profile.photos?.[0]?.value || "",
            }).returning();
            return done(null, newUser);
          } catch (err) {
            console.error("Google OAuth error:", err);
            return done(err as Error);
          }
        }
      )
    );
  } else {
    console.warn("Google OAuth: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set — Google login disabled");
  }

  passport.serializeUser((user: any, cb) => cb(null, user.id));
  passport.deserializeUser(async (id: string, cb) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      cb(null, user || null);
    } catch (err) {
      cb(err);
    }
  });

  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "البريد الإلكتروني وكلمة المرور مطلوبان" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
      }
      const [existing] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      if (existing) {
        return res.status(409).json({ message: "هذا البريد الإلكتروني مسجل مسبقاً" });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const [newUser] = await db.insert(users).values({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: firstName || "",
        lastName: lastName || "",
      }).returning();

      req.login(newUser, (err) => {
        if (err) return next(err);
        const { password: _, ...safeUser } = newUser;
        res.json(safeUser);
      });
    } catch (err) {
      console.error("Register error:", err);
      res.status(500).json({ message: "حدث خطأ أثناء التسجيل" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "بيانات الدخول غير صحيحة" });
      req.login(user, (err) => {
        if (err) return next(err);
        const { password: _, ...safeUser } = user;
        res.json(safeUser);
      });
    })(req, res, next);
  });

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
    app.get("/api/auth/google/callback",
      (req, res, next) => {
        passport.authenticate("google", (err: any, user: any, info: any) => {
          if (err) {
            console.error("Google OAuth callback error:", err?.message || err);
            return res.redirect("/auth?error=google&reason=" + encodeURIComponent(err?.message || "unknown"));
          }
          if (!user) {
            console.warn("Google OAuth: no user returned", info);
            return res.redirect("/auth?error=google&reason=no_user");
          }
          req.login(user, (loginErr) => {
            if (loginErr) {
              const msg = loginErr?.message || String(loginErr) || "unknown";
              console.error("Google login session error:", msg);
              return res.redirect("/auth?error=google&reason=" + encodeURIComponent(msg));
            }
            return res.redirect("/");
          });
        })(req, res, next);
      }
    );
  } else {
    // Show helpful error if Google is not configured
    app.get("/api/auth/google", (_req, res) => {
      res.status(503).json({ message: "Google login is not configured on this server" });
    });
  }

  app.get("/api/login", (_req, res) => res.redirect("/auth"));

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      req.session.destroy(() => {
        res.json({ success: true });
      });
    });
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      req.session.destroy(() => {
        res.redirect("/");
      });
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
};
