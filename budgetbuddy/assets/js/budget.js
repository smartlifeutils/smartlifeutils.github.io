(() => {
  const root = document.querySelector('[data-budget]');
  if (!root) return;
  const amount = root.querySelector('[name="amount"]');
  const spent = root.querySelector('[name="spent"]');
  const day = root.querySelector('[name="day"]');
  const out = (k) => root.querySelector(`[data-o="${k}"]`);
  const wave = root.querySelector('.wave');
  const fmt = (v) => v.toFixed(2);
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function update() {
    const target = Number(amount.value);
    const s = Number(spent.value);
    const d = Number(day.value);
    const totalDays = 29;
    const elapsed = Math.min(Math.max(d, 1), totalDays);
    const pace = s / elapsed;
    const remaining = target - s;
    out('amount').textContent = `${fmt(target)} $`;
    out('spent').textContent = `${fmt(s)} $`;
    out('day').textContent = `${d} Sep`;
    out('state').textContent = remaining < 0 ? 'Exceeded' : 'Remaining';
    out('left').textContent = `${fmt(Math.abs(remaining))} $`;
    wave.classList.toggle('is-over', remaining < 0);
    wave.style.setProperty('--fill', `${Math.round(Math.min(1, Math.max(0, remaining) / target) * 100)}%`);
    out('pace').textContent = `${fmt(pace)} $/day`;
    out('time').textContent = `Time ${Math.round((elapsed / totalDays) * 100)}%`;
    const f = out('forecast');
    f.className = '';
    if (remaining <= 0) {
      f.textContent = 'Over the limit';
      f.classList.add('bad');
    } else if (pace <= 0) {
      f.textContent = 'No pace yet';
    } else {
      const eta = d + Math.ceil(remaining / pace);
      if (eta >= 30) {
        f.textContent = 'Safe this month';
        f.classList.add('good');
      } else {
        const date = new Date(2025, 8, eta);
        f.textContent = `ETA ${date.getDate()} ${MON[date.getMonth()]}`;
        f.classList.add('warn');
      }
    }
    const near = remaining >= 0 && s / target >= 0.85;
    out('chip').textContent = remaining < 0 ? 'Exceeded' : near ? 'Near limit' : 'Under budget';
    out('chip').className = `chip ${remaining < 0 ? 'bad' : near ? 'warn' : ''}`;
  }

  [amount, spent, day].forEach((el) => el.addEventListener('input', update));
  update();
})();
