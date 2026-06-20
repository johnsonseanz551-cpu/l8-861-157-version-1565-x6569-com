(function () {
    window.initPlayer = function (streamUrl) {
        var video = document.querySelector('.movie-player-video');
        var overlay = document.querySelector('.player-overlay');
        var loaded = false;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function attach() {
            if (loaded) {
                return;
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            attach();
            video.controls = true;

            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            var action = video.play();

            if (action && action.catch) {
                action.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (!loaded || video.paused) {
                play();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
    };
}());
