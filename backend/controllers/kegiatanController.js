const db = require('../config/db');

exports.getAllKegiatan = async function(req, res) {
    try {
        var isAdmin = false;
        var authHeader = req.headers['authorization'];
        if (authHeader) {
            try {
                var jwt = require('jsonwebtoken');
                jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
                isAdmin = true;
            } catch (e) { isAdmin = false; }
        }

        var query = 'SELECT k.*, GROUP_CONCAT(kd.nama_desa SEPARATOR ", ") as desa_list ' +
            'FROM kegiatan k LEFT JOIN kegiatan_desa kd ON kd.kegiatan_id = k.id ';
        if (!isAdmin) {
            query += "WHERE k.status_publikasi = 'dipublikasikan' ";
        }
        query += 'GROUP BY k.id ORDER BY k.tanggal DESC';

        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data kegiatan', error: err.message });
    }
};

exports.getKegiatanById = async function(req, res) {
    const id = req.params.id;
    try {
        var isAdmin = false;
        var authHeader = req.headers['authorization'];
        if (authHeader) {
            try {
                var jwt = require('jsonwebtoken');
                jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
                isAdmin = true;
            } catch (e) { isAdmin = false; }
        }

        var query = 'SELECT k.*, GROUP_CONCAT(kd.nama_desa SEPARATOR ", ") as desa_list ' +
            'FROM kegiatan k LEFT JOIN kegiatan_desa kd ON kd.kegiatan_id = k.id WHERE k.id = ? ';
        if (!isAdmin) {
            query += "AND k.status_publikasi = 'dipublikasikan' ";
        }
        query += 'GROUP BY k.id';

        const [rows] = await db.query(query, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil detail kegiatan', error: err.message });
    }
};

exports.createKegiatan = async function(req, res) {
    const sesi_ke = req.body.sesi_ke;
    const kecamatan = req.body.kecamatan;
    const tanggal = req.body.tanggal;
    const status = req.body.status;
    const pejabat_hadir = req.body.pejabat_hadir;
    const ringkasan = req.body.ringkasan;
    const peran_bappeda = req.body.peran_bappeda;
    const testimoni_isi = req.body.testimoni_isi;
    const testimoni_nama = req.body.testimoni_nama;
    const testimoni_gender = req.body.testimoni_gender;
    const desa = req.body.desa;

    if (!kecamatan || !tanggal) {
        return res.status(400).json({ message: 'Kecamatan dan tanggal wajib diisi' });
    }

    var statusPublikasi = 'draft';
    if (req.user.role === 'superadmin' && req.body.publish === true) {
        statusPublikasi = 'dipublikasikan';
    }

    try {
        const [result] = await db.query(
            'INSERT INTO kegiatan (sesi_ke, kecamatan, tanggal, status, status_publikasi, pejabat_hadir, ringkasan, peran_bappeda, testimoni_isi, testimoni_nama, testimoni_gender, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [sesi_ke || null, kecamatan, tanggal, status || 'terjadwal', statusPublikasi, pejabat_hadir || null, ringkasan || null, peran_bappeda || null, testimoni_isi || null, testimoni_nama || null, testimoni_gender || null, req.user.id]
        );

        const kegiatanId = result.insertId;

        if (desa && desa.length > 0) {
            const values = desa.map(function(d) { return [kegiatanId, d]; });
            await db.query('INSERT INTO kegiatan_desa (kegiatan_id, nama_desa) VALUES ?', [values]);
        }

        res.status(201).json({ message: 'Kegiatan berhasil dibuat', id: kegiatanId, status_publikasi: statusPublikasi });
    } catch (err) {
        res.status(500).json({ message: 'Gagal membuat kegiatan', error: err.message });
    }
};

exports.updateKegiatan = async function(req, res) {
    const id = req.params.id;
    const sesi_ke = req.body.sesi_ke;
    const kecamatan = req.body.kecamatan;
    const tanggal = req.body.tanggal;
    const status = req.body.status;
    const pejabat_hadir = req.body.pejabat_hadir;
    const ringkasan = req.body.ringkasan;
    const peran_bappeda = req.body.peran_bappeda;
    const testimoni_isi = req.body.testimoni_isi;
    const testimoni_nama = req.body.testimoni_nama;
    const testimoni_gender = req.body.testimoni_gender;
    const desa = req.body.desa;

    try {
        const [rows] = await db.query('SELECT * FROM kegiatan WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });
        }
        const existing = rows[0];

        if (req.user.role === 'editor') {
            if (existing.created_by !== req.user.id) {
                return res.status(403).json({ message: 'Anda hanya bisa mengedit kegiatan milik sendiri' });
            }
            if (existing.status_publikasi === 'dipublikasikan') {
                return res.status(403).json({ message: 'Kegiatan yang sudah dipublikasikan tidak bisa diedit langsung. Hubungi Superadmin.' });
            }
        }

        await db.query(
            'UPDATE kegiatan SET sesi_ke = ?, kecamatan = ?, tanggal = ?, status = ?, pejabat_hadir = ?, ringkasan = ?, peran_bappeda = ?, testimoni_isi = ?, testimoni_nama = ?, testimoni_gender = ? WHERE id = ?',
            [sesi_ke || null, kecamatan, tanggal, status, pejabat_hadir || null, ringkasan || null, peran_bappeda || null, testimoni_isi || null, testimoni_nama || null, testimoni_gender || null, id]
        );

        if (desa && desa.length > 0) {
            await db.query('DELETE FROM kegiatan_desa WHERE kegiatan_id = ?', [id]);
            const values = desa.map(function(d) { return [id, d]; });
            await db.query('INSERT INTO kegiatan_desa (kegiatan_id, nama_desa) VALUES ?', [values]);
        }

        res.json({ message: 'Kegiatan berhasil diperbarui' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal memperbarui kegiatan', error: err.message });
    }
};

exports.deleteKegiatan = async function(req, res) {
    const id = req.params.id;
    try {
        const [rows] = await db.query('SELECT * FROM kegiatan WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });
        }
        const existing = rows[0];

        if (req.user.role === 'editor' && existing.created_by !== req.user.id) {
            return res.status(403).json({ message: 'Anda hanya bisa menghapus kegiatan milik sendiri' });
        }

        await db.query('DELETE FROM kegiatan WHERE id = ?', [id]);
        res.json({ message: 'Kegiatan berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menghapus kegiatan', error: err.message });
    }
};

exports.publishKegiatan = async function(req, res) {
    const id = req.params.id;
    try {
        await db.query("UPDATE kegiatan SET status_publikasi = 'dipublikasikan' WHERE id = ?", [id]);
        res.json({ message: 'Kegiatan berhasil dipublikasikan' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal mempublikasikan kegiatan', error: err.message });
    }
};

exports.unpublishKegiatan = async function(req, res) {
    const id = req.params.id;
    try {
        await db.query("UPDATE kegiatan SET status_publikasi = 'draft' WHERE id = ?", [id]);
        res.json({ message: 'Kegiatan dikembalikan ke draft' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengubah status', error: err.message });
    }
};

exports.getMyDrafts = async function(req, res) {
    try {
        var query, params;
        if (req.user.role === 'superadmin') {
            query = 'SELECT k.*, GROUP_CONCAT(kd.nama_desa SEPARATOR ", ") as desa_list, au.nama as pembuat ' +
                'FROM kegiatan k LEFT JOIN kegiatan_desa kd ON kd.kegiatan_id = k.id ' +
                'LEFT JOIN admin_user au ON au.id = k.created_by ' +
                "WHERE k.status_publikasi = 'draft' GROUP BY k.id ORDER BY k.created_at DESC";
            params = [];
        } else {
            query = 'SELECT k.*, GROUP_CONCAT(kd.nama_desa SEPARATOR ", ") as desa_list ' +
                'FROM kegiatan k LEFT JOIN kegiatan_desa kd ON kd.kegiatan_id = k.id ' +
                "WHERE k.status_publikasi = 'draft' AND k.created_by = ? GROUP BY k.id ORDER BY k.created_at DESC";
            params = [req.user.id];
        }
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil daftar draft', error: err.message });
    }
};