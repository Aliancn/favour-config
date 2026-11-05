export const meta = {
  title: '从三处，到一处', style: 'chromatic-poster', width: 960, height: 540, fps: 30, duration: 5,
  sourceRefs: [{ source: 'Synthetic demo: 三类消息原本分散在不同入口，随后汇入一个收件箱。', claim: 'Three incoming categories are collected in one place.', status: 'synthetic example' }],
};
export function draw(t, kit) {
  const s = kit.style, reset = 1 - kit.reveal(t, 4.55, .4), join = kit.reveal(t, 1.2, 1.5) * reset, result = kit.reveal(t, 2.85, .6) * reset;
  let b = kit.rect(0, 0, 960, 540, s.ink, 0);
  b += kit.rect(578, 0, 382, 540, s.accent, 0);
  b += kit.text(45, 60, 'POSTER / 03', 14, s.surface, 700, 'start', 'Arial, sans-serif');
  b += kit.text(45, 162, '三处', 105, s.surface, 700);
  b += kit.text(45, 275, '→ 一处', 95, s.surface, 700);
  b += kit.line(45, 309, 528, 309, '#69716C', 1.5);
  b += kit.text(45, 356, '邮件  /  消息  /  日程', 22, s.surface, 600);
  b += kit.text(45, 468, '合成示例：统一收件箱', 19, '#C7CEC8', 500);
  b += kit.rect(629, 107, 280, 325, s.surface, 0);
  b += kit.text(652, 151, 'INBOX', 18, s.ink, 700, 'start', 'Arial, sans-serif');
  ['邮件', '消息', '日程'].forEach((v, i) => {
    const y = 191 + i * 64, p = kit.reveal(t, 1.25 + i * .42, .4) * join;
    b += kit.rect(651, y, 235 * p, 49, i === 1 ? s.secondary : '#F4F1E9', 0);
    b += kit.group(p, kit.text(667, y + 32, v, 22, s.ink, 700));
  });
  b += kit.group(result, kit.text(652, 409, 'ONE PLACE / 01', 15, s.accent, 700, 'start', 'Arial, sans-serif'));
  return kit.svg(b);
}
