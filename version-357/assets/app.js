(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('.js-hero').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5000);
    }
  });

  document.querySelectorAll('.js-site-search').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (input && input.value.trim()) {
        form.action = './search.html?q=' + encodeURIComponent(input.value.trim());
      }
    });
  });

  var filterInput = document.querySelector('.js-filter-input');
  var yearFilter = document.querySelector('.js-year-filter');
  var typeFilter = document.querySelector('.js-type-filter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.js-filter-card'));

  function applyFilter() {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';
    var type = typeFilter ? typeFilter.value : '';

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-tags') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-type') || ''
      ].join(' ').toLowerCase();
      var yearOk = !year || card.getAttribute('data-year') === year;
      var typeOk = !type || card.getAttribute('data-type') === type;
      var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
      card.classList.toggle('is-hidden', !(yearOk && typeOk && keywordOk));
    });
  }

  if (filterInput || yearFilter || typeFilter) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (filterInput && initialQuery) {
      filterInput.value = initialQuery;
    }

    [filterInput, yearFilter, typeFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }

  document.querySelectorAll('.js-player').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.player-overlay');
    var message = player.querySelector('.player-message');
    var hlsInstance = null;
    var source = video ? video.getAttribute('data-hls') : '';

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function playVideo() {
      if (!video || !source) {
        setMessage('播放暂不可用');
        return;
      }

      player.classList.add('is-playing');
      setMessage('');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.getAttribute('src')) {
          video.setAttribute('src', source);
        }
        video.play().catch(function () {
          player.classList.remove('is-playing');
          setMessage('点击视频区域继续播放');
        });
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30,
            capLevelToPlayerSize: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              player.classList.remove('is-playing');
              setMessage('点击视频区域继续播放');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              player.classList.remove('is-playing');
              setMessage('播放暂不可用');
            }
          });
        } else {
          video.play().catch(function () {
            player.classList.remove('is-playing');
            setMessage('点击视频区域继续播放');
          });
        }
        return;
      }

      video.setAttribute('src', source);
      video.play().catch(function () {
        player.classList.remove('is-playing');
        setMessage('播放暂不可用');
      });
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          player.classList.remove('is-playing');
        }
      });
    }
  });
})();
