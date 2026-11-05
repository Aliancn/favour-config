#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function usage() { console.log('Usage: node outline.mjs --input /path/article.md [--section "Heading"]'); }
function parseArgs(args) {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--help') { usage(); process.exit(0); }
    if (!['--input', '--section'].includes(args[i]) || !args[i + 1]) throw new Error(`Unknown or incomplete argument: ${args[i]}`);
    result[args[i].slice(2)] = args[++i];
  }
  if (!result.input) throw new Error('--input is required');
  return result;
}
function plainLength(text) {
  return [...text.replace(/```[\s\S]*?```/g, '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/^[#>*\-\s]+/gm, '')
    .replace(/[`*_~]/g, '')
    .replace(/\s+/g, '')].length;
}
function main() {
  const { input, section } = parseArgs(process.argv.slice(2));
  const file = path.resolve(input);
  if (!fs.existsSync(file) || !['.md', '.txt', '.markdown'].includes(path.extname(file).toLowerCase())) throw new Error('Input must be an existing Markdown or TXT file');
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const headings = lines.flatMap((value, i) => { const match = value.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/); return match ? [{ level: match[1].length, title: match[2], line: i + 1 }] : []; });
  const topLevel = headings.some(h => h.level === 2) ? 2 : 1;
  const topSections = headings.filter(h => h.level === topLevel);
  let selected = null, selectedText = lines.join('\n'), startLine = 1, endLine = lines.length;
  if (section) {
    const matches = headings.filter(h => h.title === section || h.title.includes(section));
    if (matches.length !== 1) throw new Error(`Section must match exactly one heading; matched ${matches.length}`);
    selected = matches[0];
    startLine = selected.line;
    const next = headings.find(h => h.line > selected.line && h.level <= selected.level);
    endLine = next ? next.line - 1 : lines.length;
    selectedText = lines.slice(startLine - 1, endLine).join('\n');
  }
  const count = plainLength(selectedText);
  const sectionCount = selected ? headings.filter(h => h.line >= startLine && h.line <= endLine && h.level === selected.level + 1).length : topSections.length;
  console.log(JSON.stringify({ file, selectedHeading: selected?.title ?? null, startLine, endLine, characters: count, topLevelSectionCount: sectionCount, needsExpandedOutline: count > 6000 || sectionCount > 5, headings: headings.filter(h => h.line >= startLine && h.line <= endLine) }, null, 2));
}
try { main(); } catch (error) { console.error(`outline: ${error.message}`); process.exitCode = 1; }
