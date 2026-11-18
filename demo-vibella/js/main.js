// ===== Nav & Progress Bar =====
const nav = document.getElementById('nav');
const progress = document.getElementById('progress');
addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', scrollY > 40);
  if (progress) {
    const h = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
  }
}, { passive: true });
document.getElementById('burger').addEventListener('click', () => nav.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

// ===== Reveal on scroll =====
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 0.08 + 's'; io.observe(el); });

// ===== Before / After (hover + drag + touch) =====
const ba = document.getElementById('ba');
if (ba) {
  let dragging = false;
  const setPos = clientX => {
    const r = ba.getBoundingClientRect();
    const p = Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
    ba.style.setProperty('--pos', p + '%');
    ba.classList.add('touched');
  };
  ba.addEventListener('mousemove', e => { ba.classList.remove('animating'); setPos(e.clientX); });
  ba.addEventListener('mouseleave', () => { ba.classList.add('animating'); ba.style.setProperty('--pos', '50%'); });
  ba.addEventListener('touchstart', e => { dragging = true; ba.classList.remove('animating'); setPos(e.touches[0].clientX); }, { passive: true });
  ba.addEventListener('touchmove', e => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });
  ba.addEventListener('touchend', () => { dragging = false; });

  // Intro animation: sweep once when it scrolls into view
  const intro = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    intro.disconnect();
    ba.classList.add('animating');
    const seq = ['85%', '15%', '50%'];
    seq.forEach((v, i) => setTimeout(() => { if (!ba.classList.contains('touched')) ba.style.setProperty('--pos', v); }, 500 + i * 750));
  }, { threshold: 0.6 });
  intro.observe(ba);
}

// ===== Before / After Case Switcher =====
const CASES = {
  botox: {
    before: 'assets/img/ba_botox_before.jpg',
    after: 'assets/img/ba_botox_after.jpg',
    ratio: '404 / 195',
    en: {
      tag: 'Forehead & expression lines',
      title: 'Forehead Neurotoxin',
      desc: 'Precision neurotoxin placement relaxes overactive forehead muscles for a smooth, rested appearance — while preserving your natural expression.',
      p1: 'Visibly smoother forehead lines',
      p2: 'Natural, refreshed expression',
      p3: 'Full results in 2 weeks'
    },
    es: {
      tag: 'Frente y líneas de expresión',
      title: 'Neurotoxina en Frente (Botox)',
      desc: 'Aplicación precisa de neurotoxina que relaja los músculos de la frente para una piel lisa y descansada — conservando tu expresión natural.',
      p1: 'Líneas de la frente visiblemente más suaves',
      p2: 'Expresión natural y descansada',
      p3: 'Resultados completos en 2 semanas'
    }
  },
  acne: {
    before: 'assets/img/ba_acne_before.png',
    after: 'assets/img/ba_acne_after.png',
    ratio: '584 / 216',
    en: {
      tag: 'Acne scars & texture',
      title: 'Microneedling + VI Peel',
      desc: 'Collagen-stimulating treatments that visibly soften acne scars, refine pores and even out skin tone — with minimal downtime.',
      p1: 'Smoother texture',
      p2: 'Reduced scarring',
      p3: 'Brighter, even tone'
    },
    es: {
      tag: 'Cicatrices de acné y textura',
      title: 'Microneedling + VI Peel',
      desc: 'Tratamientos que estimulan el colágeno para suavizar visiblemente las cicatrices de acné, refinar los poros y unificar el tono — con mínima recuperación.',
      p1: 'Textura más suave',
      p2: 'Menos cicatrices',
      p3: 'Tono más uniforme y luminoso'
    }
  }
};
let activeCase = 'botox';
function renderCase(key) {
  const c = CASES[key];
  if (!c || !ba) return;
  activeCase = key;
  document.getElementById('baBefore').src = c.before;
  document.getElementById('baAfter').src = c.after;
  ba.style.aspectRatio = c.ratio;
  const copy = c[lang] || c.en;
  document.getElementById('baTag').textContent = copy.tag;
  document.getElementById('baTitle').textContent = copy.title;
  document.getElementById('baDesc').textContent = copy.desc;
  document.getElementById('baP1').textContent = copy.p1;
  document.getElementById('baP2').textContent = copy.p2;
  document.getElementById('baP3').textContent = copy.p3;
  document.querySelectorAll('.ba-tab').forEach(b => b.classList.toggle('active', b.dataset.case === key));
  ba.classList.add('animating');
  ba.style.setProperty('--pos', '50%');
}
document.querySelectorAll('.ba-tab').forEach(btn => btn.addEventListener('click', () => renderCase(btn.dataset.case)));

// ===== i18n (EN / ES) =====
const ES = {
  'nav.results': 'Resultados', 'nav.services': 'Tratamientos', 'nav.about': 'Nosotros', 'nav.visit': 'Visítanos',
  'cta.book': 'Reservar', 'cta.consult': 'Agenda tu Consulta', 'cta.results': 'Ver Resultados Reales',
  'cta.thisTreatment': 'Quiero este resultado', 'cta.bookOnline': 'Reservar en Línea', 'cta.text': 'Enviar Mensaje',
  'hero.eyebrow': 'Medicina Estética · South Norwalk, CT',
  'hero.title': 'Realza tu belleza,<br><em>sin cambiar quién eres.</em>',
  'hero.lead': 'Botox, rellenos y tratamientos avanzados de piel realizados por una inyectora certificada con formación médica — para resultados refinados y naturales.',
  'trust.pa': 'Physician Assistant', 'trust.years': 'Años en medicina', 'trust.lang': 'Hablamos Español',
  'hero.cardTag': 'Pacientes nuevos', 'hero.card': 'Consulta <strong>$75</strong> — se abona a tu tratamiento',
  'pil.t1': 'Inyectables y Tox', 'pil.s1': 'Botox · Xeomin · Relleno de Labios',
  'pil.t2': 'Renovación Facial', 'pil.s2': 'Microneedling · VI Peel',
  'pil.t3': 'Medicina Regenerativa', 'pil.s3': 'Cellenis PRF · PRP Capilar',
  'pil.t4': 'Eventos Privados', 'pil.s4': 'Concierge Tox Parties',
  'results.eyebrow': 'Pacientes reales · Resultados reales',
  'results.title': 'Pasa el cursor sobre la foto para <em>ver la diferencia</em>',
  'ba.before': 'Antes', 'ba.after': 'Después', 'ba.hint': 'Pasa el cursor o desliza',
  'ba.tab1': '01 · Botox en Frente', 'ba.tab2': '02 · Microneedling + VI Peel',
  'ba.tag': 'Frente y líneas de expresión', 'ba.title': 'Neurotoxina en Frente (Botox)',
  'ba.desc': 'Aplicación precisa de neurotoxina que relaja los músculos de la frente para una piel lisa y descansada — conservando tu expresión natural.',
  'ba.p1': 'Líneas de la frente visiblemente más suaves', 'ba.p2': 'Expresión natural y descansada', 'ba.p3': 'Resultados completos en 2 semanas',
  'services.eyebrow': 'Tratamientos', 'services.title': 'Diseñados para tu rostro, <em>tus metas</em>',
  'services.sub': 'Cada plan empieza con una consulta personalizada. Los precios incluyen nuestro 10% de descuento actual.',
  'from': 'desde',
  'svc.tox': 'Líneas de la frente, entrecejo (11s), patas de gallo, lifting de cejas, lip flip, sonrisa gingival y líneas nasales.',
  'svc.lipT': 'Relleno de Labios', 'svc.lipB': 'Volumen · Definición · Armonía',
  'svc.lip': 'Labios sutiles y hermosos — ya sea que busques más volumen o recuperar el que se ha perdido.',
  'svc.mnB': 'Rostro · Cuello · PRP', 'svc.mn': 'Estimula colágeno y elastina para tratar cicatrices de acné, líneas finas y piel opaca. 3 sesiones: $1,300.',
  'svc.peelB': 'Rostro y Cuerpo · Todo tipo de piel', 'svc.peel': 'Peeling medio e indoloro para hiperpigmentación, melasma, manchas solares y cicatrices. 3 peelings: $875.',
  'svc.jawT': 'Perfilado de Mandíbula y Barbie Tox', 'svc.jawB': 'Maseteros · Trapecio',
  'svc.jaw': 'Un contorno facial más fino y un cuello estilizado — además de alivio para la tensión y migrañas.',
  'svc.prfB': 'Tu propia biología, elevada', 'svc.prf': 'Un relleno natural hecho de tu propio plasma para ojeras, pómulos, líneas de sonrisa y manos.',
  'svc.hairT': 'Restauración Capilar PRP', 'svc.hairB': 'Cuero cabelludo · Regenerativo',
  'svc.hair': 'Inyecciones de plasma rico en plaquetas que favorecen un cabello más grueso y sano en 3 sesiones mensuales.',
  'svc.dejB': 'Sin agujas · Mínima recuperación', 'svc.dej': 'Bioestimulador tópico que impulsa el colágeno para una piel más firme, suave y radiante. Apto para todo tono de piel.',
  'svc.more': 'También ofrecemos:', 'svc.m1': 'Hiperhidrosis (sudoración excesiva)', 'svc.m2': 'Disolución de rellenos', 'svc.m3': 'Inyecciones de B-12', 'svc.m4': 'Certificados de regalo desde $45',
  'party.eyebrow': 'Exclusivo de Vibella', 'party.title': 'Concierge <em>Tox Party</em>',
  'party.desc': 'Invita a tres o más amigas y disfruten de un precio especial por unidad. Gabriela va a tu casa o evento para una experiencia de belleza lujosa y sin complicaciones.',
  'party.cta': 'Llama para agendar tu fiesta',
  'about.eyebrow': 'Conoce a tu inyectora',
  'about.p1': 'Gabriela es una Physician Assistant dedicada con más de seis años de experiencia médica. Inició su carrera como Hospitalista, dominando el cuidado agudo, antes de pasar a la cirugía plástica y la estética — donde encontró su verdadera pasión.',
  'about.p2': 'Como inyectora certificada, está comprometida con resultados naturales y hermosos, capacitándose constantemente en las técnicas más recientes para que cada paciente reciba una atención precisa, personalizada y con calidez.',
  'about.quote': 'Un equilibrio perfecto entre ciencia, arte y rejuvenecimiento natural.',
  'about.card': 'Experiencia en hospitalización y cirugía plástica · Inyectora estética certificada',
  'about.b1': 'Formación médica', 'about.b2': 'Inyectora certificada', 'about.b3': 'Hablo Español',
  'steps.eyebrow': 'Tu experiencia', 'steps.title': 'Simple, segura y <em>personal</em>',
  'steps.s1t': 'Consulta', 'steps.s1': 'Hablamos de tus metas, tu anatomía y el plan ideal para ti.',
  'steps.s2t': 'Tratamiento', 'steps.s2': 'Realizado con productos premium en un ambiente privado y relajante.',
  'steps.s3t': 'Seguimiento a 2 semanas', 'steps.s3': 'Una revisión sin costo para fotos de antes y después y retoques.',
  'insta.title': 'Sigue el <em>glow</em>',
  'visit.eyebrow': 'Visítanos', 'visit.title': 'Tu glow empieza <em>aquí</em>',
  'visit.addr': 'Dirección', 'visit.phone': 'Teléfono', 'visit.hours': 'Horario', 'visit.hoursV': 'Solo con cita previa',
  'visit.directions': 'Abrir en Google Maps →'
};
const EN = {};
document.querySelectorAll('[data-i18n]').forEach(el => EN[el.dataset.i18n] = el.textContent);
document.querySelectorAll('[data-i18n-html]').forEach(el => EN[el.dataset.i18nHtml] = el.innerHTML);

let lang = 'en';
const langBtn = document.getElementById('langBtn');
function applyLang(l) {
  const dict = l === 'es' ? ES : EN;
  document.querySelectorAll('[data-i18n]').forEach(el => { const v = dict[el.dataset.i18n]; if (v) el.textContent = v; });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { const v = dict[el.dataset.i18nHtml]; if (v) el.innerHTML = v; });
  document.documentElement.lang = l;
  langBtn.textContent = l === 'es' ? 'EN' : 'ES';
  lang = l;
  renderCase(activeCase);
}
langBtn.addEventListener('click', () => applyLang(lang === 'en' ? 'es' : 'en'));

// ===== Prototype Demo Links (no external redirects) =====
const demoToast = document.getElementById('demoToast');
let toastTimer;
document.querySelectorAll('[data-demo="1"]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    if (!demoToast) return;
    demoToast.textContent = lang === 'es'
      ? '✦ Prototipo de demostración — Los enlaces y reservas se activarán al publicar.'
      : '✦ Preview prototype — Booking & external links will be connected upon launch.';
    demoToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => demoToast.classList.remove('show'), 3000);
  });
});
