"""Zero Gamma (gamma flip): the price where dealers' net gamma changes sign.
Above it net GEX is positive (dealers dampen moves); below it negative (dealers amplify moves).

Method: re-price every option's Black-Scholes gamma at hypothetical spot prices (CBOE IV, OI),
sum signed GEX (calls +, puts -) at each price, and find where the total crosses zero.
Usage: python3 team/tools/zero_gamma.py [_SPX] [--days 45] [--json saved_chain.json]
Approximation: assumes dealers short what customers bought (convention, not ground truth). Delayed data.
"""
import argparse, json, math, re, urllib.request, datetime as dt

ap = argparse.ArgumentParser(); ap.add_argument("sym", nargs="?", default="_SPX")
ap.add_argument("--days", type=int, default=45); ap.add_argument("--json"); ap.add_argument("--r", type=float, default=0.04)
a = ap.parse_args()
raw = json.load(open(a.json)) if a.json else json.load(urllib.request.urlopen(
    f"https://cdn.cboe.com/api/global/delayed_quotes/options/{a.sym}.json", timeout=60))
spot = float(raw["data"]["current_price"])
now = dt.datetime.fromisoformat(raw["timestamp"].replace(" ", "T"))  # UTC
pat = re.compile(r"^[A-Z]+(\d{6})([CP])(\d{8})$")
N = lambda x: math.exp(-x * x / 2) / math.sqrt(2 * math.pi)
opts = []
for o in raw["data"]["options"]:
    m = pat.match(o["option"]); oi = o.get("open_interest") or 0; iv = o.get("iv") or 0
    if not m or oi <= 0 or iv <= 0.01: continue
    exp = dt.datetime.strptime(m[1], "%y%m%d") + dt.timedelta(hours=21)  # 4:00 PM ET ≈ 21:00 UTC (EST)
    T = (exp - now).total_seconds() / (365 * 86400)
    if T <= 0 or T > a.days / 365: continue
    opts.append((m[1], 1 if m[2] == "C" else -1, int(m[3]) / 1000, oi, iv, T))


def gex_at(S, sel=None):
    tot = 0.0
    for e, sgn, K, oi, iv, T in opts:
        if sel and e != sel: continue
        sT = iv * math.sqrt(T)
        d1 = (math.log(S / K) + (a.r + iv * iv / 2) * T) / sT
        tot += sgn * N(d1) / (S * sT) * oi * 100 * S * S * 0.01
    return tot


def flip(sel=None):
    grid = [spot * (1 + i / 1000) for i in range(-60, 61)]
    vals = [gex_at(S, sel) for S in grid]
    xs = []
    for i in range(1, len(grid)):
        if (vals[i - 1] < 0) != (vals[i] < 0):
            x0, x1, y0, y1 = grid[i - 1], grid[i], vals[i - 1], vals[i]
            xs.append(x0 - y0 * (x1 - x0) / (y1 - y0))
    return xs, gex_at(spot, sel)


exps = sorted({o[0] for o in opts})
print(f"{a.sym} spot {spot:.2f}  data {raw['timestamp']} UTC (CBOE delayed)  expiries≤{a.days}d: {len(exps)}")
for label, sel in (("all ≤%dd" % a.days, None), ("nearest " + exps[0], exps[0])):
    xs, g = flip(sel)
    near = min(xs, key=lambda x: abs(x - spot)) if xs else None
    print(f"[{label}] net GEX at spot {g/1e6:,.0f}M ({'positive' if g > 0 else 'negative'})  zero gamma: "
          + (f"{near:.0f}" if near else "none within ±6%") + (f"  (all crossings: {', '.join(f'{x:.0f}' for x in xs)})" if len(xs) > 1 else ""))
