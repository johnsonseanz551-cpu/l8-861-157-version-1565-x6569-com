(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      button.setAttribute('aria-expanded', panel.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  function initSearchForms() {
    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
        input.value = input.value.trim();
      });
    });
  }

  function initHero() {
    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var track = hero.querySelector('[data-hero-track]');
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;
      if (!track || slides.length === 0) {
        return;
      }
      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        track.style.transform = 'translateX(-' + index * 100 + '%)';
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
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
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
          start();
        });
      });
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    });
  }

  function initFilters() {
    document.querySelectorAll('[data-filter-input]').forEach(function (input) {
      var target = document.querySelector(input.getAttribute('data-filter-input'));
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll('[data-filter-text]'));
      input.addEventListener('input', function () {
        var value = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = card.getAttribute('data-filter-text').toLowerCase();
          card.style.display = text.indexOf(value) === -1 ? 'none' : '';
        });
      });
    });
  }

  function initSearchPage() {
    var input = document.querySelector('[data-search-page-input]');
    var grid = document.querySelector('[data-search-results]');
    var empty = document.querySelector('[data-search-empty]');
    if (!input || !grid || typeof MOVIE_SEARCH_DATA === 'undefined') {
      return;
    }
    function card(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span class="pill">' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<a class="movie-card" href="' + movie.url + '">' +
        '<div class="poster"><img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '">' +
        '<span class="badge">' + escapeHtml(movie.type || movie.category) + '</span>' +
        '<span class="year-badge">' + escapeHtml(movie.year || '') + '</span>' +
        '<span class="play-icon">▶</span></div>' +
        '<div class="card-body"><h3 class="card-title">' + escapeHtml(movie.title) + '</h3>' +
        '<p class="card-desc">' + escapeHtml(movie.oneLine || '') + '</p>' +
        '<div class="card-meta">' + tags + '</div></div></a>';
    }
    function render() {
      var value = input.value.trim().toLowerCase();
      var matches = MOVIE_SEARCH_DATA.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.oneLine, movie.tags.join(' ')].join(' ').toLowerCase();
        return value && text.indexOf(value) !== -1;
      }).slice(0, 96);
      grid.innerHTML = matches.map(card).join('');
      if (empty) {
        empty.style.display = matches.length ? 'none' : '';
      }
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      input.value = q;
    }
    input.addEventListener('input', render);
    render();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play]');
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute('data-video');
      var started = false;
      var hlsInstance = null;
      function attachAndPlay() {
        if (!source) {
          return;
        }
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        player.classList.add('is-playing');
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
          }, { once: true });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      }
      button.addEventListener('click', attachAndPlay);
      video.addEventListener('click', function () {
        if (!started) {
          attachAndPlay();
        }
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initSearchForms();
    initHero();
    initFilters();
    initSearchPage();
    initPlayers();
  });
})();
