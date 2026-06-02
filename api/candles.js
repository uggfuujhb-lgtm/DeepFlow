// Candles via Yahoo Finance (free, no key).
// Indices -> front-month FUTURES (ES=F/NQ=F/...), which is exactly TradingView's SPX500/NAS100
// level and trades ~24h (moves overnight & pre-market). includePrePost adds extended hours for stocks.
const YF={SPX:'ES=F',NDX:'NQ=F',DJX:'YM=F',RUT:'RTY=F',VIX:'^VIX',SPY:'SPY',QQQ:'QQQ',DIA:'DIA',IWM:'IWM'};
async function chart(sym,i,r,pp){
  const u=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=${i}&range=${r}&includePrePost=${pp?'true':'false'}`;
  const res=await fetch(u,{headers:{'User-Agent':'Mozilla/5.0','Accept':'application/json'}});
  return (await res.json())?.chart?.result?.[0];
}
function toCandles(result){
  const ts=result.timestamp||[],q=result.indicators?.quote?.[0]||{},out=[];
  for(let i=0;i<ts.length;i++){const o=q.open?.[i],h=q.high?.[i],l=q.low?.[i],c=q.close?.[i],v=q.volume?.[i];if(o==null||c==null)continue;out.push({t:ts[i]*1000,o,h,l,c,v:v||0});}
  return out;
}
export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  const raw=(req.query.sym||'SPY').trim().toUpperCase();
  const sym=YF[raw]||raw;
  const interval=req.query.interval||'5m';
  const map={'1m':{i:'1m',r:'1d'},'5m':{i:'5m',r:'5d'},'15m':{i:'15m',r:'5d'},'60m':{i:'60m',r:'1mo'},'1d':{i:'1d',r:'1y'},'1wk':{i:'1wk',r:'5y'}};
  const cfg=map[interval]||map['5m'];
  const send=(price,prev,candles)=>res.status(200).json({symbol:raw,regularMarketPrice:price||0,previousClose:prev||0,candles:candles||[]});
  try{
    const cr=await chart(sym,cfg.i,cfg.r,true);
    if(!cr||!cr.timestamp)throw 0;
    const candles=toCandles(cr),m=cr.meta||{};
    const price=(candles.length?candles[candles.length-1].c:0)||m.regularMarketPrice||0;
    return send(price,m.chartPreviousClose||m.previousClose,candles);
  }catch(e){
    return send(0,0,[]);
  }
}
