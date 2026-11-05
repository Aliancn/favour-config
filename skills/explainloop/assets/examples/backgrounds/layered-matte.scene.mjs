export const meta = {
  title: '层叠哑光色面', style: 'playful-illustrated', width: 960, height: 540, fps: 30, duration: 3,
  styleOverrides: { texture: 'layered-matte' },
  sourceRefs: [{ source: 'Background specimen', claim: 'The paired objects are illustrative design material.', status: 'synthetic example' }],
};

export function draw(_t, kit) {
  const s = kit.style;
  let b = kit.text(66, 85, '背景研究 / 03', 19, s.muted, 650);
  b += kit.text(66, 167, '用色面制造层次，', 49, s.ink, 700, 'start', s.titleFont);
  b += kit.text(66, 229, '让对象站在前面。', 49, s.ink, 700, 'start', s.titleFont);
  b += kit.text(67, 284, '层叠哑光 · 适合日常物件与流程', 21, s.muted, 500);
  b += kit.rect(93, 349, 284, 99, s.surface, 12, s.line, 1.5);
  b += kit.icon('mail', 116, 379, 35, s.accent) + kit.text(167, 411, '收到一封邮件', 25, s.ink, 650);
  b += kit.line(380, 399, 500, 399, s.accent, 2.5);
  b += kit.icon('arrow-right', 473, 386, 28, s.accent);
  b += kit.rect(533, 349, 288, 99, s.surface, 12, s.line, 1.5);
  b += kit.icon('calendar', 558, 379, 35, s.accent) + kit.text(608, 411, '生成一个日程', 25, s.ink, 650);
  return kit.svg(b);
}
