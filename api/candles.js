export default async function handler(req,res){
res.setHeader('Access-Control-Allow-Origin','*');
const sym=req.query.sym||'SPY';
const interval=req.query.interval||'5m';
const K='d0rh1ohr01qgssk0pr80d0rh1ohr01qgssk0pr8g';
const now=Math.floor(Date.now()/1000);
const map={'1m':{res:'1',from:now-86400},'5m':{res:'5',from:now-432000},'15m':{res:'15',from:now-432000},'60m':{res:'60',from:now-2592000},'1d':{res:'D',from:now-31536000},'1wk':{res:'W',from:now-157680000}};
const cfg=map[interval]||map['5m'];
const r=await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${sym}&resolution=${cfg.res}&from=${cfg.from}&to=${now}&token=${K}`);
const d=await r.json();
if(d.s!=='ok'){res.status(200).json({candles:[],error:d.s});return;}
const candles=d.t.map((t,i)=>({t:t*1000,o:d.o[i],h:d.h[i],l:d.l[i],c:d.c[i],v:d.v[i]}));
const qr=await fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${K}`);
const q=await qr.json();
res.status(200).json({symbol:sym,regularMarketPrice:q.c,previousClose:q.pc,candles});
}
