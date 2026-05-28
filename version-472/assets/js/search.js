(() => {
  const form = document.querySelector('[data-search-page]');
  const input = document.querySelector('[data-search-input]');
  const yearSelect = document.querySelector('[data-search-year]');
  const regionSelect = document.querySelector('[data-search-region]');
  const grid = document.querySelector('[data-search-grid]');
  const empty = document.querySelector('[data-search-empty]');

  if (!form || !input || !grid || typeof SITE_MOVIES === 'undefined') {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q') || '';
  input.value = initialQuery;

  const years = Array.from(new Set(SITE_MOVIES.map((movie) => movie.year).filter(Boolean))).sort((a, b) => b - a);
  const regions = Array.from(new Set(SITE_MOVIES.map((movie) => movie.region).filter(Boolean))).sort();

  years.forEach((year) => {
    const option = document.createElement('option');
    option.value = String(year);
    option.textContent = `${year}年`;
    yearSelect.appendChild(option);
  });

  regions.forEach((region) => {
    const option = document.createElement('option');
    option.value = region;
    option.textContent = region;
    regionSelect.appendChild(option);
  });

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function card(movie) {
    const tags = movie.tags.slice(0, 4).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('');

    return `<article class="movie-card">
  <a class="movie-cover" href="${movie.url}" aria-label="观看${escapeHtml(movie.title)}">
    <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
    <span class="movie-region">${escapeHtml(movie.region)}</span>
    <span class="movie-play">▶</span>
  </a>
  <div class="movie-info">
    <h3><a href="${movie.url}">${escapeHtml(movie.title)}</a></h3>
    <p class="movie-meta">${escapeHtml(movie.yearText)} · ${escapeHtml(movie.type)} · ${escapeHtml(movie.genre)}</p>
    <p class="movie-line">${escapeHtml(movie.line)}</p>
    <div class="tag-row">${tags}</div>
  </div>
</article>`;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function applySearch(updateUrl = false) {
    const query = normalize(input.value);
    const year = yearSelect.value;
    const region = regionSelect.value;

    const results = SITE_MOVIES.filter((movie) => {
      const text = normalize(`${movie.title} ${movie.region} ${movie.type} ${movie.genre} ${movie.tags.join(' ')} ${movie.line} ${movie.category}`);
      const matchesQuery = !query || text.includes(query);
      const matchesYear = !year || String(movie.year) === year;
      const matchesRegion = !region || movie.region === region;
      return matchesQuery && matchesYear && matchesRegion;
    }).slice(0, 120);

    grid.innerHTML = results.map(card).join('');
    empty.classList.toggle('is-visible', results.length === 0);

    if (updateUrl) {
      const nextParams = new URLSearchParams();
      if (input.value.trim()) {
        nextParams.set('q', input.value.trim());
      }
      const nextUrl = nextParams.toString() ? `./search.html?${nextParams.toString()}` : './search.html';
      window.history.replaceState(null, '', nextUrl);
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    applySearch(true);
  });

  [input, yearSelect, regionSelect].forEach((control) => {
    control.addEventListener('input', () => applySearch(true));
    control.addEventListener('change', () => applySearch(true));
  });

  applySearch(false);
})();
