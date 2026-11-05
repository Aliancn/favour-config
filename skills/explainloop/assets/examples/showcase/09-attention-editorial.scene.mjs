export const meta = {
  title: '人的注意力先到上限',
  style: 'editorial-paper',
  styleOverrides: {
    bg: '#F4F1E9', surface: '#FFFEFA', ink: '#202624', muted: '#5B6864', line: '#D1D6D1',
    accent: '#B94F36', positive: '#4D704B', secondary: '#E9ECE7',
    titleFont: 'Songti SC, serif', bodyFont: 'PingFang SC, sans-serif',
  },
  width: 960, height: 540, fps: 30, duration: 5,
  sourceRefs: [{
    source: 'generate/blogs/2026-11-01-deepseek-superagent-prototype_排版优化.md > 开篇注意力段落',
    claim: '文章转述团队观察：一个人通常只能同时跟进 3 到 5 个活跃 Session；多任务切换增加人的注意力负担。',
    status: 'article-reported observation and editorial interpretation',
  }],
};

export function draw(t, kit) {
  const s = kit.style;
  const enter2 = kit.reveal(t, 1.05, .36);
  const enter3 = kit.reveal(t, 2.06, .36);
  const reset = 1 - kit.reveal(t, 4.55, .35);
  const focusY = 120 + 112 * kit.reveal(t, 1.31, .42) + 112 * kit.reveal(t, 2.36, .42) - 224 * kit.reveal(t, 3.73, .67);
  const panel = (i, y, label, iconName) => {
    const x = 468, w = 426, h = 101;
    let body = kit.rect(x + 3, y + 6, w, h, '#DDE0DA', 10, 'none');
    body += kit.rect(x, y, w, h, s.surface, 10, '#CAD1CB', 1.2);
    body += kit.circle(x + 22, y + 24, 4.5, i === 0 ? s.accent : '#8A9A94', 'none');
    body += kit.text(x + 38, y + 29, `SESSION / 0${i + 1}`, 12, s.muted, 700, 'start', 'Menlo, monospace');
    body += kit.text(x + w - 21, y + 29, ['BUG FIX', 'FEATURE', 'REVIEW'][i], 12, s.muted, 600, 'end', 'Menlo, monospace');
    body += kit.line(x + 18, y + 40, x + w - 18, y + 40, '#E1E5DF', 1);
    body += kit.icon(iconName, x + 19, y + 56, 23, s.ink);
    body += kit.text(x + 54, y + 76, label, 22, s.ink, 650);
    body += kit.rect(x + 264, y + 57, 108, 5, '#D8DED8', 2);
    body += kit.rect(x + 264, y + 69, 72 + 10 * i, 5, '#E5E9E3', 2);
    body += kit.rect(x + 264, y + 81, 94 - 9 * i, 5, '#D8DED8', 2);
    return body;
  };
  let body = kit.rect(444, 76, 466, 413, '#E8EDE7', 9);
  body += kit.text(52, 49, 'FIELD NOTE   /   SUPER-AGENT', 14, s.muted, 700, 'start', 'Menlo, monospace');
  body += kit.text(894, 49, '01 — ATTENTION', 13, s.muted, 650, 'end', 'Menlo, monospace');
  body += kit.line(52, 64, 894, 64, s.line, 1);
  body += kit.text(52, 135, '人的注意力', 55, s.ink, 700, 'start', s.titleFont);
  body += kit.text(52, 198, '先到上限', 55, s.ink, 700, 'start', s.titleFont);
  body += kit.rect(54, 227, 52, 5, s.accent, 2);
  body += kit.text(49, 365, '3–5', 120, s.accent, 700, 'start', s.titleFont);
  body += kit.text(55, 399, '活跃 Session · 文章转述观察', 18, s.muted, 550);
  body += kit.line(54, 428, 393, 428, s.line, 1);
  body += kit.group(kit.reveal(t, 3.05, .35) * reset,
    kit.text(54, 461, '任务在推进，人的视线却在', 19, s.ink, 550) +
    kit.text(54, 490, '多个上下文之间反复切换。', 19, s.ink, 550));
  body += kit.text(54, 522, '来源：文章开篇 · 会话数量为转述观察', 13, s.muted, 500);
  body += kit.line(430, 84, 430, 486, s.line, 1);
  body += kit.text(468, 95, 'THREE SIMULTANEOUS THREADS', 12, s.muted, 700, 'start', 'Menlo, monospace');
  body += panel(0, 110, '修复缺陷', 'git-pull-request');
  body += kit.group(enter2 * reset, kit.move((1 - enter2) * 20, 0, panel(1, 222, '开发功能', 'layers')));
  body += kit.group(enter3 * reset, kit.move((1 - enter3) * 20, 0, panel(2, 334, '审查代码', 'search')));
  body += kit.rect(453, focusY, 5, 20 + 58 * kit.reveal(t, .08, .84) * reset, s.accent, 2);
  body += kit.text(468, 488, '焦点在会话间移动', 15, s.muted, 550);
  return kit.svg(body);
}
