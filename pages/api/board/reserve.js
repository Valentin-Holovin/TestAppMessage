const { reservePlacement } = require('../../../lib/board');
const { broadcast } = require('../../../lib/events');
const { requireUser } = require('../../../lib/firebase/server');
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const user = await requireUser(req);
    const placement = await reservePlacement(user.id, req.body);
    broadcast('board_update', { mode: placement.mode });
    res.status(201).json({ placement, demo: true });
  } catch (err) { res.status(err.status || 500).json({ error: err.status ? err.message : 'Unable to reserve this cell.' }); }
}
