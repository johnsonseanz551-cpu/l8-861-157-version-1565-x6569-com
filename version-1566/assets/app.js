(function () {
    function all(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function one(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupImages() {
        all('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('image-failed');
            }, { once: true });
        });
    }

    function setupMenu() {
        var header = one('.site-header');
        var toggle = one('.menu-toggle');
        if (!header || !toggle) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = header.classList.toggle('nav-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var hero = one('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = all('[data-hero-slide]', hero);
        var dots = all('[data-hero-dot]', hero);
        var thumbs = all('[data-hero-thumb]', hero);
        var prev = one('[data-hero-prev]', hero);
        var next = one('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
            thumbs.forEach(function (thumb, i) {
                thumb.classList.toggle('active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('mouseenter', function () {
                show(Number(thumb.getAttribute('data-hero-thumb')) || 0);
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupRails() {
        all('.rail-section').forEach(function (section) {
            var rail = one('[data-rail]', section);
            var left = one('[data-rail-left]', section);
            var right = one('[data-rail-right]', section);
            if (!rail) {
                return;
            }
            if (left) {
                left.addEventListener('click', function () {
                    rail.scrollBy({ left: -360, behavior: 'smooth' });
                });
            }
            if (right) {
                right.addEventListener('click', function () {
                    rail.scrollBy({ left: 360, behavior: 'smooth' });
                });
            }
        });
    }

    function setupLocalFilters() {
        all('[data-filter-panel]').forEach(function (panel) {
            var input = one('[data-filter-input]', panel);
            var clear = one('[data-filter-clear]', panel);
            var cards = all('[data-card-list] .movie-card');
            var genre = '';
            var year = '';

            function updateButtons() {
                all('[data-filter-genre]', panel).forEach(function (button) {
                    button.classList.toggle('active', button.getAttribute('data-filter-genre') === genre);
                });
                all('[data-filter-year]', panel).forEach(function (button) {
                    button.classList.toggle('active', button.getAttribute('data-filter-year') === year);
                });
            }

            function apply() {
                var query = normalize(input ? input.value : '');
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-keywords')
                    ].join(' '));
                    var okQuery = !query || text.indexOf(query) !== -1;
                    var okGenre = !genre || card.getAttribute('data-genre') === genre;
                    var okYear = !year || card.getAttribute('data-year') === year;
                    card.classList.toggle('is-hidden', !(okQuery && okGenre && okYear));
                });
                updateButtons();
            }

            all('[data-filter-genre]', panel).forEach(function (button) {
                button.addEventListener('click', function () {
                    genre = button.getAttribute('data-filter-genre') || '';
                    apply();
                });
            });

            all('[data-filter-year]', panel).forEach(function (button) {
                button.addEventListener('click', function () {
                    year = button.getAttribute('data-filter-year') || '';
                    apply();
                });
            });

            if (input) {
                input.addEventListener('input', apply);
            }

            if (clear) {
                clear.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    genre = '';
                    year = '';
                    apply();
                });
            }

            apply();
        });
    }

    function setupSearchPage() {
        var panel = one('[data-search-panel]');
        if (!panel) {
            return;
        }
        var input = one('[data-search-input]', panel);
        var reset = one('[data-search-reset]', panel);
        var cards = all('[data-search-list] .movie-card');
        var category = '';
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (input) {
            input.value = initialQuery;
        }

        function markButtons() {
            all('[data-search-category]', panel).forEach(function (button) {
                button.classList.toggle('active', button.getAttribute('data-search-category') === category);
            });
        }

        function apply() {
            var query = normalize(input ? input.value : '');
            cards.forEach(function (card) {
                var value = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-keywords')
                ].join(' '));
                var okQuery = !query || value.indexOf(query) !== -1;
                var okCategory = !category || card.getAttribute('data-category') === category;
                card.classList.toggle('is-hidden', !(okQuery && okCategory));
            });
            markButtons();
        }

        all('[data-search-category]', panel).forEach(function (button) {
            button.addEventListener('click', function () {
                category = button.getAttribute('data-search-category') || '';
                apply();
            });
        });

        if (input) {
            input.addEventListener('input', apply);
        }

        if (reset) {
            reset.addEventListener('click', function () {
                category = '';
                if (input) {
                    input.value = '';
                }
                apply();
            });
        }

        apply();
    }

    function setupPlayers() {
        all('[data-player]').forEach(function (player) {
            var video = one('video', player);
            var button = one('[data-play-button]', player);
            var streamUrl = player.getAttribute('data-stream');
            var started = false;
            var hls = null;

            function start() {
                if (!video || !streamUrl) {
                    return;
                }
                if (!started) {
                    if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                        hls.loadSource(streamUrl);
                        hls.attachMedia(video);
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = streamUrl;
                    } else {
                        video.src = streamUrl;
                    }
                    started = true;
                }
                if (button) {
                    button.classList.add('is-hidden');
                }
                video.controls = true;
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    start();
                });
            }

            player.addEventListener('click', function (event) {
                if (event.target === video) {
                    return;
                }
                if (event.target.closest && event.target.closest('button')) {
                    return;
                }
                if (!started) {
                    start();
                }
            });

            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupImages();
        setupMenu();
        setupHero();
        setupRails();
        setupLocalFilters();
        setupSearchPage();
        setupPlayers();
    });
})();
