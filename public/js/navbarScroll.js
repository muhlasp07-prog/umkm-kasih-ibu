window.addEventListener('scroll', function() {
    var navbar = document.querySelector('.navbar');
    if (!navbar) return;
    if (window.scrollY > 10) {
        navbar.classList.add('navbar-scrolled');
    } else {
        navbar.classList.remove('navbar-scrolled');
    }
});