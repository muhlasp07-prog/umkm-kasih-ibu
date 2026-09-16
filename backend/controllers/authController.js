const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.login = async function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username dan password wajib diisi' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM admin_user WHERE username = ?', [username]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        const admin = rows[0];
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        const token = jwt.sign(
            { id: admin.id, username: admin.username, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            message: 'Login berhasil',
            token: token,
            user: { id: admin.id, nama: admin.nama, role: admin.role }
        });
    } catch (err) {
        res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
    }
};

exports.changePassword = async function(req, res) {
    var oldPassword = req.body.oldPassword;
    var newPassword = req.body.newPassword;
    var userId = req.user.id;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Password lama dan baru wajib diisi' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password baru minimal 6 karakter' });
    }

    try {
        var [rows] = await db.query('SELECT * FROM admin_user WHERE id = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        var isMatch = await bcrypt.compare(oldPassword, rows[0].password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Password lama salah' });
        }

        var hashedNew = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE admin_user SET password = ? WHERE id = ?', [hashedNew, userId]);

        res.json({ message: 'Password berhasil diubah' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengubah password', error: err.message });
    }
};