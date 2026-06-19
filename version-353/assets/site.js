(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalise(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMobileMenu() {
        var button = document.querySelector(".mobile-menu-button");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var open = panel.classList.toggle("open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, pos) {
                slide.classList.toggle("active", pos === index);
            });
            dots.forEach(function (dot, pos) {
                dot.classList.toggle("active", pos === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, pos) {
            dot.addEventListener("click", function () {
                show(pos);
                restart();
            });
        });
        carousel.addEventListener("mouseenter", function () {
            if (timer) {
                window.clearInterval(timer);
            }
        });
        carousel.addEventListener("mouseleave", restart);
        show(0);
        restart();
    }

    function getQueryValue(name) {
        try {
            return new URLSearchParams(window.location.search).get(name) || "";
        } catch (error) {
            return "";
        }
    }

    function initSearchAreas() {
        var areas = Array.prototype.slice.call(document.querySelectorAll("[data-search-area]"));
        areas.forEach(function (area) {
            var input = area.querySelector("[data-search-input]");
            var cards = Array.prototype.slice.call(area.querySelectorAll(".movie-card, .ranking-card, .rank-item"));
            var empty = area.querySelector("[data-empty-state]");
            var clear = area.querySelector("[data-clear-search]");
            var filters = Array.prototype.slice.call(area.querySelectorAll("[data-filter-value]"));
            var activeFilter = "";

            function apply() {
                var term = normalise(input ? input.value : "");
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalise([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags"),
                        card.textContent
                    ].join(" "));
                    var matchesText = !term || haystack.indexOf(term) !== -1;
                    var matchesFilter = !activeFilter || haystack.indexOf(normalise(activeFilter)) !== -1;
                    var show = matchesText && matchesFilter;
                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("visible", visible === 0);
                }
            }

            if (input) {
                var query = getQueryValue("q");
                if (query) {
                    input.value = query;
                }
                input.addEventListener("input", apply);
            }
            if (clear) {
                clear.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    activeFilter = "";
                    filters.forEach(function (button) {
                        button.classList.toggle("active", button.getAttribute("data-filter-value") === "");
                    });
                    apply();
                });
            }
            filters.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeFilter = button.getAttribute("data-filter-value") || "";
                    filters.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    window.setupMoviePlayer = function (source) {
        var video = document.getElementById("movie-player");
        var overlay = document.getElementById("player-overlay");
        var message = document.getElementById("player-message");
        if (!video || !overlay || !source) {
            return;
        }
        var started = false;
        var hlsInstance = null;

        function showMessage(text) {
            if (!message) {
                return;
            }
            message.textContent = text;
            message.classList.add("visible");
        }

        function bindSource() {
            if (started) {
                return true;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                started = true;
                return true;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showMessage("播放暂时不可用，请稍后再试");
                    }
                });
                started = true;
                return true;
            }
            showMessage("播放暂时不可用，请稍后再试");
            return false;
        }

        function playVideo() {
            if (!bindSource()) {
                return;
            }
            overlay.classList.add("is-hidden");
            video.setAttribute("controls", "controls");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        overlay.addEventListener("click", playVideo);
        video.addEventListener("click", function () {
            if (!started || video.paused) {
                playVideo();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        initMobileMenu();
        initHero();
        initSearchAreas();
    });
})();
