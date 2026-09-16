fetch(API_BASE + '/api/pengaturan')
    .then(function(res) { return res.json(); })
    .then(function(data) {
        document.getElementById('sejarah-usaha').textContent = data.sejarah_usaha || 'Belum diisi.';
        document.getElementById('visi-usaha').textContent = data.visi || 'Belum diisi.';
        document.getElementById('misi-usaha').textContent = data.misi || 'Belum diisi.';
        document.getElementById('nama-pemilik').textContent = data.pemilik_usaha || 'Pemilik UMKM';
        document.getElementById('kontak-alamat').textContent = data.alamat || 'Alamat belum diisi';

        if (data.whatsapp) {
            document.getElementById('kontak-wa-btn').href = 'https://wa.me/' + data.whatsapp;
        }

        var iconIG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>';
        var iconFB = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M13 22v-9h3l1-4h-4V6.5c0-1.1.4-2 2-2h2V1h-3c-3 0-5 2-5 5.2V9H6v4h3v9h4z"/></svg>';

        var icons = '';
        if (data.instagram) icons += '<a href="' + data.instagram + '" target="_blank" title="Instagram">' + iconIG + '</a>';
        if (data.facebook) icons += '<a href="' + data.facebook + '" target="_blank" title="Facebook">' + iconFB + '</a>';

        var kontakSocial = document.getElementById('kontak-social');
        if (kontakSocial) kontakSocial.innerHTML = icons || '';

        var mapsWrap = document.getElementById('maps-wrap');
        if (mapsWrap && data.alamat) {
            var query = encodeURIComponent(data.alamat + ', Kabupaten Bima');
            mapsWrap.innerHTML =
                '<iframe src="https://www.google.com/maps?q=' + query + '&output=embed" ' +
                'width="100%" height="260" style="border:0; border-radius:14px; margin-top:16px;" ' +
                'allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>';
        }
    });