/* --- LÓGICA DE NEGOCIO Y NAVEGACIÓN DEL WIZARD DE MATERIA PRIMA --- */

/* === DICCIONARIOS SKU === */
const TIPO_PREFIJO = {
    'Líquido': 'MP-LIQ',
    'Polvo': 'MP-POL',
    'Esencia': 'MP-ESC',
    'Colorante': 'MP-COL',
    'Subreceta': 'SUB',
    'Envase': 'ENV',
    'Tapa': 'TAP',
    'Etiqueta': 'ETQ'
};

const FAMILIA_CODIGO = {
    'TEN': 'TEN', 'BASQ': 'BASQ', 'ACI': 'ACI', 'OXI': 'OXI',
    'ESE': 'ESE', 'COL': 'COL', 'SUB': 'SUB', 'ENV': 'ENV'
};

/* === MAPEO DE TIPO → CLASE CONDICIONAL === */
const TIPO_COND_MAP = {
    'Líquido': 'cond-quimica',
    'Polvo': 'cond-quimica',
    'Esencia': 'cond-quimica',
    'Colorante': 'cond-quimica',
    'Subreceta': 'cond-quimica',
    'Envase': 'cond-envase',
    'Tapa': 'cond-tapa',
    'Etiqueta': 'cond-etiqueta'
};

function generarSKU(tipo, familia, consecutivo) {
    const prefijo = TIPO_PREFIJO[tipo];
    if (!prefijo) return '';
    const famCode = FAMILIA_CODIGO[familia] || 'GEN';
    return `${prefijo}-${famCode}-${String(consecutivo).padStart(3, '0')}`;
}

function actualizarMpCode() {
    const tipo = document.getElementById('mp-type').value;
    const familyEl = document.getElementById('mp-family');
    const familia = familyEl ? familyEl.value : '';
    const codeEl = document.getElementById('mp-code');
    if (!codeEl) return;
    const sku = generarSKU(tipo, familia, 1);
    codeEl.value = sku;
}

/* === CAMPOS CONDICIONALES === */
function actualizarCamposCondicionales(tipo) {
    const condClass = TIPO_COND_MAP[tipo];
    if (!condClass) return;

    // 1. Ocultar todos los campos condicionales en Step 2 y Step 3
    document.querySelectorAll('#mp-step-2 .cond-field, #mp-step-3 .cond-field').forEach(el => {
        el.style.display = 'none';
    });

    // 2. Mostrar solo los que coinciden con el tipo
    document.querySelectorAll(`#mp-step-2 .${condClass}, #mp-step-3 .${condClass}`).forEach(el => {
        el.style.display = (el.tagName === 'TR') ? 'table-row' : 'block';
    });

    // 3. Densidad: solo visible si el tipo es Líquido
    if (tipo === 'Líquido') {
        document.querySelectorAll('#mp-step-2 .cond-liquido, #mp-step-3 .cond-liquido').forEach(el => {
            el.style.display = (el.tagName === 'TR') ? 'table-row' : 'block';
        });
    }

    // 4. Regenerar SKU
    actualizarMpCode();
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('mp-code')) {
        initMpWizard();
    }
});

function initMpWizard() {
    goToMpStep(1);

    const form = document.getElementById('mp-form');
    if (form) {
        form.addEventListener('input', (e) => {
            if (e.target.classList.contains('is-invalid')) {
                e.target.classList.remove('is-invalid');
            }
        });
        form.addEventListener('change', (e) => {
            if (e.target.classList.contains('is-invalid')) {
                if (e.target.name) {
                    document.querySelectorAll(`input[name="${e.target.name}"]`)
                        .forEach(input => input.classList.remove('is-invalid'));
                } else {
                    e.target.classList.remove('is-invalid');
                }
            }
        });
    }

    const familySelect = document.getElementById('mp-family');
    if (familySelect) {
        familySelect.addEventListener('change', actualizarMpCode);
    }
}

// --- HELPER: verificar si un campo es visible (no está dentro de un cond-field oculto) ---
function isFieldVisible(el) {
    if (!el) return false;
    return el.offsetParent !== null;
}

// --- VALIDACIÓN PASO 1 ---
function validateMpStep1Fields() {
    const val = document.getElementById('mp-type').value;
    if (!val) {
        if (typeof showAlert === 'function') {
            showAlert('Por favor, seleccione un tipo de materia prima antes de continuar.', 'danger');
        } else {
            alert('Por favor, seleccione un tipo de materia prima antes de continuar.');
        }
        return false;
    }
    return true;
}

// --- VALIDACIÓN PASO 2 (solo campos visibles) ---
function validateMpStep2Fields() {
    // Campos siempre requeridos
    const alwaysRequired = ['mp-code', 'mp-name', 'mp-status', 'mp-main-provider', 'mp-lead-time'];

    // Campos condicionales por tipo
    const condQuimica = ['mp-family', 'mp-state', 'mp-unit-buy', 'mp-unit-inv', 'mp-unit-recipe',
        'mp-conv-factor', 'mp-presentation', 'mp-location', 'mp-risk'];
    const condTapa = ['mp-tapa-size', 'mp-tapa-type', 'mp-tapa-envase'];
    const condEtiqueta = ['mp-etiq-product', 'mp-etiq-presentation'];
    const condEnvase = ['mp-envase-capacity', 'mp-envase-material'];
    const condLiquido = ['mp-density'];

    const allFields = [...alwaysRequired, ...condQuimica, ...condTapa, ...condEtiqueta, ...condEnvase, ...condLiquido];

    let isValid = true;
    let firstInvalidEl = null;

    allFields.forEach(id => {
        const el = document.getElementById(id);
        if (!el || !isFieldVisible(el)) return; // Solo validar si es visible
        const val = el.value.trim();
        if (!val) {
            el.classList.add('is-invalid');
            if (!firstInvalidEl) firstInvalidEl = el;
            isValid = false;
        } else {
            el.classList.remove('is-invalid');
        }
    });

    // Validar checkboxes (solo si son visibles)
    const checkboxGroups = ['mp-req-lot', 'mp-req-expiry', 'mp-req-sds', 'mp-req-spec'];
    checkboxGroups.forEach(name => {
        const firstCb = document.querySelector(`input[name="${name}"]`);
        if (!firstCb || !isFieldVisible(firstCb)) return;

        const checked = document.querySelector(`input[name="${name}"]:checked`);
        const groupInputs = document.querySelectorAll(`input[name="${name}"]`);
        if (!checked) {
            groupInputs.forEach(input => input.classList.add('is-invalid'));
            isValid = false;
        } else {
            groupInputs.forEach(input => input.classList.remove('is-invalid'));
        }
    });

    if (!isValid && firstInvalidEl) {
        firstInvalidEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalidEl.focus();
    } else if (!isValid) {
        const firstInvalidCheckbox = document.querySelector('.is-invalid');
        if (firstInvalidCheckbox) {
            firstInvalidCheckbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    if (!isValid && typeof showAlert === 'function') {
        showAlert('Por favor, completa todos los campos obligatorios (*) antes de continuar.', 'danger');
    }

    return isValid;
}

// --- NAVEGACIÓN DEL WIZARD ---
function goToMpStep(step) {
    const currentActiveContent = document.querySelector('.tab-panel.active #mp-form .wizard-step-content.active');
    const currentStep = currentActiveContent ? parseInt(currentActiveContent.id.replace('mp-step-', '')) : 1;

    // Solo validar al avanzar
    if (step > currentStep) {
        if (currentStep === 1 && !validateMpStep1Fields()) return;
        if (currentStep === 2 && !validateMpStep2Fields()) return;
    }

    // Ocultar todos los pasos
    const stepContents = document.querySelectorAll('.tab-panel.active #mp-form .wizard-step-content');
    stepContents.forEach(el => { el.style.display = 'none'; el.classList.remove('active'); });

    // Mostrar el paso solicitado
    const activeStepContent = document.getElementById(`mp-step-${step}`);
    if (activeStepContent) {
        activeStepContent.style.display = 'block';
        activeStepContent.classList.add('active');
    }

    // Navegación superior
    for (let i = 1; i <= 3; i++) {
        const topNav = document.getElementById(`mp-top-nav-step-${i}`);
        if (topNav) topNav.style.display = (i === step) ? 'block' : 'none';
    }

    updateMpIndicators(step);

    // Aplicar campos condicionales al entrar en Step 2 o Step 3
    if (step === 2 || step === 3) {
        const tipo = document.getElementById('mp-type').value;
        actualizarCamposCondicionales(tipo);
    }

    // Rellenar resumen en Step 3
    if (step === 3) {
        populateMpReviewData();
    }
}

function updateMpIndicators(activeStep) {
    for (let i = 1; i <= 3; i++) {
        const indicator = document.getElementById(`mp-indicator-${i}`);
        if (!indicator) continue;

        if (i < activeStep) {
            indicator.className = 'wizard-step-indicator completed';
        } else if (i === activeStep) {
            indicator.className = 'wizard-step-indicator active';
        } else {
            indicator.className = 'wizard-step-indicator';
        }
    }

    const progress = document.getElementById('mp-progress-fill');
    if (progress) {
        progress.className = activeStep > 1 ? 'progress-fill completed' : 'progress-fill';
    }

    const progress2 = document.getElementById('mp-progress-fill-2');
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

// --- CONSOLIDACIÓN DE INFORMACIÓN (PASO 3) ---
function populateMpReviewData() {
    const fieldsToReview = [
        // Siempre
        ['mp-code', 'res-mp-code'],
        ['mp-name', 'res-mp-name'],
        ['mp-prov-name', 'res-mp-prov-name'],
        ['mp-type', 'res-mp-type'],
        ['mp-status', 'res-mp-status'],
        // Química
        ['mp-family', 'res-mp-family'],
        ['mp-state', 'res-mp-state'],
        ['mp-density', 'res-mp-density'],
        ['mp-compat', 'res-mp-compat'],
        ['mp-unit-buy', 'res-mp-unit-buy'],
        ['mp-unit-inv', 'res-mp-unit-inv'],
        ['mp-unit-recipe', 'res-mp-unit-recipe'],
        ['mp-conv-factor', 'res-mp-conv-factor'],
        ['mp-presentation', 'res-mp-presentation'],
        ['mp-location', 'res-mp-location'],
        ['mp-risk', 'res-mp-risk'],
        ['mp-ppe', 'res-mp-ppe'],
        // Tapa
        ['mp-tapa-size', 'res-mp-tapa-size'],
        ['mp-tapa-type', 'res-mp-tapa-type'],
        ['mp-tapa-envase', 'res-mp-tapa-envase'],
        ['mp-tapa-unit', 'res-mp-tapa-unit'],
        // Etiqueta
        ['mp-etiq-product', 'res-mp-etiq-product'],
        ['mp-etiq-presentation', 'res-mp-etiq-presentation'],
        ['mp-etiq-unit', 'res-mp-etiq-unit'],
        // Envase
        ['mp-envase-capacity', 'res-mp-envase-capacity'],
        ['mp-envase-material', 'res-mp-envase-material'],
        ['mp-envase-unit', 'res-mp-envase-unit'],
        // Logística
        ['mp-main-provider', 'res-mp-main-provider'],
        ['mp-lead-time', 'res-mp-lead-time'],
        ['mp-stock-max', 'res-mp-stock-max'],
        // Checkboxes
        ['mp-req-lot', 'res-mp-req-lot'],
        ['mp-req-expiry', 'res-mp-req-expiry'],
        ['mp-req-sds', 'res-mp-req-sds'],
        ['mp-req-spec', 'res-mp-req-spec']
    ];

    fieldsToReview.forEach(([inputId, reviewId]) => {
        const inputEl = document.getElementById(inputId);
        const reviewEl = document.getElementById(reviewId);
        if (!reviewEl) return;

        let val = '';
        if (!inputEl) {
            // Checkbox groups (mp-req-lot, etc.)
            const checkedCheckbox = document.querySelector(`input[name="${inputId}"]:checked`);
            val = checkedCheckbox ? checkedCheckbox.value : '';
        } else if (inputEl.type === 'checkbox') {
            val = inputEl.checked ? 'Sí' : 'No';
        } else {
            val = inputEl.value.trim();
        }

        if (val) {
            if (inputId === 'mp-code') {
                reviewEl.innerHTML = `<code>${val}</code>`;
            } else if (inputId === 'mp-name') {
                reviewEl.innerHTML = `<strong>${val}</strong>`;
            } else {
                reviewEl.textContent = val;
            }
            reviewEl.classList.remove('empty-field');
        } else {
            reviewEl.textContent = '-- Sin asignar --';
            reviewEl.classList.add('empty-field');
        }
    });
}

// --- ENVÍO FINAL ---
function addMpSimulated() {
    if (typeof showAlert === 'function') {
        showAlert('Registro completado: La materia prima ha sido guardada exitosamente.');
    } else {
        alert('Registro completado: La materia prima ha sido guardada exitosamente.');
    }

    const form = document.getElementById('mp-form');
    if (form) form.reset();

    const cards = document.querySelectorAll('.mp-type-card');
    cards.forEach(card => card.classList.remove('selected'));

    goToMpStep(1);
}

function selectMpType(type, element) {
    const hiddenInput = document.getElementById('mp-type');
    if (hiddenInput) {
        hiddenInput.value = type;
        hiddenInput.classList.remove('is-invalid');
    }

    const cards = document.querySelectorAll('.mp-type-card');
    cards.forEach(card => card.classList.remove('selected'));
    if (element) {
        element.classList.add('selected');
    }

    actualizarMpCode();
}

function handleMpExclusiveCheckbox(checkbox) {
    const name = checkbox.name;
    const checkboxes = document.querySelectorAll(`input[name="${name}"]`);
    checkboxes.forEach(cb => {
        if (cb !== checkbox) cb.checked = false;
    });
    checkboxes.forEach(cb => cb.classList.remove('is-invalid'));
}

// Exponer funciones globales
window.goToMpStep = goToMpStep;
window.addMpSimulated = addMpSimulated;
window.handleMpExclusiveCheckbox = handleMpExclusiveCheckbox;
window.selectMpType = selectMpType;
