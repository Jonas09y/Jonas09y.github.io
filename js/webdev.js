/* ==========================================================
   Jonas Builds — Web Design portfolio logic
   Prototipos y conceptos de diseño visual (UI/UX)
   ========================================================== */

const PROJECTS = [
  {
    id: "kota", cat: "business", img: "kota", mock: "AURA · Lakeside Bistro & Lounge",
    title: "AURA",
    tags: ["UI / UX", "HTML", "CSS", "JavaScript", "WhatsApp", "Responsive"],
    es: {
      cat: "Restaurante · Café · Lounge",
      badge: "Concepto UI",
      desc: "Prototipo visual para un restaurante y bistro frente al lago con menú digital por categorías, coctelería de autor, galería y botón de reservas por WhatsApp.",
      features: ["Menú digital interactivo por categorías", "Botón directo de WhatsApp para reservas", "Galería de coctelería y sección 'Nosotros'", "Ubicaciones con mapa interactivo", "Diseño responsive adaptado a celular y computadora"]
    },
    en: {
      cat: "Restaurant · Café · Lounge",
      badge: "UI Concept",
      desc: "Visual prototype for a modern lakeside restaurant & bistro with a categorized digital menu, signature drinks gallery, and direct WhatsApp reservations.",
      features: ["Interactive digital menu by category", "Direct WhatsApp reservation button", "Cocktails gallery and 'About us' section", "Locations with interactive map", "Responsive design for mobile and desktop"]
    }
  },
  {
    id: "la-naturaleza", cat: "business", img: "la-naturaleza", mock: "MonteVerde · Eco-Resort & Spa",
    title: "Reserva MonteVerde",
    tags: ["UI / UX", "HTML", "CSS", "JavaScript", "Turismo"],
    es: {
      cat: "Turismo · Eco-Resort",
      badge: "Concepto Web",
      desc: "Concepto de sitio para un eco-resort boutique y centro de eventos con catálogo de cabañas, restaurante de montaña y senderos al aire libre.",
      features: ["Catálogo de cabañas y hospedaje", "Menú digital del restaurante", "Centro de convenciones y retiros", "Llamada directa y reservas rápidas", "Estructura pensada para visitantes móviles"]
    },
    en: {
      cat: "Tourism · Eco-Resort",
      badge: "Web Concept",
      desc: "Website concept for a boutique eco-resort featuring cabin catalogs, mountain dining, conference facilities, and outdoor trails.",
      features: ["Cabin and lodging showcase", "Restaurant digital menu", "Conferences and retreats section", "Quick call and direct contact", "Designed for mobile visitors"]
    }
  },
  {
    id: "campus", cat: "apps", img: "campus", mock: "Nova Academy · Campus Virtual",
    title: "Nova International Academy",
    tags: ["UI / UX", "HTML", "CSS", "JavaScript", "Educación"],
    es: {
      cat: "Educación · Plataforma Virtual",
      badge: "Prototipo Plataforma",
      desc: "Diseño de plataforma educativa para academia internacional bilingüe, con portales dedicados para alumnos, docentes y padres de familia.",
      features: ["Portales visuales para alumnos, docentes y padres", "Presentación de funcionalidades académicas", "Mockup del panel interactivo del estudiante", "Formulario de admisiones y contacto", "Paleta institucional y tipografía cuidada"]
    },
    en: {
      cat: "Education · Virtual Campus",
      badge: "Platform Prototype",
      desc: "Educational platform design for an international bilingual academy with dedicated portals for students, teachers, and parents.",
      features: ["Visual portals for students, teachers, and parents", "Academic features and benefits overview", "Interactive student dashboard mockup", "Admissions and info request form", "Institutional color palette and clean typography"]
    }
  },
  {
    id: "carwash", cat: "apps", img: "carwash", mock: "AutoShine Pro · Sistema Demo",
    title: "AutoShine Pro",
    tags: ["UI / UX", "Dashboard", "Chart.js", "jsPDF", "Firebase"],
    es: {
      cat: "Sistema de gestión & Detailing",
      badge: "Prototipo Sistema",
      desc: "Prototipo de panel administrativo para control de centro de car wash y detailing: servicios, registro de clientes, métricas y reportes PDF.",
      features: ["Pantalla de acceso seguro", "Registro de servicios y clientes", "Módulo de ingresos y flujo de caja", "Gráficas de rendimiento con Chart.js", "Generación de comprobantes en PDF", "Estructura para base de datos en tiempo real"]
    },
    en: {
      cat: "Management system & Detailing",
      badge: "System Prototype",
      desc: "Admin dashboard prototype for auto detailing & car wash management: services, client log, metrics, and PDF receipts.",
      features: ["Secure login screen layout", "Service and client registry", "Income and cash flow module", "Performance charts with Chart.js", "PDF receipt generation", "Real-time database architecture"]
    }
  },
  {
    id: "gympanel", cat: "apps", img: "gympanel", mock: "GymPanel Pro · Panel Demo",
    title: "GymPanel Pro",
    tags: ["React", "UI Design", "Dashboard", "Glassmorphism"],
    es: {
      cat: "Panel administrativo",
      badge: "Diseño UI",
      desc: "Panel administrativo diseñado para gimnasios con módulo de cobro rápido, control visual de membresías y métricas diarias.",
      features: ["Módulo de cobro rápido por planes y descuentos", "Semáforo visual de membresías (al día / por vencer / vencido)", "Buscador ágil de clientes", "Métricas de ingresos y miembros activos", "Estilo moderno con interfaz limpia y fluida"]
    },
    en: {
      cat: "Admin dashboard",
      badge: "UI Design",
      desc: "Admin dashboard crafted for gyms featuring quick checkout, visual membership status, and daily metrics.",
      features: ["Quick checkout with plans and discounts", "Visual membership status (active / expiring / expired)", "Fast client search", "Revenue and active member metrics", "Modern, clean, fluid interface"]
    }
  },
  {
    id: "snaplist", cat: "apps", img: "snaplist", mock: "SnapList · App Móvil Demo", phone: true,
    title: "SnapList",
    tags: ["App Móvil", "PWA", "IA / AI", "Gemini", "UI/UX"],
    es: {
      cat: "App móvil · IA",
      badge: "Concepto App",
      desc: "Concepto de aplicación móvil para preparación de productos de Amazon: captura, recorte de fondo con IA y generación de etiquetas QR.",
      features: ["Interfaz móvil optimizada para uso en celular", "Flujo para recorte automático de fondos con IA", "Generación de textos sugeridos con IA (Gemini)", "Formato de etiquetas SKU con código QR", "Diseño pensado como Progressive Web App (PWA)"]
    },
    en: {
      cat: "Mobile app · AI",
      badge: "App Concept",
      desc: "Mobile application concept for Amazon product preparation: photo capture, AI background cutout, and QR label generation.",
      features: ["Mobile-first layout optimized for one-hand use", "Flow for on-device AI background removal", "AI-assisted listing copy with Gemini", "SKU format with printable QR labels", "Engineered as an installable Progressive Web App (PWA)"]
    }
  },
  {
    id: "applestreets", cat: "shop", img: "applestreets", mock: "Streets · Tienda Demo",
    title: "Streets",
    tags: ["React", "E-commerce", "Minimal", "UI/UX"],
    es: {
      cat: "Tienda online",
      badge: "Concepto Tienda",
      desc: "Diseño minimalista para tienda de tecnología Apple con catálogo visual de productos, selector de categorías y carrito de compras lateral.",
      features: ["Catálogo de productos destacados y clasificados", "Carrito de compras desplegable (Sidebar Cart)", "Indicadores de estado (Nuevo / Seminuevo)", "Estética minimalista inspirada en diseño de alta gama", "Desarrollado con componentes React"]
    },
    en: {
      cat: "Online store",
      badge: "Store Concept",
      desc: "Minimalist Apple tech store design featuring a visual product catalog, category switcher, and slide-over shopping cart.",
      features: ["Curated, categorized product catalog", "Slide-over shopping cart sidebar", "Condition tags (New / Pre-owned)", "Minimalist high-end visual aesthetic", "Built with React components"]
    }
  },
  {
    id: "darkcraft", cat: "gaming", img: "darkcraft", mock: "DarkCraft · Portal Gaming Demo",
    title: "DarkCraft",
    tags: ["Gaming", "HTML", "CSS", "JavaScript", "Animaciones"],
    es: {
      cat: "Servidor de Minecraft",
      badge: "Concepto Gaming",
      desc: "Landing temática para servidor de Minecraft con ambientación oscura, sección de modos de juego, mapa del mundo y tienda de rangos.",
      features: ["Copiador de IP en un solo clic", "Muestra de modos de juego y mapa conceptual", "Diseño de tarjetas para rangos (VIP, Legend, God)", "Integración visual para comunidad de Discord", "Animaciones inmersivas y efectos visuales"]
    },
    en: {
      cat: "Minecraft server",
      badge: "Gaming Concept",
      desc: "Dark-themed landing page concept for a Minecraft server showcasing game modes, world map, and a rank store.",
      features: ["One-click IP copy helper", "Game modes showcase and conceptual map", "Rank tier cards (VIP, Legend, God)", "Visual Discord community integration", "Immersive dark animations and glow effects"]
    }
  },
  {
    id: "block-bloom", cat: "gaming", img: "block-bloom", mock: "Block & Bloom · Builder Demo",
    title: "Block & Bloom",
    tags: ["Landing", "JavaScript", "Formulario", "Diseño Lúdico"],
    es: {
      cat: "Builder · Creativo",
      badge: "Concepto Landing",
      desc: "Propuesta de landing fresca y colorida para un constructor de Minecraft, con portafolio de mapas y formulario visual para cotizaciones.",
      features: ["Estilo visual alegre con paleta pastel", "Galería de conceptos de construcción", "Formulario guiado paso a paso para solicitudes", "Estructura preparada para conexión con bot de Discord", "Diseño totalmente adaptable a pantallas pequeñas"]
    },
    en: {
      cat: "Builder · Creative",
      badge: "Landing Concept",
      desc: "Fresh, colorful landing page concept for a Minecraft builder, featuring a builds portfolio and guided quote request form.",
      features: ["Friendly aesthetic with pastel palette", "Showcase of build concepts", "Step-by-step guided request form", "Designed for Discord bot hookup", "Fully responsive layout across all screen sizes"]
    }
  }
];

const T = {
  es: {
    navWork: "Proyectos", navServices: "Servicios", navPricing: "Precios", navProcess: "Proceso", navCta: "Cotizar",
    heroEyebrow: "Prototipos & Conceptos de Diseño Web",
    heroT1: "Diseño web", heroT2: "moderno y a medida", heroT3: "para tu marca.",
    heroLead: "Explora mis conceptos y prototipos de diseño web: páginas de presentación, catálogos visuales, paneles de gestión y tiendas. Diseñados desde cero con atención al detalle.",
    heroBtn1: "Ver prototipos", heroBtn2: "Hablemos de tu idea",
    stat1: "Proyectos en vitrina", stat2: "Estilos visuales", stat3: "Landing desde", fb1: "Carga rápida", fb2: "100% responsive",
    workLabel: "Vitrina de Trabajos", workTitle: "Prototipos & Diseños Seleccionados",
    workDesc: "Muestras de diseño y conceptos visuales. Pasa el cursor sobre cada pantalla para ver el recorrido completo de la página, o haz clic para verla en detalle.",
    featTag: "Concepto de diseño · Restaurante & Bistro",
    featDesc: "Propuesta de diseño web para un restaurante y bistro frente al lago. Estructurado para presentar el menú digital interactivo, coctelería de autor, ubicaciones y botón de reservas por WhatsApp.",
    featL1: "Menú digital por categorías", featL2: "Reservas y contacto por WhatsApp", featL3: "Galería y ubicaciones con mapa", featL4: "Optimizado para móvil y SEO local",
    viewDesign: "Ver diseño completo", details: "Ver detalles", quoteThis: "Cotizar diseño similar",
    fAll: "Todos", fBusiness: "Negocios & Turismo", fApps: "Sistemas & Apps", fShop: "E-commerce", fGaming: "Gaming",
    demoNote: "Aviso: Todos los proyectos expuestos son conceptos de diseño UI/UX y prototipos demostrativos para exhibir habilidades visuales y de maquetación web. No corresponden a sitios activos en producción ni procesan datos reales.",
    svcLabel: "Servicios", svcTitle: "¿Qué tipo de sitio necesitas?", svcDesc: "Diseño cada propuesta desde cero, adaptada a la identidad y objetivos de tu proyecto.",
    s1t: "Landing Pages", s1d: "Página de aterrizaje atractiva para presentar tu marca, servicio o producto y captar clientes.",
    s2t: "Restaurantes & Turismo", s2d: "Menú digital, galería, reservas, mapa y botón directo de WhatsApp.",
    s3t: "Paneles & Dashboards", s3d: "Interfaces de administración limpias con control de clientes, métricas y reportes.",
    s4t: "Catálogos & Tiendas", s4d: "Catálogos visuales de productos con carrito de compras y experiencia fluida.",
    s5t: "Plataformas Educativas", s5d: "Estructuras web con portales para alumnos, profesores y padres de familia.",
    s6t: "Webs para Servidores", s6d: "Páginas temáticas para servidores de videojuegos con rangos y comunidad de Discord.",
    priceLabel: "Oferta Especial", priceTitle: "20% de Descuento en Todos los Planes", priceDesc: "Precios promocionales por tiempo limitado. Aplica automáticamente mencionando el código WEB20.",
    bBadge: "🔥 OFERTA ACTIVA", bText: "20% DE DESCUENTO en todos los sitios web este mes · Código: WEB20 (Solo 2 cupos disponibles)", bBtn: "Reclamar 20% OFF ↗",
    from: "Desde", investment: "Inversión", quote: "A cotizar", popular: "Más popular · -20%", choose: "Empezar", ask: "Pedir cotización",
    aiBadge: "✨ Chat IA 24/7 · -20%", corpBadge: "Empresarial · -20%", from520: "Desde $520",
    p1t: "Landing Express", p1s: "1 página moderna con botón a WhatsApp. Ideal para empezar a vender ya.",
    p1Save: "Ahorras $25 · 20% OFF", p2Save: "Ahorras $55 · 20% OFF", p3Save: "Ahorras $90 · 20% OFF", p4Save: "Ahorras $130+ · 20% OFF",
    p1l1: "Diseño 100% personalizado", p1l2: "Adaptada a celular y tablet", p1l3: "Botón directo a WhatsApp", p1l4: "Carga ultra rápida (< 1s)", p1l5: "SEO básico y puesta en marcha",
    p1btn: "Aprovechar por $100",
    p2t: "Negocio / Menú Pro", p2s: "Sitio multi-sección para restaurantes, clínicas y comercios locales.",
    p2l1: "Todo lo de Landing Express", p2l2: "Menú digital o catálogo", p2l3: "Galería, mapa y horarios", p2l4: "Búsqueda local en Google", p2l5: "Animaciones e interacciones",
    p2btn: "Pedir con 20% OFF",
    p3t: "Web con Chatbot IA", p3s: "Atención 24/7 y captación de clientes en automático con Inteligencia Artificial.",
    p3l1: "Todo lo de Negocio Pro", p3l2: "Chatbot IA entrenado con tu negocio", p3l3: "Respuestas automáticas 24/7", p3l4: "Captura de prospectos (leads)", p3l5: "Envío de clientes a tu WhatsApp",
    p3btn: "Quiero Web con IA",
    p4t: "Sistema a Medida", p4s: "Dashboards privados, control de clientes, membresías e inventario.",
    p4l1: "Panel privado con login y roles", p4l2: "Base de datos en la nube", p4l3: "Gestión de clientes / inventario", p4l4: "Reportes PDF / Excel y gráficas", p4l5: "Instalable en móvil como PWA",
    p4btn: "Consultar proyecto",
    calloutTag: "🔥 OFERTA DE TEMPORADA · CÓDIGO: WEB20",
    calloutTitle: "20% de descuento asegurado en tu nuevo sitio web",
    calloutDesc: "Menciona el código WEB20 al escribir por WhatsApp o Discord para congelar tu 20% de descuento de inmediato. Incluye garantía de satisfacción: te mostramos avances interactivos de tu diseño antes de la entrega final.",
    perk1: "✓ Sin costos ocultos", perk2: "✓ Dominio y puesta en marcha incluida", perk3: "✓ Soporte continuo después de la entrega",
    slotsLabel: "Cupos con 20% OFF este mes:", slotsCount: "Quedan 2 cupos de 5 disponibles", calloutBtn: "Apartar mi 20% OFF por WhatsApp",
    procLabel: "Metodología", procTitle: "Cómo trabajo tu proyecto",
    st1t: "Conversación inicial", st1d: "Me cuentas sobre tu negocio, tus metas y tus referencias visuales.",
    st2t: "Propuesta visual", st2d: "Creo una maqueta de diseño con tus colores, tipografía y estilo.",
    st3t: "Maquetación", st3d: "Desarrollo la página interactiva y ajustamos detalles con tus comentarios.",
    st4t: "Entrega final", st4d: "Te entrego tu sitio listo para usar y te asesoro para ponerlo en marcha.",
    faqTitle: "Preguntas frecuentes",
    q1: "¿Cuánto tarda en estar listo mi diseño?", a1: "Una landing page suele tomar pocos días; un sitio más extenso con catálogo o panel toma un poco más. Te doy un cronograma claro antes de iniciar.",
    q2: "¿Se verá bien en teléfonos móviles?", a2: "Por supuesto. Cada diseño es 100% responsive y se revisa con cuidado en celular, tablet y monitor de escritorio.",
    q3: "¿Puedo pedir cambios durante el diseño?", a3: "Sí. Te voy mostrando avances para que podamos afinar colores, textos y distribución hasta que quede exactamente como quieres.",
    q4: "¿Cómo recibo mi sitio?", a4: "Te entrego los archivos listos o te ayudo a publicarlo en tu hosting y vincular tu propio dominio.",
    q5: "¿Cómo acordamos el pago?", a5: "Podemos trabajar de manera segura a través de mi perfil de Fiverr o coordinar directamente por Discord.",
    ctaLabel: "Contacto", ctaTitle: "¿Tienes una idea en mente?",
    ctaDesc: "Escríbeme por Discord o Fiverr. Cuéntame sobre tu proyecto y te responderé con una cotización sin compromiso.",
    fHome: "Inicio", mFeatures: "Detalles del diseño", mClose: "Cerrar", mQuote: "Cotizar este estilo",
    tabDesign: "Diseño", tabInfo: "Detalles", scrollHint: "Desliza para ver la página completa",
    likeThis: "¿Te gustaría un diseño con este estilo?"
  },
  en: {
    navWork: "Projects", navServices: "Services", navPricing: "Pricing", navProcess: "Process", navCta: "Get a quote",
    heroEyebrow: "Web Design Prototypes & Concepts",
    heroT1: "Modern, custom", heroT2: "web design", heroT3: "for your brand.",
    heroLead: "Explore my web design concepts and prototypes: presentation landing pages, visual catalogs, dashboards, and online stores. Crafted from scratch with attention to detail.",
    heroBtn1: "View prototypes", heroBtn2: "Let's talk about your idea",
    stat1: "Featured designs", stat2: "Visual styles", stat3: "Landing from", fb1: "Fast loading", fb2: "100% responsive",
    workLabel: "Work Showcase", workTitle: "Selected Prototypes & Designs",
    workDesc: "Design samples and visual concepts. Hover over any screen to scroll through the full page, or click to view details.",
    featTag: "Design Concept · Restaurant & Bistro",
    featDesc: "Web design concept for a modern lakeside restaurant & bistro. Structured to showcase an interactive digital menu, signature drinks gallery, locations, and direct WhatsApp reservations.",
    featL1: "Digital menu by category", featL2: "Reservations and WhatsApp contact", featL3: "Gallery and locations with map", featL4: "Mobile-first and local SEO",
    viewDesign: "View full design", details: "View details", quoteThis: "Request similar design",
    fAll: "All", fBusiness: "Business & Tourism", fApps: "Systems & Apps", fShop: "E-commerce", fGaming: "Gaming",
    demoNote: "Notice: All featured projects are demonstrative UI/UX prototypes and visual layouts to showcase web styling and design skills. They are not active production sites and do not process real data.",
    svcLabel: "Services", svcTitle: "What kind of website do you need?", svcDesc: "Every concept is tailored from scratch to match your project's identity and goals.",
    s1t: "Landing Pages", s1d: "A striking single-page layout to present your brand, product, or service and turn visitors into clients.",
    s2t: "Restaurants & Tourism", s2d: "Digital menu, photo gallery, reservations, map, and one-tap WhatsApp contact.",
    s3t: "Panels & Dashboards", s3d: "Clean admin interfaces with client management, metrics, and report views.",
    s4t: "Catalogs & Stores", s4d: "Visual product catalogs with a shopping cart and seamless browsing flow.",
    s5t: "Educational Platforms", s5d: "Organized web structures with dedicated portals for students, teachers, and parents.",
    s6t: "Gaming Server Websites", s6d: "Themed gaming server pages with rank cards, store layout, and Discord community integration.",
    priceLabel: "Special Offer", priceTitle: "20% OFF on All Web Plans", priceDesc: "Limited-time promotional pricing. Automatically applied with promo code WEB20.",
    bBadge: "🔥 ACTIVE OFFER", bText: "20% OFF on all website projects this month · Code: WEB20 (Only 2 slots left)", bBtn: "Claim 20% OFF ↗",
    from: "Starting from", investment: "Investment", quote: "Custom quote", popular: "Most popular · -20%", choose: "Get started", ask: "Request quote",
    aiBadge: "✨ 24/7 AI Chat · -20%", corpBadge: "Enterprise · -20%", from520: "Starting at $520",
    p1t: "Landing Express", p1s: "1 high-converting page with direct WhatsApp button. Ready to sell fast.",
    p1Save: "You save $25 · 20% OFF", p2Save: "You save $55 · 20% OFF", p3Save: "You save $90 · 20% OFF", p4Save: "You save $130+ · 20% OFF",
    p1l1: "100% custom visual design", p1l2: "Mobile & tablet responsive", p1l3: "Floating WhatsApp button", p1l4: "Ultra-fast load speed (< 1s)", p1l5: "Basic SEO & domain setup",
    p1btn: "Get it for $100",
    p2t: "Business / Menu Pro", p2s: "Multi-section website for restaurants, clinics, tourism and local businesses.",
    p2l1: "Everything in Landing Express", p2l2: "Digital menu or product catalog", p2l3: "Photo gallery, map & hours", p2l4: "Local Google SEO optimization", p2l5: "Animations & smooth interactions",
    p2btn: "Claim 20% OFF",
    p3t: "Web with AI Chatbot", p3s: "24/7 automated client support and lead capture powered by Artificial Intelligence.",
    p3l1: "Everything in Business Pro", p3l2: "Custom AI chatbot trained on your business", p3l3: "24/7 instant automated replies", p3l4: "Automatic lead qualification", p3l5: "Direct customer leads to WhatsApp",
    p3btn: "Get Web with AI",
    p4t: "Custom Web System", p4s: "Private management dashboards, customer control, memberships, and inventory.",
    p4l1: "Secure admin panel with user roles", p4l2: "Real-time cloud database", p4l3: "Client / inventory management", p4l4: "PDF / Excel reports & charts", p4l5: "Installable as mobile app (PWA)",
    p4btn: "Discuss custom project",
    calloutTag: "🔥 LIMITED OFFER · CODE: WEB20",
    calloutTitle: "Guaranteed 20% Discount on Your Next Website",
    calloutDesc: "Mention code WEB20 on WhatsApp or Discord to lock in your 20% discount immediately. Includes 100% satisfaction guarantee: we show you interactive previews before final delivery.",
    perk1: "✓ No hidden fees", perk2: "✓ Domain & deployment setup included", perk3: "✓ Post-launch support included",
    slotsLabel: "Discount slots remaining this month:", slotsCount: "Only 2 of 5 slots available", calloutBtn: "Claim 20% OFF via WhatsApp",
    procLabel: "Methodology", procTitle: "How I build your project",
    st1t: "Initial conversation", st1d: "We discuss your brand, goals, and visual preferences.",
    st2t: "Visual mockup", st2d: "I draft a design concept with your colors, typography, and content.",
    st3t: "Implementation", st3d: "I build the interactive page and refine details based on your feedback.",
    st4t: "Final handover", st4d: "I deliver your clean files and guide you on publishing online.",
    faqTitle: "Frequently asked questions",
    q1: "How long does a design take?", a1: "A landing page usually takes a few days; a multi-section catalog or dashboard takes slightly longer. I give you a clear delivery timeline upfront.",
    q2: "Will it look great on mobile?", a2: "Absolutely. Every design is 100% responsive and carefully tested on phones, tablets, and desktop displays.",
    q3: "Can I request changes?", a3: "Yes. I share progress throughout the process so we can refine colors, typography, and layout until you love the result.",
    q4: "How do I receive the website?", a4: "I provide clean, ready-to-deploy files and can assist in pointing your domain and publishing it on your hosting.",
    q5: "How are payments handled?", a5: "We can work securely via my Fiverr profile or coordinate directly on Discord.",
    ctaLabel: "Contact", ctaTitle: "Have a project in mind?",
    ctaDesc: "Message me on Discord or Fiverr. Tell me about your idea and I will get back to you with a free quote.",
    fHome: "Home", mFeatures: "Design highlights", mClose: "Close", mQuote: "Quote this style",
    tabDesign: "Design", tabInfo: "Details", scrollHint: "Scroll down to see the full page",
    likeThis: "Would you like a design in this style?"
  }
};

let lang = localStorage.getItem("jb-lang") || ((navigator.language || "").startsWith("es") ? "es" : "en");
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const t = k => T[lang][k] || k;

function renderGrid() {
  const grid = $("#grid");
  const active = $("#filters .active")?.dataset.filter || "all";
  grid.innerHTML = PROJECTS.filter(p => p.id !== "kota").map(p => {
    const L = p[lang];
    const src = p.phone ? `assets/web/${p.img}.webp` : `assets/web/${p.img}-full.webp`;
    return `
    <article class="card reveal in ${active !== "all" && p.cat !== active ? "hide" : ""}" data-cat="${p.cat}">
      <div class="frame" data-open="${p.id}" style="cursor:zoom-in" title="${t("viewDesign")}">
        <div class="mock-bar"><i></i><i></i><i></i><span>${esc(p.mock)}</span></div>
        <div class="screen ${p.phone ? "is-phone" : ""}"><img src="${src}" alt="${esc(p.title)}" loading="lazy"></div>
      </div>
      <div class="card-body">
        <div class="card-top">
          <span class="card-cat">${esc(L.cat)}</span>
          <span class="card-status">${esc(L.badge)}</span>
        </div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(L.desc)}</p>
        <div class="tags">${p.tags.map(x => `<span>${esc(x)}</span>`).join("")}</div>
        <div class="card-actions">
          <button class="btn btn-dark" data-open="${p.id}"><span>${t("viewDesign")}</span> 🔍</button>
          <a href="#contact" class="btn btn-ghost-dark">${t("navCta")}</a>
        </div>
      </div>
    </article>`;
  }).join("");
  setScrollDurations();
}

function setScrollDurations() {
  $$(".screen img").forEach(img => {
    const apply = () => {
      const ratio = img.naturalHeight / img.naturalWidth;
      const dur = Math.min(14, Math.max(2.5, ratio * 1.6));
      img.style.setProperty("--dur", dur + "s");
    };
    img.complete ? apply() : img.addEventListener("load", apply, { once: true });
  });
}

$("#filters").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  $$("#filters button").forEach(x => x.classList.toggle("active", x === b));
  const f = b.dataset.filter;
  $$("#grid .card").forEach(c => c.classList.toggle("hide", f !== "all" && c.dataset.cat !== f));
});

const modal = $("#modal");

function switchModalTab(tabName) {
  const isDesign = tabName === "design";
  $("#segDesignBtn")?.classList.toggle("active", isDesign);
  $("#segInfoBtn")?.classList.toggle("active", !isDesign);
  $("#paneDesign")?.classList.toggle("active", isDesign);
  $("#paneInfo")?.classList.toggle("active", !isDesign);
}
$("#segDesignBtn")?.addEventListener("click", () => switchModalTab("design"));
$("#segInfoBtn")?.addEventListener("click", () => switchModalTab("info"));

function openModal(id) {
  const p = PROJECTS.find(x => x.id === id); if (!p) return;
  const L = p[lang];
  const mTopCat = $("#mTopCat"); if (mTopCat) mTopCat.textContent = L.cat;
  const mTopTitle = $("#mTopTitle"); if (mTopTitle) mTopTitle.textContent = p.title;
  const mUrl = $("#mUrl"); if (mUrl) mUrl.textContent = p.mock;

  const sc = $("#mScroll");
  sc?.classList.toggle("is-phone", !!p.phone);
  const img = $("#mImg");
  if (img) {
    img.src = p.phone ? `assets/web/${p.img}.webp` : `assets/web/${p.img}-full.webp`;
    img.alt = p.title;
  }
  switchModalTab("design");
  const vp = $("#designViewport");
  if (vp) vp.scrollTop = 0;

  const mCat = $("#mCat"); if (mCat) mCat.textContent = L.cat;
  const mTitle = $("#mTitle"); if (mTitle) mTitle.textContent = p.title;
  const mDesc = $("#mDesc"); if (mDesc) mDesc.textContent = L.desc;
  const mFeatures = $("#mFeatures");
  if (mFeatures) mFeatures.innerHTML = L.features.map(f => `<li>${esc(f)}</li>`).join("");
  const mTags = $("#mTags");
  if (mTags) mTags.innerHTML = p.tags.map(x => `<span>${esc(x)}</span>`).join("");

  modal.classList.add("open"); modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  history.replaceState(null, "", `#preview-${p.id}`);
}
function closeModal() {
  modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (location.hash.startsWith("#preview-")) {
    history.replaceState(null, "", "#work");
  }
}
document.addEventListener("click", e => {
  const o = e.target.closest("[data-open]");
  if (o && !e.target.closest("a:not([data-open])")) { e.preventDefault(); openModal(o.dataset.open); return; }
  if (e.target.closest("[data-close]")) closeModal();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

function setLang(l) {
  lang = l; localStorage.setItem("jb-lang", l);
  document.documentElement.lang = l;
  $$(".lang button").forEach(b => b.classList.toggle("active", b.dataset.lang === l));
  $$("[data-i18n]").forEach(el => { const v = T[l][el.dataset.i18n]; if (v) el.textContent = v; });
  renderGrid();
}
$$(".lang button").forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));

const nav = $("#nav");
addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 30), { passive: true });
$("#burger").addEventListener("click", () => { $("#burger").classList.toggle("open"); $("#navLinks").classList.toggle("open"); });
$$("#navLinks a").forEach(a => a.addEventListener("click", () => { $("#burger").classList.remove("open"); $("#navLinks").classList.remove("open"); }));

const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
}), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

setLang(lang);
$$(".reveal:not(.in)").forEach(el => io.observe(el));

if (location.hash.startsWith("#preview-")) {
  const pid = location.hash.replace("#preview-", "");
  setTimeout(() => openModal(pid), 400);
}
