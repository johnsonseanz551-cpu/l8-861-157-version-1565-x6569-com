(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var menu = document.getElementById('mobile-menu');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      var isOpen = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isOpen));
      menu.hidden = isOpen;
      button.textContent = isOpen ? '☰' : '×';
    });
  }

  function setupHeroCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer;

    if (slides.length <= 1) {
      return;
    }

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
        dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
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

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    var hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }

    show(0);
    start();
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');

    if (!results || !window.MOVIE_INDEX) {
      return;
    }

    var keywordInput = document.querySelector('[data-search-input]');
    var typeSelect = document.querySelector('[data-search-type]');
    var yearSelect = document.querySelector('[data-search-year]');
    var button = document.querySelector('[data-search-button]');
    var summary = document.querySelector('[data-search-summary]');
    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get('q') || '';

    if (keywordInput && initialKeyword) {
      keywordInput.value = initialKeyword;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function card(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '  <a class="movie-card-link" href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">',
        '    <span class="poster-frame">',
        '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '封面" loading="lazy">',
        '      <span class="poster-shade"></span>',
        '      <span class="poster-play">▶</span>',
        '      <span class="poster-badge year-badge">' + escapeHtml(movie.year) + '</span>',
        '      <span class="poster-badge type-badge">' + escapeHtml(movie.type) + '</span>',
        '    </span>',
        '    <span class="movie-card-body">',
        '      <strong>' + escapeHtml(movie.title) + '</strong>',
        '      <em>' + escapeHtml(movie.genre) + '</em>',
        '      <small>' + escapeHtml(movie.oneLine) + '</small>',
        '      <span class="tag-row">' + tags + '</span>',
        '    </span>',
        '  </a>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function runSearch() {
      var keyword = normalize(keywordInput ? keywordInput.value : '');
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var terms = keyword.split(/\s+/).filter(Boolean);
      var filtered = window.MOVIE_INDEX.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.year,
          movie.type,
          movie.region,
          movie.genre,
          movie.oneLine,
          (movie.tags || []).join(' ')
        ].join(' '));
        var matchKeyword = terms.length === 0 || terms.every(function (term) {
          return haystack.indexOf(term) !== -1;
        });
        var matchType = !type || movie.type === type;
        var matchYear = !year || movie.year === year;
        return matchKeyword && matchType && matchYear;
      }).slice(0, 120);

      results.innerHTML = '<div class="movie-grid">' + filtered.map(card).join('') + '</div>';

      if (summary) {
        summary.textContent = '共找到 ' + filtered.length + ' 条结果。最多显示前 120 条，更多影片可通过分类页和站点地图访问。';
      }
    }

    [keywordInput, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', runSearch);
        control.addEventListener('change', runSearch);
      }
    });

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        runSearch();
      });
    }

    runSearch();
  }

  function setupVideoPlayer() {
    var video = document.getElementById('movie-player');
    var overlay = document.querySelector('.player-overlay');
    var status = document.querySelector('.player-status');
    var sourceButtons = Array.prototype.slice.call(document.querySelectorAll('.source-button'));
    var hlsInstance = null;

    if (!video) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function destroyHls() {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
      hlsInstance = null;
    }

    function loadSource(sourceUrl, shouldPlay) {
      if (!sourceUrl) {
        setStatus('当前播放源为空，请切换其他线路。');
        return;
      }

      destroyHls();
      video.removeAttribute('src');
      video.load();
      setStatus('正在加载播放源...');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已就绪，可高清播放。');
          if (shouldPlay) {
            video.play().catch(function () {
              setStatus('播放源已就绪，请再次点击播放按钮。');
            });
          }
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('当前线路加载失败，请切换备用线路。');
            destroyHls();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        video.addEventListener('loadedmetadata', function onLoaded() {
          video.removeEventListener('loadedmetadata', onLoaded);
          setStatus('播放源已就绪，可高清播放。');
          if (shouldPlay) {
            video.play().catch(function () {
              setStatus('播放源已就绪，请再次点击播放按钮。');
            });
          }
        });
      } else {
        setStatus('当前浏览器不支持在线播放，请使用新版 Chrome、Edge 或 Safari。');
      }
    }

    function startPlayback() {
      var sourceUrl = video.getAttribute('data-video');
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      loadSource(sourceUrl, true);
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (!video.currentSrc) {
        startPlayback();
      }
    });

    sourceButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        sourceButtons.forEach(function (item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        video.setAttribute('data-video', button.getAttribute('data-video'));
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        loadSource(button.getAttribute('data-video'), true);
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupSearchPage();
    setupVideoPlayer();
  });
}());
