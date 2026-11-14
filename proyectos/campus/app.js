/**
 * CAMPUS VIRTUAL — HOLY SPIRIT BILINGUAL SCHOOL
 * Main Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // === Variables & Elements ===
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const navLinkItems = document.querySelectorAll('.nav-link');
    
    const loginOverlay = document.getElementById('loginOverlay');
    const openLoginBtns = [document.getElementById('openLogin'), document.getElementById('heroLogin')];
    const loginClose = document.getElementById('loginClose');
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const userPassword = document.getElementById('userPassword');
    
    const portalTabs = document.querySelectorAll('.portal-tab');
    const portalPanels = document.querySelectorAll('.portal-panel');

    const statNumbers = document.querySelectorAll('.stat-number');
    
    // === Navbar Scroll Effect ===
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Update active nav link based on scroll position
        let current = '';
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinkItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });

    // === Mobile Menu ===
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    navLinkItems.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    });

    // === Login Modal Logic ===
    const openLoginModal = (e) => {
        if(e) e.preventDefault();
        loginOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    };

    const closeLoginModal = () => {
        loginOverlay.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
    };

    openLoginBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', openLoginModal);
    });

    if (loginClose) {
        loginClose.addEventListener('click', closeLoginModal);
    }

    // Close on click outside
    if (loginOverlay) {
        loginOverlay.addEventListener('click', (e) => {
            if (e.target === loginOverlay) {
                closeLoginModal();
            }
        });
    }

    // Toggle Password Visibility
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = userPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            userPassword.setAttribute('type', type);
            togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }

    // Handle Login Form Submit (Demo only)
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btnLogin = document.getElementById('btnLogin');
            const originalText = btnLogin.innerHTML;
            
            btnLogin.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i><span>Ingresando...</span>';
            btnLogin.style.opacity = '0.8';
            
            // Simulate API call
            setTimeout(() => {
                btnLogin.innerHTML = '<i class="fas fa-check"></i><span>¡Conectado!</span>';
                btnLogin.style.background = 'var(--success)';
                btnLogin.style.color = 'white';
                
                setTimeout(() => {
                    closeLoginModal();
                    // Reset button
                    setTimeout(() => {
                        btnLogin.innerHTML = originalText;
                        btnLogin.style.background = '';
                        btnLogin.style.color = '';
                    }, 500);
                }, 1000);
            }, 1500);
        });
    }

    // === Portals Tabs Logic ===
    portalTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all
            portalTabs.forEach(t => t.classList.remove('active'));
            portalPanels.forEach(p => p.classList.remove('active'));
            
            // Add active to clicked
            tab.classList.add('active');
            const portalId = tab.getAttribute('data-portal');
            document.getElementById(`portal-${portalId}`).classList.add('active');
        });
    });

    // === Number Counter Animation (Stats) ===
    let animated = false;
    
    const animateNumbers = () => {
        if (animated) return;
        
        statNumbers.forEach(stat => {
            const target = +stat.getAttribute('data-target');
            const duration = 2000; // 2 seconds
            const step = target / (duration / 16); // 60fps
            
            let current = 0;
            
            const updateCounter = () => {
                current += step;
                if (current < target) {
                    stat.innerText = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.innerText = target;
                }
            };
            
            updateCounter();
        });
        
        animated = true;
    };

    // Use Intersection Observer for stats animation
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animateNumbers();
            }
        }, { threshold: 0.5 });
        
        observer.observe(statsSection);
    }

    // === Contact Form Submit ===
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalHtml = btn.innerHTML;
            
            btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i><span>Enviando...</span>';
            btn.disabled = true;
            
            // Simulate sending
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-check"></i><span>¡Solicitud Enviada!</span>';
                btn.style.background = 'var(--success)';
                btn.style.color = 'white';
                contactForm.reset();
                
                setTimeout(() => {
                    btn.innerHTML = originalHtml;
                    btn.style.background = '';
                    btn.style.color = '';
                    btn.disabled = false;
                }, 3000);
            }, 1500);
        });
    }

    // Add AOS (Animate on scroll) style simple alternative for feature cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                fadeObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .benefit-card').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.6s ease-out ${index % 3 * 0.1}s`;
        fadeObserver.observe(el);
    });
});
