import releases from "../data/releases.json";
import repos from "../data/repos.json";

export type Asset = { name: string; size: number; url: string };
export type Release = { tag: string; name: string; date: string; url: string; body: string; assets: Asset[] };

export const RELEASES = releases as Release[];
export const LATEST: Release | undefined = RELEASES[0];
export const REPOS = repos.repos as Record<string, { stars: number; url: string; description: string | null }>;

export const REPO = "https://github.com/Jia-Ethan/keysmith-lens";
export const RELEASES_PAGE = `${REPO}/releases`;
export const LATEST_PAGE = `${RELEASES_PAGE}/latest`;
export const ZIP = `${REPO}/archive/refs/heads/main.zip`;
export const CLONE = `git clone ${REPO}.git`;
export const ISSUES = `${REPO}/issues`;
export const DISCUSSIONS = `${REPO}/issues`;
export const SWITCH_SITE = "https://keysmithswitch.com/";
export const LINUXDO = "https://linux.do";
export const TELEGRAM = "https://t.me/+xBqLYA65JPU1NjFk";

export function version(rel: Release | undefined = LATEST): string {
  return rel ? rel.tag.replace(/^v/, "") : "0.1.0";
}

export function findAsset(rel: Release | undefined, kind: "mac" | "win" | "sums"): Asset | undefined {
  if (!rel) return undefined;
  const test = { mac: /_aarch64\.dmg$/, win: /_x64-setup\.exe$/, sums: /^SHA256SUMS/ }[kind];
  return rel.assets.find((a) => test.test(a.name));
}

/** Stable download links that always resolve to the newest build, even before the site rebuilds. */
export function latestDownload(kind: "mac" | "win" | "sums"): string {
  const asset = findAsset(LATEST, kind);
  return asset?.url ?? LATEST_PAGE;
}

export function mb(bytes: number): string {
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

export function stars(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n);
}

export function formatDate(iso: string, lang: "zh" | "en"): string {
  const d = new Date(iso);
  return lang === "zh"
    ? `${d.getUTCFullYear()} 年 ${d.getUTCMonth() + 1} 月 ${d.getUTCDate()} 日`
    : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export type NoteSection = { heading: string; items: string[] };

/**
 * Release bodies are Markdown written for GitHub: a summary paragraph, then
 * "## 这一版有什么" with bullets, then "## 安装". The changelog shows the summary
 * and every section except installation, which is the same each time.
 */
export function parseNotes(body: string): { summary: string; sections: NoteSection[] } {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  let summary: string[] = [];
  const sections: NoteSection[] = [];
  let current: NoteSection | null = null;
  let item: string[] | null = null;
  const flush = () => {
    if (current && item) current.items.push(item.join("\n").trim());
    item = null;
  };
  for (const line of lines) {
    if (/^# /.test(line)) continue;
    const h = line.match(/^## (.+)$/);
    if (h) {
      flush();
      current = { heading: h[1].trim(), items: [] };
      sections.push(current);
      continue;
    }
    if (!current) {
      if (line.trim()) summary.push(line.trim());
      continue;
    }
    if (/^- /.test(line)) {
      flush();
      item = [line.slice(2)];
    } else if (item && (/^\s+/.test(line) || line.trim() === "")) {
      item.push(line);
    } else if (line.trim()) {
      flush();
      item = [line.trim()];
    }
  }
  flush();
  return {
    summary: summary.join(" "),
    sections: sections.filter((s) => !/^安装$/.test(s.heading) && s.items.length > 0),
  };
}
