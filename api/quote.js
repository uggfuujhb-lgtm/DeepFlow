// Live quotes via Yahoo Finance (free, no key).
// Indices -> front-month futures (= TradingView SPX500/NAS100 level, trades ~24h).
const YF={SPX:'ES=F',NDX:'NQ=F',DJX:'YM=F',RUT:'RTY=F',VIX:'^VIX',SPY:'SPY',QQQ:'QQQ',DIA:'DIA',IWM:'IWM'};
async function px(sym,i,r,pp){
  try{
    const u=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=${i}&range=${r}&includePrePost=${pp?'true':'false'}`;
    const res=(await (await fetch(u,{headers:{'User-Agent':'Mozilla/5.0','Accept':'application/json'}})).json())?.chart?.result?.[0];
    const m=res?.meta||{};let p=m.regularMarketPrice||0;
    const cl=res?.indicators?.quote?.[0]?.close;
    if(cl){for(let j=cl.length-1;j>=0;j--){if(cl[j]!=null){p=cl[j];break;}}}
    return{price:p,prev:m.chartPreviousClose||m.previousClose||0};
  }catch(_){return{price:0,prev:0};}
}
const mk=(k,p,pc)=>({symbol:k,regularMarketPrice:p||0,regularMarketChange:(p||0)-(pc||0),regularMarketChangePercent:pc?(((p||0)-pc)/pc*100):0,regularMarketDayHigh:0,regularMarketDayLow:0,regularMarketPreviousClose:pc||0});
async function quoteOne(key){
  const c=await px(YF[key]||key,'5m','1d',true);
  return mk(key,c.price,c.prev);
}
export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  const syms=(req.query.symbols||'SPY').split(',').map(s=>s.trim().toUpperCase()).filter(Boolean);
  try{
    const results=await Promise.all(syms.map(quoteOne));
    res.status(200).json({quoteResponse:{result:results}});
  }catch(e){
    res.status(200).json({quoteResponse:{result:[]}});
  }
}
