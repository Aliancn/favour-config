// Three original compositions from the same article. Shared visual roles, distinct subjects.
const reset = (kit, t) => 1 - kit.reveal(t, 4.55, .35);
const show = (kit, t, at, duration, svg) => kit.group(kit.reveal(t, at, duration) * reset(kit, t), svg);

function frame(kit, eyebrow, title, source) {
  const s = kit.style;
  return kit.rect(0, 0, 960, 540, s.bg, 0) +
    kit.rect(36, 37, 9, 9, s.accent, 0) +
    kit.text(58, 48, eyebrow, 15, s.muted, 650) +
    kit.text(36, 103, title, 37, s.ink, 700, 'start', s.titleFont) +
    kit.line(36, 123, 924, 123, s.line, 1.5) +
    kit.text(36, 513, source, 15, s.muted, 500);
}

export function router(t, kit) {
  const s = kit.style;
  let b = frame(kit, '01 / 分工', 'Router 管沟通，Worker 并发做事', '来源：文章「上下文交给 Router，并发交给 Worker」');
  b += kit.text(45, 169, '事件入口', 20, s.muted, 650);
  b += kit.text(363, 169, '常驻协调', 20, s.muted, 650);
  b += kit.text(674, 169, '隔离执行', 20, s.muted, 650);
  const inputs = [['IM 消息', 205], ['GitHub', 286], ['邮件', 367]];
  for (const [label, y] of inputs) {
    b += kit.rect(44, y, 205, 60, s.surface, 8, s.line, 1.5);
    b += kit.rect(44, y, 6, 60, s.secondary, 0);
    b += kit.text(68, y + 39, label, 23, s.ink, 600);
  }
  b += kit.rect(335, 231, 238, 159, s.surface, 12, s.accent, 2.5);
  b += kit.text(454, 290, 'Router', 36, s.ink, 700, 'middle', s.titleFont);
  b += kit.text(454, 330, '接收 · 路由 · 回话', 19, s.muted, 600, 'middle');
  b += kit.text(454, 360, '不执行具体任务', 18, s.accent, 650, 'middle');
  for (const [startY, endY] of [[235, 266], [316, 316], [397, 355]]) {
    b += kit.line(249, startY, 335, endY, s.line, 2);
  }
  b += kit.line(573, 316, 649, 316, s.line, 2);
  b += kit.line(649, 230, 649, 404, s.line, 2);
  for (let i = 0; i < 3; i++) {
    const y = 196 + i * 87;
    b += kit.rect(664, y, 248, 68, s.surface, 8, s.line, 1.5);
    b += kit.rect(664, y, 7, 68, s.secondary, 0);
    b += kit.text(690, y + 29, `Worker ${i + 1}`, 23, s.ink, 650);
    b += kit.text(690, y + 53, '独立 Session', 16, s.muted, 500);
  }
  for (let i = 0; i < 3; i++) {
    const sourceY = 235 + i * 81;
    const targetY = [266, 316, 355][i];
    const progress = kit.reveal(t, .45 + i * .32, .7);
    b += kit.group((1 - kit.reveal(t, 1.25 + i * .32, .15)) * reset(kit, t),
      kit.circle(249 + 86 * progress, sourceY + (targetY - sourceY) * progress, 7, s.accent));
    const y = 196 + i * 87;
    b += show(kit, t, 1.85 + i * .38, .35, kit.circle(888, y + 24, 9, s.positive) + kit.text(875, y + 54, '处理中', 15, s.positive, 600, 'end'));
  }
  b += show(kit, t, 3.15, .4, kit.rect(359, 426, 195, 39, s.secondary, 7) + kit.text(456, 453, '统一向人回复', 21, s.ink, 650, 'middle'));
  return kit.svg(b);
}

export function tokens(t, kit) {
  const s = kit.style;
  let b = frame(kit, '02 / 消融数据', '关掉直通，Router 读缓存增加', '来源：文章「Agent 不再等你下令」；854 万由 3177 万 − 2323 万计算');
  b += kit.text(38, 160, '缓存读取 token / 万', 18, s.muted, 600);
  const baseline = 420, maxHeight = 239;
  const first = kit.reveal(t, .35, 1.1) * reset(kit, t);
  const second = kit.reveal(t, 1.4, 1.1) * reset(kit, t);
  const firstHeight = maxHeight * 2323 / 3177;
  b += kit.line(121, baseline, 836, baseline, s.line, 2);
  b += kit.rect(184, baseline - firstHeight * first, 177, firstHeight * first, s.secondary, 4);
  b += kit.rect(575, baseline - maxHeight * second, 177, maxHeight * second, s.accent, 4);
  b += kit.text(272, 457, '开启直通', 24, s.ink, 650, 'middle');
  b += kit.text(663, 457, '关闭直通', 24, s.ink, 650, 'middle');
  b += show(kit, t, 1.45, .25, kit.text(272, baseline - firstHeight - 18, '2323 万', 32, s.ink, 700, 'middle', s.titleFont));
  b += show(kit, t, 2.52, .25, kit.text(663, baseline - maxHeight - 18, '3177 万', 32, s.accent, 700, 'middle', s.titleFont));
  b += show(kit, t, 3.05, .4, kit.rect(376, 229, 176, 77, s.surface, 8, s.line, 1.5) + kit.text(464, 266, '多 854 万', 26, s.ink, 700, 'middle') + kit.text(464, 289, '约增加 37%', 16, s.muted, 600, 'middle'));
  return kit.svg(b);
}

export function filters(t, kit) {
  const s = kit.style;
  let b = frame(kit, '03 / 事件筛选', '不是每条消息都要叫醒 Agent', '来源：文章「Agent 不再等你下令」；以下是文中三类事件的示意状态');
  b += kit.text(56, 171, '进入的事件', 19, s.muted, 650);
  b += kit.text(409, 171, '两级筛选', 19, s.muted, 650);
  b += kit.text(760, 171, '去向', 19, s.muted, 650);
  const rows = [
    { y: 198, label: '闲聊群消息', gate: '程序规则拦截', outcome: '直接拦下', at: .65, tint: s.secondary },
    { y: 288, label: '用户群日常消息', gate: '规则通过 → LLM', outcome: '保持静默', at: 1.6, tint: s.secondary },
    { y: 378, label: '缺陷反馈', gate: '规则通过 → LLM', outcome: '进入路由', at: 2.55, tint: s.accent },
  ];
  for (const row of rows) {
    b += kit.rect(50, row.y, 280, 65, s.surface, 8, s.line, 1.5);
    b += kit.rect(50, row.y, 7, 65, row.tint, 0);
    b += kit.text(75, row.y + 41, row.label, 23, s.ink, 650);
    b += kit.line(330, row.y + 32, 388, row.y + 32, s.line, 2);
    b += kit.rect(388, row.y, 278, 65, s.surface, 8, s.line, 1.5);
    b += kit.text(527, row.y + 41, row.gate, 21, s.ink, 600, 'middle');
    b += kit.line(666, row.y + 32, 719, row.y + 32, s.line, 2);
    b += show(kit, t, row.at, .45, kit.rect(722, row.y, 190, 65, row.tint, 8) + kit.text(817, row.y + 41, row.outcome, 23, row.tint === s.accent ? s.surface : s.ink, 700, 'middle'));
  }
  return kit.svg(b);
}
