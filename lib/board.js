const { getDb, all, get, run } = require('./db');
const { PLANS, PAGE_SIZE } = require('./board-plans');
const DAY_MS = 86400000;
const MAX_SLOT = 1000000;
const publicFields = `b.id, b.owner_id, u.nickname, b.mode, b.slot, b.text,
  b.plan_id, b.price_cents, b.created_at, b.expires_at`;
function fail(status, message) { throw Object.assign(new Error(message), { status }); }

async function listBoard(mode, page = 0, now = Date.now()) {
  if (!['live', 'permanent', 'archive'].includes(mode)) fail(400, 'Unknown board.');
  if (!Number.isSafeInteger(page) || page < 0 || page > Math.floor(MAX_SLOT / PAGE_SIZE)) fail(400, 'Invalid page.');
  await getDb();
  const last = get("SELECT MAX(slot) AS slot FROM board_messages WHERE mode = 'permanent'").slot;
  // Keep an extra page available as soon as the current permanent page fills.
  const permanentPages = Math.floor(((last ?? -1) + 1) / PAGE_SIZE) + 1;
  if (mode === 'live' && page !== 0 || mode === 'permanent' && page >= permanentPages) fail(400, 'Page is not available.');
  if (mode === 'archive') {
    const total = get('SELECT COUNT(*) AS total FROM board_messages WHERE expires_at <= ?', [now]).total;
    const items = all(`SELECT ${publicFields} FROM board_messages b JOIN users u ON u.id = b.owner_id
      WHERE b.expires_at <= ? ORDER BY b.created_at DESC, b.id DESC LIMIT ? OFFSET ?`, [now, PAGE_SIZE, page * PAGE_SIZE]);
    return { items, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)), total, plans: PLANS, serverNow: now };
  }
  const items = all(`SELECT ${publicFields} FROM board_messages b JOIN users u ON u.id = b.owner_id
    WHERE b.mode = ? AND b.slot >= ? AND b.slot < ? AND (b.expires_at IS NULL OR b.expires_at > ?)
    ORDER BY b.slot`, [mode, page * PAGE_SIZE, (page + 1) * PAGE_SIZE, now]);
  return { items, page, pages: mode === 'live' ? 1 : permanentPages, plans: PLANS, serverNow: now };
}

async function reservePlacement(userId, input, now = Date.now()) {
  const { planId, slot, text } = input || {};
  const plan = PLANS.find((item) => item.id === planId);
  if (!plan) fail(400, 'Choose a valid placement plan.');
  if (input.expectedPriceCents !== undefined && input.expectedPriceCents !== plan.priceCents) fail(409, 'This rate changed. Review the updated price before publishing.');
  if (!Number.isSafeInteger(slot) || slot < 0 || slot > MAX_SLOT || plan.mode === 'live' && slot >= PAGE_SIZE) fail(400, 'Choose a valid cell.');
  if (typeof text !== 'string' || !text.trim() || text.trim().length > 280) fail(400, 'Message must be 1–280 characters.');
  await getDb();
  if (plan.mode === 'permanent') {
    const last = get("SELECT MAX(slot) AS slot FROM board_messages WHERE mode = 'permanent'").slot;
    const availablePages = Math.floor(((last ?? -1) + 1) / PAGE_SIZE) + 1;
    if (Math.floor(slot / PAGE_SIZE) >= availablePages) fail(400, 'Choose a cell on an available page.');
  }
  const expiresAt = plan.days ? now + plan.days * DAY_MS : null;
  // A single conditional statement claims the cell, with no asynchronous gap.
  const inserted = run(`INSERT INTO board_messages (owner_id, mode, slot, text, plan_id, price_cents, created_at, expires_at)
    SELECT ?, ?, ?, ?, ?, ?, ?, ? WHERE NOT EXISTS (
      SELECT 1 FROM board_messages WHERE mode = ? AND slot = ? AND (expires_at IS NULL OR expires_at > ?)
    )`, [userId, plan.mode, slot, text.trim(), plan.id, plan.priceCents, now, expiresAt, plan.mode, slot, now]);
  if (!inserted) fail(409, 'This cell was just taken. Choose another cell.');
  return get(`SELECT ${publicFields} FROM board_messages b JOIN users u ON u.id = b.owner_id WHERE b.mode = ? AND b.slot = ? ORDER BY b.id DESC LIMIT 1`, [plan.mode, slot]);
}
async function getPlacement(id, now = Date.now()) {
  if (!Number.isSafeInteger(id) || id <= 0) fail(400, 'Invalid message link.');
  await getDb();
  const item = get(`SELECT ${publicFields} FROM board_messages b JOIN users u ON u.id = b.owner_id WHERE b.id = ?`, [id]);
  if (!item) fail(404, 'This message could not be found.');
  return { ...item, expired: item.expires_at !== null && item.expires_at <= now };
}
module.exports = { listBoard, reservePlacement, getPlacement };
