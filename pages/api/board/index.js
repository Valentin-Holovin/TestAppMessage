const { listBoard } = require('../../../lib/board');
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const page = req.query.page === undefined ? 0 : Number(req.query.page);
    res.status(200).json(await listBoard(req.query.mode || 'live', page));
  } catch (err) { res.status(err.status || 500).json({ error: err.status ? err.message : 'Unable to load the board.' }); }
}
