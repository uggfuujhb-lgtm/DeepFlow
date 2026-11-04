"""Intraday studies on archived SPX 1-minute bars (team/data/intraday/*.csv.gz).

Usage: python3 team/tools/bt_intraday.py daytype
  daytype: classify each archived day by Initial Balance (first hour, 9:30-10:30 ET) extension
           (Dalton-style heuristics): normal / normal variation / trend / neutral (+extreme).
Sample grows by one day per session; below 30 days results are anecdotal.
"""
import csv, glob, gzip, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def days():
    for p in sorted(glob.glob(os.path.join(ROOT, "team/data/intraday", "*_SPX.csv.gz"))):
        rows = [r for r in csv.DictReader(gzip.open(p, "rt"))]
        yield os.path.basename(p)[:10], rows


def daytype(rows):
    f = lambda r: (float(r["high"]), float(r["low"]), float(r["close"]))
    ib = [f(r) for r in rows if r["datetime_et"][11:16] < "10:30"]
    ibh, ibl = max(h for h, _, _ in ib), min(l for _, l, _ in ib)
    hi = max(float(r["high"]) for r in rows); lo = min(float(r["low"]) for r in rows); c = float(rows[-1]["close"])
    ibr = ibh - ibl; up = max(0, hi - ibh); dn = max(0, ibl - lo); pos = (c - lo) / (hi - lo)
    ext = max(up, dn) / ibr if ibr else 0
    if up > 0 and dn > 0:
        t = "neutral extreme" if pos >= 0.8 or pos <= 0.2 else "neutral"
    elif up == 0 and dn == 0:
        t = "normal"
    elif ext >= 2 and (pos >= 0.85 or pos <= 0.15):
        t = "trend " + ("up" if up else "down")
    elif ext >= 0.5:
        t = "normal variation " + ("up" if up else "down")
    else:
        t = "normal"
    return dict(ib=f"{ibl:.1f}-{ibh:.1f}", ib_range=round(ibr, 1), ext_up=round(up, 1), ext_dn=round(dn, 1),
                ext_x_ib=round(ext, 2), close_pos=round(pos, 2), type=t)


if __name__ == "__main__":
    if (sys.argv[1:] or ["daytype"])[0] == "daytype":
        n = 0
        for d, rows in days():
            n += 1; print(d, daytype(rows))
        print(f"n={n} day(s)" + ("  العيّنة صغيرة، النتيجة غير موثوقة" if n < 30 else ""))
