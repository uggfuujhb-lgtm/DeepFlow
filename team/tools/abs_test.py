"""Absorption detector test: replicates Pine v6.4 'كاشف الامتصاص' on archived 1-minute stock bars
(team/data/intraday_stocks: CBOE archive + Yahoo backfill via fetch_yahoo_1m.py).
5-min candles from 1-min bars; delta = up-volume - down-volume of the 1-min bars (doji split), as in the indicator.
Signal: volume >= volX * SMA20(volume), range <= rngX * ATR14, |delta| >= dltP% of volume, delta against the close half;
'near' = the signal extreme within tol*ATR of OR, IB (after it completes) or yesterday's VAH / VAL / POC (gamma levels for
stocks are not archived). Volume average and ATR run across days, like on a TradingView chart.
Outcome: signed return at +3 / +6 bars (15 / 30 min) and 'held' = the signal extreme not broken in the next 6 bars.
Controls: every bar, and big-volume bars with the same delta-vs-close pattern but no range filter.
Usage: python3 team/tools/abs_test.py [--volx 1.8 --dltp 25 --rngx 0.9 --tol 0.3] [--list]
Educational only, not a recommendation."""
import argparse, glob, gzip, csv, os, math, statistics as st
from collections import defaultdict
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ap = argparse.ArgumentParser()
ap.add_argument('--volx', type=float, default=1.8); ap.add_argument('--dltp', type=float, default=25)
ap.add_argument('--rngx', type=float, default=0.9); ap.add_argument('--tol', type=float, default=0.3)
ap.add_argument('--len', type=int, default=20); ap.add_argument('--list', action='store_true')
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

def value_area(rows, nrows=120, va=0.70):
    lo = min(r['l'] for r in rows); hi = max(r['h'] for r in rows)
    if hi <= lo: return None
    step = (hi - lo) / nrows; vol = [0.0] * nrows
    for r in rows:
        a_ = min(nrows - 1, int((r['l'] - lo) / step)); b_ = min(nrows - 1, int((r['h'] - lo) / step))
        for k in range(a_, b_ + 1): vol[k] += r['v'] / (b_ - a_ + 1)
    poc = max(range(nrows), key=lambda k: vol[k]); tot = sum(vol); acc = vol[poc]; l_ = h_ = poc
    while acc < tot * va and (l_ > 0 or h_ < nrows - 1):
        up = vol[h_ + 1] if h_ < nrows - 1 else -1; dn = vol[l_ - 1] if l_ > 0 else -1
        if up >= dn: h_ += 1; acc += up
        else: l_ -= 1; acc += dn
    return [lo + (poc + .5) * step, lo + (h_ + 1) * step, lo + l_ * step]

files = defaultdict(list)
for f in sorted(glob.glob(os.path.join(ROOT, 'team/data/intraday_stocks/*.csv.gz'))):
    b = os.path.basename(f); files[b[11:-7]].append((b[:10], f))

R = defaultdict(list)
for sym, fl in files.items():
    prev_rows = None; hist = []; atr = None; trs = []
    for day, f in fl:
        rows = [dict(t=r['datetime_et'], o=float(r['open']), h=float(r['high']), l=float(r['low']), c=float(r['close']), v=float(r['volume']))
                for r in csv.DictReader(gzip.open(f, 'rt'))]
        B = bars5(rows)
        pva = value_area(prev_rows) if prev_rows else []
        for i, b in enumerate(B):
            pc = (hist[-1]['c'] if hist else b['o'])
            tr = max(b['h'] - b['l'], abs(b['h'] - pc), abs(b['l'] - pc)); trs.append(tr)
            atr = st.mean(trs) if len(trs) <= 14 else (atr * 13 + tr) / 14
            prev = hist[-a.len:]; hist.append(b)
            if len(prev) < a.len or i + 6 >= len(B): continue
            vavg = st.mean(x['v'] for x in prev)
            lv = list(pva or [])
            if i >= 3: lv += [max(x['h'] for x in B[:3]), min(x['l'] for x in B[:3])]
            if i >= 12: lv += [max(x['h'] for x in B[:12]), min(x['l'] for x in B[:12])]
            tol = atr * a.tol; nxt = B[i + 1:i + 7]
            r3 = B[i + 3]['c'] / b['c'] - 1; r6 = B[i + 6]['c'] / b['c'] - 1
            big = b['v'] >= vavg * a.volx; tight = (b['h'] - b['l']) <= atr * a.rngx
            strong = b['v'] > 0 and abs(b['d']) >= b['v'] * a.dltp / 100; mid = (b['h'] + b['l']) / 2
            for side, sgn in (('buy', 1), ('sell', -1)):
                ext = b['l'] if side == 'buy' else b['h']
                held = (min(x['l'] for x in nxt) > b['l']) if side == 'buy' else (max(x['h'] for x in nxt) < b['h'])
                rec = dict(sym=sym, day=day, t=b['t'][11:16], r3=sgn * r3, r6=sgn * r6, held=held,
                           near=any(abs(ext - x) <= tol for x in lv))
                R['base_' + side].append(rec)
                pattern = strong and ((b['d'] < 0 and b['c'] >= mid) if side == 'buy' else (b['d'] > 0 and b['c'] <= mid))
                if big and pattern: R['bigpat_' + side].append(rec)
                if big and tight and pattern:
                    R[side].append(rec)
                    if a.list:
                        print(f"{sym:5} {day} {b['t'][11:16]} ET {side:4} near={'Y' if rec['near'] else 'n'} +15m {rec['r3']*100:+.2f}% +30m {rec['r6']*100:+.2f}% held={'Y' if held else 'n'}")
        prev_rows = rows

def summ(name, xs):
    if not xs: print(f"{name:34} n=0"); return
    out = [f"{name:34} n={len(xs):5}"]
    for k, lab in (('r3', '+15m'), ('r6', '+30m')):
        v = [x[k] for x in xs]; m = st.mean(v); sd = st.pstdev(v) or 1e-9
        out.append(f"{lab} {m*100:+.3f}% win {sum(x > 0 for x in v)/len(v)*100:3.0f}% t={m/(sd/math.sqrt(len(v))):+.2f}")
    out.append(f"held {sum(x['held'] for x in xs)/len(xs)*100:3.0f}%"); print("  ".join(out))
days = sorted({d for fl in files.values() for d, _ in fl})
print(f"data: {len(files)} symbols, {len(days)} days ({days[0]} .. {days[-1]})   params volx={a.volx} dltp={a.dltp} rngx={a.rngx} tol={a.tol}")
both = R['buy'] + R['sell']
summ('ABS buy', R['buy']); summ('ABS sell', R['sell']); summ('ABS both', both)
summ('ABS both, near a level', [x for x in both if x['near']]); summ('ABS both, NOT near a level', [x for x in both if not x['near']])
summ('ABS both, first hour (<10:30 ET)', [x for x in both if x['t'] < '10:30'])
summ('control: big vol + delta pattern', R['bigpat_buy'] + R['bigpat_sell'])
summ('control: any bar (long+short)', R['base_buy'] + R['base_sell'])
summ('control: any bar near a level', [x for x in R['base_buy'] + R['base_sell'] if x['near']])
