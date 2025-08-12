module.exports = async (_req, res) => {
  const backend = process.env.BACKEND_URL;
  if (!backend) return res.status(500).json({ error: 'Missing BACKEND_URL' });
  try {
    const r = await fetch(`${backend.replace(/\/$/, '')}/health`);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(502).json({ error: 'Bad Gateway' });
  }
};
