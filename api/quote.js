// Live quotes via Yahoo Finance (free, no key).
// Indices: cash index during regular hours (= TradingView); outside RTH use futures shifted to cash scale.
const IDX={SPX:['^GSPC','ES=F'],NDX:['^NDX','NQ=F'],DJX:['^DJI','YM=F'],RUT:['^RUT','RTY=F']};
const PLAIN={VIX:'^VIX'};
function isRTH(){const et=new Date(new Date().toLocaleString('en-US',{timeZone:'America/New_York'}));const wd=et.getDay(),t=et.getHours()*60+et.getMinutes();return wd>=1&&wd<=5&&t>=570&&t<960;}
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
  try{
    if(IDX[key]){
      const [cashSym,futSym]=IDX[key];
      if(isRTH()){const c=await px(cashSym,'5m','1d',false);if(c.price)return mk(key,c.price,c.prev);}
      const [f,c]=await Promise.all([px(futSym,'5m','1d',true),px(cashSym,'1d','5d',false)]);
      const basis=(f.prev&&c.prev)?(f.prev-c.prev):0;
      return mk(key,(f.price||0)-basis,c.prev||f.prev||0);
    }
    const c=await px(PLAIN[key]||key,'5m','1d',true);
    return mk(key,c.price,c.prev);
  }catch(_){return mk(key,0,0);}
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
