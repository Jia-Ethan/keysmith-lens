// After `astro build`: subset Noto Serif SC to the Chinese characters that
// headings on the built site actually use, so Chinese headings render in a
// serif without shipping an 11 MB font. Writes dist/fonts/noto-serif-sc-500.woff2.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import subsetFont from "subset-font";
import { parse } from "node-html-parser";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const SOURCE = path.join(ROOT, "node_modules/@fontsource/noto-serif-sc/files/noto-serif-sc-chinese-simplified-500-normal.woff2");
// Elements set in the serif (see .display, .h2, .h3, .serif, .prose h2/h3 in global.css).
const SERIF = ".display, .h2, .h3, .serif, h1, .prose h2, .prose h3, .brand-name, .belt-h, .hero-kicker, .pk-price b";

function* htmlFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(p);
    else if (entry.name.endsWith(".html")) yield p;
  }
}

const chars = new Set("，。、：；！？（）「」《》—…·0123456789");
let pages = 0;
for (const file of htmlFiles(DIST)) {
  const root = parse(fs.readFileSync(file, "utf8"));
  if (!root.querySelector("html")?.getAttribute("lang")?.startsWith("zh")) continue;
  pages++;
  for (const el of root.querySelectorAll(SERIF)) for (const ch of el.textContent) if (/[　-〿一-鿿＀-￯]/.test(ch)) chars.add(ch);
}

const out = path.join(DIST, "fonts", "noto-serif-sc-500.woff2");
fs.mkdirSync(path.dirname(out), { recursive: true });
const subset = await subsetFont(fs.readFileSync(SOURCE), [...chars].join(""), { targetFormat: "woff2" });
fs.writeFileSync(out, subset);
console.log(`noto-serif-sc subset: ${chars.size} characters from ${pages} pages → ${Math.round(subset.length / 1024)} KB`);
