/**
 * CLOUDFLARE PAGES FUNCTION — GET /api/auth/me
 * Valida la sesión activa del usuario administrador.
 */

export async function onRequestGet({ request, env }) {
  try {
    const cookie = request.headers.get('Cookie') || '';
    const match = cookie.match(/fs_admin_token=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token) {
      return new Response(JSON.stringify({ authenticated: false }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!env.DB) {
      return new Response(JSON.stringify({ authenticated: false, error: 'DB no disponible' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const session = await env.DB.prepare(
      `SELECT s.token, s.expires_at, u.id as user_id, u.username, u.role
       FROM admin_sessions s
       JOIN admin_users u ON s.user_id = u.id
       WHERE s.token = ? AND s.expires_at > ?`
    ).bind(token, Date.now()).first();

    if (!session) {
      return new Response(JSON.stringify({ authenticated: false }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      authenticated: true,
      user: { id: session.user_id, username: session.username, role: session.role }
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
