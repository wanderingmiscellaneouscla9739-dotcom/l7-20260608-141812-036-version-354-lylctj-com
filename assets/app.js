const MovieSite = (() => {
  const ready = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  };

  const initNav = () => {
    const button = document.querySelector("[data-nav-toggle]");
    const menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", () => {
      menu.classList.toggle("is-open");
    });
  };

  const initHero = () => {
    const root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    const slides = Array.from(root.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(root.querySelectorAll("[data-hero-dot]"));
    const next = root.querySelector("[data-hero-next]");
    const prev = root.querySelector("[data-hero-prev]");
    let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));

    const show = (target) => {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    if (next) {
      next.addEventListener("click", () => show(index + 1));
    }
    if (prev) {
      prev.addEventListener("click", () => show(index - 1));
    }
    dots.forEach((dot) => {
      dot.addEventListener("click", () => show(Number(dot.dataset.heroDot || 0)));
    });
    window.setInterval(() => show(index + 1), 5200);
  };

  const initFilters = () => {
    const forms = Array.from(document.querySelectorAll("[data-filter-form]"));
    forms.forEach((form) => {
      const scope = form.parentElement.querySelector("[data-filter-scope]");
      const cards = scope ? Array.from(scope.querySelectorAll("[data-movie-card]")) : [];
      const empty = form.parentElement.querySelector("[data-empty-state]");
      const input = form.querySelector("[data-filter-input]");
      const type = form.querySelector("[data-filter-type]");
      const year = form.querySelector("[data-filter-year]");
      const category = form.querySelector("[data-filter-category]");

      const apply = () => {
        const query = (input && input.value ? input.value : "").trim().toLowerCase();
        const typeValue = type && type.value ? type.value : "";
        const yearValue = year && year.value ? year.value : "";
        const categoryValue = category && category.value ? category.value : "";
        let shown = 0;

        cards.forEach((card) => {
          const search = (card.dataset.search || "").toLowerCase();
          const cardType = card.dataset.type || "";
          const cardYear = Number(card.dataset.year || 0);
          const cardCategory = card.dataset.category || "";
          const matchQuery = !query || search.includes(query);
          const matchType = !typeValue || cardType.includes(typeValue);
          const matchCategory = !categoryValue || cardCategory === categoryValue;
          const matchYear = !yearValue || (yearValue === "older" ? cardYear <= 2022 : cardYear === Number(yearValue));
          const visible = matchQuery && matchType && matchYear && matchCategory;
          card.hidden = !visible;
          if (visible) {
            shown += 1;
          }
        });

        if (empty) {
          empty.hidden = shown !== 0;
        }
      };

      [input, type, year, category].forEach((control) => {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q && input) {
        input.value = q;
      }
      apply();
    });
  };

  const mountPlayer = (videoUrl) => {
    ready(() => {
      const video = document.querySelector("[data-player]");
      const overlay = document.querySelector("[data-play-overlay]");
      if (!video || !videoUrl) {
        return;
      }

      let mounted = false;

      const attach = () => {
        if (mounted) {
          return;
        }
        mounted = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(videoUrl);
          hls.attachMedia(video);
          video._hls = hls;
        } else {
          video.src = videoUrl;
        }
      };

      const start = () => {
        attach();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        const attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(() => {});
        }
      };

      if (overlay) {
        overlay.addEventListener("click", start);
      }
      video.addEventListener("click", () => {
        if (video.paused) {
          start();
        }
      });
    });
  };

  ready(() => {
    initNav();
    initHero();
    initFilters();
  });

  return {
    mountPlayer
  };
})();
