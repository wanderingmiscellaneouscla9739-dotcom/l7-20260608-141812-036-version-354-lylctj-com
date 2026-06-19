(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      document.body.classList.toggle("is-menu-open", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupLocalFilter() {
    var scope = document.querySelector("[data-filter-scope]");
    var grid = document.querySelector("[data-card-grid]");
    if (!scope || !grid) {
      return;
    }
    var input = scope.querySelector("[data-local-search]");
    var type = scope.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var typeValue = type ? type.value : "";
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var typeMatch = !typeValue || card.getAttribute("data-type") === typeValue;
        var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        card.style.display = typeMatch && keywordMatch ? "" : "none";
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (type) {
      type.addEventListener("change", apply);
    }
  }

  function createResultCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "" +
      "<article class=\"movie-card\">" +
      "<a class=\"poster-link\" href=\"./" + movie.file + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">" +
      "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-type\">" + escapeHtml(movie.type) + "</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<div class=\"movie-meta-line\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span></div>" +
      "<h3><a href=\"./" + movie.file + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var results = document.getElementById("searchResults");
    var input = document.getElementById("searchInput");
    var summary = document.getElementById("searchSummary");
    if (!results || !input || !summary || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get("q") || "";
    input.value = keyword;

    function render(value) {
      var q = value.trim().toLowerCase();
      if (!q) {
        results.innerHTML = "<div class=\"empty-state\">输入关键词后显示相关影片。</div>";
        summary.textContent = "输入关键词后显示相关影片。";
        return;
      }
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .indexOf(q) !== -1;
      }).slice(0, 120);
      if (!matched.length) {
        results.innerHTML = "<div class=\"empty-state\">未找到相关内容，可以尝试更短的关键词。</div>";
        summary.textContent = "未找到相关内容。";
        return;
      }
      results.innerHTML = matched.map(createResultCard).join("");
      summary.textContent = "已匹配相关影片，点击卡片进入详情页。";
    }

    render(keyword);
    input.addEventListener("input", function () {
      render(input.value);
    });
  }

  window.initMoviePlayer = function (url) {
    ready(function () {
      var video = document.getElementById("moviePlayer");
      var cover = document.getElementById("playerCover");
      if (!video || !cover || !url) {
        return;
      }
      var attached = false;
      var hlsInstance = null;

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        } else {
          video.src = url;
        }
      }

      function play() {
        attach();
        cover.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      cover.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!attached) {
          play();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupLocalFilter();
    setupSearchPage();
  });
})();
