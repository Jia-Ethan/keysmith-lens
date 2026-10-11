// Renders the Open Graph images (public/og-zh.png, public/og-en.png) from an
// HTML card that uses the site's own fonts and brush.
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const font = (p) => `data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, "node_modules", p)).toString("base64")}`;
const b64 = (p) => fs.readFileSync(path.join(ROOT, p)).toString("base64");

const COPY = {
  zh: {
    kicker: "Keysmith Lens",
    title: `你写的规则，<span class="em">模型真的收到了吗？</span><br/><span class="brush">打开</span><span class="em">看看。</span>`,
    sub: "Claude Code · Codex · OpenCode · Pi · OpenHands",
  },
  en: {
    kicker: "Keysmith Lens",
    title: `You wrote the rules. <i>Did the model get them?</i><br/><i><span class="brush">Look</span> and see.</i>`,
    sub: "Claude Code · Codex · OpenCode · Pi · OpenHands",
  },
};

const serifSc = path.join(ROOT, "node_modules/@fontsource/noto-serif-sc/files/noto-serif-sc-chinese-simplified-500-normal.woff2");
const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-first-run", "--force-color-profile=srgb"] });
for (const lang of ["zh", "en"]) {
  const c = COPY[lang];
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html lang="${lang === "zh" ? "zh-CN" : "en"}"><head><style>
@font-face{font-family:S;font-weight:500;src:url(${font("@fontsource/source-serif-4/files/source-serif-4-latin-500-normal.woff2")})}
@font-face{font-family:S;font-weight:500;font-style:italic;src:url(${font("@fontsource/source-serif-4/files/source-serif-4-latin-500-italic.woff2")})}
@font-face{font-family:SC;font-weight:500;src:url(data:font/woff2;base64,${fs.readFileSync(serifSc).toString("base64")})}
@font-face{font-family:M;font-weight:500;src:url(${font("@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2")})}
html,body{margin:0;width:1200px;height:630px;background:#F5F1EA;color:#1C1915;overflow:hidden}
body{position:relative;font-family:S,SC,serif}
.field{position:absolute;inset:0;background-image:radial-gradient(circle,rgba(28,25,21,.16) 1px,transparent 1.3px);background-size:11px 11px;
  -webkit-mask-image:radial-gradient(ellipse 60% 70% at 100% 100%,#000,transparent 70%);opacity:.9}
.wrap{position:absolute;left:84px;top:78px;right:84px}
.brand{display:flex;align-items:center;gap:16px;font-family:S;font-weight:500;font-size:30px;letter-spacing:-.01em}
.brand img{width:64px;height:64px;border-radius:14px}
h1{margin:64px 0 0;font-weight:500;font-size:${lang === "zh" ? 58 : 60}px;line-height:${lang === "zh" ? 1.32 : 1.16};letter-spacing:${lang === "zh" ? 0 : "-.014em"}}
.em{color:#934C16}
i{font-style:italic}
.brush{background:url(data:image/svg+xml;base64,${b64("src/assets/brand/brush.svg")}) no-repeat center calc(50% + .06em)/100% 1.25em;padding:0 .12em;margin:0 -.08em;color:#1C1915}
.sub{position:absolute;left:84px;bottom:70px;font-family:M;font-size:20px;letter-spacing:.04em;color:#66605A}
.url{position:absolute;right:84px;bottom:70px;font-family:M;font-size:20px;color:#66605A}
</style></head><body><div class="field"></div><div class="wrap">
<div class="brand"><img src="data:image/png;base64,${b64("src/assets/app/icon-256.png")}"/>${c.kicker}</div>
<h1>${c.title}</h1></div>
<div class="sub">${c.sub}</div><div class="url">lens.keysmithswitch.com</div></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(ROOT, "public", `og-${lang}.png`) });
  await page.close();
  console.log(`og-${lang}.png`);
}
await browser.close();
