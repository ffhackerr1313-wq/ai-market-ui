"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import CandleChart from "@/components/CandleChart";
import TiltCard from "@/components/TiltCard";

const HoloScene = dynamic(() => import("@/components/HoloScene"), { ssr: false });

// â"€â"€â"€ Tokens â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const H = {
  cyan:"#00DFFB", hot:"#52FEFE", electric:"#0098F8",
  void:"#000308", green:"#00FF9F", red:"#ef4444", amber:"#FF6B00",
  muted:"rgba(139,148,158,0.75)", text:"#e6edf3",
};
const API     = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TICKERS = ["RELIANCE.NS","TCS.NS","HDFCBANK.NS","INFY.NS","ICICIBANK.NS"];

type Signal = { symbol:string; signal:"BUY"|"SELL"|"HOLD"; confidence:number; accuracy:number; reason:string;
  model?:string; scanner_signal?:string; breakout_strength?:string;
  entry?:number; stop_loss?:number; target1?:number; target2?:number; risk_reward?:number; atr?:number;
  kelly_half_pct?:number; position_size_inr?:number; sizing_label?:string; };
type IndexData = { name:string; symbol:string; last:number; pct_change:number; change:number };
type Risk   = { volatility:number; sharpe:number; max_drawdown:number; win_rate:number };
type Port   = { symbol:string; value:number; ret:number; allocation:number }[];
type WatchItem = { symbol:string; name?:string; sector?:string; price?:number|null; change?:number };
type SearchHit = { symbol:string; price:number; signal:"BUY"|"SELL"|"HOLD"; rsi:number; momentum:number;
  entry:number; stop_loss:number; target1:number; target2:number; risk_reward:number;
  breakout:boolean; volume_spike:boolean; error?:string;
  kelly_half_pct?:number; position_size_inr?:number; sizing_label?:string; };
type StockSugg = { symbol:string; name:string; sector:string; score:number };

function getSuggestions(q: string, universe: {symbol:string;name:string;sector:string}[], limit = 8): StockSugg[] {
  const ql = q.toLowerCase().trim();
  if (!ql) return [];
  const results: StockSugg[] = [];
  for (const s of universe) {
    const sym  = s.symbol.toLowerCase().replace(".ns","");
    const name = s.name.toLowerCase();
    const sec  = (s.sector||"").toLowerCase();
    let score  = 0;
    if (sym === ql)                        score = 100;
    else if (sym.startsWith(ql))           score = 85;
    else if (sym.includes(ql))             score = 65;
    else if (name.startsWith(ql))          score = 75;
    else if (name.split(" ").some(w => w.startsWith(ql))) score = 68;
    else if (name.includes(ql))            score = 50;
    else if (sec.includes(ql))             score = 35;
    if (score > 0) results.push({ symbol: s.symbol, name: s.name, sector: s.sector, score });
  }
  return results.sort((a,b) => b.score - a.score).slice(0, limit);
}

const sigColor = (s?:string) => s==="BUY"?H.green:s==="SELL"?H.red:H.amber;
const fmt = (n:number) => n.toLocaleString("en-IN",{maximumFractionDigits:0});

// â"€â"€â"€ CSS â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#000308;overflow:hidden;}
@keyframes spin-cw  { to{transform:rotate(360deg)} }
@keyframes spin-ccw { to{transform:rotate(-360deg)} }
@keyframes blink    { 0%,100%{opacity:1}50%{opacity:.2} }
@keyframes scan     { 0%{top:0;opacity:.6}80%{opacity:.3}100%{top:100%;opacity:0} }
@keyframes fadeup   { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
@keyframes ticker   { 0%{transform:translateX(0)}100%{transform:translateX(-50%)} }
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-thumb{background:rgba(0,223,251,.2);border-radius:2px}
.fadeup{animation:fadeup .5s ease forwards}
.glass{position:relative;border-radius:12px;overflow:hidden;
  background:linear-gradient(135deg,rgba(0,223,251,.06),rgba(0,152,248,.02));
  border:1px solid rgba(82,254,254,.13);
  box-shadow:0 0 30px rgba(0,223,251,.07),inset 0 1px 0 rgba(255,255,255,.05);
  backdrop-filter:blur(20px) saturate(150%);-webkit-backdrop-filter:blur(20px) saturate(150%);}
.glass::after{content:'';position:absolute;inset:0;border-radius:12px;pointer-events:none;
  background:linear-gradient(108deg,transparent 38%,rgba(255,255,255,.04) 50%,transparent 62%);}
.glass-buy  {border-color:rgba(0,255,159,.22)!important;box-shadow:0 0 30px rgba(0,255,159,.1)!important;}
.glass-sell {border-color:rgba(239,68,68,.22)!important; box-shadow:0 0 30px rgba(239,68,68,.1)!important;}
.glass-hold {border-color:rgba(255,107,0,.2)!important;  box-shadow:0 0 30px rgba(255,107,0,.08)!important;}
.glass-hi   {border-color:rgba(82,254,254,.35)!important;box-shadow:0 0 50px rgba(0,223,251,.18)!important;}
.nav-a{display:flex;align-items:center;gap:10px;padding:9px 18px;text-decoration:none;
  font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;letter-spacing:.12em;
  text-transform:uppercase;color:rgba(82,254,254,.3);
  border-left:2px solid transparent;transition:all .15s ease;}
.nav-a:hover{color:rgba(82,254,254,.7);background:rgba(0,223,251,.04);}
.nav-a.on{color:#00DFFB;background:rgba(0,223,251,.08);border-left-color:#00DFFB;}
.tbtn{font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;letter-spacing:.12em;
  text-transform:uppercase;padding:5px 13px;border-radius:5px;cursor:pointer;transition:all .2s ease;}
`;

// â"€â"€â"€ UI Helpers â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
function Spin() {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:20,height:20,border:"2px solid rgba(0,223,251,.15)",
        borderTop:"2px solid #00DFFB",borderRadius:"50%",animation:"spin-cw .8s linear infinite"}}/>
    </div>
  );
}
function Lbl({children}:{children:React.ReactNode}) {
  return <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,
    color:"rgba(82,254,254,.4)",letterSpacing:"0.22em",textTransform:"uppercase",marginBottom:10}}>{children}</div>;
}
function Row({label,value,color}:{label:string;value:string;color?:string}) {
  return(
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
      <span style={{fontFamily:"'Rajdhani',sans-serif",fontSize:11,fontWeight:600,
        letterSpacing:"0.06em",textTransform:"uppercase",color:H.muted}}>{label}</span>
      <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:color??H.text}}>{value}</span>
    </div>
  );
}
function Bar({value,color=H.cyan}:{value:number;color?:string}) {
  return(
    <div style={{height:2,background:"rgba(0,223,251,.08)",borderRadius:1,overflow:"hidden",marginBottom:6}}>
      <div style={{height:"100%",width:`${Math.min(100,Math.max(0,value))}%`,
        background:color,boxShadow:`0 0 6px ${color}80`,borderRadius:1,
        transition:"width .8s cubic-bezier(.34,1.56,.64,1)"}}/>
    </div>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// â"€â"€â"€ MAIN PAGE â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export default function Dashboard() {
  const pathname = usePathname();
  const [ticker,  setTicker]  = useState("RELIANCE.NS");
  const [signals, setSignals] = useState<Signal[]>([]);
  const [risk,    setRisk]    = useState<Risk|null>(null);
  const [port,    setPort]    = useState<Port>([]);
  const [loading, setLoading] = useState(true);
  const [timeStr, setTimeStr] = useState("");
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [marketOpen, setMarketOpen] = useState<boolean|null>(null);
  const [showChart,  setShowChart]  = useState(true);
  const [watch,      setWatch]      = useState<WatchItem[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ,    setSearchQ]    = useState("");
  const [searchHit,  setSearchHit]  = useState<SearchHit|null>(null);
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchErr,  setSearchErr]  = useState("");
  const [universe,   setUniverse]   = useState<{symbol:string;name:string;sector:string}[]>([]);
  const [suggIdx,    setSuggIdx]    = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{
    const upd=()=>setTimeStr(new Date().toLocaleTimeString("en-US",{hour12:false}));
    upd();
    const id=setInterval(upd,1000);
    return()=>clearInterval(id);
  },[]);

  useEffect(()=>{
    const fetchIndices = () => {
      Promise.all([
        fetch(`${API}/api/nse/indices`).then(r=>r.json()).catch(()=>[]),
        fetch(`${API}/api/nse/market`).then(r=>r.json()).catch(()=>({})),
      ]).then(([idx, mkt]) => {
        setIndices(Array.isArray(idx) ? idx : []);
        setMarketOpen(mkt?.is_open ?? null);
      });
    };
    fetchIndices();
    const id = setInterval(fetchIndices, 30_000);
    return () => clearInterval(id);
  },[]);

  useEffect(()=>{
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/signals`).then(r=>r.json()).catch(()=>[]),
      fetch(`${API}/api/portfolio`).then(r=>r.json()).catch(()=>[]),
    ]).then(([sig,prt])=>{
      setSignals(sig||[]);
      setPort(prt||[]);
      setLoading(false);
    });
  },[]);

  useEffect(()=>{
    fetch(`${API}/api/risk/${ticker}`).then(r=>r.json()).then(setRisk).catch(()=>setRisk(null));
  },[ticker]);

  const loadWatch = ()=> fetch(`${API}/api/watchlist`).then(r=>r.json())
    .then(d=>setWatch(Array.isArray(d)?d:[])).catch(()=>{});
  useEffect(()=>{ loadWatch(); },[]);
  const addWatch = async (sym:string)=>{
    await fetch(`${API}/api/watchlist/${encodeURIComponent(sym)}`,{method:"POST"}).catch(()=>{});
    loadWatch();
  };
  const removeWatch = async (sym:string)=>{
    await fetch(`${API}/api/watchlist/${encodeURIComponent(sym)}`,{method:"DELETE"}).catch(()=>{});
    loadWatch();
  };

  useEffect(()=>{
    if(searchOpen && universe.length===0){
      fetch(`${API}/api/stocks`).then(r=>r.json()).then(d=>{
        const idxEntries = (d.indices||[]).map((i:{symbol:string;name:string}) => ({...i, sector:"Index"}));
        setUniverse([...idxEntries, ...(d.stocks||[])]);
      }).catch(()=>{});
    }
    if(!searchOpen){ setSuggIdx(-1); }
  },[searchOpen]);

  const suggestions = getSuggestions(searchQ, universe);

  const runSearch = async (q:string)=>{
    const query=q.trim(); if(!query) return;
    setSearchBusy(true); setSearchErr(""); setSearchHit(null);
    try{
      const r=await fetch(`${API}/api/search/${encodeURIComponent(query)}`);
      const d=await r.json();
      if(d.error) setSearchErr(typeof d.error==="string"?d.error:"No data found");
      else setSearchHit(d);
    }catch{ setSearchErr("Search failed — is the API running on :8000?"); }
    setSearchBusy(false);
  };

  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){ e.preventDefault(); setSearchOpen(o=>!o); }
      else if(e.key==="Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown",h);
    return ()=>window.removeEventListener("keydown",h);
  },[]);

  const signal    = signals.find(s=>s.symbol===ticker);
  const sigC      = sigColor(signal?.signal);
  const portTotal = port.reduce((a,p)=>a+(p.value??0),0);
  const buyCnt    = signals.filter(s=>s.signal==="BUY").length;

  const nifty50   = indices.find(i=>i.name?.includes("NIFTY 50") && !i.name?.includes("BANK") && !i.name?.includes("NEXT"));
  const bankNifty = indices.find(i=>i.name?.includes("NIFTY BANK") || i.symbol?.includes("BANK"));
  const fmtIdx = (n:number) => n?.toLocaleString("en-IN",{maximumFractionDigits:2}) ?? "—";
  const pctColor = (p:number) => p >= 0 ? H.green : H.red;

  return (
    <>
      <style>{CSS}</style>
      <div style={{width:"100vw",height:"100vh",overflow:"hidden",
        background:H.void,fontFamily:"'Rajdhani',sans-serif",color:H.text,
        display:"flex",flexDirection:"column"}}>

        <HoloScene />

        <div style={{position:"relative",zIndex:10,display:"flex",flexDirection:"column",height:"100vh"}}>

          {/* HEADER */}
          <div style={{height:54,display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"0 20px",borderBottom:"1px solid rgba(82,254,254,.1)",
            background:"rgba(0,3,8,.65)",backdropFilter:"blur(16px)",flexShrink:0}}>

            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{position:"relative",width:32,height:32}}>
                <svg viewBox="0 0 32 32" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
                  <circle cx="16" cy="16" r="14" fill="none" stroke="#00DFFB" strokeWidth=".6"
                    strokeDasharray="3 5" style={{animation:"spin-cw 8s linear infinite",transformOrigin:"16px 16px"}}/>
                  <circle cx="16" cy="16" r="9" fill="none" stroke="#0098F8" strokeWidth="1"
                    strokeDasharray="15 4" style={{animation:"spin-ccw 5s linear infinite",transformOrigin:"16px 16px"}}/>
                  <circle cx="16" cy="16" r="4" fill="#001421" stroke="rgba(82,254,254,.3)" strokeWidth=".5"/>
                </svg>
                <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
                  width:6,height:6,borderRadius:"50%",background:"#52FEFE",
                  boxShadow:"0 0 10px #00DFFB,0 0 20px rgba(0,223,251,.5)",
                  animation:"blink 2s ease-in-out infinite"}}/>
              </div>
              <div>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:900,
                  color:"#00DFFB",letterSpacing:"0.22em",textShadow:"0 0 20px rgba(0,223,251,.6)"}}>JARVIS</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,
                  color:"rgba(82,254,254,.3)",letterSpacing:"0.3em"}}>AI TRADING OS · V2.4</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:5,marginLeft:4}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:H.green,
                  boxShadow:`0 0 8px ${H.green}`,animation:"blink 2s ease-in-out infinite"}}/>
                <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,
                  color:"rgba(0,255,159,.6)",letterSpacing:"0.1em"}}>LIVE</span>
              </div>
            </div>

            <div style={{display:"flex",gap:4}}>
              {TICKERS.map(t=>{
                const s=signals.find(x=>x.symbol===t);
                const c=sigColor(s?.signal);
                const on=t===ticker;
                return(
                  <button key={t} className="tbtn" onClick={()=>setTicker(t)} style={{
                    border:`1px solid ${on?"#00DFFB":"rgba(82,254,254,.15)"}`,
                    background:on?"rgba(0,223,251,.1)":"rgba(0,3,8,.4)",
                    color:on?"#00DFFB":"rgba(82,254,254,.4)"}}>
                    {t}{s&&<span style={{marginLeft:5,fontSize:9,color:c}}>{s.signal==="BUY"?"▲":s.signal==="SELL"?"▼":"▬"}</span>}
                  </button>
                );
              })}
            </div>

            <div style={{display:"flex",alignItems:"center",gap:12}}>
              {/* Live index pills */}
              {nifty50 && (
                <div style={{display:"flex",alignItems:"center",gap:6,padding:"3px 10px",borderRadius:5,
                  background:"rgba(0,223,251,.05)",border:"1px solid rgba(82,254,254,.12)"}}>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,
                    color:"rgba(82,254,254,.4)",letterSpacing:"0.1em"}}>N50</span>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:H.text}}>
                    {fmtIdx(nifty50.last)}
                  </span>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,
                    color:pctColor(nifty50.pct_change)}}>
                    {nifty50.pct_change>=0?"+":""}{nifty50.pct_change?.toFixed(2)}%
                  </span>
                </div>
              )}
              {bankNifty && (
                <div style={{display:"flex",alignItems:"center",gap:6,padding:"3px 10px",borderRadius:5,
                  background:"rgba(0,223,251,.05)",border:"1px solid rgba(82,254,254,.12)"}}>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,
                    color:"rgba(82,254,254,.4)",letterSpacing:"0.1em"}}>BNK</span>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:H.text}}>
                    {fmtIdx(bankNifty.last)}
                  </span>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,
                    color:pctColor(bankNifty.pct_change)}}>
                    {bankNifty.pct_change>=0?"+":""}{bankNifty.pct_change?.toFixed(2)}%
                  </span>
                </div>
              )}
              {/* Market status */}
              {marketOpen !== null && (
                <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:5,
                  background:marketOpen?"rgba(0,255,159,.05)":"rgba(239,68,68,.05)",
                  border:`1px solid ${marketOpen?"rgba(0,255,159,.15)":"rgba(239,68,68,.15)"}`}}>
                  <div style={{width:5,height:5,borderRadius:"50%",
                    background:marketOpen?H.green:H.red,
                    boxShadow:`0 0 6px ${marketOpen?H.green:H.red}`,
                    animation:"blink 2s ease-in-out infinite"}}/>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,letterSpacing:"0.1em",
                    color:marketOpen?"rgba(0,255,159,.7)":"rgba(239,68,68,.6)"}}>
                    {marketOpen?"OPEN":"CLOSED"}
                  </span>
                </div>
              )}
              <button onClick={()=>setSearchOpen(true)} title="Search stocks (Ctrl+K)" style={{
                display:"flex",alignItems:"center",gap:8,padding:"5px 11px",borderRadius:7,cursor:"pointer",
                background:"rgba(0,223,251,.06)",border:"1px solid rgba(82,254,254,.18)",
                fontFamily:"'Rajdhani',sans-serif",fontSize:11,fontWeight:600,letterSpacing:".08em",
                color:"rgba(82,254,254,.65)",textTransform:"uppercase"}}>
                <span style={{fontSize:13}}>âŒ•</span> Search
                <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,padding:"1px 5px",borderRadius:3,
                  background:"rgba(82,254,254,.1)",color:"rgba(82,254,254,.5)"}}>Ctrl K</span>
              </button>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,
                  color:H.green,textShadow:`0 0 12px rgba(0,255,159,.4)`}}>₹{fmt(portTotal)}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,
                  color:"rgba(82,254,254,.3)",letterSpacing:"0.15em"}}>PORTFOLIO</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:13,
                  color:"#00DFFB",letterSpacing:"0.05em"}}>{timeStr}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,
                  color:"rgba(82,254,254,.3)",letterSpacing:"0.15em"}}>IST</div>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div style={{flex:1,display:"flex",overflow:"hidden"}}>

            {/* SIDEBAR */}
            <div style={{width:208,flexShrink:0,borderRight:"1px solid rgba(82,254,254,.08)",
              background:"rgba(0,3,8,.55)",backdropFilter:"blur(12px)",
              display:"flex",flexDirection:"column",padding:"12px 0"}}>
              {[
                {l:"Overview",   h:"/",            i:"â¬¡"},
                {l:"Dashboard",  h:"/dashboard",   i:"â—‰"},
                {l:"Portfolio",  h:"/portfolio",   i:"â—ˆ"},
                {l:"Signals",    h:"/signals",     i:"â—Ž"},
                {l:"Backtest",   h:"/backtest",    i:"â—†"},
                {l:"AI Insights",h:"/ai-insights", i:"â—‡"},
                {l:"Quotes",     h:"/quotes",      i:"▣"},
                {l:"Settings",   h:"/settings",    i:"âš™"},
              ].map(n=>{
                const active = pathname === n.h;
                return (
                  <Link key={n.l} href={n.h} className={`nav-a${active?" on":""}`}>
                    <span style={{fontSize:13,opacity:.6}}>{n.i}</span>{n.l}
                  </Link>
                );
              })}

              {/* WATCHLIST */}
              <div style={{flex:1,minHeight:0,display:"flex",flexDirection:"column",
                borderTop:"1px solid rgba(82,254,254,.08)",marginTop:12,paddingTop:10}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px 8px"}}>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(82,254,254,.4)",
                    letterSpacing:"0.22em",textTransform:"uppercase"}}>Watchlist</span>
                  <button onClick={()=>setSearchOpen(true)} title="Add stock (Ctrl+K)" style={{
                    width:18,height:18,borderRadius:4,cursor:"pointer",lineHeight:1,padding:0,
                    background:"rgba(0,223,251,.08)",border:"1px solid rgba(82,254,254,.2)",
                    color:"#00DFFB",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                </div>
                <div style={{flex:1,overflow:"auto",padding:"0 10px"}}>
                  {watch.length===0&&(
                    <div style={{padding:8,fontFamily:"'Rajdhani',sans-serif",fontSize:10,
                      color:"rgba(139,148,158,.6)",lineHeight:1.6}}>
                      Empty. Press <b style={{color:"rgba(82,254,254,.6)"}}>+</b> or <b style={{color:"rgba(82,254,254,.6)"}}>Ctrl K</b> to add stocks.
                    </div>
                  )}
                  {watch.map(w=>{
                    const pos=(w.change??0)>=0, c=pos?H.green:H.red, on=w.symbol===ticker;
                    return(
                      <div key={w.symbol} onClick={()=>setTicker(w.symbol)} style={{
                        display:"flex",alignItems:"center",justifyContent:"space-between",gap:6,
                        padding:"6px 8px",marginBottom:4,borderRadius:6,cursor:"pointer",
                        background:on?"rgba(0,223,251,.1)":"transparent",
                        border:`1px solid ${on?"rgba(82,254,254,.3)":"transparent"}`}}>
                        <div style={{minWidth:0}}>
                          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,
                            color:H.cyan,letterSpacing:"0.04em",whiteSpace:"nowrap",overflow:"hidden",
                            textOverflow:"ellipsis"}}>{w.symbol.replace(".NS","")}</div>
                          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(82,254,254,.3)"}}>
                            {w.price!=null?`₹${w.price}`:"—"}
                          </div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
                          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:c}}>
                            {pos?"+":""}{(w.change??0).toFixed(1)}%
                          </span>
                          <button onClick={e=>{e.stopPropagation();removeWatch(w.symbol);}} title="Remove" style={{
                            width:14,height:14,borderRadius:3,cursor:"pointer",lineHeight:1,padding:0,
                            background:"transparent",border:"none",color:"rgba(239,68,68,.55)",fontSize:11}}>Ã—</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{padding:"0 18px"}}>
                <div style={{borderTop:"1px solid rgba(82,254,254,.08)",paddingTop:12,
                  fontFamily:"'Share Tech Mono',monospace",fontSize:7,
                  color:"rgba(82,254,254,.2)",letterSpacing:"0.18em",lineHeight:1.9}}>
                  BUILT BY<br/><span style={{color:"rgba(82,254,254,.4)"}}>TANISHQ VERMA</span>
                </div>
              </div>
            </div>

            {/* MAIN GRID */}
            <div style={{flex:1,overflow:"auto",padding:"12px 14px",display:"grid",gap:10,
              gridTemplateColumns:"280px 1fr 250px",alignContent:"start"}}>

              {/* COL 1 */}
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:0.45,ease:"easeOut"}}>
                <TiltCard className={`glass glass-${signal?.signal?.toLowerCase()||"hold"}`} style={{padding:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                    <Lbl>Signal · {ticker.replace(".NS","")}</Lbl>
                    {signal?.model&&(
                      <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,
                        color:"rgba(82,254,254,.35)",letterSpacing:"0.1em",textTransform:"uppercase",
                        background:"rgba(82,254,254,.06)",border:"1px solid rgba(82,254,254,.1)",
                        padding:"2px 6px",borderRadius:3}}>{signal.model.replace("_"," ")}</span>
                    )}
                  </div>
                  {loading?<Spin/>:(
                    <>
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:38,fontWeight:900,
                        color:sigC,textShadow:`0 0 30px ${sigC}80,0 0 60px ${sigC}30`,
                        letterSpacing:"0.12em",marginBottom:8,lineHeight:1}}>{signal?.signal||"—"}</div>
                      <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:11,
                        color:H.muted,lineHeight:1.7,marginBottom:10}}>
                        {signal?.reason || (!signal&&"Connecting to strategy engine...")}
                      </div>
                      {signal&&(
                        <>
                          {signal.scanner_signal&&signal.scanner_signal!=="NEUTRAL"&&(
                            <div style={{marginBottom:10}}>
                              <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,
                                color:sigC,background:`${sigC}12`,border:`1px solid ${sigC}25`,
                                padding:"3px 8px",borderRadius:3,letterSpacing:"0.08em"}}>
                                {signal.scanner_signal}
                              </span>
                              {signal.breakout_strength&&signal.breakout_strength!=="WEAK"&&(
                                <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,
                                  color:"rgba(82,254,254,.4)",marginLeft:8,letterSpacing:"0.08em"}}>
                                  {signal.breakout_strength}
                                </span>
                              )}
                            </div>
                          )}
                          {signal.signal!=="HOLD"&&signal.entry&&signal.stop_loss&&signal.target1&&(
                            <div style={{marginBottom:10,padding:"7px 9px",borderRadius:6,
                              background:`${sigC}08`,border:`1px solid ${sigC}20`,
                              fontFamily:"'Share Tech Mono',monospace",fontSize:8,
                              display:"flex",gap:10,flexWrap:"wrap"}}>
                              <span style={{color:"rgba(82,254,254,.5)"}}>ENTRY</span>
                              <span style={{color:H.text}}>₹{signal.entry}</span>
                              <span style={{color:"rgba(82,254,254,.3)"}}>·</span>
                              <span style={{color:H.red}}>SL ₹{signal.stop_loss}</span>
                              <span style={{color:"rgba(82,254,254,.3)"}}>·</span>
                              <span style={{color:H.green}}>TP ₹{signal.target1}</span>
                              {signal.risk_reward&&(
                                <><span style={{color:"rgba(82,254,254,.3)"}}>·</span>
                                <span style={{color:signal.risk_reward>=2?H.green:H.amber}}>
                                  R:R {signal.risk_reward.toFixed(1)}
                                </span></>
                              )}
                            </div>
                          )}
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                            <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,
                              color:"rgba(82,254,254,.4)",letterSpacing:"0.1em"}}>CONFIDENCE</span>
                            <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,
                              fontWeight:700,color:sigC}}>{signal.confidence}%</span>
                          </div>
                          <Bar value={signal.confidence} color={sigC}/>
                          {signal.signal!=="HOLD"&&signal.kelly_half_pct!=null&&signal.kelly_half_pct>0&&(
                            <div style={{marginTop:10,padding:"7px 9px",borderRadius:6,
                              background:"rgba(0,223,251,.05)",border:"1px solid rgba(82,254,254,.12)"}}>
                              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,
                                color:"rgba(82,254,254,.4)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>
                                Position Size · Half-Kelly
                              </div>
                              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:900,
                                  color:H.green,textShadow:`0 0 10px rgba(0,255,159,.4)`}}>
                                  ₹{(signal.position_size_inr??0).toLocaleString("en-IN")}
                                </span>
                                <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,
                                  color:"rgba(82,254,254,.4)"}}>
                                  {(signal.kelly_half_pct??0).toFixed(1)}% of ₹1L
                                </span>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </TiltCard>
                </motion.div>

                {risk&&(
                  <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:0.45,ease:"easeOut",delay:0.1}}>
                  <TiltCard className="glass" style={{padding:16}}>
                    <Lbl>Risk Matrix · {ticker}</Lbl>
                    <Row label="Volatility"   value={risk.volatility.toFixed(1)+"%"}    color={H.amber}/>
                    <Bar value={Math.min(risk.volatility*3,100)} color={H.amber}/>
                    <Row label="Sharpe"       value={risk.sharpe.toFixed(2)}             color={risk.sharpe>=1?H.green:H.amber}/>
                    <Bar value={Math.min(Math.abs(risk.sharpe)*40,100)} color={risk.sharpe>=1?H.green:H.amber}/>
                    <Row label="Max Drawdown" value={risk.max_drawdown.toFixed(1)+"%"}  color={H.red}/>
                    <Bar value={Math.min(risk.max_drawdown*3,100)} color={H.red}/>
                    <Row label="Win Rate"     value={risk.win_rate.toFixed(1)+"%"}       color={risk.win_rate>=50?H.green:H.amber}/>
                    <Bar value={risk.win_rate} color={risk.win_rate>=50?H.green:H.amber}/>
                  </TiltCard>
                  </motion.div>
                )}
              </div>

              {/* COL 2 */}
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:0.5,ease:"easeOut",delay:0.05}}>
                <TiltCard className="glass" style={{padding:16}} maxTilt={6}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <Lbl>Candlestick · {ticker}</Lbl>
                    <button onClick={()=>setShowChart(s=>!s)} className="tbtn"
                      style={{border:`1px solid ${showChart?"rgba(82,254,254,.25)":"rgba(255,107,0,.35)"}`,
                        background:showChart?"rgba(0,223,251,.06)":"rgba(255,107,0,.08)",
                        color:showChart?"rgba(82,254,254,.55)":"#FF6B00",fontSize:10,padding:"4px 10px"}}>
                      {showChart?"▼ HIDE":"▶ SHOW"}
                    </button>
                  </div>
                  <motion.div initial={false}
                    animate={{ height: showChart ? "auto" : 0, opacity: showChart ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}>
                    <CandleChart symbol={ticker} apiBase={API}/>
                  </motion.div>
                </TiltCard>
                </motion.div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[
                    {l:"Portfolio",    v:"₹"+fmt(portTotal),  sub:port.filter(p=>(p.ret??0)>0).length+"/"+port.length+" up", color:H.green,  cls:"glass-hi"},
                    {l:"Buy Signals",  v:String(buyCnt),       sub:"of "+signals.length+" total",                                    color:H.green,  cls:buyCnt>0?"glass-buy":""},
                    {l:"Avg Accuracy", v:(signals.length?signals.reduce((a,s)=>a+s.accuracy,0)/signals.length:0).toFixed(1)+"%", sub:"LSTM model", color:H.cyan, cls:""},
                    {l:"Risk Level",   v:risk?risk.volatility.toFixed(1)+"% vol":"—", sub:risk?risk.volatility>25?"HIGH":"MEDIUM":"—", color:H.amber, cls:"glass-hold"},
                  ].map((m,i)=>(
                    <motion.div key={m.l} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
                      transition={{duration:0.4,ease:"easeOut",delay:0.15+i*0.06}}>
                    <TiltCard className={`glass ${m.cls}`} style={{padding:14}}>
                      <Lbl>{m.l}</Lbl>
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:20,fontWeight:900,
                        color:m.color,textShadow:`0 0 16px ${m.color}60`,lineHeight:1,marginBottom:4}}>
                        {loading?"—":m.v}
                      </div>
                      <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:10,fontWeight:600,
                        color:H.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>{m.sub}</div>
                    </TiltCard>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* COL 3 */}
              <div style={{display:"flex",flexDirection:"column",gap:10,overflow:"auto"}}>
                <motion.div initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} transition={{duration:0.45,ease:"easeOut",delay:0.1}}>
                <TiltCard className="glass" style={{padding:16}} maxTilt={8}>
                  <Lbl>Top Signals</Lbl>
                  {loading?<Spin/>:signals.filter(s=>s.signal!=="HOLD").slice(0,8).map((s,i)=>{
                    const c=sigColor(s.signal);
                    return(
                      <motion.div key={s.symbol} onClick={()=>setTicker(s.symbol)}
                        style={{padding:"8px 10px",marginBottom:6,borderRadius:8,cursor:"pointer",
                          background:`${c}08`,border:`1px solid ${c}20`}}
                        initial={{opacity:0,x:10}} animate={{opacity:1,x:0}}
                        transition={{duration:0.3,delay:i*0.05}}
                        whileHover={{x:3,background:`${c}14`,transition:{duration:0.15}}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                          <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,
                            fontWeight:700,color:H.cyan,letterSpacing:"0.06em"}}>{s.symbol.replace(".NS","")}</span>
                          <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:900,
                            color:c,background:`${c}15`,border:`1px solid ${c}30`,
                            padding:"1px 7px",borderRadius:3,letterSpacing:"0.1em"}}>{s.signal}</span>
                        </div>
                        <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:10,
                          color:H.muted,marginBottom:4,lineHeight:1.4}}>
                          {s.reason.split(" · ").slice(0,2).join(" · ")}
                        </div>
                        <Bar value={s.confidence} color={c}/>
                        <div style={{display:"flex",justifyContent:"space-between",
                          fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(82,254,254,.35)"}}>
                          <span>CONF {s.confidence}%</span><span>ACC {s.accuracy}%</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </TiltCard>
                </motion.div>

                <motion.div initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} transition={{duration:0.45,ease:"easeOut",delay:0.2}}>
                <TiltCard className="glass" style={{padding:16}} maxTilt={8}>
                  <Lbl>Portfolio</Lbl>
                  {loading?<Spin/>:port.map(p=>{
                    const ret=p.ret??0;
                    const pos=ret>=0, c=pos?H.green:H.red;
                    return(
                      <div key={p.symbol} style={{marginBottom:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,
                            fontWeight:700,color:H.cyan,letterSpacing:"0.06em"}}>{p.symbol.replace(".NS","")}</span>
                          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:c}}>
                            {pos?"+":""}{ret.toFixed(2)}%</span>
                        </div>
                        <Bar value={Math.min(Math.abs(ret)*4,100)} color={c}/>
                      </div>
                    );
                  })}
                  {!loading&&port.length>0&&(
                    <div style={{borderTop:"1px solid rgba(82,254,254,.08)",paddingTop:10,marginTop:4,
                      display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,
                        color:"rgba(82,254,254,.35)",letterSpacing:"0.15em"}}>TOTAL</span>
                      <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:14,fontWeight:900,
                        color:H.green,textShadow:`0 0 10px rgba(0,255,159,.4)`}}>₹{fmt(portTotal)}</span>
                    </div>
                  )}
                </TiltCard>
                </motion.div>
              </div>
            </div>
          </div>

          {/* STATUS BAR */}
          <div style={{height:28,borderTop:"1px solid rgba(82,254,254,.08)",
            background:"rgba(0,3,8,.7)",backdropFilter:"blur(12px)",
            display:"flex",alignItems:"center",justifyContent:"space-between",
            padding:"0 20px",flexShrink:0,overflow:"hidden"}}>
            <div style={{flex:1,overflow:"hidden"}}>
              <div style={{display:"flex",animation:"ticker 25s linear infinite",whiteSpace:"nowrap"}}>
                {[...signals,...signals].map((s,i)=>{
                  const c=sigColor(s.signal);
                  return(
                    <span key={i} style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,
                      letterSpacing:"0.08em",padding:"0 20px",color:"rgba(82,254,254,.4)"}}>
                      <span style={{color:H.cyan}}>{s.symbol}</span>
                      <span style={{marginLeft:6,color:c}}>{s.signal}</span>
                      <span style={{marginLeft:5,color:"rgba(82,254,254,.25)"}}>
                        {s.confidence}% · {s.accuracy}%
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:14,flexShrink:0}}>
              {nifty50 && (
                <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,letterSpacing:"0.08em",
                  color:"rgba(82,254,254,.3)"}}>
                  NIFTY <span style={{color:pctColor(nifty50.pct_change)}}>{fmtIdx(nifty50.last)}</span>
                </span>
              )}
              <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,
                color:"rgba(82,254,254,.2)",letterSpacing:"0.1em"}}>LSTM · ACTIVE</span>
              <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,
                color:"rgba(82,254,254,.2)",letterSpacing:"0.1em"}}>:8000</span>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <div style={{width:4,height:4,borderRadius:"50%",background:H.green,
                  boxShadow:`0 0 6px ${H.green}`,animation:"blink 2s ease-in-out infinite"}}/>
                <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,
                  color:"rgba(0,255,159,.5)",letterSpacing:"0.1em"}}>ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH MODAL */}
      {searchOpen&&(
        <div onClick={()=>setSearchOpen(false)} style={{position:"fixed",inset:0,zIndex:1000,
          background:"rgba(0,3,8,.7)",backdropFilter:"blur(6px)",
          display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:"12vh"}}>
          <div onClick={e=>e.stopPropagation()} style={{width:"min(560px,92vw)",
            background:"linear-gradient(160deg,rgba(0,20,33,.96),rgba(0,3,8,.98))",
            border:"1px solid rgba(82,254,254,.25)",borderRadius:14,overflow:"hidden",
            boxShadow:"0 0 60px rgba(0,223,251,.18)"}}>
            <form onSubmit={e=>{
              e.preventDefault();
              const sym = suggIdx>=0 && suggestions[suggIdx] ? suggestions[suggIdx].symbol : searchQ;
              setSearchQ(sym.replace(".NS",""));
              setSuggIdx(-1);
              runSearch(sym);
            }} style={{display:"flex",alignItems:"center",gap:10,padding:"14px 16px",
              borderBottom:"1px solid rgba(82,254,254,.12)"}}>
              <span style={{fontSize:16,color:"rgba(82,254,254,.5)"}}>âŒ•</span>
              <input ref={inputRef} autoFocus value={searchQ}
                onChange={e=>{ setSearchQ(e.target.value); setSearchHit(null); setSearchErr(""); setSuggIdx(-1); }}
                onKeyDown={e=>{
                  if(suggestions.length===0) return;
                  if(e.key==="ArrowDown"){ e.preventDefault(); setSuggIdx(i=>Math.min(i+1,suggestions.length-1)); }
                  else if(e.key==="ArrowUp"){ e.preventDefault(); setSuggIdx(i=>Math.max(i-1,-1)); }
                  else if(e.key==="Tab"){ e.preventDefault();
                    const s=suggestions[suggIdx>=0?suggIdx:0];
                    if(s){ setSearchQ(s.symbol.replace(".NS","")); setSuggIdx(-1); }
                  }
                }}
                placeholder="Search by name, symbol or sector…"
                style={{flex:1,background:"transparent",border:"none",outline:"none",
                  fontFamily:"'Rajdhani',sans-serif",fontSize:15,fontWeight:600,
                  color:H.text,letterSpacing:".02em"}}/>
              <button type="submit" className="tbtn" style={{
                border:"1px solid rgba(82,254,254,.25)",background:"rgba(0,223,251,.1)",color:"#00DFFB"}}>GO</button>
            </form>

            {!searchHit && !searchBusy && suggestions.length>0 && (
              <div style={{borderBottom:"1px solid rgba(82,254,254,.1)"}}>
                {suggestions.map((s,i)=>{
                  const active = i===suggIdx;
                  return(
                    <div key={s.symbol} onMouseEnter={()=>setSuggIdx(i)} onMouseLeave={()=>setSuggIdx(-1)}
                      onClick={()=>{ setSearchQ(s.symbol.replace(".NS","")); setSuggIdx(-1); runSearch(s.symbol); }}
                      style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                        padding:"9px 16px",cursor:"pointer",
                        background:active?"rgba(0,223,251,.08)":"transparent",
                        borderLeft:`2px solid ${active?"rgba(0,223,251,.6)":"transparent"}`,
                        transition:"background 0.1s"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:700,
                          color:active?H.cyan:"rgba(82,254,254,.7)",minWidth:90,letterSpacing:".04em"}}>
                          {s.symbol.replace(".NS","")}
                        </span>
                        <span style={{fontFamily:"'Rajdhani',sans-serif",fontSize:12,
                          color:active?H.text:"rgba(230,237,243,.55)"}}>{s.name}</span>
                      </div>
                      <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,
                        letterSpacing:".12em",textTransform:"uppercase",
                        padding:"2px 7px",borderRadius:3,
                        background:"rgba(82,254,254,.06)",color:"rgba(82,254,254,.45)"}}>
                        {s.sector}
                      </span>
                    </div>
                  );
                })}
                <div style={{padding:"5px 16px 7px",fontFamily:"'Share Tech Mono',monospace",fontSize:7,
                  color:"rgba(82,254,254,.25)",letterSpacing:".12em"}}>
                  â†'â†" NAVIGATE · TAB COMPLETE · ENTER OR CLICK TO ANALYSE
                </div>
              </div>
            )}

            <div style={{padding:16,maxHeight:"52vh",overflow:"auto"}}>
              {searchBusy&&<Spin/>}
              {!searchBusy&&searchErr&&(
                <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:12,color:H.red,padding:"8px 4px"}}>
                  âš  {searchErr}
                </div>
              )}
              {!searchBusy&&!searchErr&&!searchHit&&searchQ.length===0&&(
                <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:11,color:H.muted,lineHeight:1.7,padding:4}}>
                  Start typing a <b style={{color:"rgba(82,254,254,.6)"}}>stock name</b>, <b style={{color:"rgba(82,254,254,.6)"}}>symbol</b>, or <b style={{color:"rgba(82,254,254,.6)"}}>sector</b> — suggestions appear instantly.
                </div>
              )}
              {!searchBusy&&!searchErr&&!searchHit&&searchQ.length>0&&suggestions.length===0&&(
                <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:11,color:H.muted,padding:"8px 4px"}}>
                  No matches. Press <b style={{color:"rgba(82,254,254,.6)"}}>Enter</b> to search "{searchQ}" on NSE directly.
                </div>
              )}
              {!searchBusy&&searchHit&&(()=>{
                const c=sigColor(searchHit.signal);
                const inWatch=watch.some(w=>w.symbol===searchHit.symbol);
                return(
                  <div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                      <div>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,fontWeight:900,
                          color:H.cyan,letterSpacing:".04em"}}>{searchHit.symbol.replace(".NS","")}</div>
                        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:H.text}}>₹{searchHit.price}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,fontWeight:900,color:c,
                          textShadow:`0 0 18px ${c}60`}}>{searchHit.signal}</div>
                        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(82,254,254,.4)"}}>
                          R:R {searchHit.risk_reward}
                        </div>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                      {([
                        ["Entry",`₹${searchHit.entry}`,H.cyan],
                        ["Stop Loss",`₹${searchHit.stop_loss}`,H.red],
                        ["Target 1",`₹${searchHit.target1}`,H.green],
                        ["Target 2",`₹${searchHit.target2}`,H.green],
                        ["RSI",String(searchHit.rsi),searchHit.rsi<35?H.green:searchHit.rsi>65?H.red:H.amber],
                        ["Momentum",`${searchHit.momentum}%`,searchHit.momentum>=0?H.green:H.red],
                        ["½-Kelly Size",searchHit.position_size_inr?`₹${searchHit.position_size_inr.toLocaleString("en-IN")}`:"—",H.cyan],
                        ["Sizing",searchHit.sizing_label||"—",H.cyan],
                      ] as [string,string,string][]).map(([l,v,col])=>(
                        <div key={l} style={{background:"rgba(0,223,251,.04)",
                          border:"1px solid rgba(82,254,254,.1)",borderRadius:8,padding:"8px 10px"}}>
                          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,
                            color:"rgba(82,254,254,.4)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:3}}>{l}</div>
                          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:700,color:col}}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>{setTicker(searchHit.symbol);if(!inWatch)addWatch(searchHit.symbol);setSearchOpen(false);}}
                        className="tbtn" style={{flex:1,padding:9,border:"1px solid rgba(82,254,254,.25)",
                        background:"rgba(0,223,251,.1)",color:"#00DFFB"}}>OPEN IN CHART</button>
                      <button onClick={()=>inWatch?removeWatch(searchHit.symbol):addWatch(searchHit.symbol)}
                        className="tbtn" style={{flex:1,padding:9,
                        border:`1px solid ${inWatch?"rgba(239,68,68,.3)":"rgba(0,255,159,.3)"}`,
                        background:inWatch?"rgba(239,68,68,.08)":"rgba(0,255,159,.08)",
                        color:inWatch?H.red:H.green}}>{inWatch?"REMOVE":"+ ADD TO WATCHLIST"}</button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
