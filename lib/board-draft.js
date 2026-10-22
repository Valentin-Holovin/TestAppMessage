const { PLANS } = require('./board-plans');
const KEY = 'onemessage:board-draft';
function readDraft(storage, now = Date.now()) {
  try {
    const value = JSON.parse(storage.getItem(KEY));
    const plan = PLANS.find((item) => item.id === value?.planId);
    if (!plan || plan.mode !== value.mode || !Number.isSafeInteger(value.slot) || value.slot < 0 || value.slot > 1000000 ||
      value.mode === 'live' && value.slot >= 64 || typeof value.text !== 'string' || value.text.length > 280 ||
      !Number.isFinite(value.savedAt) || now - value.savedAt > 7 * 86400000 || value.savedAt > now + 60000) return null;
    return value;
  } catch { return null; }
}
function saveDraft(storage, value) { try { storage.setItem(KEY, JSON.stringify({ ...value, savedAt: Date.now() })); } catch {} }
function clearDraft(storage) { try { storage.removeItem(KEY); } catch {} }
function sessionStore() { try { return typeof window === "undefined" ? null : window.sessionStorage; } catch { return null; } }
module.exports = { readDraft, saveDraft, clearDraft, sessionStore };
