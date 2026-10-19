---
name: maintain-note
description: Maintain the knowledge base — merge, split, rename, tag stale notes, fix orphans, and run incremental maintenance. Use when the user says "维护一下", "合并笔记", "拆分笔记", "重命名笔记", "标注过时", or when maintenance is needed. For searching notes, use search-note. For creating notes, use write-note.
---

You are a note-maintenance skill. Keep the knowledge base healthy by fixing orphans, merging duplicates, splitting oversized notes, renaming files with wikilink propagation, and tagging stale content.

All paths below use the repository root as `NOTE_ROOT`. When running locally on macOS, this is `~/note/`. All scripts accept an optional `[NOTE_ROOT]` first argument to override the auto-detected root.

Maintenance scope: all `*.md` files under `NOTE_ROOT`, excluding `.opencode/`, `.obsidian/`, `.git/`, `scripts/`, `favour-config/`, `blog/`, and `mihomo-config/` (special directories that are not part of the knowledge base).

## Directory Structure Reference

All maintenance operations must respect the knowledge base directory conventions:

- **讨论类**: `讨论/YYYYMMDD/<filename>.md` — 日期目录，kebab-case 文件名
- **知识类**: `知识/<领域>/<二级分类>/<filename>.md` — 中文目录，kebab-case 文件名
- **配置类**: `配置记录/<软件名>-config-<yymmdd>.md` — 固定命名格式
- **项目类**: `项目/<项目名>/<filename>.md` — 中文目录，kebab-case 文件名
- **代码类**: `代码/<项目名>/<files>` — 中文目录，kebab-case 项目名，含完整项目文件 + README.md
- **日记类**: `日记/YYYY-MM/YYYY-MM-DD.md` — 月份子目录，ISO 日期文件名；`日记/index.md` 按月索引，模板为 `日记/template-daily.md`

目录名用中文，文件名用英文 kebab-case。一级分类为 讨论/知识/配置记录/项目/代码/日记。

日记类为时间线性质：按天追加、不去重、不参与陈旧度标记；日期命名文件（`YYYY-MM-DD`）已在排重检测中排除，不会互相误报为重复。

以下根目录为特殊目录，不纳入维护范围：`favour-config/`（skill 管理）、`scripts/`（脚本）、`blog/`（博客源码）、`mihomo-config/`（配置文件集合）。

## Rename

```bash
bash scripts/update.sh rename <old_stem> <new_stem>
```

Rename a note file and update all `[[wikilinks]]` across the entire knowledge base. Old and new names must differ. Renamed file stays in the same directory.

**rename 后必须额外执行**（脚本不自动处理）：

1. 读取该分类的 `index.md`
2. 将 `[[old-stem]]` 替换为 `[[new-stem]]`
3. 如果 index.md 中不存在该链接，在正确分组下添加 `[[new-stem]]`

## Orphan 检测与修复

```bash
bash scripts/list_orphans.sh
```

Find notes with no incoming `[[wikilink]]` references.

### 修复流程

对每个 orphan，按以下步骤处理：

1. 读取该笔记内容，理解其主题
2. 按优先级找到最合适的父页面：
   - 同级 `index.md`（兄弟节点）
   - 父级主题 `index.md`
   - 领域级 `index.md`（如 `知识/index.md`）
   - 根 `index.md`（最后手段）
3. 在父页面的正确位置添加 `[[orphan-filename]]`：
   - 如果是 `index.md`：找到该笔记所属的 `## 二级分类` 段落下添加
   - 如果没有匹配的二级分类段，创建新的 `## 二级分类` 并添加
4. 如果找不到自然父页面，在 output 中报告，不要凭空造 hub

## 增量维护

```bash
bash scripts/maintain.sh plan    # Dry run — only show what would change
bash scripts/maintain.sh apply   # Execute changes and advance watermark
```

Maintenance steps:

1. Scan files newer than last maintenance watermark
2. Check orphan notes and add links by parent-page priority
3. Detect potential duplicates (shared name prefix in same directory)
4. Report stale knowledge notes (>90 days, not yet tagged)
5. In `apply` mode: tag stale notes and advance `.last-maintain` watermark

## 合并（merge）

When the user says "合并" or duplicate notes are found:

### 步骤

1. 确认要合并的文件列表，向用户确认范围
2. 读取所有待合并文件的内容
3. 选择保留的文件（选内容最完整的，或文件名最规范的）
4. 将其他文件的独特内容合并进保留文件，保留文件的已有结构不动
5. 在保留文件顶部添加合并来源: `> 合并自: [[old-a]], [[old-b]]`
6. 删除被合并的冗余文件
7. 更新 index.md：
   - 删除旧文件名的 `[[old-stem]]` 条目
   - 确认保留文件名的 `[[kept-stem]]` 条目存在
8. 更新所有引用旧文件名的 wikilink：将 `[[old-a]]` 替换为 `[[kept-stem]]`

### 命名规范

- 合并后的文件名必须是 kebab-case
- 如果原文件名都不理想，可以新建一个更好的文件名，但必须与目录中其他文件风格一致

## 拆分（sep）

When the user says "拆分" or a note exceeds 500 lines:

### 子文件命名约定

子文件名格式: `<parent-stem>-<sub-topic>.md`

例：原文件 `verl-guide.md` 拆分为 `verl-guide-installation.md`、`verl-guide-training.md`

### 步骤

1. 读取原笔记，识别子主题边界（H2/H3 标题）
2. 向用户确认拆分方案（哪些 H2/H3 成为独立文件）
3. 每个子主题创建独立文件：
   - 文件放在与原文件相同的目录下
   - H2 标题提升为 H1
   - H3 标题提升为 H2，依此类推
   - 顶部添加 `> 拆分自: [[parent-stem]]`
4. 原文件替换为摘要 + 子文件链接：
   ```markdown
   # Topic

   简短摘要（一两句话概括整体）。

   ## 子主题
   - [[parent-stem-sub-a]] — 子主题A的一句话描述
   - [[parent-stem-sub-b]] — 子主题B的一句话描述
   ```
5. 更新 index.md：在对应分组下添加各子文件的 `[[wikilink]]`
6. 检查其他笔记中对原文件的 `[[wikilink]]`——原文件仍存在，无需更新

## 配置类笔记纠错

配置类笔记（`配置记录/` 目录）记录软件/工具的实际配置状态，正文准确性至关重要。维护时发现过时/错误内容应主动修正，不能只追加 `## 更新` 段落而留下错误的旧内容。

### 纠错触发场景

| 场景 | 处理方式 |
|---|---|
| 参数值变更（端口、URL、密钥等） | 直接修改正文表格/代码块中的旧值 |
| 操作方法废弃（如 DB 操作 → API/config.json） | 废弃标注旧方法，添加新方法，在正文顶部记录操作准则 |
| 后端类型描述错误（如 vLLM → SGLang） | 直接修正正文描述 |
| Provider/服务增删 | 更新 Provider 列表表格、模型映射表 |
| 已废弃的 workaround | 废弃标注，指向替代方案 |

### 废弃标注方式

- `~~删除线~~` 标注已废弃的命令/方法
- `<!-- 已废弃：原因 -->` HTML 注释标注代码块
- 不直接删除（保留历史轨迹）

### 不需要修正的内容

- 最近 30 天内的 `## 更新 YYYY-MM-DD` 段落（更早的按"历史精简"处理）
- 踩坑记录保留历史，但标注是否已修复

### 历史精简

`## 更新` 段只保留最近 30 天，更早的：先提炼仍有效的结论进正文，再删除旧段；`~~删除线~~` / `<!-- 已废弃 -->` 的方法本身删除，避坑结论保留一句话。遗留问题 / 操作准则 / 已知坑 段落不动。精简前确保工作区已提交（git 为完整档案）。

### 主动检查

维护配置类笔记时，应主动检查以下内容是否与实际配置一致：
1. Provider/服务列表表格
2. 端口、URL、密钥等参数值
3. 调用方式/命令示例
4. 操作方法是否仍有效

## 陈旧度检测

```bash
bash scripts/update.sh tag-stale
```

Mark knowledge notes that haven't been updated in a long time:

- **Threshold**: Knowledge notes >90 days since last modification
- **Scope**: 仅 `知识/` 目录下的笔记（讨论类和配置类不标记）
- **Detection**: `find 知识/ -name "*.md" -not -name "index.md" -mtime +90`
- **Action**: Add `> [待验证] 内容可能过时，最后更新 YYYY-MM-DD` at the top
- **Skip**: 已有 `待验证` 标记的笔记不再重复标记
- **Never auto-delete or rewrite**: Only tag, let the user decide

## Quick Reference

| User says | Action |
|-----------|--------|
| "维护一下" | `maintain.sh plan` then `maintain.sh apply` |
| "合并笔记" | Merge flow — confirm scope, merge, clean index |
| "拆分笔记" | Split flow — confirm plan, create sub-files, rewrite parent |
| "重命名笔记" | `update.sh rename` + update index.md |
| "标注过时笔记" | `update.sh tag-stale` |
| "检查孤儿笔记" | `list_orphans.sh` + fix by parent-page priority |

## Output

After performing the requested action, report briefly:

- **action**: what was done (renamed / merged / split / tagged / orphan-fixed / etc.)
- **files_affected**: list of files created, modified, or deleted
- **index_updated**: which index.md files were updated and what changed
- **errors**: any issues encountered

Do NOT output the full content of modified notes.
