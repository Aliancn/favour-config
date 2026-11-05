export const meta = {
  title: '流线场', style: 'museum-gallery', width: 960, height: 540, fps: 30, duration: 3,
  styleOverrides: { texture: 'contour-lines' },
  sourceRefs: [{ source: 'Background specimen', claim: 'A changing path is synthetic illustrative material.', status: 'synthetic example' }],
};

export function draw(_t, kit) {
  const s = kit.style;
  let body = kit.text(62, 77, 'BACKGROUND / 08', 17, s.muted, 650);
  body += kit.text(62, 171, '变化沿着', 57, s.ink, 700, 'start', s.titleFont);
  body += kit.text(62, 240, '脉络展开。', 57, s.ink, 700, 'start', s.titleFont);
  body += kit.line(65, 282, 421, 282, s.accent, 2);
  body += kit.text(64, 327, '流线暗示连续过程与方向', 21, s.ink, 500);
  body += kit.text(64, 475, '适用于演进、迁移、连续变化', 17, s.muted, 500);
  body += kit.circle(716, 277, 37, s.surface, s.accent, 2);
  body += kit.text(716, 286, '转折', 20, s.ink, 650, 'middle');
  return kit.svg(body);
}
