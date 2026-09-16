var API_PRODUK = API_BASE + '/api/produk';
var API_PRODUK_FOTO = API_BASE + '/api/produk-foto';
var WA_NOMOR = '6285333955993';

function getIdFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function formatRupiah(angka) {
    if (!angka) return null;
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
}

function labelKategori(kategori) {
    var map = { kerajinan: 'Kerajinan Tangan', kuliner: 'Kuliner', lainnya: 'Lainnya' };
    return map[kategori] || kategori;
}

function parseBarisJadiList(teks) {
    if (!teks) return [];
    return teks.split('\n').map(function(b) { return b.trim(); }).filter(function(b) { return b.length > 0; });
}

function parseSpesifikasi(teks) {
    return parseBarisJadiList(teks).map(function(baris) {
        var idx = baris.indexOf(':');
        if (idx === -1) return { label: baris, isi: '' };
        return { label: baris.substring(0, idx).trim(), isi: baris.substring(idx + 1).trim() };
    });
}

function getWishlist() {
    try {
        return JSON.parse(localStorage.getItem('wishlist_kasihibu')) || [];
    } catch (e) { return []; }
}

function toggleWishlist(id) {
    var list = getWishlist();
    var idx = list.indexOf(id);
    if (idx === -1) { list.push(id); } else { list.splice(idx, 1); }
    localStorage.setItem('wishlist_kasihibu', JSON.stringify(list));
    return list.indexOf(id) !== -1;
}

function isWishlisted(id) {
    return getWishlist().indexOf(id) !== -1;
}

var produkId = getIdFromUrl();
var fotoList = [];
var fotoIndex = 0;

if (!produkId) {
    document.getElementById('produk-detail-content').innerHTML = '<div class="empty">Produk tidak ditemukan</div>';
} else {
    Promise.all([
        fetch(API_PRODUK + '/' + produkId).then(function(r) { return r.json(); }),
        fetch(API_PRODUK_FOTO + '/' + produkId).then(function(r) { return r.json(); }),
        fetch(API_PRODUK).then(function(r) { return r.json(); })
    ]).then(function(hasil) {
        var produk = hasil[0];
        var fotos = hasil[1];
        var semuaProduk = hasil[2];
        renderBreadcrumb(produk);
        renderDetail(produk, fotos);
        renderProdukLainnya(semuaProduk, produk.id);
    }).catch(function(err) {
        document.getElementById('produk-detail-content').innerHTML = '<div class="empty">Gagal memuat produk</div>';
    });
}

function renderBreadcrumb(produk) {
    document.getElementById('breadcrumb').innerHTML =
        '<a href="index.html">Beranda</a><span class="breadcrumb-sep">&rsaquo;</span>' +
        '<a href="index.html#produk">Produk UMKM</a><span class="breadcrumb-sep">&rsaquo;</span>' +
        '<span class="breadcrumb-current">' + produk.nama + '</span>';
}

function buatHargaHtml(harga, hargaCoret) {
    if (formatRupiah(hargaCoret) && hargaCoret > harga) {
        var diskonPersen = Math.round((1 - harga / hargaCoret) * 100);
        return '<div class="harga-row"><span class="harga-coret">' + formatRupiah(hargaCoret) + '</span>' +
            '<span class="harga-diskon-badge">-' + diskonPersen + '%</span></div>' +
            '<div class="pd-harga" id="pd-harga-tampil">' + formatRupiah(harga) + '</div>';
    } else if (formatRupiah(harga)) {
        return '<div class="pd-harga" id="pd-harga-tampil">' + formatRupiah(harga) + '</div>';
    }
    return '<div class="pd-harga pd-harga-tanya" id="pd-harga-tampil">Hubungi kami untuk info harga</div>';
}

function renderDetail(produk, fotos) {
    document.getElementById('page-title').textContent = produk.nama + ' - UMKM Kasih Ibu';
    var desk = produk.deskripsi ? produk.deskripsi.substring(0, 150) : 'Produk berkualitas dari UMKM Kasih Ibu, Kabupaten Bima';
    document.getElementById('page-description').setAttribute('content', desk);
    document.getElementById('og-title').setAttribute('content', produk.nama + ' - UMKM Kasih Ibu');
    document.getElementById('og-description').setAttribute('content', desk);

    fotoList = fotos;
    fotoIndex = 0;

    var thumbsHtml = '';
    if (fotos.length > 0) {
        fotos.forEach(function(f, i) {
            thumbsHtml += '<div class="pd-thumb' + (i === 0 ? ' active' : '') + '" data-index="' + i + '"><img src="' + API_BASE + '/' + f.path_foto + '"></div>';
        });
    }

    var fotoUtamaHtml = fotos.length > 0
        ? '<img src="' + API_BASE + '/' + fotos[0].path_foto + '" id="pd-main-img">'
        : '<div class="produk-foto-kosong" style="height:100%;">Belum ada foto</div>';

    var hargaHtml = buatHargaHtml(produk.harga, produk.harga_coret);

    var keunggulanList = parseBarisJadiList(produk.keunggulan);
    var keunggulanChipsHtml = keunggulanList.slice(0, 4).map(function(k) {
        return '<span class="pd-chip">' + iconCentang() + ' ' + k + '</span>';
    }).join('');

    var wishlisted = isWishlisted(produk.id);
    var variasiHtml = '';
    var adaVarian = fotos.some(function(f) { return f.nama_varian; });
    if (adaVarian) {
        variasiHtml = '<div class="pd-varian-wrap"><span class="pd-varian-label">Pilih Varian:</span><div class="pd-varian-list">';
        fotos.forEach(function(f, i) {
            if (f.nama_varian) {
                variasiHtml += '<button class="pd-varian-btn' + (i === 0 ? ' active' : '') + '" data-index="' + i + '">' + f.nama_varian + '</button>';
            }
        });
        variasiHtml += '</div></div>';
    }

    document.getElementById('produk-detail-content').innerHTML =
        '<div class="pd-grid">' +
            '<div class="pd-gallery">' +
                '<div class="pd-thumbs">' + thumbsHtml + '</div>' +
                '<div class="pd-main-photo">' +
                    fotoUtamaHtml +
                    '<button class="pd-wishlist-btn' + (wishlisted ? ' active' : '') + '" id="pd-wishlist-btn">' + iconHati() + '</button>' +
                    (fotos.length > 1 ? '<button class="pd-nav pd-nav-prev" id="pd-prev">&#8249;</button><button class="pd-nav pd-nav-next" id="pd-next">&#8250;</button>' : '') +
                '</div>' +
            '</div>' +
            '<div class="pd-info">' +
                '<span class="produk-kategori-badge pd-badge-kategori">' + labelKategori(produk.kategori) + '</span>' +
                '<h1>' + produk.nama + '</h1>' +
                hargaHtml +
                variasiHtml +
                '<p class="pd-deskripsi-singkat">' + (produk.deskripsi || '') + '</p>' +
                (keunggulanChipsHtml ? '<div class="pd-chips">' + keunggulanChipsHtml + '</div>' : '') +
                '<div class="pd-seller">' +
                    '<img src="img/logo-kasihibu.jpeg">' +
                    '<div><strong>UMKM Kasih Ibu</strong><span>Kabupaten Bima</span></div>' +
                '</div>' +
            '</div>' +
            '<div class="pd-aksi-box">' +
                '<div class="pd-aksi-title"><span class="pd-dot-hijau"></span> Tersedia, hubungi untuk pemesanan</div>' +
                '<a href="https://wa.me/' + WA_NOMOR + '?text=' + encodeURIComponent('Halo, saya tertarik dengan produk ' + produk.nama) + '" target="_blank" class="btn-produk btn-produk-wa pd-btn-full">' + iconWA() + ' Beli via WhatsApp</a>' +
                '<div class="pd-trust"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l7 4v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-4z"/></svg> Transaksi langsung dengan penjual, aman dan terpercaya</div>' +
            '<button class="pd-share-btn" id="pd-share-btn">' + iconShare2() + ' Bagikan Produk Ini</button>' +
            '</div>' +
            '<div class="pd-bantuan-card">' +
                '<h4>Butuh Bantuan?</h4>' +
                '<p>Tim UMKM Kasih Ibu siap membantu Anda memilih produk yang sesuai kebutuhan.</p>' +
                '<a href="https://wa.me/' + WA_NOMOR + '?text=' + encodeURIComponent('Halo, saya ingin bertanya tentang produk ' + produk.nama) + '" target="_blank" class="pd-bantuan-link">' + iconWA() + ' Tanya Produk Ini</a>' +
            '</div>' +
        '</div>' +
        renderTabsSection(produk) +
        '<div id="pd-produk-lainnya"></div>';

    attachDetailEvents(produk.id);
}

function iconHati() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 000-7.8z"/></svg>'; }
function iconCentang() { return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>'; }
function iconWA() { return '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.5 15.2L2 22l4.9-1.5A10 10 0 1012 2zm0 2a8 8 0 11-4.2 14.8l-.3-.2-2.9.9.9-2.8-.2-.3A8 8 0 0112 4z"/></svg>'; }
function iconShare2() { return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.6l6.8-3.8M8.6 13.4l6.8 3.8"/></svg>'; }


function renderTabsSection(produk) {
    var spesifikasiList = parseSpesifikasi(produk.spesifikasi);
    var keunggulanList = parseBarisJadiList(produk.keunggulan);

    var spesifikasiHtml = spesifikasiList.length > 0
        ? '<table class="pd-spek-table">' + spesifikasiList.map(function(s) {
            return '<tr><td>' + s.label + '</td><td>' + s.isi + '</td></tr>';
        }).join('') + '</table>'
        : '<p class="empty">Spesifikasi belum diisi</p>';

    var keunggulanHtml = keunggulanList.length > 0
        ? '<ul class="pd-keunggulan-list">' + keunggulanList.map(function(k) {
            return '<li>' + iconCentang() + ' ' + k + '</li>';
        }).join('') + '</ul>'
        : '<p class="empty">Keunggulan belum diisi</p>';

    return '<div class="pd-tabs-section fade-in">' +
        '<div class="pd-tab-col">' +
            '<h3>Deskripsi Produk</h3>' +
            '<p class="pd-deskripsi-full">' + (produk.deskripsi || 'Belum ada deskripsi.') + '</p>' +
            (keunggulanHtml ? '<h4 style="margin-top:18px;">Keunggulan</h4>' + keunggulanHtml : '') +
        '</div>' +
        '<div class="pd-tab-col">' +
            '<h3>Informasi Produk</h3>' +
            spesifikasiHtml +
        '</div>' +
    '</div>';
}

function attachDetailEvents(produkId) {
    document.querySelectorAll('.pd-thumb').forEach(function(thumb) {
        thumb.addEventListener('click', function() {
            gantiFoto(parseInt(thumb.getAttribute('data-index'), 10));
        });
    });

    var prevBtn = document.getElementById('pd-prev');
    var nextBtn = document.getElementById('pd-next');
    if (prevBtn) prevBtn.addEventListener('click', function() { gantiFoto((fotoIndex - 1 + fotoList.length) % fotoList.length); });
    if (nextBtn) nextBtn.addEventListener('click', function() { gantiFoto((fotoIndex + 1) % fotoList.length); });

    var wishBtn = document.getElementById('pd-wishlist-btn');
    if (wishBtn) {
        wishBtn.addEventListener('click', function() {
            var aktif = toggleWishlist(produkId);
            wishBtn.classList.toggle('active', aktif);
        });
    }

    var shareBtn = document.getElementById('pd-share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            var url = window.location.href;
            if (navigator.share) {
                navigator.share({ title: document.title, url: url });
            } else {
                navigator.clipboard.writeText(url);
                alert('Link produk disalin ke clipboard');
            }
        });
    }

    document.querySelectorAll('.pd-varian-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            gantiFoto(parseInt(btn.getAttribute('data-index'), 10));
        });
    });
}

function gantiFoto(idx) {
    fotoIndex = idx;
    document.getElementById('pd-main-img').src = API_BASE + '/' + fotoList[idx].path_foto;
    document.querySelectorAll('.pd-thumb').forEach(function(t, i) {
        t.classList.toggle('active', i === idx);
    });
    document.querySelectorAll('.pd-varian-btn').forEach(function(btn) {
        btn.classList.toggle('active', parseInt(btn.getAttribute('data-index'), 10) === idx);
    });

    var fotoTerpilih = fotoList[idx];
    var hargaTampil = document.getElementById('pd-harga-tampil');
    if (hargaTampil && fotoTerpilih.harga_varian) {
        hargaTampil.textContent = formatRupiah(fotoTerpilih.harga_varian);
    }
}

function renderProdukLainnya(semuaProduk, currentId) {
    var lain = semuaProduk.filter(function(p) { return p.id != currentId; }).slice(0, 3);
    var target = document.getElementById('pd-produk-lainnya');
    if (!target || lain.length === 0) return;

    var cardsHtml = lain.map(function(p) {
        var fotoHtml = p.foto_utama
            ? '<img src="' + API_BASE + '/' + p.foto_utama + '">'
            : '<div class="produk-foto-kosong">Belum ada foto</div>';
        var hargaHtml = formatRupiah(p.harga) ? formatRupiah(p.harga) : 'Hubungi kami';

        return '<a href="produk-detail.html?id=' + p.id + '" class="pd-mini-card">' +
            '<div class="pd-mini-foto">' + fotoHtml + '</div>' +
            '<div class="pd-mini-info"><strong>' + p.nama + '</strong><span>' + hargaHtml + '</span></div>' +
        '</a>';
    }).join('');

    target.innerHTML =
        '<div class="section-heading fade-in"><h2>Produk Lainnya dari UMKM Kasih Ibu</h2></div>' +
        '<div class="pd-mini-grid fade-in">' + cardsHtml + '</div>';
}