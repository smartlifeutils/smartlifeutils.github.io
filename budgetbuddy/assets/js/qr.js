(() => {
  const root = document.querySelector('[data-qr]');
  if (!root) return;
  const box = root.querySelector('textarea');
  const samples = [...root.querySelectorAll('[data-sample]')];
  const o = (k) => root.querySelector(`[data-o="${k}"]`);
  const SAMPLES = {
    epc: 'BCD\n002\n1\nSCT\nCOBADEFFXXX\nCity Water Works\nDE89370400440532013000\nEUR48.20\nRF18539007547034\nWater bill, March',
    spayd: 'SPD*1.0*ACC:CZ6508000000192000145399*AM:1450.00*CC:CZK*RN:Praha Energy*X-VS:2026031*MSG:Electricity, March',
    upi: 'upi://pay?pa=cornershop@okbank&pn=Corner%20Grocery&am=320.00&tn=Weekly%20groceries&tr=INV2207'
  };

  function parse(raw) {
    const t = raw.trim();
    if (!t) return null;
    if (t.startsWith('BCD')) {
      const l = t.replace(/\r/g, '\n').split('\n');
      if (l.length >= 8) {
        let a = l[7] || '';
        if (a.startsWith('EUR')) a = a.slice(3);
        return { scheme: 'EPC / SEPA (Europe)', name: l[5] || '', iban: l[6] || '', amount: parseFloat(a), ref: l[8] || '', desc: l[9] || l[8] || '' };
      }
    }
    if (t.startsWith('SPD*')) {
      const kv = {};
      t.split('*').forEach((p) => { const i = p.indexOf(':'); if (i > 0) kv[p.slice(0, i)] = p.slice(i + 1); });
      return { scheme: 'SPAYD (Czechia)', name: kv.RN || '', iban: kv.ACC || '', amount: parseFloat(kv.AM), ref: kv['X-VS'] || kv.RF || '', desc: kv.MSG || '' };
    }
    if (t.startsWith('upi://pay') || t.includes('pa=') || t.includes('pn=')) {
      const q = {};
      const s = t.includes('?') ? t.slice(t.indexOf('?') + 1) : t;
      s.split('&').forEach((p) => { const i = p.indexOf('='); if (i > 0) { try { q[p.slice(0, i)] = decodeURIComponent(p.slice(i + 1).replace(/\+/g, ' ')); } catch (e) { q[p.slice(0, i)] = p.slice(i + 1); } } });
      return { scheme: 'UPI (India)', name: q.pn || '', iban: q.pa || '', amount: parseFloat(q.am), ref: q.tr || '', desc: q.tn || q.pn || '' };
    }
    const m = t.match(/(\d+[.,]\d{2})(?!\d)/);
    return { scheme: 'Plain text (amount found in the text)', name: '', iban: '', amount: m ? parseFloat(m[1].replace(',', '.')) : NaN, ref: '', desc: t.slice(0, 60) };
  }

  function update() {
    const r = parse(box.value);
    const set = (k, v) => { o(k).textContent = v || '—'; };
    if (!r) {
      ['scheme', 'name', 'iban', 'amount', 'ref', 'desc'].forEach((k) => set(k, ''));
      return;
    }
    set('scheme', r.scheme);
    set('name', r.name);
    set('iban', r.iban);
    set('amount', Number.isFinite(r.amount) ? r.amount.toFixed(2) : '');
    set('ref', r.ref);
    set('desc', r.desc);
  }

  samples.forEach((b) => b.addEventListener('click', () => {
    box.value = SAMPLES[b.dataset.sample];
    samples.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    update();
  }));
  box.addEventListener('input', () => { samples.forEach((x) => x.setAttribute('aria-pressed', 'false')); update(); });
  box.value = SAMPLES.epc;
  update();
})();
