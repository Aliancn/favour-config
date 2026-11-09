---
name: find-skill
description: >-
  查找、评估并安装新的 agent 技能（skill）与插件（plugin），覆盖 Claude Code、Codex CLI 和
  opencode。当用户说"找个 skill"、"有没有能做 X 的 skill"、"找新 skill"、"装个插件"、
  "skill 去哪找"、"find a skill for X"，或想了解已装之外还有什么工具时使用。不用于搜笔记（用
  search-note），不用于改写已有 skill。
---

# find-skill

给定一个需求，判断本地是否已有 → 没有则到外部找 → 评估 → 安装。
适用于 **Claude Code / Codex CLI / opencode** 三个 agent，三者都用开放格式的 `SKILL.md`。
核心原则：**先本地查重，再谈外部；安装前必读源码；安装量不等于质量。**

## 0. 各 agent 的落点

| Agent | 用户级 | 项目级 | 调用方式 |
|---|---|---|---|
| Claude Code | `~/.claude/skills/` | `.claude/skills/` | `/skill-name` 或描述匹配自动触发 |
| Codex CLI | `~/.agents/skills/`（部分安装器仍写 `~/.codex/skills/`，脚本两个都扫） | `.agents/skills/`（从 cwd 逐级向上到仓库根） | `/skills` 列表，或 `$skill-name` 提及；也按描述自动触发 |
| opencode | `~/.config/opencode/skills/`；**同时读** `~/.claude/skills/`、`~/.agents/skills/` | `.opencode/skills/`；**同时读** `.claude/skills/`、`.agents/skills/` | `skill` 工具按需加载；`opencode.json` 的 `permission.skill` 可 allow/ask/deny |

同一份 `SKILL.md` 三端通用，前提是：`name` 匹配 `^[a-z0-9]+(-[a-z0-9]+)*$` 且与目录名一致，
`description` 不超过 1024 字符，不依赖某个 agent 的私有能力。

## 1. 先查本地（必做）

已装的不要重复装，也不要重复写：

```bash
bash <本 skill 目录>/scripts/find-local.sh <关键词>   # 按名称/描述搜
bash <本 skill 目录>/scripts/find-local.sh --list     # 列出全部已装
```

脚本覆盖上面表里的用户级、项目级目录，外加 `~/.claude/plugins/cache` 与 `~/.codex/plugins/cache`
里的插件自带 skill。CLI 内置 skill（artifact-design、dataviz、code-review、claude-api 等）没有独立
文件，脚本搜不到——查会话里自动列出的 available-skills 清单。

本地已有但不够用 → 优先改它或 fork 一份，而不是另装一个近似的。

## 2. 官方来源（优先，可信度最高）

**Claude Code**

| 来源 | 怎么用 |
|---|---|
| 官方市场 `claude-plugins-official` | `/plugin` 打开 Discover 直接搜；网页对照 `claude.com/marketplace/plugins`（有安装量与 verified 标记） |
| 社区市场 `claude-community` | `/plugin marketplace add anthropics/claude-plugins-community` → `/plugin install <name>@claude-community` |
| 官方 skills 市场 | `/plugin marketplace add anthropics/skills` → `/plugin install <name>@anthropic-agent-skills` |
| 演示市场 | `/plugin marketplace add anthropics/claude-code`（`@claude-code-plugins`），多数与官方重复，少用 |

**Codex CLI**

| 来源 | 怎么用 |
|---|---|
| 内置插件目录 | `codex` 后执行 `/plugins`，按 marketplace 分 tab，搜索、看详情、安装 |
| 加第三方市场 | `codex plugin marketplace add owner/repo [--ref <ref>]`，然后 `codex plugin add <name>@<marketplace>`（v0.122+；更早版本是 `codex marketplace add`） |
| 市场管理 | `codex plugin marketplace list / upgrade / remove <name>` |
| Codex 社区市场站 | https://www.codex-marketplace.com ，CLI：`npx codex-marketplace add owner/repo --skills`（或 `--plugin`）；项目级装到 `.codex/skills/`，全局装到 `~/.agents/skills/` |

**opencode**

没有插件市场。skill 就是开放格式目录，放对位置即可（见第 0 节）；插件是 npm 包或
`.opencode/plugins/` 下的本地 TS/JS 文件，写在 `opencode.json` 的 `plugin[]` 里。

## 3. 聚合搜索（量大，需要自己筛）

| 名称 | 地址 | 规模 | 搜索方式 | 覆盖 |
|---|---|---|---|---|
| skills.sh | https://skills.sh | 按 CLI 安装量排行 | `npx skills find <kw>` | 跨 70+ agent；带 Gen/Socket/Snyk 审计 |
| SkillsMP | https://skillsmp.com | 300 万+ | 站内搜索 `skillsmp.com/search?q=`；REST API + MCP Server | Claude Code / Codex / ChatGPT |
| claude-plugins.dev | https://claude-plugins.dev | 1.2 万 plugin / 6.3 万 skill | `npx skills-installer search <kw>` | 跨 agent，自动适配安装路径 |
| Agent Skills Index | https://skills.branolabs.com | 3,495 条 / 7 个目录 | 站内过滤；JSON API + llms.txt | 含 Codex 官方插件、Anthropic skills |
| Agent Plugins Marketplace | https://pluginsmp.com | 1.7 万 plugin / 6.2 万 skill | 站内搜索；REST API + MCP endpoint | Codex + Claude Code |
| Skill Navigator | https://www.skillnavigator.directory | 9.8 万 | 按任务 / 产品 / agent 搜 | Claude Code、Codex 等 18 个 agent；带自动安全扫描 |
| agentskill.sh | https://agentskill.sh | 27.5 万 | 站内搜索 | 20+ agent |
| getagentictools | https://getagentictools.com | 4.1 万 | `npx agentictools search <kw>` | 跨 agent，零依赖 CLI |
| Cult of Claude | https://cultofclaude.com | 3.8 万 skill + 2.1 万 agent | 站内搜索 | 仅 Claude Code |
| Build with Claude | https://buildwithclaude.com | 3 万+ | 站内搜索 | 仅 Claude；可 `/plugin marketplace add davepoon/buildwithclaude` |
| Claude Code Stack | https://www.claudecodestack.com/explore | 2,435 | 按安装量 / star 排序 | 仅 Claude |

跨 agent 起步用 `npx skills find <kw>`；需要安全/维护信号时看 skillnavigator 或 skills.sh 的审计。

## 4. 人工清单（挑选过的，不是全量）

- `anthropics/skills` — 官方示例 skill 集，也是可直接加的市场
- `anthropics/claude-plugins-official` — Claude 官方市场本体，`.claude-plugin/marketplace.json` 即目录
- `VoltAgent/awesome-agent-skills` — 官方团队 + 社区，人工筛选，标注兼容哪些 agent
- `ComposioHQ/awesome-claude-skills` — 体量最大的通用清单
- `hesreallyhim/awesome-claude-code` — 不止 skill 的 Claude Code 资源索引
- `laolaoshiren/claude-code-skills-zh` — 中文场景整理

## 5. 评估（装之前）

- **读源码**：至少看 `SKILL.md`、`hooks/`、`scripts/`，以及 plugin 的 manifest
  （`.claude-plugin/plugin.json` 或 `.codex-plugin/plugin.json`）。skill 可能预批准工具权限、挂 hook。
- **看 context cost**：Claude 官方市场在 Discover 详情页给出估算；Codex 的初始 skill 列表
  最多占上下文 2%（或 8000 字符），装太多会挤掉别的描述。别一次装一堆。
- **安装量/星数会被刷**，只当参考，不当背书。
- 判断它解决的是"该做一件事"还是"该记住一套规范"——后者更适合抄进自己的库改写。

## 6. 安装

| 形态 | 命令 | 落点 |
|---|---|---|
| Claude plugin | `/plugin marketplace add owner/repo` → `/plugin install <name>@<mkt>` | plugin 系统管理，`/reload-plugins` 生效 |
| Codex plugin | `codex plugin marketplace add owner/repo` → `codex plugin add <name>@<mkt>` | `~/.codex/plugins/`，配置写入 `~/.codex/config.toml` |
| 纯 skill（跨 agent） | `npx skills add owner/repo --skill <name>` | 自动识别 agent，装进对应 skills 目录；`--agent codex` 可显式指定 |
| 手抄 / fork | 复制到 `favour-config/skills/<name>/` 后跑 `bash scripts/link-project-skills.sh` | 本仓库可控，可改，一次覆盖三端 |

本机约定：**想长期用、可能要改的，抄进 `favour-config/skills/` 再软链**。CC Switch 会用
`~/.cc-switch/skills/<name>` 的整目录副本覆盖，手改那里会被冲掉；Codex/opencode 的市场更新同理。

## 输出

搜索完简短报告：

- 关键词与判断（本地是否已有，装在哪一端）
- 候选 2-3 个：名称 / 来源 / 体量或安装量 / 一句话评价（含是否支持目标 agent）
- 推荐装哪个、为什么；不推荐的原因（含安全或上下文成本顾虑）

不要粘贴整个 `SKILL.md` 内容。

## 来源清单维护

上面的来源是 **2026-10 快照**。聚合站和 agent 端的命令都更替很快，发现 URL 失效、命令改名
（例如 Codex 的 `codex marketplace add` → `codex plugin marketplace add`）时直接更新本文件，
并在提交信息里注明日期。数量级只做参考，不要当准确指标引用。
