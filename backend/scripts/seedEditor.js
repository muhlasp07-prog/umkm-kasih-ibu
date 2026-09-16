const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seedEditor() {
    var username = 'muhlas';
    var passwordPlain = 'bappeda123';
    var nama = 'Editor Konten';
    var role = 'editor';

    var hashedPassword = await bcrypt.hash(passwordPlain, 10);

    try {
        await db.query(
            'INSERT INTO admin_user (username, password, nama, role) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, nama, role]
        );
        console.log('Editor berhasil dibuat! Username: ' + username + ', Password: ' + passwordPlain);
    } catch (err) {
        console.log('Gagal:', err.message);
    }
    process.exit();
}

seedEditor();