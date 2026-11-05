#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { makeKit } from './lib/components.mjs';

function usage() {
  console.log('Usage: node preview.mjs --scene /absolute/name.scene.mjs [--out-dir /absolute/parent] [--display-width PIXELS] [--temporal-strip]');
}
function run(binary, args, input) {
  const result = spawnSync(binary, args, { input, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error(`${binary}: ${result.error?.message || (result.stderr || result.stdout).trim()}`);
}
function parseArgs(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--help') { usage(); process.exit(0); }
    if (argv[i] === '--temporal-strip') { options.temporalStrip = true; continue; }
    if (!['--scene', '--out-dir', '--display-width'].includes(argv[i]) || !argv[i + 1]) throw new Error(`Unknown or incomplete argument: ${argv[i]}`);
    options[argv[i].slice(2)] = argv[++i];
  }
  if (!options.scene || !path.isAbsolute(options.scene)) throw new Error('--scene must be an absolute path');
  if (options['out-dir'] && !path.isAbsolute(options['out-dir'])) throw new Error('--out-dir must be an absolute path');
  if (options['display-width'] && !/^[1-9]\d*$/.test(options['display-width'])) throw new Error('--display-width must be a positive integer');
  return options;
}
async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(options.scene)) throw new Error(`Scene not found: ${options.scene}`);
  const { meta, draw } = await import(pathToFileURL(options.scene).href + `?v=${fs.statSync(options.scene).mtimeMs}`);
  if (!meta || typeof draw !== 'function' || !Number.isFinite(meta.width) || !Number.isFinite(meta.height) || !Number.isFinite(meta.fps) || !Number.isFinite(meta.duration) ||
      meta.width <= 0 || meta.height <= 0 || meta.fps <= 0 || meta.duration <= 0) throw new Error('Scene must export valid meta and draw(t, kit)');
  const frameCount = Math.round(meta.fps * meta.duration);
  if (frameCount < 2) throw new Error('Scene needs at least two frames');
  const ratio = meta.width / meta.height;
  const width = options['display-width'] ? Number(options['display-width']) : ratio < .8 ? 360 : ratio < 1.25 ? 480 : 720;
  const height = Math.round(width / ratio);
  if (width > 2048 || height > 2048) throw new Error('Preview frame must be at most 2048px per side');
  const parent = options['out-dir'] || os.tmpdir();
  fs.mkdirSync(parent, { recursive: true });
  const dir = fs.mkdtempSync(path.join(parent, 'article-motion-preview-'));
  const kit = makeKit(meta);
  const positions = [0, Math.round((frameCount - 1) * .5), Math.round((frameCount - 1) * .82), frameCount - 1];
  const labels = ['opening', 'action', 'outcome', 'loop-edge'];
  try {
    const frames = {};
    for (let i = 0; i < positions.length; i++) {
      const svg = draw(positions[i] / meta.fps, kit);
      if (typeof svg !== 'string' || !svg.trimStart().startsWith('<svg')) throw new Error(`draw() returned invalid SVG at ${labels[i]}`);
      const numbered = path.join(dir, `${String(i).padStart(2, '0')}.png`);
      run('rsvg-convert', ['-w', String(width), '-h', String(height), '-o', numbered], svg);
      frames[labels[i]] = numbered;
    }
    const contactSheet = path.join(dir, 'contact-sheet.png');
    run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', '1', '-i', path.join(dir, '%02d.png'), '-vf', 'tile=2x2', '-frames:v', '1', contactSheet]);
    let temporalStrip;
    let temporalTimes;
    if (options.temporalStrip) {
      const stripCount = Math.min(8, frameCount);
      const stripPositions = Array.from({ length: stripCount }, (_, i) => Math.round(i * (frameCount - 1) / (stripCount - 1)));
      temporalTimes = stripPositions.map(i => Number((i / meta.fps).toFixed(3)));
      for (let i = 0; i < stripCount; i++) {
        const svg = draw(stripPositions[i] / meta.fps, kit);
        if (typeof svg !== 'string' || !svg.trimStart().startsWith('<svg')) throw new Error(`draw() returned invalid SVG at temporal frame ${i + 1}`);
        run('rsvg-convert', ['-w', String(width), '-h', String(height), '-o', path.join(dir, `strip-${String(i).padStart(2, '0')}.png`)], svg);
      }
      temporalStrip = path.join(dir, 'temporal-strip.png');
      run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', '1', '-i', path.join(dir, 'strip-%02d.png'), '-vf', `tile=${Math.min(4, stripCount)}x${Math.ceil(stripCount / 4)}`, '-frames:v', '1', temporalStrip]);
    }
    console.log(JSON.stringify({ scene: options.scene, dir, contactSheet, frames, times: positions.map(i => Number((i / meta.fps).toFixed(3))), frameSize: { width, height }, ...(temporalStrip ? { temporalStrip, temporalTimes } : {}) }));
  } catch (error) {
    fs.rmSync(dir, { recursive: true, force: true });
    throw error;
  }
}
main().catch(error => { console.error(`explainloop preview: ${error.message}`); process.exitCode = 1; });
