"use client";
import { useEffect, useRef, useState } from "react";
import {
  createChart, CandlestickSeries, HistogramSeries, LineSeries,
  createSeriesMarkers, CrosshairMode, LineStyle, ColorType,
  type IChartApi, type ISeriesApi, type UTCTimestamp, type Time,
  type SeriesMarker, type ISeriesMarkersPluginApi,
} from "lightweight-charts";

// ── types matching /api/ohlc ────────────────────────────────────────────────
type Candle = { t: number; o: number; h: number; l: number; c: number; v: number };
type ICTEvent = {
  type: "BOS_UP"|"BOS_DOWN"|"SWEEP_LOW"|"SWEEP_HIGH"|"FVG_BULL"|"FVG_BEAR"|"OB_BULL"|"OB_BEAR";
  t: number; price?: number; high?: number; low?: number; label: string;
};
type PredPoint = { t: number; c: number; high: number; low: number };
type OHLC = {
  symbol: string; timeframe: string; interval: string; count: number;
  candles: Candle[];
  indicators: { ma20:(number|null)[]; ma50:(number|null)[]; ma200:(number|null)[]; ema9:(number|null)[] };
  events: ICTEvent[];
  prediction: { basis:string; p_up:number; daily_vol:number; points:PredPoint[] } | null;
  error?: string;
};
type BacktestTrade = { date: string; type: "BUY"|"SELL"; price: number; pnl: number };

const TIMEFRAMES = ["1m","5m","15m","1h","4h","1d","1wk"] as const;
const TF_LABEL: Record<string,string> = { "1m":"1M","5m":"5M","15m":"15M","1h":"1H","4h":"4H","1d":"1D","1wk":"1W" };

// Convert a YYYY-MM-DD string to a UTC midnight Unix timestamp
function dateToTs(dateStr: string): number {
  return Math.floor(new Date(dateStr + "T00:00:00Z").getTime() / 1000);
}

// Find the closest candle timestamp for a given date (handles weekends/holidays)
function snapToCandle(ts: number, candles: Candle[]): number | null {
  if (!candles.length) return null;
  let best = candles[0].t;
  let bestDiff = Math.abs(candles[0].t - ts);
  for (const c of candles) {
    const diff = Math.abs(c.t - ts);
    if (diff < bestDiff) { best = c.t; bestDiff = diff; }
  }
  // Only snap if within 5 days (avoid placing markers way off-screen)
  return bestDiff <= 5 * 86400 ? best : null;
}

// Trade → chart marker
function tradeToMarker(trade: BacktestTrade, candles: Candle[]): SeriesMarker<Time> | null {
  const ts = snapToCandle(dateToTs(trade.date), candles);
  if (ts === null) return null;
  if (trade.type === "BUY") {
    return { time: ts as UTCTimestamp, position: "belowBar", color: "#00FF9F", shape: "arrowUp", text: "B" };
  }
  const profit = trade.pnl >= 0;
  return {
    time: ts as UTCTimestamp,
    position: "aboveBar",
    color: profit ? "#00FF9F" : "#ef4444",
    shape: "arrowDown",
    text: profit ? `S +₹${Math.round(trade.pnl)}` : `S -₹${Math.round(Math.abs(trade.pnl))}`,
  };
}

// map an ICT event to a candle marker
function toMarker(e: ICTEvent): SeriesMarker<Time> {
  const time = e.t as UTCTimestamp;
  switch (e.type) {
    case "BOS_UP":    return { time, position:"belowBar", color:"#00FF9F", shape:"arrowUp",   text:"BOS" };
    case "BOS_DOWN":  return { time, position:"aboveBar", color:"#ef4444", shape:"arrowDown", text:"BOS" };
    case "SWEEP_LOW": return { time, position:"belowBar", color:"#FF6B00", shape:"circle",    text:"SWP" };
    case "SWEEP_HIGH":return { time, position:"aboveBar", color:"#FF6B00", shape:"circle",    text:"SWP" };
    case "FVG_BULL":  return { time, position:"belowBar", color:"#0098F8", shape:"square",    text:"FVG" };
    case "FVG_BEAR":  return { time, position:"aboveBar", color:"#0098F8", shape:"square",    text:"FVG" };
    case "OB_BULL":   return { time, position:"belowBar", color:"#52FEFE", shape:"square",    text:"OB"  };
    case "OB_BEAR":   return { time, position:"aboveBar", color:"#52FEFE", shape:"square",    text:"OB"  };
  }
}

const INTRADAY_TFS = new Set(["1m","5m","15m","30m","1h","4h"]);

export default function CandleChart({ symbol, apiBase }: { symbol: string; apiBase: string }) {
  const [tf, setTf]               = useState("1d");
  const [showICT, setShowICT]     = useState(true);
  const [showTrades, setShowTrades] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [tradesLoading, setTradesLoading] = useState(false);
  const [error, setError]         = useState("");
  const [data, setData]           = useState<OHLC | null>(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [tradeMarkers, setTradeMarkers] = useState<SeriesMarker<Time>[]>([]);
  // cache fetched trades per symbol so toggling is instant
  const tradesCache = useRef<Record<string, BacktestTrade[]>>({});

  const wrapRef   = useRef<HTMLDivElement>(null);
  const chartRef  = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volRef    = useRef<ISeriesApi<"Histogram"> | null>(null);
  const ma50Ref   = useRef<ISeriesApi<"Line"> | null>(null);
  const ma200Ref  = useRef<ISeriesApi<"Line"> | null>(null);
  const ema9Ref   = useRef<ISeriesApi<"Line"> | null>(null);
  const predRef   = useRef<ISeriesApi<"Line"> | null>(null);
  const bandHiRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bandLoRef = useRef<ISeriesApi<"Line"> | null>(null);
  const markRef   = useRef<ISeriesMarkersPluginApi<Time> | null>(null);

  // ── create chart + series ONCE ─────────────────────────────────────────────
  useEffect(() => {
    if (!wrapRef.current) return;
    const chart = createChart(wrapRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#00111c" },
        textColor: "#8ba3b0",
        fontFamily: "'Share Tech Mono', monospace",
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "rgba(82,254,254,0.04)" },
        horzLines: { color: "rgba(82,254,254,0.04)" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: "rgba(82,254,254,0.12)" },
      timeScale: { borderColor: "rgba(82,254,254,0.12)", timeVisible: true, secondsVisible: false },
    });
    chartRef.current = chart;

    candleRef.current = chart.addSeries(CandlestickSeries, {
      upColor:"#00FF9F", downColor:"#ef4444", borderVisible:false,
      wickUpColor:"#00FF9F", wickDownColor:"#ef4444",
    });
    volRef.current = chart.addSeries(HistogramSeries, {
      priceFormat:{ type:"volume" }, priceScaleId:"vol",
      lastValueVisible:false, priceLineVisible:false,
    });
    chart.priceScale("vol").applyOptions({ scaleMargins:{ top:0.84, bottom:0 } });

    const line = (color:string, width:1|2, dashed=false) =>
      chart.addSeries(LineSeries, {
        color, lineWidth:width, priceLineVisible:false, lastValueVisible:false,
        lineStyle: dashed ? LineStyle.Dashed : LineStyle.Solid, crosshairMarkerVisible:false,
      });
    ma50Ref.current  = line("#FBCA03", 1);
    ma200Ref.current = line("#8b5cf6", 1);
    ema9Ref.current  = line("#00DFFB", 1);
    bandHiRef.current = line("rgba(0,152,248,0.35)", 1, true);
    bandLoRef.current = line("rgba(0,152,248,0.35)", 1, true);
    predRef.current   = line("#0098F8", 2, true);

    markRef.current = createSeriesMarkers(candleRef.current, []);

    return () => { chart.remove(); chartRef.current = null; };
  }, []);

  // ── fetch on symbol / timeframe change — auto-refresh for intraday ──────────
  useEffect(() => {
    let cancelled = false;

    const doFetch = (showSpinner: boolean) => {
      if (showSpinner) { setLoading(true); setError(""); }
      fetch(`${apiBase}/api/ohlc/${encodeURIComponent(symbol)}?timeframe=${tf}`)
        .then(r => r.json())
        .then((d: OHLC) => {
          if (cancelled) return;
          if (d.error && (!d.candles || d.candles.length === 0)) { setError(d.error); setData(null); }
          else {
            setData(d);
            setLastUpdated(new Date().toLocaleTimeString("en-IN", {
              timeZone: "Asia/Kolkata", hour12: false,
              hour: "2-digit", minute: "2-digit", second: "2-digit",
            }));
          }
          setLoading(false);
        })
        .catch(() => { if (!cancelled) { setError("Failed to load chart — is the API on :8000?"); setLoading(false); } });
    };

    doFetch(true);

    // Auto-refresh intraday charts every 30 s to catch the forming candle
    let timer: ReturnType<typeof setInterval> | null = null;
    if (INTRADAY_TFS.has(tf)) {
      timer = setInterval(() => { if (!cancelled) doFetch(false); }, 30_000);
    }

    return () => { cancelled = true; if (timer) clearInterval(timer); };
  }, [symbol, tf, apiBase]);

  // ── fetch backtest trades when showTrades toggled on ──────────────────────
  useEffect(() => {
    if (!showTrades) { setTradeMarkers([]); return; }
    // use cache if available
    if (tradesCache.current[symbol]) {
      const markers = tradesCache.current[symbol]
        .map(t => data ? tradeToMarker(t, data.candles) : null)
        .filter((m): m is SeriesMarker<Time> => m !== null);
      setTradeMarkers(markers);
      return;
    }
    setTradesLoading(true);
    fetch(`${apiBase}/api/backtest/${encodeURIComponent(symbol)}`)
      .then(r => r.json())
      .then(d => {
        const trades: BacktestTrade[] = d.trades ?? [];
        tradesCache.current[symbol] = trades;
        if (data) {
          const markers = trades
            .map(t => tradeToMarker(t, data.candles))
            .filter((m): m is SeriesMarker<Time> => m !== null);
          setTradeMarkers(markers);
        }
      })
      .catch(() => {})
      .finally(() => setTradesLoading(false));
  }, [showTrades, symbol, apiBase]);

  // re-snap trade markers when candle data updates (TF change)
  useEffect(() => {
    if (!showTrades || !data) return;
    const cached = tradesCache.current[symbol];
    if (!cached) return;
    const markers = cached
      .map(t => tradeToMarker(t, data.candles))
      .filter((m): m is SeriesMarker<Time> => m !== null);
    setTradeMarkers(markers);
  }, [data, showTrades, symbol]);

  // ── push data into series whenever it changes ──────────────────────────────
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !data || !candleRef.current) return;
    const cs = data.candles;

    candleRef.current.setData(cs.map(c => ({ time:c.t as UTCTimestamp, open:c.o, high:c.h, low:c.l, close:c.c })));
    volRef.current?.setData(cs.map(c => ({
      time:c.t as UTCTimestamp, value:c.v,
      color: c.c >= c.o ? "rgba(0,255,159,0.35)" : "rgba(239,68,68,0.35)",
    })));

    const lineData = (arr:(number|null)[]) =>
      cs.map((c,i) => ({ time:c.t as UTCTimestamp, value:arr[i] }))
        .filter(p => p.value != null) as { time:UTCTimestamp; value:number }[];
    ma50Ref.current?.setData(lineData(data.indicators.ma50));
    ma200Ref.current?.setData(lineData(data.indicators.ma200));
    ema9Ref.current?.setData(lineData(data.indicators.ema9));

    // prediction line + confidence band (daily only; null otherwise)
    if (data.prediction && cs.length) {
      const last = cs[cs.length - 1];
      const anchor = { time:last.t as UTCTimestamp, value:last.c };
      predRef.current?.setData([anchor, ...data.prediction.points.map(p => ({ time:p.t as UTCTimestamp, value:p.c }))]);
      bandHiRef.current?.setData([anchor, ...data.prediction.points.map(p => ({ time:p.t as UTCTimestamp, value:p.high }))]);
      bandLoRef.current?.setData([anchor, ...data.prediction.points.map(p => ({ time:p.t as UTCTimestamp, value:p.low }))]);
    } else {
      predRef.current?.setData([]); bandHiRef.current?.setData([]); bandLoRef.current?.setData([]);
    }

    const ictMarkers: SeriesMarker<Time>[] = showICT
      ? [...data.events].sort((a,b)=>a.t-b.t).map(toMarker)
      : [];
    const allMarkers = [...ictMarkers, ...tradeMarkers]
      .sort((a, b) => (a.time as number) - (b.time as number));
    markRef.current?.setMarkers(allMarkers);

    chart.timeScale().fitContent();
  }, [data, showICT, tradeMarkers]);

  const pred = data?.prediction;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {/* toolbar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
        <div style={{ display:"flex", gap:4 }}>
          {TIMEFRAMES.map(t => (
            <button key={t} onClick={()=>setTf(t)} className="tbtn" style={{
              border:`1px solid ${t===tf?"#00DFFB":"rgba(82,254,254,0.15)"}`,
              background: t===tf?"rgba(0,223,251,0.12)":"rgba(0,3,8,0.4)",
              color: t===tf?"#00DFFB":"rgba(82,254,254,0.45)",
            }}>{TF_LABEL[t]}</button>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {/* indicator legend */}
          {[["MA50","#FBCA03"],["MA200","#8b5cf6"],["EMA9","#00DFFB"]].map(([l,c])=>(
            <span key={l} style={{ display:"flex", alignItems:"center", gap:4 }}>
              <span style={{ width:12, height:2, background:c, display:"inline-block" }}/>
              <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:"rgba(82,254,254,0.45)", letterSpacing:"0.1em" }}>{l}</span>
            </span>
          ))}
          <button onClick={()=>setShowICT(s=>!s)} className="tbtn" style={{
            border:`1px solid ${showICT?"rgba(0,255,159,0.4)":"rgba(82,254,254,0.15)"}`,
            background: showICT?"rgba(0,255,159,0.08)":"rgba(0,3,8,0.4)",
            color: showICT?"#00FF9F":"rgba(82,254,254,0.45)",
          }}>ICT {showICT?"ON":"OFF"}</button>
          <button onClick={()=>setShowTrades(s=>!s)} className="tbtn" style={{
            border:`1px solid ${showTrades?"rgba(251,202,3,0.5)":"rgba(82,254,254,0.15)"}`,
            background: showTrades?"rgba(251,202,3,0.08)":"rgba(0,3,8,0.4)",
            color: showTrades?"#FBCA03":"rgba(82,254,254,0.45)",
            position:"relative",
          }}>
            {tradesLoading ? "TRADES…" : `TRADES ${showTrades?"ON":"OFF"}`}
          </button>
        </div>
      </div>

      {/* chart surface */}
      <div style={{ position:"relative", width:"100%", height:480, borderRadius:8, overflow:"hidden",
        border:"1px solid rgba(82,254,254,0.1)" }}>
        <div ref={wrapRef} style={{ position:"absolute", inset:0 }}/>
        {loading && (
          <div style={overlay}>
            <div style={{ width:20, height:20, border:"2px solid rgba(0,223,251,.15)",
              borderTop:"2px solid #00DFFB", borderRadius:"50%", animation:"spin-cw .8s linear infinite" }}/>
          </div>
        )}
        {!loading && error && (
          <div style={{ ...overlay, color:"#ef4444", fontFamily:"'Rajdhani',sans-serif", fontSize:12, padding:16, textAlign:"center" }}>
            ⚠ {error}
          </div>
        )}
      </div>

      {/* last updated + IST label */}
      {lastUpdated && (
        <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8,
          letterSpacing:"0.08em", color:"rgba(82,254,254,0.3)",
          display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ color: INTRADAY_TFS.has(tf) ? "#00FF9F" : "rgba(82,254,254,0.3)" }}>●</span>
          <span>IST · LAST UPDATE {lastUpdated}</span>
          {INTRADAY_TFS.has(tf) && <span style={{ color:"rgba(82,254,254,0.25)" }}>· AUTO-REFRESH 30s</span>}
        </div>
      )}

      {/* trade markers legend */}
      {showTrades && tradeMarkers.length > 0 && (
        <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, letterSpacing:"0.08em",
          color:"rgba(82,254,254,0.4)", display:"flex", gap:14, alignItems:"center" }}>
          <span style={{ color:"#FBCA03" }}>BACKTEST TRADES</span>
          <span><span style={{ color:"#00FF9F" }}>▲ B</span> = buy entry</span>
          <span><span style={{ color:"#00FF9F" }}>▼ S +₹</span> = profitable exit</span>
          <span><span style={{ color:"#ef4444" }}>▼ S -₹</span> = losing exit</span>
          <span style={{ color:"rgba(82,254,254,0.25)" }}>{tradeMarkers.length} markers · daily backtest snapped to chart</span>
        </div>
      )}
      {showTrades && !tradesLoading && tradeMarkers.length === 0 && data && (
        <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, letterSpacing:"0.08em",
          color:"rgba(245,158,11,0.5)" }}>
          TRADES: no markers on this timeframe — switch to 1D or 1W to see backtest entries
        </div>
      )}

      {/* prediction caption — honest about what it is */}
      {pred && (
        <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, letterSpacing:"0.08em",
          color:"rgba(82,254,254,0.4)" }}>
          LSTM 5-DAY FORECAST · P(up)={(pred.p_up*100).toFixed(0)}% · band = ±σ·√t (vol {(pred.daily_vol*100).toFixed(1)}%/day) · dashed line, not a price guarantee
        </div>
      )}
    </div>
  );
}

const overlay: React.CSSProperties = {
  position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
  background:"rgba(0,17,28,0.6)", zIndex:5,
};
