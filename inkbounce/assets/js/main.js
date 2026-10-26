(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const toggle = $('.nav__toggle');
  const menu = $('#menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) { menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }) : null;
  $$('[data-reveal], .shutter').forEach((el) => { if (io) io.observe(el); else el.classList.add('is-in'); });

  $$('[data-tabs]').forEach((root) => {
    const tabs = $$('[role="tab"]', root);
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      $$('[data-media]', root).forEach((m) => {
        const on = m.dataset.media === tab.dataset.for;
        m.hidden = !on;
        if (m.tagName === 'VIDEO') { if (on) m.play().catch(() => {}); else m.pause(); }
      });
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
          select(n, true);
          e.preventDefault();
        }
      });
    });
  });

  $$('[data-acc]').forEach((root) => {
    const panels = $$('.acc__panel', root);
    panels.forEach((p) => {
      const btn = $('.acc__btn', p);
      btn.addEventListener('click', () => {
        panels.forEach((q) => {
          const on = q === p;
          q.classList.toggle('is-open', on);
          $('.acc__btn', q).setAttribute('aria-expanded', String(on));
        });
      });
    });
  });

  $$('[data-band]').forEach((band) => {
    const sw = $('.switch', band);
    const set = (on) => { band.classList.toggle('is-on', on); sw.setAttribute('aria-checked', String(on)); };
    sw.addEventListener('click', () => set(sw.getAttribute('aria-checked') !== 'true'));
  });

  const streak = $('[data-streak]');
  if (streak) {
    const input = $('input', streak);
    const out = $('[data-streak-out]');
    const days = $('[data-streak-days]');
    const base = [40, 60, 80, 120, 150, 200, 350];
    const calc = (n) => {
      let total = 0;
      for (let d = 1; d <= n; d++) {
        const b = base[(d - 1) % 7];
        const weeks = Math.floor((d - 1) / 7);
        total += b + Math.round(b * Math.min(0.5, weeks * 0.1));
      }
      return total;
    };
    const paint = () => {
      const n = Number(input.value);
      days.textContent = `${n} ${n === 1 ? 'day' : 'days'}`;
      out.textContent = calc(n).toLocaleString('en-US');
    };
    input.addEventListener('input', paint);
    paint();
  }

  $$('.index').forEach((root) => {
    const frame = $('.index__frame', root);
    if (!frame) return;
    const picture = $('img', frame);
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    let warmed = false;
    const show = (row) => {
      if (!fine.matches) return;
      if (!warmed) { warmed = true; $$('[data-preview]', root).forEach((a) => { new Image().src = a.dataset.preview; }); }
      picture.src = row.dataset.preview;
      picture.alt = '';
      const y = row.offsetTop + row.offsetHeight / 2 - frame.offsetHeight / 2;
      const max = root.offsetHeight - frame.offsetHeight;
      frame.style.transform = `translateY(${Math.min(max, Math.max(0, y))}px)`;
    };
    $$('.index__row', root).forEach((row) => {
      row.addEventListener('pointerenter', () => show(row));
      row.addEventListener('focus', () => show(row));
    });
  });

  const dialog = $('dialog.trailer');
  if (dialog && typeof dialog.showModal === 'function') {
    const video = $('video', dialog);
    $$('[data-trailer]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      dialog.showModal();
      video.play().catch(() => {});
    }));
    dialog.addEventListener('close', () => video.pause());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  }

  $$('video[data-loop]').forEach((v) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { v.removeAttribute('autoplay'); v.pause(); return; }
    if (!io) return;
    const vo = new IntersectionObserver((entries) => {
      for (const e of entries) { if (e.isIntersecting && !v.hidden) v.play().catch(() => {}); else v.pause(); }
    }, { threshold: 0.25 });
    vo.observe(v);
  });

  $$('[data-faq]').forEach((root) => {
    const qs = $$('.faq__list button', root);
    const pane = $('.faq__pane', root);
    const pick = (q) => {
      qs.forEach((b) => {
        const on = b === q;
        b.setAttribute('aria-expanded', String(on));
        const id = b.getAttribute('aria-controls');
        const a = document.getElementById(id);
        if (a) a.hidden = !on;
        const inline = document.getElementById(id + '-m');
        if (inline) inline.hidden = !on;
      });
    };
    qs.forEach((q) => {
      q.addEventListener('click', () => pick(q));
      q.addEventListener('focus', () => { if (pane && getComputedStyle(pane).display !== 'none') pick(q); });
      q.addEventListener('pointerenter', () => { if (pane && getComputedStyle(pane).display !== 'none') pick(q); });
    });
  });

  const skins = $('[data-skins]');
  if (skins && window.INK_SKINS) {
    const view = $('.skin-view', skins);
    const orb = $('.skin-view__orb', view);
    const name = $('[data-skin-name]', view);
    const rar = $('[data-skin-rarity]', view);
    const how = $('[data-skin-how]', view);
    const groups = { classic: 'Classic', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };
    const wrap = $('.swatch-groups', skins);
    const buttons = [];
    const pick = (s, b) => {
      orb.style.setProperty('--core', s.core);
      orb.style.setProperty('--glow', s.glow);
      name.textContent = s.name;
      rar.textContent = groups[s.rarity];
      how.textContent = s.how;
      buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    };
    Object.keys(groups).forEach((g) => {
      const list = window.INK_SKINS.filter((s) => s.rarity === g);
      const box = document.createElement('div');
      const h = document.createElement("p");
      h.textContent = `${groups[g]}, ${list.length}`;
      const grid = document.createElement('div');
      grid.className = 'swatches';
      grid.setAttribute('data-ui', '');
      list.forEach((s) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.style.setProperty('--core', s.core);
        b.style.setProperty('--glow', s.glow);
        b.setAttribute('aria-label', `${s.name}, ${groups[g]}`);
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => pick(s, b));
        b.addEventListener('pointerenter', () => pick(s, b));
        buttons.push(b);
        grid.appendChild(b);
      });
      box.append(h, grid);
      wrap.appendChild(box);
    });
    const first = window.INK_SKINS.find((s) => s.name === 'Fire') || window.INK_SKINS[0];
    pick(first, buttons[window.INK_SKINS.filter((s) => s.rarity === 'classic').length + 0]);
    skins.classList.add('is-live');
  }

  const ruler = $('[data-ruler]');
  if (ruler) {
    const input = $('input', ruler);
    const out = $('[data-ruler-out]');
    const marks = $$('.ruler__marks li', ruler);
    const paint = () => {
      const m = Number(input.value);
      out.textContent = `${m.toLocaleString('en-US')} m`;
      marks.forEach((li) => li.classList.toggle('is-hit', m >= Number(li.dataset.m)));
    };
    input.addEventListener('input', paint);
    paint();
  }
})();
