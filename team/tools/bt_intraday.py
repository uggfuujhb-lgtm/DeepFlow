"""Intraday studies on archived SPX 1-minute bars (team/data/intraday/*.csv.gz).

Usage: python3 team/tools/bt_intraday.py daytype
  daytype: classify each archived day by Initial Balance (first hour, 9:30-10:30 ET) extension
           (Dalton-style heuristics): normal / normal variation / trend / neutral (+extreme).
  opentype: classify the first 30 minutes (9:30-10:00 ET) as open-drive / open-test-drive /
           open-rejection-reverse / open-auction (heuristic), plus where it opened vs the prior day's range.
  ib:      per day: 15-min opening range vs 1-hour Initial Balance, which IB side broke first (and when),
           whether both sides broke, extension as a multiple of IB, close vs IB midpoint.
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


def ib_study(rows):
    t = lambda r: r["datetime_et"][11:16]
    orr = [r for r in rows if t(r) < "09:45"]; ib = [r for r in rows if t(r) < "10:30"]; rest = [r for r in rows if t(r) >= "10:30"]
    hi = lambda rs: max(float(r["high"]) for r in rs); lo = lambda rs: min(float(r["low"]) for r in rs)
    orh, orl, ibh, ibl = hi(orr), lo(orr), hi(ib), lo(ib)
    first = None; up_t = dn_t = None
    for r in rest:
        if up_t is None and float(r["high"]) > ibh: up_t = t(r)
        if dn_t is None and float(r["low"]) < ibl: dn_t = t(r)
    if up_t or dn_t:
        first = "up" if (up_t and (not dn_t or up_t <= dn_t)) else "down"
    c = float(rows[-1]["close"]); mid = (ibh + ibl) / 2; ibr = ibh - ibl
    ext = max(max(0, hi(rest) - ibh), max(0, ibl - lo(rest))) / ibr if rest and ibr else 0
    return dict(or15=f"{orl:.1f}-{orh:.1f} ({orh-orl:.1f})", ib=f"{ibl:.1f}-{ibh:.1f} ({ibr:.1f})",
                or_share_of_ib=f"{100*(orh-orl)/ibr:.0f}%", first_break=first, up_at=up_t, down_at=dn_t,
                both=bool(up_t and dn_t), ext_x_ib=round(ext, 2),
                close_vs_mid="above" if c > mid else "below", close=round(c, 2))


def open_type(rows, prev=None, tol=2.0):
    t = lambda r: r["datetime_et"][11:16]
    first = [r for r in rows if t(r) < "10:00"]
    o = float(first[0]["open"]); hi = max(float(r["high"]) for r in first); lo = min(float(r["low"]) for r in first)
    c30 = float(first[-1]["close"]); up, dn = hi - o, o - lo
    # did price trade back through the open after the first 5 minutes?
    later = [r for r in first if t(r) >= "09:35"]
    back_up = any(float(r["low"]) < o - tol for r in later); back_dn = any(float(r["high"]) > o + tol for r in later)
    if up >= 3 * max(dn, tol) and not back_up and c30 > o: typ = "open-drive up"
    elif dn >= 3 * max(up, tol) and not back_dn and c30 < o: typ = "open-drive down"
    elif min(up, dn) > tol and max(up, dn) >= 2.5 * min(up, dn):
        # probed the small side first, then went the big side
        typ = "open-test-drive " + ("up" if up > dn and c30 > o else "down" if dn > up and c30 < o else "?")
        if typ.endswith("?"): typ = "open-rejection-reverse"
    elif (up > tol and c30 < o - tol) or (dn > tol and c30 > o + tol):
        typ = "open-rejection-reverse"
    else:
        typ = "open-auction"
    loc = None
    if prev:
        ph = max(float(r["high"]) for r in prev); pl = min(float(r["low"]) for r in prev)
        loc = "above prior range" if o > ph else "below prior range" if o < pl else "inside prior range"
    c = float(rows[-1]["close"])
    return dict(open=round(o, 2), first30=f"{lo:.1f}-{hi:.1f}", type=typ, open_location=loc, close=round(c, 2),
                open_to_close=round(c - o, 1))


if __name__ == "__main__":
    if (sys.argv[1:] or [""])[0] == "opentype":
        prev = None; n = 0
        for d, rows in days():
            n += 1; print(d, open_type(rows, prev)); prev = rows
        print(f"n={n} day(s)" + ("  العيّنة صغيرة، النتيجة غير موثوقة" if n < 30 else ""))
        sys.exit()
    if (sys.argv[1:] or [""])[0] == "ib":
        n = 0
        for d, rows in days():
            n += 1; print(d, ib_study(rows))
        print(f"n={n} day(s)  (times ET; IB = 9:30-10:30 ET = 5:30-6:30 PM Riyadh)" + ("  العيّنة صغيرة، النتيجة غير موثوقة" if n < 30 else ""))
    elif (sys.argv[1:] or ["daytype"])[0] == "daytype":
        n = 0
        for d, rows in days():
            n += 1; print(d, daytype(rows))
        print(f"n={n} day(s)" + ("  العيّنة صغيرة، النتيجة غير موثوقة" if n < 30 else ""))
