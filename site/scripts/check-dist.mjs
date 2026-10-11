// Checks the built site: every internal link and asset resolves to a file in
// dist/, every page has a counterpart in the other language, and the media the
// homepage references exist.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "node-html-parser";

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const BASE = (process.env.BASE_PATH || "/").replace(/\/$/, "");
const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".html")) pages.push(p);
  }
})(DIST);

const resolve = (url) => {
  let u = url.split("#")[0].split("?")[0];
  if (BASE && u.startsWith(BASE)) u = u.slice(BASE.length) || "/";
  const file = path.join(DIST, decodeURI(u));
  if (u.endsWith("/")) return fs.existsSync(path.join(file, "index.html"));
  return fs.existsSync(file) || fs.existsSync(path.join(file, "index.html"));
};

const problems = [];
const ids = new Map();
for (const file of pages) {
  const html = fs.readFileSync(file, "utf8");
  const root = parse(html);
  const rel = "/" + path.relative(DIST, file).replace(/index\.html$/, "");
  ids.set(rel, new Set(root.querySelectorAll("[id]").map((el) => el.id)));
  const refs = [
    ...root.querySelectorAll("a[href]").map((a) => a.getAttribute("href")),
    ...root.querySelectorAll("link[href]").map((l) => l.getAttribute("href")),
    ...root.querySelectorAll("img[src]").map((i) => i.getAttribute("src")),
    ...root.querySelectorAll("script[src]").map((s) => s.getAttribute("src")),
    ...root.querySelectorAll("[data-src-light]").map((el) => el.getAttribute("data-src-light")),
    ...root.querySelectorAll("[data-src-dark]").map((el) => el.getAttribute("data-src-dark")),
  ];
  for (const ref of refs) {
    if (!ref || /^(https?:|mailto:|data:|#)/.test(ref)) continue;
    if (!ref.startsWith("/")) {
      problems.push(`${rel}: relative link ${ref}`);
      continue;
    }
    if (!resolve(ref)) problems.push(`${rel}: missing ${ref}`);
  }
  for (const m of html.matchAll(/url\(["']?(\/[^)"']+)["']?\)/g)) if (!resolve(m[1])) problems.push(`${rel}: missing css url ${m[1]}`);
}

// In-page anchors (#id) on the same or other pages.
for (const file of pages) {
  const root = parse(fs.readFileSync(file, "utf8"));
  const rel = "/" + path.relative(DIST, file).replace(/index\.html$/, "");
  for (const a of root.querySelectorAll("a[href*='#']")) {
    const href = a.getAttribute("href");
    if (/^https?:/.test(href)) continue;
    const [p, hash] = href.split("#");
    if (!hash) continue;
    let target = p ? p : rel;
    if (BASE && target.startsWith(BASE)) target = target.slice(BASE.length) || "/";
    const set = ids.get(target);
    if (set && !set.has(decodeURIComponent(hash))) problems.push(`${rel}: anchor #${hash} not found on ${target}`);
  }
}

// Language pairs.
const rels = pages.map((f) => "/" + path.relative(DIST, f).replace(/index\.html$/, ""));
for (const r of rels) {
  if (/404/.test(r)) continue;
  if (r.startsWith("/en/")) {
    const zh = r.replace(/^\/en/, "") || "/";
    if (!rels.includes(zh)) problems.push(`no zh page for ${r}`);
  } else if (!r.endsWith(".html")) {
    const en = "/en" + r;
    if (!rels.includes(en)) problems.push(`no en page for ${r}`);
  }
}

console.log(`${pages.length} pages checked`);
if (problems.length) {
  console.log(problems.join("\n"));
  process.exit(1);
}
console.log("no problems");
