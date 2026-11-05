export const meta = {
  title: '一个入口，并发执行',
  style: 'technical-blueprint',
  styleOverrides: {
    bg: '#101B1D', surface: '#18282A', ink: '#F2F4EC', muted: '#AFC0B9', line: '#385154',
    accent: '#D2E77E', positive: '#A2D1B0', secondary: '#23383A',
    titleFont: 'PingFang SC, sans-serif', bodyFont: 'PingFang SC, sans-serif', radius: 10, stroke: 1.4,
  },
  width: 960, height: 540, fps: 30, duration: 6,
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
    const x = 695, w = 220, h = 67;
    const alpha = kit.reveal(t, 2.08 + i * .18, .35) * reset;
    let ghost = kit.rect(x, y, w, h, '#152326', 8, '#426064', 1.2);
    ghost += kit.text(x + 16, y + 24, `WORKER 0${i + 1}`, 12, '#819A9C', 700, 'start', 'Menlo, monospace');
    ghost += kit.text(x + 16, y + 48, `隔离上下文 ${'ABC'[i]}`, 17, '#849C9E', 550);
    let active = kit.rect(x, y, w, h, '#213538', 8, '#69888A', 1.2);
    active += kit.rect(x, y + 8, 4, h - 16, s.accent, 2);
    active += kit.text(x + 16, y + 24, `WORKER 0${i + 1}`, 12, s.accent, 700, 'start', 'Menlo, monospace');
    active += kit.text(x + 16, y + 48, `隔离上下文 ${'ABC'[i]}`, 17, s.ink, 600);
    active += kit.rect(x + 135, y + 51, 67, 4, '#4A6463', 2);
    active += kit.rect(x + 135, y + 51, (42 + i * 7) * kit.reveal(t, 2.48 + i * .13, 2.55), 4, s.accent, 2);
    return ghost + kit.group(alpha, active);
  };
  let body = kit.rect(29, 196, 902, 262, '#142527', 13);
  body += kit.text(43, 46, 'SYSTEM STUDY  /  SUPER-AGENT', 13, s.muted, 700, 'start', 'Menlo, monospace');
  body += kit.text(916, 46, 'ARCHITECTURE  01 / 02', 12, s.muted, 650, 'end', 'Menlo, monospace');
  body += kit.line(43, 61, 917, 61, s.line, 1);
  body += kit.text(43, 116, meta.title, 42, s.ink, 700);
  body += kit.text(44, 151, 'Router 保持可响应，Worker 在独立上下文中处理任务。', 18, s.muted, 500);
  body += kit.line(43, 178, 917, 178, s.line, 1);
  body += kit.text(44, 208, '01 / EVENT SOURCES', 12, s.muted, 700, 'start', 'Menlo, monospace');
  body += kit.text(349, 208, '02 / ROUTER', 12, s.muted, 700, 'start', 'Menlo, monospace');
  body += kit.text(695, 208, '03 / ISOLATED WORKERS', 12, s.muted, 700, 'start', 'Menlo, monospace');
  body += kit.rect(43, 224, 236, 220, s.surface, 11, s.line, 1.2);
  const sources = [['message-circle', 'IM 消息'], ['git-pull-request', '代码评审'], ['mail', '邮件事件']];
  sources.forEach(([icon, label], i) => {
    const y = 252 + i * 58;
    if (i) body += kit.line(61, y - 18, 261, y - 18, '#2F4648', 1);
    body += kit.icon(icon, 64, y - 10, 23, i === 0 && t > .48 ? s.accent : s.muted);
    body += kit.text(101, y + 9, label, 18, s.ink, 550);
    body += kit.circle(248, y + 1, 3, i === 0 && t > .48 ? s.accent : '#607A78', 'none');
  });
  body += kit.group(start * reset, kit.line(279, 331, 338, 331, s.accent, 2));
  if (t >= .48 && t < 1.18) body += kit.circle(279 + 59 * start, 331, 5, s.accent, 'none');
  body += kit.rect(338, 224, 253, 220, '#1D3032', 12, '#6B8A88', 1.5);
  body += kit.rect(338, 224, 253, 4, s.accent, 1);
  body += kit.text(359, 263, 'ROUTER', 30, s.ink, 700, 'start', 'Menlo, monospace');
  body += kit.text(359, 284, 'ALWAYS AVAILABLE', 12, s.accent, 700, 'start', 'Menlo, monospace');
  body += kit.circle(464, 352, 35, '#22393A', '#86A8A3', 1.5);
  body += kit.circle(464, 352, 21, s.accent, 'none');
  body += kit.icon('layers', 452, 340, 24, '#18282A');
  body += kit.group(t >= 1.25 && t < 2.15 ? (1 - signal) * reset : 0, kit.circle(464, 352, 37 + 17 * signal, 'none', s.accent, 1.5));
  body += kit.text(464, 421, '接入  ·  分派  ·  对外沟通', 17, s.ink, 550, 'middle');
  const paths = [
    'M591 331 C633 331 640 258 683 258',
    'M591 331 C634 331 642 337 683 337',
    'M591 331 C633 331 640 416 683 416',
  ];
  paths.forEach((d, i) => {
    const p = branch(i), visible = p * reset;
    body += `<path d="${d}" fill="none" stroke="${s.accent}" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="160" stroke-dashoffset="${160 * (1 - p)}" opacity="${visible.toFixed(3)}"/>`;
    body += kit.group(visible, kit.circle(684, 258 + i * 79, 3.5, s.accent, 'none'));
  });
  body += worker(0, 224) + worker(1, 303) + worker(2, 382);
  body += kit.line(43, 480, 917, 480, s.line, 1);
  body += kit.group(kit.reveal(t, 3.86, .45) * reset,
    kit.rect(43, 492, 5, 28, s.accent, 2) + kit.text(61, 514, '一个对外入口，多个并行执行面。', 22, s.ink, 600));
  body += kit.text(917, 516, '结构示意 / 文章转述', 13, s.muted, 500, 'end');
  return kit.svg(body);
}
