"""Daily SPX statistics / backtests from CBOE's free daily history (1975+; opens reliable only from 2014).

Usage: python3 team/tools/bt_daily.py STUDY [--from 2000-01-01]
Studies:
  close_near_low   down day closing in the bottom 10% of its range -> next day returns vs all days
  gap_fill         gaps >= 0.5% -> how often the gap fills the same day
  range            daily range (high-low)/prev close distribution
  trend_day        trend-day proxy: range >= 1.5x median of prior 20 days and close in top/bottom 10% -> next day
  failed_auction   look above/below yesterday's extreme and fail (close back inside) vs acceptance (close outside):
                   next-day returns, and how often the failed extreme is revisited within 5 days
  bracket_break    close beyond the prior 10-day high/low (leaving a multi-day bracket) -> next 1 and 5 day returns
  open_location    open above yesterday's high / below its low / inside -> open-to-close direction (OTF proxy)
  plan_open        day-plan stats: open inside yday range -> touches yday midpoint?; open above/below ->
                   trades back into yday range (rejection) and how it closes
  inside_day       balance proxy: day inside yesterday's range -> next day range & breakout side vs all days
Rules: signals use only data known at the close (no look-ahead); returns are index points/% with no costs.
Descriptive statistics for education, not a trading system.
"""
import argparse, json, math, os, statistics as st, sys, urllib.request

URL = "https://cdn.cboe.com/api/global/delayed_quotes/charts/historical/_SPX.json"
ap = argparse.ArgumentParser(); ap.add_argument("study"); ap.add_argument("--from", dest="start", default="2014-01-01")
ap.add_argument("--json"); a = ap.parse_args()
raw = json.load(open(a.json)) if a.json else json.load(urllib.request.urlopen(URL, timeout=60))
D = [(r["date"], float(r["open"]), float(r["high"]), float(r["low"]), float(r["close"])) for r in raw["data"]]
D = [d for d in D if d[0] >= a.start and d[1] > 0]
# data quality: before 2014 CBOE often stores open = previous close, which fakes "no gap" days
bad = sum(1 for i in range(1, len(D)) if abs(D[i][1] - D[i - 1][4]) < 0.01)
if bad: print(f"warning: {bad} days with open == previous close (suspect opens); prefer --from 2014-01-01")


def summ(name, xs):
    if not xs: print(f"{name}: n=0"); return
    m = st.mean(xs); sd = st.pstdev(xs) if len(xs) > 1 else 0
    t = m / (sd / math.sqrt(len(xs))) if sd else 0
    print(f"{name}: n={len(xs)}  mean={m:+.3f}%  median={st.median(xs):+.3f}%  up={100*sum(x>0 for x in xs)/len(xs):.1f}%  sd={sd:.2f}%  t={t:+.2f}")


print(f"SPX daily {D[0][0]} → {D[-1][0]} ({len(D)} days), source CBOE")
if a.study == "close_near_low":
    sig_cc, sig_oc, all_cc, all_oc = [], [], [], []
    for i in range(1, len(D) - 1):
        _, o, h, l, c = D[i]; pc = D[i - 1][4]; nxt = D[i + 1]
        cc = 100 * (nxt[4] / c - 1); oc = 100 * (nxt[4] / nxt[1] - 1)
        all_cc.append(cc); all_oc.append(oc)
        if c < pc and h > l and (c - l) / (h - l) <= 0.10:
            sig_cc.append(cc); sig_oc.append(oc)
    summ("ALL days  next close→close", all_cc); summ("SIGNAL    next close→close", sig_cc)
    summ("ALL days  next open→close ", all_oc); summ("SIGNAL    next open→close ", sig_oc)
elif a.study == "gap_fill":
    for side in ("up", "down"):
        n = f = 0
        for i in range(1, len(D)):
            _, o, h, l, c = D[i]; pc = D[i - 1][4]; g = 100 * (o / pc - 1)
            if side == "up" and g >= 0.5: n += 1; f += l <= pc
            if side == "down" and g <= -0.5: n += 1; f += h >= pc
        print(f"gap {side} >= 0.5%: n={n}  filled same day={100*f/max(n,1):.1f}%")
elif a.study == "range":
    r = sorted(100 * (d[2] - d[3]) / D[i - 1][4] for i, d in enumerate(D) if i)
    q = lambda p: r[int(p * (len(r) - 1))]
    print(f"daily range %: p25={q(.25):.2f} median={q(.5):.2f} p75={q(.75):.2f} p90={q(.9):.2f} p99={q(.99):.2f}")
elif a.study == "inside_day":
    rng = lambda i: 100 * (D[i][2] - D[i][3]) / D[i - 1][4]
    base = [rng(i + 1) for i in range(1, len(D) - 1)]
    sig, up, dn, both, none = [], 0, 0, 0, 0
    for i in range(1, len(D) - 1):
        if D[i][2] < D[i - 1][2] and D[i][3] > D[i - 1][3]:
            sig.append(rng(i + 1)); n = D[i + 1]
            u, d = n[2] > D[i][2], n[3] < D[i][3]
            both += u and d; up += u and not d; dn += d and not u; none += not (u or d)
    med = lambda xs: sorted(xs)[len(xs) // 2]
    print(f"next-day range: ALL median {med(base):.2f}% (n={len(base)})  AFTER INSIDE DAY median {med(sig):.2f}% (n={len(sig)})")
    t = len(sig)
    print(f"next day vs inside range: broke up only {100*up/t:.1f}%  down only {100*dn/t:.1f}%  both {100*both/t:.1f}%  stayed inside {100*none/t:.1f}%")
elif a.study == "trend_day":
    R = [None] + [100 * (D[i][2] - D[i][3]) / D[i - 1][4] for i in range(1, len(D))]
    out = {"up": ([], []), "down": ([], [])}; base = []
    for i in range(21, len(D) - 1):
        _, o, h, l, c = D[i]; n = D[i + 1]; med = sorted(R[i - 20:i])[10]
        cc = 100 * (n[4] / c - 1); base.append(cc)
        if R[i] < 1.5 * med or h == l: continue
        pos = (c - l) / (h - l)
        side = "up" if pos >= 0.9 and c > D[i - 1][4] else "down" if pos <= 0.1 and c < D[i - 1][4] else None
        if side: out[side][0].append(cc); out[side][1].append(100 * (n[4] / n[1] - 1))
    summ("ALL days next close→close", base)
    for side in ("up", "down"):
        summ(f"TREND {side:4} next close→close", out[side][0]); summ(f"TREND {side:4} next open→close ", out[side][1])
elif a.study == "failed_auction":
    base = [100 * (D[i + 1][4] / D[i][4] - 1) for i in range(1, len(D) - 1)]
    summ("ALL days        next close→close", base)
    for side in ("up", "down"):
        fail, acc, rev, revb = [], [], 0, 0
        for i in range(1, len(D) - 6):
            _, o, h, l, c = D[i]; ph, pl = D[i - 1][2], D[i - 1][3]; nxt = 100 * (D[i + 1][4] / c - 1)
            if side == "up" and h > ph:
                if c < ph:
                    fail.append(nxt); rev += any(D[k][2] > h for k in range(i + 1, i + 6))
                else:
                    acc.append(nxt); revb += any(D[k][2] > h for k in range(i + 1, i + 6))
            if side == "down" and l < pl:
                if c > pl:
                    fail.append(nxt); rev += any(D[k][3] < l for k in range(i + 1, i + 6))
                else:
                    acc.append(nxt); revb += any(D[k][3] < l for k in range(i + 1, i + 6))
        lab = "above yday high" if side == "up" else "below yday low "
        summ(f"FAILED {lab} next close→close", fail); summ(f"ACCEPT {lab} next close→close", acc)
        print(f"  extreme revisited within 5 days: failed {100*rev/max(len(fail),1):.1f}% (n={len(fail)})  accepted {100*revb/max(len(acc),1):.1f}% (n={len(acc)})")
elif a.study == "bracket_break":
    b1 = [100 * (D[i + 1][4] / D[i][4] - 1) for i in range(10, len(D) - 5)]
    b5 = [100 * (D[i + 5][4] / D[i][4] - 1) for i in range(10, len(D) - 5)]
    summ("ALL days next 1d", b1); summ("ALL days next 5d", b5)
    for side in ("up", "down"):
        r1, r5 = [], []
        for i in range(10, len(D) - 5):
            hh = max(d[2] for d in D[i - 10:i]); ll = min(d[3] for d in D[i - 10:i]); c = D[i][4]
            if (side == "up" and c > hh) or (side == "down" and c < ll):
                r1.append(100 * (D[i + 1][4] / c - 1)); r5.append(100 * (D[i + 5][4] / c - 1))
        summ(f"CLOSE {'above 10d high' if side=='up' else 'below 10d low '} next 1d", r1)
        summ(f"CLOSE {'above 10d high' if side=='up' else 'below 10d low '} next 5d", r5)
elif a.study == "open_location":
    groups = {"above": [], "below": [], "inside": []}
    for i in range(1, len(D)):
        _, o, h, l, c = D[i]; ph, pl = D[i - 1][2], D[i - 1][3]
        k = "above" if o > ph else "below" if o < pl else "inside"
        groups[k].append(100 * (c / o - 1))
    summ("ALL days open→close        ", [x for g in groups.values() for x in g])
    for k in ("above", "below", "inside"):
        summ(f"OPEN {k:6} yday range open→close", groups[k])
elif a.study == "plan_open":
    ins = mid = 0; res = {"above": [0, 0, [], []], "below": [0, 0, [], []]}
    for i in range(1, len(D)):
        _, o, h, l, c = D[i]; ph, pl = D[i - 1][2], D[i - 1][3]; m = (ph + pl) / 2
        if pl <= o <= ph:
            ins += 1; mid += l <= m <= h
        else:
            k = "above" if o > ph else "below"; r = res[k]; r[0] += 1
            back = (l <= ph) if k == "above" else (h >= pl)
            r[1] += back; (r[2] if back else r[3]).append(100 * (c / o - 1))
    print(f"open INSIDE yday range: n={ins}  touched yday midpoint same day {100*mid/ins:.1f}%")
    for k, (n, b, rb, ra) in res.items():
        print(f"open {k.upper()} yday range: n={n}  traded back into yday range {100*b/n:.1f}%")
        summ(f"  {k} + came back   open→close", rb); summ(f"  {k} + stayed out open→close", ra)
else:
    sys.exit("unknown study")
print("للتعليم فقط وليست توصية. بدون تكاليف، وبيانات يومية بس.")
