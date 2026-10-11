// Records scripted walkthroughs of the real Keysmith Lens viewer, built from
// the made-up demo runs, frame by frame under virtual time, so every frame is
// deterministic and sharp. Output: PNG frames, encoded by encode.mjs.
//
// Build the viewer first (npm run viewer): it writes recording/viewer.html.
//
//   node recording/record.mjs --scene agents --lang zh --theme light
//   node recording/record.mjs --all
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SCENES } from "./scenes.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const VIEWER = path.join(HERE, "viewer.html");
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const FPS = 30;
const FRAME = 1000 / FPS;

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};

const CURSOR_CSS = `
#rec-cursor{position:fixed;left:0;top:0;z-index:2147483647;width:22px;height:22px;pointer-events:none;
  transform:translate(-200px,-200px);will-change:transform}
#rec-cursor svg{display:block;filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.35))}
#rec-ripple{position:fixed;left:0;top:0;z-index:2147483646;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;
  pointer-events:none;opacity:0;background:rgba(120,120,120,.28)}
#rec-ripple.go{animation:rec-ripple .42s ease-out forwards}
@keyframes rec-ripple{from{opacity:.9;transform:scale(.35)}to{opacity:0;transform:scale(1.4)}}
#rec-keys{position:fixed;left:50%;bottom:28px;z-index:2147483646;transform:translateX(-50%);display:flex;gap:6px;
  pointer-events:none;opacity:0;transition:opacity .18s ease}
#rec-keys.on{opacity:1}
#rec-keys kbd{min-width:34px;padding:6px 10px;border-radius:8px;background:rgba(28,25,21,.82);color:#fbf9f5;
  font:600 15px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;text-align:center;box-shadow:0 4px 14px rgba(0,0,0,.2)}
`;
const CURSOR_SVG = `<svg width="22" height="22" viewBox="0 0 22 22"><path d="M3 2.2v15.6l4.1-3.9 2.7 6.1 2.6-1.1-2.7-6h5.7z" fill="#111" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>`;

class Recorder {
  constructor(page, cdp, outDir) {
    this.page = page;
    this.cdp = cdp;
    this.outDir = outDir;
    this.n = 0;
    this.cursor = { x: 620, y: 520 };
    this.marks = [];
  }

  /** Remember the current frame as the start of chapter `i` (film captions). */
  mark(i) {
    this.marks[i] = this.n;
  }

  async step(ms) {
    await new Promise(async (resolve) => {
      this.cdp.once("Emulation.virtualTimeBudgetExpired", resolve);
      await this.cdp.send("Emulation.setVirtualTimePolicy", { policy: "advance", budget: ms });
    });
  }

  async shot() {
    const file = path.join(this.outDir, `${String(this.n++).padStart(5, "0")}.png`);
    const data = await this.page.screenshot({ type: "png", optimizeForSpeed: true, encoding: "binary" });
    fs.writeFileSync(file, data);
  }

  /** Advance time by `ms`, capturing one frame per 1/FPS. */
  async wait(ms) {
    const frames = Math.max(1, Math.round(ms / FRAME));
    for (let i = 0; i < frames; i++) {
      await this.step(FRAME);
      await this.shot();
    }
  }

  /** Let the app settle without recording (setup between shots). */
  async settle(ms) {
    const frames = Math.max(1, Math.round(ms / FRAME));
    for (let i = 0; i < frames; i++) await this.step(FRAME);
  }

  /**
   * Chrome aligns some input (mouse moves) to animation frames, and with virtual
   * time paused no frame comes, so the event would never be acknowledged. Keep
   * advancing time, one recorded frame at a time, until it is.
   */
  async drive(promise, capture = true) {
    let done = false;
    promise.then(
      () => (done = true),
      () => (done = true),
    );
    await Promise.resolve();
    for (let guard = 0; !done && guard < 60; guard++) {
      await this.step(FRAME);
      if (capture) await this.shot();
    }
    await promise;
  }

  async setCursor(x, y, capture = false) {
    this.cursor = { x, y };
    await this.page.evaluate((x, y) => {
      const c = document.getElementById("rec-cursor");
      if (c) c.style.transform = `translate(${x - 3}px,${y - 2}px)`;
    }, x, y);
    await this.drive(this.page.mouse.move(x, y), capture);
  }

  async center(selector) {
    const box = await this.page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      el.scrollIntoView({ block: "nearest" });
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }, selector);
    if (!box) throw new Error(`not found: ${selector}`);
    return box;
  }

  /** Glide the visible cursor to an element over `ms`, easing in and out. */
  async moveTo(selector, ms = 700, offset = { x: 0, y: 0 }) {
    const target = await this.center(selector);
    const to = { x: target.x + offset.x, y: target.y + offset.y };
    const from = { ...this.cursor };
    const frames = Math.max(2, Math.round(ms / FRAME));
    // Slight arc so the motion reads as a hand, not a robot.
    const bend = Math.min(60, Math.hypot(to.x - from.x, to.y - from.y) * 0.12);
    for (let i = 1; i <= frames; i++) {
      const t = i / frames;
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const x = from.x + (to.x - from.x) * e;
      const y = from.y + (to.y - from.y) * e - Math.sin(Math.PI * e) * bend;
      await this.setCursor(x, y);
      await this.step(FRAME);
      await this.shot();
    }
  }

  async ripple() {
    await this.page.evaluate((x, y) => {
      const r = document.getElementById("rec-ripple");
      if (!r) return;
      r.style.left = `${x}px`;
      r.style.top = `${y}px`;
      r.classList.remove("go");
      void r.offsetWidth;
      r.classList.add("go");
    }, this.cursor.x, this.cursor.y);
  }

  async click(selector, { move = 650, after = 450 } = {}) {
    if (move) await this.moveTo(selector, move);
    await this.ripple();
    await this.drive(this.page.mouse.down());
    await this.wait(70);
    await this.drive(this.page.mouse.up());
    await this.wait(after);
  }

  async rightClick(selector, { move = 650, after = 450 } = {}) {
    if (move) await this.moveTo(selector, move);
    await this.ripple();
    await this.drive(this.page.mouse.click(this.cursor.x, this.cursor.y, { button: "right" }));
    await this.wait(after);
  }

  /** Type text a character at a time, with a natural rhythm. */
  async type(text, { cps = 16 } = {}) {
    for (const ch of text) {
      await this.drive(this.page.keyboard.sendCharacter(ch));
      const pause = /[，。、,.!?；：\s]/.test(ch) ? 2.4 : 1;
      await this.wait((1000 / cps) * pause);
    }
  }

  /** Select an input's current text, so typing replaces it. */
  async selectText(selector) {
    await this.page.evaluate((sel) => {
      const el = document.querySelector(sel);
      el?.focus();
      el?.select?.();
    }, selector);
    await this.wait(120);
  }

  /** Paste a block of text at once into the focused editor. */
  async paste(text) {
    await this.drive(this.page.keyboard.sendCharacter(text));
    await this.wait(120);
  }

  async keys(labels, combo) {
    await this.page.evaluate((labels) => {
      const k = document.getElementById("rec-keys");
      if (!k) return;
      k.innerHTML = labels.map((l) => `<kbd>${l}</kbd>`).join("");
      k.classList.add("on");
    }, labels);
    await this.wait(260);
    for (const key of combo) await this.drive(this.page.keyboard.down(key));
    for (const key of [...combo].reverse()) await this.drive(this.page.keyboard.up(key));
    await this.wait(520);
    await this.page.evaluate(() => document.getElementById("rec-keys")?.classList.remove("on"));
  }

  async press(key, after = 300) {
    await this.drive(this.page.keyboard.press(key));
    await this.wait(after);
  }

  async scroll(selector, dy, ms = 700) {
    const frames = Math.max(2, Math.round(ms / FRAME));
    let done = 0;
    for (let i = 1; i <= frames; i++) {
      const t = i / frames;
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const target = Math.round(dy * e);
      const delta = target - done;
      done = target;
      await this.page.evaluate((sel, delta) => {
        const el = sel ? document.querySelector(sel) : document.scrollingElement;
        (el ?? document.scrollingElement).scrollBy(0, delta);
      }, selector, delta);
      await this.step(FRAME);
      await this.shot();
    }
  }
}

async function recordScene(browser, scene, lang, theme, outRoot) {
  const outDir = path.join(outRoot, `${scene.id}-${lang}-${theme}`);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const page = await browser.newPage();
  const vp = scene.viewport ?? { width: 1180, height: 760 };
  await page.setViewport({ ...vp, deviceScaleFactor: scene.scale ?? 2 });
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: theme },
    { name: "prefers-reduced-motion", value: "no-preference" },
  ]);
  await page.evaluateOnNewDocument((css, svg) => {
    const add = () => {
      if (document.getElementById("rec-cursor")) return;
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
      const c = document.createElement("div");
      c.id = "rec-cursor";
      c.innerHTML = svg;
      const r = document.createElement("div");
      r.id = "rec-ripple";
      const k = document.createElement("div");
      k.id = "rec-keys";
      document.body.append(r, c, k);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", add);
    else add();
  }, CURSOR_CSS, CURSOR_SVG);

  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  // A native dialog would block every CDP call (and virtual time with it).
  page.on("dialog", (d) => void d.accept().catch(() => {}));
  if (!fs.existsSync(VIEWER)) throw new Error("recording/viewer.html is missing: run `npm run viewer` first");
  const url = `file://${VIEWER}?lang=${lang}&theme=${theme}${scene.start ? `#${scene.start}` : ""}`;
  await page.goto(url, { waitUntil: "load", timeout: 60000 });
  await page.evaluate(() => {
    try {
      localStorage.clear();
    } catch {}
    return document.fonts.ready;
  });

  const cdp = await page.createCDPSession();
  await cdp.send("Emulation.setVirtualTimePolicy", { policy: "pause" });
  const rec = new Recorder(page, cdp, outDir);
  await rec.setCursor(vp.width * 0.62, vp.height * 0.68);
  await rec.settle(1500);

  const t0 = Date.now();
  await scene.run(rec, { lang, theme, zh: lang === "zh" });
  if (rec.marks.length) {
    fs.writeFileSync(path.join(outDir, "chapters.json"), JSON.stringify(rec.marks.map((f) => +(f / FPS).toFixed(2))));
  }
  await page.close();
  const seconds = (rec.n / FPS).toFixed(1);
  console.log(`${scene.id}-${lang}-${theme}: ${rec.n} frames (${seconds}s) in ${((Date.now() - t0) / 1000).toFixed(0)}s${errors.length ? `, page errors: ${errors.join(" | ")}` : ""}`);
  return outDir;
}

async function main() {
  const outRoot = path.join(HERE, "frames");
  const all = process.argv.includes("--all");
  const only = arg("scene");
  const langs = arg("lang") ? [arg("lang")] : ["zh", "en"];
  const themes = arg("theme") ? [arg("theme")] : ["light", "dark"];
  const scenes = SCENES.filter((s) => all || !only || s.id === only);
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    protocolTimeout: 120000,
    args: ["--no-first-run", "--hide-scrollbars", "--force-color-profile=srgb", "--font-render-hinting=none", "--disable-lcd-text"],
  });
  try {
    for (const scene of scenes) for (const lang of langs) for (const theme of themes) await recordScene(browser, scene, lang, theme, outRoot);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
