export default async function handler(req,res){
res.setHeader('Access-Control-Allow-Origin','*');
const syms=(req.query.symbols||'SPY').split(',');
const K='d0rh1ohr01qgssk0pr80d0rh1ohr01qgssk0pr8g';
const results=await Promise.all(syms.map(async s=>{
const r=await fetch(`https://finnhub.io/api/v1/quote?symbol=${s}&token=${K}`);
const d=await r.json();
return{symbol:s,regularMarketPrice:d.c,regularMarketChange:d.d,regularMarketChangePercent:d.dp,regularMarketDayHigh:d.h,regularMarketDayLow:d.l,regularMarketPreviousClose:d.pc};
}));
res.status(200).json({quoteResponse:{result:results}});
}
