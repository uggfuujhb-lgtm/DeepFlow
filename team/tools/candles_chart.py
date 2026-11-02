"""OptionLap candlestick chart with annotated zones (CBOE delayed intraday, free).

Usage (from repo root):
  python3 team/tools/candles_chart.py --out team/out/content/charts/2026-11-02-3pm.png \
      --title "سباكس اليوم بين الجدارين" \
      --level "7660:wall:مقاومة الكول" --level "7600:flow:أكبر عقود مفتوحة" \
      --level "7500:support:دعم البوت" --zone "7565:7575:signal:منطقة القلب" \
      --note "لمس 7662 ورجع من الجدار" [--tf 5] [--json path] [--size 1080x1350]

kinds: wall (call resistance / stop), support (put support / target), flow (OI / gamma zone),
signal (price / entry zone). Every level carries its Arabic word, so meaning is never colour alone.
Candles are neutral (up = hollow ink, down = filled muted) so red/green stay reserved for levels.
Times are shown in Riyadh time, 12-hour format. Data is CBOE delayed (~15 min).
Rendering uses the preinstalled Playwright (node) so Arabic shapes correctly.
"""
import argparse, datetime as dt, html, json, os, subprocess, sys, tempfile, urllib.request

URL = "https://cdn.cboe.com/api/global/delayed_quotes/charts/intraday/{sym}.json"
C = dict(surface="#0E1116", raised="#161B22", line="#2A3442", ink="#F3F6F8", muted="#9AA7B4",
         wall="#FF5A5F", support="#2FD27A", flow="#4DA3FF", signal="#FFB21A", onsignal="#140D00",
         wall_soft="#3A1A1D", support_soft="#0F2A1C", flow_soft="#0F2238", signal_soft="#33260A",
         g1="#05B36B", g2="#057A64", g3="#078A92", g4="#05505C")


def et_offset(day):
    """Hours from US Eastern to Riyadh (UTC+3). EDT (UTC-4) -> 7, EST (UTC-5) -> 8."""
    y = day.year
    mar = dt.date(y, 3, 8 + (6 - dt.date(y, 3, 8).weekday()) % 7)   # 2nd Sunday March
    nov = dt.date(y, 11, 1 + (6 - dt.date(y, 11, 1).weekday()) % 7)  # 1st Sunday November
    return 7 if mar <= day < nov else 8


def h12(t):
    h = t.hour % 12 or 12
    return f"{h}:{t.minute:02d} {'ص' if t.hour < 12 else 'م'}"


def load(sym, path):
    raw = json.load(open(path)) if path else json.load(urllib.request.urlopen(URL.format(sym=sym), timeout=60))
    bars = []
    for r in raw["data"]:
        p = r["price"]
        if not p or p.get("open") is None: continue
        bars.append((dt.datetime.fromisoformat(r["datetime"]), p["open"], p["high"], p["low"], p["close"]))
    return raw.get("timestamp"), bars


def resample(bars, tf):
    out = []
    for t, o, h, l, c in bars:
        b = t.replace(minute=(t.minute // tf) * tf, second=0)
        if out and out[-1][0] == b:
            _, oo, hh, ll, _ = out[-1]
            out[-1] = (b, oo, max(hh, h), min(ll, l), c)
        else:
            out.append((b, o, h, l, c))
    return out


def parse_level(s):
    price, kind, label = s.split(":", 2)
    return float(price), kind, label


def parse_zone(s):
    lo, hi, kind, label = s.split(":", 3)
    return float(lo), float(hi), kind, label


def build(args, ts, candles):
    W, H = map(int, args.size.split("x"))
    off = dt.timedelta(hours=et_offset(candles[0][0].date()))
    day = (candles[-1][0] + off)
    levels = [parse_level(s) for s in args.level]
    zones = [parse_zone(s) for s in args.zone]
    lo = min(c[3] for c in candles); hi = max(c[2] for c in candles)
    last = candles[-1][4]
    # y-range: candles plus any level within 1.5% of last price
    near = [p for p, _, _ in levels if abs(p - last) / last <= 0.015] + \
           [v for z in zones for v in z[:2] if abs(v - last) / last <= 0.015]
    ymin = min([lo] + near); ymax = max([hi] + near)
    pad = (ymax - ymin) * 0.08 or 5
    ymin -= pad; ymax += pad

    top, bottom = 250, H - 170
    left, right = 70, W - 340          # right column holds the level chips
    pw, ph = right - left, bottom - top
    Y = lambda v: top + (ymax - v) / (ymax - ymin) * ph
    n = len(candles); step = pw / max(n, 1); bw = max(2.0, step * 0.62)
    X = lambda i: left + step * (i + 0.5)

    svg = []
    # grid + price ticks
    span = ymax - ymin
    tick = next(t for t in (1, 2, 5, 10, 20, 25, 50, 100, 200) if span / t <= 7)
    v = (int(ymin // tick) + 1) * tick
    lvl_y = [Y(p) for p, _, _ in levels]
    while v < ymax:
        y = Y(v)
        if any(abs(y - ly) < 14 for ly in lvl_y): v += tick; continue
        svg.append(f'<line x1="{left}" x2="{right}" y1="{y:.1f}" y2="{y:.1f}" stroke="{C["line"]}" stroke-width="1"/>')
        svg.append(f'<text x="{left-10}" y="{y+5:.1f}" class="tick" text-anchor="end">{v:g}</text>')
        v += tick
    # zones (bands)
    zone_labels = []
    for zlo, zhi, kind, label in zones:
        y1, y2 = Y(max(zlo, zhi)), Y(min(zlo, zhi))
        y1, y2 = max(y1, top), min(y2, bottom)
        if y2 <= y1: continue
        svg.append(f'<rect x="{left}" y="{y1:.1f}" width="{pw}" height="{y2-y1:.1f}" fill="{C[kind+"_soft"]}" opacity="0.9"/>')
        zone_labels.append((y1, y2, kind, label, zlo, zhi))
    # time labels (Riyadh, 12h) every hour
    for i, c in enumerate(candles):
        t = c[0] + off
        if t.minute == 0 or (i == 0 and (candles[0][0] + off).minute <= 15):
            svg.append(f'<line x1="{X(i):.1f}" x2="{X(i):.1f}" y1="{top}" y2="{bottom}" stroke="{C["line"]}" stroke-width="1" stroke-dasharray="2 6"/>')
            svg.append(f'<text x="{X(i):.1f}" y="{bottom+34}" class="tick" text-anchor="middle">{h12(t).split()[0]}</text>')
    # levels (lines) under candles
    for p, kind, label in levels:
        if ymin <= p <= ymax:
            y = Y(p)
            svg.append(f'<line x1="{left}" x2="{right+12}" y1="{y:.1f}" y2="{y:.1f}" stroke="{C[kind]}" stroke-width="3" stroke-dasharray="{"" if kind in ("wall","support") else "10 7"}"/>')
    # candles: up hollow ink, down filled muted
    for i, (t, o, h, l, c) in enumerate(candles):
        x = X(i); up = c >= o
        col = C["ink"] if up else C["muted"]
        svg.append(f'<line x1="{x:.1f}" x2="{x:.1f}" y1="{Y(h):.1f}" y2="{Y(l):.1f}" stroke="{col}" stroke-width="2"/>')
        yb, ye = Y(max(o, c)), Y(min(o, c)); hgt = max(ye - yb, 1.5)
        if up:
            svg.append(f'<rect x="{x-bw/2:.1f}" y="{yb:.1f}" width="{bw:.1f}" height="{hgt:.1f}" fill="{C["surface"]}" stroke="{col}" stroke-width="2"/>')
        else:
            svg.append(f'<rect x="{x-bw/2:.1f}" y="{yb:.1f}" width="{bw:.1f}" height="{hgt:.1f}" fill="{col}"/>')
    for y1, y2, kind, label, zlo, zhi in zone_labels:
        txt = f'{html.escape(label)} {min(zlo,zhi):,.0f}–{max(zlo,zhi):,.0f}'
        w = 14 * len(txt) + 24; ym = (y1 + y2) / 2
        svg.append(f'<rect x="{left+8}" y="{ym-17:.1f}" width="{w}" height="34" rx="6" fill="{C["surface"]}" stroke="{C[kind]}" stroke-width="1.5" opacity="0.92"/>')
        svg.append(f'<text x="{left+8+w/2:.1f}" y="{ym+7:.1f}" class="zl" fill="{C[kind]}" text-anchor="middle">{txt}</text>')
    # day high / low markers
    ih = max(range(n), key=lambda i: candles[i][2]); il = min(range(n), key=lambda i: candles[i][3])
    def hl_x(i):
        x = X(i)
        return (x - 12, 'end') if x > right - 90 else (x + 12, 'start') if x < left + 90 else (x, 'middle')
    hx, ha = hl_x(ih); lx, la = hl_x(il)
    svg.append(f'<text x="{hx:.1f}" y="{Y(hi)-14:.1f}" class="hl" text-anchor="{ha}" direction="ltr">{hi:,.0f} أعلى</text>')
    svg.append(f'<text x="{lx:.1f}" y="{Y(lo)+30:.1f}" class="hl" text-anchor="{la}" direction="ltr">{lo:,.0f} أدنى</text>')
    # current price line
    yl = Y(last)
    svg.append(f'<line x1="{left}" x2="{right+12}" y1="{yl:.1f}" y2="{yl:.1f}" stroke="{C["signal"]}" stroke-width="2" stroke-dasharray="3 5"/>')

    # right column chips (levels + last price), de-overlapped
    chips = [(p, kind, label) for p, kind, label in levels] + [(last, "price", args.price_label)]
    chips.sort(key=lambda c: -c[0])
    placed = []
    for p, kind, label in chips:
        y = min(max(Y(p), top + 22), bottom - 22) if ymin <= p <= ymax else (top + 22 if p > ymax else bottom - 22)
        if placed and y - placed[-1][0] < 50: y = placed[-1][0] + 50
        placed.append((y, p, kind, label))
    over = placed[-1][0] - (bottom - 22) if placed else 0
    if over > 0: placed = [(y - over, p, k, l) for y, p, k, l in placed]
    chip_html = []
    for y, p, kind, label in placed:
        arrow = "" if ymin <= p <= ymax else (" ↑" if p > ymax else " ↓")
        if kind == "price":
            style = f'background:{C["signal"]};color:{C["onsignal"]};border-color:{C["signal"]}'
        else:
            style = f'border-color:{C[kind]};color:{C["ink"]}'
        dot = "" if kind == "price" else f'<i style="background:{C[kind]}"></i>'
        chip_html.append(f'<div class="chip" style="top:{y-21:.0f}px;{style}">{dot}<span class="lbl">{html.escape(label)}</span>'
                         f'<b>{p:,.0f}{arrow}</b></div>')

    data_t = dt.datetime.fromisoformat(ts.replace(" ", "T")) + dt.timedelta(hours=3) if ts else candles[-1][0] + off
    months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
    date_ar = f"{day.day} {months[day.month-1]} {day.year}"
    note = f'<div class="note">{html.escape(args.note)}</div>' if args.note else ""
    return f"""<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Changa:wght@500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:{W}px;height:{H}px;background:{C['surface']};color:{C['ink']};font-family:'IBM Plex Sans Arabic',sans-serif;position:relative;overflow:hidden}}
.bar{{position:absolute;top:0;left:0;right:0;height:10px;background:linear-gradient(90deg,{C['g4']},{C['g3']},{C['g2']},{C['g1']})}}
.head{{position:absolute;top:44px;right:56px;left:56px;display:flex;justify-content:space-between;align-items:flex-start}}
.brand{{font-family:Changa;font-weight:800;font-size:34px;direction:ltr;color:{C['ink']}}}
.brand span{{color:{C['g1']}}}
.title{{font-family:Changa;font-weight:700;font-size:52px;line-height:1.15}}
.sub{{font-size:26px;color:{C['muted']};margin-top:8px}}
.sub b{{font-family:'IBM Plex Mono';font-weight:600;color:{C['ink']}}}
.note{{position:absolute;top:196px;right:56px;font-family:Changa;font-weight:600;font-size:30px;color:{C['signal']}}}
svg{{position:absolute;top:0;left:0}}
.tick{{font-family:'IBM Plex Mono';font-size:20px;fill:{C['muted']}}}
.zl{{font-family:'IBM Plex Sans Arabic';font-weight:600;font-size:22px}}
.hl{{font-family:'IBM Plex Sans Arabic';font-weight:600;font-size:22px;fill:{C['ink']}}}
.chip{{position:absolute;left:{right+18}px;width:{W-right-18-36}px;height:42px;border:2px solid;border-radius:6px;background:{C['raised']};
 display:flex;align-items:center;gap:8px;padding:0 12px;font-size:21px;font-weight:600}}
.chip i{{width:12px;height:12px;border-radius:2px;flex:none}}
.chip .lbl{{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}
.chip b{{font-family:'IBM Plex Mono';font-weight:600;font-size:23px;direction:ltr}}
.axis{{position:absolute;bottom:100px;left:{left}px;width:{pw}px;text-align:center;font-size:20px;color:{C['muted']}}}
.foot{{position:absolute;bottom:40px;right:56px;left:56px;display:flex;justify-content:space-between;font-size:22px;color:{C['muted']}}}
</style></head><body><div class="bar"></div>
<div class="head"><div><div class="title">{html.escape(args.title)}</div>
<div class="sub">شموع {args.tf} دقايق · {date_ar} · آخر بيانات <b>{h12(data_t)}</b> الرياض</div></div>
<div class="brand">Option<span>Lap</span></div></div>{note}
<svg width="{W}" height="{H}">{''.join(svg)}</svg>
{''.join(chip_html)}
<div class="axis">الوقت بتوقيت الرياض، مساءً</div>
<div class="foot"><span>المصدر: CBOE، بيانات متأخرة ~15 دقيقة · المستويات تقريبية من بيانات الأوبشن</span><span>للتعليم فقط وليست توصية</span></div>
</body></html>"""


RENDER_JS = r"""
const { chromium } = require('playwright');
(async () => {
  const [,, htmlPath, out, w, h] = process.argv;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: +h } });
  await p.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: out }); await b.close();
})();
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sym", default="_SPX"); ap.add_argument("--json")
    ap.add_argument("--tf", type=int, default=5); ap.add_argument("--size", default="1080x1350")
    ap.add_argument("--title", default="سباكس بين الجدارين"); ap.add_argument("--note", default=""); ap.add_argument("--price-label", default="📍 السعر")
    ap.add_argument("--level", action="append", default=[]); ap.add_argument("--zone", action="append", default=[])
    ap.add_argument("--out", required=True); ap.add_argument("--html", help="also keep the HTML here")
    a = ap.parse_args()
    ts, bars = load(a.sym, a.json)
    if not bars: sys.exit("no intraday bars (market closed or data empty)")
    candles = resample(bars, a.tf)
    page = build(a, ts, candles)
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with tempfile.TemporaryDirectory() as d:
        hp = a.html or os.path.join(d, "chart.html")
        open(hp, "w").write(page)
        js = os.path.join(d, "render.js"); open(js, "w").write(RENDER_JS)
        W, H = a.size.split("x")
        subprocess.run(["node", js, os.path.abspath(hp), os.path.abspath(a.out), W, H], check=True,
                       env={**os.environ, "NODE_PATH": subprocess.run(["npm", "root", "-g"], capture_output=True, text=True).stdout.strip()})
    last = candles[-1]
    print(f"ok {a.out}  bars={len(candles)}  last={last[4]:.2f}  high={max(c[2] for c in candles):.2f}  low={min(c[3] for c in candles):.2f}  data={ts}")


if __name__ == "__main__":
    main()
