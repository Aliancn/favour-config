export const meta = {
  title: 'Router 与 Worker 分工', style: 'technical-blueprint', width: 960, height: 540, fps: 30, duration: 5,
  sourceRefs: [{ source: 'generate/blogs/2026-11-01-deepseek-superagent-prototype_排版优化.md > 上下文交给 Router，并发交给 Worker', claim: 'Router handles human interaction and global routing while isolated Workers run tasks concurrently.', status: 'article-reported architecture' }],
};
export function draw(t, kit) {
  const s = kit.style, reset = 1 - kit.reveal(t, 4.55, .4), step = kit.reveal(t, .8, .8) * reset, branch = kit.reveal(t, 1.65, .9) * reset;
  let b = kit.text(45, 43, 'ARCHITECTURE / ROUTING', 14, s.muted, 700, 'start', 'Menlo, monospace');
  b += kit.text(45, 101, meta.title, 42, s.ink, 700);
  b += kit.text(46, 134, '一个对外入口，三个隔离执行面', 20, s.muted, 500);
  b += kit.line(45, 160, 915, 160, s.line, 1);
  b += kit.rect(45, 208, 207, 222, s.surface, 8, s.line, 1.2);
  b += kit.text(64, 241, 'HUMAN EVENT', 14, s.accent, 700, 'start', 'Menlo, monospace');
  b += kit.icon('message-circle', 73, 293, 47, s.ink);
  b += kit.text(66, 387, '新的任务', 26, s.ink, 650);
  b += kit.rect(350, 197, 248, 244, s.secondary, 9, s.accent, 1.6);
  b += kit.text(372, 240, 'ROUTER', 28, s.ink, 700, 'start', 'Menlo, monospace');
  b += kit.line(372, 258, 575, 258, s.line, 1);
  b += kit.text(372, 313, '接入', 22, s.ink, 650) + kit.text(372, 357, '分派', 22, s.ink, 650) + kit.text(372, 401, '对外沟通', 22, s.ink, 650);
  b += kit.rect(252, 316, 98 * step, 3, s.accent, 0);
  ['隔离任务 A', '隔离任务 B', '隔离任务 C'].forEach((v, i) => {
    const y = 190 + i * 90, p = kit.reveal(t, 1.75 + i * .4, .45) * reset;
    b += kit.rect(697, y, 218, 69, s.surface, 7, s.line, 1.2);
    b += kit.rect(697, y, 4, 69, p ? s.accent : s.line, 0);
    b += kit.text(714, y + 27, `WORKER 0${i + 1}`, 13, s.muted, 700, 'start', 'Menlo, monospace');
    b += kit.text(714, y + 52, v, 21, s.ink, 600);
    b += kit.group(branch * p, kit.line(598, 317, 697, y + 34, s.accent, 1.8));
    const packet = kit.reveal(t, 1.9 + i * .31, 2.2) * reset;
    b += kit.group(p * reset, kit.circle(598 + 99 * packet, 317 + (y + 34 - 317) * packet, 4, s.accent, 'none'));
  });
  b += kit.text(45, 503, '文章转述的架构 · Worker 名称为示意', 16, s.muted, 500);
  return kit.svg(b);
}
