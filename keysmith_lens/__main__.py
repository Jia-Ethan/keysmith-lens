"""keysmith-lens build <run-or-folder>... -o out/lens.html"""

from __future__ import annotations

import argparse
from pathlib import Path

from .build import build


def main() -> None:
    ap = argparse.ArgumentParser(prog="keysmith-lens")
    sub = ap.add_subparsers(dest="cmd", required=True)
    b = sub.add_parser("build", help="render runs into one HTML file")
    b.add_argument("paths", nargs="+", type=Path, help="run folders, or folders that contain runs")
    b.add_argument("-o", "--out", type=Path, default=Path("out/lens.html"))
    b.add_argument("--title", default="Keysmith Lens")
    args = ap.parse_args()
    stats = build(args.paths, args.out, args.title)
    print(f"{stats['runs']} runs, {stats['steps']} requests, {stats['bytes'] / 1e6:.1f} MB -> {args.out}")


if __name__ == "__main__":
    main()
