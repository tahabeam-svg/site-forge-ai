import { Octokit } from "@octokit/rest";

function getOctokit(token: string) {
  return new Octokit({ auth: token });
}

export async function validateToken(token: string) {
  try {
    const octokit = getOctokit(token);
    const { data } = await octokit.users.getAuthenticated();
    return { valid: true, user: data };
  } catch {
    return { valid: false, user: null };
  }
}

export async function getGitHubUser(token: string) {
  const octokit = getOctokit(token);
  const { data } = await octokit.users.getAuthenticated();
  return data;
}

export async function listUserRepos(token: string) {
  const octokit = getOctokit(token);
  const { data } = await octokit.repos.listForAuthenticatedUser({
    per_page: 100,
    sort: "updated",
  });
  return data;
}

export async function createRepo(token: string, name: string, description: string, isPrivate: boolean = false) {
  const octokit = getOctokit(token);
  const { data } = await octokit.repos.createForAuthenticatedUser({
    name,
    description,
    private: isPrivate,
    auto_init: true,
  });
  return data;
}

export async function getRepoContents(token: string, owner: string, repo: string, path: string = "") {
  const octokit = getOctokit(token);
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path });
    return data;
  } catch {
    return null;
  }
}

export async function createOrUpdateFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  sha?: string
) {
  const octokit = getOctokit(token);
  const { data } = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: Buffer.from(content).toString("base64"),
    sha,
  });
  return data;
}

export async function pushWebsiteToRepo(
  token: string,
  owner: string,
  repo: string,
  html: string,
  css: string,
  projectName: string,
  seoTitle?: string,
  seoDescription?: string
) {
  const isFullDoc = html.trim().startsWith("<!DOCTYPE") || html.trim().startsWith("<html");

  const fullHtml = isFullDoc ? html : `<!DOCTYPE html>
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
    const existing: any = await getRepoContents(token, owner, repo, "index.html");
    if (existing?.sha) existingSha = existing.sha;
  } catch {}

  await createOrUpdateFile(
    token, owner, repo, "index.html", fullHtml,
    `Deploy ${projectName} - updated index.html`, existingSha
  );

  let cssSha: string | undefined;
  try {
    const existing: any = await getRepoContents(token, owner, repo, "css/style.css");
    if (existing?.sha) cssSha = existing.sha;
  } catch {}

  await createOrUpdateFile(
    token, owner, repo, "css/style.css", css || "",
    `Deploy ${projectName} - updated style.css`, cssSha
  );

  return { success: true, repoUrl: `https://github.com/${owner}/${repo}` };
}
