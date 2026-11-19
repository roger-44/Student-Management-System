require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host:     process.env.DB_HOST || 'localhost',
    user:     process.env.DB_USERNAME || process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'Amit1234',
    database: process.env.DB_DATABASE || process.env.DB_NAME || 'student_db',
    port:     Number(process.env.DB_PORT) || 3306,
    ssl:      process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: true },
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

module.exports = pool;
