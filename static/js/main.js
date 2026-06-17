document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    
    // Establecer el título inicial del encabezado a partir del elemento activo
    const activeMenu = document.querySelector('.menu-item.active');
    if (activeMenu) {
        const titleEl = document.getElementById('current-tab-title');
        const textEl = activeMenu.querySelector('.menu-text');
        if (titleEl && textEl) {
            titleEl.textContent = textEl.textContent;
        }
    }

    // Alternancia de la barra lateral (Collapse/Expand) al hacer clic en el logo
    const brandInfo = document.querySelector('.brand-info');
    const sidebar = document.querySelector('.sidebar');
    if (brandInfo && sidebar) {
        brandInfo.addEventListener('click', () => {
            sidebar.classList.toggle('expanded');
        });
    }
});

// --- UTILERÍA DE ALERTAS ---
function showAlert(message, type = 'success') {
    const container = document.getElementById('alert-container');
    if (!container) return;
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <span>${message}</span>
        <button class="alert-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    container.appendChild(alert);
    
    // Auto-eliminar después de 4 segundos
    setTimeout(() => {
        alert.remove();
    }, 4000);
}

// --- SISTEMA DE PESTAÑAS (SPA) ---
function initTabs() {
    const menuItems = document.querySelectorAll('.menu-item');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const tabTitle = document.getElementById('current-tab-title');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = item.getAttribute('data-tab');

            // Actualizar menú activo
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');

            // Mostrar panel correcto
            tabPanels.forEach(panel => {
                if (panel.id === targetTab) {
                    panel.classList.add('active');
                } else {
                    panel.classList.remove('active');
                }
            });

            // Actualizar título de barra superior
            const textEl = item.querySelector('.menu-text');
            if (tabTitle && textEl) {
                tabTitle.textContent = textEl.textContent;
            }
        });
    });
}

// --- SIMULACIÓN DE REGISTRO DE PROVEEDOR ---
function addSupplierSimulated() {
    const codeInput = document.getElementById('sup-code');
    const nameInput = document.getElementById('sup-name');
    const legalInput = document.getElementById('sup-legal');

    if (!codeInput || !nameInput || !legalInput) return;

    const code = codeInput.value.trim();
    const name = nameInput.value.trim();
    const legal = legalInput.value.trim();

    if (!code || !name || !legal) {
        showAlert('Por favor, rellene todos los campos requeridos.', 'danger');
        return;
    }

    const tbody = document.getElementById('suppliers-table-body');
    if (tbody) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code>${code}</code></td>
            <td><strong>${name}</strong></td>
            <td>${legal}</td>
        `;
        // Insertar al inicio de la tabla
        tbody.insertBefore(tr, tbody.firstChild);
        
        showAlert('Proveedor registrado con éxito');
        
        // Limpiar formulario
        document.getElementById('supplier-form').reset();
    }
}


