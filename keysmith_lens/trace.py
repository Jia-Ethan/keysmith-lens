"""Common trace model: what the model was sent at each step.

A trace is a list of steps. Each step is one request to the model, split
into segments. A segment is one piece of text on one channel (layer):
system prompt, user turn, assistant turn, tool call, tool result, or tool
schema. Adapters turn harness-specific data into this shape.
"""

from __future__ import annotations

from dataclasses import dataclass, field

LAYERS = ("system", "user", "assistant", "tool_call", "tool_result", "tool_schema")


@dataclass
class Segment:
    layer: str
    where: str  # JSON-pointer-ish location in the request, e.g. "messages[3].content[0]"
    role: str
    text: str
    new: bool = False  # not present in the previous step's request


@dataclass
class Step:
    index: int
    source: str  # capture file name
    api: str
    model: str
    segments: list[Segment] = field(default_factory=list)
    side: bool = False  # a helper request (e.g. title generation), not the agent loop

    def chars_by_layer(self) -> dict[str, int]:
        out = {k: 0 for k in LAYERS}
        for s in self.segments:
            out[s.layer] += len(s.text)
        return out


@dataclass
class Trace:
    run_id: str
    label: str
    harness: str
    steps: list[Step] = field(default_factory=list)


def mark_side_requests(steps: list[Step]) -> None:
    """A request without tool schemas, in a run whose agent requests have them, is a side call."""
    if not any(s.layer == "tool_schema" for st in steps for s in st.segments):
        return
    for st in steps:
        st.side = not any(s.layer == "tool_schema" for s in st.segments)


def mark_new_segments(steps: list[Step]) -> None:
    """Flag segments whose text did not appear anywhere in the previous step."""
    prev: set[str] = set()
    for step in steps:
        for s in step.segments:
            s.new = s.text not in prev
        if not step.side:
            prev = {s.text for s in step.segments}
