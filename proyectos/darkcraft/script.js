/* ============================================
   DARKCRAFT - Interactive Script
   ============================================ */

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Update active nav link based on scroll position
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
});

// ===== MOBILE MENU =====
function toggleMenu() {
  const links = document.getElementById('nav-links');
  links.classList.toggle('open');
}

// Close mobile menu on link click
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('nav-links').classList.remove('open');
  });
});

// ===== COPY IP =====
function copyIP() {
  navigator.clipboard.writeText('play.darkcraft.net').then(() => {
    const toast = document.getElementById('copied-toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  });
}

// ===== FAQ ACCORDION =====
function toggleFaq(btn) {
  const item = btn.parentElement;
  const isActive = item.classList.contains('active');
  
  // Close all other FAQs
  document.querySelectorAll('.faq-item').forEach(faq => {
    faq.classList.remove('active');
  });

  // Toggle current
  if (!isActive) {
    item.classList.add('active');
  }
}

// ===== SCROLL REVEAL =====
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ===== ANIMATED PLAYER COUNT =====
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out quad
    const eased = 1 - (1 - progress) * (1 - progress);
    const current = Math.floor(eased * target);
    
    element.textContent = current.toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// Animate the player count when hero becomes visible
const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const statEl = document.getElementById('stat-players');
      animateCounter(statEl, 347);
      heroObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const heroSection = document.querySelector('.hero');
if (heroSection) heroObserver.observe(heroSection);

// ===== ENDER PARTICLES SYSTEM =====
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const PARTICLE_COUNT = 60;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class EnderParticle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 1;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5 - 0.3;
    this.opacity = Math.random() * 0.4 + 0.1;
    this.fadeSpeed = Math.random() * 0.005 + 0.002;
    this.growing = Math.random() > 0.5;
    
    // Purple / orange particle color
    const colorChoice = Math.random();
    if (colorChoice < 0.6) {
      this.color = `rgba(180, 74, 255, ${this.opacity})`;
      this.hue = 'purple';
    } else if (colorChoice < 0.85) {
      this.color = `rgba(123, 47, 242, ${this.opacity})`;
      this.hue = 'purple';
    } else {
      this.color = `rgba(230, 126, 34, ${this.opacity})`;
      this.hue = 'orange';
    }
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.growing) {
      this.opacity += this.fadeSpeed;
      if (this.opacity >= 0.5) this.growing = false;
    } else {
      this.opacity -= this.fadeSpeed;
    }

    // Update color with new opacity
    if (this.hue === 'purple') {
      const r = Math.random() > 0.5 ? 180 : 123;
      const g = Math.random() > 0.5 ? 74 : 47;
      const b = Math.random() > 0.5 ? 255 : 242;
      this.color = `rgba(${r}, ${g}, ${b}, ${this.opacity})`;
    } else {
      this.color = `rgba(230, 126, 34, ${this.opacity})`;
    }

    // Reset if faded out or off screen
    if (this.opacity <= 0 || this.x < -10 || this.x > canvas.width + 10 || this.y < -10 || this.y > canvas.height + 10) {
      this.reset();
      this.opacity = 0;
      this.growing = true;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    // Glow effect
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2.5);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

// Initialize particles
for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push(new EnderParticle());
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  particles.forEach(particle => {
    particle.update();
    particle.draw();
  });

  requestAnimationFrame(animateParticles);
}

animateParticles();

// ===== SMOOTH SCROLL for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ===== PARALLAX EFFECT ON HERO =====
window.addEventListener('scroll', () => {
  const heroImg = document.querySelector('.hero-bg img');
  if (heroImg) {
    const scrolled = window.scrollY;
    heroImg.style.transform = `translateY(${scrolled * 0.3}px) scale(1.1)`;
  }
});

// ===== RANK CARD TILT EFFECT =====
document.querySelectorAll('.rank-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
  });
});
