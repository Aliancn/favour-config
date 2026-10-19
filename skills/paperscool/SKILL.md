---
name: paperscool
description: Browse and search conference/journal papers from papers.cool. Use when user says "browse conference papers", "search venue", "papers.cool", "顶会论文", "浏览会议论文", or wants to find papers from specific AI/ML conferences (NeurIPS, ICML, ICLR, ACL, CVPR, AAAI, etc.) organized by year and track.
argument-hint: [venue-or-category-or-paper-id]
allowed-tools: Bash(*), Read, Write
---

# Cool Papers - Conference & Venue Paper Browser

Search venue, category, or paper ID: $ARGUMENTS

## Role & Positioning

This skill is the **conference proceedings** browser, complementing `/arxiv` (preprints) and `/semantic-scholar` (published papers):

| Skill | Source | Best for |
|-------|--------|----------|
| `/arxiv` | arXiv API | Latest preprints, cutting-edge unrefereed work |
| `/semantic-scholar` | Semantic Scholar API | Published journal/conference papers with citation data |
| `/paperscool` | papers.cool | **Conference proceedings** organized by venue, year, and track (Oral/Poster/etc.) |

**Unique value**: papers.cool manually curates conference papers from 23+ top venues (NeurIPS, ICML, ICLR, ACL, CVPR, AAAI, etc.) with per-track filtering, OpenReview links, and Kimi AI summaries. This data is NOT available from arXiv or Semantic Scholar.

## Constants

- **FETCH_SCRIPT** — `.opencode/skills/paperscool/paperscool_fetch.py` relative to the project root.
- **MAX_RESULTS = 20** — Default number of papers to list.
- **PAPER_DIR** — Directory to save PDFs, default: `papers/` in the current project.

> Overrides (append to arguments):
> - `/paperscool NeurIPS.2025 - group: Oral` — filter by track/group
> - `/paperscool ICML.2025 - max: 50` — return up to 50 papers
> - `/paperscool cs.LG` — browse latest arXiv cs.LG papers
> - `/paperscool 2604.24749` — fetch a specific paper by arXiv ID
> - `/paperscool KurYdcCbjv` — fetch a specific paper by OpenReview ID

## Venue Catalog

### Top ML/AI Conferences

| Venue | Full Name | Years | Type |
|-------|-----------|-------|------|
| NeurIPS | Conf. on Neural Information Processing Systems | 2020-2025 | ML |
| ICML | Int'l Conf. on Machine Learning | 2020-2025 | ML |
| ICLR | Int'l Conf. on Learning Representations | 2020-2026 | ML |
| AAAI | AAAI Conf. on Artificial Intelligence | 2016-2026 | AI |
| UAI | Conf. on Uncertainty in AI | 2023-2025 | ML |
| COLT | Conf. on Learning Theory | 2022-2025 | ML |

### NLP Conferences

| Venue | Full Name | Years | Type |
|-------|-----------|-------|------|
| ACL | Assoc. for Computational Linguistics | 2020-2025 | NLP |
| EMNLP | Empirical Methods in NLP | 2020-2025 | NLP |
| NAACL | North American Chapter of ACL | 2022-2025 | NLP |
| COLM | Conf. on Language Modeling | 2024-2025 | NLP |
| IWSLT | Int'l Workshop on Spoken Language Translation | 2023-2025 | NLP |

### CV Conferences

| Venue | Full Name | Years | Type |
|-------|-----------|-------|------|
| CVPR | Computer Vision and Pattern Recognition | 2020-2025 | CV |
| ICCV | Int'l Conf. on Computer Vision | 2021-2025 | CV |
| ECCV | European Conf. on Computer Vision | 2020-2024 | CV |

### Robotics & Speech

| Venue | Full Name | Years | Type |
|-------|-----------|-------|------|
| CoRL | Conf. on Robot Learning | 2022-2024 | Robotics |
| INTERSPEECH | INTERSPEECH | 2023-2024 | Speech |

### Systems & Security

| Venue | Full Name | Years | Type |
|-------|-----------|-------|------|
| MLSYS | Conf. on ML and Systems | 2022-2025 | Systems |
| OSDI | USENIX OSDI | 2022-2024 | Systems |
| USENIX-Fast | USENIX File and Storage Technologies | 2023-2025 | Systems |
| NDSS | Network and Distributed System Security | 2024-2025 | Security |
| USENIX-Sec | USENIX Security Symposium | 2023-2025 | Security |

### Medical & Other

| Venue | Full Name | Years | Type |
|-------|-----------|-------|------|
| MICCAI | Medical Image Computing | 2023-2024 | Medical |
| IJCAI | Int'l Joint Conf. on AI | 2020-2025 | AI |

### arXiv Categories (also available)

Common CS/ML categories: `cs.AI`, `cs.CL`, `cs.CV`, `cs.LG`, `cs.NE`, `cs.RO`, `cs.IR`, `cs.CR`, `cs.DC`, `stat.ML`, `eess.AS`, `eess.IV`, `math.OC`

> Full list: run `python3 $SCRIPT arxiv-categories`

## Workflow

### Step 1: Parse Arguments

Parse `$ARGUMENTS` for directives:

- **Target**: venue+year (`NeurIPS.2025`), arXiv category (`cs.LG`), arXiv ID (`2604.24749`), or OpenReview ID (`KurYdcCbjv`)
- **`- group: TRACK`**: filter by track (e.g., `Oral`, `Poster`, `Spotlight`, `Machine Learning`)
- **`- max: N`**: override MAX_RESULTS

If the argument matches an arXiv ID pattern (`YYMM.NNNNN`), skip listing and go to Step 4.
If the argument matches a venue+year pattern (`VENUE.YEAR`), go to Step 3.
If the argument is an arXiv category, go to Step 3.
If the argument is `venues` or empty, go to Step 2.

### Step 2: List Available Venues

```bash
SCRIPT=.opencode/skills/paperscool/paperscool_fetch.py
[ -f "$SCRIPT" ] || SCRIPT="$HOME/.opencode/skills/paperscool/paperscool_fetch.py"
python3 "$SCRIPT" venues
```

Present results grouped by type (ML, NLP, CV, etc.) in a table:

```text
| Venue | Full Name | Latest | Years |
|-------|-----------|--------|-------|
| NeurIPS | Conf. on Neural Information Processing Systems | 2025 | 2020-2025 |
```

### Step 3: Browse Venue/Category Papers

```bash
python3 "$SCRIPT" list "TARGET" --max MAX_RESULTS [--group GROUP]
```

For venue pages, first check available groups if the user doesn't specify one:

```bash
python3 "$SCRIPT" groups "VENUE.YEAR"
```

Present results as a table:

```text
| # | Title | Authors | Track/Subject | arXiv ID |
|---|-------|---------|---------------|----------|
| 1 | Generalized Linear Mode Connectivity... | Theus et al. | NeurIPS.2025 - Oral | - |
```

For each paper, also note:
- **OpenReview link**: `https://openreview.net/forum?id={openreview_id}` (if available)
- **papers.cool link**: `https://papers.cool/venue/{paper_id}` or `https://papers.cool/arxiv/{arxiv_id}`
- **Track/Group**: from the `subject` field

If total papers exceed what's returned, note: "Showing N of TOTAL papers. Visit the URL for the full list."

### Step 4: Fetch Paper Details

When a specific paper ID is requested:

```bash
python3 "$SCRIPT" paper "PAPER_ID"
```

Display full details:

```markdown
## [Title]

- **Source**: papers.cool
- **Authors**: [full author list]
- **Track**: [subject/group]
- **Abstract**: [full abstract]
- **arXiv**: [arXiv ID if available] — https://arxiv.org/abs/{id}
- **OpenReview**: https://openreview.net/forum?id={openreview_id}
- **papers.cool**: https://papers.cool/venue/{paper_id}
- **Published**: [publish_date if available]
```

### Step 5: WebFetch Fallback

If the Python script fails (network error, parse error, etc.), use WebFetch as fallback:

- Venue page: `https://papers.cool/venue/VENUE.YEAR[?group=GROUP]`
- arXiv page: `https://papers.cool/arxiv/CATEGORY`
- Paper page: `https://papers.cool/arxiv/ID` or `https://papers.cool/venue/ID@OpenReview`
- Site search: Use the on-site search at `https://papers.cool/` (client-side)

### Step 6: Final Output

Summarize what was done:

- `Listed N papers from VENUE.YEAR [track: GROUP]`
- `Total papers in venue: TOTAL`
- `Available tracks: [track list]`

Suggest follow-up skills:

```text
/arxiv "topic"              - search arXiv preprints for related work
/semantic-scholar "topic"   - find published papers with citation data
/research-lit "topic"       - multi-source literature review
/paper-reader "pdf_path"    - deep read a specific paper PDF
```

## URL Patterns Reference

| Purpose | URL |
|---------|-----|
| Venue papers | `https://papers.cool/venue/VENUE.YEAR` |
| Venue with track | `https://papers.cool/venue/VENUE.YEAR?group=TRACK` |
| Venue feed (RSS) | `https://papers.cool/venue/VENUE/feed` |
| Venue latest feed | `https://papers.cool/venue/latest/feed` |
| arXiv category | `https://papers.cool/arxiv/CATEGORY` |
| arXiv category combo | `https://papers.cool/arxiv/cs.AI+cs.LG` |
| arXiv paper | `https://papers.cool/arxiv/PAPER_ID` |
| OpenReview paper | `https://papers.cool/venue/ID@OpenReview` |
| Historical date | `https://papers.cool/arxiv/CATEGORY?date=YYYY-MM-DD` |

## Key Rules

- **Venue format is `VENUE.YEAR`**: Always use this format (e.g., `NeurIPS.2025`, `ICML.2024`). Do NOT use just the venue name without a year.
- **Group/track filtering is powerful**: Many venues have 1000+ papers. Always suggest using `--group` to filter by track (Oral, Poster, Spotlight, etc.) or topic area.
- **Rate limiting**: Wait at least 1.5 seconds between consecutive requests to papers.cool. The site has anti-scraping measures.
- **Lazy loading**: The site uses lazy loading — only the first ~25-50 papers are in the initial HTML. For large venues, inform users that they can visit the URL directly for the full list.
- **OpenReview IDs are primary for venue papers**: Conference papers on papers.cool are identified by their OpenReview forum ID, not arXiv ID. Always show the OpenReview link.
- **If the script fails, use WebFetch**: The Python script is the primary tool, but WebFetch provides a reliable fallback.
- **Do NOT duplicate arxiv skill functionality**: For searching arXiv by keyword, prefer `/arxiv`. This skill's value is browsing conference proceedings by venue/year/track.
