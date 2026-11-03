"""Archive today's SPX 1-minute bars and the GEX levels, so backtests can grow day by day.

Usage: python3 team/tools/archive_day.py [--json saved_intraday.json]
Writes team/data/intraday/YYYY-MM-DD_SPX.csv.gz and team/data/gex/YYYY-MM-DD.txt (gex.py output).
Free CBOE data (delayed ~15 min); run after the US close (12:15 AM Riyadh).
"""
import argparse, csv, gzip, io, json, os, subprocess, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ap = argparse.ArgumentParser(); ap.add_argument("--json"); ap.add_argument("--no-gex", action="store_true")
a = ap.parse_args()
url = "https://cdn.cboe.com/api/global/delayed_quotes/charts/intraday/_SPX.json"
raw = json.load(open(a.json)) if a.json else json.load(urllib.request.urlopen(url, timeout=60))
bars = [r for r in raw["data"] if r.get("price") and r["price"].get("open") is not None]
if not bars: sys.exit("no bars")
day = bars[0]["datetime"][:10]
out = os.path.join(ROOT, "team/data/intraday", f"{day}_SPX.csv.gz")
buf = io.StringIO(); w = csv.writer(buf)
w.writerow(["datetime_et", "open", "high", "low", "close", "calls_volume", "puts_volume"])
for r in bars:
    p, v = r["price"], r.get("volume") or {}
    w.writerow([r["datetime"], round(p["open"], 2), round(p["high"], 2), round(p["low"], 2), round(p["close"], 2),
                v.get("calls_volume", ""), v.get("puts_volume", "")])
with gzip.open(out, "wt") as f: f.write(buf.getvalue())
print(f"intraday {day}: {len(bars)} bars, last {bars[-1]['datetime']} -> {out}")
if not a.no_gex:
    g = subprocess.run([sys.executable, os.path.join(ROOT, "team/tools/gex.py"), "_SPX", "next"], capture_output=True, text=True).stdout
    ga = subprocess.run([sys.executable, os.path.join(ROOT, "team/tools/gex.py"), "_SPX", "all"], capture_output=True, text=True).stdout
    gp = os.path.join(ROOT, "team/data/gex", f"{day}.txt")
    open(gp, "w").write("## next (0DTE)\n" + g + "\n## all\n" + ga)
    print("gex ->", gp)
