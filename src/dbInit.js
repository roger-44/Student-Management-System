const pool = require('./db');

async function initDatabase() {
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id       INT          NOT NULL AUTO_INCREMENT,
            username VARCHAR(50)  NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            PRIMARY KEY (id)
        )
    `);

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS students (
            id          INT           NOT NULL AUTO_INCREMENT,
            user_id     INT           NOT NULL,
            name        VARCHAR(100)  NOT NULL,
            marks       DECIMAL(5,2)  NOT NULL,
            percentage  DECIMAL(5,2)  NOT NULL,
            grade       VARCHAR(5)    NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    const [cols] = await pool.execute(`
        SELECT COUNT(*) AS cnt
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = 'students'
          AND COLUMN_NAME  = 'user_id'
    `);

    if (cols[0].cnt === 0) {
        await pool.execute('ALTER TABLE students ADD COLUMN user_id INT NOT NULL DEFAULT 1 AFTER id');
        console.log('  Migrated: added user_id column to students table.');
    }
}

module.exports = { initDatabase };
