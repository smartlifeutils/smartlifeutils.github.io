(() => {
  const root = document.querySelector('[data-toy]');
  if (!root) return;
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const meter = root.querySelector('[data-toy-ink]');
  const meterText = root.querySelector('[data-toy-ink-text]');
  const status = root.querySelector('[data-toy-status]');
  const resetBtn = root.querySelector('[data-toy-reset]');
  const assistBtn = root.querySelector('[data-toy-assist]');
  const levelText = root.querySelector('[data-toy-level]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const W = 24;
  const H = 13.5;
  const G = 9.81 * 2.4;
  const INK = 60;
  const COST = 1.5;
  const LIFE = 4;
  const R = 0.34;
  const MIN_VX = 4.1;

  const COLORS = {
    ink: '#FF149E',
    inkCore: '#FFD6EC',
    orb: '#FFFFFF',
    orbGlow: '#19F2FF',
    portal: '#45EBFF',
    rock: '#0A0C10',
    hazard: '#FF6B42'
  };

  const LEVELS = [
    { name: 'Draw beneath it', start: [2.2, 3.2], v: [4.6, 0], portal: [20.5, 7.2], rocks: [], assist: [5, 11, 3, 0, 0.8] },
    { name: 'Over the wall', start: [2.2, 2.6], v: [4.4, 0], portal: [21, 9.6], rocks: [[11.2, 6.2, 1.4, 7.3]], assist: [3.5, 5, 7, 1.5, 0.8] },
    { name: 'Up to the portal', start: [2.2, 1.2], v: [4.8, 0], portal: [20.4, 5.2], rocks: [[11.6, 7.6, 1.2, 5.9]], assist: [5, 9.5, 3, 0, 0.8] }
  ];

  let level = 0;
  let orb;
  let lines = [];
  let drawing = null;
  let ink = INK;
  let state = 'ready';
  let scale = 1;
  let last = 0;
  let trail = [];
  let clearT = 0;

  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    scale = canvas.width / W;
    draw();
  }

  function reset(next) {
    if (next) level = (level + 1) % LEVELS.length;
    const L = LEVELS[level];
    orb = { x: L.start[0], y: L.start[1], vx: L.v[0], vy: L.v[1] };
    lines = [];
    drawing = null;
    ink = INK;
    trail = [];
    state = 'ready';
    clearT = 0;
    if (levelText) levelText.textContent = L.name;
    say('Draw a line under the orb. It starts moving when you do.');
    paintMeter();
    draw();
  }

  function say(t) { if (status && status.textContent !== t) status.textContent = t; }

  function paintMeter() {
    const p = Math.max(0, ink / INK);
    if (meter) meter.style.transform = `scaleX(${p})`;
    if (meterText) meterText.textContent = `${Math.round(p * 100)}% ink`;
    root.classList.toggle('is-low', p < 0.2);
  }

  function toWorld(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
  }

  function addPoint(p) {
    const pts = drawing.pts;
    const q = pts[pts.length - 1];
    const d = Math.hypot(p.x - q.x, p.y - q.y);
    if (d < 0.12) return;
    const cost = Math.min(d * COST, ink);
    if (cost <= 0) { finishLine(); say('Out of ink. Reset and spend it better.'); return; }
    const t = cost / (d * COST);
    pts.push({ x: q.x + (p.x - q.x) * t, y: q.y + (p.y - q.y) * t });
    ink -= cost;
    paintMeter();
  }

  function finishLine() {
    if (drawing && drawing.pts.length > 1) { drawing.born = performance.now() / 1000; lines.push(drawing); }
    drawing = null;
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (state === 'won' || state === 'lost') { reset(state === 'won'); return; }
    canvas.setPointerCapture(e.pointerId);
    if (ink <= 0) { say('Out of ink. Reset and spend it better.'); return; }
    drawing = { pts: [toWorld(e)], born: Infinity };
    if (state === 'ready') { state = 'run'; say('Keep it off the floor and get it to the portal.'); }
    e.preventDefault();
  });
  canvas.addEventListener('pointermove', (e) => { if (drawing) addPoint(toWorld(e)); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => canvas.addEventListener(t, finishLine));

  if (resetBtn) resetBtn.addEventListener('click', () => reset(false));
  if (assistBtn) assistBtn.addEventListener('click', () => {
    if (state !== 'ready' && state !== 'run') reset(false);
    const [x0, y0, dx, dy, bend] = LEVELS[level].assist;
    drawing = { pts: [{ x: x0, y: y0 }], born: Infinity };
    for (let i = 1; i <= 20; i++) {
      const t = i / 20;
      addPoint({ x: x0 + dx * t, y: y0 + dy * t + Math.sin(t * Math.PI) * bend });
    }
    finishLine();
    state = 'run';
    say('A line was drawn for you. Watch where it sends the orb.');
  });

  function collideSeg(a, b, now, born) {
    const ex = b.x - a.x, ey = b.y - a.y;
    const len2 = ex * ex + ey * ey;
    if (!len2) return false;
    let t = ((orb.x - a.x) * ex + (orb.y - a.y) * ey) / len2;
    t = Math.max(0, Math.min(1, t));
    const cx = a.x + ex * t, cy = a.y + ey * t;
    let nx = orb.x - cx, ny = orb.y - cy;
    const d = Math.hypot(nx, ny);
    if (d >= R + 0.15 || d === 0) return false;
    nx /= d; ny /= d;
    const vn = orb.vx * nx + orb.vy * ny;
    orb.x = cx + nx * (R + 0.15);
    orb.y = cy + ny * (R + 0.15);
    if (vn < 0) {
      orb.vx -= 1.85 * vn * nx;
      orb.vy -= 1.85 * vn * ny;
      orb.vx += nx * 0.28 * 4;
      orb.vy += ny * 0.28 * 4 - 0.22 * 4;
      const dir = Math.sign(orb.vx) || 1;
      if (Math.abs(orb.vx) < MIN_VX) orb.vx = dir * MIN_VX;
    }
    return true;
  }

  function hitRock(r) {
    const [x, y, w, h] = r;
    const cx = Math.max(x, Math.min(orb.x, x + w));
    const cy = Math.max(y, Math.min(orb.y, y + h));
    return Math.hypot(orb.x - cx, orb.y - cy) < R;
  }

  function step(dt) {
    if (state !== 'run') return;
    const now = performance.now() / 1000;
    lines = lines.filter((l) => now - l.born < LIFE);
    orb.vy += G * dt;
    orb.vy = Math.min(orb.vy, 22);
    const sp = Math.hypot(orb.vx, orb.vy);
    if (sp > 24) { orb.vx *= 24 / sp; orb.vy *= 24 / sp; }
    orb.x += orb.vx * dt;
    orb.y += orb.vy * dt;
    const all = drawing ? lines.concat([drawing]) : lines;
    for (const l of all) for (let i = 1; i < l.pts.length; i++) collideSeg(l.pts[i - 1], l.pts[i], now, l.born);
    if (orb.y < R) { orb.y = R; orb.vy = Math.abs(orb.vy) * 0.6; }
    if (orb.x < R) { orb.x = R; orb.vx = Math.abs(orb.vx); }
    if (orb.x > W - R) { orb.x = W - R; orb.vx = -Math.abs(orb.vx); }
    trail.push({ x: orb.x, y: orb.y });
    if (trail.length > 26) trail.shift();
    const L = LEVELS[level];
    for (const r of L.rocks) if (hitRock(r)) return lose('The orb hit the rock. Tap to try again.');
    if (orb.y > H - 0.55 - R) return lose('The orb touched the spikes. Tap to try again.');
    const px = L.portal[0], py = L.portal[1];
    if (Math.hypot((orb.x - px) / 0.9, (orb.y - py) / 1.5) < 1) {
      state = 'won';
      clearT = 0;
      const left = Math.round(ink / INK * 100);
      say(`Through the portal with ${left}% ink left. Tap for the next one.`);
    }
  }

  function lose(t) { state = 'lost'; say(t); }

  function draw() {
    if (!orb) return;
    const s = scale;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(s, 0, 0, s, 0, 0);
    const L = LEVELS[level];
    const now = performance.now() / 1000;

    ctx.fillStyle = COLORS.rock;
    for (const r of L.rocks) ctx.fillRect(r[0], r[1], r[2], r[3]);

    ctx.fillStyle = COLORS.hazard;
    const base = H - 0.15;
    ctx.beginPath();
    for (let x = 0; x < W; x += 0.6) {
      ctx.moveTo(x, base);
      ctx.lineTo(x + 0.3, base - 0.45);
      ctx.lineTo(x + 0.6, base);
    }
    ctx.fill();
    ctx.fillRect(0, base, W, 0.15);

    const [px, py] = L.portal;
    const pulse = reduced ? 0 : Math.sin(now * 3) * 0.06;
    ctx.lineWidth = 0.26;
    ctx.strokeStyle = COLORS.portal;
    ctx.beginPath();
    ctx.ellipse(px, py, 0.62 + pulse, 1.25 + pulse, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = COLORS.portal;
    ctx.beginPath();
    ctx.ellipse(px, py, 0.5, 1.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    const all = drawing ? lines.concat([drawing]) : lines;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const l of all) {
      const age = Number.isFinite(l.born) ? now - l.born : 0;
      const a = Math.max(0, 1 - Math.max(0, age - (LIFE - 1)) / 1);
      ctx.globalAlpha = a * 0.35;
      ctx.strokeStyle = COLORS.ink;
      ctx.lineWidth = 0.48;
      stroke(l.pts);
      ctx.globalAlpha = a;
      ctx.lineWidth = 0.3;
      stroke(l.pts);
      ctx.strokeStyle = COLORS.inkCore;
      ctx.lineWidth = 0.1;
      stroke(l.pts);
    }
    ctx.globalAlpha = 1;

    for (let i = 0; i < trail.length; i++) {
      const p = trail[i];
      ctx.globalAlpha = (i / trail.length) * 0.5;
      ctx.fillStyle = COLORS.orbGlow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, R * (0.4 + 0.6 * i / trail.length), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = COLORS.orbGlow;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, R * 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.orb;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, R * 0.85, 0, Math.PI * 2);
    ctx.fill();
  }

  function stroke(pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
  }

  function loop(t) {
    const dt = Math.min(0.033, (t - last) / 1000 || 0);
    last = t;
    const sub = 4;
    for (let i = 0; i < sub; i++) step(dt / sub);
    draw();
    requestAnimationFrame(loop);
  }

  new ResizeObserver(resize).observe(canvas);
  root.classList.add('is-live');
  reset(false);
  resize();
  requestAnimationFrame(loop);
})();
