(() => {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const siteNav = document.querySelector('[data-site-nav]');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      siteNav.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let activeIndex = 0;
  let heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, currentIndex) => {
      slide.classList.toggle('is-active', currentIndex === activeIndex);
    });

    dots.forEach((dot, currentIndex) => {
      dot.classList.toggle('is-active', currentIndex === activeIndex);
    });
  }

  function startHero() {
    if (heroTimer || slides.length < 2) {
      return;
    }

    heroTimer = window.setInterval(() => {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      if (heroTimer) {
        window.clearInterval(heroTimer);
        heroTimer = null;
      }
      startHero();
    });
  });

  showSlide(0);
  startHero();

  document.querySelectorAll('[data-home-search]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const query = input ? input.value.trim() : '';
      const url = query ? `./search.html?q=${encodeURIComponent(query)}` : './search.html';
      window.location.href = url;
    });
  });

  document.querySelectorAll('[data-card-filter]').forEach((panel) => {
    const input = panel.querySelector('[data-filter-input]');
    const yearSelect = panel.querySelector('[data-year-filter]');
    const regionSelect = panel.querySelector('[data-region-filter]');
    const grid = document.querySelector(panel.dataset.target);
    const empty = document.querySelector(panel.dataset.empty);
    const cards = grid ? Array.from(grid.querySelectorAll('.movie-card')) : [];

    function normalize(value) {
      return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function applyFilter() {
      const keyword = normalize(input ? input.value : '');
      const year = yearSelect ? yearSelect.value : '';
      const region = regionSelect ? regionSelect.value : '';
      let visible = 0;

      cards.forEach((card) => {
        const text = normalize(`${card.dataset.title} ${card.dataset.tags} ${card.dataset.region} ${card.dataset.year}`);
        const matchesKeyword = !keyword || text.includes(keyword);
        const matchesYear = !year || card.dataset.year === year;
        const matchesRegion = !region || card.dataset.region === region;
        const shouldShow = matchesKeyword && matchesYear && matchesRegion;

        card.hidden = !shouldShow;

        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, yearSelect, regionSelect].forEach((control) => {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  });
})();
