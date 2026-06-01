// Live quotes via Yahoo Finance (free, no API key).
// Map our internal tickers to the real Yahoo symbol (indices use ^ caret).
const YF={SPX:'^GSPC',NDX:'^NDX',DJX:'^DJI',RUT:'^RUT',VIX:'^VIX',SPY:'SPY',QQQ:'QQQ',DIA:'DIA',IWM:'IWM'};
// per-symbol quote via Yahoo chart meta (reliable for both stocks and indices)
async function quoteOne(key){
  const ys=YF[key]||key;
  try{
    const cr=await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ys)}?interval=1d&range=5d`,{headers:{'User-Agent':'Mozilla/5.0','Accept':'application/json'}});
    const cd=await cr.json();
    const m=cd?.chart?.result?.[0]?.meta||{};
    const p=m.regularMarketPrice||0,pc=m.chartPreviousClose||m.previousClose||0;
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
