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

  if (rail && railWrap && cards.length > 1) {
    var FADE = 72; // px of dissolve at an edge that has more content past it

    var arrow = function (dir, label, path) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "shots-arrow shots-arrow--" + dir;
      b.setAttribute("aria-label", label);
      b.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' +
        path + '"/></svg>';
      return b;
    };
    var prev = arrow("prev", "Previous screenshot", "M15 5l-7 7 7 7");
    var next = arrow("next", "Next screenshot", "M9 5l7 7-7 7");
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
  }
})();
