const mysql = require('mysql2');

const pool = mysql.createPool({
    dateStrings: true,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'umkm_bima',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();