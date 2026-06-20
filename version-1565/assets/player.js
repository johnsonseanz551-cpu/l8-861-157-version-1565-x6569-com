(function () {
    window.initPlayer = function (videoId, buttonId, videoUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var ready = false;
        var hls = null;
        if (!video || !button || !videoUrl) {
            return;
        }

        function attach() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(videoUrl);
                hls.attachMedia(video);
                return;
            }
            video.src = videoUrl;
        }

        function play() {
            attach();
            button.classList.add('is-hidden');
            var action = video.play();
            if (action && typeof action.catch === 'function') {
                action.catch(function () {});
            }
        }

        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (!ready || video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        video.addEventListener('ended', function () {
            button.classList.remove('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
