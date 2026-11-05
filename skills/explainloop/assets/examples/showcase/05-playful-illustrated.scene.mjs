export const meta = {
  title: '一封邮件，变成日程', style: 'playful-illustrated', width: 960, height: 540, fps: 30, duration: 5,
  sourceRefs: [{ source: 'Synthetic demo: 收到会议邀请邮件；确认时间后，将会议加入日历。', claim: 'An illustrative email-to-calendar sequence.', status: 'synthetic example' }],
};
export function draw(t, kit) {
  const s = kit.style, reset = 1 - kit.reveal(t, 4.55, .4), fly = kit.reveal(t, 1.0, 1.45) * reset, done = kit.reveal(t, 2.3, .5) * reset;
  let b = kit.rect(0, 0, 960, 540, s.bg, 0);
  b += kit.rect(44, 40, 872, 452, '#FFE9CF', 24);
  b += kit.rect(61, 57, 838, 418, s.surface, 18);
  b += kit.text(89, 100, 'A SMALL WORKFLOW', 14, s.muted, 700, 'start', 'Arial, sans-serif');
  b += kit.text(89, 155, meta.title, 45, s.ink, 700);
  b += kit.text(89, 190, '收到邀请 → 识别时间 → 加入日历', 19, s.muted, 550);
  b += kit.emailCard(89, 229, 338, 184, { sender: '小陈', subject: '设计评审邀请', preview: '周五 14:00 · 线上', time: '09:20' });
  b += kit.group(fly, kit.line(427, 322, 550, 322, s.accent, 3) + kit.circle(427 + 123 * fly, 322, 8, s.accent, 'none'));
  b += kit.group(done, kit.eventCard(551, 234, 302, 177, { month: 'NOV', day: '06', title: '设计评审', time: '周五 14:00' }));
  b += kit.group(kit.reveal(t, 3.35, .4) * reset, kit.statusBadge(656, 365, '已安排', 'success'));
  b += kit.text(89, 447, '合成示例 · 细节用于说明流程', 15, s.muted, 500);
  return kit.svg(b);
}
