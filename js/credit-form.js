/**
 * FORMULARIO DIGITAL DE SOLICITUD DE CRÉDITO — FINANCIAMIENTO & SOLUCIONES S.A.S.
 * Estructurado fielmente a partir de: "Solicitud_Credito_Dinamica_Carta.xlsx"
 * Gestiona el asistente multi-paso, validaciones, radicado y confirmación.
 */

(function () {
  'use strict';

  let currentStep = 1;
  const totalSteps = 6;

  // Elementos DOM
  const formElement = document.getElementById('digital-credit-form');
  const stepPanels = document.querySelectorAll('.form-step-panel');
  const stepPills = document.querySelectorAll('.form-step-pill');
  const btnPrev = document.getElementById('form-btn-prev');
  const btnNext = document.getElementById('form-btn-next');
  const btnSubmit = document.getElementById('form-btn-submit');
  const codeudorToggle = document.getElementById('toggle-codeudor');
  const codeudorFieldsContainer = document.getElementById('codeudor-fields-container');

  // Modal de confirmación
  const successModal = document.getElementById('modal-solicitud-exito');
  const modalCloseBtn = document.getElementById('modal-btn-close');
  const modalPrintBtn = document.getElementById('modal-btn-print');
  const modalFolioSpan = document.getElementById('modal-folio-num');
  const modalClientNameSpan = document.getElementById('modal-client-name');
  const modalSummaryVehicleSpan = document.getElementById('modal-summary-vehicle');
  const modalSummaryFinancedSpan = document.getElementById('modal-summary-financed');

  // Formateador COP
  const formatCOP = (num) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(num);
  };

  /**
   * Muestra el paso indicado y actualiza la barra de progreso
   */
  function showStep(stepNumber) {
    stepPanels.forEach(panel => {
      panel.classList.toggle('active', parseInt(panel.dataset.step, 10) === stepNumber);
    });

    stepPills.forEach(pill => {
      const pillStep = parseInt(pill.dataset.step, 10);
      pill.classList.remove('active', 'completed');
      if (pillStep === stepNumber) {
        pill.classList.add('active');
        pill.setAttribute('aria-current', 'step');
      } else if (pillStep < stepNumber) {
        pill.classList.add('completed');
        pill.removeAttribute('aria-current');
      } else {
        pill.removeAttribute('aria-current');
      }
    });

    // Control de visibilidad de botones
    if (btnPrev) {
      btnPrev.style.display = stepNumber === 1 ? 'none' : 'inline-flex';
    }
    if (btnNext) {
      btnNext.style.display = stepNumber === totalSteps ? 'none' : 'inline-flex';
    }
    if (btnSubmit) {
      btnSubmit.style.display = stepNumber === totalSteps ? 'inline-flex' : 'none';
    }

    currentStep = stepNumber;
  }

  /**
   * Valida los campos requeridos del paso actual
   */
  function validateCurrentStep() {
    const currentPanel = document.querySelector(`.form-step-panel[data-step="${currentStep}"]`);
    if (!currentPanel) return true;

    let isValid = true;
    const requiredInputs = currentPanel.querySelectorAll('input[required], select[required], textarea[required]');

    requiredInputs.forEach(input => {
      const group = input.closest('.form-group');
      if (input.type === 'checkbox') {
        if (!input.checked) {
          isValid = false;
          input.classList.add('error');
          if (group) group.classList.add('has-error');
        } else {
          input.classList.remove('error');
          if (group) group.classList.remove('has-error');
        }
      } else {
        if (!input.value.trim()) {
          isValid = false;
          input.classList.add('error');
          if (group) group.classList.add('has-error');
        } else {
          input.classList.remove('error');
          if (group) group.classList.remove('has-error');
        }
      }
    });

    return isValid;
  }

  // Navegación Siguiente
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
          showStep(currentStep + 1);
          // Scroll suave a la cabecera del formulario
          const formCard = document.querySelector('.credit-form-card');
          if (formCard) formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        if (window.showToast) {
          window.showToast('Por favor completa todos los campos requeridos para continuar.', 'warning');
        }
      }
    });
  }

  // Navegación Anterior
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentStep > 1) {
        showStep(currentStep - 1);
        const formCard = document.querySelector('.credit-form-card');
        if (formCard) formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // Selector de pasos directo (para pasos ya completados)
  stepPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const targetStep = parseInt(pill.dataset.step, 10);
      if (targetStep < currentStep) {
        showStep(targetStep);
      }
    });
  });

  // Toggle de Codeudor Solidario (Opcional según perfil)
  if (codeudorToggle && codeudorFieldsContainer) {
    codeudorToggle.addEventListener('change', () => {
      const isChecked = codeudorToggle.checked;
      codeudorFieldsContainer.style.display = isChecked ? 'block' : 'none';
      const codeudorInputs = codeudorFieldsContainer.querySelectorAll('input, select');
      codeudorInputs.forEach(inp => {
        if (isChecked) {
          inp.setAttribute('required', 'required');
        } else {
          inp.removeAttribute('required');
          inp.classList.remove('error');
        }
      });
    });
  }

  // Envío del Formulario
  // Envío del Formulario con Persistencia Real (Cloudflare API / Local Storage)
  if (formElement) {
    formElement.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validateCurrentStep()) {
        if (window.showToast) {
          window.showToast('Por favor acepta las autorizaciones y declaraciones legales para radicar.', 'warning');
        }
        return;
      }

      // Generar Radicado Único Institucional (Ej: FS-2026-78412)
      const randomCode = Math.floor(10000 + Math.random() * 90000);
      const radicado = `FS-2026-${randomCode}`;

      // Extraer datos del formulario completo
      const applicantName = document.getElementById('field-nombre-completo')?.value || 'Apreciado Solicitante';
      const docType = document.getElementById('field-tipo-doc')?.value || 'CC';
      const docNum = document.getElementById('field-num-doc')?.value || '';
      const birthDate = document.getElementById('field-fecha-nac')?.value || '';
      const phone = document.getElementById('field-celular')?.value || '';
      const email = document.getElementById('field-correo')?.value || '';
      const city = document.getElementById('field-ciudad')?.value || '';
      const address = document.getElementById('field-direccion')?.value || '';

      const actividad = document.getElementById('field-actividad')?.value || 'Empleado';
      const empresa = document.getElementById('field-empresa')?.value || '';
      const cargo = document.getElementById('field-cargo')?.value || '';
      const antiguedad = document.getElementById('field-antiguedad')?.value || '';

      const ingresos = document.getElementById('field-ingresos')?.value || '0';
      const otrosIngresos = document.getElementById('field-otros-ingresos')?.value || '0';
      const gastos = document.getElementById('field-gastos')?.value || '0';

      const hasCodeudor = codeudorToggle ? codeudorToggle.checked : false;
      const codeudorNombre = document.getElementById('field-codeudor-nombre')?.value || '';
      const codeudorDoc = document.getElementById('field-codeudor-doc')?.value || '';
      const codeudorCelular = document.getElementById('field-codeudor-celular')?.value || '';

      const motoRef = document.getElementById('field-referencia-moto')?.value || 'Motocicleta Estándar';
      const valorVehiculo = document.getElementById('field-valor-vehiculo')?.value || '0';
      const cuotaInicial = document.getElementById('field-cuota-inicial')?.value || '0';
      const financedAmount = document.getElementById('field-monto-financiar')?.value || '0';
      const plazoMeses = document.getElementById('field-plazo-meses')?.value || '36';
      const tipoCuota = document.getElementById('field-tipo-cuota')?.value || 'Fija Tradicional';
      const cuotaAprox = document.getElementById('field-cuota-aprox')?.value || '$ 0';

      const firma = document.getElementById('field-firma-solicitante')?.value || '';
      const firmaDoc = document.getElementById('field-firma-doc')?.value || '';

      const payload = {
        radicado: radicado,
        nombreCompleto: applicantName,
        tipoDocumento: docType,
        numeroDocumento: docNum,
        fechaNacimiento: birthDate,
        celular: phone,
        correo: email,
        ciudadResidencia: city,
        direccion: address,
        tipoActividad: actividad,
        empresa: empresa,
        cargo: cargo,
        antiguedadMeses: antiguedad,
        ingresosMensuales: ingresos,
        otrosIngresos: otrosIngresos,
        totalGastos: gastos,
        tieneCodeudor: hasCodeudor,
        codeudor: {
          nombre: codeudorNombre,
          documento: codeudorDoc,
          celular: codeudorCelular
        },
        referenciaMoto: motoRef,
        valorVehiculo: valorVehiculo,
        cuotaInicial: cuotaInicial,
        montoFinanciar: financedAmount,
        plazoMeses: plazoMeses,
        tipoCuota: tipoCuota,
        cuotaAprox: cuotaAprox,
        firmaSolicitante: firma,
        firmaDocumento: firmaDoc
      };

      // Enviar al Backend (Cloudflare Pages Functions / Node Server)
      try {
        await fetch('/api/solicitudes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn('Almacenando localmente como contingencia:', err);
        const localList = JSON.parse(localStorage.getItem('fs_solicitudes') || '[]');
        localList.unshift(payload);
        localStorage.setItem('fs_solicitudes', JSON.stringify(localList));
      }

      // Llenar datos en el modal de confirmación
      if (modalFolioSpan) modalFolioSpan.textContent = `Radicado No. ${radicado}`;
      if (modalClientNameSpan) modalClientNameSpan.textContent = applicantName;
      if (modalSummaryVehicleSpan) modalSummaryVehicleSpan.textContent = motoRef;
      if (modalSummaryFinancedSpan) modalSummaryFinancedSpan.textContent = formatCOP(parseFloat(financedAmount) || 0);

      // Abrir modal de éxito
      if (successModal) {
        successModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }

      if (window.showToast) {
        window.showToast(`Solicitud ${radicado} radicada con éxito.`, 'success');
      }
    });
  }

  // Cerrar Modal
  if (modalCloseBtn && successModal) {
    modalCloseBtn.addEventListener('click', () => {
      successModal.classList.remove('active');
      document.body.style.overflow = '';
      // Resetear a paso 1
      if (formElement) formElement.reset();
      showStep(1);
    });
  }

  // Imprimir / Guardar Resumen de Solicitud
  if (modalPrintBtn) {
    modalPrintBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Inicializar en el paso 1
  showStep(1);
})();
