(function () {
  "use strict";

  var root = document.querySelector("[data-toy]");
  var ART = window.WR_ART;
  if (!root || !ART) return;
  var canvas = root.querySelector("canvas");
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var BOATS = {
    "motor-dinghy": {
      len: 3.6, fit: 1.48, off: [0, 0.364], hullH: 0.78, draft: 0.24,
      cap: { draw: 1, off: [-0.92, 0.16], scale: 1, stand: false },
      top: 7.6, air: 130, capsize: 90
    },
    "speedboat": {
      len: 6, fit: 1.43, off: [0.04, 0.243], hullH: 0.81, draft: 0.26,
      cap: { draw: 2 },
      top: 11.9, air: 100, capsize: 94
    },
    "jet-ski": {
      len: 3, fit: 1.43, off: [0.01, 0.198], hullH: 0.62, draft: 0.3,
      cap: { draw: 0, off: [-0.39, 0.6], scale: 1.2, stand: false },
      top: 13.6, air: 160, capsize: 86
    },
    "rescue-rib": {
      len: 4.5, fit: 1.43, off: [0, 0.226], hullH: 0.6, draft: 0.22,
      cap: { draw: 1, off: [-0.49, 0.3], scale: 1, stand: true },
      top: 11, air: 85, capsize: 117
    }
  };

  var SEAS = {
    "calm-lake": {
      sky: ["#a8c8de", "#ebd9c4"], far: "#2a6678", back: "#2e7e8c",
      water: ["#4fcbc4", "#2494a8", "#146176", "#0b3a4c"], crest: "#9bf0e4", rim: "#105165", band: "#8ae8de",
      amp: 0.95, wl: 22, amp2: 0.26, wl2: 9, speed: 0.3, steep: 0.6, haze: 0.5,
      far1: ["FarMountain_01", "FarMountain_02"], mid: ["Shoreline_01", "Shoreline_02"], marks: [],
      cloud: "Cloud_01", actor: "paddleboarder"
    },
    "nile": {
      sky: ["#6fa8ce", "#f0d2a0"], far: "#276159", back: "#34786c",
      water: ["#5ec4a8", "#2e8e82", "#1c5c58", "#123a3a"], crest: "#a8e8c8", rim: "#184e4c", band: "#96dfc0",
      amp: 1.0, wl: 22, amp2: 0.28, wl2: 9, speed: 0.28, steep: 0.56, haze: 0.55,
      far1: ["Far_01", "Far_02"], mid: ["Mid_01", "Mid_02"], marks: ["Pyramid", "Felucca"],
      cloud: null, actor: "hippo"
    },
    "loch-ness": {
      sky: ["#3e5a73", "#7e9698"], far: "#194339", back: "#215447",
      water: ["#3e8c74", "#1e5e52", "#123c36", "#0a2622"], crest: "#7ed8b4", rim: "#0f332e", band: "#6fc6a5",
      amp: 1.1, wl: 24, amp2: 0.3, wl2: 10, speed: 0.22, steep: 0.56, haze: 0.55, fog: true,
      far1: ["Far_01", "Far_02"], mid: ["Mid_01", "Mid_02"], marks: ["UrquhartTower", "Monster"],
      cloud: null, actor: "nessie"
    },
    "pacific": {
      sky: ["#7fd3e8", "#cdeff5"], far: "#14557e", back: "#1b6a8e",
      water: ["#35c9e0", "#1a8fc4", "#0f5a96", "#093a66"], crest: "#8feff5", rim: "#0d4d83", band: "#7ae6f0",
      amp: 1.7, wl: 30, amp2: 0.4, wl2: 12, speed: 0.36, steep: 0.78, haze: 0.6,
      far1: ["Far_01", "Far_02", "Far_03"], mid: ["Mid_01", "Mid_02"], marks: ["LighthouseIsland"],
      cloud: "Cloud_01", actor: "whale"
    },
    "caribbean": {
      sky: ["#4fc3e8", "#bceff0"], far: "#207891", back: "#2d91a3",
      water: ["#58e4dc", "#20b4c8", "#1078a0", "#0a4e74"], crest: "#b4f8f0", rim: "#0e678e", band: "#9ef3eb",
      amp: 1.25, wl: 26, amp2: 0.32, wl2: 10, speed: 0.26, steep: 0.66, haze: 0.55,
      far1: ["Far_01", "Far_02"], mid: ["Mid_01", "Mid_02"], marks: ["ColonialFort", "BeachedSloop"],
      cloud: null, actor: "manta"
    }
  };

  var ACTORS = {
    paddleboarder: { w: 3.2, sink: 0.08, say: "Sorry!", topple: true },
    hippo: { w: 3.6, sink: 0.55, say: "Hey!", lift: 7.5 },
    nessie: { w: 5.2, sink: 0.5, say: "Nessie hop", lift: 6 },
    whale: { w: 9.5, sink: 0.62, say: "Whale hop", lift: 5.5 },
    manta: { w: 3.2, leap: true, say: "Manta!" }
  };

  var G = 9.81;
  var TAU = Math.PI * 2;

  var images = {};
  function img(key) {
    var meta = ART[key];
    if (!meta) return null;
    var cached = images[key];
    if (!cached) {
      cached = images[key] = new Image();
      cached.decoding = "async";
      cached.onload = function () { if (!running && S) render(0); };
      cached.src = meta.src;
    }
    return cached.complete && cached.naturalWidth ? cached : null;
  }

  var state = {
    boat: "motor-dinghy",
    sea: "pacific",
    t: 0,
    throttle: false,
    brake: false,
    started: false
  };
  var B, S;
  var hull;
  var run;
  var coins = [];
  var actors = [];
  var parts = [];
  var skipper = null;

  var W = 0, H = 0, dpr = 1, ppm = 50;
  var cam = { x: 0, y: 0 };

  function readPicker() {
    var b = root.parentNode.querySelector('[data-boat][aria-pressed="true"]');
    var s = root.parentNode.querySelector('[data-sea][aria-pressed="true"]');
    if (b) state.boat = b.getAttribute("data-boat");
    if (s) state.sea = s.getAttribute("data-sea");
  }

  function bestKey() { return "wr-best-" + state.sea; }
  function loadBest() {
    try { return +localStorage.getItem(bestKey()) || 0; } catch (e) { return 0; }
  }
  function saveBest(v) {
    try { localStorage.setItem(bestKey(), String(v)); } catch (e) {  }
  }

  function resetHull(x) {
    hull = {
      x: x, y: surf(x, state.t), vx: 0, vy: 0,
      th: 0, w: 0,
      air: false, airT: 0, apex: 0, takeoffX: 0, spin: 0, flipsPaid: 0,
      turtle: 0, tipped: false, dead: false, deadT: 0,
      hopStreak: 0, lastLand: -9, prevTarget: null
    };
  }

  function newRun() {
    run = { start: 0, far: 0, coins: 0, best: loadBest(), nextCoins: 26, nextActor: 40 };
    coins = [];
    actors = [];
    parts = [];
    skipper = null;
    resetHull(0);
    cam.x = 0;
    cam.y = 0;
    hud();
  }

  function useBoat(key) {
    state.boat = key;
    B = BOATS[key];
    if (hull) {
      var x = hull.x;
      resetHull(x);
    }
    resize();
  }

  function useSea(key) {
    state.sea = key;
    S = SEAS[key];
    newRun();
  }

  function gerstner(X, t, A, L, speed, steep, phase) {
    var k = TAU / L;
    var c = Math.sqrt(G / k) * speed;
    var q = steep / k;
    var p = k * (X - c * t) + phase;
    var x0 = p;
    for (var i = 0; i < 4; i++) x0 = p + steep * Math.sin(x0);
    return A * Math.cos(x0);
  }

  function surf(x, t) {
    return gerstner(x, t, S.amp, S.wl, S.speed, S.steep, 0) +
      gerstner(x, t, S.amp2, S.wl2, S.speed * 1.1, 0.3, 1.7) +
      0.06 * Math.sin(x * 1.3 - t * 2.2) +
      0.04 * Math.sin(x * 2.7 + t * 1.6);
  }

  function topSpeed() { return 5 + B.top * 0.95; }

  function step(dt) {
    var t = state.t;
    var h = hull;
    var half = B.len * 0.45;

    var ys = surf(h.x - half, t);
    var yb = surf(h.x + half, t);
    var yc = surf(h.x, t);
    var target = (ys + yb) * 0.25 + yc * 0.5;
    var vsurf = h.prevTarget === null ? 0 : (target - h.prevTarget) / dt;
    h.prevTarget = target;
    var slope = Math.atan2(yb - ys, half * 2);

    if (h.dead) {
      h.deadT += dt;
      h.vx *= Math.pow(0.4, dt);
      h.x += h.vx * dt;
      h.vy += (target - h.y) * 30 * dt - h.vy * 6 * dt;
      h.y += h.vy * dt;
      h.th += (slope + Math.PI - h.th) * Math.min(1, dt * 3);
      if (h.deadT > 2.2) {
        resetHull(h.x);
        state.started = false;
        hint(true);
      }
      return;
    }

    var vt = topSpeed();
    var thrust = vt * 0.75;

    var cos = Math.cos(h.th), sin = Math.sin(h.th);
    var sternY = h.y - half * sin, bowY = h.y + half * sin;
    var sternX = h.x - half * cos, bowX = h.x + half * cos;
    var gap = Math.min(sternY - surf(sternX, t), bowY - surf(bowX, t), h.y - yc);
    var touching = gap <= 0.04;

    if (h.air && touching && h.airT > 0.12) land(slope);
    if (!h.air && gap > 0.2) takeoff();

    if (!h.air) {
      var sub = target - h.y;
      var ay = -G;
      if (sub > -0.05) ay += Math.max(0, sub + 0.05) * 140 - (h.vy - vsurf) * 9;
      h.vy += ay * dt;
      h.y += h.vy * dt;

      var ax = -G * Math.sin(slope) * 0.45 - h.vx * Math.abs(h.vx) * (thrust / (vt * vt)) - h.vx * 0.08;
      if (state.throttle && !state.brake) ax += thrust;
      else if (state.throttle && state.brake) ax += thrust * 0.5;
      else if (state.brake) ax += h.vx > 0.4 ? -thrust * 1.6 : -thrust * 0.45;
      h.vx += ax * dt;
      if (h.vx < -vt * 0.35) h.vx = -vt * 0.35;

      var trim = 0;
      if (state.throttle) trim += 0.07 * Math.min(1, h.vx / vt + 0.3);
      if (state.brake) trim -= 0.12;
      var want = slope + trim;
      var dth = wrap(want - h.th);
      h.w += (dth * 48 - h.w * 10) * dt;
      h.th += h.w * dt;

      var tilt = Math.abs(wrap(h.th - slope));
      var limit = B.capsize * Math.PI / 180;
      if (tilt > Math.PI / 2) h.tipped = true;
      if (tilt > limit) {
        h.turtle += dt;
        if (h.turtle > 0.5) return wipeout();
      } else {
        h.turtle = 0;
        if (h.tipped && tilt < 0.3) {
          h.tipped = false;
          award("Close call", 50);
        }
      }

      if (state.throttle && h.vx > vt * 0.5 && Math.random() < dt * 40) {
        spray(sternX, surf(sternX, t) + 0.1, -h.vx * 0.25, 1.5 + Math.random() * 2, 1);
      }
    } else {
      h.airT += dt;
      h.vy -= G * dt;
      h.vx *= Math.pow(0.97, dt);
      h.y += h.vy * dt;
      h.apex = Math.max(h.apex, h.y - yc);
      var torque = (B.air / 160) * 8.5;
      var dw = 0;
      if (state.throttle) dw += torque;
      if (state.brake) dw -= torque;
      h.w += (dw - h.w * 0.6) * dt;
      h.w = Math.max(-9, Math.min(9, h.w));
      var before = h.spin;
      h.th += h.w * dt;
      h.spin += h.w * dt;
      var flips = Math.floor(Math.abs(h.spin) / TAU);
      if (flips > Math.floor(Math.abs(before) / TAU)) h.pendingFlips = flips;
    }

    h.x += h.vx * dt;

    for (var i = 0; i < actors.length; i++) touchActor(actors[i]);
  }

  function takeoff() {
    var h = hull;
    h.air = true;
    h.airT = 0;
    h.apex = 0;
    h.spin = 0;
    h.pendingFlips = 0;
    h.takeoffX = h.x;
    h.vy += Math.max(0, Math.sin(h.th)) * Math.max(0, h.vx) * 0.32;
  }

  function land(slope) {
    var h = hull;
    var rel = Math.abs(wrap(h.th - slope));
    var limit = B.capsize * Math.PI / 180 * 0.92;
    var flips = Math.floor(Math.abs(h.spin) / TAU + 0.12);
    h.air = false;
    h.vy = Math.min(h.vy, 0) * 0.15;
    splash(h.x, Math.min(8, h.airT * 6 + 2));

    if (rel > limit) return wipeout();

    var t = h.airT;
    if (t > 0.45) {
      var tier = h.apex > 5 ? ["Orbit", 2.5] : h.apex > 2.6 ? ["Sent", 1.5] : ["Airborne", 1];
      award(tier[0], Math.max(50, Math.round(t * tier[1] * 2) * 25));
    }
    for (var i = 0; i < flips; i++) award("Flip", 200 * Math.pow(2, i));

    if (rel < 0.14 && t > 0.35) {
      award("Perfect landing", 150);
    } else if (rel > 0.55) {
      h.vx *= 0.55;
      h.w += (h.th > slope ? -1 : 1) * 2;
    }

    if (h.x - h.takeoffX > S.wl * 0.45) {
      h.hopStreak = state.t - h.lastLand < 1.4 ? h.hopStreak + 1 : 1;
      award(h.hopStreak > 1 ? "Wave hop ×" + h.hopStreak : "Wave hop", 100 * h.hopStreak);
    }
    h.lastLand = state.t;
  }

  function wipeout() {
    var h = hull;
    h.dead = true;
    h.air = false;
    h.deadT = 0;
    splash(h.x, 10);
    if (B.cap.draw !== 2) {
      skipper = {
        x: h.x + (B.cap.off ? B.cap.off[0] : 0), y: h.y + 1,
        vx: Math.max(2, h.vx * 0.7), vy: 6 + Math.random() * 2, th: 0, w: -8
      };
    }
    pop('<span>Splash!</span>');
  }

  function spawn() {
    var ahead = hull.x + W / ppm;
    while (run.nextCoins < ahead) {
      var n = 5 + Math.floor(Math.random() * 3);
      for (var i = 0; i < n; i++) {
        var u = i / (n - 1);
        coins.push({ x: run.nextCoins + i * 1.5, lift: 0.5 + Math.sin(u * Math.PI) * 0.9, got: false });
      }
      run.nextCoins += 30 + Math.random() * 26;
    }
    while (run.nextActor < ahead + 10) {
      actors.push({ kind: S.actor, x: run.nextActor, hit: false, t0: Math.random() * 10 });
      run.nextActor += 70 + Math.random() * 60;
    }
    var behind = cam.x - 30;
    coins = coins.filter(function (c) { return c.x > behind && !c.gone; });
    actors = actors.filter(function (a) { return a.x > behind; });
  }

  function touchActor(a) {
    var spec = ACTORS[a.kind];
    if (a.hit || spec.leap) return;
    var h = hull;
    if (Math.abs(h.x - a.x) > spec.w * 0.4) return;
    if (h.air && h.y - surf(a.x, state.t) > 1.6) return;
    a.hit = true;
    a.hitT = state.t;
    if (spec.lift) {
      h.vy = spec.lift;
      h.y += 0.3;
      takeoff();
    }
    pop(spec.say);
  }

  function collect() {
    var h = hull;
    for (var i = 0; i < coins.length; i++) {
      var c = coins[i];
      if (c.got) continue;
      var cy = surf(c.x, state.t) + c.lift;
      var dx = c.x - h.x, dy = cy - (h.y + 0.5);
      if (dx * dx + dy * dy < 1.7) {
        c.got = true;
        c.gotT = state.t;
        run.coins += 100;
      }
    }
  }

  var pops = root.querySelector("[data-pops]");
  var hintEl = root.querySelector("[data-hint]");
  var coinEl = root.querySelector("[data-coins]");
  var distEl = root.querySelector("[data-dist]");
  var bestEl = root.querySelector("[data-best]");

  function award(word, coinsWon) {
    run.coins += coinsWon || 0;
    pop(coinsWon ? word + " <b>+" + coinsWon + "</b>" : word);
  }

  function pop(html) {
    if (!pops) return;
    var el = document.createElement("p");
    el.className = "pop";
    el.innerHTML = html;
    pops.appendChild(el);
    while (pops.children.length > 3) pops.removeChild(pops.firstChild);
    setTimeout(function () {
      el.classList.add("is-out");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 360);
    }, 1300);
  }

  function hint(show) {
    if (hintEl) hintEl.classList.toggle("is-hidden", !show);
  }

  var lastHud = "";
  function hud() {
    var d = Math.max(0, Math.floor(run.far));
    if (d > run.best) run.best = d;
    var key = d + "|" + run.coins + "|" + run.best;
    if (key === lastHud) return;
    lastHud = key;
    if (distEl) distEl.textContent = d + " m";
    if (coinEl) coinEl.textContent = run.coins.toLocaleString("en-US");
    if (bestEl) bestEl.textContent = "Best " + run.best + " m";
  }

  function spray(x, y, vx, vy, size) {
    if (parts.length > 160) return;
    parts.push({ x: x, y: y, vx: vx + (Math.random() - 0.5), vy: vy, r: 0.06 + Math.random() * 0.1 * size, life: 0.9 });
  }
  function splash(x, n) {
    for (var i = 0; i < n * 3; i++) {
      spray(x + (Math.random() - 0.5) * B.len, surf(x, state.t) + 0.1,
        (Math.random() - 0.5) * 5, 2 + Math.random() * 4, 1.5);
    }
  }

  function wrap(a) {
    a = (a + Math.PI) % TAU;
    if (a < 0) a += TAU;
    return a - Math.PI;
  }

  function resize() {
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    var viewH = 7.5 + (B ? B.len : 4) * 0.9;
    ppm = H / viewH;
  }

  function sx(x) { return (x - cam.x) * ppm + W * 0.3; }
  function sy(y) { return H * 0.6 - (y - cam.y) * ppm; }

  function drawSky() {
    var horizon = sy(1.6 + cam.y * 0.55);
    var g = ctx.createLinearGradient(0, 0, 0, horizon);
    g.addColorStop(0, S.sky[0]);
    g.addColorStop(1, S.sky[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, horizon + 1);
    return horizon;
  }

  function ring(names, horizon, parallax, scale, sink) {
    var first = img("backdrop:" + state.sea + ":" + names[0]);
    if (!first) return;
    var k = (ppm / 48) * scale;
    var slotW = first.naturalWidth * k;
    var shift = cam.x * ppm * parallax;
    var start = Math.floor((shift - W) / slotW) - 1;
    for (var i = start; i < start + Math.ceil(W / slotW) + 4; i++) {
      var pick = names[((i * 2654435761) >>> 0) % names.length];
      var im = img("backdrop:" + state.sea + ":" + pick) || first;
      var x = i * slotW - shift;
      if (x > W || x + slotW < 0) continue;
      var h = im.naturalHeight * k;
      ctx.drawImage(im, x, horizon - h * (1 - sink), slotW + 1, h);
    }
  }

  function landmarks(horizon) {
    if (!S.marks.length) return;
    var parallax = 0.28;
    var every = 46;
    var shift = cam.x * parallax;
    var start = Math.floor((shift - 20) / every);
    for (var i = start; i < start + 6; i++) {
      var hsh = ((i * 2246822519) >>> 0) % 3;
      if (hsh === 0) continue;
      var name = S.marks[hsh % S.marks.length];
      var im = img("backdrop:" + state.sea + ":" + name);
      if (!im) continue;
      var k = (ppm / 48) * 0.2;
      var x = W * 0.3 + (i * every - shift) * ppm;
      ctx.drawImage(im, x, horizon - im.naturalHeight * k + 3, im.naturalWidth * k, im.naturalHeight * k);
    }
  }

  function clouds() {
    if (!S.cloud) return;
    var im = img("backdrop:" + state.sea + ":" + S.cloud);
    if (!im) return;
    var k = (ppm / 48) * 0.7;
    var span = 30;
    var shift = cam.x * 0.03 + state.t * 0.35;
    var start = Math.floor(shift / span) - 1;
    for (var i = start; i < start + 4; i++) {
      var hsh = ((i * 2654435761) >>> 0);
      var x = W * 0.3 + (i * span - shift) * ppm * 0.6 + (hsh % 7) * ppm;
      var y = H * (0.06 + (hsh % 5) * 0.03);
      var s = 0.8 + (hsh % 4) * 0.15;
      ctx.drawImage(im, x, y, im.naturalWidth * k * s, im.naturalHeight * k * s);
    }
  }

  var col = [];
  function sampleSurface() {
    var stepPx = W > 900 ? 6 : 5;
    var n = Math.ceil(W / stepPx) + 2;
    col.length = n;
    for (var i = 0; i < n; i++) {
      var px = i * stepPx - stepPx;
      var x = cam.x + (px - W * 0.3) / ppm;
      col[i] = [px, surf(x, state.t)];
    }
  }

  function bodyPath(depth, damp) {
    ctx.beginPath();
    ctx.moveTo(col[0][0], H + 4);
    for (var i = 0; i < col.length; i++) ctx.lineTo(col[i][0], sy(col[i][1] * damp - depth));
    ctx.lineTo(col[col.length - 1][0], H + 4);
    ctx.closePath();
  }

  function drawBackWater(horizon) {
    ctx.fillStyle = S.back;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (var px = 0; px <= W + 12; px += 12) {
      var x = cam.x * 0.6 + px / ppm;
      var y = horizon + 0.5 * ppm + Math.sin(x * 0.35 - state.t * 0.8) * 0.18 * ppm;
      ctx.lineTo(px, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
  }

  function drawWater() {
    var w = S.water;
    var A = S.amp + S.amp2;
    bodyPath(0, 1);
    ctx.fillStyle = w[0];
    ctx.fill();
    var bands = [[A * 0.9 + 0.5, 0.55, w[1]], [A * 1.6 + 1.6, 0.3, w[2]], [A * 2.4 + 3.2, 0.12, w[3]]];
    for (var b = 0; b < bands.length; b++) {
      bodyPath(bands[b][0], bands[b][1]);
      ctx.fillStyle = bands[b][2];
      ctx.fill();
    }

    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = S.band;
    ctx.lineWidth = Math.max(2, ppm * 0.07);
    ctx.lineCap = "round";
    for (var s = 0; s < 2; s++) {
      ctx.beginPath();
      var depth = 0.45 + s * 0.6;
      var drift = state.t * (0.6 + s * 0.3) + s * 7;
      for (var i = 0; i < col.length; i++) {
        var x = cam.x + (col[i][0] - W * 0.3) / ppm;
        var on = Math.sin(x * 0.4 + drift) > 0.35;
        var y = sy(col[i][1] * 0.8 - depth);
        if (on) ctx.lineTo(col[i][0], y); else ctx.moveTo(col[i][0], y);
      }
      ctx.stroke();
    }
    ctx.restore();

    ctx.lineJoin = "round";
    ctx.beginPath();
    for (var j = 0; j < col.length; j++) ctx.lineTo(col[j][0], sy(col[j][1]));
    ctx.strokeStyle = S.rim;
    ctx.lineWidth = Math.max(2.5, ppm * 0.07);
    ctx.stroke();
    ctx.beginPath();
    var off = Math.max(2.5, ppm * 0.07);
    for (var k = 0; k < col.length; k++) ctx.lineTo(col[k][0], sy(col[k][1]) + off);
    ctx.strokeStyle = S.crest;
    ctx.lineWidth = Math.max(2, ppm * 0.06);
    ctx.stroke();

    var foamAt = S.amp * 0.5;
    ctx.strokeStyle = "#ffffff";
    ctx.lineCap = "round";
    for (var f = 1; f < col.length; f++) {
      var hgt = col[f][1];
      if (hgt < foamAt) continue;
      var a = Math.min(1, (hgt - foamAt) / (S.amp * 0.4));
      ctx.globalAlpha = a;
      ctx.lineWidth = Math.max(2, ppm * (0.05 + 0.12 * a));
      ctx.beginPath();
      ctx.moveTo(col[f - 1][0], sy(col[f - 1][1]) + 1);
      ctx.lineTo(col[f][0], sy(hgt) + 1);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function framed(key, cx, cy, frameW) {
    var meta = ART[key];
    var im = img(key);
    if (!meta || !im) return;
    var fw = frameW * ppm;
    var fh = fw * meta.frame[1] / meta.frame[0];
    var b = meta.box;
    ctx.drawImage(im, cx - fw / 2 + b[0] * fw, cy - fh / 2 + b[1] * fh, (b[2] - b[0]) * fw, (b[3] - b[1]) * fh);
  }

  function drawCaptain(deckY) {
    var c = B.cap;
    var size = 1.35 * c.scale;
    var key = c.stand ? "captain:standing" : "captain:sitting";
    var cy = deckY + c.off[1] + (c.stand ? 0.22 : 0);
    framed(key, c.off[0] * ppm, -cy * ppm, size);
  }

  function drawBoat() {
    var h = hull;
    if (!h) return;
    ctx.save();
    ctx.translate(sx(h.x), sy(h.y));
    ctx.rotate(-h.th);
    var deckY = -B.draft + B.hullH;
    var showCap = B.cap.draw !== 2 && !h.dead;
    if (showCap && B.cap.draw === 1) drawCaptain(deckY);
    framed("boat:" + state.boat, B.off[0] * ppm, -B.off[1] * ppm, B.len * B.fit);
    if (showCap && B.cap.draw === 0) drawCaptain(deckY);
    ctx.restore();

    ctx.save();
    var r = B.len * B.fit * ppm * 0.65;
    ctx.beginPath();
    ctx.rect(sx(h.x) - r, sy(h.y) - r, r * 2, r * 2);
    ctx.clip();
    ctx.globalAlpha = 0.55;
    bodyPath(0.05, 1);
    ctx.fillStyle = S.water[0];
    ctx.fill();
    ctx.restore();
  }

  function drawSkipper(dt) {
    if (!skipper) return;
    skipper.vy -= G * dt;
    skipper.x += skipper.vx * dt;
    skipper.y += skipper.vy * dt;
    skipper.th += skipper.w * dt;
    var floor = surf(skipper.x, state.t) - 0.3;
    if (skipper.y < floor) {
      skipper.y = floor;
      skipper.vy = 0;
      skipper.vx *= 0.9;
      skipper.w *= 0.9;
    }
    ctx.save();
    ctx.translate(sx(skipper.x), sy(skipper.y));
    ctx.rotate(skipper.th);
    framed("captain:sitting", 0, 0, 1.35);
    ctx.restore();
  }

  function drawActors() {
    for (var i = 0; i < actors.length; i++) {
      var a = actors[i];
      var spec = ACTORS[a.kind];
      var key = "actor:" + a.kind;
      var meta = ART[key];
      var im = img(key);
      if (!meta || !im) continue;
      var w = spec.w * ppm;
      var hpx = w * meta.h / meta.w;
      var x = sx(a.x);
      if (x < -w || x > W + w) continue;
      var y0 = surf(a.x, state.t);
      ctx.save();
      if (spec.leap) {
        var cyc = (state.t + a.t0) % 5;
        if (cyc > 1.4) { ctx.restore(); continue; }
        var u = cyc / 1.4;
        var yy = y0 + Math.sin(u * Math.PI) * 3.2 - 0.4;
        ctx.translate(x + (u - 0.5) * 6 * ppm, sy(yy));
        ctx.rotate(-(0.6 - u * 1.2) * 0.8);
        ctx.drawImage(im, -w / 2, -hpx / 2, w, hpx);
      } else {
        var slope = Math.atan2(surf(a.x + 1, state.t) - surf(a.x - 1, state.t), 2);
        var sinkY = a.hit && spec.topple ? 0.9 : spec.sink;
        var bob = Math.sin(state.t * 1.6 + a.t0) * 0.06;
        ctx.translate(x, sy(y0 + bob));
        ctx.rotate(-slope * 0.8 + (a.hit && spec.topple ? 0.9 : 0));
        ctx.drawImage(im, -w / 2, -hpx * (1 - sinkY), w, hpx);
      }
      ctx.restore();
    }
  }

  function drawCoins() {
    var im = img("coin");
    var s = 0.7 * ppm;
    for (var i = 0; i < coins.length; i++) {
      var c = coins[i];
      var x = sx(c.x);
      if (x < -s || x > W + s) continue;
      var y = sy(surf(c.x, state.t) + c.lift);
      if (c.got) {
        var age = state.t - c.gotT;
        if (age > 0.35) { c.gone = true; continue; }
        ctx.globalAlpha = 1 - age / 0.35;
        y -= age * 3 * ppm;
      }
      var spin = Math.abs(Math.cos(state.t * 3 + c.x));
      var w = s * (0.35 + 0.65 * spin);
      if (im) ctx.drawImage(im, x - w / 2, y - s / 2, w, s);
      ctx.globalAlpha = 1;
    }
  }

  var coinImg = new Image();
  coinImg.src = "assets/img/ui/coin.webp";
  images.coin = coinImg;
  ART.coin = { src: coinImg.src, w: 160, h: 161 };

  function drawParts(dt) {
    ctx.fillStyle = "#ffffff";
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.vy -= G * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0 || p.y < surf(p.x, state.t) - 0.4) { parts.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(1, p.life * 2);
      ctx.beginPath();
      ctx.arc(sx(p.x), sy(p.y), p.r * ppm, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function fog() {
    if (!S.fog) return;
    var g = ctx.createLinearGradient(W * 0.45, 0, W, 0);
    g.addColorStop(0, "rgba(126,150,152,0)");
    g.addColorStop(1, "rgba(126,150,152,0.55)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function render(dt) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var horizon = drawSky();
    clouds();
    ring(S.far1, horizon, 0.1, 0.36, 0.5);
    ctx.fillStyle = S.sky[1];
    ctx.globalAlpha = S.haze * 0.5;
    ctx.fillRect(0, horizon - 2.4 * ppm, W, 2.4 * ppm);
    ctx.globalAlpha = 1;
    landmarks(horizon);
    ring(S.mid, horizon, 0.22, 0.34, 0.62);
    ctx.fillStyle = S.far;
    ctx.fillRect(0, horizon, W, H - horizon);
    drawBackWater(horizon);
    sampleSurface();
    drawActors();
    drawWater();
    drawCoins();
    drawBoat();
    drawSkipper(dt);
    drawParts(dt);
    fog();
  }

  var running = false;
  var visible = true;
  var last = 0;
  var acc = 0;
  var idleUntil = 0;

  function advance(dt) {
    acc += dt;
    var h = 1 / 120;
    while (acc >= h) {
      state.t += h;
      step(h);
      acc -= h;
    }
    cam.x += (hull.x - cam.x) * Math.min(1, dt * 8);
    var airY = hull.air ? Math.max(0, hull.y - 1.5) * 0.8 : 0;
    cam.y += (airY - cam.y) * Math.min(1, dt * (hull.air ? 3 : 1.6));
    run.far = Math.max(run.far, hull.x);
    if (!hull.dead) collect();
    spawn();
    render(dt);
    hud();
  }

  function frame(now) {
    if (!running) return;
    var dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    advance(dt);
    if (reduce && !state.throttle && !state.brake && now > idleUntil && !hull.air) {
      running = false;
      return;
    }
    requestAnimationFrame(frame);
  }

  function start() {
    if (running || !visible) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }
  function stop() { running = false; }

  function setPedal(which, down) {
    state[which] = down;
    var el = root.querySelector('[data-pedal="' + which + '"]');
    if (el) el.classList.toggle("is-down", down);
    if (down && which === "throttle" && !state.started) {
      state.started = true;
      hint(false);
    }
    if (reduce) idleUntil = performance.now() + 3000;
    if (down) start();
  }

  root.querySelectorAll("[data-pedal]").forEach(function (el) {
    var which = el.getAttribute("data-pedal");
    el.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      if (el.setPointerCapture) el.setPointerCapture(e.pointerId);
      setPedal(which, true);
    });
    var up = function () { setPedal(which, false); };
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("lostpointercapture", up);
    el.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    el.addEventListener("keydown", function (e) {
      if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); setPedal(which, true); }
    });
    el.addEventListener("keyup", function (e) {
      if (e.key === " " || e.key === "Enter") setPedal(which, false);
    });
  });

  var KEYS = { ArrowRight: "throttle", KeyD: "throttle", ArrowLeft: "brake", KeyA: "brake" };
  function keyFor(e) {
    if (!visible) return null;
    var tag = (e.target && e.target.tagName) || "";
    if (/INPUT|TEXTAREA|SELECT/.test(tag)) return null;
    return KEYS[e.code] || null;
  }
  document.addEventListener("keydown", function (e) {
    var k = keyFor(e);
    if (!k) return;
    e.preventDefault();
    if (!e.repeat) setPedal(k, true);
  });
  document.addEventListener("keyup", function (e) {
    var k = keyFor(e);
    if (k) setPedal(k, false);
  });
  window.addEventListener("blur", function () {
    setPedal("throttle", false);
    setPedal("brake", false);
  });

  var picker = root.parentNode.querySelector("[data-picker]");
  if (picker) {
    picker.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      var boat = btn.getAttribute("data-boat");
      var sea = btn.getAttribute("data-sea");
      var attr = boat ? "data-boat" : "data-sea";
      picker.querySelectorAll("[" + attr + "]").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      if (boat) useBoat(boat);
      if (sea) useSea(sea);
      warm();
      hint(!state.started);
      render(0);
      start();
    });
  }

  readPicker();
  B = BOATS[state.boat];
  S = SEAS[state.sea];
  resize();
  newRun();

  function warm() {
    Object.keys(ART).forEach(function (key) {
      if (key.indexOf("backdrop:" + state.sea + ":") === 0 || key === "boat:" + state.boat ||
          key.indexOf("captain:") === 0 || key === "actor:" + S.actor) img(key);
    });
  }
  warm();

  if ("ResizeObserver" in window) {
    new ResizeObserver(function () { resize(); if (!running) render(0); }).observe(canvas);
  } else {
    window.addEventListener("resize", resize);
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && !reduce) start(); else if (!visible) stop();
    }, { threshold: 0.05 }).observe(root);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else if (visible && !reduce) start();
  });

  if (reduce) {
    render(0);
  } else {
    start();
  }

  window.__waveToy = {
    state: state,
    hull: function () { return hull; },
    run: function () { return run; },
    setPedal: setPedal,
    tick: function (seconds) {
      for (var i = 0; i < Math.round(seconds * 60); i++) advance(1 / 60);
    }
  };
})();
