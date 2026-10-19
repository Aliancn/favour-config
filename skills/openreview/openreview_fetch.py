#!/usr/bin/env python3
"""CLI helper for searching and downloading papers from OpenReview.

Used by the ``openreview`` skill (skills/openreview/SKILL.md).

Commands
--------
search    Search OpenReview and print results as JSON.
paper     Fetch metadata for a specific paper by forum ID.
download  Download a paper PDF by forum ID or title.

Examples
--------
python3 .opencode/skills/openreview/openreview_fetch.py search "LoongRL" --max 5
python3 .opencode/skills/openreview/openreview_fetch.py search "long context" --venue "ICLR 2026" --max 10
python3 .opencode/skills/openreview/openreview_fetch.py paper o29E01Q6bv
python3 .opencode/skills/openreview/openreview_fetch.py download o29E01Q6bv --dir papers
python3 .opencode/skills/openreview/openreview_fetch.py download "LoongRL" --dir papers
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

_API_V2 = "https://api2.openreview.net"
_PDF_BASE = "https://openreview.net/pdf"
_UA = "openreview-skill/1.0 (research-assistant)"
_MIN_PDF_BYTES = 10_240
_VENUE_ID_MAP = {
    "ICLR 2026": "ICLR.cc/2026/Conference",
    "ICLR 2025": "ICLR.cc/2025/Conference",
    "ICLR 2024": "ICLR.cc/2024/Conference",
    "ICLR 2023": "ICLR.cc/2023/Conference",
    "NeurIPS 2025": "NeurIPS.cc/2025/Conference",
    "NeurIPS 2024": "NeurIPS.cc/2024/Conference",
    "NeurIPS 2023": "NeurIPS.cc/2023/Conference",
    "ICML 2025": "ICML.cc/2025/Conference",
    "ICML 2024": "ICML.cc/2024/Conference",
    "ICML 2023": "ICML.cc/2023/Conference",
}


def _get(path: str, params: dict | None = None, timeout: int = 30) -> dict:
    url = f"{_API_V2}{path}"
    if params:
        filtered = {k: v for k, v in params.items() if v is not None}
        if filtered:
            url += f"?{urllib.parse.urlencode(filtered)}"
    req = urllib.request.Request(url, headers={"User-Agent": _UA})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _extract_value(field):
    if isinstance(field, dict):
        return field.get("value", "")
    return field or ""


def _parse_note(note: dict) -> dict:
    c = note.get("content", {})
    title = _extract_value(c.get("title", ""))
    abstract = _extract_value(c.get("abstract", ""))
    authors = _extract_value(c.get("authors", []))
    if isinstance(authors, str):
        authors = [a.strip() for a in authors.split(",") if a.strip()]
    venue = _extract_value(c.get("venue", ""))
    venueid = _extract_value(c.get("venueid", ""))
    keywords = _extract_value(c.get("keywords", []))
    if isinstance(keywords, str):
        keywords = [k.strip() for k in keywords.split(",") if k.strip()]
    pdf_path = _extract_value(c.get("pdf", ""))
    primary_area = _extract_value(c.get("primary_area", ""))
    bibtex = _extract_value(c.get("_bibtex", ""))

    arxiv_id = None
    for key in c:
        val = _extract_value(c.get(key, ""))
        if isinstance(val, str) and "arxiv.org/abs/" in val:
            m = re.search(r"(\d{4}\.\d{4,5})", val)
            if m:
                arxiv_id = m.group(1)
                break
    if not arxiv_id and bibtex:
        m = re.search(r"arXiv:(\d{4}\.\d{4,5})", bibtex)
        if m:
            arxiv_id = m.group(1)
    if not arxiv_id and pdf_path and "arxiv.org" in pdf_path:
        m = re.search(r"(\d{4}\.\d{4,5})", pdf_path)
        if m:
            arxiv_id = m.group(1)

    forum_id = note.get("forum", note.get("id", ""))

    pdf_url = f"{_PDF_BASE}?id={forum_id}"
    if pdf_path and not pdf_path.startswith("http"):
        pdf_url = f"https://openreview.net{pdf_path}"
    elif pdf_path and "arxiv.org" in pdf_path:
        pdf_url = pdf_url

    return {
        "forum_id": forum_id,
        "title": title,
        "authors": authors if isinstance(authors, list) else [authors],
        "abstract": abstract[:500] + ("..." if len(abstract) > 500 else ""),
        "venue": venue,
        "venueid": venueid,
        "keywords": keywords if isinstance(keywords, list) else [keywords],
        "primary_area": primary_area,
        "arxiv_id": arxiv_id,
        "pdf_url": pdf_url,
        "openreview_url": f"https://openreview.net/forum?id={forum_id}",
    }


def search(
    query: str,
    max_results: int = 10,
    venue: str | None = None,
    venue_id: str | None = None,
) -> list[dict]:
    resolved_vid = venue_id or (_VENUE_ID_MAP.get(venue) if venue else None)
    search_query = query
    if resolved_vid:
        parts = resolved_vid.split("/")
        if len(parts) >= 2:
            search_query = f"{query} {parts[0]} {parts[1]}"

    params = {
        "query": search_query,
        "source": "forum",
        "limit": min(max_results * 3, 100),
    }

    data = _get("/notes/search", params)
    notes = data.get("notes", [])

    results = [_parse_note(n) for n in notes]
    if resolved_vid:
        results = [r for r in results if r.get("venueid") == resolved_vid]

    return results[:max_results]


def paper(forum_id: str) -> dict:
    data = _get("/notes", {"id": forum_id})
    notes = data.get("notes", [])
    if not notes:
        return {"error": f"Paper not found for ID: {forum_id}"}

    n = notes[0]
    c = n.get("content", {})

    result = _parse_note(n)
    abstract = _extract_value(c.get("abstract", ""))
    result["abstract"] = abstract
    result["authorids"] = _extract_value(c.get("authorids", []))
    if isinstance(result["authorids"], str):
        result["authorids"] = [result["authorids"]]

    supp = _extract_value(c.get("supplementary_material", ""))
    if supp:
        result["supplementary_url"] = f"https://openreview.net{supp}"

    return result


def _looks_like_forum_id(value: str) -> bool:
    if not re.match(r"^[A-Za-z0-9]{5,}$", value):
        return False
    has_digit = any(c.isdigit() for c in value)
    has_letter = any(c.isalpha() for c in value)
    return has_digit and has_letter


def _resolve_forum_id(identifier: str) -> str | None:
    if _looks_like_forum_id(identifier):
        return identifier
    results = search(identifier, max_results=3)
    if results:
        for r in results:
            if r["title"].lower() == identifier.lower():
                return r["forum_id"]
        return results[0]["forum_id"]
    return None


def download(identifier: str, output_dir: str = "papers") -> dict:
    forum_id = _resolve_forum_id(identifier)
    if not forum_id:
        return {"error": f"Could not find paper for: {identifier}"}

    meta = paper(forum_id)
    if "error" in meta:
        return meta

    title_slug = re.sub(r"[^\w\s-]", "", meta["title"])[:60].strip().replace(" ", "_")
    safe_name = f"{forum_id}_{title_slug}"
    dest_dir = Path(output_dir)
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / f"{safe_name}.pdf"

    if dest.exists():
        return {
            "forum_id": forum_id,
            "title": meta["title"],
            "path": str(dest),
            "size_kb": dest.stat().st_size // 1024,
            "skipped": True,
        }

    pdf_url = f"{_PDF_BASE}?id={forum_id}"
    req = urllib.request.Request(pdf_url, headers={"User-Agent": _UA})

    for attempt in (1, 2):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = resp.read()
            break
        except urllib.error.HTTPError as exc:
            if exc.code == 429 and attempt == 1:
                time.sleep(5)
                continue
            raise
    else:
        raise RuntimeError(f"Failed to download {pdf_url} after retries")

    if len(data) < _MIN_PDF_BYTES:
        raise ValueError(
            f"Downloaded file is only {len(data)} bytes - likely an error page, not a PDF"
        )

    dest.write_bytes(data)
    return {
        "forum_id": forum_id,
        "title": meta["title"],
        "path": str(dest),
        "size_kb": len(data) // 1024,
        "arxiv_id": meta.get("arxiv_id"),
        "skipped": False,
    }


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Search and download papers from OpenReview.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    sub = parser.add_subparsers(dest="command", required=True)

    sp = sub.add_parser("search", help="Search OpenReview papers")
    sp.add_argument("query", help="Search query (paper title or keywords)")
    sp.add_argument("--max", type=int, default=10, metavar="N", help="Max results (default: 10)")
    sp.add_argument("--venue", default=None, help='Filter by venue name, e.g. "ICLR 2026"')
    sp.add_argument("--venue-id", default=None, help='Filter by venue ID, e.g. "ICLR.cc/2026/Conference"')

    pp = sub.add_parser("paper", help="Fetch metadata for a specific paper")
    pp.add_argument("id", help="OpenReview forum ID (e.g. o29E01Q6bv)")

    dp = sub.add_parser("download", help="Download a paper PDF")
    dp.add_argument("id", help="OpenReview forum ID or paper title")
    dp.add_argument("--dir", default="papers", metavar="DIR", help="Output directory (default: papers)")
    dp.add_argument("--delay", type=float, default=1.0, help="Seconds to sleep after download (default: 1.0)")

    vp = sub.add_parser("venues", help="List supported venue shortcuts")

    return parser


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)

    if args.command == "search":
        results = search(args.query, max_results=args.max, venue=args.venue, venue_id=args.venue_id)
        print(json.dumps(results, ensure_ascii=False, indent=2))
        return 0

    if args.command == "paper":
        result = paper(args.id)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0

    if args.command == "download":
        result = download(args.id, output_dir=args.dir)
        if result.get("skipped"):
            print(json.dumps({**result, "message": "already exists, skipped"}, ensure_ascii=False))
        else:
            time.sleep(args.delay)
            print(json.dumps(result, ensure_ascii=False))
        return 0

    if args.command == "venues":
        venues = [{"shortcut": k, "venueid": v} for k, v in sorted(_VENUE_ID_MAP.items())]
        print(json.dumps(venues, ensure_ascii=False, indent=2))
        return 0

    raise ValueError(f"Unsupported command: {args.command}")


if __name__ == "__main__":
    sys.exit(main())
