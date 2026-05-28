(function () {
  function select(selector, root) {
    return (root || document).querySelector(selector);
  }

  function selectAll(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function toggleMenu() {
    var button = select('[data-menu-button]');
    var menu = select('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = select('[data-hero]');
    if (!root) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', root);
    var dots = selectAll('[data-hero-dot]', root);
    var next = select('[data-hero-next]', root);
    var prev = select('[data-hero-prev]', root);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      slides[current].classList.remove('is-active');
      if (dots[current]) {
        dots[current].classList.remove('is-active');
      }
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      if (dots[current]) {
        dots[current].classList.add('is-active');
      }
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    start();
  }

  function initPlayers() {
    selectAll('[data-player]').forEach(function (box) {
      var video = select('video', box);
      var button = select('[data-play]', box);
      if (!video) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var hlsInstance = null;

      function attach() {
        if (!stream) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          if (!video.src) {
            video.src = stream;
          }
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          if (!hlsInstance) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
          }
          return;
        }
        if (!video.src) {
          video.src = stream;
        }
      }

      function play() {
        attach();
        box.classList.add('is-playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            video.controls = true;
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    });

    selectAll('[data-scroll-player]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var player = select('[data-player]');
        if (player) {
          player.scrollIntoView({ behavior: 'smooth', block: 'center' });
          var button = select('[data-play]', player);
          if (button) {
            button.click();
          }
        }
      });
    });
  }

  function escapeText(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearch() {
    var form = select('[data-search-form]');
    var input = select('[data-search-input]');
    var results = select('[data-search-results]');
    var data = window.SITE_CATALOG || [];
    if (!form || !input || !results || !data.length) {
      return;
    }

    function createCard(item) {
      var tagHtml = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeText(tag) + '</span>';
      }).join('');
      return [
        '<article class="movie-card">',
        '<a class="poster-wrap" href="' + escapeText(item.url) + '">',
        '<img src="' + escapeText(item.image) + '" alt="' + escapeText(item.title) + '" loading="lazy">',
        '<span class="poster-shade"></span>',
        '<span class="poster-badge">' + escapeText(item.type) + '</span>',
        '<span class="poster-play">▶</span>',
        '</a>',
        '<div class="movie-info">',
        '<h3><a href="' + escapeText(item.url) + '">' + escapeText(item.title) + '</a></h3>',
        '<p class="movie-line">' + escapeText(item.line) + '</p>',
        '<div class="movie-meta"><span>' + escapeText(item.year) + '</span><span>' + escapeText(item.region) + '</span></div>',
        '<div class="tag-row">' + tagHtml + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      var list = data.filter(function (item) {
        if (!query) {
          return true;
        }
        var text = [item.title, item.region, item.type, item.year, item.genre, (item.tags || []).join(' '), item.line].join(' ').toLowerCase();
        return text.indexOf(query) !== -1;
      }).slice(0, 80);
      results.innerHTML = list.map(createCard).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });

    input.addEventListener('input', render);

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      input.value = q;
    }
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    toggleMenu();
    initHero();
    initPlayers();
    initSearch();
  });
})();
