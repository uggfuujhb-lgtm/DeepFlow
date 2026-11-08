"""Monte Carlo of fixed-fractional risk per trade (education only, NOT a performance forecast).

Usage: python3 team/tools/risk_sim.py [--trades 250] [--sims 20000] [--seed 42]
For several (win rate, reward:risk) pairs and risk-per-trade sizes, prints the median account change,
median / 95th-percentile max drawdown, and median / 95th-percentile longest losing streak.
Assumes the edge (win rate and R) is KNOWN and constant, which real traders never know; no costs, no slippage.
"""
import argparse, numpy as np
ap = argparse.ArgumentParser(); ap.add_argument("--trades", type=int, default=250); ap.add_argument("--sims", type=int, default=20000)
ap.add_argument("--seed", type=int, default=42); a = ap.parse_args()
rng = np.random.default_rng(a.seed)
print("breakeven win rate by reward:risk:", {r: f"{100/(1+r):.1f}%" for r in (1, 1.5, 2, 3, 5)})
for p, R in [(0.40, 2), (0.30, 3), (0.55, 1)]:
    for risk in (0.0025, 0.01, 0.02):
        w = rng.random((a.sims, a.trades)) < p
        eq = np.cumprod(1 + np.where(w, risk * R, -risk), axis=1)
        mdd = (1 - eq / np.maximum.accumulate(eq, axis=1)).max(axis=1)
        streak = []
        for row in w[:2000]:
            m = c = 0
            for x in row:
                c = 0 if x else c + 1; m = max(m, c)
            streak.append(m)
        print(f"win {p:.0%} R {R} risk {risk*100:.2f}%: median change {100*(np.median(eq[:, -1])-1):+.1f}% / {a.trades} trades | "
              f"max drawdown median {100*np.median(mdd):.1f}% p95 {100*np.percentile(mdd, 95):.1f}% | "
              f"losing streak median {np.median(streak):.0f} p95 {np.percentile(streak, 95):.0f}")
print("Simulation with an assumed edge; not a forecast or a promise. للتعليم فقط وليست توصية.")
