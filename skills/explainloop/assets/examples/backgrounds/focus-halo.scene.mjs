export const meta = {
  title: '聚焦光晕', style: 'nocturne-editorial', width: 960, height: 540, fps: 30, duration: 3,
  styleOverrides: { texture: 'focus-halo' },
  sourceRefs: [{ source: 'Background specimen', claim: 'A single decision is synthetic illustrative material.', status: 'synthetic example' }],
};

export function draw(_t, kit) {
  const s = kit.style;
  let body = kit.text(64, 76, 'BACKGROUND / 05', 17, s.muted, 650);
  body += kit.text(64, 170, '只照亮', 58, s.ink, 700, 'start', s.titleFont);
  body += kit.text(64, 239, '关键选择。', 58, s.ink, 700, 'start', s.titleFont);
  body += kit.text(66, 299, '一个焦点 / 清楚的因果转折', 21, s.muted, 500);
  body += kit.line(65, 336, 400, 336, s.line, 1);
  body += kit.text(65, 474, '适用于决策、突破点、核心对象', 17, s.muted, 500);
  body += kit.circle(700, 300, 81, s.surface, s.line, 1.5);
  body += kit.circle(700, 300, 62, s.bg, s.accent, 2.5);
  body += kit.text(700, 310, '关键', 31, s.ink, 700, 'middle');
  body += kit.line(700, 220, 700, 192, s.accent, 1.5);
  body += kit.text(700, 176, '01 / 决策点', 16, s.muted, 600, 'middle');
  return kit.svg(body);
}
