"use client";
import { useRef, useEffect, ReactNode, CSSProperties } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type PanelVariant =
  | "default"   // standard cyan glass
  | "buy"       // green tint — positive signal
  | "sell"      // red tint  — negative signal
  | "hold"      // amber tint — neutral signal
  | "critical"  // bright cyan — high emphasis
  | "ghost";    // near-invisible — background depth layer

export type PanelSize = "sm" | "md" | "lg" | "full";

export interface GlassPanelProps {
  children?: ReactNode;
  variant?: PanelVariant;
  size?: PanelSize;

  /** Panel header label (Share Tech Mono, ALL CAPS) */
  label?: string;

  /** Small badge text next to label e.g. "LIVE" "BETA" */
  badge?: string;
  badgeColor?: string;

  /** Whether to show the animated corner tick marks */
  corners?: boolean;

  /** Whether to show the top scanning line animation */
  scanline?: boolean;

  /** Pulsing glow on the border — binds to signal state */
  glow?: boolean;

  /** Custom CSS class */
  className?: string;

  /** Inline style overrides */
  style?: CSSProperties;

  /** Click handler */
  onClick?: () => void;

  /** Hover elevation effect */
  hoverable?: boolean;
}

// ─── Variant tokens ───────────────────────────────────────────────────────────
const VARIANT_TOKENS: Record<PanelVariant, {
  tint: string; border: string; shadow: string;
  labelColor: string; badgeBg: string; badgeText: string;
}> = {
  default: {
    tint:       "linear-gradient(135deg, rgba(0,223,251,0.05) 0%, rgba(0,152,248,0.02) 100%)",
    border:     "rgba(82,254,254,0.15)",
    shadow:     "0 0 40px rgba(0,223,251,0.10), 0 2px 0 rgba(82,254,254,0.08) inset",
    labelColor: "rgba(82,254,254,0.55)",
    badgeBg:    "rgba(0,223,251,0.12)",
    badgeText:  "#00DFFB",
  },
  buy: {
    tint:       "linear-gradient(135deg, rgba(0,255,159,0.06) 0%, rgba(0,200,120,0.02) 100%)",
    border:     "rgba(0,255,159,0.20)",
    shadow:     "0 0 40px rgba(0,255,159,0.10), 0 2px 0 rgba(0,255,159,0.08) inset",
    labelColor: "rgba(0,255,159,0.55)",
    badgeBg:    "rgba(0,255,159,0.12)",
    badgeText:  "#00FF9F",
  },
  sell: {
    tint:       "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(170,5,5,0.02) 100%)",
    border:     "rgba(239,68,68,0.22)",
    shadow:     "0 0 40px rgba(239,68,68,0.10), 0 2px 0 rgba(239,68,68,0.08) inset",
    labelColor: "rgba(239,68,68,0.55)",
    badgeBg:    "rgba(239,68,68,0.12)",
    badgeText:  "#ef4444",
  },
  hold: {
    tint:       "linear-gradient(135deg, rgba(255,107,0,0.06) 0%, rgba(251,202,3,0.02) 100%)",
    border:     "rgba(255,107,0,0.20)",
    shadow:     "0 0 40px rgba(255,107,0,0.10), 0 2px 0 rgba(255,107,0,0.08) inset",
    labelColor: "rgba(255,107,0,0.55)",
    badgeBg:    "rgba(255,107,0,0.12)",
    badgeText:  "#FF6B00",
  },
  critical: {
    tint:       "linear-gradient(135deg, rgba(0,223,251,0.10) 0%, rgba(82,254,254,0.04) 100%)",
    border:     "rgba(82,254,254,0.35)",
    shadow:     "0 0 60px rgba(0,223,251,0.20), 0 2px 0 rgba(82,254,254,0.15) inset",
    labelColor: "rgba(82,254,254,0.80)",
    badgeBg:    "rgba(82,254,254,0.15)",
    badgeText:  "#52FEFE",
  },
  ghost: {
    tint:       "transparent",
    border:     "rgba(82,254,254,0.06)",
    shadow:     "none",
    labelColor: "rgba(82,254,254,0.30)",
    badgeBg:    "rgba(82,254,254,0.06)",
    badgeText:  "rgba(82,254,254,0.5)",
  },
};

// ─── Corner tick marks ────────────────────────────────────────────────────────
function CornerTicks({ color }: { color: string }) {
  const s: CSSProperties = { position: "absolute", width: 10, height: 10, pointerEvents: "none" };
  const line: CSSProperties = { position: "absolute", background: color, borderRadius: 1 };
  const corners = [
    { outer: { top: 0, left: 0 },
      h: { top: 0, left: 0, width: 10, height: 1.5 },
      v: { top: 0, left: 0, width: 1.5, height: 10 } },
    { outer: { top: 0, right: 0 },
      h: { top: 0, right: 0, width: 10, height: 1.5 },
      v: { top: 0, right: 0, width: 1.5, height: 10 } },
    { outer: { bottom: 0, left: 0 },
      h: { bottom: 0, left: 0, width: 10, height: 1.5 },
      v: { bottom: 0, left: 0, width: 1.5, height: 10 } },
    { outer: { bottom: 0, right: 0 },
      h: { bottom: 0, right: 0, width: 10, height: 1.5 },
      v: { bottom: 0, right: 0, width: 1.5, height: 10 } },
  ];
  return (
    <>
      {corners.map((c, i) => (
        <div key={i} style={{ ...s, ...c.outer }}>
          <div style={{ ...line, ...c.h }} />
          <div style={{ ...line, ...c.v }} />
        </div>
      ))}
    </>
  );
}

// ─── Scanline animation ───────────────────────────────────────────────────────
function Scanline({ color }: { color: string }) {
  return (
    <>
      <style>{`
        @keyframes panel-scan {
          0%   { top: 0%;    opacity: 0.6; }
          80%  { opacity: 0.3; }
          100% { top: 100%;  opacity: 0; }
        }
        .panel-scanline {
          animation: panel-scan 3.5s ease-in-out infinite;
          animation-delay: var(--scan-delay, 0s);
        }
      `}</style>
      <div className="panel-scanline" style={{
        position: "absolute", left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        pointerEvents: "none", zIndex: 2,
      }} />
    </>
  );
}

// ─── Glow pulse ───────────────────────────────────────────────────────────────
function GlowPulse({ color }: { color: string }) {
  return (
    <>
      <style>{`
        @keyframes border-glow {
          0%,100% { opacity: 0.5; }
          50%     { opacity: 1.0; }
        }
        .border-glow-pulse { animation: border-glow 2s ease-in-out infinite; }
      `}</style>
      <div className="border-glow-pulse" style={{
        position: "absolute", inset: -1, borderRadius: "inherit",
        border: `1px solid ${color}`,
        boxShadow: `0 0 12px ${color}, 0 0 24px ${color}40`,
        pointerEvents: "none", zIndex: 1,
      }} />
    </>
  );
}

// ─── Specular sheen (the Liquid Glass "wet" effect) ───────────────────────────
function Sheen() {
  return (
    <div style={{
      position: "absolute", inset: 0, borderRadius: "inherit",
      background: "linear-gradient(108deg, transparent 38%, rgba(255,255,255,0.045) 50%, transparent 62%)",
      pointerEvents: "none", zIndex: 3,
    }} />
  );
}

// ─── Main GlassPanel component ────────────────────────────────────────────────
export default function GlassPanel({
  children,
  variant = "default",
  label,
  badge,
  badgeColor,
  corners = false,
  scanline = false,
  glow = false,
  className = "",
  style = {},
  onClick,
  hoverable = false,
}: GlassPanelProps) {
  const tokens = VARIANT_TOKENS[variant];
  const ref = useRef<HTMLDivElement>(null);

  // Randomise scanline phase so multiple panels don't sync
  useEffect(() => {
    if (ref.current && scanline) {
      const delay = `${(Math.random() * 3).toFixed(1)}s`;
      ref.current.style.setProperty("--scan-delay", delay);
    }
  }, [scanline]);

  const resolvedBadgeText  = badgeColor ?? tokens.badgeText;
  const resolvedBadgeBg    = tokens.badgeBg;

  return (
    <div
      ref={ref}
      className={className}
      onClick={onClick}
      style={{
        position: "relative",
        borderRadius: 12,
        background: tokens.tint,
        border: `1px solid ${tokens.border}`,
        boxShadow: tokens.shadow,
        backdropFilter: "blur(18px) saturate(140%)",
        WebkitBackdropFilter: "blur(18px) saturate(140%)",
        isolation: "isolate",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        transition: hoverable
          ? "transform 0.2s ease, box-shadow 0.2s ease"
          : undefined,
        ...(hoverable ? {} : {}),
        ...style,
      }}
      onMouseEnter={hoverable ? () => {
        if (ref.current) {
          ref.current.style.transform = "translateY(-2px)";
          ref.current.style.boxShadow = tokens.shadow.replace("0.10", "0.18");
        }
      } : undefined}
      onMouseLeave={hoverable ? () => {
        if (ref.current) {
          ref.current.style.transform = "translateY(0)";
          ref.current.style.boxShadow = tokens.shadow;
        }
      } : undefined}
    >
      {/* Layer 1: corner ticks */}
      {corners && <CornerTicks color={tokens.border} />}

      {/* Layer 2: scanline */}
      {scanline && <Scanline color={tokens.labelColor} />}

      {/* Layer 3: glow pulse on border */}
      {glow && <GlowPulse color={tokens.border} />}

      {/* Layer 4: specular sheen (always) */}
      <Sheen />

      {/* ── Content ── */}
      <div style={{ position: "relative", zIndex: 5, padding: 16 }}>
        {/* Header */}
        {(label || badge) && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            marginBottom: label ? 12 : 0,
          }}>
            {label && (
              <span style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 9, fontWeight: 400,
                color: tokens.labelColor,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                flex: 1,
              }}>{label}</span>
            )}
            {badge && (
              <span style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 8, letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: resolvedBadgeText,
                background: resolvedBadgeBg,
                border: `1px solid ${resolvedBadgeText}30`,
                padding: "2px 7px", borderRadius: 3,
                flexShrink: 0,
              }}>{badge}</span>
            )}
          </div>
        )}

        {/* Slot for children */}
        {children}
      </div>
    </div>
  );
}

// ─── Convenience sub-components ───────────────────────────────────────────────

/** Horizontal divider styled for HUD panels */
export function PanelDivider({ style }: { style?: CSSProperties }) {
  return (
    <div style={{
      height: 1,
      background: "linear-gradient(90deg, transparent, rgba(82,254,254,0.15) 30%, rgba(82,254,254,0.15) 70%, transparent)",
      margin: "12px 0",
      ...style,
    }} />
  );
}

/** Mono label + value row used inside panels */
export function PanelRow({
  label, value, valueColor, style,
}: {
  label: string; value: string | ReactNode;
  valueColor?: string; style?: CSSProperties;
}) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      alignItems: "center", marginBottom: 8, ...style,
    }}>
      <span style={{
        fontFamily: "'Rajdhani', sans-serif", fontSize: 12,
        fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
        color: "rgba(139,148,158,0.8)",
      }}>{label}</span>
      <span style={{
        fontFamily: "'Share Tech Mono', monospace", fontSize: 12,
        color: valueColor ?? "#e6edf3",
      }}>{value}</span>
    </div>
  );
}

/** Mini progress bar for use inside panels */
export function PanelBar({
  value, color = "#00DFFB", height = 3, style,
}: {
  value: number; // 0–100
  color?: string; height?: number; style?: CSSProperties;
}) {
  return (
    <div style={{
      height, background: "rgba(0,223,251,0.08)",
      borderRadius: height, overflow: "hidden",
      marginBottom: 8, ...style,
    }}>
      <div style={{
        height: "100%", width: `${Math.min(100, Math.max(0, value))}%`,
        background: color,
        boxShadow: `0 0 6px ${color}80`,
        borderRadius: height,
        transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
      }} />
    </div>
  );
}

/** Large number display (e.g. portfolio value, price) */
export function PanelBigNumber({
  value, label, color = "#00FF9F", style,
}: {
  value: string; label?: string; color?: string; style?: CSSProperties;
}) {
  return (
    <div style={style}>
      <div style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: 30, fontWeight: 900,
        color, textShadow: `0 0 20px ${color}60`,
        lineHeight: 1, marginBottom: 4,
      }}>{value}</div>
      {label && (
        <div style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 11, fontWeight: 600,
          color: "rgba(139,148,158,0.7)",
          letterSpacing: "0.1em", textTransform: "uppercase",
        }}>{label}</div>
      )}
    </div>
  );
}

/** Signal badge — BUY / SELL / HOLD */
export function SignalBadge({ signal }: { signal: "BUY" | "SELL" | "HOLD" }) {
  const map = {
    BUY:  { color: "#00FF9F", bg: "rgba(0,255,159,0.10)",  border: "rgba(0,255,159,0.25)"  },
    SELL: { color: "#ef4444", bg: "rgba(239,68,68,0.10)",  border: "rgba(239,68,68,0.25)"  },
    HOLD: { color: "#FF6B00", bg: "rgba(255,107,0,0.10)",  border: "rgba(255,107,0,0.25)"  },
  };
  const t = map[signal];
  return (
    <div style={{
      display: "inline-block",
      fontFamily: "'Orbitron', sans-serif",
      fontSize: 20, fontWeight: 900,
      letterSpacing: "0.18em",
      color: t.color,
      background: t.bg,
      border: `1px solid ${t.border}`,
      borderRadius: 6,
      padding: "6px 20px",
      textShadow: `0 0 14px ${t.color}80`,
      boxShadow: `0 0 20px ${t.color}20`,
    }}>{signal}</div>
  );
}
