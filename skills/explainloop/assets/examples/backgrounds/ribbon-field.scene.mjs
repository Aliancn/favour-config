export const meta = {
  title: '线束舞台', style: 'chromatic-poster', width: 960, height: 540, fps: 30, duration: 3,
  styleOverrides: { texture: 'ribbon-field' },
  sourceRefs: [{ source: 'Background specimen', claim: 'A bundle of routes is synthetic illustrative material.', status: 'synthetic example' }],
};

export function draw(_t, kit) {
  const s = kit.style;
  let body = kit.text(65, 78, 'BACKGROUND / 07', 17, s.muted, 700);
  body += kit.text(60, 185, '多条路径', 70, s.ink, 700, 'start', s.titleFont);
  body += kit.text(60, 267, '汇成一束。', 70, s.ink, 700, 'start', s.titleFont);
  body += kit.rect(63, 300, 78, 6, s.accent, 0);
  body += kit.text(65, 351, '让流向成为画面的能量', 22, s.ink, 550);
  body += kit.text(65, 475, '适用于并行任务、汇聚、传递', 17, s.muted, 500);
  body += kit.circle(756, 283, 54, s.surface, s.accent, 2.5);
  body += kit.text(756, 291, '汇合', 25, s.ink, 700, 'middle');
  return kit.svg(body);
}
