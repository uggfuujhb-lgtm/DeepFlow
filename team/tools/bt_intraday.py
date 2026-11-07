"""Intraday studies on archived SPX 1-minute bars (team/data/intraday/*.csv.gz).

Usage: python3 team/tools/bt_intraday.py daytype
  daytype: classify each archived day by Initial Balance (first hour, 9:30-10:30 ET) extension
           (Dalton-style heuristics): normal / normal variation / trend / neutral (+extreme).
  opentype: classify the first 30 minutes (9:30-10:00 ET) as open-drive / open-test-drive /
           open-rejection-reverse / open-auction (heuristic), plus where it opened vs the prior day's range.
  ib:      per day: 15-min opening range vs 1-hour Initial Balance, which IB side broke first (and when),
           whether both sides broke, extension as a multiple of IB, close vs IB midpoint.
  vwap:    SPX has no volume, so a time-weighted proxy (TWAP of typical price, cumulative from the open) with
           ±1 sd bands. After the first 30 min: how often the close crosses the line, % of minutes above it,
           and whether the 10:00 ET side (above/below) held to the close (known only at 10:00, no look-ahead).
  flowdelta: footprint proxy. Per 5-min bar, SPX options (calls_volume - puts_volume)/(calls+puts). Correlation with
           the same bar's move, and the NEXT bar's move after the top/bottom 20% imbalance bars (thresholds from
           the whole sample, so mildly in-sample), vs all bars as baseline.
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


def vwap_study(rows):
    import statistics as st
    tp = [(float(r["high"]) + float(r["low"]) + float(r["close"])) / 3 for r in rows]
    c = [float(r["close"]) for r in rows]
    tw, s = [], 0.0
    for i, v in enumerate(tp):
        s += v; tw.append(s / (i + 1))
    side = [1 if c[i] > tw[i] else -1 for i in range(len(c))]
    crosses = sum(1 for i in range(31, len(c)) if side[i] != side[i - 1])
    above = sum(1 for i in range(30, len(c)) if side[i] > 0) / max(1, len(c) - 30)
    sd = st.pstdev(tp)
    side10 = side[29] if len(c) > 30 else 0
    held = (c[-1] > tw[-1]) == (side10 > 0)
    return dict(twap_end=round(tw[-1], 2), sd=round(sd, 2), crosses=crosses, pct_above=round(above, 2),
                side_at_10=("above" if side10 > 0 else "below"), side_held_to_close=held,
                regime=("magnet (rotation)" if crosses >= 10 else "wall (one-sided)"))


if __name__ == "__main__":
    if (sys.argv[1:] or [""])[0] == "opentype":
        import datetime as _dt
        prev = None; prevd = None; n = 0
        for d, rows in days():
            n += 1; cur = _dt.date.fromisoformat(d)
            # only compare with the archive if it is the previous trading day (a missing day, e.g. Nov 5, breaks the chain)
            gap = (cur - prevd).days if prevd else None
            ok = gap == 1 or (gap == 3 and cur.weekday() == 0)
            r = open_type(rows, prev if ok else None)
            if prev is not None and not ok: r["open_location"] = "n/a (previous day not archived)"
            print(d, r); prev = rows; prevd = cur
        print(f"n={n} day(s)" + ("  العيّنة صغيرة، النتيجة غير موثوقة" if n < 30 else ""))
        sys.exit()
    if (sys.argv[1:] or [""])[0] == "flowdelta":
        import statistics as st
        X, S, Y = [], [], []
        for d, rows in days():
            b = []
            for i in range(0, len(rows) - 4, 5):
                g = rows[i:i + 5]; cv = sum(float(x["calls_volume"] or 0) for x in g); pv = sum(float(x["puts_volume"] or 0) for x in g)
                b.append((float(g[0]["open"]), float(g[-1]["close"]), (cv - pv) / max(1.0, cv + pv)))
            for k in range(len(b) - 1):
                X.append(b[k][2]); S.append(b[k][1] - b[k][0]); Y.append(b[k + 1][1] - b[k + 1][0])
        def corr(a, c):
            ma, mc = st.mean(a), st.mean(c); num = sum((x - ma) * (y - mc) for x, y in zip(a, c))
            return num / (sum((x - ma) ** 2 for x in a) * sum((y - mc) ** 2 for y in c)) ** 0.5
        def summ(name, ys):
            sd = st.stdev(ys); t = st.mean(ys) / (sd / len(ys) ** 0.5)
            print(f"{name}: n={len(ys)} mean={st.mean(ys):+.2f} median={st.median(ys):+.2f} up={sum(y > 0 for y in ys) / len(ys):.1%} sd={sd:.2f} t={t:+.2f}")
        q = sorted(X); lo, hi = q[int(0.2 * len(q))], q[int(0.8 * len(q))]
        print(f"corr(imbalance, same bar move)={corr(X, S):+.3f}  corr(imbalance, next bar move)={corr(X, Y):+.3f}")
        summ("all bars (next)", Y)
        summ("calls-heavy top 20% (next)", [y for x, y in zip(X, Y) if x >= hi])
        summ("puts-heavy bottom 20% (next)", [y for x, y in zip(X, Y) if x <= lo])
        n = len(list(days())); print(f"days={n} (points, no costs)" + ("  العيّنة صغيرة، النتيجة غير موثوقة" if n < 30 else ""))
        sys.exit()
    if (sys.argv[1:] or [""])[0] == "vwap":
        n = 0; held = 0
        for d, rows in days():
            n += 1; r = vwap_study(rows); held += r["side_held_to_close"]; print(d, r)
        print(f"n={n} day(s)  side at 10:00 ET held to close: {held}/{n}" + ("  العيّنة صغيرة، النتيجة غير موثوقة" if n < 30 else ""))
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
