#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

function run(binary, args) {
  const result = spawnSync(binary, args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error(`${binary}: ${result.error?.message || result.stderr.trim()}`);
  return result.stdout;
}
const file = process.argv[2];
if (!file || !fs.existsSync(file)) { console.error('Usage: node inspect.mjs /path/file.gif'); process.exit(1); }
try {
  const info = JSON.parse(run('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,nb_frames,duration', '-of', 'json', file])).streams?.[0];
  if (!info) throw new Error('No video stream');
  run('ffmpeg', ['-v', 'error', '-i', file, '-f', 'null', '-']);
  const hashes = run('ffmpeg', ['-v', 'error', '-i', file, '-f', 'framemd5', '-']).split('\n').filter(line => line && !line.startsWith('#')).map(line => line.split(',').at(-1).trim());
  let repeats = 0, runLength = 0, longest = 0;
  for (let i = 1; i < hashes.length; i++) {
    if (hashes[i] === hashes[i - 1]) { repeats++; runLength++; longest = Math.max(longest, runLength); }
    else runLength = 0;
  }
  const fps = hashes.length / Number(info.duration);
  console.log(JSON.stringify({ file, width: Number(info.width), height: Number(info.height), frames: hashes.length, duration: Number(info.duration), fps: Number(fps.toFixed(2)), bytes: fs.statSync(file).size, identicalAdjacentPairs: repeats, longestExactStaticSeconds: Number(((longest + 1) / fps).toFixed(2)), fullDecode: 'passed' }));
} catch (error) { console.error(`inspect failed: ${error.message}`); process.exitCode = 1; }
