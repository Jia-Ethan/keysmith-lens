"""Find rule files and check, by content, whether each one reached the model.

A rule file is split into lines. Each line long enough to be distinctive,
and not shared with another rule file, is a probe. A rule counts as
delivered in a step when its probes are found in the request text; where
they are found (which segment, which layer) is recorded as well.

No markers need to be planted in the rule files. A run may list its rule
files in ``fixtures.json``; otherwise every known instruction file in the
run folder is a rule. Either way, matching uses the file content.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path

from .trace import Trace

MIN_PROBE_CHARS = 20

# Instruction files the major harnesses read, by file name.
RULE_NAMES = {
    "AGENTS.md", "AGENTS.override.md", "CLAUDE.md", "CLAUDE.local.md", "GEMINI.md",
    "APPEND_SYSTEM.md", "SYSTEM.md", ".cursorrules", ".windsurfrules",
}

# Rules passed as text rather than as files (a CLI flag, an SDK field). The
# capture keeps a copy next to the run under this name.
FLAG_COPIES = {
    "--append-system-prompt": "append.txt",
    "agent_context.system_message_suffix": "system_message_suffix.txt",
}


@dataclass
class Rule:
    key: str  # the name in fixtures.json, else the path relative to the run
    origin: str  # where the harness would read it from
    text: str
    probes: list[str] = field(default_factory=list)


@dataclass
class Hit:
    status: str  # "full", "partial" or "absent"
    found: int
    total: int
    layers: list[str] = field(default_factory=list)
    where: list[str] = field(default_factory=list)
    count: int = 0  # how many segments carry the rule


def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def discover(run_dir: Path) -> list[Rule]:
    """Rules declared by fixtures.json, else every known instruction file."""
    run_dir = Path(run_dir)
    fx = run_dir / "fixtures.json"
    rules: list[Rule] = []
    if fx.exists():
        entries = json.loads(fx.read_text(encoding="utf-8")).get("entries", {})
        for key, entry in entries.items():
            origin = entry.get("path", "")
            f = _resolve(run_dir, origin)
            if f is not None:
                rules.append(Rule(key, origin, f.read_text(encoding="utf-8")))
    else:
        for f in sorted(run_dir.rglob("*")):
            if f.is_file() and (f.name in RULE_NAMES or f.suffix == ".mdc"):
                rel = str(f.relative_to(run_dir))
                rules.append(Rule(rel, rel, f.read_text(encoding="utf-8")))
    _make_probes(rules)
    return [r for r in rules if r.probes]


def _resolve(run_dir: Path, origin: str) -> Path | None:
    """Find the copy of a declared rule inside the run folder.

    ``origin`` is where the harness read it, often an absolute path on the
    machine (or container) that ran it. The run keeps the same tree under a
    different root, so match the longest path suffix that exists.
    """
    if origin in FLAG_COPIES:
        f = run_dir / FLAG_COPIES[origin]
        return f if f.exists() else None
    parts = Path(origin.split(" ")[0]).parts
    # `keysmith-lens record --rule` keeps its copies under files/.
    for base in (run_dir, run_dir / "files"):
        for i in range(len(parts)):
            if parts[i] in ("/", "\\"):
                continue
            f = base.joinpath(*parts[i:])
            if f.is_file():
                return f
    return None


def _body(text: str) -> str:
    """Drop YAML frontmatter; harnesses read it as metadata, not as instructions."""
    m = re.match(r"\A---\n.*?\n---\n", text, flags=re.S)
    return text[m.end():] if m else text


def _make_probes(rules: list[Rule]) -> None:
    lines_of = {r.key: [_norm(l) for l in _body(r.text).splitlines()] for r in rules}
    seen: dict[str, int] = {}
    for lines in lines_of.values():
        for l in set(lines):
            seen[l] = seen.get(l, 0) + 1
    for r in rules:
        r.probes = [l for l in dict.fromkeys(lines_of[r.key])
                    if len(l) >= MIN_PROBE_CHARS and seen[l] == 1]


def match(trace: Trace, rules: list[Rule]) -> dict[str, list[Hit]]:
    """For each rule, one Hit per step."""
    out: dict[str, list[Hit]] = {r.key: [] for r in rules}
    for step in trace.steps:
        normed = [(_norm(s.text), s) for s in step.segments]
        for r in rules:
            found = 0
            layers: list[str] = []
            where: list[str] = []
            carriers = 0
            for text, seg in normed:
                n = sum(1 for p in r.probes if p in text)
                if n:
                    carriers += 1
                    found = max(found, n)
                    if seg.layer not in layers:
                        layers.append(seg.layer)
                    where.append(seg.where)
            total = len(r.probes)
            status = "full" if found == total else "partial" if found else "absent"
            out[r.key].append(Hit(status, found, total, layers, where, carriers))
    return out


def flags(trace: Trace, rules: list[Rule], hits: dict[str, list[Hit]]) -> list[dict]:
    """Automatic notes: never delivered, dropped, late, partial, duplicated."""
    notes: list[dict] = []
    main = [i for i, st in enumerate(trace.steps) if not st.side]
    n = len(main)
    for r in rules:
        h = [hits[r.key][i] for i in main]
        seen = [x.status != "absent" for x in h]
        if n and not any(seen):
            notes.append({"kind": "never", "rule": r.key, "step": None, "n": n,
                          "text": f"{r.key} ({r.origin}) never reached the model in {n} request(s)"})
            continue
        first = seen.index(True) if any(seen) else None
        if first:
            notes.append({"kind": "late", "rule": r.key, "step": main[first], "n": main[first] + 1,
                          "text": f"{r.key} first appears at step {main[first] + 1}"})
        for j in range(1, n):
            a, b = main[j - 1] + 1, main[j] + 1
            if seen[j - 1] and not seen[j]:
                notes.append({"kind": "dropped", "rule": r.key, "step": main[j], "n": b, "prev": a,
                              "text": f"{r.key} present at step {a}, gone at step {b}"})
            if not seen[j - 1] and seen[j] and first is not None and j > first:
                notes.append({"kind": "returned", "rule": r.key, "step": main[j], "n": b,
                              "text": f"{r.key} back at step {b}"})
        for j, x in enumerate(h):
            if x.status == "partial":
                notes.append({"kind": "partial", "rule": r.key, "step": main[j], "n": main[j] + 1,
                              "found": x.found, "total": x.total,
                              "text": f"{r.key} only partly present at step {main[j] + 1} ({x.found}/{x.total} lines)"})
            if x.count > 1:
                notes.append({"kind": "duplicated", "rule": r.key, "step": main[j], "n": main[j] + 1, "count": x.count,
                              "text": f"{r.key} appears in {x.count} places at step {main[j] + 1}"})
    return notes
