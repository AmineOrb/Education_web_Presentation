/* Educationcity-dz — main.js */
(function () {
  "use strict";

  var LANGS = ["fr", "en", "ar"];
  var RTL = { ar: true };

  function getLang() {
    var stored = localStorage.getItem("ec-lang");
    if (stored && LANGS.indexOf(stored) !== -1) return stored;
    return "fr";
  }

  function applyLang(lang) {
    if (LANGS.indexOf(lang) === -1) lang = "fr";
    document.documentElement.setAttribute("data-active-lang", lang);
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", RTL[lang] ? "rtl" : "ltr");
    localStorage.setItem("ec-lang", lang);
    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang-btn") === lang);
    });
    document.querySelectorAll("[data-page-title]").forEach(function (el) {
      try {
        var titles = JSON.parse(el.getAttribute("data-page-title"));
        if (titles && titles[lang]) document.title = titles[lang];
      } catch (e) {
        // ignore malformed titles
      }
    });
    if (typeof renderTrainingCategoryCard === "function") renderTrainingCategoryCard();
  }

  function renderTrainingCategoryCard() {
    var card = document.getElementById("category-detail-card");
    var titleEl = document.getElementById("category-card-title");
    var descEl = document.getElementById("category-card-desc");
    if (!card || !titleEl || !descEl) return;

    var activeBtn = document.querySelector(".pill-selectable.active");
    if (!activeBtn) return;

    var lang = getLang();
    var title = activeBtn.getAttribute("data-title-" + lang) || activeBtn.getAttribute("data-title-fr");
    var desc = activeBtn.getAttribute("data-desc-" + lang) || activeBtn.getAttribute("data-desc-fr");

    titleEl.textContent = title || "";
    descEl.textContent = desc || "";
    card.style.display = "block";
  }

  function initTrainingCategoryCards() {
    document.querySelectorAll(".pill-selectable").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".pill-selectable").forEach(function (other) {
          other.classList.remove("active");
        });
        btn.classList.add("active");
        renderTrainingCategoryCard();
      });
    });
    renderTrainingCategoryCard();
  }

  function initLangSwitch() {
    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLang(btn.getAttribute("data-lang-btn"));
      });
    });
    applyLang(getLang());
    initTrainingCategoryCards();
  }

  /* ---------------- Loader ---------------- */
  window.addEventListener("load", function () {
    var loader = document.getElementById("loader");
    if (loader) setTimeout(function () { loader.classList.add("hide"); }, 350);
  });

  /* ---------------- Navbar scroll state ---------------- */
  var navbar = document.getElementById("navbar");
  var progress = document.getElementById("scroll-progress");
  var backTop = document.getElementById("back-to-top");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (navbar) navbar.classList.toggle("scrolled", y > 40);
    if (backTop) backTop.classList.toggle("show", y > 500);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  if (backTop) {
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------- Mobile nav ---------------- */
  var navToggle = document.getElementById("nav-toggle");
  var navLinks = document.getElementById("nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      navLinks.classList.toggle("open");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { navLinks.classList.remove("open"); });
    });
  }

  /* ---------------- Reveal on scroll ---------------- */
  var revealEls = document.querySelectorAll(".reveal, .reveal-scale");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el, i) {
      el.style.setProperty("--i", i % 6);
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------------- Counters ---------------- */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffixEl = el.querySelector(".suffix");
    var numText = el.querySelector(".num-text") || el;
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progressRatio = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progressRatio, 3);
      var current = target * eased;
      var display = target % 1 === 0 ? Math.floor(current) : current.toFixed(1);
      numText.firstChild ? (numText.childNodes[0].nodeValue = display) : (numText.textContent = display);
      if (progressRatio < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll(".stat-num[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------------- FAQ accordion ---------------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      item.closest(".faq-list").querySelectorAll(".faq-item").forEach(function (other) {
        other.classList.remove("open");
        other.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + 40 + "px";
      }
    });
  });

  /* ---------------- Button ripple / glow position ---------------- */
  document.querySelectorAll(".btn").forEach(function (btn) {
    btn.addEventListener("mousemove", function (e) {
      var rect = btn.getBoundingClientRect();
      btn.style.setProperty("--rx", ((e.clientX - rect.left) / rect.width) * 100 + "%");
      btn.style.setProperty("--ry", ((e.clientY - rect.top) / rect.height) * 100 + "%");
    });
  });

  /* ---------------- Forms ---------------- */
  document.querySelectorAll("form[data-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      var success = form.parentElement.querySelector(".form-success");
      var btn = form.querySelector("button[type=submit]");
      var originalText = btn ? btn.innerHTML : "";

      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span data-lang="fr">Envoi en cours...</span><span data-lang="en">Sending...</span><span data-lang="ar">إرسال...</span>';
      }

      if (!form.checkValidity()) {
        e.preventDefault();
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = originalText;
        }
        return;
      }

      if (success) success.classList.remove("show");
    });
  });

  /* ---------------- Anchor smooth scroll offset for fixed nav ---------------- */
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute("href");
    if (id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    var y = target.getBoundingClientRect().top + window.pageYOffset - 90;
    window.scrollTo({ top: y, behavior: "smooth" });
  });

  /* ---------------- Map controls ---------------- */
  var mapBox = document.querySelector('[data-map-box]');
  var mapFrame = document.getElementById('location-map');
  var mapZoomInput = document.querySelector('[data-map-zoom]');
  var mapModeSelect = document.querySelector('[data-map-mode-select]');
  var mapState = { mode: 'roadmap', zoom: 16 };

  function getMapModeCode(mode) {
    if (mode === 'satellite') return 's';
    if (mode === 'hybrid') return 'h';
    return 'm';
  }

  function buildMapSrc() {
    return 'https://www.google.com/maps?q=36.7222392,3.0315218&z=' + mapState.zoom + '&t=' + getMapModeCode(mapState.mode) + '&output=embed';
  }

  function updateLocationMap() {
    if (!mapFrame) return;
    mapFrame.src = buildMapSrc();
  }

  if (mapBox) {
    if (mapZoomInput) {
      mapZoomInput.addEventListener('input', function () {
        mapState.zoom = parseInt(mapZoomInput.value, 10);
        updateLocationMap();
      });
    }

    if (mapModeSelect) {
      mapModeSelect.addEventListener('change', function () {
        mapState.mode = mapModeSelect.value;
        updateLocationMap();
      });
    }

    updateLocationMap();
  }

  /* ---------------- Dark mode toggle ---------------- */
  function getTheme() {
    var t = localStorage.getItem('ec-theme');
    return t === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('ec-theme', theme);
    var btn = document.getElementById('dark-toggle');
    if (btn) {
      var ico = btn.querySelector('.theme-ico');
      if (ico) ico.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.classList.toggle('theme-dark', theme === 'dark');
      btn.classList.toggle('theme-light', theme !== 'dark');
      btn.setAttribute('aria-pressed', theme === 'dark');
    }
  }

  function initThemeToggle() {
    applyTheme(getTheme());
    var btn = document.getElementById('dark-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  initThemeToggle();
  initLangSwitch();
  onScroll();
})();
