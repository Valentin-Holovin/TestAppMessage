const { getPlacement } = require('../../../lib/board');
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try { res.status(200).json({ placement: await getPlacement(Number(req.query.id)) }); }
  catch (err) { res.status(err.status || 500).json({ error: err.status ? err.message : 'Unable to load message.' }); }
}
