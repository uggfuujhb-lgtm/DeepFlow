// Candles + quote via Yahoo Finance (free, no API key). Falls back to Finnhub.
// Map our internal tickers to the real Yahoo symbol (indices use ^ caret symbols).
const YF={SPX:'^GSPC',NDX:'^NDX',DJX:'^DJI',RUT:'^RUT',VIX:'^VIX',SPY:'SPY',QQQ:'QQQ',DIA:'DIA',IWM:'IWM'};
export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  const raw=(req.query.sym||'SPY').trim().toUpperCase();
  const sym=YF[raw]||raw;
  const interval=req.query.interval||'5m';
  // map our intervals -> Yahoo {interval,range}
  const map={
    '1m':{i:'1m',r:'1d'},'5m':{i:'5m',r:'5d'},'15m':{i:'15m',r:'5d'},
    '60m':{i:'60m',r:'1mo'},'1d':{i:'1d',r:'1y'},'1wk':{i:'1wk',r:'5y'}
  };
  const cfg=map[interval]||map['5m'];
  try{
    const url=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=${cfg.i}&range=${cfg.r}&includePrePost=false`;
    const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Accept':'application/json'}});
    const d=await r.json();
    const result=d?.chart?.result?.[0];
    if(!result||!result.timestamp)throw new Error('no yahoo data');
    const ts=result.timestamp;
    const q=result.indicators?.quote?.[0]||{};
    const meta=result.meta||{};
    const candles=[];
    for(let i=0;i<ts.length;i++){
      const o=q.open?.[i],h=q.high?.[i],l=q.low?.[i],c=q.close?.[i],v=q.volume?.[i];
      if(o==null||c==null)continue;
      candles.push({t:ts[i]*1000,o,h,l,c,v:v||0});
    }
    const price=meta.regularMarketPrice||(candles.length?candles[candles.length-1].c:0);
    const prev=meta.chartPreviousClose||meta.previousClose||0;
    res.status(200).json({symbol:sym,regularMarketPrice:price,previousClose:prev,candles});
    return;
  }catch(e){
    // fallback: Finnhub quote so we at least show last price
    try{
      const K='d0rh1ohr01qgssk0pr80d0rh1ohr01qgssk0pr8g';
      const qr=await fetch('https://finnhub.io/api/v1/quote?symbol='+sym+'&token='+K);
      const q=await qr.json();
      res.status(200).json({symbol:sym,regularMarketPrice:q.c||0,previousClose:q.pc||0,candles:[]});
    }catch(_){
      res.status(200).json({symbol:sym,regularMarketPrice:0,previousClose:0,candles:[]});
    }
  }
}
