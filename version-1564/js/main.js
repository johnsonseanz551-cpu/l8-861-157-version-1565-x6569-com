(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = selectAll(".hero-slide", slider);
        var dots = selectAll(".hero-dot", slider);
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        function activate(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                activate(index);
            });
        });
        setInterval(function () {
            activate(current + 1);
        }, 5200);
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        if (!panel) {
            return;
        }
        var keyword = panel.querySelector("[data-card-search]");
        var type = panel.querySelector("[data-type-filter]");
        var year = panel.querySelector("[data-year-filter]");
        var cards = selectAll("[data-movie-card]");
        var empty = document.querySelector("[data-empty-state]");
        function apply() {
            var q = keyword ? keyword.value.trim().toLowerCase() : "";
            var t = type ? type.value : "";
            var y = year ? year.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var text = [card.dataset.title, card.dataset.genre, card.dataset.region].join(" ").toLowerCase();
                var matchKeyword = !q || text.indexOf(q) !== -1;
                var matchType = !t || card.dataset.type === t;
                var matchYear = !y || card.dataset.year === y;
                var show = matchKeyword && matchType && matchYear;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        [keyword, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    function setupSearchPage() {
        var resultBox = document.querySelector("[data-search-results]");
        if (!resultBox || !window.SEARCH_ITEMS) {
            return;
        }
        var input = document.querySelector("[data-search-input]");
        var count = document.querySelector("[data-search-count]");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (input) {
            input.value = initial;
        }
        function render(items) {
            resultBox.innerHTML = items.map(function (item) {
                var tags = (item.tags || []).slice(0, 3).map(function (tag) {
                    return "<span>#" + escapeHtml(tag) + "</span>";
                }).join("");
                return "<article class=\"movie-card\">" +
                    "<a href=\"" + escapeHtml(item.url) + "\">" +
                    "<div class=\"card-cover\">" +
                    "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
                    "<span class=\"card-type\">" + escapeHtml(item.type) + "</span>" +
                    "<span class=\"card-year\">" + escapeHtml(item.year) + "</span>" +
                    "<div class=\"play-hover\"><span>▶</span></div>" +
                    "</div>" +
                    "<div class=\"card-body\">" +
                    "<h3>" + escapeHtml(item.title) + "</h3>" +
                    "<p>" + escapeHtml(item.oneLine) + "</p>" +
                    "<div class=\"card-meta\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.genre) + "</span></div>" +
                    "<div class=\"card-tags\">" + tags + "</div>" +
                    "</div>" +
                    "</a>" +
                    "</article>";
            }).join("");
            selectAll("img", resultBox).forEach(watchImage);
        }
        function search() {
            var query = input ? input.value.trim().toLowerCase() : initial.trim().toLowerCase();
            if (!query) {
                render(window.SEARCH_ITEMS.slice(0, 48));
                if (count) {
                    count.textContent = "热门影片推荐";
                }
                return;
            }
            var words = query.split(/\s+/).filter(Boolean);
            var results = window.SEARCH_ITEMS.filter(function (item) {
                var text = [item.title, item.oneLine, item.region, item.type, item.genre, (item.tags || []).join(" ")].join(" ").toLowerCase();
                return words.every(function (word) {
                    return text.indexOf(word) !== -1;
                });
            });
            render(results);
            if (count) {
                count.textContent = results.length ? "相关影片 " + results.length + " 部" : "没有匹配到影片";
            }
        }
        if (input) {
            input.addEventListener("input", search);
        }
        search();
    }

    function watchImage(img) {
        if (!img) {
            return;
        }
        img.addEventListener("error", function () {
            img.classList.add("image-missing");
        }, { once: true });
    }

    function setupImages() {
        selectAll("img").forEach(watchImage);
    }

    function setupBackTop() {
        selectAll("[data-back-top]").forEach(function (button) {
            button.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
        setupImages();
        setupBackTop();
    });
})();
