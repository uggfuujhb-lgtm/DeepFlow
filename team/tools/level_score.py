#!/usr/bin/env python3
"""Daily scorecard: did SPX react at the morning gamma levels?

Reads the morning levels from team/out/market/levels/DATE.json
  {"date": "...", "levels": [{"price": 7490, "kind": "wall", "name": "..."}]}
and SPX 1-minute bars from team/data/intraday/DATE_SPX.csv.gz.

For each level (no look-ahead, bars in time order):
  touch    : a bar's range comes within TOL points of the level.
  side     : where price was before the first touch (above / below).
  reaction : after the first touch (MOVE default 10), price moves MOVE points back to its side
             before it moves MOVE points through the level  -> "held"
             the opposite                                     -> "broke"
             neither before the close                         -> "none"
Baseline: every multiple of 5 inside the day's range that is not within 3 pts
of a morning level, scored the same way. A level only adds information if its
"held" rate beats the baseline over many days.

Usage: level_score.py DATE [--tol 1] [--move 5] [--append]
"""
import argparse, csv, gzip, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def load_bars(date):
    p = os.path.join(ROOT, 'team/data/intraday', f'{date}_SPX.csv.gz')
    with gzip.open(p, 'rt') as f:
        return [(r['datetime_et'], float(r['high']), float(r['low']), float(r['close']), float(r['open'])) for r in csv.DictReader(f)]

def score(bars, L, tol, move):
    first = None
    for i, (t, h, l, c, o) in enumerate(bars):
        if l - tol <= L <= h + tol:
            first = i; break
    if first is None:
        return {'touch': False}
    prev = bars[first - 1][3] if first > 0 else bars[0][4]
    side = 'above' if prev >= L else 'below'
    for t, h, l, c, o in bars[first:]:
        back = (h >= L + move) if side == 'above' else (l <= L - move)
        thru = (l <= L - move) if side == 'above' else (h >= L + move)
        if back and thru:
            return {'touch': True, 'time': bars[first][0][11:16], 'side': side, 'result': 'mixed'}
        if back:
            return {'touch': True, 'time': bars[first][0][11:16], 'side': side, 'result': 'held'}
        if thru:
            return {'touch': True, 'time': bars[first][0][11:16], 'side': side, 'result': 'broke'}
    return {'touch': True, 'time': bars[first][0][11:16], 'side': side, 'result': 'none'}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('date'); ap.add_argument('--tol', type=float, default=1.0)
    ap.add_argument('--move', type=float, default=10.0); ap.add_argument('--append', action='store_true')
    a = ap.parse_args()
    lv = json.load(open(os.path.join(ROOT, 'team/out/market/levels', f'{a.date}.json')))
    bars = load_bars(a.date)
    hi = max(b[1] for b in bars); lo = min(b[2] for b in bars)
    rows = []
    for x in lv['levels']:
        r = score(bars, x['price'], a.tol, a.move); r.update(x); rows.append(r)
        print(f"{x['price']:>8} {x['kind']:<6} {r.get('result','no touch'):<9} {r.get('time','')} {r.get('side','')}")
    lvl_prices = [x['price'] for x in lv['levels']]
    base = [p for p in range(int(lo // 5 * 5), int(hi) + 5, 5) if lo <= p <= hi and all(abs(p - q) > 3 for q in lvl_prices)]
    bs = [score(bars, p, a.tol, a.move) for p in base]
    def rate(rs):
        t = [r for r in rs if r.get('touch') and r['result'] in ('held', 'broke')]
        return (sum(r['result'] == 'held' for r in t), len(t))
    lh, ln = rate(rows); bh, bn = rate(bs)
    print(f"levels held {lh}/{ln}   baseline (multiples of 5) held {bh}/{bn}   range {lo:.2f}-{hi:.2f}")
    if a.append:
        p = os.path.join(ROOT, 'team/knowledge/levels-scorecard.md')
        new = not os.path.exists(p)
        with open(p, 'a') as f:
            if new:
                f.write('# سجل مستويات القاما اليومي\n\n'
                        '> يبدأ 17 نوفمبر (طلب المالك)، ومعه 3 أيام قبلها من الأرشيف. الأداة `team/tools/level_score.py`.\n'
                        '> **لمس:** الشمعة توصل حدود نقطة من المستوى. **صمد:** بعد أول لمسة رجع السعر 10 نقاط لجهته قبل ما يكسر 10 نقاط. **انكسر:** العكس.\n'
                        '> **الأساس:** كل مضاعف 5 داخل نطاق اليوم بعيد عن مستوياتنا، بنفس الحساب. المستويات تفيد بس إذا نسبة صمودها أعلى من الأساس على أيام كثيرة.\n'
                        '> قبل 30 يوم: **العيّنة صغيرة، النتيجة غير موثوقة.** المصدر: شموع CBOE المؤرشفة.\n\n'
                        '| اليوم | المستويات (صمد/انكسر/بدون ردة/ما انلمس) | صمود المستويات | صمود الأساس | ملاحظة |\n|---|---|---|---|---|\n')
            det = '، '.join(f"{r['price']:g} {({'held':'صمد','broke':'انكسر','none':'بدون ردة','mixed':'مختلط'}).get(r.get('result'),'ما انلمس')}" for r in rows)
            f.write(f"| {a.date} | {det} | {lh}/{ln} | {bh}/{bn} | النطاق {lo:.0f}–{hi:.0f} |\n")

if __name__ == '__main__':
    main()
