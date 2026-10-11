"""Content matching on a tiny synthetic run (no captured data needed)."""

import json
import tempfile
import unittest
from pathlib import Path

from keysmith_lens.adapters.wire import load_run
from keysmith_lens.rules import discover, flags, match

RULE = "# Project rules\n\n- Never push to main without asking the user first.\n"


def capture(i, messages, tools=True):
    body = {"model": "m", "system": "You are an agent.", "messages": messages}
    if tools:
        body["tools"] = [{"name": "Read"}]
    return {"path": "/v1/messages", "body_parsed": body}


class RulesTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        run = Path(self.tmp.name) / "run"
        (run / "captures").mkdir(parents=True)
        (run / "project").mkdir()
        (run / "project" / "AGENTS.md").write_text(RULE)
        steps = [
            [{"role": "user", "content": "hi"}],
            [{"role": "user", "content": RULE + "\nhi"}],
            [{"role": "user", "content": "summary of earlier work"}],
        ]
        for i, msgs in enumerate(steps, 1):
            (run / "captures" / f"{i:03d}-v1_messages.json").write_text(json.dumps(capture(i, msgs)))
        # a helper request without tools is a side call and must not count as a drop
        (run / "captures" / "004-v1_messages.json").write_text(json.dumps(capture(4, [{"role": "user", "content": "title?"}], tools=False)))
        self.run_dir = run

    def tearDown(self):
        self.tmp.cleanup()

    def test_late_then_dropped(self):
        trace = load_run(self.run_dir)
        rules = discover(self.run_dir)
        self.assertEqual([r.key for r in rules], ["project/AGENTS.md"])
        hits = match(trace, rules)["project/AGENTS.md"]
        self.assertEqual([h.status for h in hits], ["absent", "full", "absent", "absent"])
        self.assertEqual(hits[1].layers, ["user"])
        self.assertTrue(trace.steps[3].side)
        kinds = [n["kind"] for n in flags(trace, rules, {"project/AGENTS.md": hits})]
        self.assertEqual(kinds, ["late", "dropped"])


if __name__ == "__main__":
    unittest.main()
