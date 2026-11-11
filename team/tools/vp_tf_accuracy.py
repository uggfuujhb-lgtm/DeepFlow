# Volume-profile accuracy check: 5-min bars vs 1-min bars (same even-spread method as the TradingView indicator).
# Usage: python3 team/tools/vp_tf_accuracy.py <dir with CBOE intraday JSON> AAPL NVDA ...  (bin = 0.05% of price)
import json,sys,math
def prof(bars,base,b,n=2000):
    v=[0.0]*n
    for o,h,l,c,vol in bars:
        lo=int(math.floor((l-base)/b)); hi=int(math.floor((h-base)/b)); k=hi-lo+1
        for i in range(lo,hi+1): v[i]+=vol/k
    return v
def va(v,pct=0.7):
    idx=[i for i,x in enumerate(v) if x>0]; mn,mx=min(idx),max(idx)
    poc=max(range(mn,mx+1),key=lambda i:v[i]); tot=sum(v); lo=hi=poc; acc=v[poc]
    while acc<tot*pct and (lo>mn or hi<mx):
        up=v[hi+1] if hi<mx else -1; dn=v[lo-1] if lo>mn else -1
        if up>=dn: hi+=1; acc+=up
        else: lo-=1; acc+=dn
    return poc,lo,hi
res=[]
for s in sys.argv[2:]:
    d=json.load(open(f"{sys.argv[1]}/{s}.json"))['data']
    m=[(r['price']['open'],r['price']['high'],r['price']['low'],r['price']['close'],r['volume']['stock_volume']) for r in d if r['volume']['stock_volume']]
    five=[]
    for i in range(0,len(m),5):
        g=m[i:i+5]; five.append((g[0][0],max(x[1] for x in g),min(x[2] for x in g),g[-1][3],sum(x[4] for x in g)))
    px=m[0][0]; b=px*0.0005; base=px-1000*b
    a=va(prof(m,base,b)); f=va(prof(five,base,b))
    rng=max(x[1] for x in m)-min(x[2] for x in m)
    diffs=[abs(a[j]-f[j]) for j in range(3)]
    print(f"{s:6} bars1m={len(m):3} bin=${b:.3f} range=${rng:.2f}  POC/VAL/VAH diff (bins) {diffs}  ($ {[round(x*b,2) for x in diffs]})")
    res.append(diffs + [x*b/rng*100 for x in diffs])
n=len(res)
print("mean bins diff POC/VAL/VAH:",[round(sum(r[j] for r in res)/n,2) for j in range(3)], " within 1 bin:", [sum(r[j]<=1 for r in res) for j in range(3)], "of", n)
err=[sum(r[3+j] for r in res)/n for j in range(3)]
print("mean error % of day range POC/VAL/VAH:",[round(e,1) for e in err], " -> accuracy %:",[round(100-e,1) for e in err])
