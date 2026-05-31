export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>راصد — تحليل سوق الخيارات الأمريكي</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--bg:#040810;--bg2:#070d1b;--bg3:#0b1323;--border:rgba(79,172,247,0.1);--border2:rgba(79,172,247,0.22);--blue:#4facf7;--blue2:#2d8cf0;--green:#22d3a0;--red:#f7566a;--yellow:#f7c948;--purple:#a78bfa;--orange:#fb923c;--text:#dde8f8;--muted:#5c7399;--muted2:#8aa3c5;--mono:'JetBrains Mono',monospace;--sans:'IBM Plex Sans Arabic',sans-serif}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:var(--sans);min-height:100vh;overflow-x:hidden}
body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(79,172,247,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(79,172,247,0.025) 1px,transparent 1px);background-size:48px 48px;pointer-events:none;z-index:0}
.topbar{position:sticky;top:0;z-index:200;height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;background:rgba(4,8,16,0.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
.logo{display:flex;align-items:center;gap:9px;font-size:1.1rem;font-weight:700;color:var(--blue);cursor:pointer}
.logo-box{width:28px;height:28px;background:linear-gradient(135deg,var(--blue2),var(--purple));border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:.8rem}
.topbar-center{display:flex;gap:1px;overflow-x:auto;scrollbar-width:none}
.topbar-center::-webkit-scrollbar{display:none}
.tab-btn{background:none;border:none;color:var(--muted);font-family:var(--sans);font-size:.78rem;font-weight:500;padding:5px 11px;border-radius:6px;cursor:pointer;transition:all .2s;white-space:nowrap}
.tab-btn:hover,.tab-btn.active{background:rgba(79,172,247,0.1);color:var(--blue)}
.topbar-right{display:flex;align-items:center;gap:7px;flex-shrink:0}
.live-pill{display:flex;align-items:center;gap:5px;font-family:var(--mono);font-size:.68rem;color:var(--green);background:rgba(34,211,160,0.08);border:1px solid rgba(34,211,160,0.2);padding:3px 8px;border-radius:20px}
.live-dot{width:5px;height:5px;background:var(--green);border-radius:50%;animation:blink 1.4s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
.mst{font-family:var(--mono);font-size:.68rem;padding:3px 8px;border-radius:20px}
.mst.open{background:rgba(34,211,160,0.08);color:var(--green);border:1px solid rgba(34,211,160,0.2)}
.mst.closed{background:rgba(247,86,106,0.08);color:var(--red);border:1px solid rgba(247,86,106,0.2)}
.day-lbl{font-family:var(--mono);font-size:.67rem;color:var(--muted);white-space:nowrap}
.section{position:relative;z-index:1;display:none;padding:13px 16px;max-width:1700px;margin:0 auto}
.section.active{display:block}
.tstrip{display:flex;gap:7px;overflow-x:auto;padding-bottom:2px;margin:11px 0;scrollbar-width:none}
.tstrip::-webkit-scrollbar{display:none}
.tc{flex-shrink:0;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:8px 12px;min-width:95px;cursor:pointer;transition:all .2s}
.tc:hover{border-color:var(--border2);transform:translateY(-1px)}
.tc.sel{border-color:var(--blue);background:rgba(79,172,247,0.07)}
.tc-sym{font-family:var(--mono);font-size:.78rem;font-weight:600;margin-bottom:2px}
.tc-price{font-family:var(--mono);font-size:.92rem;font-weight:700}
.tc-chg{font-family:var(--mono);font-size:.63rem;margin-top:1px}
.up{color:var(--green)}.down{color:var(--red)}
.g2{display:grid;grid-template-columns:1.6fr 1fr;gap:12px;margin-bottom:12px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:12px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:12px}
.gf{margin-bottom:12px}
.card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;overflow:hidden;animation:fu .3s ease both}
.card:hover{border-color:var(--border2)}
@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.ch{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--border)}
.ct{font-size:.72rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.07em}
.cb{padding:12px 14px}
.badge{font-family:var(--mono);font-size:.66rem;font-weight:700;padding:2px 7px;border-radius:4px}
.bg{background:rgba(34,211,160,0.1);color:var(--green);border:1px solid rgba(34,211,160,0.2)}
.br{background:rgba(247,86,106,0.1);color:var(--red);border:1px solid rgba(247,86,106,0.2)}
.bb{background:rgba(79,172,247,0.1);color:var(--blue);border:1px solid rgba(79,172,247,0.2)}
.by{background:rgba(247,201,72,0.1);color:var(--yellow);border:1px solid rgba(247,201,72,0.2)}
.bp{background:rgba(167,139,250,0.1);color:var(--purple);border:1px solid rgba(167,139,250,0.2)}
.bignum{font-family:var(--mono);font-size:1.8rem;font-weight:700;line-height:1;margin-bottom:4px}
.sublabel{font-size:.7rem;color:var(--muted)}
.sb{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}
.sbox{background:var(--bg3);border:1px solid var(--border);border-radius:7px;padding:7px 10px;flex:1;min-width:70px}
.sbox-l{font-size:.62rem;color:var(--muted);margin-bottom:2px}
.sbox-v{font-family:var(--mono);font-size:.83rem;font-weight:700}
.ft{width:100%;border-collapse:collapse}
.ft th{padding:7px 8px;text-align:right;font-size:.63rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid var(--border);white-space:nowrap}
.ft td{padding:7px 8px;border-bottom:1px solid rgba(79,172,247,0.05);font-family:var(--mono);font-size:.72rem;white-space:nowrap}
.ft tr:hover td{background:rgba(79,172,247,0.04)}
.ft tr:last-child td{border-bottom:none}
.ct-tag{display:inline-block;padding:1px 6px;border-radius:3px;font-size:.63rem;font-weight:700;background:rgba(34,211,160,0.12);color:var(--green);border:1px solid rgba(34,211,160,0.25)}
.pt-tag{display:inline-block;padding:1px 6px;border-radius:3px;font-size:.63rem;font-weight:700;background:rgba(247,86,106,0.12);color:var(--red);border:1px solid rgba(247,86,106,0.25)}
.spin{display:flex;align-items:center;justify-content:center;padding:26px;color:var(--muted);font-size:.8rem;gap:8px}
.spin::before{content:'';width:14px;height:14px;border:2px solid rgba(79,172,247,0.2);border-top-color:var(--blue);border-radius:50%;animation:sp .7s linear infinite;flex-shrink:0}
@keyframes sp{to{transform:rotate(360deg)}}
.ebox{background:rgba(247,86,106,0.07);border:1px solid rgba(247,86,106,0.2);border-radius:8px;padding:10px 13px;font-size:.75rem;color:var(--red);margin:10px 14px}
.tf-btn{background:rgba(79,172,247,0.07);border:1px solid var(--border);color:var(--muted);font-family:var(--mono);font-size:.7rem;padding:4px 9px;border-radius:5px;cursor:pointer;transition:all .2s}
.tf-btn:hover,.tf-btn.active{background:rgba(79,172,247,0.15);color:var(--blue);border-color:var(--blue)}
.hmap{display:grid;grid-template-columns:repeat(5,1fr);gap:5px}
.hcell{border-radius:7px;padding:9px 4px;text-align:center;cursor:pointer;transition:transform .15s}
.hcell:hover{transform:scale(1.06)}
.hcell-sym{font-family:var(--mono);font-weight:700;font-size:.68rem;margin-bottom:2px}
.hcell-pct{font-family:var(--mono);font-size:.62rem;font-weight:600}
footer{position:relative;z-index:1;text-align:center;padding:13px;color:var(--muted);font-size:.67rem;border-top:1px solid var(--border);margin-top:4px;line-height:1.8}
@media(max-width:1000px){.g4{grid-template-columns:1fr 1fr}.g2{grid-template-columns:1fr}}
@media(max-width:600px){.g3,.g4{grid-template-columns:1fr}.topbar-center{display:none}.hmap{grid-template-columns:repeat(4,1fr)}}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-thumb{background:rgba(79,172,247,0.15);border-radius:3px}
</style>
</head>
<body>

<nav class="topbar">
  <div class="logo" onclick="show('home')"><div class="logo-box">⚡</div>راصد</div>
  <div class="topbar-center">
    <button class="tab-btn active" onclick="show('home')">الرئيسية</button>
    <button class="tab-btn" onclick="show('flow')">⚡ Flow</button>
    <button class="tab-btn" onclick="show('darkpool')">🌑 Dark Pool</button>
    <button class="tab-btn" onclick="show('gex')">📊 GEX</button>
    <button class="tab-btn" onclick="show('chart')">🕯️ الشارت</button>
    <button class="tab-btn" onclick="show('news')">📰 أخبار</button>
  </div>
  <div class="topbar-right">
    <div class="live-pill"><div class="live-dot"></div><span id="clk">--:--</span></div>
    <div class="day-lbl" id="day-lbl">--</div>
    <div class="mst closed" id="mst">--</div>
  </div>
</nav>

<!-- HOME -->
<div class="section active" id="sec-home">
  <div class="tstrip">
    <div class="tc sel"><div class="tc-sym">SPY</div><div class="tc-price" id="p-SPY">--</div><div class="tc-chg" id="c-SPY">--</div></div>
    <div class="tc"><div class="tc-sym">QQQ</div><div class="tc-price" id="p-QQQ">--</div><div class="tc-chg" id="c-QQQ">--</div></div>
    <div class="tc"><div class="tc-sym">NVDA</div><div class="tc-price" id="p-NVDA">--</div><div class="tc-chg" id="c-NVDA">--</div></div>
    <div class="tc"><div class="tc-sym">AAPL</div><div class="tc-price" id="p-AAPL">--</div><div class="tc-chg" id="c-AAPL">--</div></div>
    <div class="tc"><div class="tc-sym">TSLA</div><div class="tc-price" id="p-TSLA">--</div><div class="tc-chg" id="c-TSLA">--</div></div>
    <div class="tc"><div class="tc-sym">META</div><div class="tc-price" id="p-META">--</div><div class="tc-chg" id="c-META">--</div></div>
    <div class="tc"><div class="tc-sym">MSFT</div><div class="tc-price" id="p-MSFT">--</div><div class="tc-chg" id="c-MSFT">--</div></div>
    <div class="tc"><div class="tc-sym">AMZN</div><div class="tc-price" id="p-AMZN">--</div><div class="tc-chg" id="c-AMZN">--</div></div>
  </div>
  <div class="g4">
    <div class="card"><div class="ch"><div class="ct">⚡ Flow</div><span class="badge bg" id="h-flow-b">--</span></div><div class="cb"><div class="bignum up" id="h-flow">--</div><div class="sublabel">إجمالي Options Flow</div><div class="sb"><div class="sbox"><div class="sbox-l">CALL</div><div class="sbox-v up" id="h-call">--</div></div><div class="sbox"><div class="sbox-l">PUT</div><div class="sbox-v down" id="h-put">--</div></div></div></div></div>
    <div class="card"><div class="ch"><div class="ct">🌑 Dark Pool</div><span class="badge bp" id="h-dp-b">--</span></div><div class="cb"><div class="bignum" style="color:var(--purple)" id="h-dp">--</div><div class="sublabel">صفقات مؤسسية</div><div class="sb"><div class="sbox"><div class="sbox-l">أكبر صفقة</div><div class="sbox-v" id="h-dpbig">--</div></div><div class="sbox"><div class="sbox-l">عدد</div><div class="sbox-v" id="h-dpct">--</div></div></div></div></div>
    <div class="card"><div class="ch"><div class="ct">P/C Ratio</div><span class="badge by" id="h-pc-b">--</span></div><div class="cb"><div class="bignum" style="color:var(--yellow)" id="h-pc">--</div><div class="sublabel">نسبة Put/Call</div><div class="sb"><div class="sbox"><div class="sbox-l">Call Vol</div><div class="sbox-v up" id="h-cv">--</div></div><div class="sbox"><div class="sbox-l">Put Vol</div><div class="sbox-v down" id="h-pv">--</div></div></div></div></div>
    <div class="card"><div class="ch"><div class="ct">📊 GEX</div><span class="badge bb" id="h-gex-b">--</span></div><div class="cb"><div class="bignum" style="color:var(--blue)" id="h-gex">--</div><div class="sublabel">Gamma Exposure</div><div class="sb"><div class="sbox"><div class="sbox-l">Call Wall</div><div class="sbox-v up" id="h-cw">--</div></div><div class="sbox"><div class="sbox-l">Put Wall</div><div class="sbox-v down" id="h-pw">--</div></div></div></div></div>
  </div>
  <div class="g2">
    <div class="card"><div class="ch"><div class="ct">⚡ Options Flow المباشر</div><span class="badge bg" id="h-ft">جاري التحميل</span></div><div id="h-flow-tbl"><div class="spin">جاري تحميل Flow...</div></div></div>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="card"><div class="ch"><div class="ct">📊 مستويات GEX</div></div><div class="cb" id="h-gex-lvl"><div class="spin">جاري التحميل...</div></div></div>
      <div class="card"><div class="ch"><div class="ct">🌑 Dark Pool</div></div><div class="cb" id="h-dp-list"><div class="spin">جاري التحميل...</div></div></div>
    </div>
  </div>
  <div class="card gf"><div class="ch"><div class="ct">🗺️ خريطة الحرارة</div><span class="badge bb">S&P 500</span></div><div class="cb"><div class="hmap" id="hmap"><div class="spin" style="grid-column:1/-1">جاري التحميل...</div></div></div></div>
</div>

<!-- FLOW -->
<div class="section" id="sec-flow">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;margin-top:11px;flex-wrap:wrap;gap:7px">
    <h2 style="font-size:.92rem;font-weight:600">⚡ Options Flow — Unusual Whales</h2>
    <div style="display:flex;gap:5px;flex-wrap:wrap">
      <select id="fl-sym" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);font-family:var(--mono);font-size:.73rem;padding:4px 8px;border-radius:7px;outline:none"><option value="">الكل</option><option>SPY</option><option>QQQ</option><option>NVDA</option><option>AAPL</option><option>TSLA</option></select>
      <button onclick="loadFlow()" style="background:rgba(79,172,247,0.1);border:1px solid rgba(79,172,247,0.2);color:var(--blue);font-family:var(--sans);font-size:.73rem;padding:4px 11px;border-radius:7px;cursor:pointer">تحديث</button>
    </div>
  </div>
  <div class="g3"><div class="card"><div class="ch"><div class="ct">Call Flow</div></div><div class="cb"><div class="bignum up" id="f-call">--</div><div class="sublabel">إجمالي CALL</div></div></div><div class="card"><div class="ch"><div class="ct">Put Flow</div></div><div class="cb"><div class="bignum down" id="f-put">--</div><div class="sublabel">إجمالي PUT</div></div></div><div class="card"><div class="ch"><div class="ct">Bullish %</div></div><div class="cb"><div class="bignum" style="color:var(--yellow)" id="f-bull">--</div><div class="sublabel">نسبة الاتجاه الصاعد</div></div></div></div>
  <div class="card gf"><div class="ch"><div class="ct">جميع صفقات Options Flow</div><span class="badge bg" id="f-cnt">--</span></div><div id="flow-tbl"><div class="spin">جاري التحميل...</div></div></div>
</div>

<!-- DARK POOL -->
<div class="section" id="sec-darkpool">
  <div style="margin-bottom:12px;margin-top:11px"><h2 style="font-size:.92rem;font-weight:600">🌑 Dark Pool — Unusual Whales</h2></div>
  <div class="g4"><div class="card"><div class="ch"><div class="ct">إجمالي اليوم</div></div><div class="cb"><div class="bignum" style="color:var(--purple)" id="dp-1">--</div><div class="sublabel">قيمة Dark Pool</div></div></div><div class="card"><div class="ch"><div class="ct">عدد الصفقات</div></div><div class="cb"><div class="bignum" style="color:var(--blue)" id="dp-2">--</div><div class="sublabel">صفقة مؤسسية</div></div></div><div class="card"><div class="ch"><div class="ct">أكبر صفقة</div></div><div class="cb"><div class="bignum up" id="dp-3">--</div><div class="sublabel">أعلى صفقة فردية</div></div></div><div class="card"><div class="ch"><div class="ct">نسبة Dark</div></div><div class="cb"><div class="bignum" style="color:var(--yellow)" id="dp-4">~62%</div><div class="sublabel">من إجمالي الحجم</div></div></div></div>
  <div class="card gf"><div class="ch"><div class="ct">🌑 جميع صفقات Dark Pool</div></div><div id="dp-tbl"><div class="spin">جاري التحميل...</div></div></div>
</div>

<!-- GEX -->
<div class="section" id="sec-gex">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;margin-top:11px;flex-wrap:wrap;gap:7px">
    <h2 style="font-size:.92rem;font-weight:600">📊 GEX — Gamma Exposure</h2>
    <select id="gex-sym" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);font-family:var(--mono);font-size:.73rem;padding:4px 8px;border-radius:7px;outline:none" onchange="loadGEX()"><option>SPY</option><option>QQQ</option><option>NVDA</option><option>AAPL</option><option>TSLA</option></select>
  </div>
  <div class="g4"><div class="card"><div class="ch"><div class="ct">GEX الإجمالي</div></div><div class="cb"><div class="bignum up" id="g-tot">--</div><div class="sublabel">Gamma Exposure</div></div></div><div class="card"><div class="ch"><div class="ct">Call Wall</div><span class="badge bg">مقاومة</span></div><div class="cb"><div class="bignum up" id="g-cw">--</div><div class="sublabel">أقوى جدار Call</div></div></div><div class="card"><div class="ch"><div class="ct">Put Wall</div><span class="badge br">دعم</span></div><div class="cb"><div class="bignum down" id="g-pw">--</div><div class="sublabel">أقوى جدار Put</div></div></div><div class="card"><div class="ch"><div class="ct">Zero Gamma</div><span class="badge by">محور</span></div><div class="cb"><div class="bignum" style="color:var(--yellow)" id="g-zero">--</div><div class="sublabel">فوقه مستقر</div></div></div></div>
  <div class="card gf"><div class="ch"><div class="ct">GEX Profile — Unusual Whales</div><span class="badge bb" id="gex-lbl">SPY</span></div><div style="position:relative;min-height:300px"><canvas id="gex-cv" style="width:100%;display:block"></canvas><div id="gex-ld" class="spin" style="position:absolute;inset:0">جاري التحميل...</div></div></div>
</div>

<!-- CHART -->
<div class="section" id="sec-chart">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;margin-top:11px;flex-wrap:wrap;gap:7px">
    <h2 style="font-size:.92rem;font-weight:600">🕯️ شارت الشموع + مناطق Gamma</h2>
    <div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap">
      <select id="ch-sym" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);font-family:var(--mono);font-size:.73rem;padding:4px 8px;border-radius:7px;outline:none"><option>SPY</option><option>QQQ</option><option>NVDA</option><option>AAPL</option><option>TSLA</option><option>META</option></select>
      <div style="display:flex;gap:3px"><button class="tf-btn active" data-tf="D">يومي</button><button class="tf-btn" data-tf="60">1س</button><button class="tf-btn" data-tf="15">15د</button><button class="tf-btn" data-tf="5">5د</button></div>
      <button onclick="loadChart()" style="background:rgba(79,172,247,0.1);border:1px solid rgba(79,172,247,0.2);color:var(--blue);font-family:var(--sans);font-size:.73rem;padding:4px 11px;border-radius:7px;cursor:pointer">تحديث</button>
      <span class="badge bb" id="ch-st">--</span>
    </div>
  </div>
  <div class="g4"><div class="card"><div class="ch"><div class="ct">Call Wall</div><span class="badge bg"></span></div><div class="cb"><div class="bignum up" id="ch-cw">--</div></div></div><div class="card"><div class="ch"><div class="ct">Put Wall</div><span class="badge br"></span></div><div class="cb"><div class="bignum down" id="ch-pw">--</div></div></div><div class="card"><div class="ch"><div class="ct">Zero Gamma</div><span class="badge by"></span></div><div class="cb"><div class="bignum" style="color:var(--yellow)" id="ch-zero">--</div></div></div><div class="card"><div class="ch"><div class="ct">Max Pain</div><span class="badge bp"></span></div><div class="cb"><div class="bignum" style="color:var(--purple)" id="ch-pain">--</div></div></div></div>
  <div class="card gf">
    <div class="ch"><div class="ct">شمعدان + مناطق Gamma</div><div style="display:flex;gap:8px;font-size:.65rem;flex-wrap:wrap"><span><span style="width:9px;height:3px;background:#22d3a0;display:inline-block;border-radius:2px;vertical-align:middle;margin-left:3px"></span>Call</span><span><span style="width:9px;height:3px;background:#f7566a;display:inline-block;border-radius:2px;vertical-align:middle;margin-left:3px"></span>Put</span><span><span style="width:9px;height:3px;background:#f7c948;display:inline-block;border-radius:2px;vertical-align:middle;margin-left:3px"></span>Zero</span><span><span style="width:9px;height:3px;background:#a78bfa;display:inline-block;border-radius:2px;vertical-align:middle;margin-left:3px"></span>Pain</span></div></div>
    <div style="position:relative;min-height:370px"><canvas id="ch-cv" style="width:100%;display:block"></canvas><div id="ch-ld" class="spin" style="position:absolute;inset:0">جاري تحميل الشارت...</div><div id="ch-tip" style="position:absolute;display:none;background:rgba(4,8,16,.97);border:1px solid var(--border2);border-radius:8px;padding:9px 12px;font-size:.68rem;font-family:var(--mono);pointer-events:none;z-index:99;min-width:155px"></div></div>
  </div>
</div>

<!-- NEWS -->
<div class="section" id="sec-news">
  <div style="margin-bottom:12px;margin-top:11px"><h2 style="font-size:.92rem;font-weight:600">📰 أخبار السوق</h2></div>
  <div class="card gf"><div class="ch"><div class="ct">أحدث الأخبار</div><span class="badge bg">محدث</span></div><div id="news-c"><div class="spin">جاري التحميل...</div></div></div>
</div>

<footer>⚡ راصد · بيانات Unusual Whales + Massive API · للأغراض التعليمية فقط · 2026</footer>

<script>
// ── API via Vercel proxy ──
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

// ── Helpers ──
const fmt = n => n==null?'--':Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtV = n => {if(n==null)return'--';const a=Math.abs(n);if(a>=1e9)return(n/1e9).toFixed(1)+'B';if(a>=1e6)return(n/1e6).toFixed(1)+'M';if(a>=1e3)return(n/1e3).toFixed(0)+'K';return String(Math.round(n))};
const cls = v => v>=0?'up':'down';
const sign = v => v>=0?'▲ +':'▼ ';
let hovIdx=-1, gexLevels={}, chartTF='D';

// ── Last trading day ──
function getLastTradingDay() {
  const et = new Date(new Date().toLocaleString('en-US',{timeZone:'America/New_York'}));
  const h=et.getHours(), m=et.getMinutes(), wd=et.getDay();
  const marketOpen = wd>=1&&wd<=5&&(h>9||(h===9&&m>=30))&&h<16;
  if(marketOpen) return et.toISOString().split('T')[0];
  const d = new Date(et);
  for(let i=0;i<7;i++){
    d.setDate(d.getDate()-1);
    const dw=d.getDay();
    if(dw>=1&&dw<=5) break;
  }
  return d.toISOString().split('T')[0];
}
function getFromDate(daysBack) {
  const d=new Date(getLastTradingDay());
  d.setDate(d.getDate()-daysBack);
  return d.toISOString().split('T')[0];
}
function dayLabel() {
  const d=new Date(getLastTradingDay());
  const days=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const months=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  return \`\${days[d.getDay()]} \${d.getDate()} \${months[d.getMonth()]}\`;
}

// ── Clock ──
function tick(){
  const now=new Date();
  document.getElementById('clk').textContent=now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',timeZone:'America/New_York'})+' ET';
  const et=new Date(now.toLocaleString('en-US',{timeZone:'America/New_York'}));
  const h=et.getHours(),m=et.getMinutes(),wd=et.getDay();
  const open=wd>=1&&wd<=5&&(h>9||(h===9&&m>=30))&&h<16;
  const el=document.getElementById('mst');
  el.textContent=open?'السوق مفتوح':'السوق مغلق';
  el.className='mst '+(open?'open':'closed');
  document.getElementById('day-lbl').textContent='بيانات '+dayLabel();
}
setInterval(tick,1000);tick();

// ── Section switching ──
function show(id){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.getElementById('sec-'+id).classList.add('active');
  window.scrollTo(0,0);
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  const map={home:0,flow:1,darkpool:2,gex:3,chart:4,news:5};
  document.querySelectorAll('.topbar-center .tab-btn')[map[id]]?.classList.add('active');
  if(id==='flow') loadFlow();
  if(id==='darkpool') loadDarkPool();
  if(id==='gex') loadGEX();
  if(id==='chart') loadChart();
  if(id==='news') loadNews();
}

// ── Options Flow ──
async function loadFlow(){
  const sym=document.getElementById('fl-sym')?.value||'';
  let path='option-trades/flow-alerts?limit=50&order=desc';
  if(sym) path+='&ticker='+sym;
  try{
    const d=await uwGet(path);
    const rows=d?.data||d?.results||[];
    if(!rows.length) throw new Error('لا توجد بيانات');
    let cV=0,pV=0;
    const trs=rows.slice(0,40).map(r=>{
      const isC=(r.put_call||r.type||'C').toUpperCase().includes('C');
      const val=parseFloat(r.total_premium||r.premium||r.value||0);
      if(isC)cV+=val;else pV+=val;
      const bull=(r.sentiment||r.aggressor_ind||'').toLowerCase().includes('bull')||r.aggressor_ind==='A';
      return\`<tr><td style="color:var(--muted);font-size:.62rem">\${(r.time||r.created_at||'').slice(0,5)||'--'}</td><td style="font-weight:700">\${r.ticker||'--'}</td><td><span class="\${isC?'ct-tag':'pt-tag'}">\${isC?'CALL':'PUT'}</span></td><td>$\${r.strike||r.strike_price||'--'}</td><td>\${r.expiry||r.expiration_date||'--'}</td><td>\${fmtV(r.volume||r.size)}</td><td>\${fmtV(r.open_interest||r.oi)}</td><td class="\${isC?'up':'down'}" style="font-weight:700">$\${fmtV(val)}</td><td><span class="badge \${bull?'bg':'br'}">\${bull?'صاعد':'هابط'}</span></td></tr>\`;
    }).join('');
    const html=\`<div style="overflow-x:auto"><table class="ft"><thead><tr><th>الوقت</th><th>الرمز</th><th>نوع</th><th>Strike</th><th>Expiry</th><th>الحجم</th><th>OI</th><th>القيمة</th><th>الاتجاه</th></tr></thead><tbody>\${trs}</tbody></table></div>\`;
    ['h-flow-tbl','flow-tbl'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=html;});
    const tot=cV+pV,pct=tot?Math.round(cV/tot*100):50;
    const s=id=>{const el=document.getElementById(id);return el};
    if(s('h-flow'))s('h-flow').textContent='$'+fmtV(tot);
    if(s('h-call'))s('h-call').textContent='$'+fmtV(cV);
    if(s('h-put'))s('h-put').textContent='$'+fmtV(pV);
    if(s('h-flow-b'))s('h-flow-b').textContent=pct+'% Bull';
    if(s('h-ft'))s('h-ft').textContent='UW ✓ '+dayLabel();
    if(s('f-call'))s('f-call').textContent='$'+fmtV(cV);
    if(s('f-put'))s('f-put').textContent='$'+fmtV(pV);
    if(s('f-bull'))s('f-bull').textContent=pct+'%';
    if(s('f-cnt'))s('f-cnt').textContent=rows.length+' صفقة';
    if(s('h-cv'))s('h-cv').textContent=fmtV(rows.filter(r=>(r.put_call||'C').toUpperCase().includes('C')).length);
    if(s('h-pv'))s('h-pv').textContent=fmtV(rows.filter(r=>(r.put_call||'').toUpperCase().includes('P')).length);
    const pcr=pV&&cV?(pV/cV).toFixed(2):'--';
    if(s('h-pc'))s('h-pc').textContent=pcr;
    if(s('h-pc-b'))s('h-pc-b').textContent=parseFloat(pcr)<1?'Bullish':'Bearish';
  }catch(e){
    const msg=\`<div class="ebox">⚠️ \${e.message} · عرض آخر بيانات \${dayLabel()}</div>\`;
    ['h-flow-tbl','flow-tbl'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=msg;});
  }
}

// ── Dark Pool ──
async function loadDarkPool(){
  try{
    const d=await uwGet('darkpool/recent?limit=50');
    const rows=d?.data||d?.results||[];
    if(!rows.length) throw new Error('لا توجد بيانات');
    let tot=0,big=0;
    const trs=rows.slice(0,30).map(r=>{
      const val=parseFloat(r.total_value||r.value||r.size||0);
      tot+=val;if(val>big)big=val;
      const bull=(r.sentiment||'').toLowerCase().includes('bull');
      return\`<tr><td style="color:var(--muted);font-size:.62rem">\${(r.time||r.executed_at||'').slice(0,5)||'--'}</td><td style="font-weight:700;color:\${bull?'var(--green)':'var(--red)'}">\${r.ticker||r.symbol||'--'}</td><td>$\${fmt(r.price||r.executed_price)}</td><td>\${fmtV(r.size||r.shares)}</td><td class="\${bull?'up':'down'}" style="font-weight:700">$\${fmtV(val)}</td><td><span class="badge bp">\${r.dark_pool_pct||r.dark_pct||'--'}%</span></td><td><span class="badge \${bull?'bg':'br'}">\${bull?'↑ شراء':'↓ بيع'}</span></td></tr>\`;
    }).join('');
    const html=\`<div style="overflow-x:auto"><table class="ft"><thead><tr><th>الوقت</th><th>الرمز</th><th>السعر</th><th>الحجم</th><th>القيمة</th><th>% Dark</th><th>الاتجاه</th></tr></thead><tbody>\${trs}</tbody></table></div>\`;
    ['h-dp-list','dp-tbl'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=html;});
    const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v};
    set('h-dp','$'+fmtV(tot));set('h-dpbig','$'+fmtV(big));set('h-dpct',rows.length);
    set('h-dp-b',rows.length+' صفقة');set('dp-1','$'+fmtV(tot));set('dp-2',rows.length);set('dp-3','$'+fmtV(big));
  }catch(e){
    const msg=\`<div class="ebox">⚠️ \${e.message}</div>\`;
    ['h-dp-list','dp-tbl'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=msg;});
  }
}

// ── GEX ──
function calcGEX(opts){
  const st={};
  opts.forEach(o=>{
    const sk=parseFloat(o.strike||o.strike_price||0);
    const oi=parseFloat(o.open_interest||o.oi||0);
    const gm=parseFloat(o.gamma||o.greeks?.gamma||0.015);
    const isC=(o.option_type||o.put_call||'C').toUpperCase().includes('C');
    if(!st[sk])st[sk]={call:0,put:0,price:sk};
    const gex=oi*gm*100;
    if(isC)st[sk].call+=gex;else st[sk].put+=gex;
  });
  const arr=Object.values(st).sort((a,b)=>a.price-b.price).map(s=>({...s,gex:s.call-s.put}));
  const maxG=Math.max(...arr.map(s=>Math.abs(s.gex)));
  const cw=arr.filter(s=>s.gex>0).sort((a,b)=>b.gex-a.gex)[0];
  const pw=arr.filter(s=>s.gex<0).sort((a,b)=>a.gex-b.gex)[0];
  const zero=arr.find(s=>Math.abs(s.gex)<maxG*0.06);
  const pain=arr.reduce((b,s)=>Math.abs(s.gex)>Math.abs(b?.gex||0)?s:b,arr[0]);
  return{callWall:cw?.price,putWall:pw?.price,zeroGamma:zero?.price,maxPain:pain?.price,arr,total:arr.reduce((a,s)=>a+s.gex,0)};
}

async function loadGEX(){
  const sym=document.getElementById('gex-sym')?.value||'SPY';
  document.getElementById('gex-lbl').textContent=sym;
  document.getElementById('gex-ld').style.display='flex';
  try{
    const d=await uwGet(\`stocks/\${sym}/options-chain?limit=100\`);
    const opts=d?.data||d?.results||[];
    if(!opts.length) throw new Error('لا توجد بيانات');
    const lv=calcGEX(opts);
    gexLevels=lv;
    const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v||'--'};
    set('g-tot','$'+fmtV(lv.total));set('g-cw',lv.callWall?'$'+lv.callWall:'--');
    set('g-pw',lv.putWall?'$'+lv.putWall:'--');set('g-zero',lv.zeroGamma?'$'+lv.zeroGamma:'--');
    set('h-gex','$'+fmtV(lv.total));set('h-cw',lv.callWall?'$'+lv.callWall:'--');
    set('h-pw',lv.putWall?'$'+lv.putWall:'--');set('h-gex-b',sym+' GEX');
    set('ch-cw',lv.callWall?'$'+lv.callWall:'--');set('ch-pw',lv.putWall?'$'+lv.putWall:'--');
    set('ch-zero',lv.zeroGamma?'$'+lv.zeroGamma:'--');set('ch-pain',lv.maxPain?'$'+lv.maxPain:'--');
    drawGEXProfile(lv,sym);
    // GEX levels on home
    if(lv.arr?.length){
      const top=lv.arr.slice(-12).reverse();
      const maxG=Math.max(...top.map(s=>Math.abs(s.gex)));
      const el=document.getElementById('h-gex-lvl');
      if(el)el.innerHTML=top.map(s=>{
        const pos=s.gex>=0,w=maxG?Math.min(90,Math.abs(s.gex)/maxG*90):0;
        return\`<div style="display:grid;grid-template-columns:55px 1fr 48px;align-items:center;gap:5px;margin-bottom:4px"><div style="font-family:var(--mono);font-size:.73rem;font-weight:600;text-align:right;color:\${pos?'var(--green)':'var(--red)'}">$\${s.price}</div><div style="height:15px;background:rgba(255,255,255,.03);border-radius:3px;overflow:hidden"><div style="height:100%;width:\${w}%;background:\${pos?'rgba(34,211,160,.4)':'rgba(247,86,106,.4)'};border-radius:3px"></div></div><div style="font-family:var(--mono);font-size:.67rem;color:\${pos?'var(--green)':'var(--red)'}">\${pos?'+':'-'}$\${fmtV(Math.abs(s.gex))}</div></div>\`;
      }).join('');
    }
  }catch(e){document.getElementById('gex-ld').innerHTML=\`<div class="ebox">⚠️ \${e.message}</div>\`;}
  document.getElementById('gex-ld').style.display='none';
}

function drawGEXProfile(lv,sym){
  const cv=document.getElementById('gex-cv');
  const W=cv.parentElement.clientWidth||800,H=300;
  cv.width=W*devicePixelRatio;cv.height=H*devicePixelRatio;
  cv.style.width=W+'px';cv.style.height=H+'px';
  const ctx=cv.getContext('2d');ctx.scale(devicePixelRatio,devicePixelRatio);
  ctx.fillStyle='#070d1b';ctx.fillRect(0,0,W,H);
  const arr=lv.arr||[];if(!arr.length)return;
  const P={t:22,r:14,b:34,l:14},cW=W-P.l-P.r,cH=H-P.t-P.b;
  const maxG=Math.max(...arr.map(s=>Math.abs(s.gex||0)));
  const bW=cW/arr.length;
  ctx.strokeStyle='rgba(79,172,247,0.05)';ctx.lineWidth=1;
  for(let i=0;i<=4;i++){const x=P.l+(cW/4)*i;ctx.beginPath();ctx.moveTo(x,P.t);ctx.lineTo(x,P.t+cH);ctx.stroke();}
  ctx.strokeStyle='rgba(255,255,255,0.07)';ctx.beginPath();ctx.moveTo(P.l,P.t+cH/2);ctx.lineTo(P.l+cW,P.t+cH/2);ctx.stroke();
  arr.forEach((s,i)=>{
    const x=P.l+i*bW,mid=P.t+cH/2,pos=s.gex>=0;
    const bH=maxG?Math.abs(s.gex)/maxG*(cH/2-6):0;
    const gr=ctx.createLinearGradient(0,pos?mid-bH:mid,0,pos?mid:mid+bH);
    gr.addColorStop(0,pos?'rgba(34,211,160,.8)':'rgba(247,86,106,.15)');
    gr.addColorStop(1,pos?'rgba(34,211,160,.15)':'rgba(247,86,106,.8)');
    ctx.fillStyle=gr;ctx.fillRect(x+1,pos?mid-bH:mid,bW-2,bH);
    if(i%(Math.max(1,Math.floor(arr.length/8)))===0){ctx.fillStyle='rgba(92,115,153,.7)';ctx.font='9px JetBrains Mono';ctx.textAlign='center';ctx.fillText('$'+s.price,x+bW/2,P.t+cH+13);}
  });
  const drawL=(p,col,lbl)=>{if(!p||!arr.length)return;const idx=arr.findIndex(s=>s.price>=p);if(idx<0)return;const x=P.l+idx*bW;ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(x,P.t);ctx.lineTo(x,P.t+cH);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=col;ctx.font='bold 8px JetBrains Mono';ctx.textAlign='left';ctx.fillText(lbl,x+2,P.t+10);};
  drawL(lv.callWall,'#22d3a0','CALL');drawL(lv.putWall,'#f7566a','PUT');drawL(lv.zeroGamma,'#f7c948','ZERO');drawL(lv.maxPain,'#a78bfa','PAIN');
  ctx.fillStyle='rgba(221,232,248,.55)';ctx.font='bold 10px sans-serif';ctx.textAlign='right';ctx.fillText(sym+' GEX · '+dayLabel(),W-P.r,P.t-7);
}

// ── Chart ──
document.querySelectorAll('.tf-btn').forEach(b=>{b.addEventListener('click',()=>{document.querySelectorAll('.tf-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');chartTF=b.dataset.tf;loadChart();});});
document.getElementById('ch-sym')?.addEventListener('change',loadChart);

async function loadChart(){
  const sym=document.getElementById('ch-sym')?.value||'SPY';
  document.getElementById('ch-st').textContent='جاري...';
  document.getElementById('ch-ld').style.display='flex';
  // Load GEX for gamma levels
  try{const d=await uwGet(\`stocks/\${sym}/options-chain?limit=80\`);const opts=d?.data||d?.results||[];if(opts.length){gexLevels=calcGEX(opts);const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v||'--'};set('ch-cw',gexLevels.callWall?'$'+gexLevels.callWall:'--');set('ch-pw',gexLevels.putWall?'$'+gexLevels.putWall:'--');set('ch-zero',gexLevels.zeroGamma?'$'+gexLevels.zeroGamma:'--');set('ch-pain',gexLevels.maxPain?'$'+gexLevels.maxPain:'--');}}catch(e){}
  // Fetch candles — use last trading day
  try{
    const toDate=getLastTradingDay();
    const dB=chartTF==='D'?90:chartTF==='60'?14:5;
    const frDate=new Date(new Date(toDate).getTime()-dB*86400000).toISOString().split('T')[0];
    const mult=chartTF==='D'?1:parseInt(chartTF)||5;
    const span=chartTF==='D'?'day':'minute';
    const d=await massGet(\`v2/aggs/ticker/\${sym}/range/\${mult}/\${span}/\${frDate}/\${toDate}?adjusted=true&sort=asc&limit=200&apiKey=63icPsd_duqgWVPXMo6wgNVJ6McD69h4\`);
    const candles=(d?.results||[]).map(r=>({t:r.t,o:r.o,h:r.h,l:r.l,c:r.c,v:r.v}));
    if(!candles.length) throw new Error('لا توجد بيانات');
    drawCandles(candles,gexLevels,sym);
    document.getElementById('ch-st').textContent=dayLabel()+' ✓';
  }catch(e){drawDemoCandles(sym);document.getElementById('ch-st').textContent='تجريبي';}
  document.getElementById('ch-ld').style.display='none';
}

function drawCandles(candles,lv,sym){
  const cv=document.getElementById('ch-cv');
  const W=cv.parentElement.clientWidth||800,H=Math.max(370,Math.min(500,window.innerHeight*.46));
  cv.width=W*devicePixelRatio;cv.height=H*devicePixelRatio;cv.style.width=W+'px';cv.style.height=H+'px';
  const ctx=cv.getContext('2d');ctx.scale(devicePixelRatio,devicePixelRatio);
  const P={t:20,r:68,b:36,l:8},cW=W-P.l-P.r,cH=H-P.t-P.b;
  const prices=candles.flatMap(c=>[c.h,c.l]);
  const minP=Math.min(...prices)*.9983,maxP=Math.max(...prices)*1.0017,pR=maxP-minP;
  const px=p=>P.t+cH-((p-minP)/pR)*cH;
  const cx=i=>P.l+(i/(candles.length-1||1))*cW;
  const bW=Math.max(2,(cW/candles.length)*.68);
  ctx.fillStyle='#070d1b';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(79,172,247,0.05)';ctx.lineWidth=1;
  for(let i=0;i<=5;i++){const y=P.t+(cH/5)*i;ctx.beginPath();ctx.moveTo(P.l,y);ctx.lineTo(W-P.r+58,y);ctx.stroke();}
  for(let i=0;i<=8;i++){const x=P.l+(cW/8)*i;ctx.beginPath();ctx.moveTo(x,P.t);ctx.lineTo(x,P.t+cH);ctx.stroke();}
  // Gamma zones
  const zone=(p,r,g,b)=>{if(!p)return;const y=px(p),gr=ctx.createLinearGradient(0,y-40,0,y+40);gr.addColorStop(0,\`rgba(\${r},\${g},\${b},0)\`);gr.addColorStop(.5,\`rgba(\${r},\${g},\${b},.1)\`);gr.addColorStop(1,\`rgba(\${r},\${g},\${b},0)\`);ctx.fillStyle=gr;ctx.fillRect(P.l,y-40,cW,80);};
  zone(lv?.callWall,34,211,160);zone(lv?.putWall,247,86,106);zone(lv?.zeroGamma,247,201,72);zone(lv?.maxPain,167,139,250);
  // Gamma lines
  const line=(p,col,lbl)=>{if(!p)return;const y=px(p);ctx.save();ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.setLineDash([6,3]);ctx.beginPath();ctx.moveTo(P.l,y);ctx.lineTo(W-P.r+58,y);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=col;ctx.font='bold 9px JetBrains Mono';ctx.textAlign='left';ctx.fillText('$'+p,W-P.r,y-2);ctx.font='8px JetBrains Mono';ctx.fillStyle='rgba(255,255,255,.4)';ctx.fillText(lbl,W-P.r,y+9);ctx.restore();};
  line(lv?.callWall,'#22d3a0','CALL');line(lv?.putWall,'#f7566a','PUT');line(lv?.zeroGamma,'#f7c948','ZERO');line(lv?.maxPain,'#a78bfa','PAIN');
  // Volume
  const maxV=Math.max(...candles.map(c=>c.v||0));
  candles.forEach((c,i)=>{const x=cx(i);ctx.fillStyle=c.c>=c.o?'rgba(34,211,160,.18)':'rgba(247,86,106,.18)';ctx.fillRect(x-bW/2,P.t+cH-(maxV?(c.v||0)/maxV*30:0),bW,maxV?(c.v||0)/maxV*30:0);});
  // Candles
  candles.forEach((c,i)=>{
    const x=cx(i),isG=c.c>=c.o,col=isG?'#22d3a0':'#f7566a';
    ctx.strokeStyle=col;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,px(c.h));ctx.lineTo(x,px(c.l));ctx.stroke();
    const bT=px(Math.max(c.o,c.c)),bB=px(Math.min(c.o,c.c)),bH=Math.max(1,bB-bT);
    ctx.fillStyle=isG?'rgba(34,211,160,.82)':'rgba(247,86,106,.82)';ctx.fillRect(x-bW/2,bT,bW,bH);
    if(i===hovIdx){ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=1;ctx.strokeRect(x-bW/2-1,bT-1,bW+2,bH+2);}
  });
  // Current price
  const last=candles[candles.length-1];
  if(last){const y=px(last.c);ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=1;ctx.setLineDash([2,4]);ctx.beginPath();ctx.moveTo(P.l,y);ctx.lineTo(W-P.r+58,y);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=last.c>=last.o?'#22d3a0':'#f7566a';ctx.fillRect(W-P.r,y-8,58,16);ctx.fillStyle='#040810';ctx.font='bold 9px JetBrains Mono';ctx.textAlign='center';ctx.fillText('$'+fmt(last.c),W-P.r+29,y+4);}
  // Price axis
  ctx.fillStyle='rgba(92,115,153,.75)';ctx.font='9px JetBrains Mono';ctx.textAlign='left';
  for(let i=0;i<=5;i++)ctx.fillText('$'+fmt(minP+(pR/5)*(5-i)),W-P.r,P.t+(cH/5)*i+4);
  // Time axis
  ctx.textAlign='center';const step=Math.max(1,Math.floor(candles.length/8));
  candles.forEach((c,i)=>{if(i%step===0){const d=new Date(c.t);const lbl=chartTF==='D'?(d.getMonth()+1)+'/'+d.getDate():d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');ctx.fillStyle='rgba(92,115,153,.6)';ctx.fillText(lbl,cx(i),P.t+cH+13);}});
  // Title
  ctx.fillStyle='rgba(221,232,248,.6)';ctx.font='bold 10px IBM Plex Sans Arabic';ctx.textAlign='right';
  ctx.fillText(sym+' · '+(chartTF==='D'?'يومي':chartTF+' دقيقة')+' · '+dayLabel(),W-P.r-3,P.t-6);
  // Tooltip
  cv.onmousemove=e=>{const rect=cv.getBoundingClientRect();const mx=e.clientX-rect.left;const idx=Math.round((mx-P.l)/cW*(candles.length-1));if(idx>=0&&idx<candles.length){hovIdx=idx;const c=candles[idx],isG=c.c>=c.o,chg=c.o?((c.c-c.o)/c.o*100).toFixed(2):0;const tt=document.getElementById('ch-tip');tt.style.display='block';const tx=cx(idx);tt.style.left=(tx>W/2?tx-160:tx+8)+'px';tt.style.top='8px';tt.innerHTML=\`<div style="font-weight:700;margin-bottom:4px;color:\${isG?'#22d3a0':'#f7566a'}">\${sym} · \${new Date(c.t).toLocaleDateString('ar-SA')}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:3px 8px;font-size:.66rem"><span style="color:var(--muted)">فتح</span><span>$\${fmt(c.o)}</span><span style="color:var(--muted)">أعلى</span><span style="color:#22d3a0">$\${fmt(c.h)}</span><span style="color:var(--muted)">أدنى</span><span style="color:#f7566a">$\${fmt(c.l)}</span><span style="color:var(--muted)">إغلاق</span><span style="font-weight:700">$\${fmt(c.c)}</span><span style="color:var(--muted)">تغير</span><span style="color:\${isG?'#22d3a0':'#f7566a'}">\${isG?'+':''}\${chg}%</span><span style="color:var(--muted)">حجم</span><span>\${fmtV(c.v)}</span></div>\`;drawCandles(candles,lv,sym);}};
  cv.onmouseleave=()=>{hovIdx=-1;document.getElementById('ch-tip').style.display='none';drawCandles(candles,lv,sym);};
}

function drawDemoCandles(sym){
  let p=541;const now=Date.now();
  const c=Array.from({length:90},(_,i)=>{const chg=(Math.random()-.47)*3.5;const o=p;p=Math.max(490,Math.min(590,p+chg));return{t:now-(89-i)*86400000,o,h:Math.max(o,p)+Math.random()*1.8,l:Math.min(o,p)-Math.random()*1.8,c:p,v:Math.floor(Math.random()*5e7+1e7)};});
  drawCandles(c,{callWall:550,putWall:530,zeroGamma:540,maxPain:543},sym+' (تجريبي)');
}

// ── Tickers ──
const SYMS=['SPY','QQQ','NVDA','AAPL','TSLA','META','MSFT','AMZN'];
async function loadTickers(){
  const toD=getLastTradingDay(),frD=getFromDate(5);
  for(const sym of SYMS){
    try{
      const d=await massGet(\`v2/aggs/ticker/\${sym}/range/1/day/\${frD}/\${toD}?adjusted=true&sort=desc&limit=1&apiKey=63icPsd_duqgWVPXMo6wgNVJ6McD69h4\`);
      const r=d?.results?.[0];if(!r)continue;
      const chg=r.o?((r.c-r.o)/r.o):0;
      const pe=document.getElementById('p-'+sym),ce=document.getElementById('c-'+sym);
      if(pe){pe.textContent='$'+fmt(r.c);pe.className='tc-price '+cls(chg);}
      if(ce){ce.textContent=sign(chg)+Math.abs(chg*100).toFixed(2)+'%';ce.className='tc-chg '+cls(chg);}
    }catch(e){}
    await new Promise(r=>setTimeout(r,200));
  }
}

// ── Heatmap ──
async function loadHeatmap(){
  const syms=['NVDA','META','AAPL','TSLA','MSFT','GOOGL','AMZN','JPM','AMD','NFLX','BAC','DIS','V','XOM','WMT'];
  const toD=getLastTradingDay(),frD=getFromDate(5);
  const cells=await Promise.all(syms.map(async sym=>{
    try{
      const d=await massGet(\`v2/aggs/ticker/\${sym}/range/1/day/\${frD}/\${toD}?adjusted=true&sort=desc&limit=1&apiKey=63icPsd_duqgWVPXMo6wgNVJ6McD69h4\`);
      const r=d?.results?.[0];if(!r)throw new Error();
      const p=r.o?((r.c-r.o)/r.o*100):0,int=Math.min(.5,Math.abs(p)/6);
      const bg=p>=0?\`rgba(34,211,160,\${int})\`:\`rgba(247,86,106,\${int})\`;
      return\`<div class="hcell" style="background:\${bg}"><div class="hcell-sym">\${sym}</div><div class="hcell-pct \${cls(p)}">\${sign(p)}\${Math.abs(p).toFixed(1)}%</div></div>\`;
    }catch(e){return\`<div class="hcell" style="background:rgba(100,100,100,.07)"><div class="hcell-sym">\${sym}</div><div class="hcell-pct">--</div></div>\`;}
  }));
  const el=document.getElementById('hmap');if(el)el.innerHTML=cells.join('');
}

// ── News ──
async function loadNews(){
  try{
    const d=await uwGet('news?limit=15');
    const a=d?.data||d?.results||[];if(!a.length)throw new Error('لا توجد أخبار');
    document.getElementById('news-c').innerHTML=a.map(n=>\`<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:9px 12px;margin-bottom:7px;cursor:pointer" onclick="window.open('\${n.url||n.article_url||'#'}','_blank')"><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:.62rem;color:var(--muted);font-family:var(--mono)">\${n.source||n.publisher?.name||'--'}</span><span style="font-size:.62rem;color:var(--muted);font-family:var(--mono)">\${n.published_at?new Date(n.published_at).toLocaleTimeString('ar-SA'):'--'}</span></div><div style="font-size:.78rem;font-weight:500;line-height:1.45">\${n.title||'--'}</div>\${n.tickers?.length?\`<div style="margin-top:4px;display:flex;gap:5px;flex-wrap:wrap">\${n.tickers.slice(0,5).map(t=>\`<span style="font-family:var(--mono);font-size:.65rem;color:var(--blue);font-weight:700">\${t}</span>\`).join('')}</div>\`:''}</div>\`).join('');
  }catch(e){document.getElementById('news-c').innerHTML=\`<div class="ebox">⚠️ \${e.message}</div>\`;}
}

// ── Init ──
async function init(){
  loadTickers();
  loadFlow();
  loadDarkPool();
  loadGEX();
  loadHeatmap();
}
init();
setInterval(loadTickers,60000);
setInterval(loadFlow,90000);
setInterval(loadDarkPool,120000);
</script>
</body>
</html>
`);
}
