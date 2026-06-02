// Live quotes via Yahoo Finance (free, no API key).
// Indices -> futures so they move overnight / pre-market like MRX.
const YF={SPX:'ES=F',NDX:'NQ=F',DJX:'YM=F',RUT:'RTY=F',VIX:'^VIX',SPY:'SPY',QQQ:'QQQ',DIA:'DIA',IWM:'IWM'};
// per-symbol quote via intraday chart incl. pre/post -> latest traded price
async function quoteOne(key){
  const ys=YF[key]||key;
  try{
    const cr=await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ys)}?interval=5m&range=1d&includePrePost=true`,{headers:{'User-Agent':'Mozilla/5.0','Accept':'application/json'}});
    const cd=await cr.json();
    const res=cd?.chart?.result?.[0];const m=res?.meta||{};
    let p=m.regularMarketPrice||0;
    const cl=res?.indicators?.quote?.[0]?.close;
    if(cl){for(let i=cl.length-1;i>=0;i--){if(cl[i]!=null){p=cl[i];break;}}} // most recent (extended hours)
    const pc=m.chartPreviousClose||m.previousClose||0;
    return{symbol:key,regularMarketPrice:p,regularMarketChange:p-pc,regularMarketChangePercent:pc?((p-pc)/pc*100):0,regularMarketDayHigh:m.regularMarketDayHigh||0,regularMarketDayLow:m.regularMarketDayLow||0,regularMarketPreviousClose:pc};
  }catch(_){return{symbol:key,regularMarketPrice:0,regularMarketChange:0,regularMarketChangePercent:0,regularMarketPreviousClose:0};}
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
