# Scene module contract

Export exactly these public members from a `.scene.mjs` module:

```js
export const meta = {
  title: 'A short title',
  style: 'editorial-paper',
  width: 960, // logical design canvas, not necessarily output pixels
  height: 540,
  fps: 30,
  duration: 6,
  sourceRefs: [{ source: 'article.md > section', claim: '...', status: 'reported result' }],
};

export function draw(t, kit) {
  const body = kit.taskCard(100, 140, 240, 90, 'Example');
  return kit.page({ kicker: 'Context', title: meta.title, body, caption: 'Takeaway' });
}
```

`draw(t, kit)` must be deterministic and return one complete SVG string for any `0 <= t < duration`. Do not read external data, call a model, change the filesystem, or use unseeded randomness inside `draw`. Use the source evidence to write the scene; the renderer is intentionally deterministic and does not extract claims from prose itself.

Scenes may import a local editable helper for shared geometry across ratio variants, as in `assets/examples/multi-ratio/_email-layout.mjs`. Keep that helper beside the scene files when distributing or rerendering them.

Use `kit.style` tokens and the semantic components. `kit.page` applies the background and a reusable page frame. The title, kicker, and caption are optional; scene-specific composition should use `kit.svg(body)` when the standard frame would make different subjects look identical. `kit.icon` accepts only icons bundled with the skill. When using `kit.imageFrame`, pass a local absolute image path and include its provenance in `meta.sourceRefs`. For UI state detail, see `assets/examples/refined-email.scene.mjs`.

For a reusable backdrop, set `meta.styleOverrides.texture` to one of the treatments in [backgrounds.md](backgrounds.md). It is part of the batch's shared style tokens. No external image or runtime is required.

`kit.motion(t, start, duration, curve)` returns normalized progress. `soft-stop` follows a front-loaded cubic Bézier `(0.2, 0.8, 0, 1)` and ends exactly at 1; `float-settle` is this skill's restrained spring-like approximation and may overshoot by at most 3% before settling at 1. The default curve is `soft-stop`. Use `soft-stop` for objects meeting a hard boundary; use `float-settle` only for something that can visibly float without moving surrounding layout. `duration` must be positive. Existing `kit.reveal` remains available for simple fades. The curve and hard-boundary versus floating distinction were informed by [this interview summary](https://mp.weixin.qq.com/s/0ttPQ8sYJRvnRs7Gj6k-6Q); the GIF implementation and timings are original.

Derive related parts from one scene progress so entry and exit reverse consistently:

```js
const entry = kit.motion(t, 0.4, 2.8, 'soft-stop');
const exit = kit.ease((t - 3.7) / 0.9);
const p = entry * (1 - exit);
const phase = (a, b) => kit.ease((p - a) / (b - a));
const product = phase(0.1, 0.45);
const keyValue = phase(0.35, 0.7);
const name = phase(0.68, 0.95); // appears last, leaves first
```

This example describes a causal order, not fixed timing for every GIF. `assets/examples/showcase/20-motion-hierarchy.scene.mjs` shows a complete original scene.

## Canvas and output profiles

`meta.width/height` define the SVG viewBox and all component coordinates. `render.mjs --output-size WIDTHxHEIGHT` rasterizes the same logical canvas at higher pixel resolution. The output ratio must match the canvas ratio exactly; mismatch is an error, not a request to stretch or crop. Without `--output-size`, output pixels equal `meta.width/height`, preserving existing scene behavior. Each output side is limited to 4096 pixels.

| Profile | Logical canvas example | Default output pixels |
| --- | --- | --- |
| 16:9 landscape | 960×540 | 1600×900 |
| 4:3 landscape | 960×720 | 1200×900 |
| 1:1 square | 960×960 | 1200×1200 |
| 9:16 portrait | 540×960 | 900×1600 |

For a custom size, make a scene with a matching logical aspect ratio, then render to the requested pixel dimensions. A different ratio needs a different composition and scene source. `assets/examples/multi-ratio/` demonstrates four layouts for the same evidence and motion sequence. A larger raster has sharper vector edges; it does not add missing visual detail, so author and inspect the layout for the target format.

The renderer samples `t = frameIndex / fps` and makes `round(duration * fps)` frames, preserving duration. GIF stores delays in centiseconds, so 30 fps typically alternates 30 ms and 40 ms frame delays.
