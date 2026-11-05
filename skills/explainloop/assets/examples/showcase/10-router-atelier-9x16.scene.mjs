export const meta = {
  title: '一个入口，并发执行',
  style: 'technical-blueprint',
  styleOverrides: {
    bg: '#101B1D', surface: '#18282A', ink: '#F2F4EC', muted: '#AFC0B9', line: '#385154',
    accent: '#D2E77E', positive: '#A2D1B0', secondary: '#23383A',
    titleFont: 'PingFang SC, sans-serif', bodyFont: 'PingFang SC, sans-serif', radius: 10, stroke: 1.4,
  },
  width: 540, height: 960, fps: 30, duration: 6,
  sourceRefs: [{
    source: 'generate/blogs/2026-11-01-deepseek-superagent-prototype_排版优化.md > 上下文交给 Router，并发交给 Worker',
    claim: 'Router 承接人类交互与全局路由；隔离上下文的 Workers 并发执行，并向 Router 汇报。',
    status: 'article-reported architecture; task labels A/B/C are schematic',
  }],
};

export function draw(t, kit) {
  const s = kit.style;
  const start = kit.reveal(t, .48, .7);
  const signal = kit.reveal(t, 1.25, .7);
  const reset = 1 - kit.reveal(t, 5.35, .5);
  const branch = i => kit.reveal(t, 1.74 + i * .18, .68);
  const worker = (i, y) => {
    const x = 80, w = 428, h = 58;
    const alpha = kit.reveal(t, 2.08 + i * .18, .35) * reset;
    let ghost = kit.rect(x, y, w, h, '#152326', 8, '#426064', 1.2);
    ghost += kit.text(x + 16, y + 22, `WORKER 0${i + 1}`, 12, '#819A9C', 700, 'start', 'Menlo, monospace');
    ghost += kit.text(x + 16, y + 45, `隔离上下文 ${'ABC'[i]}`, 18, '#849C9E', 550);
    let active = kit.rect(x, y, w, h, '#213538', 8, '#69888A', 1.2);
    active += kit.rect(x, y + 8, 4, h - 16, s.accent, 2);
    active += kit.text(x + 16, y + 22, `WORKER 0${i + 1}`, 12, s.accent, 700, 'start', 'Menlo, monospace');
    active += kit.text(x + 16, y + 45, `隔离上下文 ${'ABC'[i]}`, 18, s.ink, 600);
    active += kit.rect(x + 305, y + 42, 94, 4, '#4A6463', 2);
    active += kit.rect(x + 305, y + 42, (55 + i * 8) * kit.reveal(t, 2.48 + i * .13, 2.55), 4, s.accent, 2);
    return ghost + kit.group(alpha, active);
  };
  let body = kit.rect(20, 252, 500, 624, '#142527', 14);
  body += kit.text(32, 47, 'SYSTEM STUDY / SUPER-AGENT', 13, s.muted, 700, 'start', 'Menlo, monospace');
  body += kit.line(32, 63, 508, 63, s.line, 1);
  body += kit.text(32, 118, '一个入口，', 46, s.ink, 700);
  body += kit.text(32, 170, '并发执行', 46, s.ink, 700);
  body += kit.text(34, 207, 'Router 保持响应，Worker 独立处理任务。', 17, s.muted, 500);
  body += kit.line(32, 236, 508, 236, s.line, 1);
  body += kit.text(33, 269, '01 / EVENT SOURCES', 12, s.muted, 700, 'start', 'Menlo, monospace');
  body += kit.rect(33, 284, 474, 137, s.surface, 10, s.line, 1.2);
  const sources = [['message-circle', 'IM'], ['git-pull-request', 'PR'], ['mail', 'MAIL']];
  sources.forEach(([icon, label], i) => {
    const x = 54 + i * 151;
    if (i) body += kit.line(x - 13, 306, x - 13, 398, '#2F4648', 1);
    body += kit.icon(icon, x + 42, 317, 28, i === 0 && t > .48 ? s.accent : s.muted);
    body += kit.text(x + 56, 385, label, 17, s.ink, 600, 'middle', 'Menlo, monospace');
  });
  body += kit.group(start * reset, kit.line(270, 421, 270, 473, s.accent, 2));
  if (t >= .48 && t < 1.18) body += kit.circle(270, 421 + 52 * start, 5, s.accent, 'none');
  body += kit.text(80, 459, '02 / ROUTER', 12, s.muted, 700, 'start', 'Menlo, monospace');
  body += kit.rect(80, 474, 428, 181, '#1D3032', 12, '#6B8A88', 1.5);
  body += kit.rect(80, 474, 428, 4, s.accent, 1);
  body += kit.text(102, 517, 'ROUTER', 29, s.ink, 700, 'start', 'Menlo, monospace');
  body += kit.text(102, 540, 'ALWAYS AVAILABLE', 12, s.accent, 700, 'start', 'Menlo, monospace');
  body += kit.circle(270, 583, 30, '#22393A', '#86A8A3', 1.5);
  body += kit.circle(270, 583, 18, s.accent, 'none');
  body += kit.icon('layers', 259, 572, 22, '#18282A');
  body += kit.group(t >= 1.25 && t < 2.15 ? (1 - signal) * reset : 0, kit.circle(270, 583, 32 + 15 * signal, 'none', s.accent, 1.5));
  body += kit.text(315, 590, '接入 · 分派', 17, s.ink, 550);
  body += kit.text(102, 638, '一个对外入口', 16, s.muted, 550);
  body += kit.text(80, 700, '03 / ISOLATED WORKERS', 12, s.muted, 700, 'start', 'Menlo, monospace');
  const trunk = 'M112 655 C80 674 49 680 49 706 L49 882';
  body += `<path d="${trunk}" fill="none" stroke="${s.accent}" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="270" stroke-dashoffset="${270 * (1 - kit.reveal(t, 1.56, .72))}" opacity="${reset.toFixed(3)}"/>`;
  [711, 783, 855].forEach((y, i) => {
    const p = branch(i);
    body += kit.group(p * reset, kit.line(49, y + 29, 78, y + 29, s.accent, 1.8));
  });
  body += worker(0, 711) + worker(1, 783) + worker(2, 855);
  body += kit.line(32, 930, 508, 930, s.line, 1);
  body += kit.text(33, 953, '结构示意 / 文章转述', 13, s.muted, 500);
  return kit.svg(body);
}
