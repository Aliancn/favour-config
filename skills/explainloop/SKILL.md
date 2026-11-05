---
name: explainloop
description: Turn an article, URL, pasted text, or a specified section into 1–3 short silent explanatory GIFs with editable scene source. Use when the user wants animated article illustrations or text-to-GIF visual explanations; not for a static diagram or narrated video. 中文触发：把文章/链接/段落做成解释型动图、文章配图 GIF、动画讲解、文字转 GIF、给博客或笔记配图；不用于静态示意图或带解说的视频。
license: MIT
---

# ExplainLoop

Create original, readable animations that explain a claim, sequence, comparison, or change in the supplied text. Preserve the source's factual status and the user's chosen section, count, style, size, and destination. The visual reference is a design vocabulary, not a template to copy scene by scene.

## Inputs and selection

1. Read the complete supplied text. For a URL, use available browsing tools; if the body cannot be retrieved, request the text. For local Markdown/TXT, read the file and adjacent captions; `scripts/outline.mjs --input /absolute/path/article.md [--section "Heading"]` reports heading spans, character count, and whether an expanded internal outline is useful. Do not infer article contents from its title.
2. If the user names a heading, paragraph, quote, or range, select only that passage for GIF topics; use surrounding text only to resolve context. Otherwise identify up to three distinct relationships worth animating. Prefer an observable event, before/after, cause/effect, comparison, or numeric change over a slogan. Produce 1–3 GIFs; never fill the count with weak topics.
3. Build a compact evidence map for each GIF: exact source passage or paragraph location, claim status (fact, measurement, reported result, proposal, or opinion), focal object, what visibly changes, and a one-sentence conclusion. Retain units and qualifiers. Choose a GIF only when that change teaches something a still frame would leave unclear. Do not fabricate data, product UI, quotes, or outcomes. Multiple aspect-ratio versions of one topic must preserve this map.
4. When the selected body exceeds 6000 characters after markup removal **or** has more than five top-level sections, make an expanded internal topic outline before choosing the strongest 1–3 GIFs. Continue automatically; ask only when the requested passage or a material claim remains ambiguous after reading the source. A specific selected section is measured on its own.

Read [content-planning.md](references/content-planning.md) when selecting topics or handling uncertainty. This skill does not require a full narrated-video script or voiceover approval.

## Visual decisions

- Read [scene-recipes.md](references/scene-recipes.md) and [visual-quality.md](references/visual-quality.md) before composing a scene. Establish the supported relationship, focal object, reading order, type hierarchy, widget states, and motion beats. Design the complete outcome frame first, then make the earlier motion lead to it. For a new scene, compare two materially different thumbnail compositions internally, then choose the one that explains the source with less competing detail. Read [design-directions.md](references/design-directions.md) when selecting a subject-specific visual family, and [backgrounds.md](references/backgrounds.md) when selecting canvas treatment. A style preset supplies tokens; the scene still needs an original layout. Do not put every subject inside the same `kit.page` header/body/footer arrangement.
- Start from the user's visual instructions. For one request producing multiple GIFs or aspect ratios, choose **one batch style before writing scenes**: a single preset from [styles.md](references/styles.md) and shared background, palette, font roles, line/radius treatment, and motion character. Every scene in that batch uses the same `meta.style` and shared core `styleOverrides`; vary composition and semantic objects to explain each topic. Do not choose a new preset for each GIF. Only use mixed styles when the user explicitly requests them.
- When typography carries the scene, read [font-catalog.md](references/font-catalog.md). Compare two installed font pairings against the passage and record the chosen roles in the scene. Verify the actual resolved CJK face and glyphs before rendering; do not silently substitute a missing display font. The catalog also lists optional independently installed open fonts. The skill does not download or bundle fonts.
- Compose concrete objects using [components.md](references/components.md): people, messages, documents, tasks, timelines, measurements, and their relationships. Use the richer email, calendar, or message widgets when the explanation needs UI detail; do not invent a real product's interface. Use the packaged Lucide subset for familiar small icons. Consult [sources-and-licenses.md](references/sources-and-licenses.md) before adding any external artwork.
- Default to original vector objects. Use supplied imagery, an appropriately licensed illustration, or generated bitmap art only when a concrete subject cannot be explained clearly with vector components. Keep imagery consistent with the selected style and record its source. Do not silently substitute a generic icon for a specific real subject.
- Every visible action should answer what changed, where an object went, or how the result follows. Reveal related parts from one motion progress when they move as a unit; let important information settle in a deliberate order and reverse that order on exit. Choose one of the ten canvas treatments in [backgrounds.md](references/backgrounds.md) only after reserving a clear area for the focal object and text; match its geometry to the article's relationship, and use the catalog's reject conditions. Keep text readable at article width. Show no chart values without source data. Avoid long static holds and an abrupt first/last frame jump when they make the loop feel broken. Consult [failure-cases.md](references/failure-cases.md) when reviewing a similar defect.

## Scene source and rendering

The default deliverable is a **1600×900, 16:9, 30 fps, 4–7 second silent GIF**. User preferences override these defaults. Other built-in output profiles are 4:3 at 1200×900, 1:1 at 1200×1200, and 9:16 at 900×1600; accept a custom pixel size too. Output only the requested ratios; if none is stated, use 16:9. Do not silently lower resolution or fps to reduce file size.

Write a `.scene.mjs` file that exports `meta` and `draw(t, kit)`; `meta.width/height` are the **logical design canvas**, while `--output-size` sets raster pixels. `draw` receives elapsed seconds and returns a complete SVG from `kit.page(...)` or `kit.svg(...)`. Put the evidence map in `meta.sourceRefs`. The source must be deterministic: same scene and time, same SVG. See [scene-format.md](references/scene-format.md), `assets/examples/message-filter.scene.mjs`, and `assets/examples/multi-ratio/`.

For multiple ratios in one request, create a separate editable scene for each ratio and render every requested version. Recompose the layout for square or portrait space; never stretch, crop, or letterbox a landscape scene as the final result. Screen copy may be shortened for the narrower frame while keeping the same evidence, numbers, claim status, and takeaway. Keep the animation's causal sequence consistent across versions.

Unless the user chooses another destination, save `<article-slug>-01.gif` and `<article-slug>-01.scene.mjs` (and consecutive topic numbers) in `generate/images/` under the current working directory for a single 16:9 output. For a multi-ratio request, append `-16x9`, `-4x3`, `-1x1`, or `-9x16` before both extensions; use `-WIDTHxHEIGHT` for a custom ratio. Keep work frames in a temporary directory. The scene source is the editable deliverable; do not leave generated PNG frames beside it.

Resolve this skill's directory as `SKILL_ROOT` from the loaded skill path.

For a batch of two or more scenes, first run `node "$SKILL_ROOT/scripts/check-batch.mjs" --scene /absolute/first.scene.mjs --scene /absolute/second.scene.mjs` (repeat `--scene` for every scene). Fix any preset or shared-token mismatch before rendering. This checks scene metadata. When image perception is available, run `scripts/preview-batch.mjs` with the same `--scene` arguments and compare actual outcome frames for scene-local colors, fonts, widget details, and background treatment. Skip the batch style check only when the user explicitly requested mixed styles.

Render and inspect each requested GIF:

```bash
node "$SKILL_ROOT/scripts/render.mjs" --scene /absolute/path/to/name.scene.mjs --out /absolute/path/to/name.gif --output-size 1600x900
node "$SKILL_ROOT/scripts/inspect.mjs" /absolute/path/to/name.gif
```

`render.mjs` requires Node, `rsvg-convert`, `ffmpeg`, and `ffprobe`; it checks availability and reports a missing tool rather than installing one. The requested output size must have the same aspect ratio as the scene's logical canvas, with each pixel dimension at most 4096. Use `--poster /absolute/path/to/preview.png` when a still preview is useful.

For quality-first generation, follow the conditional preview and revision workflow in [scene-recipes.md](references/scene-recipes.md). If this agent can actually see image pixels, run `node "$SKILL_ROOT/scripts/preview.mjs" --scene /absolute/path/to/name.scene.mjs --temporal-strip [--display-width 720]`, inspect the four key frames and eight sampled frames, and correct concrete visual defects before final rendering. Make no more than two visual revision rounds. If the agent cannot see image pixels, skip visual review and preview; render and run `inspect.mjs` for technical checks only. Playwright is not needed. `inspect.mjs` checks dimensions, frame count, duration, full decode, repeated frames, and longest exact static run; it cannot judge visual polish.

## Deliver

Link each GIF and its scene source. State which source passage it illustrates, any important inference, the chosen style, and actual dimensions/fps/duration/file size. If an input section was specified, confirm that every scene comes from it. Do not claim rendered output or visual review unless they were actually completed; when visual review was unavailable, say so explicitly.

This skill is for short silent GIFs. Use a static-diagram workflow for a single unmoving architecture image and a video workflow for narrated MP4.
