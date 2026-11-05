export const meta = {
  title: '同一件事，两种路径', style: 'swiss-grid', width: 960, height: 540, fps: 30, duration: 5,
  sourceRefs: [{ source: 'Synthetic demo: 三类日常消息分别打开处理，或先归入一个收件箱再按类型分组。', claim: 'Two illustrative ways to organize incoming messages.', status: 'synthetic example' }],
};
export function draw(t, kit) {
  const s = kit.style, reset = 1 - kit.reveal(t, 4.55, .4), p = kit.reveal(t, .9, 2.4) * reset;
  let b = kit.rect(0, 0, 960, 90, s.surface, 0) + kit.text(43, 42, 'SYSTEMATIC / 02', 14, s.muted, 700, 'start', 'Arial, sans-serif');
  b += kit.text(43, 78, meta.title, 38, s.ink, 700);
  b += kit.rect(43, 121, 414, 363, s.ink, 0) + kit.rect(473, 121, 444, 363, s.surface, 0, s.line, 1.4);
  b += kit.text(66, 175, '01', 52, s.surface, 700) + kit.text(152, 168, '分散处理', 27, s.surface, 700);
  b += kit.text(66, 212, '每条消息都要切换上下文', 17, '#CCD3CD', 500);
  ['邮件', '消息', '日程'].forEach((v, i) => {
    const y = 246 + i * 66;
    b += kit.line(67, y + 39, 430, y + 39, '#57605A', 1);
    b += kit.text(67, y + 18, `0${i + 1}`, 17, '#CCD3CD', 700) + kit.text(121, y + 20, v, 23, s.surface, 650);
    b += kit.text(401, y + 20, '↗', 22, '#CCD3CD', 600, 'end');
  });
  b += kit.rect(473, 121, 9, 363, s.accent, 0);
  b += kit.text(509, 174, '02', 52, s.accent, 700) + kit.text(593, 168, '集中归类', 27, s.ink, 700);
  b += kit.text(509, 211, '统一收件箱 → 类型分组', 17, s.muted, 500);
  b += kit.rect(509, 244, 374, 202, s.secondary, 0);
  b += kit.text(530, 279, 'INBOX', 15, s.muted, 700, 'start', 'Arial, sans-serif');
  ['邮件', '消息', '日程'].forEach((v, i) => {
    const w = 333 * kit.reveal(t, 1.15 + i * .6, .5) * reset;
    b += kit.rect(530, 295 + i * 44, w, 35, s.surface, 0, s.line, 1);
    b += kit.group(kit.reveal(t, 1.35 + i * .6, .35) * reset, kit.text(546, 319 + i * 44, v, 18, s.ink, 650));
  });
  b += kit.rect(43, 505, 874 * p, 4, s.accent, 0);
  b += kit.text(43, 529, '合成示例 · 两种路径仅用于比较', 15, s.muted, 500);
  return kit.svg(b);
}
