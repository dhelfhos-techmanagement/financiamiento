/**
 * SIMULADOR OFICIAL DE FINANCIACIÓN — FINANCIAMIENTO & SOLUCIONES S.A.S.
 * Fuente de Verdad: simulador_solidez_v4-2.html (Sistema de Originación Solidez v4.0)
 * 
 * Reglas Maestras:
 * - Plazos oficiales: 12, 24, 36 meses.
 * - Cuota inicial: Mínimo 37%, máximo 80% (con sincronización slider y monto manual).
 * - Fórmulas financieras oficiales:
 *     saldoBase = valorMoto - cuotaInicial
 *     capitalAFinanciar = (saldoBase * 1.035) + 550000
 *     tasaInt = 0.05
 *     cuotaCalculada = (capitalAFinanciar * (tasaInt * (1 + tasaInt)^n)) / ((1 + tasaInt)^n - 1)
 *     cuotaFinal = cuotaCalculada + 38000
 * - Experiencia Pública: Muestra únicamente valores informativos y preliminares.
 *   CERO exposición pública de DataCrédito, scoring interno, perfiles T1-T4 o tasas internas.
 */

(function () {
  'use strict';

  // Elementos DOM del simulador
  const vehicleSlider = document.getElementById('sim-vehicle-slider');
  const vehicleInput = document.getElementById('sim-vehicle-input');
  const vehicleValueBadge = document.getElementById('sim-vehicle-value');
  const downPaymentSlider = document.getElementById('sim-down-slider');
  const downPaymentInput = document.getElementById('sim-down-input');
  const downPaymentValueBadge = document.getElementById('sim-down-value');
  const termButtons = document.querySelectorAll('.sim-term-btn');
  const presetButtons = document.querySelectorAll('.sim-preset-btn');
  const applySimDataBtn = document.getElementById('btn-apply-sim-data');
  const downloadPdfBtn = document.getElementById('btn-download-sim-pdf');

  // Elementos de resultados
  const resInstallment = document.getElementById('sim-res-installment');
  const resVehicleTotal = document.getElementById('sim-res-vehicle-total');
  const resDownPayment = document.getElementById('sim-res-down-payment');
  const resFinancedAmount = document.getElementById('sim-res-financed');
  const resTermMonths = document.getElementById('sim-res-term');
  const simWarningBox = document.getElementById('sim-warning-policy');

  // Estado del simulador (Valores por defecto oficiales: HUNK 125, 37% inicial, 36 meses)
  let currentVehicleValue = 8500000;
  let currentDownPaymentPercent = 37;
  let currentTermMonths = 36;
  let currentSimId = 'SIM-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);

  // Formateador de moneda colombiana (COP)
  const formatCOP = (num) => {
    return '$ ' + Math.round(num).toLocaleString('es-CO');
  };

  /**
   * Cálculo financiero estricto según simulador_solidez_v4-2.html
   */
  function calculateLoan(motoValue, downPercent, termMonths) {
    const clampedPercent = Math.max(37, Math.min(80, downPercent));
    const downPaymentAmount = Math.round(motoValue * (clampedPercent / 100));
    const saldoBase = Math.max(0, motoValue - downPaymentAmount);
    
    // Capital a financiar con cargos de originación oficiales
    const capitalAFinanciar = (saldoBase * 1.035) + 550000;
    
    // Tasa técnica interna oficial: 0.05 mensual
    const tasaInt = 0.05;
    const n = termMonths;
    const factorPotencia = Math.pow(1 + tasaInt, n);
    const cuotaCalculada = (capitalAFinanciar * (tasaInt * factorPotencia)) / (factorPotencia - 1);
    
    // Cuota final mensual con GPS y seguros de vida/desempleo incluidos (+38.000 COP)
    const cuotaFinal = Math.round(cuotaCalculada + 38000);

    return {
      motoValue,
      downPercent: clampedPercent,
      downPaymentAmount,
      capitalAFinanciar: Math.round(capitalAFinanciar),
      termMonths,
      cuotaFinal
    };
  }

  /**
   * Actualiza el panel de resultados de cara al usuario público
   */
  function updateSimulation() {
    const calc = calculateLoan(currentVehicleValue, currentDownPaymentPercent, currentTermMonths);

    // Actualizar visualizadores de entrada
    if (vehicleValueBadge) vehicleValueBadge.textContent = formatCOP(currentVehicleValue);
    if (vehicleInput && document.activeElement !== vehicleInput) {
      vehicleInput.value = currentVehicleValue;
    }
    if (vehicleSlider && vehicleSlider.value != currentVehicleValue) {
      vehicleSlider.value = currentVehicleValue;
    }

    if (downPaymentValueBadge) {
      downPaymentValueBadge.textContent = `${calc.downPercent}% (${formatCOP(calc.downPaymentAmount)})`;
    }
    if (downPaymentInput && document.activeElement !== downPaymentInput) {
      downPaymentInput.value = calc.downPercent;
    }
    if (downPaymentSlider && downPaymentSlider.value != calc.downPercent) {
      downPaymentSlider.value = calc.downPercent;
    }

    // Actualizar panel de resultados públicos
    if (resInstallment) resInstallment.textContent = formatCOP(calc.cuotaFinal);
    if (resVehicleTotal) resVehicleTotal.textContent = formatCOP(calc.motoValue);
    if (resDownPayment) resDownPayment.textContent = `${formatCOP(calc.downPaymentAmount)} (${calc.downPercent}%)`;
    if (resFinancedAmount) resFinancedAmount.textContent = formatCOP(calc.capitalAFinanciar);
    if (resTermMonths) resTermMonths.textContent = `${calc.termMonths} Meses`;

    // Aviso informativo de política si intenta bajar del 37%
    if (simWarningBox) {
      simWarningBox.style.display = currentDownPaymentPercent < 37 ? 'block' : 'none';
    }
  }

  // --- LISTENERS DE VALOR DE LA MOTO ---
  if (vehicleSlider) {
    vehicleSlider.addEventListener('input', (e) => {
      currentVehicleValue = parseInt(e.target.value, 10) || 8500000;
      presetButtons.forEach(btn => btn.classList.remove('active'));
      updateSimulation();
    });
  }

  if (vehicleInput) {
    vehicleInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
      if (val > 0) {
        currentVehicleValue = val;
        presetButtons.forEach(btn => btn.classList.remove('active'));
        updateSimulation();
      }
    });
  }

  // Presets de valores de motocicletas
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!btn.dataset.val) return;
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = parseInt(btn.dataset.val, 10);
      if (val) {
        currentVehicleValue = val;
        updateSimulation();
      }
    });
  });

  // --- LISTENERS DE CUOTA INICIAL (SLIDER Y MONTO/PORCENTAJE MANUAL) ---
  if (downPaymentSlider) {
    downPaymentSlider.addEventListener('input', (e) => {
      currentDownPaymentPercent = Math.max(37, Math.min(80, parseInt(e.target.value, 10) || 37));
      syncDownPresets(currentDownPaymentPercent);
      updateSimulation();
    });
  }

  if (downPaymentInput) {
    downPaymentInput.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) || 0;
      if (val > 0) {
        if (val <= 100) {
          currentDownPaymentPercent = Math.max(37, Math.min(80, Math.round(val)));
        } else if (currentVehicleValue > 0) {
          const pct = Math.round((val / currentVehicleValue) * 100);
          currentDownPaymentPercent = Math.max(37, Math.min(80, pct));
        }
        syncDownPresets(currentDownPaymentPercent);
        updateSimulation();
      }
    });
  }

  // Presets de cuota inicial (%)
  const downPresetButtons = document.querySelectorAll('[data-down]');
  function syncDownPresets(pct) {
    downPresetButtons.forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.down, 10) === pct);
    });
  }

  downPresetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const pct = parseInt(btn.dataset.down, 10);
      if (pct) {
        currentDownPaymentPercent = Math.max(37, Math.min(80, pct));
        syncDownPresets(currentDownPaymentPercent);
        updateSimulation();
      }
    });
  });

  // --- SELECTOR DE PLAZOS (12, 24, 36 MESES OFICIALES) ---
  termButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      termButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTermMonths = parseInt(btn.dataset.term, 10) || 36;
      updateSimulation();
    });
  });

  // --- TRANSFERENCIA DE VALORES AL FORMULARIO DIGITAL (PREFILL) ---
  if (applySimDataBtn) {
    applySimDataBtn.addEventListener('click', () => {
      const calc = calculateLoan(currentVehicleValue, currentDownPaymentPercent, currentTermMonths);

      // Pre-llenar campos en el Paso 5 del formulario de crédito
      const fieldVehicleValue = document.getElementById('field-valor-vehiculo');
      const fieldDownPayment = document.getElementById('field-cuota-inicial');
      const fieldFinanced = document.getElementById('field-monto-financiar');
      const fieldTerm = document.getElementById('field-plazo-meses');
      const fieldApprox = document.getElementById('field-cuota-aprox');

      if (fieldVehicleValue) fieldVehicleValue.value = calc.motoValue;
      if (fieldDownPayment) fieldDownPayment.value = calc.downPaymentAmount;
      if (fieldFinanced) fieldFinanced.value = calc.capitalAFinanciar;
      if (fieldTerm) fieldTerm.value = calc.termMonths;
      if (fieldApprox) fieldApprox.value = formatCOP(calc.cuotaFinal);

      // Desplazamiento suave al formulario
      const formSection = document.getElementById('solicitud-credito');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (window.showToast) {
          window.showToast('Datos de tu simulación transferidos exitosamente al Paso 5 de tu solicitud.', 'success');
        }
      }
    });
  }

  // --- GENERACIÓN DEL COMPROBANTE DE SIMULACIÓN EN PDF (SECCIÓN 19) ---
  function descargarComprobantePDF() {
    const calc = calculateLoan(currentVehicleValue, currentDownPaymentPercent, currentTermMonths);
    const now = new Date();
    const fechaStr = now.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    const horaStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

    // Ventana de impresión profesional optimizada como documento legal formal
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) {
      alert('Por favor permite las ventanas emergentes en tu navegador para generar tu Comprobante de Simulación en PDF.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Comprobante de Simulación — ${currentSimId}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
            color: #1e293b;
            background: #ffffff;
            padding: 40px;
            font-size: 14px;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #1E3CAA;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header-brand h1 {
            font-size: 20px;
            color: #1E3CAA;
            letter-spacing: -0.5px;
          }
          .header-brand h1 span { color: #6BB812; }
          .header-brand p {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 3px;
          }
          .header-meta {
            text-align: right;
          }
          .doc-badge {
            display: inline-block;
            background: #EFF4FF;
            color: #1E3CAA;
            font-weight: 700;
            font-size: 12px;
            padding: 4px 10px;
            border-radius: 4px;
            margin-bottom: 6px;
            border: 1px solid #BACFFA;
          }
          .doc-num { font-size: 12px; font-weight: 600; color: #0F172A; }
          .doc-date { font-size: 11px; color: #64748b; }
          
          .title-section {
            margin-bottom: 24px;
          }
          .title-section h2 {
            font-size: 18px;
            color: #0F172A;
            margin-bottom: 6px;
          }
          .title-section p {
            font-size: 12px;
            color: #64748b;
          }

          .cuota-card {
            background: linear-gradient(135deg, #0B142B, #142347);
            color: #ffffff;
            border-radius: 8px;
            padding: 24px;
            text-align: center;
            margin-bottom: 28px;
            border-left: 6px solid #6BB812;
          }
          .cuota-tag {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #6BB812;
            font-weight: 700;
          }
          .cuota-val {
            font-size: 32px;
            font-weight: 800;
            color: #ffffff;
            margin: 6px 0;
          }
          .cuota-desc {
            font-size: 11px;
            color: #94A3B8;
          }

          .table-summary {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .table-summary th, .table-summary td {
            padding: 12px 16px;
            border-bottom: 1px solid #E2E8F0;
            text-align: left;
          }
          .table-summary th {
            background-color: #F8FAFC;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #475569;
          }
          .table-summary td {
            font-size: 13px;
            font-weight: 600;
            color: #0F172A;
          }
          .table-summary tr:nth-child(even) { background-color: #FAFAFC; }

          .legal-notice {
            background: #F8FAFC;
            border-left: 4px solid #1E3CAA;
            padding: 16px;
            border-radius: 4px;
            margin-top: 30px;
            font-size: 11px;
            line-height: 1.6;
            color: #475569;
          }
          .legal-notice strong { color: #0F172A; }

          .footer-sign {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 1px dashed #CBD5E1;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #94a3b8;
          }

          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-brand">
            <h1>FINANCIAMIENTO <span>& SOLUCIONES S.A.S.</span></h1>
            <p>Financiera de Motocicletas S.A.S. — Sistema Institucional</p>
          </div>
          <div class="header-meta">
            <div class="doc-badge">COMPROBANTE DE SIMULACIÓN</div>
            <div class="doc-num">${currentSimId}</div>
            <div class="doc-date">${fechaStr} — ${horaStr}</div>
          </div>
        </div>

        <div class="title-section">
          <h2>Estimación Preliminar de Financiación</h2>
          <p>Documento referencial emitido por la plataforma oficial de FINANCIAMIENTO & SOLUCIONES S.A.S.</p>
        </div>

        <div class="cuota-card">
          <div class="cuota-tag">Cuota Mensual Fija Estimada</div>
          <div class="cuota-val">${formatCOP(calc.cuotaFinal)}</div>
          <div class="cuota-desc">Incluye GPS de seguridad satelital, Seguro de Vida y Seguro de Desempleo</div>
        </div>

        <table class="table-summary">
          <thead>
            <tr>
              <th>Parámetro Financiero</th>
              <th>Valor Estimado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Valor Comercial de la Motocicleta</td>
              <td>${formatCOP(calc.motoValue)}</td>
            </tr>
            <tr>
              <td>Cuota Inicial Estimada</td>
              <td>${formatCOP(calc.downPaymentAmount)} (${calc.downPercent}%)</td>
            </tr>
            <tr>
              <td>Monto Estimado a Financiar (con gastos de originación)</td>
              <td>${formatCOP(calc.capitalAFinanciar)}</td>
            </tr>
            <tr>
              <td>Plazo Seleccionado</td>
              <td>${calc.termMonths} Meses</td>
            </tr>
            <tr>
              <td>Resultado Preliminar de Simulación</td>
              <td>Perfil Viable para Estudio Formal de Crédito</td>
            </tr>
          </tbody>
        </table>

        <div class="legal-notice">
          <strong>Importante:</strong> Esta simulación es únicamente informativa y preliminar. Los valores presentados son una estimación basada en la información suministrada y en los parámetros utilizados por el simulador. La generación de este documento no constituye aprobación, autorización ni oferta vinculante de crédito. La aprobación definitiva estará sujeta al proceso de evaluación y validación correspondiente.
        </div>

        <div class="footer-sign">
          <span>FINANCIAMIENTO & SOLUCIONES S.A.S. — NIT En Trámite Oficial</span>
          <span>Impreso desde www.financiamientoy soluciones.com</span>
        </div>

        <div class="no-print" style="margin-top: 25px; text-align: center;">
          <button onclick="window.print()" style="background:#1E3CAA; color:#fff; border:none; padding:10px 24px; border-radius:6px; font-weight:700; cursor:pointer; font-size:14px;">
            Imprimir / Guardar en PDF
          </button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', descargarComprobantePDF);
  }

  // Inicializar cálculo inicial
  updateSimulation();

  // Exponer API del simulador de forma segura
  window.MotorcycleSimulator = {
    update: updateSimulation,
    setVehicleValue: (val) => {
      currentVehicleValue = val;
      updateSimulation();
    },
    downloadPDF: descargarComprobantePDF,
    getState: () => ({
      vehicleValue: currentVehicleValue,
      downPercent: currentDownPaymentPercent,
      termMonths: currentTermMonths
    })
  };
})();
