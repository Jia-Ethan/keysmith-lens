<!-- markdownlint-disable MD013 MD033 MD041 -->

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/lens-dark.webp" />
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/lens-light.webp" />
  <img src="docs/assets/lens-light.webp" alt="Keysmith Lens" width="100%" />
</picture>

<p>
  <img src="https://img.shields.io/badge/Python-3.9+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python 3.9+" />
  <img src="https://img.shields.io/badge/dependencies-none-6DB33F?style=flat-square" alt="No dependencies" />
  <img src="https://img.shields.io/badge/license-MIT-6DB33F?style=flat-square" alt="MIT License" />
</p>

<p>
  <a href="#简体中文">简体中文</a> ·
  <a href="README.en.md">English</a> ·
  <a href="https://lens.keysmithswitch.com/">网站</a> ·
  <a href="docs/capture-format.md">抓包格式</a> ·
  <a href="LICENSE">License</a>
</p>

<h1>Keysmith Lens</h1>

<p>回放 AI 编程 Agent 的运行记录，看模型每一步实际收到了什么。</p>

</div>

## 简体中文

你写的 AGENTS.md、CLAUDE.md、skills、追加的系统提示，Agent 到底有没有送给模型？放在哪一层？什么时候没了？

Keysmith Lens 读 Agent 发给模型的原始请求，一步一步回放：

- **每条规则送到了没有**：总览表里一行一个运行、一列一条规则，格子颜色是规则第一次出现的那一层（system、user、tool result……），空心框是从来没送到。
- **规则什么时候出现、什么时候消失**：规则 × 请求的追踪表，看得到晚到、压缩后丢失、再次读取后回来。
- **模型收到的是什么**：每次请求按字数画成一条按比例的长条，分层上色，标出规则文字的位置。
- **逐段原文**：每次请求拆成一段一段，标出比上一步新增的部分，规则行高亮。
- **自动标记**：从未送达、晚到、消失、回来、只送了一部分、重复出现。

只读，不改任何文件；在本机生成一个 HTML 文件，不上传任何内容。

## 怎么判断规则送到了

直接拿规则文件的内容去比对，不需要在规则里埋标记。规则文件按行切开，20 个字符以上、且不和其他规则文件重复的行用来比对：全部找到算送达，找到一部分算部分送达。YAML frontmatter 不算。没有带工具定义的请求（例如生成会话标题）当作旁支请求，淡色显示，不算规则消失。

## 使用方式

需要 Python 3.9 以上，没有第三方依赖。

```sh
git clone https://github.com/Jia-Ethan/keysmith-lens.git
cd keysmith-lens

# 先用示例数据看看
python3 examples/make_demo.py examples/demo
PYTHONPATH=. python3 -m keysmith_lens build examples/demo -o out/lens.html
open out/lens.html
```

换成你自己的运行记录：把运行目录（或装着多个运行的目录）传进去。

```sh
PYTHONPATH=. python3 -m keysmith_lens build path/to/runs -o out/lens.html
```

一个运行就是一个目录（`record` 会帮你建好），里面有 `captures/NNN-*.json`，每个文件是 Agent 发出的一次请求。规则文件放在同一个目录里，或在 `fixtures.json` 里列出。格式见 [`docs/capture-format.md`](docs/capture-format.md)。

`lens.html#run=<名字>&step=<n>` 可以直接链接到某个运行的某一步。

> [!IMPORTANT]
> 生成的 HTML 包含请求原文。如果你的运行记录里有密钥、路径或私人内容，先脱敏再生成，或者只在本机打开。

## 支持的请求格式

| 格式 | 常见的 Agent |
| --- | --- |
| Anthropic Messages（`/v1/messages`） | Claude Code |
| OpenAI Responses（`/v1/responses`） | OpenHands、OpenCode、Pi、Codex |
| OpenAI Chat Completions（`/v1/chat/completions`） | 较早的 OpenHands 及多数兼容 OpenAI 的工具 |

## 目录

```
keysmith_lens/
  trace.py           通用模型：运行 → 请求 → 片段（一段文字、一个层）
  adapters/wire.py   抓包文件 → 运行（三种请求格式）
  record.py          本地录制代理
  rules.py           找规则文件、按内容比对、产生标记
  build.py           运行 → 一个 HTML 文件
  template.html      界面
examples/make_demo.py  生成示例数据（全部虚构）
site/              官网 lens.keysmithswitch.com（Astro），见 site/README.md
tests/
```

测试：`PYTHONPATH=. python3 -m unittest discover -s tests`

## 录制

`keysmith-lens record` 在本机起一个转发代理，把 Agent 发给模型的请求存成运行目录。请求头不写盘，密钥不会进文件。

```sh
# 终端 1
PYTHONPATH=. python3 -m keysmith_lens record runs/first --upstream https://api.anthropic.com --rule ./AGENTS.md
# 终端 2
ANTHROPIC_BASE_URL=http://127.0.0.1:8787 claude
```

各 Agent 的设置见[文档](https://lens.keysmithswitch.com/docs/agents/)。

## Keysmith 系列

[Keysmith Switch](https://keysmithswitch.com/) 管理和部署提示词；Keysmith Lens 检查它们有没有真正送到模型。

## 许可

MIT，见 [LICENSE](LICENSE)。
