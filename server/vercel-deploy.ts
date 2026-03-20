/**
 * Vercel Deployment Service
 * Deploys subscriber websites as static Vercel deployments.
 * Each project gets its own subdomain: {slug}-{id}.arabyweb.net
 */

const VERCEL_API = "https://api.vercel.com";

// The root domain for subscriber subdomains
const SUBSCRIBER_DOMAIN = process.env.SUBSCRIBER_DOMAIN || "arabyweb.net";

function getToken(): string {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) throw new Error("VERCEL_API_TOKEN is not configured");
  return token;
}

/**
 * Slugify Arabic/English project names into a valid subdomain-safe slug.
 * Arabic chars are stripped; special chars become dashes.
 */
function slugifyName(name: string, projectId: number): string {
  const base = name
    .toLowerCase()
    .replace(/[\u0600-\u06FF\s]+/g, "-")   // Arabic/spaces → dash
    .replace(/[^a-z0-9-]+/g, "")            // remove anything else
    .replace(/^-+|-+$/g, "")                // trim leading/trailing dashes
    .replace(/-{2,}/g, "-")                 // collapse multiple dashes
    .slice(0, 35);
  const slug = base || "site";
  return `${slug}-${projectId}`;
}

/**
 * Assign a custom subdomain alias to an existing Vercel deployment.
 * Requires *.arabyweb.net → cname.vercel-dns.com in Hostinger DNS.
 * Returns the full custom URL if successful, null if alias failed (not fatal).
 */
async function assignSubdomain(
  deploymentId: string,
  alias: string,
  token: string,
): Promise<string | null> {
  try {
    const res = await fetch(
      `${VERCEL_API}/v2/deployments/${deploymentId}/aliases`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ alias }),
      },
    );

    const data = await res.json() as { alias?: string; uid?: string; error?: { message?: string } };

    if (!res.ok || data.error) {
      console.warn(`[Vercel] Subdomain alias failed for "${alias}":`, data.error?.message || res.status);
      return null;
    }

    const url = `https://${data.alias || alias}`;
    console.log(`[Vercel] ✅ Subdomain assigned: ${url}`);
    return url;
  } catch (err: any) {
    console.warn(`[Vercel] Subdomain alias error: ${err?.message}`);
    return null;
  }
}

/**
 * Deploy a single HTML page to Vercel as a static site.
 * - Primary URL:  {slug}-{id}.vercel.app  (always works)
 * - Custom URL:   {slug}-{id}.arabyweb.net (if DNS is configured)
 */
export async function deployToVercel(opts: {
  projectId: number;
  projectName: string;
  html: string;
  existingDeploymentId?: string | null;
}): Promise<{ url: string; deploymentId: string }> {
  const token = getToken();
  const projectSlug = slugifyName(opts.projectName, opts.projectId);

  // Encode HTML as base64
  const htmlBase64 = Buffer.from(opts.html, "utf-8").toString("base64");

  const payload = {
    name: projectSlug,
    files: [
      {
        file: "index.html",
        data: htmlBase64,
        encoding: "base64",
      },
    ],
    projectSettings: {
      framework: null,
      outputDirectory: null,
    },
    target: "production",
  };

  console.log(`[Vercel] Deploying "${projectSlug}" (project #${opts.projectId}) ...`);

  const res = await fetch(`${VERCEL_API}/v13/deployments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`[Vercel] Deployment failed (${res.status}):`, err);
    throw new Error(`Vercel deployment failed: ${res.status} — ${err.slice(0, 200)}`);
  }

  const data = await res.json() as { id: string; url: string; readyState?: string };
  const vercelUrl = `https://${data.url}`;
  console.log(`[Vercel] ✅ Deployed: ${vercelUrl} (id=${data.id})`);

  // ── Attempt to assign custom subdomain ────────────────────────────────────
  const subdomain = `${projectSlug}.${SUBSCRIBER_DOMAIN}`;
  const customUrl = await assignSubdomain(data.id, subdomain, token);

  // Use custom URL if alias succeeded, otherwise fall back to vercel.app URL
  const finalUrl = customUrl || vercelUrl;

  return { url: finalUrl, deploymentId: data.id };
}

/** Check if Vercel token is configured */
export function isVercelConfigured(): boolean {
  return !!process.env.VERCEL_API_TOKEN;
}
