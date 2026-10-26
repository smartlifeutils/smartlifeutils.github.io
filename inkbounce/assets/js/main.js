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

})();
