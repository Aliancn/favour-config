#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getStyle } from './lib/styles.mjs';

const SHARED_TOKENS = ['bg', 'surface', 'ink', 'muted', 'line', 'accent', 'positive', 'secondary', 'titleFont', 'bodyFont', 'radius', 'stroke', 'texture'];

function usage() {
  console.log('Usage: node check-batch.mjs --scene /absolute/first.scene.mjs --scene /absolute/second.scene.mjs [--scene /absolute/next.scene.mjs ...]');
}

function parseArgs(argv) {
  const scenes = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--help') { usage(); process.exit(0); }
    if (argv[i] !== '--scene' || !argv[i + 1]) throw new Error(`Unknown or incomplete argument: ${argv[i]}`);
    const scene = argv[++i];
    if (!path.isAbsolute(scene)) throw new Error(`Use an absolute scene path: ${scene}`);
    if (!fs.existsSync(scene)) throw new Error(`Scene not found: ${scene}`);
    scenes.push(scene);
  }
  if (scenes.length < 2) throw new Error('Pass at least two --scene paths from the same batch');
  return scenes;
}

async function loadStyle(scene) {
  const { meta } = await import(pathToFileURL(scene).href);
  if (!meta || typeof meta !== 'object') throw new Error(`Scene must export meta: ${scene}`);
  const styleId = meta.style || 'editorial-paper';
  return { scene, styleId, tokens: getStyle(styleId, meta.styleOverrides) };
}

async function main() {
  const scenes = await Promise.all(parseArgs(process.argv.slice(2)).map(loadStyle));
  const first = scenes[0];
  const differences = [];
  for (const current of scenes.slice(1)) {
    if (current.styleId !== first.styleId) {
      differences.push(`${current.scene}: meta.style ${JSON.stringify(current.styleId)} differs from ${JSON.stringify(first.styleId)}`);
      continue;
    }
    for (const token of SHARED_TOKENS) {
      if (current.tokens[token] !== first.tokens[token]) differences.push(`${current.scene}: ${token} ${JSON.stringify(current.tokens[token])} differs from ${JSON.stringify(first.tokens[token])}`);
    }
  }
  if (differences.length) throw new Error(`Batch style mismatch (baseline ${first.scene}):\n${differences.map(item => `  ${item}`).join('\n')}`);
  console.log(JSON.stringify({ scenes: scenes.length, style: first.styleId, sharedTokens: SHARED_TOKENS.length, result: 'passed' }));
}

main().catch(error => { console.error(`explainloop: ${error.message}`); process.exitCode = 1; });
