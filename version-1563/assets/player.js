(function () {
    document.querySelectorAll('[data-player]').forEach(function (root) {
        var video = root.querySelector('video');
        var cover = root.querySelector('.player-cover');
        var button = root.querySelector('.player-cover');
        var stream = video ? video.getAttribute('data-stream') : '';
        var attached = false;
        var hls = null;

        function attach() {
            if (!video || !stream || attached) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls();
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }

            attached = true;
        }

        function start() {
            attach();

            if (cover) {
                cover.classList.add('is-hidden');
            }

            if (video) {
                video.setAttribute('controls', 'controls');
                var playTask = video.play();

                if (playTask && typeof playTask.catch === 'function') {
                    playTask.catch(function () {});
                }
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!attached) {
                    start();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });
})();
