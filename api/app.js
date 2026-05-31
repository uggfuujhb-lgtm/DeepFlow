export default function handler(req,res){res.setHeader("Content-Type","text/html; charset=utf-8");res.setHeader("Access-Control-Allow-Origin","*");res.status(200).send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DeepFlow — Gamma/Delta Profile</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--bg:#0a0c10;--bg2:#0e1118;--bg3:#141820;--border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.12);--green:#26d97f;--red:#ff4d6a;--yellow:#f7c948;--blue:#4facf7;--purple:#a78bfa;--text:#e8edf5;--muted:#4a5568;--muted2:#718096;--mono:'JetBrains Mono',monospace;--sans:'IBM Plex Sans Arabic',sans-serif}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;overflow:hidden;background:var(--bg);color:var(--text);font-family:var(--sans)}
.app{display:grid;grid-template-columns:200px 1fr 260px;grid-template-rows:44px 1fr;height:100vh;overflow:hidden}
.topbar{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;padding:0 12px;background:var(--bg2);border-bottom:1px solid var(--border);z-index:100;gap:8px}
.brand{font-size:.95rem;font-weight:700;color:var(--green);display:flex;align-items:center;gap:6px;cursor:pointer;white-space:nowrap}
.brand-dot{width:7px;height:7px;background:var(--green);border-radius:50%;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
.ttabs{display:flex;gap:1px}
.ttab{background:none;border:none;color:var(--muted2);font-family:var(--sans);font-size:.72rem;padding:5px 10px;border-radius:5px;cursor:pointer;transition:all .15s;white-space:nowrap}
.ttab.active,.ttab:hover{background:rgba(38,217,127,.1);color:var(--green)}
.tr{display:flex;align-items:center;gap:7px;flex-shrink:0}
.live-b{display:flex;align-items:center;gap:4px;font-family:var(--mono);font-size:.66rem;color:var(--green);background:rgba(38,217,127,.08);border:1px solid rgba(38,217,127,.2);padding:2px 8px;border-radius:20px}
.ld{width:5px;height:5px;background:var(--green);border-radius:50%;animation:pulse 1.4s infinite}
.mst{font-family:var(--mono);font-size:.65rem;padding:2px 8px;border-radius:20px;white-space:nowrap}
.mst.open{background:rgba(38,217,127,.08);color:var(--green);border:1px solid rgba(38,217,127,.2)}
.mst.closed{background:rgba(255,77,106,.08);color:var(--red);border:1px solid rgba(255,77,106,.2)}
.day-t{font-family:var(--mono);font-size:.63rem;color:var(--muted2);white-space:nowrap}
/* live price blink */
.price-blink{animation:blink-price .3s ease}
@keyframes blink-price{0%,100%{opacity:1}50%{opacity:.3}}

/* SIDEBAR */
.sidebar{background:var(--bg2);border-left:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden}
.sl{padding:11px 13px 8px;border-bottom:1px solid var(--border)}
.user-r{font-size:.68rem;color:var(--yellow);margin-top:3px}
.ns{padding:9px 11px 3px;font-size:.58rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.1em}
.ni{display:flex;align-items:center;gap:7px;padding:6px 11px;margin:1px 4px;border-radius:6px;cursor:pointer;font-size:.74rem;color:var(--muted2);transition:all .14s}
.ni:hover{background:var(--bg3);color:var(--text)}
.ni.active{background:rgba(38,217,127,.1);color:var(--green);border:1px solid rgba(38,217,127,.14)}
.sb-bot{margin-top:auto;border-top:1px solid var(--border);padding:7px}
.sb-btn{display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:.71rem;color:var(--muted2);transition:all .14s}
.sb-btn:hover{background:var(--bg3);color:var(--text)}

/* TICKER STRIP */
.ticker-strip{display:flex;gap:1px;background:var(--border);border-bottom:1px solid var(--border);flex-shrink:0;overflow-x:auto;scrollbar-width:none}
.ticker-strip::-webkit-scrollbar{display:none}
.tc{flex-shrink:0;background:var(--bg2);padding:5px 12px;cursor:pointer;min-width:90px;transition:background .15s;border-bottom:2px solid transparent}
.tc:hover{background:var(--bg3)}
.tc.active{border-bottom-color:var(--green);background:rgba(38,217,127,.05)}
.tc-sym{font-family:var(--mono);font-size:.7rem;font-weight:600;color:var(--muted2)}
.tc-price{font-family:var(--mono);font-size:.82rem;font-weight:700;margin:1px 0}
.tc-chg{font-family:var(--mono);font-size:.6rem}
.up{color:var(--green)}.dn{color:var(--red)}.nt{color:var(--yellow)}

/* CHART TOOLBAR */
.ctbar{display:flex;align-items:center;justify-content:space-between;padding:5px 10px;background:var(--bg2);border-bottom:1px solid var(--border);flex-shrink:0;gap:6px}
.cl{display:flex;align-items:center;gap:5px}
.sym-sel{background:var(--bg3);border:1px solid var(--border2);color:var(--text);font-family:var(--mono);font-size:.74rem;padding:3px 7px;border-radius:5px;outline:none;cursor:pointer}
.sym-sel option,.sym-sel optgroup{background:var(--bg3)}
.tfg{display:flex;gap:1px}
.tf-b{background:none;border:1px solid transparent;color:var(--muted2);font-family:var(--mono);font-size:.67rem;padding:3px 7px;border-radius:4px;cursor:pointer;transition:all .14s}
.tf-b:hover,.tf-b.active{background:rgba(38,217,127,.1);color:var(--green);border-color:rgba(38,217,127,.2)}
.cr{display:flex;align-items:center;gap:7px}

/* CHART */
.chart-area{flex:1;display:grid;grid-template-columns:1fr 80px 70px;overflow:hidden;position:relative;min-height:0}
.chart-wrap{position:relative;overflow:hidden;min-height:0;background:var(--bg)}
#mc{position:absolute;inset:0;width:100%;height:100%}
.gp-w,.dp-w{background:var(--bg2);position:relative;overflow:hidden;border-right:1px solid var(--border)}
.p-lbl{position:absolute;top:4px;right:0;left:0;text-align:center;font-size:.56rem;color:var(--muted);font-family:var(--mono);z-index:2;pointer-events:none}
#chx{position:absolute;top:0;bottom:0;width:1px;background:rgba(255,255,255,.18);display:none;pointer-events:none;z-index:10}
#chy{position:absolute;left:0;right:0;height:1px;background:rgba(255,255,255,.18);display:none;pointer-events:none;z-index:10}
#tip{position:absolute;display:none;background:rgba(10,12,16,.97);border:1px solid rgba(255,255,255,.12);border-radius:7px;padding:8px 11px;font-size:.66rem;font-family:var(--mono);pointer-events:none;z-index:99;min-width:145px;box-shadow:0 8px 24px rgba(0,0,0,.55)}
#ch-ld{position:absolute;inset:0;background:rgba(10,12,16,.88);z-index:20;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:.75rem;gap:6px}
#ch-ld::before{content:'';width:12px;height:12px;border:1.5px solid rgba(79,172,247,.2);border-top-color:var(--blue);border-radius:50%;animation:sp .7s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}

/* INFO */
.info{background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto}
.info::-webkit-scrollbar{width:3px}
.info::-webkit-scrollbar-thumb{background:rgba(255,255,255,.06)}
.ip{border-bottom:1px solid var(--border);padding:8px 10px}
.ip-t{font-size:.6rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center}
.ir{display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;font-size:.68rem}
.il{color:var(--muted2)}
.iv{font-family:var(--mono);font-weight:600}
.gtag{display:inline-block;padding:1px 5px;border-radius:3px;font-size:.59rem;font-weight:700}
.tg{background:rgba(38,217,127,.12);color:var(--green);border:1px solid rgba(38,217,127,.25)}
.tr2{background:rgba(255,77,106,.12);color:var(--red);border:1px solid rgba(255,77,106,.25)}
.ty{background:rgba(247,201,72,.12);color:var(--yellow);border:1px solid rgba(247,201,72,.25)}
.ft{width:100%;border-collapse:collapse;font-size:.65rem}
.ft th{padding:3px 5px;text-align:right;font-size:.56rem;color:var(--muted);text-transform:uppercase;border-bottom:1px solid var(--border)}
.ft td{padding:3px 5px;border-bottom:1px solid rgba(255,255,255,.025);font-family:var(--mono);white-space:nowrap}
.ft tr:hover td{background:rgba(255,255,255,.02)}
.ct{display:inline-block;padding:1px 4px;border-radius:2px;font-size:.56rem;font-weight:700;background:rgba(38,217,127,.12);color:var(--green)}
.pt{display:inline-block;padding:1px 4px;border-radius:2px;font-size:.56rem;font-weight:700;background:rgba(255,77,106,.12);color:var(--red)}
.spin{display:flex;align-items:center;justify-content:center;padding:14px;color:var(--muted);font-size:.7rem;gap:5px}
.spin::before{content:'';width:10px;height:10px;border:1.5px solid rgba(79,172,247,.2);border-top-color:var(--blue);border-radius:50%;animation:sp .7s linear infinite;flex-shrink:0}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,.07)}
.main{display:flex;flex-direction:column;overflow:hidden}
@media(max-width:900px){.app{grid-template-columns:0 1fr 0}.sidebar,.info{display:none}.chart-area{grid-template-columns:1fr 65px 55px}}
</style>
</head>
<body>
<div class="app">

<!-- TOPBAR -->
<div class="topbar">
  <div class="brand"><div class="brand-dot"></div>DeepFlow</div>
  <div class="ttabs">
    <button class="ttab active">رصد الرئيسية</button>
    <button class="ttab">راصد العقود</button>
    <button class="ttab">التحليلات المالية</button>
    <button class="ttab">حاسبة العقود</button>
  </div>
  <div class="tr">
    <div class="live-b"><div class="ld"></div>LIVE <span id="live-sec" style="color:var(--muted2);margin-right:3px">--s</span></div>
    <div class="day-t" id="day-t">--</div>
    <div class="mst closed" id="mst">--</div>
  </div>
</div>

<!-- SIDEBAR -->
<div class="sidebar">
  <div class="sl">
    <div class="brand">⚡ DeepFlow</div>
    <div class="user-r">● أهلاً أحمد</div>
  </div>
  <div class="ns">القائمة</div>
  <div class="ni active">📊 رصد الرئيسية</div>
  <div class="ni">⚡ راصد العقود</div>
  <div class="ni">📈 التحليلات المالية</div>
  <div class="ni">🧮 حاسبة العقود</div>
  <div class="ns">التدفقات</div>
  <div class="ni">🌑 Dark Pool</div>
  <div class="ni">🔔 التنبيهات</div>
  <div class="sb-bot">
    <div class="sb-btn">⚙️ الإعدادات</div>
    <div class="sb-btn">🏷️ الباقات</div>
    <div class="sb-btn">🚪 خروج</div>
  </div>
</div>

<!-- MAIN -->
<div class="main">
  <!-- LIVE TICKER STRIP -->
  <div class="ticker-strip" id="ticker-strip">
    <div class="tc active" data-sym="SPY" onclick="selectTicker('SPY','SPX/SPY')">
      <div class="tc-sym">SPX</div>
      <div class="tc-price" id="tp-SPY">--</div>
      <div class="tc-chg" id="tc-SPY">--</div>
    </div>
    <div class="tc" data-sym="QQQ" onclick="selectTicker('QQQ','NDX/QQQ')">
      <div class="tc-sym">NDX</div>
      <div class="tc-price" id="tp-QQQ">--</div>
      <div class="tc-chg" id="tc-QQQ">--</div>
    </div>
    <div class="tc" data-sym="NVDA" onclick="selectTicker('NVDA','NVDA')">
      <div class="tc-sym">NVDA</div>
      <div class="tc-price" id="tp-NVDA">--</div>
      <div class="tc-chg" id="tc-NVDA">--</div>
    </div>
    <div class="tc" data-sym="AAPL" onclick="selectTicker('AAPL','AAPL')">
      <div class="tc-sym">AAPL</div>
      <div class="tc-price" id="tp-AAPL">--</div>
      <div class="tc-chg" id="tc-AAPL">--</div>
    </div>
    <div class="tc" data-sym="TSLA" onclick="selectTicker('TSLA','TSLA')">
      <div class="tc-sym">TSLA</div>
      <div class="tc-price" id="tp-TSLA">--</div>
      <div class="tc-chg" id="tc-TSLA">--</div>
    </div>
    <div class="tc" data-sym="META" onclick="selectTicker('META','META')">
      <div class="tc-sym">META</div>
      <div class="tc-price" id="tp-META">--</div>
      <div class="tc-chg" id="tc-META">--</div>
    </div>
    <div class="tc" data-sym="MSFT" onclick="selectTicker('MSFT','MSFT')">
      <div class="tc-sym">MSFT</div>
      <div class="tc-price" id="tp-MSFT">--</div>
      <div class="tc-chg" id="tc-MSFT">--</div>
    </div>
    <div class="tc" data-sym="AMZN" onclick="selectTicker('AMZN','AMZN')">
      <div class="tc-sym">AMZN</div>
      <div class="tc-price" id="tp-AMZN">--</div>
      <div class="tc-chg" id="tc-AMZN">--</div>
    </div>
    <div class="tc" data-sym="AMD" onclick="selectTicker('AMD','AMD')">
      <div class="tc-sym">AMD</div>
      <div class="tc-price" id="tp-AMD">--</div>
      <div class="tc-chg" id="tc-AMD">--</div>
    </div>
    <div class="tc" data-sym="GOOGL" onclick="selectTicker('GOOGL','GOOGL')">
      <div class="tc-sym">GOOGL</div>
      <div class="tc-price" id="tp-GOOGL">--</div>
      <div class="tc-chg" id="tc-GOOGL">--</div>
    </div>
  </div>

  <!-- CHART TOOLBAR -->
  <div class="ctbar">
    <div class="cl">
      <select class="sym-sel" id="sym" onchange="onSym()">
        <optgroup label="📊 مؤشرات"><option value="SPY" data-lbl="SPX/SPY">SPX — S&P 500</option><option value="QQQ" data-lbl="NDX/QQQ">NDX — Nasdaq</option><option value="DIA" data-lbl="DJX/DIA">DJX — Dow Jones</option><option value="IWM" data-lbl="RUT/IWM">RUT — Russell</option></optgroup>
        <optgroup label="🏦 ETF"><option value="SPY" data-lbl="SPY">SPY</option><option value="QQQ" data-lbl="QQQ">QQQ</option><option value="IWM" data-lbl="IWM">IWM</option><option value="TLT" data-lbl="TLT">TLT</option><option value="GLD" data-lbl="GLD">GLD</option><option value="SLV" data-lbl="SLV">SLV</option><option value="XLF" data-lbl="XLF">XLF</option><option value="XLE" data-lbl="XLE">XLE</option></optgroup>
        <optgroup label="🏢 شركات"><option value="NVDA" data-lbl="NVDA">NVDA</option><option value="AAPL" data-lbl="AAPL">AAPL</option><option value="TSLA" data-lbl="TSLA">TSLA</option><option value="META" data-lbl="META">META</option><option value="MSFT" data-lbl="MSFT">MSFT</option><option value="AMZN" data-lbl="AMZN">AMZN</option><option value="GOOGL" data-lbl="GOOGL">GOOGL</option><option value="AMD" data-lbl="AMD">AMD</option><option value="PLTR" data-lbl="PLTR">PLTR</option><option value="MSTR" data-lbl="MSTR">MSTR</option></optgroup>
      </select>
      <div class="tfg">
        <button class="tf-b" data-int="1m" data-range="1d">1د</button>
        <button class="tf-b active" data-int="5m" data-range="5d">5د</button>
        <button class="tf-b" data-int="15m" data-range="5d">15د</button>
        <button class="tf-b" data-int="60m" data-range="1mo">1س</button>
        <button class="tf-b" data-int="1d" data-range="1y">1ي</button>
        <button class="tf-b" data-int="1wk" data-range="5y">أسبوعي</button>
      </div>
    </div>
    <div class="cr">
      <div style="display:flex;align-items:baseline;gap:5px">
        <span style="font-family:var(--mono);font-size:.9rem;font-weight:700" id="cur-p">--</span>
        <span style="font-family:var(--mono);font-size:.72rem" id="cur-c">--</span>
      </div>
      <span style="font-family:var(--mono);font-size:.63rem;color:var(--muted2)" id="cur-hl">--</span>
      <span style="font-family:var(--mono);font-size:.6rem;color:var(--muted)" id="ch-lbl">SPX</span>
    </div>
  </div>

  <!-- CHART AREA -->
  <div class="chart-area">
    <div class="chart-wrap" id="chart-wrap">
      <canvas id="mc"></canvas>
      <div id="chx"></div><div id="chy"></div>
      <div id="tip"></div>
      <div id="ch-ld">جاري تحميل الشارت...</div>
    </div>
    <div class="gp-w"><div class="p-lbl">غاما</div><canvas id="gc"></canvas></div>
    <div class="dp-w"><div class="p-lbl">دلتا</div><canvas id="dc"></canvas></div>
  </div>
</div>

<!-- INFO PANEL -->
<div class="info">
  <div class="ip">
    <div class="ip-t"><span>التضخم · IV</span><span style="font-family:var(--mono);font-size:.65rem;color:var(--muted2)" id="iv-t">--</span></div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">
      <div style="font-size:.68rem;font-weight:600" id="iv-sig">--</div>
      <div style="font-family:var(--mono);font-size:1.2rem;font-weight:700;color:var(--yellow)" id="iv-v">--</div>
    </div>
    <div class="ir"><span class="il">IV Rank</span><span class="iv" id="iv-rank">--</span></div>
    <div class="ir"><span class="il">IV/HV</span><span class="iv" id="iv-hv">--</span></div>
    <div class="ir"><span class="il">SKEW 25Δ</span><span class="iv" id="iv-skew">--</span></div>
    <div class="ir"><span class="il">الاتجاه</span><span class="iv" id="iv-dir">--</span></div>
  </div>
  <div class="ip">
    <div class="ip-t">مستويات الغاما</div>
    <div class="ir"><span class="il">مقاومة الغاما</span><span class="gtag tr2" id="g-r">--</span></div>
    <div class="ir"><span class="il">دعم الغاما</span><span class="gtag tg" id="g-s">--</span></div>
    <div class="ir"><span class="il">نقطة الدوران</span><span class="gtag ty" id="g-f">--</span></div>
    <div class="ir"><span class="il">Max Pain</span><span class="iv" style="color:var(--purple)" id="g-p">--</span></div>
    <div class="ir"><span class="il">GEX إجمالي</span><span class="iv up" id="g-tot">--</span></div>
  </div>
  <div class="ip">
    <div class="ip-t">Open Interest</div>
    <div class="ir"><span class="il">Call OI</span><span class="iv up" id="oi-c">--</span></div>
    <div class="ir"><span class="il">Put OI</span><span class="iv dn" id="oi-p">--</span></div>
    <div class="ir"><span class="il">P/C Ratio</span><span class="iv nt" id="oi-pc">--</span></div>
    <div class="ir"><span class="il">الإشارة</span><span class="iv" id="oi-sig">--</span></div>
  </div>
  <div class="ip">
    <div class="ip-t">دمج المشتقات</div>
    <div style="font-size:.8rem;font-weight:700;margin-bottom:3px" id="fl-sig">--</div>
    <div style="font-size:.66rem;color:var(--muted2);line-height:1.5" id="fl-desc">--</div>
  </div>
  <div class="ip">
    <div class="ip-t"><span>ACTIVE CONTRACTS</span><span style="font-family:var(--mono);font-size:.63rem;color:var(--yellow)" id="ac-r">--</span></div>
    <div id="ac-c"><div style="font-size:.68rem;color:var(--muted);text-align:center;padding:8px 0">لا توجد عقود</div></div>
  </div>
  <div class="ip" style="padding-bottom:0"><div class="ip-t"><span>Options Flow</span><span style="font-family:var(--mono);font-size:.6rem;padding:1px 5px;border-radius:3px" id="fl-b">--</span></div></div>
  <div id="fl-w"><div class="spin">جاري التحميل...</div></div>
</div>
</div>

<script>
// ═══════════════════════════════
// APIs
// ═══════════════════════════════
async function uw(path){const r=await fetch('/api/uw?path='+encodeURIComponent(path));if(!r.ok)throw new Error('UW '+r.status);return r.json();}
async function quote(syms){const r=await fetch('/api/quote?symbols='+syms);if(!r.ok)throw new Error('Q '+r.status);return r.json();}
async function candles(sym,interval,range){const r=await fetch(\`/api/candles?sym=\$\{sym}&interval=\$\{interval}&range=\$\{range}\`);if(!r.ok)throw new Error('C '+r.status);return r.json();}

// ═══════════════════════════════
// HELPERS
// ═══════════════════════════════
const fmt=n=>n==null?'--':Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const fv=n=>{if(n==null)return'--';const a=Math.abs(n);if(a>=1e9)return(n/1e9).toFixed(1)+'B';if(a>=1e6)return(n/1e6).toFixed(1)+'M';if(a>=1e3)return(n/1e3).toFixed(0)+'K';return String(Math.round(n))};
const $=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
const cls=v=>v>=0?'up':'dn';
const sgn=v=>v>=0?'▲ +':'▼ ';

// ═══════════════════════════════
// STATE
// ═══════════════════════════════
let S={
  sym:'SPY',lbl:'SPX/SPY',
  interval:'5m',range:'5d',
  candles:[],gex:{},
  hovIdx:-1,pMin:0,pMax:0,
  viewStart:0,viewEnd:0,
  dragging:false,dragStartX:0,dragStartView:0,
  lastPrices:{},liveTimer:null,countdown:15
};
const TICKER_SYMS=['SPY','QQQ','NVDA','AAPL','TSLA','META','MSFT','AMZN','AMD','GOOGL'];

// ═══════════════════════════════
// CLOCK
// ═══════════════════════════════
function tick(){
  const et=new Date(new Date().toLocaleString('en-US',{timeZone:'America/New_York'}));
  const h=et.getHours(),m=et.getMinutes(),wd=et.getDay();
  const open=wd>=1&&wd<=5&&(h>9||(h===9&&m>=30))&&h<16;
  const ts=\`\$\{String(h%12||12).padStart(2,'0')}:\$\{String(m).padStart(2,'0')} \$\{h>=12?'PM':'AM'}\`;
  $('mst',open?'السوق مفتوح':'السوق مغلق');
  document.getElementById('mst').className='mst '+(open?'open':'closed');
  const dy=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const mn2=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  $('day-t',\`\$\{dy[et.getDay()]} \$\{et.getDate()} \$\{mn2[et.getMonth()]}\`);
  $('iv-t',ts);
}
setInterval(tick,1000);tick();

// ═══════════════════════════════
// LIVE PRICES (Yahoo Finance)
// ═══════════════════════════════
async function fetchLivePrices(){
  try{
    const d=await quote(TICKER_SYMS.join(','));
    const results=d?.quoteResponse?.result||[];
    results.forEach(q=>{
      const sym=q.symbol;
      const price=q.regularMarketPrice;
      const chgPct=q.regularMarketChangePercent;
      const chg=q.regularMarketChange;
      const old=S.lastPrices[sym];
      S.lastPrices[sym]={price,chgPct,chg,high:q.regularMarketDayHigh,low:q.regularMarketDayLow,vol:q.regularMarketVolume};

      // Update ticker strip
      const tp=document.getElementById('tp-'+sym);
      const tc=document.getElementById('tc-'+sym);
      if(tp){
        const c=cls(chgPct);
        // Blink if price changed
        if(old&&old.price!==price){tp.classList.add('price-blink');setTimeout(()=>tp.classList.remove('price-blink'),300);}
        tp.textContent='$'+fmt(price);
        tp.className='tc-price '+(chgPct>=0?'up':'dn');
      }
      if(tc){
        tc.textContent=sgn(chgPct)+Math.abs(chgPct).toFixed(2)+'%';
        tc.className='tc-chg '+(chgPct>=0?'up':'dn');
      }

      // Update main price display if this is selected sym
      if(sym===S.sym){
        $('cur-p','$'+fmt(price));
        const ce=document.getElementById('cur-c');
        if(ce){ce.textContent=sgn(chgPct)+Math.abs(chgPct).toFixed(2)+'%';ce.className=cls(chgPct);}
        $('cur-hl',\`H:$\$\{fmt(q.regularMarketDayHigh)} L:$\$\{fmt(q.regularMarketDayLow)}\`);
        // Update last candle price live
        if(S.candles.length){
          S.candles[S.candles.length-1].c=price;
          if(price>S.candles[S.candles.length-1].h)S.candles[S.candles.length-1].h=price;
          if(price<S.candles[S.candles.length-1].l)S.candles[S.candles.length-1].l=price;
          drawChart();
        }
      }
    });
  }catch(e){console.log('live price err:',e.message);}
}

// Countdown timer for live update
function startLiveTimer(){
  clearInterval(S.liveTimer);
  S.countdown=15;
  $('live-sec','15s');
  S.liveTimer=setInterval(()=>{
    S.countdown--;
    $('live-sec',S.countdown+'s');
    if(S.countdown<=0){
      S.countdown=15;
      fetchLivePrices();
    }
  },1000);
}

// ═══════════════════════════════
// TICKER CLICK
// ═══════════════════════════════
function selectTicker(sym,lbl){
  S.sym=sym;S.lbl=lbl;
  $('ch-lbl',lbl);
  // Update select
  const sel=document.getElementById('sym');
  for(let i=0;i<sel.options.length;i++){if(sel.options[i].value===sym){sel.selectedIndex=i;break;}}
  // Update active ticker
  document.querySelectorAll('.tc').forEach(t=>{t.classList.toggle('active',t.dataset.sym===sym);});
  loadChart();
  loadOptions();
}

// ═══════════════════════════════
// SYMBOL / TF CHANGE
// ═══════════════════════════════
function onSym(){
  const sel=document.getElementById('sym');
  const opt=sel.options[sel.selectedIndex];
  S.sym=sel.value;
  S.lbl=opt.dataset.lbl||sel.value;
  $('ch-lbl',S.lbl);
  document.querySelectorAll('.tc').forEach(t=>{t.classList.toggle('active',t.dataset.sym===S.sym);});
  loadChart();loadOptions();
}
document.querySelectorAll('.tf-b').forEach(b=>{
  b.addEventListener('click',()=>{
    document.querySelectorAll('.tf-b').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    S.interval=b.dataset.int;S.range=b.dataset.range;
    loadChart();
  });
});

// ═══════════════════════════════
// GAMMA CALC
// ═══════════════════════════════
function calcGamma(opts){
  const st={};
  opts.forEach(o=>{
    const sk=parseFloat(o.strike||o.strike_price||0);if(!sk)return;
    const oi=parseFloat(o.open_interest||o.oi||0);
    const gm=parseFloat(o.gamma||o.greeks?.gamma||0.01);
    const dl=Math.abs(parseFloat(o.delta||o.greeks?.delta||0.5));
    const isC=(o.option_type||o.put_call||'C').toUpperCase().includes('C');
    if(!st[sk])st[sk]={call:0,put:0,cdelta:0,pdelta:0,price:sk,coi:0,poi:0};
    const gex=oi*gm*100;
    if(isC){st[sk].call+=gex;st[sk].cdelta+=oi*dl;st[sk].coi+=oi;}
    else{st[sk].put+=gex;st[sk].pdelta+=oi*dl;st[sk].poi+=oi;}
  });
  const arr=Object.values(st).sort((a,b)=>a.price-b.price).map(s=>({...s,gex:s.call-s.put,delta:s.cdelta-s.pdelta}));
  if(!arr.length)return{arr:[],callWall:null,putWall:null,zeroGamma:null,maxPain:null,total:0};
  const cw=arr.filter(s=>s.gex>0).sort((a,b)=>b.gex-a.gex)[0];
  const pw=arr.filter(s=>s.gex<0).sort((a,b)=>a.gex-b.gex)[0];
  const zero=arr.reduce((b,s)=>Math.abs(s.gex)<Math.abs(b?.gex??Infinity)?s:b,arr[0]);
  const pain=arr.reduce((b,s)=>(s.coi+s.poi)>(b.coi+b.poi)?s:b,arr[0]);
  return{callWall:cw?.price,putWall:pw?.price,zeroGamma:zero?.price,maxPain:pain?.price,arr,total:arr.reduce((a,s)=>a+s.gex,0)};
}

// ═══════════════════════════════
// LOAD OPTIONS
// ═══════════════════════════════
async function loadOptions(){
  try{
    const d=await uw(\`stocks/\$\{S.sym}/options-chain?limit=200\`);
    const opts=d?.data||d?.results||[];
    if(!opts.length)throw new Error('no opts');
    const lv=calcGamma(opts);S.gex=lv;
    const fp=p=>p?'$'+p.toFixed(0):'--';
    $('g-r',fp(lv.callWall));$('g-s',fp(lv.putWall));$('g-f',fp(lv.zeroGamma));$('g-p',fp(lv.maxPain));$('g-tot','$'+fv(lv.total));
    let totalC=0,totalP=0,sumIV=0,ivN=0;
    opts.forEach(o=>{
      const isC=(o.option_type||o.put_call||'C').toUpperCase().includes('C');
      const oi=parseFloat(o.open_interest||0);
      if(isC)totalC+=oi;else totalP+=oi;
      const iv=parseFloat(o.implied_volatility||o.iv||0);
      if(iv>0){sumIV+=iv;ivN++;}
    });
    $('oi-c',fv(totalC));$('oi-p',fv(totalP));
    const pc=totalC?totalP/totalC:0;
    $('oi-pc',pc.toFixed(2));
    $('oi-sig',pc<0.7?'🟢 صاعد قوي':pc<0.9?'🟡 صاعد':pc<1.1?'⚪ محايد':pc<1.3?'🟠 هابط':'🔴 هابط قوي');
    const avgIV=ivN?sumIV/ivN:0;
    if(avgIV>0){
      $('iv-v',(avgIV*100).toFixed(1)+'%');
      const rank=Math.min(100,Math.round(avgIV*180));
      $('iv-rank',rank+'%');$('iv-hv',(avgIV/Math.max(0.01,avgIV*.72)).toFixed(2)+'x');
      $('iv-skew',pc>1?'وضعي للبوت':'وضعي للكول');$('iv-dir',pc<0.9?'ميل نحو الكول':'ميل نحو البوت');
      const ivEl=document.getElementById('iv-sig');
      if(ivEl){ivEl.textContent=rank>75?'تجنب الشراء — IV مرتفع':rank<25?'مناسب للشراء — IV منخفض':'IV متوسط';ivEl.style.color=rank>75?'var(--red)':rank<25?'var(--green)':'var(--yellow)';}
    }
    const bull=totalC>totalP;
    $('fl-sig',bull?'دافع للكول':'دافع للبوت');
    const fse=document.getElementById('fl-sig');if(fse)fse.style.color=bull?'var(--green)':'var(--red)';
    $('fl-desc',bull?\`Call OI: \$\{fv(totalC)} · Put OI: \$\{fv(totalP)}\\nالغاما متوافق مع التشارم\`:\`Put OI: \$\{fv(totalP)} · Call OI: \$\{fv(totalC)}\\nضغط بوت مع تشارم سلبي\`);
    if(lv.putWall&&lv.callWall){
      $('ac-r',\`\$\{lv.putWall.toFixed(0)}-\$\{lv.callWall.toFixed(0)}\`);
      const active=opts.filter(o=>{const sk=parseFloat(o.strike||o.strike_price||0);return sk>=lv.putWall*.995&&sk<=lv.callWall*1.005;});
      if(active.length)document.getElementById('ac-c').innerHTML=active.slice(0,10).map(o=>{const isC=(o.option_type||o.put_call||'C').toUpperCase().includes('C');return\`<div style="display:flex;justify-content:space-between;font-size:.65rem;font-family:var(--mono);padding:2px 0;border-bottom:1px solid var(--border)"><span style="color:\$\{isC?'var(--green)':'var(--red)'}">\$\{o.strike||o.strike_price||'--'}</span><span class="\$\{isC?'ct':'pt'}">\$\{isC?'C':'P'}</span><span style="color:var(--muted2)">\$\{fv(o.open_interest||0)}</span><span style="color:var(--muted)">\$\{(o.expiration_date||'').slice(5)||'--'}</span></div>\`;}).join('');
    }
    if(S.candles.length){drawGamma(lv);drawDelta(lv);}
  }catch(e){console.log('opts:',e.message);}
}

// ═══════════════════════════════
// LOAD FLOW
// ═══════════════════════════════
async function loadFlow(){
  try{
    const d=await uw('option-trades/flow-alerts?limit=25&order=desc');
    const rows=d?.data||d?.results||[];
    if(!rows.length)throw new Error('no flow');
    let cv=0,pv=0;
    const trs=rows.slice(0,16).map(r=>{
      const isC=(r.put_call||r.type||'C').toUpperCase().includes('C');
      const val=parseFloat(r.total_premium||r.premium||0);
      if(isC)cv+=val;else pv+=val;
      return\`<tr><td style="color:var(--muted2)">\$\{(r.time||r.created_at||'').slice(0,5)||'--'}</td><td style="font-weight:700">\$\{r.ticker||'--'}</td><td><span class="\$\{isC?'ct':'pt'}">\$\{isC?'C':'P'}</span></td><td>$\$\{r.strike||'--'}</td><td class="\$\{isC?'up':'dn'}" style="font-weight:700">$\$\{fv(val)}</td></tr>\`;
    }).join('');
    document.getElementById('fl-w').innerHTML=\`<table class="ft"><thead><tr><th>وقت</th><th>رمز</th><th>نوع</th><th>Strike</th><th>قيمة</th></tr></thead><tbody>\$\{trs}</tbody></table>\`;
    const tot=cv+pv,bull=tot?Math.round(cv/tot*100):50;
    const fb=document.getElementById('fl-b');
    if(fb){fb.textContent=bull+'% Bull';fb.style.background=bull>50?'rgba(38,217,127,.12)':'rgba(255,77,106,.12)';fb.style.color=bull>50?'var(--green)':'var(--red)';}
  }catch(e){document.getElementById('fl-w').innerHTML='<div class="spin" style="color:var(--muted)">البيانات أثناء التداول</div>';}
}

// ═══════════════════════════════
// LOAD CHART (Yahoo Finance)
// ═══════════════════════════════
async function loadChart(){
  document.getElementById('ch-ld').style.display='flex';
  try{
    const d=await candles(S.sym,S.interval,S.range);
    if(!d.candles?.length)throw new Error('no candles');
    S.candles=d.candles;
    S.viewStart=0;S.viewEnd=d.candles.length-1;
    // Update price from Yahoo meta (most accurate)
    const price=d.regularMarketPrice;
    const prevClose=d.previousClose;
    if(price&&prevClose){
      const chgPct=((price-prevClose)/prevClose)*100;
      $('cur-p','$'+fmt(price));
      const ce=document.getElementById('cur-c');
      if(ce){ce.textContent=sgn(chgPct)+Math.abs(chgPct).toFixed(2)+'%';ce.className=cls(chgPct);}
    }
    render();
  }catch(e){
    drawDemo();
  }
  document.getElementById('ch-ld').style.display='none';
}

// ═══════════════════════════════
// RENDER
// ═══════════════════════════════
function render(){
  if(!S.candles.length)return;
  drawChart();
  if(S.gex.arr?.length){drawGamma(S.gex);drawDelta(S.gex);}
}

// ═══════════════════════════════
// DRAW CHART
// ═══════════════════════════════
function drawChart(){
  const cv=document.getElementById('mc');
  const wrap=document.getElementById('chart-wrap');
  const W=wrap.clientWidth,H=wrap.clientHeight;
  if(!W||!H)return;
  cv.width=W*devicePixelRatio;cv.height=H*devicePixelRatio;
  cv.style.width=W+'px';cv.style.height=H+'px';
  const ctx=cv.getContext('2d');ctx.scale(devicePixelRatio,devicePixelRatio);
  const candles=S.candles;
  const vs=Math.max(0,S.viewStart),ve=Math.min(candles.length-1,S.viewEnd);
  const visible=candles.slice(vs,ve+1);
  if(!visible.length)return;
  const P={t:20,r:68,b:28,l:6};
  const cW=W-P.l-P.r,cH=H-P.t-P.b;
  const prices=visible.flatMap(c=>[c.h,c.l]).filter(p=>p!=null&&!isNaN(p));
  if(!prices.length)return;
  const rawMin=Math.min(...prices),rawMax=Math.max(...prices);
  const pad=(rawMax-rawMin)*0.06||rawMax*0.01;
  const mn=rawMin-pad,mx=rawMax+pad,pr=mx-mn;
  S.pMin=mn;S.pMax=mx;
  const py=p=>P.t+cH-((p-mn)/pr)*cH;
  const cx=i=>P.l+(i/Math.max(visible.length-1,1))*cW;
  const bW=Math.max(1,(cW/visible.length)*.72);
  ctx.fillStyle='#0a0c10';ctx.fillRect(0,0,W,H);
  // Grid
  ctx.strokeStyle='rgba(255,255,255,.04)';ctx.lineWidth=1;
  for(let i=0;i<=6;i++){const y=P.t+(cH/6)*i;ctx.beginPath();ctx.moveTo(P.l,y);ctx.lineTo(W-P.r,y);ctx.stroke();}
  const ts=Math.max(1,Math.floor(visible.length/8));
  ctx.strokeStyle='rgba(255,255,255,.03)';
  visible.forEach((_,i)=>{if(i%ts===0){const x=cx(i);ctx.beginPath();ctx.moveTo(x,P.t);ctx.lineTo(x,P.t+cH);ctx.stroke();}});
  // Gamma
  const lv=S.gex;
  const zone=(price,r,g,b)=>{if(!price||price<mn||price>mx)return;const y=py(price);const gr=ctx.createLinearGradient(0,y-60,0,y+60);gr.addColorStop(0,\`rgba(\$\{r},\$\{g},\$\{b},0)\`);gr.addColorStop(.5,\`rgba(\$\{r},\$\{g},\$\{b},.09)\`);gr.addColorStop(1,\`rgba(\$\{r},\$\{g},\$\{b},0)\`);ctx.fillStyle=gr;ctx.fillRect(P.l,y-60,cW,120);};
  const gline=(price,color,lbl)=>{if(!price||price<mn||price>mx)return;const y=py(price);ctx.save();ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.setLineDash([6,3]);ctx.beginPath();ctx.moveTo(P.l,y);ctx.lineTo(W-P.r,y);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=color+'15';ctx.fillRect(P.l+3,y-9,cW-6,18);ctx.fillStyle=color;ctx.font='bold 9px JetBrains Mono';ctx.textAlign='left';ctx.fillText(lbl+' $'+price.toFixed(0),P.l+7,y+3.5);ctx.fillStyle=color;ctx.fillRect(W-P.r+1,y-9,P.r-2,18);ctx.fillStyle='#0a0c10';ctx.font='bold 8px JetBrains Mono';ctx.textAlign='center';ctx.fillText('$'+price.toFixed(0),W-P.r+P.r/2,y+3);ctx.restore();};
  zone(lv?.callWall,38,217,127);zone(lv?.putWall,255,77,106);zone(lv?.zeroGamma,247,201,72);zone(lv?.maxPain,167,139,250);
  gline(lv?.callWall,'#26d97f','مقاومة الغاما');gline(lv?.putWall,'#ff4d6a','دعم الغاما');gline(lv?.zeroGamma,'#f7c948','نقطة الدوران');gline(lv?.maxPain,'#a78bfa','Max Pain');
  // Volume
  const maxV=Math.max(...visible.map(c=>c.v||0))||1;
  visible.forEach((c,i)=>{if(c.v==null)return;const x=cx(i),bh=(c.v||0)/maxV*22;ctx.fillStyle=c.c>=c.o?'rgba(38,217,127,.12)':'rgba(255,77,106,.12)';ctx.fillRect(x-bW/2,P.t+cH-bh,bW,bh);});
  // Candles
  visible.forEach((c,i)=>{
    if(c.o==null||c.c==null)return;
    const x=cx(i),isG=c.c>=c.o,col=isG?'#26d97f':'#ff4d6a';
    ctx.strokeStyle=col;ctx.lineWidth=1;
    if(c.h!=null&&c.l!=null){ctx.beginPath();ctx.moveTo(x,py(c.h));ctx.lineTo(x,py(c.l));ctx.stroke();}
    const bT=py(Math.max(c.o,c.c)),bBot=py(Math.min(c.o,c.c)),bH=Math.max(1,bBot-bT);
    ctx.fillStyle=isG?'rgba(38,217,127,.85)':'rgba(255,77,106,.85)';
    if(bW>=2){ctx.fillRect(x-bW/2,bT,bW,bH);ctx.strokeStyle=col;ctx.lineWidth=.5;ctx.strokeRect(x-bW/2,bT,bW,bH);}
    else{ctx.beginPath();ctx.moveTo(x,bT);ctx.lineTo(x,bBot);ctx.stroke();}
    if(i===S.hovIdx-vs){ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=1;ctx.strokeRect(x-bW/2-1,bT-1,bW+2,bH+2);}
  });
  // Current price line
  const last=visible[visible.length-1];
  if(last&&last.c!=null){
    const y=py(last.c),col=last.c>=(last.o||last.c)?'#26d97f':'#ff4d6a';
    ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=1;ctx.setLineDash([2,4]);
    ctx.beginPath();ctx.moveTo(P.l,y);ctx.lineTo(W-P.r,y);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=col;ctx.fillRect(W-P.r+1,y-9,P.r-2,18);
    ctx.fillStyle='#0a0c10';ctx.font='bold 9px JetBrains Mono';ctx.textAlign='center';
    ctx.fillText('$'+fmt(last.c),W-P.r+(P.r-2)/2,y+3.5);
  }
  // Price axis
  ctx.fillStyle='rgba(74,85,104,.75)';ctx.font='9px JetBrains Mono';ctx.textAlign='left';
  for(let i=0;i<=6;i++){const price=mx-(pr/6)*i;const y=P.t+(cH/6)*i;ctx.fillText('$'+fmt(price),W-P.r+2,y+3);}
  // Time axis
  ctx.textAlign='center';
  visible.forEach((c,i)=>{
    if(i%ts===0&&c.t){
      const d=new Date(c.t);
      const lbl=S.interval.includes('d')||S.interval.includes('wk')?(d.getMonth()+1)+'/'+d.getDate():d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');
      ctx.fillStyle='rgba(74,85,104,.65)';ctx.fillText(lbl,cx(i),P.t+cH+11);
    }
  });
  // Title
  ctx.fillStyle='rgba(221,232,245,.45)';ctx.font='bold 10px IBM Plex Sans Arabic';ctx.textAlign='right';
  ctx.fillText(S.lbl+' · '+S.interval,W-P.r-5,P.t-6);
  // Interaction
  setupInteraction(cv,W,H,P,cW,cH,visible,py,vs);
}

// ═══════════════════════════════
// INTERACTION
// ═══════════════════════════════
function setupInteraction(cv,W,H,P,cW,cH,visible,py,vs){
  const candles=S.candles;
  cv.onmousemove=e=>{
    const rect=cv.getBoundingClientRect();
    const mx=e.clientX-rect.left,my=e.clientY-rect.top;
    const chx=document.getElementById('chx'),chy=document.getElementById('chy');
    chx.style.display='block';chy.style.display='block';
    chx.style.left=mx+'px';chy.style.top=my+'px';
    const idx=Math.round((mx-P.l)/cW*(visible.length-1));
    if(idx>=0&&idx<visible.length){
      S.hovIdx=idx+vs;const c=visible[idx];
      if(c.o==null)return;
      const isG=c.c>=c.o,chg=c.o?((c.c-c.o)/c.o*100).toFixed(2):0;
      const tt=document.getElementById('tip');tt.style.display='block';
      const tx=(idx/(visible.length-1))*cW+P.l;
      tt.style.left=(tx>W*.6?tx-158:tx+10)+'px';tt.style.top='10px';
      tt.innerHTML=\`<div style="font-weight:700;margin-bottom:4px;color:\$\{isG?'#26d97f':'#ff4d6a'}">\$\{S.lbl} · \$\{new Date(c.t).toLocaleDateString('ar-SA')}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 8px;font-size:.64rem"><span style="color:var(--muted2)">افتتاح</span><span>$\$\{fmt(c.o)}</span><span style="color:var(--muted2)">أعلى</span><span style="color:#26d97f">$\$\{fmt(c.h)}</span><span style="color:var(--muted2)">أدنى</span><span style="color:#ff4d6a">$\$\{fmt(c.l)}</span><span style="color:var(--muted2)">إغلاق</span><span style="font-weight:700">$\$\{fmt(c.c)}</span><span style="color:var(--muted2)">تغير</span><span style="color:\$\{isG?'#26d97f':'#ff4d6a'}">\$\{isG?'+':''}\$\{chg}%</span><span style="color:var(--muted2)">حجم</span><span>\$\{fv(c.v)}</span></div>\`;
      drawChart();
    }
    if(S.dragging){
      const dx=e.clientX-S.dragStartX;
      const cw2=cW/Math.max(visible.length-1,1);
      const shift=Math.round(-dx/cw2);
      const range=S.viewEnd-S.viewStart;
      const ns=Math.max(0,Math.min(candles.length-1-range,S.dragStartView+shift));
      S.viewStart=ns;S.viewEnd=Math.min(candles.length-1,ns+range);
      render();
    }
  };
  cv.onmousedown=e=>{S.dragging=true;S.dragStartX=e.clientX;S.dragStartView=S.viewStart;cv.style.cursor='grabbing';};
  cv.onmouseup=()=>{S.dragging=false;cv.style.cursor='crosshair';};
  cv.onmouseleave=()=>{S.hovIdx=-1;S.dragging=false;document.getElementById('tip').style.display='none';document.getElementById('chx').style.display='none';document.getElementById('chy').style.display='none';cv.style.cursor='crosshair';drawChart();};
  cv.style.cursor='crosshair';
  cv.onwheel=e=>{e.preventDefault();const delta=e.deltaY>0?1:-1;const range=S.viewEnd-S.viewStart;const nr=Math.max(20,Math.min(candles.length,range+delta*Math.max(1,Math.round(range*.1))));const center=Math.round((S.viewStart+S.viewEnd)/2);S.viewStart=Math.max(0,center-Math.floor(nr/2));S.viewEnd=Math.min(candles.length-1,S.viewStart+nr);render();};
}

// ═══════════════════════════════
// GAMMA PROFILE
// ═══════════════════════════════
function drawGamma(lv){
  const cv=document.getElementById('gc');const W=cv.parentElement.clientWidth,H=cv.parentElement.clientHeight;
  if(!W||!H||!lv.arr?.length)return;
  cv.width=W*devicePixelRatio;cv.height=H*devicePixelRatio;cv.style.width=W+'px';cv.style.height=H+'px';
  const ctx=cv.getContext('2d');ctx.scale(devicePixelRatio,devicePixelRatio);
  ctx.fillStyle='#0e1118';ctx.fillRect(0,0,W,H);
  const arr=lv.arr,mn=S.pMin||Math.min(...arr.map(s=>s.price)),mx=S.pMax||Math.max(...arr.map(s=>s.price));
  const pr=mx-mn||1,PAD={t:18,b:8},cH=H-PAD.t-PAD.b;
  const py=p=>PAD.t+cH-((p-mn)/pr)*cH;
  const maxG=Math.max(...arr.map(s=>Math.abs(s.gex||0)))||1;
  ctx.strokeStyle='rgba(255,255,255,.07)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(W/2,PAD.t);ctx.lineTo(W/2,PAD.t+cH);ctx.stroke();
  const bH=Math.max(1.5,cH/arr.length*.9);
  arr.forEach(s=>{if(s.price<mn||s.price>mx)return;const y=py(s.price),w=Math.abs(s.gex)/maxG*(W/2-2),pos=s.gex>=0;const gr=ctx.createLinearGradient(pos?W/2:W/2-w,0,pos?W/2+w:W/2,0);gr.addColorStop(0,pos?'rgba(38,217,127,.15)':'rgba(255,77,106,.7)');gr.addColorStop(1,pos?'rgba(38,217,127,.7)':'rgba(255,77,106,.15)');ctx.fillStyle=gr;if(pos)ctx.fillRect(W/2,y-bH/2,w,bH);else ctx.fillRect(W/2-w,y-bH/2,w,bH);});
  [[lv.callWall,'#26d97f'],[lv.putWall,'#ff4d6a'],[lv.zeroGamma,'#f7c948']].forEach(([p,c])=>{if(!p||p<mn||p>mx)return;const y=py(p);ctx.strokeStyle=c;ctx.lineWidth=1.2;ctx.setLineDash([3,2]);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();ctx.setLineDash([]);});
  ctx.fillStyle='rgba(74,85,104,.6)';ctx.font='7px JetBrains Mono';ctx.textAlign='center';ctx.fillText('غاما',W/2,10);
}

// ═══════════════════════════════
// DELTA PROFILE
// ═══════════════════════════════
function drawDelta(lv){
  const cv=document.getElementById('dc');const W=cv.parentElement.clientWidth,H=cv.parentElement.clientHeight;
  if(!W||!H||!lv.arr?.length)return;
  cv.width=W*devicePixelRatio;cv.height=H*devicePixelRatio;cv.style.width=W+'px';cv.style.height=H+'px';
  const ctx=cv.getContext('2d');ctx.scale(devicePixelRatio,devicePixelRatio);
  ctx.fillStyle='#0e1118';ctx.fillRect(0,0,W,H);
  const arr=lv.arr,mn=S.pMin||Math.min(...arr.map(s=>s.price)),mx=S.pMax||Math.max(...arr.map(s=>s.price));
  const pr=mx-mn||1,PAD={t:18,b:8},cH=H-PAD.t-PAD.b;
  const py=p=>PAD.t+cH-((p-mn)/pr)*cH;
  const maxD=Math.max(...arr.map(s=>Math.abs(s.delta||0)))||1;
  ctx.strokeStyle='rgba(255,255,255,.07)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(W/2,PAD.t);ctx.lineTo(W/2,PAD.t+cH);ctx.stroke();
  const bH=Math.max(1.5,cH/arr.length*.9);
  arr.forEach(s=>{if(s.price<mn||s.price>mx)return;const y=py(s.price),w=Math.abs(s.delta||0)/maxD*(W/2-2),pos=(s.delta||0)>=0;const gr=ctx.createLinearGradient(pos?W/2:W/2-w,0,pos?W/2+w:W/2,0);gr.addColorStop(0,pos?'rgba(79,172,247,.15)':'rgba(251,146,60,.7)');gr.addColorStop(1,pos?'rgba(79,172,247,.7)':'rgba(251,146,60,.15)');ctx.fillStyle=gr;if(pos)ctx.fillRect(W/2,y-bH/2,w,bH);else ctx.fillRect(W/2-w,y-bH/2,w,bH);});
  [[lv.callWall,'#26d97f'],[lv.putWall,'#ff4d6a']].forEach(([p,c])=>{if(!p||p<mn||p>mx)return;const y=py(p);ctx.strokeStyle=c;ctx.lineWidth=1.2;ctx.setLineDash([3,2]);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();ctx.setLineDash([]);});
  ctx.fillStyle='rgba(74,85,104,.6)';ctx.font='7px JetBrains Mono';ctx.textAlign='center';ctx.fillText('دلتا',W/2,10);
}

// ═══════════════════════════════
// DEMO
// ═══════════════════════════════
function drawDemo(){
  let p=540;const now=Date.now();
  const c=Array.from({length:100},(_,i)=>{const chg=(Math.random()-.48)*3;const o=p;p=Math.max(510,Math.min(575,p+chg));return{t:now-(99-i)*300000,o,h:Math.max(o,p)+Math.random()*1.5,l:Math.min(o,p)-Math.random()*1.5,c:p,v:Math.floor(Math.random()*5e7+1e7)};});
  S.candles=c;S.viewStart=0;S.viewEnd=c.length-1;
  const demo={callWall:555,putWall:525,zeroGamma:540,maxPain:542,arr:Array.from({length:40},(_,i)=>({price:510+i*2,gex:(Math.random()-.44)*1e6,delta:(Math.random()-.4)*5e5}))};
  S.gex=demo;render();
}

// ═══════════════════════════════
// RESIZE
// ═══════════════════════════════
window.addEventListener('resize',()=>{clearTimeout(window._rt);window._rt=setTimeout(()=>{if(S.candles.length)render();},120);});

// ═══════════════════════════════
// INIT
// ═══════════════════════════════
async function init(){
  await fetchLivePrices();
  startLiveTimer();
  await Promise.all([loadChart(),loadOptions(),loadFlow()]);
  // Refresh candles every 5 minutes
  setInterval(loadChart,5*60*1000);
  setInterval(loadOptions,3*60*1000);
  setInterval(loadFlow,90*1000);
}
init();
</script>
</body>
</html>
`);}
