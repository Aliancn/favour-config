#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { makeKit } from './lib/components.mjs';

function usage() {
  console.log('Usage: node preview-batch.mjs --scene /absolute/first.scene.mjs --scene /absolute/second.scene.mjs [--scene /absolute/next.scene.mjs ...] [--out-dir /absolute/parent]');
}

function run(binary, args, input) {
  const result = spawnSync(binary, args, { input, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error(`${binary}: ${result.error?.message || (result.stderr || result.stdout).trim()}`);
}

function parseArgs(argv) {
  const scenes = [];
  let outDir;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--help') { usage(); process.exit(0); }
    if (argv[i] === '--scene' && argv[i + 1]) scenes.push(argv[++i]);
    else if (argv[i] === '--out-dir' && argv[i + 1]) outDir = argv[++i];
    else throw new Error(`Unknown or incomplete argument: ${argv[i]}`);
  }
  if (scenes.length < 2) throw new Error('Pass at least two --scene paths from the same batch');
  if (scenes.length > 12) throw new Error('Preview at most 12 scenes in one sheet');
  for (const scene of scenes) {
    if (!path.isAbsolute(scene) || !fs.existsSync(scene)) throw new Error(`Use an existing absolute scene path: ${scene}`);
  }
  if (outDir && !path.isAbsolute(outDir)) throw new Error('--out-dir must be an absolute path');
  return { scenes, outDir: outDir || os.tmpdir() };
}

async function main() {
  const { scenes, outDir } = parseArgs(process.argv.slice(2));
  fs.mkdirSync(outDir, { recursive: true });
  const dir = fs.mkdtempSync(path.join(outDir, 'article-motion-batch-preview-'));
  const panelWidth = 480;
  const panelHeight = 320;
  const entries = [];
  try {
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const { meta, draw } = await import(pathToFileURL(scene).href + `?v=${fs.statSync(scene).mtimeMs}`);
      if (!meta || typeof draw !== 'function' || !Number.isFinite(meta.width) || !Number.isFinite(meta.height) || !Number.isFinite(meta.fps) || !Number.isFinite(meta.duration) ||
          meta.width <= 0 || meta.height <= 0 || meta.fps <= 0 || meta.duration <= 0) throw new Error(`Invalid scene meta or draw(): ${scene}`);
      const frameCount = Math.round(meta.fps * meta.duration);
      if (frameCount < 2) throw new Error(`Scene needs at least two frames: ${scene}`);
      const frameIndex = Math.round((frameCount - 1) * .82);
      const time = frameIndex / meta.fps;
      const svg = draw(time, makeKit(meta));
      if (typeof svg !== 'string' || !svg.trimStart().startsWith('<svg')) throw new Error(`draw() returned invalid SVG: ${scene}`);
      const source = path.join(dir, `source-${String(i).padStart(2, '0')}.png`);
      const panel = path.join(dir, `${String(i).padStart(2, '0')}.png`);
      run('rsvg-convert', ['-w', String(meta.width), '-h', String(meta.height), '-o', source], svg);
      run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', source, '-vf', `scale=${panelWidth}:${panelHeight}:force_original_aspect_ratio=decrease,pad=${panelWidth}:${panelHeight}:(ow-iw)/2:(oh-ih)/2:color=0xf3f3f0`, '-frames:v', '1', panel]);
      entries.push({ index: i + 1, scene, time: Number(time.toFixed(3)), panel });
    }
    const columns = Math.min(3, scenes.length);
    const rows = Math.ceil(scenes.length / columns);
    const contactSheet = path.join(dir, 'batch-contact-sheet.png');
    run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', '1', '-i', path.join(dir, '%02d.png'), '-vf', `tile=${columns}x${rows}:padding=12:margin=12:color=0xe9e9e5`, '-frames:v', '1', contactSheet]);
    console.log(JSON.stringify({ dir, contactSheet, panelSize: { width: panelWidth, height: panelHeight }, entries }));
  } catch (error) {
    fs.rmSync(dir, { recursive: true, force: true });
    throw error;
  }
}

main().catch(error => { console.error(`explainloop batch preview: ${error.message}`); process.exitCode = 1; });
