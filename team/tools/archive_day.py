"""Archive today's SPX 1-minute bars and the GEX levels, so backtests can grow day by day.

Usage: python3 team/tools/archive_day.py [--json saved_intraday.json]
Writes team/data/intraday/YYYY-MM-DD_SPX.csv.gz, team/data/gex/YYYY-MM-DD.txt (gex.py output) and
team/data/chain/YYYY-MM-DD_SPX.csv.gz (per-contract volume, open interest, IV, delta, gamma within ±3% of spot for
expiries up to 7 days out), so volume-vs-OI (opening flow) and pinning can be tested later.
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
    # option chain snapshot (volume vs open interest), for later opening-flow / pin studies
    try:
        import re, datetime as _dt
        ch = json.load(urllib.request.urlopen("https://cdn.cboe.com/api/global/delayed_quotes/options/_SPX.json", timeout=60))
        d = ch["data"]; spot = float(d["current_price"]); pat = re.compile(r"^[A-Z]+(\d{6})([CP])(\d{8})$")
        lim = (_dt.date.fromisoformat(day) + _dt.timedelta(days=7)).strftime("%y%m%d")
        cbuf = io.StringIO(); cw = csv.writer(cbuf)
        cw.writerow(["snapshot", "expiry", "cp", "strike", "volume", "open_interest", "iv", "delta", "gamma", "last"])
        n = 0
        for o in d["options"]:
            m = pat.match(o["option"])
            if not m: continue
            k = int(m[3]) / 1000
            if m[1] > lim or abs(k - spot) > spot * 0.03: continue
            cw.writerow([ch.get("timestamp"), m[1], m[2], k, o.get("volume"), o.get("open_interest"), o.get("iv"), o.get("delta"), o.get("gamma"), o.get("last_trade_price")]); n += 1
        cp_ = os.path.join(ROOT, "team/data/chain", f"{day}_SPX.csv.gz"); os.makedirs(os.path.dirname(cp_), exist_ok=True)
        with gzip.open(cp_, "wt") as f: f.write(cbuf.getvalue())
        print(f"chain -> {cp_} ({n} contracts, spot {spot})")
    except Exception as e:
        print("chain snapshot skipped:", e)

# stock 1-minute bars with real volume (Mag 7 + SPY/QQQ), for order-flow tests such as the absorption detector (abs_test.py)
for sym in ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "SPY", "QQQ"]:
    try:
        req = urllib.request.Request(f"https://cdn.cboe.com/api/global/delayed_quotes/charts/intraday/{sym}.json", headers={"User-Agent": "Mozilla/5.0"})
        sb = [r for r in json.load(urllib.request.urlopen(req, timeout=60))["data"] if r.get("price") and r["price"].get("open") is not None]
        sday = sb[0]["datetime"][:10]
        sp = os.path.join(ROOT, "team/data/intraday_stocks", f"{sday}_{sym}.csv.gz"); os.makedirs(os.path.dirname(sp), exist_ok=True)
        sbuf = io.StringIO(); sw = csv.writer(sbuf); sw.writerow(["datetime_et", "open", "high", "low", "close", "volume"])
        for r in sb:
            p = r["price"]; sw.writerow([r["datetime"], p["open"], p["high"], p["low"], p["close"], (r.get("volume") or {}).get("stock_volume", 0)])
        with gzip.open(sp, "wt") as f: f.write(sbuf.getvalue())
        print(f"stock {sym} {sday}: {len(sb)} bars")
    except Exception as e:
        print(f"stock {sym} skipped:", e)
