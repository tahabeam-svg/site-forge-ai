/**
 * ArabyWeb AI Design System — نظام التصميم المركزي
 * Single source of truth for all visual decisions.
 * The AI assembles websites using these tokens — never hardcoded values.
 */

// ═══════════════════════════════════════════════════════════════
// 1. DESIGN TOKENS — قواعد التصميم
// ═══════════════════════════════════════════════════════════════

export const TOKENS = {
  // ── Spacing ────────────────────────────────────────────────
  space: {
    "1": "0.25rem",   // 4px
    "2": "0.5rem",    // 8px
    "3": "0.75rem",   // 12px
    "4": "1rem",      // 16px
    "5": "1.25rem",   // 20px
    "6": "1.5rem",    // 24px
    "8": "2rem",      // 32px
    "10": "2.5rem",   // 40px
    "12": "3rem",     // 48px
    "16": "4rem",     // 64px
    "20": "5rem",     // 80px
    "24": "6rem",     // 96px
    "32": "8rem",     // 128px
  },

  // ── Border Radius ──────────────────────────────────────────
  radius: {
    sm:     "0.5rem",    // inputs, small elements
    md:     "0.85rem",   // medium cards
    lg:     "1.25rem",   // buttons, badges
    xl:     "1.75rem",   // cards
    "2xl":  "2rem",      // panels, form cards
    "3xl":  "2.5rem",    // large panels
    full:   "9999px",    // pills
    button: "12px",      // MANDATORY for all buttons
    card:   "1.75rem",   // MANDATORY for all cards
    icon:   "0.875rem",  // icon boxes
  },

  // ── Shadows ────────────────────────────────────────────────
  shadow: {
    xs:     "0 1px 4px rgba(0,0,0,0.06)",
    sm:     "0 2px 10px rgba(0,0,0,0.08)",
    md:     "0 8px 24px rgba(0,0,0,0.10)",
    lg:     "0 20px 60px rgba(0,0,0,0.12)",
    xl:     "0 40px 100px rgba(0,0,0,0.15)",
    card:   "0 4px 20px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
    btn:    "0 6px 16px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.15)",
    btnHov: "0 12px 28px rgba(0,0,0,0.20), 0 4px 8px rgba(0,0,0,0.12)",
    contact:"0 40px 100px rgba(0,0,0,0.12)",
  },

  // ── Typography ─────────────────────────────────────────────
  font: {
    xs:      "0.72rem",
    sm:      "0.82rem",
    base:    "0.97rem",
    md:      "1rem",
    lg:      "1.125rem",
    xl:      "1.25rem",
    "2xl":   "1.5rem",
    "3xl":   "1.875rem",
    "4xl":   "2.25rem",
    "5xl":   "3rem",
    hero:    "clamp(2.4rem,5vw,4rem)",
    display: "clamp(3rem,6vw,5rem)",
  },

  weight: {
    normal:    "400",
    medium:    "500",
    semibold:  "600",
    bold:      "700",
    extrabold: "800",
    black:     "900",
  },

  leading: {
    tight:   "1.2",
    snug:    "1.4",
    normal:  "1.65",
    relaxed: "1.85",
    loose:   "2.0",
  },

  // ── Transitions ────────────────────────────────────────────
  ease: {
    fast:   "0.15s ease",
    base:   "0.25s ease",
    slow:   "0.35s ease",
    spring: "0.35s cubic-bezier(.22,1,.36,1)",
    smooth: "0.45s cubic-bezier(.22,1,.36,1)",
  },
} as const;

// ═══════════════════════════════════════════════════════════════
// 2. LAYOUT RULES — قواعد التخطيط
// ═══════════════════════════════════════════════════════════════

export const LAYOUT = {
  containerMax:    "1280px",
  containerPadH:   "2rem",
  containerPadHSm: "1.25rem",
  sectionPadV:     "6rem",
  sectionPadVMd:   "4.5rem",
  sectionPadVSm:   "3.5rem",
  navHeight:       "72px",
  cardGap:         "1.5rem",
  cardGapLg:       "2rem",
  gridCols3:       "repeat(3, 1fr)",
  gridCols2:       "repeat(2, 1fr)",
} as const;

// ═══════════════════════════════════════════════════════════════
// 3. BUTTON SYSTEM — نظام الأزرار
// ═══════════════════════════════════════════════════════════════

export function buildButtonCSS(primary: string, accent: string, fontBody: string): string {
  return `
/* ════ BUTTON SYSTEM ════ */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;padding:14px 28px;border-radius:${TOKENS.radius.button};font-family:${fontBody};font-size:${TOKENS.font.md};font-weight:${TOKENS.weight.bold};cursor:pointer;white-space:nowrap;text-decoration:none;border:2px solid transparent;transition:transform ${TOKENS.ease.spring},box-shadow ${TOKENS.ease.spring},background ${TOKENS.ease.base};}
.btn:hover{transform:translateY(-2px);}
.btn:active{transform:translateY(1px);}

/* Primary — filled gradient */
.btn-primary{background:linear-gradient(135deg,${primary} 0%,${accent} 100%);color:#fff;box-shadow:${TOKENS.shadow.btn};border-color:transparent;}
.btn-primary:hover{box-shadow:0 12px 32px ${primary}55,0 4px 8px rgba(0,0,0,0.12),inset 0 1px 0 rgba(255,255,255,0.15);}

/* Secondary — white with color border */
.btn-secondary{background:#fff;color:${primary};border-color:${primary}40;box-shadow:${TOKENS.shadow.sm};}
.btn-secondary:hover{background:${primary}08;border-color:${primary};box-shadow:${TOKENS.shadow.md};}

/* Outline — transparent with color border */
.btn-outline{background:transparent;color:#fff;border-color:rgba(255,255,255,0.35);box-shadow:none;}
.btn-outline:hover{background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.7);}

/* Ghost — white bg transparent variant */
.btn-ghost{background:rgba(255,255,255,0.12);color:#fff;border-color:rgba(255,255,255,0.2);backdrop-filter:blur(8px);}
.btn-ghost:hover{background:rgba(255,255,255,0.22);border-color:rgba(255,255,255,0.5);}

/* Sizes */
.btn-sm{padding:10px 20px;font-size:${TOKENS.font.sm};}
.btn-lg{padding:16px 36px;font-size:${TOKENS.font.lg};border-radius:14px;}
.btn-full{width:100%;}
`.trim();
}

// ═══════════════════════════════════════════════════════════════
// 4. ICON SYSTEM — نظام الأيقونات
// ═══════════════════════════════════════════════════════════════

// Inline SVG registry — no external CDN dependency
export const ICON_SVG: Record<string, string> = {
  // Services & Business
  star:          `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  check:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
  award:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
  shield:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  zap:           `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  target:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  trending_up:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  clock:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  // Food & Restaurant
  utensils:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="2" x2="3" y2="22"/><path d="M17 2a5 5 0 0 1 5 5v3H12V5a3 3 0 0 1 3-3h2z"/><line x1="17" y1="10" x2="17" y2="22"/></svg>`,
  coffee:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
  package:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
  // Health & Medical
  heart:         `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  activity:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  stethoscope:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>`,
  // Beauty & Care
  scissors:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`,
  sparkles:      `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-1 3-3 5-6 6 3 1 5 3 6 6 1-3 3-5 6-6-3-1-5-3-6-6z"/><path d="M5 13c-.7 2-2 3.3-4 4 2 .7 3.3 2 4 4 .7-2 2-3.3 4-4-2-.7-3.3-2-4-4z"/><path d="M19 3c-.7 2-2 3.3-4 4 2 .7 3.3 2 4 4 .7-2 2-3.3 4-4-2-.7-3.3-2-4-4z"/></svg>`,
  // Education
  book:          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  graduation:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 10 12 5 2 10 12 15 22 10"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>`,
  // Technology
  code:          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  monitor:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  smartphone:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  // Real Estate
  home:          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  building:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>`,
  key:           `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/></svg>`,
  // General
  users:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  settings:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  map_pin:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  truck:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  phone:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 18.9a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.07 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.72-.72a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  globe:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  leaf:          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 5-8 5z"/></svg>`,
  fire:          `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.9 3.4c-.4-1.3-1.5-2.2-2.8-2.4-.2 0-.4.1-.5.3s0 .4.1.5C10.6 2.6 11 3.4 11 4.3c0 1.5-1.2 2.7-2.7 2.7-.5 0-1-.1-1.4-.4-.2-.1-.4-.1-.6 0-.2.1-.3.3-.3.5.4 3.2 3.1 5.5 6.3 5.5 1.9 0 3.6-.8 4.8-2.1.2-.2.2-.5 0-.7-1.4-1.5-2.2-3.6-1.8-5.6l.2-.8z"/><path d="M15.5 9.5c-.4-1.5-1.5-2.7-3-3.2-.3-.1-.6 0-.8.3-.1.3 0 .6.2.8.5.5.8 1.2.8 1.9 0 1.5-1.2 2.8-2.7 2.8-.5 0-1-.2-1.5-.5-.2-.2-.5-.2-.7 0-.3.2-.4.5-.3.8.7 2.3 2.8 4 5.3 4 3.1 0 5.7-2.6 5.7-5.7 0-1.8-.9-3.4-2.3-4.3-.1-.1-.3-.1-.4 0-.1.1-.2.2-.2.4.1.9 0 1.7-.2 2.4l.1.3z"/></svg>`,
  // Cleaning
  droplet:       `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
  // Photography
  camera:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  // Finance
  dollar:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6"/></svg>`,
  // Events
  calendar:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  music:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  // Automotive
  car:           `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`,
  // Hotel
  wine:          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 22h14M4.93 4.93c-.39 3.89 1.02 7.12 3.07 9.35 2.84 3.1 6 2.72 6 5.72"/><path d="M5 2h14l-3 8H8L5 2z"/></svg>`,
};

// Map from old fa-* class names to ICON_SVG keys
export const FA_TO_ICON: Record<string, string> = {
  "fa-utensils":      "utensils",
  "fa-wine-glass":    "wine",
  "fa-star":          "star",
  "fa-clock":         "clock",
  "fa-fire":          "fire",
  "fa-leaf":          "leaf",
  "fa-heart":         "heart",
  "fa-stethoscope":   "stethoscope",
  "fa-activity":      "activity",
  "fa-scissors":      "scissors",
  "fa-sparkles":      "sparkles",
  "fa-camera":        "camera",
  "fa-book":          "book",
  "fa-graduation-cap":"graduation",
  "fa-code":          "code",
  "fa-laptop":        "monitor",
  "fa-mobile":        "smartphone",
  "fa-home":          "home",
  "fa-building":      "building",
  "fa-key":           "key",
  "fa-truck":         "truck",
  "fa-droplet":       "droplet",
  "fa-dollar-sign":   "dollar",
  "fa-calendar":      "calendar",
  "fa-music":         "music",
  "fa-car":           "car",
  "fa-briefcase":     "settings",
  "fa-users":         "users",
  "fa-globe":         "globe",
  "fa-award":         "award",
  "fa-shield":        "shield",
  "fa-zap":           "zap",
  "fa-target":        "target",
  "fa-trending-up":   "trending_up",
  "fa-map-pin":       "map_pin",
  "fa-phone":         "phone",
};

export function getIconSVG(iconKeyOrFaClass: string): string {
  const key = FA_TO_ICON[iconKeyOrFaClass] || iconKeyOrFaClass;
  return ICON_SVG[key] || ICON_SVG["star"];
}

// ═══════════════════════════════════════════════════════════════
// 5. QUALITY CHECKER — فاحص الجودة
// ═══════════════════════════════════════════════════════════════

export interface QualityReport {
  passed:   boolean;
  score:    number;   // 0–100
  issues:   string[];
  warnings: string[];
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const srgb = [r, g, b].map(c => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function contrastRatio(hex1: string, hex2 = "#ffffff"): number {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  if (!c1 || !c2) return 1;
  const l1 = relativeLuminance(...c1);
  const l2 = relativeLuminance(...c2);
  const light = Math.max(l1, l2);
  const dark  = Math.min(l1, l2);
  return (light + 0.05) / (dark + 0.05);
}

function isColorTooLight(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  return relativeLuminance(...rgb) > 0.55;
}

const GENERIC_HERO_PATTERNS = [
  "نقدم أفضل الخدمات", "مرحباً بكم في موقع", "خدمات متميزة",
  "أهلاً وسهلاً", "موقعنا الإلكتروني", "نحن متخصصون في",
  "we provide the best", "welcome to our website",
];

export function runQualityCheck(content: {
  ar: {
    hero_title: string;
    hero_subtitle: string;
    about_text: string;
    services: { title: string; desc: string }[];
    cta_text: string;
    contact_description: string;
  };
  primary_color: string;
  accent_color:  string;
  testimonials?: { name: string; role_ar: string; text_ar: string }[];
}): QualityReport {
  const issues:   string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // ── 1. Hero Title ──────────────────────────────────────────
  const title = (content.ar?.hero_title || "").trim();
  if (title.length < 8) {
    issues.push("Hero title too short (< 8 chars)");
    score -= 15;
  } else if (GENERIC_HERO_PATTERNS.some(p => title.toLowerCase().includes(p.toLowerCase()))) {
    warnings.push("Hero title is generic — should be a value proposition");
    score -= 8;
  }

  // ── 2. About Text ──────────────────────────────────────────
  const aboutText = (content.ar?.about_text || "").trim();
  if (aboutText.length < 60) {
    warnings.push(`About text too short (${aboutText.length} chars, recommend ≥60)`);
    score -= 7;
  }

  // ── 3. Services Completeness ───────────────────────────────
  const services = content.ar?.services || [];
  if (services.length < 6) {
    issues.push(`Only ${services.length}/6 services generated`);
    score -= 20;
  }
  const weakDescs = services.filter(s => (s.desc || "").trim().length < 20);
  if (weakDescs.length > 0) {
    warnings.push(`${weakDescs.length} service descriptions are too short (< 20 chars)`);
    score -= weakDescs.length * 3;
  }

  // ── 4. Testimonials ────────────────────────────────────────
  const testis = content.testimonials || [];
  if (testis.length < 3) {
    issues.push(`Only ${testis.length}/3 testimonials generated`);
    score -= 18;
  } else {
    const shortTestis = testis.filter(t => (t.text_ar || "").trim().length < 40);
    if (shortTestis.length > 0) {
      warnings.push(`${shortTestis.length} testimonials are too short (< 40 chars)`);
      score -= shortTestis.length * 5;
    }
  }

  // ── 5. Color Contrast ──────────────────────────────────────
  const primary = content.primary_color || "#000000";
  if (isColorTooLight(primary)) {
    issues.push(`Primary color ${primary} is too light for text/backgrounds — use a deeper shade`);
    score -= 15;
  }
  const contrast = contrastRatio(primary);
  if (contrast < 2.0) {
    warnings.push(`Primary color ${primary} has low contrast on white (${contrast.toFixed(1)}:1)`);
    score -= 8;
  }

  // ── 6. CTA Text ────────────────────────────────────────────
  const cta = (content.ar?.cta_text || "").trim();
  if (cta.length < 3) {
    issues.push("CTA button text is missing");
    score -= 10;
  }

  // ── 7. Contact Description ─────────────────────────────────
  const contactDesc = (content.ar?.contact_description || "").trim();
  if (contactDesc.length < 15) {
    warnings.push("Contact description too short");
    score -= 5;
  }

  score = Math.max(0, Math.min(100, score));
  const passed = issues.length === 0 && score >= 65;

  return { passed, score, issues, warnings };
}

// ═══════════════════════════════════════════════════════════════
// 6. COMPONENT CSS BUILDER — بناء CSS للمكونات
// ═══════════════════════════════════════════════════════════════

export function buildComponentCSS(opts: {
  primary: string;
  accent:  string;
  dark:    string;
  dir:     "rtl" | "ltr";
  fontHeading: string;
  fontBody:    string;
}): string {
  const { primary, accent, dark, dir, fontHeading, fontBody } = opts;
  const T = TOKENS;
  const L = LAYOUT;

  return `
/* ════ ArabyWeb Design System CSS ════ */
/* Tokens: spacing=${T.space["6"]}, radius-card=${T.radius.card}, shadow-card=${T.shadow.card} */

/* ── Base Reset & Layout Rules ── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{overflow-x:hidden;font-family:${fontBody};color:#1e293b;background:#fff;}
img{max-width:100%;height:auto;display:block;}
a{text-decoration:none;}
input,textarea,select,button{font:inherit;}
[class*="grid"]>*,[class*="-grid"]>*{min-width:0;overflow-wrap:break-word;word-break:break-word;}

/* ── Container ── */
.aw-container{max-width:${L.containerMax};margin:0 auto;padding:0 ${L.containerPadH};}

/* ── Section Spacing ── */
.aw-section{padding:${L.sectionPadV} 0;}
.bg-dark{background:linear-gradient(170deg,${dark} 0%,#080f1e 100%);}
.bg-light{background:linear-gradient(160deg,#f8fafc 0%,#f0f4ff 100%);}

/* ── Section Headings ── */
.sec-head{text-align:center;margin-bottom:${T.space["16"]};}
.eyebrow{font-size:${T.font.xs};font-weight:${T.weight.extrabold};text-transform:uppercase;letter-spacing:3px;display:block;margin-bottom:${T.space["3"]};}
.sec-title{font-family:${fontHeading};font-size:clamp(1.75rem,3.5vw,2.6rem);font-weight:${T.weight.black};line-height:${T.leading.tight};letter-spacing:-0.025em;margin-bottom:${T.space["4"]};}
.title-line{width:60px;height:4px;background:linear-gradient(90deg,${primary},${accent});border-radius:2px;margin-top:${T.space["4"]};}
.title-line.center{margin:${T.space["4"]} auto 0;}

/* ── Service Cards Component ── */
.services-grid{display:grid;grid-template-columns:${L.gridCols3};gap:${L.cardGap};}
.service-card{background:#fff;border:1px solid #e8eef8;border-radius:${T.radius.card};padding:${T.space["10"]} ${T.space["8"]};transition:transform ${T.ease.spring},box-shadow ${T.ease.spring},border-color ${T.ease.base};position:relative;overflow:hidden;}
.service-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,${primary}06,${accent}04);opacity:0;transition:opacity ${T.ease.base};}
.service-card:hover{transform:translateY(-8px);box-shadow:${T.shadow.lg};border-color:${primary}30;}
.service-card:hover::before{opacity:1;}
.service-icon-wrap{width:60px;height:60px;border-radius:${T.radius.icon};background:linear-gradient(135deg,${primary}18,${accent}12);display:flex;align-items:center;justify-content:center;margin-bottom:${T.space["6"]};transition:all ${T.ease.spring};}
.service-icon-wrap svg{width:28px;height:28px;color:${primary};stroke:${primary};fill:${primary};flex-shrink:0;}
.service-card:hover .service-icon-wrap{background:linear-gradient(135deg,${primary},${accent});transform:scale(1.1);}
.service-card:hover .service-icon-wrap svg{color:#fff;stroke:#fff;fill:#fff;}
.svc-title{font-family:${fontHeading};font-size:${T.font.xl};font-weight:${T.weight.bold};color:#0f172a;margin-bottom:${T.space["3"]};line-height:${T.leading.snug};}
.svc-desc{color:#64748b;font-size:${T.font.base};line-height:${T.leading.relaxed};}

/* ── Testimonials Component ── */
.testi-grid{display:grid;grid-template-columns:${L.gridCols3};gap:${T.space["6"]};}
.testi-card{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.10);border-top:3px solid transparent;border-image:linear-gradient(90deg,${primary},${accent}) 1;border-radius:0 0 ${T.radius.xl} ${T.radius.xl};padding:${T.space["8"]} ${T.space["6"]} ${T.space["6"]};transition:transform ${T.ease.spring},background ${T.ease.base},box-shadow ${T.ease.spring};display:flex;flex-direction:column;}
.testi-card:hover{background:rgba(255,255,255,0.10);transform:translateY(-8px);box-shadow:0 24px 60px rgba(0,0,0,0.25);}
.testi-top-row{display:flex;align-items:center;gap:${T.space["4"]};margin-bottom:${T.space["5"]};}
.testi-avatar{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,${primary},${accent});color:#fff;display:flex;align-items:center;justify-content:center;font-family:${fontHeading};font-size:${T.font["2xl"]};font-weight:${T.weight.black};flex-shrink:0;box-shadow:0 4px 16px ${primary}55;}
.testi-meta{flex:1;min-width:0;}
.testi-name{color:#fff;font-weight:${T.weight.bold};font-size:${T.font.md};letter-spacing:-0.01em;}
.testi-role{color:${accent};font-size:${T.font.sm};font-weight:${T.weight.semibold};margin-top:${T.space["1"]};letter-spacing:0.3px;}
.testi-stars{display:flex;gap:3px;margin-bottom:${T.space["4"]};}
.testi-text{color:rgba(255,255,255,0.88);font-size:${T.font.base};line-height:${T.leading.relaxed};flex:1;}

/* ── CTA Section Component ── */
.cta-section{background:linear-gradient(135deg,${primary} 0%,${accent} 100%);position:relative;overflow:hidden;}
.cta-blob{position:absolute;border-radius:50%;pointer-events:none;}
.cta-blob-1{width:600px;height:600px;background:rgba(255,255,255,0.06);top:-250px;${dir==="rtl"?"right:-200px":"left:-200px"};}
.cta-blob-2{width:400px;height:400px;background:rgba(255,255,255,0.05);bottom:-180px;${dir==="rtl"?"left:-100px":"right:-100px"};}
.cta-inner{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:${T.space["8"]};flex-wrap:wrap;}
.cta-text-block{flex:1;min-width:200px;}
.cta-heading{font-family:${fontHeading};font-size:clamp(1.6rem,3vw,2.4rem);font-weight:${T.weight.black};color:#fff;line-height:${T.leading.tight};letter-spacing:-0.02em;margin-bottom:${T.space["3"]};}
.cta-sub{color:rgba(255,255,255,0.75);font-size:${T.font.lg};line-height:${T.leading.relaxed};}
.cta-actions{display:flex;gap:${T.space["4"]};flex-shrink:0;flex-wrap:wrap;}

/* ── Contact Section Component ── */
.contact-section{background:linear-gradient(160deg,#f0f4ff 0%,#f8fafb 100%);padding:${L.sectionPadV} 0!important;}
.contact-panel{display:grid;grid-template-columns:1fr 1.25fr;gap:0;border-radius:${T.radius["3xl"]};overflow:hidden;box-shadow:${T.shadow.contact};}
.contact-info-panel{background:linear-gradient(160deg,${primary} 0%,${accent} 100%);padding:${T.space["12"]};position:relative;overflow:hidden;display:flex;align-items:stretch;}
.cip-blob1{position:absolute;width:360px;height:360px;border-radius:50%;background:rgba(255,255,255,0.08);top:-120px;${dir==="rtl"?"right:-120px":"left:-120px"};pointer-events:none;}
.cip-blob2{position:absolute;width:250px;height:250px;border-radius:50%;background:rgba(255,255,255,0.06);bottom:-80px;${dir==="rtl"?"left:-60px":"right:-60px"};pointer-events:none;}
.cip-inner{position:relative;z-index:1;display:flex;flex-direction:column;width:100%;}
.cip-eyebrow{font-size:${T.font.xs};font-weight:${T.weight.extrabold};text-transform:uppercase;letter-spacing:3px;color:rgba(255,255,255,0.65);margin-bottom:${T.space["3"]};display:block;}
.cip-title{font-family:${fontHeading};font-size:${T.font["3xl"]};font-weight:${T.weight.black};color:#fff;line-height:${T.leading.tight};letter-spacing:-0.02em;margin-bottom:${T.space["4"]};}
.cip-desc{color:rgba(255,255,255,0.75);font-size:${T.font.base};line-height:${T.leading.relaxed};margin-bottom:${T.space["8"]};flex:1;}
.cip-details{display:flex;flex-direction:column;gap:0;}
.cip-row{display:flex;align-items:flex-start;gap:${T.space["4"]};padding:${T.space["4"]} 0;border-bottom:1px solid rgba(255,255,255,0.12);}
.cip-row:last-child{border-bottom:none;}
.cip-icon-box{width:40px;height:40px;border-radius:${T.radius.md};background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;}
.cip-row-label{font-size:${T.font.xs};font-weight:${T.weight.extrabold};text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.55);margin-bottom:${T.space["1"]};}
.cip-row-val{color:#fff;font-size:${T.font.base};font-weight:${T.weight.semibold};text-decoration:none;transition:opacity ${T.ease.base};}
.cip-row-val:hover{opacity:0.8;}
.wa-btn{display:inline-flex;align-items:center;gap:${T.space["3"]};background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);border:1.5px solid rgba(255,255,255,0.35);color:#fff;padding:${T.space["4"]} ${T.space["6"]};border-radius:${T.radius.full};font-weight:${T.weight.bold};font-size:${T.font.base};margin-top:${T.space["8"]};transition:all ${T.ease.spring};cursor:pointer;}
.wa-btn:hover{background:#25D366;border-color:#25D366;box-shadow:0 12px 32px rgba(37,211,102,0.45);transform:translateY(-2px);}
.contact-form-card{background:#fff;padding:${T.space["12"]};display:flex;flex-direction:column;}
.form-card-head{margin-bottom:${T.space["8"]};padding-bottom:${T.space["6"]};border-bottom:2px solid #f1f5f9;}
.form-title{font-family:${fontHeading};font-size:${T.font["2xl"]};font-weight:${T.weight.black};color:#0f172a;margin-bottom:${T.space["2"]};letter-spacing:-0.02em;}
.form-subtitle{color:#94a3b8;font-size:${T.font.sm};}
.contact-form{display:flex;flex-direction:column;flex:1;}
.form-field-group{margin-bottom:${T.space["5"]};}
.field-label{display:block;font-size:${T.font.sm};font-weight:${T.weight.bold};color:#475569;margin-bottom:${T.space["2"]};letter-spacing:0.3px;}
.form-row-2{display:grid;grid-template-columns:1fr 1fr;gap:${T.space["4"]};}
.form-row-2 .form-field-group{margin-bottom:${T.space["5"]};}
.fi-wrap{position:relative;}
.fi-icon{position:absolute;top:50%;transform:translateY(-50%);inset-inline-start:14px;color:#94a3b8;pointer-events:none;display:flex;align-items:center;line-height:0;transition:color ${T.ease.base};}
.fi-icon-top{top:15px;transform:none;}
.fi-wrap:focus-within .fi-icon{color:${primary};}
.form-inp{width:100%;padding:${T.space["3"]} ${T.space["4"]};border:2px solid #e8eef8;border-radius:${T.radius.md};font-size:${T.font.base};color:#1e293b;background:#fff;transition:border-color ${T.ease.base},box-shadow ${T.ease.base};outline:none;}
.form-inp:focus{border-color:${primary};box-shadow:0 0 0 4px ${primary}15;}
.fi-inp{padding-inline-start:40px!important;}
.form-ta{resize:vertical;min-height:110px;display:block;}
.form-submit{width:100%;padding:${T.space["4"]} ${T.space["8"]};background:linear-gradient(135deg,${primary} 0%,${accent} 100%);color:#fff;border:none;border-radius:${T.radius.lg};font-size:${T.font.md};font-weight:${T.weight.extrabold};cursor:pointer;box-shadow:0 8px 24px ${primary}40,inset 0 1px 0 rgba(255,255,255,0.2);transition:transform ${T.ease.spring},box-shadow ${T.ease.spring};letter-spacing:0.3px;margin-top:${T.space["2"]};}
.form-submit:hover{transform:translateY(-2px);box-shadow:0 16px 36px ${primary}55,inset 0 1px 0 rgba(255,255,255,0.2);}
.form-submit:active{transform:translateY(1px);}

/* ── Footer Component ── */
.aw-footer{background:linear-gradient(175deg,${dark} 0%,#050c1a 100%);position:relative;overflow:hidden;}
.aw-footer::after{content:'';position:absolute;width:900px;height:900px;border-radius:50%;background:radial-gradient(circle,${primary}0d 0%,transparent 65%);bottom:-400px;${dir==="rtl"?"left:-200px":"right:-200px"};pointer-events:none;}
.footer-cta-strip{position:relative;overflow:hidden;border-bottom:1px solid rgba(255,255,255,0.06);}
.footer-cta-strip-bg{position:absolute;inset:0;background:linear-gradient(135deg,${primary}22 0%,${accent}18 100%);pointer-events:none;}
.footer-cta-inner{display:flex;align-items:center;justify-content:space-between;gap:${T.space["8"]};padding:${T.space["12"]} 0;flex-wrap:wrap;position:relative;z-index:1;}
.fcta-text{flex:1;min-width:200px;}
.fcta-title{font-family:${fontHeading};font-size:${T.font["3xl"]};font-weight:${T.weight.black};color:#fff;letter-spacing:-0.02em;margin-bottom:${T.space["2"]};}
.fcta-sub{color:rgba(255,255,255,0.55);font-size:${T.font.base};}
.fcta-btn{display:inline-flex;align-items:center;gap:${T.space["2"]};background:linear-gradient(135deg,${primary},${accent});color:#fff;padding:${T.space["4"]} ${T.space["8"]};border-radius:${T.radius.button};font-weight:${T.weight.extrabold};font-size:${T.font.md};white-space:nowrap;box-shadow:0 8px 24px ${primary}45,inset 0 1px 0 rgba(255,255,255,0.15);transition:transform ${T.ease.spring},box-shadow ${T.ease.spring};flex-shrink:0;}
.fcta-btn:hover{transform:translateY(-2px);box-shadow:0 16px 36px ${primary}60,inset 0 1px 0 rgba(255,255,255,0.15);}
.footer-main{padding:${T.space["16"]} 0 ${T.space["12"]};}
.footer-wrap{display:grid;grid-template-columns:2fr 1fr 1fr;gap:${T.space["16"]};}
.footer-logo{font-family:${fontHeading};font-size:${T.font["2xl"]};font-weight:${T.weight.black};background:linear-gradient(135deg,#fff 20%,${accent} 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-0.02em;display:block;margin-bottom:${T.space["4"]};}
.footer-tagline{color:rgba(255,255,255,0.38);font-size:${T.font.base};line-height:${T.leading.relaxed};max-width:270px;margin-bottom:${T.space["6"]};}
.footer-socials{display:flex;align-items:center;gap:${T.space["3"]};flex-wrap:wrap;}
.social-icon{width:40px;height:40px;border-radius:${T.radius.md};background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.09);color:rgba(255,255,255,0.45);display:flex;align-items:center;justify-content:center;transition:all ${T.ease.spring};}
.social-icon:hover{border-color:transparent;color:#fff;transform:translateY(-3px);}
.si-wa:hover{background:#25D366;box-shadow:0 8px 20px rgba(37,211,102,0.35);}
.si-ig:hover{background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);box-shadow:0 8px 20px rgba(220,39,67,0.35);}
.si-x:hover{background:#000;box-shadow:0 8px 20px rgba(0,0,0,0.4);}
.si-tt:hover{background:#000;box-shadow:0 8px 20px rgba(0,0,0,0.4);}
.si-li:hover{background:#0077b5;box-shadow:0 8px 20px rgba(0,119,181,0.35);}
.fl-heading{font-size:${T.font.xs};font-weight:${T.weight.extrabold};text-transform:uppercase;letter-spacing:3px;color:${accent};margin-bottom:${T.space["6"]};}
.footer-links-col,.footer-contact-col{display:flex;flex-direction:column;gap:${T.space["4"]};}
.footer-links-col a{color:rgba(255,255,255,0.4);font-size:${T.font.base};transition:color ${T.ease.base},padding-inline-start ${T.ease.base};display:inline-flex;align-items:center;}
.footer-links-col a:hover{color:#fff;padding-inline-start:${T.space["2"]};}
.fc-row{display:flex;align-items:center;gap:${T.space["3"]};color:rgba(255,255,255,0.4);font-size:${T.font.base};}
.fc-row svg{flex-shrink:0;opacity:0.55;}
.fc-row a,.fc-row span{color:rgba(255,255,255,0.4);transition:color ${T.ease.base};}
.fc-row a:hover{color:rgba(255,255,255,0.9);}
.footer-bottom{border-top:1px solid rgba(255,255,255,0.06);padding:${T.space["6"]} 0;}
.footer-bottom-inner{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:${T.space["3"]};}
.footer-bottom p,.footer-powered{color:rgba(255,255,255,0.2);font-size:${T.font.sm};}
`.trim();
}
