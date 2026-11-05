export const meta = {
  title: '柔和偏心光场 · 竖屏', style: 'editorial-paper', width: 540, height: 960, fps: 30, duration: 3,
  styleOverrides: { texture: 'soft-wash' },
  sourceRefs: [{ source: 'Background specimen', claim: 'Light and typography are illustrative design material.', status: 'synthetic example' }],
};

export function draw(_t, kit) {
  const s = kit.style;
  let b = kit.text(38, 73, '背景研究 / 01 · 竖屏', 19, s.muted, 650);
  b += kit.text(38, 184, '让光线', 54, s.ink, 700, 'start', s.titleFont);
  b += kit.text(38, 257, '沿着阅读', 54, s.ink, 700, 'start', s.titleFont);
  b += kit.text(38, 330, '方向落下。', 54, s.ink, 700, 'start', s.titleFont);
  b += kit.line(40, 372, 478, 372, s.accent, 3);
  b += kit.textLines(40, 447, ['保留干净的文字区，', '让色彩待在边缘。'], 27, 43, s.ink, 550);
  b += kit.rect(40, 630, 459, 159, s.surface, 12, s.line, 1.2);
  b += kit.text(68, 690, '一个稳定的内容面', 30, s.ink, 650);
  b += kit.text(68, 741, '适合引用、观点与轻量流程', 21, s.muted, 500);
  b += kit.text(40, 905, '示意排版 / 原创背景', 18, s.muted, 500);
  return kit.svg(b);
}
