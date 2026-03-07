import { ReplitConnectors } from "@replit/connectors-sdk";

const connectors = new ReplitConnectors();

export async function getGitHubUser() {
  const response = await connectors.proxy("github", "/user", { method: "GET" });
  return response.json();
}

export async function listUserRepos() {
  const response = await connectors.proxy("github", "/user/repos?per_page=100&sort=updated", { method: "GET" });
  return response.json();
}

export async function createRepo(name: string, description: string, isPrivate: boolean = false) {
  const response = await connectors.proxy("github", "/user/repos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      description,
      private: isPrivate,
      auto_init: true,
    }),
  });
  return response.json();
}

export async function getRepoContents(owner: string, repo: string, path: string = "") {
  const response = await connectors.proxy("github", `/repos/${owner}/${repo}/contents/${path}`, { method: "GET" });
  return response.json();
}

export async function createOrUpdateFile(
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  sha?: string
) {
  const body: any = {
    message,
    content: Buffer.from(content).toString("base64"),
  };
  if (sha) body.sha = sha;

  const response = await connectors.proxy("github", `/repos/${owner}/${repo}/contents/${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return response.json();
}

export async function deleteFile(
  owner: string,
  repo: string,
  path: string,
  sha: string,
  message: string
) {
  const response = await connectors.proxy("github", `/repos/${owner}/${repo}/contents/${path}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sha }),
  });
  return response.json();
}

export async function pushWebsiteToRepo(
  owner: string,
  repo: string,
  html: string,
  css: string,
  projectName: string,
  seoTitle?: string,
  seoDescription?: string
) {
  const fullHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seoTitle || projectName}</title>
  <meta name="description" content="${seoDescription || ""}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Tajawal:wght@400;500;700&family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
${html}
</body>
</html>`;

  let existingSha: string | undefined;
  try {
    const existing = await getRepoContents(owner, repo, "index.html");
    if (existing && existing.sha) existingSha = existing.sha;
  } catch (e) {}

  await createOrUpdateFile(
    owner,
    repo,
    "index.html",
    fullHtml,
    `Deploy ${projectName} - updated index.html`,
    existingSha
  );

  let cssSha: string | undefined;
  try {
    const existing = await getRepoContents(owner, repo, "css/style.css");
    if (existing && existing.sha) cssSha = existing.sha;
  } catch (e) {}

  await createOrUpdateFile(
    owner,
    repo,
    "css/style.css",
    css || "",
    `Deploy ${projectName} - updated style.css`,
    cssSha
  );

  return { success: true, repoUrl: `https://github.com/${owner}/${repo}` };
}
