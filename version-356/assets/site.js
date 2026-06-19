(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector(".menu-toggle");
        var mobileNav = document.getElementById("mobile-nav");
        if (!toggle || !mobileNav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = mobileNav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var picks = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-pick]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function setActive(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === index);
            });
            picks.forEach(function (pick, itemIndex) {
                pick.classList.toggle("is-active", itemIndex === index);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                setActive(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                setActive(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });
        picks.forEach(function (pick) {
            pick.addEventListener("mouseenter", function () {
                setActive(Number(pick.getAttribute("data-hero-pick")) || 0);
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                setActive(index - 1);
                startTimer();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                setActive(index + 1);
                startTimer();
            });
        }
        setActive(0);
        startTimer();
    }

    function setupListFilter() {
        var scope = document.querySelector("[data-filter-list]");
        if (!scope) {
            return;
        }
        var keyword = scope.querySelector("[data-filter-keyword]");
        var region = scope.querySelector("[data-filter-region]");
        var year = scope.querySelector("[data-filter-year]");
        var type = scope.querySelector("[data-filter-type]");
        var count = scope.querySelector("[data-filter-count]");
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

        function apply() {
            var keywordValue = keyword ? keyword.value.trim().toLowerCase() : "";
            var regionValue = region ? region.value : "";
            var yearValue = year ? year.value : "";
            var typeValue = type ? type.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var searchText = (card.getAttribute("data-search") || "").toLowerCase();
                var matched = true;
                if (keywordValue && searchText.indexOf(keywordValue) === -1) {
                    matched = false;
                }
                if (regionValue && card.getAttribute("data-region") !== regionValue) {
                    matched = false;
                }
                if (yearValue && card.getAttribute("data-year") !== yearValue) {
                    matched = false;
                }
                if (typeValue && card.getAttribute("data-type") !== typeValue) {
                    matched = false;
                }
                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = String(visible);
            }
        }

        [keyword, region, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function renderMovie(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a class=\"poster-link\" href=\"" + escapeHtml(movie.detail) + "\" aria-label=\"观看 " + escapeHtml(movie.title) + "\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"score-badge\">" + escapeHtml(movie.score) + "</span>" +
            "<span class=\"type-badge\">" + escapeHtml(movie.type) + "</span>" +
            "</a>" +
            "<div class=\"movie-card-body\">" +
            "<div class=\"movie-meta-line\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></div>" +
            "<h3><a href=\"" + escapeHtml(movie.detail) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"tag-row\"><a href=\"" + escapeHtml(movie.categoryLink) + "\">" + escapeHtml(movie.category) + "</a>" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function setupSearchPage() {
        var page = document.querySelector("[data-search-page]");
        if (!page || !window.MOVIE_INDEX) {
            return;
        }
        var input = page.querySelector("[data-search-input]");
        var form = page.querySelector("[data-search-form]");
        var results = page.querySelector("[data-search-results]");
        var title = page.querySelector("[data-search-title]");
        var count = page.querySelector("[data-search-count]");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (input) {
            input.value = initial;
        }

        function search(value) {
            var query = String(value || "").trim().toLowerCase();
            var pool = window.MOVIE_INDEX;
            var matched = query ? pool.filter(function (movie) {
                return movie.search.indexOf(query) !== -1;
            }) : pool.slice(0, 48);
            if (title) {
                title.textContent = query ? "“" + value + "” 的搜索结果" : "热门推荐";
            }
            if (count) {
                count.textContent = "共 " + matched.length + " 部";
            }
            if (results) {
                results.innerHTML = matched.slice(0, 120).map(renderMovie).join("");
            }
        }

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var value = input ? input.value.trim() : "";
                var url = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
                window.history.replaceState(null, "", url);
                search(value);
            });
        }
        if (input) {
            input.addEventListener("input", function () {
                search(input.value);
            });
        }
        search(initial);
    }

    function initMoviePlayer(url) {
        ready(function () {
            var video = document.getElementById("movie-player");
            var button = document.getElementById("player-play");
            var shell = document.querySelector(".player-shell");
            var hls = null;
            var prepared = false;

            if (!video || !button || !url) {
                return;
            }

            function prepare() {
                if (prepared) {
                    return;
                }
                prepared = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    return;
                }
                video.src = url;
            }

            function start() {
                prepare();
                if (shell) {
                    shell.classList.add("is-playing");
                }
                video.controls = true;
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {
                        if (shell) {
                            shell.classList.remove("is-playing");
                        }
                    });
                }
            }

            button.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupListFilter();
        setupSearchPage();
    });

    window.MovieSite = {
        initMoviePlayer: initMoviePlayer
    };
})();
