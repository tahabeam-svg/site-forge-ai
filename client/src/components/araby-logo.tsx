import logoSrc from "@assets/logog_1773800597256.png";

interface ArabyLogoProps {
  size?: number;
  className?: string;
}

export default function ArabyLogo({ size = 36, className = "" }: ArabyLogoProps) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size }}
    >
      <img
        src={logoSrc}
        alt="ArabyWeb Logo"
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "contain",
          display: "block",
        }}
        draggable={false}
      />
    </span>
  );
}

/* ─── Thinking / AI Working Indicator ───────────────────────────────────────
   Shows the logo with a continuous spinning gradient arc ring around it,
   indicating that the AI is actively working on something.
   ─────────────────────────────────────────────────────────────────────────── */
export function ArabyLogoThinking({ size = 36 }: { size?: number }) {
  const ring = size + 8;
  return (
    <span
      className="inline-flex items-center justify-center relative shrink-0"
      style={{ width: ring, height: ring }}
    >
      {/* Spinning gradient arc ring */}
      <svg
        width={ring}
        height={ring}
        viewBox={`0 0 ${ring} ${ring}`}
        className="absolute inset-0"
        style={{
          animation: "aw-spin 1.4s linear infinite",
        }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="aw-think-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#16a34a" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#86efac" stopOpacity="1" />
          </linearGradient>
        </defs>
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={ring / 2 - 2.5}
          fill="none"
          stroke="url(#aw-think-grad)"
          strokeWidth="3"
          strokeDasharray={`${Math.PI * (ring - 5) * 0.75} ${Math.PI * (ring - 5) * 0.25}`}
          strokeLinecap="round"
        />
      </svg>

      {/* Static logo image in the center */}
      <img
        src={logoSrc}
        alt="ArabyWeb"
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "contain",
          display: "block",
          position: "relative",
          zIndex: 1,
        }}
        draggable={false}
      />

      <style>{`
        @keyframes aw-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </span>
  );
}
