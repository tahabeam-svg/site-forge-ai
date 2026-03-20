/**
 * Vercel Deployment Service
 * Deploys subscriber websites as static Vercel deployments.
 * Each project gets its own unique Vercel URL: <project-slug>.vercel.app
 */

const VERCEL_API = "https://api.vercel.com";

function getToken(): string {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) throw new Error("VERCEL_API_TOKEN is not configured");
  return token;
}

/** Slugify Arabic/English project names into a valid Vercel project name */
function slugifyName(name: string, projectId: number): string {
  const base = name
    .toLowerCase()
    .replace(/[\u0600-\u06FF]/g, "") // strip Arabic chars
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const slug = base || "arabyweb-site";
  return `${slug}-${projectId}`;
}

/**
 * Deploy a single HTML page to Vercel as a static site.
 * Returns the public URL on success.
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

  // Build the deployment payload
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

  console.log(`[Vercel] Deploying project ${opts.projectId} as "${projectSlug}" ...`);

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

  const data = await res.json() as {
    id: string;
    url: string;
    readyState?: string;
  };

  const url = `https://${data.url}`;
  console.log(`[Vercel] ✅ Deployed: ${url} (id=${data.id})`);

  return { url, deploymentId: data.id };
}

/** Check if Vercel token is configured */
export function isVercelConfigured(): boolean {
  return !!process.env.VERCEL_API_TOKEN;
}
