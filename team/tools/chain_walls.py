"""Gamma walls from an archived option-chain snapshot (team/data/chain/DAY_SPX.csv.gz).

Usage: python3 team/tools/chain_walls.py DAY [--expiry YYMMDD[,YYMMDD...]] [--spot S] [--iv 0.25] [--hours 6.5]
  Without --iv: uses each contract's own gamma from the snapshot (as of the snapshot time).
  With --iv/--hours: recomputes Black-Scholes gamma at --spot with one flat IV and the given hours left
  (lets you rebuild the open-of-day picture for 0DTE: open interest is set overnight, so it is known at the open).
GEX per strike = gamma * OI * 100 * spot^2 * 1%, calls +, puts - (a convention, not the real dealer book).
Also scans spot for the net-GEX sign flip (zero gamma, same convention).
Caveat: snapshots keep strikes within +/-3% of the snapshot price only.
"""
import argparse, csv, gzip, math, os
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ap = argparse.ArgumentParser(); ap.add_argument("day"); ap.add_argument("--expiry")
ap.add_argument("--spot", type=float); ap.add_argument("--iv", type=float); ap.add_argument("--hours", type=float, default=6.5)
a = ap.parse_args()
rows = list(csv.DictReader(gzip.open(os.path.join(ROOT, "team/data/chain", f"{a.day}_SPX.csv.gz"), "rt")))
exps = sorted({r["expiry"] for r in rows})
sel = set(a.expiry.split(",")) if a.expiry else {exps[0]}
rows = [r for r in rows if r["expiry"] in sel]
pdf = lambda x: math.exp(-x * x / 2) / math.sqrt(2 * math.pi)


def bs_gamma(S, K, s, T):
    d1 = (math.log(S / K) + 0.5 * s * s * T) / (s * math.sqrt(T)); return pdf(d1) / (S * s * math.sqrt(T))


def profile(S):
    gx = defaultdict(float)
    for r in rows:
        K = float(r["strike"]); oi = float(r["open_interest"]); sign = 1 if r["cp"] == "C" else -1
        gm = bs_gamma(S, K, a.iv, a.hours / (6.5 * 252)) if a.iv else float(r["gamma"])
        gx[K] += sign * gm * oi * 100 * S * S * 0.01
    return gx


S = a.spot or float(rows[0].get("spot") or 0) or 0
if not S: raise SystemExit("pass --spot")
gx = profile(S)
print(f"chain {a.day}  expiries {sorted(sel)}  spot {S:.2f}  net GEX ${sum(gx.values())/1e9:+.2f}B")
above = [(k, v) for k, v in gx.items() if k >= S]; below = [(k, v) for k, v in gx.items() if k <= S]
if above: print("call wall (largest +GEX at/above spot):", max(above, key=lambda x: x[1])[0])
if below: print("put wall  (largest -GEX at/below spot):", min(below, key=lambda x: x[1])[0])
for k, v in sorted(gx.items(), key=lambda x: -abs(x[1]))[:8]: print(f"  {k:8.0f}  {v/1e6:+8.0f}M")
if a.iv:
    prev = None
    for s2 in [S * (1 + i / 1000) for i in range(-40, 41, 2)]:
        t = sum(profile(s2).values())
        if prev and (prev[1] < 0) != (t < 0): print(f"zero gamma ~ between {prev[0]:.0f} and {s2:.0f}")
        prev = (s2, t)
