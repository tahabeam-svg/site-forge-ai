const lucideIcons = {
  briefcase: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  shield: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>`,
  zap: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  heart: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  globe: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
  target: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  award: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  phone: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  mail: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  mapPin: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  settings: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  sparkles: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
  truck: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>`,
  home: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
};

const iconKeys = Object.keys(lucideIcons) as (keyof typeof lucideIcons)[];

export interface TemplateParams {
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  services: { name: string; desc: string }[];
  testimonials: { name: string; role: string; text: string; photo?: string; gender?: "m" | "f" }[];
  galleryImages: string[];
  heroImageId: string;
  gradient: string;
  accent: string;
  accentDark: string;
  variant: number;
}

function getIcon(index: number): string {
  return lucideIcons[iconKeys[index % iconKeys.length]];
}

export function generateFullTemplate(p: TemplateParams): string {
  const heroImg = `https://images.unsplash.com/${p.heroImageId}?w=1400&h=700&fit=crop&q=80`;
  const galleryHtml = p.galleryImages.map((id, i) =>
    `<div style="border-radius:0.75rem;overflow:hidden;aspect-ratio:${i % 3 === 0 ? '4/3' : i % 3 === 1 ? '1/1' : '3/4'};"><img src="https://images.unsplash.com/${id}?w=500&h=400&fit=crop&q=75" alt="" style="width:100%;height:100%;object-fit:cover;transition:transform 0.4s;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'" loading="lazy"/></div>`
  ).join("");

  const servicesHtml = p.services.map((s, i) =>
    `<div style="background:#fff;border-radius:1rem;padding:2rem;text-align:center;box-shadow:0 2px 16px rgba(0,0,0,0.06);transition:transform 0.3s,box-shadow 0.3s;" onmouseover="this.style.transform='translateY(-6px)';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.12)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 16px rgba(0,0,0,0.06)'"><div style="width:60px;height:60px;border-radius:1rem;background:${p.accent}15;color:${p.accent};display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">${getIcon(i + p.variant)}</div><h3 style="font-family:'Cairo',sans-serif;font-weight:700;font-size:1.15rem;color:#1e293b;margin-bottom:0.5rem;">${s.name}</h3><p style="font-family:'Tajawal',sans-serif;color:#64748b;font-size:0.95rem;line-height:1.7;">${s.desc}</p></div>`
  ).join("");

  const testimonialsHtml = p.testimonials.map((t, i) => {
    const avatarHtml = t.photo
      ? `<img src="https://images.unsplash.com/${t.photo}?w=96&h=96&fit=crop&crop=face&q=80" alt="${t.name}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid ${p.accent}30;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" loading="lazy"/><div style="display:none;width:48px;height:48px;border-radius:50%;background:${p.accent}20;color:${p.accent};align-items:center;justify-content:center;font-family:'Cairo',sans-serif;font-weight:700;font-size:1.1rem;">${t.name.charAt(0)}</div>`
      : `<div style="width:48px;height:48px;border-radius:50%;background:${p.accent}20;color:${p.accent};display:flex;align-items:center;justify-content:center;font-family:'Cairo',sans-serif;font-weight:700;font-size:1.1rem;">${t.name.charAt(0)}</div>`;
    return `<div style="background:#fff;border-radius:1rem;padding:2rem;box-shadow:0 2px 12px rgba(0,0,0,0.05);border-right:4px solid ${p.accent};"><div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;">${avatarHtml}<div><div style="font-family:'Cairo',sans-serif;font-weight:700;color:#1e293b;">${t.name}</div><div style="font-family:'Tajawal',sans-serif;font-size:0.85rem;color:#94a3b8;">${t.role}</div></div></div><p style="font-family:'Tajawal',sans-serif;color:#475569;line-height:1.8;font-size:0.95rem;">"${t.text}"</p><div style="margin-top:0.75rem;color:#f59e0b;">&#9733;&#9733;&#9733;&#9733;&#9733;</div></div>`;
  }).join("");

  const layoutVariant = p.variant % 3;
  const heroAlign = layoutVariant === 0 ? "center" : layoutVariant === 1 ? "right" : "center";
  const heroOverlay = layoutVariant === 0
    ? `background:linear-gradient(180deg,rgba(0,0,0,0.65) 0%,rgba(0,0,0,0.4) 100%);`
    : layoutVariant === 1
    ? `background:linear-gradient(135deg,${p.accentDark}ee 0%,${p.accentDark}88 50%,transparent 100%);`
    : `background:${p.gradient};opacity:0.88;`;

  const brandName = p.heroTitle.split(" ")[0];

  return `<!DOCTYPE html><html lang="ar" dir="rtl"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Cairo','Tajawal',sans-serif;color:#1e293b;background:#fff;direction:rtl;overflow-x:hidden;}
a{text-decoration:none;color:inherit;}
img{max-width:100%;height:auto;display:block;}

/* Buttons */
.btn-primary{display:inline-block;padding:0.9rem 2.5rem;background:${p.accent};color:#fff;border-radius:2rem;font-weight:700;font-family:'Cairo',sans-serif;font-size:1.05rem;border:none;cursor:pointer;transition:all 0.3s;box-shadow:0 4px 15px ${p.accent}40;}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 6px 20px ${p.accent}60;}
.btn-outline{display:inline-block;padding:0.9rem 2.5rem;background:transparent;color:#fff;border:2px solid #fff;border-radius:2rem;font-weight:700;font-family:'Cairo',sans-serif;font-size:1.05rem;cursor:pointer;transition:all 0.3s;}
.btn-outline:hover{background:rgba(255,255,255,0.15);}

/* Layout */
.section{padding:5rem 2rem;}
.container{max-width:1200px;margin:0 auto;}

/* Nav */
.tg-nav{position:fixed;top:0;right:0;left:0;z-index:1000;background:rgba(255,255,255,0.96);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid #e2e8f0;}
.tg-nav-inner{max-width:1200px;margin:0 auto;padding:0.9rem 2rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;}
.tg-brand{font-family:'Cairo',sans-serif;font-weight:800;font-size:1.4rem;color:${p.accent};}
.tg-nav-links{display:flex;gap:2rem;font-family:'Tajawal',sans-serif;font-size:0.95rem;align-items:center;}
.tg-nav-links a{color:#475569;transition:color 0.2s;}
.tg-nav-links a:hover{color:${p.accent};}
.tg-nav-cta{padding:0.6rem 1.5rem;font-size:0.9rem;}

/* Burger button */
#aw-menu-btn{display:none;background:none;border:none;cursor:pointer;padding:8px;color:#475569;line-height:1;border-radius:8px;}
#aw-menu-btn:hover{background:#f1f5f9;}

/* Mobile menu */
#aw-mobile-menu{display:none;flex-direction:column;padding:1rem 1.5rem;gap:0.25rem;border-top:1px solid #e2e8f0;background:#fff;}
.mob-nav-link{display:block;padding:0.85rem 0.5rem;font-family:'Tajawal',sans-serif;font-size:1rem;font-weight:500;color:#475569;border-bottom:1px solid #f1f5f9;transition:color 0.2s,padding-right 0.2s;}
.mob-nav-link:hover{color:${p.accent};padding-right:1rem;}
.mob-nav-cta{display:block;margin-top:0.75rem;padding:0.9rem 1.5rem;background:${p.accent};color:#fff;border-radius:1rem;font-family:'Cairo',sans-serif;font-weight:700;font-size:0.95rem;text-align:center;}

/* Responsive */
@media(max-width:768px){
  .tg-nav-links{display:none!important;}
  #aw-menu-btn{display:flex!important;align-items:center;justify-content:center;}
  .grid-3{grid-template-columns:1fr!important;}
  .grid-2{grid-template-columns:1fr!important;}
  .hero-title{font-size:clamp(1.75rem,8vw,2.5rem)!important;}
  .hero-sub{font-size:1rem!important;}
  .section{padding:3rem 1rem!important;}
  .hero-actions{flex-direction:column;gap:0.75rem;align-items:center;}
  .contact-grid-inner{grid-template-columns:1fr!important;}
}
@media(max-width:480px){
  .hero-title{font-size:clamp(1.5rem,7vw,2rem)!important;}
  .tg-nav-inner{padding:0.75rem 1rem;}
  .tg-brand{font-size:1.2rem;}
}
</style></head><body>

<nav class="tg-nav">
  <div class="tg-nav-inner">
    <div class="tg-brand">${brandName}</div>
    <div class="tg-nav-links">
      <a href="#services">خدماتنا</a>
      <a href="#gallery">معرض الأعمال</a>
      <a href="#testimonials">آراء العملاء</a>
      <a href="#contact">تواصل معنا</a>
      <a href="#contact" class="btn-primary tg-nav-cta">${p.ctaText}</a>
    </div>
    <button id="aw-menu-btn" aria-label="القائمة" onclick="(function(){var m=document.getElementById('aw-mobile-menu');var o=m.style.display==='flex';m.style.display=o?'none':'flex';})()" >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>
  </div>
  <div id="aw-mobile-menu">
    <a href="#services" class="mob-nav-link" onclick="document.getElementById('aw-mobile-menu').style.display='none'">خدماتنا</a>
    <a href="#gallery" class="mob-nav-link" onclick="document.getElementById('aw-mobile-menu').style.display='none'">معرض الأعمال</a>
    <a href="#testimonials" class="mob-nav-link" onclick="document.getElementById('aw-mobile-menu').style.display='none'">آراء العملاء</a>
    <a href="#contact" class="mob-nav-link" onclick="document.getElementById('aw-mobile-menu').style.display='none'">تواصل معنا</a>
    <a href="#contact" class="mob-nav-cta" onclick="document.getElementById('aw-mobile-menu').style.display='none'">${p.ctaText}</a>
  </div>
</nav>

<header style="position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:${heroAlign};overflow:hidden;margin-top:0;padding-top:70px;">
<div style="position:absolute;inset:0;"><img src="${heroImg}" alt="" style="width:100%;height:100%;object-fit:cover;"/></div>
<div style="position:absolute;inset:0;${heroOverlay}"></div>
<div class="container" style="position:relative;z-index:2;padding:2rem;">
<h1 class="hero-title" style="font-family:'Cairo',sans-serif;font-size:clamp(2rem,6vw,3.5rem);font-weight:900;color:#fff;margin-bottom:1.25rem;line-height:1.3;text-shadow:0 2px 20px rgba(0,0,0,0.3);">${p.heroTitle}</h1>
<p class="hero-sub" style="font-family:'Tajawal',sans-serif;font-size:1.3rem;color:rgba(255,255,255,0.92);max-width:700px;${heroAlign === "center" ? "margin:0 auto" : "margin-right:0"};margin-bottom:2.5rem;line-height:1.8;">${p.heroSubtitle}</p>
<div class="hero-actions" style="display:flex;gap:1rem;${heroAlign === "center" ? "justify-content:center" : ""};">
<a href="#contact" class="btn-primary">${p.ctaText}</a>
<a href="#services" class="btn-outline">اكتشف المزيد</a>
</div>
</div>
</header>

<section id="services" class="section" style="background:#f8fafc;">
<div class="container">
<div style="text-align:center;margin-bottom:3.5rem;">
<span style="font-family:'Tajawal',sans-serif;color:${p.accent};font-weight:700;font-size:0.95rem;letter-spacing:0.05em;">ما نقدمه</span>
<h2 style="font-family:'Cairo',sans-serif;font-size:clamp(1.6rem,4vw,2.2rem);font-weight:800;color:#0f172a;margin-top:0.5rem;">خدماتنا المميزة</h2>
<div style="width:60px;height:4px;background:${p.accent};border-radius:2px;margin:1rem auto 0;"></div>
</div>
<div class="grid-3" style="display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;">
${servicesHtml}
</div>
</div>
</section>

<section id="gallery" class="section">
<div class="container">
<div style="text-align:center;margin-bottom:3.5rem;">
<span style="font-family:'Tajawal',sans-serif;color:${p.accent};font-weight:700;font-size:0.95rem;">أعمالنا</span>
<h2 style="font-family:'Cairo',sans-serif;font-size:clamp(1.6rem,4vw,2.2rem);font-weight:800;color:#0f172a;margin-top:0.5rem;">معرض الأعمال</h2>
<div style="width:60px;height:4px;background:${p.accent};border-radius:2px;margin:1rem auto 0;"></div>
</div>
<div class="grid-3" style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;">
${galleryHtml}
</div>
</div>
</section>

<section class="section" style="background:${p.gradient};text-align:center;">
<div class="container">
<h2 style="font-family:'Cairo',sans-serif;font-size:clamp(1.6rem,4vw,2.5rem);font-weight:800;color:#fff;margin-bottom:1rem;">هل أنت مستعد للبدء؟</h2>
<p style="font-family:'Tajawal',sans-serif;color:rgba(255,255,255,0.9);font-size:1.15rem;max-width:600px;margin:0 auto 2rem;line-height:1.8;">انضم إلى آلاف العملاء السعداء وابدأ رحلتك معنا اليوم</p>
<a href="#contact" class="btn-primary" style="background:#fff;color:${p.accent};box-shadow:0 4px 15px rgba(0,0,0,0.2);">${p.ctaText}</a>
</div>
</section>

<section id="testimonials" class="section" style="background:#f8fafc;">
<div class="container">
<div style="text-align:center;margin-bottom:3.5rem;">
<span style="font-family:'Tajawal',sans-serif;color:${p.accent};font-weight:700;font-size:0.95rem;">ماذا يقولون عنا</span>
<h2 style="font-family:'Cairo',sans-serif;font-size:clamp(1.6rem,4vw,2.2rem);font-weight:800;color:#0f172a;margin-top:0.5rem;">آراء عملائنا</h2>
<div style="width:60px;height:4px;background:${p.accent};border-radius:2px;margin:1rem auto 0;"></div>
</div>
<div class="grid-3" style="display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;">
${testimonialsHtml}
</div>
</div>
</section>

<section id="contact" class="section">
<div class="container">
<div style="text-align:center;margin-bottom:3.5rem;">
<span style="font-family:'Tajawal',sans-serif;color:${p.accent};font-weight:700;font-size:0.95rem;">تواصل معنا</span>
<h2 style="font-family:'Cairo',sans-serif;font-size:clamp(1.6rem,4vw,2.2rem);font-weight:800;color:#0f172a;margin-top:0.5rem;">نسعد بتواصلك</h2>
<div style="width:60px;height:4px;background:${p.accent};border-radius:2px;margin:1rem auto 0;"></div>
</div>
<div class="contact-grid-inner" style="display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:start;">
<div>
<form style="display:flex;flex-direction:column;gap:1rem;">
<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
<input type="text" placeholder="الاسم الكامل" style="padding:0.9rem 1.2rem;border:1.5px solid #e2e8f0;border-radius:0.75rem;font-family:'Tajawal',sans-serif;font-size:0.95rem;outline:none;transition:border 0.3s;width:100%;" onfocus="this.style.borderColor='${p.accent}'" onblur="this.style.borderColor='#e2e8f0'"/>
<input type="email" placeholder="البريد الإلكتروني" style="padding:0.9rem 1.2rem;border:1.5px solid #e2e8f0;border-radius:0.75rem;font-family:'Tajawal',sans-serif;font-size:0.95rem;outline:none;transition:border 0.3s;width:100%;" onfocus="this.style.borderColor='${p.accent}'" onblur="this.style.borderColor='#e2e8f0'"/>
</div>
<input type="tel" placeholder="رقم الجوال" style="padding:0.9rem 1.2rem;border:1.5px solid #e2e8f0;border-radius:0.75rem;font-family:'Tajawal',sans-serif;font-size:0.95rem;outline:none;transition:border 0.3s;" onfocus="this.style.borderColor='${p.accent}'" onblur="this.style.borderColor='#e2e8f0'"/>
<textarea placeholder="رسالتك" rows="5" style="padding:0.9rem 1.2rem;border:1.5px solid #e2e8f0;border-radius:0.75rem;font-family:'Tajawal',sans-serif;font-size:0.95rem;outline:none;resize:vertical;transition:border 0.3s;" onfocus="this.style.borderColor='${p.accent}'" onblur="this.style.borderColor='#e2e8f0'"></textarea>
<button type="button" class="btn-primary" style="width:100%;">إرسال الرسالة</button>
</form>
</div>
<div style="display:flex;flex-direction:column;gap:1.5rem;">
<div style="display:flex;align-items:center;gap:1rem;"><div style="width:48px;height:48px;border-radius:0.75rem;background:${p.accent}15;color:${p.accent};display:flex;align-items:center;justify-content:center;flex-shrink:0;">${lucideIcons.phone}</div><div><div style="font-family:'Cairo',sans-serif;font-weight:700;color:#0f172a;">الهاتف</div><div style="font-family:'Tajawal',sans-serif;color:#64748b;direction:ltr;">+966 55 123 4567</div></div></div>
<div style="display:flex;align-items:center;gap:1rem;"><div style="width:48px;height:48px;border-radius:0.75rem;background:${p.accent}15;color:${p.accent};display:flex;align-items:center;justify-content:center;flex-shrink:0;">${lucideIcons.mail}</div><div><div style="font-family:'Cairo',sans-serif;font-weight:700;color:#0f172a;">البريد الإلكتروني</div><div style="font-family:'Tajawal',sans-serif;color:#64748b;">info@example.com</div></div></div>
<div style="display:flex;align-items:center;gap:1rem;"><div style="width:48px;height:48px;border-radius:0.75rem;background:${p.accent}15;color:${p.accent};display:flex;align-items:center;justify-content:center;flex-shrink:0;">${lucideIcons.mapPin}</div><div><div style="font-family:'Cairo',sans-serif;font-weight:700;color:#0f172a;">العنوان</div><div style="font-family:'Tajawal',sans-serif;color:#64748b;">الرياض، المملكة العربية السعودية</div></div></div>
</div>
</div>
</div>
</section>

<footer style="background:#0f172a;color:#94a3b8;padding:3rem 2rem;text-align:center;">
<div class="container">
<div style="font-family:'Cairo',sans-serif;font-weight:800;font-size:1.5rem;color:#fff;margin-bottom:1rem;">${brandName}</div>
<p style="font-family:'Tajawal',sans-serif;max-width:500px;margin:0 auto 1.5rem;line-height:1.8;">${p.heroSubtitle.substring(0, 80)}...</p>
<div style="display:flex;justify-content:center;gap:1.5rem;margin-bottom:1.5rem;font-family:'Tajawal',sans-serif;font-size:0.9rem;flex-wrap:wrap;">
<a href="#services" style="color:#94a3b8;">خدماتنا</a>
<a href="#gallery" style="color:#94a3b8;">أعمالنا</a>
<a href="#testimonials" style="color:#94a3b8;">آراء العملاء</a>
<a href="#contact" style="color:#94a3b8;">تواصل معنا</a>
</div>
<div style="border-top:1px solid #1e293b;padding-top:1.5rem;font-size:0.85rem;font-family:'Tajawal',sans-serif;">
&copy; 2026 جميع الحقوق محفوظة | صُنع بواسطة ArabyWeb.net
</div>
</div>
</footer>

</body></html>`;
}
