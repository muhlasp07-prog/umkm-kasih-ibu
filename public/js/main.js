var API_PRODUK = API_BASE + '/api/produk';
var API_PRODUK_FOTO = API_BASE + '/api/produk-foto';
var semuaProduk = [];
var filterKategoriAktif = 'semua';
var kataKunciSearch = '';

function formatRupiah(angka) {
    if (!angka) return null;
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
}

function labelKategori(kategori) {
    var map = {
        kerajinan: 'Kerajinan Tangan',
        kuliner: 'Kuliner',
        lainnya: 'Lainnya'
    };
    return map[kategori] || kategori;
}

function renderProdukGrid() {
    var grid = document.getElementById('produk-grid');
    if (!grid) return;

    var filtered = semuaProduk.filter(function(item) {
        var cocokKategori = filterKategoriAktif === 'semua' || item.kategori === filterKategoriAktif;
        var cocokSearch = !kataKunciSearch || item.nama.toLowerCase().indexOf(kataKunciSearch) !== -1;
        return cocokKategori && cocokSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty">Tidak ada produk yang cocok</div>';
        return;
    }

    grid.innerHTML = '';
    filtered.forEach(function(item) {
        var card = document.createElement('div');
        card.className = 'produk-card fade-in';

        var fotoHtml = item.foto_utama
            ? '<img src="' + API_BASE + '/' + item.foto_utama + '" alt="' + item.nama + '">'
            : '<div class="produk-foto-kosong">Belum ada foto</div>';

        var hargaHtml;
        if (formatRupiah(item.harga_coret) && item.harga_coret > item.harga) {
            var diskonPersen = Math.round((1 - item.harga / item.harga_coret) * 100);
            hargaHtml = '<div class="harga-row">' +
                '<span class="harga-coret">' + formatRupiah(item.harga_coret) + '</span>' +
                '<span class="harga-diskon-badge">-' + diskonPersen + '%</span>' +
                '</div><div class="produk-harga">' + formatRupiah(item.harga) + '</div>';
        } else if (formatRupiah(item.harga)) {
            hargaHtml = '<div class="produk-harga">' + formatRupiah(item.harga) + '</div>';
        } else {
            hargaHtml = '<div class="produk-harga produk-harga-tanya">Hubungi untuk harga</div>';
        }

        card.innerHTML =
            '<div class="produk-foto">' + fotoHtml + '<span class="produk-kategori-badge">' + labelKategori(item.kategori) + '</span></div>' +
            '<div class="produk-info">' +
            '<h3>' + item.nama + '</h3>' +
            '<p>' + (item.deskripsi ? item.deskripsi.substring(0, 80) + (item.deskripsi.length > 80 ? '...' : '') : '') + '</p>' +
            hargaHtml +
            '<div class="produk-actions">' +
            '<a href="produk-detail?id=' + item.id + '" class="btn-produk btn-produk-detail">Lihat Detail</a>' +
            '<a href="https://wa.me/6285333955993?text=' + encodeURIComponent('Halo, saya tertarik dengan produk ' + item.nama) + '" target="_blank" class="btn-produk btn-produk-wa">WhatsApp</a>' +
            '</div></div>';

        grid.appendChild(card);
    });
}

function fetchProduk() {
    fetch(API_PRODUK)
        .then(function(res) { return res.json(); })
        .then(function(data) {
            semuaProduk = data;
            renderProdukGrid();
            renderGaleriFromProduk(data);
        })
        .catch(function() {
            var grid = document.getElementById('produk-grid');
            if (grid) grid.innerHTML = '<div class="empty">Gagal memuat produk</div>';
        });
}

function renderGaleriFromProduk(listProduk) {
    var galeriGrid = document.getElementById('galeri-grid');
    if (!galeriGrid) return;

    var fotoPromises = listProduk.map(function(p) {
        return fetch(API_PRODUK_FOTO + '/' + p.id)
            .then(function(res) { return res.json(); })
            .then(function(fotos) {
                return fotos.map(function(f) {
                    return { path: f.path_foto, nama: p.nama, id: p.id };
                });
            })
            .catch(function() { return []; });
    });

    Promise.all(fotoPromises).then(function(hasil) {
        var semuaFoto = [].concat.apply([], hasil);
        if (semuaFoto.length === 0) {
            galeriGrid.innerHTML = '<div class="empty">Belum ada foto galeri</div>';
            return;
        }

        galeriGrid.innerHTML = '';
        semuaFoto.slice(0, 12).forEach(function(foto) {
            var div = document.createElement('div');
            div.className = 'dok-item';
            div.addEventListener('click', function() {
                window.location.href = 'produk-detail.html?id=' + foto.id;
            });
            div.innerHTML =
                '<img src="' + API_BASE + '/' + foto.path + '">' +
                '<div class="dok-caption">' + foto.nama + '</div>';
            galeriGrid.appendChild(div);
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    fetchProduk();

    var params = new URLSearchParams(window.location.search);
    var cariDariUrl = params.get('cari');
    if (cariDariUrl) {
        var searchInput = document.getElementById('nav-search-input');
        if (searchInput) searchInput.value = cariDariUrl;
        kataKunciSearch = cariDariUrl.toLowerCase();
    }

    document.querySelectorAll('.kategori-card').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.kategori-card').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            filterKategoriAktif = btn.getAttribute('data-kategori');
            renderProdukGrid();
        });
    });

    var searchInput = document.getElementById('nav-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            kataKunciSearch = searchInput.value.toLowerCase().trim();
            renderProdukGrid();
            var produkSection = document.getElementById('produk');
            if (kataKunciSearch && produkSection) {
                produkSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

});