(function() {
    const menuButton = document.querySelector('.js-menu-button');
    const mobileNav = document.querySelector('.js-mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function() {
            mobileNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('.js-site-search-form').forEach(function(form) {
        form.addEventListener('submit', function(event) {
            const input = form.querySelector('input[name="q"]');
            if (!input) {
                return;
            }
            const value = input.value.trim();
            if (!value) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });

    const hero = document.querySelector('.js-hero');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('.hero-dot'));
        let activeIndex = 0;
        let timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === activeIndex);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === activeIndex);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function() {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                const index = Number(dot.getAttribute('data-slide'));
                showSlide(index);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    const filterInputs = document.querySelectorAll('.js-card-search');
    filterInputs.forEach(function(input) {
        const params = new URLSearchParams(window.location.search);
        const initialValue = params.get('q');
        if (input.classList.contains('js-search-page-input') && initialValue) {
            input.value = initialValue;
        }

        const cards = Array.from(document.querySelectorAll('[data-filter-card]'));
        const filterCards = function() {
            const query = input.value.trim().toLowerCase();
            cards.forEach(function(card) {
                const haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();
                card.classList.toggle('is-hidden', query.length > 0 && haystack.indexOf(query) === -1);
            });
        };

        input.addEventListener('input', filterCards);
        filterCards();
    });
})();
