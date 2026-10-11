"""A local recording proxy: forwards an agent's model requests and keeps a copy.

Point the agent's base URL at it (e.g. ANTHROPIC_BASE_URL=http://127.0.0.1:8787)
and every request is forwarded to the upstream API unchanged, while the
request body is written to <run>/captures/NNN-<path>.json. Responses,
streamed or not, go back to the agent as they arrive and are not stored.

Only the method, path and body are written. Headers are never stored, so
API keys and cookies do not reach the disk. The proxy listens on 127.0.0.1.
"""

from __future__ import annotations

import http.client
import itertools
import json
import re
import shutil
import threading
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

# Not forwarded in either direction: connection-level headers, and those the
# proxy recomputes. Accept-Encoding is dropped so bodies come back plain.
HOP = {"connection", "keep-alive", "proxy-connection", "transfer-encoding", "te", "trailer",
       "upgrade", "host", "content-length", "accept-encoding"}


def _name(n: int, path: str) -> str:
    slug = re.sub(r"[^A-Za-z0-9]+", "_", path.split("?")[0]).strip("_") or "root"
    return f"{n:03d}-{slug}.json"


def serve(run_dir: Path, upstream: str, port: int = 8787, rules: list[Path] | None = None,
          ready: threading.Event | None = None) -> ThreadingHTTPServer:
    """Start the proxy; returns the server (call serve_forever / shutdown)."""
    run_dir = Path(run_dir)
    (run_dir / "captures").mkdir(parents=True, exist_ok=True)
    up = urlsplit(upstream.rstrip("/"))
    if up.scheme not in ("http", "https") or not up.hostname:
        raise ValueError(f"upstream must be an http(s) URL, got {upstream!r}")
    counter = itertools.count(len(list((run_dir / "captures").glob("*.json"))) + 1)
    lock = threading.Lock()
    _copy_rules(run_dir, rules or [])

    class Handler(BaseHTTPRequestHandler):
        protocol_version = "HTTP/1.1"

        def log_message(self, fmt, *args):  # keep the terminal quiet
            pass

        def _forward(self):
            length = int(self.headers.get("Content-Length") or 0)
            body = self.rfile.read(length) if length else b""
            if body:
                try:
                    parsed = json.loads(body)
                except ValueError:
                    parsed = None
                with lock:
                    n = next(counter)
                    record = {"method": self.command, "path": self.path,
                              "captured_at_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                              "body_parsed": parsed}
                    if parsed is None:
                        record["body_raw_if_unparsed"] = body.decode("utf-8", "replace")
                    (run_dir / "captures" / _name(n, self.path)).write_text(
                        json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

            conn_cls = http.client.HTTPSConnection if up.scheme == "https" else http.client.HTTPConnection
            conn = conn_cls(up.hostname, up.port, timeout=600)
            headers = {k: v for k, v in self.headers.items() if k.lower() not in HOP}
            headers["Host"] = up.netloc
            try:
                conn.request(self.command, (up.path or "") + self.path, body=body or None, headers=headers)
                resp = conn.getresponse()
            except OSError as e:
                msg = f"keysmith-lens record: upstream unreachable: {e}".encode()
                self.send_response(502)
                self.send_header("Content-Type", "text/plain; charset=utf-8")
                self.send_header("Content-Length", str(len(msg)))
                self.end_headers()
                self.wfile.write(msg)
                return
            self.send_response(resp.status, resp.reason)
            for k, v in resp.getheaders():
                if k.lower() not in HOP:
                    self.send_header(k, v)
            # Stream the body through as chunks, so SSE reaches the agent live.
            self.send_header("Transfer-Encoding", "chunked")
            self.end_headers()
            while True:
                chunk = resp.read1(65536) if hasattr(resp, "read1") else resp.read(65536)
                if not chunk:
                    break
                self.wfile.write(b"%x\r\n%s\r\n" % (len(chunk), chunk))
                self.wfile.flush()
            self.wfile.write(b"0\r\n\r\n")
            conn.close()

        do_GET = do_POST = do_PUT = do_PATCH = do_DELETE = _forward

    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    if ready:
        ready.set()
    return server


def _copy_rules(run_dir: Path, rules: list[Path]) -> None:
    """Copy rule files into the run and list them in fixtures.json, keeping their absolute paths."""
    if not rules:
        return
    fx = run_dir / "fixtures.json"
    data = json.loads(fx.read_text(encoding="utf-8")) if fx.exists() else {"entries": {}}
    for src in rules:
        src = Path(src).expanduser().resolve()
        rel = Path(*src.parts[1:])  # keep the tree so the path can be matched back
        dst = run_dir / "files" / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dst)
        key = src.name if src.name not in data["entries"] else str(rel)
        data["entries"][key] = {"path": str(src)}
    fx.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
