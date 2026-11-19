const API_URL = '/api/students';

async function checkAuth() {
    const res = await fetch('/api/auth/me');
    if (res.status === 401) {
        window.location.href = '/login.html';
        return;
    }
    const data = await res.json();
    document.getElementById('userLabel').textContent = '👤 ' + data.username;
}

async function doLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login.html';
}

function $(id) {
    return document.getElementById(id);
}

function calculateGrade(percentage) {
    if (percentage >= 90) return 'O';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
}

function gradeBadgeHTML(grade) {
    return `<span class="grade-badge grade-${grade}">${grade}</span>`;
}

function showMessage(text, type) {
    const box = $('formMessage');
    box.textContent = text;
    box.className = 'form-message ' + type;
    box.style.display = 'block';
    setTimeout(() => { box.style.display = 'none'; }, 4000);
}

function clearForm() {
    $('studentName').value = '';
    $('studentMarks').value = '';
    $('previewBadge').textContent = '—';
    $('previewBadge').className = 'preview-badge';
}

$('studentMarks').addEventListener('input', function () {
    const marks = parseFloat(this.value);
    const badge = $('previewBadge');

    if (isNaN(marks) || this.value === '') {
        badge.textContent = '—';
        badge.className = 'preview-badge';
        return;
    }

    const grade = calculateGrade(marks);
    badge.textContent = grade;
    badge.className = `preview-badge grade-badge grade-${grade}`;
});

async function loadStudents() {
    try {
        const response = await fetch(API_URL);
        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }
        const students = await response.json();
        renderTable(students);
    } catch (error) {
        console.error('Failed to load students:', error);
    }
}

function renderTable(students) {
    const tbody = $('studentTableBody');
    const emptyState = $('emptyState');
    const recordCount = $('recordCount');

    recordCount.textContent = students.length + (students.length === 1 ? ' student' : ' students');

    if (students.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    let html = '';
    students.forEach(function (student, index) {
        html += `
        <tr id="row-${student.id}">
            <td>${index + 1}</td>
            <td data-field="name">${student.name}</td>
            <td data-field="marks">${student.marks}</td>
            <td>${parseFloat(student.percentage).toFixed(2)}%</td>
            <td>${gradeBadgeHTML(student.grade)}</td>
            <td>
                <div style="display:flex; gap:6px;">
                    <button class="btn btn-edit" onclick="startEdit(${student.id})">✏️ Edit</button>
                    <button class="btn btn-delete" onclick="deleteStudent(${student.id})">🗑️ Delete</button>
                </div>
            </td>
        </tr>`;
    });

    tbody.innerHTML = html;
}

async function addStudent() {
    const name = $('studentName').value.trim();
    const marks = $('studentMarks').value.trim();

    if (!name) {
        showMessage("Please enter the student's name.", 'error');
        $('studentName').focus();
        return;
    }
    if (!marks || isNaN(parseFloat(marks))) {
        showMessage('Please enter a valid marks value.', 'error');
        $('studentMarks').focus();
        return;
    }
    if (parseFloat(marks) < 0 || parseFloat(marks) > 100) {
        showMessage('Marks must be between 0 and 100.', 'error');
        return;
    }

    const addBtn = $('addBtn');
    addBtn.disabled = true;
    addBtn.textContent = 'Saving…';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, marks: parseFloat(marks) })
        });

        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        const result = await response.json();

        if (response.ok) {
            showMessage('✅ Student added successfully!', 'success');
            clearForm();
            loadStudents();
        } else {
            showMessage('❌ Error: ' + (result.error || 'Something went wrong.'), 'error');
        }

    } catch (error) {
        showMessage('❌ Could not reach the server.', 'error');
    } finally {
        addBtn.disabled = false;
        addBtn.textContent = 'Add Student';
    }
}

async function deleteStudent(id) {
    const confirmed = window.confirm('Delete this student? This cannot be undone.');
    if (!confirmed) return;

    try {
        const response = await fetch(API_URL + '/' + id, { method: 'DELETE' });

        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        const result = await response.json();

        if (response.ok) {
            showMessage('🗑️ Student deleted.', 'success');
            loadStudents();
        } else {
            showMessage('❌ Error: ' + (result.error || 'Could not delete.'), 'error');
        }

    } catch (error) {
        showMessage('❌ Could not reach the server.', 'error');
    }
}

function startEdit(id) {
    const row = document.getElementById('row-' + id);
    const currentName = row.querySelector("[data-field='name']").textContent;
    const currentMarks = row.querySelector("[data-field='marks']").textContent;

    row.querySelector("[data-field='name']").innerHTML =
        `<input type="text" id="edit-name-${id}" value="${currentName}"
                style="width:100%; padding:4px 8px; border:1.5px solid #2563eb;
                       border-radius:6px; font-size:0.88rem;" />`;

    row.querySelector("[data-field='marks']").innerHTML =
        `<input type="number" id="edit-marks-${id}" value="${currentMarks}"
                min="0" max="100" step="0.01"
                style="width:80px; padding:4px 8px; border:1.5px solid #2563eb;
                       border-radius:6px; font-size:0.88rem;" />`;

    const actionCell = row.cells[row.cells.length - 1];
    actionCell.innerHTML = `
        <div style="display:flex; gap:6px;">
            <button class="btn btn-edit"
                    onclick="saveEdit(${id})"
                    style="background:#dcfce7; color:#15803d; border-color:#86efac;">
                💾 Save
            </button>
            <button class="btn btn-delete" onclick="cancelEdit(${id})">✕ Cancel</button>
        </div>`;

    document.getElementById('edit-name-' + id).focus();
}

async function saveEdit(id) {
    const name = document.getElementById('edit-name-' + id).value.trim();
    const marks = document.getElementById('edit-marks-' + id).value.trim();

    if (!name || !marks) {
        alert('Name and marks cannot be empty.');
        return;
    }
    if (parseFloat(marks) < 0 || parseFloat(marks) > 100) {
        alert('Marks must be between 0 and 100.');
        return;
    }

    try {
        const response = await fetch(API_URL + '/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, marks: parseFloat(marks) })
        });

        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        const result = await response.json();

        if (response.ok) {
            showMessage('✅ Student updated successfully!', 'success');
            loadStudents();
        } else {
            showMessage('❌ Error: ' + (result.error || 'Could not update.'), 'error');
        }

    } catch (error) {
        showMessage('❌ Could not reach the server.', 'error');
    }
}

function cancelEdit(id) {
    loadStudents();
}

$('studentName').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') $('studentMarks').focus();
});

$('studentMarks').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addStudent();
});

checkAuth();
loadStudents();
