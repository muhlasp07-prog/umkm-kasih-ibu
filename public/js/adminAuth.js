var API_URL = API_BASE + '/api/auth/login';

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var errorBox = document.getElementById('error-msg');

    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(function(res) { return res.json().then(function(data) { return { status: res.status, body: data }; }); })
    .then(function(result) {
        if (result.status !== 200) {
            errorBox.textContent = result.body.message || 'Login gagal';
            errorBox.style.display = 'block';
            return;
        }
        localStorage.setItem('admin_token', result.body.token);
        localStorage.setItem('admin_nama', result.body.user.nama);
        localStorage.setItem('admin_role', result.body.user.role);
        localStorage.setItem('admin_id', result.body.user.id);
        window.location.href = 'dashboard.html';
    })
    .catch(function(err) {
        errorBox.textContent = 'Gagal terhubung ke server: ' + err.message;
        errorBox.style.display = 'block';
    });
});

document.getElementById('toggle-password').addEventListener('click', function() {
    var input = document.getElementById('password');
    if (input.type === 'password') {
        input.type = 'text';
        this.style.opacity = '1';
    } else {
        input.type = 'password';
        this.style.opacity = '0.5';
    }
});