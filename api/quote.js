// Live quotes via Yahoo Finance (free, no API key). Falls back to Finnhub.
export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  const syms=(req.query.symbols||'SPY').split(',').map(s=>s.trim().toUpperCase()).filter(Boolean);
  try{
    const url='https://query1.finance.yahoo.com/v7/finance/quote?symbols='+encodeURIComponent(syms.join(','));
    const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Accept':'application/json'}});
    const d=await r.json();
    const arr=d?.quoteResponse?.result;
    if(arr&&arr.length){
      const results=arr.map(q=>({
        symbol:q.symbol,
        regularMarketPrice:q.regularMarketPrice||q.postMarketPrice||q.preMarketPrice||0,
        regularMarketChange:q.regularMarketChange||0,
        regularMarketChangePercent:q.regularMarketChangePercent||0,
        regularMarketDayHigh:q.regularMarketDayHigh||0,
        regularMarketDayLow:q.regularMarketDayLow||0,
        regularMarketPreviousClose:q.regularMarketPreviousClose||q.previousClose||0
      }));
      res.status(200).json({quoteResponse:{result:results}});
      return;
    }
    throw new Error('empty yahoo quote');
  }catch(e){
    // fallback: Yahoo chart meta per symbol (more reliable than v7 quote)
    try{
      const results=await Promise.all(syms.map(async s=>{
        try{
          const cr=await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s)}?interval=1d&range=1d`,{headers:{'User-Agent':'Mozilla/5.0'}});
          const cd=await cr.json();
          const m=cd?.chart?.result?.[0]?.meta||{};
          const p=m.regularMarketPrice||0,pc=m.chartPreviousClose||m.previousClose||0;
          return{symbol:s,regularMarketPrice:p,regularMarketChange:p-pc,regularMarketChangePercent:pc?((p-pc)/pc*100):0,regularMarketDayHigh:m.regularMarketDayHigh||0,regularMarketDayLow:m.regularMarketDayLow||0,regularMarketPreviousClose:pc};
        }catch(_){return{symbol:s,regularMarketPrice:0,regularMarketChangePercent:0,regularMarketPreviousClose:0};}
      }));
      res.status(200).json({quoteResponse:{result:results}});
    }catch(_){
      res.status(200).json({quoteResponse:{result:[]}});
    }
  }
}
