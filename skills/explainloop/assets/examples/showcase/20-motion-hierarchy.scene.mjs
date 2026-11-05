export const meta = {
  title: '信息层级决定进出场顺序', style: 'editorial-paper', width: 960, height: 540, fps: 30, duration: 5,
  styleOverrides: { texture: 'soft-wash' },
  sourceRefs: [
    { source: 'https://mp.weixin.qq.com/s/0ttPQ8sYJRvnRs7Gj6k-6Q > AI 之外亲手打磨', claim: '文章描述商家标识最后停稳、评分随卡片滚动；退出时内部元素按相反顺序离开。', status: 'article-reported design principle' },
    { source: 'This scene', claim: '山岚工房、手作陶杯与 4.8 评分仅为原创示意。', status: 'synthetic example' },
  ],
};

const band = (kit, value, start, end) => kit.ease((value - start) / (end - start));

export function draw(t, kit) {
  const s = kit.style;
  const enter = kit.motion(t, .38, 3.0, 'soft-stop');
  const leave = kit.ease((t - 3.62) / 1.0);
  const progress = enter * (1 - leave);
  const product = band(kit, progress, .08, .42);
  const rating = band(kit, progress, .34, .69);
  const merchant = band(kit, progress, .67, .94);
  const floating = kit.motion(progress, .72, .2, 'float-settle');
  let b = kit.text(64, 73, '动效研究 / 原创示意卡片', 18, s.muted, 650);
  b += kit.text(64, 129, '重要信息，最后停稳。', 49, s.ink, 700, 'start', s.titleFont);
  b += kit.text(64, 161, '共享一条动作进度，退出时自然反序', 21, s.muted, 500);
  let card = kit.rect(85, 205, 790, 258, s.surface, 16, s.line, 1.5);
  card += kit.rect(105, 225, 258, 218, s.secondary, 12);
  card += kit.circle(234, 336, 84, s.bg, 'none');
  card += kit.group(product, kit.rect(196, 286, 75, 91, s.accent, 10) + kit.circle(281, 324, 27, 'none', s.accent, 15) + kit.text(415, 289, '手作陶杯', 34, s.ink, 700));
  card += kit.group(rating, kit.text(415, 346, `示例评分  ${(4.8 * rating).toFixed(1)}`, 27, s.ink, 600) + kit.line(415, 362, 791, 362, s.line, 1));
  card += kit.group(merchant, kit.text(415, 412, '山岚工房', 38, s.accent, 700, 'start', s.titleFont));
  card += kit.group(floating, kit.move(0, -19 * floating, kit.rect(741, 231, 93, 32, s.accent, 16) + kit.text(787, 253, '商家', 17, s.surface, 700, 'middle')));
  b += kit.group(progress, kit.move(0, 36 * (1 - progress), card));
  b += kit.text(65, 509, '示意商家、商品与数值；演示信息排序，不代表 Shopify 产品界面。', 17, s.muted, 500);
  return kit.svg(b);
}
