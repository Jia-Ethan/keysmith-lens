---
title: Recording each agent
lede: Point Claude Code, Codex, OpenCode, Pi and OpenHands at the local proxy.
group: Using Lens
order: 4
page: agents
---

Lens reads three request formats: Anthropic Messages (`/v1/messages`), OpenAI Responses (`/v1/responses`) and Chat Completions (`/v1/chat/completions`). Any agent that lets you set its API address can be recorded.

## Claude Code

```sh
PYTHONPATH=. python3 -m keysmith_lens record runs/cc \
  --upstream https://api.anthropic.com --rule ./CLAUDE.md --rule ./AGENTS.md
ANTHROPIC_BASE_URL=http://127.0.0.1:8787 claude
```

The custom address is used when you run with an API key.

## Codex

Add a provider in `~/.codex/config.toml` whose `base_url` is the proxy:

```toml
[model_providers.lens]
name = "lens"
base_url = "http://127.0.0.1:8787/v1"
env_key = "OPENAI_API_KEY"
wire_api = "responses"
```

Then run `codex -c model_provider=lens`, with `--upstream https://api.openai.com`.

## OpenCode

In `opencode.json`, set the provider's `options.baseURL` to `http://127.0.0.1:8787/v1`.

## Pi

In `~/.pi/agent/models.json`, set the provider's `baseUrl` to `http://127.0.0.1:8787/v1`.

## OpenHands

Set `base_url` in the LLM settings to `http://127.0.0.1:8787/v1`. Title-generation requests carry no tools; they show faded and never count as a drop.

## Agents in a container

The proxy listens on `127.0.0.1` only. When the agent runs in a container, share the network with the proxy (for example `docker run --network host`) or run the proxy inside the container too.
