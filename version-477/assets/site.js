(function() {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function() {
      menu.classList.toggle("is-open");
      toggle.textContent = menu.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function setupSearchForms() {
    selectAll("[data-search-form]").forEach(function(form) {
      form.addEventListener("submit", function(event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = form.getAttribute("action") || "./search.html";
        window.location.href = target + (query ? "?q=" + encodeURIComponent(query) : "");
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    var index = 0;
    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        show(dotIndex);
      });
    });
    show(0);
    if (slides.length > 1) {
      window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }
  }

  function setupScrollRows() {
    selectAll("[data-scroll-button]").forEach(function(button) {
      button.addEventListener("click", function() {
        var target = document.querySelector(button.getAttribute("data-scroll-target"));
        if (!target) {
          return;
        }
        var direction = button.getAttribute("data-scroll-button") === "left" ? -1 : 1;
        target.scrollBy({ left: direction * 420, behavior: "smooth" });
      });
    });
  }

  function setupFilters() {
    selectAll("[data-filter-area]").forEach(function(area) {
      var input = area.querySelector("[data-filter-input]");
      var region = area.querySelector("[data-region-filter]");
      var type = area.querySelector("[data-type-filter]");
      var cards = selectAll("[data-movie-card]", area);
      var empty = area.querySelector("[data-empty-state]");
      function apply() {
        var query = normalizeText(input && input.value);
        var regionValue = normalizeText(region && region.value);
        var typeValue = normalizeText(type && type.value);
        var shown = 0;
        cards.forEach(function(card) {
          var text = normalizeText([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesRegion = !regionValue || normalizeText(card.getAttribute("data-region")) === regionValue;
          var matchesType = !typeValue || normalizeText(card.getAttribute("data-type")) === typeValue;
          var visible = matchesQuery && matchesRegion && matchesType;
          card.style.display = visible ? "" : "none";
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", shown === 0);
        }
      }
      [input, region, type].forEach(function(element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
      }
      apply();
    });
  }

  window.initializePlayer = function(source) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-panel]");
    var starters = selectAll("[data-player-start]");
    if (!video || !source) {
      return;
    }
    var ready = false;
    function prepare() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }
    function start() {
      prepare();
      video.controls = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function() {});
      }
    }
    starters.forEach(function(button) {
      button.addEventListener("click", start);
    });
    video.addEventListener("click", function() {
      if (!ready) {
        start();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function() {
    setupNavigation();
    setupSearchForms();
    setupHero();
    setupScrollRows();
    setupFilters();
  });
})();