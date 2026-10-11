---
title: How it works
lede: How rules are found and matched, and how side requests and "new" are decided.
group: Reference
order: 5
page: how-it-works
---

## Finding rule files

If the run folder has a `fixtures.json`, the files in its `entries` are the rules. `path` is where the agent read the file; Lens finds the copy in the run folder by the longest matching path suffix. `record --rule` writes this file for you.

Without `fixtures.json`, any file in the run folder with one of these names is a rule: `AGENTS.md`, `AGENTS.override.md`, `CLAUDE.md`, `CLAUDE.local.md`, `GEMINI.md`, `APPEND_SYSTEM.md`, `SYSTEM.md`, `.cursorrules`, `.windsurfrules`, and `*.mdc`.

## Matching by content

Nothing has to be planted in your rules. Each rule file is split into lines, YAML frontmatter removed; lines of 20 or more characters that no other rule file shares are searched for in the request (with whitespace normalized).

- all found: delivered
- some found: partly delivered
- none found: absent

So a rule the agent rewrites (truncates, rewraps, wraps in a template) shows as partly delivered; open the raw text to check.

## Side requests

If a run's agent requests carry tool definitions, a request without them (title generation, for example) is a side request: shown faded and left out when deciding "late" and "dropped".

## New

A segment is "new" when its text did not appear, as is, in the previous agent request.

## Which runs are read

- A folder with `captures/` is one run; any other folder is searched for runs.
- Folders whose name starts with `_` are skipped (scratch runs).
- If a folder holds `<run>-redacted` copies, only those are read.
