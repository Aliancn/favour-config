import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { makeKit } from './lib/components.mjs';
import { STYLES } from './lib/styles.mjs';

const expected = ['person','avatar','avatarStack','mail','chatBubble','phone','browser','document','codeWindow','issueTicket','calendar','database','taskCard','progress','statusBadge','timeline','flowArrow','queue','quote','metric','barChart','lineChart','comparison','mapPin','book','clock','imageFrame','emailCard','eventCard','chatMessage'];
assert.equal(Object.keys(STYLES).length, 9);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const luminance = hex => {
  const [r, g, b] = hex.slice(1).match(/../g).map(part => parseInt(part, 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return .2126 * r + .7152 * g + .0722 * b;
};
const contrast = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
for (const [name, style] of Object.entries(STYLES)) {
  for (const field of ['bg','surface','ink','muted','line','accent','positive','secondary','titleFont','bodyFont']) assert.ok(style[field], `${name}.${field}`);
  for (const [foreground, background] of [['ink','bg'],['muted','bg'],['muted','surface'],['surface','accent'],['surface','positive']]) {
    assert.ok(contrast(style[foreground], style[background]) >= 4.5, `${name}: ${foreground}/${background} text contrast`);
  }
  const kit = makeKit({ style: name, width: 960, height: 540 });
  for (const component of expected) assert.equal(typeof kit[component], 'function', `${name}.${component}`);
  const body = kit.text(80, 150, 'A & B <C>', 20) + kit.icon('mail', 120, 200, 32) + kit.taskCard(200, 180, 200, 90, '测试') +
    kit.emailCard(440, 165, 390, 180, { sender: '测试', subject: '标题', preview: '正文预览' });
  const svg = kit.page({ title: '中文标题', body, caption: '内容可读' });
  assert.ok(svg.includes('A &amp; B &lt;C&gt;'), 'XML escaping');
  assert.ok(svg.includes('stroke="' + style.ink + '"'), 'icon inherits style color');
  assert.equal(svg, kit.page({ title: '中文标题', body, caption: '内容可读' }), 'deterministic rendering');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'article-motion-test-'));
  try {
    const source = path.join(dir, 'test.svg'); const target = path.join(dir, 'test.png');
    fs.writeFileSync(source, svg);
    const result = spawnSync('rsvg-convert', ['-w','960','-h','540','-o',target,source], { encoding: 'utf8' });
    assert.equal(result.status, 0, `${name}: ${result.stderr}`);
    assert.ok(fs.statSync(target).size > 1000);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
assert.ok(fs.existsSync(path.join(root, 'assets/icons/LICENSE')));
for (const name of ['soft-wash', 'edge-glow', 'layered-matte', 'quiet-motif', 'focus-halo', 'clipped-grid', 'ribbon-field', 'contour-lines', 'halftone-margin', 'editorial-band']) {
  const { meta, draw } = await import(`../assets/examples/backgrounds/${name}.scene.mjs`);
  assert.equal(meta.styleOverrides.texture, name);
  const svg = draw(1.5, makeKit(meta));
  assert.equal(svg, draw(1.5, makeKit(meta)), `${name}: deterministic backdrop`);
  const portrait = makeKit({ ...meta, width: 540, height: 960 }).svg('');
  assert.ok(portrait.includes('viewBox="0 0 540 960"'), `${name}: portrait geometry`);
  assert.notEqual(portrait, makeKit({ ...meta, width: 540, height: 960, styleOverrides: { texture: 'none' } }).svg(''), `${name}: visible portrait treatment`);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'article-motion-background-test-'));
  try {
    const target = path.join(dir, `${name}.png`);
    const result = spawnSync('rsvg-convert', ['-w','960','-h','540','-o',target], { input: svg, encoding: 'utf8' });
    assert.equal(result.status, 0, `${name}: ${result.stderr}`);
    assert.ok(fs.statSync(target).size > 1000, `${name}: rendered PNG`);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
const { meta: portraitBackgroundMeta, draw: portraitBackgroundDraw } = await import('../assets/examples/backgrounds/soft-wash-9x16.scene.mjs');
assert.deepEqual([portraitBackgroundMeta.width, portraitBackgroundMeta.height], [540, 960]);
assert.ok(portraitBackgroundDraw(1.5, makeKit(portraitBackgroundMeta)).includes('viewBox="0 0 540 960"'));
const { meta: haloPortraitMeta, draw: haloPortraitDraw } = await import('../assets/examples/backgrounds/focus-halo-9x16.scene.mjs');
assert.deepEqual([haloPortraitMeta.width, haloPortraitMeta.height], [540, 960]);
for (const time of [0, 1.5, 2.5, 2.97]) assert.equal(haloPortraitDraw(time, makeKit(haloPortraitMeta)), haloPortraitDraw(time, makeKit(haloPortraitMeta)), 'portrait halo determinism');
const { meta: ribbonMotionMeta, draw: ribbonMotionDraw } = await import('../assets/examples/backgrounds/ribbon-field-motion.scene.mjs');
for (const time of [0, 1.5, 2.5, 3.97]) assert.equal(ribbonMotionDraw(time, makeKit(ribbonMotionMeta)), ribbonMotionDraw(time, makeKit(ribbonMotionMeta)), 'ribbon motion determinism');
const motionKit = makeKit({ style: 'editorial-paper', width: 960, height: 540 });
for (const curve of ['soft-stop', 'float-settle']) {
  assert.equal(motionKit.motion(0, .5, 1, curve), 0, `${curve}: before start`);
  assert.equal(motionKit.motion(1.5, .5, 1, curve), 1, `${curve}: at end`);
  assert.equal(motionKit.motion(3, .5, 1, curve), 1, `${curve}: after end`);
}
assert.ok(motionKit.motion(1, .5, 1) > .5, 'soft-stop advances quickly then settles');
assert.ok(motionKit.motion(1.05, .5, 1, 'float-settle') <= 1.03, 'floating overshoot is bounded');
assert.throws(() => motionKit.motion(1, 0, 0), /positive/);
assert.throws(() => motionKit.motion(1, 0, 1, 'unknown'), /Unknown motion curve/);
const { meta: motionMeta, draw: motionDraw } = await import('../assets/examples/showcase/20-motion-hierarchy.scene.mjs');
for (const time of [0, .7, 1.43, 2.5, 4.27, 4.97]) {
  const svg = motionDraw(time, makeKit(motionMeta));
  assert.ok(svg.startsWith('<svg') && svg.includes('viewBox="0 0 960 540"'));
  assert.equal(svg, motionDraw(time, makeKit(motionMeta)), 'motion demo determinism');
}
const profiles = [['16x9', 960, 540, 1600, 900], ['4x3', 960, 720, 1200, 900], ['1x1', 960, 960, 1200, 1200], ['9x16', 540, 960, 900, 1600]];
let sharedEvidence;
for (const [name, canvasWidth, canvasHeight, outputWidth, outputHeight] of profiles) {
  const { meta, draw } = await import(`../assets/examples/multi-ratio/email-${name}.scene.mjs`);
  assert.deepEqual([meta.width, meta.height, meta.fps, meta.duration], [canvasWidth, canvasHeight, 30, 5]);
  assert.equal(meta.width * outputHeight, meta.height * outputWidth, `${name}: output ratio`);
  if (sharedEvidence) assert.deepEqual(meta.sourceRefs, sharedEvidence, `${name}: same source evidence`);
  sharedEvidence = meta.sourceRefs;
  const svg = draw(4.9, makeKit(meta));
  assert.ok(svg.startsWith('<svg') && svg.includes(`viewBox="0 0 ${canvasWidth} ${canvasHeight}"`), `${name}: complete SVG`);
}
for (const [index, family] of [['14', 'evidence'], ['15', 'data'], ['16', 'state']]) {
  let sourceRefs;
  for (const [ratio, width, height] of [['16x9', 960, 540], ['9x16', 540, 960]]) {
    const { meta, draw } = await import(`../assets/examples/showcase/${index}-${family}-${ratio}.scene.mjs`);
    assert.deepEqual([meta.width, meta.height, meta.fps, meta.duration], [width, height, 30, 5], `${family}/${ratio}: scene spec`);
    if (sourceRefs) assert.deepEqual(meta.sourceRefs, sourceRefs, `${family}: same source evidence across ratios`);
    sourceRefs = meta.sourceRefs;
    for (const time of [0, 2.5, 4.9]) {
      const svg = draw(time, makeKit(meta));
      assert.ok(svg.startsWith('<svg') && svg.includes(`viewBox="0 0 ${width} ${height}"`), `${family}/${ratio}: complete SVG`);
      assert.equal(svg, draw(time, makeKit(meta)), `${family}/${ratio}: deterministic rendering`);
    }
  }
}
for (const name of ['17-superagent-router', '18-superagent-tokens', '19-superagent-filters']) {
  const { meta, draw } = await import(`../assets/examples/showcase/${name}.scene.mjs`);
  assert.deepEqual([meta.style, meta.width, meta.height, meta.fps, meta.duration], ['data-newsroom', 960, 540, 30, 5], `${name}: batch spec`);
  assert.ok(meta.sourceRefs?.length, `${name}: source evidence`);
  for (const time of [0, 1.7, 3.8, 4.9]) {
    const svg = draw(time, makeKit(meta));
    assert.ok(svg.startsWith('<svg') && svg.includes('viewBox="0 0 960 540"'), `${name}: complete SVG`);
    assert.equal(svg, draw(time, makeKit(meta)), `${name}: deterministic rendering`);
  }
}
const smokeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'article-motion-output-size-'));
try {
  const scene = path.join(smokeDir, 'smoke.scene.mjs');
  fs.writeFileSync(scene, `export const meta = {width:40,height:30,fps:2,duration:1,sourceRefs:[{source:'test',claim:'test',status:'synthetic example'}]};
export function draw(t){return '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30" viewBox="0 0 40 30"><rect width="40" height="30" fill="'+(t ? '#336699' : '#ffffff')+'"/></svg>';}`);
  const render = path.join(root, 'scripts/render.mjs');
  const legacy = spawnSync(process.execPath, [render, '--scene', scene, '--out', path.join(smokeDir, 'legacy.gif')], { encoding: 'utf8' });
  assert.equal(legacy.status, 0, legacy.stderr);
  const legacyInfo = JSON.parse(legacy.stdout);
  assert.deepEqual([legacyInfo.width, legacyInfo.height], [40, 30]);
  const scaled = spawnSync(process.execPath, [render, '--scene', scene, '--out', path.join(smokeDir, 'scaled.gif'), '--output-size', '80x60'], { encoding: 'utf8' });
  assert.equal(scaled.status, 0, scaled.stderr);
  const scaledInfo = JSON.parse(scaled.stdout);
  assert.deepEqual([scaledInfo.width, scaledInfo.height], [80, 60]);
  const customScene = path.join(smokeDir, 'custom.scene.mjs');
  fs.writeFileSync(customScene, `export const meta = {width:42,height:30,fps:2,duration:1,sourceRefs:[{source:'test',claim:'test',status:'synthetic example'}]};
export function draw(){return '<svg xmlns="http://www.w3.org/2000/svg" width="42" height="30" viewBox="0 0 42 30"><rect width="42" height="30" fill="#336699"/></svg>';}`);
  const custom = spawnSync(process.execPath, [render, '--scene', customScene, '--out', path.join(smokeDir, 'custom.gif'), '--output-size', '84x60'], { encoding: 'utf8' });
  assert.equal(custom.status, 0, custom.stderr);
  const customInfo = JSON.parse(custom.stdout);
  assert.deepEqual([customInfo.width, customInfo.height], [84, 60]);
  const checkBatch = path.join(root, 'scripts/check-batch.mjs');
  const sameBatch = spawnSync(process.execPath, [checkBatch, '--scene', scene, '--scene', customScene], { encoding: 'utf8' });
  assert.equal(sameBatch.status, 0, sameBatch.stderr);
  assert.equal(JSON.parse(sameBatch.stdout).result, 'passed');
  const mixedStyle = path.join(smokeDir, 'mixed-style.scene.mjs');
  fs.writeFileSync(mixedStyle, `export const meta = {style:'swiss-grid'};`);
  const mixedBatch = spawnSync(process.execPath, [checkBatch, '--scene', scene, '--scene', mixedStyle], { encoding: 'utf8' });
  assert.notEqual(mixedBatch.status, 0);
  assert.match(mixedBatch.stderr, /meta\.style "swiss-grid" differs from "editorial-paper"/);
  const changedToken = path.join(smokeDir, 'changed-token.scene.mjs');
  fs.writeFileSync(changedToken, `export const meta = {styleOverrides:{accent:'#123456'}};`);
  const changedBatch = spawnSync(process.execPath, [checkBatch, '--scene', scene, '--scene', changedToken], { encoding: 'utf8' });
  assert.notEqual(changedBatch.status, 0);
  assert.match(changedBatch.stderr, /accent "#123456" differs/);
  const changedBackdrop = path.join(smokeDir, 'changed-backdrop.scene.mjs');
  fs.writeFileSync(changedBackdrop, `export const meta = {styleOverrides:{texture:'soft-wash'}};`);
  const changedBackdropBatch = spawnSync(process.execPath, [checkBatch, '--scene', scene, '--scene', changedBackdrop], { encoding: 'utf8' });
  assert.notEqual(changedBackdropBatch.status, 0);
  assert.match(changedBackdropBatch.stderr, /texture "soft-wash" differs/);
  const mismatch = spawnSync(process.execPath, [render, '--scene', scene, '--out', path.join(smokeDir, 'bad.gif'), '--output-size', '80x61'], { encoding: 'utf8' });
  assert.notEqual(mismatch.status, 0);
  assert.match(mismatch.stderr, /does not match scene ratio/);
  const malformed = spawnSync(process.execPath, [render, '--scene', scene, '--out', path.join(smokeDir, 'bad.gif'), '--output-size', '80:60'], { encoding: 'utf8' });
  assert.notEqual(malformed.status, 0);
  assert.match(malformed.stderr, /WIDTHxHEIGHT/);
  const preview = spawnSync(process.execPath, [path.join(root, 'scripts/preview.mjs'), '--scene', scene, '--out-dir', smokeDir, '--display-width', '100'], { encoding: 'utf8' });
  assert.equal(preview.status, 0, preview.stderr);
  const previewInfo = JSON.parse(preview.stdout);
  assert.deepEqual(previewInfo.frameSize, { width: 100, height: 75 });
  assert.equal(Object.keys(previewInfo.frames).length, 4);
  assert.ok(fs.existsSync(previewInfo.contactSheet));
  const contactProbe = JSON.parse(spawnSync('ffprobe', ['-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','json',previewInfo.contactSheet], { encoding: 'utf8' }).stdout);
  assert.deepEqual([contactProbe.streams[0].width, contactProbe.streams[0].height], [200, 150]);
  const temporal = spawnSync(process.execPath, [path.join(root, 'scripts/preview.mjs'), '--scene', scene, '--out-dir', smokeDir, '--display-width', '100', '--temporal-strip'], { encoding: 'utf8' });
  assert.equal(temporal.status, 0, temporal.stderr);
  const temporalInfo = JSON.parse(temporal.stdout);
  assert.deepEqual(temporalInfo.temporalTimes, [0, .5]);
  assert.ok(fs.existsSync(temporalInfo.temporalStrip));
  const stripProbe = JSON.parse(spawnSync('ffprobe', ['-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','json',temporalInfo.temporalStrip], { encoding: 'utf8' }).stdout);
  assert.deepEqual([stripProbe.streams[0].width, stripProbe.streams[0].height], [200, 75]);
  const batchPreview = spawnSync(process.execPath, [path.join(root, 'scripts/preview-batch.mjs'), '--scene', scene, '--scene', customScene, '--out-dir', smokeDir], { encoding: 'utf8' });
  assert.equal(batchPreview.status, 0, batchPreview.stderr);
  const batchInfo = JSON.parse(batchPreview.stdout);
  assert.deepEqual(batchInfo.entries.map(entry => entry.scene), [scene, customScene]);
  assert.ok(fs.existsSync(batchInfo.contactSheet));
  const batchProbe = JSON.parse(spawnSync('ffprobe', ['-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','json',batchInfo.contactSheet], { encoding: 'utf8' }).stdout);
  assert.ok(batchProbe.streams[0].width >= 960 && batchProbe.streams[0].height >= 320);
  const invalidPreview = spawnSync(process.execPath, [path.join(root, 'scripts/preview.mjs'), '--scene', scene, '--display-width', '0'], { encoding: 'utf8' });
  assert.notEqual(invalidPreview.status, 0);
  assert.match(invalidPreview.stderr, /positive integer/);
  const article = path.join(smokeDir, 'long.md');
  fs.writeFileSync(article, '# Long article\n' + 'a'.repeat(6100));
  const outline = spawnSync(process.execPath, [path.join(root, 'scripts/outline.mjs'), '--input', article], { encoding: 'utf8' });
  assert.equal(outline.status, 0, outline.stderr);
  const outlineInfo = JSON.parse(outline.stdout);
  assert.equal(outlineInfo.needsExpandedOutline, true);
  assert.equal(Object.hasOwn(outlineInfo, 'needsStoryboardReview'), false);
} finally { fs.rmSync(smokeDir, { recursive: true, force: true }); }
console.log(`passed: ${Object.keys(STYLES).length} styles, ${expected.length} components, ten background treatments, motion curves, four ratio layouts, three dual-ratio design families, batch style check, SVG render, key-frame and temporal previews, batch contact sheet, expanded outline, determinism, bundled icon license`);
