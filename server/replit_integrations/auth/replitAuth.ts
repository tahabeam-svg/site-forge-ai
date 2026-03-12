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
import { eq, sql, and, gte } from "drizzle-orm";

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
    const sess = JSON.stringify(sessionData);
    try {
      const upd = await this.pool.query(
        `UPDATE session SET sess=$2, expire=$3 WHERE sid=$1`,
        [sid, sess, expire]
      );
      if ((upd.rowCount ?? 0) === 0) {
        await this.pool.query(
          `INSERT INTO session(sid, sess, expire) VALUES($1,$2,$3)`,
          [sid, sess, expire]
        ).catch(async () => {
          await this.pool.query(
            `UPDATE session SET sess=$2, expire=$3 WHERE sid=$1`,
            [sid, sess, expire]
          );
        });
      }
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

// ── Helper: extract real IP respecting reverse proxies ───────────────────────
function getRealIp(req: any): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const ips = (forwarded as string).split(",").map((s: string) => s.trim());
    return ips[0] || req.ip || "unknown";
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
}

// ── Rate limit: max N registrations per IP per 24 hours ──────────────────────
const MAX_REGISTRATIONS_PER_IP = 3;
const REGISTRATION_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

async function checkRegistrationRateLimit(ip: string): Promise<{ blocked: boolean; count: number }> {
  if (!ip || ip === "unknown" || ip === "::1" || ip === "127.0.0.1") {
    // Don't rate-limit localhost (dev)
    return { blocked: false, count: 0 };
  }
  const since = new Date(Date.now() - REGISTRATION_WINDOW_MS);
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(
      and(
        eq(users.registrationIp, ip),
        gte(users.createdAt, since)
      )
    );
  const count = result[0]?.count ?? 0;
  return { blocked: count >= MAX_REGISTRATIONS_PER_IP, count };
}

// ────────────────────────────────────────────────────────────────────────────

let _pgPool: Pool | null = null;

async function getOrCreatePool(): Promise<Pool | null> {
  if (!process.env.DATABASE_URL) return null;
  if (_pgPool) return _pgPool;
  _pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await _pgPool.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid varchar NOT NULL,
        sess json NOT NULL,
        expire timestamp(6) NOT NULL
      )
    `);
    try {
      await _pgPool.query(
        `ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid)`
      );
    } catch {
      const { rows } = await _pgPool.query(`
        SELECT conname, condeferrable FROM pg_constraint
        WHERE conname='session_pkey' AND contype='p'
      `);
      if (rows[0]?.condeferrable) {
        await _pgPool.query(`ALTER TABLE session DROP CONSTRAINT session_pkey`);
        await _pgPool.query(`ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid)`);
        console.log("Session PK constraint fixed (was deferrable, now non-deferrable)");
      }
    }
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

  // ── Local strategy: check suspended before allowing login ────────────────
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
          if (!user) return done(null, false, { message: "البريد الإلكتروني غير مسجل" });
          if (!user.password) return done(null, false, { message: "هذا الحساب مسجل عبر Google، استخدم تسجيل الدخول بـ Google" });
          if (user.isSuspended) return done(null, false, { message: "تم تعليق هذا الحساب. تواصل مع الدعم للمزيد." });
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
    const callbackURL = process.env.GOOGLE_CALLBACK_URL ||
      (process.env.DOMAIN ? `https://${process.env.DOMAIN}/api/auth/google/callback` : "/api/auth/google/callback");
    console.log("Google OAuth callback URL:", callbackURL);
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL,
          proxy: true,
          passReqToCallback: true,
        } as any,
        async (req: any, _accessToken: string, _refreshToken: string, profile: any, done: any) => {
          try {
            const ip = getRealIp(req);
            const email = profile.emails?.[0]?.value?.toLowerCase();
            const googleId = profile.id;

            // Check if existing Google account is suspended
            const [existing] = await db.select().from(users).where(eq(users.googleId, googleId));
            if (existing) {
              if (existing.isSuspended) {
                return done(null, false, { message: "تم تعليق هذا الحساب" });
              }
              // Update last login IP
              const [updated] = await db.update(users).set({
                lastLoginIp: ip,
                updatedAt: new Date(),
              }).where(eq(users.id, existing.id)).returning();
              return done(null, updated);
            }

            // Check by email
            if (email) {
              const [byEmail] = await db.select().from(users).where(eq(users.email, email));
              if (byEmail) {
                if (byEmail.isSuspended) {
                  return done(null, false, { message: "تم تعليق هذا الحساب" });
                }
                const [updated] = await db.update(users).set({
                  googleId,
                  profileImageUrl: profile.photos?.[0]?.value || byEmail.profileImageUrl,
                  lastLoginIp: ip,
                  updatedAt: new Date(),
                }).where(eq(users.id, byEmail.id)).returning();
                return done(null, updated);
              }
            }

            // New Google account — check rate limit
            const { blocked, count } = await checkRegistrationRateLimit(ip);
            if (blocked) {
              console.warn(`[FRAUD] Google registration blocked: IP ${ip} already has ${count} accounts`);
              return done(null, false, {
                message: `تم تجاوز الحد المسموح به للتسجيل من هذا الجهاز (${MAX_REGISTRATIONS_PER_IP} حسابات خلال 24 ساعة).`,
              });
            }

            const [newUser] = await db.insert(users).values({
              email,
              googleId,
              firstName: profile.name?.givenName || profile.displayName,
              lastName: profile.name?.familyName || "",
              profileImageUrl: profile.photos?.[0]?.value || "",
              registrationIp: ip,
              lastLoginIp: ip,
            }).returning();

            console.log(`[AUTH] New Google user: ${email} from IP ${ip}`);
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

  // ── Register ─────────────────────────────────────────────────────────────
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "البريد الإلكتروني وكلمة المرور مطلوبان" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
      }

      const ip = getRealIp(req);

      // Check IP-based rate limit
      const { blocked, count } = await checkRegistrationRateLimit(ip);
      if (blocked) {
        console.warn(`[FRAUD] Email registration blocked: IP ${ip} already has ${count} accounts`);
        return res.status(429).json({
          message: `تم تجاوز الحد المسموح به للتسجيل من هذا الجهاز (${MAX_REGISTRATIONS_PER_IP} حسابات خلال 24 ساعة). حاول مرة أخرى لاحقاً.`,
        });
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
        registrationIp: ip,
        lastLoginIp: ip,
      }).returning();

      console.log(`[AUTH] New user: ${email} from IP ${ip}`);
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

  // ── Login: capture IP on success ─────────────────────────────────────────
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "بيانات الدخول غير صحيحة" });
      req.login(user, async (err) => {
        if (err) return next(err);
        // Update last login IP
        const ip = getRealIp(req);
        try {
          await db.update(users).set({ lastLoginIp: ip, updatedAt: new Date() }).where(eq(users.id, user.id));
        } catch { /* non-critical */ }
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
            const reason = info?.message || "no_user";
            console.warn("Google OAuth: no user returned", info);
            return res.redirect("/auth?error=google&reason=" + encodeURIComponent(reason));
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

export const isAuthenticated: RequestHandler = (req: any, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // Block suspended accounts from accessing protected routes
  if (req.user?.isSuspended) {
    req.logout(() => req.session?.destroy(() => {}));
    return res.status(403).json({
      message: "تم تعليق هذا الحساب. تواصل مع الدعم للمزيد.",
      suspended: true,
    });
  }
  next();
};
