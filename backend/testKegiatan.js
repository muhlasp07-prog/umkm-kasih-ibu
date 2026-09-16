const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJzdXBlcmFkbWluIiwiaWF0IjoxNzg4NTIxOTM4LCJleHAiOjE3ODg1NTA3Mzh9.ChQ-BaofkaI1I6wnxaN8LjtbNGYNnMqEgLHIQyLHwAE';

const data = JSON.stringify({
    sesi_ke: 1,
    kecamatan: 'Lambu',
    tanggal: '2026-04-23',
    status: 'selesai',
    pejabat_hadir: 'Bupati, Wakil Bupati, Camat Lambu',
    ringkasan: 'Kunjungan perdana Selasa Menyapa 2026, disambut tarian Hadrah',
    desa: ['Desa Simpasai', 'Desa Sangga']
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/kegiatan',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': 'Bearer ' + token
    }
};

const req = http.request(options, function(res) {
    let body = '';
    res.on('data', function(chunk) {
        body += chunk;
    });
    res.on('end', function() {
        console.log('Hasil:', body);
    });
});

req.on('error', function(err) {
    console.log('Error:', err.message);
});

req.write(data);
req.end();