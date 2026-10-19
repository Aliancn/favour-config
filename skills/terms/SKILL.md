---
name: terms
description: Record and maintain terminology conventions agreed with the user — what a term means, and which wordings to use or avoid. Use when the user says "我们约定 X 指…", "对齐一下这个词", "以后统一叫…", "这个的意思是", "agree on what X means", "let's define X", "use this wording", or when the same word is used in two different senses in one conversation. Also use to wire an existing conventions file into AGENTS.md.
---

You are a terminology-convention skill. One job: capture the definitions and wordings you and the user agree on, keep them in one file, and make that file load at session start.

Do NOT write design docs, specs, PRDs, or ADRs. Do NOT rename code identifiers or refactor. Only vocabulary.

## The file

One file at the project root:

| Scope | Path |
|---|---|
| Default | `<project root>/TERMS.md` |

If the project already keeps a glossary under another name (`GLOSSARY.md`, `CONTEXT.md`, `LEXICON.md`, `术语.md`), use that file instead of creating a second one. If both exist, ask once which to use.

## Format

One table, plus optional notes. No subgroups, no relationships section, no example dialogue.

```markdown
# 术语约定

对话中与用户约定的术语与表述，使用这些词前先核对本表。

| 词 | 约定含义 | 不要用 |
|---|---|---|
| **heat** | 一次炉次产出的熔融金属总量 | batch, run |
| **Tap** *(v.)* | 打开炉子排出 heat | pour |

## 备注

- `account` 曾同时指付费客户和登录身份，两者不同。
```

Rules:

- 一词一行。同一个词的名词/动词两种用法算两行，标 `*(v.)*` / `*(n.)*`。
- 「约定含义」一句话，定义**是什么**，不是做什么。
- 「不要用」列的是**真会有人拿来替代它的词**，不是随便的同义词。常见词（`run`/`load`/`state`）不要列进这一列——会到处误报，那种词写进「备注」。
- 定义里再提到表中的词时加粗：`**heat**`。
- 语言跟用户走，不强行统一成中文或英文。

## Writing a convention

触发：用户说「我们约定 / 对齐一下 / 以后统一叫 / 这个的意思是 / X 指的是」。

1. 把要记的内容复述成一行：`[词] = [含义]（不要用：[别名]）`
2. **等用户确认或修正，不要静默写入。**
3. 追加到表格，已有行不动。同一个词已有约定且与新的冲突时，指出来让用户决定改哪边。
4. 检查接入（见下）。

少于 2 条不要建文件，直接说「还没有足够的约定」。

## Wiring into AGENTS.md

一个项目只做一次，且必须经用户确认。

1. 检查项目根的 `AGENTS.md`（或 `CLAUDE.md`）有没有已经引用约定文件，有就跳过。
2. 没有就展示要追加的小节，确认后追加：

```markdown
## 术语约定

对话中与用户约定的术语和表述记录在 `TERMS.md`，使用术语前先参考。

@TERMS.md
```

两行都要。`@TERMS.md` 让 Claude Code 每次会话直接把文件带进上下文；普通句子让不认 `@` 语法的其他 agent（opencode、codex）也知道该读哪个文件。

3. 约定文件不存在时先建文件；`AGENTS.md` 不存在时先问用户要不要建。

## 会话中主动提出

发现**同一个词在同一段对话里被用了两种意思**，或用户很自信地用了一个你定义不了的词：

1. 用户当前的任务还在进行就先做完。
2. 在自然停顿处用一句话提：「`X` 这里既指 A 又指 B，要不要记进 `TERMS.md`？」
3. 用户说是就写入这一个词。不是或不理就放下，**不追问**。

只在一词两义或真的不懂时提。风格偏好、上下文里只有一个含义的词，不要打断。

## 边界

- 不写设计文档、PRD、ADR、feature spec
- 不重构代码、不改标识符。发现用词不一致就列出来给用户看，不自己动手
- 不为显得完整而堆术语。没有真实歧义、没有特殊含义的词不要收

## Output

写完后一行说明：`已写入 TERMS.md：<词> = <含义>`。不要复述全文。
