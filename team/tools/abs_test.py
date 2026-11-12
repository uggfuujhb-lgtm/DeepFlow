"""Absorption detector test: replicates Pine v6.4 'كاشف الامتصاص' on archived 1-minute stock bars.
5-min candles built from 1-min bars; delta = up-volume - down-volume of the 1-min bars (doji split).
Signal: volume >= volX * avg(20), range <= rngX * ATR14, |delta| >= dltP% of volume, delta against the close half,
optionally near IB / OR levels (gamma and prev-day VA not archived for stocks yet).
Outcome after the signal bar: signed return at +3 and +6 bars, and 'held' = the signal extreme not broken in the next 6 bars.
Usage: python3 team/tools/abs_test.py [--volx 1.8 --dltp 25 --rngx 0.9 --tol 0.3]
Educational only, not a recommendation."""
import argparse, glob, gzip, csv, os, statistics as st
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ap = argparse.ArgumentParser()
ap.add_argument('--volx', type=float, default=1.8); ap.add_argument('--dltp', type=float, default=25)
ap.add_argument('--rngx', type=float, default=0.9); ap.add_argument('--tol', type=float, default=0.3)
ap.add_argument('--len', type=int, default=20); ap.add_argument('--warm', type=int, default=6)
ap.add_argument('--quiet', action='store_true')
a = ap.parse_args()

def bars5(rows):
    out = []
    for i in range(0, len(rows) - 4, 5):
        g = rows[i:i + 5]
        up = sum(r['v'] if r['c'] > r['o'] else r['v'] / 2 if r['c'] == r['o'] else 0 for r in g)
        dn = sum(r['v'] if r['c'] < r['o'] else r['v'] / 2 if r['c'] == r['o'] else 0 for r in g)
        out.append(dict(t=g[0]['t'], o=g[0]['o'], h=max(r['h'] for r in g), l=min(r['l'] for r in g), c=g[-1]['c'],
                        v=sum(r['v'] for r in g), d=up - dn))
    return out

res = {'buy': [], 'sell': [], 'base_buy': [], 'base_sell': []}
for f in sorted(glob.glob(os.path.join(ROOT, 'team/data/intraday_stocks/*.csv.gz'))):
    sym = os.path.basename(f)[11:-7]
    rows = [dict(t=r['datetime_et'], o=float(r['open']), h=float(r['high']), l=float(r['low']), c=float(r['close']), v=float(r['volume']))
            for r in csv.DictReader(gzip.open(f, 'rt'))]
    B = bars5(rows)
    atr = None; trs = []
    for i, b in enumerate(B):
        tr = b['h'] - b['l'] if i == 0 else max(b['h'] - b['l'], abs(b['h'] - B[i-1]['c']), abs(b['l'] - B[i-1]['c']))
        trs.append(tr)
        atr = st.mean(trs) if i < 14 else (atr * 13 + tr) / 14
        if i + 6 >= len(B) or i < a.warm:
            continue
        vavg = st.mean(x['v'] for x in B[max(0, i - a.len):i])
        orH = max(x['h'] for x in B[:3]); orL = min(x['l'] for x in B[:3])
        lv = [orH, orL] if i >= 3 else []
        if i >= 12:
            lv += [max(x['h'] for x in B[:12]), min(x['l'] for x in B[:12])]
        tol = atr * a.tol
        nxt = B[i+1:i+7]
        r3 = B[i+3]['c'] / b['c'] - 1; r6 = B[i+6]['c'] / b['c'] - 1
        heldB = min(x['l'] for x in nxt) > b['l']; heldS = max(x['h'] for x in nxt) < b['h']
        res['base_buy'].append((r3, r6, heldB)); res['base_sell'].append((-r3, -r6, heldS))
        big = b['v'] >= vavg * a.volx; tight = (b['h'] - b['l']) <= atr * a.rngx
        strong = b['v'] > 0 and abs(b['d']) >= b['v'] * a.dltp / 100
        mid = (b['h'] + b['l']) / 2
        for side in ('buy', 'sell'):
            ok = big and tight and strong and ((b['d'] < 0 and b['c'] >= mid) if side == 'buy' else (b['d'] > 0 and b['c'] <= mid))
            if not ok: continue
            ext = b['l'] if side == 'buy' else b['h']
            near = any(abs(ext - x) <= tol for x in lv)
            sgn = 1 if side == 'buy' else -1
            res[side].append(dict(sym=sym, t=b['t'][11:16], near=near, r3=sgn * r3, r6=sgn * r6, held=heldB if side == 'buy' else heldS))
            if not a.quiet:
                print(f"{sym:5} {b['t'][11:16]} ET {side:4} near={'Y' if near else 'n'}  vol x{b['v']/vavg:.1f}  delta {b['d']/b['v']*100:+.0f}%  "
                      f"+15m {sgn*r3*100:+.2f}%  +30m {sgn*r6*100:+.2f}%  held={'Y' if (heldB if side=='buy' else heldS) else 'n'}")

def summ(name, xs):
    if not xs: print(f"{name:28} n=0"); return
    r3 = [x['r3'] if isinstance(x, dict) else x[0] for x in xs]; r6 = [x['r6'] if isinstance(x, dict) else x[1] for x in xs]
    h = [x['held'] if isinstance(x, dict) else x[2] for x in xs]
    print(f"{name:28} n={len(xs):4}  +15m avg {st.mean(r3)*100:+.3f}% (win {sum(r>0 for r in r3)/len(r3)*100:.0f}%)  "
          f"+30m avg {st.mean(r6)*100:+.3f}% (win {sum(r>0 for r in r6)/len(r6)*100:.0f}%)  held {sum(h)/len(h)*100:.0f}%")
print(f"\nparams volx={a.volx} dltp={a.dltp} rngx={a.rngx} tol={a.tol}")
summ('ABS buy (all)', res['buy']); summ('ABS buy near level', [x for x in res['buy'] if x['near']])
summ('ABS sell (all)', res['sell']); summ('ABS sell near level', [x for x in res['sell'] if x['near']])
summ('ABS both (all)', res['buy'] + res['sell']); summ('ABS both near level', [x for x in res['buy'] + res['sell'] if x['near']])
summ('baseline: any bar, long', res['base_buy']); summ('baseline: any bar, short', res['base_sell'])
