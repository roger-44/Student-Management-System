const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const authDAO = require('./authDAO');

const JWT_SECRET = process.env.JWT_SECRET || 'sms-jwt-super-secret-key-2026';

router.post('/register', async (req, res) => {
    const { username, password, confirmPassword } = req.body;

    if (!username || !password || !confirmPassword) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    if (username.trim().length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
    }

    try {
        await authDAO.registerUser(username.trim(), password);
        res.status(201).json({ message: 'Account created successfully! You can now log in.' });
    } catch (err) {
        res.status(409).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = await authDAO.getUserByUsername(username.trim());

    if (!user) {
        return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '8h' }
    );

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000
    });

    res.json({ message: 'Login successful.', username: user.username });
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully.' });
});

router.get('/me', (req, res) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ error: 'Not logged in.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return res.json({ username: decoded.username });
    } catch (err) {
        return res.status(401).json({ error: 'Invalid session.' });
    }
});

module.exports = router;
