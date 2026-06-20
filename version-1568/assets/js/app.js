(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalizeText(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }

        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        function activate(index) {
            current = index % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("active", itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("active", itemIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                activate(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                activate(current + 1);
            }, 5000);
        }
    }

    function setMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setSearchForms() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-global-search]"));
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = "./search.html";
                }
            });
        });
    }

    function setListFilter() {
        var input = document.querySelector("[data-list-filter]");
        var list = document.querySelector(".searchable-list");
        if (!input || !list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-search]"));
        var empty = document.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        if (query) {
            input.value = query;
        }

        function applyFilter() {
            var value = normalizeText(input.value);
            var visibleCount = 0;
            cards.forEach(function (card) {
                var text = normalizeText(card.getAttribute("data-search"));
                var matched = !value || text.indexOf(value) !== -1;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visibleCount += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("visible", visibleCount === 0);
            }
        }

        input.addEventListener("input", applyFilter);
        applyFilter();
    }

    function createPlayer(video, streamUrl) {
        if (video.getAttribute("data-ready") === "true") {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            video.hls = hls;
        } else {
            video.src = streamUrl;
        }

        video.setAttribute("data-ready", "true");
    }

    window.setupMoviePlayer = function (videoId, streamUrl) {
        ready(function () {
            var video = document.getElementById(videoId);
            var overlay = document.querySelector("[data-play-for='" + videoId + "']");
            if (!video) {
                return;
            }

            function start() {
                createPlayer(video, streamUrl);
                if (overlay) {
                    overlay.classList.add("hidden");
                }
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener("click", start);
            }

            video.addEventListener("click", function () {
                if (video.paused || video.getAttribute("data-ready") !== "true") {
                    start();
                }
            });
        });
    };

    ready(function () {
        setHero();
        setMobileMenu();
        setSearchForms();
        setListFilter();
    });
})();
