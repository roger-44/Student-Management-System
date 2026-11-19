const pool = require('./db');
const bcrypt = require('bcryptjs');

async function getUserByUsername(username) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
}

async function createDefaultAdmin() {
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', ['admin']);
    if (rows.length === 0) {
        const hash = await bcrypt.hash('admin123', 10);
        await pool.execute('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', hash]);
        console.log('  Default admin created → username: admin  |  password: admin123');
    }
}

async function registerUser(username, password) {
    const existing = await getUserByUsername(username);
    if (existing) {
        throw new Error('Username already taken.');
    }
    const hash = await bcrypt.hash(password, 10);
    await pool.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash]);
}

module.exports = { getUserByUsername, createDefaultAdmin, registerUser };
