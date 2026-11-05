export const meta = {
  title: '关闭直通后的代价', style: 'data-newsroom', width: 960, height: 540, fps: 30, duration: 5,
  sourceRefs: [{ source: 'generate/blogs/2026-11-01-deepseek-superagent-prototype_排版优化.md > Agent 不再等你下令：直通段落', claim: '文章转述的消融：关闭直通后，Router 决定数约多三成，缓存读取 token 从 2323 万升至 3177 万。', status: 'article-reported measurement' }],
};
export function draw(t, kit) {
  const s = kit.style, reset = 1 - kit.reveal(t, 4.55, .4), p = kit.reveal(t, .6, 2.8) * reset;
  let b = kit.rect(0, 0, 960, 114, s.surface, 0);
  b += kit.rect(0, 0, 11, 540, s.accent, 0);
  b += kit.text(48, 42, 'DATA NOTE / 消融观察', 14, s.muted, 700);
  b += kit.text(48, 91, meta.title, 43, s.ink, 700);
  b += kit.text(51, 163, 'Router 缓存读取', 27, s.ink, 700);
  b += kit.text(51, 192, '单位：万 token · 文章转述', 17, s.muted, 500);
  b += kit.line(62, 425, 652, 425, s.line, 1.6);
  b += kit.rect(124, 425 - 174 * p, 171, 174 * p, s.secondary, 2);
  b += kit.rect(393, 425 - 237 * p, 171, 237 * p, s.accent, 2);
  b += kit.text(209, 466, '开启直通', 19, s.ink, 650, 'middle');
  b += kit.text(478, 466, '关闭直通', 19, s.ink, 650, 'middle');
  b += kit.group(kit.reveal(t, 2.4, .35) * reset, kit.text(209, 237, '2323 万', 27, s.ink, 700, 'middle'));
  b += kit.group(kit.reveal(t, 3.1, .35) * reset, kit.text(478, 174, '3177 万', 27, s.accent, 700, 'middle'));
  b += kit.rect(686, 179, 219, 248, s.surface, 4, s.line, 1.2);
  b += kit.text(711, 222, '另一项指标', 17, s.muted, 600);
  b += kit.group(kit.reveal(t, 3.5, .4) * reset, kit.text(707, 314, '约 +30%', 48, s.accent, 700));
  b += kit.text(711, 352, 'Router 决定数', 20, s.ink, 650);
  b += kit.line(711, 381, 879, 381, s.line, 1);
  b += kit.text(711, 407, '与左侧 token 不同指标', 15, s.muted, 500);
  b += kit.text(51, 519, '关闭直通后，更多后续事件回到 Router。', 18, s.ink, 550);
  return kit.svg(b);
}
