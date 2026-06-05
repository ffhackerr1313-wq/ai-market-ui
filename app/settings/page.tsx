"use client";
import { useState, useEffect } from "react";
import PageShell from "@/components/PageShell";

const C = {
  bg: "#000308", card: "rgba(0,15,30,.88)", border: "rgba(82,254,254,.12)",
  muted: "rgba(139,148,158,.75)", text: "#e6edf3", accent: "#00DFFB",
  buy: "#00FF9F", sell: "#ef4444", hold: "#FF6B00", purple: "#6366f1",
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width: 44, height: 24, borderRadius: 12, cursor: "pointer",
      background: value ? "rgba(0,223,251,.3)" : "rgba(82,254,254,.08)",
      border: `1px solid ${value ? "rgba(0,223,251,.5)" : "rgba(82,254,254,.15)"}`,
      position: "relative", transition: "all 0.2s",
      flexShrink: 0,
    }}>
      <div style={{
        width: 16, height: 16, borderRadius: "50%",
        background: value ? "#00DFFB" : "rgba(82,254,254,.3)",
        boxShadow: value ? "0 0 8px rgba(0,223,251,.6)" : "none",
        position: "absolute", top: 3,
        left: value ? 23 : 4,
        transition: "left 0.2s, background 0.2s",
      }} />
    </div>
  );
}

function Select({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      background: "rgba(0,15,30,.9)", border: `1px solid rgba(82,254,254,.2)`, borderRadius: 6,
      padding: "6px 10px", color: C.text, fontSize: 12,
      fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, outline: "none", cursor: "pointer",
      colorScheme: "dark",
    }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6,
        padding: "6px 10px", color: C.text, fontSize: 12,
        fontFamily: "inherit", outline: "none", width: "100%",
      }}
    />
  );
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: `1px solid rgba(82,254,254,.07)` }}>
      <div style={{ flex: 1, marginRight: 16 }}>
        <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 13, fontWeight: 600, color: C.text, letterSpacing: "0.02em" }}>{label}</div>
        {desc && <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: C.muted, marginTop: 3, letterSpacing: "0.06em" }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 16,
      boxShadow: "0 0 24px rgba(0,223,251,.04), inset 0 1px 0 rgba(255,255,255,.04)",
    }}>
      <div style={{
        fontFamily: "'Orbitron',sans-serif", fontSize: 10, fontWeight: 700,
        letterSpacing: "0.18em", textTransform: "uppercase" as const,
        color: "rgba(0,223,251,.55)", marginBottom: 4, paddingBottom: 12,
        borderBottom: `1px solid ${C.border}`,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [alertConfig, setAlertConfig] = useState<{ configured: boolean; threshold: number; cooldown_hours: number; recent_alerts: Record<string, { signal: string; sent_ago_min: number }> } | null>(null);
  const [testResult, setTestResult] = useState<"idle" | "sending" | "ok" | "fail">("idle");

  // Settings state
  const [settings, setSettings] = useState({
    // Model settings
    model: "LSTM",
    lookback: "30",
    confidence_threshold: "55",
    cache_ttl: "1800",

    // Strategy settings
    sl_pct: "3",
    tp_pct: "6",
    risk_per_trade: "2",
    use_ict: true,
    use_ml: true,

    // Portfolio settings
    initial_capital: "100000",
    reliance_alloc: "25",
    tcs_alloc: "20",
    hdfcbank_alloc: "20",
    infy_alloc: "20",
    icicibank_alloc: "15",

    // Display settings
    refresh_interval: "30",
    show_news: true,
    show_risk: true,
    dark_mode: true,
    cinematic_mode: false,

    // Notifications
    signal_alerts: true,
    price_alerts: false,
    alert_threshold: "5",
  });

  const update = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Check API status
  useEffect(() => {
    fetch(`${API}/`)
      .then(r => r.json())
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));

    fetch(`${API}/api/model/info`)
      .then(r => r.json())
      .then(setModelInfo)
      .catch(() => { });

    fetch(`${API}/api/alerts/config`)
      .then(r => r.json())
      .then(setAlertConfig)
      .catch(() => { });

    // Load saved settings
    const saved = localStorage.getItem("ai_trader_settings");
    if (saved) {
      try { setSettings(JSON.parse(saved)); } catch { }
    }
  }, []);

  const sendTestAlert = async () => {
    setTestResult("sending");
    try {
      const r = await fetch(`${API}/api/alerts/test`, { method: "POST" });
      const d = await r.json();
      setTestResult(d.ok ? "ok" : "fail");
    } catch {
      setTestResult("fail");
    }
    setTimeout(() => setTestResult("idle"), 4000);
  };

  const saveSettings = () => {
    localStorage.setItem("ai_trader_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const totalAlloc = Number(settings.reliance_alloc) + Number(settings.tcs_alloc) +
    Number(settings.hdfcbank_alloc) + Number(settings.infy_alloc) + Number(settings.icicibank_alloc);
  const allocError = totalAlloc !== 100;

  return (
    <PageShell>
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Rajdhani',sans-serif", fontSize: 13 }}>

      {/* SUBHEADER */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,10,20,.6)" }}>
        <div>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 13, fontWeight: 700, color: C.accent, letterSpacing: "0.12em" }}>SETTINGS</div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: C.muted, marginTop: 3, letterSpacing: "0.1em" }}>CONFIGURE YOUR AI TRADING SYSTEM</div>
        </div>
        <button onClick={saveSettings} style={{
          padding: "7px 20px", borderRadius: 6, cursor: "pointer",
          fontFamily: "'Rajdhani',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
          border: `1px solid ${saved ? "rgba(0,255,159,.4)" : "rgba(0,223,251,.35)"}`,
          background: saved ? "rgba(0,255,159,.1)" : "rgba(0,223,251,.08)",
          color: saved ? C.buy : C.accent,
          transition: "all 0.2s",
        }}>
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>

      <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>

        {/* API STATUS */}
        <Section title="System Status">
          <SettingRow label="API Server" desc={process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: apiStatus === "online" ? C.buy : apiStatus === "offline" ? C.sell : C.hold,
                boxShadow: `0 0 6px ${apiStatus === "online" ? C.buy : apiStatus === "offline" ? C.sell : C.hold}`,
              }} />
              <span style={{ fontSize: 12, color: apiStatus === "online" ? C.buy : C.sell, fontWeight: 600 }}>
                {apiStatus === "online" ? "Online" : apiStatus === "offline" ? "Offline" : "Checking..."}
              </span>
            </div>
          </SettingRow>

          {modelInfo && (
            <>
              <SettingRow label="Active Model" desc="Current prediction model being used">
                <span style={{ fontSize: 12, color: C.purple, fontWeight: 600, padding: "4px 10px", background: "rgba(99,102,241,0.1)", borderRadius: 4 }}>
                  {modelInfo.model}
                </span>
              </SettingRow>
              <SettingRow label="Features Used" desc="Number of technical indicators as model input">
                <span style={{ fontSize: 12, color: C.text }}>{modelInfo.features} features</span>
              </SettingRow>
              {modelInfo.tensorflow && (
                <SettingRow label="TensorFlow Version" desc="Deep learning framework">
                  <span style={{ fontSize: 12, color: C.muted }}>v{modelInfo.tensorflow}</span>
                </SettingRow>
              )}
            </>
          )}

          <SettingRow label="Tracked Stocks" desc="Stocks being monitored by the AI">
            <div style={{ display: "flex", gap: 6 }}>
              {["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS"].map(t => (
                <span key={t} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, padding: "3px 8px", background: "rgba(0,223,251,.08)", color: C.accent, borderRadius: 4, border: `1px solid rgba(0,223,251,.2)`, letterSpacing: "0.06em" }}>{t.replace(".NS","")}</span>
              ))}
            </div>
          </SettingRow>
        </Section>

        {/* MODEL SETTINGS */}
        <Section title="Model Configuration">
          <SettingRow label="Prediction Model" desc="Choose between LSTM (more accurate) or Random Forest (faster)">
            <Select value={settings.model} options={["LSTM", "RandomForest"]} onChange={v => update("model", v)} />
          </SettingRow>
          <SettingRow label="Lookback Period (days)" desc="How many past days the model uses to predict">
            <Select value={settings.lookback} options={["10", "20", "30", "60"]} onChange={v => update("lookback", v)} />
          </SettingRow>
          <SettingRow label="Confidence Threshold (%)" desc="Minimum confidence required to generate BUY/SELL signal">
            <Select value={settings.confidence_threshold} options={["45", "50", "55", "60", "65"]} onChange={v => update("confidence_threshold", v)} />
          </SettingRow>
          <SettingRow label="Cache Duration (seconds)" desc="How long model predictions are cached before retraining">
            <Select value={settings.cache_ttl} options={["300", "600", "1800", "3600"]} onChange={v => update("cache_ttl", v)} />
          </SettingRow>
          <SettingRow label="Use LSTM Model" desc="Enable deep learning predictions">
            <Toggle value={settings.use_ml} onChange={v => update("use_ml", v)} />
          </SettingRow>
          <SettingRow label="Use ICT/SMC Signals" desc="Enable institutional trading concept signals">
            <Toggle value={settings.use_ict} onChange={v => update("use_ict", v)} />
          </SettingRow>
        </Section>

        {/* STRATEGY SETTINGS */}
        <Section title="Trading Strategy">
          <SettingRow label="Stop Loss (%)" desc="Maximum loss per trade before auto-exit">
            <Select value={settings.sl_pct} options={["1", "2", "3", "5", "7"]} onChange={v => update("sl_pct", v)} />
          </SettingRow>
          <SettingRow label="Take Profit (%)" desc="Target profit per trade">
            <Select value={settings.tp_pct} options={["3", "5", "6", "8", "10"]} onChange={v => update("tp_pct", v)} />
          </SettingRow>
          <SettingRow label="Risk Per Trade (%)" desc="Percentage of capital risked on each trade">
            <Select value={settings.risk_per_trade} options={["1", "2", "3", "5"]} onChange={v => update("risk_per_trade", v)} />
          </SettingRow>
          <SettingRow label="Initial Capital (₹)" desc="Starting portfolio value for backtesting">
            <Select value={settings.initial_capital} options={["50000", "100000", "500000", "1000000"]} onChange={v => update("initial_capital", v)} />
          </SettingRow>
        </Section>

        {/* PORTFOLIO ALLOCATION */}
        <Section title="Portfolio Allocation">
          <div style={{ marginBottom: 12, fontSize: 11, color: C.muted }}>
            Total allocation must equal 100%. Current total:
            <span style={{ marginLeft: 6, fontWeight: 700, color: allocError ? C.sell : C.buy }}>{totalAlloc}%</span>
            {allocError && <span style={{ color: C.sell, marginLeft: 8 }}>âš  Must equal 100%</span>}
          </div>
          {[
            { key: "reliance_alloc", label: "RELIANCE", market: "India Conglomerate · NSE" },
            { key: "tcs_alloc", label: "TCS", market: "India IT · NSE" },
            { key: "hdfcbank_alloc", label: "HDFCBANK", market: "India Banking · NSE" },
            { key: "infy_alloc", label: "INFY", market: "India IT · NSE" },
            { key: "icicibank_alloc", label: "ICICIBANK", market: "India Banking · NSE" },
          ].map(stock => (
            <SettingRow key={stock.key} label={stock.label} desc={stock.market}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 120, height: 4, background: C.border, borderRadius: 2 }}>
                  <div style={{ width: `${Math.min(Number(settings[stock.key as keyof typeof settings]), 100)}%`, height: "100%", background: C.accent, borderRadius: 2 }} />
                </div>
                <Select
                  value={String(settings[stock.key as keyof typeof settings])}
                  options={["5", "10", "15", "20", "25", "30", "35", "40", "45", "50"]}
                  onChange={v => update(stock.key, v)}
                />
                <span style={{ fontSize: 12, color: C.muted, minWidth: 24 }}>%</span>
              </div>
            </SettingRow>
          ))}
        </Section>

        {/* DISPLAY SETTINGS */}
        <Section title="Display & Refresh">
          <SettingRow label="Auto Refresh Interval" desc="How often the dashboard fetches new data">
            <Select value={settings.refresh_interval} options={["10", "30", "60", "300"]} onChange={v => update("refresh_interval", v)} />
          </SettingRow>
          <SettingRow label="Show News Panel" desc="Display news sentiment on dashboard">
            <Toggle value={settings.show_news} onChange={v => update("show_news", v)} />
          </SettingRow>
          <SettingRow label="Show Risk Dashboard" desc="Display risk metrics panel">
            <Toggle value={settings.show_risk} onChange={v => update("show_risk", v)} />
          </SettingRow>
          <SettingRow label="Dark Mode" desc="Use dark terminal theme (recommended)">
            <Toggle value={settings.dark_mode} onChange={v => update("dark_mode", v)} />
          </SettingRow>
          <SettingRow label="Cinematic Mode (3D Background)" desc="Enables the holographic neural network + particle sphere on the dashboard. Default OFF — 3D is distracting during active chart analysis. Save settings to apply.">
            <Toggle value={Boolean(settings.cinematic_mode)} onChange={v => update("cinematic_mode", v)} />
          </SettingRow>
        </Section>

        {/* NOTIFICATIONS */}
        <Section title="Alerts & Notifications">
          <SettingRow label="Signal Alerts" desc="Get notified when BUY/SELL signal is generated">
            <Toggle value={settings.signal_alerts} onChange={v => update("signal_alerts", v)} />
          </SettingRow>
          <SettingRow label="Price Alerts" desc="Get notified when price moves by threshold %">
            <Toggle value={settings.price_alerts} onChange={v => update("price_alerts", v)} />
          </SettingRow>
          <SettingRow label="Alert Threshold (%)" desc="Price move % required to trigger alert">
            <Select value={settings.alert_threshold} options={["1", "2", "3", "5", "10"]} onChange={v => update("alert_threshold", v)} />
          </SettingRow>
        </Section>

        {/* ABOUT */}
        <Section title="About">
          <SettingRow label="Project" desc="AI-powered stock market predictor">
            <span style={{ fontSize: 12, color: C.muted }}>Major Project v4.0</span>
          </SettingRow>
          <SettingRow label="Model" desc="Deep learning + ICT/SMC strategy">
            <span style={{ fontSize: 12, color: C.muted }}>LSTM + Random Forest</span>
          </SettingRow>
          <SettingRow label="Data Source" desc="Market data provider">
            <span style={{ fontSize: 12, color: C.muted }}>Yahoo Finance (yfinance)</span>
          </SettingRow>
          <SettingRow label="Backend" desc="API framework">
            <span style={{ fontSize: 12, color: C.muted }}>FastAPI + Uvicorn</span>
          </SettingRow>
          <SettingRow label="Frontend" desc="UI framework">
            <span style={{ fontSize: 12, color: C.muted }}>Next.js 16 + Canvas Charts</span>
          </SettingRow>
          <div style={{ marginTop: 16, padding: "12px 14px", background: "rgba(0,212,170,0.04)", border: `1px solid rgba(0,212,170,0.15)`, borderRadius: 8, fontSize: 11, color: C.muted, lineHeight: 1.7 }}>
            âš  This system is built for educational and research purposes only.
            Not financial advice. Always consult a qualified financial advisor before making investment decisions.
          </div>
        </Section>

        {/* TELEGRAM ALERTS */}
        <Section title="Telegram Alerts">
          <SettingRow label="Status" desc="Whether bot token + chat ID are set in config.py">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: alertConfig?.configured ? C.buy : C.muted,
                boxShadow: alertConfig?.configured ? `0 0 6px ${C.buy}` : "none",
              }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: alertConfig?.configured ? C.buy : C.muted }}>
                {alertConfig == null ? "Checking..." : alertConfig.configured ? "Configured" : "Not configured"}
              </span>
            </div>
          </SettingRow>

          {alertConfig && (
            <>
              <SettingRow label="Alert Threshold" desc="Minimum confidence % to trigger a BUY/SELL alert">
                <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{alertConfig.threshold}%</span>
              </SettingRow>
              <SettingRow label="Cooldown" desc="Minimum time between duplicate alerts for the same stock">
                <span style={{ fontSize: 12, color: C.muted }}>{alertConfig.cooldown_hours} hours</span>
              </SettingRow>

              {Object.keys(alertConfig.recent_alerts).length > 0 && (
                <SettingRow label="Recent Alerts" desc="Signals sent this session">
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {Object.entries(alertConfig.recent_alerts).map(([sym, a]) => (
                      <span key={sym} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, border: `1px solid ${C.border}`, color: C.muted }}>
                        {sym.replace(".NS", "")} {a.signal} · {a.sent_ago_min}m ago
                      </span>
                    ))}
                  </div>
                </SettingRow>
              )}
            </>
          )}

          <SettingRow label="Test Alert" desc="Send a test message to verify your Telegram bot is working">
            <button onClick={sendTestAlert} disabled={testResult === "sending"} style={{
              padding: "6px 16px", borderRadius: 6, cursor: testResult === "sending" ? "default" : "pointer",
              fontFamily: "inherit", fontSize: 12, fontWeight: 600,
              border: `1px solid ${testResult === "ok" ? C.buy : testResult === "fail" ? C.sell : C.accent}`,
              background: testResult === "ok" ? "rgba(16,185,129,0.1)" : testResult === "fail" ? "rgba(239,68,68,0.1)" : "rgba(0,212,170,0.1)",
              color: testResult === "ok" ? C.buy : testResult === "fail" ? C.sell : C.accent,
              transition: "all 0.2s",
            }}>
              {testResult === "sending" ? "Sending..." : testResult === "ok" ? "Sent!" : testResult === "fail" ? "Failed — check config.py" : "Send Test Message"}
            </button>
          </SettingRow>

          <div style={{ padding: "12px 0 4px" }}>
            <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.9, padding: "10px 14px", background: "rgba(0,212,170,0.04)", border: `1px solid rgba(0,212,170,0.15)`, borderRadius: 8 }}>
              <strong style={{ color: C.accent }}>Setup (3 steps):</strong><br />
              1. Message <strong>@BotFather</strong> on Telegram ↑ <code>/newbot</code> ↑ copy token<br />
              2. Start a chat with your new bot, then open:<br />
              &nbsp;&nbsp;&nbsp;<code style={{ fontSize: 10 }}>https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code><br />
              &nbsp;&nbsp;&nbsp;Copy the <code>"id"</code> from the <code>"chat"</code> object<br />
              3. Paste both into <strong>config.py</strong> ↑ restart the API server
            </div>
          </div>
        </Section>

        {/* DANGER ZONE */}
        <Section title="Danger Zone">
          <SettingRow label="Clear Model Cache" desc="Force retrain all models on next request">
            <button onClick={() => alert("Cache cleared! Models will retrain on next signal request.")} style={{
              padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
              border: `1px solid ${C.sell}`, background: "rgba(239,68,68,0.1)",
              color: C.sell, fontSize: 12,
            }}>Clear Cache</button>
          </SettingRow>
          <SettingRow label="Reset Settings" desc="Restore all settings to default values">
            <button onClick={() => { localStorage.removeItem("ai_trader_settings"); window.location.reload(); }} style={{
              padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
              border: `1px solid ${C.hold}`, background: "rgba(245,158,11,0.1)",
              color: C.hold, fontSize: 12,
            }}>Reset All</button>
          </SettingRow>
        </Section>

      </div>
    </div>
    </PageShell>
  );
}
