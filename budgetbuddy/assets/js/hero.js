(() => {
  const root = document.querySelector('[data-month]');
  if (!root) return;

  const CATS = [
    { name: 'Rent', color: '#9C27B0', icon: 'house', spent: 851.31, n: 1 },
    { name: 'Health', color: '#795548', icon: 'heart_rate', spent: 534.89, n: 4 },
    { name: 'Shopping', color: '#FF6E40', icon: 'shopping', spent: 451.51, n: 4 },
    { name: 'Transport', color: '#E91E63', icon: 'car', spent: 354.49, n: 6 },
    { name: 'Gifts', color: '#673AB7', icon: 'gift', spent: 289.44, n: 4 },
    { name: 'Groceries', color: '#CDDC39', icon: 'cart', spent: 160.27, n: 2 },
    { name: 'Travel', color: '#E91E63', icon: 'plane', spent: 152.31, n: 1 },
    { name: 'Dining', color: '#4CAF50', icon: 'fork_spoon', spent: 119.94, n: 4 },
    { name: 'Utilities', color: '#66BB6A', icon: 'water', spent: 86.26, n: 1 }
  ];
  const INCOME = 3982.73;
  const PICKS = ['Dining', 'Groceries', 'Transport', 'Shopping', 'Health', 'Gifts', 'Travel', 'Utilities', 'Rent'];
  const C = 2 * Math.PI * 40;

  const $ = (s) => root.querySelector(s);
  const balanceEl = $('[data-balance]');
  const expEl = $('[data-exp]');
  const donut = $('[data-donut]');
  const chipTop = $('[data-chip-top]');
  const chipThree = $('[data-chip-three]');
  const amountEl = $('[data-amount]');
  const catsEl = $('[data-cats]');
  const addBtn = $('[data-add]');
  const list = $('[data-list]');
  const live = $('[data-live]');
  const pad = $('[data-pad]');

  let entry = '14.52';
  let picked = 'Dining';

  const fmt = (v) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, '');
  const tint = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    const mix = (c) => Math.round(c + (255 - c) * 0.78);
    return `rgb(${mix(n >> 16)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`;
  };
  const icon = (c) => `assets/img/icons/${c.icon}.svg`;

  function render() {
    const total = CATS.reduce((s, c) => s + c.spent, 0);
    const bal = INCOME - total;
    balanceEl.textContent = `${bal >= 0 ? '+' : '-'}${fmt(Math.abs(bal))} $`;
    balanceEl.style.color = bal >= 0 ? '' : '#e53935';
    expEl.textContent = `-${fmt(total)} $`;
    const sorted = [...CATS].sort((a, b) => b.spent - a.spent);
    let offset = 0;
    donut.innerHTML = '';
    for (const c of sorted) {
      const len = (c.spent / total) * C;
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      el.setAttribute('cx', '50');
      el.setAttribute('cy', '50');
      el.setAttribute('r', '40');
      el.setAttribute('stroke', c.color);
      el.setAttribute('stroke-dasharray', `${Math.max(0, len - 1.2)} ${C}`);
      el.setAttribute('stroke-dashoffset', String(-offset));
      donut.appendChild(el);
      offset += len;
    }
    const top = sorted[0];
    const three = sorted.slice(0, 3).reduce((s, c) => s + c.spent, 0);
    chipTop.textContent = `Top spend: ${top.name} (${Math.round((top.spent / total) * 100)}%)`;
    chipThree.textContent = `Spend top 3: ${Math.round((three / total) * 100)}%`;
  }

  function renderEntry() {
    amountEl.textContent = `${entry === '' ? '0' : entry} $`;
    const v = parseFloat(entry);
    addBtn.disabled = !(v > 0);
  }

  function buildCats() {
    catsEl.innerHTML = '';
    for (const name of PICKS) {
      const c = CATS.find((x) => x.name === name);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cat';
      b.setAttribute('aria-pressed', String(name === picked));
      b.innerHTML = `<span class="cat__ic" style="--tint:${tint(c.color)}"><img src="${icon(c)}" alt="" width="16" height="16"></span>${name}`;
      b.addEventListener('click', () => {
        picked = name;
        catsEl.querySelectorAll('.cat').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      });
      catsEl.appendChild(b);
    }
  }

  function press(k) {
    if (k === 'del') { entry = entry.slice(0, -1); renderEntry(); return; }
    if (k === '.') {
      if (entry.includes('.')) return;
      entry = entry === '' ? '0.' : entry + '.';
      renderEntry();
      return;
    }
    const dot = entry.indexOf('.');
    if (dot >= 0 && entry.length - dot > 2) return;
    if (dot < 0 && entry.replace(/^0+/, '').length >= 5) return;
    entry = entry === '0' ? k : entry + k;
    renderEntry();
  }

  function add() {
    const v = Math.round(parseFloat(entry) * 100) / 100;
    if (!(v > 0)) return;
    const c = CATS.find((x) => x.name === picked);
    c.spent = Math.round((c.spent + v) * 100) / 100;
    c.n += 1;
    entry = '';
    renderEntry();
    render();
    const row = document.createElement('div');
    row.className = 'row is-new';
    row.innerHTML = `<span class="row__ic" style="--tint:${tint(c.color)}"><img src="${icon(c)}" alt="" width="20" height="20"></span><span><b>${c.name}</b><small>${c.n} transactions · ${fmt(c.spent)} $</small></span><span class="row__amt neg">-${fmt(v)} $</span>`;
    list.prepend(row);
    while (list.children.length > 2) list.lastElementChild.remove();
    const bal = INCOME - CATS.reduce((s, x) => s + x.spent, 0);
    live.textContent = `Added ${fmt(v)} dollars to ${c.name}. Monthly balance is now ${bal >= 0 ? 'plus' : 'minus'} ${fmt(Math.abs(bal))} dollars.`;
  }

  pad.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-k]');
    if (b) press(b.dataset.k);
  });
  addBtn.addEventListener('click', add);
  root.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea')) return;
    if (/^[0-9]$/.test(e.key)) { press(e.key); e.preventDefault(); }
    else if (e.key === '.' || e.key === ',') { press('.'); e.preventDefault(); }
    else if (e.key === 'Backspace') { press('del'); e.preventDefault(); }
    else if (e.key === 'Enter' && !addBtn.disabled && !e.target.closest('button:not([data-add])')) { add(); e.preventDefault(); }
  });

  buildCats();
  render();
  renderEntry();
  root.classList.add('is-live');
})();
