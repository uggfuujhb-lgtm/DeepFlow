"""Test of the public TradingView script 'Volume Divergence by MM' (MPL-2.0), re-implemented from its source:
signed volume (candle colour) smoothed by 5 chained weighted MAs (5, 8, 13, 21, 34), pivots 5/5 bars, regular
bull (price lower low, indicator higher low) and bear (price higher high, indicator lower high) divergences.
Signals are scored at CONFIRMATION time (5 bars after the pivot, which the script draws back with offset=-5).
Usage: python3 team/tools/voldiv_test.py   Educational only, not a recommendation."""
import glob, gzip, csv, os, math, statistics as st
from collections import defaultdict
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
def wma(x, sgn, y):
    out = []
    for t in range(len(x)):
        if t < y - 1 or any(v is None for v in x[t-y+1:t+1]): out.append(None); continue
        norm = s = 0.0
        for i in range(y):
            w = (y - i) * y; norm += w; s += x[t-i] * w * sgn[t-i]
        out.append(s / norm)
    return out
files = defaultdict(list)
for f in sorted(glob.glob(os.path.join(ROOT, 'team/data/intraday_stocks/*.csv.gz'))):
    b = os.path.basename(f); files[b[11:-7]].append(f)
lbL = lbR = 5; rU, rL = 60, 5
res = defaultdict(list)
for sym, fl in files.items():
    B = []; day_end = []
    for f in fl:
        R = [dict(o=float(r['open']), h=float(r['high']), l=float(r['low']), c=float(r['close']), v=float(r['volume'])) for r in csv.DictReader(gzip.open(f, 'rt'))]
        for i in range(0, len(R) - 4, 5):
            g = R[i:i+5]; B.append(dict(o=g[0]['o'], h=max(x['h'] for x in g), l=min(x['l'] for x in g), c=g[-1]['c'], v=sum(x['v'] for x in g)))
        day_end.append(len(B) - 1)
    sgn = [-1 if b['c'] < b['o'] else 1 for b in B]
    v = [b['v'] for b in B]
    for L in (5, 8, 13, 21, 34): v = wma(v, sgn, L)
    ends = set(day_end); n = len(B)
    lastPL = []; lastPH = []   # (bar of pivot, vol, low/high)
    for t in range(lbL + lbR, n):
        p = t - lbR
        if v[p] is None or any(v[k] is None for k in range(p - lbL, t + 1)): continue
        win = v[p - lbL:t + 1]
        pl = v[p] == min(win) and win.count(v[p]) == 1
        ph = v[p] == max(win) and win.count(v[p]) == 1
        for found, lst, kind in ((pl, lastPL, 'bull'), (ph, lastPH, 'bear')):
            if not found: continue
            if lst:
                pb, pv, pp = lst[-1]
                inrange = rL <= (p - pb) <= rU
                if kind == 'bull': cond = inrange and v[p] > pv and B[p]['l'] < pp
                else: cond = inrange and v[p] < pv and B[p]['h'] > pp
                if cond:
                    # score from the confirmation bar t, within the same session only
                    nxt = next((e for e in sorted(ends) if e >= t), n - 1)
                    s = 1 if kind == 'bull' else -1
                    for k, lab in ((3, '15m'), (6, '30m'), (12, '60m')):
                        if t + k <= nxt: res[(kind, lab)].append(s * (B[t+k]['c'] / B[t]['c'] - 1))
                    res[(kind, 'lag')].append(t - p)
            lst.append((p, v[p], B[p]['l'] if kind == 'bull' else B[p]['h']))
print("Volume Divergence by MM, 21 days x 9 symbols, 5-min, scored when the signal is confirmed")
for kind in ('bull', 'bear'):
    line = f"{kind:5}"
    for lab in ('15m', '30m', '60m'):
        x = res[(kind, lab)]
        if not x: continue
        m = st.mean(x); se = st.pstdev(x) / math.sqrt(len(x)) or 1e-9
        line += f"  {lab}: n={len(x):3} avg {m*100:+.3f}% win {sum(a > 0 for a in x)/len(x)*100:3.0f}% t={m/se:+.2f}"
    print(line)
