const BASE_URL = 'http://localhost:8081/TPrest/api/test/person';
let allPersons = [];

function getStatusByAge(age) {
    if (age < 18) return { text: "Minor", class: "status-minor", color: "var(--minor-color)" };
    if (age < 30) return { text: "Young Adult", class: "status-young-adult", color: "var(--young-adult-color)" };
    if (age < 50) return { text: "Adult", class: "status-adult", color: "var(--adult-color)" };
    return { text: "Senior", class: "status-senior", color: "var(--senior-color)" };
}

async function checkPersonExists(id) {
    try {
        const res = await fetch(`${BASE_URL}/${id}`, { method: 'GET', redirect: 'manual' });
        return res.status === 200;
    } catch (error) {
        console.error('Error checking person:', error);
        return false;
    }
}

function initHearts() {
    const container = document.getElementById('hearts-container');
    for (let i = 0; i < 20; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.innerHTML = '♥';
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.animationDelay = `${Math.random() * 20}s`;
        heart.style.fontSize = `${Math.random() * 20 + 15}px`;
        heart.style.opacity = `${Math.random() * 0.3 + 0.1}`;
        container.appendChild(heart);
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    const icon = toast.querySelector('i');
    if (type === 'error') {
        icon.className = 'fas fa-times-circle';
        toast.style.background = 'linear-gradient(135deg, var(--pink-delete), #ff477e)';
    } else if (type === 'warning') {
        icon.className = 'fas fa-exclamation-triangle';
        toast.style.background = 'linear-gradient(135deg, #ffb347, #ffcc33)';
    } else {
        icon.className = 'fas fa-check-circle';
        toast.style.background = 'linear-gradient(135deg, var(--primary-pink), var(--pink-accent))';
    }
    toastMsg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

function showSection(id) {
    document.querySelectorAll('section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const buttons = document.querySelectorAll('.nav-btn');
    const sectionIndex = ['dashboard', 'add', 'update', 'delete', 'search'].indexOf(id);
    if (buttons[sectionIndex]) buttons[sectionIndex].classList.add('active');
    if (id === 'dashboard') getAllPersons();
    if (id === 'add') {
        const ageInput = document.getElementById('addAge');
        ageInput.addEventListener('input', updateAddStatusPreview);
        updateAddStatusPreview();
    }
    if (id === 'update') {
        const ageInput = document.getElementById('updateAge');
        ageInput.addEventListener('input', updateUpdateStatusPreview);
        updateUpdateStatusPreview();
    }
}

function updateAddStatusPreview() {
    const age = parseInt(document.getElementById('addAge').value);
    const previewDiv = document.getElementById('addStatusPreview');
    const previewText = document.getElementById('statusPreviewText');
    if (age && age >= 1 && age <= 120) {
        const status = getStatusByAge(age);
        previewText.innerHTML = `<span class="status-badge ${status.class}">${status.text}</span>`;
        previewDiv.style.display = 'block';
    } else previewDiv.style.display = 'none';
}

function updateUpdateStatusPreview() {
    const age = parseInt(document.getElementById('updateAge').value);
    const previewDiv = document.getElementById('updateStatusPreview');
    const previewText = document.getElementById('updateStatusPreviewText');
    if (age && age >= 1 && age <= 120) {
        const status = getStatusByAge(age);
        previewText.innerHTML = `<span class="status-badge ${status.class}">${status.text}</span>`;
        previewDiv.style.display = 'block';
    } else previewDiv.style.display = 'none';
}

function updateStats(persons) {
    document.getElementById('total-count').textContent = persons.length;
    if (persons.length > 0) {
        const avgAge = Math.round(persons.reduce((sum, p) => sum + p.age, 0) / persons.length);
        document.getElementById('avg-age').textContent = avgAge;
        document.getElementById('status-minor').textContent = persons.filter(p => p.age < 18).length;
        updateAgeDistributionChart(persons);
    }
}

function updateAgeDistributionChart(persons) {
    if (persons.length === 0) return;
    const counts = {
        minor: persons.filter(p => p.age < 18).length,
        youngAdult: persons.filter(p => p.age >= 18 && p.age < 30).length,
        adult: persons.filter(p => p.age >= 30 && p.age < 50).length,
        senior: persons.filter(p => p.age >= 50).length
    };
    const total = persons.length;
    const bar = document.getElementById('ageDistributionBar');
    bar.innerHTML = '';
    [
        { count: counts.minor, color: 'var(--minor-color)' },
        { count: counts.youngAdult, color: 'var(--young-adult-color)' },
        { count: counts.adult, color: 'var(--adult-color)' },
        { count: counts.senior, color: 'var(--senior-color)' }
    ].forEach(seg => {
        if (seg.count > 0) {
            const width = (seg.count / total) * 100;
            const div = document.createElement('div');
            div.className = 'distribution-segment';
            div.style.width = `${width}%`;
            div.style.backgroundColor = seg.color;
            div.textContent = `${Math.round(width)}%`;
            div.title = `${seg.count} person(s)`;
            bar.appendChild(div);
        }
    });
}

async function getAllPersons() {
    try {
        const res = await fetch(`${BASE_URL}/all`);
        const data = await res.json();
        allPersons = data;
        const tbody = document.querySelector("#personTable tbody");
        tbody.innerHTML = '';
        data.forEach(p => {
            const status = getStatusByAge(p.age);
            tbody.innerHTML += `<tr>
                <td>#${p.id}</td>
                <td><strong>${p.name}</strong></td>
                <td>${p.age} years</td>
                <td><span class="status-badge ${status.class}">${status.text}</span></td>
            </tr>`;
        });
        updateStats(data);
        showToast(`${data.length} people loaded successfully`);
    } catch (error) {
        showToast('Error loading people', 'error');
        console.error('Error:', error);
    }
}

async function addPerson() {
    const name = document.getElementById('addName').value.trim();
    const age = parseInt(document.getElementById('addAge').value);
    if (!name || !age || age < 1 || age > 120) {
        showToast('Please enter valid name and age (1-120)', 'error');
        return;
    }
    try {
        const res = await fetch(`${BASE_URL}/add`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({name, age})
        });
        if (res.ok) {
            const status = getStatusByAge(age);
            showToast(`Person "${name}" added successfully as ${status.text}!`);
            document.getElementById('addName').value = '';
            document.getElementById('addAge').value = '';
            document.getElementById('addStatusPreview').style.display = 'none';
            getAllPersons();
            showSection('dashboard');
        } else showToast('Error adding person', 'error');
    } catch (error) {
        showToast('Network error', 'error');
        console.error('Error:', error);
    }
}

async function updatePerson() {
    const id = parseInt(document.getElementById('updateId').value);
    const name = document.getElementById('updateName').value.trim();
    const age = parseInt(document.getElementById('updateAge').value);
    if (!id || !name || !age || age < 1 || age > 120) {
        showToast('Please fill in all valid fields', 'error');
        return;
    }
    if (!await checkPersonExists(id)) {
        showToast(`Person #${id} does not exist!`, 'error');
        document.getElementById('updateId').value = '';
        document.getElementById('updateName').value = '';
        document.getElementById('updateAge').value = '';
        document.getElementById('updateStatusPreview').style.display = 'none';
        return;
    }
    try {
        const res = await fetch(`${BASE_URL}/update`, {
            method: 'PUT',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({id, name, age})
        });
        if (res.ok) {
            const status = getStatusByAge(age);
            showToast(`Person #${id} updated successfully! New status: ${status.text}`);
            document.getElementById('updateId').value = '';
            document.getElementById('updateName').value = '';
            document.getElementById('updateAge').value = '';
            document.getElementById('updateStatusPreview').style.display = 'none';
            getAllPersons();
            showSection('dashboard');
        } else showToast('Error updating person', 'error');
    } catch (error) {
        showToast('Network error', 'error');
        console.error('Error:', error);
    }
}

async function deletePerson() {
    const id = parseInt(document.getElementById('deleteId').value);
    if (!id) { showToast('Please enter a person ID', 'error'); return; }
    if (!await checkPersonExists(id)) {
        showToast(`Person #${id} does not exist!`, 'error');
        document.getElementById('deleteId').value = '';
        return;
    }
    if (!confirm(`Are you sure you want to delete person #${id}?`)) return;
    try {
        const res = await fetch(`${BASE_URL}/delete/${id}`, { method:'DELETE' });
        if (res.ok) {
            showToast(`Person #${id} deleted successfully!`);
            document.getElementById('deleteId').value = '';
            getAllPersons();
            showSection('dashboard');
        } else showToast('Error deleting person', 'error');
    } catch (error) {
        showToast('Network error', 'error');
        console.error('Error:', error);
    }
}

async function deletePersonFromSearch(id, name) {
    if (!confirm(`Delete "${name}" (ID: #${id})?`)) return;
    try {
        const res = await fetch(`${BASE_URL}/delete/${id}`, { method:'DELETE' });
        if (res.ok) {
            showToast(`Person #${id} deleted successfully!`);
            if (document.getElementById('searchId').value) searchById();
            else if (document.getElementById('searchName').value) searchByName();
            getAllPersons();
        } else showToast('Error deleting person', 'error');
    } catch (error) {
        showToast('Network error', 'error');
        console.error('Error:', error);
    }
}

async function searchById() {
    const id = parseInt(document.getElementById('searchId').value);
    if (!id) { showToast('Please enter a person ID', 'error'); return; }
    try {
        const res = await fetch(`${BASE_URL}/${id}`);
        if (res.status === 404) { showToast(`Person #${id} not found`, 'error'); return; }
        const p = await res.json();
        displaySearchResult([p]);
        showToast(`Found person #${id}`);
    } catch (error) {
        showToast('Error searching for person', 'error');
        console.error('Error:', error);
    }
}

async function searchByName() {
    const name = document.getElementById('searchName').value.trim();
    if (!name) { showToast('Please enter a name', 'error'); return; }
    try {
        const res = await fetch(`${BASE_URL}/name/${name}`);
        const p = await res.json();
        if (p && p.id) { displaySearchResult([p]); showToast(`Found "${name}"`); }
        else showToast(`No person named "${name}" found`, 'error');
    } catch (error) {
        showToast('Error searching for person', 'error');
        console.error('Error:', error);
    }
}

function displaySearchResult(persons) {
    const tbody = document.querySelector("#searchTable tbody");
    tbody.innerHTML = '';
    persons.forEach(p => {
        if (!p) return;
        const status = getStatusByAge(p.age);
        tbody.innerHTML += `<tr>
            <td>#${p.id}</td>
            <td><strong>${p.name}</strong></td>
            <td>${p.age} years</td>
            <td><span class="status-badge ${status.class}">${status.text}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-pink-edit" onclick="document.getElementById('updateId').value = ${p.id}; document.getElementById('updateName').value = '${p.name.replace(/'/g, "\\'")}'; document.getElementById('updateAge').value = ${p.age}; showSection('update');">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-pink-delete" onclick="deletePersonFromSearch(${p.id}, '${p.name.replace(/'/g, "\\'")}')">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </div>
            </td>
        </tr>`;
    });
}

window.onload = function() {
    initHearts();
    getAllPersons();
    document.getElementById('addAge').addEventListener('input', updateAddStatusPreview);
    document.getElementById('updateAge').addEventListener('input', updateUpdateStatusPreview);
};
