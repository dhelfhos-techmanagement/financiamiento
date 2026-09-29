/**
 * CLOUDFLARE PAGES FUNCTION — /api/solicitudes/[id]
 * GET: Obtener detalle completo de una solicitud (incluyendo datos confidenciales y formulario completo).
 * PUT: Actualizar estado de aprobación, notas del analista y scoring interno.
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

export async function onRequestGet({ request, params, env }) {
  try {
    const auth = await checkAuth(request, env);
    if (!auth) {
      return new Response(JSON.stringify({ error: 'No autorizado.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = params;

    const row = await env.DB.prepare('SELECT * FROM solicitudes WHERE id = ? OR radicado = ?').bind(id, id).first();

    if (!row) {
      return new Response(JSON.stringify({ error: 'Solicitud no encontrada.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        ...row,
        datos_completos: JSON.parse(row.datos_completos || '{}')
      }
    }), {
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

export async function onRequestPut({ request, params, env }) {
  try {
    const auth = await checkAuth(request, env);
    if (!auth) {
      return new Response(JSON.stringify({ error: 'No autorizado.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = params;
    const body = await request.json();

    const {
      estado,
      scoring_pts,
      perfil,
      capacidad_disponible,
      alerta_capacidad,
      notas_analista
    } = body;

    await env.DB.prepare(`
      UPDATE solicitudes SET
        estado = COALESCE(?, estado),
        scoring_pts = COALESCE(?, scoring_pts),
        perfil = COALESCE(?, perfil),
        capacidad_disponible = COALESCE(?, capacidad_disponible),
        alerta_capacidad = COALESCE(?, alerta_capacidad),
        notas_analista = COALESCE(?, notas_analista),
        updated_at = datetime('now')
      WHERE id = ? OR radicado = ?
    `).bind(
      estado || null,
      scoring_pts !== undefined ? scoring_pts : null,
      perfil || null,
      capacidad_disponible !== undefined ? capacidad_disponible : null,
      alerta_capacidad !== undefined ? alerta_capacidad : null,
      notas_analista || null,
      id,
      id
    ).run();

    return new Response(JSON.stringify({ success: true, message: 'Solicitud actualizada correctamente.' }), {
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
