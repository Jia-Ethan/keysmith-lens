"""Adapter for wire captures: one JSON file per request the harness sent.

Reads a run folder of ``captures/NNN-*.json``, each holding one request
body under ``body_parsed`` (format in the README). Understands three
request shapes: Anthropic Messages, OpenAI Responses, Chat Completions.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from ..trace import Segment, Step, Trace, mark_new_segments, mark_side_requests

MODEL_PATHS = ("/v1/messages", "/v1/responses", "/v1/chat/completions")


def load_run(run_dir: Path) -> Trace:
    run_dir = Path(run_dir)
    steps: list[Step] = []
    for f in sorted((run_dir / "captures").glob("*.json")):
        cap = json.loads(f.read_text(encoding="utf-8"))
        path = (cap.get("path") or "").split("?")[0]
        body = cap.get("body_parsed")
        if path not in MODEL_PATHS or not isinstance(body, dict):
            continue
        step = Step(index=len(steps), source=f.name, api=path, model=str(body.get("model", "")))
        if path == "/v1/messages":
            step.segments = _anthropic(body)
        elif path == "/v1/responses":
            step.segments = _responses(body)
        else:
            step.segments = _chat(body)
        steps.append(step)
    mark_side_requests(steps)
    mark_new_segments(steps)
    harness, label = _describe(run_dir)
    return Trace(run_id=run_dir.name, label=label, harness=harness, steps=steps)


def _text(value) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    return json.dumps(value, ensure_ascii=False)


def _tools(body: dict) -> list[Segment]:
    tools = body.get("tools")
    if not tools:
        return []
    return [Segment("tool_schema", "tools", "", _text(tools))]


def _anthropic(body: dict) -> list[Segment]:
    segs: list[Segment] = []
    system = body.get("system")
    if isinstance(system, str):
        segs.append(Segment("system", "system", "system", system))
    elif isinstance(system, list):
        for i, part in enumerate(system):
            segs.append(Segment("system", f"system[{i}]", "system", _text(part.get("text"))))
    for mi, msg in enumerate(body.get("messages", [])):
        role = msg.get("role", "")
        content = msg.get("content")
        base = "system" if role == "system" else role
        if isinstance(content, str):
            segs.append(Segment(base, f"messages[{mi}]", role, content))
            continue
        for pi, part in enumerate(content or []):
            where = f"messages[{mi}].content[{pi}]"
            kind = part.get("type")
            if kind == "tool_use":
                text = f"{part.get('name', '')}({_text(part.get('input'))})"
                segs.append(Segment("tool_call", where, role, text))
            elif kind == "tool_result":
                segs.append(Segment("tool_result", where, role, _text(part.get("content"))))
            elif kind in ("thinking", "redacted_thinking"):
                segs.append(Segment("assistant", where, role, _text(part.get("thinking", ""))))
            else:
                segs.append(Segment(base, where, role, _text(part.get("text"))))
    return segs + _tools(body)


def _responses(body: dict) -> list[Segment]:
    segs: list[Segment] = []
    if body.get("instructions"):
        segs.append(Segment("system", "instructions", "system", _text(body["instructions"])))
    items = body.get("input")
    if isinstance(items, str):
        items = [{"role": "user", "content": items}]
    for ii, item in enumerate(items or []):
        where = f"input[{ii}]"
        kind = item.get("type")
        role = item.get("role", "")
        if kind == "function_call":
            text = f"{item.get('name', '')}({_text(item.get('arguments'))})"
            segs.append(Segment("tool_call", where, "assistant", text))
        elif kind == "function_call_output":
            segs.append(Segment("tool_result", where, "tool", _text(item.get("output"))))
        elif kind == "reasoning":
            segs.append(Segment("assistant", where, "assistant", _text(item.get("summary"))))
        else:
            layer = "system" if role in ("system", "developer") else role or "user"
            content = item.get("content")
            if isinstance(content, str):
                segs.append(Segment(layer, where, role, content))
            else:
                for pi, part in enumerate(content or []):
                    segs.append(Segment(layer, f"{where}.content[{pi}]", role, _text(part.get("text"))))
    return segs + _tools(body)


def _chat(body: dict) -> list[Segment]:
    segs: list[Segment] = []
    for mi, msg in enumerate(body.get("messages", [])):
        role = msg.get("role", "")
        layer = {"system": "system", "developer": "system", "tool": "tool_result"}.get(role, role)
        content = msg.get("content")
        if isinstance(content, str):
            segs.append(Segment(layer, f"messages[{mi}]", role, content))
        else:
            for pi, part in enumerate(content or []):
                segs.append(Segment(layer, f"messages[{mi}].content[{pi}]", role, _text(part.get("text"))))
        for ci, call in enumerate(msg.get("tool_calls") or []):
            fn = call.get("function", {})
            text = f"{fn.get('name', '')}({_text(fn.get('arguments'))})"
            segs.append(Segment("tool_call", f"messages[{mi}].tool_calls[{ci}]", role, text))
    return segs + _tools(body)


def _describe(run_dir: Path) -> tuple[str, str]:
    """Harness name and a short label, from fixtures.json and the directory name."""
    harness = ""
    fx = run_dir / "fixtures.json"
    if fx.exists():
        harness = json.loads(fx.read_text(encoding="utf-8")).get("harness", "")
    label = re.sub(r"-redacted$", "", run_dir.name)
    stamp = re.search(r"\d{8}T(\d{6})Z?", label)
    label = re.sub(r"-?\d{8}T\d{6}Z?-?", "-", label).strip("-")
    if stamp and not re.search(r"-r\d+$", label):
        label += "@" + stamp.group(1)  # keep repeat runs apart when the name has no -rN
    return harness, label
