"""OptionLap daily news card (image for Telegram), brand v1.3 violet.
Input JSON: {"title": "...", "date": "...", "items": [{"tag": "NVDA", "tone": "down|up|neutral|event",
             "head": "short headline", "body": "one or two short lines"}], "foot": "optional footer text"}
Usage: python3 team/tools/news_card.py --json news.json --out team/out/content/charts/YYYY-MM-DD-news.png
Items may carry "impact" (one hedged line on what the news can mean for the market, no advice).
Every number must come from a source listed in the JSON "sources" (kept for our records; the owner asked not to show them on the post).
Educational only, not a recommendation."""
import argparse, html, json, os, re, subprocess, tempfile
C = dict(surface="#050607", raised="#0B0E12", line="#1A2129", ink="#F5F7FA", muted="#8E99A6",
         up="#00E58A", down="#FF3B47", event="#FFC21A", neutral="#9B6BFF", g1="#B794FF", g2="#8B5CF6", g4="#2E1065")
RENDER_JS = r"""
const { chromium } = require('playwright');
(async () => {
  const [,, htmlPath, out, w, h] = process.argv;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: +h } });
  await p.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: out, fullPage: true }); await b.close();
})();
"""
NUM = re.compile(r"[A-Za-z][A-Za-z0-9&\-.]*(?: [A-Za-z0-9&\-.]+)*? [+\-−]\d[\d.,]*%|[+\-−]?\$?\d[\d.,:]*%?")
def e(t):
    # escape, then isolate numbers (signs, %, decimals) left-to-right so Arabic text does not flip them
    out, i = [], 0
    for m in NUM.finditer(t):
        out.append(html.escape(t[i:m.start()])); out.append(f'<span class="n">{html.escape(m.group(0))}</span>'); i = m.end()
    return ''.join(out) + html.escape(t[i:])
def build(d, W, H):
    cards = []
    for it in d["items"]:
        col = C.get(it.get("tone", "neutral"), C["neutral"])
        arrow = {"up": "▲", "down": "▼", "event": "◆"}.get(it.get("tone"), "●")
        imp = f'<div class="imp"><b>التأثير:</b> {e(it["impact"])}</div>' if it.get("impact") else ""
        cards.append(f'''<div class="card" style="border-inline-start:6px solid {col}">
<div class="row"><span class="tag" style="color:{col};border-color:{col}">{arrow} {html.escape(it["tag"])}</span>
<span class="head">{e(it["head"])}</span></div>
<div class="body">{e(it.get("body", ""))}</div>{imp}</div>''')
    n = max(1, len(cards))
    return f"""<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Changa:wght@600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:{W}px;min-height:{H}px;background:{C['surface']};color:{C['ink']};font-family:'IBM Plex Sans Arabic',sans-serif;position:relative;overflow:hidden}}
.bar{{height:10px;background:linear-gradient(90deg,{C['g4']},{C['g2']},{C['g1']})}}
.top{{display:flex;justify-content:space-between;align-items:flex-start;padding:40px 56px 0}}
.title{{font-family:Changa;font-weight:800;font-size:58px;line-height:1.1}}
.date{{font-size:28px;color:{C['muted']};margin-top:8px}}
.brand{{font-family:Changa;font-weight:800;font-size:34px;direction:ltr;margin-top:12px}}
.brand span{{color:{C['g1']}}}
.list{{margin:36px 56px 0;display:flex;flex-direction:column;gap:14px}}
.card{{background:{C['raised']};border:1px solid {C['line']};border-radius:18px;padding:14px 22px;display:flex;flex-direction:column;justify-content:center;gap:6px;min-height:0}}
.row{{display:flex;align-items:center;gap:14px}}
.tag{{font-family:'IBM Plex Mono';font-weight:600;font-size:{24 if n>5 else 26}px;border:2px solid;border-radius:10px;padding:2px 12px;white-space:nowrap;direction:ltr;unicode-bidi:isolate}}
.head{{font-weight:700;font-size:{28 if n>5 else 31}px;line-height:1.25}}
.body{{font-size:{22 if n>5 else 25}px;color:#C9D1D9;line-height:1.4}}
.n{{direction:ltr;unicode-bidi:isolate;white-space:nowrap}}
.imp{{font-size:{22 if n>5 else 24}px;color:{C['ink']};line-height:1.35;background:#140D24;border-radius:10px;padding:6px 12px}}
.imp b{{color:{C['g1']}}}
.foot{{margin:30px 56px 0;padding-bottom:42px;display:flex;justify-content:space-between;font-size:23px;color:{C['muted']}}}
</style></head><body><div class="bar"></div>
<div class="top"><div><div class="title">{e(d.get("title", "أهم أخبار اليوم"))}</div><div class="date">{e(d.get("date", ""))}</div></div>
<div class="brand">Option<span>Lap</span></div></div>
<div class="list">{''.join(cards)}</div>
<div class="foot"><span dir="ltr">{html.escape(d.get("foot", "@OptionLap"))}</span><span>للتعليم فقط وليست توصية</span></div>
</body></html>"""
def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--json", required=True); ap.add_argument("--out", required=True)
    ap.add_argument("--size", default="1080x1350"); a = ap.parse_args()
    d = json.load(open(a.json, encoding="utf-8")); W, H = a.size.split("x")
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with tempfile.TemporaryDirectory() as t:
        hp = os.path.join(t, "news.html"); open(hp, "w", encoding="utf-8").write(build(d, W, H))
        js = os.path.join(t, "r.js"); open(js, "w").write(RENDER_JS)
        subprocess.run(["node", js, hp, os.path.abspath(a.out), W, H], check=True,
                       env={**os.environ, "NODE_PATH": subprocess.run(["npm", "root", "-g"], capture_output=True, text=True).stdout.strip()})
    print("ok", a.out, len(d["items"]), "items")
if __name__ == "__main__": main()
