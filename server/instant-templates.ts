export interface BusinessContent {
  business_name: string;
  business_type: "restaurant" | "agency" | "startup" | "portfolio" | "medical" | "general";
  hero_title: string;
  hero_subtitle: string;
  about_title: string;
  about_text: string;
  services: { title: string; desc: string }[];
  cta_text: string;
  contact_description: string;
  phone: string;
  email: string;
  address: string;
  seo_title: string;
  seo_description: string;
  primary_color: string;
  accent_color: string;
}

const BUSINESS_CONFIGS: Record<string, { primary: string; accent: string; hero_image: string; about_image: string }> = {
  restaurant: {
    primary: "#c0392b",
    accent: "#e67e22",
    hero_image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&h=800&fit=crop",
    about_image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&h=500&fit=crop",
  },
  agency: {
    primary: "#1a237e",
    accent: "#3949ab",
    hero_image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&h=800&fit=crop",
    about_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&h=500&fit=crop",
  },
  startup: {
    primary: "#7c3aed",
    accent: "#06b6d4",
    hero_image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&h=800&fit=crop",
    about_image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&h=500&fit=crop",
  },
  portfolio: {
    primary: "#0f172a",
    accent: "#f59e0b",
    hero_image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1400&h=800&fit=crop",
    about_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=700&h=500&fit=crop",
  },
  medical: {
    primary: "#0d9488",
    accent: "#0891b2",
    hero_image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1400&h=800&fit=crop",
    about_image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=700&h=500&fit=crop",
  },
  general: {
    primary: "#059669",
    accent: "#0284c7",
    hero_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&h=800&fit=crop",
    about_image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&h=500&fit=crop",
  },
};

const ICONS = [
  `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
  `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
  `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
  `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>`,
  `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
];

export function buildInstantWebsite(content: BusinessContent, isRTL: boolean): { html: string; css: string } {
  const config = BUSINESS_CONFIGS[content.business_type] || BUSINESS_CONFIGS.general;
  const primary = content.primary_color || config.primary;
  const accent = content.accent_color || config.accent;
  const dir = isRTL ? "rtl" : "ltr";
  const fontImport = isRTL
    ? `@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');`
    : `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`;
  const fontFamily = isRTL ? "'Cairo', sans-serif" : "'Inter', sans-serif";

  const servicesHtml = content.services.slice(0, 6).map((s, i) => `
    <div class="service-card">
      <div class="service-icon">${ICONS[i % ICONS.length]}</div>
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
    </div>
  `).join("");

  const html = `
<div dir="${dir}" style="font-family: ${fontFamily}; color: #1a1a2a;">

  <!-- NAV -->
  <nav class="nav">
    <div class="nav-inner">
      <span class="nav-brand">${content.business_name}</span>
      <div class="aw-nav-links">
        <a href="#about">${isRTL ? "من نحن" : "About"}</a>
        <a href="#services">${isRTL ? "خدماتنا" : "Services"}</a>
        <a href="#contact">${isRTL ? "تواصل معنا" : "Contact"}</a>
        <a href="#contact" class="nav-cta">${content.cta_text}</a>
      </div>
      <button id="aw-menu-btn" aria-label="Menu" onclick="var m=document.getElementById('aw-mobile-menu');m.style.display=m.style.display==='flex'?'none':'flex'" style="display:none;background:none;border:none;cursor:pointer;padding:6px;color:#0f172a;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </div>
    <div id="aw-mobile-menu" style="display:none;flex-direction:column;background:#fff;padding:1rem 1.5rem;border-top:1px solid #e2e8f0;gap:0.25rem;">
      <a href="#about" onclick="document.getElementById('aw-mobile-menu').style.display='none'" style="padding:0.75rem 0;font-size:0.95rem;font-weight:500;color:#475569;border-bottom:1px solid #f1f5f9;">${isRTL ? "من نحن" : "About"}</a>
      <a href="#services" onclick="document.getElementById('aw-mobile-menu').style.display='none'" style="padding:0.75rem 0;font-size:0.95rem;font-weight:500;color:#475569;border-bottom:1px solid #f1f5f9;">${isRTL ? "خدماتنا" : "Services"}</a>
      <a href="#contact" onclick="document.getElementById('aw-mobile-menu').style.display='none'" style="padding:0.75rem 0;font-size:0.95rem;font-weight:500;color:#475569;border-bottom:1px solid #f1f5f9;">${isRTL ? "تواصل معنا" : "Contact"}</a>
      <a href="#contact" onclick="document.getElementById('aw-mobile-menu').style.display='none'" style="margin-top:0.5rem;padding:0.75rem 1.5rem;background:linear-gradient(135deg,${primary},${accent});color:#fff;border-radius:2rem;font-weight:700;text-align:center;">${content.cta_text}</a>
    </div>
  </nav>

  <!-- HERO -->
  <section class="hero">
    <div class="hero-bg" style="background-image: url('${config.hero_image}');"></div>
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <p class="hero-eyebrow">${content.business_name}</p>
      <h1 class="hero-title">${content.hero_title}</h1>
      <p class="hero-subtitle">${content.hero_subtitle}</p>
      <div class="hero-btns">
        <a href="#contact" class="btn-primary">${content.cta_text}</a>
        <a href="#services" class="btn-outline">${isRTL ? "اكتشف خدماتنا" : "Our Services"}</a>
      </div>
    </div>
  </section>

  <!-- ABOUT -->
  <section id="about" class="section about-section">
    <div class="container about-grid">
      <div class="about-img-wrap">
        <img src="${config.about_image}" alt="${content.business_name}" class="about-img" loading="lazy"/>
        <div class="about-badge">
          <span class="badge-num">10+</span>
          <span class="badge-label">${isRTL ? "سنوات خبرة" : "Years Experience"}</span>
        </div>
      </div>
      <div class="about-text">
        <p class="section-eyebrow">${isRTL ? "من نحن" : "About Us"}</p>
        <h2>${content.about_title}</h2>
        <div class="divider"></div>
        <p class="about-desc">${content.about_text}</p>
        <a href="#contact" class="btn-primary">${isRTL ? "تواصل معنا" : "Get In Touch"}</a>
      </div>
    </div>
  </section>

  <!-- SERVICES -->
  <section id="services" class="section services-section">
    <div class="container">
      <div class="section-header">
        <p class="section-eyebrow">${isRTL ? "خدماتنا" : "Services"}</p>
        <h2>${isRTL ? "ما نقدمه لك" : "What We Offer"}</h2>
        <div class="divider center"></div>
      </div>
      <div class="services-grid">
        ${servicesHtml}
      </div>
    </div>
  </section>

  <!-- CONTACT -->
  <section id="contact" class="section contact-section">
    <div class="container contact-grid">
      <div class="contact-info">
        <p class="section-eyebrow">${isRTL ? "تواصل معنا" : "Contact Us"}</p>
        <h2>${isRTL ? "نسعد بخدمتك" : "We'd Love to Help"}</h2>
        <div class="divider"></div>
        <p class="contact-desc">${content.contact_description}</p>
        <div class="contact-items">
          ${content.phone ? `<div class="contact-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${primary}" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.4 19.79 19.79 0 0 1 1.61 4.84 2 2 0 0 1 3.59 2.63h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l.72-.72a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.23 17.5z"/></svg>
            <span dir="ltr">${content.phone}</span>
          </div>` : ""}
          ${content.email ? `<div class="contact-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${primary}" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span dir="ltr">${content.email}</span>
          </div>` : ""}
          ${content.address ? `<div class="contact-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${primary}" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${content.address}</span>
          </div>` : ""}
        </div>
      </div>
      <div class="contact-form-wrap">
        <form class="contact-form" onsubmit="event.preventDefault()">
          <h3>${isRTL ? "أرسل رسالة" : "Send a Message"}</h3>
          <input type="text" placeholder="${isRTL ? "الاسم الكامل" : "Full Name"}" class="form-input" required/>
          <input type="email" placeholder="${isRTL ? "البريد الإلكتروني" : "Email Address"}" class="form-input" required/>
          <input type="tel" placeholder="${isRTL ? "رقم الهاتف" : "Phone Number"}" class="form-input" dir="ltr"/>
          <textarea placeholder="${isRTL ? "رسالتك" : "Your Message"}" class="form-input form-textarea" rows="4"></textarea>
          <button type="submit" class="btn-primary btn-block">${content.cta_text}</button>
        </form>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <span class="footer-name">${content.business_name}</span>
        <p class="footer-tagline">${content.hero_subtitle}</p>
      </div>
      <div class="footer-copy">
        <p>© 2026 ${content.business_name}. ${isRTL ? "جميع الحقوق محفوظة" : "All Rights Reserved"}</p>
      </div>
    </div>
  </footer>

</div>`;

  const css = `
${fontImport}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { font-family: ${fontFamily}; color: #1a1a2a; background: #fff; }
a { text-decoration: none; color: inherit; }
img { max-width: 100%; display: block; }

/* ANIMATIONS */
@keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes floatIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

.container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
.section { padding: 5rem 0; }
.section-eyebrow { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: ${primary}; margin-bottom: 0.75rem; }
.section-header { text-align: center; margin-bottom: 3.5rem; }
.section-header h2 { font-size: 2.25rem; font-weight: 800; color: #0f172a; }
.divider { width: 60px; height: 4px; background: linear-gradient(90deg, ${primary}, ${accent}); border-radius: 2px; margin-top: 1rem; }
.divider.center { margin: 1rem auto 0; }

/* NAVBAR */
.nav { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(0,0,0,0.08); }
.nav-inner { max-width: 1200px; margin: 0 auto; padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; }
.nav-brand { font-size: 1.25rem; font-weight: 800; background: linear-gradient(135deg, ${primary}, ${accent}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.aw-nav-links { display: flex; align-items: center; gap: 2rem; }
.aw-nav-links a { font-size: 0.9rem; font-weight: 500; color: #475569; transition: color 0.2s; text-decoration: none; }
.aw-nav-links a:hover { color: ${primary}; }
.nav-cta { background: linear-gradient(135deg, ${primary}, ${accent}) !important; color: white !important; padding: 0.5rem 1.25rem; border-radius: 2rem; font-weight: 600 !important; transition: opacity 0.2s !important; }
.nav-cta:hover { opacity: 0.9; color: white !important; }

/* HERO */
.hero { position: relative; min-height: 90vh; display: flex; align-items: center; overflow: hidden; }
.hero-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
.hero-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 100%); }
.hero-content { position: relative; z-index: 2; max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem; animation: fadeUp 0.9s ease-out; }
.hero-eyebrow { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: ${accent}; margin-bottom: 1rem; }
.hero-title { font-size: clamp(2.25rem, 5vw, 4rem); font-weight: 900; color: #fff; line-height: 1.2; margin-bottom: 1.25rem; max-width: 700px; }
.hero-subtitle { font-size: 1.15rem; color: rgba(255,255,255,0.85); max-width: 550px; line-height: 1.7; margin-bottom: 2.5rem; }
.hero-btns { display: flex; gap: 1rem; flex-wrap: wrap; }
.btn-primary { display: inline-block; background: linear-gradient(135deg, ${primary}, ${accent}); color: white; padding: 0.875rem 2.25rem; border-radius: 2.5rem; font-weight: 700; font-size: 1rem; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 20px rgba(0,0,0,0.25); border: none; cursor: pointer; font-family: inherit; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }
.btn-outline { display: inline-block; background: transparent; color: #fff; padding: 0.875rem 2.25rem; border-radius: 2.5rem; font-weight: 600; border: 2px solid rgba(255,255,255,0.7); transition: all 0.2s; }
.btn-outline:hover { background: rgba(255,255,255,0.15); }
.btn-block { width: 100%; text-align: center; }

/* ABOUT */
.about-section { background: #f8fafc; }
.about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
.about-img-wrap { position: relative; }
.about-img { width: 100%; height: 420px; object-fit: cover; border-radius: 1.25rem; box-shadow: 0 20px 60px rgba(0,0,0,0.12); }
.about-badge { position: absolute; bottom: -1.5rem; ${dir === "rtl" ? "right: -1.5rem" : "left: -1.5rem"}; background: linear-gradient(135deg, ${primary}, ${accent}); color: white; padding: 1.25rem 1.5rem; border-radius: 1rem; text-align: center; box-shadow: 0 8px 25px rgba(0,0,0,0.2); }
.badge-num { display: block; font-size: 2rem; font-weight: 900; line-height: 1; }
.badge-label { font-size: 0.8rem; font-weight: 600; opacity: 0.9; }
.about-text { animation: floatIn 0.8s ease-out; }
.about-text h2 { font-size: 2.25rem; font-weight: 800; color: #0f172a; margin: 0.5rem 0 1rem; }
.about-desc { color: #64748b; line-height: 1.85; margin: 1rem 0 2rem; font-size: 1.05rem; }

/* SERVICES */
.services-section { background: #fff; }
.services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.75rem; }
.service-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 1.25rem; padding: 2.25rem; transition: all 0.3s; cursor: default; }
.service-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(0,0,0,0.1); border-color: ${primary}40; background: white; }
.service-icon { width: 60px; height: 60px; background: linear-gradient(135deg, ${primary}15, ${accent}15); border-radius: 1rem; display: flex; align-items: center; justify-content: center; color: ${primary}; margin-bottom: 1.25rem; }
.service-card h3 { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 0.6rem; }
.service-card p { color: #64748b; line-height: 1.7; font-size: 0.95rem; }

/* CONTACT */
.contact-section { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; }
.contact-section .section-eyebrow { color: ${accent}; }
.contact-section h2 { color: white; font-size: 2.25rem; font-weight: 800; margin-bottom: 0.5rem; }
.contact-section .divider { margin-bottom: 1.5rem; }
.contact-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 4rem; align-items: start; }
.contact-desc { color: #94a3b8; line-height: 1.85; margin-bottom: 2rem; font-size: 1.05rem; }
.contact-items { display: flex; flex-direction: column; gap: 1rem; }
.contact-item { display: flex; align-items: center; gap: 0.85rem; }
.contact-item span { color: #cbd5e1; font-size: 0.95rem; }
.contact-form-wrap { background: white; border-radius: 1.5rem; padding: 2.5rem; box-shadow: 0 25px 60px rgba(0,0,0,0.3); }
.contact-form h3 { color: #0f172a; font-size: 1.35rem; font-weight: 700; margin-bottom: 1.5rem; }
.form-input { width: 100%; padding: 0.875rem 1.1rem; border: 1.5px solid #e2e8f0; border-radius: 0.75rem; font-family: ${fontFamily}; font-size: 0.95rem; color: #1a1a2a; background: #f8fafc; margin-bottom: 1rem; transition: border-color 0.2s; outline: none; }
.form-input:focus { border-color: ${primary}; background: white; }
.form-textarea { resize: vertical; min-height: 110px; }

/* FOOTER */
.footer { background: #020617; padding: 3rem 0; }
.footer-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
.footer-name { font-size: 1.25rem; font-weight: 800; background: linear-gradient(135deg, ${primary}, ${accent}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.footer-tagline { color: #475569; font-size: 0.85rem; margin-top: 0.35rem; }
.footer-copy { color: #475569; font-size: 0.85rem; }

/* RESPONSIVE */
@media (max-width: 768px) {
  .about-grid, .contact-grid { grid-template-columns: 1fr; gap: 2.5rem; }
  .about-badge { bottom: -1rem; ${dir === "rtl" ? "right: 1rem" : "left: 1rem"}; }
  .hero-title { font-size: 2.25rem; }
  .aw-nav-links { display: none !important; }
  #aw-menu-btn { display: block !important; }
  .hero-btns { flex-direction: column; width: 100%; max-width: 300px; }
  .section { padding: 3.5rem 0; }
  .services-grid { grid-template-columns: 1fr; }
  .contact-form-wrap { padding: 1.75rem; }
  .footer-inner { flex-direction: column; text-align: center; }
}
`;

  return { html, css };
}
