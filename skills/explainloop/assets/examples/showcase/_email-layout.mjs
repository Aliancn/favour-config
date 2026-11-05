export function drawEmail(t, kit, profile) {
  const s = kit.style, reset = 1 - kit.reveal(t, 4.58, .36), placed = kit.reveal(t, 2.05, .55) * reset, route = kit.reveal(t, 1.0, 1.0) * reset, done = kit.reveal(t, 3.45, .45) * reset;
  const email = (x, y, w) => kit.emailCard(x, y, w, 183, { sender: '林小姐', subject: '周五设计评审', preview: '14:00 · 线上会议', time: '09:20' });
  const event = (x, y, w) => kit.eventCard(x, y, w, 175, { month: 'NOV', day: '06', title: '设计评审', time: '周五 14:00' });
  const title = (x, y, size) => kit.text(x, y, '一封邮件，变成日程', size, s.ink, 700, 'start', s.titleFont);
  let b = '';
  if (profile === '16x9') {
    b += kit.rect(0, 0, 960, 162, '#F2E2D2', 0);
    b += kit.rect(40, 36, 880, 468, s.surface, 18);
    b += kit.text(70, 75, 'WORKFLOW / 01', 14, s.muted, 700) + title(70, 129, 43);
    b += email(70, 176, 378);
    b += kit.group(route, kit.line(450, 277, 542, 277, s.accent, 3) + kit.circle(450 + 92 * route, 277, 7, s.accent, 'none'));
    b += kit.group(placed, event(550, 180, 320));
    b += kit.group(done, kit.statusBadge(651, 314, '已安排', 'success'));
    b += kit.text(70, 454, '读取邀请  /  识别时间  /  写入日历', 18, s.muted, 550);
    b += kit.text(70, 486, '合成示例 · 不代表真实产品界面', 15, s.muted, 500);
  } else if (profile === '4x3') {
    b += kit.rect(0, 0, 960, 202, '#F2E2D2', 0);
    b += kit.rect(42, 42, 876, 628, s.surface, 18);
    b += kit.text(76, 84, 'WORKFLOW / 02', 15, s.muted, 700) + title(76, 144, 43);
    b += email(76, 205, 440);
    b += kit.group(route, kit.line(515, 378, 581, 432, s.accent, 3) + kit.circle(515 + 66 * route, 378 + 54 * route, 7, s.accent, 'none'));
    b += kit.group(placed, event(570, 429, 310));
    b += kit.group(done, kit.statusBadge(672, 565, '已安排', 'success'));
    b += kit.text(76, 590, '邀请到日程', 25, s.ink, 650);
    b += kit.text(76, 637, '合成示例 · 不代表真实产品界面', 15, s.muted, 500);
  } else if (profile === '1x1') {
    b += kit.rect(0, 0, 960, 240, '#F2E2D2', 0);
    b += kit.rect(45, 45, 870, 870, s.surface, 20);
    b += kit.text(80, 100, 'WORKFLOW / 03', 17, s.muted, 700) + title(80, 166, 48);
    b += kit.text(80, 211, '从邀请中找到时间，让日程有了位置。', 20, s.muted, 500);
    b += email(150, 275, 660);
    b += kit.group(route, kit.line(480, 460, 480, 535, s.accent, 3) + kit.circle(480, 460 + 75 * route, 8, s.accent, 'none'));
    b += kit.group(placed, event(195, 565, 570));
    b += kit.group(done, kit.statusBadge(297, 702, '已安排', 'success'));
    b += kit.text(80, 822, '读取邀请  →  识别时间  →  写入日历', 22, s.ink, 600);
    b += kit.text(80, 873, '合成示例 · 不代表真实产品界面', 18, s.muted, 500);
  } else {
    b += kit.rect(0, 0, 540, 255, '#F2E2D2', 0);
    b += kit.rect(24, 25, 492, 911, s.surface, 19);
    b += kit.text(49, 71, 'WORKFLOW / 04', 15, s.muted, 700);
    b += kit.text(49, 134, '一封邮件，', 45, s.ink, 700, 'start', s.titleFont);
    b += kit.text(49, 190, '变成日程', 45, s.ink, 700, 'start', s.titleFont);
    b += kit.text(49, 233, '邀请 → 时间 → 日历', 19, s.muted, 550);
    b += email(49, 277, 442);
    b += kit.group(route, kit.line(270, 461, 270, 525, s.accent, 3) + kit.circle(270, 461 + 64 * route, 8, s.accent, 'none'));
    b += kit.group(placed, event(73, 553, 394));
    b += kit.group(done, kit.statusBadge(175, 688, '已安排', 'success'));
    b += kit.text(49, 824, '读取邀请', 23, s.ink, 650);
    b += kit.text(49, 865, '识别时间 · 写入日历', 23, s.ink, 650);
    b += kit.text(49, 912, '合成示例 · 非真实产品界面', 16, s.muted, 500);
  }
  return kit.svg(b);
}
