---
name: search-note
description: Search and query the knowledge base. Use when the user wants to find notes, check backlinks, browse categories, or view stats (e.g., "搜一下", "找一下", "有没有关于X的笔记", "search notes", "find note"). For creating notes, use write-note. For maintenance operations, use maintain-note.
---

You are a note-search skill. Query and explore the structured knowledge base with full-text search, wikilink traversal, and category browsing.

All paths below use the repository root as `NOTE_ROOT`. When running locally on macOS, this is `~/note/`. All scripts accept an optional `[NOTE_ROOT]` first argument to override the auto-detected root.

Search scope: all `*.md` files under `NOTE_ROOT`, excluding `.opencode/`, `.obsidian/`, `.git/`, `scripts/`, `favour-config/`, `blog/`, and `mihomo-config/` (special directories that are not part of the knowledge base).

## Search & Query Commands

### keyword — Search filenames and H1 titles

```bash
bash scripts/search.sh keyword <term>
```

Matches note filenames and first-line H1 titles against the term (case-insensitive). Use when the user remembers a topic name but not the exact file.

### text — Full-text regex search

```bash
bash scripts/search.sh text <pattern>
```

Full-text regex search across all markdown notes. Use for content-based queries like "find all notes mentioning GPU memory".

### tag — Search by Obsidian tag

```bash
bash scripts/search.sh tag <tag>
```

Find notes containing a specific `#tag`. The `#` prefix is optional.

### link — Find notes linking TO a file

```bash
bash scripts/search.sh link <filename>
```

Find all notes that contain `[[filename]]`. Useful for understanding what references a given note.

### backlinks — Find notes linked FROM a file

```bash
bash scripts/search.sh backlinks <filename>
```

List all outgoing `[[wikilinks]]` from a given note. Shows what the note references.

### category — List notes under a category path

```bash
bash scripts/search.sh category <path>
```

List all notes under a category (e.g., `知识/RL`, `项目/myproject`). Excludes `index.md`.

### recent — Recently modified notes

```bash
bash scripts/search.sh recent [N]
```

List the N most recently modified notes (default 20). Good for "what's new" overviews.

### stats — Knowledge base statistics

```bash
bash scripts/search.sh stats
```

Overview: total notes, notes per category, orphan count, stale count, last maintenance date.

## Quick Reference

| User says | Command |
|-----------|---------|
| "搜一下 X" / "找关于X的笔记" | `search.sh keyword X` or `search.sh text "X"` |
| "X和Y有什么关联" | `search.sh link X` + `search.sh backlinks X` |
| "知识/RL下有什么" | `search.sh category 知识/RL` |
| "最近改了什么" | `search.sh recent` |
| "知识库概况" | `search.sh stats` |

## Output

After performing the search, report briefly:

- **action**: what search was performed
- **results**: summary of findings
- **errors**: any issues encountered

Do NOT output the full content of searched notes unless the user asks for it.
