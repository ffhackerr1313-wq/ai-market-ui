"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { sceneScroll } from "@/lib/landingState";

const LandingScene = dynamic(() => import("@/components/landing/LandingScene"), { ssr: false });
const CobeGlobe    = dynamic(() => import("@/components/landing/CobeGlobe"),    { ssr: false });

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const H = {
  cyan:"#00DFFB", hot:"#52FEFE", electric:"#0098F8",
  void:"#000308", navy:"#001421",
  green:"#00FF9F", red:"#ef4444", amber:"#FF6B00",
  text:"#e6edf3", muted:"rgba(139,148,158,0.75)",
};

type Signal = {
  symbol:string; signal:"BUY"|"SELL"|"HOLD"; confidence:number; accuracy:number;
  entry?:number; stop_loss?:number; target1?:number; risk_reward?:number; reason:string;
};
type Port = { symbol:string; value:number; ret:number; allocation:number };
type IndexData = { name:string; symbol:string; last:number; pct_change:number; change:number };

const sigColor = (s?:string) => s==="BUY"?H.green:s==="SELL"?H.red:H.amber;
const fmt = (n:number) => n.toLocaleString("en-IN",{maximumFractionDigits:0});

// â”€â”€â”€ Animation variants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const fadeUp = {
  hidden:  { opacity:0, y:48 },
  visible: { opacity:1, y:0, transition:{ duration:0.85, ease:[0.16,1,0.3,1] as [number,number,number,number] } },
};
const staggerContainer = {
  hidden:  {},
  visible: { transition:{ staggerChildren:0.14 } },
};
const fadeIn = {
  hidden:  { opacity:0 },
  visible: { opacity:1, transition:{ duration:0.7 } },
};

// â”€â”€â”€ Reusable section label â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SectionTag({ num, label }: { num:string; label:string }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:40}}>
      <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,
        color:H.hot,letterSpacing:"0.35em"}}>{num}</span>
      <div style={{width:48,height:1,background:`linear-gradient(90deg,${H.hot},transparent)`}}/>
      <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,
        color:"rgba(82,254,254,.45)",letterSpacing:"0.28em",textTransform:"uppercase"}}>{label}</span>
    </div>
  );
}

// â”€â”€â”€ Divider line â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Divider() {
  return (
    <div style={{width:"100%",height:1,
      background:"linear-gradient(90deg,transparent 0%,rgba(82,254,254,.15) 20%,rgba(0,223,251,.25) 50%,rgba(82,254,254,.15) 80%,transparent 100%)",
      margin:"0 auto"}}/>
  );
}

// â”€â”€â”€ Glass card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function GlassCard({ children, style, className="" }: {
  children:React.ReactNode; style?:React.CSSProperties; className?:string;
}) {
  return (
    <div className={className} style={{
      borderRadius:14, padding:20,
      background:"linear-gradient(135deg,rgba(0,223,251,.07),rgba(0,152,248,.02))",
      border:"1px solid rgba(82,254,254,.14)",
      boxShadow:"0 0 30px rgba(0,223,251,.06),inset 0 1px 0 rgba(255,255,255,.05)",
      backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// â”€â”€â”€ Inline styles sheet â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#000308;overflow-x:hidden;}
html{scroll-behavior:smooth;}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-thumb{background:rgba(0,223,251,.2);border-radius:2px}
@keyframes spin-cw  {to{transform:rotate(360deg)}}
@keyframes spin-ccw {to{transform:rotate(-360deg)}}
@keyframes blink    {0%,100%{opacity:1}50%{opacity:.25}}
@keyframes bounce-y {0%,100%{transform:translateY(0)}50%{transform:translateY(9px)}}
@keyframes ticker   {0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes glow-pulse{0%,100%{opacity:1;text-shadow:0 0 40px rgba(0,223,251,.6),0 0 80px rgba(0,223,251,.2)}
  50%{opacity:.85;text-shadow:0 0 60px rgba(0,223,251,.9),0 0 120px rgba(0,223,251,.4)}}
@keyframes grain{0%,100%{transform:translate(0,0)}10%{transform:translate(-2%,-3%)}
  20%{transform:translate(2%,2%)}30%{transform:translate(-1%,1%)}40%{transform:translate(3%,-2%)}
  50%{transform:translate(-2%,2%)}60%{transform:translate(1%,3%)}70%{transform:translate(-3%,-1%)}
  80%{transform:translate(2%,-2%)}90%{transform:translate(-1%,2%)}}
.noise-overlay{pointer-events:none;position:fixed;inset:-200%;z-index:200;width:400%;height:400%;
  opacity:0.018;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  animation:grain 0.5s steps(2) infinite;}

.landing-section { position:relative; z-index:1; }

.cta-btn {
  display:inline-flex; align-items:center; gap:12px;
  padding:18px 44px; border-radius:50px; cursor:pointer;
  font-family:'Orbitron',sans-serif; font-size:13px; font-weight:700;
  letter-spacing:0.22em; text-transform:uppercase;
  color:#000308; background:linear-gradient(135deg,#00DFFB,#52FEFE);
  border:none; transition:all .3s ease;
  box-shadow:0 0 40px rgba(0,223,251,.4),0 0 80px rgba(0,223,251,.15);
  text-decoration:none;
}
.cta-btn:hover {
  transform:translateY(-3px) scale(1.03);
  box-shadow:0 0 60px rgba(0,223,251,.6),0 0 120px rgba(0,223,251,.25);
}
.cta-btn:active { transform:translateY(-1px) scale(1.01); }

.signal-card {
  border-radius:14px; padding:18px; position:relative; overflow:hidden;
  transition:transform .2s ease, box-shadow .2s ease;
}
.signal-card:hover { transform:translateY(-4px); }
.signal-card-buy  { background:linear-gradient(135deg,rgba(0,255,159,.07),rgba(0,255,159,.02));
  border:1px solid rgba(0,255,159,.22); box-shadow:0 0 20px rgba(0,255,159,.08); }
.signal-card-sell { background:linear-gradient(135deg,rgba(239,68,68,.07),rgba(239,68,68,.02));
  border:1px solid rgba(239,68,68,.22); box-shadow:0 0 20px rgba(239,68,68,.08); }
.signal-card-hold { background:linear-gradient(135deg,rgba(255,107,0,.07),rgba(255,107,0,.02));
  border:1px solid rgba(255,107,0,.2);  box-shadow:0 0 20px rgba(255,107,0,.06); }
`;

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// MAIN COMPONENT
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function CinematicLanding() {
  const [signals,    setSignals]    = useState<Signal[]>([]);
  const [portfolio,  setPortfolio]  = useState<Port[]>([]);
  const [indices,    setIndices]    = useState<IndexData[]>([]);
  const [buyCnt,     setBuyCnt]     = useState(0);
  const [portTotal,  setPortTotal]  = useState(0);
  const [marketOpen, setMarketOpen] = useState<boolean|null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Section refs for IntersectionObserver ↑ updates sceneScroll.section
  const sectionRefs = [
    useRef<HTMLElement>(null),
    useRef<HTMLElement>(null),
    useRef<HTMLElement>(null),
    useRef<HTMLElement>(null),
    useRef<HTMLElement>(null),
  ];

  // â”€â”€ Fetch live data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(()=>{
    Promise.all([
      fetch(`${API}/api/signals`).then(r=>r.json()).catch(()=>[]),
      fetch(`${API}/api/portfolio`).then(r=>r.json()).catch(()=>[]),
      fetch(`${API}/api/nse/indices`).then(r=>r.json()).catch(()=>[]),
      fetch(`${API}/api/nse/market`).then(r=>r.json()).catch(()=>({})),
    ]).then(([sig, port, idx, mkt])=>{
      const sigs = Array.isArray(sig) ? sig : [];
      const prt  = Array.isArray(port) ? port : [];
      const idxs = Array.isArray(idx) ? idx : [];
      setSignals(sigs);
      setPortfolio(prt);
      setIndices(idxs);
      setBuyCnt(sigs.filter((s:Signal)=>s.signal==="BUY").length);
      setPortTotal(prt.reduce((a:number,p:Port)=>a+(p.value??0),0));
      setMarketOpen(mkt?.is_open ?? false);
      setDataLoaded(true);
    }).catch(()=>setDataLoaded(true));
  },[]);

  // â”€â”€ Section tracking ↑ update 3D scene â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(()=>{
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.getAttribute("data-section") ?? "0");
            sceneScroll.section = idx;
          }
        });
      },
      { threshold: 0.45 }
    );
    sectionRefs.forEach(r => { if(r.current) observer.observe(r.current); });
    return () => observer.disconnect();
  }, []);

  // Top signals to show in section 3 (prefer BUY, then by confidence)
  const topSignals = [...signals]
    .sort((a,b)=>(a.signal==="BUY"?0:1)-(b.signal==="BUY"?0:1) || b.confidence-a.confidence)
    .slice(0,3);

  // Key indices
  const nifty50   = indices.find(i=>i.name?.includes("NIFTY 50") && !i.name?.includes("BANK") && !i.name?.includes("NEXT"));
  const bankNifty = indices.find(i=>i.name?.includes("NIFTY BANK") || i.symbol?.includes("BANK"));
  const fmtIdx = (n:number) => n?.toLocaleString("en-IN",{maximumFractionDigits:2}) ?? "—";
  const pctColor = (p:number) => p >= 0 ? H.green : H.red;

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <>
      <style>{CSS}</style>

      {/* Film grain overlay */}
      <div className="noise-overlay" aria-hidden="true"/>

      {/* Fixed 3D background */}
      <LandingScene />

      {/* â”€â”€ TICKER STRIP (top, fixed) â”€â”€ */}
      <div style={{position:"fixed",top:0,left:0,right:0,zIndex:50,height:32,
        background:"rgba(0,3,8,.8)",backdropFilter:"blur(12px)",
        borderBottom:"1px solid rgba(82,254,254,.08)",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"0 24px",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:H.green,
              boxShadow:`0 0 6px ${H.green}`,animation:"blink 2s ease-in-out infinite"}}/>
            <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:9,fontWeight:700,
              color:"rgba(82,254,254,.6)",letterSpacing:"0.2em"}}>JARVIS</span>
          </div>
          {/* Live index pills */}
          {nifty50 && (
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"2px 10px",borderRadius:4,
              background:"rgba(0,223,251,.04)",border:"1px solid rgba(82,254,254,.1)"}}>
              <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,
                color:"rgba(82,254,254,.4)",letterSpacing:"0.1em"}}>N50</span>
              <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:H.text}}>
                {fmtIdx(nifty50.last)}
              </span>
              <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,
                color:pctColor(nifty50.pct_change)}}>
                {nifty50.pct_change>=0?"+":""}{nifty50.pct_change?.toFixed(2)}%
              </span>
            </div>
          )}
          {bankNifty && (
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"2px 10px",borderRadius:4,
              background:"rgba(0,223,251,.04)",border:"1px solid rgba(82,254,254,.1)"}}>
              <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,
                color:"rgba(82,254,254,.4)",letterSpacing:"0.1em"}}>BNK</span>
              <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:H.text}}>
                {fmtIdx(bankNifty.last)}
              </span>
              <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,
                color:pctColor(bankNifty.pct_change)}}>
                {bankNifty.pct_change>=0?"+":""}{bankNifty.pct_change?.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16,flexShrink:0}}>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,letterSpacing:"0.12em",
            color:marketOpen===true?H.green:marketOpen===false?"rgba(239,68,68,.7)":"rgba(82,254,254,.3)"}}>
            {marketOpen===true?"â— MARKET OPEN":marketOpen===false?"â— MARKET CLOSED":"â— —"}
          </span>
          <Link href="/dashboard" style={{fontFamily:"'Rajdhani',sans-serif",fontSize:10,fontWeight:700,
            letterSpacing:"0.15em",textTransform:"uppercase",color:"rgba(82,254,254,.5)",
            textDecoration:"none",borderLeft:"1px solid rgba(82,254,254,.15)",paddingLeft:16,
            transition:"color .15s ease"}}
            onMouseEnter={e=>(e.currentTarget.style.color=H.cyan)}
            onMouseLeave={e=>(e.currentTarget.style.color="rgba(82,254,254,.5)")}>
            Enter Workstation ↑
          </Link>
        </div>
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* SECTION 1 — HERO                                                    */}
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section
        ref={sectionRefs[0]} data-section="0"
        className="landing-section"
        style={{minHeight:"100vh",display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",paddingTop:32,
          textAlign:"center",position:"relative"}}>

        {/* JARVIS logo mark */}
        <motion.div
          initial={{ opacity:0, scale:0.4 }}
          animate={{ opacity:1, scale:1 }}
          transition={{ duration:1, ease:[0.16,1,0.3,1], delay:0.2 }}
          style={{position:"relative",width:64,height:64,marginBottom:36}}>
          <svg viewBox="0 0 64 64" style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
            <circle cx="32" cy="32" r="28" fill="none" stroke="#00DFFB" strokeWidth="0.8"
              strokeDasharray="4 8" style={{animation:"spin-cw 10s linear infinite",transformOrigin:"32px 32px"}}/>
            <circle cx="32" cy="32" r="20" fill="none" stroke="#0098F8" strokeWidth="1.2"
              strokeDasharray="22 6" style={{animation:"spin-ccw 7s linear infinite",transformOrigin:"32px 32px"}}/>
            <circle cx="32" cy="32" r="10" fill="none" stroke="#52FEFE" strokeWidth="0.8"
              strokeDasharray="6 6" style={{animation:"spin-cw 3.5s linear infinite",transformOrigin:"32px 32px"}}/>
            <circle cx="32" cy="32" r="5" fill="#001421" stroke="rgba(82,254,254,.3)" strokeWidth="0.6"/>
          </svg>
          <div style={{position:"absolute",top:"50%",left:"50%",
            transform:"translate(-50%,-50%)",width:10,height:10,
            borderRadius:"50%",background:"#52FEFE",
            boxShadow:"0 0 16px #00DFFB,0 0 32px rgba(0,223,251,.5)",
            animation:"blink 2.2s ease-in-out infinite"}}/>
        </motion.div>

        {/* Main JARVIS title */}
        <motion.div
          initial={{ opacity:0, y:60 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:1.1, ease:[0.16,1,0.3,1], delay:0.35 }}>
          <div style={{
            fontFamily:"'Orbitron',sans-serif",
            fontSize:"clamp(72px,10vw,148px)",
            fontWeight:900,
            color:H.cyan,
            letterSpacing:"0.18em",
            lineHeight:0.9,
            animation:"glow-pulse 4s ease-in-out infinite",
          }}>JARVIS</div>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity:0, y:30 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.9, ease:[0.16,1,0.3,1], delay:0.7 }}
          style={{marginTop:24}}>
          <div style={{fontFamily:"'Rajdhani',sans-serif",
            fontSize:"clamp(14px,2vw,20px)",fontWeight:600,
            color:"rgba(82,254,254,.65)",letterSpacing:"0.35em",
            textTransform:"uppercase"}}>
            AI TRADING OPERATING SYSTEM
          </div>
        </motion.div>

        {/* Tag line */}
        <motion.div
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ duration:0.8, delay:1.0 }}
          style={{marginTop:14}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:"clamp(9px,1.2vw,11px)",
            color:"rgba(82,254,254,.3)",letterSpacing:"0.3em",textTransform:"uppercase"}}>
            NIFTY 50 · BANK NIFTY · INDIA MARKETS · LSTM + ICT
          </div>
        </motion.div>

        {/* Version badge */}
        <motion.div
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ duration:0.7, delay:1.2 }}
          style={{marginTop:20}}>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,
            color:H.cyan,background:"rgba(0,223,251,.08)",
            border:"1px solid rgba(82,254,254,.2)",
            borderRadius:20,padding:"5px 14px",letterSpacing:"0.18em"}}>
            V 2.4 · {buyCnt > 0 ? `${buyCnt} BUY SIGNALS ACTIVE` : "SCANNING MARKETS"}
          </span>
        </motion.div>

        {/* Stat pills */}
        <motion.div
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.8, delay:1.4 }}
          style={{marginTop:40,display:"flex",gap:16,flexWrap:"wrap",justifyContent:"center"}}>
          {[
            { label:"Portfolio", value: portTotal > 0 ? `₹${fmt(portTotal)}` : "Loading…", color:H.green },
            { label:"Signals",   value: signals.length > 0 ? `${signals.length} tracked` : "Loading…", color:H.cyan },
            { label:"Engine",    value:"LSTM + ICT", color:H.hot },
          ].map(p=>(
            <div key={p.label} style={{
              fontFamily:"'Rajdhani',sans-serif",fontSize:11,fontWeight:700,
              letterSpacing:"0.1em",textTransform:"uppercase",
              padding:"8px 18px",borderRadius:8,
              background:"rgba(0,223,251,.04)",border:"1px solid rgba(82,254,254,.1)",
              color:H.muted,
            }}>
              <span style={{color:"rgba(82,254,254,.4)",marginRight:8}}>{p.label}</span>
              <span style={{color:p.color}}>{p.value}</span>
            </div>
          ))}
        </motion.div>

        {/* Scroll down indicator */}
        <motion.div
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ duration:0.6, delay:1.8 }}
          style={{position:"absolute",bottom:36,left:"50%",transform:"translateX(-50%)",
            display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,
            color:"rgba(82,254,254,.25)",letterSpacing:"0.28em",textTransform:"uppercase"}}>SCROLL</span>
          <div style={{width:1,height:48,
            background:"linear-gradient(180deg,rgba(0,223,251,.4),transparent)",
            position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:"40%",
              background:"linear-gradient(180deg,#00DFFB,rgba(0,223,251,.3))",
              animation:"bounce-y 1.8s ease-in-out infinite"}}/>
          </div>
        </motion.div>
      </section>

      <Divider />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* SECTION 2 — MARKET PULSE                                            */}
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section
        ref={sectionRefs[1]} data-section="1"
        className="landing-section"
        style={{minHeight:"100vh",display:"flex",alignItems:"center",
          padding:"80px clamp(24px,8vw,120px)"}}>

        <div style={{width:"100%",display:"grid",
          gridTemplateColumns:"1fr auto",gap:"clamp(40px,8vw,100px)",alignItems:"center"}}>

          {/* Left — data */}
          <motion.div
            variants={staggerContainer}
            initial="hidden" whileInView="visible"
            viewport={{ once:true, amount:0.35 }}>

            <motion.div variants={fadeUp}>
              <SectionTag num="02" label="Market Pulse" />
            </motion.div>

            {/* Nifty 50 + Bank Nifty live prices */}
            <motion.div variants={fadeUp} style={{marginBottom:32}}>
              {/* Nifty 50 */}
              <div style={{marginBottom:24}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,
                    color:"rgba(82,254,254,.4)",letterSpacing:"0.22em"}}>NIFTY 50</span>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,
                    padding:"2px 8px",borderRadius:3,
                    background:"rgba(0,223,251,.06)",color:"rgba(82,254,254,.4)",letterSpacing:"0.1em"}}>NSE</span>
                </div>
                <div style={{display:"flex",alignItems:"baseline",gap:16,flexWrap:"wrap"}}>
                  <span style={{fontFamily:"'Orbitron',sans-serif",
                    fontSize:"clamp(32px,4.5vw,58px)",fontWeight:900,
                    color:H.cyan,textShadow:"0 0 30px rgba(0,223,251,.4)",lineHeight:1}}>
                    {nifty50 ? fmtIdx(nifty50.last) : "—"}
                  </span>
                  {nifty50 && (
                    <div style={{display:"flex",flexDirection:"column",gap:2}}>
                      <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:16,fontWeight:700,
                        color:pctColor(nifty50.pct_change)}}>
                        {nifty50.pct_change>=0?"+":""}{nifty50.pct_change?.toFixed(2)}%
                      </span>
                      <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,
                        color:"rgba(82,254,254,.3)"}}>
                        {nifty50.change>=0?"+":""}{fmtIdx(nifty50.change)} pts
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bank Nifty */}
              {bankNifty && (
                <div style={{padding:"12px 16px",borderRadius:8,
                  background:"rgba(0,223,251,.03)",border:"1px solid rgba(82,254,254,.08)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,
                        color:"rgba(82,254,254,.35)",letterSpacing:"0.18em",marginBottom:4}}>BANK NIFTY</div>
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:22,fontWeight:900,
                        color:"rgba(82,254,254,.85)",lineHeight:1}}>{fmtIdx(bankNifty.last)}</div>
                    </div>
                    <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:14,fontWeight:700,
                      color:pctColor(bankNifty.pct_change)}}>
                      {bankNifty.pct_change>=0?"+":""}{bankNifty.pct_change?.toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}
              {!nifty50 && !dataLoaded && (
                <div style={{height:60,borderRadius:8,background:"rgba(0,223,251,.04)",
                  border:"1px solid rgba(82,254,254,.08)",
                  animation:"blink 1.5s ease-in-out infinite"}}/>
              )}
            </motion.div>

            {/* Signal summary */}
            <motion.div variants={fadeUp}>
              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                {[
                  { label:"BUY signals",   value:String(signals.filter(s=>s.signal==="BUY").length),  color:H.green },
                  { label:"SELL signals",  value:String(signals.filter(s=>s.signal==="SELL").length), color:H.red   },
                  { label:"Tracked",       value:String(signals.length),                              color:H.cyan  },
                ].map(s=>(
                  <GlassCard key={s.label} style={{padding:"14px 20px",minWidth:110}}>
                    <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:28,fontWeight:900,
                      color:s.color,textShadow:`0 0 20px ${s.color}60`,lineHeight:1}}>{s.value}</div>
                    <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,
                      color:"rgba(82,254,254,.4)",letterSpacing:"0.18em",textTransform:"uppercase",marginTop:6}}>
                      {s.label}
                    </div>
                  </GlassCard>
                ))}
              </div>
            </motion.div>

            {/* Market status */}
            <motion.div variants={fadeUp} style={{marginTop:28}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:10,
                padding:"10px 20px",borderRadius:8,
                background:"rgba(0,223,251,.04)",border:"1px solid rgba(82,254,254,.12)"}}>
                <div style={{width:8,height:8,borderRadius:"50%",
                  background:marketOpen===true?H.green:H.red,
                  boxShadow:`0 0 8px ${marketOpen===true?H.green:H.red}`,
                  animation:"blink 2s ease-in-out infinite"}}/>
                <span style={{fontFamily:"'Rajdhani',sans-serif",fontSize:13,fontWeight:700,
                  letterSpacing:"0.1em",textTransform:"uppercase",
                  color:marketOpen===true?H.green:H.muted}}>
                  {marketOpen===true?"NSE Market Open":"NSE Market Closed"}
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — cobe globe */}
          <motion.div
            initial={{ opacity:0, scale:0.85 }}
            whileInView={{ opacity:1, scale:1 }}
            viewport={{ once:true, amount:0.4 }}
            transition={{ duration:1.2, ease:[0.16,1,0.3,1] }}
            style={{display:"flex",alignItems:"center",justifyContent:"center",
              flexShrink:0, position:"relative"}}>
            {/* Glow ring behind globe */}
            <div style={{position:"absolute",width:"110%",height:"110%",
              borderRadius:"50%",
              background:"radial-gradient(circle,rgba(0,223,251,.08) 0%,transparent 70%)",
              pointerEvents:"none"}}/>
            <CobeGlobe />
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* SECTION 3 — TODAY'S SIGNALS                                         */}
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section
        ref={sectionRefs[2]} data-section="2"
        className="landing-section"
        style={{minHeight:"100vh",display:"flex",flexDirection:"column",
          justifyContent:"center",padding:"80px clamp(24px,8vw,120px)"}}>

        <motion.div
          variants={staggerContainer}
          initial="hidden" whileInView="visible"
          viewport={{ once:true, amount:0.25 }}>

          <motion.div variants={fadeUp}>
            <SectionTag num="03" label="Today's Signals" />
          </motion.div>

          <motion.div variants={fadeUp} style={{marginBottom:48}}>
            <div style={{fontFamily:"'Orbitron',sans-serif",
              fontSize:"clamp(28px,4vw,52px)",fontWeight:900,
              color:H.text,letterSpacing:"0.06em",lineHeight:1.1}}>
              Live trade setups<br/>
              <span style={{color:H.cyan,textShadow:"0 0 30px rgba(0,223,251,.4)"}}>
                detected by the engine
              </span>
            </div>
            <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:14,fontWeight:600,
              color:H.muted,letterSpacing:"0.06em",marginTop:12}}>
              LSTM + ICT/SMC multi-strategy scanner · Nifty 50 + Bank Nifty universe
            </div>
          </motion.div>

          {/* Signal cards */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16}}>
            {/* Loading skeleton */}
            {!dataLoaded && [0,1,2].map(i=>(
              <motion.div key={i} variants={fadeUp} transition={{ delay: i*0.08 }}>
                <div className="signal-card signal-card-buy" style={{opacity:0.35}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                    <div style={{width:80,height:14,borderRadius:4,background:"rgba(0,223,251,.12)",
                      animation:"blink 1.5s ease-in-out infinite"}}/>
                    <div style={{width:48,height:24,borderRadius:12,background:"rgba(0,255,159,.12)",
                      animation:"blink 1.5s ease-in-out infinite"}}/>
                  </div>
                  <div style={{height:2,background:"rgba(0,223,251,.08)",borderRadius:1,marginBottom:14}}>
                    <div style={{height:"100%",width:"65%",background:"rgba(0,223,251,.2)",borderRadius:1,
                      animation:"blink 1.5s ease-in-out infinite"}}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {[0,1,2,3].map(j=>(
                      <div key={j} style={{background:"rgba(0,0,0,.2)",border:"1px solid rgba(82,254,254,.06)",
                        borderRadius:8,padding:"7px 10px",height:44,
                        animation:"blink 1.5s ease-in-out infinite"}}/>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
            {/* Live signal cards */}
            {dataLoaded && topSignals.length > 0 && topSignals.map((s,i) => {
              const sc = sigColor(s.signal);
              return (
                <motion.div key={s.symbol} variants={fadeUp}
                  transition={{ delay: i * 0.08 }}>
                  <div className={`signal-card signal-card-${s.signal.toLowerCase()}`}>
                    {/* Header */}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                      <div>
                        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:16,fontWeight:900,
                          color:H.cyan,letterSpacing:"0.06em"}}>{s.symbol.replace(".NS","")}</div>
                        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,
                          color:"rgba(82,254,254,.35)",letterSpacing:"0.15em",marginTop:3}}>NSE · INDIA</div>
                      </div>
                      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:900,
                        color:sc,background:`${sc}15`,border:`1px solid ${sc}35`,
                        padding:"5px 12px",borderRadius:20,letterSpacing:"0.14em"}}>
                        {s.signal}
                      </div>
                    </div>

                    {/* Confidence bar */}
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,
                        color:"rgba(82,254,254,.4)",letterSpacing:"0.12em"}}>CONFIDENCE</span>
                      <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:700,color:sc}}>
                        {s.confidence}%
                      </span>
                    </div>
                    <div style={{height:2,background:"rgba(0,223,251,.08)",borderRadius:1,marginBottom:14}}>
                      <div style={{height:"100%",width:`${s.confidence}%`,background:sc,
                        boxShadow:`0 0 6px ${sc}80`,borderRadius:1}}/>
                    </div>

                    {/* Entry / SL / TP */}
                    {s.signal!=="HOLD" && s.entry && s.stop_loss && s.target1 && (
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                        {[
                          { l:"Entry",   v:`₹${s.entry}`,     c:H.text  },
                          { l:"Stop",    v:`₹${s.stop_loss}`, c:H.red   },
                          { l:"Target",  v:`₹${s.target1}`,   c:H.green },
                          { l:"R:R",     v:s.risk_reward ? s.risk_reward.toFixed(1)+"x" : "—", c:s.risk_reward&&s.risk_reward>=2?H.green:H.amber },
                        ].map(item=>(
                          <div key={item.l} style={{background:"rgba(0,0,0,.25)",
                            border:"1px solid rgba(82,254,254,.08)",borderRadius:8,padding:"7px 10px"}}>
                            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,
                              color:"rgba(82,254,254,.35)",letterSpacing:"0.14em",marginBottom:3}}>{item.l}</div>
                            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:item.c}}>{item.v}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reason */}
                    <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:10,fontWeight:600,
                      color:H.muted,lineHeight:1.5,
                      borderTop:"1px solid rgba(82,254,254,.08)",paddingTop:10}}>
                      {s.reason.split(" · ").slice(0,2).join(" · ")}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {/* API offline fallback — only after load completes with no data */}
            {dataLoaded && topSignals.length === 0 && (
              <motion.div variants={fadeUp} style={{gridColumn:"1/-1"}}>
                <div style={{padding:"32px 24px",borderRadius:14,textAlign:"center",
                  background:"rgba(0,223,251,.03)",border:"1px solid rgba(82,254,254,.1)"}}>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,
                    color:"rgba(82,254,254,.4)",letterSpacing:"0.2em",marginBottom:8}}>
                    NO SIGNALS DETECTED
                  </div>
                  <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:13,fontWeight:600,
                    color:H.muted}}>
                    Start the backend: <span style={{color:H.cyan,fontFamily:"'Share Tech Mono',monospace",
                    fontSize:11}}>uvicorn api:app --reload --port 8000</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <motion.div variants={fadeIn} style={{marginTop:32,textAlign:"center"}}>
            <Link href="/signals" style={{
              fontFamily:"'Rajdhani',sans-serif",fontSize:12,fontWeight:700,
              letterSpacing:"0.18em",textTransform:"uppercase",
              color:"rgba(82,254,254,.5)",textDecoration:"none",
              borderBottom:"1px solid rgba(82,254,254,.2)",paddingBottom:2,
              transition:"color .15s ease",
            }}
              onMouseEnter={e=>(e.currentTarget.style.color=H.cyan)}
              onMouseLeave={e=>(e.currentTarget.style.color="rgba(82,254,254,.5)")}>
              VIEW ALL SIGNALS ↑
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <Divider />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* SECTION 4 — PORTFOLIO OVERVIEW                                      */}
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section
        ref={sectionRefs[3]} data-section="3"
        className="landing-section"
        style={{minHeight:"100vh",display:"flex",alignItems:"center",
          padding:"80px clamp(24px,8vw,120px)"}}>

        <div style={{width:"100%",display:"grid",
          gridTemplateColumns:"1fr 1fr",gap:"clamp(32px,6vw,80px)",alignItems:"center"}}>

          {/* Left — heading */}
          <motion.div
            variants={staggerContainer}
            initial="hidden" whileInView="visible"
            viewport={{ once:true, amount:0.35 }}>

            <motion.div variants={fadeUp}>
              <SectionTag num="04" label="Portfolio Overview" />
            </motion.div>

            <motion.div variants={fadeUp} style={{marginBottom:28}}>
              <div style={{fontFamily:"'Orbitron',sans-serif",
                fontSize:"clamp(28px,4vw,52px)",fontWeight:900,
                color:H.text,letterSpacing:"0.05em",lineHeight:1.1}}>
                Track every rupee<br/>
                <span style={{color:H.green,textShadow:"0 0 24px rgba(0,255,159,.3)"}}>
                  in real time
                </span>
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:14,fontWeight:600,
                color:H.muted,letterSpacing:"0.06em",lineHeight:1.7,maxWidth:400}}>
                Position management · Entry/SL/TP tracking · Kelly-sized lots ·
                Cost basis vs current value — all in one workstation.
              </div>
            </motion.div>

            <motion.div variants={fadeUp} style={{marginTop:32}}>
              {portTotal > 0 && (
                <GlassCard style={{display:"inline-block",padding:"18px 28px"}}>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,
                    color:"rgba(82,254,254,.4)",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:8}}>
                    Total Value
                  </div>
                  <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:36,fontWeight:900,
                    color:H.green,textShadow:"0 0 24px rgba(0,255,159,.4)"}}>
                    ₹{fmt(portTotal)}
                  </div>
                </GlassCard>
              )}
            </motion.div>
          </motion.div>

          {/* Right — holdings list */}
          <motion.div
            initial={{ opacity:0, x:40 }}
            whileInView={{ opacity:1, x:0 }}
            viewport={{ once:true, amount:0.3 }}
            transition={{ duration:0.9, ease:[0.16,1,0.3,1] }}>
            <GlassCard style={{padding:24}}>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,
                color:"rgba(82,254,254,.4)",letterSpacing:"0.22em",textTransform:"uppercase",marginBottom:16}}>
                Holdings
              </div>
              {portfolio.length > 0 ? portfolio.map((p,i)=>{
                const ret = p.ret ?? 0;
                const pos = ret >= 0;
                const c = pos ? H.green : H.red;
                return (
                  <motion.div key={p.symbol}
                    initial={{ opacity:0, x:20 }}
                    whileInView={{ opacity:1, x:0 }}
                    viewport={{ once:true }}
                    transition={{ delay: i * 0.08, duration:0.5 }}
                    style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,fontWeight:700,
                        color:H.cyan,letterSpacing:"0.05em"}}>{p.symbol.replace(".NS","")}</span>
                      <div style={{display:"flex",gap:12,alignItems:"center"}}>
                        {p.value && (
                          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,
                            color:"rgba(82,254,254,.4)"}}>₹{fmt(p.value)}</span>
                        )}
                        <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:c}}>
                          {pos?"+":""}{ret.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div style={{height:2,background:"rgba(0,223,251,.06)",borderRadius:1}}>
                      <motion.div
                        style={{height:"100%",background:c,boxShadow:`0 0 6px ${c}60`,borderRadius:1}}
                        initial={{ width:0 }}
                        whileInView={{ width:`${Math.min(Math.abs(ret)*4,100)}%` }}
                        viewport={{ once:true }}
                        transition={{ duration:0.9, ease:"easeOut", delay:0.1+i*0.05 }}
                      />
                    </div>
                  </motion.div>
                );
              }) : (
                <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:12,
                  color:"rgba(82,254,254,.3)",letterSpacing:"0.06em",textAlign:"center",padding:"24px 0"}}>
                  Connect API to load portfolio data
                </div>
              )}

              <div style={{marginTop:16,paddingTop:14,
                borderTop:"1px solid rgba(82,254,254,.08)",
                display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,
                  color:"rgba(82,254,254,.3)",letterSpacing:"0.18em"}}>TOTAL</span>
                <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:18,fontWeight:900,
                  color:H.green,textShadow:"0 0 14px rgba(0,255,159,.4)"}}>
                  {portTotal > 0 ? `₹${fmt(portTotal)}` : "—"}
                </span>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      <Divider />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* SECTION 5 — ENTER WORKSTATION (CTA)                                 */}
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section
        ref={sectionRefs[4]} data-section="4"
        className="landing-section"
        style={{minHeight:"100vh",display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",textAlign:"center",
          padding:"80px clamp(24px,8vw,120px)"}}>

        <motion.div
          variants={staggerContainer}
          initial="hidden" whileInView="visible"
          viewport={{ once:true, amount:0.4 }}>

          <motion.div variants={fadeUp}>
            <SectionTag num="05" label="Ready to Trade" />
          </motion.div>

          <motion.div variants={fadeUp}>
            <div style={{fontFamily:"'Orbitron',sans-serif",
              fontSize:"clamp(36px,6vw,80px)",fontWeight:900,
              letterSpacing:"0.08em",lineHeight:1.1,
              color:H.text,marginBottom:20}}>
              THE WORKSTATION<br/>
              <span style={{color:H.cyan,textShadow:"0 0 40px rgba(0,223,251,.4)"}}>
                AWAITS
              </span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:16,fontWeight:600,
              color:H.muted,letterSpacing:"0.08em",marginBottom:48,maxWidth:520,margin:"0 auto 48px"}}>
              Full candlestick charts · ICT/SMC markup · Multi-timeframe confluence ·
              Live signals with Entry, Stop-Loss & Target — all at your fingertips.
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Link href="/dashboard" className="cta-btn">
              ENTER WORKSTATION
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </motion.div>

          {/* Quick links */}
          <motion.div variants={fadeIn}
            style={{marginTop:40,display:"flex",gap:24,justifyContent:"center",flexWrap:"wrap"}}>
            {[
              { l:"Signals",    h:"/signals"    },
              { l:"Portfolio",  h:"/portfolio"  },
              { l:"Backtest",   h:"/backtest"   },
              { l:"AI Insights",h:"/ai-insights"},
            ].map(lk=>(
              <Link key={lk.l} href={lk.h} style={{
                fontFamily:"'Rajdhani',sans-serif",fontSize:11,fontWeight:700,
                letterSpacing:"0.18em",textTransform:"uppercase",
                color:"rgba(82,254,254,.4)",textDecoration:"none",
                transition:"color .15s ease"
              }}
                onMouseEnter={e=>(e.currentTarget.style.color=H.cyan)}
                onMouseLeave={e=>(e.currentTarget.style.color="rgba(82,254,254,.4)")}>
                {lk.l}
              </Link>
            ))}
          </motion.div>

          {/* Credit */}
          <motion.div variants={fadeIn} style={{marginTop:60}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,
              color:"rgba(82,254,254,.18)",letterSpacing:"0.3em",textTransform:"uppercase"}}>
              BUILT BY TANISHQ VERMA · AI TRADING OS V2.4
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Bottom padding */}
      <div style={{height:60,position:"relative",zIndex:1}}/>
    </>
  );
}
