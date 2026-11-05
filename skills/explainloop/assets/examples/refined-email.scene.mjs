export const meta = {
  title: '一封邮件，变成日程',
  style: 'playful-illustrated',
  width: 960,
  height: 540,
  fps: 30,
  duration: 5,
  sourceRefs: [{
    source: 'Synthetic sample: 收到设计评审邮件，识别时间，加入日历。',
    claim: 'A sample email-to-calendar workflow.',
    status: 'synthetic example',
  }],
};

export function draw(t, kit) {
  const s = kit.style;
  const reset = 1 - kit.reveal(t, 4.58, .36);
  const route = kit.reveal(t, 1.25, .85) * reset;
  const placed = kit.reveal(t, 2.2, .65) * reset;
  const confirmed = kit.reveal(t, 3.75, .4) * reset;
  let body = kit.rect(0, 0, 960, 145, '#F2E2D2', 0);
  body += kit.rect(34, 31, 892, 476, s.surface, 16);
  body += kit.text(58, 70, '合成示例   /   邮件 → 日历', 17, s.muted, 650);
  body += kit.text(58, 123, meta.title, 42, s.ink, 700, 'start', s.titleFont);
  body += kit.line(58, 144, 902, 144, s.line, 1.5);
  body += kit.emailCard(58, 170, 389, 183, {
    sender: '林小姐', subject: '周五设计评审', preview: '14:00 · 线上会议', time: '09:20',
  });
  body += kit.rect(76, 311, 174 * kit.reveal(t, .7, .65) * reset, 3, s.accent, 1);
  body += kit.group(route, kit.flowArrow(476, 258, 476 + 89 * route, 258));
  body += kit.group(placed, kit.eventCard(585, 180, 316, 161, {
    month: 'NOV', day: '06', title: '设计评审', time: '周五 14:00',
  }));
  body += kit.group(placed, kit.rect(687, 265, 116 * kit.reveal(t, 2.9, 1.15), 3, s.accent, 1));
  body += kit.group(confirmed, kit.statusBadge(687, 299, '已安排', 'success'));
  const steps = [
    ['01', '读取邀请', .15],
    ['02', '识别时间', 1.25],
    ['03', '写入日历', 2.6],
  ];
  steps.forEach(([number, label, start], i) => {
    const x = 91 + i * 301;
    const active = kit.reveal(t, start, .25) * reset;
    body += kit.circle(x, 405, 21, s.secondary, 'none');
    body += kit.text(x, 412, number, 16, s.muted, 700, 'middle');
    body += kit.text(x + 36, 412, label, 20, s.muted, 650);
    body += kit.group(active, kit.circle(x, 405, 21, s.accent, 'none') +
      kit.text(x, 412, number, 16, s.surface, 700, 'middle') +
      kit.text(x + 36, 412, label, 20, s.ink, 650));
  });
  body += kit.line(58, 458, 902, 458, s.line, 1);
  body += kit.text(58, 488, '邮件内容和日期仅用于演示组件；不代表真实产品界面。', 16, s.muted, 500);
  return kit.svg(body);
}
