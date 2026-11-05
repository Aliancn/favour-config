export const meta = {
  title: '局部网格', style: 'technical-blueprint', width: 960, height: 540, fps: 30, duration: 3,
  styleOverrides: { texture: 'clipped-grid' },
  sourceRefs: [{ source: 'Background specimen', claim: 'A three-step route is synthetic illustrative material.', status: 'synthetic example' }],
};

export function draw(_t, kit) {
  const s = kit.style;
  let body = kit.text(64, 78, 'BACKGROUND / 06', 17, s.muted, 650);
  body += kit.text(64, 167, '结构有序，', 52, s.ink, 700);
  body += kit.text(64, 229, '网格有界。', 52, s.ink, 700);
  body += kit.text(65, 288, '辅助线只出现在关系区域', 21, s.muted, 500);
  body += kit.line(66, 326, 409, 326, s.line, 1);
  body += kit.text(65, 475, '适用于架构、路由、机制', 17, s.muted, 500);
  const positions = [[578, 224, '输入'], [724, 314, '处理'], [837, 227, '输出']];
  body += kit.path('M578 224L724 314L837 227', 'none', s.accent, 2.5);
  for (const [x, y, label] of positions) {
    body += kit.circle(x, y, 27, s.bg, s.accent, 2);
    body += kit.circle(x, y, 5, s.accent, 'none');
    body += kit.text(x, y + 54, label, 16, s.ink, 600, 'middle');
  }
  return kit.svg(body);
}
