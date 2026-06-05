"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&display=swap');
@keyframes ps-spin-cw  { to { transform: rotate(360deg) } }
@keyframes ps-spin-ccw { to { transform: rotate(-360deg) } }
@keyframes ps-blink    { 0%,100%{opacity:1}50%{opacity:.2} }
`;

const NAV = [
  { l: "Overview",    h: "/" },
  { l: "Dashboard",  h: "/dashboard" },
  { l: "Signals",    h: "/signals" },
  { l: "Portfolio",  h: "/portfolio" },
  { l: "Backtest",   h: "/backtest" },
  { l: "AI Insights",h: "/ai-insights" },
  { l: "Quotes",     h: "/quotes" },
  { l: "Settings",   h: "/settings" },
];

export default function PageShell({ children }: { children: React.ReactNode }) {
  const [timeStr,    setTimeStr]    = useState("");
  const [marketOpen, setMarketOpen] = useState<boolean | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const upd = () => setTimeStr(new Date().toLocaleTimeString("en-US", { hour12: false }));
    upd();
    const id = setInterval(upd, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch(`${API}/api/nse/market`).then(r => r.json())
      .then(d => setMarketOpen(d?.is_open ?? false)).catch(() => setMarketOpen(false));
  }, []);

  return (
    <>
      <style>{CSS}</style>

      {/* ── Sticky HUD nav strip ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 200, height: 46,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px",
        background: "rgba(0,3,8,.92)", backdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(82,254,254,.1)",
      }}>

        {/* Logo */}
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
          <div style={{ position: "relative", width: 26, height: 26 }}>
            <svg viewBox="0 0 26 26" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              <circle cx="13" cy="13" r="11" fill="none" stroke="#00DFFB" strokeWidth=".6"
                strokeDasharray="3 5"
                style={{ animation: "ps-spin-cw 8s linear infinite", transformOrigin: "13px 13px" }} />
              <circle cx="13" cy="13" r="7" fill="none" stroke="#0098F8" strokeWidth=".9"
                strokeDasharray="10 4"
                style={{ animation: "ps-spin-ccw 5s linear infinite", transformOrigin: "13px 13px" }} />
              <circle cx="13" cy="13" r="3" fill="#001421" stroke="rgba(82,254,254,.3)" strokeWidth=".5" />
            </svg>
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
              width: 5, height: 5, borderRadius: "50%", background: "#52FEFE",
              boxShadow: "0 0 7px #00DFFB", animation: "ps-blink 2.2s ease-in-out infinite",
            }} />
          </div>
          <span style={{
            fontFamily: "'Orbitron',sans-serif", fontSize: 12, fontWeight: 900,
            color: "#00DFFB", letterSpacing: "0.22em",
            textShadow: "0 0 14px rgba(0,223,251,.55)",
          }}>JARVIS</span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: "flex", gap: 2 }}>
          {NAV.map(n => {
            const active = pathname === n.h;
            return (
              <Link key={n.l} href={n.h} style={{
                padding: "4px 11px", borderRadius: 5, textDecoration: "none",
                fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700,
                letterSpacing: "0.07em", textTransform: "uppercase",
                color: active ? "#00DFFB" : "rgba(82,254,254,.38)",
                background: active ? "rgba(0,223,251,.07)" : "transparent",
                borderBottom: `1px solid ${active ? "rgba(0,223,251,.35)" : "transparent"}`,
                transition: "color .15s, background .15s",
              }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(82,254,254,.7)"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(82,254,254,.38)"; }}
              >
                {n.l}
              </Link>
            );
          })}
        </nav>

        {/* Right: market pill + clock */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          {marketOpen !== null && (
            <div style={{
              display: "flex", alignItems: "center", gap: 5, padding: "2px 10px", borderRadius: 4,
              background: marketOpen ? "rgba(0,255,159,.05)" : "rgba(239,68,68,.05)",
              border: `1px solid ${marketOpen ? "rgba(0,255,159,.18)" : "rgba(239,68,68,.18)"}`,
            }}>
              <div style={{
                width: 5, height: 5, borderRadius: "50%",
                background: marketOpen ? "#00FF9F" : "#ef4444",
                boxShadow: `0 0 5px ${marketOpen ? "#00FF9F" : "#ef4444"}`,
                animation: "ps-blink 2s ease-in-out infinite",
              }} />
              <span style={{
                fontFamily: "'Share Tech Mono',monospace", fontSize: 8, letterSpacing: "0.1em",
                color: marketOpen ? "rgba(0,255,159,.7)" : "rgba(239,68,68,.6)",
              }}>
                {marketOpen ? "OPEN" : "CLOSED"}
              </span>
            </div>
          )}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 12, color: "#00DFFB", letterSpacing: "0.04em" }}>{timeStr}</div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7, color: "rgba(82,254,254,.28)", letterSpacing: "0.15em" }}>IST</div>
          </div>
        </div>
      </div>

      {/* Page content */}
      {children}
    </>
  );
}
