# Failure cases from ExplainLoop work

Use this short list only when the scene shows a similar defect. These cases come from earlier demo feedback and the current preview and batch-check limitations; they are diagnostics, not mandatory decoration rules.

| Observed failure | Why it weakens the explanation | Specific repair and check |
| --- | --- | --- |
| Several unrelated topics share the same header, small-card grid, and footer | The subject has no focal object; changing the palette cannot fix the composition | Sketch a second composition around the article's concrete object. At article width, identify the object before reading a title. |
| The archival timeline's textured background dominated the dates and source panels | Background character competed with evidence | Remove or quiet texture, then compare the opening and outcome at display width. A background mark should convey chronology or material, not attract attention first. |
| One GIF in a batch used another visual language | Shared metadata can pass even when `draw()` contains local colors, fonts, or widget details | Run `check-batch.mjs`, then compare all outcome frames with `preview-batch.mjs`. Correct the scene-local values to match the chosen batch roles. |
| A selected font silently resolved to another Chinese face | Text metrics and hierarchy changed after rendering | Check the resolved CJK font and inspect rendered Chinese at article width. Choose an installed pairing and reflow copy before reducing type size. |
| A synthetic email or task widget showed a completed state unsupported by the article | The animation turned a proposed or illustrative workflow into a factual outcome | Trace the visible state to `meta.sourceRefs`. Remove the success state or label the example as illustrative, including on screen when the distinction affects interpretation. |
| Four preview frames looked sound but a short transition could still fail | The samples may miss a brief overlap, label flash, or jump | Inspect `preview.mjs --temporal-strip`; if the transition is shorter than the sampling gap, inspect the final GIF around that moment. |
| A fully decoded 5-second demo held an identical frame for about 2 seconds | Technical validity did not mean the loop kept explaining; the result lingered after the reader could parse it | Use `inspect.mjs` to locate long exact holds, then shorten or give the held state an explanatory purpose. Review the actual loop before changing duration. |

An animation technique is useful only when it improves the reader's understanding of the source. [manim-craft's published comparison](https://github.com/albertobarnabo/manim-craft) found that more motion craft checks did not by themselves improve the judged explanation; select the right on-screen relationship before polishing movement.
