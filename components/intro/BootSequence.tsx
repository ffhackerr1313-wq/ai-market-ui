"use client";
import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BootSequenceProps {
  children: React.ReactNode;
  /** When true (default), the boot animation plays once per browser session
   *  (tracked via sessionStorage) and is skipped on later mounts.
   *  When false, it plays on every mount — useful during development. */
  gateWithStorage?: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────
// Use sessionStorage so it plays once per browser session (tab open)
// but replays if you open a new tab. Good balance for dev + prod.
const SESSION_KEY = "jarvis-boot-done";

const SYS_CHECKS = [
  { label: "LSTM ENGINE",       status: "OK"   },
  { label: "ICT / SMC SCANNER", status: "OK"   },
  { label: "SENTIMENT FEED",    status: "OK"   },
  { label: "MARKET DATA",       status: "OK"   },
  { label: "RISK MODULES",      status: "BETA" },
];

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Arc Reactor ─────────────────────────────────────────────────────────────
function ArcReactor({ visible }: { visible: boolean }) {
  return (
    <div style={{
      position: "relative", width: 148, height: 148, marginBottom: 36,
      opacity: visible ? 1 : 0,
      transform: visible ? "scale(1)" : "scale(0.4)",
      transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.34,1.56,0.64,1)",
    }}>
      <svg viewBox="0 0 148 148" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <style>{`
          @keyframes _cw  { to { transform: rotate(360deg);  } }
          @keyframes _ccw { to { transform: rotate(-360deg); } }
          .bs-r1 { animation: _cw  12s linear infinite; transform-origin: 74px 74px; }
          .bs-r2 { animation: _ccw  8s linear infinite; transform-origin: 74px 74px; }
          .bs-r3 { animation: _cw   4s linear infinite; transform-origin: 74px 74px; }
          .bs-sw { animation: _cw 2.5s linear infinite; transform-origin: 74px 74px; }
          @keyframes bs-pulse { 0%,100%{opacity:1;transform:translate(-50%,-50%) scale(1)} 50%{opacity:.65;transform:translate(-50%,-50%) scale(.82)} }
          @keyframes bs-scan  { 0%{top:0%;opacity:.7} 85%{opacity:.5} 100%{top:100%;opacity:0} }
        `}</style>
        <circle className="bs-r1" cx="74" cy="74" r="66"
          fill="none" stroke="#00DFFB" strokeWidth="0.8" strokeDasharray="3 8" opacity="0.5"/>
        <circle className="bs-r2" cx="74" cy="74" r="53"
          fill="none" stroke="#0098F8" strokeWidth="1.5" strokeDasharray="42 9 12 9" opacity="0.7"/>
        <circle className="bs-r3" cx="74" cy="74" r="40"
          fill="none" stroke="#52FEFE" strokeWidth="0.8" strokeDasharray="5 5" opacity="0.5"/>
        <circle cx="74" cy="74" r="30" fill="none" stroke="rgba(82,254,254,0.15)" strokeWidth="1"/>
        <g className="bs-sw">
          <path d="M74,74 L74,8 A66,66 0 0,1 138,74 Z" fill="rgba(0,223,251,0.04)"/>
        </g>
        <circle cx="74" cy="74" r="22" fill="rgba(0,20,33,0.9)"/>
        {[0,60,120,180,240,300].map((deg) => {
          const rad = (deg - 90) * Math.PI / 180;
          return <circle key={deg} cx={74 + 53*Math.cos(rad)} cy={74 + 53*Math.sin(rad)} r="2.8" fill="#52FEFE" opacity="0.65"/>;
        })}
      </svg>
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 34, height: 34,
        background: "radial-gradient(circle, #52FEFE 0%, #00DFFB 40%, transparent 75%)",
        borderRadius: "50%",
        boxShadow: "0 0 22px #00DFFB, 0 0 44px rgba(0,223,251,0.4), 0 0 88px rgba(0,223,251,0.12)",
        animation: "bs-pulse 2s ease-in-out infinite",
      }}/>
    </div>
  );
}

// ─── SysRow ───────────────────────────────────────────────────────────────────
function SysRow({ label, status, visible, barFull, statusVisible }: {
  label: string; status: string;
  visible: boolean; barFull: boolean; statusVisible: boolean;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateX(0)" : "translateX(-12px)",
      transition: "opacity 0.3s ease, transform 0.3s ease",
    }}>
      <span style={{
        fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
        color: "rgba(82,254,254,0.6)", width: 150, flexShrink: 0, letterSpacing: "0.05em",
      }}>{label}</span>
      <div style={{ flex: 1, height: 2, background: "rgba(0,223,251,0.08)", borderRadius: 1, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 1,
          background: "linear-gradient(90deg,#0098F8,#00DFFB,#52FEFE)",
          boxShadow: "0 0 8px #00DFFB",
          width: barFull ? "100%" : "0%",
          transition: "width 0.45s ease",
        }}/>
      </div>
      <span style={{
        fontFamily: "'Share Tech Mono', monospace", fontSize: 9,
        width: 40, textAlign: "right", flexShrink: 0,
        color: status === "OK" ? "#00FF9F" : "#FF6B00",
        opacity: statusVisible ? 1 : 0,
        transition: "opacity 0.25s ease",
      }}>{status}</span>
    </div>
  );
}

// ─── HUD Corners ──────────────────────────────────────────────────────────────
function HudCorners({ visible }: { visible: boolean }) {
  const corners = [
    { pos: "tl", style: { top:20,  left:20,   borderTop:"2px solid #00DFFB", borderLeft:"2px solid #00DFFB" },  dot: { bottom:-3, right:-3 } },
    { pos: "tr", style: { top:20,  right:20,  borderTop:"2px solid #00DFFB", borderRight:"2px solid #00DFFB" }, dot: { bottom:-3, left:-3  } },
    { pos: "bl", style: { bottom:20,left:20,  borderBottom:"2px solid #00DFFB",borderLeft:"2px solid #00DFFB" },dot: { top:-3,   right:-3 } },
    { pos: "br", style: { bottom:20,right:20, borderBottom:"2px solid #00DFFB",borderRight:"2px solid #00DFFB"},dot: { top:-3,   left:-3  } },
  ];
  return (
    <>
      {corners.map(({ pos, style, dot }, i) => (
        <div key={pos} style={{
          position: "fixed", width: 56, height: 56, zIndex: 90,
          pointerEvents: "none",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.75)",
          transition: `opacity 0.5s ease ${i*0.08}s, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i*0.08}s`,
          ...style,
        } as React.CSSProperties}>
          <div style={{
            position: "absolute", width: 6, height: 6,
            background: "#00DFFB", borderRadius: "50%",
            boxShadow: "0 0 10px #00DFFB, 0 0 20px rgba(0,223,251,0.35)",
            ...dot,
          } as React.CSSProperties}/>
        </div>
      ))}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BootSequence({ children, gateWithStorage = true }: BootSequenceProps) {
  // ── State ──
  const [showOverlay,  setShowOverlay]  = useState(true);   // boot screen visible
  const [overlayFade,  setOverlayFade]  = useState(false);  // fading out
  const [arcOn,        setArcOn]        = useState(false);
  const [titleOn,      setTitleOn]      = useState(false);
  const [sysOn,        setSysOn]        = useState(false);
  const [sysVisible,   setSysVisible]   = useState([false,false,false,false,false]);
  const [sysBarFull,   setSysBarFull]   = useState([false,false,false,false,false]);
  const [sysStatusV,   setSysStatusV]   = useState([false,false,false,false,false]);
  const [scanActive,   setScanActive]   = useState(false);
  const [cornersOn,    setCornersOn]    = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    // ── Already played this session → skip instantly (only when gating) ──
    if (gateWithStorage && typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY)) {
      setShowOverlay(false);
      setCornersOn(true);
      return;
    }

    // ── Reduced motion → skip ──
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion:reduce)").matches) {
      setShowOverlay(false);
      return;
    }

    play();
  }, []);

  async function play() {
    await wait(250);
    setArcOn(true);
    await wait(650);
    setTitleOn(true);
    await wait(650);
    setSysOn(true);

    for (let i = 0; i < SYS_CHECKS.length; i++) {
      await wait(130);
      setSysVisible(p => { const n=[...p]; n[i]=true; return n; });
      await wait(160);
      setSysBarFull(p  => { const n=[...p]; n[i]=true; return n; });
      await wait(400);
      setSysStatusV(p  => { const n=[...p]; n[i]=true; return n; });
      await wait(60);
    }

    await wait(420);
    setScanActive(true);
    await wait(2100);

    // Fade overlay out — children are ALREADY rendered behind it
    setOverlayFade(true);
    await wait(150);
    setCornersOn(true);
    await wait(900);
    setShowOverlay(false); // unmount overlay completely after fade

    // Mark done for this session (only when gating)
    if (gateWithStorage && typeof window !== "undefined") sessionStorage.setItem(SESSION_KEY, "1");
  }

  return (
    <>
      {/* ── Children ALWAYS rendered — never hidden ── */}
      {/* This fixes the navigation bug: page content is always mounted */}
      <div style={{
        opacity: overlayFade || !showOverlay ? 1 : 0,
        transition: "opacity 0.8s ease",
        // prevent interaction while overlay is up
        pointerEvents: showOverlay && !overlayFade ? "none" : "all",
      }}>
        {children}
      </div>

      {/* ── HUD corners (persist after boot) ── */}
      <HudCorners visible={cornersOn} />

      {/* ── Scan line ── */}
      {scanActive && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg,transparent 0%,#00DFFB 30%,#52FEFE 50%,#00DFFB 70%,transparent 100%)",
          boxShadow: "0 0 12px #00DFFB, 0 4px 20px rgba(0,223,251,0.3)",
          pointerEvents: "none", zIndex: 950,
          animation: "bs-scan 2s ease-in-out forwards",
        }}/>
      )}

      {/* ── Boot overlay (unmounts after fade) ── */}
      {showOverlay && (
        <div style={{
          position: "fixed", inset: 0, background: "#000308", zIndex: 1000,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          opacity: overlayFade ? 0 : 1,
          transition: "opacity 0.9s ease",
          pointerEvents: overlayFade ? "none" : "all",
        }}>
          {/* Vignette */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,3,8,0.85) 100%)",
          }}/>

          <ArcReactor visible={arcOn} />

          {/* Title */}
          <div style={{
            fontFamily: "'Orbitron', sans-serif", fontSize: 20, fontWeight: 900,
            color: "#00DFFB", letterSpacing: "0.28em", textTransform: "uppercase",
            textShadow: "0 0 24px rgba(0,223,251,0.6)",
            opacity: titleOn ? 1 : 0,
            transform: titleOn ? "translateY(0)" : "translateY(14px)",
            transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
            marginBottom: 4,
          }}>JARVIS · AI PREDICTOR</div>

          {/* Subtitle */}
          <div style={{
            fontFamily: "'Share Tech Mono', monospace", fontSize: 9,
            color: "rgba(0,223,251,0.45)", letterSpacing: "0.35em", textTransform: "uppercase",
            opacity: titleOn ? 1 : 0, transition: "opacity 0.5s ease 0.4s",
            marginBottom: 52,
          }}>NEURAL MARKET INTELLIGENCE SYSTEM — V2.4</div>

          {/* Sys checks */}
          <div style={{ width: 380, opacity: sysOn ? 1 : 0, transition: "opacity 0.4s ease" }}>
            {SYS_CHECKS.map((s, i) => (
              <SysRow key={s.label} label={s.label} status={s.status}
                visible={sysVisible[i]} barFull={sysBarFull[i]} statusVisible={sysStatusV[i]}/>
            ))}
          </div>

          {/* Credit */}
          <div style={{
            position: "absolute", bottom: 28,
            fontFamily: "'Share Tech Mono', monospace", fontSize: 9,
            letterSpacing: "0.3em", color: "rgba(82,254,254,0.2)", textTransform: "uppercase",
            opacity: sysOn ? 1 : 0, transition: "opacity 0.5s ease 1s",
          }}>Built by Tanishq Verma</div>
        </div>
      )}
    </>
  );
}
