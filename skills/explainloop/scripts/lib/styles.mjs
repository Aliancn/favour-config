export const STYLES = Object.freeze({
  'editorial-paper': {
    name: '暖纸张编辑插画', bg: '#F5F3EC', surface: '#FFFEFA', ink: '#222622', muted: '#57625B', line: '#C9D0C8', accent: '#AE4834', positive: '#4D704B', secondary: '#E8ECE6',
    titleFont: 'Songti SC, Noto Serif CJK SC, serif', bodyFont: 'PingFang SC, Noto Sans CJK SC, sans-serif', radius: 8, stroke: 1.5, texture: 'none',
  },
  'swiss-grid': {
    name: '瑞士网格信息图', bg: '#F3F2EE', surface: '#FFFFFF', ink: '#171916', muted: '#555A56', line: '#B8BDB8', accent: '#B92525', positive: '#276B4B', secondary: '#E8EBE7',
    titleFont: 'Arial, PingFang SC, sans-serif', bodyFont: 'Arial, PingFang SC, sans-serif', radius: 0, stroke: 2, texture: 'none',
  },
  'technical-blueprint': {
    name: '技术蓝图', bg: '#10232B', surface: '#19353E', ink: '#F1F5EF', muted: '#B3C9C7', line: '#42636A', accent: '#D5E789', positive: '#A4D6B8', secondary: '#25434B',
    titleFont: 'PingFang SC, Noto Sans CJK SC, sans-serif', bodyFont: 'PingFang SC, Noto Sans CJK SC, sans-serif', radius: 7, stroke: 1.6, texture: 'none',
  },
  'data-newsroom': {
    name: '数据新闻', bg: '#F4F6F5', surface: '#FFFFFF', ink: '#1E3037', muted: '#52666B', line: '#C8D4D4', accent: '#08758A', positive: '#477A57', secondary: '#DFEAEB',
    titleFont: 'PingFang SC, Noto Sans CJK SC, sans-serif', bodyFont: 'PingFang SC, Noto Sans CJK SC, sans-serif', radius: 4, stroke: 1.5, texture: 'none',
  },
  'playful-illustrated': {
    name: '轻松手绘', bg: '#FFF8EE', surface: '#FFFDF8', ink: '#403C42', muted: '#6E6471', line: '#D4C5BF', accent: '#B75342', positive: '#396C50', secondary: '#F6DEC7',
    titleFont: 'PingFang SC, Noto Sans CJK SC, sans-serif', bodyFont: 'PingFang SC, Noto Sans CJK SC, sans-serif', radius: 20, stroke: 2.1, texture: 'none',
  },
  'archival-timeline': {
    name: '档案时间线', bg: '#F3F2ED', surface: '#FFFEFB', ink: '#292D2A', muted: '#5C6661', line: '#C9CEC8', accent: '#8A5848', positive: '#526F5C', secondary: '#E7EBE6',
    titleFont: 'Songti SC, Noto Serif CJK SC, serif', bodyFont: 'PingFang SC, Noto Sans CJK SC, sans-serif', radius: 3, stroke: 1.4, texture: 'none',
  },
  'museum-gallery': {
    name: '博物馆展陈', bg: '#ECEDE9', surface: '#FFFEFB', ink: '#252A28', muted: '#56625D', line: '#C6CECA', accent: '#37675E', positive: '#436B50', secondary: '#DFE7E2',
    titleFont: 'Songti SC, Noto Serif CJK SC, serif', bodyFont: 'PingFang SC, Noto Sans CJK SC, sans-serif', radius: 2, stroke: 1.4, texture: 'none',
  },
  'nocturne-editorial': {
    name: '夜色编辑叙事', bg: '#161D25', surface: '#242E39', ink: '#F4F2EB', muted: '#BDC7C8', line: '#4F5F69', accent: '#F1C481', positive: '#A9D6BE', secondary: '#33434D',
    titleFont: 'Songti SC, Noto Serif CJK SC, serif', bodyFont: 'PingFang SC, Noto Sans CJK SC, sans-serif', radius: 6, stroke: 1.4, texture: 'none',
  },
  'chromatic-poster': {
    name: '色块海报', bg: '#F4F1E9', surface: '#FFFDF7', ink: '#20231F', muted: '#525B55', line: '#B9C2BA', accent: '#A52135', positive: '#326A4D', secondary: '#E4E9DE',
    titleFont: 'Arial, PingFang SC, sans-serif', bodyFont: 'Arial, PingFang SC, sans-serif', radius: 0, stroke: 2.2, texture: 'none',
  },
});

export function getStyle(name, overrides = {}) {
  if (!Object.hasOwn(STYLES, name)) throw new Error(`Unknown style: ${name}. Choose ${Object.keys(STYLES).join(', ')}`);
  return Object.freeze({ ...STYLES[name], ...overrides });
}
