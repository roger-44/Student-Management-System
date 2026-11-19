const pool = require('./db');

function calculateGrade(percentage) {
    if (percentage >= 90) return 'O';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
}

async function getAllStudents(userId) {
    const [rows] = await pool.execute('SELECT * FROM students WHERE user_id = ?', [userId]);
    return rows;
}

async function addStudent(userId, name, marks) {
    const percentage = (marks / 100) * 100;
    const grade = calculateGrade(percentage);
    const sql = 'INSERT INTO students (user_id, name, marks, percentage, grade) VALUES (?, ?, ?, ?, ?)';
    await pool.execute(sql, [userId, name, marks, percentage, grade]);
}

async function updateStudent(id, userId, name, marks) {
    const percentage = (marks / 100) * 100;
    const grade = calculateGrade(percentage);
    const sql = 'UPDATE students SET name = ?, marks = ?, percentage = ?, grade = ? WHERE id = ? AND user_id = ?';
    await pool.execute(sql, [name, marks, percentage, grade, id, userId]);
}

async function deleteStudent(id, userId) {
    await pool.execute('DELETE FROM students WHERE id = ? AND user_id = ?', [id, userId]);
}

module.exports = { getAllStudents, addStudent, updateStudent, deleteStudent };
