const db = require('../config/db');

exports.uploadFoto = async function(req, res) {
    var kegiatanId = req.params.kegiatanId;
    var kategori = req.body.kategori || 'lainnya';
    var caption = req.body.caption || null;

    if (!req.file) {
        return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
    }

    try {
        var pathFoto = 'uploads/' + req.file.filename;
        var [result] = await db.query(
            'INSERT INTO kegiatan_konten (kegiatan_id, kategori, path_foto, caption) VALUES (?, ?, ?, ?)',
            [kegiatanId, kategori, pathFoto, caption]
        );
        res.status(201).json({ message: 'Foto berhasil diunggah', id: result.insertId, path: pathFoto });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menyimpan foto', error: err.message });
    }
};

exports.getFotoByKegiatan = async function(req, res) {
    var kegiatanId = req.params.kegiatanId;
    try {
        var [rows] = await db.query(
            'SELECT * FROM kegiatan_konten WHERE kegiatan_id = ? ORDER BY urutan ASC, id ASC',
            [kegiatanId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil foto', error: err.message });
    }
};

exports.deleteFoto = async function(req, res) {
    var id = req.params.id;
    try {
        await db.query('DELETE FROM kegiatan_konten WHERE id = ?', [id]);
        res.json({ message: 'Foto berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menghapus foto', error: err.message });
    }
};

exports.getAllFoto = async function(req, res) {
    try {
        var [rows] = await db.query(
            'SELECT kk.*, k.kecamatan, k.tanggal ' +
            'FROM kegiatan_konten kk ' +
            'JOIN kegiatan k ON k.id = kk.kegiatan_id ' +
            'ORDER BY kk.id DESC LIMIT 12'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil dokumentasi', error: err.message });
    }
};