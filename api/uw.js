export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  const path = req.query.path || '';
  try {
    const r = await fetch('https://api.unusualwhales.com/api/' + path, {
      headers: {'Authorization': 'Bearer e82a2e15-8f40-4985-973a-4eeb9b7f7021'}
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch(e) {
    res.status(500).json({error: e.message});
  }
}
