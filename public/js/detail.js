var API_KEGIATAN = API_BASE + '/api/kegiatan';
var API_KONTEN = API_BASE + '/api/konten';

function getIdFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function formatTanggal(tanggalStr) {
    var bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    var parts = tanggalStr.split('-');
    return parseInt(parts[2], 10) + ' ' + bulan[parseInt(parts[1], 10) - 1] + ' ' + parts[0];
}

function formatTanggalSingkat(tanggalStr) {
    var bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    var parts = tanggalStr.split('-');
    return parseInt(parts[2],10) + ' ' + bulan[parseInt(parts[1],10)-1] + ' ' + parts[0];
}

function labelKategori(kategori) {
    var map = {
        penyambutan_adat: 'Penyambutan Adat',
        layanan_terpadu: 'Layanan Terpadu',
        ngopi_bareng: 'Ngopi Bareng',
        penyerahan_bantuan: 'Penyerahan Bantuan',
        umkm: 'UMKM',
        lainnya: 'Lainnya'
    };
    return map[kategori] || kategori;
}

var kegiatanId = getIdFromUrl();
var iconKalender = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>';
var iconPin = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-6.5 8-12a8 8 0 10-16 0c0 5.5 8 12 8 12z"/><circle cx="12" cy="10" r="3"/></svg>';
var iconOrang = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0116 0v1"/></svg>';
var iconBangunan = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M6 21V7l6-4 6 4v14M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1"/></svg>';
var iconKamera = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';
var iconChat = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-4.6 7.5 8.5 8.5 0 01-8.7-.4L3 20l1.4-4.7A8.38 8.38 0 013 11.5 8.5 8.5 0 0111.5 3h.5a8.5 8.5 0 019 8.5z"/></svg>';
var iconDownload = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>';
var iconShare = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.6l6.8-3.8M8.6 13.4l6.8 3.8"/></svg>';
var iconPrint = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v7H6z"/></svg>';
var iconHome = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>';

if (!kegiatanId) {
    document.getElementById('detail-main').innerHTML = '<div class="empty">Kegiatan tidak ditemukan</div>';
} else {
    var previewHeaders = {};
    var previewToken = localStorage.getItem('admin_token');
    if (previewToken) {
        previewHeaders['Authorization'] = 'Bearer ' + previewToken;
    }

    fetch(API_KEGIATAN + '/' + kegiatanId, { headers: previewHeaders })
        .then(function(res) { return res.json(); })
        .then(function(item) {
            return fetch(API_KONTEN + '/' + kegiatanId, { headers: previewHeaders })
                .then(function(res) { return res.json(); })
                .then(function(fotos) {
                    renderPreviewBanner(item);
                    renderBreadcrumb(item);
                    renderGalleryCard(item, fotos);
                    renderMain(item, fotos);
                    renderSidebar(item);
                    renderKegiatanLainnya(item.id);
                });
        })
        .catch(function(err) {
            document.getElementById('detail-main').innerHTML = '<div class="empty">Gagal memuat: ' + err.message + '</div>';
        });
}

var galleryIndex = 0;
var galleryFotos = [];

function renderGalleryCard(item, fotos) {
    galleryFotos = fotos;
    galleryIndex = 0;
    var statusLabel = item.status.charAt(0).toUpperCase() + item.status.slice(1);
    var excerpt = item.ringkasan ? (item.ringkasan.length > 130 ? item.ringkasan.substring(0, 130) + '...' : item.ringkasan) : '';

    var thumbsHtml = '';
    if (fotos.length > 0) {
        var maxThumb = 4;
        fotos.slice(0, maxThumb).forEach(function(f, i) {
            if (i === maxThumb - 1 && fotos.length > maxThumb) {
                thumbsHtml += '<div class="gallery-thumb gallery-thumb-more" data-index="' + i + '"><img src="' + API_BASE + '/' + f.path_foto + '"><span>+' + (fotos.length - maxThumb) + ' Foto</span></div>';
            } else {
                thumbsHtml += '<div class="gallery-thumb' + (i === 0 ? ' active' : '') + '" data-index="' + i + '"><img src="' + API_BASE + '/' + f.path_foto + '"></div>';
            }
        });
    }

    var mainPhotoHtml = fotos.length > 0
        ? '<img src="' + API_BASE + '/' + fotos[0].path_foto + '" id="gallery-main-img">'
        : '<div class="gallery-empty">Belum ada foto</div>';

    document.getElementById('gallery-card').innerHTML =
        '<div class="gallery-card fade-in">' +
        '<div class="gallery-photo-col">' +
        '<div class="gallery-main-wrap">' + mainPhotoHtml +
        (fotos.length > 0 ? '<span class="gallery-caption">' + iconKamera + ' Kegiatan BAPPEDA</span><div class="gallery-next" id="gallery-next">&#8250;</div>' : '') +
        '</div>' +
        (thumbsHtml ? '<div class="gallery-thumbs">' + thumbsHtml + '</div>' : '') +
        '</div>' +
        '<div class="gallery-info-col">' +
        '<span class="gallery-badge">Kegiatan</span>' +
        '<h1>' + (item.ringkasan ? item.kecamatan_judul || ('Kecamatan ' + item.kecamatan) : 'Kecamatan ' + item.kecamatan) + '</h1>' +
        '<p class="gallery-desc">' + excerpt + '</p>' +
        '<div class="gallery-meta-grid">' +
        '<div class="gallery-meta-item"><span>' + iconKalender + ' Tanggal</span><strong>' + formatTanggal(item.tanggal) + '</strong></div>' +
        '<div class="gallery-meta-item"><span>' + iconPin + ' Lokasi</span><strong>' + (item.desa_list || '-') + '</strong></div>' +
        '<div class="gallery-meta-item"><span>' + iconOrang + ' Pejabat Hadir</span><strong>' + (item.pejabat_hadir || '-') + '</strong></div>' +
        '<div class="gallery-meta-item"><span>' + iconBangunan + ' Penyelenggara</span><strong>BAPPEDA Kabupaten Bima</strong></div>' +
        '</div>' +
        '<div class="gallery-actions">' +
        (fotos.length > 0 ? '<a href="' + API_BASE + '/' + fotos[0].path_foto + '" download class="btn-action btn-action-primary">' + iconDownload + ' Unduh Dokumentasi</a>' : '') +
        '<button class="btn-action btn-action-outline" id="btn-bagikan">' + iconShare + ' Bagikan</button>' +
        '<button class="btn-action btn-action-outline" id="btn-cetak">' + iconPrint + ' Cetak</button>' +
        '</div>' +
        '</div>' +
        '</div>';

    attachGalleryEvents();
}

function attachGalleryEvents() {
    document.querySelectorAll('.gallery-thumb').forEach(function(thumb) {
        thumb.addEventListener('click', function() {
            var idx = parseInt(thumb.getAttribute('data-index'), 10);
            switchGalleryPhoto(idx);
        });
    });

    var nextBtn = document.getElementById('gallery-next');
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            switchGalleryPhoto((galleryIndex + 1) % galleryFotos.length);
        });
    }

    var btnBagikan = document.getElementById('btn-bagikan');
    if (btnBagikan) {
        btnBagikan.addEventListener('click', function() {
            var url = window.location.href;
            if (navigator.share) {
                navigator.share({ title: 'Selasa Menyapa BAPPEDA', url: url });
            } else {
                navigator.clipboard.writeText(url);
                alert('Link disalin ke clipboard');
            }
        });
    }

    var btnCetak = document.getElementById('btn-cetak');
    if (btnCetak) {
        btnCetak.addEventListener('click', function() {
            window.print();
        });
    }
}

function switchGalleryPhoto(idx) {
    galleryIndex = idx;
    document.getElementById('gallery-main-img').src = API_BASE + '/' + galleryFotos[idx].path_foto;
    document.querySelectorAll('.gallery-thumb').forEach(function(t, i) {
        t.classList.toggle('active', i === idx);
    });
}

function renderPreviewBanner(item) {
    if (item.status_publikasi === 'draft') {
        var banner = document.createElement('div');
        banner.className = 'preview-banner';
        banner.textContent = '👁 Mode Preview — Kegiatan ini masih berstatus Draft, belum tampil untuk publik';
        document.body.insertBefore(banner, document.body.firstChild);
    }
}

function renderBreadcrumb(item) {
    document.getElementById('breadcrumb').innerHTML =
        '<a href="index.html">' + iconHome + ' Beranda</a>' +
        '<span class="breadcrumb-sep">&rsaquo;</span>' +
        '<a href="index.html">Timeline Kegiatan</a>' +
        '<span class="breadcrumb-sep">&rsaquo;</span>' +
        '<span class="breadcrumb-current">Kecamatan ' + item.kecamatan + '</span>';
}

function renderMain(item, fotos) {
    var infoCardsHtml =
        '<div class="info-card-row fade-in">' +
        '<div class="info-card"><div class="info-card-icon">' + iconKalender + '</div><div><span>Tanggal</span><strong>' + formatTanggal(item.tanggal) + '</strong></div></div>' +
        '<div class="info-card"><div class="info-card-icon">' + iconPin + '</div><div><span>Desa</span><strong>' + (item.desa_list || '-') + '</strong></div></div>' +
        (item.pejabat_hadir ? '<div class="info-card"><div class="info-card-icon">' + iconOrang + '</div><div><span>Pejabat Hadir</span><strong>' + item.pejabat_hadir + '</strong></div></div>' : '') +
        '</div>';

    var ringkasanHtml = '<div class="ringkasan-block fade-in"><h3>Ringkasan Kegiatan</h3><p>' + (item.ringkasan || 'Belum ada ringkasan.') + '</p></div>';

    var galeriHtml = '<h3 class="dok-heading fade-in">' + iconKamera + ' Dokumentasi Kegiatan</h3>';
    if (fotos.length > 0) {
        galeriHtml += '<div class="detail-galeri fade-in">';
        fotos.forEach(function(foto) {
            galeriHtml +=
                '<div class="detail-foto-item" data-src="' + API_BASE + '/' + foto.path_foto + '" data-caption="' + (foto.caption || labelKategori(foto.kategori)) + '">' +
                '<img src="' + API_BASE + '/' + foto.path_foto + '">' +
                '<span class="foto-tag">' + labelKategori(foto.kategori) + '</span>' +
                (foto.caption ? '<p>' + foto.caption + '</p>' : '') +
                '</div>';
        });
        galeriHtml += '</div>';
    } else {
        galeriHtml += '<p class="empty">Belum ada foto untuk kegiatan ini</p>';
    }

    document.getElementById('detail-main').innerHTML = infoCardsHtml + ringkasanHtml + galeriHtml;
    attachLightbox();
}

function renderSidebar(item) {
    var kontribusiHtml =
        '<div class="side-box kontribusi-box fade-in" style="background-image:url(\'img/cover-bappeda.jpeg\');">' +
        '<div class="kontribusi-blur-layer"></div>' +
        '<div class="kontribusi-content">' +
        '<div class="side-icon-badge">' + iconBangunan + '</div>' +
        '<h4>Kontribusi BAPPEDA</h4>' +
        '<p>' + (item.peran_bappeda || 'Belum ada informasi peran BAPPEDA untuk kegiatan ini.') + '</p>' +
        '</div></div>';

    var testimoniHtml = '';
    if (item.testimoni_isi) {
        var avatarFile = item.testimoni_gender === 'wanita' ? 'img/bot-wanita.jpeg' : 'img/bot-pria.jpeg';
        testimoniHtml =
            '<div class="side-box testimoni-box fade-in">' +
            '<h4>' + iconChat + ' Testimoni Warga</h4>' +
            '<p class="testimoni-quote">&ldquo;' + item.testimoni_isi + '&rdquo;</p>' +
            '<div class="testimoni-footer">' +
            '<img src="' + avatarFile + '" class="testimoni-avatar">' +
            (item.testimoni_nama ? '<span class="testimoni-nama">' + item.testimoni_nama + '</span>' : '') +
            '</div></div>';
    }

    document.getElementById('detail-side').innerHTML = kontribusiHtml + testimoniHtml + '<div id="kegiatan-lainnya-box"></div>';
}

function renderKegiatanLainnya(currentId) {
    fetch(API_KEGIATAN)
        .then(function(res) { return res.json(); })
        .then(function(list) {
            var lain = list.filter(function(k) { return k.id != currentId; }).slice(0, 5);
            var box = document.getElementById('kegiatan-lainnya-box');
            if (!box) return;

            if (lain.length === 0) {
                box.innerHTML = '';
                return;
            }

            var fotoPromises = lain.map(function(k) {
                return fetch(API_KONTEN + '/' + k.id)
                    .then(function(res) { return res.json(); })
                    .then(function(fotos) {
                        k.thumbnail = fotos.length > 0 ? API_BASE + '/' + fotos[0].path_foto : null;
                        return k;
                    })
                    .catch(function() { k.thumbnail = null; return k; });
            });

            Promise.all(fotoPromises).then(function(lainDenganFoto) {
                var html = '<div class="side-box lainnya-box fade-in"><h4>Kegiatan Lainnya</h4>';
                lainDenganFoto.forEach(function(k) {
                    var thumb = k.thumbnail
                        ? '<img src="' + k.thumbnail + '" class="lainnya-thumb">'
                        : '<div class="lainnya-thumb lainnya-thumb-empty">&#128247;</div>';
                    html +=
                        '<a href="detail.html?id=' + k.id + '" class="lainnya-item">' +
                        thumb +
                        '<div class="lainnya-text">' +
                        '<div class="lainnya-date">' + formatTanggalSingkat(k.tanggal) + '</div>' +
                        '<div class="lainnya-title">Kecamatan ' + k.kecamatan + '</div>' +
                        '</div>' +
                        '</a>';
                });
                html += '</div>';
                box.innerHTML = html;
            });
        });
}

function attachLightbox() {
    document.querySelectorAll('.detail-foto-item').forEach(function(el) {
        el.addEventListener('click', function() {
            openLightbox(el.getAttribute('data-src'), el.getAttribute('data-caption'));
        });
    });
}

function openLightbox(src, caption) {
    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML =
        '<div class="lightbox-close">&times;</div>' +
        '<img src="' + src + '">' +
        (caption ? '<p class="lightbox-caption">' + caption + '</p>' : '');
    overlay.addEventListener('click', function() {
        document.body.removeChild(overlay);
    });
    document.body.appendChild(overlay);
}

window.addEventListener('scroll', function() {
    var bar = document.getElementById('scroll-progress');
    if (!bar) return;
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = percent + '%';
});