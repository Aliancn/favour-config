export const meta = {
  title: '聚焦光晕 · 竖屏', style: 'nocturne-editorial', width: 540, height: 960, fps: 30, duration: 3,
  styleOverrides: { texture: 'focus-halo' },
  sourceRefs: [{ source: 'Background specimen', claim: 'A single decision is synthetic illustrative material.', status: 'synthetic example' }],
};

export function draw(t, kit) {
  const s = kit.style;
  const p = t < 2.55 ? kit.motion(t, .2, 1.15) : 1 - kit.motion(t, 2.55, .35);
  let body = kit.text(41, 92, 'BACKGROUND / PORTRAIT', 20, s.muted, 650);
  body += kit.text(41, 207, '只照亮', 68, s.ink, 700, 'start', s.titleFont);
  body += kit.text(41, 289, '关键选择。', 68, s.ink, 700, 'start', s.titleFont);
  body += kit.text(43, 346, '一个焦点 / 清楚的因果转折', 22, s.muted, 500);
  body += kit.line(42, 387, 458, 387, s.line, 1);
  body += kit.group(p, kit.move(0, 34 * (1 - p), kit.circle(346, 626, 92, s.surface, s.line, 1.5) +
    kit.circle(346, 626, 72, s.bg, s.accent, 2.5) + kit.text(346, 637, '关键', 34, s.ink, 700, 'middle')));
  body += kit.text(43, 888, '适用于决策、突破点、核心对象', 19, s.muted, 500);
  return kit.svg(body);
}
