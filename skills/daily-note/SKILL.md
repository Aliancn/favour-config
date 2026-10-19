---
name: daily-note
description: Write daily journal notes to the knowledge base. Use when the user wants to log the day's events, thoughts, todos, or progress (e.g., "记日记", "今天记一下", "日志", "daily", "记一下今天的记录"). This skill runs in the main agent's context — no information loss from sub-agent summarization. It complements the write-note skill — daily-note is for lightweight daily capture, while write-note creates permanent, classified notes.
---

You are a daily journal skill. Append the day's content to a dated journal note in the knowledge base, keep `日记/index.md` up to date, and auto-link notes touched today.

Since this skill executes in the main agent's context, you have **full access to the entire conversation**. Use it to capture what happened today without asking the user to repeat themselves.

A journal is a chronological log plus an inbox. It does not replace formal notes: valuable content should later be promoted into 讨论/知识/配置记录 notes via the write-note skill.

## 目录结构

日记类（Type F）:

```
日记/YYYY-MM/YYYY-MM-DD.md
日记/index.md
日记/template-daily.md
```

- **Filename IS the ISO date**: `YYYY-MM-DD.md`, e.g. `2026-09-22.md`
- **Month subdirectory**: `YYYY-MM`, e.g. `日记/2026-09/`
- `日记/index.md` groups entries under `## YYYY-MM` month headings
- `日记/template-daily.md` is the in-vault copy of `hands/skill/daily-note/template.md`, used by Obsidian's Daily Notes plugin

## 写作流程

### Step 1: 解析日期

- Default: today, via `date +%Y-%m-%d`
- Support "昨天" (yesterday) and explicit dates for backfill, e.g. "补记一下 9 月 20 日的日志" → `2026-09-20`
- Resolve to a single `YYYY-MM-DD` before writing

### Step 2: 确保目录与文件

```bash
mkdir -p 日记/YYYY-MM
```

- If `日记/YYYY-MM/YYYY-MM-DD.md` is missing, create it from `hands/skill/daily-note/template.md`, replacing the `{{date}}` placeholder with the actual date
- If it exists, **READ it before editing**

### Step 3: 归类追加

Classify the content into these sections and append into the correct section with the Edit tool:

| Section | Content |
|---|---|
| `## 记录` | events, timeline, freeform log |
| `## 想法与学习` | ideas, learnings, links |
| `## 待办` | checklist items as `- [ ]` |
| `## 今日笔记` | wikilinks to that day's notes |
| `## 项目进展` | project progress |

Rules:

- **Never overwrite** existing content
- **Never append blindly at EOF** when the target section already exists; insert inside it
- If a section is missing, add it
- Leave empty sections empty (no placeholder text)

### Step 4: 自动关联今日笔记

Find notes touched today and add any missing `[[stem]]` links under `## 今日笔记`:

```bash
ls 讨论/YYYYMMDD/    # the day's discussion directory, e.g. 讨论/20260922/
find 知识 项目 -name '*.md' -not -name 'index.md' -newermt "YYYY-MM-DD" 2>/dev/null
```

- Also use full conversation context (notes created during this session)
- Exclude the `日记/` directory itself and `index.md` files
- Never duplicate a link already present in the section

### Step 5: 更新索引

1. Ensure `日记/index.md` exists (H1 `# 日记` plus a one-line intro); create it if missing
2. Find the `## YYYY-MM` month section; create it if missing
3. Add `- YYYY-MM-DD: [[YYYY-MM-DD]]` under the month heading
4. No duplicate lines

### Step 6: 汇报

Report per the `## Output` section below. Do NOT dump the full note content.

## 规则

- **语言跟随输入**: match the language of the content being journaled
- **Never overwrite historical content**; multiple calls on the same day = multiple appends
- **No dedup check**: a journal is a timeline, repeated mentions are fine
- Journal files are never stale-tagged
- **Promotion hint**: when journaled content has long-term value, proactively suggest promoting it into a formal note via the write-note skill
- **No emojis**
- **Optional backlink**: if a note was created/modified today and got linked from the journal, you may add `> 当日记录: [[YYYY-MM-DD]]` near its top (only if absent). This is optional, not required.

## Obsidian 集成

Compatible with Obsidian's core Daily Notes plugin. `.obsidian/daily-notes.json` uses:

- folder: `日记`
- format: `YYYY-MM/YYYY-MM-DD`
- template: `日记/template-daily`

So the calendar button creates the same skeleton as this skill.

## Output

After writing the journal, report briefly:

- **path**: file path written
- **action**: `created` | `appended`
- **summary**: one-line summary of content
- **index_updated**: whether `日记/index.md` was updated
- **cross_refs**: today's notes linked under `## 今日笔记`
- **errors**: any issues encountered (mkdir failure, missing template, etc.)

Do NOT output the full note content.
