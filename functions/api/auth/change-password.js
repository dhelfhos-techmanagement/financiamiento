/**
 * CLOUDFLARE PAGES FUNCTION — POST /api/auth/change-password
 * Permite actualizar la contraseña administrativa con hashing seguro.
 */

async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-512'
    },
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-512', length: 512 },
    true,
    ['sign']
  );
  const exported = await crypto.subtle.exportKey('raw', derivedKey);
  return Array.from(new Uint8Array(exported)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }) {
  try {
    const cookie = request.headers.get('Cookie') || '';
    const match = cookie.match(/fs_admin_token=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token || !env.DB) {
      return new Response(JSON.stringify({ error: 'No autorizado.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const session = await env.DB.prepare(
      `SELECT s.token, u.id as user_id, u.username, u.password_hash, u.salt
       FROM admin_sessions s
       JOIN admin_users u ON s.user_id = u.id
       WHERE s.token = ? AND s.expires_at > ?`
    ).bind(token, Date.now()).first();

    if (!session) {
      return new Response(JSON.stringify({ error: 'Sesión inválida o expirada.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return new Response(JSON.stringify({ error: 'La nueva contraseña debe tener mínimo 8 caracteres.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const currentHash = await hashPassword(currentPassword, session.salt);
    if (currentHash !== session.password_hash) {
      return new Response(JSON.stringify({ error: 'La contraseña actual no es correcta.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generar nuevo salt y hash
    const newSalt = crypto.randomUUID();
    const newHash = await hashPassword(newPassword, newSalt);

    await env.DB.prepare(
      'UPDATE admin_users SET password_hash = ?, salt = ?, updated_at = datetime("now") WHERE id = ?'
    ).bind(newHash, newSalt, session.user_id).run();

    return new Response(JSON.stringify({ success: true, message: 'Contraseña actualizada exitosamente.' }), {
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
