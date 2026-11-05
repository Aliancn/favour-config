import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getStyle } from './styles.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../');
const ICON_DIR = path.join(ROOT, 'assets/icons');
const ICON_CACHE = new Map();
const IMAGE_CACHE = new Map();
const XML = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
const esc = value => String(value).replace(/[&<>"']/g, char => XML[char]);
const num = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const clamp = value => Math.max(0, Math.min(1, num(value)));
const easing = value => { const x = clamp(value); return x * x * (3 - 2 * x); };
const softStop = value => {
  const x = clamp(value);
  if (x === 0 || x === 1) return x;
  let lo = 0, hi = 1;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    const bx = 3 * (1 - mid) ** 2 * mid * .2 + mid ** 3;
    if (bx < x) lo = mid; else hi = mid;
  }
  const u = (lo + hi) / 2;
  return 3 * (1 - u) ** 2 * u * .8 + 3 * (1 - u) * u ** 2 + u ** 3;
};
const floatSettle = value => {
  const p = clamp(value);
  if (p === 1) return 1;
  return Math.min(1.03, Math.max(0, 1 - Math.exp(-8 * p) * Math.cos(2.2 * Math.PI * p)));
};
const motion = (t, start, duration, curve = 'soft-stop') => {
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('Motion duration must be positive');
  const progress = clamp((t - start) / duration);
  if (curve === 'soft-stop') return softStop(progress);
  if (curve === 'float-settle') return floatSettle(progress);
  throw new Error(`Unknown motion curve: ${curve}`);
};
const attr = value => esc(value);

export function makeKit(meta) {
  const width = num(meta.width), height = num(meta.height);
  const s = getStyle(meta.style || 'editorial-paper', meta.styleOverrides);
  const rx = value => value === undefined ? s.radius : value;
  const text = (x, y, value, size = 20, color = s.ink, weight = 500, anchor = 'start', family = s.bodyFont) =>
    `<text x="${num(x)}" y="${num(y)}" font-family="${attr(family)}" font-size="${num(size)}" font-weight="${num(weight)}" fill="${attr(color)}" text-anchor="${anchor}">${esc(value)}</text>`;
  const textLines = (x, y, lines, size = 20, lineHeight = size * 1.4, color = s.ink, weight = 500, family = s.bodyFont) =>
    lines.map((value, index) => text(x, y + index * lineHeight, value, size, color, weight, 'start', family)).join('');
  const rect = (x, y, w, h, fill = s.surface, radius = s.radius, stroke = 'none', sw = s.stroke) =>
    `<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(h)}" rx="${rx(radius)}" fill="${attr(fill)}" stroke="${attr(stroke)}" stroke-width="${num(sw)}"/>`;
  const line = (x1, y1, x2, y2, color = s.line, sw = s.stroke, dash = '') =>
    `<line x1="${num(x1)}" y1="${num(y1)}" x2="${num(x2)}" y2="${num(y2)}" stroke="${attr(color)}" stroke-width="${num(sw)}" stroke-linecap="round"${dash ? ` stroke-dasharray="${attr(dash)}"` : ''}/>`;
  const circle = (x, y, r, fill = 'none', stroke = s.ink, sw = s.stroke) =>
    `<circle cx="${num(x)}" cy="${num(y)}" r="${num(r)}" fill="${attr(fill)}" stroke="${attr(stroke)}" stroke-width="${num(sw)}"/>`;
  const pathSvg = (d, fill = 'none', stroke = s.ink, sw = s.stroke) =>
    `<path d="${attr(d)}" fill="${attr(fill)}" stroke="${attr(stroke)}" stroke-width="${num(sw)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const group = (opacity, svg) => `<g opacity="${clamp(opacity).toFixed(3)}">${svg}</g>`;
  const move = (x, y, svg) => `<g transform="translate(${num(x)} ${num(y)})">${svg}</g>`;
  const progress = (x, y, w, value, h = 8) => rect(x, y, w, h, s.secondary, h / 2) + rect(x, y, w * clamp(value), h, s.accent, h / 2);
  const statusBadge = (x, y, label, state = 'active') => {
    const color = state === 'success' ? s.positive : state === 'muted' ? s.muted : s.accent;
    const w = Math.max(58, [...String(label)].length * 15 + 20);
    return rect(x, y, w, 28, color, 14) + text(x + w / 2, y + 19, label, 15, s.surface, 650, 'middle');
  };
  const card = (x, y, w, h, label, subtitle = '') => rect(x, y, w, h, s.surface, s.radius, s.line) + text(x + 14, y + 29, label, 19, s.ink, 650) + (subtitle ? text(x + 14, y + 54, subtitle, 15, s.muted) : '');

  let texture = '';
  if (s.texture === 'paper' || s.texture === 'archive') {
    let seed = s.texture === 'archive' ? 10429 : 80317;
    const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < Math.round(width * height / 1800); i++) {
      texture += `<circle cx="${Math.round(random() * width)}" cy="${Math.round(random() * height)}" r="${(0.25 + random() * 0.4).toFixed(2)}" fill="${s.ink}" opacity="0.035"/>`;
    }
  } else if (s.texture === 'grid' || s.texture === 'blueprint') {
    const step = s.texture === 'grid' ? 48 : 32;
    for (let x = step; x < width; x += step) texture += line(x, 0, x, height, s.line, .45);
    for (let y = step; y < height; y += step) texture += line(0, y, width, y, s.line, .45);
    texture = group(s.texture === 'grid' ? .22 : .25, texture);
  } else if (s.texture === 'illustrated') {
    texture = circle(width - 100, 54, 70, s.secondary, 'none') + circle(28, height - 42, 54, s.secondary, 'none');
  } else if (s.texture === 'newsroom') {
    texture = rect(0, 0, 9, height, s.accent, 0);
  } else if (s.texture === 'soft-wash') {
    texture = `<defs><radialGradient id="amg-wash-a" cx="78%" cy="12%" r="76%"><stop stop-color="${attr(s.accent)}" stop-opacity=".19"/><stop offset="1" stop-color="${attr(s.accent)}" stop-opacity="0"/></radialGradient><radialGradient id="amg-wash-b" cx="8%" cy="96%" r="64%"><stop stop-color="${attr(s.secondary)}" stop-opacity=".7"/><stop offset="1" stop-color="${attr(s.secondary)}" stop-opacity="0"/></radialGradient></defs>` +
      rect(0, 0, width, height, 'url(#amg-wash-a)', 0) + rect(0, 0, width, height, 'url(#amg-wash-b)', 0);
  } else if (s.texture === 'edge-glow') {
    texture = `<defs><radialGradient id="amg-edge-glow" cx="84%" cy="45%" r="74%"><stop stop-color="${attr(s.accent)}" stop-opacity=".17"/><stop offset=".48" stop-color="${attr(s.accent)}" stop-opacity=".07"/><stop offset="1" stop-color="${attr(s.accent)}" stop-opacity="0"/></radialGradient></defs>` +
      rect(0, 0, width, height, 'url(#amg-edge-glow)', 0);
  } else if (s.texture === 'layered-matte') {
    texture = `<path d="M${width * .48} 0H${width}V${height}H${width * .66}Z" fill="${attr(s.secondary)}" opacity=".52"/>` +
      `<path d="M${width * .78} 0H${width}V${height}H${width * .94}Z" fill="${attr(s.surface)}" opacity=".48"/>` +
      line(width * .48, 0, width * .66, height, s.line, 1.3);
  } else if (s.texture === 'quiet-motif') {
    const cx = width * 1.035, cy = height * .54;
    for (let i = 0; i < 7; i++) {
      const radius = width * (.13 + i * .055);
      texture += `<path d="M${cx - radius} ${cy}A${radius} ${radius} 0 0 1 ${cx} ${cy - radius}" fill="none" stroke="${attr(s.line)}" stroke-width="1.4" opacity=".32"/>`;
    }
  } else if (s.texture === 'focus-halo') {
    texture = `<defs><radialGradient id="amg-focus-halo" cx="72%" cy="57%" r="43%"><stop stop-color="${attr(s.accent)}" stop-opacity=".24"/><stop offset=".52" stop-color="${attr(s.accent)}" stop-opacity=".09"/><stop offset="1" stop-color="${attr(s.accent)}" stop-opacity="0"/></radialGradient></defs>` +
      rect(0, 0, width, height, 'url(#amg-focus-halo)', 0) +
      `<ellipse cx="${width * .72}" cy="${height * .57}" rx="${width * .21}" ry="${height * .29}" fill="none" stroke="${attr(s.line)}" stroke-width="1" opacity=".36"/>`;
  } else if (s.texture === 'clipped-grid') {
    const left = width * .55, top = height * .17, right = width * .95, bottom = height * .84;
    texture = `<rect x="${left}" y="${top}" width="${right - left}" height="${bottom - top}" fill="${attr(s.secondary)}" opacity=".37"/>`;
    for (let i = 1; i < 6; i++) texture += line(left + (right - left) * i / 6, top, left + (right - left) * i / 6, bottom, s.line, .8);
    for (let i = 1; i < 5; i++) texture += line(left, top + (bottom - top) * i / 5, right, top + (bottom - top) * i / 5, s.line, .8);
    texture += line(left, top, right, top, s.line, 1) + line(left, bottom, right, bottom, s.line, 1);
  } else if (s.texture === 'ribbon-field') {
    texture = `<path d="M${width * .54} ${height * .78}C${width * .68} ${height * .37} ${width * .82} ${height * .78} ${width * 1.06} ${height * .17}" fill="none" stroke="${attr(s.secondary)}" stroke-width="${height * .24}" opacity=".74"/>`;
    for (let i = 0; i < 11; i++) {
      const y = height * (.65 + i * .013);
      const end = height * (.06 + i * .013);
      texture += `<path d="M${width * .51} ${y}C${width * .65} ${height * (.22 + i * .014)} ${width * .81} ${height * (.8 + i * .009)} ${width * 1.05} ${end}" fill="none" stroke="${attr(i % 3 === 0 ? s.accent : s.line)}" stroke-width="${i % 3 === 0 ? 2.2 : 1.3}" opacity="${i % 3 === 0 ? .52 : .64}"/>`;
    }
  } else if (s.texture === 'contour-lines') {
    for (let i = 0; i < 9; i++) {
      const offset = i * height * .038;
      texture += `<path d="M${width * .49} ${height * .86 + offset}C${width * .65} ${height * .72 + offset} ${width * .55} ${height * .31 + offset} ${width * .76} ${height * .34 + offset}S${width * .91} ${height * .78 + offset} ${width * 1.1} ${height * .02 + offset}" fill="none" stroke="${attr(i === 4 ? s.accent : s.line)}" stroke-width="${i === 4 ? 2.5 : 1.25}" opacity="${i === 4 ? .56 : .45}"/>`;
    }
  } else if (s.texture === 'halftone-margin') {
    for (let row = 0; row < 22; row++) {
      for (let col = 0; col < 17; col++) {
        const x = width * (.70 + col * .019), y = height * (.11 + row * .035);
        const fade = Math.min(1, Math.max(0, (x / width - .7) * 3.2)) * Math.min(1, Math.max(0, (y / height - .08) * 2.4));
        texture += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.25 + fade * 1.1).toFixed(2)}" fill="${attr(s.accent)}" opacity="${(.07 + fade * .16).toFixed(3)}"/>`;
      }
    }
  } else if (s.texture === 'editorial-band') {
    texture = `<rect x="${width * .585}" y="0" width="${width * .415}" height="${height}" fill="${attr(s.secondary)}" opacity=".78"/>` +
      `<rect x="${width * .585}" y="${height * .66}" width="${width * .415}" height="${height * .34}" fill="${attr(s.accent)}" opacity=".14"/>` +
      line(width * .585, height * .08, width * .585, height * .92, s.line, 1.2) +
      line(width * .585, height * .66, width, height * .66, s.accent, 2);
  }
  const svg = body => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${rect(0, 0, width, height, s.bg, 0)}${texture}${body}</svg>`;
  const page = ({ kicker = '', title = '', body = '', caption = '' }) => {
    const top = height * .215, bottom = height * .88;
    let frame = line(45, top, width - 45, top, s.line, 1) + line(45, bottom, width - 45, bottom, s.line, 1);
    if (meta.style === 'swiss-grid') frame += rect(45, top - 3, 145, 6, s.accent, 0) + rect(width - 62, 0, 17, top, s.ink, 0);
    if (meta.style === 'technical-blueprint') frame += [45, width / 2, width - 45].map(x => line(x, top - 8, x, top + 8, s.muted, 1)).join('') + text(width - 45, height * .075, `${width} × ${height}`, 14, s.muted, 500, 'end');
    if (meta.style === 'data-newsroom') frame += rect(45, top - 3, 75, 6, s.accent, 0) + text(width - 45, height * .075, 'VISUAL EXPLAINER', 14, s.muted, 650, 'end');
    if (meta.style === 'playful-illustrated') frame += pathSvg(`M45 ${top + 5}q120 -12 240 0t240 0t240 0`, 'none', s.accent, 1.6);
    return svg((kicker ? text(45, height * .075, kicker, Math.round(height * .035), s.muted, 500) : '') +
      (title ? text(45, height * .17, title, Math.round(height * .072), s.ink, 700, 'start', s.titleFont) : '') +
      frame + body + (caption ? text(width / 2, height * .946, caption, Math.round(height * .037), s.ink, 650, 'middle') : ''));
  };
  const icon = (name, x, y, size = 24, color = s.ink) => {
    if (!/^[a-z0-9-]+$/.test(name)) throw new Error(`Invalid icon name: ${name}`);
    let markup = ICON_CACHE.get(name);
    if (!markup) {
      const file = path.join(ICON_DIR, `${name}.svg`);
      if (!fs.existsSync(file)) throw new Error(`Icon not bundled: ${name}`);
      markup = fs.readFileSync(file, 'utf8');
      ICON_CACHE.set(name, markup);
    }
    const inside = markup.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*$/, '').replaceAll('currentColor', color);
    return `<g transform="translate(${num(x)} ${num(y)}) scale(${num(size) / 24})" stroke="${attr(color)}" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inside}</g>`;
  };
  const person = (x, y, size = 56) => circle(x + size / 2, y + size * .24, size * .16, s.surface, s.ink) + pathSvg(`M${x + size * .13} ${y + size * .85}c0-${size * .27} ${size * .16}-${size * .4} ${size * .37}-${size * .4}s${size * .37} ${size * .13} ${size * .37} ${size * .4}`);
  const avatar = (x, y, label = '人', size = 42) => circle(x + size / 2, y + size / 2, size / 2, s.secondary, s.ink) + text(x + size / 2, y + size * .68, label, size * .45, s.ink, 650, 'middle');
  const avatarStack = (x, y, labels = ['A', 'B'], size = 42) => labels.map((label, i) => avatar(x + i * size * .7, y, label, size)).join('');
  const mail = (x, y, size = 40) => rect(x, y + size * .12, size, size * .7, s.surface, 3, s.accent) + pathSvg(`M${x + 1} ${y + size * .18}L${x + size / 2} ${y + size * .5}L${x + size - 1} ${y + size * .18}`, 'none', s.accent);
  const chatBubble = (x, y, w, h, label = '') => rect(x, y, w, h, s.surface, s.radius, s.line) + pathSvg(`M${x + 20} ${y + h}l-8 12v-12`, s.surface, s.line) + text(x + 14, y + 29, label, 18);
  const phone = (x, y, w = 80, h = 140, label = '') => rect(x, y, w, h, s.surface, 13, s.ink) + line(x + w * .4, y + 10, x + w * .6, y + 10, s.muted) + text(x + w / 2, y + h / 2, label, 17, s.ink, 600, 'middle');
  const browser = (x, y, w, h, title = '') => rect(x, y, w, h, s.surface, s.radius, s.line) + rect(x + 1, y + 1, w - 2, 23, s.secondary, s.radius) + [13, 22, 31].map(dx => circle(x + dx, y + 12, 2.5, s.line, 'none')).join('') + text(x + 14, y + 55, title, 18, s.ink, 600);
  const document = (x, y, w, h, label = '') => rect(x, y, w, h, s.surface, 2, s.ink) + line(x + 11, y + 36, x + w - 11, y + 36) + text(x + 11, y + 25, label, 17, s.ink, 600);
  const codeWindow = (x, y, w, h, label = '') => browser(x, y, w, h, label) + text(x + 14, y + 82, '< code />', 16, s.accent, 600);
  const issueTicket = (x, y, w, h, title = '') => card(x, y, w, h, title) + statusBadge(x + 13, y + h - 38, 'Issue');
  const calendar = (x, y, w, h, date = '01') => rect(x, y, w, h, s.surface, s.radius, s.line) + rect(x, y, w, 25, s.accent, s.radius) + text(x + w / 2, y + h * .67, date, 26, s.ink, 700, 'middle');
  const database = (x, y, w, h, label = '') => `<ellipse cx="${x + w / 2}" cy="${y + 14}" rx="${w / 2}" ry="14" fill="${s.surface}" stroke="${s.ink}" stroke-width="${s.stroke}"/>` + rect(x, y + 14, w, h - 28, s.surface, 0, s.ink) + `<ellipse cx="${x + w / 2}" cy="${y + h - 14}" rx="${w / 2}" ry="14" fill="${s.surface}" stroke="${s.ink}" stroke-width="${s.stroke}"/>` + text(x + w / 2, y + h / 2 + 5, label, 17, s.ink, 600, 'middle');
  const taskCard = (x, y, w, h, title = '') => card(x, y, w, h, title) + progress(x + 14, y + h - 20, w - 28, .55, 6);
  const timeline = (x, y, w, items = []) => line(x, y, x + w, y, s.accent, 3) + items.map((item, i) => { const px = x + (items.length === 1 ? w / 2 : i * w / (items.length - 1)); return circle(px, y, 7, s.surface, s.accent, 2) + text(px, y + 31, item, 15, s.ink, 600, 'middle'); }).join('');
  const flowArrow = (x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1, length = Math.hypot(dx, dy);
    if (length < 1) return '';
    const ux = dx / length, uy = dy / length, bx = x2 - ux * 10, by = y2 - uy * 10;
    return line(x1, y1, x2, y2, s.accent, 2.5) + pathSvg(`M${bx - uy * 5} ${by + ux * 5}L${x2} ${y2}L${bx + uy * 5} ${by - ux * 5}`, 'none', s.accent, 2.5);
  };
  const queue = (x, y, w, labels = []) => labels.map((label, i) => card(x, y + i * 48, w, 42, label)).join('');
  const quote = (x, y, w, h, value = '') => rect(x, y, w, h, s.secondary, s.radius, s.line) + text(x + 15, y + 31, `“${value}”`, 18, s.ink, 550);
  const metric = (x, y, value, label = '') => text(x, y, value, 33, s.accent, 700) + text(x, y + 23, label, 16, s.muted, 500);
  const barChart = (x, y, w, h, items = []) => { const gap = w / Math.max(items.length, 1); return line(x, y + h, x + w, y + h, s.line) + items.map((item, i) => rect(x + i * gap + gap * .18, y + h * (1 - clamp(item.value)), gap * .64, h * clamp(item.value), s.accent, 2) + text(x + (i + .5) * gap, y + h + 22, item.label, 14, s.muted, 500, 'middle')).join(''); };
  const lineChart = (x, y, w, h, points = []) => { if (points.length < 2) return ''; const d = points.map((v, i) => `${i ? 'L' : 'M'}${x + i * w / (points.length - 1)} ${y + h * (1 - clamp(v))}`).join(' '); return line(x, y + h, x + w, y + h, s.line) + pathSvg(d, 'none', s.accent, 3); };
  const comparison = (x, y, w, h, left = '', right = '') => rect(x, y, w / 2 - 5, h, s.surface, s.radius, s.line) + rect(x + w / 2 + 5, y, w / 2 - 5, h, s.surface, s.radius, s.line) + text(x + w / 4, y + h / 2 + 7, left, 21, s.ink, 650, 'middle') + text(x + w * .75, y + h / 2 + 7, right, 21, s.ink, 650, 'middle');
  const mapPin = (x, y, size = 38) => pathSvg(`M${x + size / 2} ${y + size}C${x + size * .2} ${y + size * .57} ${x + size * .1} ${y + size * .33} ${x + size * .5} ${y + size * .14}C${x + size * .9} ${y + size * .33} ${x + size * .8} ${y + size * .57} ${x + size / 2} ${y + size}Z`, s.surface, s.accent) + circle(x + size / 2, y + size * .45, size * .08, s.accent, 'none');
  const book = (x, y, w, h, label = '') => rect(x, y, w, h, s.surface, 2, s.ink) + line(x + 12, y, x + 12, y + h, s.accent, 2) + text(x + w / 2, y + h / 2 + 6, label, 18, s.ink, 600, 'middle');
  const clock = (x, y, size = 40) => circle(x + size / 2, y + size / 2, size / 2, s.surface, s.ink) + line(x + size / 2, y + size / 2, x + size / 2, y + size * .27, s.ink) + line(x + size / 2, y + size / 2, x + size * .73, y + size / 2, s.ink);
  const imageFrame = (x, y, w, h, href, label = '') => {
    if (!path.isAbsolute(href) || !fs.existsSync(href)) throw new Error(`Image source must be an existing absolute file: ${href}`);
    let data = IMAGE_CACHE.get(href);
    if (!data) {
      const ext = path.extname(href).toLowerCase();
      const mime = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : null;
      if (!mime) throw new Error(`Unsupported image type: ${ext}`);
      data = `data:${mime};base64,${fs.readFileSync(href).toString('base64')}`;
      IMAGE_CACHE.set(href, data);
    }
    return rect(x, y, w, h, s.surface, s.radius, s.line) + `<image x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 28}" preserveAspectRatio="xMidYMid meet" href="${data}"/>` + text(x + 8, y + h - 8, label, 14, s.muted);
  };
  const emailCard = (x, y, w, h, { sender = '', subject = '', preview = '', time = '' } = {}) =>
    rect(x, y, w, h, s.surface, s.radius, s.line) +
    icon('mail', x + 17, y + 14, 20, s.muted) + text(x + 48, y + 31, '邮件', 16, s.muted, 600) +
    (time ? text(x + w - 18, y + 31, time, 15, s.muted, 500, 'end') : '') +
    line(x + 17, y + 47, x + w - 17, y + 47, s.line, 1) +
    avatar(x + 17, y + 62, sender.slice(0, 1), 38) + text(x + 68, y + 89, sender, 19, s.ink, 650) +
    text(x + 18, y + 128, subject, 24, s.ink, 700) +
    (preview ? text(x + 18, y + 158, preview, 18, s.muted, 500) : '');
  const eventCard = (x, y, w, h, { month = '', day = '', title = '', time = '', status = '' } = {}) =>
    rect(x, y, w, h, s.surface, s.radius, s.line) +
    rect(x, y, 79, h, s.secondary, s.radius) +
    text(x + 39, y + 46, month, 16, s.muted, 700, 'middle') +
    text(x + 39, y + 96, day, 38, s.ink, 700, 'middle') +
    text(x + 102, y + 44, title, 23, s.ink, 700) +
    (time ? text(x + 102, y + 76, time, 18, s.muted, 500) : '') +
    (status ? statusBadge(x + 102, y + h - 40, status, 'success') : '');
  const chatMessage = (x, y, w, h, { sender = '', message = '', time = '', direction = 'incoming' } = {}) =>
    rect(x, y, w, h, direction === 'outgoing' ? s.secondary : s.surface, s.radius, s.line) +
    avatar(x + 15, y + 15, sender.slice(0, 1), 37) +
    text(x + 65, y + 39, sender, 17, s.ink, 650) +
    (time ? text(x + w - 17, y + 39, time, 14, s.muted, 500, 'end') : '') +
    text(x + 17, y + 82, message, 19, s.ink, 500);

  return Object.freeze({ style: s, svg, page, text, textLines, rect, line, circle, path: pathSvg, group, move, ease: easing, reveal: (t, start, duration) => easing((t - start) / duration), motion, icon,
    person, avatar, avatarStack, mail, chatBubble, phone, browser, document, codeWindow, issueTicket, calendar, database, taskCard, progress, statusBadge,
    timeline, flowArrow, queue, quote, metric, barChart, lineChart, comparison, mapPin, book, clock, imageFrame, emailCard, eventCard, chatMessage });
}
