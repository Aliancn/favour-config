import { router } from './batch-superagent-layouts.mjs';
export const meta = {
  title: 'Router 与 Worker 分工', style: 'data-newsroom', width: 960, height: 540, fps: 30, duration: 5,
  sourceRefs: [{ source: 'generate/blogs/2026-11-01-deepseek-superagent-prototype_排版优化.md，行 29–47', claim: '常驻 Router 承接交互并路由，Worker 上下文隔离且并发执行，完成后由 Router 统一回话。', status: 'article-reported architecture' }],
};
export const draw = (t, kit) => router(t, kit);
