module.exports = async (req, res) => {
  const backend = process.env.BACKEND_URL;
  if (!backend) return res.status(500).json({ error: 'Missing BACKEND_URL' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const r = await fetch(`${backend.replace(/\/$/, '')}/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-request-id': req.headers['x-request-id'] || '' },
      body: JSON.stringify(req.body || {})
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(502).json({ error: 'Bad Gateway' });
  }
};
