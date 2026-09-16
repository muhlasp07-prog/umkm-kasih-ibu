const db = require('../config/db');

exports.uploadFoto = async function(req, res) {
    var produkId = req.params.produkId;
    var caption = req.body.caption || null;
    var nama_varian = req.body.nama_varian || null;
    var harga_varian = req.body.harga_varian || null;

    if (!req.file) {
        return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
    }

    try {
        var pathFoto = 'uploads/' + req.file.filename;
        var [result] = await db.query(
            'INSERT INTO produk_foto (produk_id, path_foto, caption, nama_varian, harga_varian) VALUES (?, ?, ?, ?, ?)',
            [produkId, pathFoto, caption, nama_varian, harga_varian]
        );
        res.status(201).json({ message: 'Foto berhasil diunggah', id: result.insertId, path: pathFoto });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menyimpan foto', error: err.message });
    }
};

exports.getFotoByProduk = async function(req, res) {
    var produkId = req.params.produkId;
    try {
        var [rows] = await db.query(
            'SELECT * FROM produk_foto WHERE produk_id = ? ORDER BY urutan ASC, id ASC',
            [produkId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil foto', error: err.message });
    }
};

exports.deleteFoto = async function(req, res) {
    var id = req.params.id;
    try {
        await db.query('DELETE FROM produk_foto WHERE id = ?', [id]);
        res.json({ message: 'Foto berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menghapus foto', error: err.message });
    }
};