// Candles via Yahoo Finance (free, no key).
// Indices: cash index during regular hours (matches TradingView exactly); outside RTH we use the
// front-month FUTURES shifted onto the cash scale (so it moves overnight like MRX but at the SPX level).
const IDX={SPX:['^GSPC','ES=F'],NDX:['^NDX','NQ=F'],DJX:['^DJI','YM=F'],RUT:['^RUT','RTY=F']};
const PLAIN={VIX:'^VIX'};
function isRTH(){const et=new Date(new Date().toLocaleString('en-US',{timeZone:'America/New_York'}));const wd=et.getDay(),t=et.getHours()*60+et.getMinutes();return wd>=1&&wd<=5&&t>=570&&t<960;}
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
  const interval=req.query.interval||'5m';
  const map={'1m':{i:'1m',r:'1d'},'5m':{i:'5m',r:'5d'},'15m':{i:'15m',r:'5d'},'60m':{i:'60m',r:'1mo'},'1d':{i:'1d',r:'1y'},'1wk':{i:'1wk',r:'5y'}};
  const cfg=map[interval]||map['5m'];
  const send=(price,prev,candles)=>res.status(200).json({symbol:raw,regularMarketPrice:price||0,previousClose:prev||0,candles:candles||[]});
  try{
    if(IDX[raw]){
      const [cashSym,futSym]=IDX[raw];
      // regular hours OR daily/weekly view -> cash index = exact TradingView match
      if(isRTH()||interval==='1d'||interval==='1wk'){
        const cr=await chart(cashSym,cfg.i,cfg.r,false);
        if(cr&&cr.timestamp){const candles=toCandles(cr),m=cr.meta||{};const price=(candles.length?candles[candles.length-1].c:0)||m.regularMarketPrice||0;return send(price,m.chartPreviousClose||m.previousClose,candles);}
      }
      // outside RTH -> futures movement, shifted to cash scale via the prev-close basis
      const [fr,cr]=await Promise.all([chart(futSym,cfg.i,cfg.r,true),chart(cashSym,'1d','5d',false)]);
      if(fr&&fr.timestamp){
        const fm=fr.meta||{},cm=cr?.meta||{};
        const cashPrev=cm.chartPreviousClose||cm.previousClose||0,futPrev=fm.chartPreviousClose||fm.previousClose||0;
        const basis=(futPrev&&cashPrev)?(futPrev-cashPrev):0;
        const candles=toCandles(fr).map(c=>({t:c.t,o:c.o-basis,h:c.h-basis,l:c.l-basis,c:c.c-basis,v:c.v}));
        const price=candles.length?candles[candles.length-1].c:0;
        return send(price,cashPrev||0,candles);
      }
    }
    // stocks / ETFs / VIX (pre & post market included)
    const sym=PLAIN[raw]||raw;
    const cr=await chart(sym,cfg.i,cfg.r,true);
    if(!cr||!cr.timestamp)throw 0;
    const candles=toCandles(cr),m=cr.meta||{};
    const price=(candles.length?candles[candles.length-1].c:0)||m.regularMarketPrice||0;
    return send(price,m.chartPreviousClose||m.previousClose,candles);
  }catch(e){
    return send(0,0,[]);
  }
}
