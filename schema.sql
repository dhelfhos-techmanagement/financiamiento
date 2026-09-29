-- ============================================================
-- ESQUEMA D1 SQLITE — FINANCIAMIENTO & SOLUCIONES S.A.S.
-- Compatible con Cloudflare D1 y SQLite estándar
-- ============================================================

-- Tabla de Usuarios Administrativos
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'analista',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tabla de Sesiones Seguras (Tokens HttpOnly)
CREATE TABLE IF NOT EXISTS admin_sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- Tabla de Solicitudes de Crédito Radicadas
CREATE TABLE IF NOT EXISTS solicitudes (
    id TEXT PRIMARY KEY,
    radicado TEXT UNIQUE NOT NULL,
    fecha TEXT NOT NULL DEFAULT (datetime('now')),
    nombre_completo TEXT NOT NULL,
    tipo_documento TEXT NOT NULL,
    numero_documento TEXT NOT NULL,
    celular TEXT NOT NULL,
    correo TEXT NOT NULL,
    ciudad TEXT NOT NULL,
    referencia_moto TEXT NOT NULL,
    valor_vehiculo REAL NOT NULL,
    cuota_inicial REAL NOT NULL,
    monto_financiar REAL NOT NULL,
    plazo_meses INTEGER NOT NULL,
    cuota_aprox TEXT,
    datos_completos TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'PENDIENTE',
    scoring_pts INTEGER DEFAULT NULL,
    perfil TEXT DEFAULT NULL,
    capacidad_disponible REAL DEFAULT NULL,
    alerta_capacidad INTEGER DEFAULT 0,
    notas_analista TEXT DEFAULT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_solicitudes_radicado ON solicitudes(radicado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_documento ON solicitudes(numero_documento);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_fecha ON solicitudes(fecha DESC);

-- Tabla de Parámetros y Contenido Dinámico Institucional
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Inserción de Configuración Institucional Inicial
INSERT OR IGNORE INTO site_settings (key, value) VALUES 
('contact_phone', '(601) 000-0000'),
('contact_email', 'atencion@financiamientosoluciones.com'),
('contact_hours', 'Lunes a Sábado: 8:00 a.m. a 6:00 p.m.'),
('min_down_pct', '37'),
('max_down_pct', '80'),
('default_term', '36'),
('asset_como_funciona', 'ChatGPT Image 28 sept 2026, 12_16_18.png'),
('asset_hunk_125', 'ChatGPT Image 28 sept 2026, 11_19_14.png'),
('asset_dr_150', 'ChatGPT Image 28 sept 2026, 11_19_03.png'),
('asset_compromiso_social', 'ChatGPT Image 28 sept 2026, 15_39_54.png');
