import { filters } from './batch-superagent-layouts.mjs';
export const meta = {
  title: '事件的两级筛选', style: 'data-newsroom', width: 960, height: 540, fps: 30, duration: 5,
  sourceRefs: [{ source: 'generate/blogs/2026-11-01-deepseek-superagent-prototype_排版优化.md，行 53–73', claim: '程序规则先拦截来源不符事件；剩余事件经 LLM 判断。文章举例：闲聊群消息被规则拦下，用户群日常消息保持静默，缺陷反馈进入路由。', status: 'article-reported workflow and examples' }],
};
export const draw = (t, kit) => filters(t, kit);
