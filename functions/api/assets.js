/**
 * CLOUDFLARE PAGES FUNCTION — /api/assets
 * Manejo de Assets Oficiales con persistencia en Cloudflare D1
 */

const DEFAULT_SITE_ASSETS = {
  como_funciona: 'ChatGPT Image 28 sept 2026, 12_16_18.png',
  hunk_125: 'ChatGPT Image 28 sept 2026, 11_19_14.png',
  dr_150: 'ChatGPT Image 28 sept 2026, 11_19_03.png',
  compromiso_social: 'ChatGPT Image 28 sept 2026, 15_39_54.png'
};

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
      return new Response(JSON.stringify({ success: true, data: DEFAULT_SITE_ASSETS, defaults: DEFAULT_SITE_ASSETS }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { results } = await env.DB.prepare("SELECT key, value FROM site_settings WHERE key LIKE 'asset_%'").all();
    const assets = { ...DEFAULT_SITE_ASSETS };

    results.forEach(r => {
      const cleanKey = r.key.replace(/^asset_/, '');
      if (cleanKey in assets) {
        assets[cleanKey] = r.value;
      }
    });

    return new Response(JSON.stringify({ success: true, data: assets, defaults: DEFAULT_SITE_ASSETS }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, data: DEFAULT_SITE_ASSETS }), {
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

    if (env.DB) {
      for (const [key, value] of Object.entries(body)) {
        const dbKey = 'asset_' + key;
        await env.DB.prepare(
          'INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime("now")) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime("now")'
        ).bind(dbKey, String(value), String(value)).run();
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'Assets actualizados con éxito en base de datos D1.' }), {
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
