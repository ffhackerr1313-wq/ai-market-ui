"use client";
import { useState, useEffect } from "react";
import PageShell from "@/components/PageShell";

const C = {
  bg: "#000308", card: "rgba(0,15,30,.88)", border: "rgba(82,254,254,.12)",
  muted: "rgba(139,148,158,.75)", text: "#e6edf3", accent: "#00DFFB",
  buy: "#00FF9F", sell: "#ef4444", hold: "#FF6B00", purple: "#6366f1",
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Signal = {
  symbol: string; signal: string; confidence: number;
  accuracy: number; model: string; reason: string;
  breakout_up: boolean; breakout_down: boolean;
  volume_spike: boolean; volume_ratio: number;
  scanner_signal: string; breakout_strength: string;
  entry: number | null; stop_loss: number | null;
  target1: number | null; target2: number | null;
  risk_reward: number; atr: number;
  kelly_full_pct: number; kelly_half_pct: number;
  position_size_inr: number; sizing_label: string; capital: number;
};

type TFBias = {
  bias: "BULLISH" | "BEARISH" | "NEUTRAL";
  score: number; signals: number;
  rsi?: number; macd_cross?: boolean; above_ma50?: boolean; close?: number;
  error?: string;
};

type ConfluenceData = {
  ticker: string;
  confluence: string;
  strength: number;
  bull_tfs: number; bear_tfs: number; neutral_tfs: number;
  bull_pct: number; bear_pct: number;
  recommendation: string;
  details: Record<string, TFBias>;
};

type StrategyMeta = {
  key?: string;
  name: string;
  description: string;
  timeframe: string;
  expected_trades: string;
  why_better: string;
};

type StrategyData = {
  active: string;
  meta: StrategyMeta;
  available: Array<{ key: string } & StrategyMeta>;
};

type FilterType = "ALL" | "BUY" | "SELL" | "HOLD";

const INR = (v: number | null) =>
  v == null ? “—“ : “₹” + v.toLocaleString(“en-IN”, { maximumFractionDigits: 2 });

const pct = (price: number | null, ref: number | null) => {
  if (!price || !ref) return "";
  const p = ((price - ref) / ref) * 100;
  return `${p >= 0 ? "+" : ""}${p.toFixed(1)}%`;
};

function Badge({ type }: { type: string }) {
  const map: Record<string, [string, string]> = {
    BUY: ["rgba(16,185,129,0.15)", "#10b981"],
    SELL: ["rgba(239,68,68,0.15)", "#ef4444"],
    HOLD: ["rgba(245,158,11,0.15)", "#f59e0b"],
  };
  const [bg, color] = map[type] || map.HOLD;
  return (
    <span style={{ background: bg, color, border: `1px solid ${color}44`, padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
      {type}
    </span>
  );
}

function Bar({ pct, color, h = 4 }: { pct: number; color: string; h?: number }) {
  return (
    <div style={{ height: h, background: C.border, borderRadius: 2 }}>
      <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.6s ease" }} />
    </div>
  );
}

function ConfluenceMini({ data }: { data: ConfluenceData | undefined }) {
  if (!data) return null;
  const tfs = ["1D", "4H", "1H"];
  const biasColor = (b: string) =>
    b === "BULLISH" ? C.buy : b === "BEARISH" ? C.sell : C.muted;
  const confColor =
    data.confluence === "STRONG BULL" || data.confluence === "BULL" ? C.buy :
    data.confluence === "STRONG BEAR" || data.confluence === "BEAR" ? C.sell : C.muted;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
      <span style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>MTF</span>
      {tfs.map(tf => {
        const b = data.details[tf];
        return (
          <div key={tf} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: b ? biasColor(b.bias) : C.muted, boxShadow: b && b.bias !== "NEUTRAL" ? `0 0 4px ${biasColor(b.bias)}88` : "none" }} />
            <span style={{ fontSize: 9, color: C.muted }}>{tf}</span>
          </div>
        );
      })}
      <span style={{ fontSize: 9, fontWeight: 700, color: confColor, marginLeft: 2 }}>
        {data.bull_tfs}B·{data.bear_tfs}S
      </span>
    </div>
  );
}

function ConfluencePanel({ data }: { data: ConfluenceData | null }) {
  if (!data) return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: C.muted, marginBottom: 12 }}>Multi-Timeframe Confluence</div>
      <div style={{ color: C.muted, fontSize: 12 }}>Loading confluence...</div>
    </div>
  );

  const confColor =
    data.confluence === "STRONG BULL" ? C.buy :
    data.confluence === "BULL"        ? "#34d399" :
    data.confluence === "STRONG BEAR" ? C.sell :
    data.confluence === "BEAR"        ? "#f87171" : C.muted;

  const tfs = ["1D", "4H", "1H"];

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: C.muted, marginBottom: 12 }}>
        Multi-Timeframe Confluence
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: `${confColor}0d`, border: `1px solid ${confColor}33`, borderRadius: 8, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: confColor }}>{data.confluence}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{data.recommendation}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Timeframe agreement</div>
          <div style={{ display: "flex", gap: 4 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{
                width: 24, height: 8, borderRadius: 2,
                background: i < data.bull_tfs ? C.buy : i < data.bull_tfs + data.bear_tfs ? C.sell : C.border,
              }} />
            ))}
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>
            {data.bull_tfs} bull · {data.bear_tfs} bear · {data.neutral_tfs} neutral
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tfs.map(tf => {
          const b = data.details[tf];
          if (!b) return null;
          const bColor = b.bias === "BULLISH" ? C.buy : b.bias === "BEARISH" ? C.sell : C.muted;
          return (
            <div key={tf} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
              <div style={{ width: 28, fontSize: 11, fontWeight: 700, color: C.muted }}>{tf}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 80 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: bColor, boxShadow: b.bias !== "NEUTRAL" ? `0 0 5px ${bColor}99` : "none" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: bColor }}>{b.bias}</span>
              </div>
              <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
                {b.above_ma50 !== undefined && (
                  <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: b.above_ma50 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: b.above_ma50 ? C.buy : C.sell }}>
                    {b.above_ma50 ? "â†‘MA50" : "â†“MA50"}
                  </span>
                )}
                {b.rsi !== undefined && (
                  <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: "rgba(99,102,241,0.1)", color: C.purple }}>
                    RSI {b.rsi}
                  </span>
                )}
                {b.macd_cross !== undefined && (
                  <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: b.macd_cross ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: b.macd_cross ? C.buy : C.sell }}>
                    {b.macd_cross ? "MACD+" : "MACD-"}
                  </span>
                )}
                {b.error && <span style={{ fontSize: 9, color: C.muted, fontStyle: "italic" }}>{b.error}</span>}
              </div>
              <div style={{ width: 60 }}>
                <div style={{ height: 4, background: C.border, borderRadius: 2 }}>
                  <div style={{ width: `${Math.min(Math.abs(b.score) * 100, 100)}%`, height: "100%", borderRadius: 2, background: bColor }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 10, fontSize: 10, color: C.muted, lineHeight: 1.7 }}>
        Scores price vs MA50, RSI, MACD cross, and ICT structure across three timeframes.
        2+ agreeing TFs = tradeable confluence. 1 or 0 = wait for alignment.
      </div>
    </div>
  );
}

function TradePlan({ s }: { s: Signal }) {
  if (!s.entry || !s.stop_loss || !s.target1) return null;
  const signalColor = s.signal === "BUY" ? C.buy : s.signal === "SELL" ? C.sell : C.hold;
  const slPct = pct(s.stop_loss, s.entry);
  const tp1Pct = pct(s.target1, s.entry);
  const tp2Pct = pct(s.target2, s.entry);

  return (
    <div style={{ padding: "14px 16px", background: `${signalColor}08`, border: `1px solid ${signalColor}33`, borderRadius: 8 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: signalColor, marginBottom: 12 }}>
        Trade Plan · ATR(14) = {INR(s.atr)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { lbl: "Entry", val: INR(s.entry), sub: "current price", color: C.text },
          { lbl: "Stop Loss", val: INR(s.stop_loss), sub: slPct, color: C.sell },
          { lbl: "Target 1", val: INR(s.target1), sub: tp1Pct, color: C.buy },
          { lbl: "Target 2", val: INR(s.target2), sub: tp2Pct, color: C.accent },
        ].map(row => (
          <div key={row.lbl} style={{ padding: "10px 12px", background: C.bg, borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>{row.lbl}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: row.color }}>{row.val}</div>
            <div style={{ fontSize: 10, color: C.muted }}>{row.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10, display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <span style={{ color: C.muted }}>Risk / Reward</span>
          <span style={{ fontWeight: 700, color: s.risk_reward >= 2 ? C.buy : s.risk_reward >= 1 ? C.hold : C.sell }}>
            1 : {s.risk_reward.toFixed(1)}
            {s.risk_reward >= 2 ? " âœ“ Good" : s.risk_reward >= 1 ? " ↓ OK" : " âœ— Poor"}
          </span>
        </div>
        {s.kelly_half_pct > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: "8px 10px", borderRadius: 6, background: "rgba(0,212,170,0.06)", border: `1px solid rgba(0,212,170,0.15)` }}>
            <div>
              <div style={{ color: C.muted, fontSize: 10, marginBottom: 2 }}>Position Size · Half-Kelly</div>
              <div style={{ fontWeight: 700, color: C.accent, fontSize: 14 }}>
                ₹{s.position_size_inr.toLocaleString("en-IN")}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>{s.kelly_half_pct.toFixed(1)}% of ₹{(s.capital / 1000).toFixed(0)}k</div>
              <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, fontWeight: 700,
                background: s.sizing_label === "AGGRESSIVE" ? "rgba(239,68,68,0.12)" : s.sizing_label === "MODERATE" ? "rgba(245,158,11,0.12)" : "rgba(16,185,129,0.1)",
                color: s.sizing_label === "AGGRESSIVE" ? C.sell : s.sizing_label === "MODERATE" ? C.hold : C.buy,
              }}>{s.sizing_label}</span>
            </div>
          </div>
        )}
        {s.kelly_half_pct === 0 && (
          <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>
            Kelly ↑ 0 · Negative expectation — do not trade
          </div>
        )}
      </div>
    </div>
  );
}

// â”€â”€ Strategy Selector â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function StrategySelector({
  strategyData, switching, onSwitch,
}: {
  strategyData: StrategyData | null;
  switching: boolean;
  onSwitch: (key: string) => void;
}) {
  if (!strategyData) return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: C.muted }}>Loading strategy...</div>
    </div>
  );

  const active = strategyData.active;
  const meta   = strategyData.meta;

  const TF_COLOR: Record<string, string> = {
    "1h": C.accent, "1d": C.purple,
  };

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", marginBottom: 16 }}>
      {/* Title row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted }}>
          Active Strategy
        </div>
        {switching && (
          <div style={{ fontSize: 11, color: C.accent }}>Switching...</div>
        )}
      </div>

      {/* Strategy buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {strategyData.available.map(s => {
          const isActive = s.key === active;
          const tfColor = TF_COLOR[s.timeframe] || C.muted;
          return (
            <button
              key={s.key}
              onClick={() => !switching && s.key !== active && onSwitch(s.key!)}
              disabled={switching}
              style={{
                padding: "7px 14px", borderRadius: 7, cursor: switching ? "default" : (s.key === active ? "default" : "pointer"),
                fontFamily: "inherit", fontSize: 12, fontWeight: 700,
                border: `1px solid ${isActive ? C.accent : C.border}`,
                background: isActive ? "rgba(0,212,170,0.12)" : "transparent",
                color: isActive ? C.accent : C.muted,
                transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {isActive && <span style={{ fontSize: 10 }}>âœ“</span>}
              {s.name}
              <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3,
                background: `${tfColor}18`, color: tfColor, fontWeight: 600 }}>
                {s.timeframe}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active strategy description */}
      <div style={{ padding: "10px 14px", background: "rgba(0,212,170,0.05)", border: `1px solid rgba(0,212,170,0.15)`, borderRadius: 8, display: "flex", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{meta.description}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ color: C.muted }}>Trades/day:</span>
            <span style={{ color: C.accent, fontWeight: 700 }}>{meta.expected_trades}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ color: C.muted }}>Data:</span>
            <span style={{ color: TF_COLOR[meta.timeframe] || C.muted, fontWeight: 700 }}>{meta.timeframe} bars</span>
          </div>
          <div style={{ fontSize: 10, color: C.muted, maxWidth: 240, lineHeight: 1.5 }}>
            ðŸ’¡ {meta.why_better}
          </div>
        </div>
      </div>
    </div>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// â”€â”€ MAIN PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export default function SignalsPage() {
  const [signals,       setSignals]       = useState<Signal[]>([]);
  const [tickers,       setTickers]       = useState<{ symbol: string; price: string; change: number }[]>([]);
  const [confluenceMap, setConfluenceMap] = useState<Record<string, ConfluenceData>>({});
  const [loading,       setLoading]       = useState(true);
  const [lastUpdate,    setLastUpdate]    = useState("");
  const [selected,      setSelected]      = useState<Signal | null>(null);

  // Strategy
  const [strategyData,  setStrategyData]  = useState<StrategyData | null>(null);
  const [switching,     setSwitching]     = useState(false);

  // Filter
  const [filter, setFilter] = useState<FilterType>("ALL");

  const fetchData = async () => {
    try {
      const [s, t] = await Promise.all([
        fetch(`${API}/api/signals`).then(r => r.json()),
        fetch(`${API}/api/tickers`).then(r => r.json()),
      ]);
      setSignals(Array.isArray(s) ? s : []);
      setTickers(Array.isArray(t) ? t : []);
      setLastUpdate(new Date().toLocaleTimeString());
      if (Array.isArray(s) && s.length > 0) {
        setSelected(prev => prev ? (s.find((x: Signal) => x.symbol === prev.symbol) ?? s[0]) : s[0]);
      }
    } catch { }
    finally { setLoading(false); }
  };

  const fetchStrategy = async () => {
    try {
      const d = await fetch(`${API}/api/strategy`).then(r => r.json());
      setStrategyData(d);
    } catch { }
  };

  const switchStrategy = async (key: string) => {
    setSwitching(true);
    try {
      await fetch(`${API}/api/strategy/${key}`, { method: "POST" });
      await fetchStrategy();
      setLoading(true);
      await fetchData();
    } catch { }
    setSwitching(false);
  };

  const fetchConfluence = async () => {
    try {
      const data: ConfluenceData[] = await fetch(`${API}/api/confluence`).then(r => r.json());
      const map: Record<string, ConfluenceData> = {};
      data.forEach(d => { map[d.ticker] = d; });
      setConfluenceMap(map);
    } catch { }
  };

  useEffect(() => {
    fetchData();
    fetchStrategy();
    fetchConfluence();
    const iv  = setInterval(fetchData, 30000);
    const iv2 = setInterval(fetchConfluence, 1800000);
    return () => { clearInterval(iv); clearInterval(iv2); };
  }, []);

  const cs: React.CSSProperties  = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 };
  const lbl: React.CSSProperties = { fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: C.muted, marginBottom: 12 };

  // Filter
  const filteredSignals = filter === "ALL" ? signals : signals.filter(s => s.signal === filter);

  const buys  = signals.filter(s => s.signal === "BUY").length;
  const sells = signals.filter(s => s.signal === "SELL").length;
  const holds = signals.filter(s => s.signal === "HOLD").length;
  const avgConf = signals.length ? Math.round(signals.reduce((a, s) => a + s.confidence, 0) / signals.length) : 0;
  const avgAcc  = signals.length ? (signals.reduce((a, s) => a + s.accuracy,    0) / signals.length).toFixed(1) : "0";

  const selectedConf = selected ? confluenceMap[selected.symbol] ?? null : null;

  return (
    <PageShell>
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Rajdhani',sans-serif", fontSize: 13 }}>

      {/* SUBHEADER */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,10,20,.6)" }}>
        <div>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 13, fontWeight: 700, color: C.accent, letterSpacing: "0.12em" }}>LIVE SIGNALS</div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: C.muted, marginTop: 3, letterSpacing: "0.1em" }}>
            {strategyData ? `${strategyData.meta.name} · ${signals.length} STOCKS SCANNED` : "MULTI-STRATEGY SCANNER"} · {lastUpdate ? `UPDATED ${lastUpdate}` : "LOADING..."}
          </div>
        </div>
        <button onClick={() => { setLoading(true); fetchData(); fetchConfluence(); }}
          style={{ padding: "6px 16px", borderRadius: 6, cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", border: `1px solid rgba(0,223,251,.3)`, background: "rgba(0,223,251,.08)", color: C.accent, fontSize: 12 }}>
          â†» Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 12 }}>
          <div style={{ width: 32, height: 32, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <div style={{ color: C.muted, fontSize: 13 }}>
            Scanning {signals.length > 0 ? signals.length : "60"} stocks with {strategyData?.meta.name ?? "strategy"}...
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>First load takes ~15 s (bulk download). Cached for 10 min after.</div>
        </div>
      ) : (
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* STRATEGY SELECTOR */}
          <StrategySelector strategyData={strategyData} switching={switching} onSwitch={switchStrategy} />

          {/* SUMMARY CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
            {[
              { label: "BUY Signals",    value: buys.toString(),  color: C.buy },
              { label: "SELL Signals",   value: sells.toString(), color: C.sell },
              { label: "HOLD Signals",   value: holds.toString(), color: C.hold },
              { label: "Avg Confidence", value: `${avgConf}%`,    color: C.accent },
              { label: "Stocks Scanned", value: signals.length.toString(), color: C.purple },
            ].map(m => (
              <div key={m.label} style={cs}>
                <div style={lbl}>{m.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* FILTER TABS */}
          <div style={{ display: "flex", gap: 8 }}>
            {(["ALL","BUY","SELL","HOLD"] as FilterType[]).map(f => {
              const count = f === "ALL" ? signals.length : signals.filter(s => s.signal === f).length;
              const color = f === "BUY" ? C.buy : f === "SELL" ? C.sell : f === "HOLD" ? C.hold : C.accent;
              const active = filter === f;
              return (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: "6px 16px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
                  fontSize: 12, fontWeight: 700,
                  border: `1px solid ${active ? color : C.border}`,
                  background: active ? `${color}18` : "transparent",
                  color: active ? color : C.muted,
                  transition: "all 0.15s",
                }}>
                  {f} <span style={{ fontSize: 10, opacity: 0.8 }}>({count})</span>
                </button>
              );
            })}
          </div>

          {/* SIGNAL CARDS + DETAIL */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* SIGNAL LIST */}
            <div style={cs}>
              <div style={lbl}>
                {filter === "ALL" ? "All Signals" : `${filter} Signals`}
                <span style={{ fontWeight: 400, marginLeft: 8, color: C.muted }}>({filteredSignals.length})</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 600, overflowY: "auto" }}>
                {filteredSignals.map(s => {
                  const ticker = tickers.find(t => t.symbol === s.symbol);
                  const isSelected = selected?.symbol === s.symbol;
                  const conf = confluenceMap[s.symbol];
                  return (
                    <div key={s.symbol} onClick={() => setSelected(s)} style={{
                      padding: "14px 16px",
                      background: isSelected ? "rgba(0,212,170,0.05)" : C.bg,
                      border: `1px solid ${isSelected ? C.accent : C.border}`,
                      borderRadius: 8, cursor: "pointer", transition: "all 0.2s",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700 }}>{s.symbol.replace(".NS", "")}</div>
                          <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>
                            {ticker ? `${ticker.price} ${ticker.change > 0 ? “▲” : “▼”} ${Math.abs(ticker.change)}%` : “—“}
                          </div>
                        </div>
                        <Badge type={s.signal} />
                      </div>

                      {s.signal !== "HOLD" && s.entry && s.stop_loss && s.target1 && (
                        <div style={{ fontSize: 11, padding: "6px 10px", borderRadius: 5, background: C.card, marginBottom: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ color: C.muted }}>Entry</span>
                          <span style={{ fontWeight: 600 }}>{INR(s.entry)}</span>
                          <span style={{ color: C.muted }}>·</span>
                          <span style={{ color: C.sell }}>SL {INR(s.stop_loss)}</span>
                          <span style={{ color: C.muted }}>·</span>
                          <span style={{ color: C.buy }}>TP {INR(s.target1)}</span>
                          <span style={{ color: C.muted }}>·</span>
                          <span style={{ color: s.risk_reward >= 2 ? C.buy : C.hold }}>R:R {s.risk_reward.toFixed(1)}</span>
                        </div>
                      )}

                      <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                        <span>Confidence</span><span style={{ color: C.text }}>{s.confidence}%</span>
                      </div>
                      <Bar pct={s.confidence} color={s.signal === "BUY" ? C.buy : s.signal === "SELL" ? C.sell : C.hold} />

                      <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>{s.reason}</div>
                      <ConfluenceMini data={conf} />
                    </div>
                  );
                })}
                {filteredSignals.length === 0 && (
                  <div style={{ color: C.muted, fontSize: 12, padding: 12, textAlign: "center" }}>
                    No {filter} signals right now.
                  </div>
                )}
              </div>
            </div>

            {/* SIGNAL DETAIL */}
            {selected && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                <div style={cs}>
                  <div style={lbl}>Trade Plan · {selected.symbol.replace(".NS", "")}</div>
                  {selected.signal !== "HOLD" ? (
                    <TradePlan s={selected} />
                  ) : (
                    <div style={{ padding: "14px 16px", background: "rgba(245,158,11,0.05)", border: `1px solid rgba(245,158,11,0.2)`, borderRadius: 8, fontSize: 12, color: C.muted }}>
                      No trade plan — HOLD means wait for a clearer setup. Confidence ({selected.confidence}%) is not high enough to enter.
                    </div>
                  )}
                </div>

                <ConfluencePanel data={selectedConf} />

                <div style={cs}>
                  <div style={lbl}>Signal Analysis</div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6 }}>
                      <span style={{ color: C.muted }}>Signal Confidence</span>
                      <span style={{ fontWeight: 700, color: selected.signal === "BUY" ? C.buy : selected.signal === "SELL" ? C.sell : C.hold }}>
                        {selected.confidence}%
                      </span>
                    </div>
                    <div style={{ height: 8, background: C.border, borderRadius: 4 }}>
                      <div style={{
                        width: `${selected.confidence}%`, height: "100%", borderRadius: 4,
                        background: selected.signal === "BUY" ? `linear-gradient(90deg,${C.buy},${C.accent})` :
                          selected.signal === "SELL" ? `linear-gradient(90deg,${C.sell},${C.hold})` :
                            `linear-gradient(90deg,${C.hold},${C.purple})`,
                        transition: "width 0.8s ease",
                      }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>Strategy Conditions</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {selected.reason.split(" · ").map((r, i) => (
                        <span key={i} style={{ background: `${C.accent}15`, color: C.accent, fontSize: 11, padding: "4px 10px", borderRadius: 4, fontWeight: 600 }}>
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: "12px 14px", background: "rgba(99,102,241,0.05)", border: `1px solid rgba(99,102,241,0.2)`, borderRadius: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.purple, marginBottom: 8 }}>Strategy Info</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11 }}>
                      {[
                        ["Strategy", strategyData?.meta.name ?? selected.model],
                        ["Scanner", selected.scanner_signal],
                        ["Breakout Strength", selected.breakout_strength],
                        ["Volume Ratio", `${selected.volume_ratio}x`],
                        ["Expected Trades/Day", strategyData?.meta.expected_trades ?? "—"],
                      ].map(([k, v]) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: C.muted }}>{k}</span>
                          <span style={{ color: C.text, fontWeight: 600 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={cs}>
                  <div style={lbl}>Signal Strength</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {["Very Weak", "Weak", "Moderate", "Strong", "Very Strong"].map((label, i) => {
                      const threshold = [40, 50, 60, 70, 80][i];
                      const active = selected.confidence >= threshold;
                      const isCurrent = selected.confidence >= threshold && (i === 4 || selected.confidence < [40, 50, 60, 70, 80][i + 1]);
                      return (
                        <div key={label} style={{ flex: 1, textAlign: "center" }}>
                          <div style={{
                            height: 6, borderRadius: 3, marginBottom: 4,
                            background: active ? (selected.signal === "BUY" ? C.buy : selected.signal === "SELL" ? C.sell : C.hold) : C.border,
                            opacity: active ? (isCurrent ? 1 : 0.4) : 0.2,
                          }} />
                          <div style={{ fontSize: 8, color: isCurrent ? C.text : C.muted }}>{label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SUMMARY TABLE */}
          <div style={cs}>
            <div style={lbl}>
              Trade Plan Summary
              <span style={{ fontWeight: 400, marginLeft: 8 }}>({filteredSignals.filter(s => s.signal !== "HOLD").length} actionable)</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["Stock","Signal","Confluence","Entry","Stop Loss","Target 1","Target 2","R:R","Size (½-Kelly)","Confidence","Reason"].map(h => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSignals.map((s, i) => {
                    const conf = confluenceMap[s.symbol];
                    const confColor =
                      conf?.confluence === "STRONG BULL" || conf?.confluence === "BULL" ? C.buy :
                      conf?.confluence === "STRONG BEAR" || conf?.confluence === "BEAR" ? C.sell : C.muted;
                    return (
                      <tr key={s.symbol} onClick={() => setSelected(s)} style={{ borderBottom: i < filteredSignals.length - 1 ? `1px solid ${C.border}` : "none", cursor: "pointer", background: selected?.symbol === s.symbol ? "rgba(0,212,170,0.04)" : "transparent" }}>
                        <td style={{ padding: "12px 10px", fontWeight: 700 }}>{s.symbol.replace(".NS", "")}</td>
                        <td style={{ padding: "12px 10px" }}><Badge type={s.signal} /></td>
                        <td style={{ padding: "12px 10px" }}>
                          {conf ? (
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: confColor }}>{conf.confluence}</div>
                              <div style={{ fontSize: 9, color: C.muted }}>{conf.bull_tfs}B · {conf.bear_tfs}S</div>
                            </div>
                          ) : <span style={{ color: C.muted, fontSize: 10 }}>—</span>}
                        </td>
                        <td style={{ padding: "12px 10px" }}>{INR(s.entry)}</td>
                        <td style={{ padding: "12px 10px", color: C.sell }}>{INR(s.stop_loss)}</td>
                        <td style={{ padding: "12px 10px", color: C.buy }}>{INR(s.target1)}</td>
                        <td style={{ padding: "12px 10px", color: C.accent }}>{INR(s.target2)}</td>
                        <td style={{ padding: "12px 10px", fontWeight: 700, color: s.risk_reward >= 2 ? C.buy : s.risk_reward >= 1 ? C.hold : C.sell }}>
                          {s.signal !== "HOLD" ? `1:${s.risk_reward.toFixed(1)}` : "—"}
                        </td>
                        <td style={{ padding: "12px 10px" }}>
                          {s.signal !== "HOLD" && s.kelly_half_pct > 0 ? (
                            <div>
                              <div style={{ fontWeight: 700, color: C.accent }}>₹{s.position_size_inr.toLocaleString("en-IN")}</div>
                              <div style={{ fontSize: 10, color: C.muted }}>{s.kelly_half_pct.toFixed(1)}% · {s.sizing_label}</div>
                            </div>
                          ) : "—"}
                        </td>
                        <td style={{ padding: "12px 10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 50, height: 4, background: C.border, borderRadius: 2 }}>
                              <div style={{ width: `${s.confidence}%`, height: "100%", background: s.signal === "BUY" ? C.buy : s.signal === "SELL" ? C.sell : C.hold, borderRadius: 2 }} />
                            </div>
                            <span>{s.confidence}%</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 10px", color: C.muted, fontSize: 11, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.reason}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ padding: "10px 14px", background: "rgba(245,158,11,0.05)", border: `1px solid rgba(245,158,11,0.2)`, borderRadius: 8, fontSize: 11, color: C.muted }}>
            âš  Strategy signals are based on technical indicators only. Trade plans use ATR(14)-based stops and targets. Not financial advice.
            First load scans all {signals.length || 60} Nifty 50 stocks at once — takes ~15 s, then cached for 10 min.
          </div>

        </div>
      )}
    </div>
    </PageShell>
  );
}
