/* IntizomAI pitch deck — interactions */
(function () {
  "use strict";

  // --- Nav background on scroll ---
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 20) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // --- Mobile menu toggle ---
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

  // --- Reveal on scroll ---
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el, i) {
      // subtle stagger for grouped items
      el.style.transitionDelay = (i % 4) * 60 + "ms";
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("in");
    });
  }

  // --- Active nav link highlight ---
  var sections = Array.prototype.slice.call(document.querySelectorAll("section[id]"));
  var linkMap = {};
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var id = a.getAttribute("href").replace("#", "");
    linkMap[id] = a;
  });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && linkMap[e.target.id]) {
            document.querySelectorAll(".nav-links a").forEach(function (a) {
              a.style.color = "";
            });
            if (!linkMap[e.target.id].classList.contains("nav-cta")) {
              linkMap[e.target.id].style.color = "#eef2ff";
            }
          }
        });
      },
      { threshold: 0.5 }
    );
    sections.forEach(function (s) {
      spy.observe(s);
    });
  }
})();
