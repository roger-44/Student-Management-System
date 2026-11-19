require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const studentRoutes = require('./routes');
const authRoutes = require('./authRoutes');
const { initDatabase } = require('./dbInit');
const { createDefaultAdmin } = require('./authDAO');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, async () => {
    console.log('');
    console.log('  🎓 Student Management System');
    console.log('  ─────────────────────────────');
    console.log(`  Server running on port: ${PORT}`);
    try {
        await initDatabase();
        await createDefaultAdmin();
    } catch (err) {
        console.error('  Database initialization error:', err.message);
    }
    console.log('');
});

module.exports = app;
