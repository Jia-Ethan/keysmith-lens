---
title: Recording
lede: Run a forwarding proxy on your machine and save what the agent sends the model.
group: Getting started
order: 2
page: record
---

## How it works

`keysmith-lens record` runs a forwarding proxy on `127.0.0.1`. Point the agent's API address at it: each request is forwarded unchanged to the upstream you name, and its body is saved as `captures/NNN-*.json`. Responses, streaming included, go back to the agent as usual and are not saved.

**Headers are never written to disk**, so API keys and cookies end up in no file.

## Usage

```sh
# terminal 1
PYTHONPATH=. python3 -m keysmith_lens record runs/first \
  --upstream https://api.anthropic.com \
  --rule ./AGENTS.md --rule ~/.claude/CLAUDE.md

# terminal 2
ANTHROPIC_BASE_URL=http://127.0.0.1:8787 claude
```

Press Ctrl-C in terminal 1 when you're done. You can record into the same folder again; numbering continues.

| Option | Meaning |
| --- | --- |
| `run` | Run folder, created if missing |
| `--upstream` | The API address the agent normally uses |
| `--port` | Local port, `8787` by default |
| `--rule` | A rule file to check; repeatable. Copied into the run, with its original absolute path recorded |

Without `--rule`, Lens finds rule files in the run folder by name; see [How it works](/en/docs/how-it-works/).

## Pointing each agent at the proxy

See [Recording each agent](/en/docs/agents/).
