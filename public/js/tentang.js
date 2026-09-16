fetch(API_BASE + '/api/pengaturan')
    .then(function(res) { return res.json(); })
    .then(function(data) {
        var el = document.getElementById('deskripsi-bappeda');
        if (el) {
            el.textContent = data.deskripsi_bappeda || 'Deskripsi BAPPEDA belum diisi.';
        }

        var iconIG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>';
        var iconFB = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M13 22v-9h3l1-4h-4V6.5c0-1.1.4-2 2-2h2V1h-3c-3 0-5 2-5 5.2V9H6v4h3v9h4z"/></svg>';
        var iconTT = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M15 3c.4 2 2 3.6 4 4v3c-1.5 0-3-.4-4-1.2V15a6 6 0 11-6-6c.3 0 .7 0 1 .1v3.1a3 3 0 103 3V3h2z"/></svg>';
        var iconYT = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="5" width="20" height="14" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 9l6 3-6 3V9z"/></svg>';

        var icons = '';
        if (data.instagram) icons += '<a href="' + data.instagram + '" target="_blank" title="Instagram">' + iconIG + '</a>';
        if (data.facebook) icons += '<a href="' + data.facebook + '" target="_blank" title="Facebook">' + iconFB + '</a>';
        if (data.tiktok) icons += '<a href="' + data.tiktok + '" target="_blank" title="TikTok">' + iconTT + '</a>';
        if (data.youtube) icons += '<a href="' + data.youtube + '" target="_blank" title="YouTube">' + iconYT + '</a>';

        var kontakSocial = document.getElementById('kontak-social');
        if (kontakSocial) {
            kontakSocial.innerHTML = icons || '';
        }
    });