---
title: Data and privacy
lede: What Lens saves, what it doesn't, and what's in the page it builds.
group: Reference
order: 6
page: privacy
---

## No network of its own

`build` is fully offline. `record` connects only to the address you give with `--upstream`, forwarding requests the agent was going to send anyway. No account, analytics or telemetry.

## What is saved

`record` saves each request's method, path, time and body. **Headers are never written**, so API keys, cookies and organization IDs carried in headers never reach a file. Responses are not saved.

`--rule` copies the rule file into the run and records its original absolute path in `fixtures.json`.

## What's in the page

The HTML from `build` contains request text: system prompts, conversation, tool output, and any file contents or paths in them. Treat it as you treat the runs: open it locally, and to share, redact the runs first and then build.

## Demo data

The five runs from `examples/make_demo.py` are made up and come from no real session. The videos and screenshots on this site are recorded from that data.
