(function () {
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;
    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        startTimer();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        startTimer();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
        startTimer();
      });
    });
    startTimer();
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ");
  }

  document.querySelectorAll(".section, main").forEach(function (scope) {
    var input = scope.querySelector(".js-card-search");
    var list = scope.querySelector(".js-card-list");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var empty = scope.querySelector(".empty-state");
    var activeFilterType = "all";
    var activeFilterValue = "all";

    function applyFilters() {
      var query = input ? normalizeText(input.value) : "";
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalizeText(card.getAttribute("data-title"));
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchFilter = true;
        if (activeFilterType !== "all") {
          matchFilter = card.getAttribute("data-" + activeFilterType) === activeFilterValue;
        }
        var shouldShow = matchQuery && matchFilter;
        card.style.display = shouldShow ? "" : "none";
        if (shouldShow) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", applyFilters);
    }

    scope.querySelectorAll(".filter-button").forEach(function (button) {
      button.addEventListener("click", function () {
        scope.querySelectorAll(".filter-button").forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        activeFilterType = button.getAttribute("data-filter-type") || "all";
        activeFilterValue = button.getAttribute("data-filter-value") || "all";
        applyFilters();
      });
    });
  });
})();
