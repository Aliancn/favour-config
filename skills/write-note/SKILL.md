---
name: write-note
description: Write structured markdown notes to the knowledge base. Use when the user requests to take notes, save knowledge, or persist discussion content (e.g., "记个笔记", "记录笔记", "write a note", "save a note", "把这个记下来"). This skill runs in the main agent's context — no information loss from sub-agent summarization. For searching or querying existing notes, use the search-note skill instead.
---

You are a note-writing skill. Create structured markdown notes in the knowledge base repository with classified directory structure, Obsidian `[[]]` bidirectional links, and proper index updates.

Since this skill executes in the main agent's context, you have **full access to the entire conversation**. Leverage this to capture nuances, implicit context, and details that would be lost in a sub-agent summary.

All paths below use the repository root as `NOTE_ROOT`. When running locally on macOS, this is `~/note/`. All scripts accept an optional `[NOTE_ROOT]` first argument to override the auto-detected root.

## Directory Structure

### Type A: 讨论类

```
讨论/YYYYMMDD/<filename>.md
```

- 一级目录: `讨论`
- 二级目录: 日期 `YYYYMMDD`
- 文件名: kebab-case 主题，如 `rl-deployment-issues.md`

### Type B: 知识类

```
知识/<领域>/<二级分类>/<filename>.md
```

- 一级目录: `知识`
- 二级目录: 领域（RL, LLM推理, 推荐系统, devops, 工具, 知识管理, etc.）
- 三级目录: 细分类型（原理, 工具, 系统, 论文, 工程实践, etc.）

### Type C: 配置类

```
配置记录/<软件名>-config-<yymmdd>.md
```

- 固定目录 `配置记录`，无二级目录
- 文件名格式固定: `<软件名>-config-<yymmdd>.md`

### Type D: 项目类

```
项目/<项目名>/<filename>.md
```

- 一级目录 `项目`，二级目录为项目名

### Type E: 代码类

```
代码/<项目名>/<files>
```

- 一级目录 `代码`，二级目录为项目名
- 存放可独立运行的代码项目（HTML 页面、脚本、工具等），非笔记
- 每个子目录包含完整的项目文件 + `README.md` 说明
- 部分项目部署到公网（如 alarik-me），部分仅本地使用（如 nav）

### Type F: 日记类

```
日记/YYYY-MM/YYYY-MM-DD.md
```

- 一级目录 `日记`，二级目录为月份 `YYYY-MM`，文件名为 ISO 日期
- 按天记录流水、想法、待办，并链接当天产出的笔记
- **日常流水记录由 `daily-note` skill 负责写入**；write-note 只在用户明确要求把日记内容提炼为正式笔记时介入
- 日记类不参与去重检查与陈旧度标记（时间线性质）

### Type G: 英语学习类

```
英语/<二级分类>/<filename>.md
```

- 一级目录 `英语`，二级目录为学习类型（收集, 精读, 视听, 写作, etc.）
- 记录英语学习材料（视频/文章/论文）的精读笔记与按日收集内容
- **语言例外**: 该目录笔记正文用英文撰写（释义、难点可加中文注释）——写作本身就是练习，不遵循"匹配输入语言"规则
- 收集笔记按天一个文件（`收集/YYYY-MM/YYYY-MM-DD.md`），同日追加，不做去重检查（时间线性质）；精读笔记同主题追加、不同主题新建

> 目录名用中文，文件名用英文 kebab-case。目前一级分类为 讨论/知识/配置记录/项目/代码/日记/英语，仅当内容无法归入时才新建一级分类。

### 特殊目录（不参与分类）

以下根目录下的目录不纳入笔记分类系统，写入笔记时不要使用：

- `hands/` — skill 同步管理（link.sh, registry.csv, SKILL.md 源文件）
- `scripts/` — 搜索/维护脚本
- `blog/` — Astro 博客项目源码（完整前端项目，非笔记）
- `mihomo-config/` — mihomo 配置文件集合（YAML/conf，非笔记）

## Naming & Language Rules

- **Filename**: 英文 kebab-case（e.g., `verl-transferqueue-guide.md`）
- **Language**: Match the language of the input
- **No emojis** unless explicitly requested

## Classification Flow

### Step 1: 判定笔记类型

| 判定条件 | 类型 | 侧重点 |
|----------|------|--------|
| 对话/讨论的总结 | 讨论类 | 过程、观点、结论 |
| 独立可复用的知识点 | 知识类 | 原理、方法、操作步骤 |
| 软件/工具的配置过程、参数、变更记录 | 配置类 | 配置文件、参数值、操作步骤 |
| 特定项目的开发记录、Bug修复、架构决策、PR | 项目类 | 项目名、具体变更、决策理由 |
| 可独立运行的代码项目（HTML、脚本、工具等） | 代码类 | 项目名、技术栈、部署方式 |
| 每日流水记录（做了什么、想法、待办） | 日记类（由 daily-note skill 写入） | 时间线、当天笔记链接 |
| 英语学习材料（视频/文章/论文）的词汇、精读笔记 | 英语类 | 词汇、精读、表达积累 |
| 混合内容 | 拆分为多条 | 每条按各自类型处理，互相 [[链接]] |
| 无法判断 | 知识类（默认） | 长期价值更高 |

### Step 2: 扫描并选择分类

Run `ls NOTE_ROOT/` to see existing categories, `ls NOTE_ROOT/<category>/` for subcategories.

- **优先复用已有分类**，仅当无匹配时新建
- 二级分类宜具体（便于浏览定位）
- 跨多个分类时，选最匹配 PRIMARY topic 的

### Step 3: 同主题去重检查（写入前必须执行）

使用 search-note 的搜索命令检查是否已有同主题笔记：

1. `bash scripts/search.sh keyword <关键词>` 按文件名和标题搜索
2. `bash scripts/search.sh text "<关键词>"` 全文内容搜索
3. 读取搜索结果判断是否与待写入内容重叠
4. **已有同类文件**:
   - 配置类: 在已有文件末尾追加 `## 更新 YYYY-MM-DD` 段落（列出变更内容、新参数值、执行的命令），不新建文件。**同时必须检查并修正正文中的过时/错误内容**（见下方"配置类笔记维护规则"）
   - 项目类/知识类: 若内容完全不同主题则新建；若是对同一主题的补充更新，追加到已有文件
5. **无同类文件**: 正常新建

### Step 4: 创建目录、写入、维护索引

1. 创建目标目录: `mkdir -p <path>`（若失败，在 output 中报告并停止）
2. 写入笔记文件
3. 维护 index.md（见 Index 维护规则）
4. 执行强制关联（见写入时强制关联步骤）

## Writing Rules

1. **Structure**:
   - H1 title with clear topic name
   - H2/H3 sections organized logically
   - ASCII diagrams for architecture/data flow
   - Markdown tables for comparisons and parameters
   - Code blocks with file path references
2. **Self-contained**: readable without conversation context
3. **Preserve details**: Keep all quantitative data
4. **Leverage full context**: Since you run in the main agent, capture nuances, implicit reasoning, and conversational context that would be lost in a summary

## Obsidian 双向链接

笔记间使用 `[[]]` wikilink 语法建立双向链接。

### 链接语法

- 引用其他笔记: `[[filename]]`（不含路径，不含 .md 后缀）
  - 例: `[[verl-transferqueue-guide]]`

### 父页面选择优先级

添加链接时，按以下顺序选择目标页面：

1. **同级 index.md**（兄弟节点）— 同目录下的 index
2. **父级主题 index.md** — 上一级领域的索引
3. **领域级 index.md** — 如 `知识/index.md`、`项目/index.md`
4. **根 `index.md`** — 最后手段

如果笔记已有明显的语义邻居（同类笔记聚集的页面），优先在那个页面加链接。

### 链接精简原则

- **优先质量而非数量；不重复链接同一笔记**
- **编辑窄幅**：通常一行 bullet 即可，不写大段导航
- **不加 TODO 占位**：不写 `<!-- TODO: link later -->`
- **无自然父页面时报告**：在 output 中说明，不要凭空造 hub

### 写入时强制关联步骤

新建笔记后，**必须执行**：

1. 从笔记 H1 标题和 H2 段落标题中提取 2-5 个核心名词作为关键词
2. 用 `bash scripts/search.sh text "关键词"` 搜索语义重叠的现有笔记
3. 在最相关的 1-3 个现有笔记中插入 `[[new-note-filename]]` 反向链接
4. 如果笔记跨多个分类，在次分类的 index.md `## 交叉引用` 段落下添加链接

### 交叉主题处理

当笔记涉及两个以上分类的主题时：

1. 在主分类的 index.md 中正常添加链接
2. 在次分类的 index.md `## 交叉引用` 段落下添加链接
3. 在 output 中注明添加了哪些交叉引用

### Index 维护规则

每个一级分类目录下维护 `index.md`，按二级分类分组列出所有笔记：

```markdown
# 分类名

简介。

## 二级分类A

- [[note-a]]
- [[note-b]]

## 交叉引用

- [[cross-topic-note]]
```

**写入新笔记后必须**:

1. 读取对应的 index.md（如不存在，创建含 H1 标题的空 index.md）
2. 在正确分组下添加 `[[filename]]` 链接
3. 如果是新二级分类，创建新的 `## 二级分类` 段落

## 来源追踪

每条笔记可选在末尾添加 `## 来源` 段，记录信息出处：

- **知识类**: 论文标题/链接、官方文档URL、讨论来源笔记
- **项目类**: 关联的 PR URL、issue URL、commit hash
- **讨论类**: 对话上下文关键词、参与讨论的笔记
- **配置类**: 官方配置文档链接、变更原因

格式：
```markdown
## 来源

- 论文: [Title](url)
- 相关笔记: [[related-note]]
- PR: #123
```

仅在有明确出处时添加，不强制每条笔记都有。

## 摘要层

当用户请求创建摘要，或发现 3+ 条笔记跨不同分类围绕同一主题时，在 `知识/摘要/` 下创建摘要页：

- **摘要页内容**: 综合各笔记的核心观点，`## Sources` 段列出来源笔记
- **格式**:
  ```markdown
  # 主题名

  跨领域综合摘要。

  ## 要点

  - 来自 [[note-a]] 的观点
  - 来自 [[note-b]] 的观点

  ## Sources

  - [[note-a]] — 知识/RL/原理/
  - [[note-b]] — 知识/推荐系统/原理/
  ```
- **反向链接**: 在被摘要的各笔记中添加 `> 摘要: [[digest-filename]]`
- **index 维护**: 在 `知识/index.md` 的 `## 摘要` 段落下添加链接

## 非 Markdown 源支持

当用户提供的来源是 .pdf / .html / .htm 文件时：

1. 用 `read` 工具提取文件内容（文本型 PDF）
2. 生成对应的摘要笔记，存入对应分类目录
3. 在 `## 来源` 段记录原始文件路径：
   ```markdown
   ## 来源

   - 文件: /path/to/source.pdf
   - 类型: PDF
   ```
4. 不移动或修改原始文件

## 追加内容到已有笔记

```bash
bash scripts/update.sh append <file> "<content>"
```

Append content to an existing note. The file can be specified by relative path or filename stem.

## 新建配置类笔记

当需要为某个软件/工具创建新的配置笔记时（即尚无对应的 `配置记录/<软件名>-config-*.md`）：

```bash
bash scripts/update.sh config <software> "<content>"
```

此命令会自动创建 `配置记录/<软件名>-config-<yymmdd>.md` 并写入内容。若已有同类文件，则追加 `## 更新 YYYY-MM-DD` 段落。

## 配置类笔记维护规则

配置类笔记记录软件/工具的实际配置状态，正文准确性至关重要。追加更新时**必须同时修正正文**，不能只追加新段落而留下错误的旧内容。

### 追加 + 修正

每次更新配置时：
1. 追加 `## 更新 YYYY-MM-DD` 段落记录变更内容
2. **同时检查并修正正文中的过时/错误内容**

### 就地修正

发现正文中的信息与当前实际配置不符时，直接修改正文对应段落（表格、命令、参数值等），不保留错误信息。

### 废弃标注

对已废弃但仍有参考价值的操作方法（如旧版命令、已废弃的 workaround），用 `~~删除线~~` 或 `<!-- 已废弃：原因 -->` 注释标注，不要直接删除（保留历史轨迹）。

### 表格同步

Provider 列表、端口表、调用方式表等结构化信息必须与当前配置一致，发现不一致立即修正。

### 操作准则

如果操作方式发生根本变化（如从 DB 操作改为 config.json），在正文顶部添加"操作准则"section 固化新规则。

### 需要修正的场景

| 场景 | 处理方式 |
|---|---|
| 参数值变更（端口、URL、密钥等） | 直接修改正文表格/代码块中的旧值 |
| 操作方法废弃（如 DB 操作 → API/config.json） | 废弃标注旧方法，添加新方法，记录准则 |
| 后端类型描述错误（如 vLLM → SGLang） | 直接修正正文描述 |
| Provider/服务增删 | 更新 Provider 列表表格、模型映射表 |
| 已废弃的 workaround | 废弃标注，指向替代方案 |

### 不需要修正的内容

- 最近 30 天内的 `## 更新 YYYY-MM-DD` 段落（更早的按"历史精简"处理）
- 踩坑记录（保留历史，但标注是否已修复）

### 历史精简

`## 更新` 段只保留最近 30 天，更早的先提炼（仍有效的结论吸收进正文）再删除；`~~删除线~~` / `<!-- 已废弃 -->` 的方法本身删除，避坑结论保留一句话。遗留问题 / 操作准则 / 已知坑 段落不动。精简前确保工作区已提交（git 为完整档案）。

## Output

After writing the note, report briefly:

- **path**: file path written
- **action**: `created` | `appended`
- **summary**: one-line summary of content
- **index_updated**: which index.md files were updated
- **cross_refs**: any cross-references added
- **errors**: any issues encountered (mkdir failure, dedup conflict, etc.)

Do NOT output the full note content.
