function initializeMoviePlayer(videoId, buttonId, source) {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);
    let attached = false;
    let hlsInstance = null;

    if (!video || !button || !source) {
        return;
    }

    function attachSource() {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function() {
                const promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function() {});
                }
            });
            return;
        }

        video.src = source;
    }

    function startPlayback() {
        attachSource();
        button.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        const promise = video.play();
        if (promise && promise.catch) {
            promise.catch(function() {});
        }
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('click', function() {
        if (video.paused) {
            startPlayback();
        }
    });
    video.addEventListener('play', function() {
        button.classList.add('is-hidden');
    });
    window.addEventListener('beforeunload', function() {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
