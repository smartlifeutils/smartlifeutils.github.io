(() => {
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  const reveal = document.querySelectorAll('[data-reveal], .shutter, .bars__chart');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    reveal.forEach((el) => io.observe(el));
  } else {
    reveal.forEach((el) => el.classList.add('is-in'));
  }

  document.querySelectorAll('[data-faq]').forEach((faq) => {
    const buttons = [...faq.querySelectorAll('.faq__list button')];
    const answers = [...faq.querySelectorAll('.faq__pane .faq__answer')];
    const inline = [...faq.querySelectorAll('.faq__inline')];
    const select = (i) => {
      buttons.forEach((b, j) => b.setAttribute('aria-expanded', String(i === j)));
      answers.forEach((a, j) => { a.hidden = i !== j; });
      inline.forEach((a, j) => { a.hidden = i !== j; });
    };
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    buttons.forEach((b, i) => {
      b.addEventListener('click', () => select(i));
      b.addEventListener('focus', () => select(i));
      b.addEventListener('pointerenter', () => { if (fine.matches) select(i); });
    });
    select(0);
  });

  document.querySelectorAll('[data-lit]').forEach((sec) => {
    const row = sec.querySelector('.lit__row');
    const panels = [...row.querySelectorAll('.lit__panel')];
    const name = sec.querySelector('[data-lit-name]');
    const text = sec.querySelector('[data-lit-text]');
    let current = -1;
    const light = () => {
      const mid = row.getBoundingClientRect().left + row.clientWidth / 2;
      let best = 0;
      let dist = Infinity;
      panels.forEach((p, i) => {
        const r = p.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - mid);
        if (d < dist) { dist = d; best = i; }
      });
      if (best === current) return;
      current = best;
      panels.forEach((p, i) => { p.classList.toggle('is-lit', i === best); p.setAttribute('aria-hidden', String(i !== best)); });
      name.textContent = panels[best].dataset.name;
      text.textContent = panels[best].dataset.text;
    };
    let raf = 0;
    row.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(light); }, { passive: true });
    window.addEventListener('resize', light);
    const go = (dir) => {
      const i = Math.max(0, Math.min(panels.length - 1, current + dir));
      const p = panels[i];
      row.scrollTo({ left: p.offsetLeft - (row.clientWidth - p.offsetWidth) / 2, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    };
    sec.querySelector('[data-lit-prev]').addEventListener('click', () => go(-1));
    sec.querySelector('[data-lit-next]').addEventListener('click', () => go(1));
    row.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { go(1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { go(-1); e.preventDefault(); }
    });
    let down = null;
    row.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') { down = { x: e.clientX, s: row.scrollLeft }; row.style.scrollSnapType = 'none'; } });
    window.addEventListener('pointermove', (e) => { if (down) row.scrollLeft = down.s - (e.clientX - down.x); });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = null;
      row.style.scrollSnapType = '';
      go(0);
    });
    const start = Number(sec.dataset.lit) || 0;
    requestAnimationFrame(() => {
      const p = panels[start];
      row.scrollLeft = p.offsetLeft - (row.clientWidth - p.offsetWidth) / 2;
      light();
    });
  });

  document.querySelectorAll('[data-copy]').forEach((btn) => {
    const source = document.getElementById(btn.dataset.copy);
    const label = btn.querySelector('span') || btn;
    let timer;
    btn.addEventListener('click', async () => {
      const text = source.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        label.textContent = 'Copied';
      } catch (err) {
        const range = document.createRange();
        range.selectNodeContents(source);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        label.textContent = 'Selected, now copy it';
      }
      clearTimeout(timer);
      timer = setTimeout(() => { label.textContent = 'Copy'; }, 2400);
    });
  });
})();
