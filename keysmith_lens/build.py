"""Build one self-contained HTML view from a set of runs."""

from __future__ import annotations

import json
import re
from pathlib import Path

from .adapters.wire import load_run
from .rules import Rule, discover, flags, match
from .trace import LAYERS

TEMPLATE = Path(__file__).with_name("template.html")


def find_runs(paths: list[Path]) -> list[Path]:
    """Each path is a run (has captures/) or a folder holding runs."""
    runs: list[Path] = []
    for p in paths:
        p = Path(p)
        if (p / "captures").is_dir():
            runs.append(p)
        else:
            # Skip scratch folders such as _shakedown/ and _debug/.
            runs.extend(sorted(d.parent for d in p.rglob("captures") if d.is_dir()
                               and not any(part.startswith("_") for part in d.relative_to(p).parts)))
    runs = list(dict.fromkeys(runs))
    # A common capture workflow keeps raw runs local and shares redacted
    # copies named <run>-redacted. In a folder that has them, read only those.
    redacted = {r.parent for r in runs if r.name.endswith("-redacted")}
    return [r for r in runs if r.parent not in redacted or r.name.endswith("-redacted")]


class _Strings:
    def __init__(self) -> None:
        self.items: list[str] = []
        self.index: dict[str, int] = {}

    def add(self, s: str) -> int:
        if s not in self.index:
            self.index[s] = len(self.items)
            self.items.append(s)
        return self.index[s]


def _spans(text: str, rules: list[Rule]) -> list[list]:
    """Character ranges of rule lines inside a segment, for highlighting."""
    out = []
    for r in rules:
        for line in r.text.splitlines():
            line = line.strip()
            if len(line) < 20:
                continue
            start = text.find(line)
            if start >= 0:
                out.append([start, start + len(line), r.key])
    return sorted(out)


def _group(label: str) -> str:
    return re.sub(r"(-r\d+|@\d{6})$", "", label)


def build(paths: list[Path], out: Path, title: str = "Keysmith Lens") -> dict:
    strings = _Strings()
    runs = []
    for run_dir in find_runs(paths):
        trace = load_run(run_dir)
        if not trace.steps:
            continue
        rules = discover(run_dir)
        hits = match(trace, rules)
        steps = []
        for st in trace.steps:
            segs = []
            for s in st.segments:
                spans = _spans(s.text, rules)
                segs.append([LAYERS.index(s.layer), s.where, s.role, strings.add(s.text), int(s.new), spans])
            steps.append({
                "source": st.source, "api": st.api, "model": st.model, "side": st.side,
                "segs": segs,
                "hits": {r.key: [hits[r.key][st.index].status, hits[r.key][st.index].layers,
                                 hits[r.key][st.index].count] for r in rules},
            })
        runs.append({
            "id": trace.run_id, "label": trace.label, "group": _group(trace.label),
            "harness": trace.harness or "unknown",
            "rules": [{"key": r.key, "origin": r.origin, "lines": len(r.probes)} for r in rules],
            "steps": steps,
            "notes": flags(trace, rules, hits),
        })
    runs.sort(key=lambda r: (r["harness"], r["group"], r["label"]))
    data = {"title": title, "layers": list(LAYERS), "strings": strings.items, "runs": runs}
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    html = TEMPLATE.read_text(encoding="utf-8").replace("__DATA__", payload).replace("__TITLE__", title)
    out = Path(out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding="utf-8")
    return {"runs": len(runs), "steps": sum(len(r["steps"]) for r in runs),
            "strings": len(strings.items), "bytes": out.stat().st_size}
