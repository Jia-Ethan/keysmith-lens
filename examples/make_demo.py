"""Write a small set of made-up runs for the demo, screenshots and tests.

Nothing here comes from a real capture. The runs are shaped like the
requests real harnesses send (Anthropic Messages and OpenAI Responses) so
the viewer can show each kind of event:

  checkout-api   rules delivered at the start and kept to the end
  late-rules     a subdirectory rule arrives only when the agent reads there
  compaction     context compaction drops a rule; a later read brings it back
  two-harnesses  the same project run through two harnesses, side by side
  missing-rule   a rule file that never reaches the model

  python3 examples/make_demo.py examples/demo
"""

from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

ROOT_RULES = """# Checkout service

- Run `make test` before you say a change is done.
- Never edit files under `migrations/` by hand; generate them with `make migration`.
- Ask before adding a new dependency to `pyproject.toml`.
"""

PAYMENTS_RULES = """# payments/

- Amounts are integers in cents. Never use floats for money.
- Every call to the card processor goes through `payments/gateway.py`.
"""

USER_RULES = """# My defaults

- Keep commit messages under 72 characters in the first line.
- Explain a plan in three bullets before large edits.
"""

TEAM_RULES = """# Team conventions

- Log with `structlog`; do not use print in service code.
- Feature flags live in `config/flags.yaml` and default to off.
"""

SYSTEM = (
    "You are a coding agent working in a local repository. Use the tools to read and "
    "edit files and to run commands. Prefer small, verifiable steps. "
) * 12

TOOLS_ANTHROPIC = [
    {"name": "Read", "description": "Read a file from the workspace.", "input_schema": {"type": "object", "properties": {"path": {"type": "string"}}}},
    {"name": "Edit", "description": "Replace text in a file.", "input_schema": {"type": "object", "properties": {"path": {"type": "string"}, "old": {"type": "string"}, "new": {"type": "string"}}}},
    {"name": "Bash", "description": "Run a shell command in the workspace and return its output. " * 8, "input_schema": {"type": "object", "properties": {"command": {"type": "string"}}}},
]
TOOLS_OPENAI = [{"type": "function", "name": t["name"].lower(), "description": t["description"], "parameters": t["input_schema"]} for t in TOOLS_ANTHROPIC]

TASK = "Add a refund endpoint to the checkout API and cover it with a test."


def reminder(*files: tuple[str, str]) -> str:
    body = "\n\n".join(f"Contents of {path}:\n\n{text}" for path, text in files)
    return f"<context>\nProject and user instructions follow.\n\n{body}\n</context>"


def write_run(root: Path, name: str, harness: str, rules: dict[str, tuple[str, str]], requests: list[dict]) -> None:
    run = root / name
    (run / "captures").mkdir(parents=True)
    entries = {}
    for key, (path, text) in rules.items():
        f = run / path
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(text)
        entries[key] = {"path": "/work/" + path}
    (run / "fixtures.json").write_text(json.dumps({"harness": harness, "entries": entries}, indent=2) + "\n")
    for i, req in enumerate(requests, 1):
        path = req.pop("_path")
        (run / "captures" / f"{i:03d}-{path.strip('/').replace('/', '_')}.json").write_text(
            json.dumps({"method": "POST", "path": path, "body_parsed": req}, indent=2) + "\n")


def anthropic(messages: list, system: str = SYSTEM) -> dict:
    return {"_path": "/v1/messages", "model": "demo-model", "system": [{"type": "text", "text": system}],
            "messages": messages, "tools": TOOLS_ANTHROPIC}


def use(i: int, name: str, args: dict) -> dict:
    return {"role": "assistant", "content": [{"type": "tool_use", "id": f"t{i}", "name": name, "input": args}]}


def result(i: int, text: str, extra: list | None = None) -> dict:
    return {"role": "user", "content": [{"type": "tool_result", "tool_use_id": f"t{i}", "content": text}] + (extra or [])}


GATEWAY = "def charge(amount_cents: int, token: str) -> str:\n    ...\n"
ROUTES = "from fastapi import APIRouter\nrouter = APIRouter()\n\n@router.post('/checkout')\ndef checkout(): ...\n"


def main(out: Path) -> None:
    if out.exists():
        shutil.rmtree(out)
    rules = {
        "project": ("project/AGENTS.md", ROOT_RULES),
        "payments": ("project/payments/AGENTS.md", PAYMENTS_RULES),
        "user": ("home/.agent/AGENTS.md", USER_RULES),
    }
    first = {"role": "user", "content": [
        {"type": "text", "text": reminder(("~/.agent/AGENTS.md", USER_RULES), ("project/AGENTS.md", ROOT_RULES))},
        {"type": "text", "text": TASK}]}
    nested = {"type": "text", "text": reminder(("project/payments/AGENTS.md", PAYMENTS_RULES))}

    # 1. late-rules: the payments rule only arrives with the read under payments/
    m = [first]
    reqs = [anthropic(list(m))]
    m += [use(1, "Read", {"path": "api/routes.py"}), result(1, ROUTES)]
    reqs.append(anthropic(list(m)))
    m += [use(2, "Read", {"path": "payments/gateway.py"}), result(2, GATEWAY, [nested])]
    reqs.append(anthropic(list(m)))
    m += [use(3, "Edit", {"path": "api/routes.py", "old": "def checkout(): ...", "new": "def checkout(): ...\n\n@router.post('/refund')\ndef refund(amount_cents: int): ..."}), result(3, "ok")]
    reqs.append(anthropic(list(m)))
    m += [use(4, "Bash", {"command": "make test"}), result(4, "14 passed")]
    reqs.append(anthropic(list(m)))
    write_run(out, "late-rules", "demo-cli", rules, reqs)

    # 2. compaction: after the summary the payments rule is gone until payments/ is read again
    summary = {"role": "user", "content": [
        {"type": "text", "text": "Summary of the conversation so far: the agent read api/routes.py and payments/gateway.py and added a refund route."},
        {"type": "text", "text": reminder(("~/.agent/AGENTS.md", USER_RULES), ("project/AGENTS.md", ROOT_RULES))},
        {"type": "text", "text": "Continue: wire the refund route to the gateway."}]}
    reqs = [anthropic([first]),
            anthropic([first, use(1, "Read", {"path": "payments/gateway.py"}), result(1, GATEWAY, [nested])]),
            anthropic([first, use(1, "Read", {"path": "payments/gateway.py"}), result(1, GATEWAY, [nested]),
                       use(2, "Edit", {"path": "api/routes.py", "old": "...", "new": "refund route"}), result(2, "ok")])]
    m = [summary]
    reqs.append(anthropic(list(m)))
    m += [use(3, "Edit", {"path": "api/routes.py", "old": "refund route", "new": "refund route calling gateway.refund(amount)"}), result(3, "ok")]
    reqs.append(anthropic(list(m)))
    m += [use(4, "Read", {"path": "payments/gateway.py"}), result(4, GATEWAY, [nested])]
    reqs.append(anthropic(list(m)))
    write_run(out, "compaction", "demo-cli", rules, reqs)

    # 3. missing-rule: a team rule file is configured but never sent
    team_rules = dict(rules, team=("home/.agent/team.md", TEAM_RULES))
    m = [first]
    reqs = [anthropic(list(m))]
    m += [use(1, "Read", {"path": "payments/gateway.py"}), result(1, GATEWAY, [nested])]
    reqs.append(anthropic(list(m)))
    m += [use(2, "Bash", {"command": "make test"}), result(2, "14 passed")]
    reqs.append(anthropic(list(m)))
    write_run(out, "missing-rule", "demo-cli", team_rules, reqs)

    # 4. two harnesses: the same task, one puts rules in the system prompt (OpenAI Responses)
    def responses(items: list, instructions: str) -> dict:
        return {"_path": "/v1/responses", "model": "demo-model", "instructions": instructions,
                "input": items, "tools": TOOLS_OPENAI}
    instr = SYSTEM + "\n\n<repo_rules>\n" + ROOT_RULES + "\n" + USER_RULES + "</repo_rules>"
    items = [{"role": "user", "content": [{"type": "input_text", "text": TASK}]}]
    reqs = [responses(list(items), instr)]
    items += [{"type": "function_call", "call_id": "c1", "name": "read", "arguments": json.dumps({"path": "payments/gateway.py"})},
              {"type": "function_call_output", "call_id": "c1", "output": GATEWAY + "\n\n" + PAYMENTS_RULES}]
    reqs.append(responses(list(items), instr))
    items += [{"type": "function_call", "call_id": "c2", "name": "bash", "arguments": json.dumps({"command": "make test"})},
              {"type": "function_call_output", "call_id": "c2", "output": "14 passed"}]
    reqs.append(responses(list(items), instr))
    # a title request without tools: shown faded, not counted as a drop
    reqs.append({"_path": "/v1/responses", "model": "demo-model", "instructions": "Write a short title.",
                 "input": [{"role": "user", "content": [{"type": "input_text", "text": TASK}]}]})
    write_run(out, "system-prompt-rules", "demo-sdk", rules, reqs)

    # 5. a clean run for contrast
    m = [{"role": "user", "content": [
        {"type": "text", "text": reminder(("~/.agent/AGENTS.md", USER_RULES), ("project/AGENTS.md", ROOT_RULES), ("project/payments/AGENTS.md", PAYMENTS_RULES))},
        {"type": "text", "text": TASK}]}]
    reqs = [anthropic(list(m))]
    m += [use(1, "Read", {"path": "payments/gateway.py"}), result(1, GATEWAY)]
    reqs.append(anthropic(list(m)))
    m += [use(2, "Bash", {"command": "make test"}), result(2, "14 passed")]
    reqs.append(anthropic(list(m)))
    write_run(out, "all-rules-upfront", "demo-cli", rules, reqs)
    print(f"wrote 5 demo runs to {out}")


if __name__ == "__main__":
    main(Path(sys.argv[1] if len(sys.argv) > 1 else "examples/demo"))
