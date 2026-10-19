---
name: paper-reader
description: |
  学术论文深度阅读与结构化分析。当用户说需要进行深度的学术论文阅读和分析时使用。使用 MinerU Cloud API 高精度解析 PDF，或降级到本地 PDF skill 读取。生成摘要 → 背景与动机 → 方法 → 实验 → 分析 → 结论的 Markdown 报告。
argument-hint: <pdf-path-or-url>
allowed-tools: Bash(*), Read, Write, Glob, Grep
---

# Paper Reader - 学术论文深度阅读

## 核心能力

- **MinerU Cloud API** 高精度 PDF 解析（优先）
- **本地 PDF skill** 降级读取（MinerU 不可用时）
- 自动提取图片、表格、LaTeX 公式
- 生成结构化分析报告：**摘要 → 背景与动机 → 方法 → 实验 → 分析 → 结论**

## 操作步骤

### 第一步：PDF 解析

**优先使用 MinerU API 解析：**

```bash
python scripts/mineru_api.py <pdf_path_or_url> <paper_dir>/mineru_output
```

其中 `<paper_dir>` 为 `<PaperShortName>_<VenueYear>/`（仓库根目录下的论文文件夹），需先 `mkdir -p` 创建。支持本地 PDF 文件路径和 URL（如 arXiv PDF 链接）。

MinerU Token 不在仓库中保存。脚本按以下顺序读取：

1. 命令行第三个参数；
2. 环境变量 `MINERU_TOKEN`；
3. 本机配置文件 `~/.config/favour-config/env`（可用 `FAVOUR_CONFIG_ENV` 覆盖路径）中的 `MINERU_TOKEN=...`。

配置示例见仓库根目录的 `env.example`。

**输出结果：**
- `<paper_dir>/mineru_output/full.md` — Markdown 文件（含公式、表格）
- `<paper_dir>/mineru_output/images/` — 高质量提取的图片
- `<paper_dir>/mineru_output/*.json` — 元数据 JSON

**降级方案：** 若 MinerU API 失败（网络问题、token 过期等），使用项目内 `pdf` skill 读取：
- 用 `pypdf` / `pdfplumber` 提取文本
- 用 Read 工具直接读取 PDF

### 第二步：提取论文元数据

```bash
python scripts/extract_paper_info.py <paper_dir>/mineru_output/full.md <paper_dir>/mineru_output/paper_info.json
```

输出 `paper_info.json`，包含标题、摘要、章节、图片列表、字数统计。

### 第三步：撰写结构化分析报告

阅读 MinerU 解析后的 Markdown 全文，按以下结构撰写分析报告：

---

#### 报告结构（必须严格遵循）

```markdown
# 论文标题

**论文编号**：[YYMM.NNNNN]
**作者团队**：xxx
**机构**：xxx

## 摘要

用 3-5 句话概括论文核心问题、提出的方法和主要结论。不照搬原文 Abstract，用自己的语言重述。

## 背景与动机

- 该领域面临什么问题？
- 现有方法的局限性是什么？
- 为什么需要本研究？
- 引用论文中提到的关键先前工作

## 方法

- 核心方法/架构的详细描述
- 关键技术设计及其理由
- 如有架构图，引用并讲解
- 与现有方法的本质区别
- 公式用 LaTeX 语法（`$...$` 行内，`$$...$$` 独立行）

## 实验

- 实验设置：数据集、基线、评价指标
- 主要实验结果及对比
- 关键数据表格（用 Markdown 表格）
- 消融实验结果（如有）

## 分析

- 为什么该方法有效？机制分析
- 优势与局限性
- 与同类方法的深入对比
- 论文中的分析实验（如可扩展性、效率分析等）

## 结论

- 核心贡献总结（1-3 点）
- 未来工作方向
- 对领域的潜在影响
```

---

#### 写作要求

- 语言：中文 + 英文术语（如 "KV Cache"、"Attention"、"Sparsity"）
- 避免AI常用套话（"深入探讨"、"至关重要"、"在...领域"）
- 方法部分要足够详细，读者能理解核心设计思路
- 实验部分用数据说话，突出关键数值对比
- 分析部分要有自己的理解和判断
- 公式用 LaTeX 语法，不使用图片

### 第四步：组织输出目录并保存

按以下目录结构组织所有产出物（放在仓库根目录下，每篇论文一个文件夹）：

```
<PaperShortName>_<VenueYear>/
├── analysis_report.md          ← 结构化分析报告（必须）
├── <PaperShortName>.pdf        ← 原始 PDF（如有）
├── review_form.pdf             ← 审稿表（如有）
└── mineru_output/              ← MinerU 解析原始输出
    ├── full.md
    ├── images/
    └── *.json
```

#### 目录命名规则

- **PaperShortName**：论文方法/模型的缩写（如 MixEmb、EARN、HSTU）
- **VenueYear**：投稿会议/期刊 + 年份（如 `EMNLP2026`、`ACL2026`、`KDD2024`）
- 若无会议信息，用 arXiv 编号（如 `2507.00715`）
- 示例：`MixEmb_EMNLP2026/`、`EARN_2507.00715/`、`HSTU_KDD2024/`

#### 文件整理步骤

1. 确定目标目录：`<PaperShortName>_<VenueYear>/`（仓库根目录下）
2. 创建目录（如不存在）：`mkdir -p <目标目录>`
3. 将 MinerU 输出移入 `mineru_output/` 子目录
4. 如有本地 PDF，复制到目录下并重命名为 `<PaperShortName>.pdf`
5. 如有审稿表，复制到目录下并重命名为 `review_form.pdf`
6. 将分析报告写入 `analysis_report.md`

## 降级处理

| 场景 | 处理方式 |
|------|----------|
| MinerU API 超时/失败 | 降级到 pdf skill 用 pdfplumber 提取文本 |
| MinerU 解析质量差（乱码多） | 降级到 pdf skill |
| 仅提供 arXiv ID | 先用 arxiv skill 获取 PDF URL，再用 MinerU 解析 |
| PDF 为扫描件 | MinerU 自动启用 OCR；降级时用 pdf skill OCR |
| 本地无 Python 依赖 | 提示用户 `pip install requests` |

## 脚本索引

- `scripts/mineru_api.py` — MinerU Cloud API 调用（优先）
- `scripts/extract_paper_info.py` — 提取论文元数据

## 注意事项

- MinerU Token 已内置在 `mineru_api.py` 的 `DEFAULT_TOKEN` 中
- Token 过期时，用户可设置环境变量 `MINERU_TOKEN` 或修改 `DEFAULT_TOKEN`
- 不要反复读取图片文件，信任 `paper_info.json` 中的元数据
- 报告只输出最终 Markdown，不输出分析过程
- 单个文件最大 200MB，最多 600 页
