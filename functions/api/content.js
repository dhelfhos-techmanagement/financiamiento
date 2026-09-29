/**
 * CLOUDFLARE PAGES FUNCTION — /api/content
 * GET: Devuelve configuraciones y avisos institucionales públicos.
 * PUT: Requiere autenticación admin. Actualiza teléfonos, horarios o avisos.
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

export async function onRequestGet({ env }) {
  try {
    if (!env.DB) {
      return new Response(JSON.stringify({ success: true, data: {} }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { results } = await env.DB.prepare('SELECT key, value FROM site_settings').all();
    const settings = {};
    results.forEach(r => { settings[r.key] = r.value; });

    return new Response(JSON.stringify({ success: true, data: settings }), {
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

export async function onRequestPut({ request, env }) {
  try {
    const auth = await checkAuth(request, env);
    if (!auth) {
      return new Response(JSON.stringify({ error: 'No autorizado.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();

    for (const [key, value] of Object.entries(body)) {
      await env.DB.prepare(
        'INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime("now")) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime("now")'
      ).bind(key, String(value), String(value)).run();
    }

    return new Response(JSON.stringify({ success: true, message: 'Contenido actualizado correctamente.' }), {
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
