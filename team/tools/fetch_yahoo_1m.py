"""Fetch up to ~30 days of regular-hours 1-minute bars (with volume) from Yahoo Finance's public chart endpoint,
saved in the same format as archive_day.py: team/data/intraday_stocks/YYYY-MM-DD_SYM.csv.gz (datetime_et = bar END,
like CBOE). Existing days are kept (CBOE archive wins). Yahoo allows 1m data only for the last ~30 days, 7 days per request.
Usage: python3 team/tools/fetch_yahoo_1m.py [SYM ...]"""
import csv, gzip, json, os, sys, time, urllib.request, datetime as dt
from zoneinfo import ZoneInfo
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
NY = ZoneInfo("America/New_York")
syms = sys.argv[1:] or ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "SPY", "QQQ"]
now = int(time.time()); start = now - 29 * 86400
for sym in syms:
    days = {}
    p1 = start
    while p1 < now:
        p2 = min(now, p1 + 7 * 86400)
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{sym}?interval=1m&period1={p1}&period2={p2}&includePrePost=false"
        r = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))["chart"]["result"][0]
        q = r["indicators"]["quote"][0]
        for i, ts in enumerate(r.get("timestamp") or []):
            o, h, l, c, v = (q[k][i] for k in ("open", "high", "low", "close", "volume"))
            if None in (o, h, l, c): continue
            t = dt.datetime.fromtimestamp(ts, NY)
            if not (dt.time(9, 30) <= t.time() < dt.time(16, 0)): continue
            end = t + dt.timedelta(minutes=1)
            days.setdefault(t.date().isoformat(), {})[end.strftime("%Y-%m-%dT%H:%M:%S")] = (o, h, l, c, v or 0)
        p1 = p2
        time.sleep(0.5)
    n = 0
    for day, bars in sorted(days.items()):
        out = os.path.join(ROOT, "team/data/intraday_stocks", f"{day}_{sym}.csv.gz")
        if os.path.exists(out) or len(bars) < 300: continue   # keep CBOE days; skip partial days
        with gzip.open(out, "wt") as f:
            w = csv.writer(f); w.writerow(["datetime_et", "open", "high", "low", "close", "volume"])
            for k in sorted(bars): w.writerow([k, *[round(x, 4) for x in bars[k][:4]], int(bars[k][4])])
        n += 1
    print(f"{sym}: {len(days)} days fetched, {n} new files")
