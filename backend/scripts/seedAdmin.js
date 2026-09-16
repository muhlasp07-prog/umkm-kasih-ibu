const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seedAdmin() {
    const username = 'sitirahmah';
    const passwordPlain = 'kasihibu123';
    const nama = 'Siti Rahmah';
    const role = 'superadmin';

    const hashedPassword = await bcrypt.hash(passwordPlain, 10);

    try {
        await db.query(
            'INSERT INTO admin_user (username, password, nama, role) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, nama, role]
        );
        console.log('Admin berhasil dibuat! Username: admin, Password: admin123');
    } catch (err) {
        console.log('Gagal:', err.message);
    }
    process.exit();
}

seedAdmin();