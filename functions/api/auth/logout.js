/**
 * CLOUDFLARE PAGES FUNCTION — POST /api/auth/logout
 */

export async function onRequestPost({ request, env }) {
  try {
    const cookie = request.headers.get('Cookie') || '';
    const match = cookie.match(/fs_admin_token=([^;]+)/);
    const token = match ? match[1] : null;

    if (token && env.DB) {
      await env.DB.prepare('DELETE FROM admin_sessions WHERE token = ?').bind(token).run();
    }

    const clearCookie = `fs_admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`;

    return new Response(JSON.stringify({ success: true, message: 'Sesión finalizada.' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': clearCookie
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
