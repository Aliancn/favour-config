// Original, editable layouts for three article-motion visual families.
const fade = (kit, t, start, duration, svg, reset = 1) => kit.group(kit.reveal(t, start, duration) * reset, svg);
const loopReset = (kit, t) => 1 - kit.reveal(t, 4.62, .34);

export function evidence(t, kit, portrait = false) {
  const s = kit.style, reset = loopReset(kit, t);
  const mark = kit.reveal(t, .9, .75) * reset;
  let b = '';
  if (!portrait) {
    b += kit.text(48, 50, '观察 / 原文摘句', 19, s.muted, 600);
    b += kit.rect(40, 78, 650, 391, s.surface, 3, s.line, 1.5);
    b += kit.rect(40, 78, 8, 391, s.accent, 0);
    b += kit.text(83, 142, '“据我们观察，', 34, s.ink, 600, 'start', s.titleFont);
    b += kit.text(83, 202, '一个人通常只能同时跟进', 34, s.ink, 600, 'start', s.titleFont);
    b += kit.text(83, 272, '3 到 5 个活跃 Session。”', 38, s.ink, 700, 'start', s.titleFont);
    b += kit.rect(83, 286, 492 * mark, 7, s.accent, 0);
    b += kit.text(83, 414, '文章转述 · DeepSeek Harness 团队的观察', 18, s.muted, 500);
    b += kit.text(742, 138, '注意力窗口', 24, s.ink, 650);
    b += kit.line(742, 160, 918, 160, s.line, 2);
    b += fade(kit, t, 1.2, .55, kit.text(733, 291, '3–5', 98, s.accent, 700, 'start', s.titleFont), reset);
    b += fade(kit, t, 2.1, .5, kit.textLines(742, 350, ['活跃会话', '是人的跟进上限'], 23, 34, s.ink, 550), reset);
    b += kit.text(48, 515, '来源：文章开篇；这里呈现的是观察，不是实验定律。', 18, s.muted, 500);
  } else {
    b += kit.text(31, 54, '观察 / 原文摘句', 20, s.muted, 600);
    b += kit.rect(27, 87, 486, 520, s.surface, 4, s.line, 1.5);
    b += kit.rect(27, 87, 8, 520, s.accent, 0);
    b += kit.text(57, 168, '“据我们观察，', 33, s.ink, 600, 'start', s.titleFont);
    b += kit.textLines(57, 235, ['一个人通常只能', '同时跟进'], 33, 58, s.ink, 600, s.titleFont);
    b += kit.textLines(57, 398, ['3 到 5 个', '活跃 Session。”'], 38, 67, s.ink, 700, s.titleFont);
    b += kit.rect(57, 483, 407 * mark, 7, s.accent, 0);
    b += kit.textLines(57, 548, ['文章转述 · DeepSeek Harness', '团队的观察'], 18, 27, s.muted, 500);
    b += kit.text(32, 695, '人的注意力窗口', 30, s.ink, 650);
    b += kit.line(32, 717, 508, 717, s.line, 2);
    b += fade(kit, t, 1.2, .55, kit.text(28, 830, '3–5', 92, s.accent, 700, 'start', s.titleFont), reset);
    b += fade(kit, t, 2.1, .5, kit.text(272, 815, '活跃会话', 28, s.ink, 600), reset);
    b += kit.text(32, 930, '来源：文章开篇 · 观察并非实验定律', 18, s.muted, 500);
  }
  return kit.svg(b);
}

export function data(t, kit, portrait = false) {
  const s = kit.style, reset = loopReset(kit, t);
  const numberFont = 'DIN Alternate, Avenir Next, sans-serif';
  const first = kit.reveal(t, .45, 1.0) * reset;
  const second = kit.reveal(t, 1.75, 1.0) * reset;
  const max = 3500;
  let b = '';
  if (!portrait) {
    b += kit.text(48, 55, '关闭直通，Router 读得更多', 40, s.ink, 700, 'start', s.titleFont);
    b += kit.text(49, 89, '缓存读取 token · 万 · 文章转述的消融结果', 19, s.muted, 500);
    const x = 260, w = 595;
    b += kit.line(x, 144, x, 397, s.line, 2);
    b += kit.text(49, 223, '开启直通', 25, s.ink, 600);
    b += kit.text(49, 352, '关闭直通', 25, s.ink, 600);
    b += kit.rect(x, 175, w, 61, '#E4EBEB', 3);
    b += kit.rect(x, 304, w, 61, '#E4EBEB', 3);
    b += kit.rect(x, 175, w * 2323 / max * first, 61, s.secondary, 3);
    b += kit.rect(x, 304, w * 3177 / max * second, 61, s.accent, 3);
    b += fade(kit, t, 1.45, .3, kit.text(x + w * 2323 / max + 14, 216, '2323', 28, s.ink, 700, 'start', numberFont) + kit.text(x + w * 2323 / max + 93, 216, '万', 22, s.ink, 600), reset);
    b += fade(kit, t, 2.75, .3, kit.text(x + w * 3177 / max + 14, 345, '3177', 28, s.ink, 700, 'start', numberFont) + kit.text(x + w * 3177 / max + 93, 345, '万', 22, s.ink, 600), reset);
    b += fade(kit, t, 3.1, .45, kit.text(50, 455, '差值', 26, s.accent, 700) + kit.text(113, 455, '854', 33, s.accent, 700, 'start', numberFont) + kit.text(180, 455, '万 token', 25, s.accent, 650), reset);
    b += kit.text(49, 510, '来源：文章「Agent 不再等你下令」；差值由文中两数相减。', 18, s.muted, 500);
  } else {
    b += kit.textLines(32, 71, ['关闭直通后，', 'Router 读得更多'], 42, 58, s.ink, 700, s.titleFont);
    b += kit.text(32, 182, '缓存读取 token · 万', 21, s.muted, 500);
    b += kit.text(32, 226, '文章转述的消融结果', 18, s.muted, 500);
    const x = 35, w = 450;
    b += kit.text(35, 306, '开启直通', 26, s.ink, 650);
    b += kit.rect(x, 330, w, 66, '#E4EBEB', 3);
    b += kit.rect(x, 330, w * 2323 / max * first, 66, s.secondary, 3);
    b += fade(kit, t, 1.45, .3, kit.text(35, 431, '2323', 39, s.ink, 700, 'start', numberFont) + kit.text(133, 431, '万', 28, s.ink, 600), reset);
    b += kit.text(35, 513, '关闭直通', 26, s.ink, 650);
    b += kit.rect(x, 537, w, 66, '#E4EBEB', 3);
    b += kit.rect(x, 537, w * 3177 / max * second, 66, s.accent, 3);
    b += fade(kit, t, 2.75, .3, kit.text(35, 641, '3177', 39, s.ink, 700, 'start', numberFont) + kit.text(133, 641, '万', 28, s.ink, 600), reset);
    b += kit.line(34, 714, 504, 714, s.line, 1.5);
    b += fade(kit, t, 3.1, .45, kit.text(34, 786, '多', 43, s.accent, 700) + kit.text(92, 786, '854', 53, s.accent, 700, 'start', numberFont) + kit.text(195, 786, '万', 40, s.accent, 700), reset);
    b += kit.textLines(34, 876, ['来源：文章「Agent 不再等你下令」', '差值由文中两数相减'], 18, 29, s.muted, 500);
  }
  return kit.svg(b);
}

export function state(t, kit, portrait = false) {
  const s = kit.style, reset = loopReset(kit, t);
  const picked = kit.reveal(t, .75, .6) * reset;
  let b = '';
  if (!portrait) {
    b += kit.text(45, 53, '邮件中的时间，成为日历字段', 37, s.ink, 700, 'start', s.titleFont);
    b += kit.text(46, 85, '合成示例 · 展示字段转移，不代表真实产品界面', 18, s.muted, 500);
    b += kit.rect(42, 123, 520, 339, s.surface, 15, s.line, 1.4);
    b += kit.text(68, 161, '收件箱  /  设计评审', 20, s.muted, 600);
    b += kit.line(68, 176, 536, 176, s.line, 1.2);
    b += kit.circle(90, 216, 20, s.secondary, 'none');
    b += kit.text(90, 222, '林', 19, s.ink, 700, 'middle');
    b += kit.text(124, 222, '林小姐', 22, s.ink, 650);
    b += kit.text(491, 221, '09:20', 18, s.muted, 500, 'end');
    b += kit.text(70, 289, '周五设计评审', 33, s.ink, 700);
    b += kit.text(70, 343, '11 月 6 日  ·  14:00', 26, s.ink, 600);
    b += kit.rect(69, 355, 373 * picked, 6, s.accent, 0);
    b += kit.text(70, 428, '邀请内容  ·  线上会议', 18, s.muted, 500);
    b += fade(kit, t, 1.75, .65, kit.line(562, 314, 648, 314, s.accent, 4) + kit.path('M637 306L649 314L637 322', 'none', s.accent, 3), reset);
    b += kit.rect(654, 147, 268, 291, s.surface, 15, s.line, 1.4);
    b += kit.rect(654, 147, 268, 62, s.secondary, 15);
    b += kit.text(678, 185, '日历  /  11 月', 23, s.ink, 650);
    b += kit.line(678, 266, 899, 266, s.line, 1);
    b += fade(kit, t, 2.7, .6, kit.text(678, 252, '06  周五', 34, s.accent, 700) + kit.text(678, 316, '设计评审', 27, s.ink, 700) + kit.text(678, 360, '14:00 · 线上', 22, s.muted, 550), reset);
    b += fade(kit, t, 3.55, .3, kit.text(678, 407, '字段已写入示例日历', 17, s.muted, 500), reset);
    b += kit.text(44, 514, '字段对应：邮件主题 → 日程标题；日期和时间 → 日历时段', 18, s.muted, 500);
  } else {
    b += kit.textLines(30, 64, ['邮件中的时间，', '成为日历字段'], 38, 54, s.ink, 700, s.titleFont);
    b += kit.text(31, 154, '合成示例 · 非真实产品界面', 18, s.muted, 500);
    b += kit.rect(26, 193, 488, 322, s.surface, 15, s.line, 1.4);
    b += kit.text(54, 232, '收件箱  /  设计评审', 21, s.muted, 600);
    b += kit.line(54, 249, 486, 249, s.line, 1.2);
    b += kit.circle(78, 285, 19, s.secondary, 'none');
    b += kit.text(78, 291, '林', 18, s.ink, 700, 'middle');
    b += kit.text(112, 292, '林小姐', 22, s.ink, 650);
    b += kit.text(456, 292, '09:20', 18, s.muted, 500, 'end');
    b += kit.text(54, 365, '周五设计评审', 32, s.ink, 700);
    b += kit.text(54, 422, '11 月 6 日 · 14:00', 25, s.ink, 600);
    b += kit.rect(54, 435, 365 * picked, 6, s.accent, 0);
    b += kit.text(54, 482, '邀请内容 · 线上会议', 18, s.muted, 500);
    b += fade(kit, t, 1.75, .65, kit.line(270, 515, 270, 591, s.accent, 4) + kit.path('M261 579L270 592L279 579', 'none', s.accent, 3), reset);
    b += kit.rect(26, 603, 488, 274, s.surface, 15, s.line, 1.4);
    b += kit.rect(26, 603, 488, 58, s.secondary, 15);
    b += kit.text(54, 642, '日历 / 11 月', 23, s.ink, 650);
    b += fade(kit, t, 2.7, .6, kit.text(55, 710, '06  周五', 32, s.accent, 700) + kit.text(55, 766, '设计评审', 28, s.ink, 700) + kit.text(55, 814, '14:00 · 线上', 23, s.muted, 550), reset);
    b += kit.textLines(29, 916, ['字段对应：主题 → 标题', '日期和时间 → 日历时段'], 18, 28, s.muted, 500);
  }
  return kit.svg(b);
}
