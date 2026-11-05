export const meta = {
  title: '深色边缘光', style: 'nocturne-editorial', width: 960, height: 540, fps: 30, duration: 3,
  styleOverrides: { texture: 'edge-glow' },
  sourceRefs: [{ source: 'Background specimen', claim: 'Nodes and links are illustrative design material.', status: 'synthetic example' }],
};

export function draw(_t, kit) {
  const s = kit.style;
  let b = kit.text(64, 87, '背景研究 / 02', 19, s.muted, 650);
  b += kit.text(64, 164, '一束光，标出关键节点。', 48, s.ink, 700, 'start', s.titleFont);
  b += kit.text(65, 211, '深色边缘光 · 适合系统关系与转折', 22, s.muted, 500);
  b += kit.line(144, 347, 784, 347, s.line, 2);
  for (const [x, label, active] of [[144, '输入', false], [464, '判断', true], [784, '结果', false]]) {
    b += kit.circle(x, 347, active ? 31 : 23, s.surface, active ? s.accent : s.line, 2);
    b += kit.circle(x, 347, active ? 9 : 6, active ? s.accent : s.muted, 'none');
    b += kit.text(x, 414, label, 22, active ? s.ink : s.muted, 600, 'middle');
  }
  return kit.svg(b);
}
