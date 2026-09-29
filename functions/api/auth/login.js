/**
 * CLOUDFLARE PAGES FUNCTION — POST /api/auth/login
 * Autenticación administrativa segura con Web Crypto y HttpOnly cookies.
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
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Credenciales incompletas.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!env.DB) {
      // Modo fallback sin base de datos Cloudflare configurada
      return new Response(JSON.stringify({ error: 'Servicio de base de datos no configurado.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Buscar usuario
    const user = await env.DB.prepare('SELECT * FROM admin_users WHERE username = ?').bind(username).first();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Usuario o contraseña incorrectos.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar hash
    const inputHash = await hashPassword(password, user.salt);
    if (inputHash !== user.password_hash) {
      return new Response(JSON.stringify({ error: 'Usuario o contraseña incorrectos.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generar token de sesión criptográfico
    const sessionToken = crypto.randomUUID() + '-' + crypto.randomUUID();
    const expiresAt = Date.now() + (8 * 60 * 60 * 1000); // 8 horas

    await env.DB.prepare(
      'INSERT INTO admin_sessions (token, user_id, expires_at) VALUES (?, ?, ?)'
    ).bind(sessionToken, user.id, expiresAt).run();

    const cookieHeader = `fs_admin_token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800; Secure`;

    return new Response(JSON.stringify({
      success: true,
      user: { id: user.id, username: user.username, role: user.role }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieHeader
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error interno de autenticación: ' + err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
