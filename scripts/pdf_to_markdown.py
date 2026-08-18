#!/usr/bin/env python3
"""Convert Grade 12 MoE PDFs into chapter markdown (and page images when scanned)."""

from __future__ import annotations

import glob
import json
import os
import re
import sys
from pathlib import Path

import pymupdf
import pymupdf4llm
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = ROOT / "content/textbooks/grade-12"
OUT_ROOT = ROOT / "content/textbooks/md/grade-12"

PICTURE_BLOCK = re.compile(
    r"<!-- Start of picture text -->.*?<!-- End of picture text -->",
    re.S,
)
RUNNING_HEADER = re.compile(
    r"^(CHEMISTRY GRADE 12|PHYSICS GRADE 12|UNIT \d+|CONTENTS?|Content)\s*$",
    re.I,
)

# printed-page start of each unit (from the book's own TOC)
TEXT_BOOKS = {
    "chemistry": {
        "title": "Grade 12 Chemistry Student Textbook",
        "units": [
            (1, "Acid-Base Equilibria", 1),
            (2, "Electrochemistry", 57),
            (3, "Industrial Chemistry", 136),
            (4, "Polymers", 214),
            (5, "Introduction to Environmental Chemistry", 241),
        ],
        "printed_on_pdf": {1: 9},  # printed page 1 is PDF page 9 (1-based)
    },
    "physics": {
        "title": "Grade 12 Physics Student Textbook",
        "units": [
            (1, "Application of Physics in Other Fields", 1),
            (2, "Two-Dimensional Motion", 24),
            (3, "Fluid Mechanics", 69),
            (4, "Electromagnetism", 117),
            (5, "Basics of Electronics", 142),
        ],
        "printed_on_pdf": {1: 7},
    },
}

SCANNED_BOOKS = {
    "mathematics": {
        "title": "Grade 12 Mathematics Student Textbook",
        "units": [
            (1, "Sequences and Series", 1),
            (2, "Introduction to Calculus", 61),
            (3, "Statistics", 159),
            (4, "Introduction to Linear Programming", 237),
            (5, "Mathematical Applications in Business", 303),
        ],
        "printed_on_pdf": {1: 11},
    },
    "biology": {
        "title": "Grade 12 Biology Student Textbook",
        # Fallback: split into even page ranges if TOC OCR is skipped.
        "units": [
            (1, "Unit 1", 1),
            (2, "Unit 2", 70),
            (3, "Unit 3", 140),
            (4, "Unit 4", 210),
            (5, "Unit 5", 280),
        ],
        "printed_on_pdf": {1: 11},
    },
}


def find_pdf(subject: str) -> Path:
    matches = sorted(PDF_DIR.glob(f"*grade-12-{subject}*.pdf"))
    if not matches:
        raise FileNotFoundError(f"No PDF for {subject} in {PDF_DIR}")
    return matches[0]


def pdf_page_for_printed(printed: int, printed_on_pdf: dict[int, int]) -> int:
    base_printed, base_pdf = next(iter(printed_on_pdf.items()))
    return base_pdf + (printed - base_printed)


def slugify(n: int, title: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return f"{n:02d}-{s[:48]}"


def clean_markdown(md: str) -> str:
    md = PICTURE_BLOCK.sub("", md)
    md = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", md)
    md = md.replace("\u0000", "")
    lines = []
    for line in md.splitlines():
        stripped = line.strip()
        if RUNNING_HEADER.match(stripped):
            continue
        if re.fullmatch(
            r"(\*\*)?(CHEMISTRY|PHYSICS|BIOLOGY|MATHEMATICS) GRADE 12(\*\*)?",
            stripped,
            re.I,
        ):
            continue
        if re.fullmatch(r"\d+\s+UNIT \d+", stripped, re.I):
            continue
        if re.fullmatch(r"\d{1,3}", stripped):
            continue
        line = re.sub(r"^(\s*)-\s*\)\s+", r"\1- ", line)
        line = re.sub(r"^(\s*)\)\s+", r"\1- ", line)
        lines.append(line)
    text = "\n".join(lines)
    text = re.sub(r"\n{4,}", "\n\n\n", text)
    return text.strip() + "\n"


def convert_text_book(subject: str, spec: dict) -> dict:
    pdf = find_pdf(subject)
    doc = pymupdf.open(pdf)
    n_pages = doc.page_count
    doc.close()

    out_dir = OUT_ROOT / subject
    chap_dir = out_dir / "chapters"
    chap_dir.mkdir(parents=True, exist_ok=True)

    units = spec["units"]
    chapters = []
    for i, (num, title, printed_start) in enumerate(units):
        printed_end = units[i + 1][2] - 1 if i + 1 < len(units) else 10_000
        pdf_start = pdf_page_for_printed(printed_start, spec["printed_on_pdf"])
        if i + 1 < len(units):
            pdf_end = pdf_page_for_printed(printed_end + 1, spec["printed_on_pdf"]) - 1
        else:
            pdf_end = n_pages
        pdf_start = max(1, min(pdf_start, n_pages))
        pdf_end = max(pdf_start, min(pdf_end, n_pages))
        pages = list(range(pdf_start - 1, pdf_end))  # 0-based for pymupdf4llm
        print(f"  {subject} unit {num}: PDF {pdf_start}-{pdf_end} ({title})")
        raw = pymupdf4llm.to_markdown(str(pdf), pages=pages)
        body = clean_markdown(raw)
        slug = slugify(num, title)
        header = f"# Unit {num}: {title}\n\n"
        (chap_dir / f"{slug}.md").write_text(header + body, encoding="utf-8")
        chapters.append(
            {
                "id": slug,
                "number": num,
                "title": title,
                "format": "markdown",
                "bytes": (chap_dir / f"{slug}.md").stat().st_size,
            }
        )

    index = {
        "subject": subject,
        "grade": 12,
        "title": spec["title"],
        "format": "markdown",
        "source": "MoE new curriculum student textbook",
        "chapters": chapters,
    }
    (out_dir / "index.json").write_text(json.dumps(index, indent=2) + "\n", encoding="utf-8")
    return index


def page_to_webp(page: pymupdf.Page, dest: Path, max_width: int = 960, quality: int = 52) -> None:
    rect = page.rect
    scale = min(2.0, max_width / max(rect.width, 1))
    pix = page.get_pixmap(matrix=pymupdf.Matrix(scale, scale), alpha=False)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "WEBP", quality=quality, method=4)


def convert_scanned_book(subject: str, spec: dict) -> dict:
    pdf = find_pdf(subject)
    doc = pymupdf.open(pdf)
    n_pages = doc.page_count
    out_dir = OUT_ROOT / subject
    pages_dir = out_dir / "pages"
    chap_dir = out_dir / "chapters"
    pages_dir.mkdir(parents=True, exist_ok=True)
    chap_dir.mkdir(parents=True, exist_ok=True)

    units = spec["units"]
    chapters = []
    for i, (num, title, printed_start) in enumerate(units):
        pdf_start = pdf_page_for_printed(printed_start, spec["printed_on_pdf"])
        if i + 1 < len(units):
            next_pdf = pdf_page_for_printed(units[i + 1][2], spec["printed_on_pdf"])
            pdf_end = next_pdf - 1
        else:
            pdf_end = n_pages
        pdf_start = max(1, min(pdf_start, n_pages))
        pdf_end = max(pdf_start, min(pdf_end, n_pages))
        slug = slugify(num, title)
        md_lines = [f"# Unit {num}: {title}", ""]
        page_files = []
        print(f"  {subject} unit {num}: rasterizing PDF {pdf_start}-{pdf_end} ({title})")
        for pno in range(pdf_start, pdf_end + 1):
            fname = f"p{pno:03d}.webp"
            dest = pages_dir / fname
            if not dest.exists() or dest.stat().st_size < 1000:
                page_to_webp(doc[pno - 1], dest)
            md_lines.append(f"![Page {pno}](pages/{fname})")
            md_lines.append("")
            page_files.append(fname)
        (chap_dir / f"{slug}.md").write_text("\n".join(md_lines).rstrip() + "\n", encoding="utf-8")
        chapters.append(
            {
                "id": slug,
                "number": num,
                "title": title,
                "format": "pages",
                "pdfPageStart": pdf_start,
                "pdfPageEnd": pdf_end,
                "pages": page_files,
            }
        )
    doc.close()

    index = {
        "subject": subject,
        "grade": 12,
        "title": spec["title"],
        "format": "pages",
        "source": "MoE new curriculum student textbook",
        "note": "This edition is image-based. Pages are compressed for online reading; one page loads at a time.",
        "chapters": chapters,
    }
    (out_dir / "index.json").write_text(json.dumps(index, indent=2) + "\n", encoding="utf-8")
    return index


def main() -> int:
    subjects = sys.argv[1:] or ["mathematics", "chemistry", "physics", "biology"]
    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    for subject in subjects:
        print(f"\n=== {subject} ===")
        if subject in TEXT_BOOKS:
            convert_text_book(subject, TEXT_BOOKS[subject])
        elif subject in SCANNED_BOOKS:
            convert_scanned_book(subject, SCANNED_BOOKS[subject])
        else:
            print(f"Unknown subject {subject}", file=sys.stderr)
            return 1
    print("\nDone. Output:", OUT_ROOT)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
