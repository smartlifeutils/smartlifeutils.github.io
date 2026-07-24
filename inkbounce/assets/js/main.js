/* Ink Bounce — progressive enhancement only. The site works fully with JS off. */
(function () {
  "use strict";

  /* ---- Mobile nav toggle ---- */
  var toggle = document.querySelector(".nav__toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Close the menu after tapping a link (mobile)
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- Active nav highlight (based on current file) ---- */
  var path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav__links a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (!href) return;
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("is-active");
      a.setAttribute("aria-current", "page");
    }
  });

  /* ---- Footer year ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- Scroll reveal (respects reduced motion) ---- */
  var reveals = document.querySelectorAll(".reveal");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reveals.length && !reduce && "IntersectionObserver" in window) {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) {
      // Elements already on screen at load: show instantly (no entrance
      // animation) so navigating between pages doesn't flash/jitter.
      // Only elements below the fold animate when scrolled into view.
      if (el.getBoundingClientRect().top < vh) {
        el.classList.add("is-visible", "no-anim");
      } else {
        io.observe(el);
      }
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Screenshot rail: arrows, dots and edge fades ----
     The rail is a plain scroll-snap container, so swipe and keyboard scrolling
     already work on their own. Everything below is added on top of that. */
  var rail = document.querySelector(".shots");
  var railWrap = rail && rail.parentElement;
  var cards = rail ? Array.prototype.slice.call(rail.children) : [];
  var syncRailTo = null; // set below, so the lightbox can leave the rail in sync

  var CHEVRON_LEFT = "M15 5l-7 7 7 7";
  var CHEVRON_RIGHT = "M9 5l7 7-7 7";
  var CROSS = "M6 6l12 12M18 6L6 18";

  // Round icon button, shared by the rail arrows and the lightbox controls.
  function iconButton(className, label, path) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "circle-btn " + className;
    b.setAttribute("aria-label", label);
    b.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' +
      path + '"/></svg>';
    return b;
  }

  if (rail && railWrap && cards.length > 1) {
    var FADE = 72; // px of dissolve at an edge that has more content past it

    var prev = iconButton("shots-arrow shots-arrow--prev", "Previous screenshot", CHEVRON_LEFT);
    var next = iconButton("shots-arrow shots-arrow--next", "Next screenshot", CHEVRON_RIGHT);
    railWrap.appendChild(prev);
    railWrap.appendChild(next);

    var dots = document.createElement("div");
    dots.className = "shots-dots";
    var dotList = cards.map(function (card, i) {
      var d = document.createElement("button");
      d.type = "button";
      d.className = "shots-dot";
      d.setAttribute("aria-label", "Go to screenshot " + (i + 1) + " of " + cards.length);
      d.addEventListener("click", function () { scrollToCard(i); });
      dots.appendChild(d);
      return d;
    });
    railWrap.parentElement.insertBefore(dots, railWrap.nextSibling);

    function maxScroll() { return rail.scrollWidth - rail.clientWidth; }

    // Where the rail lands when card i is snapped to centre. Clamped, because
    // the first and last cards can never actually reach the middle.
    function targetFor(i) {
      var card = cards[i];
      return Math.max(0, Math.min(
        maxScroll(),
        card.offsetLeft - (rail.clientWidth - card.offsetWidth) / 2
      ));
    }

    // The card whose resting position is closest to where we are. Comparing
    // against clamped targets (rather than "nearest card to the rail centre")
    // is what keeps the ends honest: at scrollLeft 0 the first card is at the
    // left edge, not the middle, so a centre test would report the second one.
    function currentIndex() {
      if (rail.scrollLeft <= 1) return 0;
      if (rail.scrollLeft >= maxScroll() - 1) return cards.length - 1;
      var best = 0;
      var bestGap = Infinity;
      for (var i = 0; i < cards.length; i++) {
        var gap = Math.abs(targetFor(i) - rail.scrollLeft);
        if (gap < bestGap) { bestGap = gap; best = i; }
      }
      return best;
    }

    function scrollToCard(i) {
      rail.scrollTo({
        left: targetFor(Math.max(0, Math.min(cards.length - 1, i))),
        behavior: reduce ? "auto" : "smooth"
      });
    }

    function update() {
      // Sub-pixel scroll positions mean scrollLeft rarely hits the exact end.
      var max = rail.scrollWidth - rail.clientWidth;
      var atStart = rail.scrollLeft <= 1;
      var atEnd = rail.scrollLeft >= max - 1;

      rail.style.setProperty("--fade-start", (atStart ? 0 : FADE) + "px");
      rail.style.setProperty("--fade-end", (atEnd ? 0 : FADE) + "px");
      prev.disabled = atStart;
      next.disabled = atEnd;

      var active = currentIndex();
      dotList.forEach(function (d, i) {
        d.classList.toggle("is-active", i === active);
        d.setAttribute("aria-current", i === active ? "true" : "false");
      });
    }

    prev.addEventListener("click", function () { scrollToCard(currentIndex() - 1); });
    next.addEventListener("click", function () { scrollToCard(currentIndex() + 1); });

    var ticking = false;
    rail.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { ticking = false; update(); });
    }, { passive: true });
    window.addEventListener("resize", update);
    update();

    syncRailTo = scrollToCard;
  }

  /* ---- Screenshot lightbox ----
     Click (or Enter/Space on) a card to open it large, then cycle with the
     chevrons, arrow keys or a swipe. Esc or a click outside the image closes. */
  var shots = cards.map(function (card) { return card.querySelector("img"); })
                   .filter(Boolean);

  if (shots.length) {
    var box = document.createElement("div");
    box.className = "lightbox";
    box.hidden = true;
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Screenshot viewer");

    var bar = document.createElement("div");
    bar.className = "lightbox__bar";
    var count = document.createElement("span");
    count.className = "lightbox__count";
    var closeBtn = iconButton("lightbox__close", "Close viewer", CROSS);
    bar.appendChild(count);
    bar.appendChild(closeBtn);

    var stage = document.createElement("div");
    stage.className = "lightbox__stage";
    var full = document.createElement("img");
    full.className = "lightbox__img";
    var lbPrev = iconButton("lightbox__nav lightbox__nav--prev", "Previous screenshot", CHEVRON_LEFT);
    var lbNext = iconButton("lightbox__nav lightbox__nav--next", "Next screenshot", CHEVRON_RIGHT);
    stage.appendChild(lbPrev);
    stage.appendChild(full);
    stage.appendChild(lbNext);

    var caption = document.createElement("p");
    caption.className = "lightbox__caption";

    box.appendChild(bar);
    box.appendChild(stage);
    box.appendChild(caption);
    document.body.appendChild(box);

    var at = 0;
    var opener = null;

    function preload(i) {
      if (i < 0 || i >= shots.length) return;
      var img = new Image();
      img.src = shots[i].src;
    }

    function render(i) {
      at = Math.max(0, Math.min(shots.length - 1, i));
      full.src = shots[at].src;
      full.alt = shots[at].alt;
      caption.textContent = shots[at].alt;
      count.textContent = at + 1 + " / " + shots.length;
      lbPrev.disabled = at === 0;
      lbNext.disabled = at === shots.length - 1;
      // Neighbours, so a click through feels instant.
      preload(at - 1);
      preload(at + 1);
    }

    function openAt(i) {
      opener = document.activeElement;
      render(i);
      box.hidden = false;
      // Compensate for the scrollbar the lock removes, or the page shifts.
      var gap = window.innerWidth - document.documentElement.clientWidth;
      if (gap > 0) document.body.style.paddingRight = gap + "px";
      document.body.classList.add("has-lightbox");
      // Next frame, so the opacity transition has a starting value to run from.
      window.requestAnimationFrame(function () { box.classList.add("is-open"); });
      closeBtn.focus();
    }

    function closeBox() {
      box.hidden = true;
      box.classList.remove("is-open");
      document.body.classList.remove("has-lightbox");
      document.body.style.paddingRight = "";
      // Leave the rail showing whichever screenshot was last viewed, and put
      // focus on that card — never on the button we just hid.
      if (syncRailTo) syncRailTo(at);
      var landing = cards[at] || opener;
      if (landing && landing.focus) landing.focus({ preventScroll: true });
      opener = null;
    }

    function step(delta) {
      var to = at + delta;
      if (to < 0 || to >= shots.length) return;
      render(to);
    }

    cards.forEach(function (card, i) {
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", "View screenshot " + (i + 1) + " larger");
      card.addEventListener("click", function () { openAt(i); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          openAt(i);
        }
      });
    });

    closeBtn.addEventListener("click", closeBox);
    lbPrev.addEventListener("click", function () { step(-1); });
    lbNext.addEventListener("click", function () { step(1); });
    // Anywhere off the image — including the padding around it — closes.
    box.addEventListener("click", function (e) {
      if (e.target === box || e.target === stage || e.target === caption) closeBox();
    });

    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") { closeBox(); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); return; }
      if (e.key !== "Tab") return;
      // Keep focus inside the dialog while it is open.
      var focusable = [closeBtn, lbPrev, lbNext].filter(function (b) { return !b.disabled; });
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (focusable.indexOf(document.activeElement) === -1) { e.preventDefault(); first.focus(); }
    });

    // Swipe, for touch devices where the chevrons are a smaller target.
    var swipeX = null;
    stage.addEventListener("touchstart", function (e) {
      swipeX = e.changedTouches[0].clientX;
    }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (swipeX === null) return;
      var dx = e.changedTouches[0].clientX - swipeX;
      swipeX = null;
      if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1);
    }, { passive: true });
  }
})();
