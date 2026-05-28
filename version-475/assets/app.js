(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function setHero(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === current);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        clearInterval(timer);
        timer = setInterval(function () {
            setHero(current + 1);
        }, 5600);
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            setHero(i);
            startHero();
        });
    });

    if (prev) {
        prev.addEventListener('click', function () {
            setHero(current - 1);
            startHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            setHero(current + 1);
            startHero();
        });
    }

    setHero(0);
    startHero();

    var searchInput = document.querySelector('[data-search-input]');
    var typeSelect = document.querySelector('[data-type-filter]');
    var regionSelect = document.querySelector('[data-region-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var emptyState = document.querySelector('.empty-state');

    function readQuery() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    function matchCard(card, text, type, region) {
        var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || ''
        ].join(' ').toLowerCase();
        var okText = !text || haystack.indexOf(text) !== -1;
        var okType = !type || (card.getAttribute('data-type') || '') === type;
        var okRegion = !region || (card.getAttribute('data-region') || '').indexOf(region) !== -1;
        return okText && okType && okRegion;
    }

    function applySearch() {
        if (!searchInput || !cards.length) {
            return;
        }
        var text = searchInput.value.trim().toLowerCase();
        var type = typeSelect ? typeSelect.value : '';
        var region = regionSelect ? regionSelect.value : '';
        var visible = 0;
        cards.forEach(function (card) {
            var show = matchCard(card, text, type, region);
            card.style.display = show ? '' : 'none';
            if (show) {
                visible += 1;
            }
        });
        if (emptyState) {
            emptyState.classList.toggle('show', visible === 0);
        }
    }

    if (searchInput) {
        searchInput.value = readQuery();
        searchInput.addEventListener('input', applySearch);
        if (typeSelect) {
            typeSelect.addEventListener('change', applySearch);
        }
        if (regionSelect) {
            regionSelect.addEventListener('change', applySearch);
        }
        applySearch();
    }

    window.initMoviePlayer = function (source) {
        var video = document.getElementById('movie-video');
        var cover = document.getElementById('player-cover');
        var button = document.getElementById('play-button');
        var hlsInstance = null;
        var loaded = false;

        if (!video || !source) {
            return;
        }

        function hideCover() {
            if (cover) {
                cover.classList.add('hidden');
            }
            if (button) {
                button.classList.add('hidden');
            }
        }

        function attachSource() {
            if (loaded) {
                return Promise.resolve();
            }
            loaded = true;
            video.controls = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return new Promise(function (resolve) {
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
                });
            }

            video.src = source;
            return Promise.resolve();
        }

        function start() {
            hideCover();
            attachSource().then(function () {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            });
        }

        if (cover) {
            cover.addEventListener('click', start);
        }
        if (button) {
            button.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
