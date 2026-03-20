/**
 * Vercel Deployment Service
 * Deploys subscriber websites as static Vercel deployments.
 * Each project gets its own subdomain: {slug}-{id}.arabyweb.net
 */

const VERCEL_API = "https://api.vercel.com";
const SUBSCRIBER_DOMAIN = process.env.SUBSCRIBER_DOMAIN || "arabyweb.net";

// Vercel team ID — resolved once at startup
let _teamId: string | null | undefined = undefined;

async function getTeamId(token: string): Promise<string | null> {
  if (_teamId !== undefined) return _teamId;
  try {
    const r = await fetch(`${VERCEL_API}/v2/teams`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await r.json() as { teams?: { id: string; slug: string }[] };
    _teamId = d.teams?.[0]?.id || null;
    console.log(`[Vercel] Team: ${_teamId || "personal"}`);
  } catch {
    _teamId = null;
  }
  return _teamId;
}

function teamQs(teamId: string | null): string {
  return teamId ? `?teamId=${teamId}` : "";
}

function getToken(): string {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) throw new Error("VERCEL_API_TOKEN is not configured");
  return token;
}

/** Slugify Arabic/English project names into a valid subdomain-safe slug */
function slugifyName(name: string, projectId: number): string {
  const base = name
    .toLowerCase()
    .replace(/[\u0600-\u06FF\s]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 35);
  const slug = base || "site";
  return `${slug}-${projectId}`;
}

/**
 * Poll Vercel until deployment reaches READY state (or timeout).
 * Vercel static sites usually go READY in 5-20 seconds.
 */
async function waitForReady(
  deploymentId: string,
  token: string,
  teamId: string | null,
  timeoutMs = 90_000,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  const qs = teamQs(teamId);
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 3000));
    try {
      const r = await fetch(`${VERCEL_API}/v13/deployments/${deploymentId}${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json() as { readyState?: string };
      console.log(`[Vercel] readyState=${d.readyState}`);
      if (d.readyState === "READY") return true;
      if (d.readyState === "ERROR" || d.readyState === "CANCELED") return false;
    } catch {
      // transient error — keep polling
    }
  }
  console.warn("[Vercel] Timeout waiting for READY");
  return false;
}

/**
 * Assign a custom subdomain alias once deployment is READY.
 */
async function assignSubdomain(
  deploymentId: string,
  alias: string,
  token: string,
  teamId: string | null,
): Promise<string | null> {
  const qs = teamQs(teamId);
  try {
    const res = await fetch(
      `${VERCEL_API}/v2/deployments/${deploymentId}/aliases${qs}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ alias }),
      },
    );
    const data = await res.json() as { alias?: string; error?: { message?: string } };
    if (!res.ok || data.error) {
      console.warn(`[Vercel] Alias failed for "${alias}":`, data.error?.message || res.status);
      return null;
    }
    const url = `https://${data.alias || alias}`;
    console.log(`[Vercel] ✅ Subdomain assigned: ${url}`);
    return url;
  } catch (err: any) {
    console.warn(`[Vercel] Alias error: ${err?.message}`);
    return null;
  }
}

/**
 * Deploy a single HTML page to Vercel as a static site.
 * Returns custom subdomain URL if DNS is configured, otherwise vercel.app URL.
 */
export async function deployToVercel(opts: {
  projectId: number;
  projectName: string;
  html: string;
  existingDeploymentId?: string | null;
}): Promise<{ url: string; deploymentId: string }> {
  const token = getToken();
  const teamId = await getTeamId(token);
  const qs = teamQs(teamId);
  const projectSlug = slugifyName(opts.projectName, opts.projectId);
  const htmlBase64 = Buffer.from(opts.html, "utf-8").toString("base64");

  console.log(`[Vercel] Deploying "${projectSlug}" (project #${opts.projectId}) ...`);

  const res = await fetch(`${VERCEL_API}/v13/deployments${qs}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: projectSlug,
      files: [{ file: "index.html", data: htmlBase64, encoding: "base64" }],
      projectSettings: { framework: null, outputDirectory: null },
      target: "production",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Vercel deployment failed: ${res.status} — ${err.slice(0, 200)}`);
  }

  const data = await res.json() as { id: string; url: string; readyState?: string };
  const vercelUrl = `https://${data.url}`;
  console.log(`[Vercel] Created: ${vercelUrl} (id=${data.id}, state=${data.readyState})`);

  // ── Wait for READY, then assign custom subdomain ─────────────────────────
  const subdomain = `${projectSlug}.${SUBSCRIBER_DOMAIN}`;
  let finalUrl = vercelUrl;

  const ready = await waitForReady(data.id, token, teamId);
  if (ready) {
    const customUrl = await assignSubdomain(data.id, subdomain, token, teamId);
    if (customUrl) finalUrl = customUrl;
  }

  return { url: finalUrl, deploymentId: data.id };
}

/** Check if Vercel token is configured */
export function isVercelConfigured(): boolean {
  return !!process.env.VERCEL_API_TOKEN;
}
