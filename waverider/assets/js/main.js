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

  var rises = document.querySelectorAll(".rise");
  if (!reduce && "IntersectionObserver" in window) {
    var vh = window.innerHeight;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    rises.forEach(function (el) {
      var top = el.getBoundingClientRect().top;
      if (top < vh && top > -el.offsetHeight) {
        el.style.transition = "none";
        el.classList.add("is-in");
      } else {
        io.observe(el);
      }
    });
    document.querySelectorAll(".fleet, .worlds, .lanes, .daily, .trick-list, .howto").forEach(function (grid) {
      Array.prototype.forEach.call(grid.children, function (child, i) {
        if (child.classList.contains("rise") && !child.style.transition) {
          child.style.transitionDelay = Math.min(i, 6) * 70 + "ms";
        }
      });
    });
  } else {
    rises.forEach(function (el) { el.classList.add("is-in"); });
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

  var viewer = document.querySelector("[data-viewer]");
  if (viewer) {
    var stage = viewer.querySelector(".viewer__stage");
    var stageImg = viewer.querySelector(".viewer__img");
    var caption = viewer.querySelector(".viewer__cap");
    var thumbs = Array.prototype.slice.call(viewer.querySelectorAll(".viewer__thumb"));
    var at = 0;

    var box = document.createElement("div");
    box.className = "lightbox";
    box.hidden = true;
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Screenshot");
    var big = document.createElement("img");
    box.appendChild(big);
    document.body.appendChild(box);

    var show = function (i) {
      at = (i + thumbs.length) % thumbs.length;
      var thumb = thumbs[at];
      var src = thumb.getAttribute("href");
      var text = thumb.getAttribute("data-cap");
      thumbs.forEach(function (t) { t.setAttribute("aria-current", t === thumb ? "true" : "false"); });
      caption.textContent = text;
      stageImg.classList.add("is-swapping");
      var next = new Image();
      next.onload = function () {
        stageImg.src = src;
        stageImg.alt = text;
        stageImg.classList.remove("is-swapping");
      };
      next.src = src;
      if (!box.hidden) {
        big.src = src;
        big.alt = text;
      }
    };

    var open = function () {
      big.src = thumbs[at].getAttribute("href");
      big.alt = thumbs[at].getAttribute("data-cap");
      box.hidden = false;
      document.body.classList.add("has-lightbox");
      document.body.style.overflow = "hidden";
    };
    var close = function () {
      box.hidden = true;
      document.body.classList.remove("has-lightbox");
      document.body.style.overflow = "";
      stage.focus({ preventScroll: true });
    };

    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener("click", function (e) {
        e.preventDefault();
        show(i);
      });
    });
    stage.tabIndex = 0;
    stage.setAttribute("role", "button");
    stage.setAttribute("aria-label", "Open this screenshot larger");
    stage.addEventListener("click", open);
    stage.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
    box.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(at + 1);
      if (e.key === "ArrowLeft") show(at - 1);
    });
  }

  var trailer = document.querySelector("[data-trailer]");
  if (trailer) {
    var video = trailer.querySelector("video");
    var playBtn = trailer.querySelector(".trailer__play");
    var endCard = trailer.querySelector(".trailer__end");

    // play() inside the click itself: Safari only allows sound from the gesture's own handler.
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
})();
