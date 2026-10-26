(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var nav = document.querySelector(".nav");
  var syncNav = function () {
    if (!nav) return;
    var open = nav.querySelector(".nav__menu.is-open");
    nav.classList.toggle("is-solid", window.scrollY > 24 || !!open);
  };
  window.addEventListener("scroll", syncNav, { passive: true });
  syncNav();

  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("menu");
  if (toggle && menu) {
    var setOpen = function (open) {
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      syncNav();
    };
    toggle.addEventListener("click", function () {
      setOpen(!menu.classList.contains("is-open"));
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  var page = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav__menu a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === page || href === page + ".html") a.setAttribute("aria-current", "page");
  });

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  var reveals = document.querySelectorAll("[data-reveal], .end, .ladder");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -12% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  var garage = document.querySelector("[data-garage]");
  var balanceEl = document.querySelector("[data-balance]");
  if (garage && balanceEl) {
    var CAP = 20;
    var BASE = 1250;
    var GROWTH = 1.28;
    var balance = 75000;
    var pct = function (fraction) {
      var x = +(fraction * 100).toFixed(6);
      var r = Math.round(x);
      if (Math.abs(x % 1) === 0.5 && r % 2 !== 0) r -= 1;
      return r;
    };
    var LANES = {
      go: function (t) { return "+" + pct(0.85 * t) + "% power"; },
      hull: function (t) { return "-" + pct(0.30 * t) + "% drag"; },
      bite: function (t) { return "+" + pct(0.60 * t) + "% grip"; },
      angle: function (t) { return "+" + pct(0.80 * t) + "% control"; },
      range: function (t) {
        var x = 0.55 * t;
        return "+" + pct((1 + 0.6 * x) / (1 - 0.4 * x) - 1) + "% range";
      }
    };

    var group = function (n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
    var short = function (n) {
      if (n < 10000) return group(n);
      if (n < 100000) return (Math.round(n / 100) / 10).toFixed(1).replace(/\.0$/, "") + "k";
      return Math.round(n / 1000) + "k";
    };
    var cost = function (level) {
      var raw = Math.round(BASE * Math.pow(GROWTH, level));
      return raw < 10000 ? raw : Math.round(raw / 100) * 100;
    };

    var render = function (lane) {
      var level = +lane.getAttribute("data-level");
      var kind = lane.getAttribute("data-lane");
      var btn = lane.querySelector("button");
      lane.querySelector(".meter").style.setProperty("--v", level);
      lane.querySelector(".lane__lv").textContent = level >= CAP ? "Max lvl" : "Lv " + level + " / " + CAP;
      lane.querySelector(".lane__fx").textContent = level > 0 ? LANES[kind](level / CAP) : "Stock";
      if (level >= CAP) {
        btn.disabled = true;
        btn.querySelector("span").textContent = "Maxed";
        btn.querySelector("img").hidden = true;
        return;
      }
      var price = cost(level);
      btn.querySelector("span").textContent = short(price);
      btn.disabled = price > balance;
      btn.setAttribute("aria-label", "Upgrade " + lane.querySelector(".lane__name").textContent +
        " to level " + (level + 1) + " for " + group(price) + " coins");
    };

    var lanes = Array.prototype.slice.call(garage.querySelectorAll("[data-lane]"));
    var renderAll = function () {
      balanceEl.textContent = group(balance);
      lanes.forEach(render);
    };

    lanes.forEach(function (lane) {
      lane.querySelector("button").addEventListener("click", function () {
        var level = +lane.getAttribute("data-level");
        var price = cost(level);
        if (level >= CAP || price > balance) return;
        balance -= price;
        lane.setAttribute("data-level", level + 1);
        lane.classList.remove("is-bumped");
        void lane.offsetWidth;
        lane.classList.add("is-bumped");
        renderAll();
      });
    });
    renderAll();
  }

  var pile = document.querySelector("[data-pile]");
  if (pile) {
    var prints = Array.prototype.slice.call(pile.querySelectorAll(".print"));
    var capEl = document.querySelector("[data-cap]");
    var countEl = document.querySelector("[data-count]");
    var btns = document.querySelector("[data-pile-btns]");
    var order = prints.map(function (_, i) { return i; });
    var LOOK = [
      { r: -3, x: "0%", y: "0%" },
      { r: 5, x: "3%", y: "-7%" },
      { r: -8, x: "-4%", y: "-10%" },
      { r: 9, x: "5%", y: "-3%" }
    ];
    var busy = false;

    var box = document.createElement("div");
    box.className = "lightbox";
    box.hidden = true;
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Screenshot");
    var big = document.createElement("img");
    box.appendChild(big);
    document.body.appendChild(box);

    var lay = function () {
      order.forEach(function (idx, pos) {
        var p = prints[idx];
        var look = LOOK[Math.min(pos, LOOK.length - 1)];
        p.style.setProperty("--r", look.r + "deg");
        p.style.setProperty("--x", look.x);
        p.style.setProperty("--y", look.y);
        p.style.zIndex = prints.length - pos;
        p.style.opacity = pos < LOOK.length ? "" : "0";
        p.classList.toggle("is-top", pos === 0);
        p.setAttribute("aria-hidden", pos === 0 ? "false" : "true");
        p.querySelector("a").tabIndex = pos === 0 ? 0 : -1;
      });
      var top = prints[order[0]];
      capEl.textContent = top.querySelector("img").alt;
      countEl.textContent = (order[0] + 1) + " of " + prints.length;
      if (!box.hidden) {
        big.src = top.querySelector("a").getAttribute("href");
        big.alt = top.querySelector("img").alt;
      }
    };
    var next = function () {
      if (busy) return;
      var top = prints[order[0]];
      if (reduce || !box.hidden) {
        order.push(order.shift());
        lay();
        return;
      }
      busy = true;
      top.classList.add("is-off");
      setTimeout(function () {
        order.push(order.shift());
        top.classList.remove("is-off");
        lay();
        busy = false;
      }, 380);
    };
    var prev = function () {
      if (busy) return;
      order.unshift(order.pop());
      lay();
    };
    var open = function () {
      var top = prints[order[0]];
      big.src = top.querySelector("a").getAttribute("href");
      big.alt = top.querySelector("img").alt;
      box.hidden = false;
      document.body.classList.add("has-lightbox");
      document.body.style.overflow = "hidden";
    };
    var close = function () {
      box.hidden = true;
      document.body.classList.remove("has-lightbox");
      document.body.style.overflow = "";
      prints[order[0]].querySelector("a").focus({ preventScroll: true });
    };

    pile.classList.add("is-live");
    btns.hidden = false;
    lay();

    prints.forEach(function (p) {
      p.querySelector("a").addEventListener("click", function (e) {
        e.preventDefault();
        open();
      });
    });
    btns.querySelector("[data-next]").addEventListener("click", next);
    btns.querySelector("[data-prev]").addEventListener("click", prev);

    var x0 = null;
    pile.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    pile.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (dx < -40) next();
      if (dx > 40) prev();
    }, { passive: true });

    box.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    });
  }

  var trailer = document.querySelector("[data-trailer]");
  if (trailer) {
    var video = trailer.querySelector("video");
    var playBtn = trailer.querySelector(".trailer__play");
    var endCard = trailer.querySelector(".trailer__end");

    var start = function () {
      playBtn.hidden = true;
      endCard.hidden = true;
      video.controls = true;
      if (video.ended) video.currentTime = 0;
      var playing = video.play();
      if (playing && playing.catch) playing.catch(function () {});
    };

    video.controls = false;
    playBtn.hidden = false;
    playBtn.addEventListener("click", start);
    trailer.querySelector(".trailer__again").addEventListener("click", start);
    video.addEventListener("ended", function () {
      if (document.fullscreenElement) document.exitFullscreen();
      if (video.webkitDisplayingFullscreen) video.webkitExitFullscreen();
      video.controls = false;
      endCard.hidden = false;
    });

    document.querySelectorAll("[data-watch]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        trailer.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        start();
      });
    });
  }

  document.querySelectorAll("[data-seek]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      var frame = document.getElementById(link.getAttribute("data-player"));
      if (!frame) return;
      e.preventDefault();
      var base = frame.getAttribute("data-src");
      frame.src = base + (base.indexOf("?") < 0 ? "?" : "&") + "start=" + link.getAttribute("data-seek") + "&autoplay=1";
      frame.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    });
  });
})();
