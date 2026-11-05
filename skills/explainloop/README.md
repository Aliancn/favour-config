# explainloop (vendored)

Articles → short, editable explanatory GIFs. Upstream:
<https://github.com/GraySilver/explainloop> (MIT).

| | |
|---|---|
| Upstream commit | `d66569ff8663a1f2480e3a1f1920a38a2c2387a8` (2026-11-05) |
| Vendored | 2026-11-05 |
| License | MIT — see `LICENSE`; bundled Lucide icons keep their own notices in `assets/icons/` |

## What is included

- `SKILL.md` — the agent manifest (name, description, workflow)
- `references/` — content planning, styles, backgrounds, components, fonts, scene format, QA
- `scripts/` — deterministic SVG → PNG → GIF renderer, preview, inspect, batch check, tests
- `assets/examples/` — editable `.scene.mjs` specimens, including multi-ratio layouts
- `assets/icons/` — Lucide subset with LICENSE and PROVENANCE
- `assets/previews/` — style, component, and background contact sheets

## What was omitted (upstream showcase only)

- `demo/` (4.3 MB of showcase GIFs) and `assets/promo/` (demo video)
- `README.zh-CN.md` and the upstream English README (replaced by this file)
- `.github/workflows/ci.yml` and `.gitignore`

Nothing under `scripts/`, `references/`, or the example scenes depends on the
omitted files. `scripts/gallery.mjs` regenerates `assets/previews/` when needed.

## Local modifications

- `SKILL.md` frontmatter description extended with Chinese trigger words
  ("解释型动图 / 文章配图 GIF / 动画讲解 / 文字转 GIF"). Keep this edit when
  re-syncing from upstream.

## Runtime requirements

- Node.js 20+
- `rsvg-convert` (librsvg)
- `ffmpeg` and `ffprobe`
- A CJK font on the machine for Chinese scenes (not bundled)

Verified on this machine with Node 22.23.1, rsvg-convert 2.63.4, FFmpeg 9.0.2;
`node scripts/test.mjs` passes and `scripts/render.mjs` produces a 1600×900,
5 s, 30 fps GIF from an arbitrary working directory.

## Security note

A scene is a JavaScript module; `render.mjs` `import()`s it. Rendering a
`.scene.mjs` therefore executes that file with the user's privileges. Only
render scenes written by the agent or the user — never a scene file from an
untrusted source. The repository's own scripts make no network calls and do
not read environment variables.

## Updating

1. Clone upstream and note the new commit.
2. Re-sync `SKILL.md`, `references/`, `scripts/`, `assets/` with the same
   exclusions listed above.
3. Re-apply the description edit.
4. Run `node scripts/test.mjs` and render one example scene.
5. Update this file's commit hash and date, then commit.
