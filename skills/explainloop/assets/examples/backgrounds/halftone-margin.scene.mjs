export const meta = {
  title: '边缘网点', style: 'editorial-paper', width: 960, height: 540, fps: 30, duration: 3,
  styleOverrides: { texture: 'halftone-margin' },
  sourceRefs: [{ source: 'Background specimen', claim: 'A printed note is synthetic illustrative material.', status: 'synthetic example' }],
};

export function draw(_t, kit) {
  const s = kit.style;
  let body = kit.text(64, 77, 'BACKGROUND / 09', 17, s.muted, 650);
  body += kit.text(63, 172, '细节退后，', 55, s.ink, 700, 'start', s.titleFont);
  body += kit.text(63, 239, '证据向前。', 55, s.ink, 700, 'start', s.titleFont);
  body += kit.text(65, 299, '局部印刷感 / 留出清晰正文', 21, s.ink, 500);
  body += kit.text(65, 475, '适用于引文、档案、材料细节', 17, s.muted, 500);
  body += kit.rect(538, 153, 249, 222, s.surface, 2, s.line, 1.4);
  body += kit.rect(557, 171, 52, 5, s.accent, 0);
  body += kit.text(557, 223, '摘录 / 01', 20, s.muted, 600);
  body += kit.text(557, 279, '一段关键证据', 25, s.ink, 700, 'start', s.titleFont);
  body += kit.line(557, 310, 741, 310, s.line, 1);
  body += kit.text(557, 344, '来源 · 时间 · 状态', 16, s.muted, 500);
  return kit.svg(body);
}
