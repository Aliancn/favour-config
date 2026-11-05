export const meta = {
  title: '一条需求的来处', style: 'museum-gallery', width: 960, height: 540, fps: 30, duration: 5,
  sourceRefs: [{ source: 'Synthetic demo: 一条会议需求由邮件提出，记录来源、时间和处理结论。', claim: 'A source document can be inspected before a decision is recorded.', status: 'synthetic example' }],
};
export function draw(t, kit) {
  const s = kit.style, reset = 1 - kit.reveal(t, 4.55, .4), inspect = kit.reveal(t, .9, 2.5) * reset, note = kit.reveal(t, 3.45, .45) * reset;
  let b = kit.rect(31, 28, 898, 484, s.surface, 2, s.line, 1.2);
  b += kit.text(62, 64, 'EXHIBIT / 01', 14, s.accent, 700, 'start', 'Menlo, monospace');
  b += kit.text(62, 118, meta.title, 47, s.ink, 700, 'start', s.titleFont);
  b += kit.text(63, 150, '先看原始信息，再记录处理结果。', 19, s.muted, 500);
  b += kit.rect(62, 190, 482, 273, '#E1E8E3', 2);
  b += kit.rect(92, 212, 422, 230, s.surface, 2, s.line, 1.3);
  b += kit.text(118, 249, 'SOURCE DOCUMENT', 14, s.accent, 700, 'start', 'Menlo, monospace');
  b += kit.line(118, 262, 489, 262, s.line, 1);
  b += kit.text(118, 309, '会议需求', 32, s.ink, 700, 'start', s.titleFont);
  b += kit.text(118, 352, '周五 14:00 · 线上', 22, s.ink, 500);
  b += kit.group(inspect, kit.rect(114, 367, 287, 4, s.accent, 1));
  b += kit.text(118, 411, '合成邮件示例', 16, s.muted, 500);
  b += kit.text(580, 231, 'CATALOG NOTE', 14, s.muted, 700, 'start', 'Menlo, monospace');
  b += kit.line(579, 245, 892, 245, s.line, 1);
  b += kit.text(580, 289, '来源', 17, s.muted, 600) + kit.text(683, 289, '会议邀请邮件', 20, s.ink, 650);
  b += kit.text(580, 336, '时间', 17, s.muted, 600) + kit.text(683, 336, '周五 14:00', 20, s.ink, 650);
  b += kit.group(note, kit.rect(579, 369, 307, 70, s.secondary, 3) + kit.text(595, 397, '处理结论', 15, s.muted, 600) + kit.text(595, 426, '写入日历', 22, s.accent, 700));
  b += kit.text(62, 490, '合成示例 · 文档内容不代表真实邮件', 15, s.muted, 500);
  return kit.svg(b);
}
