export const meta = {
  title: '局部细纹', style: 'museum-gallery', width: 960, height: 540, fps: 30, duration: 3,
  styleOverrides: { texture: 'quiet-motif' },
  sourceRefs: [{ source: 'Background specimen', claim: 'The quoted text is illustrative design material.', status: 'synthetic example' }],
};

export function draw(_t, kit) {
  const s = kit.style;
  let b = kit.text(72, 90, '背景研究 / 04', 19, s.muted, 650);
  b += kit.text(72, 200, '细纹留在边缘，', 57, s.ink, 700, 'start', s.titleFont);
  b += kit.text(72, 278, '证据留在中央。', 57, s.ink, 700, 'start', s.titleFont);
  b += kit.line(72, 319, 654, 319, s.line, 1.5);
  b += kit.text(73, 377, '局部细纹 · 适合引文、材料、历史线索', 24, s.ink, 550);
  b += kit.text(73, 478, '示意文字 / 不代表真实史料', 18, s.muted, 500);
  return kit.svg(b);
}
