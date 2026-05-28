(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function text(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupHeader() {
        var header = qs('[data-header]');
        var toggle = qs('[data-mobile-toggle]');
        var panel = qs('[data-mobile-panel]');

        if (header) {
            var onScroll = function () {
                if (window.scrollY > 18) {
                    header.classList.add('is-scrolled');
                } else {
                    header.classList.remove('is-scrolled');
                }
            };
            onScroll();
            window.addEventListener('scroll', onScroll, { passive: true });
        }

        if (toggle && panel && header) {
            toggle.addEventListener('click', function () {
                panel.classList.toggle('is-open');
                header.classList.toggle('is-open');
            });
        }
    }

    function setupSearchForms() {
        qsa('.search-form').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = qs('input[name="q"]', form);
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = 'search.html';
                }
            });
        });
    }

    function setupHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }

        var track = qs('[data-hero-track]', hero);
        var slides = qsa('.hero-slide', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var dots = qs('[data-hero-dots]', hero);
        var index = 0;
        var timer = null;

        function renderDots() {
            if (!dots) {
                return;
            }
            dots.innerHTML = '';
            slides.forEach(function (_, i) {
                var button = document.createElement('button');
                button.type = 'button';
                if (i === index) {
                    button.className = 'is-active';
                }
                button.addEventListener('click', function () {
                    go(i);
                    restart();
                });
                dots.appendChild(button);
            });
        }

        function go(nextIndex) {
            if (!track || !slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            track.style.transform = 'translateX(' + (-100 * index) + '%)';
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            renderDots();
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                go(index + 1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                go(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                go(index + 1);
                restart();
            });
        }

        go(0);
        restart();
    }

    function setupFilters() {
        qsa('[data-filter-panel]').forEach(function (panel) {
            var section = panel.closest('section') || document;
            var input = qs('[data-filter-input]', panel);
            var category = qs('[data-filter-category]', panel);
            var type = qs('[data-filter-type]', panel);
            var year = qs('[data-filter-year]', panel);
            var cards = qsa('.filter-card, .search-card', section);
            var resultLine = qs('[data-result-line]', section);
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q') || '';

            if (input && q && !input.value) {
                input.value = q;
            }

            function apply() {
                var keyword = text(input && input.value);
                var categoryValue = text(category && category.value);
                var typeValue = text(type && type.value);
                var yearValue = text(year && year.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = text(card.getAttribute('data-text'));
                    var ok = true;

                    if (keyword && haystack.indexOf(keyword) === -1) {
                        ok = false;
                    }

                    if (categoryValue && text(card.getAttribute('data-category')) !== categoryValue) {
                        ok = false;
                    }

                    if (typeValue && text(card.getAttribute('data-type')) !== typeValue) {
                        ok = false;
                    }

                    if (yearValue && text(card.getAttribute('data-year')) !== yearValue) {
                        ok = false;
                    }

                    card.classList.toggle('hidden-card', !ok);
                    if (ok) {
                        visible += 1;
                    }
                });

                if (resultLine) {
                    resultLine.textContent = visible ? '为你展示匹配影片' : '没有找到匹配影片';
                }
            }

            [input, category, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            apply();
        });
    }

    function setupPlayer() {
        var video = qs('[data-player-video]');
        var cover = qs('[data-player-cover]');

        if (!video || !cover || typeof playConfig === 'undefined' || !playConfig.source) {
            return;
        }

        var loaded = false;
        var hls = null;

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = playConfig.source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(playConfig.source);
                hls.attachMedia(video);
                return;
            }

            video.src = playConfig.source;
        }

        function start() {
            load();
            cover.classList.add('is-hidden');
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        cover.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            cover.classList.add('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupHeader();
        setupSearchForms();
        setupHero();
        setupFilters();
        setupPlayer();
    });
})();
