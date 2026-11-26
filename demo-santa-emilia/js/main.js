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

  /* 5. Cinematic Hero Slideshow + Native Background Video Switcher */
  const heroSlides = document.querySelectorAll('#heroSlides .hero-slide');
  if (heroSlides.length > 1) {
    let slideIdx = 0;
    setInterval(() => {
      heroSlides[slideIdx].classList.remove('active');
      slideIdx = (slideIdx + 1) % heroSlides.length;
      heroSlides[slideIdx].classList.add('active');
    }, 5500);
  }

  const manifestoVideo = document.getElementById('manifestoVideo');
  const openCurrentBtn = document.getElementById('openCurrentManifesto');

  if (manifestoVideo) {
    manifestoVideo.addEventListener('timeupdate', () => {
      const startAt = parseFloat(manifestoVideo.dataset.loopStart || '0');
      const endAt = parseFloat(manifestoVideo.dataset.loopEnd || '0');
      if (endAt > 0 && manifestoVideo.currentTime >= endAt) {
        manifestoVideo.currentTime = startAt;
        manifestoVideo.play().catch(() => {});
      }
    });
  }

  let activeManifesto = {
    src: 'assets/video/cascada-contemplacion.mp4',
    title: 'La Cascada Contemplación — Santa Emilia, Danlí'
  };

  document.querySelectorAll('.vswitch[data-video-src]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const src = btn.dataset.videoSrc;
      const poster = btn.dataset.poster || '';
      const title = btn.dataset.title || 'Santa Emilia Pulmón de Danlí';
      const loopStart = btn.dataset.loopStart || '0';
      const loopEnd = btn.dataset.loopEnd || '';

      document.querySelectorAll('.vswitch[data-video-src]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      if (manifestoVideo && src) {
        manifestoVideo.dataset.loopStart = loopStart;
        manifestoVideo.dataset.loopEnd = loopEnd;
        if (poster) manifestoVideo.poster = poster;
        manifestoVideo.src = src;
        manifestoVideo.load();
        manifestoVideo.addEventListener('loadedmetadata', () => {
          if (parseFloat(loopStart) > 0) manifestoVideo.currentTime = parseFloat(loopStart);
          manifestoVideo.play().catch(() => {});
        }, { once: true });
      }
      activeManifesto = { src, title };
    });
  });

  /* 6. Cinema Video Modal (Native MP4) */
  const videoModal = document.getElementById('videoModal');
  const videoPlayer = document.getElementById('videoModalPlayer');
  const videoTitle = document.getElementById('videoModalTitle');
  const videoClose = document.getElementById('videoClose');

  const openVideoModal = (src, title) => {
    if (!videoModal || !videoPlayer) return;
    if (videoTitle) videoTitle.textContent = title || 'Santa Emilia Pulmón de Danlí';
    videoPlayer.src = src;
    videoPlayer.currentTime = 0;
    videoModal.classList.add('open');
    videoModal.setAttribute('aria-hidden', 'false');
    videoPlayer.play().catch(() => {});
  };
  const closeVideoModal = () => {
    if (!videoModal || !videoPlayer) return;
    videoModal.classList.remove('open');
    videoModal.setAttribute('aria-hidden', 'true');
    videoPlayer.pause();
    videoPlayer.removeAttribute('src');
    videoPlayer.load();
  };

  document.querySelectorAll('[data-video-modal]').forEach((btn) => {
    btn.addEventListener('click', () => openVideoModal(btn.dataset.videoModal, btn.dataset.videoTitle));
  });
  if (openCurrentBtn) {
    openCurrentBtn.addEventListener('click', () => openVideoModal(activeManifesto.src, activeManifesto.title));
  }
  if (videoClose) videoClose.addEventListener('click', closeVideoModal);
  if (videoModal) videoModal.addEventListener('click', (e) => { if (e.target === videoModal) closeVideoModal(); });

  /* 7. Interactive Topographic Route Explorer (exact QR route & real areas) */
  const stopsData = [
    {
      elev: 'ACCESO · CARRETERA EN BUEN ESTADO',
      diff: 'Acceso vehicular · Fácil hasta el portón',
      title: 'Llegada desde Danlí vía Hacienda La Lucha',
      desc: 'Sal desde Danlí siguiendo la ruta hacia Hacienda La Lucha rumbo a Montaña Santa Emilia (2FHC+33H). La carretera se mantiene en buen estado hasta el portón principal, rodeada de vegetación fresca.',
      tip: 'Usa el botón de Google Maps abajo para abrir la ruta exacta punto a punto desde tu celular.',
      img: 'assets/img/bosque-neblina.jpg'
    },
    {
      elev: 'ZONA DE DESCANSO · PISCINA Y FOGÓN',
      diff: 'Familiar · Uso habilitado',
      title: 'Casa de Montaña con Piscina y Jardín',
      desc: 'Disfruta nuestra casa de montaña con barandas de madera, piscina con vista panorámica a las colinas, jardín con columpio de alas de mariposa y fogón con leña si traes comida para preparar en grupo.',
      tip: 'Puedes traer tus propios alimentos y merienda; consulta disponibilidad por WhatsApp.',
      img: 'assets/img/piscina-terraza.jpg'
    },
    {
      elev: 'RECREACIÓN · AGUA Y AVENTURA',
      diff: 'Familia y amigos · Divertido',
      title: 'Laguna, Paseo en Bote, Cuerdas y Tobogán',
      desc: 'Rema en bote sobre la laguna rodeada de bosque tropical, reta tu equilibrio en el cruce de cuerdas sobre el agua o deslízate por el tobogán natural.',
      tip: 'Lleva ropa cómoda que se pueda mojar y una muda seca para después.',
      img: 'assets/img/laguna-toboganybote.jpg'
    },
    {
      elev: 'EXPLORACIÓN · NUEVOS SENDEROS',
      diff: 'Caminata guiada · En expansión',
      title: 'Nuevos Senderos y Avistamiento de Fauna',
      desc: 'Trabajamos constantemente en habilitar nuevos senderos entre el bosque nuboso. En el camino podrás escuchar y observar monos aulladores, aves coloridas y conocer por qué biólogos visitan esta reserva.',
      tip: 'Se recomienda hacer senderismo temprano por la mañana y llevar suficiente agua.',
      img: 'assets/img/sendero-grupo.jpg'
    },
    {
      elev: 'AGUA PURA · MONTAÑA SANTA EMILIA',
      diff: 'Aventura · Nivel moderado',
      title: 'La Cascada Contemplación',
      desc: 'La gran recompensa de la caminata: una caída de agua fresca entre rocas cubiertas de musgo y escaleras rústicas de madera en medio del pulmón verde de Danlí.',
      tip: 'Lleva tenis con buen agarre para caminar con seguridad en zonas húmedas.',
      img: 'assets/img/cascada-senderistas.jpg'
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
