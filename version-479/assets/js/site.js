(function () {
  function toText(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function initNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var year = scope.querySelector("[data-filter-year]");
      var region = scope.querySelector("[data-filter-region]");
      var genre = scope.querySelector("[data-filter-genre]");
      var container = scope.nextElementSibling;
      while (container && !container.querySelectorAll("[data-card]").length) {
        container = container.nextElementSibling;
      }
      if (!container) {
        container = document;
      }
      var cards = Array.prototype.slice.call(container.querySelectorAll("[data-card]"));
      var empty = container.parentElement ? container.parentElement.querySelector("[data-empty]") : null;
      var urlQuery = new URLSearchParams(window.location.search).get("q");
      if (urlQuery && input) {
        input.value = urlQuery;
      }
      function apply() {
        var q = input ? toText(input.value) : "";
        var y = year ? toText(year.value) : "";
        var r = region ? toText(region.value) : "";
        var g = genre ? toText(genre.value) : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = toText(card.getAttribute("data-search"));
          var cardYear = toText(card.getAttribute("data-year"));
          var cardRegion = toText(card.getAttribute("data-region"));
          var cardGenre = toText(card.getAttribute("data-genre"));
          var ok = (!q || text.indexOf(q) !== -1) &&
            (!y || cardYear === y) &&
            (!r || cardRegion.indexOf(r) !== -1) &&
            (!g || cardGenre.indexOf(g) !== -1);
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("visible", visible === 0);
        }
      }
      [input, year, region, genre].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  window.setupMoviePlayer = function (source) {
    var video = document.querySelector("[data-player-video]");
    var startButton = document.querySelector("[data-player-start]");
    if (!video || !source) {
      return;
    }
    var hlsInstance = null;
    var prepared = false;
    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      video.controls = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }
    function play() {
      prepare();
      if (startButton) {
        startButton.classList.add("is-hidden");
      }
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }
    if (startButton) {
      startButton.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (!prepared || video.paused) {
        play();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initHero();
    initFilters();
  });
})();
