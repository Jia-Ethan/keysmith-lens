# Keysmith Lens 官网

[Keysmith Lens](https://github.com/Jia-Ethan/keysmith-lens) 的产品网站（<https://lens.keysmithswitch.com/>）：首页、开始使用、更新日志、文档、帮助，中文（`/`）与英文（`/en/`）两套。静态站点，Astro 7 构建。版式与 [Keysmith Switch 官网](https://keysmithswitch.com/) 一致，两站同属 Keysmith 系列。

## 本地开发

```bash
cd site
npm install
npm run viewer     # 用示例数据生成 recording/viewer.html（真实的 Lens 界面）
npm run record     # 录制首页短片与 8 段功能导览，输出到 public/media/
npm run dev        # http://localhost:4321
npm run build      # 输出到 dist/，并生成中文标题用的字体子集
node scripts/check-dist.mjs   # 检查链接、资源与中英文页面配对
```

`npm run record` 需要本机有 Chrome（或用 `CHROME=` 指定路径）、`ffmpeg` 和 Python 的 Pillow。

## 跟着仓库更新

推送到 `main` 后，GitHub Actions（仓库根目录的 `.github/workflows/site.yml`）会：

1. 跑 Lens 的测试；
2. 用当前的 `keysmith_lens/template.html` 和示例数据重新生成界面，**重新录制短片和导览视频**；
3. 同步发布记录与 Keysmith 系列的星标数；
4. 构建、检查链接，发布到 GitHub Pages。

所以 Lens 的界面改了，网站上的视频会跟着变，不需要手动重录。发布新版本（GitHub Release）时也会重建，更新日志从 Release 读取。每天还会自动重建一次。

视频不提交进仓库（`public/media/` 由 CI 生成）。

## 内容从哪里来

| 内容 | 来源 | 更新方式 |
| --- | --- | --- |
| 短片与功能导览视频 | 真实的 Lens 界面 + `examples/make_demo.py` 的虚构数据 | CI 每次构建时重录；分镜在 `recording/scenes.mjs` |
| 更新日志 | 本仓库的 GitHub Releases | `npm run sync` 写入 `src/data/releases.json` |
| GitHub 星标数 | 各仓库的 GitHub API | `npm run sync` 写入 `src/data/repos.json` |
| 文档 | `src/content/docs/{zh,en}/*.md` | 直接编辑 |
| 帮助问答 | `src/data/help.ts` | 直接编辑 |
| 界面文案 | `src/i18n/ui.ts` | 直接编辑 |

## Lens 改了之后要检查什么

视频、更新日志和星标数会自动更新。其余内容写的是 Lens 当前的行为，改了要跟着改（`zh` 和 `en` 两套都要改）：

| Lens 的改动 | 要检查的文件 |
| --- | --- |
| 界面的 `data-testid` 改名或删除 | `recording/scenes.mjs`（录制会因找不到元素而失败） |
| 新增或删除画面、标记种类 | `src/i18n/ui.ts` 的 `tour`；`src/content/docs/*/03-reading.md` |
| 规则查找或比对方式 | `src/content/docs/*/05-how-it-works.md`；`src/data/help.ts` |
| `record` 的参数或存什么 | `src/content/docs/*/02-record.md`、`06-privacy.md`；`src/i18n/ui.ts` 的 `download`、`principles` |
| 支持的请求格式或 Agent | `src/components/AgentCards.astro`；`src/i18n/ui.ts` 的 `cards`；`src/content/docs/*/04-agents.md` |
| 示例数据 | `src/content/docs/*/01-quickstart.md` 的表格；`recording/scenes.mjs` 里的运行名 |

## 域名

`lens.keysmithswitch.com` 是 `keysmithswitch.com`（Cloudflare）下的子域名：一条 CNAME 记录 `lens` → `jia-ethan.github.io`，GitHub Pages 的自定义域名设为 `lens.keysmithswitch.com`。

## 设计

版式、组件与样式来自 Keysmith Switch 官网（同一作者），参考了 [mirasim.ai](https://mirasim.ai) 的排版与节奏：暖纸色背景、衬线标题、等宽字体导航、编号功能导览、页脚四栏。没有复用 Mirasim 的代码、图片或品牌元素。

字体：Source Serif 4、IBM Plex Mono、Geist Sans（SIL OFL，经 Fontsource 自托管），中文标题用 Noto Serif SC 的子集。Agent 名称与图标的版权归各自所有者。

## 许可

与 Keysmith Lens 一样按 MIT 许可证授权，见仓库根目录的 `LICENSE`。
