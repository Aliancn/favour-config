export const meta = {
  title: 'One coordinator, parallel work', style: 'nocturne-editorial',
  width: 960, height: 540, fps: 30, duration: 5,
  styleOverrides: { texture: 'edge-glow' },
  sourceRefs: [{
    source: 'demo/sample-routing-article.md > One coordinator, parallel work',
    claim: 'Email, chat, and issue requests converge on a coordinator; research and drafting happen in separate contexts; the coordinator returns one reply.',
    status: 'fictional proposed workflow',
  }],
};

export function draw(t, kit) {
  const s = kit.style;
  const enter = kit.motion(t, .35, .95);
  const fan = kit.motion(t, 1.35, .8);
  const returnTrip = kit.motion(t, 2.45, .8);
  const reply = kit.motion(t, 3.35, .45);
  const fade = 1 - kit.motion(t, 4.55, .35);
  let b = '';

  b += kit.text(60, 62, 'EXPLAINLOOP  /  FICTIONAL WORKFLOW', 16, s.muted, 650);
  b += kit.text(58, 128, 'One voice. Parallel work.', 52, s.ink, 700, 'start', s.titleFont);
  b += kit.text(61, 167, 'A request travels through distinct roles before one reply returns.', 21, s.muted, 500);
  b += kit.line(60, 188, 900, 188, s.line, 1);

  b += kit.text(64, 231, 'SOURCES', 15, s.muted, 700);
  const sources = [[250, 'mail', 'Email'], [308, 'message-circle', 'Chat'], [366, 'git-pull-request', 'Issue']];
  for (const [y, icon, label] of sources) {
    b += kit.icon(icon, 65, y - 18, 22, s.accent);
    b += kit.text(98, y, label, 21, s.ink, 600);
    b += kit.line(179, y - 7, 328, 301, s.line, 1.3);
  }

  b += kit.text(360, 231, 'COORDINATE', 15, s.muted, 700);
  b += kit.circle(397, 301, 69, s.surface, s.line, 1.6);
  b += kit.circle(397, 301, 55, s.bg, s.accent, 2.2);
  b += kit.text(397, 309, 'Route', 24, s.ink, 700, 'middle');

  b += kit.text(650, 231, 'SEPARATE CONTEXTS', 15, s.muted, 700);
  b += kit.group(fan * fade,
    kit.line(465, 287, 656, 261, s.accent, 1.8) +
    kit.line(465, 315, 656, 349, s.accent, 1.8) +
    kit.rect(655, 235, 233, 54, s.surface, 10, s.line, 1.2) +
    kit.rect(655, 325, 233, 54, s.surface, 10, s.line, 1.2) +
    kit.text(675, 269, 'Research', 22, s.ink, 600) +
    kit.text(675, 359, 'Draft', 22, s.ink, 600) +
    kit.circle(858, 262, 6, s.accent, 'none') +
    kit.circle(858, 352, 6, s.accent, 'none'));

  b += kit.group((1 - fan) * enter * fade,
    kit.circle(179 + (328 - 179) * enter, 243 + (301 - 243) * enter, 6, s.accent, 'none') +
    kit.circle(179 + (328 - 179) * enter, 301, 6, s.accent, 'none') +
    kit.circle(179 + (328 - 179) * enter, 359 - (359 - 301) * enter, 6, s.accent, 'none'));
  b += kit.group(fan * (1 - returnTrip) * fade,
    kit.circle(465 + 191 * fan, 287 - 26 * fan, 7, s.accent, 'none') +
    kit.circle(465 + 191 * fan, 315 + 34 * fan, 7, s.accent, 'none'));
  b += kit.group(returnTrip * (1 - reply) * fade,
    kit.circle(656 - 191 * returnTrip, 261 + 26 * returnTrip, 7, s.accent, 'none') +
    kit.circle(656 - 191 * returnTrip, 349 - 34 * returnTrip, 7, s.accent, 'none'));

  b += kit.group(reply * fade,
    kit.line(397, 374, 397, 423, s.accent, 2) +
    kit.rect(294, 424, 206, 54, s.accent, 10) +
    kit.text(397, 459, 'ONE REPLY', 21, s.bg, 700, 'middle'));
  b += kit.text(60, 516, 'Source: original sample article  ·  Proposed sequence, not a product result', 16, s.muted, 500);
  return kit.svg(b);
}
