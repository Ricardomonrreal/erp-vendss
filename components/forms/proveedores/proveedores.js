/* --- LÓGICA DE NEGOCIO Y NAVEGACIÓN POR PASOS (WIZARD) --- */

// Registro de archivos cargados localmente (simulado)
let uploadedFiles = {
    'sat-constancia': null,
    'sat-opinion': null,
    'domicilio': null,
    'identificacion': null,
    'acta': null,
    'cuenta': null,
    'autorizacion': null
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('sup-code')) {
        initWizard();
    }
});

function initWizard() {
    // 1. Mostrar Paso 1 e iniciar indicadores
    goToStep(1);

    // 2. Formateador dinámico para la CLABE
    const clabeInput = document.getElementById('sup-clabe');
    if (clabeInput) {
        clabeInput.addEventListener('input', (e) => {
            let value = e.target.value;
            let digits = value.replace(/\D/g, '');
            if (digits.length > 18) {
                digits = digits.substring(0, 18);
            }
            let formatted = '';
            if (digits.length > 0) formatted += digits.substring(0, 4);
            if (digits.length > 4) formatted += ' ' + digits.substring(4, 8);
            if (digits.length > 8) formatted += ' ' + digits.substring(8, 12);
            if (digits.length > 12) formatted += ' ' + digits.substring(12, 16);
            if (digits.length > 16) formatted += ' ' + digits.substring(16, 18);
            e.target.value = formatted;
        });
    }

    // 3. Limpiar is-invalid al escribir/cambiar en cualquier campo del formulario
    const form = document.getElementById('supplier-form');
    if (form) {
        form.addEventListener('input', (e) => {
            if (e.target.classList.contains('is-invalid')) {
                e.target.classList.remove('is-invalid');
            }
        });
        form.addEventListener('change', (e) => {
            if (e.target.classList.contains('is-invalid')) {
                e.target.classList.remove('is-invalid');
            }
        });
    }

    // 4. Inicializar los inputs de archivos del Paso 2
    initFileUploads();
}

// --- VALIDACIÓN DE CAMPOS OBLIGATORIOS (PASO 1) ---
function validateStep1Fields() {
    // IDs de los campos obligatorios del Paso 1
    // Opcionales: sup-correo, sup-dir-entrega, sup-credito, sup-minimo
    const requiredFields = [
        'sup-code',
        'sup-name',
        'sup-legal',
        'sup-rfc',
        'sup-regimen',
        'sup-tipo',
        'sup-categoria',
        'sup-estatus',
        'sup-contacto',
        'sup-whatsapp',
        'sup-telefono',
        'sup-dir-fiscal',
        'sup-condicion-pago',
        'sup-entrega'
    ];

    let isValid = true;
    let firstInvalidEl = null;

    requiredFields.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const val = el.value.trim();
        if (!val) {
            el.classList.add('is-invalid');
            if (!firstInvalidEl) firstInvalidEl = el;
            isValid = false;
        } else {
            el.classList.remove('is-invalid');
        }
    });

    if (!isValid && firstInvalidEl) {
        firstInvalidEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalidEl.focus();
        if (typeof showAlert === 'function') {
            showAlert('Por favor, completa todos los campos obligatorios (*) antes de continuar.', 'danger');
        }
    }

    return isValid;
}

// --- VALIDACIÓN DE DOCUMENTOS OBLIGATORIOS (PASO 2) ---
function validateStep2Files() {
    // Documentos requeridos — acta es el único opcional
    const requiredDocs = [
        'sat-constancia',
        'lista-precios',
        'fichas-tecnicas',
        'sds'
    ];

    let isValid = true;
    let firstInvalidCard = null;

    requiredDocs.forEach(key => {
        const nameEl = document.getElementById(`file-name-${key}`);
        const cardEl = nameEl ? nameEl.closest('.upload-card') : null;
        if (!cardEl) return;
        if (!uploadedFiles[key]) {
            cardEl.classList.add('is-invalid');
            if (!firstInvalidCard) firstInvalidCard = cardEl;
            isValid = false;
        } else {
            cardEl.classList.remove('is-invalid');
        }
    });

    if (!isValid && firstInvalidCard) {
        firstInvalidCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (typeof showAlert === 'function') {
            showAlert('Por favor, sube todos los documentos obligatorios (*) antes de continuar.', 'danger');
        }
    }

    return isValid;
}

// --- NAVEGACIÓN Y VALIDACIÓN DEL WIZARD ---
function goToStep(step) {
    // Obtener el paso activo actual para saber si estamos avanzando o retrocediendo
    const currentActiveContent = document.querySelector('.wizard-step-content.active');
    const currentStep = currentActiveContent ? parseInt(currentActiveContent.id.replace('step-', '')) : 1;

    // Solo validar al avanzar, nunca al retroceder
    if (step > currentStep) {
        if (currentStep === 1) {
            if (!validateStep1Fields()) return;
        }
        if (currentStep === 2) {
            if (!validateStep2Files()) return;
        }
    }

    // 1. Ocultar todos los contenedores de paso
    const stepContents = document.querySelectorAll('.wizard-step-content');
    stepContents.forEach(el => el.classList.remove('active'));

    // 2. Mostrar el paso correspondiente
    const activeStepContent = document.getElementById(`step-${step}`);
    if (activeStepContent) {
        activeStepContent.classList.add('active');
    }

    // 3. Mostrar/ocultar los botones de navegación superiores
    for (let i = 1; i <= 3; i++) {
        const topNav = document.getElementById(`top-nav-step-${i}`);
        if (topNav) {
            topNav.style.display = (i === step) ? 'block' : 'none';
        }
    }

    // 4. Actualizar la barra superior e indicadores
    updateIndicators(step);

    // 5. Si se accede al Paso 3, rellenar la ficha de lectura rápida
    if (step === 3) {
        populateReviewData();
    }
}

function updateIndicators(activeStep) {
    for (let i = 1; i <= 3; i++) {
        const indicator = document.getElementById(`indicator-${i}`);
        if (!indicator) continue;

        if (i < activeStep) {
            indicator.className = 'wizard-step-indicator completed';
        } else if (i === activeStep) {
            indicator.className = 'wizard-step-indicator active';
        } else {
            indicator.className = 'wizard-step-indicator';
        }
    }

    // Control de barras de progreso
    const progress1 = document.getElementById('progress-fill');
    if (progress1) {
        progress1.className = activeStep > 1 ? 'progress-fill completed' : 'progress-fill';
    }

    const progress2 = document.getElementById('progress-fill-2');
    if (progress2) {
        if (activeStep > 2) {
            progress2.className = 'progress-fill-2 completed';
        } else if (activeStep === 2) {
            progress2.className = 'progress-fill-2 active';
        } else {
            progress2.className = 'progress-fill-2';
        }
    }
}

// --- LOGICA DE CARGA DE ARCHIVOS (PASO 2) ---
function initFileUploads() {
    const fileKeys = ['sat-constancia', 'sat-opinion', 'domicilio', 'identificacion', 'acta', 'cuenta', 'autorizacion'];

    fileKeys.forEach(key => {
        const inputEl = document.getElementById(`doc-${key}`);
        if (!inputEl) return;

        inputEl.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                uploadedFiles[key] = file;
                updateFileCardUI(key, file.name);
                // Limpiar is-invalid al subir un archivo
                const nameEl = document.getElementById(`file-name-${key}`);
                const cardEl = nameEl ? nameEl.closest('.upload-card') : null;
                if (cardEl) cardEl.classList.remove('is-invalid');
            }
        });
    });
}

function updateFileCardUI(key, filename) {
    const nameEl = document.getElementById(`file-name-${key}`);
    if (!nameEl) return;
    const cardEl = nameEl.closest('.upload-card');

    nameEl.innerHTML = `
        <i class="fa-solid fa-file-circle-check"></i> ${filename}
        <button type="button" class="remove-file-btn" onclick="removeUploadedFile(event, '${key}')" title="Quitar archivo">
            <i class="fa-solid fa-trash-can"></i>
        </button>
    `;
    nameEl.className = 'selected-file-name active-file';

    if (cardEl) {
        cardEl.classList.add('has-file');
    }
}

function removeUploadedFile(event, key) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const inputEl = document.getElementById(`doc-${key}`);
    const nameEl = document.getElementById(`file-name-${key}`);
    const cardEl = nameEl ? nameEl.closest('.upload-card') : null;

    if (inputEl) inputEl.value = '';
    uploadedFiles[key] = null;

    if (nameEl) {
        nameEl.innerHTML = key === 'acta' ? 'Ningún archivo seleccionado (Opcional)' : 'Ningún archivo seleccionado';
        nameEl.className = 'selected-file-name';
    }

    if (cardEl) {
        cardEl.classList.remove('has-file');
    }
}

// --- CONSOLIDACIÓN DE INFORMACIÓN (PASO 3) ---
function populateReviewData() {
    // Mapeo: [id_input, id_resumen, es_booleano]
    const fieldsToReview = [
        // Datos Básicos
        ['sup-code', 'resumen-code', false],
        ['sup-name', 'resumen-name', false],
        ['sup-legal', 'resumen-legal', false],
        ['sup-rfc', 'resumen-rfc', false],
        ['sup-regimen', 'resumen-regimen', false],
        ['sup-tipo', 'resumen-tipo', false],
        ['sup-categoria', 'resumen-categoria', false],
        ['sup-estatus', 'resumen-estatus', false],
        // Contacto
        ['sup-contacto', 'resumen-contacto', false],
        ['sup-whatsapp', 'resumen-whatsapp', false],
        ['sup-correo', 'resumen-correo', false],
        ['sup-telefono', 'resumen-telefono', false],
        ['sup-dir-fiscal', 'resumen-dir-fiscal', false],
        ['sup-dir-entrega', 'resumen-dir-entrega', false],
        // Condiciones
        ['sup-condicion-pago', 'resumen-condicion-pago', false],
        ['sup-credito', 'resumen-credito', false],
        ['sup-minimo', 'resumen-minimo', false],
        ['sup-entrega', 'resumen-entrega', false],
        ['sup-flete', 'resumen-flete', true],
        ['sup-flete-incluido', 'resumen-flete-incluido', true],
        // Banco
        ['sup-banco', 'resumen-banco', false],
        ['sup-cuenta', 'resumen-cuenta', false],
        ['sup-clabe', 'resumen-clabe', false],
        ['sup-beneficiario', 'resumen-beneficiario', false],
        ['sup-observaciones', 'resumen-observaciones', false]
    ];

    fieldsToReview.forEach(([inputId, reviewId, isBoolean]) => {
        const inputEl = document.getElementById(inputId);
        const reviewEl = document.getElementById(reviewId);
        if (!inputEl || !reviewEl) return;

        if (isBoolean) {
            reviewEl.textContent = inputEl.checked ? 'Sí' : 'No';
        } else {
            let val = inputEl.value.trim();

            if (inputId === 'sup-minimo' && val) {
                const numberVal = parseFloat(val);
                if (!isNaN(numberVal)) {
                    val = '$' + numberVal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MXN';
                }
            }

            if (inputId === 'sup-credito' && val) {
                val = val + ' días';
            }

            if (val) {
                if (inputId === 'sup-code') {
                    reviewEl.innerHTML = `<code>${val}</code>`;
                } else if (inputId === 'sup-name') {
                    reviewEl.innerHTML = `<strong>${val}</strong>`;
                } else {
                    reviewEl.textContent = val;
                }
                reviewEl.classList.remove('empty-field');
            } else {
                reviewEl.textContent = '-- Sin asignar --';
                reviewEl.classList.add('empty-field');
            }
        }
    });

    // Cargar nombres de archivos
    const fileKeys = ['sat-constancia', 'sat-opinion', 'domicilio', 'identificacion', 'acta', 'cuenta', 'autorizacion'];
    fileKeys.forEach(key => {
        const reviewEl = document.getElementById(`resumen-file-${key}`);
        if (!reviewEl) return;
        const file = uploadedFiles[key];
        if (file) {
            reviewEl.innerHTML = `<i class="fa-solid fa-file-pdf"></i> ${file.name}`;
            reviewEl.className = 'file-resumen-val has-file';
        } else {
            reviewEl.textContent = key === 'acta' ? 'Ningún archivo adjunto (Opcional)' : 'Ningún archivo adjunto';
            reviewEl.className = 'file-resumen-val';
        }
    });
}

// --- ENVÍO FINAL DEL FORMULARIO ---
function addSupplierSimulated() {
    if (typeof showAlert === 'function') {
        showAlert('Registro completado: El proveedor ha sido guardado exitosamente con sus documentos.');
    } else {
        alert('Registro completado: El proveedor ha sido guardado exitosamente con sus documentos.');
    }

    // Resetear formulario HTML
    const form = document.getElementById('supplier-form');
    if (form) form.reset();

    // Resetear archivos subidos
    const fileKeys = ['sat-constancia', 'sat-opinion', 'domicilio', 'identificacion', 'acta', 'cuenta', 'autorizacion'];
    fileKeys.forEach(key => {
        removeUploadedFile(null, key);
    });

    // Regresar al Paso 1
    goToStep(1);
}

// Exponer funciones necesarias a nivel global
window.goToStep = goToStep;
window.removeUploadedFile = removeUploadedFile;
window.addSupplierSimulated = addSupplierSimulated;
