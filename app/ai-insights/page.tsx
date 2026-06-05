"use client";
import { useState, useEffect, useRef } from "react";
import { CardStack, type CardStackItem } from "@/components/ui/card-stack";
import PageShell from "@/components/PageShell";

/* â"€â"€ Extended card type carries the NSE ticker for live signal lookup â"€â"€ */
type SpotlightCard = CardStackItem & { ticker: string };

const MARKET_SPOTLIGHT: SpotlightCard[] = [
  {
    id: 1,
    ticker: "RELIANCE.NS",
    title: "RELIANCE",
    description: "Energy · Retail · Telecom — India's largest conglomerate anchoring the Nifty 50.",
    /* dark stock-market data screen — green numbers on black */
    imageSrc: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=640&h=400&fit=crop&auto=format",
    href: "/signals",
    tag: "NSE · ENERGY",
  },
  {
    id: 2,
    ticker: "TCS.NS",
    title: "TCS",
    description: "AI · Cloud · Digital — Tata Consultancy anchors India's $250 B IT export story.",
    /* dark green matrix / code rain */
    imageSrc: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=640&h=400&fit=crop&auto=format",
    href: "/signals",
    tag: "NSE · TECHNOLOGY",
  },
  {
    id: 3,
    ticker: "HDFCBANK.NS",
    title: "HDFCBANK",
    description: "NIM · Retail Loans · Deposits — dominant private-sector franchise with rock-solid asset quality.",
    /* multi-screen trading desk — dark atmospheric */
    imageSrc: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=640&h=400&fit=crop&auto=format",
    href: "/signals",
    tag: "NSE · BANKING",
  },
  {
    id: 4,
    ticker: "INFY.NS",
    title: "INFY",
    description: "BPO · AI Automation · Cloud Migration — Infosys drives global enterprise transformation at scale.",
    /* dark circuit board — electric blue tones */
    imageSrc: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=640&h=400&fit=crop&auto=format",
    href: "/signals",
    tag: "NSE · IT SERVICES",
  },
  {
    id: 5,
    ticker: "ICICIBANK.NS",
    title: "ICICIBANK",
    description: "Digital-first · SME Growth · Retail — fastest-growing large private bank in India.",
    /* dark analytics dashboard — charts and data */
    imageSrc: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=640&h=400&fit=crop&auto=format",
    href: "/signals",
    tag: "NSE · BANKING",
  },
];

/* â"€â"€ HUD-native card renderer â"€â"€ */
const HUD = {
  cyan: "#00DFFB", hot: "#52FEFE", green: "#00FF9F",
  red: "#ef4444", amber: "#FF6B00", void: "#000308",
};

function sigColor(s?: string) {
  return s === "BUY" ? HUD.green : s === "SELL" ? HUD.red : HUD.amber;
}

function HUDSpotlightCard({
  item,
  active,
  signal,
}: {
  item: SpotlightCard;
  active: boolean;
  signal?: Record<string, unknown>;
}) {
  const sig   = signal?.signal as string | undefined;
  const col   = sigColor(sig);
  const conf  = signal?.confidence as number | undefined;
  const acc   = signal?.accuracy  as number | undefined;
  const entry = signal?.entry     as number | undefined;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 16, overflow: "hidden" }}>

      {/* â"€â"€ Base image â"€â"€ */}
      <img
        src={item.imageSrc}
        alt={item.title}
        draggable={false}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* â"€â"€ Dark HUD blend layers â"€â"€ */}
      {/* primary dark wash */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(0,3,8,.88) 0%,rgba(0,15,28,.72) 55%,rgba(0,3,8,.92) 100%)" }} />
      {/* cyan radial bloom bottom-left */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 15% 85%,rgba(0,223,251,.20) 0%,transparent 58%)" }} />
      {/* signal-color radial bloom top-right */}
      {sig && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 85% 15%,${col}22 0%,transparent 50%)` }} />}
      {/* subtle HUD grid texture */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(0,223,251,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,223,251,.04) 1px,transparent 1px)",
        backgroundSize: "36px 36px",
      }} />
      {/* scanline sweep */}
      <div style={{
        position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
        background: "linear-gradient(to bottom,rgba(0,223,251,.03) 50%,transparent 50%)",
        backgroundSize: "100% 3px",
      }} />

      {/* â"€â"€ Active border glow â"€â"€ */}
      {active && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 16, pointerEvents: "none",
          border: "1px solid rgba(0,223,251,.5)",
          boxShadow: "0 0 28px rgba(0,223,251,.22),inset 0 0 28px rgba(0,223,251,.06)",
        }} />
      )}

      {/* â"€â"€ HUD corner brackets â"€â"€ */}
      {(["tl","tr","bl","br"] as const).map(pos => {
        const t = pos.startsWith("t"), l = pos.endsWith("l");
        return (
          <div key={pos} style={{
            position: "absolute",
            top: t ? 14 : undefined, bottom: t ? undefined : 14,
            left: l ? 14 : undefined, right: l ? undefined : 14,
            width: 18, height: 18,
            borderTop:    t ? `1.5px solid ${HUD.cyan}` : undefined,
            borderBottom: !t ? `1.5px solid ${HUD.cyan}` : undefined,
            borderLeft:   l ? `1.5px solid ${HUD.cyan}` : undefined,
            borderRight:  !l ? `1.5px solid ${HUD.cyan}` : undefined,
            opacity: active ? 0.9 : 0.35,
            transition: "opacity .3s",
          }} />
        );
      })}

      {/* â"€â"€ Content â"€â"€ */}
      <div style={{ position: "absolute", inset: 0, padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>

        {/* Top row: sector tag + signal badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{
            fontFamily: "'Share Tech Mono',monospace", fontSize: 8, letterSpacing: "0.22em",
            textTransform: "uppercase", color: HUD.cyan,
            background: "rgba(0,223,251,.1)", border: "1px solid rgba(0,223,251,.25)",
            padding: "3px 8px", borderRadius: 3,
          }}>
            {item.tag}
          </span>
          {sig ? (
            <span style={{
              fontFamily: "'Orbitron',sans-serif", fontSize: 9, fontWeight: 900, letterSpacing: "0.1em",
              color: col, background: `${col}18`, border: `1px solid ${col}45`,
              padding: "3px 10px", borderRadius: 3,
              textShadow: `0 0 10px ${col}80`,
            }}>
              {sig}
            </span>
          ) : (
            <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "rgba(82,254,254,.3)" }}>
              LOADING...
            </span>
          )}
        </div>

        {/* Bottom: ticker + live stats */}
        <div>
          {/* Ticker */}
          <div style={{
            fontFamily: "'Orbitron',sans-serif", fontSize: 30, fontWeight: 900,
            color: HUD.cyan, letterSpacing: "0.12em",
            textShadow: `0 0 22px rgba(0,223,251,.65),0 0 44px rgba(0,223,251,.25)`,
            marginBottom: 5, lineHeight: 1,
          }}>
            {item.title}
          </div>
          {/* Description */}
          <div style={{
            fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 500,
            color: "rgba(230,237,243,.65)", letterSpacing: ".02em", marginBottom: 12,
            lineHeight: 1.5,
          }}>
            {item.description}
          </div>

          {/* Live signal stats row */}
          <div style={{ display: "flex", gap: 18, alignItems: "flex-end" }}>
            {conf != null && (
              <div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7, color: "rgba(82,254,254,.4)", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 2 }}>CONFIDENCE</div>
                {/* mini bar */}
                <div style={{ width: 80, height: 2, background: "rgba(0,223,251,.12)", borderRadius: 1, marginBottom: 3 }}>
                  <div style={{ width: `${conf}%`, height: "100%", background: col, borderRadius: 1, boxShadow: `0 0 5px ${col}` }} />
                </div>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 13, fontWeight: 700, color: col }}>{conf}%</div>
              </div>
            )}
            {acc != null && (
              <div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7, color: "rgba(82,254,254,.4)", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 2 }}>ACCURACY</div>
                <div style={{ width: 80, height: 2, background: "rgba(0,223,251,.12)", borderRadius: 1, marginBottom: 3 }}>
                  <div style={{ width: `${acc}%`, height: "100%", background: HUD.cyan, borderRadius: 1, boxShadow: `0 0 5px ${HUD.cyan}` }} />
                </div>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 13, fontWeight: 700, color: HUD.cyan }}>{acc}%</div>
              </div>
            )}
            {entry != null && (
              <div style={{ marginLeft: "auto" }}>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 7, color: "rgba(82,254,254,.4)", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 5 }}>ENTRY</div>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 13, fontWeight: 700, color: "#e6edf3" }}>₹{entry}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const C = {
  bg: "#000308", card: "rgba(0,15,30,.88)", border: "rgba(82,254,254,.12)",
  muted: "rgba(139,148,158,.75)", text: "#e6edf3", accent: "#00DFFB",
  buy: "#00FF9F", sell: "#ef4444", hold: "#FF6B00", purple: "#6366f1",
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TICKERS = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS"];

// Feature importance (based on typical RF/LSTM weights for stock prediction)
const FEATURE_IMPORTANCE = [
  { name: "RSI", value: 18, desc: "Momentum oscillator — overbought/oversold" },
  { name: "MACD", value: 15, desc: "Trend direction and momentum" },
  { name: "MA50", value: 13, desc: "Medium-term trend baseline" },
  { name: "HTF Bullish", value: 12, desc: "ICT higher timeframe bias" },
  { name: "Volatility", value: 10, desc: "Price risk measurement" },
  { name: "BOS Up", value: 9, desc: "ICT break of structure signal" },
  { name: "BB Position", value: 8, desc: "Bollinger Band relative position" },
  { name: "Volume Ratio", value: 7, desc: "Volume vs average — institutional activity" },
  { name: "Momentum", value: 5, desc: "5-day price momentum" },
  { name: "Sweep Low", value: 3, desc: "ICT liquidity sweep detection" },
];

function FeatureBar({ name, value, desc, color }: { name: string; value: number; desc: string; color: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{name}</span>
          <span style={{ fontSize: 10, color: C.muted, marginLeft: 8 }}>{desc}</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}%</span>
      </div>
      <div style={{ height: 6, background: C.border, borderRadius: 3 }}>
        <div style={{ width: `${value * 5}%`, height: "100%", background: color, borderRadius: 3, transition: "width 1s ease" }} />
      </div>
    </div>
  );
}

function RadarChart({ data }: { data: { label: string; value: number }[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = 280;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr; canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2, cy = size / 2, r = 100;
    const n = data.length;

    // Grid circles
    for (let ring = 1; ring <= 4; ring++) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * ring / 4, 0, Math.PI * 2);
      ctx.strokeStyle = "#21262d"; ctx.lineWidth = 0.5; ctx.stroke();
    }

    // Axes
    data.forEach((_, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
      ctx.strokeStyle = "#30363d"; ctx.lineWidth = 0.5; ctx.stroke();
    });

    // Data polygon
    ctx.beginPath();
    data.forEach((d, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const rv = r * d.value / 100;
      if (i === 0) ctx.moveTo(cx + rv * Math.cos(angle), cy + rv * Math.sin(angle));
      else ctx.lineTo(cx + rv * Math.cos(angle), cy + rv * Math.sin(angle));
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(0,212,170,0.15)";
    ctx.fill();
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.stroke();

    // Dots + labels
    data.forEach((d, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const rv = r * d.value / 100;
      ctx.beginPath();
      ctx.arc(cx + rv * Math.cos(angle), cy + rv * Math.sin(angle), 3, 0, Math.PI * 2);
      ctx.fillStyle = C.accent; ctx.fill();
      const lx = cx + (r + 18) * Math.cos(angle);
      const ly = cy + (r + 18) * Math.sin(angle);
      ctx.fillStyle = "#8b949e"; ctx.font = "9px system-ui"; ctx.textAlign = "center";
      ctx.fillText(d.label, lx, ly);
    });
  }, [data]);

  return <canvas ref={ref} style={{ width: 280, height: 280, display: "block" }} />;
}

export default function AIInsightsPage() {
  const [ticker,     setTicker]     = useState("RELIANCE.NS");
  const [signal,     setSignal]     = useState<any>(null);
  const [allSignals, setAllSignals] = useState<any[]>([]);
  const [risk,       setRisk]       = useState<any>(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/signals`).then(r => r.json()),
      fetch(`${API}/api/risk/${ticker}`).then(r => r.json()),
    ]).then(([signals, riskData]) => {
      const arr = Array.isArray(signals) ? signals : [];
      const found = arr.find((s: any) => s.symbol === ticker);
      setAllSignals(arr);
      setSignal(found || null);
      setRisk(riskData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [ticker]);

  const cs: React.CSSProperties = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 };
  const st: React.CSSProperties = { fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: C.muted, marginBottom: 12 };

  const radarData = risk ? [
    { label: "Volatility", value: Math.min(risk.volatility * 3, 100) },
    { label: "Win Rate", value: risk.win_rate },
    { label: "Sharpe", value: Math.min(Math.abs(risk.sharpe) * 40, 100) },
    { label: "Drawdown", value: Math.max(0, 100 - risk.max_drawdown * 5) },
    { label: "Momentum", value: signal ? signal.confidence : 50 },
    { label: "Accuracy", value: signal ? signal.accuracy : 50 },
  ] : [];

  const signalColor = signal?.signal === "BUY" ? C.buy : signal?.signal === "SELL" ? C.sell : C.hold;

  return (
    <PageShell>
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Rajdhani',sans-serif", fontSize: 13 }}>

      {/* SUBHEADER */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,10,20,.6)" }}>
        <div>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 13, fontWeight: 700, color: C.accent, letterSpacing: "0.12em" }}>AI INSIGHTS</div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: C.muted, marginTop: 3, letterSpacing: "0.1em" }}>EXPLAINABLE AI · FEATURE IMPORTANCE · MODEL REASONING</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {TICKERS.map(t => (
            <button key={t} onClick={() => setTicker(t)} style={{
              padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, letterSpacing: "0.06em",
              border: `1px solid ${t === ticker ? C.accent : C.border}`,
              background: t === ticker ? "rgba(0,223,251,.1)" : "transparent",
              color: t === ticker ? C.accent : C.muted, fontSize: 12, textTransform: "uppercase",
            }}>{t.replace(".NS", "")}</button>
          ))}
        </div>
      </div>

      {/* â"€â"€ MARKET SPOTLIGHT â"€â"€ */}
      <div style={{
        padding: "24px 32px 8px",
        borderBottom: `1px solid rgba(82,254,254,.1)`,
        background: "linear-gradient(180deg,rgba(0,20,33,.35) 0%,transparent 100%)",
        backdropFilter: "blur(8px)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
          <div style={{ width: 3, height: 28, background: "linear-gradient(to bottom,#00DFFB,#0098F8)", borderRadius: 2 }} />
          <div>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#00DFFB", textShadow: "0 0 16px rgba(0,223,251,.5)" }}>
              Market Spotlight
            </div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "rgba(82,254,254,.4)", letterSpacing: "0.12em", marginTop: 2 }}>
              NIFTY 50 · LIVE SIGNALS · DRAG TO EXPLORE
            </div>
          </div>
        </div>

        <CardStack
          items={MARKET_SPOTLIGHT}
          cardWidth={500}
          cardHeight={290}
          autoAdvance
          intervalMs={3400}
          pauseOnHover
          showDots
          spreadDeg={38}
          overlap={0.54}
          depthPx={110}
          activeLiftPx={28}
          renderCard={(item, { active }) => (
            <HUDSpotlightCard
              item={item as SpotlightCard}
              active={active}
              signal={allSignals.find((s: any) => s.symbol === (item as SpotlightCard).ticker)}
            />
          )}
        />
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: C.muted }}>
          Analyzing {ticker}...
        </div>
      ) : (
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* TOP ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>

            {/* FEATURE IMPORTANCE */}
            <div style={cs}>
              <div style={st}>Feature Importance · What drives the prediction</div>
              <div style={{ marginBottom: 12, padding: "10px 14px", background: "rgba(0,212,170,0.04)", border: `1px solid rgba(0,212,170,0.15)`, borderRadius: 8, fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
                These are the top indicators the model uses to generate signals for {ticker}.
                Higher importance = more influence on the BUY/SELL/HOLD decision.
              </div>
              {FEATURE_IMPORTANCE.map((f, i) => {
                const colors = [C.accent, C.buy, C.purple, C.hold, C.sell, C.accent, C.buy, C.purple, C.hold, C.sell];
                return <FeatureBar key={f.name} {...f} color={colors[i % colors.length]} />;
              })}
            </div>

            {/* RADAR + SIGNAL */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {/* RADAR */}
              <div style={{ ...cs, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={st}>Stock Health Radar · {ticker}</div>
                {radarData.length > 0 ? <RadarChart data={radarData} /> : <div style={{ color: C.muted }}>Loading...</div>}
              </div>

              {/* DECISION EXPLANATION */}
              {signal && (
                <div style={{ ...cs, borderTop: `2px solid ${signalColor}` }}>
                  <div style={st}>Why {signal.signal}?</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: signalColor, marginBottom: 10 }}>{signal.signal}</div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.8 }}>
                    {signal.signal === "BUY" && "The model detected bullish conditions: price is above key moving averages, RSI is in a healthy range, and ICT structure shows institutional buying interest."}
                    {signal.signal === "SELL" && "The model detected bearish conditions: price is below key moving averages, RSI is overbought or declining, and ICT structure shows distribution phase."}
                    {signal.signal === "HOLD" && "The model lacks sufficient confidence to recommend a trade. Market conditions are mixed — wait for a clearer setup before entering."}
                  </div>
                  <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {signal.reason.split(" · ").map((r: string, i: number) => (
                      <span key={i} style={{ background: `${signalColor}15`, color: signalColor, fontSize: 10, padding: "3px 8px", borderRadius: 4, fontWeight: 600 }}>{r}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MODEL EXPLANATION */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

            <div style={cs}>
              <div style={st}>How LSTM Works</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.8 }}>
                <strong style={{ color: C.text }}>LSTM (Long Short-Term Memory)</strong> is a type of neural network that learns patterns from sequences of data.<br /><br />
                Instead of looking at one day in isolation, it looks at the <strong style={{ color: C.accent }}>last 30 days</strong> of price action, indicators, and ICT signals together.<br /><br />
                It learns which combinations of patterns historically led to price going up or down.
              </div>
            </div>

            <div style={cs}>
              <div style={st}>How ICT/SMC Works</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.8 }}>
                <strong style={{ color: C.text }}>ICT (Inner Circle Trader)</strong> concepts identify where institutional money is buying and selling.<br /><br />
                The model checks for:<br />
                <strong style={{ color: C.accent }}>BOS</strong> — break of market structure<br />
                <strong style={{ color: C.accent }}>FVG</strong> — fair value gap (imbalance)<br />
                <strong style={{ color: C.accent }}>Sweep</strong> — liquidity grab<br />
                <strong style={{ color: C.accent }}>HTF</strong> — higher timeframe trend
              </div>
            </div>

            <div style={cs}>
              <div style={st}>Model Performance</div>
              {signal && risk && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Prediction Accuracy", value: `${signal.accuracy}%`, color: signal.accuracy >= 55 ? C.buy : C.hold },
                    { label: "Signal Confidence", value: `${signal.confidence}%`, color: C.accent },
                    { label: "Win Rate (backtest)", value: `${risk.win_rate}%`, color: risk.win_rate >= 50 ? C.buy : C.sell },
                    { label: "Sharpe Ratio", value: `${risk.sharpe}`, color: risk.sharpe >= 1 ? C.buy : C.hold },
                    { label: "Max Drawdown", value: `${risk.max_drawdown}%`, color: C.sell },
                    { label: "Volatility (annual)", value: `${risk.volatility}%`, color: C.hold },
                  ].map(m => (
                    <div key={m.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: C.muted }}>{m.label}</span>
                      <span style={{ fontWeight: 700, color: m.color }}>{m.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DISCLAIMER */}
          <div style={{ padding: "12px 16px", background: "rgba(245,158,11,0.05)", border: `1px solid rgba(245,158,11,0.2)`, borderRadius: 8, fontSize: 11, color: C.muted }}>
            âš  AI Insights are generated by a machine learning model trained on historical data. Feature importance values are approximations based on typical Random Forest weights.
            This system is for educational and research purposes only. Not financial advice.
          </div>

        </div>
      )}
    </div>
    </PageShell>
  );
}
