var heroCurrentSlide = 0;
var heroSlides = [];
var heroAutoTimer = null;

function tampilkanHeroSlide(index) {
    heroSlides[heroCurrentSlide].classList.remove('active');
    heroCurrentSlide = (index + heroSlides.length) % heroSlides.length;
    heroSlides[heroCurrentSlide].classList.add('active');
}

window.geserHeroSlide = function(arah) {
    tampilkanHeroSlide(heroCurrentSlide + arah);
    resetHeroAutoTimer();
};

function resetHeroAutoTimer() {
    if (heroAutoTimer) clearInterval(heroAutoTimer);
    heroAutoTimer = setInterval(function() {
        tampilkanHeroSlide(heroCurrentSlide + 1);
    }, 4000);
}

document.addEventListener('DOMContentLoaded', function() {
    heroSlides = document.querySelectorAll('.hero-slide');
    if (heroSlides.length === 0) return;
    resetHeroAutoTimer();
});