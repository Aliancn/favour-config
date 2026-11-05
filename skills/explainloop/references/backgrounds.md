# Background composition recipes

Select a background for the content's reading path, not because its texture looks fashionable. These are original recipes informed by public design guidance; do not trace reference layouts or copy screenshots. Draw them with `kit.svg(...)`, `kit.rect`, `kit.line`, and scene-specific SVG as needed. The style token `bg` is a neutral starting canvas, not a complete design.

| Recipe | Use for | Composition | Avoid |
| --- | --- | --- | --- |
| Quiet gallery | One artifact, quote, or sequence of evidence | Neutral wall; one large light exhibit surface; small provenance strip; generous outer space | Fake paper speckles, empty card outlines, ornamental frames |
| Editorial split | Thesis plus examples or mechanism | Type-dominant field beside a contrasting detail field; one divider that defines reading order | Equal-sized cards with no focal point |
| Structural field | Routes, mechanisms, architecture | Dark or restrained field; alignment guides only near actual nodes and paths | Full-screen grid unrelated to objects |
| Data canvas | Numeric comparison or change | Nearly flat background; direct labels and unit; series color only for measured marks | Pattern, heavy gradient, or decoration behind a chart |
| Cut-paper stage | Everyday workflow or playful narrative | A few offset matte color planes behind objects; depth from overlap, not shadow effects | Large decorative circles that imply a false relation |
| Typographic poster | Short contrast or claim | One large text block, one high-contrast color region, intentional empty zone | Tiny copy or color blocks with no semantic role |

Keep most background area quiet. Put strongest contrast on the claim and the changing object; secondary surfaces should be distinguishable without becoming separate focal points. Use texture only when it conveys an actual material or source and still survives GIF palette quantization. When image perception is available, evaluate the opening, midpoint, and conclusion at the final article width. If the scene looks like the same header and cards with a different hue, change its geometry before changing colors.

## Built-in background treatments

Set `meta.styleOverrides.texture` to one of these values. `kit.svg()` and `kit.page()` draw the treatment behind scene content at any supported aspect ratio. The effect remains fixed across frames, so GIF quantization does not make a moving noise field shimmer. Keep the same treatment for one batch; `check-batch.mjs` compares this token. Ten editable specimens live in `assets/examples/backgrounds/`; `assets/previews/backgrounds.png` is their contact sheet and `backgrounds-new.png` isolates the six additions.

| Value | Use when | Keep clear | Reject when |
| --- | --- | --- | --- |
| `soft-wash` | Editorial thesis, quote, approachable process | The main text area; move no text onto the strongest color transition | A quantitative chart needs a flat comparison field |
| `edge-glow` | Dark system map or one turning point | Labels and nodes; let the glow gather near the focal region | Light themes or multiple competing highlights |
| `layered-matte` | Everyday objects or before/after states | Object faces; let the broad planes establish depth behind them | The diagonal suggests a relationship absent from the source |
| `quiet-motif` | Source material, chronology, or a single artifact | Title and evidence surface; keep fine lines near the outer edge | Lines cross labels or resemble data marks |
| `focus-halo` | One decision, breakthrough, or focal object | The title at left; put the object inside the light, not text over the brightest center | The scene has several equally important objects |
| `clipped-grid` | Architecture, routing, structured relationships | The grid occupies the relationship zone only; mask it behind opaque labels and nodes | The grid does not correspond to any real alignment or relation |
| `ribbon-field` | Parallel flows, convergence, or transfer | Keep typography outside the line bundle; add an actual convergence object | A static fact or quotation has no flow to explain |
| `contour-lines` | Evolution, migration, or continuous change | Let one highlighted path express the main route | The curves imply a trend or trajectory absent from the source |
| `halftone-margin` | Quotation, archival material, or editorial evidence | Keep dots in the margin and the evidence panel opaque | It resembles a chart's data points or reduces small-text clarity |
| `editorial-band` | Before/after contrast or two distinct viewpoints | Put each state in a deliberate color region | The source does not support a meaningful split |

These are background layers, not complete layouts. First choose the focal object and the space its labels need, then choose a treatment whose light and geometry support that reading path. The background's geometry should carry the same meaning as the article: a ribbon needs flow, a grid needs structure, and a split needs two states. Recompose its scene for portrait space rather than merely scaling a landscape composition. Preview at article width and inspect the GIF after palette conversion. If the treatment adds color banding, weakens text contrast, or attracts attention before the claim, reduce its prominence or select a quieter treatment. The vector geometry is original; the sources below inform only the design principles.

Gradient backgrounds cost more bytes in GIF. In the packaged 1600×900, 30 fps motion specimen, `soft-wash` rendered to about 5.5 MB versus about 1.8 MB for the identical scene with a flat background. Keep the requested resolution and frame rate; compare output size with a flat version when delivery weight matters, and choose the background for its explanatory value.

For the new 1600×900, 30 fps, four-second `ribbon-field` motion specimen, the textured GIF is 248 KB versus 145 KB with a flat backdrop. The design uses a limited number of static vector paths, so the visual field remains inexpensive to encode. Treat these sizes as scene-specific measurements, not promised limits for other content.

Public references for principles and visual study:

- [Stripe Sessions](https://stripesessions.com/): a vivid graphic occupies a dedicated visual stage while the main headline sits in a calm, high-contrast region; inform `ribbon-field` and the separation of type from ornament.
- [Linear](https://linear.app/): dark matte space and restrained tonal depth keep the product image as the focal object; inform dark `focus-halo` usage.
- [Vercel Geist Grid](https://vercel.com/geist/grid): structural guides can be clipped and occluded by solid content cells; inform `clipped-grid` rather than a full-screen decorative grid.
- [Pentagram / Isomorphic Labs](https://www.pentagram.com/work/isomorphic-labs/story): a graphic system of gradients, cubes, and an information grid relates to the subject; inform semantic backgrounds such as `contour-lines`.
- [Pentagram / Serif](https://www.pentagram.com/work/serif): restrained color auras appear at selected moments on a crisp base; inform `focus-halo`.
- [Pentagram editorial design](https://www.pentagram.com/editorial-design): theme and variation give a publication coherence while individual stories retain their own composition; inform `editorial-band` and batch consistency.
- [The Met's refreshed timeline](https://www.metmuseum.org/perspectives/fresh-digital-face-for-the-met): objects and chronology lead the layout; the interface is quiet around them.
- [Carbon color layering](https://www.carbondesignsystem.com/building-blocks/foundations/color/guidelines): distinct background and content layers establish hierarchy.
- [Material 3 color roles](https://m3.material.io/m3/pages/color-roles?s=m3): surface and container roles support legible stacked content.
- [Atlassian elevation](https://atlassian.design/foundations/elevation): whitespace and borders often separate areas more cleanly than repeated raised cards.
- [USWDS typography](https://designsystem.digital.gov/components/typography/): type scale and surrounding whitespace affect scan order and readability.
- [Pattern Craft](https://github.com/megh-bari/pattern-craft): gradient, geometric, and decorative background categories; its CSS snippets are a study reference, not copied SVG assets.
- [GitHub texture guidance](https://brand.github.com/graphic-elements/textures): textures can provide depth while remaining a background layer.
- [Apple materials guidance](https://developer.apple.com/design/human-interface-guidelines/materials): use rich material effects sparingly so foreground content stays legible.

These references are design principles, not licenses for their images, UI, or graphic assets. All packaged scenes should use original vector geometry unless an external asset is explicitly sourced and licensed.
