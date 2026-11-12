"""Cleaner 'volume divergence' candidate: session CVD (1-min up-volume minus down-volume, reset each day) vs price
pivots on 5-min bars. Bull: price makes a lower pivot low while CVD at that low is higher than at the previous pivot
low (sellers weaker); bear: mirror. Pivots use lbL left bars and lbR right bars; the signal is scored at
CONFIRMATION (lbR bars after the pivot), within the same session. In-sample = first 2/3 of days, out-of-sample = rest.
Usage: python3 team/tools/cvddiv_test.py   Educational only, not a recommendation."""
import glob, gzip, csv, os, math, statistics as st
from collections import defaultdict
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
files = sorted(glob.glob(os.path.join(ROOT, 'team/data/intraday_stocks/*.csv.gz')))
days = sorted({os.path.basename(f)[:10] for f in files}); cut = days[int(len(days) * 2 / 3)]
def run(lbL, lbR, minGap=3, maxGap=40):
    res = defaultdict(list)
    for f in files:
        day = os.path.basename(f)[:10]; part = 'IS' if day < cut else 'OOS'
        R = [dict(o=float(r['open']), h=float(r['high']), l=float(r['low']), c=float(r['close']), v=float(r['volume'])) for r in csv.DictReader(gzip.open(f, 'rt'))]
        B = []; cvd = 0.0
        for i in range(0, len(R) - 4, 5):
            g = R[i:i+5]
            for x in g: cvd += x['v'] if x['c'] > x['o'] else -x['v'] if x['c'] < x['o'] else 0
            B.append(dict(h=max(x['h'] for x in g), l=min(x['l'] for x in g), c=g[-1]['c'], cvd=cvd))
        lastL = lastH = None
        for t in range(lbL + lbR, len(B)):
            p = t - lbR
            lows = [b['l'] for b in B[p-lbL:t+1]]; highs = [b['h'] for b in B[p-lbL:t+1]]
            for kind in ('bull', 'bear'):
                isP = (B[p]['l'] == min(lows) and lows.count(B[p]['l']) == 1) if kind == 'bull' else (B[p]['h'] == max(highs) and highs.count(B[p]['h']) == 1)
                if not isP: continue
                prev = lastL if kind == 'bull' else lastH
                if prev is not None and minGap <= p - prev <= maxGap:
                    q = B[prev]
                    if kind == 'bull': sig = B[p]['l'] < q['l'] and B[p]['cvd'] > q['cvd']
                    else: sig = B[p]['h'] > q['h'] and B[p]['cvd'] < q['cvd']
                    if sig:
                        s = 1 if kind == 'bull' else -1
                        for k, lab in ((3, '15m'), (6, '30m')):
                            if t + k < len(B): res[(part, lab)].append(s * (B[t+k]['c'] / B[t]['c'] - 1))
                if kind == 'bull': lastL = p
                else: lastH = p
    return res
for lbL, lbR in ((5, 2), (5, 1), (3, 1), (8, 3)):
    r = run(lbL, lbR); line = f"pivot {lbL}/{lbR}:"
    for part in ('IS', 'OOS'):
        x = r[(part, '30m')]; m = st.mean(x); se = st.pstdev(x) / math.sqrt(len(x))
        x15 = r[(part, '15m')]
        line += f"  {part} n={len(x):3} 15m win {sum(a>0 for a in x15)/len(x15)*100:3.0f}%  30m win {sum(a>0 for a in x)/len(x)*100:3.0f}% avg {m*100:+.3f}% t={m/se:+.2f}"
    print(line)
