"""Candidate entry rules on archived 1-minute stock bars (team/data/intraday_stocks), scored as real trades:
entry = close of the signal 5-min bar, stop = the rule's structural stop, target = k x risk; win = target hit before stop
(1-minute path, same bar both -> loss), else exit at the close (counted by sign). In-sample = first 2/3 of days,
out-of-sample = last 1/3: a rule is only kept if it holds out-of-sample.
Rules (fixed in advance, no grid search):
  ib_break      first 5-min close outside the IB (after 10:30 ET); stop = IB midpoint
  ib_trend      ib_break only if it agrees with the day's direction (close vs open) at the break
  ib_trend_vol  ib_trend + break bar volume >= 1.5x SMA20
  or_break      first 5-min close outside the 9:30-9:45 range (after 9:45); stop = OR midpoint
  abs_fail      ABS buy (sell) whose low (high) breaks within the next 2 bars -> trade WITH the break; stop = ABS bar's other extreme
Usage: python3 team/tools/rules_test.py [--k 1.0]   Educational only, not a recommendation."""
import argparse, glob, gzip, csv, os, math, statistics as st
from collections import defaultdict
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ap = argparse.ArgumentParser(); ap.add_argument('--k', type=float, default=1.0); a = ap.parse_args()

def load(f):
    return [dict(t=r['datetime_et'][11:16], o=float(r['open']), h=float(r['high']), l=float(r['low']), c=float(r['close']), v=float(r['volume']))
            for r in csv.DictReader(gzip.open(f, 'rt'))]
def b5(rows):
    out = []
    for i in range(0, len(rows) - 4, 5):
        g = rows[i:i+5]
        up = sum(r['v'] if r['c'] > r['o'] else r['v']/2 if r['c'] == r['o'] else 0 for r in g)
        dn = sum(r['v'] if r['c'] < r['o'] else r['v']/2 if r['c'] == r['o'] else 0 for r in g)
        out.append(dict(t=g[-1]['t'], i1=i+4, o=g[0]['o'], h=max(r['h'] for r in g), l=min(r['l'] for r in g), c=g[-1]['c'], v=sum(r['v'] for r in g), d=up-dn))
    return out
def trade(rows, i1, side, entry, stop, k):
    risk = abs(entry - stop)
    if risk <= 0: return None
    tgt = entry + side * k * risk
    for r in rows[i1+1:]:
        hit_s = r['l'] <= stop if side > 0 else r['h'] >= stop
        hit_t = r['h'] >= tgt if side > 0 else r['l'] <= tgt
        if hit_s: return -1.0
        if hit_t: return k
    return side * (rows[-1]['c'] - entry) / risk

files = defaultdict(list)
for f in sorted(glob.glob(os.path.join(ROOT, 'team/data/intraday_stocks/*.csv.gz'))):
    b = os.path.basename(f); files[b[11:-7]].append((b[:10], f))
days = sorted({d for fl in files.values() for d, _ in fl}); cut = days[int(len(days) * 2 / 3)]
res = defaultdict(lambda: {'IS': [], 'OOS': []})
for sym, fl in files.items():
    hist = []; atr = None; trs = []
    for day, f in fl:
        rows = load(f); B = b5(rows); part = 'IS' if day < cut else 'OOS'
        orH = max(x['h'] for x in B[:3]); orL = min(x['l'] for x in B[:3])
        ibH = max(x['h'] for x in B[:12]); ibL = min(x['l'] for x in B[:12])
        done = set()
        for i, b in enumerate(B):
            pc = hist[-1]['c'] if hist else b['o']; tr = max(b['h']-b['l'], abs(b['h']-pc), abs(b['l']-pc)); trs.append(tr)
            atr = st.mean(trs) if len(trs) <= 14 else (atr*13 + tr)/14
            vavg = st.mean(x['v'] for x in hist[-20:]) if len(hist) >= 20 else None; hist.append(b)
            if i >= 3 and 'or' not in done and (b['c'] > orH or b['c'] < orL):
                done.add('or'); s = 1 if b['c'] > orH else -1
                res['or_break'][part].append(trade(rows, b['i1'], s, b['c'], (orH+orL)/2, a.k))
            if i >= 12 and 'ib' not in done and (b['c'] > ibH or b['c'] < ibL):
                done.add('ib'); s = 1 if b['c'] > ibH else -1; r_ = trade(rows, b['i1'], s, b['c'], (ibH+ibL)/2, a.k)
                res['ib_break'][part].append(r_)
                if (b['c'] - B[0]['o']) * s > 0:
                    res['ib_trend'][part].append(r_)
                    if vavg and b['v'] >= 1.5 * vavg: res['ib_trend_vol'][part].append(r_)
            # absorption failure -> continuation
            if vavg and i + 2 < len(B):
                big = b['v'] >= 1.8*vavg; tight = b['h']-b['l'] <= 0.9*atr; strong = b['v'] > 0 and abs(b['d']) >= 0.25*b['v']; mid = (b['h']+b['l'])/2
                for s, cond, brk in ((-1, b['d'] < 0 and b['c'] >= mid, b['l']), (1, b['d'] > 0 and b['c'] <= mid, b['h'])):
                    if big and tight and strong and cond:
                        for j in (i+1, i+2):
                            x = B[j]
                            if (s < 0 and x['c'] < brk) or (s > 0 and x['c'] > brk):
                                stop = b['h'] if s < 0 else b['l']
                                res['abs_fail'][part].append(trade(rows, x['i1'], s, x['c'], stop, a.k)); break
print(f"days {len(days)} ({days[0]}..{days[-1]}), in-sample < {cut} <= out-of-sample, target {a.k}R, 9 symbols")
for name in ('or_break', 'ib_break', 'ib_trend', 'ib_trend_vol', 'abs_fail'):
    line = f"{name:13}"
    for part in ('IS', 'OOS'):
        x = [r for r in res[name][part] if r is not None]
        if not x: line += f"  {part}: n=0"; continue
        w = sum(r > 0 for r in x) / len(x); m = st.mean(x); se = (st.pstdev(x) or 1e-9) / math.sqrt(len(x))
        line += f"  {part}: n={len(x):3} win {w*100:3.0f}%  avg {m:+.2f}R  t={m/se:+.2f}"
    print(line)
