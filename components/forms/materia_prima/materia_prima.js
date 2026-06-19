/* --- LÓGICA DE NEGOCIO Y NAVEGACIÓN DEL WIZARD DE MATERIA PRIMA --- */

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('mp-code')) {
        initMpWizard();
    }
});

function initMpWizard() {
    // 1. Mostrar Paso 1 e iniciar indicadores
    goToMpStep(1);

    // 2. Limpiar is-invalid al escribir/cambiar en cualquier campo del formulario
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
                    const groupInputs = document.querySelectorAll(`input[name="${e.target.name}"]`);
                    groupInputs.forEach(input => input.classList.remove('is-invalid'));
                } else {
                    e.target.classList.remove('is-invalid');
                }
            }
        });
    }
}


// --- VALIDACIÓN DE CAMPOS OBLIGATORIOS (PASO 1) ---
function validateMpStep1Fields() {
    const requiredFields = [
        'mp-code',
        'mp-name',
        'mp-type',
        'mp-family',
        'mp-state',
        'mp-status',
        'mp-unit-buy',
        'mp-unit-inv',
        'mp-unit-recipe',
        'mp-conv-factor',
        'mp-presentation',
        'mp-main-provider',
        'mp-lead-time',
        'mp-location',
        'mp-risk'
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

    // Validar las preguntas obligatorias como casillas
    const checkboxGroups = ['mp-req-lot', 'mp-req-expiry', 'mp-req-sds', 'mp-req-spec'];
    checkboxGroups.forEach(name => {
        const checked = document.querySelector(`input[name="${name}"]:checked`);
        if (!checked) {
            const groupInputs = document.querySelectorAll(`input[name="${name}"]`);
            groupInputs.forEach(input => input.classList.add('is-invalid'));
            isValid = false;
        } else {
            const groupInputs = document.querySelectorAll(`input[name="${name}"]`);
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

// --- NAVEGACIÓN Y VALIDACIÓN DEL WIZARD ---
function goToMpStep(step) {
    // Obtener el paso activo actual
    const currentActiveContent = document.querySelector('.tab-panel.active #mp-form .wizard-step-content.active');
    const currentStep = currentActiveContent ? parseInt(currentActiveContent.id.replace('mp-step-', '')) : 1;

    // Solo validar al avanzar, nunca al retroceder
    if (step > currentStep) {
        if (currentStep === 1) {
            if (!validateMpStep1Fields()) return;
        }
    }

    // 1. Ocultar todos los contenedores de paso
    const stepContents = document.querySelectorAll('.tab-panel.active #mp-form .wizard-step-content');
    stepContents.forEach(el => el.style.display = 'none');
    stepContents.forEach(el => el.classList.remove('active'));

    // 2. Mostrar el paso correspondiente
    const activeStepContent = document.getElementById(`mp-step-${step}`);
    if (activeStepContent) {
        activeStepContent.style.display = 'block';
        activeStepContent.classList.add('active');
    }

    // 3. Mostrar/ocultar los botones de navegación superiores
    for (let i = 1; i <= 2; i++) {
        const topNav = document.getElementById(`mp-top-nav-step-${i}`);
        if (topNav) {
            topNav.style.display = (i === step) ? 'block' : 'none';
        }
    }

    // 4. Actualizar la barra superior e indicadores
    updateMpIndicators(step);

    // 5. Si se accede al Paso 2, rellenar la ficha de lectura rápida
    if (step === 2) {
        populateMpReviewData();
    }
}

function updateMpIndicators(activeStep) {
    for (let i = 1; i <= 2; i++) {
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

    // Control de la barra de progreso
    const progress = document.getElementById('mp-progress-fill');
    if (progress) {
        progress.className = activeStep > 1 ? 'progress-fill completed' : 'progress-fill';
    }
}

// --- CONSOLIDACIÓN DE INFORMACIÓN (PASO 2) ---
function populateMpReviewData() {
    // Mapeo: [id_input, id_resumen]
    const fieldsToReview = [
        ['mp-code', 'res-mp-code'],
        ['mp-name', 'res-mp-name'],
        ['mp-prov-name', 'res-mp-prov-name'],
        ['mp-type', 'res-mp-type'],
        ['mp-family', 'res-mp-family'],
        ['mp-state', 'res-mp-state'],
        ['mp-status', 'res-mp-status'],
        ['mp-unit-buy', 'res-mp-unit-buy'],
        ['mp-unit-inv', 'res-mp-unit-inv'],
        ['mp-unit-recipe', 'res-mp-unit-recipe'],
        ['mp-conv-factor', 'res-mp-conv-factor'],
        ['mp-presentation', 'res-mp-presentation'],
        ['mp-main-provider', 'res-mp-main-provider'],
        ['mp-lead-time', 'res-mp-lead-time'],
        ['mp-location', 'res-mp-location'],
        ['mp-stock-max', 'res-mp-stock-max'],
        ['mp-risk', 'res-mp-risk'],
        ['mp-ppe', 'res-mp-ppe'],
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

// --- ENVÍO FINAL DEL FORMULARIO ---
function addMpSimulated() {
    if (typeof showAlert === 'function') {
        showAlert('Registro completado: La materia prima ha sido guardada exitosamente.');
    } else {
        alert('Registro completado: La materia prima ha sido guardada exitosamente.');
    }

    // Resetear formulario HTML
    const form = document.getElementById('mp-form');
    if (form) form.reset();


    // Regresar al Paso 1
    goToMpStep(1);
}

// Exponer funciones necesarias a nivel global
function handleMpExclusiveCheckbox(checkbox) {
    const name = checkbox.name;
    const checkboxes = document.querySelectorAll(`input[name="${name}"]`);
    checkboxes.forEach(cb => {
        if (cb !== checkbox) {
            cb.checked = false;
        }
    });
    checkboxes.forEach(cb => cb.classList.remove('is-invalid'));
}

window.goToMpStep = goToMpStep;
window.addMpSimulated = addMpSimulated;
window.handleMpExclusiveCheckbox = handleMpExclusiveCheckbox;
