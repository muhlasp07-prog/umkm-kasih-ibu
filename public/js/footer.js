function renderFooterSocial() {
    var container = document.getElementById('footer-social-icons');
    var alamatEl = document.getElementById('footer-alamat');
    if (!container && !alamatEl) return;

    fetch(API_BASE + '/api/pengaturan')
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (alamatEl) {
                alamatEl.textContent = data.alamat || 'Alamat belum diisi';
            }

            if (container) {
                var iconIG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>';
                var iconFB = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M13 22v-9h3l1-4h-4V6.5c0-1.1.4-2 2-2h2V1h-3c-3 0-5 2-5 5.2V9H6v4h3v9h4z"/></svg>';
                var iconWA = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.5 15.2L2 22l4.9-1.5A10 10 0 1012 2zm0 2a8 8 0 11-4.2 14.8l-.3-.2-2.9.9.9-2.8-.2-.3A8 8 0 0112 4z"/></svg>';

                var icons = '';
                if (data.whatsapp) icons += '<a href="https://wa.me/' + data.whatsapp + '" target="_blank" title="WhatsApp">' + iconWA + '</a>';
                if (data.instagram) icons += '<a href="' + data.instagram + '" target="_blank" title="Instagram">' + iconIG + '</a>';
                if (data.facebook) icons += '<a href="' + data.facebook + '" target="_blank" title="Facebook">' + iconFB + '</a>';

                container.innerHTML = icons || '<span class="footer-social-empty">Segera hadir</span>';
            }
        });
}

document.addEventListener('DOMContentLoaded', renderFooterSocial);