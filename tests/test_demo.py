"""The demo runs show the events they were written to show."""

import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from keysmith_lens.adapters.wire import load_run
from keysmith_lens.rules import discover, flags, match

ROOT = Path(__file__).resolve().parent.parent


class DemoTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.demo = Path(cls.tmp.name) / "demo"
        subprocess.run([sys.executable, str(ROOT / "examples" / "make_demo.py"), str(cls.demo)], check=True, capture_output=True)

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def kinds(self, name):
        run = self.demo / name
        trace, rules = load_run(run), discover(run)
        return {(n["kind"], n["rule"]) for n in flags(trace, rules, match(trace, rules))}

    def test_events(self):
        self.assertEqual(self.kinds("all-rules-upfront"), set())
        self.assertEqual(self.kinds("late-rules"), {("late", "payments")})
        self.assertEqual(self.kinds("compaction"), {("late", "payments"), ("dropped", "payments"), ("returned", "payments")})
        self.assertIn(("never", "team"), self.kinds("missing-rule"))
        # the title request has no tools: faded, not a drop
        self.assertEqual(self.kinds("system-prompt-rules"), {("late", "payments")})


if __name__ == "__main__":
    unittest.main()
