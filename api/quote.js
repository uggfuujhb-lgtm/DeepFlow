export default async function handler(req,res){
res.setHeader('Access-Control-Allow-Origin','*');
const syms=(req.query.symbols||'SPY').split(',');
const K='d0rh1ohr01qgssk0pr80d0rh1ohr01qgssk0pr8g';
const results=await Promise.all(syms.map(async s=>{
const r=await fetch('https://finnhub.io/api/v1/quote?symbol='+s.trim()+'&token='+K);
const d=await r.json();
return{symbol:s.trim(),regularMarketPrice:d.c||0,regularMarketChange:d.d||0,regularMarketChangePercent:d.dp||0,regularMarketDayHigh:d.h||0,regularMarketDayLow:d.l||0,regularMarketPreviousClose:d.pc||0};
}));
res.status(200).json({quoteResponse:{result:results}});
}
