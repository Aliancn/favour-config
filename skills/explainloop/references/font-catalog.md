# Fonts for Chinese article motion

Choose faces from the passage's voice and the text's job. Test two materially different installed pairings with the actual headline, key number, and longest label before committing to one. Keep no more than two type families in a frame; a single well-tuned face is often best for dense UI. A system face may render differently on another computer. This skill neither downloads nor bundles font files.

## Installed-font directions

These are candidates, not universal defaults. Confirm availability on the rendering machine with `fc-match -f '%{family}|%{style}\n' 'Family Name'` where fontconfig exists. If the returned family differs, choose another installed face and inspect a rendered specimen containing real Chinese, punctuation, Latin terms, and digits. `fc-match` alone does not prove every glyph is covered.

| Subject and role | Candidate pairing on macOS | Use and limit |
| --- | --- | --- |
| Source quote, evidence, archive | Songti SC for the short quote; Hiragino Sans GB for provenance | Let the quoted artifact lead. Avoid long tiny Songti captions. |
| Measurement or comparison | Hiragino Sans GB for Chinese labels; DIN Alternate for large numerals only | Separate Chinese units from the Latin numeral face. Keep the axis and source easy to scan. |
| Email, calendar, or workbench | Lantinghei SC for one short heading; PingFang SC for fields and states | A single PingFang SC family is preferable when the UI is dense. |
| Soft narrative | Yuanti SC for a short display line; PingFang SC for supporting text | Use only when the article's tone is genuinely informal. |

The six worked scenes in `assets/examples/showcase/14-*`, `15-*`, and `16-*` demonstrate the first three directions. Their font names are visible in `meta.styleOverrides` and scene source. These Apple system fonts are not included in this project.

## Optional independently installed open fonts

| Font | Design use | Source and license |
| --- | --- | --- |
| LXGW WenKai | Personal essays, human-scale notes, educational storytelling; not a dense data table | [Author repository and OFL 1.1](https://github.com/lxgw/LxgwWenKai) |
| Smiley Sans | A few large poster words; the authors explicitly discourage body copy and phone UI | [Author repository and OFL 1.1](https://github.com/atelier-anchor/smiley-sans) |
| Noto Serif CJK SC | Editorial Chinese where a full serif family and several weights are useful | [Official family and download formats](https://github.com/notofonts/noto-cjk/blob/main/Serif/README.md), [OFL 1.1](https://github.com/notofonts/noto-cjk/blob/main/Serif/LICENSE) |

These are optional suggestions, not automatic fallbacks. Verify the installed family name, font weight, and glyph coverage before selecting one; do not substitute an absent display face silently. A public GIF can use a locally installed font without redistributing the font software, but anyone rerendering editable source needs that font installed or must deliberately choose another pairing.

## Final-size type check

- Roles: dominant claim, key value, object label, explanation, provenance. Decide which roles can be removed on portrait; preserve essential facts and units.
- At the intended display width, essential copy should usually reach about 14 px and provenance about 12 px. Check the image, not only logical canvas values.
- Reflow Chinese by meaning. Avoid opening punctuation at line end and closing punctuation at line start, following [W3C Chinese layout requirements](https://www.w3.org/International/clreq/). Do not split a number from its unit or an English product term midway.
- Review the opening, midpoint, outcome, and loop edge for fallback, changed line lengths, missing glyphs, clipping, and text that flashes too briefly to read.
