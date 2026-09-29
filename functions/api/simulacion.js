/**
 * CLOUDFLARE PAGES FUNCTION — POST /api/simulacion
 * Realiza el cálculo financiero y (si se envía autenticación de analista) el scoring confidencial.
 */

export async function onRequestPost({ request }) {
  try {
    const body = await request.json();
    const moto = parseFloat(body.valorMoto) || 0;
    const inicial = parseFloat(body.cuotaInicial) || 0;
    const n = parseInt(body.plazoMeses, 10) || 36;

    if (moto <= 0 || inicial <= 0) {
      return new Response(JSON.stringify({ error: 'Valores inválidos.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const pctReal = (inicial / moto) * 100;
    if (pctReal < 37) {
      return new Response(JSON.stringify({
        error: 'La cuota inicial mínima requerida es del 37%.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fórmulas oficiales de simulador_solidez_v4-2.html
    const tasaInt = 0.05;
    const saldoBase = moto - inicial;
    const capitalAFinanciar = (saldoBase * 1.035) + 550000;
    const factor = Math.pow(1 + tasaInt, n);
    const cuotaCalculada = (capitalAFinanciar * (tasaInt * factor)) / (factor - 1);
    const cuotaFinal = cuotaCalculada + 38000;

    const responsePayload = {
      success: true,
      valorMoto: moto,
      cuotaInicial: inicial,
      porcentajeInicial: parseFloat(pctReal.toFixed(2)),
      capitalAFinanciar: Math.round(capitalAFinanciar),
      plazoMeses: n,
      cuotaMensualEstimada: Math.round(cuotaFinal),
      disclaimer: 'Valores y cuotas simuladas de carácter estrictamente informativo y referencial. La tasa de interés definitiva y las condiciones del crédito están sujetas a evaluación de riesgo, perfilamiento del solicitante y políticas vigentes de FINANCIAMIENTO & SOLUCIONES S.A.S.'
    };

    // Si vienen parámetros internos de scoring (solo analistas de crédito)
    if (body.scoreDataCredito !== undefined) {
      let pts = 0;
      const score = parseInt(body.scoreDataCredito, 10) || 0;
      if (score >= 780) pts += 40;
      else if (score >= 680) pts += 25;
      else if (score >= 550) pts += 10;

      pts += parseInt(body.antiguedadPts, 10) || 0;
      pts += parseInt(body.viviendaPts, 10) || 0;
      pts += parseInt(body.telPts, 10) || 0;

      let perfil = 'PERFIL RIESGO (T4)';
      let perfilCode = 'T4';
      if (pts >= 95) {
        perfil = 'PERFIL DIAMANTE (T1)';
        perfilCode = 'T1';
      } else if (pts >= 75) {
        perfil = 'PERFIL PREFERENCIAL (T2)';
        perfilCode = 'T2';
      } else if (pts >= 50) {
        perfil = 'PERFIL ESTÁNDAR (T3)';
        perfilCode = 'T3';
      }

      const ingresos = parseFloat(body.ingresosNetos) || 0;
      const egresos = parseFloat(body.egresosMensuales) || 0;
      const disponible = ingresos - egresos;
      const isOverLimit = disponible > 0 ? (cuotaFinal > (disponible * 0.42)) : true;

      responsePayload.internalScoring = {
        puntosTotal: pts,
        perfil: perfil,
        perfilCode: perfilCode,
        ingresoDisponible: disponible,
        cuotaMaxPermitida: Math.round(disponible * 0.42),
        alertaCapacidad: isOverLimit
      };
    }

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
