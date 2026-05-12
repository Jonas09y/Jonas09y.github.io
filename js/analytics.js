/* ========== ANALYTICS TRACKER ========== */
(async function() {
  // Wait for Firebase config to be available
  if (typeof firebaseConfig === "undefined") return;

  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js");
  const { getFirestore, doc, setDoc, updateDoc, increment, arrayUnion } = await import("https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js");

  const app = initializeApp(firebaseConfig, "analytics");
  const db = getFirestore(app);

  const today = new Date().toISOString().split("T")[0]; // "2026-05-12"
  const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
  const device = isMobile ? "mobile" : "desktop";
  const referrer = document.referrer || "direct";
  const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

  // Track page view
  async function trackVisit() {
    try {
      const dayRef = doc(db, "analytics_daily", today);
      await setDoc(dayRef, {
        date: today,
        views: increment(1),
        mobile: increment(isMobile ? 1 : 0),
        desktop: increment(isMobile ? 0 : 1),
      }, { merge: true });

      // Log individual visit
      await setDoc(doc(db, "analytics_visits", sessionId), {
        timestamp: new Date().toISOString(),
        device,
        referrer: referrer.substring(0, 100),
        language: navigator.language || "unknown",
        page: window.location.pathname,
      });
    } catch (e) { /* silent fail */ }
  }

  // Track clicks
  function trackClick(action, label) {
    try {
      const clickRef = doc(db, "analytics_daily", today);
      setDoc(clickRef, {
        [`clicks_${action}`]: increment(1),
      }, { merge: true });

      setDoc(doc(db, "analytics_clicks", sessionId + "_" + Date.now()), {
        timestamp: new Date().toISOString(),
        action, label, device,
      });
    } catch (e) { /* silent fail */ }
  }

  // Track section views (IntersectionObserver)
  function trackSections() {
    const sections = document.querySelectorAll(".section, .hero");
    const tracked = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id || "hero";
          if (!tracked.has(id)) {
            tracked.add(id);
            try {
              const dayRef = doc(db, "analytics_daily", today);
              setDoc(dayRef, {
                [`section_${id}`]: increment(1),
              }, { merge: true });
            } catch (e) { /* silent */ }
          }
        }
      });
    }, { threshold: 0.3 });
    sections.forEach(s => observer.observe(s));
  }

  // Attach click listeners
  function attachClickTrackers() {
    // Discord buttons
    document.querySelectorAll('a[href*="discord"]').forEach(el => {
      el.addEventListener("click", () => trackClick("discord", "Discord Click"));
    });
    // Fiverr buttons
    document.querySelectorAll('a[href*="fiverr"]').forEach(el => {
      el.addEventListener("click", () => trackClick("fiverr", "Fiverr Click"));
    });
    // TikTok buttons
    document.querySelectorAll('a[href*="tiktok"]').forEach(el => {
      el.addEventListener("click", () => trackClick("tiktok", "TikTok Click"));
    });
    // Portfolio filter buttons
    document.querySelectorAll(".filter-btn").forEach(el => {
      el.addEventListener("click", () => trackClick("filter", el.textContent));
    });
    // Language switch
    document.querySelectorAll(".lang-btn").forEach(el => {
      el.addEventListener("click", () => trackClick("language", el.dataset.lang));
    });
    // CTA buttons in hero
    document.querySelectorAll(".hero-buttons a").forEach(el => {
      el.addEventListener("click", () => trackClick("hero_cta", el.textContent));
    });
    // Web dev Get Started
    document.querySelectorAll("#webdev .btn-primary").forEach(el => {
      el.addEventListener("click", () => trackClick("webdev_cta", "Web Dev CTA"));
    });
  }

  // Init
  trackVisit();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { trackSections(); attachClickTrackers(); });
  } else {
    trackSections();
    attachClickTrackers();
  }
})();
