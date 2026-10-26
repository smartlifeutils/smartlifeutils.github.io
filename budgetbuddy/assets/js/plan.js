(() => {
  const root = document.querySelector('[data-plan]');
  if (!root) return;
  const BASE = { exp: 3745.8, inc: 3661.48, bal: 2977.17 };
  const NOW = new Date(2026, 0, 1);
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trim = root.querySelector('[name="trim"]');
  const extra = root.querySelector('[name="extra"]');
  const horizons = [...root.querySelectorAll('[data-h]')];
  const o = (k) => root.querySelector(`[data-o="${k}"]`);
  const svg = root.querySelector('svg');
  let horizon = 12;
  const money = (v) => `${v < 0 ? '-' : ''}${Math.abs(v).toFixed(2)} $`;
  const signed = (v) => `${v >= 0 ? '+' : '-'}${Math.abs(v).toFixed(2)} $`;

  function project() {
    const t = Number(trim.value) / 100;
    const x = Number(extra.value) / 100;
    const incAdj = BASE.inc + BASE.inc * x;
    const expAdj = BASE.exp * (1 + t);
    const surplus = incAdj - expAdj;
    const surplusBase = BASE.inc - BASE.exp;
    const base = [];
    const adj = [];
    let b = BASE.bal;
    let a = BASE.bal;
    for (let i = 0; i <= horizon; i++) {
      if (i > 0) { b += surplusBase; a += surplus; }
      base.push(b);
      adj.push(a);
    }
    const target = BASE.exp;
    let months = null;
    if (surplus > 0 && a < target) months = Math.ceil((target - a) / surplus);
    else if (a >= target) months = 0;
    let cushion;
    if (months === null) cushion = surplus <= 0 ? 'Spending outruns income' : 'Not reached';
    else if (months === 0) cushion = 'Goal met';
    else {
      const d = new Date(NOW.getTime() + months * 30 * 864e5);
      const label = `${d.getDate()} ${MON[d.getMonth()]}`;
      if (surplus <= 0) cushion = `Mind the gap · short by ${Math.abs(target - BASE.bal).toFixed(2)} $`;
      else if (months <= 3) cushion = `Close, almost there · ${months} mo · ${label}`;
      else cushion = `On track · ${months} mo · ${label}`;
    }
    return { t, x, surplus, base, adj, cushion, end: a };
  }

  function draw(p) {
    const W = 320;
    const H = 150;
    const all = p.base.concat(p.adj);
    let min = Math.min(...all);
    let max = Math.max(...all);
    if (max - min < 1) { max += 1; min -= 1; }
    const pad = (max - min) * 0.12;
    min -= pad; max += pad;
    const xs = (i) => (i / horizon) * W;
    const ys = (v) => H - ((v - min) / (max - min)) * H;
    const path = (arr) => arr.map((v, i) => `${i ? 'L' : 'M'}${xs(i).toFixed(1)} ${ys(v).toFixed(1)}`).join(' ');
    const zero = min < 0 && max > 0 ? `<line x1="0" x2="${W}" y1="${ys(0)}" y2="${ys(0)}" stroke="#e5e7eb" stroke-width="1"/>` : '';
    svg.innerHTML = `${zero}<path d="${path(p.base)}" fill="none" stroke="#9ca3af" stroke-width="2" stroke-dasharray="5 5"/><path d="${path(p.adj)}" fill="none" stroke="#2dc071" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  function update() {
    const p = project();
    o('trim').textContent = `${p.t > 0 ? '+' : ''}${Math.round(p.t * 100)}%`;
    o('extra').textContent = `+${Math.round(p.x * 100)}% (${(BASE.inc * p.x).toFixed(2)} $)`;
    o('start').textContent = money(BASE.bal);
    o('endlbl').textContent = `Balance after ${horizon} months`;
    o('end').textContent = money(p.end);
    o('surplus').textContent = signed(p.surplus);
    o('cushion').textContent = p.cushion;
    horizons.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.h) === horizon)));
    draw(p);
  }

  trim.addEventListener('input', update);
  extra.addEventListener('input', update);
  horizons.forEach((b) => b.addEventListener('click', () => { horizon = Number(b.dataset.h); update(); }));
  update();
})();
