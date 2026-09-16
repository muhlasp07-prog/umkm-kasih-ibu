const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seedSemuaRole() {
    var akunList = [
        { username: 'owner1', password: 'owner123', nama: 'Siti Rahmah', role: 'owner' },
        { username: 'admin1', password: 'admin123', nama: 'Admin Toko', role: 'admin' },
        { username: 'staff1', password: 'staff123', nama: 'Staff Gudang', role: 'staff' },
        { username: 'editor1', password: 'editor123', nama: 'Editor Konten', role: 'editor' }
    ];

    for (var i = 0; i < akunList.length; i++) {
        var akun = akunList[i];
        var hashedPassword = await bcrypt.hash(akun.password, 10);
        try {
            await db.query(
                'INSERT INTO admin_user (username, password, nama, role) VALUES (?, ?, ?, ?)',
                [akun.username, hashedPassword, akun.nama, akun.role]
            );
            console.log('Berhasil: ' + akun.username + ' (' + akun.role + ') - password: ' + akun.password);
        } catch (err) {
            console.log('Gagal ' + akun.username + ':', err.message);
        }
    }
    process.exit();
}

seedSemuaRole();