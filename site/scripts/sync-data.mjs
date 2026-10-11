// Pulls release and repository facts from GitHub into src/data/ so builds
// work offline. Run before `astro build` in CI; commit the output locally.
import { writeFile, mkdir } from "node:fs/promises";

const OWNER = "Jia-Ethan";
const RELEASES_REPO = "keysmith-lens";
const REPOS = ["keysmith-lens", "keysmith-switch", "codex-keysmith", "claude-keysmith", "grok-keysmith", "zcode-keysmith"];
const headers = { Accept: "application/vnd.github+json", "User-Agent": "keysmith-lens-site" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function get(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function releases() {
  const all = [];
  for (let page = 1; ; page++) {
    const batch = await get(`/repos/${OWNER}/${RELEASES_REPO}/releases?per_page=100&page=${page}`);
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all
    .filter((r) => !r.draft && !r.prerelease)
    .map((r) => ({
      tag: r.tag_name,
      name: r.name,
      date: r.published_at,
      url: r.html_url,
      body: r.body ?? "",
      assets: r.assets.map((a) => ({ name: a.name, size: a.size, url: a.browser_download_url })),
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

async function repos() {
  const out = {};
  for (const name of REPOS) {
    const r = await get(`/repos/${OWNER}/${name}`);
    out[name] = { stars: r.stargazers_count, url: r.html_url, description: r.description };
  }
  return out;
}

await mkdir(new URL("../src/data/", import.meta.url), { recursive: true });
const [rel, rep] = await Promise.all([releases(), repos()]);
await writeFile(new URL("../src/data/releases.json", import.meta.url), JSON.stringify(rel, null, 2) + "\n");
await writeFile(new URL("../src/data/repos.json", import.meta.url), JSON.stringify({ fetchedAt: new Date().toISOString(), repos: rep }, null, 2) + "\n");
console.log(`releases: ${rel.length} (latest ${rel[0]?.tag}), repos: ${Object.keys(rep).length}`);
