#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { makeKit } from './lib/components.mjs';
import { STYLES } from './lib/styles.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'assets/previews');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'article-motion-gallery-'));
fs.mkdirSync(outDir, { recursive: true });
function run(command, args) { const r = spawnSync(command, args, { encoding: 'utf8' }); if (r.error || r.status !== 0) throw new Error(`${command}: ${r.error?.message || r.stderr}`); }
function render(svg, filename, width, height) { const source = path.join(tmpDir, filename + '.svg'); fs.writeFileSync(source, svg); run('rsvg-convert', ['-w', String(width), '-h', String(height), '-o', path.join(outDir, filename + '.png'), source]); }
async function stylePreview(style) {
  const scenes = {
    'editorial-paper': '01-editorial-paper',
    'swiss-grid': '02-swiss-grid',
    'technical-blueprint': '03-technical-blueprint',
    'data-newsroom': '04-data-newsroom',
    'playful-illustrated': '05-playful-illustrated',
    'archival-timeline': '06-archival-timeline',
    'museum-gallery': '11-museum-gallery',
    'nocturne-editorial': '12-nocturne-editorial',
    'chromatic-poster': '13-chromatic-poster',
  };
  const { meta, draw } = await import(path.join(root, 'assets/examples/showcase', `${scenes[style]}.scene.mjs`));
  return draw(meta.duration * .82, makeKit(meta));
}
try {
  let index = 0;
  for (const style of Object.keys(STYLES)) {
    const svg = await stylePreview(style);
    const name = String(index).padStart(2, '0');
    const source = path.join(tmpDir, name + '.svg');
    fs.writeFileSync(source, svg);
    run('rsvg-convert', ['-w', '480', '-h', '270', '-o', path.join(tmpDir, name + '.png'), source]);
    index++;
  }
  run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', '1', '-i', path.join(tmpDir, '%02d.png'), '-vf', 'tile=3x3', '-frames:v', '1', path.join(outDir, 'styles.png')]);

  const kit = makeKit({ style: 'editorial-paper', width: 1800, height: 1050 });
  const names = ['person','avatar','avatarStack','mail','chatBubble','phone','browser','document','codeWindow','issueTicket','calendar','database','taskCard','progress','statusBadge','timeline','flowArrow','queue','quote','metric','barChart','lineChart','comparison','mapPin','book','clock','imageFrame','emailCard','eventCard','chatMessage'];
  let body = kit.text(42, 59, '语义组件库 / 30 个组件', 36, kit.style.ink, 700, 'start', kit.style.titleFont);
  names.forEach((name, i) => {
    const col = i % 6, row = Math.floor(i / 6), x = 28 + col * 295, y = 94 + row * 187;
    body += kit.rect(x, y, 275, 169, kit.style.surface, 9, kit.style.line) + kit.text(x + 15, y + 25, name, 17, kit.style.muted, 650);
    const px = x + 22, py = y + 45;
    const renderers = {
      person: () => kit.person(px + 70, py + 6, 70), avatar: () => kit.avatar(px + 85, py + 20, 'A', 62), avatarStack: () => kit.avatarStack(px + 45, py + 25, ['A','B','C'], 55),
      mail: () => kit.mail(px + 82, py + 17, 70), chatBubble: () => kit.chatBubble(px, py + 16, 230, 63, '一条消息'), phone: () => kit.phone(px + 80, py, 70, 113, 'APP'),
      browser: () => kit.browser(px, py + 11, 230, 90, '页面'), document: () => kit.document(px + 45, py + 5, 140, 99, '记录'), codeWindow: () => kit.codeWindow(px, py + 11, 230, 90, '工程'),
      issueTicket: () => kit.issueTicket(px, py + 9, 230, 96, '待处理'), calendar: () => kit.calendar(px + 70, py + 5, 90, 100, '03'), database: () => kit.database(px + 70, py + 9, 90, 94, '状态'),
      taskCard: () => kit.taskCard(px, py + 9, 230, 92, '执行任务'), progress: () => kit.progress(px, py + 48, 228, .65, 12), statusBadge: () => kit.statusBadge(px + 64, py + 44, '已完成', 'success'),
      timeline: () => kit.timeline(px + 13, py + 44, 205, ['起点','中间','结果']), flowArrow: () => kit.flowArrow(px + 20, py + 53, px + 215, py + 53), queue: () => kit.queue(px + 25, py + 2, 180, ['任务 A','任务 B']),
      quote: () => kit.quote(px, py + 13, 228, 78, '关键原文'), metric: () => kit.metric(px + 60, py + 54, '12.4', '分钟'), barChart: () => kit.barChart(px + 10, py + 6, 210, 80, [{label:'A',value:.4},{label:'B',value:.8},{label:'C',value:.6}]),
      lineChart: () => kit.lineChart(px + 12, py + 6, 210, 86, [.2,.4,.32,.8,.65]), comparison: () => kit.comparison(px, py + 17, 228, 80, '之前', '之后'), mapPin: () => kit.mapPin(px + 85, py + 20, 68),
      book: () => kit.book(px + 62, py + 8, 105, 90, '文章'), clock: () => kit.clock(px + 82, py + 18, 70),
      imageFrame: () => kit.imageFrame(px + 12, py + 7, 210, 100, path.join(outDir, 'styles.png'), '用户或授权素材'),
      emailCard: () => kit.move(px, py, `<g transform="scale(0.62)">${kit.emailCard(0, 0, 365, 180, { sender: '小陈', subject: '会议邀请', preview: '周四见', time: '09:30' })}</g>`),
      eventCard: () => kit.eventCard(px, py, 228, 116, { month: 'NOV', day: '18', title: '设计评审', time: '14:00', status: '已确认' }),
      chatMessage: () => kit.chatMessage(px, py, 228, 116, { sender: '小陈', message: '有新的反馈', time: '09:31' }),
    };
    body += renderers[name]();
  });
  render(kit.svg(body), 'components', 1800, 1050);
  const backgrounds = ['soft-wash', 'edge-glow', 'layered-matte', 'quiet-motif', 'focus-halo', 'clipped-grid', 'ribbon-field', 'contour-lines', 'halftone-margin', 'editorial-band'];
  for (let i = 0; i < backgrounds.length; i++) {
    const name = backgrounds[i];
    const { meta, draw } = await import(path.join(root, 'assets/examples/backgrounds', `${name}.scene.mjs`));
    const svg = draw(1.5, makeKit(meta));
    render(svg, `background-${name}`, 960, 540);
    const source = path.join(tmpDir, `background-${name}.svg`);
    run('rsvg-convert', ['-w', '480', '-h', '270', '-o', path.join(tmpDir, `background-${String(i).padStart(2, '0')}.png`), source]);
    if (i >= 4) run('rsvg-convert', ['-w', '480', '-h', '270', '-o', path.join(tmpDir, `new-background-${String(i - 4).padStart(2, '0')}.png`), source]);
  }
  const { meta: portraitMeta, draw: portraitDraw } = await import(path.join(root, 'assets/examples/backgrounds/soft-wash-9x16.scene.mjs'));
  render(portraitDraw(1.5, makeKit(portraitMeta)), 'background-soft-wash-9x16', 900, 1600);
  const { meta: haloPortraitMeta, draw: haloPortraitDraw } = await import(path.join(root, 'assets/examples/backgrounds/focus-halo-9x16.scene.mjs'));
  render(haloPortraitDraw(1.5, makeKit(haloPortraitMeta)), 'background-focus-halo-9x16', 900, 1600);
  run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', '1', '-i', path.join(tmpDir, 'background-%02d.png'), '-vf', 'tile=5x2', '-frames:v', '1', path.join(outDir, 'backgrounds.png')]);
  run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', '1', '-i', path.join(tmpDir, 'new-background-%02d.png'), '-vf', 'tile=3x2', '-frames:v', '1', path.join(outDir, 'backgrounds-new.png')]);
  console.log(JSON.stringify({ styles: path.join(outDir, 'styles.png'), components: path.join(outDir, 'components.png'), backgrounds: path.join(outDir, 'backgrounds.png'), newBackgrounds: path.join(outDir, 'backgrounds-new.png'), count: names.length }));
} finally { fs.rmSync(tmpDir, { recursive: true, force: true }); }
