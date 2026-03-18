interface ArabyLogoProps {
  size?: number;
  className?: string;
  spinning?: boolean;
  pulse?: boolean;
}

export default function ArabyLogo({ size = 36, className = "", spinning = false, pulse = false }: ArabyLogoProps) {
  const animClass = spinning
    ? "animate-spin"
    : pulse
    ? "animate-pulse"
    : "";

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${animClass} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="ArabyWeb Logo"
      >
        <defs>
          <linearGradient id="aw-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="60%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#86efac" />
          </linearGradient>
          <linearGradient id="aw-ain-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
          <clipPath id="aw-circle-clip">
            <circle cx="50" cy="50" r="44" />
          </clipPath>
        </defs>

        {/* Outer ring — double stroke */}
        <circle cx="50" cy="50" r="47" fill="none" stroke="#bbf7d0" strokeWidth="1" opacity="0.5" />
        <circle cx="50" cy="50" r="44" fill="none" stroke="url(#aw-ring-grad)" strokeWidth="3.5" />

        {/* Globe grid (clipped inside circle) */}
        <g clipPath="url(#aw-circle-clip)" opacity="0.45">
          {/* Globe outer circle */}
          <circle cx="56" cy="52" r="28" fill="none" stroke="#4ade80" strokeWidth="1.8" />
          {/* Equator */}
          <ellipse cx="56" cy="52" rx="28" ry="11" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          {/* Upper latitude */}
          <ellipse cx="56" cy="44" rx="22" ry="8" fill="none" stroke="#4ade80" strokeWidth="1.2" />
          {/* Vertical meridian */}
          <line x1="56" y1="24" x2="56" y2="80" stroke="#4ade80" strokeWidth="1.5" />
          {/* Horizontal center */}
          <line x1="28" y1="52" x2="84" y2="52" stroke="#4ade80" strokeWidth="1.5" />
        </g>

        {/* Arabic ع glyph — main mark */}
        <text
          x="22"
          y="73"
          fontSize="60"
          fontFamily="Cairo, Tajawal, 'Noto Naskh Arabic', serif"
          fontWeight="900"
          fill="url(#aw-ain-grad)"
          dominantBaseline="auto"
          letterSpacing="-2"
        >
          ع
        </text>

        {/* Cursor arrow */}
        <g transform="translate(57, 57)">
          <path
            d="M0 0 L14 14 L10 15 L8 22 L5 15 L-2 17 Z"
            fill="#16a34a"
            stroke="#fff"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </span>
  );
}

/* Spinning logo used during AI thinking — shows a orbit-style rotation */
export function ArabyLogoThinking({ size = 32 }: { size?: number }) {
  return (
    <span className="inline-flex items-center justify-center relative shrink-0" style={{ width: size, height: size }}>
      {/* Rotating outer ring */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="absolute inset-0 animate-spin"
        style={{ animationDuration: "1.6s", animationTimingFunction: "linear" }}
      >
        <defs>
          <linearGradient id="aw-spin-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0" />
            <stop offset="60%" stopColor="#22c55e" stopOpacity="1" />
            <stop offset="100%" stopColor="#86efac" stopOpacity="1" />
          </linearGradient>
        </defs>
        <circle
          cx="50" cy="50" r="44"
          fill="none"
          stroke="url(#aw-spin-grad)"
          strokeWidth="4"
          strokeDasharray="138 138"
          strokeLinecap="round"
        />
      </svg>

      {/* Static logo body (no outer ring — ring is above and spinning) */}
      <svg
        width={size * 0.82}
        height={size * 0.82}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        <defs>
          <linearGradient id="aw-ain-grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
          <clipPath id="aw-clip2">
            <circle cx="50" cy="50" r="44" />
          </clipPath>
        </defs>

        <g clipPath="url(#aw-clip2)" opacity="0.4">
          <circle cx="56" cy="52" r="28" fill="none" stroke="#4ade80" strokeWidth="1.8" />
          <ellipse cx="56" cy="52" rx="28" ry="11" fill="none" stroke="#4ade80" strokeWidth="1.5" />
          <line x1="56" y1="24" x2="56" y2="80" stroke="#4ade80" strokeWidth="1.5" />
          <line x1="28" y1="52" x2="84" y2="52" stroke="#4ade80" strokeWidth="1.5" />
        </g>

        <text
          x="22" y="73"
          fontSize="60"
          fontFamily="Cairo, Tajawal, 'Noto Naskh Arabic', serif"
          fontWeight="900"
          fill="url(#aw-ain-grad2)"
        >
          ع
        </text>

        <g transform="translate(57,57)">
          <path
            d="M0 0 L14 14 L10 15 L8 22 L5 15 L-2 17 Z"
            fill="#16a34a"
            stroke="#fff"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </span>
  );
}
