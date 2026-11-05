import { state } from './_family-layouts.mjs';
export const meta = {
  title: '邮件字段写入日历', style: 'swiss-grid', width: 960, height: 540, fps: 30, duration: 5,
  styleOverrides: { bg: '#EAF0F0', surface: '#FFFFFF', ink: '#20353C', muted: '#52676D', line: '#B7C9CB', accent: '#087486', positive: '#246C5B', secondary: '#DDEBED', titleFont: 'Lantinghei SC, PingFang SC, sans-serif', bodyFont: 'PingFang SC, Hiragino Sans GB, sans-serif', radius: 14, stroke: 1.5 },
  sourceRefs: [{ source: 'Synthetic brief: 林小姐邀请周五 11 月 6 日 14:00 线上设计评审，邮件内容被写入示例日历。', claim: '邮件主题、日期和时间映射到日历标题和时段。', status: 'synthetic example; not a real product UI' }],
};
export const draw = (t, kit) => state(t, kit, false);
