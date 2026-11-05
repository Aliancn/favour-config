export const meta = {
  title: '三次版本迭代', style: 'archival-timeline', width: 960, height: 540, fps: 30, duration: 5,
  sourceRefs: [{ source: 'Synthetic sample > Product history', claim: 'An illustrative feature evolves from recording, to categorizing, to syncing across three fictional releases.', status: 'synthetic example' }],
};
export function draw(t, kit) {
  const s = kit.style, reset = 1 - kit.reveal(t, 4.55, .4), travel = kit.reveal(t, .3, 3.25) * reset;
  let b = kit.rect(36, 36, 888, 468, s.surface, 2, s.line, 1.2);
  b += kit.text(65, 71, 'COLLECTION / PRODUCT HISTORY', 13, s.muted, 700, 'start', 'Menlo, monospace');
  b += kit.text(65, 125, meta.title, 46, s.ink, 700, 'start', s.titleFont);
  b += kit.text(66, 155, '同一项能力，沿时间形成三个版本。', 19, s.muted, 500);
  b += kit.line(66, 187, 894, 187, s.line, 1);
  b += kit.line(90, 275, 862, 275, s.line, 2);
  b += kit.line(88, 275, 88 + 582 * travel, 275, s.accent, 2.5);
  b += kit.circle(88 + 582 * travel, 275, 5, s.accent, 'none');
  const releases = [
    ['2018', '记录事件', '把需求写入列表'],
    ['2021', '按类型归类', '让记录可检索'],
    ['2025', '自动同步', '跨工具保持一致'],
  ];
  releases.forEach(([year, title, detail], i) => {
    const x = 88 + i * 291, on = kit.reveal(t, .35 + i * 1.1, .4) * reset;
    b += kit.circle(x, 275, 7, on ? s.accent : s.surface, s.accent, 2);
    b += kit.text(x, 248, year, 28, on ? s.accent : s.muted, 700, 'start', s.titleFont);
    b += kit.group(on, kit.rect(x, 307, 252, 123, i === 1 ? s.secondary : '#F7F8F5', 2, s.line, 1) +
      kit.text(x + 17, 339, `ARCHIVE / 0${i + 1}`, 13, s.muted, 700, 'start', 'Menlo, monospace') +
      kit.text(x + 17, 381, title, 27, s.ink, 700, 'start', s.titleFont) +
      kit.text(x + 17, 411, detail, 16, s.muted, 500));
  });
  b += kit.text(66, 471, '合成示例 · 年份与版本仅用于演示视觉语法', 15, s.muted, 500);
  return kit.svg(b);
}
