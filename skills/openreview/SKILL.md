---
name: openreview
description: Search and download conference papers from OpenReview (ICLR, NeurIPS, ICML, etc.). Use when user says "download ICLR paper", "openreview", "会议论文下载", or wants to find and save PDFs from OpenReview-hosted conferences.
argument-hint: [query-or-forum-id]
allowed-tools: Bash(*), Read, Write
---

# OpenReview Conference Paper Search & Download

Search topic or OpenReview forum ID: $ARGUMENTS

## Role & Positioning

This skill is the **conference paper download** counterpart to `/arxiv` (preprints) and `/semantic-scholar` (published papers):

| Skill | Source | Best for |
|-------|--------|----------|
| `/arxiv` | arXiv API | Latest preprints, direct PDF download by arXiv ID |
| `/semantic-scholar` | Semantic Scholar API | Published papers with citation data |
| `/paperscool` | papers.cool | Browsing conference proceedings by venue/year/track |
| `/openreview` | OpenReview API | **Downloading conference paper PDFs** (ICLR, NeurIPS, ICML) |

**Unique value**: OpenReview hosts the authoritative PDFs for major ML conferences (ICLR 2020-2026, NeurIPS 2023-2025, ICML 2023-2025). This skill can search by title/keywords, retrieve metadata, and **directly download the PDF** — no authentication required.

## Constants

- **PAPER_DIR** - Local directory to save downloaded PDFs. Default: `papers/` in the current project directory.
- **MAX_RESULTS = 10** - Default number of search results.
- **FETCH_SCRIPT** - `.opencode/skills/openreview/openreview_fetch.py` relative to the current project.

> Overrides (append to arguments):
> - `/openreview "LoongRL" - max: 20` - return up to 20 results
> - `/openreview "o29E01Q6bv" - download` - download a specific paper by forum ID
> - `/openreview "LoongRL" - download` - search by title and download the top result
> - `/openreview "query" - dir: topics/gr_kvcache/paper` - save PDFs to a custom directory
> - `/openreview "query" - download: all` - download PDFs for all results
> - `/openreview "query" - venue: "ICLR 2026"` - filter by venue

## Supported Venues

| Shortcut | Venue ID | Full Name |
|----------|----------|-----------|
| ICLR 2026 | ICLR.cc/2026/Conference | International Conference on Learning Representations |
| ICLR 2025 | ICLR.cc/2025/Conference | International Conference on Learning Representations |
| ICLR 2024 | ICLR.cc/2024/Conference | International Conference on Learning Representations |
| NeurIPS 2025 | NeurIPS.cc/2025/Conference | Conference on Neural Information Processing Systems |
| NeurIPS 2024 | NeurIPS.cc/2024/Conference | Conference on Neural Information Processing Systems |
| ICML 2025 | ICML.cc/2025/Conference | International Conference on Machine Learning |
| ICML 2024 | ICML.cc/2024/Conference | International Conference on Machine Learning |

> For venues not in the shortcut map, use `--venue-id` with the exact OpenReview venue ID (e.g. `ICLR.cc/2026/Conference`).

## Workflow

### Step 1: Parse Arguments

Parse `$ARGUMENTS` for directives:

- **Query or ID**: main search term or an OpenReview forum ID (e.g. `o29E01Q6bv`)
- **`- max: N`**: override MAX_RESULTS (e.g., `- max: 20`)
- **`- dir: PATH`**: override PAPER_DIR (e.g., `- dir: topics/gr_kvcache/paper`)
- **`- download`**: download the first result's PDF after listing
- **`- download: all`**: download PDFs for all results
- **`- venue: NAME`**: filter by venue shortcut (e.g., `ICLR 2026`)
- **`- venue-id: ID`**: filter by exact OpenReview venue ID

If the argument matches an OpenReview forum ID pattern (alphanumeric, 5+ chars, no spaces), skip search and go to Step 3.

### Step 2: Search OpenReview

Locate the fetch script — check these paths in order, use the first that exists:

1. `.opencode/skills/openreview/openreview_fetch.py` (project-local)
2. `~/.opencode/skills/openreview/openreview_fetch.py` (user-global)

```bash
SCRIPT=.opencode/skills/openreview/openreview_fetch.py
[ -f "$SCRIPT" ] || SCRIPT="$HOME/.opencode/skills/openreview/openreview_fetch.py"
```

If neither exists, stop and tell the user: "openreview_fetch.py not found. Please ensure `.opencode/skills/openreview/openreview_fetch.py` exists in the project."

Run the search:

```bash
python3 "$SCRIPT" search "QUERY" --max MAX_RESULTS
```

With venue filter:

```bash
python3 "$SCRIPT" search "QUERY" --max MAX_RESULTS --venue "ICLR 2026"
# or with exact venue ID:
python3 "$SCRIPT" search "QUERY" --max MAX_RESULTS --venue-id "ICLR.cc/2026/Conference"
```

Present results as a table:

```text
| # | Forum ID   | Title | Venue | arXiv ID | PDF |
|---|------------|-------|-------|----------|-----|
| 1 | o29E01Q6bv | LoongRL | ICLR 2026 Oral | - | [link](https://openreview.net/pdf?id=o29E01Q6bv) |
```

### Step 3: Fetch Paper Details

When a specific forum ID is requested:

```bash
python3 "$SCRIPT" paper FORUM_ID
```

Display:

```markdown
## [Title]

- **OpenReview**: https://openreview.net/forum?id={forum_id}
- **Venue**: [venue] ([venueid])
- **Authors**: [full author list]
- **Keywords**: [keywords]
- **Primary Area**: [primary_area]
- **Abstract**: [full abstract]
- **PDF**: https://openreview.net/pdf?id={forum_id}
- **arXiv**: [arXiv ID if available] — https://arxiv.org/abs/{arxiv_id}
- **Supplementary**: [supplementary URL if available]
```

### Step 4: Download PDFs

When download is requested, for each paper:

```bash
# By forum ID (fast, direct)
python3 "$SCRIPT" download FORUM_ID --dir PAPER_DIR

# By title (searches first, then downloads top match)
python3 "$SCRIPT" download "PAPER TITLE" --dir PAPER_DIR
```

After each download:

- Confirm file size > 10 KB (reject smaller files — likely an error HTML page)
- Add a 1-second delay between consecutive downloads to avoid rate limiting
- Report: `Downloaded: papers/o29E01Q6bv_LoongRL.pdf (830 KB)`

**File naming**: `{forum_id}_{title_slug}.pdf` (e.g. `o29E01Q6bv_LoongRL.pdf`)

### Step 5: Cross-reference with arXiv

For each paper found, check if an `arxiv_id` is available:

- If present → note that the paper also has an arXiv preprint. The OpenReview PDF is typically the **camera-ready/accepted version**, while arXiv may have a different version.
- If absent → the paper is **venue-only** on OpenReview. This is the only download path.

Suggest `/arxiv` only if the user specifically wants the arXiv version.

### Step 6: Final Output

Summarize what was done:

- `Found N papers for "query" [filtered by: venue]`
- `Downloaded: papers/o29E01Q6bv_LoongRL.pdf (830 KB)` (for each download)
- Any warnings (rate limit hit, file too small, already exists)

Suggest follow-up skills:

```text
/arxiv "topic"              - search arXiv preprints for related work
/paperscool ICLR.2026       - browse ICLR 2026 proceedings by track
/paper-reader "pdf_path"    - deep read a downloaded paper PDF
/research-lit "topic"       - multi-source literature review
```

## Key Rules

- **No authentication required**: OpenReview PDF downloads work without login for accepted/published papers.
- **OpenReview forum ID is the primary key**: Always show the forum ID — users need it for citations and direct access.
- **Rate limiting**: OpenReview allows ~100 requests per minute. Wait 1 second between consecutive PDF downloads.
- **Verify downloaded PDFs**: file must be > 10 KB; warn and delete if smaller.
- **Never overwrite existing PDFs**: skip and report "already exists".
- **Camera-ready vs arXiv**: Remind users that OpenReview PDFs are the accepted/camera-ready version, which may differ from arXiv preprints.
- **Not all conferences are on OpenReview**: This skill works for ICLR, NeurIPS, ICML, and a few others. For IEEE/ACM/Springer conferences, use `/semantic-solar` instead.
- **If the API is unreachable**, suggest using `/paperscool` or `/research-lit` with `- sources: web` as fallback.
