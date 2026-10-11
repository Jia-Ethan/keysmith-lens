"""keysmith-lens record | build

  record  run a local proxy that saves each model request into a run folder
  build   render run folders into one HTML file
"""

from __future__ import annotations

import argparse
from pathlib import Path

from .build import build


def main() -> None:
    ap = argparse.ArgumentParser(prog="keysmith-lens")
    sub = ap.add_subparsers(dest="cmd", required=True)

    r = sub.add_parser("record", help="save an agent's model requests while it runs")
    r.add_argument("run", type=Path, help="run folder to write (created if missing)")
    r.add_argument("--upstream", required=True, help="the API the agent normally talks to, e.g. https://api.anthropic.com")
    r.add_argument("--port", type=int, default=8787)
    r.add_argument("--rule", dest="rules", action="append", type=Path, default=[],
                   help="a rule file to copy into the run (repeatable), e.g. ./AGENTS.md")

    b = sub.add_parser("build", help="render runs into one HTML file")
    b.add_argument("paths", nargs="+", type=Path, help="run folders, or folders that contain runs")
    b.add_argument("-o", "--out", type=Path, default=Path("out/lens.html"))
    b.add_argument("--title", default="Keysmith Lens")
    args = ap.parse_args()

    if args.cmd == "record":
        from .record import serve
        server = serve(args.run, args.upstream, args.port, args.rules)
        print(f"recording to {args.run}/captures; point the agent at http://127.0.0.1:{args.port} (Ctrl-C to stop)")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
        finally:
            server.server_close()
        n = len(list((args.run / "captures").glob("*.json")))
        print(f"saved {n} request(s). Next: python3 -m keysmith_lens build {args.run}")
        return

    stats = build(args.paths, args.out, args.title)
    print(f"{stats['runs']} runs, {stats['steps']} requests, {stats['bytes'] / 1e6:.1f} MB -> {args.out}")


if __name__ == "__main__":
    main()
