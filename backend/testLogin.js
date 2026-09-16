const http = require('http');

const data = JSON.stringify({
    username: 'admin',
    password: 'admin123'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
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