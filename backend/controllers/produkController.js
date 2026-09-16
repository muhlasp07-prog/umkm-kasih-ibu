const db = require('../config/db');
const jwt = require('jsonwebtoken');

function checkIsAdmin(req) {
    var authHeader = req.headers['authorization'];
    if (!authHeader) return false;
    try {
        jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        return true;
    } catch (e) {
        return false;
    }
}

exports.getAllProduk = async function(req, res) {
    try {
        var isAdmin = checkIsAdmin(req);
        var query = 'SELECT p.*, ' +
            '(SELECT path_foto FROM produk_foto WHERE produk_id = p.id ORDER BY urutan ASC, id ASC LIMIT 1) as foto_utama ' +
            'FROM produk p ';
        if (!isAdmin) {
            query += "WHERE p.status_publikasi = 'dipublikasikan' ";
        }
        query += 'ORDER BY p.created_at DESC';

        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data produk', error: err.message });
    }
};

exports.getProdukById = async function(req, res) {
    const id = req.params.id;
    try {
        var isAdmin = checkIsAdmin(req);
        var query = 'SELECT * FROM produk WHERE id = ? ';
        if (!isAdmin) {
            query += "AND status_publikasi = 'dipublikasikan' ";
        }

        const [rows] = await db.query(query, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil detail produk', error: err.message });
    }
};

exports.createProduk = async function(req, res) {
    const nama = req.body.nama;
    const deskripsi = req.body.deskripsi;
    const spesifikasi = req.body.spesifikasi;
    const keunggulan = req.body.keunggulan;
    const harga = req.body.harga;
    const harga_coret = req.body.harga_coret;
    const kategori = req.body.kategori;

    if (!nama) {
        return res.status(400).json({ message: 'Nama produk wajib diisi' });
    }

    var statusPublikasi = 'draft';
    if (req.user.role === 'owner' && req.body.publish === true) {
        statusPublikasi = 'dipublikasikan';
    }

    try {
        const [result] = await db.query(
            'INSERT INTO produk (nama, deskripsi, spesifikasi, keunggulan, harga, harga_coret, kategori, status_publikasi, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nama, deskripsi || null, spesifikasi || null, keunggulan || null, harga || null, harga_coret || null, kategori || null, statusPublikasi, req.user.id]
        );
        res.status(201).json({ message: 'Produk berhasil dibuat', id: result.insertId, status_publikasi: statusPublikasi });
    } catch (err) {
        res.status(500).json({ message: 'Gagal membuat produk', error: err.message });
    }
};

exports.updateProduk = async function(req, res) {
    const id = req.params.id;
    const nama = req.body.nama;
    const deskripsi = req.body.deskripsi;
    const spesifikasi = req.body.spesifikasi;
    const keunggulan = req.body.keunggulan;
    const harga = req.body.harga;
    const harga_coret = req.body.harga_coret;
    const kategori = req.body.kategori;

    try {
        const [rows] = await db.query('SELECT * FROM produk WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }
        const existing = rows[0];

        if (req.user.role === 'editor') {
            if (existing.created_by !== req.user.id) {
                return res.status(403).json({ message: 'Anda hanya bisa mengedit produk milik sendiri' });
            }
            if (existing.status_publikasi === 'dipublikasikan') {
                return res.status(403).json({ message: 'Produk yang sudah dipublikasikan tidak bisa diedit langsung. Hubungi Owner.' });
            }
        }

        await db.query(
            'UPDATE produk SET nama = ?, deskripsi = ?, spesifikasi = ?, keunggulan = ?, harga = ?, harga_coret = ?, kategori = ? WHERE id = ?',
            [nama, deskripsi || null, spesifikasi || null, keunggulan || null, harga || null, harga_coret || null, kategori || null, id]
        );

        res.json({ message: 'Produk berhasil diperbarui' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal memperbarui produk', error: err.message });
    }
};

exports.deleteProduk = async function(req, res) {
    const id = req.params.id;
    try {
        const [rows] = await db.query('SELECT * FROM produk WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }
        const existing = rows[0];

        if (req.user.role === 'editor' && existing.created_by !== req.user.id) {
            return res.status(403).json({ message: 'Anda hanya bisa menghapus produk milik sendiri' });
        }

        await db.query('DELETE FROM produk WHERE id = ?', [id]);
        res.json({ message: 'Produk berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menghapus produk', error: err.message });
    }
};

exports.publishProduk = async function(req, res) {
    const id = req.params.id;
    try {
        await db.query("UPDATE produk SET status_publikasi = 'dipublikasikan' WHERE id = ?", [id]);
        res.json({ message: 'Produk berhasil dipublikasikan' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal mempublikasikan produk', error: err.message });
    }
};

exports.unpublishProduk = async function(req, res) {
    const id = req.params.id;
    try {
        await db.query("UPDATE produk SET status_publikasi = 'draft' WHERE id = ?", [id]);
        res.json({ message: 'Produk dikembalikan ke draft' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengubah status', error: err.message });
    }
};