export const meta = {
  title: '注意力先碰到上限', style: 'editorial-paper', width: 960, height: 540, fps: 30, duration: 5,
  sourceRefs: [{ source: 'generate/blogs/2026-11-01-deepseek-superagent-prototype_排版优化.md > 开篇注意力段落', claim: '文章转述团队观察：一个人通常只能同时跟进 3 到 5 个活跃 Session。', status: 'article-reported observation' }],
};
export function draw(t, kit) {
  const s = kit.style, reset = 1 - kit.reveal(t, 4.55, .4);
  const focusY = 162 + 109 * kit.reveal(t, .75, .8) + 109 * kit.reveal(t, 2.0, .8) - 218 * kit.reveal(t, 3.25, .9);
  let b = kit.rect(0, 0, 405, 540, s.surface, 0);
  b += kit.text(50, 48, 'FIELD NOTE  /  01', 14, s.muted, 700, 'start', 'Menlo, monospace');
  b += kit.text(50, 115, '注意力', 58, s.ink, 700, 'start', s.titleFont);
  b += kit.text(50, 180, '先碰到上限', 48, s.ink, 700, 'start', s.titleFont);
  b += kit.text(47, 365, '3–5', 137, s.accent, 700, 'start', s.titleFont);
  b += kit.text(53, 407, '活跃 Session', 23, s.ink, 650);
  b += kit.line(53, 449, 354, 449, s.line, 1.4);
  b += kit.text(53, 482, '文章转述的团队观察', 16, s.muted, 500);
  b += kit.text(458, 60, '人的视线只能落在一处', 27, s.ink, 700);
  b += kit.text(458, 94, '任务同时推进，注意力不断切换。', 17, s.muted, 500);
  ['修复缺陷', '开发功能', '审查代码'].forEach((label, i) => {
    const y = 142 + i * 109, appear = kit.reveal(t, .2 + i * .65, .35) * reset;
    b += kit.group(appear, kit.rect(458, y, 444, 86, s.surface, 9, s.line, 1.2) +
      kit.text(478, y + 28, `SESSION 0${i + 1}`, 14, s.muted, 700, 'start', 'Menlo, monospace') +
      kit.text(478, y + 61, label, 24, s.ink, 650) +
      kit.rect(858, y + 20, 6, 46, s.secondary, 3));
  });
  b += kit.group(reset * kit.reveal(t, .2, .3), kit.rect(445, focusY, 5, 44, s.accent, 2));
  b += kit.text(458, 504, '焦点在会话间移动  →', 17, s.accent, 650);
  return kit.svg(b);
}
