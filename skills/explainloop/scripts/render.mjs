#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { makeKit } from './lib/components.mjs';

function usage() {
  console.log('Usage: node render.mjs --scene /path/name.scene.mjs --out /path/name.gif [--output-size WIDTHxHEIGHT] [--poster /path/preview.png]');
}
function run(binary, args, options = {}) {
  const result = spawnSync(binary, args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, ...options });
  if (result.error) throw new Error(`${binary}: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${binary} failed (${result.status}): ${(result.stderr || result.stdout).trim()}`);
  return result.stdout;
}
function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--help') { usage(); process.exit(0); }
    if (!['--scene', '--out', '--poster', '--output-size'].includes(argv[i]) || !argv[i + 1]) throw new Error(`Unknown or incomplete argument: ${argv[i]}`);
    const key = argv[i] === '--output-size' ? 'outputSize' : argv[i].slice(2);
    result[key] = argv[++i];
  }
  if (!result.scene || !result.out) throw new Error('Both --scene and --out are required');
  if (!path.isAbsolute(result.scene) || !path.isAbsolute(result.out) || (result.poster && !path.isAbsolute(result.poster))) throw new Error('Use absolute paths for scene, output, and poster');
  if (!result.out.endsWith('.gif')) throw new Error('Output must end in .gif');
  if (result.outputSize) {
    const match = /^([1-9]\d*)x([1-9]\d*)$/.exec(result.outputSize);
    if (!match) throw new Error('--output-size must be WIDTHxHEIGHT in positive integer pixels');
    const [, width, height] = match.map(Number);
    if (width > 4096 || height > 4096) throw new Error('--output-size exceeds the 4096px per-side limit');
    result.outputSize = { width, height };
  }
  return result;
}
function validateMeta(meta) {
  if (!meta || typeof meta !== 'object') throw new Error('Scene must export a meta object');
  for (const key of ['width', 'height', 'fps', 'duration']) {
    if (!Number.isFinite(meta[key]) || meta[key] <= 0) throw new Error(`meta.${key} must be a positive number`);
  }
  if (meta.width > 4096 || meta.height > 4096 || meta.fps > 60 || meta.duration > 30) throw new Error('Scene exceeds renderer limits (4096px, 60 fps, 30 seconds)');
  if (!Array.isArray(meta.sourceRefs) || !meta.sourceRefs.length) throw new Error('meta.sourceRefs must identify at least one source passage');
  const frames = Math.round(meta.fps * meta.duration);
  if (frames < 2 || frames > 900) throw new Error('Frame count must be 2–900');
  return frames;
}
async function main() {
  const options = parseArgs(process.argv.slice(2));
  run('rsvg-convert', ['--version']);
  run('ffmpeg', ['-version']);
  run('ffprobe', ['-version']);
  if (!fs.existsSync(options.scene)) throw new Error(`Scene not found: ${options.scene}`);
  const { meta, draw } = await import(pathToFileURL(options.scene).href + `?v=${fs.statSync(options.scene).mtimeMs}`);
  if (typeof draw !== 'function') throw new Error('Scene must export draw(t, kit)');
  const frameCount = validateMeta(meta);
  const outputSize = options.outputSize || { width: meta.width, height: meta.height };
  if (Math.abs(outputSize.width * meta.height - outputSize.height * meta.width) > 1e-6) {
    throw new Error(`--output-size ${outputSize.width}x${outputSize.height} does not match scene ratio ${meta.width}:${meta.height}; create a separate layout for this ratio`);
  }
  const kit = makeKit(meta);
  fs.mkdirSync(path.dirname(options.out), { recursive: true });
  const tempDir = fs.mkdtempSync(path.join(path.dirname(options.out), '.explainloop-'));
  const pendingOutput = path.join(tempDir, 'output.gif');
  try {
    for (let index = 0; index < frameCount; index++) {
      const fileName = String(index).padStart(4, '0');
      const svg = draw(index / meta.fps, kit);
      if (typeof svg !== 'string' || !svg.trimStart().startsWith('<svg')) throw new Error(`draw() returned invalid SVG at frame ${index}`);
      const svgPath = path.join(tempDir, `${fileName}.svg`);
      fs.writeFileSync(svgPath, svg);
      run('rsvg-convert', ['-w', String(outputSize.width), '-h', String(outputSize.height), '-o', path.join(tempDir, `${fileName}.png`), svgPath]);
    }
    if (options.poster) {
      fs.mkdirSync(path.dirname(options.poster), { recursive: true });
      fs.copyFileSync(path.join(tempDir, `${String(Math.floor(frameCount / 2)).padStart(4, '0')}.png`), options.poster);
    }
    const pattern = path.join(tempDir, '%04d.png');
    const palette = path.join(tempDir, 'palette.png');
    run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', String(meta.fps), '-i', pattern, '-vf', 'palettegen=stats_mode=diff', palette]);
    run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', String(meta.fps), '-i', pattern, '-i', palette, '-lavfi', 'paletteuse=dither=bayer:bayer_scale=5', '-loop', '0', pendingOutput]);
    run('ffmpeg', ['-v', 'error', '-i', pendingOutput, '-f', 'null', '-']);
    const probe = JSON.parse(run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,nb_frames,duration', '-of', 'json', pendingOutput]));
    const stream = probe.streams?.[0];
    if (Number(stream?.nb_frames) !== frameCount || Number(stream?.width) !== outputSize.width || Number(stream?.height) !== outputSize.height || Math.abs(Number(stream?.duration) - meta.duration) > .05) throw new Error('Output metadata differs from requested output size or scene timing');
    fs.mkdirSync(path.dirname(options.out), { recursive: true });
    fs.renameSync(pendingOutput, options.out);
    fs.chmodSync(options.out, 0o644);
    console.log(JSON.stringify({ output: options.out, frames: frameCount, width: outputSize.width, height: outputSize.height, duration: meta.duration, fps: meta.fps, bytes: fs.statSync(options.out).size }));
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
main().catch(error => { console.error(`explainloop: ${error.message}`); process.exitCode = 1; });
