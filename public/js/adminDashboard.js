var API_URL = API_BASE + '/api/produk';
var token = localStorage.getItem('admin_token');
var role = localStorage.getItem('admin_role');
var myId = localStorage.getItem('admin_id');

if (!token) {
    window.location.href = 'login.html';
}

document.getElementById('welcome-text').textContent = 'Halo, ' + (localStorage.getItem('admin_nama') || 'Admin') + ' (' + (role === 'owner' ? 'Owner' : 'Editor') + ')';

if (role !== 'owner') {
    var tabBtnPengaturan = document.getElementById('tab-btn-pengaturan');
    if (tabBtnPengaturan) tabBtnPengaturan.style.display = 'none';
} else {
    var publishOption = document.getElementById('publish-option');
    if (publishOption) publishOption.style.display = 'block';
}

document.getElementById('btn-logout').addEventListener('click', function() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_nama');
    localStorage.removeItem('admin_role');
    localStorage.removeItem('admin_id');
    window.location.href = 'login.html';
});

document.getElementById('btn-tambah').addEventListener('click', function() {
    resetForm();
    document.getElementById('form-title').textContent = 'Tambah Produk';
    document.getElementById('form-box').style.display = 'block';
});

document.getElementById('btn-batal').addEventListener('click', function() {
    document.getElementById('form-box').style.display = 'none';
});

function resetForm() {
    document.getElementById('produk-id').value = '';
    document.getElementById('f-nama').value = '';
    document.getElementById('f-kategori').value = 'kerajinan';
    document.getElementById('f-harga').value = '';
    document.getElementById('f-harga-coret').value = '';
    document.getElementById('f-deskripsi').value = '';
    document.getElementById('f-spesifikasi').value = '';
    document.getElementById('f-keunggulan').value = '';
    var pub = document.getElementById('f-publish');
    if (pub) pub.checked = false;
}

function formatRupiah(angka) {
    if (!angka) return '-';
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
}

function loadProduk() {
    fetch(API_URL, { headers: { 'Authorization': 'Bearer ' + token } })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            var tbody = document.getElementById('tabel-body');
            tbody.innerHTML = '';
            data.forEach(function(item) {
                var tr = document.createElement('tr');
                var isOwner = role === 'owner' || item.created_by == myId;
                var publikasiLabel = item.status_publikasi === 'dipublikasikan'
                    ? '<span class="badge-publikasi badge-terbit">Dipublikasikan</span>'
                    : '<span class="badge-publikasi badge-draft">Draft</span>';

                var aksiHtml = '';
                if (isOwner) {
                    aksiHtml += '<button class="aksi-btn aksi-edit" data-id="' + item.id + '">Edit</button>';
                    aksiHtml += '<button class="aksi-btn aksi-foto" data-id="' + item.id + '" data-nama="' + item.nama + '">Foto</button>';
                }
                if (role === 'owner') {
                    if (item.status_publikasi === 'draft') {
                        aksiHtml += '<button class="aksi-btn aksi-publish" data-id="' + item.id + '">Publikasikan</button>';
                    } else {
                        aksiHtml += '<button class="aksi-btn aksi-unpublish" data-id="' + item.id + '">Jadikan Draft</button>';
                    }
                }
                if (isOwner) {
                    aksiHtml += '<button class="aksi-btn aksi-hapus" data-id="' + item.id + '">Hapus</button>';
                }

                tr.innerHTML =
                    '<td>' + item.nama + '</td>' +
                    '<td>' + (item.kategori || '-') + '</td>' +
                    '<td>' + formatRupiah(item.harga) + '</td>' +
                    '<td>' + publikasiLabel + '</td>' +
                    '<td>' + aksiHtml + '</td>';
                tbody.appendChild(tr);
            });

            attachActionHandlers(data);
        });
}

function attachActionHandlers(data) {
    document.querySelectorAll('.aksi-edit').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = btn.getAttribute('data-id');
            var item = data.find(function(k) { return k.id == id; });
            document.getElementById('produk-id').value = item.id;
            document.getElementById('f-nama').value = item.nama;
            document.getElementById('f-kategori').value = item.kategori || 'kerajinan';
            document.getElementById('f-harga').value = item.harga || '';
            document.getElementById('f-harga-coret').value = item.harga_coret || '';
            document.getElementById('f-deskripsi').value = item.deskripsi || '';
            document.getElementById('f-spesifikasi').value = item.spesifikasi || '';
            document.getElementById('f-keunggulan').value = item.keunggulan || '';
            document.getElementById('form-title').textContent = 'Edit Produk';
            document.getElementById('form-box').style.display = 'block';
        });
    });

    document.querySelectorAll('.aksi-foto').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = btn.getAttribute('data-id');
            var nama = btn.getAttribute('data-nama');
            document.getElementById('foto-produk-id').value = id;
            document.getElementById('foto-produk-nama').textContent = nama;
            document.getElementById('foto-box').style.display = 'block';
            loadGaleri(id);
        });
    });

    document.querySelectorAll('.aksi-hapus').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = btn.getAttribute('data-id');
            if (!confirm('Yakin hapus produk ini?')) return;

            fetch(API_URL + '/' + id, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token }
            })
            .then(function(res) { return res.json(); })
            .then(function() { loadProduk(); });
        });
    });

    document.querySelectorAll('.aksi-publish').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = btn.getAttribute('data-id');
            if (!confirm('Publikasikan produk ini ke publik?')) return;

            fetch(API_URL + '/' + id + '/publish', {
                method: 'PUT',
                headers: { 'Authorization': 'Bearer ' + token }
            })
            .then(function(res) { return res.json(); })
            .then(function() { loadProduk(); });
        });
    });

    document.querySelectorAll('.aksi-unpublish').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = btn.getAttribute('data-id');
            if (!confirm('Kembalikan produk ini ke Draft?')) return;

            fetch(API_URL + '/' + id + '/unpublish', {
                method: 'PUT',
                headers: { 'Authorization': 'Bearer ' + token }
            })
            .then(function(res) { return res.json(); })
            .then(function() { loadProduk(); });
        });
    });
}

document.getElementById('btn-simpan').addEventListener('click', function() {
    var id = document.getElementById('produk-id').value;
    var publishCheckbox = document.getElementById('f-publish');

    var payload = {
        nama: document.getElementById('f-nama').value,
        kategori: document.getElementById('f-kategori').value,
        harga: document.getElementById('f-harga').value || null,
        harga_coret: document.getElementById('f-harga-coret').value || null,
        deskripsi: document.getElementById('f-deskripsi').value,
        spesifikasi: document.getElementById('f-spesifikasi').value,
        keunggulan: document.getElementById('f-keunggulan').value,
        publish: publishCheckbox ? publishCheckbox.checked : false
    };

    var url = id ? API_URL + '/' + id : API_URL;
    var method = id ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(payload)
    })
    .then(function(res) { return res.json(); })
    .then(function() {
        document.getElementById('form-box').style.display = 'none';
        loadProduk();
    });
});

loadProduk();

document.getElementById('btn-tutup-foto').addEventListener('click', function() {
    document.getElementById('foto-box').style.display = 'none';
});

function loadGaleri(produkId) {
    fetch(API_BASE + '/api/produk-foto/' + produkId)
        .then(function(res) { return res.json(); })
        .then(function(fotos) {
            var box = document.getElementById('galeri-foto');
            box.innerHTML = '';
            fotos.forEach(function(foto) {
                var div = document.createElement('div');
                div.className = 'foto-item';
                var infoVarian = foto.nama_varian ? foto.nama_varian : '';
                if (foto.harga_varian) infoVarian += (infoVarian ? ' - ' : '') + 'Rp ' + Number(foto.harga_varian).toLocaleString('id-ID');
                div.innerHTML =
                    '<img src="' + API_BASE + '/' + foto.path_foto + '">' +
                    '<button class="btn-hapus-foto" data-id="' + foto.id + '">x</button>' +
                    '<div class="foto-caption">' + (infoVarian || foto.caption || '') + '</div>';
                box.appendChild(div);
            });

            document.querySelectorAll('.btn-hapus-foto').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var fotoId = btn.getAttribute('data-id');
                    fetch(API_BASE + '/api/produk-foto/' + fotoId, {
                        method: 'DELETE',
                        headers: { 'Authorization': 'Bearer ' + token }
                    })
                    .then(function() { loadGaleri(produkId); });
                });
            });
        });
}

document.getElementById('btn-upload-foto').addEventListener('click', function() {
    var produkId = document.getElementById('foto-produk-id').value;
    var fileInput = document.getElementById('f-foto');

    if (!fileInput.files[0]) {
        alert('Pilih foto dulu');
        return;
    }

    var formData = new FormData();
    formData.append('foto', fileInput.files[0]);
    formData.append('caption', document.getElementById('f-caption').value);
    formData.append('nama_varian', document.getElementById('f-nama-varian').value);
    formData.append('harga_varian', document.getElementById('f-harga-varian').value);

    fetch(API_BASE + '/api/produk-foto/' + produkId, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: formData
    })
    .then(function(res) { return res.json(); })
    .then(function() {
        fileInput.value = '';
        document.getElementById('f-caption').value = '';
        document.getElementById('f-nama-varian').value = '';
        document.getElementById('f-harga-varian').value = '';
        loadGaleri(produkId);
    })
    .catch(function(err) { alert('Gagal upload: ' + err.message); });
});

document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
        document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });

        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-tab')).classList.add('active');

        if (btn.getAttribute('data-tab') === 'tab-pengaturan') {
            loadPengaturan();
        }
    });
});

function loadPengaturan() {
    fetch(API_BASE + '/api/pengaturan')
        .then(function(res) { return res.json(); })
        .then(function(data) {
            document.getElementById('p-pemilik_usaha').value = data.pemilik_usaha || '';
            document.getElementById('p-sejarah_usaha').value = data.sejarah_usaha || '';
            document.getElementById('p-visi').value = data.visi || '';
            document.getElementById('p-misi').value = data.misi || '';
            document.getElementById('p-alamat').value = data.alamat || '';
            document.getElementById('p-whatsapp').value = data.whatsapp || '';
            document.getElementById('p-instagram').value = data.instagram || '';
            document.getElementById('p-facebook').value = data.facebook || '';
        });
}

document.getElementById('btn-simpan-pengaturan').addEventListener('click', function() {
    var payload = {
        pemilik_usaha: document.getElementById('p-pemilik_usaha').value,
        sejarah_usaha: document.getElementById('p-sejarah_usaha').value,
        visi: document.getElementById('p-visi').value,
        misi: document.getElementById('p-misi').value,
        alamat: document.getElementById('p-alamat').value,
        whatsapp: document.getElementById('p-whatsapp').value,
        instagram: document.getElementById('p-instagram').value,
        facebook: document.getElementById('p-facebook').value
    };

    fetch(API_BASE + '/api/pengaturan', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(payload)
    })
    .then(function(res) { return res.json(); })
    .then(function(result) { alert(result.message); });
});