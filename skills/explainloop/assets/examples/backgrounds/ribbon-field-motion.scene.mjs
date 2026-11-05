export const meta = {
  title: '线束舞台 · 汇聚', style: 'chromatic-poster', width: 960, height: 540, fps: 30, duration: 4,
  styleOverrides: { texture: 'ribbon-field' },
  sourceRefs: [{ source: 'Background motion specimen', claim: 'Inputs converge into one output; the sequence is synthetic.', status: 'synthetic example' }],
};

const cubic = (a, b, c, d, t) => (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d;

export function draw(t, kit) {
  const s = kit.style;
  const p = kit.motion(t, .3, 1.55) * .64;
  const reveal = kit.motion(t, 1.55, .5);
  const exit = 1 - kit.motion(t, 3.25, .55);
  let body = kit.text(64, 82, 'BACKGROUND / MOTION', 17, s.muted, 700);
  body += kit.text(60, 183, '从多条路径', 63, s.ink, 700, 'start', s.titleFont);
  body += kit.text(60, 258, '走向同一结果。', 63, s.ink, 700, 'start', s.titleFont);
  body += kit.rect(64, 300, 76, 6, s.accent, 0);
  body += kit.text(64, 350, '路径汇合后，主角才出现', 21, s.ink, 550);
  body += kit.text(64, 477, '原始 SVG 场景 · 30 fps', 17, s.muted, 500);
  const x = cubic(490, 625, 780, 1000, p), y = cubic(351, 119, 430, 35, p);
  body += kit.group((1 - reveal) * exit, kit.circle(x, y, 10 + 5 * p, s.surface, s.accent, 3));
  body += kit.group(reveal * exit, kit.circle(772, 283, 54, s.surface, s.accent, 2.5) + kit.text(772, 290, '结果', 24, s.ink, 700, 'middle'));
  return kit.svg(body);
}
