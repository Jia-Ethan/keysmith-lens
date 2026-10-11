# Capture format

Keysmith Lens reads run folders. It does not capture anything itself: point the agent at a local recording proxy (any proxy that writes request bodies to disk) and arrange the output like this.

```
my-run/
  captures/
    001-v1_messages.json
    002-v1_messages.json
    ...
  fixtures.json          optional: which files are the rules
  project/AGENTS.md      the rule files themselves (any layout)
  home/.claude/CLAUDE.md
```

## `captures/NNN-*.json`

One file per HTTP request the agent sent, in order (the file name sorts them).

```json
{
  "path": "/v1/messages",
  "body_parsed": { "model": "...", "system": [...], "messages": [...], "tools": [...] }
}
```

- `path`: the request path. Only `/v1/messages`, `/v1/responses` and `/v1/chat/completions` are treated as model requests; anything else (model lists, metadata) is skipped. A query string is ignored.
- `body_parsed`: the JSON request body as sent.

Other fields are ignored.

## Rules

If `fixtures.json` exists, its `entries` say which files are rules:

```json
{
  "harness": "claude-code",
  "entries": {
    "project": { "path": "/work/project/AGENTS.md" },
    "global":  { "path": "/home/me/.claude/CLAUDE.md" }
  }
}
```

`path` is where the agent read the file. It is usually an absolute path on the machine that ran it; Lens finds the copy in the run folder by the longest matching path suffix (`/work/project/AGENTS.md` → `my-run/project/AGENTS.md`). Rules given as text rather than files are read from a copy next to the run: `--append-system-prompt` from `append.txt`, `agent_context.system_message_suffix` from `system_message_suffix.txt`.

`harness` is only a label for grouping runs.

Without `fixtures.json`, every file in the run folder with a known instruction-file name is a rule: `AGENTS.md`, `AGENTS.override.md`, `CLAUDE.md`, `CLAUDE.local.md`, `GEMINI.md`, `APPEND_SYSTEM.md`, `SYSTEM.md`, `.cursorrules`, `.windsurfrules`, and `*.mdc`.

## Which runs are read

- A path with a `captures/` folder is one run; any other path is searched for runs.
- Folders whose name starts with `_` are skipped (scratch runs).
- If a folder holds `<run>-redacted` copies, only the redacted ones are read.

## Example

`python3 examples/make_demo.py examples/demo` writes five made-up runs in this format.
