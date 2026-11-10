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
  dla              Direction->Location (daily proxy of Fabio's model): open above yday high (imbalance up).
                   A) buy the open -> close. B) limit buy AT yday high only if price comes back to it (low <= yday high)
                   -> close. Mirror for opens below yday low (short). Fills use only same-day prices that would have
                   filled a resting order; no stop, no costs.
  weak_close       day closes in the bottom 15% of its own range (any direction) -> next day: touches the prior
                   day's midpoint (value proxy)? close-to-close return; vs all days as baseline.
  opex             pinning check: monthly-expiration Fridays (3rd Friday, day 15-21) vs other Fridays: daily range and
                   distance of the close to the nearest 25-point strike (uniform would average 6.25).
  zerodte          regime comparison around daily SPX expirations (0DTE every weekday from mid-2022): median range,
                   open->close vs overnight-gap volatility (intraday share of variance), close distance to nearest
                   25-pt strike (uniform = 6.25). Periods: 2016-2019, 2020-May 2022, Jun 2022+. Descriptive only.
  opex_week        weekly close-to-close returns: monthly-OPEX week (week containing the 3rd Friday), the week after,
                   and all other weeks (charm/vanna "window of weakness" folklore check). Weeks keyed Mon-Fri by ISO week.
  skew             fear gauges: CBOE SKEW and VIX (free CSVs) ranked against their own trailing 252-day history
                   (no look-ahead). Top vs bottom quintile -> next 20-day SPX return and max drawdown, vs all days.
  term             VIX term structure: ratio VIX / VIX3M at the close (free Cboe CSVs). Backwardation (>1),
                   normal contango (0.85-1), steep contango (<0.85) -> next 5 and 20-day SPX return and 20-day max drawdown.
  delta_prob       is call delta a fair 'probability of finishing in the money'? For each day, strikes at
                   -5/-2.5/0/+2.5/+5% from the close, 20 trading days out, Black-Scholes delta N(d1) and N(d2) using that
                   day's VIX close as IV (r=0). Compare the average predicted value with the realized share of days where
                   SPX closed above the strike 20 days later. Overlapping windows.
  theta_gamma      theta vs gamma for a 1-day ATM straddle: premium ~ 0.8 * VIX * sqrt(1/252) * close (Black-Scholes ATM
                   approximation, VIX as the IV proxy) vs the realized |next close - close|. Positive edge = buyer (gamma) won,
                   negative = seller (theta) won. All days and split by VIX level. Approximation, no skew, no costs.
  vega             spot-vol link: daily SPX % change vs VIX point change (correlation, slope), split by down/up days,
                   and how often VIX rose on SPX down days. Explains why put buyers gain vega in selloffs.
  vanna           vanna-flow proxy: when VIX is elevated (yesterday's close >= its trailing-252-day 80th percentile) and
                   falls >= 5% today ("vol crush"), dealers' hedges unwind -> next 1 and 5-day SPX return. Compared with
                   elevated VIX rising >= 5%, elevated VIX overall, and all days. Signal known at the close; windows overlap.
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
elif a.study == "vega":
    import csv as _csv, io as _io
    u = "https://cdn.cboe.com/api/global/us_indices/daily_prices/VIX_History.csv"
    txt = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read().decode()
    vx = {}
    for r in _csv.DictReader(_io.StringIO(txt)):
        m, d_, y = r["DATE"].split("/"); vx[f"{y}-{m}-{d_}"] = float(r["CLOSE"])
    xs, ys = [], []
    for i in range(1, len(D)):
        d, pd_ = D[i][0], D[i - 1][0]
        if d in vx and pd_ in vx: xs.append(100 * (D[i][4] / D[i - 1][4] - 1)); ys.append(vx[d] - vx[pd_])
    mx, my = st.mean(xs), st.mean(ys)
    cov = sum((a - mx) * (b - my) for a, b in zip(xs, ys)) / len(xs)
    corr = cov / (st.pstdev(xs) * st.pstdev(ys)); slope = cov / st.pvariance(xs)
    print(f"days={len(xs)}  corr(SPX %, VIX pts) = {corr:+.2f}  slope = {slope:+.2f} VIX pts per 1% SPX")
    dn = [b for a, b in zip(xs, ys) if a < 0]; up = [b for a, b in zip(xs, ys) if a > 0]
    big = [b for a, b in zip(xs, ys) if a <= -2]
    print(f"SPX down days: n={len(dn)}  VIX rose {100*sum(b > 0 for b in dn)/len(dn):.1f}%  mean VIX change {st.mean(dn):+.2f}")
    print(f"SPX up days:   n={len(up)}  VIX fell {100*sum(b < 0 for b in up)/len(up):.1f}%  mean VIX change {st.mean(up):+.2f}")
    print(f"SPX <= -2% days: n={len(big)}  mean VIX change {st.mean(big):+.2f}  median {st.median(big):+.2f}")
elif a.study == "vanna":
    import csv as _csv, io as _io, bisect as _bs
    u = "https://cdn.cboe.com/api/global/us_indices/daily_prices/VIX_History.csv"
    txt = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read().decode()
    vx = {}
    for r in _csv.DictReader(_io.StringIO(txt)):
        m, d_, y = r["DATE"].split("/"); vx[f"{y}-{m}-{d_}"] = float(r["CLOSE"])
    C = [(d, c) for d, o, h, l, c in D if d in vx]
    g = {k: ([], []) for k in ("all", "VIX high", "VIX high & falls >=5% (vanna)", "VIX high & rises >=5%", "VIX low & falls >=5%")}
    for i in range(253, len(C) - 5):
        d, c = C[i]; pd_ = C[i - 1][0]
        hist = sorted(vx[C[j][0]] for j in range(i - 253, i - 1))  # trailing window ending yesterday-1 (no look-ahead)
        pct = _bs.bisect_left(hist, vx[pd_]) / len(hist)
        ch = vx[d] / vx[pd_] - 1
        f1 = 100 * (C[i + 1][1] / c - 1); f5 = 100 * (C[i + 5][1] / c - 1)
        keys = ["all"]
        if pct >= 0.8:
            keys.append("VIX high")
            if ch <= -0.05: keys.append("VIX high & falls >=5% (vanna)")
            if ch >= 0.05: keys.append("VIX high & rises >=5%")
        elif pct <= 0.2 and ch <= -0.05: keys.append("VIX low & falls >=5%")
        for k in keys: g[k][0].append(f1); g[k][1].append(f5)
    for k, (a1, a5) in g.items():
        print(f"== {k}"); summ("   next 1d", a1); summ("   next 5d", a5)
    print("note: 5-day windows overlap, so t-stats are inflated; no costs")
elif a.study == "theta_gamma":
    import csv as _csv, io as _io
    u = "https://cdn.cboe.com/api/global/us_indices/daily_prices/VIX_History.csv"
    txt = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read().decode()
    vx = {}
    for r in _csv.DictReader(_io.StringIO(txt)):
        m, d_, y = r["DATE"].split("/"); vx[f"{y}-{m}-{d_}"] = float(r["CLOSE"]) / 100
    closes = [(d, c) for d, o, h, l, c in D]
    g = {"all": [], "VIX<15": [], "VIX 15-25": [], "VIX>25": []}; ratio = []
    for i in range(len(closes) - 1):
        d, c = closes[i]
        if d not in vx: continue
        prem = 0.8 * vx[d] * math.sqrt(1 / 252) * c; move = abs(closes[i + 1][1] - c)
        edge = 100 * (move - prem) / c; ratio.append(move / prem)
        k = "VIX<15" if vx[d] < .15 else "VIX>25" if vx[d] > .25 else "VIX 15-25"
        g["all"].append(edge); g[k].append(edge)
    for k, v in g.items(): summ(f"{k:9} straddle buyer edge (% of index)", v)
    print(f"median realized move / premium: {st.median(ratio):.2f}  (1.0 = fair; <1 = theta (seller) won)")
    print(f"days the buyer won: {100*sum(r > 1 for r in ratio)/len(ratio):.1f}%")
elif a.study == "delta_prob":
    import csv as _csv, io as _io
    u = "https://cdn.cboe.com/api/global/us_indices/daily_prices/VIX_History.csv"
    txt = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read().decode()
    vx = {}
    for r in _csv.DictReader(_io.StringIO(txt)):
        m, d_, y = r["DATE"].split("/"); vx[f"{y}-{m}-{d_}"] = float(r["CLOSE"]) / 100
    N = lambda x: 0.5 * (1 + math.erf(x / math.sqrt(2)))
    closes = [(d, c) for d, o, h, l, c in D]; T = 20 / 252
    print("moneyness | avg delta N(d1) | avg N(d2) | realized share above strike | n")
    for mny in (-0.05, -0.025, 0.0, 0.025, 0.05):
        d1s, d2s, hit = [], [], []
        for i, (d, c) in enumerate(closes):
            if d not in vx or i + 20 >= len(closes): continue
            K = c * (1 + mny); s_ = vx[d]; v = s_ * math.sqrt(T)
            d1 = (math.log(c / K) + 0.5 * s_ * s_ * T) / v; d2 = d1 - v
            d1s.append(N(d1)); d2s.append(N(d2)); hit.append(1 if closes[i + 20][1] > K else 0)
        print(f"{mny*100:+5.1f}%    | {st.mean(d1s):.3f}           | {st.mean(d2s):.3f}     | {st.mean(hit):.3f}                       | {len(hit)}")
elif a.study == "term":
    import csv as _csv, io as _io
    def cboe_close(name):
        u = f"https://cdn.cboe.com/api/global/us_indices/daily_prices/{name}_History.csv"
        txt = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read().decode()
        out = {}
        for r in _csv.DictReader(_io.StringIO(txt)):
            m, d_, y = r["DATE"].split("/"); out[f"{y}-{m}-{d_}"] = float(r["CLOSE"])
        return out
    vx, v3 = cboe_close("VIX"), cboe_close("VIX3M")
    closes = [(d, c) for d, o, h, l, c in D]
    g = {k: ([], [], []) for k in ("backwardation >1", "contango 0.85-1", "steep contango <0.85", "all")}
    for i, (d, c) in enumerate(closes):
        if d not in vx or d not in v3 or i + 20 >= len(closes): continue
        r = vx[d] / v3[d]; k = "backwardation >1" if r > 1 else "contango 0.85-1" if r >= 0.85 else "steep contango <0.85"
        f5 = 100 * (closes[i + 5][1] / c - 1); f20 = 100 * (closes[i + 20][1] / c - 1)
        mdd = 100 * (min(x[1] for x in closes[i + 1:i + 21]) / c - 1)
        for kk in (k, "all"):
            g[kk][0].append(f5); g[kk][1].append(f20); g[kk][2].append(mdd)
    for k, (a5, a20, md) in g.items():
        print(f"== {k}: days={len(a5)}")
        summ("   next 5d ", a5); summ("   next 20d", a20)
        print(f"   20d max drawdown mean {st.mean(md):+.2f}%  median {st.median(md):+.2f}%")
    last = max(d for d in vx if d in v3); print(f"latest {last}: VIX {vx[last]:.2f} / VIX3M {v3[last]:.2f} = {vx[last]/v3[last]:.3f}")
    print("note: windows overlap, so t-stats are inflated")
elif a.study == "skew":
    import csv as _csv, io as _io, datetime as dt
    def cboe_csv(name, col):
        u = f"https://cdn.cboe.com/api/global/us_indices/daily_prices/{name}_History.csv"
        txt = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read().decode()
        out = {}
        for r in _csv.DictReader(_io.StringIO(txt)):
            m, d_, y = r["DATE"].split("/"); out[f"{y}-{m}-{d_}"] = float(r[col])
        return out
    series = {"SKEW": cboe_csv("SKEW", "SKEW"), "VIX": cboe_csv("VIX", "CLOSE")}
    closes = [(d, c) for d, o, h, l, c in D]
    for name, sv in series.items():
        hist, buckets = [], {"top": [], "bottom": [], "all": []}
        dd = {"top": [], "bottom": [], "all": []}
        for i, (d, c) in enumerate(closes):
            v = sv.get(d)
            if v is None: continue
            if len(hist) >= 252 and i + 20 < len(closes):
                past = sorted(hist[-252:]); pct = sum(x < v for x in past) / len(past)
                fwd = 100 * (closes[i + 20][1] / c - 1)
                mdd = 100 * (min(x[1] for x in closes[i + 1:i + 21]) / c - 1)
                g = "top" if pct >= 0.8 else "bottom" if pct < 0.2 else None
                buckets["all"].append(fwd); dd["all"].append(mdd)
                if g: buckets[g].append(fwd); dd[g].append(mdd)
            hist.append(v)
        print(f"== {name} (percentile vs trailing 252 days)")
        for g in ("all", "top", "bottom"):
            summ(f"  {g:6} next 20d return", buckets[g])
            print(f"         next 20d max drawdown: mean {st.mean(dd[g]):+.2f}%  median {st.median(dd[g]):+.2f}%")
elif a.study == "opex_week":
    import datetime as dt
    weeks = {}
    for d, o, h, l, c in D:
        k = dt.date.fromisoformat(d).isocalendar()[:2]; weeks.setdefault(k, []).append((d, c))
    keys = sorted(weeks); tag = {}
    for k in keys:
        for d, _ in weeks[k]:
            x = dt.date.fromisoformat(d)
            if x.weekday() == 4 and 15 <= x.day <= 21: tag[k] = "opex"
    rets = {"opex": [], "after": [], "other": []}
    for i in range(1, len(keys)):
        k, pk = keys[i], keys[i - 1]
        r = 100 * (weeks[k][-1][1] / weeks[pk][-1][1] - 1)
        g = "opex" if tag.get(k) == "opex" else "after" if tag.get(pk) == "opex" else "other"
        rets[g].append(r)
    summ("ALL weeks                ", [x for v in rets.values() for x in v])
    summ("OPEX week (3rd Friday)   ", rets["opex"]); summ("week AFTER OPEX          ", rets["after"]); summ("other weeks              ", rets["other"])
elif a.study == "zerodte":
    for lo, hi in (("2016-01-01", "2020-01-01"), ("2020-01-01", "2022-06-01"), ("2022-06-01", "2100-01-01")):
        rr, oc, gp, ds = [], [], [], []
        for i in range(1, len(D)):
            if not (lo <= D[i][0] < hi): continue
            pc = D[i - 1][4]; o, h, l, c = D[i][1:]
            rr.append(100 * (h - l) / pc); oc.append(100 * (c / o - 1)); gp.append(100 * (o / pc - 1)); ds.append(abs(c / 25 - round(c / 25)) * 25)
        if not rr: continue
        vo, vg = st.pstdev(oc), st.pstdev(gp)
        print(f"{lo[:7]}..{hi[:7]}: n={len(rr)}  range median {st.median(rr):.3f}%  sd open->close {vo:.3f}%  sd gap {vg:.3f}%  "
              f"intraday share of variance {vo**2/(vo**2+vg**2):.3f}  close-to-25-strike mean {st.mean(ds):.2f}")
elif a.study == "opex":
    import datetime as dt
    op, fr = [], []
    for i in range(1, len(D)):
        d = dt.date.fromisoformat(D[i][0])
        if d.weekday() != 4: continue
        rng = 100 * (D[i][2] - D[i][3]) / D[i - 1][4]; dist = abs(D[i][4] / 25 - round(D[i][4] / 25)) * 25
        (op if 15 <= d.day <= 21 else fr).append((rng, dist))
    for name, x in (("monthly opex Fridays", op), ("other Fridays", fr)):
        r = [v[0] for v in x]; ds = [v[1] for v in x]
        print(f"{name}: n={len(x)}  range mean {st.mean(r):.3f}% median {st.median(r):.3f}%  | close-to-25-strike mean {st.mean(ds):.2f} median {st.median(ds):.2f} pts")
    for k, lab in ((0, "range"), (1, "strike distance")):
        a1 = [v[k] for v in op]; b1 = [v[k] for v in fr]
        se = math.sqrt(st.pvariance(a1) / len(a1) + st.pvariance(b1) / len(b1))
        print(f"t ({lab} opex - other) = {(st.mean(a1) - st.mean(b1)) / se:+.2f}")
elif a.study == "weak_close":
    sig, base, ts, tb = [], [], 0, 0
    for i in range(1, len(D) - 1):
        _, o, h, l, c = D[i]; nh, nl, nc = D[i + 1][2], D[i + 1][3], D[i + 1][4]
        if h <= l: continue
        mid = (h + l) / 2; touch = nl <= mid <= nh; r = 100 * (nc / c - 1)
        base.append(r); tb += touch
        if (c - l) / (h - l) <= 0.15: sig.append(r); ts += touch
    print(f"next day touches prior midpoint: weak close {100*ts/len(sig):.1f}% (n={len(sig)})  vs all days {100*tb/len(base):.1f}% (n={len(base)})")
    summ("ALL days  next close-to-close", base); summ("WEAK close next close-to-close", sig)
elif a.study == "dla":
    for side in ("above", "below"):
        A, B, N = [], [], 0
        for i in range(1, len(D)):
            _, o, h, l, c = D[i]; ph, pl = D[i - 1][2], D[i - 1][3]
            if side == "above" and o > ph:
                N += 1; A.append(100 * (c / o - 1))
                if l <= ph: B.append(100 * (c / ph - 1))
            if side == "below" and o < pl:
                N += 1; A.append(-100 * (c / o - 1))
                if h >= pl: B.append(-100 * (c / pl - 1))
        word = "long" if side == "above" else "short"
        print(f"OPEN {side.upper()} yday range: n={N}")
        summ(f"  A) {word} at open -> close        ", A)
        summ(f"  B) {word} at yday extreme retest -> close", B)
        if N: print(f"     retest happened {100*len(B)/N:.1f}% of these days")
else:
    sys.exit("unknown study")
print("للتعليم فقط وليست توصية. بدون تكاليف، وبيانات يومية بس.")
