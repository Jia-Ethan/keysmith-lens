---
title: 录制
lede: 在本机起一个转发代理，把 Agent 发给模型的请求存下来。
group: 开始
order: 2
page: record
---

## 原理

`keysmith-lens record` 在 `127.0.0.1` 上起一个转发代理。把 Agent 的 API 地址指向它，每次请求都会原样转发给你指定的 upstream，同时把请求正文存成 `captures/NNN-*.json`。响应（包括流式响应）照常流回 Agent，不保存。

**请求头一律不写盘**，API key、cookie 不会出现在任何文件里。

## 用法

```sh
# 终端 1
PYTHONPATH=. python3 -m keysmith_lens record runs/first \
  --upstream https://api.anthropic.com \
  --rule ./AGENTS.md --rule ~/.claude/CLAUDE.md

# 终端 2
ANTHROPIC_BASE_URL=http://127.0.0.1:8787 claude
```

用完回到终端 1 按 Ctrl-C。同一个目录可以多次录制，编号会接着往下排。

| 参数 | 说明 |
| --- | --- |
| `run` | 运行目录，不存在会自动建立 |
| `--upstream` | Agent 平时连的 API 地址 |
| `--port` | 本机端口，默认 `8787` |
| `--rule` | 要检查的规则文件，可以写多次。会复制进运行目录，并记下原来的绝对路径 |

不写 `--rule` 时，Lens 会在运行目录里按文件名找规则文件，见[工作原理](/docs/how-it-works/)。

## 各 Agent 怎么指向代理

见 [各 Agent 的录制方式](/docs/agents/)。
