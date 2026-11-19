const express = require('express');
const router = express.Router();
const dao = require('./studentDAO');
const requireAuth = require('./authMiddleware');

router.use(requireAuth);

router.get('/', async (req, res) => {
    try {
        const students = await dao.getAllStudents(req.session.userId);
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

router.post('/', async (req, res) => {
    const { name, marks } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Name is required.' });
    }
    if (marks === undefined || marks === null || marks === '') {
        return res.status(400).json({ error: 'Marks are required.' });
    }

    const marksNum = parseFloat(marks);
    if (isNaN(marksNum)) {
        return res.status(400).json({ error: 'Marks must be a valid number.' });
    }
    if (marksNum < 0 || marksNum > 100) {
        return res.status(400).json({ error: 'Marks must be between 0 and 100.' });
    }

    try {
        await dao.addStudent(req.session.userId, name.trim(), marksNum);
        res.status(201).json({ message: 'Student added successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { name, marks } = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID must be a valid number.' });
    }
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Name is required.' });
    }

    const marksNum = parseFloat(marks);
    if (isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
        return res.status(400).json({ error: 'Marks must be a number between 0 and 100.' });
    }

    try {
        await dao.updateStudent(id, req.session.userId, name.trim(), marksNum);
        res.json({ message: 'Student updated successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID must be a valid number.' });
    }

    try {
        await dao.deleteStudent(id, req.session.userId);
        res.json({ message: 'Student deleted successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

module.exports = router;
