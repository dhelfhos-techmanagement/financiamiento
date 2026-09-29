/**
 * INTERACCIONES Y EXPERIENCIA DE USUARIO — FINANCIAMIENTO & SOLUCIONES S.A.S.
 * Manejo de menú móvil, pestañas de vitrina, acordeones FAQ, toast alerts y navegación.
 */

(function () {
  'use strict';

  // --- 1. MENÚ MÓVIL ---
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('main-nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('active');
    });

    // Cerrar menú al hacer clic en un enlace
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- 2. SECCIÓN DE MODELOS DE MOTOCICLETAS (Categorías Interactivas) ---
  const modelTabs = document.querySelectorAll('.models-tab-btn, .showcase-tab-btn');
  const modelPanels = document.querySelectorAll('.models-panel, .showcase-tab-content');

  modelTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.target;
      if (!targetId) return;

      modelTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      modelPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // Botones de Simular este Modelo desde la galería
  document.querySelectorAll('[data-sim-val]').forEach(btn => {
    btn.addEventListener('click', function () {
      const val = parseInt(this.dataset.simVal, 10);
      const refName = this.dataset.simRef;
      const vehicleSlider = document.getElementById('sim-vehicle-slider');
      if (vehicleSlider && val) {
        vehicleSlider.value = val;
        if (window.MotorcycleSimulator) {
          window.MotorcycleSimulator.update();
        }
      }
      const fieldRef = document.getElementById('field-referencia-moto');
      if (fieldRef && refName) {
        fieldRef.value = refName;
      }
    });
  });

  // --- 3. FILTROS DE PREGUNTAS FRECUENTES (FAQ) ---
  const faqFilterBtns = document.querySelectorAll('.faq-filter-btn');
  const faqItems = document.querySelectorAll('.faq-item');

  faqFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      faqFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      faqItems.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // --- 4. SISTEMA DE NOTIFICACIONES TOAST INSTITUCIONALES ---
  let toastContainer = document.getElementById('site-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'site-toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }

  window.showToast = function (message, type = 'info') {
    const toast = document.createElement('div');
    const bgColors = {
      success: '#15803D',
      warning: '#B45309',
      danger: '#B91C1C',
      info: '#1E3CAA'
    };

    toast.style.cssText = `
      background-color: ${bgColors[type] || '#1E3CAA'};
      color: #FFFFFF;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 10px;
      pointer-events: auto;
      animation: slideInToast 250ms ease forwards;
      max-width: 380px;
    `;

    toast.innerHTML = `
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 300ms ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  // --- 5. NAVEGACIÓN ACTIVA EN SCROLL ---
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollY = window.pageYOffset;

    sections.forEach(sec => {
      const sectionTop = sec.offsetTop - 140;
      const sectionHeight = sec.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentId = sec.getAttribute('id');
      }
    });

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

})();
