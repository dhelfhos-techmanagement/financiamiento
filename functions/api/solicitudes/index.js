/**
 * CLOUDFLARE PAGES FUNCTION — /api/solicitudes
 * GET: Requiere autenticación de analista / admin. Lista solicitudes con filtros.
 * POST: Público. Registra una nueva solicitud proveniente del formulario digital.
 */

async function checkAuth(request, env) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/fs_admin_token=([^;]+)/);
  const token = match ? match[1] : null;

  if (!token || !env.DB) return null;

  return await env.DB.prepare(
    `SELECT s.token, u.id as user_id, u.username, u.role
     FROM admin_sessions s
     JOIN admin_users u ON s.user_id = u.id
     WHERE s.token = ? AND s.expires_at > ?`
  ).bind(token, Date.now()).first();
}

export async function onRequestGet({ request, env }) {
  try {
    const auth = await checkAuth(request, env);
    if (!auth) {
      return new Response(JSON.stringify({ error: 'No autorizado. Inicie sesión.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const estado = url.searchParams.get('estado');
    const search = url.searchParams.get('q');

    let query = 'SELECT id, radicado, fecha, nombre_completo, tipo_documento, numero_documento, celular, correo, ciudad, referencia_moto, valor_vehiculo, cuota_inicial, monto_financiar, plazo_meses, cuota_aprox, estado, scoring_pts, perfil, capacidad_disponible, alerta_capacidad, updated_at FROM solicitudes WHERE 1=1';
    const params = [];

    if (estado && estado !== 'TODOS') {
      query += ' AND estado = ?';
      params.push(estado);
    }

    if (search) {
      query += ' AND (radicado LIKE ? OR nombre_completo LIKE ? OR numero_documento LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY fecha DESC LIMIT 100';

    const stmt = env.DB.prepare(query);
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

    return new Response(JSON.stringify({ success: true, count: results.length, data: results }), {
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

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();

    // Validaciones de campos obligatorios
    if (!data.nombreCompleto || !data.numeroDocumento || !data.celular || !data.valorVehiculo) {
      return new Response(JSON.stringify({ error: 'Faltan campos obligatorios para radicar la solicitud.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const radicado = data.radicado || `FS-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const id = crypto.randomUUID();
    const fecha = new Date().toISOString();

    const valorVehiculo = parseFloat(data.valorVehiculo) || 0;
    const cuotaInicial = parseFloat(data.cuotaInicial) || (valorVehiculo * 0.37);
    const montoFinanciar = parseFloat(data.montoFinanciar) || (valorVehiculo - cuotaInicial);
    const plazoMeses = parseInt(data.plazoMeses, 10) || 36;

    if (env.DB) {
      await env.DB.prepare(`
        INSERT INTO solicitudes (
          id, radicado, fecha, nombre_completo, tipo_documento, numero_documento, celular, correo, ciudad,
          referencia_moto, valor_vehiculo, cuota_inicial, monto_financiar, plazo_meses, cuota_aprox,
          datos_completos, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE')
      `).bind(
        id,
        radicado,
        fecha,
        data.nombreCompleto,
        data.tipoDocumento || 'CC',
        data.numeroDocumento,
        data.celular,
        data.correo || '',
        data.ciudadResidencia || '',
        data.referenciaMoto || 'Motocicleta Estándar',
        valorVehiculo,
        cuotaInicial,
        montoFinanciar,
        plazoMeses,
        data.cuotaAprox || '$ 0',
        JSON.stringify(data)
      ).run();
    }

    return new Response(JSON.stringify({
      success: true,
      radicado: radicado,
      id: id,
      message: 'Solicitud radicada formalmente.'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
