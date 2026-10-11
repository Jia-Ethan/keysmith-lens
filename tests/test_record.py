"""The recording proxy forwards requests, streams responses and saves bodies without headers."""

import json
import tempfile
import threading
import unittest
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from keysmith_lens.record import serve


class Upstream(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def do_POST(self):
        body = self.rfile.read(int(self.headers["Content-Length"]))
        Upstream.seen = (self.path, self.headers.get("x-api-key"), json.loads(body))
        out = b"data: one\n\ndata: two\n\n"
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Content-Length", str(len(out)))
        self.end_headers()
        self.wfile.write(out)


class RecordTest(unittest.TestCase):
    def test_forward_and_save(self):
        up = ThreadingHTTPServer(("127.0.0.1", 0), Upstream)
        threading.Thread(target=up.serve_forever, daemon=True).start()
        with tempfile.TemporaryDirectory() as tmp:
            rule = Path(tmp) / "proj" / "AGENTS.md"
            rule.parent.mkdir()
            rule.write_text("- Always run the tests before saying you are done.\n")
            run = Path(tmp) / "run"
            proxy = serve(run, f"http://127.0.0.1:{up.server_port}", port=0, rules=[rule])
            threading.Thread(target=proxy.serve_forever, daemon=True).start()
            req = urllib.request.Request(
                f"http://127.0.0.1:{proxy.server_port}/v1/messages?beta=true",
                data=json.dumps({"model": "m", "messages": [{"role": "user", "content": "hi"}]}).encode(),
                headers={"Content-Type": "application/json", "x-api-key": "secret-value"}, method="POST")
            with urllib.request.urlopen(req) as resp:
                self.assertEqual(resp.read(), b"data: one\n\ndata: two\n\n")
            proxy.shutdown()
            up.shutdown()

            self.assertEqual(Upstream.seen[0], "/v1/messages?beta=true")
            self.assertEqual(Upstream.seen[1], "secret-value")  # forwarded to the API
            saved = list((run / "captures").glob("*.json"))
            self.assertEqual(len(saved), 1)
            text = saved[0].read_text()
            self.assertNotIn("secret-value", text)  # never written to disk
            self.assertEqual(json.loads(text)["body_parsed"]["messages"][0]["content"], "hi")
            fx = json.loads((run / "fixtures.json").read_text())
            self.assertEqual(fx["entries"]["AGENTS.md"]["path"], str(rule.resolve()))

            from keysmith_lens.rules import discover
            self.assertEqual([r.key for r in discover(run)], ["AGENTS.md"])


if __name__ == "__main__":
    unittest.main()
