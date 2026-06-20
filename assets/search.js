(function () {
    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function card(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
            '<span class="poster-wrap">',
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="hover-play">▶</span>',
            '</span>',
            '<span class="movie-card-body">',
            '<span class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.type) + '</span>',
            '<h3>' + escapeHtml(movie.title) + '</h3>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<span class="tag-row">' + tags + '</span>',
            '</span>',
            '</a>'
        ].join('');
    }

    function run() {
        var data = window.SEARCH_MOVIES || [];
        var params = new URLSearchParams(window.location.search);
        var keyword = (params.get('q') || '').trim().toLowerCase();
        var input = document.querySelector('[data-search-page-form] input[name="q"]');
        var results = document.querySelector('[data-search-results]');
        var title = document.querySelector('[data-search-title]');
        var subtitle = document.querySelector('[data-search-subtitle]');
        if (input) {
            input.value = keyword;
        }
        if (!results) {
            return;
        }
        if (!keyword) {
            return;
        }
        var matched = data.filter(function (movie) {
            return movie.text.indexOf(keyword) !== -1;
        }).slice(0, 120);
        if (title) {
            title.textContent = '搜索结果';
        }
        if (subtitle) {
            subtitle.textContent = matched.length ? '已为你匹配相关影片，点击卡片进入详情页。' : '没有找到完全匹配的影片，可以尝试更短的关键词。';
        }
        results.innerHTML = matched.length ? matched.map(card).join('') : '';
    }

    document.addEventListener('DOMContentLoaded', run);
})();
