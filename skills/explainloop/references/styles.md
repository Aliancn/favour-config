# Visual styles

The renderer exposes these IDs through `kit.style`. Tokens live in `scripts/lib/styles.mjs`. Style IDs are stable; scene content and geometry remain original to the article. The palette has been checked for text contrast in its principal foreground/background combinations. Users may override colors and fonts in scene metadata, provided contrast and legibility are checked after rendering. `styleOverrides.texture` also selects one of the original background treatments in [backgrounds.md](backgrounds.md) and remains a shared token for a batch. Font stacks are starting points, not identities: use [font-catalog.md](font-catalog.md) to choose installed faces for the actual subject, and record optional fonts only when they really exist on the rendering machine.

| ID | Use when | Visual grammar | Motion grammar |
| --- | --- | --- | --- |
| `editorial-paper` | Essays, argument, human attention, social/workflow stories | Warm paper, serif Chinese headline, dark ink, fine borders, sparse brick-red focus | One event or highlight at a time; the page itself stays still |
| `swiss-grid` | Comparisons, taxonomy, claims with sharp contrast | Off-white grid, large sans-serif type, black/red blocks, asymmetric alignment | Hard cuts between states, short aligned slides |
| `technical-blueprint` | Mechanisms, engineering, physical systems | Deep navy, pale cyan drafting lines, labeled dimensions, measured connectors | Paths draw and components assemble in causal order |
| `data-newsroom` | Evidence, numbers, experiments | Quiet ivory, charcoal labels, restrained colored series, strong axis labels | Charts grow from zero; data labels arrive with their values |
| `playful-illustrated` | Everyday objects, education, narrative explanation | Soft cream, rounded colored cut-paper objects, loose but controlled outlines | Object actions, staggered reveals, gentle spring-like stops |
| `archival-timeline` | History, sequence across periods, institutions | Modern archive exhibition: neutral wall, distinct evidence surfaces, large dates, fine provenance details | A marker traverses a timeline; evidence panels open in order |
| `museum-gallery` | A single artifact, source, quote, or document deserves close attention | Gallery wall, one generous exhibit field, small provenance label, strong whitespace | Reveal details of one object in a deliberate sequence |
| `nocturne-editorial` | Dramatic narrative, turning point, or layered system at night | Deep charcoal field, warm type and one restrained illuminated focal area | Light and motion guide attention to the turning point |
| `chromatic-poster` | Sharp concept, binary contrast, or short campaign-like explanation | Full-bleed color blocks, very large type, asymmetric negative space | Bold geometric movement tied to the claim |

Use the content's subject and the user's chosen reference to select. The visual grammar column is a starting direction, not a fixed page template. Vary the focal object, composition, label placement, and UI detail by subject; two scenes in the same style need not share geometry. A reference style may override a preset, but retain the same semantic source checks and QA. Do not claim to reproduce another designer's exact art direction or reuse their page layouts and assets. See [visual-quality.md](visual-quality.md) for composition, typography, widget, and motion review, and [backgrounds.md](backgrounds.md) for adaptable background compositions.

The presets are original combinations informed by public design guidance: Carbon's distinction between productive and expressive motion, Material's principle of motion showing relationships and outcomes, and Fluent's semantic design tokens. See `sources-and-licenses.md`.
