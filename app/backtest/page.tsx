"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import PageShell from "@/components/PageShell";

const C = {
  bg: "#000308", card: "rgba(0,15,30,.88)", border: "rgba(82,254,254,.12)",
  muted: "rgba(139,148,158,.75)", text: "#e6edf3", accent: "#00DFFB",
  buy: "#00FF9F", sell: "#ef4444", hold: "#FF6B00", purple: "#6366f1",
};

const API     = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TICKERS = ["RELIANCE.NS","TCS.NS","HDFCBANK.NS","INFY.NS","ICICIBANK.NS"];

// â"€â"€â"€ Types â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

type Trade    = { date:string; type:string; price:number; pnl:number };
type CurvePt  = { date:string; value:number; price:number };
type MonthRet = { month:string; return:number };

type BacktestResult = {
  ticker:string; initial_capital:number; final_value:number;
  total_return:number; buy_hold_return:number; total_trades:number;
  win_rate:number; avg_win:number; avg_loss:number; profit_factor:number;
  max_drawdown:number; sharpe:number;
  portfolio_curve:CurvePt[]; monthly_returns:MonthRet[]; trades:Trade[];
};

type WFWindow = {
  window:number; train_start:string; train_end:string;
  test_start:string; test_end:string;
  accuracy:number; return_pct:number; bh_return:number;
  beat_bh:boolean; n_signals:number;
};

type WFResult = {
  ticker:string; windows:WFWindow[]; n_windows:number;
  avg_accuracy:number; std_accuracy:number;
  min_accuracy:number; max_accuracy:number;
  above_55_pct:number; avg_return:number; avg_bh_return:number;
  beat_bh_count:number; beat_bh_pct:number;
  stability:string; verdict:string;
  train_bars:number; test_bars:number;
  error?:string;
};

// â"€â"€â"€ Shared helpers â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const cs: React.CSSProperties = {
  background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:16,
};
const lbl: React.CSSProperties = {
  fontSize:10, fontWeight:700, letterSpacing:"0.08em",
  textTransform:"uppercase" as const, color:C.muted, marginBottom:12,
};

function StatCard({label,value,sub,color}:{label:string;value:string;sub?:string;color?:string}) {
  return (
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px"}}>
      <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",color:C.muted,marginBottom:8}}>{label}</div>
      <div style={{fontSize:20,fontWeight:700,color:color||C.text,marginBottom:3}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:C.muted}}>{sub}</div>}
    </div>
  );
}

function Spinner({msg}:{msg:string}) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:400,flexDirection:"column",gap:12}}>
      <div style={{width:40,height:40,border:`3px solid ${C.border}`,borderTop:`3px solid ${C.accent}`,
        borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
      <div style={{color:C.muted,fontSize:12}}>{msg}</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// â"€â"€â"€ Simple backtest charts â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function EquityCurve({data,width,height}:{data:CurvePt[];width:number;height:number}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=ref.current; if(!canvas||!data.length) return;
    const ctx=canvas.getContext("2d"); if(!ctx) return;
    const dpr=window.devicePixelRatio||1;
    canvas.width=width*dpr; canvas.height=height*dpr; ctx.scale(dpr,dpr);
    const pad={top:20,right:20,bottom:30,left:70};
    const W=width-pad.left-pad.right, H=height-pad.top-pad.bottom;
    ctx.clearRect(0,0,width,height);
    const values=data.map(d=>d.value);
    const minV=Math.min(...values)*.995, maxV=Math.max(...values)*1.005;
    const toY=(v:number)=>pad.top+H-((v-minV)/(maxV-minV))*H;
    const toX=(i:number)=>pad.left+(i/(data.length-1))*W;
    ctx.strokeStyle="#21262d"; ctx.lineWidth=0.5;
    for(let i=0;i<=4;i++){
      const y=pad.top+(H/4)*i;
      ctx.beginPath(); ctx.moveTo(pad.left,y); ctx.lineTo(pad.left+W,y); ctx.stroke();
      const val=maxV-((maxV-minV)/4)*i;
      ctx.fillStyle="#8b949e"; ctx.font="10px system-ui"; ctx.textAlign="right";
      ctx.fillText("₹"+Math.round(val/1000)+"k",pad.left-6,y+4);
    }
    ctx.fillStyle="#8b949e"; ctx.font="9px system-ui"; ctx.textAlign="center";
    const step=Math.ceil(data.length/6);
    data.forEach((d,i)=>{ if(i%step===0) ctx.fillText(d.date.slice(5),toX(i),height-4); });
    ctx.strokeStyle="#30363d"; ctx.lineWidth=1; ctx.setLineDash([4,4]);
    const baseY=toY(100000);
    ctx.beginPath(); ctx.moveTo(pad.left,baseY); ctx.lineTo(pad.left+W,baseY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle="#8b949e"; ctx.font="9px system-ui"; ctx.textAlign="left";
    ctx.fillText("₹1,00,000",pad.left+4,baseY-4);
    const isProfit=values[values.length-1]>=100000;
    const grad=ctx.createLinearGradient(0,pad.top,0,pad.top+H);
    grad.addColorStop(0,isProfit?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.3)");
    grad.addColorStop(1,"rgba(0,0,0,0)");
    ctx.beginPath(); ctx.moveTo(toX(0),pad.top+H);
    data.forEach((d,i)=>ctx.lineTo(toX(i),toY(d.value)));
    ctx.lineTo(toX(data.length-1),pad.top+H);
    ctx.closePath(); ctx.fillStyle=grad; ctx.fill();
    ctx.strokeStyle=isProfit?C.buy:C.sell; ctx.lineWidth=2.5;
    ctx.beginPath();
    data.forEach((d,i)=>i===0?ctx.moveTo(toX(i),toY(d.value)):ctx.lineTo(toX(i),toY(d.value)));
    ctx.stroke();
    let peak=values[0]; ctx.fillStyle="rgba(239,68,68,0.08)";
    data.forEach((d,i)=>{ if(d.value>peak) peak=d.value; if(d.value<peak) ctx.fillRect(toX(i),toY(peak),2,toY(d.value)-toY(peak)); });
  },[data,width,height]);
  return <canvas ref={ref} style={{width,height,display:"block"}}/>;
}

function MonthlyHeatmap({data}:{data:MonthRet[]}) {
  if(!data.length) return null;
  const maxAbs=Math.max(...data.map(d=>Math.abs(d.return)),1);
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
      {data.map((d,i)=>{
        const intensity=Math.abs(d.return)/maxAbs;
        const bg=d.return>=0?`rgba(16,185,129,${.15+intensity*.7})`:`rgba(239,68,68,${.15+intensity*.7})`;
        const color=d.return>=0?C.buy:C.sell;
        return(
          <div key={i} style={{background:bg,borderRadius:6,padding:"8px 10px",minWidth:70,textAlign:"center",border:`1px solid ${color}33`}}>
            <div style={{fontSize:9,color:C.muted,marginBottom:3}}>{d.month.slice(0,7)}</div>
            <div style={{fontSize:12,fontWeight:700,color}}>{d.return>=0?"+":""}{d.return}%</div>
          </div>
        );
      })}
    </div>
  );
}

// â"€â"€â"€ Walk-Forward accuracy bar chart â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function WFBarChart({windows,width,height}:{windows:WFWindow[];width:number;height:number}) {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=ref.current; if(!canvas||!windows.length) return;
    const ctx=canvas.getContext("2d"); if(!ctx) return;
    const dpr=window.devicePixelRatio||1;
    canvas.width=width*dpr; canvas.height=height*dpr; ctx.scale(dpr,dpr);
    const pad={top:20,right:20,bottom:40,left:50};
    const W=width-pad.left-pad.right, H=height-pad.top-pad.bottom;
    ctx.clearRect(0,0,width,height);
    const accs=windows.map(w=>w.accuracy);
    const minA=Math.max(0,Math.min(...accs)-5), maxA=Math.min(100,Math.max(...accs)+5);
    const toY=(v:number)=>pad.top+H-((v-minA)/(maxA-minA))*H;
    // Y axis labels
    ctx.fillStyle=C.muted; ctx.font="10px system-ui"; ctx.textAlign="right";
    [minA, 50, 55, maxA].forEach(v=>{
      if(v>=minA&&v<=maxA) ctx.fillText(v+"%",pad.left-6,toY(v)+4);
    });
    // Reference lines
    [[50,"rgba(239,68,68,0.4)"],[55,"rgba(0,212,170,0.4)"]].forEach(([v,col])=>{
      const vn=Number(v); if(vn<minA||vn>maxA) return;
      ctx.strokeStyle=String(col); ctx.lineWidth=1; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(pad.left,toY(vn)); ctx.lineTo(pad.left+W,toY(vn)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle=String(col); ctx.font="9px system-ui"; ctx.textAlign="left";
      ctx.fillText(vn===50?"50% (random)":"55% (edge)",pad.left+4,toY(vn)-3);
    });
    // Bars
    const barW=Math.max(8,Math.min(40,(W-windows.length*4)/windows.length));
    const gap=(W-windows.length*barW)/(windows.length+1);
    windows.forEach((w,i)=>{
      const x=pad.left+gap+(i*(barW+gap));
      const a=w.accuracy;
      const col=a>=55?C.buy:a>=50?C.hold:C.sell;
      const barH=Math.abs(toY(a)-toY(Math.max(minA,50)));
      const y=a>=50?toY(a):toY(50);
      ctx.fillStyle=col+"cc";
      ctx.fillRect(x,Math.min(toY(a),toY(50)),barW,barH||2);
      // Label
      ctx.fillStyle=C.muted; ctx.font="9px system-ui"; ctx.textAlign="center";
      ctx.fillText("W"+w.window,x+barW/2,pad.top+H+14);
      ctx.fillStyle=col; ctx.font="bold 9px system-ui";
      ctx.fillText(a+"%",x+barW/2,toY(a)-4);
    });
  },[windows,width,height]);
  return <canvas ref={ref} style={{width,height,display:"block"}}/>;
}

// â"€â"€â"€ Walk-Forward tab â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function WalkForwardTab({ticker}:{ticker:string}) {
  const [result,setResult]=useState<WFResult|null>(null);
  const [loading,setLoading]=useState(false);
  const [ran,setRan]=useState(false);
  const chartRef=useRef<HTMLDivElement>(null);
  const [chartW,setChartW]=useState(700);

  useEffect(()=>{
    const update=()=>{ if(chartRef.current) setChartW(chartRef.current.offsetWidth); };
    update(); window.addEventListener("resize",update);
    return()=>window.removeEventListener("resize",update);
  },[]);

  const run=useCallback(async()=>{
    setLoading(true); setResult(null); setRan(true);
    try {
      const r=await fetch(`${API}/api/backtest/walkforward/${ticker}`);
      setResult(await r.json());
    } catch { setResult({error:"API unreachable"} as any); }
    setLoading(false);
  },[ticker]);

  // auto-run when ticker changes if already ran once
  useEffect(()=>{ if(ran) run(); },[ticker]);

  if(!ran) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:400,flexDirection:"column",gap:16}}>
      <div style={{fontSize:15,fontWeight:600}}>Walk-Forward Validation</div>
      <div style={{fontSize:12,color:C.muted,maxWidth:480,textAlign:"center",lineHeight:1.7}}>
        Trains the model on a rolling 1-year window, tests on the next month, slides forward — repeated
        across all available history. Gives a far more honest accuracy estimate than a single train/test split.
        Takes ~30—60 seconds (result cached for 24 hours).
      </div>
      <button onClick={run} style={{padding:"10px 28px",background:C.accent,border:"none",borderRadius:8,
        color:"#000",fontWeight:700,cursor:"pointer",fontSize:14}}>
        Run Walk-Forward Validation
      </button>
    </div>
  );

  if(loading) return <Spinner msg={`Running walk-forward for ${ticker} — please wait (~30—60s)…`}/>;

  if(!result||result.error) return (
    <div style={{margin:24,padding:16,background:"rgba(239,68,68,0.1)",border:`1px solid rgba(239,68,68,0.3)`,borderRadius:8,color:C.sell}}>
      âš  {result?.error||"Unknown error"} — API connection failed
    </div>
  );

  const verdictColor=
    result.verdict==="STRONG EDGE"    ?C.buy:
    result.verdict==="MARGINAL EDGE"  ?C.hold:C.sell;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* SUMMARY CARDS */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        <StatCard label="Avg Accuracy" value={`${result.avg_accuracy}%`}
          sub={`Ïƒ = ${result.std_accuracy}% · ${result.stability}`}
          color={result.avg_accuracy>=55?C.buy:result.avg_accuracy>=50?C.hold:C.sell}/>
        <StatCard label="Verdict" value={result.verdict} color={verdictColor}
          sub={`${result.n_windows} windows · ${result.train_bars}d train / ${result.test_bars}d test`}/>
        <StatCard label="Beat Buy-and-Hold" value={`${result.beat_bh_pct}%`}
          sub={`${result.beat_bh_count}/${result.n_windows} windows`}
          color={result.beat_bh_pct>=50?C.buy:C.sell}/>
        <StatCard label="Avg Monthly Return" value={`${result.avg_return>=0?"+":""}${result.avg_return}%`}
          sub={`vs B&H ${result.avg_bh_return>=0?"+":""}${result.avg_bh_return}%`}
          color={result.avg_return>=result.avg_bh_return?C.buy:C.sell}/>
      </div>

      {/* ACCURACY BAR CHART */}
      <div style={cs}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={lbl}>Per-Window Accuracy · {ticker}</div>
          <div style={{display:"flex",gap:16,fontSize:10}}>
            <span style={{color:C.buy}}>■ ≥55% (edge)</span>
            <span style={{color:C.hold}}>■ 50—55% (borderline)</span>
            <span style={{color:C.sell}}>■ &lt;50% (below random)</span>
          </div>
        </div>
        <div ref={chartRef} style={{width:"100%"}}>
          <WFBarChart windows={result.windows} width={chartW} height={220}/>
        </div>
        <div style={{marginTop:8,fontSize:11,color:C.muted}}>
          Dashed red line = 50% (coin flip).  Dashed green line = 55% (threshold for meaningful edge).
          Windows where the bar is above 55% mean the model had genuine predictive power in that period.
        </div>
      </div>

      {/* WINDOWS TABLE */}
      <div style={cs}>
        <div style={lbl}>Window-by-Window Results</div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${C.border}`}}>
                {["#","Train Period","Test Period","Accuracy","Strategy","Buy & Hold","Beat B&H","Signals"].map(h=>(
                  <th key={h} style={{padding:"7px 10px",textAlign:"left",fontSize:10,fontWeight:600,
                    color:C.muted,textTransform:"uppercase",letterSpacing:"0.05em",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.windows.map((w,i)=>{
                const accColor=w.accuracy>=55?C.buy:w.accuracy>=50?C.hold:C.sell;
                return(
                  <tr key={i} style={{borderBottom:`1px solid ${C.border}`}}>
                    <td style={{padding:"9px 10px",color:C.muted,fontWeight:600}}>{w.window}</td>
                    <td style={{padding:"9px 10px",color:C.muted,fontSize:11,whiteSpace:"nowrap"}}>
                      {w.train_start} ↑ {w.train_end}
                    </td>
                    <td style={{padding:"9px 10px",fontSize:11,whiteSpace:"nowrap"}}>
                      {w.test_start} ↑ {w.test_end}
                    </td>
                    <td style={{padding:"9px 10px"}}>
                      <span style={{fontWeight:700,color:accColor}}>{w.accuracy}%</span>
                    </td>
                    <td style={{padding:"9px 10px",color:w.return_pct>=0?C.buy:C.sell,fontWeight:600}}>
                      {w.return_pct>=0?"+":""}{w.return_pct}%
                    </td>
                    <td style={{padding:"9px 10px",color:C.muted}}>
                      {w.bh_return>=0?"+":""}{w.bh_return}%
                    </td>
                    <td style={{padding:"9px 10px"}}>
                      <span style={{
                        padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:700,
                        background:w.beat_bh?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.08)",
                        color:w.beat_bh?C.buy:C.sell,
                        border:`1px solid ${w.beat_bh?C.buy:C.sell}33`,
                      }}>{w.beat_bh?"YES":"NO"}</span>
                    </td>
                    <td style={{padding:"9px 10px",color:C.muted}}>{w.n_signals}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* INTERPRETATION */}
      <div style={cs}>
        <div style={lbl}>How to read this</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,fontSize:12,lineHeight:1.8}}>
          <div>
            <div style={{fontWeight:600,color:C.accent,marginBottom:6}}>Accuracy</div>
            <div style={{color:C.muted}}>
              ≥58% ↑ Strong edge — model consistently predicts direction correctly<br/>
              54—58% ↑ Marginal edge — tradeable with tight risk management<br/>
              50—54% ↑ Weak — near random, don't rely on it<br/>
              &lt;50% ↑ No edge — model predicts wrong more than right
            </div>
          </div>
          <div>
            <div style={{fontWeight:600,color:C.hold,marginBottom:6}}>Stability (Ïƒ)</div>
            <div style={{color:C.muted}}>
              Ïƒ &lt;4% ↑ Stable — consistent across market conditions<br/>
              Ïƒ 4—9% ↑ Moderate — varies but usable<br/>
              Ïƒ &gt;9% ↑ Unstable — accuracy collapses in some regimes<br/>
              A high-Ïƒ model needs regime filters to be safe
            </div>
          </div>
          <div>
            <div style={{fontWeight:600,color:C.purple,marginBottom:6}}>vs Simple Backtest</div>
            <div style={{color:C.muted}}>
              The simple backtest (other tab) trains once on 80% of data —
              that split can accidentally leak future patterns. Walk-forward
              never sees future data during training, so the accuracy here
              is the honest number to trust for live trading decisions.
            </div>
          </div>
        </div>
      </div>

      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <button onClick={run} style={{padding:"7px 18px",border:`1px solid ${C.border}`,borderRadius:6,
          background:"transparent",color:C.muted,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>
          â†» Re-run (clears 24h cache)
        </button>
      </div>
    </div>
  );
}

// â"€â"€â"€ Main page â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export default function BacktestPage() {
  const [ticker,  setTicker]  = useState("RELIANCE.NS");
  const [tab,     setTab]     = useState<"simple"|"walkforward">("simple");
  const [result,  setResult]  = useState<BacktestResult|null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [chartSize,setChartSize]=useState({w:700,h:260});
  const chartRef=useRef<HTMLDivElement>(null);

  const runBacktest=useCallback(async(t:string)=>{
    setLoading(true); setError(""); setResult(null);
    try {
      const res=await fetch(`${API}/api/backtest/${t}`);
      const data=await res.json();
      if(data.error) throw new Error(data.error);
      setResult(data);
    } catch(e:any) { setError(e.message||"Failed to run backtest"); }
    setLoading(false);
  },[]);

  useEffect(()=>{ runBacktest(ticker); },[ticker]);

  useEffect(()=>{
    const update=()=>{ if(chartRef.current) setChartSize({w:chartRef.current.offsetWidth,h:260}); };
    update(); window.addEventListener("resize",update);
    return()=>window.removeEventListener("resize",update);
  },[]);

  const tabBtn=(t:"simple"|"walkforward",label:string)=>(
    <button onClick={()=>setTab(t)} style={{
      padding:"7px 18px",borderRadius:6,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600,
      border:`1px solid ${tab===t?C.accent:C.border}`,
      background:tab===t?"rgba(0,212,170,0.1)":"transparent",
      color:tab===t?C.accent:C.muted,
    }}>{label}</button>
  );

  return (
    <PageShell>
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Rajdhani',sans-serif",fontSize:13}}>

      {/* SUBHEADER */}
      <div style={{borderBottom:`1px solid ${C.border}`,padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(0,10,20,.6)"}}>
        <div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:700,color:C.accent,letterSpacing:"0.12em"}}>BACKTEST</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:C.muted,marginTop:3,letterSpacing:"0.1em"}}>ICT/SMC + ML STRATEGY · HISTORICAL PERFORMANCE ANALYSIS</div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {/* Tabs */}
          {tabBtn("simple","Simple Backtest")}
          {tabBtn("walkforward","Walk-Forward Validation")}
          {/* Ticker selector */}
          <div style={{width:1,height:24,background:C.border,margin:"0 6px"}}/>
          {TICKERS.map(t=>(
            <button key={t} onClick={()=>setTicker(t)} style={{
              padding:"6px 10px",borderRadius:5,cursor:"pointer",fontFamily:"inherit",
              border:`1px solid ${t===ticker?C.accent:C.border}`,
              background:t===ticker?"rgba(0,212,170,0.1)":"transparent",
              color:t===ticker?C.accent:C.muted,fontSize:11,
            }}>{t.replace(".NS","")}</button>
          ))}
          {tab==="simple"&&(
            <button onClick={()=>runBacktest(ticker)} style={{
              padding:"6px 12px",borderRadius:5,cursor:"pointer",fontFamily:"inherit",
              border:`1px solid ${C.accent}`,background:"rgba(0,212,170,0.15)",
              color:C.accent,fontSize:11,fontWeight:600,
            }}>â†» Run</button>
          )}
        </div>
      </div>

      <div style={{padding:20}}>
        {/* WALK-FORWARD TAB */}
        {tab==="walkforward"&&<WalkForwardTab ticker={ticker}/>}

        {/* SIMPLE BACKTEST TAB */}
        {tab==="simple"&&(
          <>
            {loading&&<Spinner msg={`Running backtest for ${ticker}…`}/>}
            {error&&(
              <div style={{margin:"0 0 16px",padding:16,background:"rgba(239,68,68,0.08)",border:`1px solid rgba(239,68,68,0.25)`,borderRadius:8,color:C.sell,fontFamily:"'Rajdhani',sans-serif"}}>
                âš  {error} — API connection failed
              </div>
            )}
            {result&&!loading&&(
              <div style={{display:"flex",flexDirection:"column",gap:16}}>

                {/* SUMMARY */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                  <StatCard label="Total Return" value={`${result.total_return>=0?"+":""}${result.total_return}%`}
                    sub={`Started ₹${result.initial_capital.toLocaleString()}`}
                    color={result.total_return>=0?C.buy:C.sell}/>
                  <StatCard label="Final Value"
                    value={`₹${result.final_value.toLocaleString("en-IN",{maximumFractionDigits:0})}`}
                    sub={`Buy & Hold: ${result.buy_hold_return>=0?"+":""}${result.buy_hold_return}%`}
                    color={C.accent}/>
                  <StatCard label="Win Rate" value={`${result.win_rate}%`}
                    sub={`${result.total_trades} total trades`}
                    color={result.win_rate>=50?C.buy:C.sell}/>
                  <StatCard label="Max Drawdown" value={`-${result.max_drawdown}%`}
                    sub={`Sharpe: ${result.sharpe}`} color={C.sell}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                  <StatCard label="Profit Factor" value={`${result.profit_factor}x`}
                    sub="gross profit / gross loss" color={result.profit_factor>=1?C.buy:C.sell}/>
                  <StatCard label="Avg Win"
                    value={`₹${result.avg_win.toLocaleString("en-IN",{maximumFractionDigits:0})}`}
                    sub="per winning trade" color={C.buy}/>
                  <StatCard label="Avg Loss"
                    value={`₹${Math.abs(result.avg_loss).toLocaleString("en-IN",{maximumFractionDigits:0})}`}
                    sub="per losing trade" color={C.sell}/>
                  <StatCard label="Sharpe Ratio" value={`${result.sharpe}`}
                    sub=">1 good, >2 excellent" color={result.sharpe>=1?C.buy:C.hold}/>
                </div>

                {/* EQUITY CURVE */}
                <div style={cs}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div style={lbl}>Equity Curve · {ticker}</div>
                    <div style={{display:"flex",gap:16,fontSize:10}}>
                      <span style={{color:C.buy}}>— Strategy</span>
                      <span style={{color:"#30363d"}}>- - Initial Capital</span>
                      <span style={{color:"rgba(239,68,68,0.5)"}}>■ Drawdown</span>
                    </div>
                  </div>
                  <div ref={chartRef} style={{width:"100%"}}>
                    <EquityCurve data={result.portfolio_curve} width={chartSize.w} height={chartSize.h}/>
                  </div>
                  <div style={{marginTop:16,display:"flex",gap:16}}>
                    {[
                      {lbl:"Strategy Return",val:result.total_return,col:result.total_return>=0?C.buy:C.sell},
                      {lbl:"Buy & Hold Return",val:result.buy_hold_return,col:C.purple},
                    ].map(m=>(
                      <div key={m.lbl} style={{flex:1}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}>
                          <span style={{color:C.muted}}>{m.lbl}</span>
                          <span style={{color:m.col,fontWeight:600}}>{m.val>=0?"+":""}{m.val}%</span>
                        </div>
                        <div style={{height:6,background:C.border,borderRadius:3}}>
                          <div style={{width:`${Math.min(Math.abs(m.val)*2,100)}%`,height:"100%",background:m.col,borderRadius:3}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:12,padding:"8px 12px",background:"rgba(245,158,11,0.05)",border:`1px solid rgba(245,158,11,0.2)`,borderRadius:6,fontSize:11,color:C.muted}}>
                    âš  Simple backtest uses a single 80/20 train-test split — accuracy may be optimistic. Use the <button onClick={()=>setTab("walkforward")} style={{background:"none",border:"none",color:C.accent,cursor:"pointer",fontSize:11,padding:0,fontFamily:"inherit",textDecoration:"underline"}}>Walk-Forward tab</button> for an honest estimate.
                  </div>
                </div>

                {/* MONTHLY + TRADES */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                  <div style={cs}>
                    <div style={lbl}>Monthly Returns Heatmap</div>
                    <MonthlyHeatmap data={result.monthly_returns}/>
                  </div>
                  <div style={cs}>
                    <div style={lbl}>Recent Trade Log</div>
                    <div style={{display:"flex",flexDirection:"column"}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 60px 80px 80px",gap:8,padding:"6px 0",borderBottom:`1px solid ${C.border}`,fontSize:10,color:C.muted,fontWeight:600}}>
                        <span>Date</span><span>Type</span><span style={{textAlign:"right"}}>Price</span><span style={{textAlign:"right"}}>P&L</span>
                      </div>
                      {result.trades.slice(-15).reverse().map((t,i)=>(
                        <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 60px 80px 80px",gap:8,padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:11}}>
                          <span style={{color:C.muted}}>{t.date}</span>
                          <span style={{color:t.type==="BUY"?C.buy:C.sell,fontWeight:600}}>{t.type}</span>
                          <span style={{textAlign:"right"}}>₹{t.price}</span>
                          <span style={{textAlign:"right",color:t.pnl>0?C.buy:t.pnl<0?C.sell:C.muted,fontWeight:t.pnl!==0?600:400}}>
                            {t.pnl!==0?(t.pnl>0?"+":"-")+"₹"+Math.round(t.pnl):"—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ANALYSIS */}
                <div style={cs}>
                  <div style={lbl}>Strategy Analysis</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,fontSize:12}}>
                    <div>
                      <div style={{fontWeight:600,marginBottom:8,color:C.accent}}>What worked</div>
                      <div style={{color:C.muted,lineHeight:1.7}}>
                        {result.win_rate>=50?"Win rate above 50%":"Win rate below 50%"}<br/>
                        {result.profit_factor>=1?"Profit factor >= 1":"Profit factor < 1 — losses dominate"}<br/>
                        {result.sharpe>=0.5?"Positive Sharpe ratio":"Low Sharpe — needs better risk mgmt"}
                      </div>
                    </div>
                    <div>
                      <div style={{fontWeight:600,marginBottom:8,color:C.hold}}>Key metrics</div>
                      <div style={{color:C.muted,lineHeight:1.7}}>
                        Strategy: {result.total_return>=0?"+":""}{result.total_return}% vs Market: {result.buy_hold_return>=0?"+":""}{result.buy_hold_return}%<br/>
                        Beat market: {result.total_return>result.buy_hold_return?"YES":"NO"}<br/>
                        Max drawdown: {result.max_drawdown}%<br/>
                        Trades: {result.total_trades}
                      </div>
                    </div>
                    <div>
                      <div style={{fontWeight:600,marginBottom:8,color:C.purple}}>How to improve</div>
                      <div style={{color:C.muted,lineHeight:1.7}}>
                        ↑ Use Walk-Forward tab for honest accuracy<br/>
                        ↑ Check Multi-TF Confluence on Signals page<br/>
                        ↑ Kelly sizing is active on all signals<br/>
                        ↑ Reduce position size on low-confidence signals
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </>
        )}
      </div>
    </div>
    </PageShell>
  );
}
