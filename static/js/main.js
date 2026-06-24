document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initDarkMode();

    // --- NUEVO: Lógica de carga inicial ---
    // Si la URL tiene un hash (ej: index.html#suppliers), carga esa.
    // Si no, carga 'dashboard' por defecto.
    const initialTab = window.location.hash ? window.location.hash.substring(1) : 'dashboard';
    switchTab(initialTab);
    // --------------------------------------

    // Alternancia de la barra lateral
    const brandInfo = document.querySelector('.brand-info');
    const sidebar = document.querySelector('.sidebar');
    if (brandInfo && sidebar) {
        brandInfo.addEventListener('click', () => {
            sidebar.classList.toggle('expanded');
        });
    }

    // Inicializar reloj
    updateDashboardDateTime();
    setInterval(updateDashboardDateTime, 1000);
});

// --- DYNAMIC CLOCK FOR DASHBOARD ---
function updateDashboardDateTime() {
    const dateTextEl = document.getElementById('db-date-text');
    if (!dateTextEl) return;

    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };

    let dateString = now.toLocaleDateString('es-ES', options);
    // Capitalizar primera letra
    dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);

    dateTextEl.textContent = dateString;
}

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

function initDarkMode() {
    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (!toggleBtn) return;

    // Cargar preferencia guardada
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            icon.className = 'fa-solid fa-sun';
        }
    }

    toggleBtn.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme');
        const icon = toggleBtn.querySelector('i');
        if (theme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            if (icon) icon.className = 'fa-solid fa-moon';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            if (icon) icon.className = 'fa-solid fa-sun';
        }
    });
}


