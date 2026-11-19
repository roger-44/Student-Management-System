async function doLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorBox = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');

    errorBox.style.display = 'none';

    if (!username || !password) {
        errorBox.textContent = 'Please enter your username and password.';
        errorBox.style.display = 'block';
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Signing in…';

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok) {
            window.location.href = '/';
        } else {
            errorBox.textContent = result.error || 'Login failed.';
            errorBox.style.display = 'block';
        }

    } catch (err) {
        errorBox.textContent = 'Could not reach the server. Is Node.js running?';
        errorBox.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Sign In';
    }
}

function togglePassword() {
    const input = document.getElementById('password');
    input.type = input.type === 'password' ? 'text' : 'password';
}

document.getElementById('username').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('password').focus();
});

document.getElementById('password').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') doLogin();
});
