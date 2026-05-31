export default function handler(req,res){res.setHeader("Content-Type","text/html; charset=utf-8");res.setHeader("Access-Control-Allow-Origin","*");res.status(200).send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>راصد — Gamma/Delta Profile</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#0a0c10;--bg2:#0e1118;--bg3:#141820;--bg4:#1a2030;
  --border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.12);
  --green:#26d97f;--red:#ff4d6a;--yellow:#f7c948;--blue:#4facf7;
  --purple:#a78bfa;--orange:#fb923c;
  --text:#e8edf5;--muted:#4a5568;--muted2:#718096;
  --mono:'JetBrains Mono',monospace;--sans:'IBM Plex Sans Arabic',sans-serif;
  --sidebar:220px;--topbar:44px;--info-panel:280px;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;overflow:hidden;background:var(--bg);color:var(--text);font-family:var(--sans)}

/* ── LAYOUT ── */
.app{display:grid;grid-template-columns:var(--sidebar) 1fr var(--info-panel);grid-template-rows:var(--topbar) 1fr;height:100vh;overflow:hidden}

/* ── TOPBAR ── */
.topbar{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;padding:0 14px;background:var(--bg2);border-bottom:1px solid var(--border);z-index:100}
.topbar-left{display:flex;align-items:center;gap:12px}
.logo{font-size:.95rem;font-weight:700;color:var(--green);display:flex;align-items:center;gap:6px;cursor:pointer}
.logo-dot{width:7px;height:7px;background:var(--green);border-radius:50%;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.85)}}
.topbar-tabs{display:flex;gap:2px}
.ttab{background:none;border:none;color:var(--muted2);font-family:var(--sans);font-size:.75rem;padding:5px 11px;border-radius:5px;cursor:pointer;transition:all .18s;white-space:nowrap}
.ttab:hover,.ttab.active{background:rgba(38,217,127,0.1);color:var(--green)}
.topbar-right{display:flex;align-items:center;gap:10px}
.live-badge{display:flex;align-items:center;gap:5px;font-family:var(--mono);font-size:.68rem;color:var(--green);background:rgba(38,217,127,0.08);border:1px solid rgba(38,217,127,0.2);padding:3px 9px;border-radius:20px}
.live-dot{width:5px;height:5px;background:var(--green);border-radius:50%;animation:pulse 1.4s infinite}
.mst{font-family:var(--mono);font-size:.67rem;padding:3px 8px;border-radius:20px}
.mst.open{background:rgba(38,217,127,0.08);color:var(--green);border:1px solid rgba(38,217,127,0.2)}
.mst.closed{background:rgba(255,77,106,0.08);color:var(--red);border:1px solid rgba(255,77,106,0.2)}
.day-tag{font-family:var(--mono);font-size:.66rem;color:var(--muted2)}
.trial-badge{font-family:var(--mono);font-size:.65rem;color:var(--yellow);background:rgba(247,201,72,0.08);border:1px solid rgba(247,201,72,0.2);padding:3px 8px;border-radius:20px}

/* ── SIDEBAR ── */
.sidebar{background:var(--bg2);border-left:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden}
.sidebar-logo{padding:14px 16px 10px;border-bottom:1px solid var(--border)}
.sidebar-logo .brand{font-size:1.1rem;font-weight:700;color:var(--green);display:flex;align-items:center;gap:7px}
.user-row{font-size:.72rem;color:var(--yellow);margin-top:4px;display:flex;align-items:center;gap:5px}
.user-dot{width:6px;height:6px;background:var(--yellow);border-radius:50%}
.nav-section{padding:12px 10px 6px;font-size:.63rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.1em}
.nav-item{display:flex;align-items:center;gap:8px;padding:8px 14px;margin:1px 6px;border-radius:7px;cursor:pointer;transition:all .18s;font-size:.78rem;color:var(--muted2)}
.nav-item:hover{background:var(--bg3);color:var(--text)}
.nav-item.active{background:rgba(38,217,127,0.1);color:var(--green);border:1px solid rgba(38,217,127,0.15)}
.nav-icon{font-size:.85rem;width:18px;text-align:center}
.sidebar-bottom{margin-top:auto;border-top:1px solid var(--border);padding:10px}
.sidebar-btn{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:7px;cursor:pointer;font-size:.75rem;color:var(--muted2);transition:all .18s}
.sidebar-btn:hover{background:var(--bg3);color:var(--text)}

/* ── MAIN AREA ── */
.main{display:flex;flex-direction:column;overflow:hidden;background:var(--bg)}

/* ── STATS BAR ── */
.stats-bar{display:flex;gap:1px;background:var(--border);border-bottom:1px solid var(--border);flex-shrink:0}
.stat-card{flex:1;background:var(--bg2);padding:8px 12px;min-width:0}
.stat-label{font-size:.63rem;color:var(--muted2);display:flex;align-items:center;gap:5px;margin-bottom:3px}
.stat-badge{font-size:.55rem;padding:1px 5px;border-radius:3px;font-weight:700}
.stat-val{font-family:var(--mono);font-size:1.05rem;font-weight:600}
.stat-sub{font-family:var(--mono);font-size:.62rem;color:var(--muted);margin-top:2px}
.up{color:var(--green)}.down{color:var(--red)}
.badge-g{background:rgba(38,217,127,0.12);color:var(--green)}
.badge-r{background:rgba(255,77,106,0.12);color:var(--red)}
.badge-y{background:rgba(247,201,72,0.12);color:var(--yellow)}
.badge-b{background:rgba(79,172,247,0.12);color:var(--blue)}

/* ── CHART TOOLBAR ── */
.chart-toolbar{display:flex;align-items:center;justify-content:space-between;padding:6px 12px;background:var(--bg2);border-bottom:1px solid var(--border);flex-shrink:0;gap:8px;flex-wrap:wrap}
.chart-left{display:flex;align-items:center;gap:8px}
.sym-select{background:var(--bg3);border:1px solid var(--border2);color:var(--text);font-family:var(--mono);font-size:.78rem;padding:4px 8px;border-radius:6px;outline:none;cursor:pointer}
.sym-select option{background:var(--bg3)}
.tf-group{display:flex;gap:2px}
.tf-btn{background:none;border:1px solid transparent;color:var(--muted2);font-family:var(--mono);font-size:.7rem;padding:3px 8px;border-radius:4px;cursor:pointer;transition:all .15s}
.tf-btn:hover,.tf-btn.active{background:rgba(38,217,127,0.1);color:var(--green);border-color:rgba(38,217,127,0.2)}
.chart-right{display:flex;align-items:center;gap:8px}
.chart-mode-btn{background:rgba(255,255,255,0.04);border:1px solid var(--border);color:var(--muted2);font-family:var(--sans);font-size:.7rem;padding:3px 10px;border-radius:4px;cursor:pointer;transition:all .15s}
.chart-mode-btn:hover,.chart-mode-btn.active{background:rgba(79,172,247,0.1);color:var(--blue);border-color:rgba(79,172,247,0.25)}
.current-price-tag{font-family:var(--mono);font-size:.8rem;font-weight:700;color:var(--text)}

/* ── CHART AREA ── */
.chart-area{flex:1;display:grid;grid-template-columns:1fr auto auto;overflow:hidden;position:relative}
canvas{display:block}
#main-canvas{width:100%;height:100%}
.gamma-profile-wrap{width:90px;background:var(--bg2);border-right:1px solid var(--border);position:relative;overflow:hidden}
.delta-profile-wrap{width:80px;background:var(--bg2);border-right:1px solid var(--border);position:relative;overflow:hidden}
.profile-label{position:absolute;top:6px;right:0;left:0;text-align:center;font-size:.6rem;color:var(--muted);font-family:var(--mono);z-index:2}

/* ── INFO PANEL ── */
.info-panel{background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden}
.info-panel::-webkit-scrollbar{width:3px}
.info-panel::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
.ip-section{border-bottom:1px solid var(--border);padding:10px 12px}
.ip-title{font-size:.65rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between}
.ip-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;font-size:.72rem}
.ip-label{color:var(--muted2)}
.ip-val{font-family:var(--mono);font-weight:600}
.gamma-tag{display:inline-block;padding:1px 6px;border-radius:3px;font-size:.62rem;font-weight:700}
.tag-g{background:rgba(38,217,127,0.12);color:var(--green);border:1px solid rgba(38,217,127,0.25)}
.tag-r{background:rgba(255,77,106,0.12);color:var(--red);border:1px solid rgba(255,77,106,0.25)}
.tag-y{background:rgba(247,201,72,0.12);color:var(--yellow);border:1px solid rgba(247,201,72,0.25)}

/* ── FLOW TABLE ── */
.flow-section{border-bottom:1px solid var(--border)}
.flow-header{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;cursor:pointer}
.flow-title{font-size:.65rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
.flow-badge{font-family:var(--mono);font-size:.6rem;padding:1px 6px;border-radius:3px}
.flow-table{width:100%;border-collapse:collapse;font-size:.68rem}
.flow-table th{padding:4px 6px;text-align:right;font-size:.58rem;color:var(--muted);text-transform:uppercase;border-bottom:1px solid var(--border)}
.flow-table td{padding:4px 6px;border-bottom:1px solid rgba(255,255,255,0.03);font-family:var(--mono);white-space:nowrap}
.flow-table tr:hover td{background:rgba(255,255,255,0.02)}
.ct{display:inline-block;padding:1px 5px;border-radius:2px;font-size:.58rem;font-weight:700;background:rgba(38,217,127,0.12);color:var(--green)}
.pt{display:inline-block;padding:1px 5px;border-radius:2px;font-size:.58rem;font-weight:700;background:rgba(255,77,106,0.12);color:var(--red)}

/* ── ACTIVE CONTRACTS ── */
.ac-wrap{padding:10px 12px}
.ac-title{font-size:.63rem;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between}
.ac-range{font-family:var(--mono);font-size:.65rem;color:var(--yellow)}
.ac-empty{font-size:.72rem;color:var(--muted);text-align:center;padding:14px 0}

/* ── TOOLTIP ── */
#ch-tip{position:absolute;display:none;background:rgba(10,12,16,.96);border:1px solid rgba(255,255,255,.12);border-radius:7px;padding:9px 12px;font-size:.68rem;font-family:var(--mono);pointer-events:none;z-index:99;min-width:150px;box-shadow:0 8px 24px rgba(0,0,0,.5)}

/* ── SCROLLBAR ── */
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:var(--bg2)}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}

/* ── LOADING ── */
.spin{display:flex;align-items:center;justify-content:center;padding:20px;color:var(--muted);font-size:.75rem;gap:7px}
.spin::before{content:'';width:12px;height:12px;border:1.5px solid rgba(79,172,247,.2);border-top-color:var(--blue);border-radius:50%;animation:sp .7s linear infinite;flex-shrink:0}
@keyframes sp{to{transform:rotate(360deg)}}

@media(max-width:900px){
  .app{grid-template-columns:0 1fr 0;grid-template-rows:var(--topbar) auto 1fr}
  .sidebar,.info-panel{display:none}
  .chart-area{grid-template-columns:1fr 70px 60px}
}
</style>
</head>
<body>

<div class="app">
  <!-- TOPBAR -->
  <div class="topbar">
    <div class="topbar-left">
      <div class="logo"><div class="logo-dot"></div>راصد KSA</div>
      <div class="topbar-tabs">
        <button class="ttab active" onclick="setTab('dashboard')">رصد الرئيسية</button>
        <button class="ttab" onclick="setTab('flow')">راصد العقود</button>
        <button class="ttab" onclick="setTab('analysis')">التحليلات المالية</button>
        <button class="ttab" onclick="setTab('calc')">حاسبة العقود</button>
      </div>
    </div>
    <div class="topbar-right">
      <div class="trial-badge">تجربة مجانية · 14 يوم</div>
      <div class="live-badge"><div class="live-dot"></div>LIVE</div>
      <div class="day-tag" id="day-tag">--</div>
      <div class="mst closed" id="mst">--</div>
    </div>
  </div>

  <!-- SIDEBAR -->
  <div class="sidebar">
    <div class="sidebar-logo">
      <div class="brand">⚡ راصد</div>
      <div class="user-row"><div class="user-dot"></div>أهلاً أحمد</div>
    </div>
    <div class="nav-section">القائمة</div>
    <div class="nav-item active" onclick="setTab('dashboard')"><span class="nav-icon">📊</span>رصد الرئيسية</div>
    <div class="nav-item" onclick="setTab('flow')"><span class="nav-icon">⚡</span>راصد العقود</div>
    <div class="nav-item" onclick="setTab('analysis')"><span class="nav-icon">📈</span>التحليلات المالية</div>
    <div class="nav-item" onclick="setTab('calc')"><span class="nav-icon">🧮</span>حاسبة العقود</div>
    <div class="nav-section">التدفقات</div>
    <div class="nav-item"><span class="nav-icon">🌑</span>Dark Pool</div>
    <div class="nav-item"><span class="nav-icon">🔔</span>التنبيهات</div>
    <div class="sidebar-bottom">
      <div class="sidebar-btn"><span>⚙️</span>الإعدادات</div>
      <div class="sidebar-btn"><span>🏷️</span>الباقات</div>
      <div class="sidebar-btn"><span>🚪</span>خروج</div>
    </div>
  </div>

  <!-- MAIN -->
  <div class="main">
    <!-- Stats Bar -->
    <div class="stats-bar" id="stats-bar">
      <div class="stat-card">
        <div class="stat-label"><span class="stat-badge badge-g">عالي</span>إجمالي الغاما ↑</div>
        <div class="stat-val up" id="st-gex">--</div>
        <div class="stat-sub" id="st-gex2">--</div>
      </div>
      <div class="stat-card">
        <div class="stat-label"><span class="stat-badge badge-r">بوت</span>عقود البوت المفتوحة ↓</div>
        <div class="stat-val" id="st-put-oi">--</div>
        <div class="stat-sub" id="st-put-oi2">--</div>
      </div>
      <div class="stat-card">
        <div class="stat-label"><span class="stat-badge badge-y">متوسط</span>عقود الكول المفتوحة ↓</div>
        <div class="stat-val" id="st-call-oi">--</div>
        <div class="stat-sub" id="st-call-oi2">--</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">ضغط السيولة 🔒</div>
        <div class="stat-val" id="st-liq">--</div>
        <div class="stat-sub" id="st-liq2">--</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">PC Ratio 📊</div>
        <div class="stat-val" id="st-pc">--</div>
        <div class="stat-sub" id="st-pc2">--</div>
      </div>
    </div>

    <!-- Chart Toolbar -->
    <div class="chart-toolbar">
      <div class="chart-left">
        <!-- Index selector -->
        <select class="sym-select" id="sym-sel" onchange="onSymChange()">
          <optgroup label="مؤشرات">
            <option value="SPX">SPX — S&P 500</option>
            <option value="NDX">NDX — Nasdaq 100</option>
            <option value="DJX">DJX — Dow Jones</option>
            <option value="RUT">RUT — Russell 2000</option>
            <option value="VIX">VIX — مؤشر الخوف</option>
          </optgroup>
          <optgroup label="صناديق ETF">
            <option value="SPY">SPY</option>
            <option value="QQQ">QQQ</option>
            <option value="IWM">IWM</option>
            <option value="TLT">TLT</option>
            <option value="GLD">GLD</option>
            <option value="SLV">SLV</option>
          </optgroup>
          <optgroup label="شركات">
            <option value="NVDA">NVDA</option>
            <option value="AAPL">AAPL</option>
            <option value="TSLA">TSLA</option>
            <option value="META">META</option>
            <option value="MSFT">MSFT</option>
            <option value="AMZN">AMZN</option>
            <option value="GOOGL">GOOGL</option>
            <option value="AMD">AMD</option>
          </optgroup>
        </select>
        <!-- Timeframe -->
        <div class="tf-group">
          <button class="tf-btn" data-tf="1">1د</button>
          <button class="tf-btn active" data-tf="5">5د</button>
          <button class="tf-btn" data-tf="15">15د</button>
          <button class="tf-btn" data-tf="D">1د</button>
          <button class="tf-btn" data-tf="5D">5د</button>
          <button class="tf-btn" data-tf="15D">15د</button>
        </div>
        <!-- Mode -->
        <div style="display:flex;gap:2px">
          <button class="chart-mode-btn active" onclick="setMode('gamma')">مؤشرات</button>
          <button class="chart-mode-btn" onclick="setMode('stocks')">أسهم</button>
          <button class="chart-mode-btn" onclick="setMode('etf')">صناديق</button>
        </div>
      </div>
      <div class="chart-right">
        <span class="current-price-tag" id="cur-price">--</span>
        <span id="cur-chg" style="font-family:var(--mono);font-size:.75rem">--</span>
        <button onclick="loadAll()" style="background:rgba(38,217,127,0.1);border:1px solid rgba(38,217,127,0.2);color:var(--green);font-family:var(--sans);font-size:.72rem;padding:4px 12px;border-radius:5px;cursor:pointer">تحديث</button>
        <button style="background:rgba(255,255,255,0.04);border:1px solid var(--border);color:var(--muted2);font-family:var(--sans);font-size:.72rem;padding:4px 10px;border-radius:5px;cursor:pointer">ملء الشاشة</button>
      </div>
    </div>

    <!-- Chart Area -->
    <div class="chart-area" id="chart-area">
      <div style="position:relative;overflow:hidden">
        <canvas id="main-canvas"></canvas>
        <div id="ch-tip"></div>
        <div id="ch-load" class="spin" style="position:absolute;inset:0;background:rgba(10,12,16,.7)">جاري تحميل الشارت...</div>
      </div>
      <div class="gamma-profile-wrap">
        <div class="profile-label">غاما</div>
        <canvas id="gamma-canvas" style="width:100%;height:100%"></canvas>
      </div>
      <div class="delta-profile-wrap">
        <div class="profile-label">دلتا</div>
        <canvas id="delta-canvas" style="width:100%;height:100%"></canvas>
      </div>
    </div>
  </div>

  <!-- INFO PANEL -->
  <div class="info-panel">
    <!-- IV/GEX info -->
    <div class="ip-section">
      <div class="ip-title">
        <span>التضخم · IV AIM</span>
        <span style="font-family:var(--mono);font-size:.7rem;color:var(--muted2)" id="iv-time">AM 12:59</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <div style="font-size:.7rem;color:var(--red);font-weight:600" id="iv-signal">تجنب الشراء</div>
        <div style="font-family:var(--mono);font-size:1.3rem;font-weight:700;color:var(--yellow)" id="iv-val">--</div>
      </div>
      <div class="ip-row"><span class="ip-label">IV Rank</span><span class="ip-val" id="iv-rank">--</span></div>
      <div class="ip-row"><span class="ip-label">IV Crush</span><span class="ip-val" style="color:var(--muted)">قادم</span></div>
      <div class="ip-row"><span class="ip-label">25Δ (SKEW)</span><span class="ip-val" id="iv-skew">--</span></div>
      <div class="ip-row"><span class="ip-label">الاتجاه</span><span class="ip-val" style="color:var(--yellow)" id="iv-dir">--</span></div>
    </div>

    <!-- Gamma Levels -->
    <div class="ip-section">
      <div class="ip-title">مستويات الغاما</div>
      <div class="ip-row"><span class="ip-label">مقاومة الغاما</span><span class="ip-val"><span class="gamma-tag tag-r" id="g-resist">--</span></span></div>
      <div class="ip-row"><span class="ip-label">دعم الغاما</span><span class="ip-val"><span class="gamma-tag tag-g" id="g-support">--</span></span></div>
      <div class="ip-row"><span class="ip-label">نقطة الدوران</span><span class="ip-val"><span class="gamma-tag tag-y" id="g-flip">--</span></span></div>
      <div class="ip-row"><span class="ip-label">Max Pain</span><span class="ip-val" style="color:var(--purple)" id="g-pain">--</span></div>
    </div>

    <!-- دمج المشتقات -->
    <div class="ip-section">
      <div class="ip-title">دمج المشتقات (غاما + تشارم)</div>
      <div style="font-size:.85rem;font-weight:700;color:var(--green);margin-bottom:6px" id="flow-signal">دافع للكول</div>
      <div style="font-size:.7rem;color:var(--muted2);line-height:1.5" id="flow-desc">الغاما هو المسيطر ومتوافق مع التشارم</div>
    </div>

    <!-- Active Contracts -->
    <div class="ac-wrap">
      <div class="ac-title">
        <span>ACTIVE CONTRACTS</span>
        <span class="ac-range" id="ac-range">--</span>
      </div>
      <div id="ac-content"><div class="ac-empty">لا توجد عقود ضمن رينج الغاما</div></div>
    </div>

    <!-- Flow Table -->
    <div class="flow-section">
      <div class="flow-header">
        <span class="flow-title">Options Flow</span>
        <span class="flow-badge tag-g" id="flow-badge">--</span>
      </div>
      <div id="flow-table-wrap"><div class="spin">جاري التحميل...</div></div>
    </div>
  </div>
</div>

<script>
// ═══════════════════════════════════════════════
// API
// ═══════════════════════════════════════════════
async function uwGet(path) {
  const r = await fetch('/api/uw?path=' + encodeURIComponent(path));
  if(!r.ok) throw new Error('UW ' + r.status);
  return r.json();
}
async function massGet(path) {
  const r = await fetch('/api/mass?path=' + encodeURIComponent(path));
  if(!r.ok) throw new Error('MASS ' + r.status);
  return r.json();
}

// ═══════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════
let state = {
  sym: 'SPX', tf: '5', mode: 'gamma',
  candles: [], gammaLevels: {}, optionData: [],
  hovIdx: -1, priceMin: 0, priceMax: 0
};

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════
const fmt = n => n==null?'--':Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtV = n => {if(n==null)return'--';const a=Math.abs(n);if(a>=1e9)return(n/1e9).toFixed(1)+'B';if(a>=1e6)return(n/1e6).toFixed(1)+'M';if(a>=1e3)return(n/1e3).toFixed(0)+'K';return String(Math.round(n))};
const set = (id,v) => {const el=document.getElementById(id);if(el)el.textContent=v};
const cls = v => v>=0?'up':'down';
const sign = v => v>=0?'▲ +':'▼ ';

// ═══════════════════════════════════════════════
// CLOCK & DATE
// ═══════════════════════════════════════════════
function getLastTradingDay() {
  const et = new Date(new Date().toLocaleString('en-US',{timeZone:'America/New_York'}));
  const h=et.getHours(),m=et.getMinutes(),wd=et.getDay();
  const open = wd>=1&&wd<=5&&(h>9||(h===9&&m>=30))&&h<16;
  if(open) return et.toISOString().split('T')[0];
  const d = new Date(et);
  for(let i=0;i<7;i++){d.setDate(d.getDate()-1);if(d.getDay()>=1&&d.getDay()<=5)break;}
  return d.toISOString().split('T')[0];
}
function getFromDate(n){const d=new Date(getLastTradingDay());d.setDate(d.getDate()-n);return d.toISOString().split('T')[0];}
function dayLabel(){
  const d=new Date(getLastTradingDay());
  const days=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const months=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  return \`\${days[d.getDay()]} \${d.getDate()} \${months[d.getMonth()]}\`;
}

function tick() {
  const now = new Date();
  const et = new Date(now.toLocaleString('en-US',{timeZone:'America/New_York'}));
  const h=et.getHours(),m=et.getMinutes(),s=et.getSeconds(),wd=et.getDay();
  const open = wd>=1&&wd<=5&&(h>9||(h===9&&m>=30))&&h<16;
  const timeStr = \`\${String(h%12||12).padStart(2,'0')}:\${String(m).padStart(2,'0')} \${h>=12?'PM':'AM'}\`;
  set('mst', open?'السوق مفتوح':'السوق مغلق');
  document.getElementById('mst').className = 'mst ' + (open?'open':'closed');
  set('day-tag', 'بيانات ' + dayLabel());
  set('iv-time', timeStr);
}
setInterval(tick,1000); tick();

// ═══════════════════════════════════════════════
// TAB / MODE
// ═══════════════════════════════════════════════
function setTab(t) {
  document.querySelectorAll('.ttab,.nav-item').forEach(b=>b.classList.remove('active'));
}
function setMode(m) {
  state.mode = m;
  document.querySelectorAll('.chart-mode-btn').forEach(b=>b.classList.remove('active'));
  event.target.classList.add('active');
}
function onSymChange() {
  state.sym = document.getElementById('sym-sel').value;
  loadAll();
}
document.querySelectorAll('.tf-btn').forEach(b=>{
  b.addEventListener('click',()=>{
    document.querySelectorAll('.tf-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    state.tf = b.dataset.tf;
    loadChart();
  });
});

// ═══════════════════════════════════════════════
// GAMMA CALC
// ═══════════════════════════════════════════════
function calcGamma(opts) {
  const st={};
  opts.forEach(o=>{
    const sk=parseFloat(o.strike||o.strike_price||0);
    const oi=parseFloat(o.open_interest||o.oi||0);
    const gm=parseFloat(o.gamma||o.greeks?.gamma||0.012);
    const dl=parseFloat(o.delta||o.greeks?.delta||0.5);
    const isC=(o.option_type||o.put_call||'C').toUpperCase().includes('C');
    if(!st[sk])st[sk]={call:0,put:0,cdelta:0,pdelta:0,price:sk,coi:0,poi:0};
    const gex=oi*gm*100;
    if(isC){st[sk].call+=gex;st[sk].cdelta+=oi*Math.abs(dl);st[sk].coi+=oi;}
    else{st[sk].put+=gex;st[sk].pdelta+=oi*Math.abs(dl);st[sk].poi+=oi;}
  });
  const arr=Object.values(st).sort((a,b)=>a.price-b.price).map(s=>({...s,gex:s.call-s.put,delta:s.cdelta-s.pdelta}));
  const maxG=Math.max(...arr.map(s=>Math.abs(s.gex))||[1]);
  const cw=arr.filter(s=>s.gex>0).sort((a,b)=>b.gex-a.gex)[0];
  const pw=arr.filter(s=>s.gex<0).sort((a,b)=>a.gex-b.gex)[0];
  const zero=arr.reduce((b,s)=>Math.abs(s.gex)<Math.abs(b.gex)?s:b,arr[0]);
  const pain=arr.filter(s=>s.coi>0&&s.poi>0).reduce((b,s)=>(s.coi+s.poi)>(b.coi+b.poi)?s:b,arr[Math.floor(arr.length/2)]||arr[0]);
  return{callWall:cw?.price,putWall:pw?.price,zeroGamma:zero?.price,maxPain:pain?.price,arr,total:arr.reduce((a,s)=>a+s.gex,0)};
}

// ═══════════════════════════════════════════════
// LOAD OPTIONS
// ═══════════════════════════════════════════════
async function loadOptions() {
  const sym = state.sym === 'SPX' ? 'SPY' : state.sym;
  try {
    const d = await uwGet(\`stocks/\${sym}/options-chain?limit=120\`);
    const opts = d?.data||d?.results||[];
    if(!opts.length) throw new Error('no data');
    state.optionData = opts;
    const lv = calcGamma(opts);
    state.gammaLevels = lv;

    // Update info panel
    set('g-resist', lv.callWall?'$'+lv.callWall.toFixed(0):'--');
    set('g-support', lv.putWall?'$'+lv.putWall.toFixed(0):'--');
    set('g-flip', lv.zeroGamma?'$'+lv.zeroGamma.toFixed(0):'--');
    set('g-pain', lv.maxPain?'$'+lv.maxPain.toFixed(0):'--');
    set('st-gex', '$'+fmtV(lv.total));

    // Put/Call stats
    let totalPoi=0,totalCoi=0;
    opts.forEach(o=>{
      const isC=(o.option_type||o.put_call||'C').toUpperCase().includes('C');
      if(isC)totalCoi+=parseFloat(o.open_interest||0);
      else totalPoi+=parseFloat(o.open_interest||0);
    });
    set('st-put-oi', fmtV(totalPoi));
    set('st-call-oi', fmtV(totalCoi));
    const pc=totalCoi?totalPoi/totalCoi:0;
    set('st-pc', pc.toFixed(2));
    set('st-pc2', pc<0.8?'Bullish':pc>1.2?'Bearish':'Neutral');

    // Active contracts range
    if(lv.putWall&&lv.callWall) {
      set('ac-range', \`\${lv.putWall.toFixed(0)}-\${lv.callWall.toFixed(0)}\`);
      const active = opts.filter(o=>{
        const sk=parseFloat(o.strike||o.strike_price||0);
        return sk>=lv.putWall&&sk<=lv.callWall;
      });
      if(active.length) {
        document.getElementById('ac-content').innerHTML = active.slice(0,8).map(o=>{
          const isC=(o.option_type||o.put_call||'C').toUpperCase().includes('C');
          return \`<div style="display:flex;justify-content:space-between;font-size:.68rem;font-family:var(--mono);padding:3px 0;border-bottom:1px solid var(--border)">
            <span style="color:\${isC?'var(--green)':'var(--red)'}">\${o.strike||o.strike_price||'--'}</span>
            <span class="\${isC?'ct':'pt'}">\${isC?'C':'P'}</span>
            <span style="color:var(--muted2)">\${fmtV(o.open_interest||0)}</span>
            <span style="color:var(--muted)">\${o.expiration_date?.slice(5)||'--'}</span>
          </div>\`;
        }).join('');
      }
    }

    // IV estimate
    const avgIV = opts.slice(0,20).reduce((a,o)=>a+parseFloat(o.implied_volatility||0),0)/20;
    if(avgIV>0) {
      const ivPct = (avgIV*100).toFixed(1)+'%';
      set('iv-val', ivPct);
      const rank = Math.min(100,Math.round(avgIV*200));
      set('iv-rank', rank+'%');
      set('iv-signal', rank>70?'تجنب الشراء':rank<30?'مناسب للشراء':'متوسط');
      set('iv-dir', pc<0.8?'ميل نحو الكول':'ميل نحو البوت');
    }

    // Flow signal
    const bull = totalCoi>totalPoi;
    set('flow-signal', bull?'دافع للكول':'دافع للبوت');
    document.getElementById('flow-signal').style.color = bull?'var(--green)':'var(--red)';
    set('flow-desc', bull?'الغاما مسيطر ومتوافق مع التشارم':'ضغط بوت مع تشارم سلبي');

    // Redraw gamma profiles
    if(state.candles.length) {
      drawGammaProfile(lv);
      drawDeltaProfile(lv);
    }
  } catch(e) {
    console.log('options error:', e.message);
  }
}

// ═══════════════════════════════════════════════
// LOAD FLOW
// ═══════════════════════════════════════════════
async function loadFlow() {
  try {
    const d = await uwGet('option-trades/flow-alerts?limit=30&order=desc');
    const rows = d?.data||d?.results||[];
    if(!rows.length) throw new Error('no data');
    let callV=0,putV=0;
    const trs = rows.slice(0,20).map(r=>{
      const isC=(r.put_call||r.type||'C').toUpperCase().includes('C');
      const val=parseFloat(r.total_premium||r.premium||0);
      if(isC)callV+=val;else putV+=val;
      return \`<tr>
        <td style="color:var(--muted2)">\${(r.time||r.created_at||'').slice(0,5)||'--'}</td>
        <td style="font-weight:700;color:var(--text)">\${r.ticker||'--'}</td>
        <td><span class="\${isC?'ct':'pt'}">\${isC?'C':'P'}</span></td>
        <td style="color:var(--muted2)">$\${r.strike||'--'}</td>
        <td class="\${isC?'up':'down'}" style="font-weight:700">$\${fmtV(val)}</td>
      </tr>\`;
    }).join('');
    document.getElementById('flow-table-wrap').innerHTML = \`
      <table class="flow-table">
        <thead><tr><th>وقت</th><th>رمز</th><th>نوع</th><th>Strike</th><th>قيمة</th></tr></thead>
        <tbody>\${trs}</tbody>
      </table>\`;
    const total=callV+putV,bull=total?Math.round(callV/total*100):50;
    set('flow-badge', bull+'% Bull');
    set('st-liq', '$'+fmtV(total));
    set('st-liq2', bull+'% Bullish');
    document.getElementById('flow-badge').style.background = bull>50?'rgba(38,217,127,0.12)':'rgba(255,77,106,0.12)';
    document.getElementById('flow-badge').style.color = bull>50?'var(--green)':'var(--red)';
  } catch(e) {
    document.getElementById('flow-table-wrap').innerHTML = '<div class="spin" style="font-size:.68rem;color:var(--muted)">البيانات تتوفر خلال ساعات التداول</div>';
  }
}

// ═══════════════════════════════════════════════
// LOAD CHART
// ═══════════════════════════════════════════════
async function loadChart() {
  document.getElementById('ch-load').style.display='flex';
  const sym = state.sym === 'SPX' ? 'SPY' : state.sym === 'NDX' ? 'QQQ' : state.sym === 'DJX' ? 'DIA' : state.sym;
  const tfMap = {'1':'1/minute','5':'5/minute','15':'15/minute','D':'1/day','5D':'5/day','15D':'15/day'};
  const span = tfMap[state.tf]||'5/minute';
  const daysBack = state.tf==='D'||state.tf==='5D'||state.tf==='15D' ? 90 : 5;
  const toDate = getLastTradingDay();
  const frDate = getFromDate(daysBack);
  try {
    const d = await massGet(\`v2/aggs/ticker/\${sym}/range/\${span}/\${frDate}/\${toDate}?adjusted=true&sort=asc&limit=300&apiKey=63icPsd_duqgWVPXMo6wgNVJ6McD69h4\`);
    const candles = (d?.results||[]).map(r=>({t:r.t,o:r.o,h:r.h,l:r.l,c:r.c,v:r.v}));
    if(!candles.length) throw new Error('no candles');
    state.candles = candles;
    const last=candles[candles.length-1];
    const chg=last.o?((last.c-last.o)/last.o):0;
    set('cur-price','$'+fmt(last.c));
    const chgEl=document.getElementById('cur-chg');
    chgEl.textContent=sign(chg)+Math.abs(chg*100).toFixed(2)+'%';
    chgEl.className=cls(chg);
    drawMainChart(candles);
  } catch(e) {
    drawDemoChart();
  }
  document.getElementById('ch-load').style.display='none';
}

// ═══════════════════════════════════════════════
// DRAW MAIN CHART
// ═══════════════════════════════════════════════
function drawMainChart(candles) {
  const cv = document.getElementById('main-canvas');
  const wrap = cv.parentElement;
  const W = wrap.clientWidth, H = wrap.clientHeight;
  if(!W||!H) return;
  cv.width=W*devicePixelRatio; cv.height=H*devicePixelRatio;
  cv.style.width=W+'px'; cv.style.height=H+'px';
  const ctx=cv.getContext('2d'); ctx.scale(devicePixelRatio,devicePixelRatio);

  const P={t:20,r:12,b:32,l:8};
  const cW=W-P.l-P.r,cH=H-P.t-P.b;
  const prices=candles.flatMap(c=>[c.h,c.l]);
  const minP=Math.min(...prices)*.9983,maxP=Math.max(...prices)*1.0017,pR=maxP-minP;
  state.priceMin=minP; state.priceMax=maxP;
  const px=p=>P.t+cH-((p-minP)/pR)*cH;
  const cx=i=>P.l+(i/(Math.max(candles.length-1,1)))*cW;
  const bW=Math.max(1.5,(cW/candles.length)*.7);

  // Background
  ctx.fillStyle='#0a0c10'; ctx.fillRect(0,0,W,H);

  // Grid
  ctx.strokeStyle='rgba(255,255,255,0.04)'; ctx.lineWidth=1;
  for(let i=0;i<=5;i++){const y=P.t+(cH/5)*i;ctx.beginPath();ctx.moveTo(P.l,y);ctx.lineTo(P.l+cW,y);ctx.stroke();}
  for(let i=0;i<=8;i++){const x=P.l+(cW/8)*i;ctx.beginPath();ctx.moveTo(x,P.t);ctx.lineTo(x,P.t+cH);ctx.stroke();}

  // Gamma zones + lines
  const lv = state.gammaLevels;
  const zone=(price,r,g,b,alpha=0.08)=>{
    if(!price||price<minP||price>maxP)return;
    const y=px(price);
    const gr=ctx.createLinearGradient(0,y-50,0,y+50);
    gr.addColorStop(0,\`rgba(\${r},\${g},\${b},0)\`);
    gr.addColorStop(.5,\`rgba(\${r},\${g},\${b},\${alpha})\`);
    gr.addColorStop(1,\`rgba(\${r},\${g},\${b},0)\`);
    ctx.fillStyle=gr; ctx.fillRect(P.l,y-50,cW,100);
  };
  const gline=(price,color,lbl,dash=[6,3])=>{
    if(!price||price<minP||price>maxP)return;
    const y=px(price);
    ctx.save(); ctx.strokeStyle=color; ctx.lineWidth=1.5; ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(P.l,y); ctx.lineTo(P.l+cW,y); ctx.stroke();
    ctx.setLineDash([]);
    // Label badge on chart
    ctx.fillStyle=color+'22'; ctx.fillRect(P.l+4,y-10,cW-8,20);
    ctx.fillStyle=color; ctx.font='bold 9px JetBrains Mono'; ctx.textAlign='left';
    ctx.fillText(lbl+' $'+price.toFixed(0), P.l+8, y+3);
    ctx.restore();
  };

  zone(lv?.callWall,38,217,127,0.1);
  zone(lv?.putWall,255,77,106,0.1);
  zone(lv?.zeroGamma,247,201,72,0.07);
  zone(lv?.maxPain,167,139,250,0.07);

  gline(lv?.callWall,'#26d97f','مقاومة الغاما',[6,3]);
  gline(lv?.putWall,'#ff4d6a','دعم الغاما',[6,3]);
  gline(lv?.zeroGamma,'#f7c948','نقطة الدوران',[4,4]);
  gline(lv?.maxPain,'#a78bfa','Max Pain',[3,5]);

  // Volume bars
  const maxV=Math.max(...candles.map(c=>c.v||0));
  candles.forEach((c,i)=>{
    const x=cx(i),bH=maxV?(c.v||0)/maxV*28:0;
    ctx.fillStyle=c.c>=c.o?'rgba(38,217,127,.15)':'rgba(255,77,106,.15)';
    ctx.fillRect(x-bW/2,P.t+cH-bH,bW,bH);
  });

  // Candles
  candles.forEach((c,i)=>{
    const x=cx(i),isG=c.c>=c.o;
    const col=isG?'#26d97f':'#ff4d6a';
    ctx.strokeStyle=col; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(x,px(c.h)); ctx.lineTo(x,px(c.l)); ctx.stroke();
    const bT=px(Math.max(c.o,c.c)),bBot=px(Math.min(c.o,c.c)),bH=Math.max(1,bBot-bT);
    ctx.fillStyle=isG?'rgba(38,217,127,.82)':'rgba(255,77,106,.82)';
    ctx.fillRect(x-bW/2,bT,bW,bH);
    if(i===state.hovIdx){ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=1;ctx.strokeRect(x-bW/2-1,bT-1,bW+2,bH+2);}
  });

  // Current price line
  const last=candles[candles.length-1];
  if(last){
    const y=px(last.c),col=last.c>=last.o?'#26d97f':'#ff4d6a';
    ctx.strokeStyle='rgba(255,255,255,.2)';ctx.lineWidth=1;ctx.setLineDash([2,4]);
    ctx.beginPath();ctx.moveTo(P.l,y);ctx.lineTo(P.l+cW,y);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=col;ctx.fillRect(P.l+cW-52,y-9,52,18);
    ctx.fillStyle='#0a0c10';ctx.font='bold 9px JetBrains Mono';ctx.textAlign='center';
    ctx.fillText('$'+fmt(last.c),P.l+cW-26,y+4);
  }

  // Price axis
  ctx.fillStyle='rgba(74,85,104,.8)';ctx.font='9px JetBrains Mono';ctx.textAlign='left';
  for(let i=0;i<=5;i++)ctx.fillText('$'+fmt(minP+(pR/5)*(5-i)),P.l,P.t+(cH/5)*i+4);

  // Time axis
  ctx.textAlign='center';const step=Math.max(1,Math.floor(candles.length/8));
  candles.forEach((c,i)=>{
    if(i%step===0){
      const d=new Date(c.t);
      const lbl=state.tf==='D'||state.tf.endsWith('D')?(d.getMonth()+1)+'/'+d.getDate():
        d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');
      ctx.fillStyle='rgba(74,85,104,.7)';ctx.fillText(lbl,cx(i),P.t+cH+13);
    }
  });

  // Hover handler
  cv.onmousemove=e=>{
    const rect=cv.getBoundingClientRect();
    const mx=e.clientX-rect.left;
    const idx=Math.round((mx-P.l)/cW*(candles.length-1));
    if(idx>=0&&idx<candles.length){
      state.hovIdx=idx;
      const c=candles[idx],isG=c.c>=c.o,chg=c.o?((c.c-c.o)/c.o*100).toFixed(2):0;
      const tt=document.getElementById('ch-tip');
      tt.style.display='block';
      const tx=cx(idx);
      tt.style.left=(tx>W/2?tx-160:tx+8)+'px';tt.style.top='10px';
      tt.innerHTML=\`<div style="font-weight:700;margin-bottom:5px;color:\${isG?'#26d97f':'#ff4d6a'}">\${state.sym} · \${new Date(c.t).toLocaleDateString('ar-SA')}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 10px;font-size:.66rem">
        <span style="color:var(--muted2)">فتح</span><span>$\${fmt(c.o)}</span>
        <span style="color:var(--muted2)">أعلى</span><span style="color:#26d97f">$\${fmt(c.h)}</span>
        <span style="color:var(--muted2)">أدنى</span><span style="color:#ff4d6a">$\${fmt(c.l)}</span>
        <span style="color:var(--muted2)">إغلاق</span><span style="font-weight:700">$\${fmt(c.c)}</span>
        <span style="color:var(--muted2)">تغير</span><span style="color:\${isG?'#26d97f':'#ff4d6a'}">\${isG?'+':''}\${chg}%</span>
        <span style="color:var(--muted2)">حجم</span><span>\${fmtV(c.v)}</span>
      </div>\`;
      drawMainChart(candles);
    }
  };
  cv.onmouseleave=()=>{state.hovIdx=-1;document.getElementById('ch-tip').style.display='none';drawMainChart(candles);};
  cv.ontouchstart=()=>{};

  // Draw profiles after chart
  if(Object.keys(lv).length) {
    drawGammaProfile(lv);
    drawDeltaProfile(lv);
  }
}

// ═══════════════════════════════════════════════
// GAMMA PROFILE (right side)
// ═══════════════════════════════════════════════
function drawGammaProfile(lv) {
  const cv=document.getElementById('gamma-canvas');
  const W=cv.parentElement.clientWidth,H=cv.parentElement.clientHeight;
  if(!W||!H||!lv.arr?.length)return;
  cv.width=W*devicePixelRatio;cv.height=H*devicePixelRatio;
  cv.style.width=W+'px';cv.style.height=H+'px';
  const ctx=cv.getContext('2d');ctx.scale(devicePixelRatio,devicePixelRatio);
  ctx.fillStyle='#0e1118';ctx.fillRect(0,0,W,H);

  const arr=lv.arr;
  const minP=state.priceMin||Math.min(...arr.map(s=>s.price));
  const maxP=state.priceMax||Math.max(...arr.map(s=>s.price));
  const pR=maxP-minP||1;
  const PAD={t:20,b:12};
  const cH=H-PAD.t-PAD.b;
  const py=p=>PAD.t+cH-((p-minP)/pR)*cH;
  const maxG=Math.max(...arr.map(s=>Math.abs(s.gex||0)))||1;

  // Center line
  ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(W/2,PAD.t);ctx.lineTo(W/2,PAD.t+cH);ctx.stroke();

  // Bars
  const barH=Math.max(2,cH/arr.length*.85);
  arr.forEach(s=>{
    if(s.price<minP||s.price>maxP)return;
    const y=py(s.price);
    const w=maxG?Math.abs(s.gex)/maxG*(W/2-4):0;
    const isPos=s.gex>=0;
    ctx.fillStyle=isPos?'rgba(38,217,127,.55)':'rgba(255,77,106,.55)';
    if(isPos)ctx.fillRect(W/2,y-barH/2,w,barH);
    else ctx.fillRect(W/2-w,y-barH/2,w,barH);
  });

  // Gamma level lines
  const glev=(price,color)=>{
    if(!price||price<minP||price>maxP)return;
    const y=py(price);
    ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.setLineDash([3,2]);
    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();ctx.setLineDash([]);
  };
  glev(lv.callWall,'#26d97f');
  glev(lv.putWall,'#ff4d6a');
  glev(lv.zeroGamma,'#f7c948');

  ctx.fillStyle='rgba(74,85,104,.7)';ctx.font='8px JetBrains Mono';ctx.textAlign='center';
  ctx.fillText('غاما',W/2,12);
}

// ═══════════════════════════════════════════════
// DELTA PROFILE (right side)
// ═══════════════════════════════════════════════
function drawDeltaProfile(lv) {
  const cv=document.getElementById('delta-canvas');
  const W=cv.parentElement.clientWidth,H=cv.parentElement.clientHeight;
  if(!W||!H||!lv.arr?.length)return;
  cv.width=W*devicePixelRatio;cv.height=H*devicePixelRatio;
  cv.style.width=W+'px';cv.style.height=H+'px';
  const ctx=cv.getContext('2d');ctx.scale(devicePixelRatio,devicePixelRatio);
  ctx.fillStyle='#0e1118';ctx.fillRect(0,0,W,H);

  const arr=lv.arr;
  const minP=state.priceMin||Math.min(...arr.map(s=>s.price));
  const maxP=state.priceMax||Math.max(...arr.map(s=>s.price));
  const pR=maxP-minP||1;
  const PAD={t:20,b:12};
  const cH=H-PAD.t-PAD.b;
  const py=p=>PAD.t+cH-((p-minP)/pR)*cH;
  const maxD=Math.max(...arr.map(s=>Math.abs(s.delta||0)))||1;

  ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(W/2,PAD.t);ctx.lineTo(W/2,PAD.t+cH);ctx.stroke();

  const barH=Math.max(2,cH/arr.length*.85);
  arr.forEach(s=>{
    if(s.price<minP||s.price>maxP)return;
    const y=py(s.price);
    const w=maxD?Math.abs(s.delta)/maxD*(W/2-4):0;
    const isPos=(s.delta||0)>=0;
    ctx.fillStyle=isPos?'rgba(79,172,247,.55)':'rgba(251,146,60,.55)';
    if(isPos)ctx.fillRect(W/2,y-barH/2,w,barH);
    else ctx.fillRect(W/2-w,y-barH/2,w,barH);
  });

  const glev=(price,color)=>{
    if(!price||price<minP||price>maxP)return;
    const y=py(price);
    ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.setLineDash([3,2]);
    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();ctx.setLineDash([]);
  };
  glev(lv.callWall,'#26d97f');
  glev(lv.putWall,'#ff4d6a');

  ctx.fillStyle='rgba(74,85,104,.7)';ctx.font='8px JetBrains Mono';ctx.textAlign='center';
  ctx.fillText('دلتا',W/2,12);
}

function drawDemoChart() {
  let p=7550;const now=Date.now();
  const c=Array.from({length:100},(_,i)=>{
    const chg=(Math.random()-.48)*12;const o=p;p=Math.max(7200,Math.min(7800,p+chg));
    return{t:now-(99-i)*300000,o,h:Math.max(o,p)+Math.random()*4,l:Math.min(o,p)-Math.random()*4,c:p,v:Math.floor(Math.random()*1e6+2e5)};
  });
  state.candles=c;
  const demo={callWall:7585,putWall:7500,zeroGamma:7550,maxPain:7560,arr:Array.from({length:30},(_,i)=>({price:7420+i*6,gex:(Math.random()-.45)*1e6,delta:(Math.random()-.4)*5e5}))};
  state.gammaLevels=demo;
  set('g-resist','$7,585');set('g-support','$7,500');set('g-flip','$7,550');set('g-pain','$7,560');
  drawMainChart(c);drawGammaProfile(demo);drawDeltaProfile(demo);
}

// ═══════════════════════════════════════════════
// RESIZE
// ═══════════════════════════════════════════════
function onResize() {
  if(state.candles.length){drawMainChart(state.candles);drawGammaProfile(state.gammaLevels);drawDeltaProfile(state.gammaLevels);}
}
window.addEventListener('resize',()=>{clearTimeout(window._rt);window._rt=setTimeout(onResize,100);});

// ═══════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════
async function loadAll() {
  await Promise.all([loadChart(),loadOptions(),loadFlow()]);
}
loadAll();
setInterval(loadFlow,90000);
setInterval(loadOptions,120000);
</script>
</body>
</html>
`);}
