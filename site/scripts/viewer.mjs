// Builds the Lens viewer from the made-up demo runs into recording/viewer.html,
// with the site's own fonts embedded, so recordings use the real UI and the
// same type as the site. Runs the Python package from the parent folder.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPO = path.join(SITE, "..");
const DEMO = path.join(SITE, "recording", "demo-runs");
const OUT = path.join(SITE, "recording", "viewer.html");
const py = process.env.PYTHON ?? "python3";
const env = { ...process.env, PYTHONPATH: REPO };

fs.rmSync(DEMO, { recursive: true, force: true });
execFileSync(py, [path.join(REPO, "examples", "make_demo.py"), DEMO], { env, stdio: "inherit" });
execFileSync(py, ["-m", "keysmith_lens", "build", DEMO, "-o", OUT], { env, stdio: "inherit" });

const font = (pkg, file) => fs.readFileSync(path.join(SITE, "node_modules", "@fontsource", pkg, "files", file)).toString("base64");
const face = (family, weight, data) => `@font-face{font-family:"${family}";font-weight:${weight};font-display:block;src:url(data:font/woff2;base64,${data}) format("woff2")}`;
const css = [
  face("Source Serif 4", 400, font("source-serif-4", "source-serif-4-latin-400-normal.woff2")),
  face("Source Serif 4", 500, font("source-serif-4", "source-serif-4-latin-500-normal.woff2")),
  face("Geist Sans", 400, font("geist-sans", "geist-sans-latin-400-normal.woff2")),
  face("Geist Sans", 500, font("geist-sans", "geist-sans-latin-500-normal.woff2")),
  face("Geist Sans", 600, font("geist-sans", "geist-sans-latin-600-normal.woff2")),
  face("IBM Plex Mono", 400, font("ibm-plex-mono", "ibm-plex-mono-latin-400-normal.woff2")),
  face("IBM Plex Mono", 500, font("ibm-plex-mono", "ibm-plex-mono-latin-500-normal.woff2")),
].join("\n");
const html = fs.readFileSync(OUT, "utf8").replace("<style>", `<style>\n${css}\n`);
fs.writeFileSync(OUT, html);
console.log(`viewer: ${path.relative(SITE, OUT)} (${Math.round(html.length / 1024)} KB)`);
