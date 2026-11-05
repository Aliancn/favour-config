export const meta = {
  title: '编辑色带', style: 'swiss-grid', width: 960, height: 540, fps: 30, duration: 3,
  styleOverrides: { texture: 'editorial-band' },
  sourceRefs: [{ source: 'Background specimen', claim: 'A comparison of two states is synthetic illustrative material.', status: 'synthetic example' }],
};

export function draw(_t, kit) {
  const s = kit.style;
  let body = kit.text(63, 78, 'BACKGROUND / 10', 17, s.muted, 700);
  body += kit.text(62, 169, '把结论', 63, s.ink, 700, 'start', s.titleFont);
  body += kit.text(62, 245, '切出层次。', 63, s.ink, 700, 'start', s.titleFont);
  body += kit.text(65, 310, '清晰色面承载强对比', 22, s.ink, 500);
  body += kit.text(65, 475, '适用于前后对照、两种观点', 17, s.muted, 500);
  body += kit.text(640, 116, 'BEFORE', 17, s.muted, 700);
  body += kit.text(640, 187, '分散', 43, s.ink, 700);
  body += kit.line(640, 231, 873, 231, s.line, 1);
  body += kit.text(640, 328, 'AFTER', 17, s.muted, 700);
  body += kit.text(640, 419, '聚合', 47, s.ink, 700);
  return kit.svg(body);
}
