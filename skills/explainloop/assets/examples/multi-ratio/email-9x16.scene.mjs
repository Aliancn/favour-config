import { drawEmail } from './_email-layout.mjs';
export const meta = {
  title: '一封邮件，变成日程', style: 'playful-illustrated', width: 540, height: 960, fps: 30, duration: 5,
  sourceRefs: [{ source: 'Synthetic sample: 收到设计评审邮件，识别时间，加入日历。', claim: 'A sample email-to-calendar workflow.', status: 'synthetic example' }],
};
export function draw(t, kit) { return drawEmail(t, kit, '9x16'); }
