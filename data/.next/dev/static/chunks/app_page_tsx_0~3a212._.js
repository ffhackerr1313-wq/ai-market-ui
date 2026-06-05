(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Dashboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
"use client";
;
const C = {
    bg: "#0d1117",
    card: "#161b22",
    border: "#21262d",
    muted: "#8b949e",
    text: "#e6edf3",
    accent: "#00d4aa",
    buy: "#10b981",
    sell: "#ef4444",
    hold: "#f59e0b",
    purple: "#6366f1"
};
const API = "http://localhost:8000";
function PriceChart({ data, width, height }) {
    _s();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PriceChart.useEffect": ()=>{
            const canvas = ref.current;
            if (!canvas || !data.length) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            const pad = {
                top: 20,
                right: 20,
                bottom: 30,
                left: 55
            };
            const W = width - pad.left - pad.right, H = height - pad.top - pad.bottom;
            ctx.clearRect(0, 0, width, height);
            const all = data.flatMap({
                "PriceChart.useEffect.all": (d)=>[
                        d.price,
                        d.ma50,
                        d.pred
                    ].filter({
                        "PriceChart.useEffect.all": (v)=>v !== null
                    }["PriceChart.useEffect.all"])
            }["PriceChart.useEffect.all"]);
            if (!all.length) return;
            const minV = Math.min(...all) - 5, maxV = Math.max(...all) + 5;
            const toY = {
                "PriceChart.useEffect.toY": (v)=>pad.top + H - (v - minV) / (maxV - minV) * H
            }["PriceChart.useEffect.toY"];
            const toX = {
                "PriceChart.useEffect.toX": (i)=>pad.left + i / (data.length - 1) * W
            }["PriceChart.useEffect.toX"];
            ctx.strokeStyle = "#21262d";
            ctx.lineWidth = 0.5;
            for(let i = 0; i <= 4; i++){
                const y = pad.top + H / 4 * i;
                ctx.beginPath();
                ctx.moveTo(pad.left, y);
                ctx.lineTo(pad.left + W, y);
                ctx.stroke();
                ctx.fillStyle = "#8b949e";
                ctx.font = "10px system-ui";
                ctx.textAlign = "right";
                ctx.fillText("$" + Math.round(maxV - (maxV - minV) / 4 * i), pad.left - 6, y + 4);
            }
            ctx.fillStyle = "#8b949e";
            ctx.font = "10px system-ui";
            ctx.textAlign = "center";
            const step = Math.ceil(data.length / 8);
            data.forEach({
                "PriceChart.useEffect": (d, i)=>{
                    if (i % step === 0) ctx.fillText(d.date, toX(i), height - 4);
                }
            }["PriceChart.useEffect"]);
            ctx.strokeStyle = C.hold;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            let f = true;
            data.forEach({
                "PriceChart.useEffect": (d, i)=>{
                    if (d.ma50 === null) return;
                    f ? (ctx.moveTo(toX(i), toY(d.ma50)), f = false) : ctx.lineTo(toX(i), toY(d.ma50));
                }
            }["PriceChart.useEffect"]);
            ctx.stroke();
            ctx.globalAlpha = 1;
            const pts = data.map({
                "PriceChart.useEffect.pts": (d, i)=>d.price !== null ? {
                        x: toX(i),
                        y: toY(d.price)
                    } : null
            }["PriceChart.useEffect.pts"]).filter(Boolean);
            if (pts.length) {
                const g = ctx.createLinearGradient(0, pad.top, 0, pad.top + H);
                g.addColorStop(0, "rgba(0,212,170,0.25)");
                g.addColorStop(1, "rgba(0,212,170,0)");
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pad.top + H);
                pts.forEach({
                    "PriceChart.useEffect": (p)=>ctx.lineTo(p.x, p.y)
                }["PriceChart.useEffect"]);
                ctx.lineTo(pts[pts.length - 1].x, pad.top + H);
                ctx.closePath();
                ctx.fillStyle = g;
                ctx.fill();
                ctx.strokeStyle = C.accent;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                pts.forEach({
                    "PriceChart.useEffect": (p, i)=>i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
                }["PriceChart.useEffect"]);
                ctx.stroke();
            }
            ctx.strokeStyle = C.purple;
            ctx.lineWidth = 2;
            ctx.setLineDash([
                6,
                3
            ]);
            ctx.beginPath();
            let fp = true;
            data.forEach({
                "PriceChart.useEffect": (d, i)=>{
                    if (d.pred === null) return;
                    fp ? (ctx.moveTo(toX(i), toY(d.pred)), fp = false) : ctx.lineTo(toX(i), toY(d.pred));
                }
            }["PriceChart.useEffect"]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }["PriceChart.useEffect"], [
        data,
        width,
        height
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
        ref: ref,
        style: {
            width,
            height,
            display: "block"
        }
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 56,
        columnNumber: 10
    }, this);
}
_s(PriceChart, "8uVE59eA/r6b92xF80p7sH8rXLk=");
_c = PriceChart;
function MiniChart({ data }) {
    _s1();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MiniChart.useEffect": ()=>{
            const canvas = ref.current;
            if (!canvas || !data.length) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            const W = canvas.offsetWidth || 300, H = 80, dpr = window.devicePixelRatio || 1;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            ctx.scale(dpr, dpr);
            ctx.clearRect(0, 0, W, H);
            const vals = data.map({
                "MiniChart.useEffect.vals": (d)=>d.v
            }["MiniChart.useEffect.vals"]), min = Math.min(...vals) - 500, max = Math.max(...vals) + 500;
            const tx = {
                "MiniChart.useEffect.tx": (i)=>i / (data.length - 1) * W
            }["MiniChart.useEffect.tx"];
            const ty = {
                "MiniChart.useEffect.ty": (v)=>H - 10 - (v - min) / (max - min) * (H - 20)
            }["MiniChart.useEffect.ty"];
            const g = ctx.createLinearGradient(0, 0, 0, H);
            g.addColorStop(0, "rgba(0,212,170,0.25)");
            g.addColorStop(1, "rgba(0,212,170,0)");
            ctx.beginPath();
            ctx.moveTo(tx(0), H);
            data.forEach({
                "MiniChart.useEffect": (d, i)=>ctx.lineTo(tx(i), ty(d.v))
            }["MiniChart.useEffect"]);
            ctx.lineTo(tx(data.length - 1), H);
            ctx.fillStyle = g;
            ctx.fill();
            ctx.strokeStyle = C.accent;
            ctx.lineWidth = 2;
            ctx.beginPath();
            data.forEach({
                "MiniChart.useEffect": (d, i)=>i === 0 ? ctx.moveTo(tx(i), ty(d.v)) : ctx.lineTo(tx(i), ty(d.v))
            }["MiniChart.useEffect"]);
            ctx.stroke();
            ctx.fillStyle = "#8b949e";
            ctx.font = "9px system-ui";
            ctx.textAlign = "center";
            data.forEach({
                "MiniChart.useEffect": (d, i)=>ctx.fillText(d.m, tx(i), H - 1)
            }["MiniChart.useEffect"]);
        }
    }["MiniChart.useEffect"], [
        data
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
        ref: ref,
        style: {
            width: "100%",
            height: 80,
            display: "block"
        }
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 79,
        columnNumber: 10
    }, this);
}
_s1(MiniChart, "8uVE59eA/r6b92xF80p7sH8rXLk=");
_c1 = MiniChart;
function Badge({ type }) {
    const map = {
        BUY: [
            "rgba(16,185,129,0.15)",
            "#10b981"
        ],
        SELL: [
            "rgba(239,68,68,0.15)",
            "#ef4444"
        ],
        HOLD: [
            "rgba(245,158,11,0.15)",
            "#f59e0b"
        ],
        positive: [
            "rgba(16,185,129,0.1)",
            "#10b981"
        ],
        negative: [
            "rgba(239,68,68,0.1)",
            "#ef4444"
        ],
        neutral: [
            "rgba(139,148,158,0.12)",
            "#8b949e"
        ]
    };
    const [bg, color] = map[type] || map.neutral;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        style: {
            background: bg,
            color,
            border: `1px solid ${color}44`,
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 700,
            flexShrink: 0
        },
        children: type.toUpperCase()
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 85,
        columnNumber: 10
    }, this);
}
_c2 = Badge;
function Bar({ pct, color, h = 3 }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            height: h,
            background: C.border,
            borderRadius: 2,
            marginTop: 4
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                width: `${Math.min(pct, 100)}%`,
                height: "100%",
                background: color,
                borderRadius: 2,
                transition: "width 0.6s ease"
            }
        }, void 0, false, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 89,
            columnNumber: 81
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 89,
        columnNumber: 10
    }, this);
}
_c3 = Bar;
function Spin() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 80,
            color: C.muted,
            fontSize: 12
        },
        children: "Loading..."
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 92,
        columnNumber: 24
    }, this);
}
_c4 = Spin;
function Dashboard() {
    _s2();
    const [nav, setNav] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("Dashboard");
    const [range, setRange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("1Y");
    const [time, setTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [at, setAt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("AAPL");
    const [sz, setSz] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        w: 600,
        h: 240
    });
    const cref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [tickers, setTickers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [signals, setSignals] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [portfolio, setPortfolio] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [chart, setChart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [hist, setHist] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [risk, setRisk] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [online, setOnline] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [updated, setUpdated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const fetchAll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Dashboard.useCallback[fetchAll]": async ()=>{
            try {
                const [t, s, p, h] = await Promise.all([
                    fetch(`${API}/api/tickers`).then({
                        "Dashboard.useCallback[fetchAll]": (r)=>r.json()
                    }["Dashboard.useCallback[fetchAll]"]),
                    fetch(`${API}/api/signals`).then({
                        "Dashboard.useCallback[fetchAll]": (r)=>r.json()
                    }["Dashboard.useCallback[fetchAll]"]),
                    fetch(`${API}/api/portfolio`).then({
                        "Dashboard.useCallback[fetchAll]": (r)=>r.json()
                    }["Dashboard.useCallback[fetchAll]"]),
                    fetch(`${API}/api/portfolio/history`).then({
                        "Dashboard.useCallback[fetchAll]": (r)=>r.json()
                    }["Dashboard.useCallback[fetchAll]"])
                ]);
                setTickers(t);
                setSignals(s);
                setPortfolio(p);
                setHist(h);
                setOnline(true);
                setUpdated(new Date().toLocaleTimeString());
            } catch  {
                setOnline(false);
            } finally{
                setLoading(false);
            }
        }
    }["Dashboard.useCallback[fetchAll]"], []);
    const fetchChart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Dashboard.useCallback[fetchChart]": async (t)=>{
            try {
                const c = await fetch(`${API}/api/chart/${t}`).then({
                    "Dashboard.useCallback[fetchChart]": (r)=>r.json()
                }["Dashboard.useCallback[fetchChart]"]);
                setChart(c);
            } catch  {}
        }
    }["Dashboard.useCallback[fetchChart]"], []);
    const fetchRisk = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Dashboard.useCallback[fetchRisk]": async (t)=>{
            try {
                const r = await fetch(`${API}/api/risk/${t}`).then({
                    "Dashboard.useCallback[fetchRisk]": (r)=>r.json()
                }["Dashboard.useCallback[fetchRisk]"]);
                setRisk(r);
            } catch  {}
        }
    }["Dashboard.useCallback[fetchRisk]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Dashboard.useEffect": ()=>{
            fetchAll();
            fetchChart(at);
            fetchRisk(at);
            const iv = setInterval(fetchAll, 30000);
            return ({
                "Dashboard.useEffect": ()=>clearInterval(iv)
            })["Dashboard.useEffect"];
        }
    }["Dashboard.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Dashboard.useEffect": ()=>{
            fetchChart(at);
            fetchRisk(at);
        }
    }["Dashboard.useEffect"], [
        at
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Dashboard.useEffect": ()=>{
            setTime(new Date().toLocaleTimeString());
            const t = setInterval({
                "Dashboard.useEffect.t": ()=>setTime(new Date().toLocaleTimeString())
            }["Dashboard.useEffect.t"], 1000);
            return ({
                "Dashboard.useEffect": ()=>clearInterval(t)
            })["Dashboard.useEffect"];
        }
    }["Dashboard.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Dashboard.useEffect": ()=>{
            const upd = {
                "Dashboard.useEffect.upd": ()=>{
                    if (cref.current) setSz({
                        w: cref.current.offsetWidth,
                        h: 240
                    });
                }
            }["Dashboard.useEffect.upd"];
            upd();
            window.addEventListener("resize", upd);
            return ({
                "Dashboard.useEffect": ()=>window.removeEventListener("resize", upd)
            })["Dashboard.useEffect"];
        }
    }["Dashboard.useEffect"], []);
    const navItems = [
        {
            name: "Dashboard",
            icon: "▦",
            href: "/"
        },
        {
            name: "Portfolio",
            icon: "◈",
            href: "/portfolio"
        },
        {
            name: "Signals",
            icon: "◉",
            href: "/signals"
        },
        {
            name: "Backtest",
            icon: "◇",
            href: "/backtest"
        },
        {
            name: "AI Insights",
            icon: "⬡",
            href: "/ai-insights"
        },
        {
            name: "Settings",
            icon: "◎",
            href: "/settings"
        }
    ];
    const cs = {
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: 16
    };
    const st = {
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: C.muted,
        marginBottom: 12
    };
    const tv = portfolio.reduce((s, p)=>s + p.value, 0);
    const asig = signals.find((s)=>s.symbol === at);
    const portColors = [
        C.accent,
        C.purple,
        C.hold,
        C.sell
    ];
    const rms = risk ? [
        {
            label: "Volatility",
            value: `${risk.volatility}%`,
            pct: Math.min(risk.volatility * 5, 100),
            color: C.hold
        },
        {
            label: "Max Drawdown",
            value: `${risk.max_drawdown}%`,
            pct: Math.min(risk.max_drawdown * 3, 100),
            color: C.sell
        },
        {
            label: "Sharpe Ratio",
            value: `${risk.sharpe}`,
            pct: Math.min(Math.abs(risk.sharpe) * 30, 100),
            color: C.purple
        },
        {
            label: "Win Rate",
            value: `${risk.win_rate}%`,
            pct: risk.win_rate,
            color: C.accent
        }
    ] : [];
    const fallbackTickers = [
        {
            symbol: "AAPL",
            price: "—",
            change: 0
        },
        {
            symbol: "BPCL.NS",
            price: "—",
            change: 0
        },
        {
            symbol: "RELIANCE.NS",
            price: "—",
            change: 0
        },
        {
            symbol: "TCS.NS",
            price: "—",
            change: 0
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            height: "100vh",
            background: C.bg,
            color: C.text,
            overflow: "hidden",
            fontFamily: "system-ui,-apple-system,sans-serif",
            fontSize: 13
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    width: 185,
                    background: C.bg,
                    borderRight: `1px solid ${C.border}`,
                    display: "flex",
                    flexDirection: "column",
                    padding: "18px 10px",
                    flexShrink: 0
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            paddingLeft: 8,
                            marginBottom: 26
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 15,
                                    fontWeight: 800,
                                    letterSpacing: "0.06em",
                                    color: C.accent
                                },
                                children: "AI TRADER"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 178,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 10,
                                    color: C.muted,
                                    marginTop: 3
                                },
                                children: "Market Predictor v4.0"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 179,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 177,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            flexDirection: "column",
                            gap: 2
                        },
                        children: navItems.map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setNav(n.name);
                                    window.location.href = n.href;
                                },
                                style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "9px 10px",
                                    borderRadius: 6,
                                    border: "none",
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    background: nav === n.name ? "rgba(0,212,170,0.08)" : "transparent",
                                    color: nav === n.name ? C.accent : C.muted,
                                    fontSize: 12,
                                    fontWeight: nav === n.name ? 600 : 400,
                                    textAlign: "left",
                                    width: "100%",
                                    borderLeft: nav === n.name ? `2px solid ${C.accent}` : "2px solid transparent"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: n.icon
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 184,
                                        columnNumber: 15
                                    }, this),
                                    n.name
                                ]
                            }, n.name, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 183,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 181,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: "auto",
                            padding: "12px 8px",
                            borderTop: `1px solid ${C.border}`
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    marginBottom: 5
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: 7,
                                            height: 7,
                                            borderRadius: "50%",
                                            background: online ? C.buy : C.sell,
                                            boxShadow: `0 0 6px ${online ? C.buy : C.sell}`
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 190,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: 10,
                                            color: C.muted
                                        },
                                        children: [
                                            "API: ",
                                            online ? "Online" : "Offline"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 191,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 189,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 10,
                                    color: C.muted
                                },
                                children: [
                                    "Updated: ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: C.text
                                        },
                                        children: updated || "—"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 193,
                                        columnNumber: 61
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 193,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 188,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 176,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: C.bg,
                            borderBottom: `1px solid ${C.border}`,
                            padding: "10px 20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexShrink: 0
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    gap: 6,
                                    alignItems: "center",
                                    flexWrap: "wrap"
                                },
                                children: (tickers.length ? tickers : fallbackTickers).map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setAt(t.symbol),
                                        style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                            cursor: "pointer",
                                            background: at === t.symbol ? "rgba(0,212,170,0.08)" : "transparent",
                                            border: `1px solid ${at === t.symbol ? C.accent : "transparent"}`,
                                            borderRadius: 6,
                                            padding: "4px 10px"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    color: at === t.symbol ? C.accent : C.text
                                                },
                                                children: t.symbol
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 204,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 12
                                                },
                                                children: t.price
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 205,
                                                columnNumber: 17
                                            }, this),
                                            t.change !== 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 10,
                                                    padding: "2px 6px",
                                                    borderRadius: 4,
                                                    background: t.change > 0 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                                                    color: t.change > 0 ? C.buy : C.sell
                                                },
                                                children: [
                                                    t.change > 0 ? "+" : "",
                                                    t.change,
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 206,
                                                columnNumber: 32
                                            }, this)
                                        ]
                                    }, t.symbol, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 203,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 201,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    gap: 10,
                                    alignItems: "center"
                                },
                                children: [
                                    !online && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: 10,
                                            color: C.sell,
                                            padding: "4px 10px",
                                            background: "rgba(239,68,68,0.1)",
                                            borderRadius: 6,
                                            border: `1px solid rgba(239,68,68,0.3)`
                                        },
                                        children: "⚠ Run: uvicorn api:app --reload"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 211,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        placeholder: "🔍 Search ticker...",
                                        style: {
                                            background: C.card,
                                            border: `1px solid ${C.border}`,
                                            borderRadius: 6,
                                            padding: "5px 10px",
                                            color: C.text,
                                            fontSize: 12,
                                            fontFamily: "inherit",
                                            width: 155,
                                            outline: "none"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 212,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: 11,
                                            color: C.muted,
                                            padding: "5px 12px",
                                            background: C.card,
                                            border: `1px solid ${C.border}`,
                                            borderRadius: 6,
                                            minWidth: 85,
                                            textAlign: "center"
                                        },
                                        children: time
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 213,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 210,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 200,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            overflow: "auto",
                            padding: 16,
                            display: "flex",
                            flexDirection: "column",
                            gap: 14
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "grid",
                                    gridTemplateColumns: "repeat(4,1fr)",
                                    gap: 12
                                },
                                children: [
                                    {
                                        label: "Portfolio Value",
                                        value: tv > 0 ? `₹${tv.toLocaleString("en-IN", {
                                            maximumFractionDigits: 0
                                        })}` : "Loading...",
                                        sub: portfolio.length ? `${portfolio.filter((p)=>p.ret > 0).length} stocks up` : "fetching...",
                                        color: C.buy
                                    },
                                    {
                                        label: "Active Signals",
                                        value: signals.filter((s)=>s.signal === "BUY").length.toString(),
                                        sub: `${signals.filter((s)=>s.signal === "BUY").length} BUY · ${signals.filter((s)=>s.signal === "HOLD").length} HOLD`,
                                        color: C.muted
                                    },
                                    {
                                        label: "Model Accuracy",
                                        value: asig ? `${asig.accuracy}%` : "—",
                                        sub: `${at} · RF classifier`,
                                        color: C.muted
                                    },
                                    {
                                        label: "Risk Level",
                                        value: risk ? risk.volatility > 25 ? "High" : risk.volatility > 15 ? "Medium" : "Low" : "—",
                                        sub: risk ? `Volatility: ${risk.volatility}%` : "loading...",
                                        color: C.hold
                                    }
                                ].map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: cs,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: st,
                                                children: m.label
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 228,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 22,
                                                    fontWeight: 700,
                                                    marginBottom: 4
                                                },
                                                children: m.value
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 229,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 11,
                                                    color: m.color
                                                },
                                                children: m.sub
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 230,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, m.label, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 227,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 220,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "grid",
                                    gridTemplateColumns: "2fr 1fr",
                                    gap: 14
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 14
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: cs,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            marginBottom: 10
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: st,
                                                                children: [
                                                                    "Price Chart · ",
                                                                    at
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 241,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: "flex",
                                                                    gap: 4
                                                                },
                                                                children: [
                                                                    "1W",
                                                                    "1M",
                                                                    "3M",
                                                                    "6M",
                                                                    "1Y"
                                                                ].map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>setRange(r),
                                                                        style: {
                                                                            padding: "3px 8px",
                                                                            borderRadius: 4,
                                                                            cursor: "pointer",
                                                                            fontFamily: "inherit",
                                                                            border: `1px solid ${r === range ? C.accent : C.border}`,
                                                                            background: r === range ? "rgba(0,212,170,0.1)" : "transparent",
                                                                            color: r === range ? C.accent : C.muted,
                                                                            fontSize: 10
                                                                        },
                                                                        children: r
                                                                    }, r, false, {
                                                                        fileName: "[project]/app/page.tsx",
                                                                        lineNumber: 244,
                                                                        columnNumber: 23
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 242,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 240,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: "flex",
                                                            gap: 16,
                                                            marginBottom: 10,
                                                            fontSize: 10
                                                        },
                                                        children: [
                                                            [
                                                                "Price",
                                                                C.accent
                                                            ],
                                                            [
                                                                "AI Prediction",
                                                                C.purple
                                                            ],
                                                            [
                                                                "MA50",
                                                                C.hold
                                                            ]
                                                        ].map(([n, c])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: 5,
                                                                    color: C.muted
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            width: 14,
                                                                            height: 2,
                                                                            background: String(c),
                                                                            display: "inline-block",
                                                                            borderRadius: 1
                                                                        }
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/page.tsx",
                                                                        lineNumber: 251,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    n
                                                                ]
                                                            }, n, true, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 250,
                                                                columnNumber: 21
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 248,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        ref: cref,
                                                        style: {
                                                            width: "100%"
                                                        },
                                                        children: chart.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PriceChart, {
                                                            data: chart,
                                                            width: sz.w,
                                                            height: sz.h
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 256,
                                                            columnNumber: 35
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Spin, {}, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 256,
                                                            columnNumber: 89
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 255,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 239,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: cs,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            marginBottom: 12
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: st,
                                                                children: "AI Insight · ICT/SMC Analysis"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 262,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: 10,
                                                                    padding: "2px 8px",
                                                                    background: "rgba(0,212,170,0.1)",
                                                                    color: C.accent,
                                                                    borderRadius: 4,
                                                                    border: `1px solid rgba(0,212,170,0.25)`
                                                                },
                                                                children: "● Live"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 263,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 261,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: "flex",
                                                            gap: 6,
                                                            flexWrap: "wrap",
                                                            marginBottom: 12
                                                        },
                                                        children: (asig?.reason.split(" · ") || [
                                                            "BOS Confirmed",
                                                            "FVG Detected",
                                                            "HTF Bullish"
                                                        ]).map((t, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    background: `${C.accent}20`,
                                                                    color: C.accent,
                                                                    fontSize: 10,
                                                                    padding: "3px 9px",
                                                                    borderRadius: 4,
                                                                    fontWeight: 600
                                                                },
                                                                children: t
                                                            }, i, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 267,
                                                                columnNumber: 21
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 265,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            background: "rgba(0,212,170,0.04)",
                                                            border: `1px solid rgba(0,212,170,0.15)`,
                                                            borderLeft: `3px solid ${C.accent}`,
                                                            borderRadius: 6,
                                                            padding: "12px 14px",
                                                            fontSize: 12,
                                                            lineHeight: 1.75
                                                        },
                                                        children: asig ? `Signal for ${at}: ${asig.signal}. Confidence: ${asig.confidence}%. Detected: ${asig.reason}. Historical win rate: ${asig.accuracy}%.` : `Analyzing ${at} — start the API server to see live predictions.`
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 270,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            marginTop: 12,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 10
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: 10,
                                                                    color: C.muted
                                                                },
                                                                children: "Model confidence"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 274,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    flex: 1,
                                                                    height: 5,
                                                                    background: C.border,
                                                                    borderRadius: 3
                                                                },
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        width: `${asig?.confidence ?? 50}%`,
                                                                        height: "100%",
                                                                        background: `linear-gradient(90deg,${C.accent},${C.purple})`,
                                                                        borderRadius: 3,
                                                                        transition: "width 0.6s ease"
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 276,
                                                                    columnNumber: 21
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 275,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: 12,
                                                                    color: C.accent,
                                                                    fontWeight: 700
                                                                },
                                                                children: [
                                                                    asig?.confidence ?? 50,
                                                                    "%"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 278,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 273,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 260,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 237,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 14
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: cs,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: st,
                                                        children: "Live Signals"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 286,
                                                        columnNumber: 17
                                                    }, this),
                                                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Spin, {}, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 287,
                                                        columnNumber: 26
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            gap: 8
                                                        },
                                                        children: signals.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                onClick: ()=>setAt(s.symbol),
                                                                style: {
                                                                    padding: "10px 12px",
                                                                    background: C.bg,
                                                                    border: `1px solid ${at === s.symbol ? C.accent : C.border}`,
                                                                    borderRadius: 8,
                                                                    cursor: "pointer",
                                                                    transition: "border-color 0.2s"
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            display: "flex",
                                                                            justifyContent: "space-between",
                                                                            alignItems: "flex-start",
                                                                            marginBottom: 4
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        style: {
                                                                                            fontSize: 13,
                                                                                            fontWeight: 700
                                                                                        },
                                                                                        children: s.symbol
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/page.tsx",
                                                                                        lineNumber: 293,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        style: {
                                                                                            fontSize: 10,
                                                                                            color: C.muted,
                                                                                            marginTop: 2
                                                                                        },
                                                                                        children: s.reason
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/page.tsx",
                                                                                        lineNumber: 294,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/page.tsx",
                                                                                lineNumber: 292,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Badge, {
                                                                                type: s.signal
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/page.tsx",
                                                                                lineNumber: 296,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/page.tsx",
                                                                        lineNumber: 291,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Bar, {
                                                                        pct: s.confidence,
                                                                        color: s.signal === "BUY" ? C.buy : s.signal === "SELL" ? C.sell : C.hold
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/page.tsx",
                                                                        lineNumber: 298,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            fontSize: 9,
                                                                            color: C.muted,
                                                                            marginTop: 3
                                                                        },
                                                                        children: [
                                                                            s.confidence,
                                                                            "% confidence"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/page.tsx",
                                                                        lineNumber: 299,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, s.symbol, true, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 290,
                                                                columnNumber: 23
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 288,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 285,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: cs,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: st,
                                                        children: "Portfolio Allocation"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 306,
                                                        columnNumber: 17
                                                    }, this),
                                                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Spin, {}, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 307,
                                                        columnNumber: 26
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            gap: 10
                                                        },
                                                        children: portfolio.map((p, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            display: "flex",
                                                                            justifyContent: "space-between",
                                                                            alignItems: "center",
                                                                            marginBottom: 4
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                style: {
                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                    gap: 8
                                                                                },
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        style: {
                                                                                            width: 8,
                                                                                            height: 8,
                                                                                            borderRadius: 2,
                                                                                            background: portColors[i % portColors.length]
                                                                                        }
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/page.tsx",
                                                                                        lineNumber: 313,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        style: {
                                                                                            fontSize: 12,
                                                                                            fontWeight: 600
                                                                                        },
                                                                                        children: p.symbol
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/page.tsx",
                                                                                        lineNumber: 314,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/page.tsx",
                                                                                lineNumber: 312,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                style: {
                                                                                    display: "flex",
                                                                                    gap: 10
                                                                                },
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        style: {
                                                                                            fontSize: 11,
                                                                                            color: C.muted
                                                                                        },
                                                                                        children: [
                                                                                            p.allocation,
                                                                                            "%"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/page.tsx",
                                                                                        lineNumber: 317,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        style: {
                                                                                            fontSize: 11,
                                                                                            fontWeight: 700,
                                                                                            color: p.ret >= 0 ? C.buy : C.sell
                                                                                        },
                                                                                        children: [
                                                                                            p.ret >= 0 ? "+" : "",
                                                                                            p.ret,
                                                                                            "%"
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/page.tsx",
                                                                                        lineNumber: 318,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/page.tsx",
                                                                                lineNumber: 316,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/page.tsx",
                                                                        lineNumber: 311,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Bar, {
                                                                        pct: p.allocation,
                                                                        color: portColors[i % portColors.length]
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/page.tsx",
                                                                        lineNumber: 321,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, p.symbol, true, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 310,
                                                                columnNumber: 23
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 308,
                                                        columnNumber: 19
                                                    }, this),
                                                    tv > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            marginTop: 14,
                                                            paddingTop: 12,
                                                            borderTop: `1px solid ${C.border}`,
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center"
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: 10,
                                                                    color: C.muted,
                                                                    textTransform: "uppercase",
                                                                    letterSpacing: "0.06em"
                                                                },
                                                                children: "Total Value"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 326,
                                                                columnNumber: 166
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: 18,
                                                                    fontWeight: 700,
                                                                    color: C.accent
                                                                },
                                                                children: [
                                                                    "₹",
                                                                    tv.toLocaleString("en-IN", {
                                                                        maximumFractionDigits: 0
                                                                    })
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 326,
                                                                columnNumber: 275
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 326,
                                                        columnNumber: 24
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 305,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 284,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 236,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 14
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: cs,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: st,
                                                children: "News Sentiment"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 334,
                                                columnNumber: 15
                                            }, this),
                                            [
                                                {
                                                    h: "Fed holds rates steady — tech stocks rally",
                                                    t: "2h ago",
                                                    s: "Reuters",
                                                    sent: "positive",
                                                    score: 82
                                                },
                                                {
                                                    h: "BPCL Q4 earnings miss analyst estimates",
                                                    t: "4h ago",
                                                    s: "ET Markets",
                                                    sent: "negative",
                                                    score: 75
                                                },
                                                {
                                                    h: "Apple Vision Pro enterprise sales update",
                                                    t: "6h ago",
                                                    s: "Bloomberg",
                                                    sent: "neutral",
                                                    score: 50
                                                },
                                                {
                                                    h: "Reliance expands renewable energy portfolio",
                                                    t: "8h ago",
                                                    s: "Economic Times",
                                                    sent: "positive",
                                                    score: 70
                                                },
                                                {
                                                    h: "TCS wins $500M deal from European banking",
                                                    t: "10h ago",
                                                    s: "Mint",
                                                    sent: "positive",
                                                    score: 88
                                                }
                                            ].map((n, i, arr)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        padding: "10px 0",
                                                        borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none"
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                gap: 8,
                                                                marginBottom: 5
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        flex: 1
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                fontSize: 12,
                                                                                lineHeight: 1.4,
                                                                                marginBottom: 2
                                                                            },
                                                                            children: n.h
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/page.tsx",
                                                                            lineNumber: 338,
                                                                            columnNumber: 43
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                fontSize: 10,
                                                                                color: C.muted
                                                                            },
                                                                            children: [
                                                                                n.t,
                                                                                " · ",
                                                                                n.s
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/page.tsx",
                                                                            lineNumber: 338,
                                                                            columnNumber: 111
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 338,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Badge, {
                                                                    type: n.sent
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/page.tsx",
                                                                    lineNumber: 339,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 337,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Bar, {
                                                            pct: n.score,
                                                            color: n.sent === "positive" ? C.buy : n.sent === "negative" ? C.sell : C.muted,
                                                            h: 2
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 341,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, i, true, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 336,
                                                    columnNumber: 17
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 333,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: cs,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: st,
                                                children: [
                                                    "Risk Dashboard · ",
                                                    at
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 346,
                                                columnNumber: 15
                                            }, this),
                                            rms.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 12,
                                                    marginBottom: 14
                                                },
                                                children: rms.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: "flex",
                                                                    justifyContent: "space-between",
                                                                    fontSize: 11,
                                                                    marginBottom: 4
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            color: C.muted
                                                                        },
                                                                        children: r.label
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/page.tsx",
                                                                        lineNumber: 352,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            fontWeight: 600
                                                                        },
                                                                        children: r.value
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/page.tsx",
                                                                        lineNumber: 353,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 351,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Bar, {
                                                                pct: r.pct,
                                                                color: r.color,
                                                                h: 5
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 355,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, r.label, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 350,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 348,
                                                columnNumber: 17
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Spin, {}, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 359,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: st,
                                                children: "Portfolio Performance"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 360,
                                                columnNumber: 15
                                            }, this),
                                            hist.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MiniChart, {
                                                data: hist
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 361,
                                                columnNumber: 30
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Spin, {}, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 361,
                                                columnNumber: 55
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 345,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 332,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 218,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 198,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 174,
        columnNumber: 5
    }, this);
}
_s2(Dashboard, "/osmmrP5mvBpLH1KFcmfve3p/oo=");
_c5 = Dashboard;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "PriceChart");
__turbopack_context__.k.register(_c1, "MiniChart");
__turbopack_context__.k.register(_c2, "Badge");
__turbopack_context__.k.register(_c3, "Bar");
__turbopack_context__.k.register(_c4, "Spin");
__turbopack_context__.k.register(_c5, "Dashboard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_page_tsx_0~3a212._.js.map