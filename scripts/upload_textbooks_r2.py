#!/usr/bin/env python3
"""Upload converted textbook markdown and page images to R2 in parallel."""

from __future__ import annotations

import mimetypes
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "content/textbooks/md/grade-12"
BUCKET = "kasina-textbooks"
SERVER = ROOT / "apps/server"
WORKERS = 8

MIME = {
    ".json": "application/json",
    ".md": "text/markdown; charset=utf-8",
    ".webp": "image/webp",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
}


def put(path: Path) -> str:
    rel = path.relative_to(SRC).as_posix()
    key = f"textbooks/grade-12/{rel}"
    mime = MIME.get(path.suffix.lower(), "application/octet-stream")
    cmd = [
        "npx",
        "wrangler",
        "r2",
        "object",
        "put",
        f"{BUCKET}/{key}",
        "--file",
        str(path),
        "--content-type",
        mime,
        "--remote",
    ]
    subprocess.run(cmd, cwd=SERVER, check=True, capture_output=True, text=True)
    return key


def main() -> int:
    if not SRC.is_dir():
        print("Missing", SRC, file=sys.stderr)
        return 1
    files = sorted(
        p
        for p in SRC.rglob("*")
        if p.is_file() and p.suffix.lower() in MIME
    )
    print(f"Uploading {len(files)} files to {BUCKET}...")
    ok = 0
    failed = []
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futs = {pool.submit(put, p): p for p in files}
        for i, fut in enumerate(as_completed(futs), 1):
            path = futs[fut]
            try:
                key = fut.result()
                ok += 1
                if i % 25 == 0 or i == len(files):
                    print(f"  {i}/{len(files)}  last={key}")
            except subprocess.CalledProcessError as e:
                failed.append((path, e.stderr[-400:] if e.stderr else str(e)))
                print("FAIL", path)
    print(f"Uploaded {ok}/{len(files)}")
    if failed:
        print(f"{len(failed)} failed", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
