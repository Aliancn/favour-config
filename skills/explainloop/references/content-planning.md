# Selecting article content

## Evidence map

For each proposed GIF, record:

- `source`: file path and heading/paragraph, URL and heading, or a short pasted-text excerpt.
- `claim`: one sentence preserving the author's qualification.
- `status`: observed fact, cited result, synthetic example, proposal, or opinion.
- `focal object`: the concrete thing that carries the claim on screen.
- `motion`: the specific object and state change the reader should watch.
- `takeaway`: one sentence that can be understood after one loop.

Keep source text in `meta.sourceRefs`; avoid copying long passages into the image itself. If the article disputes a claim, depict it as a dispute or comparison rather than an established fact. For numerical statements, include the scope and units in the evidence map and in the scene wherever the number appears. Do not turn illustrative bars into measured data.

## Choosing topics

Select relationships with a visible before and after, sequence, branch, accumulation, or comparison. Give priority to claims central to the article and poorly explained by its existing static illustrations. Ask what the reader learns by watching the change: if the complete outcome frame conveys everything, use a still illustration instead of adding decorative motion. Separate the topic from its evidence: a vivid sentence without a drawable relationship may be better left as prose.

For each shortlisted relationship, verify a causal chain: source claim → visible object → change or comparison → on-screen takeaway. If any link requires a fabricated UI state, invented value, or generic arrow unrelated to the source, narrow or reject the topic. A stronger choice is an ordinary object whose change makes the article's mechanism visible.

If the user specifies a passage, do not pull topics from elsewhere in the article. Context outside the passage may clarify names and referents but must not broaden the requested range.

For long selected content (over 6000 characters after markup removal or more than five top-level sections; use `scripts/outline.mjs` for local files), make a compact internal topic/scene/evidence table before rendering. Choose the strongest supported topics and continue automatically. Ask only if the requested passage or a material claim remains ambiguous after reading the source.

If a URL cannot be read, ask for the article body or a local copy. If a claim is too ambiguous to visualize faithfully, omit it from the candidate set and briefly say why.
