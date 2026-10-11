---
title: 各 Agent 的录制方式
lede: 把 Claude Code、Codex、OpenCode、Pi、OpenHands 的 API 地址指向本机代理。
group: 使用
order: 4
page: agents
---

Lens 认得三种请求格式：Anthropic Messages（`/v1/messages`）、OpenAI Responses（`/v1/responses`）和 Chat Completions（`/v1/chat/completions`）。只要 Agent 能自定义 API 地址，就能录。

## Claude Code

```sh
PYTHONPATH=. python3 -m keysmith_lens record runs/cc \
  --upstream https://api.anthropic.com --rule ./CLAUDE.md --rule ./AGENTS.md
ANTHROPIC_BASE_URL=http://127.0.0.1:8787 claude
```

用 API key 时才会走自定义地址。

## Codex

在 `~/.codex/config.toml` 里加一个 provider，`base_url` 指向代理：

```toml
[model_providers.lens]
name = "lens"
base_url = "http://127.0.0.1:8787/v1"
env_key = "OPENAI_API_KEY"
wire_api = "responses"
```

再用 `codex -c model_provider=lens` 运行，`--upstream` 写 `https://api.openai.com`。

## OpenCode

在 `opencode.json` 的 provider 里设置 `options.baseURL` 为 `http://127.0.0.1:8787/v1`。

## Pi

在 `~/.pi/agent/models.json` 里给 provider 设置 `baseUrl` 为 `http://127.0.0.1:8787/v1`。

## OpenHands

在 LLM 设置里把 `base_url` 设为 `http://127.0.0.1:8787/v1`。生成会话标题的请求不带工具，会以淡色显示，不算规则消失。

## 在容器里跑的 Agent

代理只监听 `127.0.0.1`。Agent 跑在容器里时，让容器和代理共用网络（例如 `docker run --network host`），或者把代理也放进容器里。
