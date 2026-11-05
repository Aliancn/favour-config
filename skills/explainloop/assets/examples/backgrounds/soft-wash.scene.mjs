export const meta = {
  title: '柔和偏心光场', style: 'editorial-paper', width: 960, height: 540, fps: 30, duration: 3,
  styleOverrides: { texture: 'soft-wash' },
  sourceRefs: [{ source: 'Background specimen', claim: 'Light and typography are illustrative design material.', status: 'synthetic example' }],
};

export function draw(_t, kit) {
  const s = kit.style;
  const b = kit.text(70, 91, '背景研究 / 01', 19, s.muted, 650) +
    kit.text(70, 188, '让光线沿着', 58, s.ink, 700, 'start', s.titleFont) +
    kit.text(70, 263, '阅读方向落下。', 58, s.ink, 700, 'start', s.titleFont) +
    kit.line(72, 303, 472, 303, s.accent, 3) +
    kit.text(72, 353, '柔和光场 · 留出稳定的文字区域', 24, s.ink, 550) +
    kit.text(72, 479, '适合引言、观点、轻量流程', 18, s.muted, 500);
  return kit.svg(b);
}
