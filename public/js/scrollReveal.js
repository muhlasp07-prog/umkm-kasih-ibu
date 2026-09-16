var revealObserver;

function initScrollReveal() {
    var elements = document.querySelectorAll('.fade-in:not(.reveal-observed)');
    elements.forEach(function(el) {
        el.classList.add('reveal-observed');
        if (revealObserver) {
            revealObserver.observe(el);
        } else {
            el.classList.add('visible');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    if ('IntersectionObserver' in window) {
        revealObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    }

    initScrollReveal();

    var mo = new MutationObserver(function() { initScrollReveal(); });
    mo.observe(document.body, { childList: true, subtree: true });
});