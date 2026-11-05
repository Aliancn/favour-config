export const meta = {
  title: '从等待到响应', style: 'nocturne-editorial', width: 960, height: 540, fps: 30, duration: 5,
  sourceRefs: [{ source: 'Synthetic demo: 收到新事件后，任务由等待状态转入处理状态。', claim: 'An incoming event triggers work without a new manual command.', status: 'synthetic example' }],
};
export function draw(t, kit) {
  const s = kit.style, reset = 1 - kit.reveal(t, 4.55, .4), pulse = kit.reveal(t, 1.05, 2.8) * reset, act = kit.reveal(t, 3.0, .65) * reset;
  let b = kit.rect(36, 35, 888, 469, '#202B35', 7);
  b += kit.rect(36, 35, 888, 5, s.accent, 0);
  b += kit.text(65, 82, 'AFTER HOURS / EVENT 01', 14, s.muted, 700, 'start', 'Menlo, monospace');
  b += kit.text(65, 166, '从等待', 66, s.ink, 700, 'start', s.titleFont);
  b += kit.text(65, 241, '到响应。', 66, s.accent, 700, 'start', s.titleFont);
  b += kit.text(67, 295, '一个新事件，成为下一步行动的起点。', 20, s.muted, 500);
  b += kit.line(65, 345, 458, 345, s.line, 1);
  b += kit.text(66, 380, '01  收到事件', 19, s.ink, 600);
  b += kit.group(act, kit.text(66, 417, '02  开始处理', 19, s.accent, 650));
  b += kit.circle(692, 252, 133, '#263642', 'none');
  b += kit.circle(692, 252, 85, 'none', s.line, 1.8);
  b += kit.circle(692, 252, 48 + 38 * pulse, 'none', s.accent, 2);
  b += kit.circle(692, 252, 18, act ? s.accent : s.muted, 'none');
  b += kit.group(act, kit.line(692, 368, 692, 425, s.accent, 2) + kit.text(692, 457, 'ACTIVE', 17, s.accent, 700, 'middle', 'Menlo, monospace'));
  b += kit.text(65, 479, '合成示例 · 状态与事件均为示意', 14, s.muted, 500);
  return kit.svg(b);
}
