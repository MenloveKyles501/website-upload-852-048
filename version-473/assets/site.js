(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
        });
      }

      if (slides.length > 1) {
        window.setInterval(function () {
          show(current + 1);
        }, 6500);
      }
    });

    document.querySelectorAll("[data-filter-page]").forEach(function (page) {
      var input = page.querySelector("[data-filter-input]");
      var cards = Array.prototype.slice.call(page.querySelectorAll("[data-card]"));
      var empty = page.querySelector("[data-empty-state]");
      var typeButtons = Array.prototype.slice.call(page.querySelectorAll("[data-type-filter]"));
      var categoryButtons = Array.prototype.slice.call(page.querySelectorAll("[data-category-filter]"));
      var params = new URLSearchParams(window.location.search);
      var queryValue = params.get("q") || "";
      var currentType = "all";
      var currentCategory = "all";

      if (input && queryValue) {
        input.value = queryValue;
      }

      function updateButtons(buttons, value) {
        buttons.forEach(function (button) {
          button.classList.toggle("is-active", button.getAttribute("data-filter-value") === value);
        });
      }

      function applyFilter() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = card.getAttribute("data-search") || "";
          var type = card.getAttribute("data-type") || "";
          var category = card.getAttribute("data-category") || "";
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchType = currentType === "all" || type === currentType;
          var matchCategory = currentCategory === "all" || category === currentCategory;
          var matched = matchQuery && matchType && matchCategory;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }

      typeButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          currentType = button.getAttribute("data-filter-value") || "all";
          updateButtons(typeButtons, currentType);
          applyFilter();
        });
      });

      categoryButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          currentCategory = button.getAttribute("data-filter-value") || "all";
          updateButtons(categoryButtons, currentCategory);
          applyFilter();
        });
      });

      applyFilter();
    });
  });
})();
