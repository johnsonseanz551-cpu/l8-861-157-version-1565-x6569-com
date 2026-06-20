(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navMenu = document.querySelector('[data-nav-menu]');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')));
                start();
            });
        });

        show(0);
        start();
    }

    var searchForm = document.querySelector('[data-search-form]');
    var searchResults = document.querySelector('[data-search-results]');
    var searchStatus = document.querySelector('[data-search-status]');

    if (searchForm && searchResults && window.SEARCH_MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var queryInput = searchForm.querySelector('[name="q"]');
        var typeInput = searchForm.querySelector('[name="type"]');
        var yearInput = searchForm.querySelector('[name="year"]');
        var genreInput = searchForm.querySelector('[name="genre"]');

        if (queryInput) {
            queryInput.value = params.get('q') || '';
        }

        function card(movie) {
            var tags = movie.tags.slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return '<article class="movie-card">' +
                '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + ' 在线观看">' +
                    '<span class="poster-frame"><img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.remove()"></span>' +
                    '<span class="card-badge">' + escapeHtml(movie.type) + '</span>' +
                '</a>' +
                '<div class="movie-card-body">' +
                    '<div class="meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
                    '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</article>';
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"']/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[char];
            });
        }

        function runSearch() {
            var q = (queryInput && queryInput.value || '').trim().toLowerCase();
            var type = typeInput && typeInput.value || '';
            var year = yearInput && yearInput.value || '';
            var genre = genreInput && genreInput.value || '';
            var filtered = window.SEARCH_MOVIES.filter(function (movie) {
                var text = [movie.title, movie.year, movie.type, movie.genre, movie.region, movie.oneLine, movie.tags.join(' ')].join(' ').toLowerCase();
                return (!q || text.indexOf(q) !== -1) &&
                    (!type || movie.type === type) &&
                    (!year || movie.year === year) &&
                    (!genre || movie.genre.indexOf(genre) !== -1 || movie.tags.indexOf(genre) !== -1);
            }).slice(0, 120);

            searchResults.innerHTML = filtered.map(card).join('');

            if (searchStatus) {
                searchStatus.textContent = q || type || year || genre ? '筛选结果：' + filtered.length + ' 部' : '';
            }
        }

        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            runSearch();
        });

        Array.prototype.slice.call(searchForm.querySelectorAll('input, select')).forEach(function (field) {
            field.addEventListener('input', runSearch);
            field.addEventListener('change', runSearch);
        });

        if (queryInput && queryInput.value) {
            runSearch();
        }
    }
}());
