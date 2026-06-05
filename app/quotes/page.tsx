"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import PageShell from "@/components/PageShell";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type NSEQuote = {
  symbol: string; name: string;
  last_price: number | null; change: number | null; pct_change: number | null;
  open: number | null; high: number | null; low: number | null;
  prev_close: number | null; week52_high: number | null; week52_low: number | null;
  total_volume: number | null; source: string; error?: string;
};
type MarketStatus = { status: string; is_open: boolean; trade_date?: string; error?: string };
import { motion } from "framer-motion";
import { ScrollTiltedGrid, DEFAULT_GRID_IMAGES } from "@/components/ui/scroll-tilted-grid";

/* â"€â"€â"€ 12 original philosophical trading quotes â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
const QUOTES = [
  {
    text: "The market does not punish ambition. It punishes impatience.",
    author: "JARVIS AI · Neural Engine v2.4",
  },
  {
    text: "Every candle holds a decision made by someone with more information than you. Study it.",
    author: "ICT Framework · Institutional Insight",
  },
  {
    text: "Structure precedes momentum. The chart already knows where it is going — you just haven't read it yet.",
    author: "Smart Money Concepts",
  },
  {
    text: "The edge is never in the signal. It is in the discipline to wait for the right one.",
    author: "LSTM Model · Pattern Recognition",
  },
  {
    text: "Risk is not the enemy of return. Ignorance of risk is.",
    author: "Kelly Criterion · Position Sizing",
  },
  {
    text: "The algorithm learns from every loss. So must the mind that trained it.",
    author: "JARVIS AI · Self-Optimisation",
  },
  {
    text: "Time in the market does not guarantee profit. It guarantees perspective — which is rarer.",
    author: "Walk-Forward Validation · Backtester",
  },
  {
    text: "Liquidity is the ocean. Your position is the boat. Learn to read the tides before you sail.",
    author: "ICT · Liquidity Framework",
  },
  {
    text: "Data without context is noise. Noise mistaken for signal is ruin.",
    author: "AI Insights Engine · Signal Detection",
  },
  {
    text: "Every trend that extended too far eventually returned too far. The mean is infinitely patient.",
    author: "Statistical Reversion · Volatility Model",
  },
  {
    text: "Institutional money moves in silence. Retail money moves in panic. Know which you are.",
    author: "Smart Money Concepts · ICT",
  },
  {
    text: "The best trade you ever make is the one you had the discipline not to take.",
    author: "JARVIS AI · Risk Management",
  },
] as const;

/* â"€â"€â"€ Token colours â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
const T = {
  void:  "#000308",
  cyan:  "#00DFFB",
  hot:   "#52FEFE",
  green: "#00FF9F",
  muted: "rgba(82,254,254,0.35)",
};

/* â"€â"€â"€ Quote overlay rendered inside each tile on click â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
function QuoteOverlay({ quote }: { quote: typeof QUOTES[number] }) {
  return (
    <div
      style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "28px 22px",
        background: "linear-gradient(160deg,rgba(0,3,8,.96) 0%,rgba(0,15,30,.94) 100%)",
        backdropFilter: "blur(28px) saturate(160%)",
        WebkitBackdropFilter: "blur(28px) saturate(160%)",
        border: "1px solid rgba(0,223,251,.28)",
        boxShadow: "inset 0 0 40px rgba(0,223,251,.06)",
      }}
    >
      {/* Corner brackets */}
      {([["top","left"],["top","right"],["bottom","left"],["bottom","right"]] as const).map(([v,h], i) => (
        <div key={i} style={{
          position: "absolute",
          [v]: 12, [h]: 12,
          width: 16, height: 16,
          borderTop:    v === "top"    ? `1.5px solid ${T.cyan}` : undefined,
          borderBottom: v === "bottom" ? `1.5px solid ${T.cyan}` : undefined,
          borderLeft:   h === "left"   ? `1.5px solid ${T.cyan}` : undefined,
          borderRight:  h === "right"  ? `1.5px solid ${T.cyan}` : undefined,
        }} />
      ))}

      {/* Opening quotation mark */}
      <div style={{
        fontFamily: "Georgia, serif",
        fontSize: 52, lineHeight: 1,
        color: T.cyan, opacity: 0.9,
        textShadow: `0 0 20px rgba(0,223,251,.6)`,
        marginBottom: 12, alignSelf: "flex-start",
      }}>
        &#8220;
      </div>

      {/* Quote text */}
      <p style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: "clamp(13px, 1.5vw, 16px)",
        fontWeight: 600,
        lineHeight: 1.65,
        color: "#e6edf3",
        textAlign: "center",
        letterSpacing: "0.02em",
        margin: "0 0 18px",
        flex: 1,
        display: "flex", alignItems: "center",
      }}>
        {quote.text}
      </p>

      {/* Author */}
      <div style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 8,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: T.muted,
        textAlign: "center",
        borderTop: "1px solid rgba(82,254,254,.15)",
        paddingTop: 10,
        width: "100%",
      }}>
        — {quote.author}
      </div>

      {/* Tap-to-close hint */}
      <div style={{
        position: "absolute", bottom: 10, right: 14,
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 7, letterSpacing: "0.18em",
        color: "rgba(82,254,254,.22)", textTransform: "uppercase",
      }}>
        tap to close
      </div>
    </div>
  );
}

/* â"€â"€â"€ Animated scan line for hero â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
const scanAnim = `
@keyframes hero-scan {
  0%   { top: 0%;   opacity: 0.5; }
  85%  { opacity: 0.2; }
  100% { top: 100%; opacity: 0; }
}
@keyframes bounce-y {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(10px); }
}
@keyframes blink-dot {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.2; }
}
`;

/* â"€â"€â"€ NSE Live Market Panel â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
type WsStatus = "connecting" | "connected" | "disconnected";

function NSEPanel() {
  const [quotes, setQuotes]     = useState<NSEQuote[]>([]);
  const [market, setMarket]     = useState<MarketStatus | null>(null);
  const [loading, setLoading]   = useState(true);
  const [lastFetch, setLastFetch] = useState("");
  const [selected, setSelected] = useState<NSEQuote | null>(null);
  const [wsStatus, setWsStatus] = useState<WsStatus>("connecting");

  const selectedSymbol = useRef<string | null>(null);
  const wsRef          = useRef<WebSocket | null>(null);
  const retryTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSelect(q: NSEQuote) {
    selectedSymbol.current = q.symbol;
    setSelected(q);
  }

  useEffect(() => {
    let alive = true;

    function connect() {
      if (!alive) return;
      setWsStatus("connecting");
      const wsBase = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";
      const ws = new WebSocket(`${wsBase}/ws/prices`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!alive) { ws.close(); return; }
        setWsStatus("connected");
      };

      ws.onmessage = (e) => {
        if (!alive) return;
        try {
          const data = JSON.parse(e.data as string);
          if (data.type === "prices") {
            setQuotes(data.quotes);
            setMarket(data.market);
            setLastFetch(data.ts ?? "");
            setLoading(false);
            // Keep selected up-to-date; initialise on first message
            if (selectedSymbol.current) {
              const refreshed = (data.quotes as NSEQuote[]).find(q => q.symbol === selectedSymbol.current);
              if (refreshed) setSelected(refreshed);
            } else if ((data.quotes as NSEQuote[]).length > 0) {
              selectedSymbol.current = data.quotes[0].symbol;
              setSelected(data.quotes[0]);
            }
          }
        } catch { /* malformed frame */ }
      };

      ws.onclose = () => {
        if (!alive) return;
        setWsStatus("disconnected");
        retryTimer.current = setTimeout(connect, 4000);
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      alive = false;
      if (retryTimer.current) clearTimeout(retryTimer.current);
      wsRef.current?.close();
    };
  }, []);

  const fmt = (v: number | null, prefix = "₹") =>
    v == null ? "—" : prefix + v.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  const fmtVol = (v: number | null) =>
    v == null ? "—" : v >= 1e7 ? (v / 1e7).toFixed(2) + " Cr" : v >= 1e5 ? (v / 1e5).toFixed(1) + " L" : v.toLocaleString();

  return (
    <section style={{ padding: "48px 32px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, letterSpacing: "0.28em", color: "rgba(82,254,254,.4)", marginBottom: 6 }}>
            NSE INDIA · LIVE MARKET DATA
          </div>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 20, fontWeight: 700, color: T.cyan, letterSpacing: "0.1em" }}>
            LIVE PRICES
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* WebSocket status pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: 7, padding: "5px 12px",
            borderRadius: 4,
            border: `1px solid ${wsStatus === "connected" ? "rgba(0,255,159,.3)" : wsStatus === "connecting" ? "rgba(255,180,0,.3)" : "rgba(239,68,68,.3)"}`,
            background: wsStatus === "connected" ? "rgba(0,255,159,.05)" : wsStatus === "connecting" ? "rgba(255,180,0,.05)" : "rgba(239,68,68,.05)",
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: wsStatus === "connected" ? "#00FF9F" : wsStatus === "connecting" ? "#ffb400" : "#ef4444",
              boxShadow: `0 0 5px ${wsStatus === "connected" ? "#00FF9F" : wsStatus === "connecting" ? "#ffb400" : "#ef4444"}`,
              animation: wsStatus === "connected" ? "blink-dot 2s ease-in-out infinite" : "none",
            }} />
            <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, letterSpacing: "0.15em", color: wsStatus === "connected" ? "#00FF9F" : wsStatus === "connecting" ? "#ffb400" : "#ef4444", fontWeight: 700 }}>
              {wsStatus === "connected" ? "LIVE" : wsStatus === "connecting" ? "CONNECTING…" : "RECONNECTING…"}
            </span>
          </div>

          {/* NSE market open/closed */}
          {market && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 4, border: `1px solid ${market.is_open ? "rgba(0,255,159,.3)" : "rgba(239,68,68,.3)"}`, background: market.is_open ? "rgba(0,255,159,.06)" : "rgba(239,68,68,.06)" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: market.is_open ? "#00FF9F" : "#ef4444", boxShadow: `0 0 6px ${market.is_open ? "#00FF9F" : "#ef4444"}`, animation: market.is_open ? "blink-dot 2s ease-in-out infinite" : "none" }} />
              <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, letterSpacing: "0.15em", color: market.is_open ? "#00FF9F" : "#ef4444", fontWeight: 700 }}>
                {market.status.toUpperCase()}
              </span>
            </div>
          )}

          {lastFetch && (
            <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "rgba(82,254,254,.3)", letterSpacing: "0.1em" }}>
              {lastFetch} IST
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 180, color: "rgba(82,254,254,.3)", fontFamily: "'Share Tech Mono',monospace", fontSize: 11, letterSpacing: "0.2em" }}>
          FETCHING NSE DATA…
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Quote cards grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {quotes.map(q => {
              const up = (q.pct_change ?? 0) >= 0;
              const color = q.error ? "rgba(82,254,254,.3)" : up ? "#00FF9F" : "#ef4444";
              const isSelected = selected?.symbol === q.symbol;
              return (
                <div key={q.symbol} onClick={() => handleSelect(q)} style={{
                  padding: "14px 16px", borderRadius: 8, cursor: "pointer",
                  border: `1px solid ${isSelected ? "rgba(0,223,251,.4)" : "rgba(82,254,254,.1)"}`,
                  background: isSelected ? "rgba(0,223,251,.05)" : "rgba(0,3,8,.5)",
                  transition: "all 0.2s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 13, fontWeight: 700, color: T.cyan, letterSpacing: "0.08em" }}>
                        {q.symbol}
                      </div>
                      <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "rgba(82,254,254,.35)", marginTop: 2 }}>
                        {q.name || q.symbol}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 16, fontWeight: 700, color: q.error ? "rgba(82,254,254,.3)" : T.cyan }}>
                        {q.error ? "N/A" : fmt(q.last_price)}
                      </div>
                      {!q.error && (
                        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color, marginTop: 2, letterSpacing: "0.05em" }}>
                          {up ? "▲" : "▼"} {fmt(q.change, "")} ({q.pct_change != null ? Math.abs(q.pct_change).toFixed(2) : "—"}%)
                        </div>
                      )}
                      {q.error && <div style={{ fontSize: 8, color: "#ef4444", fontFamily: "'Share Tech Mono',monospace" }}>NSE error</div>}
                    </div>
                  </div>
                  {!q.error && (
                    <div style={{ display: "flex", gap: 12, marginTop: 10, paddingTop: 8, borderTop: "1px solid rgba(82,254,254,.07)" }}>
                      {[
                        { l: "O", v: fmt(q.open) },
                        { l: "H", v: fmt(q.high) },
                        { l: "L", v: fmt(q.low) },
                        { l: "Vol", v: fmtVol(q.total_volume) },
                      ].map(({ l, v }) => (
                        <div key={l} style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7, color: "rgba(82,254,254,.3)", letterSpacing: "0.15em" }}>{l}</div>
                          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "rgba(82,254,254,.7)", marginTop: 2 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Detail panel */}
          {selected && !selected.error && (
            <div style={{ padding: "20px", borderRadius: 8, border: "1px solid rgba(0,223,251,.15)", background: "rgba(0,3,8,.6)", display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "rgba(82,254,254,.35)", letterSpacing: "0.2em", marginBottom: 4 }}>SELECTED</div>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 18, fontWeight: 700, color: T.cyan }}>{selected.symbol}</div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "rgba(82,254,254,.4)", marginTop: 2 }}>{selected.name}</div>
              </div>

              {/* LTP big */}
              <div style={{ padding: "16px", borderRadius: 6, background: "rgba(0,223,251,.04)", border: "1px solid rgba(0,223,251,.12)" }}>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "rgba(82,254,254,.35)", letterSpacing: "0.2em", marginBottom: 6 }}>LAST TRADED PRICE</div>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 28, fontWeight: 900, color: T.cyan, textShadow: "0 0 20px rgba(0,223,251,.4)" }}>
                  {fmt(selected.last_price)}
                </div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 12, color: (selected.pct_change ?? 0) >= 0 ? "#00FF9F" : "#ef4444", marginTop: 4 }}>
                  {(selected.pct_change ?? 0) >= 0 ? "▲" : "▼"} {fmt(selected.change, "")} ({selected.pct_change?.toFixed(2)}%) vs prev close
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { l: "Open",       v: fmt(selected.open) },
                  { l: "Prev Close", v: fmt(selected.prev_close) },
                  { l: "Day High",   v: fmt(selected.high),         c: "#00FF9F" },
                  { l: "Day Low",    v: fmt(selected.low),           c: "#ef4444" },
                  { l: "52W High",   v: fmt(selected.week52_high),   c: "#00FF9F" },
                  { l: "52W Low",    v: fmt(selected.week52_low),    c: "#ef4444" },
                  { l: "Volume",     v: fmtVol(selected.total_volume) },
                  { l: "Source",     v: "NSE LIVE" },
                ].map(({ l, v, c }) => (
                  <div key={l} style={{ padding: "10px 12px", borderRadius: 6, background: "rgba(82,254,254,.03)", border: "1px solid rgba(82,254,254,.07)" }}>
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7, color: "rgba(82,254,254,.3)", letterSpacing: "0.15em", marginBottom: 4 }}>{l}</div>
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: c || "rgba(82,254,254,.8)", fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* 52-week range bar */}
              {selected.week52_high && selected.week52_low && selected.last_price && (
                <div>
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7, color: "rgba(82,254,254,.3)", letterSpacing: "0.15em", marginBottom: 6 }}>52-WEEK RANGE</div>
                  <div style={{ height: 4, background: "rgba(82,254,254,.1)", borderRadius: 2, position: "relative" }}>
                    <div style={{
                      position: "absolute", top: 0, left: 0, borderRadius: 2,
                      width: `${Math.min(100, ((selected.last_price - selected.week52_low) / (selected.week52_high - selected.week52_low)) * 100)}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #ef4444, #00FF9F)",
                    }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#ef4444" }}>{fmt(selected.week52_low)}</span>
                    <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#00FF9F" }}>{fmt(selected.week52_high)}</span>
                  </div>
                </div>
              )}

              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7, color: "rgba(82,254,254,.2)", letterSpacing: "0.12em", marginTop: "auto" }}>
                DATA FROM NSE INDIA · WEBSOCKET LIVE · NOT FINANCIAL ADVICE
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* â"€â"€â"€ Page â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */
export default function QuotesPage() {
  return (
    <PageShell>
      <style>{scanAnim}</style>

      <div style={{ background: T.void, color: "#e6edf3", minHeight: "100vh" }}>

        {/* â•â• HERO SECTION â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <section style={{
          position: "relative", height: "calc(100vh - 46px)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          {/* CSS grid texture background */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage:
              "linear-gradient(rgba(0,223,251,.04) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(0,223,251,.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />

          {/* Radial cyan bloom behind text */}
          <div style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: "70vw", height: "60vh",
            background: "radial-gradient(ellipse, rgba(0,223,251,.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* Animated scan line */}
          <div style={{
            position: "absolute", left: 0, right: 0, height: 1,
            background: `linear-gradient(90deg, transparent, ${T.cyan}, transparent)`,
            animation: "hero-scan 5s ease-in-out infinite",
            pointerEvents: "none",
          }} />

          {/* HUD corner brackets */}
          {([
            { top: 24, left: 24 },
            { top: 24, right: 24 },
            { bottom: 24, left: 24 },
            { bottom: 24, right: 24 },
          ] as React.CSSProperties[]).map((pos, i) => {
            const t = i < 2, l = i % 2 === 0;
            return (
              <div key={i} style={{
                position: "absolute", ...pos, width: 28, height: 28,
                borderTop:    t  ? `2px solid rgba(0,223,251,.45)` : undefined,
                borderBottom: !t ? `2px solid rgba(0,223,251,.45)` : undefined,
                borderLeft:   l  ? `2px solid rgba(0,223,251,.45)` : undefined,
                borderRight:  !l ? `2px solid rgba(0,223,251,.45)` : undefined,
                pointerEvents: "none",
              }} />
            );
          })}

          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: "center", position: "relative", zIndex: 2, padding: "0 24px" }}
          >
            {/* Pre-label */}
            <div style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 10, letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "rgba(82,254,254,.5)",
              marginBottom: 20,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            }}>
              <span style={{ display: "inline-block", width: 32, height: 1, background: T.muted }} />
              JARVIS AI · PHILOSOPHY ENGINE
              <span style={{ display: "inline-block", width: 32, height: 1, background: T.muted }} />
            </div>

            {/* "QUOTES" main heading */}
            <h1 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "clamp(72px, 14vw, 148px)",
              fontWeight: 900,
              letterSpacing: "0.18em",
              lineHeight: 1,
              margin: "0 0 24px",
              color: T.cyan,
              textShadow: [
                `0 0 30px rgba(0,223,251,.7)`,
                `0 0 80px rgba(0,223,251,.35)`,
                `0 0 160px rgba(0,223,251,.15)`,
              ].join(","),
            }}>
              QUOTES
            </h1>

            {/* Divider line */}
            <div style={{
              margin: "0 auto 22px",
              width: "min(400px, 80vw)",
              height: 1,
              background: `linear-gradient(90deg, transparent, ${T.cyan}, transparent)`,
              opacity: 0.5,
            }} />

            {/* Subtitle */}
            <p style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "clamp(13px, 1.8vw, 16px)",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(230,237,243,.55)",
              margin: 0,
            }}>
              12 Perspectives on Markets, Intelligence &amp; Discipline
            </p>

            {/* Stat pills */}
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 28 }}>
              {[
                { label: "IMAGES", value: "12" },
                { label: "QUOTES", value: "12" },
                { label: "ENGINE", value: "LSTM" },
              ].map(p => (
                <div key={p.label} style={{
                  padding: "5px 14px",
                  background: "rgba(0,223,251,.06)",
                  border: "1px solid rgba(0,223,251,.18)",
                  borderRadius: 4,
                  display: "flex", flexDirection: "column", alignItems: "center",
                }}>
                  <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 14, fontWeight: 700, color: T.cyan }}>{p.value}</span>
                  <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7, letterSpacing: ".2em", color: T.muted, textTransform: "uppercase" }}>{p.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            style={{
              position: "absolute", bottom: 36,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              pointerEvents: "none",
            }}
          >
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 8, letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(82,254,254,.35)",
            }}>
              scroll to explore
            </span>
            <svg
              width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="rgba(0,223,251,0.5)" strokeWidth="1.5" strokeLinecap="round"
              style={{ animation: "bounce-y 2s ease-in-out infinite" }}
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </motion.div>
        </section>

        {/* â•â• NSE LIVE MARKET PANEL â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <NSEPanel />

        {/* â•â• SECTION LABEL â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <div style={{
          textAlign: "center", padding: "60px 24px 0",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ display: "inline-block", width: 48, height: 1, background: `linear-gradient(to right, transparent, ${T.cyan})`, opacity: 0.4 }} />
            <span style={{
              fontFamily: "'Share Tech Mono', monospace", fontSize: 9,
              letterSpacing: "0.28em", textTransform: "uppercase",
              color: "rgba(82,254,254,.4)",
            }}>
              TAP ANY IMAGE TO REVEAL ITS QUOTE
            </span>
            <span style={{ display: "inline-block", width: 48, height: 1, background: `linear-gradient(to left, transparent, ${T.cyan})`, opacity: 0.4 }} />
          </div>
          {/* Live indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              display: "inline-block", width: 6, height: 6, borderRadius: "50%",
              background: T.green, boxShadow: `0 0 8px ${T.green}`,
              animation: "blink-dot 2s ease-in-out infinite",
            }} />
            <span style={{
              fontFamily: "'Share Tech Mono', monospace", fontSize: 7,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "rgba(0,255,159,.5)",
            }}>
              PHILOSOPHY ENGINE ACTIVE
            </span>
          </div>
        </div>

        {/* â•â• SCROLL TILTED GRID â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <ScrollTiltedGrid
          images={DEFAULT_GRID_IMAGES}
          maxWidth="none"
          gap={8}
          aspectRatio="3/4"
          maxTilt={65}
          maxBlur={10}
          perspective={1000}
          rounded="1rem"
          renderOverlay={(idx) => <QuoteOverlay quote={QUOTES[idx % QUOTES.length]} />}
        />

        {/* â•â• FOOTER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <footer style={{
          padding: "48px 32px",
          borderTop: "1px solid rgba(82,254,254,.08)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(0,3,8,.6)",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{
              fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 700,
              color: T.cyan, letterSpacing: "0.22em",
              textShadow: `0 0 16px rgba(0,223,251,.4)`,
            }}>
              JARVIS
            </span>
            <span style={{
              fontFamily: "'Share Tech Mono', monospace", fontSize: 7,
              color: "rgba(82,254,254,.25)", letterSpacing: "0.2em",
            }}>
              AI TRADING OS · V2.4
            </span>
          </div>

          <div style={{
            fontFamily: "'Share Tech Mono', monospace", fontSize: 8,
            color: "rgba(82,254,254,.25)", letterSpacing: "0.15em",
            textTransform: "uppercase", textAlign: "center",
          }}>
            Â© 2026 JARVIS AI<br />
            <span style={{ color: "rgba(82,254,254,.35)" }}>BUILT BY TANISHQ VERMA</span>
          </div>

          <Link href="/dashboard" style={{
            display: "flex", alignItems: "center", gap: 8,
            fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 700,
            color: "rgba(82,254,254,.4)", letterSpacing: "0.1em",
            textTransform: "uppercase", textDecoration: "none",
            border: "1px solid rgba(82,254,254,.15)", padding: "6px 14px",
            borderRadius: 4, transition: "all .2s ease",
          }}>
            Back to Dashboard
          </Link>
        </footer>
      </div>
    </PageShell>
  );
}
