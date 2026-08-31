/* ============================================================
   IntizomAI Pitch Deck — interactions
   ============================================================ */
(function () {
  "use strict";

  var PAGE_NAMES = [
    "Asosiy sahifa",
    "Maqsadlar",
    "AI Murabbiy",
    "Odatlar trekeri",
    "Do'stlar",
    "Statistika",
    "Reyting",
  ];

  /* ---------- nav bg + scroll progress ---------- */
  var nav = document.getElementById("nav");
  var bar = document.getElementById("scrollBar");
  function onScroll() {
    if (window.scrollY > 20) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = h > 0 ? (window.scrollY / h) * 100 + "%" : "0%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById("burger");
  var navLinks = document.getElementById("navLinks");
  if (burger) {
    burger.addEventListener("click", function () {
      navLinks.classList.toggle("open");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("open");
      });
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revs = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    revs.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      io.observe(el);
    });
  } else {
    revs.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- use-of-funds bars animate in ---------- */
  var funds = document.getElementById("funds");
  if (funds && "IntersectionObserver" in window) {
    var fio = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            funds.querySelectorAll(".fund-row").forEach(function (r, i) {
              setTimeout(function () { r.classList.add("in"); }, i * 140);
            });
            fio.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    fio.observe(funds);
  }

  /* ---------- build heatmap (stats page) ---------- */
  var heat = document.getElementById("heat");
  if (heat) {
    var LV = ["", "l1", "l2", "l3", "l4"];
    // deterministic-ish pattern so it looks realistic, not random noise
    var pat = [2,3,1,3,4,4,1,0,2,3,4,3,4,2,3,
               4,3,4,4,2,3,3,4,1,2,4,4,3,4,4];
    for (var i = 0; i < pat.length; i++) {
      var c = document.createElement("i");
      if (LV[pat[i]]) c.className = LV[pat[i]];
      c.style.animationDelay = (i * 22) + "ms";
      heat.appendChild(c);
    }
  }

  /* ---------- MINI APP page switcher ---------- */
  var pagesWrap = document.getElementById("pages");
  var tabbar = document.getElementById("tabbar");
  var pgName = document.getElementById("pgName");
  var autoState = document.getElementById("autoState");

  if (pagesWrap && tabbar) {
    var pages = pagesWrap.querySelectorAll(".page");
    var tabs = tabbar.querySelectorAll("button");
    var dnavs = document.querySelectorAll(".dnav");
    var cur = 0;
    var timer = null;
    var AUTO_MS = 4600;
    var userPaused = false;

    function show(i) {
      if (i === cur) return;
      var old = pages[cur];
      var next = pages[i];

      old.classList.add("leaving");
      old.classList.remove("active");
      setTimeout(function () { old.classList.remove("leaving"); }, 460);

      // force restart of inner CSS animations by reflow
      next.classList.remove("active");
      void next.offsetWidth;
      next.classList.add("active");

      cur = i;

      tabs.forEach(function (t, k) { t.classList.toggle("on", k === i); });
      dnavs.forEach(function (d) {
        d.classList.toggle("on", parseInt(d.dataset.go, 10) === i);
      });
      if (pgName) pgName.textContent = PAGE_NAMES[i] || "";
    }

    function next() { show((cur + 1) % pages.length); }

    function startAuto() {
      stopAuto();
      if (userPaused) return;
      timer = setInterval(next, AUTO_MS);
      if (autoState) autoState.textContent = "avtomatik";
    }
    function stopAuto() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function pauseByUser() {
      userPaused = true;
      stopAuto();
      if (autoState) autoState.textContent = "qo'lda";
      // resume after a while of no interaction
      clearTimeout(pauseByUser._t);
      pauseByUser._t = setTimeout(function () {
        userPaused = false;
        startAuto();
      }, 14000);
    }

    function bindGo(el) {
      el.addEventListener("click", function () {
        var i = parseInt(el.dataset.go, 10);
        if (isNaN(i)) return;
        pauseByUser();
        show(i);
      });
    }
    tabs.forEach(bindGo);
    dnavs.forEach(bindGo);

    // pause auto-rotate while hovering the phone
    var phoneEl = pagesWrap.closest(".phone");
    if (phoneEl) {
      phoneEl.addEventListener("mouseenter", stopAuto);
      phoneEl.addEventListener("mouseleave", function () {
        if (!userPaused) startAuto();
      });
    }

    // only auto-rotate while the demo is on screen
    if ("IntersectionObserver" in window) {
      var dio = new IntersectionObserver(
        function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting) startAuto();
            else stopAuto();
          });
        },
        { threshold: 0.25 }
      );
      dio.observe(pagesWrap);
    } else {
      startAuto();
    }

    // swipe support on the phone
    var sx = null;
    pagesWrap.addEventListener("touchstart", function (e) {
      sx = e.touches[0].clientX;
    }, { passive: true });
    pagesWrap.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 45) {
        pauseByUser();
        show(dx < 0 ? (cur + 1) % pages.length : (cur - 1 + pages.length) % pages.length);
      }
      sx = null;
    }, { passive: true });
  }

  /* ---------- active nav link ---------- */
  var secs = Array.prototype.slice.call(document.querySelectorAll("section[id], header[id]"));
  var map = {};
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    map[a.getAttribute("href").replace("#", "")] = a;
  });
  if ("IntersectionObserver" in window && secs.length) {
    var sio = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          Object.keys(map).forEach(function (k) { map[k].classList.remove("active"); });
          var a = map[e.target.id];
          if (a && !a.classList.contains("nav-cta")) a.classList.add("active");
        });
      },
      { threshold: 0.45 }
    );
    secs.forEach(function (s) { sio.observe(s); });
  }
})();
