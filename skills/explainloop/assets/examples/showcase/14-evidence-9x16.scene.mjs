import { evidence } from './_family-layouts.mjs';
export const meta = {
  title: '人的注意力窗口', style: 'museum-gallery', width: 540, height: 960, fps: 30, duration: 5,
  styleOverrides: { titleFont: 'Songti SC, Noto Serif CJK SC, serif', bodyFont: 'Hiragino Sans GB, PingFang SC, sans-serif' },
  sourceRefs: [{ source: 'generate/blogs/2026-11-01-deepseek-superagent-prototype_排版优化.md，第 11 行', claim: '据我们观察，一个人通常只能同时跟进 3 到 5 个活跃 Session。', status: 'article-reported observation' }],
};
export const draw = (t, kit) => evidence(t, kit, true);
