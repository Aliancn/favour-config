# Visual families for article explanation

Pick a family by the relationship actually supported by the passage. This is a searchable set of composition rules, not seven additional palette IDs or fixed templates. Existing `kit.style` presets remain available; use `kit.svg` and primitives when a preset's page frame would flatten the idea. Preserve the same evidence across aspect ratios while changing geometry.

| Family / search terms | Use when | Composition and motion | Reject when |
| --- | --- | --- | --- |
| Evidence specimen / document, quote, source | One document or message contains the important detail | Give the artifact most of the frame. Highlight one exact field in place, then place the interpretation next to it. Keep a visible source-status label. | The passage offers no actual artifact or quote; do not invent an archive card. |
| Editorial split / argument, mechanism | A claim has one compact explanation | Use unequal regions: large claim or concrete subject in one, smaller mechanism in the other. A divider must clarify reading order. | The claim needs several values or a long sequence. |
| Data annotation / comparison, measurement | Values share a measure or an explicitly stated comparison | Put direct labels and units beside marks. Grow from the correct baseline, then annotate the difference. A second metric gets a separate scale or panel. | Values have different units or baselines, or the source supplies no numbers. |
| Process section / route, filter, transform | A real input passes through decisions to a result | Place input, decision, and output in causal order. Follow one token through the path; change a node's state only after the token arrives. | The passage merely lists concepts; arrows would imply a nonexistent flow. |
| State workbench / email, calendar, task | A recognizable UI object changes state or transfers fields | Show the useful object fields and maintain their identity during transfer. One status change is enough; label synthetic interfaces visibly. | The source does not support a completion or product-specific UI state. |
| Version comparison / timeline, evolution | Dated versions show a substantive change | Align repeated fields across dates, emphasize the changed field, and move a single chronological marker. | Dates or version order are absent, or cards would contain only abstract slogans. |
| Concept poster / binary, tension, thesis | A short opposition carries the whole point | One dominant phrase and one meaningful color region. Use one spatial exchange or reveal. | The explanation depends on several steps, measurements, or source notes. |

## Direction card

For the chosen family, write six short entries before coding: source claim and status; focal object; reading order; title/object/value/annotation type roles; background/surface/accent roles; the single movement that reveals the claim. Also name one unsupported visual to exclude. Compare two thumbnail layouts based on these same entries. A palette change alone is not a second concept.

The design system should feel authored for the source. In particular, do not default to a cream canvas with a serif headline, generic `01/02/03` labels, repeated rounded cards, or a decorative technical grid. Those may be appropriate when the article itself justifies them. These anti-pattern checks adapt [Anthropic's design brief and self-critique](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) and [Impeccable's craft floor](https://github.com/pbakaus/impeccable/blob/main/skill/reference/craft-floor.md); the wording and GIF-specific decisions here are original.

For data scenes, select the graphic by information relationship using the [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md), and place direct labels and units where the reader needs them as [Datawrapper recommends](https://www.datawrapper.de/blog/text-in-data-visualizations). For motion, show object relations and consequences rather than an unrelated animation, following [Material motion](https://m2.material.io/design/motion/understanding-motion/) and [Atlassian motion](https://atlassian.design/foundations/motion).

## Worked scenes

- `assets/examples/showcase/14-evidence-16x9.scene.mjs` and `14-evidence-9x16.scene.mjs`: quoted article observation about 3–5 active sessions, with source status visible.
- `assets/examples/showcase/15-data-16x9.scene.mjs` and `15-data-9x16.scene.mjs`: article-reported cache token comparison, 2323 万 versus 3177 万.
- `assets/examples/showcase/16-state-16x9.scene.mjs` and `16-state-9x16.scene.mjs`: explicitly synthetic email-to-calendar transfer, keeping subject and time identifiable.

These examples demonstrate three distinct compositions; they are editable scene source, not layouts to copy when a new article has different evidence.
