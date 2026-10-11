// Encodes recorded frames into web video plus a poster image.
//   node recording/encode.mjs            (every folder in recording/frames)
//   node recording/encode.mjs agents-zh-light
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FRAMES = path.join(HERE, "frames");
const OUT = path.join(HERE, "..", "public", "media");
fs.mkdirSync(OUT, { recursive: true });

const only = process.argv.slice(2);
const dirs = fs.readdirSync(FRAMES).filter((d) => fs.statSync(path.join(FRAMES, d)).isDirectory() && (!only.length || only.includes(d)));

for (const dir of dirs) {
  const [scene, lang, theme] = dir.split("-");
  const name = scene === "film" ? `film-${lang}-${theme}` : `tour-${scene}-${lang}-${theme}`;
  // Tour clips are shown at up to ~690 CSS px wide (1380 device px); the film at up to 1040 (2080).
  const width = scene === "film" ? 1920 : 1600;
  const input = path.join(FRAMES, dir, "%05d.png");
  const mp4 = path.join(OUT, `${name}.mp4`);
  const poster = path.join(OUT, `${name}.webp`);
  const frames = fs.readdirSync(path.join(FRAMES, dir)).filter((f) => f.endsWith(".png")).sort();
  execFileSync("ffmpeg", [
    "-v", "error", "-y",
    "-framerate", "30", "-i", input,
    "-vf", `scale=${width}:-2:flags=lanczos,format=yuv420p`,
    "-c:v", "libx264", "-preset", "slow", "-crf", scene === "film" ? "23" : "24",
    "-tune", "animation", "-profile:v", "high", "-movflags", "+faststart",
    "-an", mp4,
  ]);
  // Poster: the opening frame, so the swap to video is seamless (needs Pillow).
  execFileSync("python3", [
    "-c",
    `from PIL import Image\nim=Image.open(${JSON.stringify(path.join(FRAMES, dir, frames[0]))}).convert('RGB')\nw=${width}\nim=im.resize((w, round(im.height*w/im.width)), Image.LANCZOS)\nim.save(${JSON.stringify(poster)}, 'WEBP', quality=82, method=6)`,
  ]);
  // The film's chapter marks feed the caption timings on the site.
  const marks = path.join(FRAMES, dir, "chapters.json");
  if (scene === "film" && fs.existsSync(marks)) {
    const target = path.join(HERE, "..", "src", "data", "film.json");
    const all = fs.existsSync(target) ? JSON.parse(fs.readFileSync(target, "utf8")) : {};
    all[lang] = JSON.parse(fs.readFileSync(marks, "utf8"));
    fs.writeFileSync(target, JSON.stringify(all) + "\n");
  }
  const kb = (f) => `${Math.round(fs.statSync(f).size / 1024)} KB`;
  console.log(`${name}: ${frames.length} frames → mp4 ${kb(mp4)}, poster ${kb(poster)}`);
}
