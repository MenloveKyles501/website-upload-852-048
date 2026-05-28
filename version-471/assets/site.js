(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var toggle = qs('[data-mobile-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
      });
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (!slides.length) {
      return;
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    show(0);
    restart();
  }

  function initFilters() {
    var panel = qs('[data-filter-panel]');
    if (!panel) {
      return;
    }
    var input = qs('[data-filter-input]', panel);
    var count = qs('[data-filter-count]', panel);
    var cards = qsa('[data-card]');
    var activeRegion = '';
    var activeType = '';

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var visible = 0;
      cards.forEach(function (card) {
        var search = normalize(card.getAttribute('data-search'));
        var region = card.getAttribute('data-region') || '';
        var type = card.getAttribute('data-type') || '';
        var matchedKeyword = !keyword || search.indexOf(keyword) !== -1;
        var matchedRegion = !activeRegion || region === activeRegion;
        var matchedType = !activeType || type === activeType;
        var show = matchedKeyword && matchedRegion && matchedType;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = visible;
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    qsa('[data-filter-region]', panel).forEach(function (button) {
      button.addEventListener('click', function () {
        activeRegion = button.getAttribute('data-filter-region') || '';
        qsa('[data-filter-region]', panel).forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });

    qsa('[data-filter-type]', panel).forEach(function (button) {
      button.addEventListener('click', function () {
        activeType = button.getAttribute('data-filter-type') || '';
        qsa('[data-filter-type]', panel).forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });

    apply();
  }

  function initSearchPage() {
    var app = qs('[data-search-app]');
    if (!app || !window.MOVIES) {
      return;
    }
    var input = qs('[data-search-page-input]', app);
    var status = qs('[data-search-status]', app);
    var results = qs('[data-search-results]', app);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function card(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '' +
        '<article class="movie-card">' +
        '  <a class="movie-cover" href="movies/' + escapeHtml(movie.id) + '.html" aria-label="观看' + escapeHtml(movie.title) + '">' +
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '    <span class="cover-shade"></span>' +
        '    <span class="play-mark">▶</span>' +
        '  </a>' +
        '  <div class="movie-info">' +
        '    <div class="movie-meta"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
        '    <h3><a href="movies/' + escapeHtml(movie.id) + '.html">' + escapeHtml(movie.title) + '</a></h3>' +
        '    <p>' + escapeHtml(movie.oneLine) + '</p>' +
        '    <div class="tag-row">' + tags + '</div>' +
        '  </div>' +
        '</article>';
    }

    function runSearch() {
      var query = (input && input.value ? input.value : '').trim().toLowerCase();
      if (!query) {
        results.innerHTML = '';
        status.textContent = '请输入关键词开始搜索。';
        return;
      }
      var parts = query.split(/\s+/).filter(Boolean);
      var matched = window.MOVIES.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          movie.oneLine,
          (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();
        return parts.every(function (part) {
          return haystack.indexOf(part) !== -1;
        });
      });
      status.textContent = '找到 ' + matched.length + ' 部影片。';
      results.innerHTML = matched.slice(0, 240).map(card).join('');
      if (matched.length > 240) {
        status.textContent += ' 当前显示前 240 部，可继续增加关键词缩小范围。';
      }
    }

    if (input) {
      input.value = initialQuery;
      input.addEventListener('input', runSearch);
    }
    runSearch();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initSearchForms();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
