---
name: wxmp-to-blog
description: Convert WeChat公众号 articles into Astro blog posts with LaTeX formulas and locally captured images. Use when the user says "公众号转blog", "转成博客", "发到blog", "weixin to blog", or provides a mp.weixin.qq.com/s/ URL with intent to publish to alarik.me.
---

# wxmp-to-blog

Convert a WeChat公众号 article URL into a ready-to-build blog post on the Astro blog (`~/note/blog/`). Preserves math formulas as LaTeX and captures images locally to bypass WeChat's防盗链 and URL token expiry.

This skill runs in the **main agent's context** — you have full conversation access for iterative editing.

## Prerequisites

| Requirement | How to verify |
|---|---|
| Python 3.12+ with playwright | `~/.venv/bin/python -c "import playwright"` |
| Chromium installed | `~/.venv/bin/playwright install chromium` |
| Blog project at `~/note/blog/` | `ls ~/note/blog/astro.config.ts` |
| `new_post.py` script | `ls ~/note/blog/scripts/new_post.py` |

If any are missing, install before proceeding. Do NOT auto-install — ask the user.

## Architecture

```
mp.weixin.qq.com/s/...
        │
        ▼
┌─────────────────────────────┐
│  scripts/extract_wxmp.py    │  Playwright headless
│  ├─ response.body() capture │  Images bypass防盗链
│  ├─ data-src → src forcing  │  Lazy-load bypass
│  ├─ data-formula → $LaTeX$  │  SVG formula → Markdown
│  └─ DOM traversal → MD      │  Clean text extraction
└──────────┬──────────────────┘
           │ article_extracted.md + images/ + article_meta.json
           ▼
┌─────────────────────────────┐
│  Agent post-processing      │
│  ├─ new_post.py             │  Create post + image dir
│  ├─ Move images to blog     │  src/assets/images/<slug>/
│  ├─ Rewrite image paths     │  images/xxx → @/assets/images/<slug>/xxx
│  ├─ Fill frontmatter        │  title, tags, description, author
│  └─ Manual content editing  │  Polish, add intro, fix formatting
└──────────┬──────────────────┘
           │ src/content/posts/<slug>.md
           ▼
┌─────────────────────────────┐
│  Build & verify             │
│  ├─ pnpm build              │  0 errors required
│  └─ Visual check (optional) │  Playwright MCP or pnpm dev
└─────────────────────────────┘
```

## Full Workflow

### Step 1: Extract

```bash
SKILL_ROOT="$(dirname "$(readlink -f "$0")")"  # or resolve from skill path
~/.venv/bin/python "$SKILL_ROOT/scripts/extract_wxmp.py" \
    "https://mp.weixin.qq.com/s/XXXX" \
    /tmp/wxmp_extract
```

Outputs in `/tmp/wxmp_extract/`:
- `article_extracted.md` — Markdown with `$...$` formulas and `images/img_000_hash.png` references
- `article_meta.json` — `{title, author, publishTime, images_total, images_saved, images_missed}`
- `images/` — captured image files

**Check the output**: if `images_missed > 0`, some images failed to capture. The markdown will contain remote URLs as fallback. Warn the user.

### Step 2: Create blog post

```bash
cd ~/note/blog
python scripts/new_post.py --title "文章标题" --tags "tag1,tag2" --desc "简短描述"
```

This creates:
- `src/content/posts/<slug>.md` from `_template.md`
- `src/assets/images/<slug>/.gitkeep`

Use the article title from `article_meta.json`. For multi-part articles, add a suffix: `--title "OPD深度解析（一）：概率熵与KL散度"`.

### Step 3: Move images

```bash
SLUG="<slug from step 2>"
rm -f ~/note/blog/src/assets/images/$SLUG/.gitkeep
cp /tmp/wxmp_extract/images/*.png ~/note/blog/src/assets/images/$SLUG/
# Also copy .jpg/.gif/.webp if present:
cp /tmp/wxmp_extract/images/*.{jpg,gif,webp} ~/note/blog/src/assets/images/$SLUG/ 2>/dev/null || true
```

### Step 4: Assemble post content

Read `article_extracted.md` and the template post. Assemble the final post:

1. **Frontmatter**: keep template's `pubDatetime`, set `title` from meta, write `description`, set `tags`. Set `author` to the公众号 name if relevant.

2. **Image paths**: replace all `images/img_000_hash.png` with `@/assets/images/<slug>/img_000_hash.png` (Astro `@/` alias = `src/`).

3. **Body**: paste extracted content after the frontmatter. Make these manual fixes:
   - Remove the original article's `# Title` H1 (frontmatter `title` is the H1)
   - Add `## Table of contents` after the intro paragraph
   - Write a 1-2 sentence intro paragraph (the extracted text usually starts abruptly)
   - Check formula rendering: inline `$...$` should stay inline; block `$$...$$` should be on their own lines
   - Clean up WeChat boilerplate: "微信扫一扫", "关注该公众号", "继续滑动看下一个", "收录于合集" etc.
   - Fix any broken table formatting (WeChat tables can be messy)
   - Add `> [!NOTE]` callouts for important asides if appropriate

4. **Source attribution**: add at the end:
   ```markdown
   > 原文链接：[公众号名称](https://mp.weixin.qq.com/s/XXXX)
   ```

### Step 5: Build & verify

```bash
cd ~/note/blog
pnpm build
```

Must show `0 errors`. Check for:
- Image optimization: all images should convert to WebP without "MISS" warnings
- No "Could not find image" errors
- Pagefind indexing succeeds

Optional visual check:
```bash
pnpm dev &
# Use Playwright MCP to navigate to http://localhost:4321/posts/<slug>
# Verify: images render, formulas display (KaTeX), code blocks highlight, TOC works
```

### Step 6: Report to user

Report:
- Post path: `src/content/posts/<slug>.md`
- Image count: N images captured and optimized
- Build status: pass/fail
- Any manual fixes needed (formulas, formatting, missing images)

## Image Content Understanding

公众号文章中的图片往往承载关键信息（流程图、架构图、公式截图、数据表格等）。提取后应使用视觉工具查看图片内容，以便：

- **判断图片用途**：是装饰图还是承载关键信息的技术图？决定是否需要补充文字说明。
- **核对上下文**：图片前后的文字是否完整描述了图片内容？读者仅看文字能否理解？
- **发现 OCR 遗漏**：部分图片内嵌文字（如架构图中的标注），提取脚本不会识别，需要手动补充到正文中。
- **验证公式**：个别公式可能没有 `data-formula` 属性（纯图片公式），需要通过视觉工具识别后手动转为 LaTeX。

**使用方法**：对提取的每张图片调用 `look_at` 工具（或等效的视觉分析工具），传入图片路径和提取目标：

```
look_at(file_path="/tmp/wxmp_extract/images/img_000_xxx.png",
        goal="Describe the technical content of this image. Extract any text, formulas, or data shown. Is this a diagram, chart, or screenshot?")
```

根据视觉分析结果决定：
- 图片信息已被正文完整覆盖 → 无需额外处理
- 图片包含正文未提及的关键信息 → 在图片下方补充文字说明或 callout
- 图片是纯公式截图且缺少 LaTeX → 手动重建公式并替换图片引用
- 图片是装饰性/无信息量 → 考虑删除以减少页面噪音

## Key Technical Details

### Why response.body() capture (not URL download)

WeChat image URLs (`mmbiz.qpic.cn`) have:
- **防盗链**: requires valid Referer header from `mp.weixin.qq.com`
- **时效性**: URL contains token that expires

Downloading by URL post-hoc fails. But during page load, the browser already has a valid session — `page.on('response')` captures the raw bytes as they arrive. This is 100% reliable.

### Why data-formula extraction (not OCR)

WeChat renders math formulas as:
```html
<span data-formula="E = mc^2">
  <svg>...</svg>  <!-- visual rendering -->
</span>
```

The `data-formula` attribute contains the raw LaTeX. Reading it directly is:
- 100% accurate (no OCR errors)
- Instant (no image processing)
- Preserves all LaTeX commands perfectly

### Why data-src → src forcing

WeChat uses lazy loading: `<img data-src="real_url" src="placeholder.gif">`. The browser only fetches `data-src` when the image scrolls into view. Forcing `data-src → src` + full-page scroll ensures all images load before extraction.

## Error Handling

| Problem | Cause | Fix |
|---|---|---|
| 0 images captured | Page didn't finish loading | Increase timeout, check network |
| images_missed > 0 | Image loaded before listener attached | Usually acceptable — remote URL fallback |
| Formula shows as `$` text | data-formula missing on some spans | Manual fix: find the SVG, reconstruct LaTeX |
| Build fails on image | Corrupt capture or wrong extension | Re-run extraction, or manually download |
| `playwright` not found | venv not activated | Use `~/.venv/bin/python` explicitly |

## Multi-part article series

For series like "OPD深度解析（一/二/三）":
1. Extract each article separately
2. Create separate posts with consistent naming
3. Cross-link with `[[(二)]]` style references in each post
4. Use consistent tags across the series
5. Consider a `--dir` for grouping: `python scripts/new_post.py --title "..." --dir "opd-series"`
