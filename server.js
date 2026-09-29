/**
 * SERVIDOR LOCAL DE DESARROLLO Y PRODUCCIÓN — FINANCIAMIENTO & SOLUCIONES S.A.S.
 * Cero dependencias externas (usa módulos nativos de Node.js: http, crypto, fs, path).
 * Implementa autenticación con cookies HttpOnly, PBKDF2, API REST y servidor estático.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Crear carpetas requeridas si no existen
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Utilidad PBKDF2
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

// Mapeo oficial por defecto según el Prompt Maestro
const DEFAULT_SITE_ASSETS = {
  como_funciona: 'ChatGPT Image 28 sept 2026, 12_16_18.png',
  hunk_125: 'ChatGPT Image 28 sept 2026, 11_19_14.png',
  dr_150: 'ChatGPT Image 28 sept 2026, 11_19_03.png',
  compromiso_social: 'ChatGPT Image 28 sept 2026, 15_39_54.png'
};

// Catálogo oficial de motocicletas (Sistema Dinámico)
const DEFAULT_MOTORCYCLES = [
  {
    id: 'moto_hunk125',
    name: 'HUNK 125',
    category: 'Línea Urbana & Street',
    price: 8500000,
    promo_text: 'Tu compañera para llegar más lejos.',
    desc: 'Tu compañera ideal para llegar más lejos. Agilidad, bajo consumo de combustible, excelente torque y ergonomía diseñada para acompañar tu jornada laboral y tus recorridos diarios con total fiabilidad.',
    image_main: 'ChatGPT Image 28 sept 2026, 11_19_14.png',
    gallery: [
      'ChatGPT Image 28 sept 2026, 11_19_14.png'
    ],
    specs: {
      engine: 'Motor 125 cc',
      consumption: 'Bajo Consumo',
      brakes: 'Frenos IBS (Combinados)',
      lights: 'Luces 100% LED'
    },
    order: 1,
    active: true
  },
  {
    id: 'moto_dr150',
    name: 'DR 150',
    category: 'Línea Adventure / Doble Propósito',
    price: 12800000,
    promo_text: 'Más potencia para seguir avanzando.',
    desc: 'Más potencia para seguir avanzando. Capacidad para dominar la ciudad o aventurarte en carretera y terrenos mixtos con suspensión reforzada, excelente respuesta de aceleración y frenado seguro.',
    image_main: 'ChatGPT Image 28 sept 2026, 11_19_03.png',
    gallery: [
      'ChatGPT Image 28 sept 2026, 11_19_03.png'
    ],
    specs: {
      engine: 'Motor 149 cc',
      consumption: 'Gran Rendimiento',
      brakes: 'Frenos ABS Total',
      lights: 'Ideal Ciudad y Vía'
    },
    order: 2,
    active: true
  }
];

// Configuración CMS Completa del Home
const DEFAULT_SITE_SETTINGS = {
  contact_phone: '(601) 000-0000',
  contact_email: 'atencion@financiamientosoluciones.com',
  contact_hours: 'Lunes a Sábado: 8:00 a.m. a 6:00 p.m.',
  min_down_pct: '37',
  max_down_pct: '80',
  default_term: '36',
  identity: {
    logo_url: 'assets/images/logo.jpg',
    company_name: 'FINANCIAMIENTO & SOLUCIONES',
    company_subtitle: 'Financiera de Motocicletas S.A.S.',
    legal_text: 'S.A.S. — NIT [En Registro Oficial]'
  },
  hero: {
    tag: 'Movilidad que te impulsa',
    title: 'Haz realidad tu próxima moto',
    subtitle: 'Financiación ágil, segura y a tu medida. Diseñamos planes transparentes que se adaptan a tus ingresos para que estrenes la motocicleta que impulsa tu trabajo y tu vida.',
    btn1_text: 'Simula tu Cuota',
    btn1_link: '#simulador',
    btn2_text: 'Solicitar Financiación',
    btn2_link: '#solicitud-credito',
    video_url: 'Hero_Financiamiento_Soluciones_Identidad.mp4',
    poster_url: 'assets/images/hero-lifestyle.jpg'
  },
  propuesta_valor: {
    tag: 'Modelo Institucional',
    title: 'Unidos somos más oportunidad para todos',
    subtitle: 'Nuestro modelo híbrido: tecnología con humanismo',
    lead_quote: 'Tecnología que agiliza, personas que entienden.',
    lead_text: 'Trabajamos con un modelo híbrido que une lo mejor de dos mundos. Nuestras herramientas tecnológicas analizan tu solicitud con rapidez y seguridad, y nuestro equipo humano escucha tu historia, entiende tu realidad y te acompaña en cada paso. Por eso no te juzgamos solo por un puntaje: diseñamos el crédito según lo que necesitas y puedes pagar.',
    pilar1_title: 'RÁPIDO',
    pilar1_desc: 'Respuesta y aprobación ágil, sin filas ni trámites interminables. Procesos digitales optimizados para que no pierdas tiempo.',
    pilar2_title: 'SEGURO',
    pilar2_desc: 'Procesos digitales confiables que protegen tu información y tu dinero bajo estrictos estándares de seguridad y confidencialidad.',
    pilar3_title: 'A TU MEDIDA',
    pilar3_desc: 'Asesoría personalizada para que tu crédito se ajuste a tu vida, tus ingresos y tus proyectos de crecimiento personal o laboral.'
  },
  mision_vision: {
    mision_title: 'Nuestra Misión',
    mision_content: 'En FINANCIAMIENTO & SOLUCIONES S.A.S. impulsamos la movilidad, el progreso y el bienestar de las familias colombianas facilitando el acceso a motocicletas a través de créditos ágiles, transparentes y a su medida. Combinamos tecnología avanzada con cercanía humana para ofrecer soluciones financieras responsables, seguras y de calidad que permitan a nuestros clientes mejorar sus ingresos, optimizar su tiempo y alcanzar sus metas.',
    vision_title: 'Nuestra Visión',
    vision_year: '[AÑO POR CONFIRMAR: verificar con la empresa]',
    vision_content: 'Para el [AÑO POR CONFIRMAR: verificar con la empresa], seremos la compañía líder y más confiable en la financiación de motocicletas en Colombia, reconocida por nuestra solidez financiera, excelencia en el servicio y aporte al desarrollo económico y social del país. Nos proyectamos como el aliado preferido de concesionarios y clientes, transformando la experiencia de financiamiento mediante innovación digital continua y un modelo humano que siempre pone a las personas en el centro de cada decisión.'
  },
  compromiso_social: {
    tag: 'COMPROMISO SOCIAL & PAÍS',
    title: 'Unidos somos más oportunidad para todos',
    main_text: 'En FINANCIAMIENTO & SOLUCIONES S.A.S. entendemos que detrás de cada solicitud de crédito hay una persona trabajadora, una familia con metas y un proyecto de vida en marcha.',
    quote: 'Creemos firmemente que una motocicleta es mucho más que un medio de transporte: es una herramienta de progreso, de independencia y de nuevas oportunidades.',
    complement_text: 'Por eso, nuestro compromiso va más allá de un crédito; trabajamos para acompañar a quienes construyen país todos los días, brindándoles soluciones financieras que se adaptan a su realidad.',
    final_text: 'Porque cuando una persona avanza, avanza su familia y avanza Colombia. Juntos construimos un futuro con más posibilidades para todos.'
  },
  lineas_negocio: [
    {
      id: 'linea_motos',
      title: 'CRÉDITO PARA MOTOCICLETAS',
      desc: 'Financiamos tu moto para que ganes movilidad, tiempo e ingresos. Para muchas familias, la moto es una herramienta de trabajo, y queremos que llegue a quienes la necesitan, con trámites ágiles y cuotas a tu medida.',
      btn_text: 'Simular mi Moto',
      btn_link: '#simulador',
      active: true
    },
    {
      id: 'linea_vehiculos',
      title: 'CRÉDITO PARA VEHÍCULOS',
      desc: 'Te acompañamos en la compra de tu carro, ya sea para uso personal o para trabajar. Ofrecemos un proceso claro, asesoría cercana y condiciones pensadas para tu realidad económica.',
      btn_text: 'Consultar Plan',
      btn_link: '#solicitud-credito',
      active: true
    },
    {
      id: 'linea_libranza',
      title: 'CRÉDITOS DE LIBRANZA',
      desc: 'Si eres empleado público, pensionado o trabajas en una empresa privada con convenio, accedes a crédito con descuento directo de nómina. Tus cuotas son fijas, el proceso es sencillo y tienes la tranquilidad de pagar sin preocuparte por fechas.',
      btn_text: 'Solicitar Convenio',
      btn_link: '#solicitud-credito',
      active: true
    }
  ],
  requisitos: {
    title: 'Requisitos Transparentes y al Alcance',
    subtitle: 'Diseñados para facilitarte el acceso al crédito con trámites ágiles y claros.',
    empleados: [
      'Documento de identidad original (Cédula de Ciudadanía o extranjería)',
      'Certificación laboral con vigencia no mayor a 30 días',
      'Desprendibles de pago de los últimos 2 a 3 meses',
      'Ingresos mensuales mínimos demostrables a partir de 1 SMMLV'
    ],
    independientes: [
      'Documento de identidad original vigente',
      'Extractos bancarios de los últimos 3 meses donde se reflejen movimientos',
      'RUT actualizado o constancia de actividad comercial verificable',
      'Facturas de compra/venta o soportes de ingresos del negocio'
    ]
  },
  faq_items: [
    {
      id: 'faq_1',
      category: 'proceso',
      question: '¿Cuánto tiempo tarda la respuesta a mi solicitud de crédito?',
      answer: 'Nuestro comité de evaluación digital emite una respuesta preliminar en un plazo promedio ágil una vez recibida la documentación completa y verificada la información del solicitante.',
      active: true
    },
    {
      id: 'faq_2',
      category: 'requisitos',
      question: '¿Puedo solicitar financiación si trabajo de forma independiente?',
      answer: '¡Sí, por supuesto! Contamos con una línea especializada para independientes, comerciantes y emprendedores, validando tus ingresos a través de extractos bancarios y constancias de tu actividad comercial.',
      active: true
    },
    {
      id: 'faq_3',
      category: 'requisitos',
      question: '¿Es obligatorio tener un codeudor solidario?',
      answer: 'No en todos los casos. La exigencia de codeudor depende del perfil crediticio individual, los ingresos acreditados y el monto a financiar. En caso de requerirlo, puedes incluirlo fácilmente en el Paso 4 de tu formulario digital.',
      active: true
    },
    {
      id: 'faq_4',
      category: 'pagos',
      question: '¿Puedo realizar abonos extraordinarios a capital o cancelar anticipadamente?',
      answer: 'Sí. Puedes realizar pagos extraordinarios directos al capital de tu crédito en cualquier momento sin penalidades, permitiéndote reducir el valor de tus cuotas restantes o el plazo total convenido.',
      active: true
    },
    {
      id: 'faq_5',
      category: 'proceso',
      question: '¿Qué marcas o tipos de motocicletas puedo financiar con ustedes?',
      answer: 'Financiamos una amplia gama de motocicletas nuevas (urbanas, scooters, de trabajo, todoterreno y alto cilindraje) comercializadas por concesionarios autorizados y marcas líderes a nivel nacional.',
      active: true
    }
  ],
  social_networks: {
    instagram: { name: 'Instagram', url: '', active: false },
    facebook: { name: 'Facebook', url: '', active: false },
    tiktok: { name: 'TikTok', url: '', active: false },
    youtube: { name: 'YouTube', url: '', active: false },
    linkedin: { name: 'LinkedIn', url: '', active: false }
  },
  contact: {
    address: 'Sede Principal: [Dirección Oficial Institucional, Colombia]',
    phone: '(601) 000-0000',
    email: 'atencion@financiamientosoluciones.com',
    hours: 'Lunes a Sábado: 8:00 a.m. a 6:00 p.m.'
  }
};

// Base de datos local persistente en JSON
let db = {
  admin_users: [],
  admin_sessions: {},
  solicitudes: [],
  site_settings: { ...DEFAULT_SITE_SETTINGS },
  site_assets: { ...DEFAULT_SITE_ASSETS },
  motorcycles: [ ...DEFAULT_MOTORCYCLES ]
};

function saveDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function loadDb() {
  if (fs.existsSync(DB_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch (e) {
      console.error('Error al leer DB local, recreando...', e);
    }
  }

  // Inicializar usuario admin por defecto si no existe
  if (!db.admin_users || db.admin_users.length === 0) {
    const defaultSalt = crypto.randomBytes(16).toString('hex');
    const defaultPass = 'AdminFinanciamiento2026*';
    const defaultHash = hashPassword(defaultPass, defaultSalt);

    db.admin_users = [{
      id: 1,
      username: 'admin',
      password_hash: defaultHash,
      salt: defaultSalt,
      role: 'superadmin',
      created_at: new Date().toISOString()
    }];
    saveDb();
    console.log('\n[SEGURIDAD] Usuario Administrador Inicial Creado:');
    console.log('  -> Usuario: admin');
    console.log('  -> Contraseña: ' + defaultPass + '\n');
  }

  // Asegurar que site_assets exista y esté inicializado
  if (!db.site_assets || typeof db.site_assets !== 'object') {
    db.site_assets = { ...DEFAULT_SITE_ASSETS };
    saveDb();
  }

  // Asegurar que motorcycles exista y esté inicializado
  if (!db.motorcycles || !Array.isArray(db.motorcycles) || db.motorcycles.length === 0) {
    db.motorcycles = JSON.parse(JSON.stringify(DEFAULT_MOTORCYCLES));
    saveDb();
  }

  // Asegurar que site_settings contenga todas las secciones requeridas
  if (!db.site_settings || typeof db.site_settings !== 'object') {
    db.site_settings = JSON.parse(JSON.stringify(DEFAULT_SITE_SETTINGS));
    saveDb();
  } else {
    let changed = false;
    for (const key of Object.keys(DEFAULT_SITE_SETTINGS)) {
      if (db.site_settings[key] === undefined) {
        db.site_settings[key] = JSON.parse(JSON.stringify(DEFAULT_SITE_SETTINGS[key]));
        changed = true;
      }
    }
    if (changed) saveDb();
  }
}

loadDb();

// MIME Types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.ico': 'image/x-icon',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

// Helper cookies
function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
  }
  return list;
}

function getAuthUser(req) {
  const cookies = parseCookies(req);
  const token = cookies.fs_admin_token;
  if (!token) return null;

  const session = db.admin_sessions[token];
  if (!session) return null;

  if (Date.now() > session.expires_at) {
    delete db.admin_sessions[token];
    saveDb();
    return null;
  }

  return db.admin_users.find(u => u.id === session.user_id) || null;
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
  });
}

function sendJson(res, statusCode, data, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    ...headers
  });
  res.end(JSON.stringify(data));
}

// Router HTTP
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // -------------------------------------------------------------
  // API ENDPOINTS
  // -------------------------------------------------------------

  // POST /api/auth/login
  if (pathname === '/api/auth/login' && method === 'POST') {
    try {
      const { username, password } = await parseJsonBody(req);
      const user = db.admin_users.find(u => u.username === username);

      if (!user) {
        return sendJson(res, 401, { error: 'Usuario o contraseña incorrectos.' });
      }

      const inputHash = hashPassword(password, user.salt);
      if (inputHash !== user.password_hash) {
        return sendJson(res, 401, { error: 'Usuario o contraseña incorrectos.' });
      }

      const token = crypto.randomUUID() + '-' + crypto.randomUUID();
      const expiresAt = Date.now() + (8 * 60 * 60 * 1000); // 8 horas

      db.admin_sessions[token] = {
        user_id: user.id,
        expires_at: expiresAt
      };
      saveDb();

      return sendJson(res, 200, {
        success: true,
        user: { id: user.id, username: user.username, role: user.role }
      }, {
        'Set-Cookie': `fs_admin_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800`
      });
    } catch (e) {
      return sendJson(res, 400, { error: 'Petición inválida.' });
    }
  }

  // POST /api/auth/logout
  if (pathname === '/api/auth/logout' && method === 'POST') {
    const cookies = parseCookies(req);
    if (cookies.fs_admin_token) {
      delete db.admin_sessions[cookies.fs_admin_token];
      saveDb();
    }
    return sendJson(res, 200, { success: true }, {
      'Set-Cookie': `fs_admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
    });
  }

  // GET /api/auth/me
  if (pathname === '/api/auth/me' && method === 'GET') {
    const user = getAuthUser(req);
    if (!user) {
      return sendJson(res, 401, { authenticated: false });
    }
    return sendJson(res, 200, {
      authenticated: true,
      user: { id: user.id, username: user.username, role: user.role }
    });
  }

  // POST /api/auth/change-password
  if (pathname === '/api/auth/change-password' && method === 'POST') {
    const user = getAuthUser(req);
    if (!user) return sendJson(res, 401, { error: 'No autorizado.' });

    try {
      const { currentPassword, newPassword } = await parseJsonBody(req);
      if (!currentPassword || !newPassword || newPassword.length < 8) {
        return sendJson(res, 400, { error: 'La nueva contraseña debe tener mínimo 8 caracteres.' });
      }

      const currentHash = hashPassword(currentPassword, user.salt);
      if (currentHash !== user.password_hash) {
        return sendJson(res, 400, { error: 'La contraseña actual es incorrecta.' });
      }

      user.salt = crypto.randomBytes(16).toString('hex');
      user.password_hash = hashPassword(newPassword, user.salt);
      saveDb();

      return sendJson(res, 200, { success: true, message: 'Contraseña actualizada.' });
    } catch (e) {
      return sendJson(res, 400, { error: 'Petición inválida.' });
    }
  }

  // GET /api/solicitudes
  if (pathname === '/api/solicitudes' && method === 'GET') {
    const user = getAuthUser(req);
    if (!user) return sendJson(res, 401, { error: 'No autorizado. Inicie sesión.' });

    const estado = parsedUrl.searchParams.get('estado');
    const search = (parsedUrl.searchParams.get('q') || '').toLowerCase();

    let list = db.solicitudes || [];

    if (estado && estado !== 'TODOS') {
      list = list.filter(s => s.estado === estado);
    }

    if (search) {
      list = list.filter(s => 
        (s.radicado && s.radicado.toLowerCase().includes(search)) ||
        (s.nombre_completo && s.nombre_completo.toLowerCase().includes(search)) ||
        (s.numero_documento && s.numero_documento.toLowerCase().includes(search))
      );
    }

    return sendJson(res, 200, { success: true, count: list.length, data: list });
  }

  // POST /api/solicitudes (Público)
  if (pathname === '/api/solicitudes' && method === 'POST') {
    try {
      const data = await parseJsonBody(req);
      if (!data.nombreCompleto || !data.numeroDocumento || !data.celular) {
        return sendJson(res, 400, { error: 'Campos requeridos incompletos.' });
      }

      const radicado = data.radicado || `FS-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const valorVehiculo = parseFloat(data.valorVehiculo) || 0;
      const cuotaInicial = parseFloat(data.cuotaInicial) || (valorVehiculo * 0.37);
      const montoFinanciar = parseFloat(data.montoFinanciar) || (valorVehiculo - cuotaInicial);
      const plazoMeses = parseInt(data.plazoMeses, 10) || 36;

      const newRecord = {
        id: crypto.randomUUID(),
        radicado: radicado,
        fecha: new Date().toISOString(),
        nombre_completo: data.nombreCompleto,
        tipo_documento: data.tipoDocumento || 'CC',
        numero_documento: data.numeroDocumento,
        celular: data.celular,
        correo: data.correo || '',
        ciudad: data.ciudadResidencia || '',
        referencia_moto: data.referenciaMoto || 'Motocicleta Estándar',
        valor_vehiculo: valorVehiculo,
        cuota_inicial: cuotaInicial,
        monto_financiar: montoFinanciar,
        plazo_meses: plazoMeses,
        cuota_aprox: data.cuotaAprox || '$ 0',
        datos_completos: data,
        estado: 'PENDIENTE',
        scoring_pts: null,
        perfil: null,
        capacidad_disponible: null,
        alerta_capacidad: 0,
        notas_analista: '',
        updated_at: new Date().toISOString()
      };

      if (!db.solicitudes) db.solicitudes = [];
      db.solicitudes.unshift(newRecord);
      saveDb();

      return sendJson(res, 201, {
        success: true,
        radicado: radicado,
        id: newRecord.id,
        message: 'Solicitud radicada con éxito.'
      });
    } catch (e) {
      return sendJson(res, 400, { error: 'Error procesando solicitud.' });
    }
  }

  // GET /api/solicitudes/:id
  const singleMatch = pathname.match(/^\/api\/solicitudes\/([a-zA-Z0-9_-]+)$/);
  if (singleMatch && method === 'GET') {
    const user = getAuthUser(req);
    if (!user) return sendJson(res, 401, { error: 'No autorizado.' });

    const targetId = singleMatch[1];
    const item = (db.solicitudes || []).find(s => s.id === targetId || s.radicado === targetId);

    if (!item) return sendJson(res, 404, { error: 'Solicitud no encontrada.' });
    return sendJson(res, 200, { success: true, data: item });
  }

  // PUT /api/solicitudes/:id
  if (singleMatch && method === 'PUT') {
    const user = getAuthUser(req);
    if (!user) return sendJson(res, 401, { error: 'No autorizado.' });

    try {
      const targetId = singleMatch[1];
      const item = (db.solicitudes || []).find(s => s.id === targetId || s.radicado === targetId);
      if (!item) return sendJson(res, 404, { error: 'Solicitud no encontrada.' });

      const body = await parseJsonBody(req);
      if (body.estado) item.estado = body.estado;
      if (body.scoring_pts !== undefined) item.scoring_pts = body.scoring_pts;
      if (body.perfil) item.perfil = body.perfil;
      if (body.capacidad_disponible !== undefined) item.capacidad_disponible = body.capacidad_disponible;
      if (body.alerta_capacidad !== undefined) item.alerta_capacidad = body.alerta_capacidad;
      if (body.notas_analista !== undefined) item.notas_analista = body.notas_analista;
      item.updated_at = new Date().toISOString();

      saveDb();
      return sendJson(res, 200, { success: true, message: 'Solicitud actualizada.', data: item });
    } catch (e) {
      return sendJson(res, 400, { error: 'Error actualizando solicitud.' });
    }
  }

  // POST /api/simulacion
  if (pathname === '/api/simulacion' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const moto = parseFloat(body.valorMoto) || 0;
      const inicial = parseFloat(body.cuotaInicial) || 0;
      const n = parseInt(body.plazoMeses, 10) || 36;

      const pctReal = moto > 0 ? (inicial / moto) * 100 : 0;
      const tasaInt = 0.05;
      const saldoBase = moto - inicial;
      const capitalAFinanciar = (saldoBase * 1.035) + 550000;
      const factor = Math.pow(1 + tasaInt, n);
      const cuotaCalculada = (capitalAFinanciar * (tasaInt * factor)) / (factor - 1);
      const cuotaFinal = cuotaCalculada + 38000;

      const result = {
        success: true,
        valorMoto: moto,
        cuotaInicial: inicial,
        porcentajeInicial: parseFloat(pctReal.toFixed(2)),
        capitalAFinanciar: Math.round(capitalAFinanciar),
        plazoMeses: n,
        cuotaMensualEstimada: Math.round(cuotaFinal),
        disclaimer: 'Valores y cuotas simuladas de carácter estrictamente informativo y referencial.'
      };

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

        result.internalScoring = {
          puntosTotal: pts,
          perfil: perfil,
          perfilCode: perfilCode,
          ingresoDisponible: disponible,
          cuotaMaxPermitida: Math.round(disponible * 0.42),
          alertaCapacidad: isOverLimit
        };
      }

      return sendJson(res, 200, result);
    } catch (e) {
      return sendJson(res, 400, { error: 'Error en simulación.' });
    }
  }

  // GET /api/content & PUT /api/content
  if (pathname === '/api/content') {
    if (method === 'GET') {
      return sendJson(res, 200, {
        success: true,
        data: db.site_settings,
        motorcycles: db.motorcycles || [],
        assets: db.site_assets || {}
      });
    }
    if (method === 'PUT') {
      const user = getAuthUser(req);
      if (!user) return sendJson(res, 401, { error: 'No autorizado. Inicie sesión.' });

      try {
        const body = await parseJsonBody(req);
        if (body.site_settings) {
          db.site_settings = { ...db.site_settings, ...body.site_settings };
        } else {
          db.site_settings = { ...db.site_settings, ...body };
        }
        if (body.motorcycles && Array.isArray(body.motorcycles)) {
          db.motorcycles = body.motorcycles;
        }
        if (body.site_assets && typeof body.site_assets === 'object') {
          db.site_assets = { ...db.site_assets, ...body.site_assets };
        }
        saveDb();
        return sendJson(res, 200, {
          success: true,
          message: 'Configuración y contenido guardados con éxito en la base de datos.',
          data: db.site_settings,
          motorcycles: db.motorcycles
        });
      } catch (e) {
        return sendJson(res, 400, { error: 'Petición inválida.' });
      }
    }
  }

  // -------------------------------------------------------------
  // SISTEMA DINÁMICO DE MOTOCICLETAS (GAMA DE MODELOS)
  // -------------------------------------------------------------

  // GET /api/motorcycles (Público: filtra activas / Admin: puede consultar all=1)
  if (pathname === '/api/motorcycles' && method === 'GET') {
    const showAll = parsedUrl.searchParams.get('all') === '1';
    let list = db.motorcycles || [];
    if (!showAll) {
      list = list.filter(m => m.active !== false);
    }
    list.sort((a, b) => (a.order || 0) - (b.order || 0));
    return sendJson(res, 200, { success: true, count: list.length, data: list });
  }

  // POST /api/motorcycles (Admin: crear nueva motocicleta)
  if (pathname === '/api/motorcycles' && method === 'POST') {
    const user = getAuthUser(req);
    if (!user) return sendJson(res, 401, { error: 'No autorizado. Inicie sesión.' });

    try {
      const body = await parseJsonBody(req);
      if (!body.name || !body.name.trim()) {
        return sendJson(res, 400, { error: 'El nombre de la motocicleta es obligatorio.' });
      }

      const newMoto = {
        id: body.id || `moto_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: body.name.trim(),
        category: body.category || 'Línea Urbana & Street',
        price: parseFloat(body.price) || 0,
        promo_text: body.promo_text || '',
        desc: body.desc || '',
        image_main: body.image_main || 'assets/images/moto-scooter-clean.jpg',
        gallery: Array.isArray(body.gallery) && body.gallery.length > 0 ? body.gallery : [body.image_main || 'assets/images/moto-scooter-clean.jpg'],
        specs: body.specs || {
          engine: '125 cc',
          consumption: 'Bajo Consumo',
          brakes: 'Disco / Tambor',
          lights: 'LED'
        },
        order: parseInt(body.order, 10) || ((db.motorcycles.length || 0) + 1),
        active: body.active !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (!db.motorcycles) db.motorcycles = [];
      db.motorcycles.push(newMoto);
      saveDb();

      return sendJson(res, 201, {
        success: true,
        message: 'Motocicleta agregada exitosamente al catálogo.',
        data: newMoto
      });
    } catch (e) {
      return sendJson(res, 400, { error: 'Error procesando solicitud.' });
    }
  }

  // PUT /api/motorcycles/:id & DELETE /api/motorcycles/:id
  const singleMotoMatch = pathname.match(/^\/api\/motorcycles\/([a-zA-Z0-9_-]+)$/);
  if (singleMotoMatch && method === 'PUT') {
    const user = getAuthUser(req);
    if (!user) return sendJson(res, 401, { error: 'No autorizado. Inicie sesión.' });

    try {
      const targetId = singleMotoMatch[1];
      const item = (db.motorcycles || []).find(m => m.id === targetId);
      if (!item) return sendJson(res, 404, { error: 'Motocicleta no encontrada.' });

      const body = await parseJsonBody(req);
      if (body.name !== undefined) item.name = body.name.trim();
      if (body.category !== undefined) item.category = body.category.trim();
      if (body.price !== undefined) item.price = parseFloat(body.price) || 0;
      if (body.promo_text !== undefined) item.promo_text = body.promo_text;
      if (body.desc !== undefined) item.desc = body.desc;
      if (body.image_main !== undefined) item.image_main = body.image_main;
      if (body.gallery !== undefined && Array.isArray(body.gallery)) item.gallery = body.gallery;
      if (body.specs !== undefined) item.specs = { ...(item.specs || {}), ...body.specs };
      if (body.order !== undefined) item.order = parseInt(body.order, 10) || 0;
      if (body.active !== undefined) item.active = Boolean(body.active);
      item.updated_at = new Date().toISOString();

      saveDb();
      return sendJson(res, 200, {
        success: true,
        message: 'Motocicleta actualizada exitosamente.',
        data: item
      });
    } catch (e) {
      return sendJson(res, 400, { error: 'Error actualizando motocicleta.' });
    }
  }

  if (singleMotoMatch && method === 'DELETE') {
    const user = getAuthUser(req);
    if (!user) return sendJson(res, 401, { error: 'No autorizado. Inicie sesión.' });

    const targetId = singleMotoMatch[1];
    const index = (db.motorcycles || []).findIndex(m => m.id === targetId);
    if (index === -1) return sendJson(res, 404, { error: 'Motocicleta no encontrada.' });

    db.motorcycles.splice(index, 1);
    saveDb();
    return sendJson(res, 200, { success: true, message: 'Motocicleta eliminada del catálogo.' });
  }

  // -------------------------------------------------------------
  // CARGA GENÉRICA DE ARCHIVOS (Imágenes y Videos)
  // -------------------------------------------------------------
  if (pathname === '/api/upload' && method === 'POST') {
    const user = getAuthUser(req);
    if (!user) return sendJson(res, 401, { error: 'No autorizado. Inicie sesión.' });

    try {
      const body = await parseJsonBody(req);
      const { fileName, fileData } = body;

      if (!fileData) {
        return sendJson(res, 400, { error: 'Datos del archivo no recibidos.' });
      }

      let buffer;
      let ext = '.png';
      const matches = fileData.match(/^data:([A-Za-z-+\/0-9.]+);base64,(.+)$/);

      if (matches && matches.length === 3) {
        const mime = matches[1].toLowerCase();
        if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
        else if (mime.includes('webp')) ext = '.webp';
        else if (mime.includes('svg')) ext = '.svg';
        else if (mime.includes('mp4')) ext = '.mp4';
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(fileData, 'base64');
      }

      // Límite de tamaño: 30 MB
      if (buffer.length > 30 * 1024 * 1024) {
        return sendJson(res, 400, { error: 'El archivo excede el tamaño máximo permitido (30 MB).' });
      }

      const cleanName = (fileName || 'media')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 40);
      const uniqueName = `upload_${Date.now()}_${cleanName}${ext}`;
      const destPath = path.join(UPLOADS_DIR, uniqueName);

      fs.writeFileSync(destPath, buffer);
      const relativeUrl = `uploads/${uniqueName}`;

      return sendJson(res, 200, {
        success: true,
        message: 'Archivo subido y guardado exitosamente.',
        url: relativeUrl
      });
    } catch (err) {
      return sendJson(res, 500, { error: 'Error procesando archivo: ' + err.message });
    }
  }

  // -------------------------------------------------------------
  // GESTOR DE ASSETS OFICIALES DEL HOME
  // -------------------------------------------------------------

  // GET /api/assets (Público: retorna mapeo actual de assets)
  if (pathname === '/api/assets' && method === 'GET') {
    const currentAssets = { ...DEFAULT_SITE_ASSETS, ...(db.site_assets || {}) };
    return sendJson(res, 200, {
      success: true,
      data: currentAssets,
      defaults: DEFAULT_SITE_ASSETS
    });
  }

  // PUT /api/assets (Admin: actualiza mapeo directo de assets)
  if (pathname === '/api/assets' && method === 'PUT') {
    const user = getAuthUser(req);
    if (!user) return sendJson(res, 401, { error: 'No autorizado. Inicie sesión.' });

    try {
      const body = await parseJsonBody(req);
      db.site_assets = { ...DEFAULT_SITE_ASSETS, ...(db.site_assets || {}), ...body };
      saveDb();
      return sendJson(res, 200, {
        success: true,
        message: 'Mapeo de assets actualizado en base de datos.',
        data: db.site_assets
      });
    } catch (e) {
      return sendJson(res, 400, { error: 'Petición inválida.' });
    }
  }

  // POST /api/assets/upload (Admin: sube imagen, persiste en disco y base de datos)
  if (pathname === '/api/assets/upload' && method === 'POST') {
    const user = getAuthUser(req);
    if (!user) return sendJson(res, 401, { error: 'No autorizado. Inicie sesión.' });

    try {
      const body = await parseJsonBody(req);
      const { assetKey, fileName, fileData } = body;

      if (!assetKey || !fileData) {
        return sendJson(res, 400, { error: 'Faltan parámetros requeridos (assetKey o fileData).' });
      }

      const validKeys = ['como_funciona', 'hunk_125', 'dr_150', 'compromiso_social'];
      if (!validKeys.includes(assetKey)) {
        return sendJson(res, 400, { error: `Clave no válida. Claves permitidas: ${validKeys.join(', ')}` });
      }

      // Procesar archivo base64
      let buffer;
      let ext = '.png';
      const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

      if (matches && matches.length === 3) {
        const mime = matches[1].toLowerCase();
        if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
        else if (mime.includes('webp')) ext = '.webp';
        else if (mime.includes('svg')) ext = '.svg';
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(fileData, 'base64');
      }

      // Nombre seguro de archivo en uploads
      const cleanName = (fileName || 'asset')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 40);
      const uniqueName = `asset_${assetKey}_${Date.now()}_${cleanName}${ext}`;
      const destPath = path.join(UPLOADS_DIR, uniqueName);

      fs.writeFileSync(destPath, buffer);

      // Persistir URL en base de datos
      const relativeUrl = `uploads/${uniqueName}`;
      if (!db.site_assets) db.site_assets = { ...DEFAULT_SITE_ASSETS };
      db.site_assets[assetKey] = relativeUrl;
      saveDb();

      console.log(`[ASSET UPLOAD] ${assetKey} -> ${relativeUrl} guardado en BD.`);

      return sendJson(res, 200, {
        success: true,
        message: 'Imagen subida y persistida exitosamente en el servidor.',
        assetKey: assetKey,
        url: relativeUrl,
        data: db.site_assets
      });
    } catch (err) {
      console.error('Error al subir asset:', err);
      return sendJson(res, 500, { error: 'Error procesando la imagen: ' + err.message });
    }
  }

  // POST /api/assets/reset (Admin: restaura asset oficial de prompt por defecto)
  if (pathname === '/api/assets/reset' && method === 'POST') {
    const user = getAuthUser(req);
    if (!user) return sendJson(res, 401, { error: 'No autorizado. Inicie sesión.' });

    try {
      const { assetKey } = await parseJsonBody(req);
      if (!assetKey || !DEFAULT_SITE_ASSETS[assetKey]) {
        return sendJson(res, 400, { error: 'Clave de asset no válida para restaurar.' });
      }

      if (!db.site_assets) db.site_assets = { ...DEFAULT_SITE_ASSETS };
      db.site_assets[assetKey] = DEFAULT_SITE_ASSETS[assetKey];
      saveDb();

      return sendJson(res, 200, {
        success: true,
        message: `Asset oficial restaurado para ${assetKey}.`,
        assetKey: assetKey,
        url: DEFAULT_SITE_ASSETS[assetKey],
        data: db.site_assets
      });
    } catch (e) {
      return sendJson(res, 400, { error: 'Petición inválida.' });
    }
  }

  // -------------------------------------------------------------
  // SERVIR ARCHIVOS ESTÁTICOS
  // -------------------------------------------------------------
  let decodedPath = pathname;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch (e) {}

  let filePath = path.join(__dirname, decodedPath === '/' ? 'index.html' : decodedPath);

  // Si pide /admin o /admin/, servir admin/index.html
  if (decodedPath === '/admin' || decodedPath === '/admin/') {
    filePath = path.join(__dirname, 'admin', 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 — Archivo no encontrado');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Soporte de range requests para el video mp4
    if (ext === '.mp4') {
      const range = req.headers.range;
      const fileSize = stats.size;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
        return;
      }
    }

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('============================================================');
  console.log(' FINANCIAMIENTO & SOLUCIONES S.A.S. — SERVIDOR ACTIVO');
  console.log('============================================================');
  console.log(` Web Pública: http://localhost:${PORT}/`);
  console.log(` Panel Admin: http://localhost:${PORT}/admin`);
  console.log(' API REST:    http://localhost:' + PORT + '/api/');
  console.log('============================================================\n');
});
