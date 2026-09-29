/**
 * APP ENTRYPOINT — FINANCIAMIENTO & SOLUCIONES S.A.S.
 * Inicialización general de la web corporativa, hidratación CMS desde Backend y
 * carrusel dinámico de motocicletas con rotación automática y transición crossfade.
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('FINANCIAMIENTO & SOLUCIONES S.A.S. — Sistema inicializado con éxito.');

  // Smooth scroll para todos los enlaces internos
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // =========================================================================
  // 1. SINCRONIZACIÓN DINÁMICA DEL CONTENIDO CMS DESDE BACKEND / BASE DE DATOS
  // =========================================================================
  async function syncCmsContent() {
    try {
      const res = await fetch('/api/content');
      if (!res.ok) return;
      const json = await res.json();
      if (!json.success || !json.data) return;

      const data = json.data;

      // --- IDENTIDAD ---
      if (data.contact_phone || (data.contact && data.contact.phone)) {
        const phone = data.contact_phone || data.contact.phone;
        const topPhone = document.getElementById('topbar-phone');
        if (topPhone) topPhone.textContent = `Línea Nacional: ${phone}`;
      }

      if (data.identity) {
        if (data.identity.logo_url) {
          const logoEl = document.getElementById('site-brand-logo');
          if (logoEl && logoEl.getAttribute('src') !== data.identity.logo_url) {
            logoEl.src = data.identity.logo_url;
          }
        }
        if (data.identity.company_name) {
          const nameEl = document.getElementById('site-brand-name');
          if (nameEl) nameEl.innerHTML = `${escapeHtml(data.identity.company_name)}`;
        }
        if (data.identity.company_subtitle) {
          const subEl = document.getElementById('site-brand-sub');
          if (subEl) subEl.textContent = data.identity.company_subtitle;
        }
        if (data.identity.legal_text) {
          const footLegal = document.getElementById('footer-brand-sub');
          if (footLegal) footLegal.textContent = data.identity.legal_text;
        }
      }

      // --- HERO ---
      if (data.hero) {
        if (data.hero.tag) {
          const heroTag = document.getElementById('hero-tag-text');
          if (heroTag) heroTag.textContent = data.hero.tag;
        }
        if (data.hero.title) {
          const heroTitle = document.getElementById('hero-main-title');
          if (heroTitle) heroTitle.innerHTML = formatHighlight(data.hero.title);
        }
        if (data.hero.subtitle) {
          const heroSub = document.getElementById('hero-subtitle-text');
          if (heroSub) heroSub.textContent = data.hero.subtitle;
        }
        if (data.hero.btn1_text) {
          const btn1Text = document.getElementById('hero-btn1-text');
          if (btn1Text) btn1Text.textContent = data.hero.btn1_text;
        }
        if (data.hero.btn1_link) {
          const btn1 = document.getElementById('hero-btn1');
          if (btn1) btn1.setAttribute('href', data.hero.btn1_link);
        }
        if (data.hero.btn2_text) {
          const btn2Text = document.getElementById('hero-btn2-text');
          if (btn2Text) btn2Text.textContent = data.hero.btn2_text;
        }
        if (data.hero.btn2_link) {
          const btn2 = document.getElementById('hero-btn2');
          if (btn2) btn2.setAttribute('href', data.hero.btn2_link);
        }
        if (data.hero.poster_url) {
          const videoEl = document.getElementById('hero-bg-video');
          if (videoEl && videoEl.getAttribute('poster') !== data.hero.poster_url) {
            videoEl.setAttribute('poster', data.hero.poster_url);
          }
        }
        if (data.hero.video_url) {
          const videoSrc = document.getElementById('hero-bg-video-src');
          const videoEl = document.getElementById('hero-bg-video');
          if (videoSrc && videoEl && videoSrc.getAttribute('src') !== data.hero.video_url) {
            videoSrc.setAttribute('src', data.hero.video_url);
            videoEl.load();
          }
        }
      }

      // --- CÓMO FUNCIONA ---
      if (data.site_assets && data.site_assets.como_funciona) {
        const cfImg = document.getElementById('asset-img-como-funciona');
        if (cfImg && cfImg.getAttribute('src') !== data.site_assets.como_funciona) {
          cfImg.src = data.site_assets.como_funciona;
        }
      }

      // --- PROPUESTA DE VALOR ---
      if (data.propuesta_valor) {
        const pv = data.propuesta_valor;
        if (pv.tag) {
          const pvTag = document.getElementById('pv-tag');
          if (pvTag) pvTag.textContent = pv.tag;
        }
        if (pv.title) {
          const pvTitle = document.getElementById('val-heading');
          if (pvTitle) pvTitle.innerHTML = formatHighlight(pv.title);
        }
        if (pv.subtitle) {
          const pvSub = document.getElementById('pv-subtitle');
          if (pvSub) pvSub.textContent = pv.subtitle;
        }
        if (pv.lead_quote) {
          const pvQuote = document.getElementById('pv-lead-quote');
          if (pvQuote) pvQuote.innerHTML = formatHighlight(pv.lead_quote);
        }
        if (pv.lead_text) {
          const pvText = document.getElementById('pv-lead-text');
          if (pvText) pvText.textContent = pv.lead_text;
        }
        if (pv.pilar1_title) {
          const el = document.getElementById('pv-p1-title');
          if (el) el.textContent = pv.pilar1_title;
        }
        if (pv.pilar1_desc) {
          const el = document.getElementById('pv-p1-desc');
          if (el) el.textContent = pv.pilar1_desc;
        }
        if (pv.pilar2_title) {
          const el = document.getElementById('pv-p2-title');
          if (el) el.textContent = pv.pilar2_title;
        }
        if (pv.pilar2_desc) {
          const el = document.getElementById('pv-p2-desc');
          if (el) el.textContent = pv.pilar2_desc;
        }
        if (pv.pilar3_title) {
          const el = document.getElementById('pv-p3-title');
          if (el) el.textContent = pv.pilar3_title;
        }
        if (pv.pilar3_desc) {
          const el = document.getElementById('pv-p3-desc');
          if (el) el.textContent = pv.pilar3_desc;
        }
      }

      // --- MISIÓN Y VISIÓN ---
      if (data.mision_vision) {
        const mv = data.mision_vision;
        if (mv.mision_title) {
          const el = document.getElementById('mision-title-text');
          if (el) el.textContent = mv.mision_title;
        }
        if (mv.mision_content) {
          const el = document.getElementById('mision-body-text');
          if (el) el.innerHTML = escapeHtmlWithStrong(mv.mision_content);
        }
        if (mv.vision_title) {
          const el = document.getElementById('vision-title-text');
          if (el) el.textContent = mv.vision_title;
        }
        if (mv.vision_content) {
          const el = document.getElementById('vision-body-text');
          if (el) el.innerHTML = escapeHtmlWithStrong(mv.vision_content);
        }
      }

      // --- LÍNEAS DE NEGOCIO ---
      if (Array.isArray(data.lineas_negocio) && data.lineas_negocio.length > 0) {
        renderBusinessLines(data.lineas_negocio);
      }

      // --- COMPROMISO SOCIAL & PAÍS ---
      if (data.compromiso_social) {
        const cs = data.compromiso_social;
        if (cs.tag) {
          const el = document.getElementById('social-tag');
          if (el) {
            const svgIcon = el.querySelector('svg');
            el.innerHTML = '';
            if (svgIcon) el.appendChild(svgIcon);
            const spanText = document.createElement('span');
            spanText.textContent = cs.tag;
            el.appendChild(spanText);
          }
        }
        if (cs.title) {
          const el = document.getElementById('social-title');
          if (el) el.innerHTML = formatHighlight(cs.title);
        }
        if (cs.main_text) {
          const el = document.getElementById('social-p1');
          if (el) el.textContent = cs.main_text;
        }
        if (cs.quote) {
          const el = document.getElementById('social-quote');
          if (el) el.textContent = `"${cs.quote.replace(/^"|"$/g, '')}"`;
        }
        if (cs.complement_text) {
          const el = document.getElementById('social-p2');
          if (el) el.textContent = cs.complement_text;
        }
        if (cs.final_text) {
          const el = document.getElementById('social-p3');
          if (el) el.textContent = cs.final_text;
        }
        if (cs.image_url || (data.site_assets && data.site_assets.compromiso_social)) {
          const imgUrl = cs.image_url || data.site_assets.compromiso_social;
          const imgEl = document.getElementById('asset-img-compromiso-social');
          if (imgEl && imgEl.getAttribute('src') !== imgUrl) {
            imgEl.src = imgUrl;
          }
        }
      }

      // --- REQUISITOS ---
      if (data.requisitos) {
        if (data.requisitos.title) {
          const el = document.getElementById('req-heading');
          if (el) el.innerHTML = formatHighlightBlue(data.requisitos.title);
        }
        if (data.requisitos.subtitle) {
          const el = document.getElementById('req-subtitle');
          if (el) el.textContent = data.requisitos.subtitle;
        }
        if (Array.isArray(data.requisitos.empleados)) {
          const ul = document.getElementById('req-empleados-list');
          if (ul) renderReqList(ul, data.requisitos.empleados);
        }
        if (Array.isArray(data.requisitos.independientes)) {
          const ul = document.getElementById('req-independientes-list');
          if (ul) renderReqList(ul, data.requisitos.independientes);
        }
      }

      // --- PREGUNTAS FRECUENTES (FAQ) ---
      if (Array.isArray(data.faq_items) && data.faq_items.length > 0) {
        renderFaqAccordion(data.faq_items);
      }

      // --- REDES SOCIALES OFICIALES (EN FOOTER) ---
      if (data.social_networks) {
        renderSocialLinks(data.social_networks);
      }

      // --- FOOTER CONTACTO ---
      if (data.contact) {
        if (data.contact.address) {
          const el = document.getElementById('footer-contact-address');
          if (el) el.textContent = data.contact.address;
        }
        if (data.contact.phone) {
          const el = document.getElementById('footer-contact-phone');
          if (el) el.textContent = `PBX Nacional: ${data.contact.phone}`;
        }
        if (data.contact.email) {
          const el = document.getElementById('footer-contact-email');
          if (el) el.textContent = `Correo: ${data.contact.email}`;
        }
        if (data.contact.hours) {
          const el = document.getElementById('footer-contact-hours');
          if (el) el.textContent = data.contact.hours;
        }
      }

    } catch (err) {
      console.warn('Error sincronizando CMS con backend, usando valores cacheados:', err);
    }
  }

  // Helper para convertir palabras en span con clase resaltada
  function formatHighlight(text) {
    if (!text) return '';
    return escapeHtml(text).replace(/para todos|próxima moto|personas que entienden/gi, match => `<span class="text-green">${match}</span>`);
  }

  function formatHighlightBlue(text) {
    if (!text) return '';
    return escapeHtml(text).replace(/acceder a tu crédito/gi, match => `<span class="text-blue">${match}</span>`);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeHtmlWithStrong(str) {
    if (!str) return '';
    const escaped = escapeHtml(str);
    return escaped.replace(/FINANCIAMIENTO &amp; SOLUCIONES S\.A\.S\./g, '<strong>FINANCIAMIENTO & SOLUCIONES S.A.S.</strong>');
  }

  // Renderizar Líneas de Negocio dinámicas
  function renderBusinessLines(lines) {
    const container = document.getElementById('business-lines-container');
    if (!container) return;

    const activeLines = lines.filter(l => l.active !== false);
    if (activeLines.length === 0) return;

    container.innerHTML = activeLines.map((line, idx) => {
      let iconSvg = '';
      if (idx === 0 || /moto/i.test(line.title)) {
        iconSvg = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="18.5" cy="17.5" r="3.5"></circle><path d="M15 6h-3.5l-3 6.5h7.5"></path><path d="M9 17.5l2.5-5"></path><path d="M14 6l3 6.5"></path></svg>`;
      } else if (/vehículo|carro/i.test(line.title)) {
        iconSvg = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="8" width="20" height="11" rx="2"></rect><path d="M5 8V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"></path><circle cx="7" cy="15" r="2"></circle><circle cx="17" cy="15" r="2"></circle></svg>`;
      } else {
        iconSvg = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`;
      }

      return `
        <article class="business-line-card">
          <div>
            <div class="business-line-icon" aria-hidden="true">${iconSvg}</div>
            <h3 class="business-line-title">${escapeHtml(line.title)}</h3>
            <p class="business-line-desc">${escapeHtml(line.desc)}</p>
          </div>
          <a href="${escapeHtml(line.btn_link || '#simulador')}" class="btn btn-sm btn-green" style="align-self: flex-start;">
            ${escapeHtml(line.btn_text || 'Consultar Plan')}
          </a>
        </article>
      `;
    }).join('');
  }

  // Renderizar listas de Requisitos
  function renderReqList(ulElement, items) {
    if (!Array.isArray(items) || items.length === 0) return;
    ulElement.innerHTML = items.map(text => `
      <li class="req-item">
        <span class="req-check" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </span>
        <span>${escapeHtml(text)}</span>
      </li>
    `).join('');
  }

  // Renderizar Acordeón de FAQ
  function renderFaqAccordion(faqs) {
    const container = document.getElementById('faq-accordion-container');
    if (!container) return;

    const activeFaqs = faqs.filter(f => f.active !== false);
    if (activeFaqs.length === 0) return;

    container.innerHTML = activeFaqs.map((faq, idx) => `
      <details class="faq-item" data-category="${escapeHtml(faq.category || 'proceso')}" ${idx === 0 ? 'open' : ''}>
        <summary class="faq-summary">
          <span>${escapeHtml(faq.question)}</span>
          <span class="faq-icon-arrow" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </span>
        </summary>
        <div class="faq-body">
          ${escapeHtml(faq.answer)}
        </div>
      </details>
    `).join('');
  }

  // Renderizar Redes Sociales Oficiales en Footer
  // REGLA CRÍTICA: NO inventar URLs ni mostrar enlaces falsos.
  // Solo se renderizan redes que tengan active === true y URL no vacía.
  function renderSocialLinks(networks) {
    const container = document.getElementById('footer-social-links');
    if (!container) return;

    const icons = {
      instagram: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
      facebook: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`,
      tiktok: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>`,
      youtube: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>`,
      linkedin: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`
    };

    let renderedHtml = '';
    for (const [key, net] of Object.entries(networks)) {
      if (net && net.active === true && typeof net.url === 'string' && net.url.trim().length > 0) {
        const iconSvg = icons[key.toLowerCase()] || icons.instagram;
        renderedHtml += `
          <a href="${escapeHtml(net.url)}" target="_blank" rel="noopener noreferrer" class="footer-social-btn" aria-label="Visitar nuestro perfil oficial en ${escapeHtml(net.name || key)}">
            ${iconSvg}
          </a>
        `;
      }
    }

    container.innerHTML = renderedHtml;
  }

  // =========================================================================
  // 2. GAMA DE MODELOS — SISTEMA DINÁMICO & ROTACIÓN AUTOMÁTICA CROSSFADE
  // =========================================================================
  let motoCarouselTimer = null;
  let currentMotoIndex = 0;
  let totalMotos = 0;

  async function initDynamicMotorcycles() {
    try {
      const res = await fetch('/api/motorcycles');
      if (!res.ok) {
        setupStaticMotorcycleCarousel();
        return;
      }
      const json = await res.json();
      if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
        setupStaticMotorcycleCarousel();
        return;
      }

      // Filtrar solo motos activas y ordenadas
      const motos = json.data
        .filter(m => m.active !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      if (motos.length === 0) {
        setupStaticMotorcycleCarousel();
        return;
      }

      renderMotorcycles(motos);

    } catch (e) {
      console.warn('Error cargando motocicletas dinámicas, usando fallback local:', e);
      setupStaticMotorcycleCarousel();
    }
  }

  function renderMotorcycles(motos) {
    const navContainer = document.getElementById('models-category-nav');
    const stageContainer = document.getElementById('models-stage');
    const dotsContainer = document.getElementById('models-carousel-dots');

    if (!navContainer || !stageContainer) return;

    totalMotos = motos.length;
    currentMotoIndex = 0;

    // 1. Renderizar pestañas de categorías
    navContainer.innerHTML = motos.map((m, idx) => `
      <button class="models-tab-btn ${idx === 0 ? 'active' : ''}" 
              role="tab" 
              aria-selected="${idx === 0 ? 'true' : 'false'}" 
              aria-controls="panel-moto-${m.id}" 
              data-index="${idx}" 
              id="tab-moto-${m.id}">
        ${escapeHtml(m.name)} — ${escapeHtml(m.category ? m.category.split('/')[0].trim() : 'Línea')}
      </button>
    `).join('');

    // 2. Renderizar paneles de exhibición a todo el ancho (full-width)
    stageContainer.innerHTML = motos.map((m, idx) => {
      const imgSrc = m.image_main || (Array.isArray(m.gallery) && m.gallery[0]) || 'assets/images/moto-urban-clean.jpg';
      const formattedPrice = m.price ? `$ ${Number(m.price).toLocaleString('es-CO')}` : '';

      return `
        <article id="panel-moto-${m.id}" 
                 class="models-panel ${idx === 0 ? 'active' : ''}" 
                 role="tabpanel" 
                 aria-labelledby="tab-moto-${m.id}"
                 data-index="${idx}">
          <div class="models-hero-viewport">
            <img src="${escapeHtml(imgSrc)}" 
                 alt="Motocicleta ${escapeHtml(m.name)} — ${escapeHtml(m.promo_text || '')}" 
                 class="models-hero-img" 
                 loading="lazy">
          </div>

          <div class="models-meta-bar">
            <div class="models-meta-container">
              <div class="models-meta-main">
                <span class="models-meta-badge">${escapeHtml(m.category || 'Línea Oficial')}</span>
                <h3 class="models-meta-title">${escapeHtml(m.name)}</h3>
                <p class="models-meta-desc">${escapeHtml(m.desc || m.promo_text || '')}</p>
              </div>

              <div class="models-specs-strip">
                <div class="models-spec-cell">
                  <span class="models-spec-title">Motorización</span>
                  <span class="models-spec-data">${escapeHtml(m.specs?.engine || '125 cc')}</span>
                </div>
                <div class="models-spec-cell">
                  <span class="models-spec-title">Desempeño</span>
                  <span class="models-spec-data">${escapeHtml(m.specs?.consumption || 'Bajo Consumo')}</span>
                </div>
                <div class="models-spec-cell">
                  <span class="models-spec-title">Seguridad</span>
                  <span class="models-spec-data">${escapeHtml(m.specs?.brakes || 'Frenos de Disco')}</span>
                </div>
                <div class="models-spec-cell">
                  <span class="models-spec-title">Equipamiento</span>
                  <span class="models-spec-data">${escapeHtml(m.specs?.lights || 'Luces LED')}</span>
                </div>
              </div>

              <div class="models-meta-action">
                <a href="#simulador" 
                   class="btn btn-green btn-sim-moto-action" 
                   data-sim-val="${m.price || 8500000}" 
                   data-sim-ref="${escapeHtml(m.name)}">
                  <span>Simular ${escapeHtml(m.name)}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // 3. Renderizar dots
    if (dotsContainer) {
      dotsContainer.innerHTML = motos.map((_, idx) => `
        <button class="models-dot ${idx === 0 ? 'active' : ''}" 
                data-index="${idx}" 
                role="tab" 
                aria-label="Ir a motocicleta ${idx + 1}" 
                aria-selected="${idx === 0 ? 'true' : 'false'}"></button>
      `).join('');
    }

    // 4. Vincular eventos de interacción
    setupMotorcycleCarouselEvents();
  }

  function setupStaticMotorcycleCarousel() {
    const panels = document.querySelectorAll('.models-panel');
    totalMotos = panels.length;
    currentMotoIndex = 0;

    const dotsContainer = document.getElementById('models-carousel-dots');
    if (dotsContainer && totalMotos > 0) {
      dotsContainer.innerHTML = Array.from({ length: totalMotos }).map((_, idx) => `
        <button class="models-dot ${idx === 0 ? 'active' : ''}" 
                data-index="${idx}" 
                role="tab" 
                aria-label="Ir a motocicleta ${idx + 1}" 
                aria-selected="${idx === 0 ? 'true' : 'false'}"></button>
      `).join('');
    }

    setupMotorcycleCarouselEvents();
  }

  function goToMotoSlide(targetIdx) {
    if (totalMotos <= 0) return;
    currentMotoIndex = (targetIdx + totalMotos) % totalMotos;

    const tabs = document.querySelectorAll('.models-tab-btn');
    const panels = document.querySelectorAll('.models-panel');
    const dots = document.querySelectorAll('.models-dot');

    tabs.forEach((tab, idx) => {
      const isActive = idx === currentMotoIndex;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    panels.forEach((panel, idx) => {
      const isActive = idx === currentMotoIndex;
      panel.classList.toggle('active', isActive);
    });

    dots.forEach((dot, idx) => {
      const isActive = idx === currentMotoIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  function startMotoRotation() {
    stopMotoRotation();
    if (totalMotos > 1) {
      motoCarouselTimer = setInterval(() => {
        goToMotoSlide(currentMotoIndex + 1);
      }, 5500);
    }
  }

  function stopMotoRotation() {
    if (motoCarouselTimer) {
      clearInterval(motoCarouselTimer);
      motoCarouselTimer = null;
    }
  }

  function setupMotorcycleCarouselEvents() {
    const section = document.getElementById('motos');
    const nav = document.getElementById('models-category-nav');
    const dots = document.getElementById('models-carousel-dots');
    const prevBtn = document.getElementById('models-prev-btn');
    const nextBtn = document.getElementById('models-next-btn');
    const stage = document.getElementById('models-stage');

    // Clicks en pestañas de modelos
    if (nav) {
      nav.querySelectorAll('.models-tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
          const idx = parseInt(this.dataset.index, 10);
          if (!isNaN(idx)) {
            goToMotoSlide(idx);
            startMotoRotation();
          }
        });
      });
    }

    // Clicks en dots
    if (dots) {
      dots.querySelectorAll('.models-dot').forEach(btn => {
        btn.addEventListener('click', function () {
          const idx = parseInt(this.dataset.index, 10);
          if (!isNaN(idx)) {
            goToMotoSlide(idx);
            startMotoRotation();
          }
        });
      });
    }

    // Botones Prev / Next
    if (prevBtn) {
      prevBtn.onclick = () => {
        goToMotoSlide(currentMotoIndex - 1);
        startMotoRotation();
      };
    }

    if (nextBtn) {
      nextBtn.onclick = () => {
        goToMotoSlide(currentMotoIndex + 1);
        startMotoRotation();
      };
    }

    // En Escritorio: al pasar el cursor sobre la vitrina, pausar rotación para facilitar lectura
    // Al retirar el cursor, continuar rotación
    if (section) {
      section.addEventListener('mouseenter', () => {
        stopMotoRotation();
      });

      section.addEventListener('mouseleave', () => {
        startMotoRotation();
      });
    }

    // En Móvil / Tablet: Soporte de gestos táctiles (Swipe)
    if (stage) {
      let touchStartX = 0;
      let touchEndX = 0;

      stage.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      stage.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });

      function handleSwipe() {
        const threshold = 50;
        if (touchEndX < touchStartX - threshold) {
          // Swipe a la izquierda -> siguiente
          goToMotoSlide(currentMotoIndex + 1);
          startMotoRotation();
        } else if (touchEndX > touchStartX + threshold) {
          // Swipe a la derecha -> anterior
          goToMotoSlide(currentMotoIndex - 1);
          startMotoRotation();
        }
      }
    }

    // Vinculación de botones "Simular [Moto]"
    document.querySelectorAll('.btn-sim-moto-action, [data-sim-val]').forEach(btn => {
      btn.addEventListener('click', function (e) {
        const val = parseInt(this.dataset.simVal, 10);
        const refName = this.dataset.simRef;

        const vehicleSlider = document.getElementById('sim-vehicle-slider');
        if (vehicleSlider && val) {
          vehicleSlider.value = val;
          if (window.MotorcycleSimulator && typeof window.MotorcycleSimulator.update === 'function') {
            window.MotorcycleSimulator.update();
          }
        }

        const fieldRef = document.getElementById('field-referencia-moto');
        if (fieldRef && refName) {
          fieldRef.value = refName;
        }

        const simSection = document.getElementById('simulador');
        if (simSection) {
          e.preventDefault();
          simSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Iniciar temporizador
    startMotoRotation();
  }

  // =========================================================================
  // EJECUCIÓN INICIAL
  // =========================================================================
  syncCmsContent();
  initDynamicMotorcycles();
});
