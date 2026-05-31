const G='https://raw.githubusercontent.com/uggfuujhb-lgtm/DeepFlow/main/public/index.html';
export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  try{
    const r=await fetch(G+'?t='+Date.now());
    const html=await r.text();
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.status(200).send(html);
  }catch(e){res.status(500).send('<h1>'+e.message+'</h1>');}
}
