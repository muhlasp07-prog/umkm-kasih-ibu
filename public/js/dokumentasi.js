function renderDokumentasi() {
    var grid = document.getElementById('dokumentasi-grid');
    if (!grid) return;

    fetch(API_BASE + '/api/konten/semua/dokumentasi')
        .then(function(res) { return res.json(); })
        .then(function(fotos) {
            if (fotos.length === 0) {
                grid.innerHTML = '<div class="empty">Belum ada dokumentasi</div>';
                return;
            }
            grid.innerHTML = '';
            fotos.forEach(function(foto) {
                var div = document.createElement('div');
                div.className = 'dok-item';
                div.addEventListener('click', function() {
                    window.location.href = 'detail.html?id=' + foto.kegiatan_id;
                });
                div.innerHTML =
                    '<img src="' + API_BASE + '/' + foto.path_foto + '">' +
                    '<div class="dok-caption">Kecamatan ' + foto.kecamatan + '</div>';
                grid.appendChild(div);
            });
        })
        .catch(function() {
            grid.innerHTML = '<div class="empty">Gagal memuat dokumentasi</div>';
        });
}

document.addEventListener('DOMContentLoaded', renderDokumentasi);