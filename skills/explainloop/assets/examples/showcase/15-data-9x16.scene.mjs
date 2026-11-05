import { data } from './_family-layouts.mjs';
export const meta = {
  title: '关闭直通后的缓存读取', style: 'data-newsroom', width: 540, height: 960, fps: 30, duration: 5,
  styleOverrides: { titleFont: 'Hiragino Sans GB, PingFang SC, sans-serif', bodyFont: 'Hiragino Sans GB, PingFang SC, sans-serif' },
  sourceRefs: [{ source: 'generate/blogs/2026-11-01-deepseek-superagent-prototype_排版优化.md，Agent 不再等你下令，第 81 行', claim: '关闭直通后，Router 缓存读取 token 从 2323 万涨到 3177 万；854 万是两数相减的推算。', status: 'article-reported measurement; arithmetic inference' }],
};
export const draw = (t, kit) => data(t, kit, true);
