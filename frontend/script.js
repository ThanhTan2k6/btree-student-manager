const studentDatabase = new Map(); 

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerHTML = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1500);
}

function initSvgLayer() {
    const svg = document.getElementById('svg-layer');
    svg.innerHTML = `
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#2c3e50" />
            </marker>
        </defs>
    `;
}

function drawArrows(node) {
    if (!node || !node.children || node.children.length === 0) return;

    const parentEl = document.getElementById(`node-${node.id}`);
    const containerEl = document.getElementById('treeView');
    const svg = document.getElementById('svg-layer');

    if (!parentEl || !containerEl) return;

    const parentRect = parentEl.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();

    const startX = parentRect.left + parentRect.width / 2 - containerRect.left + containerEl.scrollLeft;
    const startY = parentRect.bottom - containerRect.top + containerEl.scrollTop;

    node.children.forEach(child => {
        const childEl = document.getElementById(`node-${child.id}`);
        if (childEl) {
            const childRect = childEl.getBoundingClientRect();
            
            const endX = childRect.left + childRect.width / 2 - containerRect.left + containerEl.scrollLeft;
            const endY = childRect.top - containerRect.top + containerEl.scrollTop;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const curveY = Math.abs(endY - startY) / 2;
            const d = `M ${startX} ${startY} C ${startX} ${startY + curveY}, ${endX} ${endY - curveY}, ${endX} ${endY}`;
            
            path.setAttribute('d', d);
            path.setAttribute('class', 'animated-arrow');
            path.setAttribute('marker-end', 'url(#arrowhead)');
            svg.appendChild(path);
        }
        
        drawArrows(child);
    });
}

function buildTreeHTML(node) {
    if (!node || node.keys.length === 0) return '';
    
    let containerHtml = `<div style="display: flex; flex-direction: column; align-items: center; gap: 40px;">`;

    let nodeHtml = `<div class="node" id="node-${node.id}">`;
    node.keys.forEach(key => { nodeHtml += `<div class="key">${key}</div>`; });
    nodeHtml += `</div>`;

    let childrenHtml = '';
    if (!node.leaf && node.children && node.children.length > 0) {
        childrenHtml += `<div class="tree-level" style="display: flex; justify-content: center; gap: 50px; margin-bottom: 0;">`;
        node.children.forEach(child => {
            childrenHtml += buildTreeHTML(child);
        });
        childrenHtml += `</div>`;
    }

    containerHtml += nodeHtml + childrenHtml + `</div>`;
    return containerHtml;
}

async function handleAddStudent() {
    const idInput = document.getElementById('svId');
    const nameInput = document.getElementById('svName');
    const genderInput = document.getElementById('svGender');
    const btn = document.getElementById('addBtn');

    const id = idInput.value.trim();
    const name = nameInput.value.trim();
    const gender = genderInput.value;

    if (!id || !name) {
        alert("Vui lòng nhập đủ Mã SV và Họ Tên!");
        return;
    }
    if (studentDatabase.has(id)) {
        alert("Mã SV đã tồn tại trong hệ thống!");
        return;
    }

    btn.disabled = true; idInput.disabled = true; nameInput.disabled = true; genderInput.disabled = true;

    try {
        const response = await fetch('http://127.0.0.1:5000/api/insert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });

        const result = await response.json();

        if (result.status === "success") {
            studentDatabase.set(id, { name, gender });
            renderTable();

            // Xóa rỗng SVG cũ và vẽ lại khung cây HTML
            initSvgLayer();
            const container = document.getElementById('treeContent');
            container.innerHTML = buildTreeHTML(result.tree);

            // Đợi HTML render xong (50ms) rồi tính toán tọa độ để bắn tia SVG
            setTimeout(() => {
                drawArrows(result.tree);
            }, 50);

            showToast(result.message);
            idInput.value = ''; nameInput.value = '';
        }
    } catch (error) {
        console.error(error);
        alert("Lỗi kết nối! Kiểm tra xem server app.py đã chạy chưa nhé.");
    } finally {
        btn.disabled = false; idInput.disabled = false; nameInput.disabled = false; genderInput.disabled = false;
        idInput.focus();
    }
}

function renderTable() {
    const tbody = document.getElementById('tableView');
    tbody.innerHTML = '';
    studentDatabase.forEach((data, id) => {
        tbody.innerHTML += `<tr><td><strong>${id}</strong></td><td>${data.name}</td><td>${data.gender}</td></tr>`;
    });
}

async function handleSearchStudent() {
    const idInput = document.getElementById('svId');
    const id = idInput.value.trim();

    if (!id) return alert("Vui lòng nhập Mã SV cần tìm!");

    try {
        const response = await fetch('http://127.0.0.1:5000/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        const result = await response.json();

        if (result.status === "success") {
            document.querySelectorAll('.node').forEach(el => el.classList.remove('search-path', 'search-found'));
            document.querySelectorAll('tr').forEach(el => el.classList.remove('row-found'));

            const path = result.path;
            
            for (let i = 0; i < path.length; i++) {
                const nodeEl = document.getElementById(`node-${path[i]}`);
                if (nodeEl) {
                    nodeEl.classList.add('search-path');
                    await new Promise(r => setTimeout(r, 600));
                    nodeEl.classList.remove('search-path');
                }
            }

            if (result.found) {
                const finalNode = document.getElementById(`node-${path[path.length - 1]}`);
                if (finalNode) finalNode.classList.add('search-found');
                const row = document.getElementById(`row-${id}`);
                if (row) {
                    row.classList.add('row-found');
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                showToast(`Đã tìm thấy Mã SV: <strong>${id}</strong>`);
            } else {
                showToast(`Không tìm thấy Mã SV: <strong>${id}</strong>`);
            }
        }
    } catch (error) {
        console.error(error);
        alert("Lỗi kết nối Server Python!");
    }
}

async function handleDeleteStudent() {
    const idInput = document.getElementById('svId');
    const id = idInput.value.trim();

    if (!id) return alert("Vui lòng nhập Mã SV cần xóa!");
    if (!studentDatabase.has(id)) return alert("Mã SV này không tồn tại trong hệ thống!");

    if (!confirm(`Bạn có chắc chắn muốn xóa sinh viên ${id}?`)) return;

    try {
        const response = await fetch('http://127.0.0.1:5000/api/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        const result = await response.json();

        if (result.status === "success") {
            studentDatabase.delete(id);
            renderTable();
            initSvgLayer();
            const container = document.getElementById('treeContent');
            container.innerHTML = buildTreeHTML(result.tree);
            setTimeout(() => { drawArrows(result.tree); }, 50);
            showToast(`${result.message}`);
            idInput.value = '';
        }
    } catch (error) {
        console.error(error);
        alert("Lỗi kết nối Server Python!");
    }
}

function renderTable() {
    const tbody = document.getElementById('tableView');
    tbody.innerHTML = '';
    studentDatabase.forEach((data, id) => {
        tbody.innerHTML += `<tr id="row-${id}">
            <td><strong>${id}</strong></td>
            <td>${data.name}</td>
            <td>${data.gender}</td>
        </tr>`;
    });
}