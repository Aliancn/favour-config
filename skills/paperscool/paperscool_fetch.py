#!/usr/bin/env python3
"""CLI helper for browsing papers from papers.cool (https://papers.cool).

Used by the ``paperscool`` skill (skills/paperscool/SKILL.md).

Commands
--------
venues       List all available venues and years.
list         List papers from a specific venue/year or arXiv category.
paper        Fetch details for a specific paper.
groups       List available groups for a venue.

Examples
--------
python3 .opencode/skills/paperscool/paperscool_fetch.py venues
python3 .opencode/skills/paperscool/paperscool_fetch.py list NeurIPS.2025
python3 .opencode/skills/paperscool/paperscool_fetch.py list NeurIPS.2025 --group Oral
python3 .opencode/skills/paperscool/paperscool_fetch.py list ICML.2025 --max 20
python3 .opencode/skills/paperscool/paperscool_fetch.py list cs.LG --max 15
python3 .opencode/skills/paperscool/paperscool_fetch.py paper 2604.24749
python3 .opencode/skills/paperscool/paperscool_fetch.py paper KurYdcCbjv@OpenReview
python3 .opencode/skills/paperscool/paperscool_fetch.py groups NeurIPS.2025
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
from html.parser import HTMLParser

_BASE = "https://papers.cool"
_UA = "paperscool-skill/1.0 (research-assistant)"
_DELAY = 1.5
_ARXIV_ID_RE = re.compile(r"^\d{4}\.\d{4,5}(v\d+)?$")
_OR_ID_RE = re.compile(r"^[A-Za-z0-9]+(?:@OpenReview)?$")

VENUES = {
    "AAAI": {
        "years": list(range(2016, 2027)),
        "full_name": "AAAI Conference on Artificial Intelligence",
        "type": "AI",
    },
    "ACL": {
        "years": list(range(2020, 2026)),
        "full_name": "Annual Meeting of the Association for Computational Linguistics",
        "type": "NLP",
    },
    "COLM": {
        "years": [2024, 2025],
        "full_name": "Conference on Language Modeling",
        "type": "NLP",
    },
    "COLT": {
        "years": list(range(2022, 2026)),
        "full_name": "Conference on Learning Theory",
        "type": "ML",
    },
    "CoRL": {
        "years": list(range(2022, 2025)),
        "full_name": "Conference on Robot Learning",
        "type": "Robotics",
    },
    "CVPR": {
        "years": list(range(2020, 2026)),
        "full_name": "Conference on Computer Vision and Pattern Recognition",
        "type": "CV",
    },
    "ECCV": {
        "years": [2020, 2022, 2024],
        "full_name": "European Conference on Computer Vision",
        "type": "CV",
    },
    "EMNLP": {
        "years": list(range(2020, 2026)),
        "full_name": "Conference on Empirical Methods in Natural Language Processing",
        "type": "NLP",
    },
    "ICCV": {
        "years": [2021, 2023, 2025],
        "full_name": "International Conference on Computer Vision",
        "type": "CV",
    },
    "ICLR": {
        "years": list(range(2020, 2027)),
        "full_name": "International Conference on Learning Representations",
        "type": "ML",
    },
    "ICML": {
        "years": list(range(2020, 2026)),
        "full_name": "International Conference on Machine Learning",
        "type": "ML",
    },
    "IJCAI": {
        "years": list(range(2020, 2026)),
        "full_name": "International Joint Conference on Artificial Intelligence",
        "type": "AI",
    },
    "INTERSPEECH": {
        "years": [2023, 2024],
        "full_name": "INTERSPEECH",
        "type": "Speech",
    },
    "IWSLT": {
        "years": list(range(2023, 2026)),
        "full_name": "International Workshop on Spoken Language Translation",
        "type": "NLP",
    },
    "MICCAI": {
        "years": [2023, 2024],
        "full_name": "International Conference on Medical Image Computing and Computer Assisted Intervention",
        "type": "Medical",
    },
    "MLSYS": {
        "years": list(range(2022, 2026)),
        "full_name": "Conference on Machine Learning and Systems",
        "type": "Systems",
    },
    "NAACL": {
        "years": [2022, 2024, 2025],
        "full_name": "Conference of the North American Chapter of the Association for Computational Linguistics",
        "type": "NLP",
    },
    "NDSS": {
        "years": [2024, 2025],
        "full_name": "Network and Distributed System Security Symposium",
        "type": "Security",
    },
    "NeurIPS": {
        "years": list(range(2020, 2026)),
        "full_name": "Conference on Neural Information Processing Systems",
        "type": "ML",
    },
    "OSDI": {
        "years": list(range(2022, 2025)),
        "full_name": "USENIX Symposium on Operating Systems Design and Implementation",
        "type": "Systems",
    },
    "UAI": {
        "years": list(range(2023, 2026)),
        "full_name": "Conference on Uncertainty in Artificial Intelligence",
        "type": "ML",
    },
    "USENIX-Fast": {
        "years": list(range(2023, 2026)),
        "full_name": "USENIX Conference on File and Storage Technologies",
        "type": "Systems",
    },
    "USENIX-Sec": {
        "years": list(range(2023, 2026)),
        "full_name": "USENIX Security Symposium",
        "type": "Security",
    },
}

ARXIV_CS_CATEGORIES = [
    ("cs.AI", "Artificial Intelligence"),
    ("cs.CL", "Computation and Language"),
    ("cs.CV", "Computer Vision and Pattern Recognition"),
    ("cs.LG", "Machine Learning"),
    ("cs.NE", "Neural and Evolutionary Computing"),
    ("cs.RO", "Robotics"),
    ("cs.IR", "Information Retrieval"),
    ("cs.CR", "Cryptography and Security"),
    ("cs.DC", "Distributed, Parallel, and Cluster Computing"),
    ("cs.HC", "Human-Computer Interaction"),
    ("cs.SE", "Software Engineering"),
    ("cs.DB", "Databases"),
    ("cs.MM", "Multimedia"),
    ("cs.GT", "Computer Science and Game Theory"),
    ("cs.MA", "Multiagent Systems"),
    ("cs.SI", "Social and Information Networks"),
    ("cs.CG", "Computational Geometry"),
    ("cs.AR", "Hardware Architecture"),
    ("cs.PL", "Programming Languages"),
    ("cs.DS", "Data Structures and Algorithms"),
    ("cs.FL", "Formal Languages and Automata Theory"),
    ("cs.CC", "Computational Complexity"),
    ("cs.ET", "Emerging Technologies"),
    ("cs.GR", "Graphics"),
    ("cs.MS", "Mathematical Software"),
    ("cs.NA", "Numerical Analysis"),
    ("cs.OS", "Operating Systems"),
    ("cs.PF", "Performance"),
    ("cs.SD", "Sound"),
    ("cs.SC", "Symbolic Computation"),
    ("cs.SY", "Systems and Control"),
]

ARXIV_OTHER_CATEGORIES = [
    ("stat.ML", "Machine Learning (Statistics)"),
    ("stat.AP", "Applications (Statistics)"),
    ("stat.CO", "Computation (Statistics)"),
    ("eess.AS", "Audio and Speech Processing"),
    ("eess.IV", "Image and Video Processing"),
    ("eess.SP", "Signal Processing"),
    ("math.OC", "Optimization and Control"),
    ("math.IT", "Information Theory"),
    ("q-bio.NC", "Neurons and Cognition"),
]


class _TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self._parts: list[str] = []
        self._skip = False

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "noscript"):
            self._skip = True
            return
        href = dict(attrs).get("href", "")
        if tag == "a" and href:
            if href.startswith("/venue/"):
                or_id = href.split("/venue/")[-1]
                self._parts.append(f" [link:{or_id}] ")
            elif href.startswith("/arxiv/"):
                aid = href.split("/arxiv/")[-1]
                self._parts.append(f" [link:{aid}] ")
            elif "openreview.net/forum?id=" in href:
                or_id = href.split("id=")[-1]
                self._parts.append(f" [or:{or_id}] ")
        if tag in ("br", "p", "div", "h1", "h2", "h3", "h4", "hr", "li", "tr"):
            self._parts.append("\n")

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript"):
            self._skip = False
        if tag in ("p", "div", "h1", "h2", "h3", "h4"):
            self._parts.append("\n")

    def handle_data(self, data):
        if not self._skip:
            self._parts.append(data)

    def get_text(self) -> str:
        return "".join(self._parts)


def _fetch(url: str, timeout: int = 30) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": _UA})
    for attempt in (1, 2):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError as exc:
            if exc.code == 429 and attempt == 1:
                time.sleep(5)
                continue
            raise
    raise RuntimeError(f"Failed to fetch {url} after retries")


def _to_text(html: str) -> str:
    ext = _TextExtractor()
    ext.feed(html)
    return ext.get_text()


def _parse_papers(text: str, max_n: int = 50) -> list[dict]:
    if "[or:" in text:
        entries = re.split(r"(?=\[or:)", text)
    else:
        entries = re.split(r"(?=\n\s*#\d+\s)", text)

    papers: list[dict] = []
    for entry in entries:
        num_m = re.search(r"#(\d+)", entry)
        if not num_m:
            continue
        paper: dict = {"number": int(num_m.group(1))}

        or_m = re.search(r"\[or:([^\]]+)\]", entry)
        if or_m:
            paper["openreview_id"] = or_m.group(1).strip()

        link_m = re.search(r"\[link:([^\]]+)\]", entry)
        if link_m:
            paper["paper_id"] = link_m.group(1).strip()

        title_m = re.search(r"\[link:[^\]]+\]\s*(.+?)(?:\n|\s*\[PDF)", entry)
        if title_m:
            paper["title"] = title_m.group(1).strip()
        else:
            after_hash = re.sub(r".*#\d+\s*", "", entry.split("\n")[0], count=1).strip()
            cleaned = re.sub(r"\s*\[(?:PDF|Copy|Kimi|REL|link|or)[^\]]*\]", "", after_hash).strip()
            if cleaned:
                paper["title"] = cleaned

        authors_m = re.search(r"Authors?:\s*\n?\s*(.+?)(?:\n\s*\n|\n\s*Subject|\n\s*Publish|\n\s*Subjects|\Z)", entry, re.DOTALL)
        if authors_m:
            raw = authors_m.group(1).strip()
            raw = re.sub(r"\s+", " ", raw)
            paper["authors"] = raw

        abstract_m = re.search(
            r"Authors?:.*?\n\s*\n\s*(.+?)(?:\n\s*\n\s*(?:Subject|Publish|Subjects)|\Z)",
            entry,
            re.DOTALL,
        )
        if not abstract_m:
            abstract_m = re.search(
                r"Authors?:.*?\n\s*(.+?)(?:\n\s*(?:Subject|Publish|Subjects))",
                entry,
                re.DOTALL,
            )
        if abstract_m:
            abstract = abstract_m.group(1).strip()
            abstract = re.sub(r"\s+", " ", abstract)
            paper["abstract"] = abstract[:600] + ("..." if len(abstract) > 600 else "")

        subject_m = re.search(r"Subject:\s*\n?\s*(.+?)(?:\n|$)", entry)
        if subject_m:
            raw = subject_m.group(1).strip()
            paper["subject"] = re.sub(r"\[link:[^\]]+\]\s*", "", raw).strip()

        subjects_m = re.search(r"Subjects:\s*\n?\s*(.+?)(?:\n|$)", entry)
        if subjects_m:
            raw = subjects_m.group(1).strip()
            raw = re.sub(r"\[link:[^\]]+\]\s*", "", raw).strip()
            raw = re.sub(r"\s*,\s*", ", ", raw)
            paper["subjects"] = raw

        publish_m = re.search(r"Publish:\s*(.+?)(?:\n|$)", entry)
        if publish_m:
            paper["publish_date"] = publish_m.group(1).strip()

        arxiv_m = re.search(r"(\d{4}\.\d{4,5})", entry)
        if arxiv_m:
            paper["arxiv_id"] = arxiv_m.group(1)

        if paper.get("title"):
            papers.append(paper)
        if len(papers) >= max_n:
            break

    return papers


def _parse_total(text: str) -> int | None:
    m = re.search(r"Total:\s*(\d+)", text)
    return int(m.group(1)) if m else None


def _parse_groups(html: str) -> list[str]:
    return list(set(re.findall(r"group=([^\"&]+)", html)))


def cmd_venues() -> list[dict]:
    result = []
    for name, info in VENUES.items():
        result.append(
            {
                "venue": name,
                "full_name": info["full_name"],
                "type": info["type"],
                "years": info["years"],
                "latest": max(info["years"]),
                "url": f"{_BASE}/venue/{name}",
            }
        )
    return result


def _is_arxiv_category(target: str) -> bool:
    if _ARXIV_ID_RE.match(target):
        return False
    parts = target.split(".")
    if len(parts) == 2 and parts[1].isdigit() and len(parts[1]) == 4:
        return False
    if len(parts) == 2 and parts[0].islower() and parts[1].islower():
        return True
    if "+" in target or "-" in target:
        return True
    known_prefixes = {"cs", "stat", "eess", "math", "q-bio", "q-fin", "physics", "cond-mat", "astro-ph", "hep", "nlin", "nucl", "gr-qc", "math-ph", "econ"}
    if parts[0].lower() in known_prefixes:
        return True
    return False


def cmd_list(target: str, group: str | None = None, max_n: int = 50) -> dict:
    is_arxiv = _is_arxiv_category(target)
    if is_arxiv:
        url = f"{_BASE}/arxiv/{urllib.parse.quote(target, safe='')}"
    else:
        url = f"{_BASE}/venue/{urllib.parse.quote(target, safe='')}"
        if group:
            url += f"?group={urllib.parse.quote(group, safe='')}"

    html = _fetch(url)
    text = _to_text(html)
    total = _parse_total(text)
    papers = _parse_papers(text, max_n)
    groups = _parse_groups(html) if not is_arxiv else []

    return {
        "target": target,
        "url": url,
        "total": total,
        "returned": len(papers),
        "groups": groups,
        "papers": papers,
    }


def cmd_paper(paper_id: str) -> dict:
    if _ARXIV_ID_RE.match(paper_id):
        url = f"{_BASE}/arxiv/{paper_id}"
    elif "@" in paper_id or _OR_ID_RE.match(paper_id):
        clean_id = paper_id.replace("@OpenReview", "")
        url = f"{_BASE}/venue/{clean_id}@OpenReview"
    else:
        url = f"{_BASE}/arxiv/{paper_id}"

    html = _fetch(url)
    text = _to_text(html)
    papers = _parse_papers(text, max_n=1)
    if papers:
        return {"url": url, **papers[0]}
    return {"url": url, "title": None, "error": "Could not parse paper details from page"}


def cmd_groups(venue_year: str) -> dict:
    url = f"{_BASE}/venue/{urllib.parse.quote(venue_year, safe='')}"
    html = _fetch(url)
    groups = _parse_groups(html)
    return {"venue": venue_year, "url": url, "groups": sorted(groups)}


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Browse papers from papers.cool.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("venues", help="List all available venues and years")

    lp = sub.add_parser("list", help="List papers from a venue/year or arXiv category")
    lp.add_argument("target", help="Venue.YEAR (e.g. NeurIPS.2025) or arXiv category (e.g. cs.LG)")
    lp.add_argument("--group", default=None, help="Filter by group/track (e.g. Oral, Poster)")
    lp.add_argument("--max", type=int, default=50, metavar="N", help="Max papers to return (default: 50)")

    pp = sub.add_parser("paper", help="Fetch details for a specific paper")
    pp.add_argument("id", help="arXiv ID (e.g. 2604.24749) or OpenReview ID (e.g. KurYdcCbjv)")

    gp = sub.add_parser("groups", help="List available groups for a venue")
    gp.add_argument("venue_year", help="Venue.YEAR (e.g. NeurIPS.2025)")

    ap = sub.add_parser("arxiv-categories", help="List arXiv categories available on papers.cool")

    return parser


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)

    if args.command == "venues":
        result = cmd_venues()
    elif args.command == "list":
        result = cmd_list(args.target, group=args.group, max_n=args.max)
    elif args.command == "paper":
        result = cmd_paper(args.id)
    elif args.command == "groups":
        result = cmd_groups(args.venue_year)
    elif args.command == "arxiv-categories":
        result = {
            "cs_categories": ARXIV_CS_CATEGORIES,
            "other_categories": ARXIV_OTHER_CATEGORIES,
        }
    else:
        raise ValueError(f"Unknown command: {args.command}")

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
