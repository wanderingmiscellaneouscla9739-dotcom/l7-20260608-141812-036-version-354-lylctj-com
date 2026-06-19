(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-menu]');

    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function setHero(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            setHero(dotIndex);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            setHero(activeIndex + 1);
        }, 5200);
    }

    var queryInput = document.querySelector('[data-query-input]');
    if (queryInput) {
        var params = new URLSearchParams(window.location.search);
        var keyword = params.get('q') || '';
        queryInput.value = keyword;
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));

    filterInputs.forEach(function (input) {
        var items = Array.prototype.slice.call(document.querySelectorAll('[data-search-item]'));
        var emptyState = document.querySelector('[data-empty-state]');

        function applyFilter() {
            var value = input.value.trim().toLowerCase();
            var visible = 0;

            items.forEach(function (item) {
                var text = (item.getAttribute('data-title') + ' ' + item.getAttribute('data-meta')).toLowerCase();
                var match = !value || text.indexOf(value) !== -1;
                item.style.display = match ? '' : 'none';
                if (match) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        input.addEventListener('input', applyFilter);
        applyFilter();
    });
})();
