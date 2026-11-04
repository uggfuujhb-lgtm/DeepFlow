"""TPO (Market Profile) from archived 1-minute SPX bars.
Usage: python3 team/tools/tpo.py YYYY-MM-DD [--tick 2.5] [--va 0.70]
Prints the letters profile, POC (most TPOs), value area (~70% of TPOs around POC), and Initial Balance (first hour).
Each 30-minute period gets a letter (A = 9:30-10:00 ET). Source: team/data/intraday (CBOE delayed).
"""
import argparse, csv, gzip, math, os, string

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ap = argparse.ArgumentParser(); ap.add_argument("day"); ap.add_argument("--tick", type=float, default=2.5)
ap.add_argument("--va", type=float, default=0.70); a = ap.parse_args()
rows = list(csv.DictReader(gzip.open(os.path.join(ROOT, "team/data/intraday", f"{a.day}_SPX.csv.gz"), "rt")))
per = {}
for r in rows:
    hh, mm = int(r["datetime_et"][11:13]), int(r["datetime_et"][14:16])
    k = ((hh * 60 + mm) - (9 * 60 + 30)) // 30
    lo, hi = per.get(k, (1e9, -1e9)); per[k] = (min(lo, float(r["low"])), max(hi, float(r["high"])))
prof = {}
for k, (lo, hi) in sorted(per.items()):
    p = math.floor(lo / a.tick) * a.tick
    while p <= hi:
        prof.setdefault(round(p, 2), []).append(string.ascii_uppercase[k]); p += a.tick
prices = sorted(prof); total = sum(len(v) for v in prof.values())
mid = sum(prices) / len(prices)
poc = max(prices, key=lambda p: (len(prof[p]), -abs(p - mid)))
i = j = prices.index(poc); got = len(prof[poc])
while got < a.va * total and (i > 0 or j < len(prices) - 1):
    up = len(prof[prices[j + 1]]) if j < len(prices) - 1 else -1
    dn = len(prof[prices[i - 1]]) if i > 0 else -1
    if up >= dn: j += 1; got += up
    else: i -= 1; got += dn
ib_lo = min(per[k][0] for k in (0, 1) if k in per); ib_hi = max(per[k][1] for k in (0, 1) if k in per)
for p in reversed(prices): print(f"{p:8.1f} {''.join(prof[p])}")
print(f"\nPOC {poc}  VAL {prices[i]}  VAH {prices[j] + a.tick}  IB {ib_lo:.2f}-{ib_hi:.2f}  TPOs {total}  periods {len(per)}")
