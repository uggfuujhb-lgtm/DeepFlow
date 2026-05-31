export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  const path = req.query.path || '';
  try {
    const r = await fetch('https://api.massive.com/' + path, {
      headers: {'Authorization': 'Bearer 63icPsd_duqgWVPXMo6wgNVJ6McD69h4'}
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch(e) {
    res.status(500).json({error: e.message});
  }
}
