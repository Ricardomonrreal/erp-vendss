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
function switchTab(tabId) {
    const menuItems = document.querySelectorAll('.menu-item');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const tabTitle = document.getElementById('current-tab-title');
    const breadcrumb = document.getElementById('breadcrumb-back');

    // 1. Actualizar estado activo en el menú lateral
    let activeItem = null;
    menuItems.forEach(item => {
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
            activeItem = item;
        } else {
            item.classList.remove('active');
        }
    });

    // 2. Mostrar el panel correspondiente
    tabPanels.forEach(panel => {
        if (panel.id === tabId) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });

    // 3. Controlar la visibilidad de la miga de pan "Volver al Dashboard"
    if (breadcrumb) {
        if (tabId === 'dashboard') {
            breadcrumb.style.display = 'none';
        } else {
            breadcrumb.style.display = 'inline-flex';
        }
    }

    // 4. Actualizar título de la barra superior
    if (tabTitle) {
        if (activeItem) {
            const textEl = activeItem.querySelector('.menu-text');
            if (textEl) {
                tabTitle.textContent = textEl.textContent;
            }
        } else {
            // Mapeo para pestañas que no se encuentran directamente en la barra lateral
            const customTitles = {
                'materia-prima': 'Materias Primas',
                'subreceta': 'Subrecetas',
                'solicitud-compra': 'Solicitudes de Compra'
            };
            tabTitle.textContent = customTitles[tabId] || tabId;
        }
    }
}

// Exponer de forma global para que el onclick del HTML pueda acceder a la función
window.switchTab = switchTab;

function initTabs() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = item.getAttribute('data-tab');
            switchTab(targetTab);
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


