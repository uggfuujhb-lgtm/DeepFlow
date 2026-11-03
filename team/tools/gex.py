"""Gamma/Delta exposure levels from CBOE delayed options data (free, ~15 min delayed).

Usage: python3 team/tools/gex.py [SYMBOL] [EXPIRY YYMMDD|all|next]
  SYMBOL defaults to _SPX. EXPIRY defaults to "next" (nearest expiry, i.e. 0DTE on trading days).
Approximation: GEX = gamma * OI * 100 * spot^2 * 1%  (calls +, puts -), DEX = delta * OI * 100 * spot.
Assumes dealers are short what customers bought; this is a convention, not ground truth.
"""
import json, re, sys, urllib.request
from collections import defaultdict

sym = sys.argv[1] if len(sys.argv) > 1 else "_SPX"
want = sys.argv[2] if len(sys.argv) > 2 else "next"
url = f"https://cdn.cboe.com/api/global/delayed_quotes/options/{sym}.json"
raw = json.load(urllib.request.urlopen(url, timeout=60))
d = raw["data"]; spot = float(d["current_price"])
pat = re.compile(r"^(?P<root>[A-Z]+)(?P<exp>\d{6})(?P<cp>[CP])(?P<k>\d{8})$")
rows = []
for o in d["options"]:
    m = pat.match(o["option"])
    if not m: continue
    rows.append((m["exp"], m["cp"], int(m["k"]) / 1000, o))
exps = sorted({r[0] for r in rows})
# drop expiries already past (CBOE keeps yesterday's chain until it rolls)
today = (raw.get("timestamp") or "")[:10].replace("-", "")[2:]
if today: exps = [e for e in exps if e >= today] or exps
if want == "next": sel = {exps[0]}
elif want == "all": sel = set(exps)
else: sel = {want}
gex = defaultdict(float); dex = defaultdict(float); oi = defaultdict(lambda: [0, 0])
for exp, cp, k, o in rows:
    if exp not in sel: continue
    g = (o.get("gamma") or 0) * (o.get("open_interest") or 0) * 100 * spot * spot * 0.01
    dl = (o.get("delta") or 0) * (o.get("open_interest") or 0) * 100 * spot
    sign = 1 if cp == "C" else -1
    gex[k] += sign * g; dex[k] += dl
    oi[k][0 if cp == "C" else 1] += o.get("open_interest") or 0
near = [k for k in gex if abs(k - spot) <= spot * 0.03]
above = sorted([k for k in near if k > spot], key=lambda k: -gex[k])
below = sorted([k for k in near if k < spot], key=lambda k: gex[k])
cr = above[0] if above else None
ps_cands = sorted([k for k in near if cr is None or k < cr], key=lambda k: -abs(gex[k]))
# gamma flip: where cumulative net GEX (from low strikes up) changes sign near spot
ks = sorted(near); cum = 0; flip = None; prev = None
for k in ks:
    cum += gex[k]
    if prev is not None and (prev < 0) != (cum < 0): flip = k
    prev = cum
fmt = lambda v: f"{v/1e6:,.0f}M"
print(f"symbol {sym}  spot {spot:.2f}  data_time {raw.get('timestamp')} (CBOE, delayed)  expiries {sorted(sel)[:3]}{'...' if len(sel)>3 else ''}")
print(f"net GEX total (±3%): {fmt(sum(gex[k] for k in near))}  regime: {'positive' if sum(gex[k] for k in near)>0 else 'negative'}")
print(f"call resistance (largest +GEX above spot): {cr} ({fmt(gex[cr]) if cr else '-'})")
print("top +GEX above:", ", ".join(f"{k:g} {fmt(gex[k])}" for k in above[:4]))
print("top -GEX below:", ", ".join(f"{k:g} {fmt(gex[k])}" for k in below[:4]))
print("largest |GEX| below call resistance:", ", ".join(f"{k:g} {fmt(gex[k])}" for k in ps_cands[:4]))
print(f"gamma flip (approx): {flip}")
print("top DEX:", ", ".join(f"{k:g} {fmt(dex[k])}" for k in sorted(near, key=lambda k: -abs(dex[k]))[:5]))
print("top OI (call/put):", ", ".join(f"{k:g} {oi[k][0]:.0f}/{oi[k][1]:.0f}" for k in sorted(near, key=lambda k: -(oi[k][0]+oi[k][1]))[:5]))
