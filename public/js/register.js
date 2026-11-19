async function doRegister() {
    const username        = document.getElementById('username').value.trim();
    const password        = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorBox        = document.getElementById('errorBox');
    const successBox      = document.getElementById('successBox');
    const btn             = document.getElementById('registerBtn');

    errorBox.style.display   = 'none';
    successBox.style.display = 'none';

    if (!username || !password || !confirmPassword) {
        errorBox.textContent = 'All fields are required.';
        errorBox.style.display = 'block';
        return;
    }
    if (username.length < 3) {
        errorBox.textContent = 'Username must be at least 3 characters.';
        errorBox.style.display = 'block';
        return;
    }
    if (password.length < 6) {
        errorBox.textContent = 'Password must be at least 6 characters.';
        errorBox.style.display = 'block';
        return;
    }
    if (password !== confirmPassword) {
        errorBox.textContent = 'Passwords do not match.';
        errorBox.style.display = 'block';
        return;
    }

    btn.disabled    = true;
    btn.textContent = 'Creating account…';

    try {
        const response = await fetch('/api/auth/register', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ username, password, confirmPassword })
        });

        const result = await response.json();

        if (response.ok) {
            successBox.textContent   = '✅ Account created! Redirecting to login…';
            successBox.style.display = 'block';
            setTimeout(() => { window.location.href = '/login.html'; }, 2000);
        } else {
            errorBox.textContent   = result.error || 'Registration failed.';
            errorBox.style.display = 'block';
        }

    } catch (err) {
        errorBox.textContent   = 'Could not reach the server. Is Node.js running?';
        errorBox.style.display = 'block';
    } finally {
        btn.disabled    = false;
        btn.textContent = 'Create Account';
    }
}

function togglePassword(fieldId) {
    const input = document.getElementById(fieldId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

document.getElementById('username').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('password').focus();
});
document.getElementById('password').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('confirmPassword').focus();
});
document.getElementById('confirmPassword').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') doRegister();
});
