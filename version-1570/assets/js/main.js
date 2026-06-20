(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var navLinks = document.querySelector('[data-nav-links]');

    if (menuButton && navLinks) {
        menuButton.addEventListener('click', function () {
            navLinks.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            var target = './search.html';
            if (query) {
                target += '?q=' + encodeURIComponent(query);
            }
            window.location.href = target;
        });
    });

    document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function auto() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                auto();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                auto();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                auto();
            });
        });

        show(0);
        auto();
    });

    var grid = document.querySelector('[data-filter-grid]');
    if (grid) {
        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-title]'));
        var searchInput = document.querySelector('[data-filter-keyword]');
        var regionSelect = document.querySelector('[data-filter-region]');
        var genreSelect = document.querySelector('[data-filter-genre]');
        var yearSelect = document.querySelector('[data-filter-year]');
        var empty = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var startQuery = params.get('q');

        if (startQuery && searchInput) {
            searchInput.value = startQuery;
        }

        function text(value) {
            return (value || '').toString().toLowerCase();
        }

        function filter() {
            var keyword = text(searchInput ? searchInput.value : '');
            var region = text(regionSelect ? regionSelect.value : '');
            var genre = text(genreSelect ? genreSelect.value : '');
            var year = text(yearSelect ? yearSelect.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = text(card.getAttribute('data-title') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-year'));
                var ok = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (region && text(card.getAttribute('data-region')).indexOf(region) === -1) {
                    ok = false;
                }
                if (genre && text(card.getAttribute('data-genre')).indexOf(genre) === -1) {
                    ok = false;
                }
                if (year && text(card.getAttribute('data-year')) !== year) {
                    ok = false;
                }

                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [searchInput, regionSelect, genreSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filter);
                control.addEventListener('change', filter);
            }
        });

        filter();
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.player-overlay');
        var url = player.getAttribute('data-stream');
        var hlsReady = false;

        function playVideo() {
            if (!video || !url) {
                return;
            }

            player.classList.add('is-playing');
            video.controls = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.src) {
                    video.src = url;
                }
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsReady) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    video._hls = hls;
                    hlsReady = true;
                } else {
                    video.play().catch(function () {});
                }
                return;
            }

            if (!video.src) {
                video.src = url;
            }
            video.play().catch(function () {});
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!player.classList.contains('is-playing')) {
                    playVideo();
                }
            });
        }
    });
}());
