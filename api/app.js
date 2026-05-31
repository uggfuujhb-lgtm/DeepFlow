export default function handler(req,res){res.setHeader("Content-Type","text/html; charset=utf-8");res.setHeader("Access-Control-Allow-Origin","*");res.status(200).send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DeepFlow — Gamma/Delta Profile</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#0b0d12;--bg2:#0f1219;--bg3:#141820;--g:#26d97f;--r:#ff4d6a;--y:#f7c948;--b:#4facf7;--p:#a78bfa;--t:#e2ecf8;--m:#4a5568;--m2:#718096;--bd:rgba(255,255,255,.06);--mono:'JetBrains Mono',monospace;--sans:'IBM Plex Sans Arabic',sans-serif}
html,body{height:100%;overflow:hidden;background:var(--bg);color:var(--t);font-family:var(--sans)}

/* LAYOUT: sidebar | main | info */
.app{display:grid;grid-template-columns:210px 1fr 270px;grid-template-rows:46px 1fr;height:100vh}

/* ── TOPBAR ── */
.topbar{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;padding:0 14px;background:var(--bg2);border-bottom:1px solid var(--bd);z-index:50;gap:8px}
.brand{font-weight:700;font-size:.95rem;color:var(--g);display:flex;align-items:center;gap:7px;cursor:pointer;white-space:nowrap}
.bdot{width:7px;height:7px;background:var(--g);border-radius:50%;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.75)}}
.ttabs{display:flex;gap:1px}
.ttab{background:none;border:none;color:var(--m2);font-family:var(--sans);font-size:.72rem;padding:5px 10px;border-radius:5px;cursor:pointer;white-space:nowrap;transition:all .15s}
.ttab:hover,.ttab.on{background:rgba(38,217,127,.1);color:var(--g)}
.tr{display:flex;align-items:center;gap:8px;flex-shrink:0}
.pill{display:flex;align-items:center;gap:4px;font-family:var(--mono);font-size:.65rem;padding:2px 8px;border-radius:20px;white-space:nowrap}
.pill.live{color:var(--g);background:rgba(38,217,127,.08);border:1px solid rgba(38,217,127,.2)}
.pill.open{color:var(--g);background:rgba(38,217,127,.08);border:1px solid rgba(38,217,127,.2)}
.pill.closed{color:var(--r);background:rgba(255,77,106,.08);border:1px solid rgba(255,77,106,.2)}
.pdot{width:5px;height:5px;border-radius:50%;animation:pulse 1.4s infinite}
.pdot.g{background:var(--g)}.pdot.r{background:var(--r)}

/* ── SIDEBAR ── */
.sidebar{background:var(--bg2);border-left:1px solid var(--bd);display:flex;flex-direction:column}
.sl{padding:12px 14px 8px;border-bottom:1px solid var(--bd)}
.sl .brand{font-size:1rem}
.ur{font-size:.68rem;color:var(--y);margin-top:3px;display:flex;align-items:center;gap:4px}
.ns{padding:9px 12px 3px;font-size:.58rem;font-weight:600;color:var(--m);text-transform:uppercase;letter-spacing:.1em}
.ni{display:flex;align-items:center;gap:7px;padding:6px 12px;margin:1px 5px;border-radius:6px;cursor:pointer;font-size:.74rem;color:var(--m2);transition:all .14s}
.ni:hover{background:var(--bg3);color:var(--t)}
.ni.on{background:rgba(38,217,127,.1);color:var(--g);border:1px solid rgba(38,217,127,.14)}
.sbbot{margin-top:auto;border-top:1px solid var(--bd);padding:7px}
.sbbtn{display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:.71rem;color:var(--m2);transition:all .14s}
.sbbtn:hover{background:var(--bg3);color:var(--t)}

/* ── MAIN ── */
.main{display:flex;flex-direction:column;overflow:hidden;min-width:0}

/* ── STATS ROW ── */
.stats{display:flex;gap:1px;background:var(--bd);border-bottom:1px solid var(--bd);flex-shrink:0}
.sc{flex:1;background:var(--bg2);padding:6px 10px;min-width:0;position:relative}
.sc-l{font-size:.58rem;color:var(--m2);display:flex;align-items:center;gap:3px;margin-bottom:2px}
.sc-b{font-size:.52rem;padding:1px 4px;border-radius:2px;font-weight:700}
.sc-v{font-family:var(--mono);font-size:.92rem;font-weight:600;white-space:nowrap}
.sc-s{font-family:var(--mono);font-size:.58rem;color:var(--m);margin-top:1px}
.up{color:var(--g)}.dn{color:var(--r)}.nt{color:var(--y)}
.tag-g{background:rgba(38,217,127,.12);color:var(--g)}
.tag-r{background:rgba(255,77,106,.12);color:var(--r)}
.tag-y{background:rgba(247,201,72,.12);color:var(--y)}
.tag-b{background:rgba(79,172,247,.12);color:var(--b)}

/* ── TICKER STRIP ── */
.tstrip{display:flex;gap:1px;background:var(--bd);border-bottom:1px solid var(--bd);flex-shrink:0;overflow-x:auto;scrollbar-width:none}
.tstrip::-webkit-scrollbar{display:none}
.tc{flex-shrink:0;background:var(--bg2);padding:4px 11px;cursor:pointer;min-width:85px;border-bottom:2px solid transparent;transition:all .14s}
.tc:hover{background:var(--bg3)}
.tc.on{border-bottom-color:var(--g);background:rgba(38,217,127,.05)}
.tsym{font-family:var(--mono);font-size:.68rem;font-weight:600;color:var(--m2)}
.tprc{font-family:var(--mono);font-size:.8rem;font-weight:700;margin:1px 0}
.tchg{font-family:var(--mono);font-size:.58rem}
.blink{animation:bk .25s ease}
@keyframes bk{0%,100%{opacity:1}50%{opacity:.2}}

/* ── CHART TOOLBAR ── */
.ctbar{display:flex;align-items:center;justify-content:space-between;padding:5px 10px;background:var(--bg2);border-bottom:1px solid var(--bd);flex-shrink:0;gap:6px;flex-wrap:wrap}
.ctl{display:flex;align-items:center;gap:5px;flex-wrap:wrap}
.ssel{background:var(--bg3);border:1px solid rgba(255,255,255,.1);color:var(--t);font-family:var(--mono);font-size:.73rem;padding:3px 7px;border-radius:5px;outline:none;cursor:pointer}
.ssel option,.ssel optgroup{background:var(--bg3)}
.tfg{display:flex;gap:1px}
.tfb{background:none;border:1px solid transparent;color:var(--m2);font-family:var(--mono);font-size:.67rem;padding:3px 7px;border-radius:4px;cursor:pointer;transition:all .14s}
.tfb:hover,.tfb.on{background:rgba(38,217,127,.1);color:var(--g);border-color:rgba(38,217,127,.2)}
.ctr{display:flex;align-items:center;gap:7px}

/* ── CHART AREA ── */
.chartarea{flex:1;display:grid;grid-template-columns:1fr 90px 75px;overflow:hidden;min-height:0}
.cwrap{position:relative;overflow:hidden;background:var(--bg)}
#mc{position:absolute;inset:0;cursor:crosshair}
#chx{position:absolute;top:0;bottom:0;width:1px;background:rgba(255,255,255,.15);display:none;pointer-events:none;z-index:5}
#chy{position:absolute;left:0;right:0;height:1px;background:rgba(255,255,255,.15);display:none;pointer-events:none;z-index:5}
#tip{position:absolute;display:none;background:rgba(11,13,18,.97);border:1px solid rgba(255,255,255,.12);border-radius:7px;padding:8px 12px;font-size:.65rem;font-family:var(--mono);pointer-events:none;z-index:20;min-width:145px;box-shadow:0 8px 28px rgba(0,0,0,.6)}
.gpw,.dpw{background:var(--bg2);position:relative;overflow:hidden;border-right:1px solid var(--bd)}
.plbl{position:absolute;top:4px;right:0;left:0;text-align:center;font-size:.55rem;color:var(--m);font-family:var(--mono);z-index:2;pointer-events:none}
#ld{position:absolute;inset:0;background:rgba(11,13,18,.9);display:flex;align-items:center;justify-content:center;color:var(--m);font-size:.75rem;gap:7px;z-index:30}
#ld::before{content:'';width:13px;height:13px;border:1.5px solid rgba(79,172,247,.2);border-top-color:var(--b);border-radius:50%;animation:sp .7s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}

/* ── INFO PANEL ── */
.info{background:var(--bg2);border-right:1px solid var(--bd);display:flex;flex-direction:column;overflow-y:auto;min-width:0}
.info::-webkit-scrollbar{width:3px}
.info::-webkit-scrollbar-thumb{background:rgba(255,255,255,.06)}
.ip{border-bottom:1px solid var(--bd);padding:9px 11px}
.ipt{font-size:.6rem;font-weight:600;color:var(--m);text-transform:uppercase;letter-spacing:.08em;margin-bottom:7px;display:flex;justify-content:space-between;align-items:center}
.ir{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;font-size:.69rem}
.il{color:var(--m2)}
.iv{font-family:var(--mono);font-weight:600}
.gtag{display:inline-block;padding:1px 5px;border-radius:3px;font-size:.59rem;font-weight:700}
.tgg{background:rgba(38,217,127,.12);color:var(--g);border:1px solid rgba(38,217,127,.25)}
.tgr{background:rgba(255,77,106,.12);color:var(--r);border:1px solid rgba(255,77,106,.25)}
.tgy{background:rgba(247,201,72,.12);color:var(--y);border:1px solid rgba(247,201,72,.25)}
.ft{width:100%;border-collapse:collapse;font-size:.65rem}
.ft th{padding:3px 5px;text-align:right;font-size:.56rem;color:var(--m);text-transform:uppercase;border-bottom:1px solid var(--bd)}
.ft td{padding:3px 5px;border-bottom:1px solid rgba(255,255,255,.025);font-family:var(--mono);white-space:nowrap}
.ft tr:hover td{background:rgba(255,255,255,.025)}
.ct{display:inline-block;padding:1px 4px;border-radius:2px;font-size:.56rem;font-weight:700;background:rgba(38,217,127,.12);color:var(--g)}
.pt{display:inline-block;padding:1px 4px;border-radius:2px;font-size:.56rem;font-weight:700;background:rgba(255,77,106,.12);color:var(--r)}
.spin{display:flex;align-items:center;justify-content:center;padding:14px;color:var(--m);font-size:.7rem;gap:5px}
.spin::before{content:'';width:10px;height:10px;border:1.5px solid rgba(79,172,247,.2);border-top-color:var(--b);border-radius:50%;animation:sp .7s linear infinite;flex-shrink:0}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,.07)}
@media(max-width:900px){.app{grid-template-columns:0 1fr 0}.sidebar,.info{display:none}.chartarea{grid-template-columns:1fr 70px 60px}}
</style>
</head>
<body>
<div class="app">

<!-- TOPBAR -->
<div class="topbar">
  <div class="brand"><div class="bdot"></div>DeepFlow</div>
  <div class="ttabs">
    <button class="ttab on">رصد الرئيسية</button>
    <button class="ttab">راصد العقود</button>
    <button class="ttab">التحليلات المالية</button>
    <button class="ttab">حاسبة العقود</button>
  </div>
  <div class="tr">
    <div class="pill live"><div class="pdot g"></div>LIVE <span id="cntd" style="color:var(--m2);margin-right:3px">15s</span></div>
    <div class="pill" id="mst"><div class="pdot r"></div>--</div>
    <div style="font-family:var(--mono);font-size:.62rem;color:var(--m2)" id="dayt">--</div>
  </div>
</div>

<!-- SIDEBAR -->
<div class="sidebar">
  <div class="sl"><div class="brand">⚡ DeepFlow</div><div class="ur">● أهلاً أحمد</div></div>
  <div class="ns">القائمة</div>
  <div class="ni on">📊 رصد الرئيسية</div>
  <div class="ni">⚡ راصد العقود</div>
  <div class="ni">📈 التحليلات المالية</div>
  <div class="ni">🧮 حاسبة العقود</div>
  <div class="ns">التدفقات</div>
  <div class="ni">🌑 Dark Pool</div>
  <div class="ni">🔔 التنبيهات</div>
  <div class="sbbot">
    <div class="sbbtn">⚙️ الإعدادات</div>
    <div class="sbbtn">🏷️ الباقات</div>
    <div class="sbbtn">🚪 خروج</div>
  </div>
</div>

<!-- MAIN -->
<div class="main">

  <!-- STATS -->
  <div class="stats">
    <div class="sc">
      <div class="sc-l"><span class="sc-b tag-g">▲</span>إجمالي الغاما</div>
      <div class="sc-v up" id="s-gex">--</div>
      <div class="sc-s">Gamma Exposure</div>
    </div>
    <div class="sc">
      <div class="sc-l"><span class="sc-b tag-r">PUT</span>عقود البوت المفتوحة</div>
      <div class="sc-v dn" id="s-poi">--</div>
      <div class="sc-s" id="s-poi2">Open Interest</div>
    </div>
    <div class="sc">
      <div class="sc-l"><span class="sc-b tag-g">CALL</span>عقود الكول المفتوحة</div>
      <div class="sc-v up" id="s-coi">--</div>
      <div class="sc-s" id="s-coi2">Open Interest</div>
    </div>
    <div class="sc">
      <div class="sc-l">ضغط السيولة</div>
      <div class="sc-v nt" id="s-liq">--</div>
      <div class="sc-s" id="s-liq2">Options Flow</div>
    </div>
    <div class="sc">
      <div class="sc-l">PC Ratio</div>
      <div class="sc-v nt" id="s-pc">--</div>
      <div class="sc-s" id="s-pc2">--</div>
    </div>
  </div>

  <!-- TICKER STRIP -->
  <div class="tstrip" id="tstrip">
    <div class="tc on" data-s="SPY" data-l="SPX/SPY" onclick="selTicker(this)"><div class="tsym">SPX</div><div class="tprc" id="tp-SPY">--</div><div class="tchg" id="tc-SPY">--</div></div>
    <div class="tc" data-s="QQQ" data-l="NDX/QQQ" onclick="selTicker(this)"><div class="tsym">NDX</div><div class="tprc" id="tp-QQQ">--</div><div class="tchg" id="tc-QQQ">--</div></div>
    <div class="tc" data-s="NVDA" data-l="NVDA" onclick="selTicker(this)"><div class="tsym">NVDA</div><div class="tprc" id="tp-NVDA">--</div><div class="tchg" id="tc-NVDA">--</div></div>
    <div class="tc" data-s="AAPL" data-l="AAPL" onclick="selTicker(this)"><div class="tsym">AAPL</div><div class="tprc" id="tp-AAPL">--</div><div class="tchg" id="tc-AAPL">--</div></div>
    <div class="tc" data-s="TSLA" data-l="TSLA" onclick="selTicker(this)"><div class="tsym">TSLA</div><div class="tprc" id="tp-TSLA">--</div><div class="tchg" id="tc-TSLA">--</div></div>
    <div class="tc" data-s="META" data-l="META" onclick="selTicker(this)"><div class="tsym">META</div><div class="tprc" id="tp-META">--</div><div class="tchg" id="tc-META">--</div></div>
    <div class="tc" data-s="MSFT" data-l="MSFT" onclick="selTicker(this)"><div class="tsym">MSFT</div><div class="tprc" id="tp-MSFT">--</div><div class="tchg" id="tc-MSFT">--</div></div>
    <div class="tc" data-s="AMZN" data-l="AMZN" onclick="selTicker(this)"><div class="tsym">AMZN</div><div class="tprc" id="tp-AMZN">--</div><div class="tchg" id="tc-AMZN">--</div></div>
    <div class="tc" data-s="AMD" data-l="AMD" onclick="selTicker(this)"><div class="tsym">AMD</div><div class="tprc" id="tp-AMD">--</div><div class="tchg" id="tc-AMD">--</div></div>
  </div>

  <!-- CHART TOOLBAR -->
  <div class="ctbar">
    <div class="ctl">
      <select class="ssel" id="sym" onchange="onSym()">
        <optgroup label="📊 مؤشرات">
          <option value="SPY" data-l="SPX/SPY">SPX — S&P 500</option>
          <option value="QQQ" data-l="NDX/QQQ">NDX — Nasdaq</option>
          <option value="DIA" data-l="DJX/DIA">DJX — Dow Jones</option>
          <option value="IWM" data-l="RUT/IWM">RUT — Russell</option>
        </optgroup>
        <optgroup label="🏦 صناديق ETF">
          <option value="SPY" data-l="SPY">SPY</option>
          <option value="QQQ" data-l="QQQ">QQQ</option>
          <option value="IWM" data-l="IWM">IWM</option>
          <option value="TLT" data-l="TLT">TLT — سندات</option>
          <option value="GLD" data-l="GLD">GLD — ذهب</option>
          <option value="SLV" data-l="SLV">SLV — فضة</option>
        </optgroup>
        <optgroup label="🏢 شركات">
          <option value="NVDA" data-l="NVDA">NVDA</option>
          <option value="AAPL" data-l="AAPL">AAPL</option>
          <option value="TSLA" data-l="TSLA">TSLA</option>
          <option value="META" data-l="META">META</option>
          <option value="MSFT" data-l="MSFT">MSFT</option>
          <option value="AMZN" data-l="AMZN">AMZN</option>
          <option value="GOOGL" data-l="GOOGL">GOOGL</option>
          <option value="AMD" data-l="AMD">AMD</option>
          <option value="PLTR" data-l="PLTR">PLTR</option>
          <option value="MSTR" data-l="MSTR">MSTR</option>
        </optgroup>
      </select>
      <div class="tfg">
        <button class="tfb" data-i="1m">1د</button>
        <button class="tfb on" data-i="5m">5د</button>
        <button class="tfb" data-i="15m">15د</button>
        <button class="tfb" data-i="60m">1س</button>
        <button class="tfb" data-i="1d">يومي</button>
        <button class="tfb" data-i="1wk">أسبوعي</button>
      </div>
    </div>
    <div class="ctr">
      <span style="font-family:var(--mono);font-size:.88rem;font-weight:700" id="cp">--</span>
      <span style="font-family:var(--mono);font-size:.72rem" id="cc">--</span>
      <span style="font-family:var(--mono);font-size:.62rem;color:var(--m2)" id="chl">--</span>
      <span style="font-family:var(--mono);font-size:.6rem;color:var(--m)" id="clbl">SPX</span>
    </div>
  </div>

  <!-- CHART -->
  <div class="chartarea">
    <div class="cwrap" id="cwrap">
      <canvas id="mc"></canvas>
      <div id="chx"></div><div id="chy"></div>
      <div id="tip"></div>
      <div id="ld">جاري تحميل الشارت...</div>
    </div>
    <div class="gpw"><div class="plbl">غاما</div><canvas id="gc"></canvas></div>
    <div class="dpw"><div class="plbl">دلتا</div><canvas id="dc"></canvas></div>
  </div>
</div>

<!-- INFO PANEL -->
<div class="info">

  <!-- IV/التضخم -->
  <div class="ip">
    <div class="ipt"><span>التضخم · IV AIM</span><span style="font-family:var(--mono);font-size:.65rem;color:var(--m2)" id="ivt">--</span></div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">
      <div style="font-size:.68rem;font-weight:600" id="ivsig">--</div>
      <div style="font-family:var(--mono);font-size:1.2rem;font-weight:700;color:var(--y)" id="ivv">--</div>
    </div>
    <div class="ir"><span class="il">IV Rank</span><span class="iv" id="ivr">--</span></div>
    <div class="ir"><span class="il">IV Crush</span><span class="iv" style="color:var(--m)">قادم</span></div>
    <div class="ir"><span class="il">25Δ SKEW</span><span class="iv" id="ivsk">--</span></div>
    <div class="ir"><span class="il">الاتجاه</span><span class="iv" id="ivdir">--</span></div>
  </div>

  <!-- مستويات الغاما -->
  <div class="ip">
    <div class="ipt">مستويات الغاما</div>
    <div class="ir"><span class="il">مقاومة الغاما</span><span class="gtag tgr" id="gr">--</span></div>
    <div class="ir"><span class="il">دعم الغاما</span><span class="gtag tgg" id="gs">--</span></div>
    <div class="ir"><span class="il">نقطة الدوران</span><span class="gtag tgy" id="gf">--</span></div>
    <div class="ir"><span class="il">Max Pain</span><span class="iv" style="color:var(--p)" id="gp">--</span></div>
    <div class="ir"><span class="il">GEX إجمالي</span><span class="iv up" id="gt">--</span></div>
  </div>

  <!-- Open Interest -->
  <div class="ip">
    <div class="ipt">Open Interest الكامل</div>
    <div class="ir"><span class="il">Call OI</span><span class="iv up" id="oic">--</span></div>
    <div class="ir"><span class="il">Put OI</span><span class="iv dn" id="oip">--</span></div>
    <div class="ir"><span class="il">P/C Ratio</span><span class="iv nt" id="oipc">--</span></div>
    <div class="ir"><span class="il">الإشارة</span><span class="iv" id="oisig">--</span></div>
  </div>

  <!-- دمج المشتقات -->
  <div class="ip">
    <div class="ipt">دمج المشتقات (غاما + تشارم)</div>
    <div style="font-size:.82rem;font-weight:700;margin-bottom:3px;color:var(--g)" id="flsig">--</div>
    <div style="font-size:.67rem;color:var(--m2);line-height:1.55" id="fldesc">--</div>
  </div>

  <!-- Active Contracts -->
  <div class="ip">
    <div class="ipt"><span>ACTIVE CONTRACTS</span><span style="font-family:var(--mono);font-size:.63rem;color:var(--y)" id="acr">--</span></div>
    <div id="acc"><div style="font-size:.68rem;color:var(--m);text-align:center;padding:8px 0">لا توجد عقود ضمن رينج الغاما</div></div>
  </div>

  <!-- Options Flow -->
  <div class="ip" style="padding-bottom:0">
    <div class="ipt"><span>Options Flow · التدفقات</span><span style="font-family:var(--mono);font-size:.6rem;padding:1px 5px;border-radius:3px" id="flb">--</span></div>
  </div>
  <div id="flw"><div class="spin">جاري التحميل...</div></div>
</div>

</div><!-- .app -->

<script>
// ════════════════════════════════════
// API CALLS
// ════════════════════════════════════
const K_FH = 'd0rh1ohr01qgssk0pr80d0rh1ohr01qgssk0pr8g';
const K_UW = 'e82a2e15-8f40-4985-973a-4eeb9b7f7021';

async function apiQuote(syms) {
  const r = await fetch('/api/quote?symbols=' + syms);
  return r.json();
}
async function apiCandles(sym, interval) {
  const r = await fetch(\`/api/candles?sym=\$\{sym}&interval=\$\{interval}\`);
  return r.json();
}
async function apiUW(path) {
  const r = await fetch('/api/uw?path=' + encodeURIComponent(path));
  return r.json();
}

// ════════════════════════════════════
// HELPERS
// ════════════════════════════════════
const fmt = n => n == null || isNaN(n) ? '--' : Number(n).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
const fv = n => { if (!n && n !== 0) return '--'; const a = Math.abs(n); if (a >= 1e9) return (n/1e9).toFixed(1)+'B'; if (a >= 1e6) return (n/1e6).toFixed(1)+'M'; if (a >= 1e3) return (n/1e3).toFixed(0)+'K'; return String(Math.round(n)); };
const $ = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
const cls = v => v >= 0 ? 'up' : 'dn';
const sgn = v => v >= 0 ? '▲ +' : '▼ ';

// ════════════════════════════════════
// STATE
// ════════════════════════════════════
let ST = {
  sym: 'SPY', lbl: 'SPX/SPY', interval: '5m',
  candles: [], gex: {}, hovIdx: -1,
  pMin: 0, pMax: 0,
  vs: 0, ve: 0,
  drag: false, dragX: 0, dragVS: 0,
  prices: {}, countdown: 15
};
const TSYMS = ['SPY','QQQ','NVDA','AAPL','TSLA','META','MSFT','AMZN','AMD'];

// ════════════════════════════════════
// CLOCK / DATE
// ════════════════════════════════════
function etNow() {
  return new Date(new Date().toLocaleString('en-US', {timeZone:'America/New_York'}));
}
function isOpen() {
  const et = etNow();
  const wd = et.getDay(), h = et.getHours(), m = et.getMinutes();
  return wd >= 1 && wd <= 5 && (h > 9 || (h === 9 && m >= 30)) && h < 16;
}
function tick() {
  const et = etNow();
  const h = et.getHours(), m = et.getMinutes();
  const ts = \`\$\{String(h%12||12).padStart(2,'0')}:\$\{String(m).padStart(2,'0')} \$\{h>=12?'PM':'AM'}\`;
  const open = isOpen();
  const mst = document.getElementById('mst');
  mst.innerHTML = \`<div class="pdot \$\{open?'g':'r'}"></div>\$\{open?'السوق مفتوح':'السوق مغلق'}\`;
  mst.className = 'pill ' + (open ? 'open' : 'closed');
  const days = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  $('dayt', \`\$\{days[et.getDay()]} \$\{et.getDate()} \$\{months[et.getMonth()]}\`);
  $('ivt', ts);
}
setInterval(tick, 1000); tick();

// ════════════════════════════════════
// LIVE PRICE UPDATES (every 15s)
// ════════════════════════════════════
async function fetchPrices() {
  try {
    const d = await apiQuote(TSYMS.join(','));
    const res = d?.quoteResponse?.result || [];
    res.forEach(q => {
      if (!q.symbol) return;
      const old = ST.prices[q.symbol];
      ST.prices[q.symbol] = q;
      const price = q.regularMarketPrice;
      const chgPct = q.regularMarketChangePercent;
      // Update ticker strip
      const tp = document.getElementById('tp-'+q.symbol);
      const tc = document.getElementById('tc-'+q.symbol);
      if (tp) {
        if (old && old.regularMarketPrice !== price) { tp.classList.add('blink'); setTimeout(()=>tp.classList.remove('blink'),300); }
        tp.textContent = '$'+fmt(price);
        tp.className = 'tprc ' + cls(chgPct);
      }
      if (tc) {
        tc.textContent = sgn(chgPct)+Math.abs(chgPct).toFixed(2)+'%';
        tc.className = 'tchg ' + cls(chgPct);
      }
      // Update main display if selected
      if (q.symbol === ST.sym) updatePriceDisplay(q);
    });
    // Update last candle live
    if (ST.candles.length && ST.prices[ST.sym]) {
      const p = ST.prices[ST.sym].regularMarketPrice;
      if (p > 0) {
        ST.candles[ST.candles.length-1].c = p;
        if (p > ST.candles[ST.candles.length-1].h) ST.candles[ST.candles.length-1].h = p;
        if (p < ST.candles[ST.candles.length-1].l) ST.candles[ST.candles.length-1].l = p;
        render();
      }
    }
  } catch(e) { console.log('price err:', e.message); }
}

function updatePriceDisplay(q) {
  const price = q.regularMarketPrice, chgPct = q.regularMarketChangePercent;
  $('cp', '$'+fmt(price));
  const cc = document.getElementById('cc');
  if (cc) { cc.textContent = sgn(chgPct)+Math.abs(chgPct).toFixed(2)+'%'; cc.className = cls(chgPct); }
  $('chl', \`H:$\$\{fmt(q.regularMarketDayHigh)} L:$\$\{fmt(q.regularMarketDayLow)}\`);
}

// Countdown
function startCountdown() {
  clearInterval(ST._ct);
  ST.countdown = 15;
  $('cntd', '15s');
  ST._ct = setInterval(() => {
    ST.countdown--;
    $('cntd', ST.countdown + 's');
    if (ST.countdown <= 0) { ST.countdown = 15; fetchPrices(); }
  }, 1000);
}

// ════════════════════════════════════
// GAMMA CALCULATOR
// ════════════════════════════════════
function calcGamma(opts) {
  const st = {};
  opts.forEach(o => {
    const sk = parseFloat(o.strike || o.strike_price || 0); if (!sk) return;
    const oi = parseFloat(o.open_interest || o.oi || 0);
    const gm = parseFloat(o.gamma || o.greeks?.gamma || 0.012);
    const dl = Math.abs(parseFloat(o.delta || o.greeks?.delta || 0.5));
    const isC = (o.option_type || o.put_call || 'C').toUpperCase().includes('C');
    if (!st[sk]) st[sk] = {call:0,put:0,cdelta:0,pdelta:0,price:sk,coi:0,poi:0};
    const gex = oi * gm * 100;
    if (isC) { st[sk].call += gex; st[sk].cdelta += oi*dl; st[sk].coi += oi; }
    else { st[sk].put += gex; st[sk].pdelta += oi*dl; st[sk].poi += oi; }
  });
  const arr = Object.values(st).sort((a,b)=>a.price-b.price).map(s=>({...s, gex:s.call-s.put, delta:s.cdelta-s.pdelta}));
  if (!arr.length) return {arr:[], callWall:null, putWall:null, zeroGamma:null, maxPain:null, total:0};
  const cw = arr.filter(s=>s.gex>0).sort((a,b)=>b.gex-a.gex)[0];
  const pw = arr.filter(s=>s.gex<0).sort((a,b)=>a.gex-b.gex)[0];
  const zero = arr.reduce((b,s) => Math.abs(s.gex) < Math.abs(b?.gex ?? Infinity) ? s : b, arr[0]);
  const pain = arr.reduce((b,s) => (s.coi+s.poi) > (b.coi+b.poi) ? s : b, arr[0]);
  return { callWall:cw?.price, putWall:pw?.price, zeroGamma:zero?.price, maxPain:pain?.price, arr, total:arr.reduce((a,s)=>a+s.gex,0) };
}

// ════════════════════════════════════
// LOAD OPTIONS
// ════════════════════════════════════
async function loadOptions() {
  try {
    const d = await apiUW(\`stocks/\$\{ST.sym}/options-chain?limit=200\`);
    const opts = d?.data || d?.results || [];
    if (!opts.length) throw new Error('no opts');
    const lv = calcGamma(opts); ST.gex = lv;
    const fp = p => p ? '$'+p.toFixed(0) : '--';
    $('gr', fp(lv.callWall)); $('gs', fp(lv.putWall)); $('gf', fp(lv.zeroGamma)); $('gp', fp(lv.maxPain));
    $('gt', '$'+fv(lv.total)); $('s-gex', '$'+fv(lv.total));
    let tc=0, tp=0, sivSum=0, sivN=0;
    opts.forEach(o => {
      const isC = (o.option_type||o.put_call||'C').toUpperCase().includes('C');
      const oi = parseFloat(o.open_interest||0);
      if (isC) tc+=oi; else tp+=oi;
      const iv = parseFloat(o.implied_volatility||o.iv||0);
      if (iv>0) { sivSum+=iv; sivN++; }
    });
    $('s-poi', fv(tp)); $('s-coi', fv(tc));
    $('oic', fv(tc)); $('oip', fv(tp));
    const pc = tc ? tp/tc : 0;
    $('s-pc', pc.toFixed(2)); $('oipc', pc.toFixed(2));
    $('s-pc2', pc<0.8?'Bullish':pc>1.2?'Bearish':'Neutral');
    $('oisig', pc<0.7?'🟢 صاعد قوي':pc<0.9?'🟡 صاعد':pc<1.1?'⚪ محايد':pc<1.3?'🟠 هابط':'🔴 هابط قوي');
    const avgIV = sivN ? sivSum/sivN : 0;
    if (avgIV > 0) {
      const ivp = (avgIV*100).toFixed(1)+'%';
      $('ivv', ivp);
      const rank = Math.min(100, Math.round(avgIV*180));
      $('ivr', rank+'%');
      $('ivsk', pc>1?'وضعي للبوت':'وضعي للكول');
      $('ivdir', pc<0.9?'ميل نحو الكول':'ميل نحو البوت');
      const ive = document.getElementById('ivsig');
      if (ive) { ive.textContent = rank>75?'تجنب الشراء — IV مرتفع':rank<25?'مناسب للشراء — IV منخفض':'IV متوسط'; ive.style.color = rank>75?'var(--r)':rank<25?'var(--g)':'var(--y)'; }
    }
    const bull = tc > tp;
    $('flsig', bull?'دافع للكول':'دافع للبوت');
    const fse = document.getElementById('flsig');
    if (fse) fse.style.color = bull ? 'var(--g)' : 'var(--r)';
    $('fldesc', bull ? \`Call OI: \$\{fv(tc)} · Put OI: \$\{fv(tp)}\\nالغاما هو المسيطر ومتوافق مع التشارم\` : \`Put OI: \$\{fv(tp)} · Call OI: \$\{fv(tc)}\\nضغط بوت مع تشارم سلبي\`);
    // Flow liq stat
    $('s-liq', '$'+fv(tc+tp));
    $('s-liq2', bull?'Bullish Flow':'Bearish Flow');
    // Active contracts
    if (lv.putWall && lv.callWall) {
      $('acr', \`\$\{lv.putWall.toFixed(0)}-\$\{lv.callWall.toFixed(0)}\`);
      const active = opts.filter(o=>{ const sk=parseFloat(o.strike||o.strike_price||0); return sk>=lv.putWall*.995&&sk<=lv.callWall*1.005; });
      if (active.length) document.getElementById('acc').innerHTML = active.slice(0,10).map(o=>{
        const isC=(o.option_type||o.put_call||'C').toUpperCase().includes('C');
        return \`<div style="display:flex;justify-content:space-between;font-size:.65rem;font-family:var(--mono);padding:2px 0;border-bottom:1px solid var(--bd)"><span style="color:\$\{isC?'var(--g)':'var(--r)'}">\$\{o.strike||o.strike_price||'--'}</span><span class="\$\{isC?'ct':'pt'}">\$\{isC?'C':'P'}</span><span style="color:var(--m2)">\$\{fv(o.open_interest||0)}</span><span style="color:var(--m)">\$\{(o.expiration_date||'').slice(5)||'--'}</span></div>\`;
      }).join('');
    }
    if (ST.candles.length) { drawGamma(lv); drawDelta(lv); }
  } catch(e) { console.log('opts:', e.message); }
}

// ════════════════════════════════════
// LOAD FLOW
// ════════════════════════════════════
async function loadFlow() {
  try {
    const d = await apiUW('option-trades/flow-alerts?limit=25&order=desc');
    const rows = d?.data || d?.results || [];
    if (!rows.length) throw new Error('no flow');
    let cv=0, pv=0;
    const trs = rows.slice(0,18).map(r=>{
      const isC = (r.put_call||r.type||'C').toUpperCase().includes('C');
      const val = parseFloat(r.total_premium||r.premium||0);
      if (isC) cv+=val; else pv+=val;
      return \`<tr><td style="color:var(--m2)">\$\{(r.time||r.created_at||'').slice(0,5)||'--'}</td><td style="font-weight:700">\$\{r.ticker||'--'}</td><td><span class="\$\{isC?'ct':'pt'}">\$\{isC?'C':'P'}</span></td><td>$\$\{r.strike||'--'}</td><td class="\$\{isC?'up':'dn'}" style="font-weight:700">$\$\{fv(val)}</td></tr>\`;
    }).join('');
    document.getElementById('flw').innerHTML = \`<table class="ft"><thead><tr><th>وقت</th><th>رمز</th><th>نوع</th><th>Strike</th><th>قيمة</th></tr></thead><tbody>\$\{trs}</tbody></table>\`;
    const tot=cv+pv, bull=tot?Math.round(cv/tot*100):50;
    const fb=document.getElementById('flb');
    if (fb) { fb.textContent=bull+'% Bull'; fb.style.background=bull>50?'rgba(38,217,127,.12)':'rgba(255,77,106,.12)'; fb.style.color=bull>50?'var(--g)':'var(--r)'; }
  } catch(e) { document.getElementById('flw').innerHTML='<div class="spin" style="color:var(--m)">البيانات تتوفر أثناء التداول</div>'; }
}

// ════════════════════════════════════
// LOAD CHART
// ════════════════════════════════════
async function loadChart() {
  document.getElementById('ld').style.display = 'flex';
  try {
    const d = await apiCandles(ST.sym, ST.interval);
    if (!d.candles?.length) throw new Error('no candles');
    ST.candles = d.candles;
    ST.vs = 0; ST.ve = d.candles.length - 1;
    // Show price from candle data
    const price = d.regularMarketPrice || d.candles[d.candles.length-1].c;
    const prevClose = d.previousClose || d.candles[0].o;
    const chgPct = prevClose ? ((price-prevClose)/prevClose)*100 : 0;
    $('cp', '$'+fmt(price));
    const cc=document.getElementById('cc');
    if(cc){cc.textContent=sgn(chgPct)+Math.abs(chgPct).toFixed(2)+'%';cc.className=cls(chgPct);}
    $('chl', \`H:$\$\{fmt(d.high||price)} L:$\$\{fmt(d.low||price)}\`);
    render();
  } catch(e) { drawDemo(); }
  document.getElementById('ld').style.display = 'none';
}

// ════════════════════════════════════
// RENDER
// ════════════════════════════════════
function render() {
  if (!ST.candles.length) return;
  drawChart();
  if (ST.gex.arr?.length) { drawGamma(ST.gex); drawDelta(ST.gex); }
}

// ════════════════════════════════════
// DRAW CHART (TradingView style)
// ════════════════════════════════════
function drawChart() {
  const cv = document.getElementById('mc');
  const wrap = document.getElementById('cwrap');
  const W = wrap.clientWidth, H = wrap.clientHeight;
  if (!W || !H) return;
  cv.width = W*devicePixelRatio; cv.height = H*devicePixelRatio;
  cv.style.width = W+'px'; cv.style.height = H+'px';
  const ctx = cv.getContext('2d'); ctx.scale(devicePixelRatio, devicePixelRatio);
  const C = ST.candles, vs = Math.max(0,ST.vs), ve = Math.min(C.length-1,ST.ve);
  const vis = C.slice(vs, ve+1);
  if (!vis.length) return;
  const P = {t:18, r:70, b:26, l:4};
  const cW = W-P.l-P.r, cH = H-P.t-P.b;
  const prices = vis.flatMap(c=>[c.h,c.l]).filter(p=>p>0);
  if (!prices.length) return;
  const rawMin=Math.min(...prices), rawMax=Math.max(...prices);
  const pad = (rawMax-rawMin)*0.06 || rawMax*0.005;
  const mn=rawMin-pad, mx=rawMax+pad, pr=mx-mn;
  ST.pMin=mn; ST.pMax=mx;
  const py = p => P.t+cH-((p-mn)/pr)*cH;
  const cx = i => P.l+(i/Math.max(vis.length-1,1))*cW;
  const bW = Math.max(1.2, (cW/vis.length)*0.72);

  // Background
  ctx.fillStyle='#0b0d12'; ctx.fillRect(0,0,W,H);

  // Grid
  ctx.strokeStyle='rgba(255,255,255,.04)'; ctx.lineWidth=1;
  for(let i=0;i<=6;i++){const y=P.t+(cH/6)*i;ctx.beginPath();ctx.moveTo(P.l,y);ctx.lineTo(W-P.r,y);ctx.stroke();}
  const ts = Math.max(1,Math.floor(vis.length/8));
  ctx.strokeStyle='rgba(255,255,255,.03)';
  vis.forEach((_,i)=>{if(i%ts===0){const x=cx(i);ctx.beginPath();ctx.moveTo(x,P.t);ctx.lineTo(x,P.t+cH);ctx.stroke();}});

  // Gamma zones + lines
  const lv = ST.gex;
  const zone=(price,r,g,b)=>{if(!price||price<mn||price>mx)return;const y=py(price);const gr=ctx.createLinearGradient(0,y-60,0,y+60);gr.addColorStop(0,\`rgba(\$\{r},\$\{g},\$\{b},0)\`);gr.addColorStop(.5,\`rgba(\$\{r},\$\{g},\$\{b},.09)\`);gr.addColorStop(1,\`rgba(\$\{r},\$\{g},\$\{b},0)\`);ctx.fillStyle=gr;ctx.fillRect(P.l,y-60,cW,120);};
  const gline=(price,color,lbl)=>{
    if(!price||price<mn||price>mx)return;
    const y=py(price);
    ctx.save();
    ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.setLineDash([6,3]);
    ctx.beginPath();ctx.moveTo(P.l,y);ctx.lineTo(W-P.r,y);ctx.stroke();ctx.setLineDash([]);
    // Zone band
    ctx.fillStyle=color+'12';ctx.fillRect(P.l+3,y-10,cW-6,20);
    // Label on chart
    ctx.fillStyle=color;ctx.font='bold 9px JetBrains Mono,monospace';ctx.textAlign='left';
    ctx.fillText(lbl+' $'+price.toFixed(0),P.l+7,y+3.5);
    // Price tag right axis
    ctx.fillStyle=color;ctx.fillRect(W-P.r+1,y-9,P.r-2,18);
    ctx.fillStyle='#0b0d12';ctx.font='bold 8px JetBrains Mono';ctx.textAlign='center';
    ctx.fillText('$'+price.toFixed(0),W-P.r+(P.r-2)/2,y+3);
    ctx.restore();
  };

  zone(lv?.callWall,38,217,127);
  zone(lv?.putWall,255,77,106);
  zone(lv?.zeroGamma,247,201,72);
  zone(lv?.maxPain,167,139,250);
  gline(lv?.callWall,'#26d97f','مقاومة الغاما');
  gline(lv?.putWall,'#ff4d6a','دعم الغاما');
  gline(lv?.zeroGamma,'#f7c948','نقطة الدوران');
  gline(lv?.maxPain,'#a78bfa','Max Pain');

  // Volume bars
  const maxV = Math.max(...vis.map(c=>c.v||0))||1;
  vis.forEach((c,i)=>{if(!c.v)return;const x=cx(i),bh=(c.v/maxV)*22;ctx.fillStyle=c.c>=c.o?'rgba(38,217,127,.12)':'rgba(255,77,106,.12)';ctx.fillRect(x-bW/2,P.t+cH-bh,bW,bh);});

  // Candles
  vis.forEach((c,i)=>{
    if (!c.o || !c.c) return;
    const x=cx(i),isG=c.c>=c.o,col=isG?'#26d97f':'#ff4d6a';
    ctx.strokeStyle=col;ctx.lineWidth=1;
    if(c.h&&c.l){ctx.beginPath();ctx.moveTo(x,py(c.h));ctx.lineTo(x,py(c.l));ctx.stroke();}
    const bT=py(Math.max(c.o,c.c)),bBot=py(Math.min(c.o,c.c)),bH=Math.max(1,bBot-bT);
    ctx.fillStyle=isG?'rgba(38,217,127,.83)':'rgba(255,77,106,.83)';
    if(bW>=2){ctx.fillRect(x-bW/2,bT,bW,bH);ctx.strokeStyle=col;ctx.lineWidth=.5;ctx.strokeRect(x-bW/2,bT,bW,bH);}
    else{ctx.beginPath();ctx.moveTo(x,bT);ctx.lineTo(x,bBot);ctx.stroke();}
    if(i===ST.hovIdx-vs){ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=1;ctx.strokeRect(x-bW/2-1,bT-1,bW+2,bH+2);}
  });

  // Current price line
  const last=vis[vis.length-1];
  if(last&&last.c){
    const y=py(last.c),col=last.c>=(last.o||last.c)?'#26d97f':'#ff4d6a';
    ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=1;ctx.setLineDash([2,4]);
    ctx.beginPath();ctx.moveTo(P.l,y);ctx.lineTo(W-P.r,y);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=col;ctx.fillRect(W-P.r+1,y-9,P.r-2,18);
    ctx.fillStyle='#0b0d12';ctx.font='bold 9px JetBrains Mono';ctx.textAlign='center';
    ctx.fillText('$'+fmt(last.c),W-P.r+(P.r-2)/2,y+3.5);
  }

  // Price axis
  ctx.fillStyle='rgba(74,85,104,.75)';ctx.font='9px JetBrains Mono';ctx.textAlign='left';
  for(let i=0;i<=6;i++){const price=mx-(pr/6)*i,y=P.t+(cH/6)*i;ctx.fillText('$'+fmt(price),W-P.r+2,y+3);}

  // Time axis
  ctx.textAlign='center';
  vis.forEach((c,i)=>{
    if(i%ts===0&&c.t){
      const d=new Date(c.t);
      const lbl=ST.interval==='1d'||ST.interval==='1wk'?(d.getMonth()+1)+'/'+d.getDate():d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');
      ctx.fillStyle='rgba(74,85,104,.6)';ctx.fillText(lbl,cx(i),P.t+cH+10);
    }
  });

  // Chart label
  ctx.fillStyle='rgba(221,232,245,.4)';ctx.font='bold 10px IBM Plex Sans Arabic';ctx.textAlign='right';
  ctx.fillText(ST.lbl+' · '+ST.interval,W-P.r-5,P.t-5);

  // Setup interaction
  setupInteraction(cv,W,H,P,cW,cH,vis,py,vs);
}

// ════════════════════════════════════
// CHART INTERACTION
// ════════════════════════════════════
function setupInteraction(cv,W,H,P,cW,cH,vis,py,vs){
  const C=ST.candles;
  cv.onmousemove=e=>{
    const rect=cv.getBoundingClientRect(),mx=e.clientX-rect.left,my=e.clientY-rect.top;
    const chx=document.getElementById('chx'),chy=document.getElementById('chy');
    chx.style.display='block';chx.style.left=mx+'px';
    chy.style.display='block';chy.style.top=my+'px';
    const idx=Math.round((mx-P.l)/cW*(vis.length-1));
    if(idx>=0&&idx<vis.length){
      ST.hovIdx=idx+vs;const c=vis[idx];
      if(!c.o)return;
      const isG=c.c>=c.o,chg=c.o?((c.c-c.o)/c.o*100).toFixed(2):0;
      const tt=document.getElementById('tip');tt.style.display='block';
      const tx=(idx/(vis.length-1))*cW+P.l;
      tt.style.left=(tx>W*.62?tx-155:tx+10)+'px';tt.style.top='10px';
      tt.innerHTML=\`<div style="font-weight:700;margin-bottom:4px;color:\$\{isG?'#26d97f':'#ff4d6a'}">\$\{ST.lbl} · \$\{new Date(c.t).toLocaleDateString('ar-SA')}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 8px;font-size:.63rem"><span style="color:var(--m2)">افتتاح</span><span>$\$\{fmt(c.o)}</span><span style="color:var(--m2)">أعلى</span><span style="color:#26d97f">$\$\{fmt(c.h)}</span><span style="color:var(--m2)">أدنى</span><span style="color:#ff4d6a">$\$\{fmt(c.l)}</span><span style="color:var(--m2)">إغلاق</span><span style="font-weight:700">$\$\{fmt(c.c)}</span><span style="color:var(--m2)">تغير</span><span style="color:\$\{isG?'#26d97f':'#ff4d6a'}">\$\{isG?'+':''}\$\{chg}%</span><span style="color:var(--m2)">حجم</span><span>\$\{fv(c.v)}</span></div>\`;
      drawChart();
    }
    if(ST.drag){
      const dx=e.clientX-ST.dragX;
      const cw2=cW/Math.max(vis.length-1,1);
      const shift=Math.round(-dx/cw2);
      const range=ST.ve-ST.vs;
      const ns=Math.max(0,Math.min(C.length-1-range,ST.dragVS+shift));
      ST.vs=ns;ST.ve=Math.min(C.length-1,ns+range);
      render();
    }
  };
  cv.onmousedown=e=>{ST.drag=true;ST.dragX=e.clientX;ST.dragVS=ST.vs;cv.style.cursor='grabbing';};
  cv.onmouseup=()=>{ST.drag=false;cv.style.cursor='crosshair';};
  cv.onmouseleave=()=>{ST.hovIdx=-1;ST.drag=false;document.getElementById('tip').style.display='none';document.getElementById('chx').style.display='none';document.getElementById('chy').style.display='none';cv.style.cursor='crosshair';drawChart();};
  cv.onwheel=e=>{e.preventDefault();const delta=e.deltaY>0?1:-1;const range=ST.ve-ST.vs;const nr=Math.max(20,Math.min(C.length,range+delta*Math.max(1,Math.round(range*.1))));const center=Math.round((ST.vs+ST.ve)/2);ST.vs=Math.max(0,center-Math.floor(nr/2));ST.ve=Math.min(C.length-1,ST.vs+nr);render();};
}

// ════════════════════════════════════
// GAMMA PROFILE (right side)
// ════════════════════════════════════
function drawGamma(lv){
  const cv=document.getElementById('gc');const W=cv.parentElement.clientWidth,H=cv.parentElement.clientHeight;
  if(!W||!H||!lv.arr?.length)return;
  cv.width=W*devicePixelRatio;cv.height=H*devicePixelRatio;cv.style.width=W+'px';cv.style.height=H+'px';
  const ctx=cv.getContext('2d');ctx.scale(devicePixelRatio,devicePixelRatio);
  ctx.fillStyle='#0f1219';ctx.fillRect(0,0,W,H);
  const arr=lv.arr;
  const mn=ST.pMin||Math.min(...arr.map(s=>s.price));
  const mx=ST.pMax||Math.max(...arr.map(s=>s.price));
  const pr=mx-mn||1,PAD={t:18,b:8},cH=H-PAD.t-PAD.b;
  const py=p=>PAD.t+cH-((p-mn)/pr)*cH;
  const maxG=Math.max(...arr.map(s=>Math.abs(s.gex||0)))||1;
  ctx.strokeStyle='rgba(255,255,255,.07)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(W/2,PAD.t);ctx.lineTo(W/2,PAD.t+cH);ctx.stroke();
  const bH=Math.max(1.5,cH/arr.length*.9);
  arr.forEach(s=>{
    if(s.price<mn||s.price>mx)return;
    const y=py(s.price),w=Math.abs(s.gex)/maxG*(W/2-2),pos=s.gex>=0;
    const gr=ctx.createLinearGradient(pos?W/2:W/2-w,0,pos?W/2+w:W/2,0);
    gr.addColorStop(0,pos?'rgba(38,217,127,.15)':'rgba(255,77,106,.7)');
    gr.addColorStop(1,pos?'rgba(38,217,127,.7)':'rgba(255,77,106,.15)');
    ctx.fillStyle=gr;
    if(pos)ctx.fillRect(W/2,y-bH/2,w,bH);else ctx.fillRect(W/2-w,y-bH/2,w,bH);
  });
  [[lv.callWall,'#26d97f'],[lv.putWall,'#ff4d6a'],[lv.zeroGamma,'#f7c948']].forEach(([p,c])=>{
    if(!p||p<mn||p>mx)return;const y=py(p);ctx.strokeStyle=c;ctx.lineWidth=1.2;ctx.setLineDash([3,2]);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();ctx.setLineDash([]);
  });
  ctx.fillStyle='rgba(74,85,104,.55)';ctx.font='7px JetBrains Mono';ctx.textAlign='center';ctx.fillText('غاما',W/2,10);
}

// ════════════════════════════════════
// DELTA PROFILE
// ════════════════════════════════════
function drawDelta(lv){
  const cv=document.getElementById('dc');const W=cv.parentElement.clientWidth,H=cv.parentElement.clientHeight;
  if(!W||!H||!lv.arr?.length)return;
  cv.width=W*devicePixelRatio;cv.height=H*devicePixelRatio;cv.style.width=W+'px';cv.style.height=H+'px';
  const ctx=cv.getContext('2d');ctx.scale(devicePixelRatio,devicePixelRatio);
  ctx.fillStyle='#0f1219';ctx.fillRect(0,0,W,H);
  const arr=lv.arr;
  const mn=ST.pMin||Math.min(...arr.map(s=>s.price));
  const mx=ST.pMax||Math.max(...arr.map(s=>s.price));
  const pr=mx-mn||1,PAD={t:18,b:8},cH=H-PAD.t-PAD.b;
  const py=p=>PAD.t+cH-((p-mn)/pr)*cH;
  const maxD=Math.max(...arr.map(s=>Math.abs(s.delta||0)))||1;
  ctx.strokeStyle='rgba(255,255,255,.07)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(W/2,PAD.t);ctx.lineTo(W/2,PAD.t+cH);ctx.stroke();
  const bH=Math.max(1.5,cH/arr.length*.9);
  arr.forEach(s=>{
    if(s.price<mn||s.price>mx)return;
    const y=py(s.price),w=Math.abs(s.delta||0)/maxD*(W/2-2),pos=(s.delta||0)>=0;
    const gr=ctx.createLinearGradient(pos?W/2:W/2-w,0,pos?W/2+w:W/2,0);
    gr.addColorStop(0,pos?'rgba(79,172,247,.15)':'rgba(251,146,60,.7)');
    gr.addColorStop(1,pos?'rgba(79,172,247,.7)':'rgba(251,146,60,.15)');
    ctx.fillStyle=gr;
    if(pos)ctx.fillRect(W/2,y-bH/2,w,bH);else ctx.fillRect(W/2-w,y-bH/2,w,bH);
  });
  [[lv.callWall,'#26d97f'],[lv.putWall,'#ff4d6a']].forEach(([p,c])=>{
    if(!p||p<mn||p>mx)return;const y=py(p);ctx.strokeStyle=c;ctx.lineWidth=1.2;ctx.setLineDash([3,2]);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();ctx.setLineDash([]);
  });
  ctx.fillStyle='rgba(74,85,104,.55)';ctx.font='7px JetBrains Mono';ctx.textAlign='center';ctx.fillText('دلتا',W/2,10);
}

// ════════════════════════════════════
// CONTROLS
// ════════════════════════════════════
function selTicker(el) {
  ST.sym = el.dataset.s; ST.lbl = el.dataset.l;
  $('clbl', ST.lbl);
  document.querySelectorAll('.tc').forEach(t=>t.classList.toggle('on',t===el));
  const sel=document.getElementById('sym');
  for(let i=0;i<sel.options.length;i++){if(sel.options[i].value===ST.sym){sel.selectedIndex=i;break;}}
  loadChart(); loadOptions();
}
function onSym() {
  const sel=document.getElementById('sym');
  const opt=sel.options[sel.selectedIndex];
  ST.sym=sel.value; ST.lbl=opt.dataset.l||sel.value;
  $('clbl',ST.lbl);
  document.querySelectorAll('.tc').forEach(t=>t.classList.toggle('on',t.dataset.s===ST.sym));
  loadChart(); loadOptions();
}
document.querySelectorAll('.tfb').forEach(b=>{
  b.addEventListener('click',()=>{
    document.querySelectorAll('.tfb').forEach(x=>x.classList.remove('on'));
    b.classList.add('on'); ST.interval=b.dataset.i; loadChart();
  });
});

// ════════════════════════════════════
// DEMO (when market closed)
// ════════════════════════════════════
function drawDemo(){
  let p=540;const now=Date.now();
  const c=Array.from({length:100},(_,i)=>{const chg=(Math.random()-.48)*3;const o=p;p=Math.max(510,Math.min(575,p+chg));return{t:now-(99-i)*300000,o,h:Math.max(o,p)+Math.random()*1.5,l:Math.min(o,p)-Math.random()*1.5,c:p,v:Math.floor(Math.random()*5e7+1e7)};});
  ST.candles=c;ST.vs=0;ST.ve=c.length-1;
  const demo={callWall:555,putWall:525,zeroGamma:540,maxPain:542,arr:Array.from({length:40},(_,i)=>({price:510+i*2,gex:(Math.random()-.44)*1e6,delta:(Math.random()-.4)*5e5}))};
  ST.gex=demo;
  $('gr','$555');$('gs','$525');$('gf','$540');$('gp','$542');
  render();
}

window.addEventListener('resize',()=>{clearTimeout(window._rt);window._rt=setTimeout(()=>{if(ST.candles.length)render();},120);});

// ════════════════════════════════════
// INIT
// ════════════════════════════════════
async function init() {
  await fetchPrices();
  startCountdown();
  await Promise.all([loadChart(), loadOptions(), loadFlow()]);
  setInterval(loadChart, 5*60*1000);
  setInterval(loadOptions, 3*60*1000);
  setInterval(loadFlow, 90*1000);
}
init();
</script>
</body>
</html>
`);}
