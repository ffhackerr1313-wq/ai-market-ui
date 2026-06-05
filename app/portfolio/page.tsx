"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import PageShell from "@/components/PageShell";

const C = {
  bg: "#000308", card: "rgba(0,15,30,.88)", border: "rgba(82,254,254,.12)",
  muted: "rgba(139,148,158,.75)", text: "#e6edf3", accent: "#00DFFB",
  buy: "#00FF9F", sell: "#ef4444", hold: "#FF6B00", purple: "#6366f1",
  overlay: "rgba(0,3,8,.82)",
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Position = {
  id: number;
  symbol: string;
  shares: number;
  avg_cost: number;
  entry_date: string;
  notes: string | null;
  current_price: number;
  invested: number;
  current_value: number;
  pnl: number;
  pnl_pct: number;
};

type PortHist = { m: string; v: number };

const cs: React.CSSProperties = {
  background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16,
};
const label: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
  textTransform: "uppercase", color: C.muted, marginBottom: 12,
};

const INR = (v: number) =>
  "₹" + v.toLocaleString("en-IN", { maximumFractionDigits: 0 });

// â”€â”€ Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type ModalProps = {
  initial?: Partial<Position>;
  onSave: (data: { symbol: string; shares: number; avg_cost: number; entry_date: string; notes: string }) => void;
  onClose: () => void;
};

function PositionModal({ initial, onSave, onClose }: ModalProps) {
  const [sym, setSym] = useState(initial?.symbol ?? "");
  const [shares, setShares] = useState(String(initial?.shares ?? ""));
  const [cost, setCost] = useState(String(initial?.avg_cost ?? ""));
  const [date, setDate] = useState(initial?.entry_date ?? new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [err, setErr] = useState("");

  const inp: React.CSSProperties = {
    width: "100%", background: C.bg, border: `1px solid ${C.border}`,
    borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 13,
    outline: "none", boxSizing: "border-box",
  };
  const row: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 };
  const lbl: React.CSSProperties = { fontSize: 11, color: C.muted, fontWeight: 600 };

  function handleSave() {
    if (!sym.trim()) return setErr("Symbol is required");
    if (!shares || isNaN(Number(shares)) || Number(shares) <= 0) return setErr("Enter valid shares");
    if (!cost || isNaN(Number(cost)) || Number(cost) <= 0) return setErr("Enter valid avg cost");
    if (!date) return setErr("Entry date is required");
    setErr("");
    onSave({ symbol: sym.trim(), shares: Number(shares), avg_cost: Number(cost), entry_date: date, notes });
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: C.overlay, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ ...cs, width: 420, maxWidth: "95vw" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{initial?.id ? "Edit Position" : "Add Position"}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 20, cursor: "pointer", lineHeight: 1 }}>Ã—</button>
        </div>

        <div style={row}>
          <span style={lbl}>Symbol</span>
          <input style={inp} value={sym} onChange={e => setSym(e.target.value.toUpperCase())}
            placeholder="RELIANCE or RELIANCE.NS" disabled={!!initial?.id} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={row}>
            <span style={lbl}>Shares</span>
            <input style={inp} type="number" min="0.001" step="0.001" value={shares} onChange={e => setShares(e.target.value)} placeholder="10" />
          </div>
          <div style={row}>
            <span style={lbl}>Avg Cost (₹)</span>
            <input style={inp} type="number" min="0.01" step="0.01" value={cost} onChange={e => setCost(e.target.value)} placeholder="2920.50" />
          </div>
        </div>
        <div style={row}>
          <span style={lbl}>Entry Date</span>
          <input style={{ ...inp, colorScheme: "dark" }} type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div style={row}>
          <span style={lbl}>Notes (optional)</span>
          <input style={inp} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Swing trade, ICT setup…" />
        </div>

        {err && <div style={{ color: C.sell, fontSize: 12, marginBottom: 10 }}>{err}</div>}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 18px", background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: "8px 18px", background: C.accent, border: "none", borderRadius: 6, color: "#000", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€ Mini spark â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Spark({ positive }: { positive: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const W = 80; const H = 24; const dpr = window.devicePixelRatio || 1;
    c.width = W * dpr; c.height = H * dpr; ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);
    const pts = Array.from({ length: 10 }, (_, i) => {
      const trend = positive ? i / 10 : -i / 10;
      return 0.5 + trend + (Math.random() - 0.5) * 0.15;
    });
    const min = Math.min(...pts); const max = Math.max(...pts);
    const tx = (i: number) => (i / (pts.length - 1)) * W;
    const ty = (v: number) => H - 2 - ((v - min) / (max - min + 0.001)) * (H - 4);
    const col = positive ? C.buy : C.sell;
    ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(tx(i), ty(p)) : ctx.lineTo(tx(i), ty(p)));
    ctx.stroke();
  }, [positive]);
  return <canvas ref={ref} style={{ width: 80, height: 24, display: "block" }} />;
}

// â”€â”€ Main page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function PortfolioPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [history, setHistory] = useState<PortHist[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing?: Position }>({ open: false });
  const [deleting, setDeleting] = useState<number | null>(null);

  const loadPositions = useCallback(() =>
    fetch(`${API}/api/positions`).then(r => r.json()).then(setPositions).catch(() => {}),
    [],
  );

  useEffect(() => {
    Promise.all([
      loadPositions(),
      fetch(`${API}/api/portfolio/history`).then(r => r.json()).then(setHistory).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [loadPositions]);

  async function handleSave(data: { symbol: string; shares: number; avg_cost: number; entry_date: string; notes: string }) {
    const editing = modal.editing;
    if (editing) {
      await fetch(`${API}/api/positions/${editing.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, symbol: editing.symbol }),
      });
    } else {
      await fetch(`${API}/api/positions`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setModal({ open: false });
    await loadPositions();
  }

  async function handleDelete(id: number) {
    setDeleting(id);
    await fetch(`${API}/api/positions/${id}`, { method: "DELETE" });
    setDeleting(null);
    await loadPositions();
  }

  const totalInvested = positions.reduce((s, p) => s + p.invested, 0);
  const totalValue = positions.reduce((s, p) => s + p.current_value, 0);
  const totalPnl = totalValue - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested * 100) : 0;
  const winners = positions.filter(p => p.pnl_pct > 0).length;

  const portColors = [C.accent, C.purple, C.hold, C.sell, C.buy, "#818cf8"];

  return (
    <PageShell>
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Rajdhani',sans-serif", fontSize: 13 }}>

      {/* SUBHEADER */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,10,20,.6)" }}>
        <div>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 13, fontWeight: 700, color: C.accent, letterSpacing: "0.12em" }}>PORTFOLIO</div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: C.muted, marginTop: 3, letterSpacing: "0.1em" }}>
            {positions.length} POSITION{positions.length !== 1 ? "S" : ""} · REAL-TIME P&L
          </div>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          style={{ padding: "7px 18px", background: "linear-gradient(135deg,#00DFFB,#52FEFE)", border: "none", borderRadius: 6, color: "#000308", fontWeight: 700, cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          + Add Position
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: C.muted }}>Loading…</div>
      ) : (
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* SUMMARY CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {[
              { lbl: "Invested", val: INR(totalInvested), sub: `${positions.length} position${positions.length !== 1 ? "s" : ""}`, color: C.accent },
              { lbl: "Current Value", val: INR(totalValue), sub: totalValue >= totalInvested ? "â†‘ portfolio up" : "â†“ portfolio down", color: totalValue >= totalInvested ? C.buy : C.sell },
              { lbl: "Total P&L", val: `${totalPnl >= 0 ? "+" : ""}${INR(totalPnl)}`, sub: `${totalPnlPct >= 0 ? "+" : ""}${totalPnlPct.toFixed(2)}%`, color: totalPnl >= 0 ? C.buy : C.sell },
              { lbl: "Winners", val: `${winners}/${positions.length}`, sub: positions.length ? `${((winners / positions.length) * 100).toFixed(0)}% win rate` : "no positions", color: C.buy },
            ].map(m => (
              <div key={m.lbl} style={cs}>
                <div style={label}>{m.lbl}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: m.color, marginBottom: 4 }}>{m.val}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{m.sub}</div>
              </div>
            ))}
          </div>

          {/* POSITIONS TABLE */}
          <div style={cs}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={label}>Positions</div>
              {positions.length > 0 && (
                <button onClick={() => setModal({ open: true })} style={{ fontSize: 11, background: "none", border: `1px solid ${C.border}`, borderRadius: 5, padding: "4px 10px", color: C.muted, cursor: "pointer" }}>+ Add</button>
              )}
            </div>

            {positions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>ðŸ“‹</div>
                <div style={{ fontSize: 14, marginBottom: 6 }}>No positions yet</div>
                <div style={{ fontSize: 12, marginBottom: 20 }}>Add your first position to start tracking P&L</div>
                <button onClick={() => setModal({ open: true })} style={{ padding: "10px 24px", background: C.accent, border: "none", borderRadius: 6, color: "#000", fontWeight: 700, cursor: "pointer" }}>+ Add Position</button>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {["Symbol", "Shares", "Avg Cost", "Current Price", "Invested", "Value", "P&L", "P&L %", "Entry", ""].map(h => (
                        <th key={h} style={{ padding: "6px 10px", textAlign: h === "" ? "right" : "left", color: C.muted, fontWeight: 600, fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((p, i) => (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}`, opacity: deleting === p.id ? 0.4 : 1, transition: "opacity 0.2s" }}>
                        <td style={{ padding: "10px 10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: portColors[i % portColors.length], flexShrink: 0 }} />
                            <div>
                              <div style={{ fontWeight: 700 }}>{p.symbol.replace(".NS", "")}</div>
                              {p.notes && <div style={{ fontSize: 10, color: C.muted }}>{p.notes}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "10px 10px" }}>{p.shares}</td>
                        <td style={{ padding: "10px 10px" }}>₹{p.avg_cost.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                        <td style={{ padding: "10px 10px", color: p.current_price >= p.avg_cost ? C.buy : C.sell, fontWeight: 600 }}>
                          ₹{p.current_price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: "10px 10px", color: C.muted }}>{INR(p.invested)}</td>
                        <td style={{ padding: "10px 10px", fontWeight: 600 }}>{INR(p.current_value)}</td>
                        <td style={{ padding: "10px 10px", color: p.pnl >= 0 ? C.buy : C.sell, fontWeight: 700 }}>
                          {p.pnl >= 0 ? "+" : ""}{INR(p.pnl)}
                        </td>
                        <td style={{ padding: "10px 10px" }}>
                          <span style={{ color: p.pnl_pct >= 0 ? C.buy : C.sell, fontWeight: 700 }}>
                            {p.pnl_pct >= 0 ? "+" : ""}{p.pnl_pct.toFixed(2)}%
                          </span>
                          <Spark positive={p.pnl_pct >= 0} />
                        </td>
                        <td style={{ padding: "10px 10px", color: C.muted, whiteSpace: "nowrap" }}>{p.entry_date}</td>
                        <td style={{ padding: "10px 10px", textAlign: "right", whiteSpace: "nowrap" }}>
                          <button onClick={() => setModal({ open: true, editing: p })} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 5, padding: "4px 8px", color: C.muted, cursor: "pointer", fontSize: 11, marginRight: 6 }}>Edit</button>
                          <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} style={{ background: "none", border: `1px solid rgba(239,68,68,0.3)`, borderRadius: 5, padding: "4px 8px", color: C.sell, cursor: "pointer", fontSize: 11 }}>Del</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* PORTFOLIO HISTORY */}
          {history.length > 0 && (
            <div style={cs}>
              <div style={label}>Monthly Portfolio Value (simulated)</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {history.map((h, i) => {
                  const prev = i > 0 ? history[i - 1].v : 100000;
                  const ret = ((h.v - prev) / prev * 100);
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ fontSize: 11, color: C.muted, width: 32 }}>{h.m}</div>
                      <div style={{ flex: 1, height: 20, background: C.border, borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${Math.min(Math.abs(ret) * 10, 100)}%`, height: "100%", background: ret >= 0 ? C.buy : C.sell, borderRadius: 4, display: "flex", alignItems: "center", paddingLeft: 6 }}>
                          <span style={{ fontSize: 9, color: "white", fontWeight: 600 }}>{ret >= 0 ? "+" : ""}{ret.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: C.text, width: 70, textAlign: "right" }}>₹{Math.round(h.v / 1000)}k</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ padding: "12px 16px", background: "rgba(245,158,11,0.05)", border: `1px solid rgba(245,158,11,0.2)`, borderRadius: 8, fontSize: 11, color: C.muted }}>
            âš  Prices are fetched live via yfinance (15—20 min delayed for NSE). P&L is unrealised. Not financial advice.
          </div>

        </div>
      )}

      {modal.open && (
        <PositionModal
          initial={modal.editing}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
    </PageShell>
  );
}
