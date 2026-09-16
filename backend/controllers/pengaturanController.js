const db = require('../config/db');

exports.getPengaturan = async function(req, res) {
    try {
        var [rows] = await db.query('SELECT nama_key, nilai FROM pengaturan_situs');
        var hasil = {};
        rows.forEach(function(row) {
            hasil[row.nama_key] = row.nilai;
        });
        res.json(hasil);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil pengaturan', error: err.message });
    }
};

exports.updatePengaturan = async function(req, res) {
    var data = req.body; // objek { instagram: '...', facebook: '...', dst }
    try {
        var keys = Object.keys(data);
        for (var i = 0; i < keys.length; i++) {
            await db.query(
                'UPDATE pengaturan_situs SET nilai = ? WHERE nama_key = ?',
                [data[keys[i]], keys[i]]
            );
        }
        res.json({ message: 'Pengaturan berhasil disimpan' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menyimpan pengaturan', error: err.message });
    }
};