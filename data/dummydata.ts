export const tickers = [
  { symbol: "AAPL", price: "$189.42", change: 1.2 },
  { symbol: "BPCL.NS", price: "₹412.5", change: -0.8 },
  { symbol: "RELIANCE.NS", price: "₹2841", change: 0.4 },
  { symbol: "TCS.NS", price: "₹3920", change: 1.8 },
];

export const metrics = [
  { label: "Portfolio Value", value: "₹1,06,278", sub: "+6.28% total return", subColor: "#10b981" },
  { label: "Active Signals", value: "3", sub: "2 BUY · 1 HOLD", subColor: "#8b949e" },
  { label: "Model Accuracy", value: "53%", sub: "AAPL · RF classifier", subColor: "#8b949e" },
  { label: "Risk Level", value: "Medium", sub: "Volatility: 1.8%", subColor: "#f59e0b" },
];

export const chartData = [
  { date: "Jan", price: 148, ma50: 142, prediction: null, buySignal: null, sellSignal: null },
  { date: "Feb", price: 152, ma50: 145, prediction: null, buySignal: null, sellSignal: null },
  { date: "Mar", price: 158, ma50: 149, prediction: null, buySignal: 158, sellSignal: null },
  { date: "Apr", price: 163, ma50: 153, prediction: null, buySignal: null, sellSignal: null },
  { date: "May", price: 171, ma50: 157, prediction: null, buySignal: null, sellSignal: 171 },
  { date: "Jun", price: 165, ma50: 159, prediction: null, buySignal: null, sellSignal: null },
  { date: "Jul", price: 176, ma50: 162, prediction: null, buySignal: 176, sellSignal: null },
  { date: "Aug", price: 182, ma50: 166, prediction: null, buySignal: null, sellSignal: null },
  { date: "Sep", price: 178, ma50: 169, prediction: null, buySignal: null, sellSignal: 178 },
  { date: "Oct", price: 188, ma50: 172, prediction: null, buySignal: null, sellSignal: null },
  { date: "Nov", price: 191, ma50: 176, prediction: 191, buySignal: null, sellSignal: null },
  { date: "Dec", price: 189, ma50: 178, prediction: 193, buySignal: null, sellSignal: null },
  { date: "Jan+", price: null, ma50: null, prediction: 198, buySignal: null, sellSignal: null },
  { date: "Feb+", price: null, ma50: null, prediction: 204, buySignal: null, sellSignal: null },
];

export const signals = [
  { symbol: "AAPL", signal: "BUY", reason: "BOS up · EMA bullish · FVG zone", confidence: 61 },
  { symbol: "RELIANCE.NS", signal: "BUY", reason: "Sweep low · displacement · HTF bull", confidence: 57 },
  { symbol: "BPCL.NS", signal: "HOLD", reason: "EMA bearish · no setup confirmed", confidence: 42 },
  { symbol: "TCS.NS", signal: "SELL", reason: "BOS down · sweep high detected", confidence: 54 },
];

export const portfolio = [
  { symbol: "AAPL", allocation: 45, ret: 6.3 },
  { symbol: "RELIANCE.NS", allocation: 25, ret: 3.1 },
  { symbol: "TCS.NS", allocation: 15, ret: 8.2 },
  { symbol: "BPCL.NS", allocation: 15, ret: -6.9 },
];

export const riskMetrics = [
  { label: "Volatility", value: "1.8%", pct: 45, color: "#f59e0b" },
  { label: "Max Drawdown", value: "4.2%", pct: 30, color: "#10b981" },
  { label: "Sharpe Ratio", value: "0.74", pct: 60, color: "#6366f1" },
  { label: "Win Rate", value: "53%", pct: 53, color: "#00d4aa" },
];

export const portfolioHistory = [
  { month: "Jan", value: 100000 },
  { month: "Feb", value: 101200 },
  { month: "Mar", value: 99800 },
  { month: "Apr", value: 102500 },
  { month: "May", value: 104000 },
  { month: "Jun", value: 103200 },
  { month: "Jul", value: 105800 },
  { month: "Aug", value: 104500 },
  { month: "Sep", value: 103900 },
  { month: "Oct", value: 106278 },
];

export const news = [
  { headline: "Fed holds rates steady — tech stocks rally on positive guidance", time: "2h ago", source: "Reuters", sentiment: "positive", score: 82 },
  { headline: "BPCL Q4 earnings miss analyst estimates by 8%", time: "4h ago", source: "ET Markets", sentiment: "negative", score: 75 },
  { headline: "Apple Vision Pro enterprise sales update released", time: "6h ago", source: "Bloomberg", sentiment: "neutral", score: 50 },
  { headline: "Reliance Industries expands renewable energy portfolio", time: "8h ago", source: "Economic Times", sentiment: "positive", score: 70 },
  { headline: "TCS wins $500M deal from European banking consortium", time: "10h ago", source: "Mint", sentiment: "positive", score: 88 },
];

export const aiInsight = {
  tags: [
    { label: "BOS Confirmed", color: "#10b981" },
    { label: "FVG Detected", color: "#6366f1" },
    { label: "Sweep Low", color: "#f59e0b" },
    { label: "HTF Bullish", color: "#10b981" },
    { label: "Displacement", color: "#6366f1" },
  ],
  text: "EMA50 is above EMA200 confirming bullish HTF bias on AAPL. A liquidity sweep of the prior swing low was detected at $183.2, followed by a confirmed break of structure upward. Strong displacement candle present. FVG zone identified between $185.4–$186.8. Recommended action: hold long position, monitor $195 resistance zone.",
  confidence: 61,
};
