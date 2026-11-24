(() => {
  'use strict';

  /* 1. Scroll progress & header state */
  const progressBar = document.getElementById('scrollProgress');
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    const y = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar && h > 0) progressBar.style.width = `${Math.min(100, (y / h) * 100)}%`;
    if (header) header.classList.toggle('scrolled', y > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 2. Live Honduras Open/Closed status (8:00 a.m. - 3:00 p.m. daily) */
  const statusEl = document.getElementById('liveStatus');
  if (statusEl) {
    try {
      const nowHn = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Tegucigalpa' }));
      const hour = nowHn.getHours();
      const isOpen = hour >= 8 && hour < 15;
      statusEl.classList.toggle('closed', !isOpen);
      const label = statusEl.querySelector('.status-label');
      if (label) label.textContent = isOpen ? 'Abierto ahora · hasta 3pm' : 'Abre 8:00 a.m.';
    } catch (_) {
      /* fallback keeps static 8am - 3pm */
    }
  }

  /* 3. Mobile menu drawer */
  const menuToggle = document.getElementById('menuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const toggleMenu = (force) => {
    const open = typeof force === 'boolean' ? force : !mobileDrawer.classList.contains('open');
    mobileDrawer.classList.toggle('open', open);
    mobileDrawer.setAttribute('aria-hidden', String(!open));
    menuToggle.setAttribute('aria-expanded', String(open));
  };
  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', () => toggleMenu());
    mobileDrawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => toggleMenu(false)));
  }

  /* 4. Reveal on scroll */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* 5. Video-Behind-Text Scene Switcher */
  const manifestoFrame = document.getElementById('manifestoYtFrame');
  const manifestoPoster = document.getElementById('manifestoPoster');
  const openCurrentBtn = document.getElementById('openCurrentManifesto');
  let activeManifesto = {
    id: 'aDqPJ4XFyHQ',
    title: 'Los Chorros de Ceilán — Finca Santa Emilia, Danlí'
  };

  document.querySelectorAll('.vswitch[data-yt]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.yt;
      const start = btn.dataset.start || '0';
      const poster = btn.dataset.poster;
      const title = btn.dataset.title || 'Finca Santa Emilia';

      document.querySelectorAll('.vswitch[data-yt]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      if (manifestoPoster && poster) manifestoPoster.src = poster;
      if (manifestoFrame) {
        manifestoFrame.src = `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&start=${start}`;
      }
      activeManifesto = { id, title };
    });
  });

  /* 6. Cinema Video Modal */
  const videoModal = document.getElementById('videoModal');
  const videoIframe = document.getElementById('videoModalIframe');
  const videoTitle = document.getElementById('videoModalTitle');
  const videoClose = document.getElementById('videoClose');

  const openVideoModal = (id, title) => {
    if (!videoModal || !videoIframe) return;
    if (videoTitle) videoTitle.textContent = title || 'Finca Santa Emilia';
    videoIframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
    videoModal.classList.add('open');
    videoModal.setAttribute('aria-hidden', 'false');
  };
  const closeVideoModal = () => {
    if (!videoModal || !videoIframe) return;
    videoModal.classList.remove('open');
    videoModal.setAttribute('aria-hidden', 'true');
    videoIframe.src = '';
  };

  document.querySelectorAll('[data-video-modal]').forEach((btn) => {
    btn.addEventListener('click', () => openVideoModal(btn.dataset.videoModal, btn.dataset.videoTitle));
  });
  if (openCurrentBtn) {
    openCurrentBtn.addEventListener('click', () => openVideoModal(activeManifesto.id, activeManifesto.title));
  }
  if (videoClose) videoClose.addEventListener('click', closeVideoModal);
  if (videoModal) videoModal.addEventListener('click', (e) => { if (e.target === videoModal) closeVideoModal(); });

  /* 7. Interactive Topographic Route Explorer */
  const stopsData = [
    {
      elev: 'ALTITUD · 815 MSNM',
      diff: 'Acceso en vehículo · 20–40 min',
      title: 'Salida desde Danlí hacia Apagüiz',
      desc: 'A pocos minutos del casco urbano de Danlí, el camino asciende entre colinas verdes, cultivos de café y aire cada vez más fresco rumbo al macizo montañoso de Ceilán y la reserva de Apagüiz.',
      tip: 'Llega temprano entre 8:00 y 9:30 a.m. para aprovechar la frescura de la mañana y escuchar con claridad a los monos aulladores.',
      img: 'assets/img/mirador-valle.jpg'
    },
    {
      elev: 'ALTITUD · 1,080 MSNM',
      diff: 'Punto de bienvenida · Histórico',
      title: 'La Casona Centenaria de 1870',
      desc: 'El punto de encuentro tradicional de la finca. Sus amplios corredores y techo de teja te protegen del sol o la lluvia mientras conoces la historia de la familia Gamero y la tradición cafetalera de El Paraíso.',
      tip: 'Pregunta por los productos artesanales de temporada como café de la finca, miel de abeja y vino local.',
      img: 'assets/img/casona-drone.jpg'
    },
    {
      elev: 'ALTITUD · 1,120 MSNM',
      diff: 'Actividad familiar · Relajado',
      title: 'La Laguna y Paseo en Bote',
      desc: 'Rodeada de frondosa vegetación tropical, la laguna es el rincón favorito de familias y grupos para dar un paseo en bote de remos, descansar en la orilla y tomar fotografías rodeados de verde.',
      tip: 'Ideal para hacer una pausa tranquila antes o después de la caminata hacia las cascadas.',
      img: 'assets/img/laguna-bote.jpg'
    },
    {
      elev: 'ALTITUD · 1,180 MSNM',
      diff: 'Caminata moderada · Panorámico',
      title: 'Mirador del Valle y Zona de Camping',
      desc: 'Una amplia pradera verde bajo grandes árboles con vista abierta hacia Danlí y el Valle de Jamastrán. Espacio perfecto para instalar tiendas de campaña, disfrutar el atardecer y compartir una fogata bajo las estrellas.',
      tip: 'Si planeas acampar, coordina previamente por WhatsApp para reservar espacio y recibir recomendaciones.',
      img: 'assets/img/camping-montana.jpg'
    },
    {
      elev: 'ALTITUD · 1,200 MSNM',
      diff: 'Aventura · Nivel moderado a exigente',
      title: 'Cascada Cristalina y Cuevas de Fausto',
      desc: 'Senderos empinados entre pinos, mangos y bambú te llevan hasta la gran cascada de aguas cristalinas y sus pozas refrescantes. Los más aventureros pueden continuar la travesía hacia las Cuevas de Fausto.',
      tip: 'Lleva tenis con buena tracción, traje de baño y consulta por guía local para el recorrido completo.',
      img: 'assets/img/cascada-poza.jpg'
    }
  ];

  const routeImg = document.getElementById('routeImg');
  const routeBadge = document.getElementById('routeBadge');
  const routeDiff = document.getElementById('routeDiff');
  const routeTitle = document.getElementById('routeTitle');
  const routeDesc = document.getElementById('routeDesc');
  const routeTip = document.getElementById('routeTip');

  document.querySelectorAll('.route-stop').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.stop);
      const s = stopsData[idx];
      if (!s) return;
      document.querySelectorAll('.route-stop').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      if (routeImg) routeImg.src = s.img;
      if (routeBadge) routeBadge.textContent = s.elev;
      if (routeDiff) routeDiff.textContent = s.diff;
      if (routeTitle) routeTitle.textContent = s.title;
      if (routeDesc) routeDesc.textContent = s.desc;
      if (routeTip) routeTip.textContent = s.tip;
    });
  });

  /* 8. Interactive WhatsApp Trip Builder */
  const chips = document.querySelectorAll('#activityChips .chip');
  const groupSelect = document.getElementById('groupSelect');
  const visitDate = document.getElementById('visitDate');
  const visitorNote = document.getElementById('visitorNote');
  const lineBtns = document.querySelectorAll('#linePicker .line-btn');
  const waPreview = document.getElementById('waPreviewText');
  const waSendBtn = document.getElementById('waSendBtn');

  let selectedPhone = '50492176760';

  const getSelectedActivities = () =>
    [...chips].filter((c) => c.classList.contains('active')).map((c) => c.dataset.value);

  const updateWhatsAppPreview = () => {
    const acts = getSelectedActivities();
    const actsText = acts.length ? acts.join(', ') : 'Visita general a la finca';
    const groupText = groupSelect ? groupSelect.value : 'En familia';
    const dateVal = visitDate && visitDate.value ? visitDate.value : 'Por definir';
    const noteVal = visitorNote && visitorNote.value.trim() ? `\n📝 Nota: ${visitorNote.value.trim()}` : '';

    const msg =
      `¡Hola Santa Emilia Pulmón de Danlí! 🌿\n` +
      `Me gustaría consultar tarifas y disponibilidad para visitarles:\n\n` +
      `• Experiencias: ${actsText}\n` +
      `• Grupo: ${groupText}\n` +
      `• Fecha tentativa: ${dateVal}${noteVal}\n\n` +
      `¡Muchas gracias!`;

    if (waPreview) waPreview.textContent = msg;
    if (waSendBtn) waSendBtn.href = `https://wa.me/${selectedPhone}?text=${encodeURIComponent(msg)}`;
  };

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      updateWhatsAppPreview();
    });
  });
  if (groupSelect) groupSelect.addEventListener('change', updateWhatsAppPreview);
  if (visitDate) visitDate.addEventListener('change', updateWhatsAppPreview);
  if (visitorNote) visitorNote.addEventListener('input', updateWhatsAppPreview);

  lineBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      lineBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPhone = btn.dataset.phone;
      updateWhatsAppPreview();
    });
  });

  /* Sync "Agregar a mi plan" buttons in chapters with builder chips */
  document.querySelectorAll('[data-add-activity]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.addActivity;
      const targetChip = [...chips].find((c) => c.dataset.value === val);
      if (targetChip && !targetChip.classList.contains('active')) {
        targetChip.classList.add('active');
        updateWhatsAppPreview();
      }
      btn.classList.add('added');
      btn.innerHTML = '✓ Agregado — ver mi plan ↓';
      document.getElementById('planifica')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  updateWhatsAppPreview();

  /* 9. Packing Checklist with localStorage */
  const packBoxes = document.querySelectorAll('#packList input[type="checkbox"]');
  const packProgress = document.getElementById('packProgress');
  const STORAGE_KEY = 'santa_emilia_pack_v1';

  const loadPack = () => {
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (_) {}
    packBoxes.forEach((cb) => {
      if (saved.includes(cb.value)) cb.checked = true;
      cb.closest('.pack-item')?.classList.toggle('checked', cb.checked);
    });
    updatePackCount();
  };
  const updatePackCount = () => {
    const checked = [...packBoxes].filter((cb) => cb.checked);
    if (packProgress) packProgress.textContent = `${checked.length} / ${packBoxes.length} listos`;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(checked.map((c) => c.value))); } catch (_) {}
  };
  packBoxes.forEach((cb) => {
    cb.addEventListener('change', () => {
      cb.closest('.pack-item')?.classList.toggle('checked', cb.checked);
      updatePackCount();
    });
  });
  loadPack();

  /* 10. Photo Lightbox */
  const lbModal = document.getElementById('lightboxModal');
  const lbImg = document.getElementById('lightboxImg');
  const lbCap = document.getElementById('lightboxCaption');
  const lbClose = document.getElementById('lightboxClose');

  const closeLb = () => {
    if (!lbModal) return;
    lbModal.classList.remove('open');
    lbModal.setAttribute('aria-hidden', 'true');
  };
  document.querySelectorAll('[data-lightbox]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!lbModal || !lbImg) return;
      lbImg.src = btn.dataset.lightbox;
      lbImg.alt = btn.dataset.caption || 'Finca Santa Emilia';
      if (lbCap) lbCap.textContent = btn.dataset.caption || '';
      lbModal.classList.add('open');
      lbModal.setAttribute('aria-hidden', 'false');
    });
  });
  if (lbClose) lbClose.addEventListener('click', closeLb);
  if (lbModal) lbModal.addEventListener('click', (e) => { if (e.target === lbModal) closeLb(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLb();
      closeVideoModal();
      toggleMenu(false);
    }
  });

  /* 11. Current year */
  const yearNow = document.getElementById('yearNow');
  if (yearNow) yearNow.textContent = String(new Date().getFullYear());
})();
