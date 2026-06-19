(function () {
    var video = document.querySelector('[data-video]');
    var button = document.querySelector('[data-play]');
    var shell = document.querySelector('.video-shell');

    if (!video || !button || !shell) {
        return;
    }

    var src = video.getAttribute('data-video-src');
    var attached = false;

    function loadLibrary(callback) {
        if (window.Hls) {
            callback();
            return;
        }

        var existing = document.querySelector('script[data-hls-loader]');
        if (existing) {
            existing.addEventListener('load', callback, { once: true });
            return;
        }

        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
        script.setAttribute('data-hls-loader', 'true');
        script.onload = callback;
        document.head.appendChild(script);
    }

    function startVideo() {
        if (!src) {
            return;
        }

        shell.classList.add('is-playing');

        if (attached) {
            video.play();
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            attached = true;
            video.play();
            return;
        }

        loadLibrary(function () {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play();
                });
                attached = true;
            } else {
                video.src = src;
                attached = true;
                video.play();
            }
        });
    }

    button.addEventListener('click', startVideo);
    video.addEventListener('click', function () {
        if (video.paused) {
            startVideo();
        }
    });

    video.addEventListener('play', function () {
        shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
        if (!video.ended) {
            shell.classList.remove('is-playing');
        }
    });
})();
