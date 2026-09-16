function updateActiveNav() {
    var links = document.querySelectorAll('.nav-links a');
    var currentPath = window.location.pathname.split('/').pop() || 'index.html';
    var currentHash = window.location.hash;

    links.forEach(function(link) { link.classList.remove('active'); });

    var matchTanpaHash = null;
    var matchDenganHash = null;

    links.forEach(function(link) {
        var href = link.getAttribute('href');
        if (!href) return;

        var hasHash = href.indexOf('#') !== -1;
        var hrefPath = hasHash ? href.split('#')[0] : href;
        var hrefHash = hasHash ? '#' + href.split('#')[1] : '';

        if (hrefPath !== currentPath) return;

        if (hasHash && hrefHash === currentHash && currentHash !== '') {
            matchDenganHash = link;
        } else if (!hasHash && currentHash === '') {
            matchTanpaHash = link;
        }
    });

    var aktif = matchDenganHash || matchTanpaHash;
    if (aktif) aktif.classList.add('active');
}

document.addEventListener('DOMContentLoaded', function() {
    var toggle = document.getElementById('nav-toggle');
    var links = document.querySelector('.nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', function() {
            links.classList.toggle('nav-links-open');
        });
    }

    var searchInput = document.getElementById('nav-search-input');
    if (searchInput && !window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && searchInput.value.trim()) {
                window.location.href = 'index.html?cari=' + encodeURIComponent(searchInput.value.trim()) + '#produk';
            }
        });
    }

    updateActiveNav();
});

window.addEventListener('hashchange', updateActiveNav);