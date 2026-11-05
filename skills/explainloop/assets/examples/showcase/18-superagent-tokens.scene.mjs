import { tokens } from './batch-superagent-layouts.mjs';
export const meta = {
  title: '关闭直通后的缓存读取', style: 'data-newsroom', width: 960, height: 540, fps: 30, duration: 5,
  sourceRefs: [{ source: 'generate/blogs/2026-11-01-deepseek-superagent-prototype_排版优化.md，行 79–81', claim: '关闭直通时 Router 缓存读取 token 从 2323 万增至 3177 万；差值 854 万，约 37% 为计算结果。', status: 'article-reported measurement; arithmetic inference' }],
};
export const draw = (t, kit) => tokens(t, kit);
