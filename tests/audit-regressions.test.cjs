const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const project = process.cwd();
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'onemessage-audit-'));
process.chdir(temporary);
const db = require(path.join(project, 'lib/db'));
const { reservePlacement, getPlacement } = require(path.join(project, 'lib/board'));
process.chdir(project);
test.after(() => fs.rmSync(temporary, { recursive: true, force: true }));

async function callRoute(file, request) {
  const sandbox = { module: { exports: {} }, Date, require(name) {
    if (name.endsWith('/db')) return db;
    throw new Error(name);
  } };
  vm.runInNewContext(fs.readFileSync(path.join(project, file), 'utf8').replace('export default ', 'module.exports = '), sandbox);
  let result; let status = 200;
  const res = { setHeader() {}, status(value) { status = value; return this; }, json(value) { result = value; } };
  await sandbox.module.exports(request, res);
  return { status, result };
}

test('publication integrity and public data regressions', async (t) => {
  await db.getDb();
  db.run("INSERT INTO users (nickname, email) VALUES ('Author', 'private@example.com')");
  db.run("INSERT INTO users (nickname, email) VALUES ('Reader', 'reader@example.com')");
  const user = db.get("SELECT id, nickname FROM users WHERE nickname = 'Author'");
  // Preserve legacy records without exposing or counting the retired format.
  db.run("INSERT INTO messages (text, owner_id, price) VALUES ('Legacy one', ?, 1.1)", [user.id]);
  db.run("INSERT INTO messages (text, owner_id, price) VALUES ('Legacy two', ?, 1.21)", [user.id]);
  db.run("INSERT INTO purchases (buyer_id, message_id, price) VALUES (?, 1, 1)", [user.id]);
  await t.test('retired endpoints cannot publish or expose legacy messages', async () => {
    for (const file of ['pages/api/messages/buy.js', 'pages/api/messages/current.js', 'pages/api/history.js']) {
      for (const method of ['GET', 'POST']) {
        const { status, result } = await callRoute(file, { method, body: { text: 'Should not publish', expectedPrice: 1.21 } });
        assert.equal(status, 410);
        assert.equal('message' in result, false);
      }
    }
    assert.equal(db.get('SELECT COUNT(*) AS count FROM messages').count, 2);
    assert.equal(db.get('SELECT COUNT(*) AS count FROM purchases').count, 1);
  });
  await t.test('database transactions still roll back partial writes', async () => {
    const before = db.get('SELECT COUNT(*) AS count FROM board_messages').count;
    assert.throws(() => db.transaction(() => {
      db.run("INSERT INTO board_messages (owner_id, mode, slot, text, plan_id, price_cents, created_at) VALUES (?, 'permanent', 5, 'Rollback', 'forever', 1000, ?)", [user.id, Date.now()]);
      throw Error('simulated failure');
    }), /simulated failure/);
    assert.equal(db.get('SELECT COUNT(*) AS count FROM board_messages').count, before);
  });
  await t.test('foreign keys remain enabled after saving and reloading modules', async () => {
    assert.throws(() => db.run("INSERT INTO messages (text, owner_id) VALUES ('orphan', 999999)"), /FOREIGN KEY/);
    const filename = require.resolve(path.join(project, 'lib/db'));
    delete require.cache[filename];
    const reloaded = require(filename);
    await reloaded.getDb();
    assert.equal(reloaded.get('SELECT COUNT(*) AS count FROM messages').count, 2);
  });
  await t.test('public profiles never disclose email or invent earnings', async () => {
    const { status, result } = await callRoute('pages/api/profile/[id].js', { method: 'GET', query: { id: String(user.id) } });
    assert.equal(status, 200);
    assert.equal('email' in result.user, false);
    assert.equal('earned' in result.stats, false);
    assert.equal('messages' in result, false);
    assert.equal('badges' in result, false);
    assert.equal(result.stats.boardCount, 0);
    assert.equal(result.stats.activeCount, 0);
    assert.equal(result.stats.permanentCount, 0);
    assert.equal(JSON.stringify(result).includes('private@example.com'), false);
  });
  await t.test('rankings include board authors and exclude people who never posted', async () => {
    const reader = db.get("SELECT id FROM users WHERE nickname = 'Reader'");
    for (const slot of [1, 2, 3]) await reservePlacement(reader.id, { planId: 'day', slot, text: 'A board voice' });
    db.run("INSERT INTO users (nickname) VALUES ('No posts')");
    const { result } = await callRoute('pages/api/leaderboard.js', { method: 'GET' });
    assert.equal(result.leaders[0].nickname, 'Reader');
    assert.equal(result.leaders[0].messages, 3);
    assert.equal(result.leaders.some((item) => item.nickname === 'No posts'), false);
    assert.equal(result.leaders.some((item) => item.nickname === 'Author'), false);
  });
  await t.test('a shared link opens the original message after the cell has been reused', async () => {
    const now = Date.now();
    const first = await reservePlacement(user.id, { planId: 'day', slot: 20, text: 'Original' }, now);
    await reservePlacement(user.id, { planId: 'day', slot: 20, text: 'Replacement' }, now + 86400000);
    const original = await getPlacement(first.id, now + 86400000);
    assert.equal(original.text, 'Original');
    assert.equal(original.expired, true);
    await assert.rejects(getPlacement(-1), { status: 400 });
    await assert.rejects(getPlacement(999999), { status: 404 });
  });
  await t.test('public seeding is disabled', async () => {
    const { status } = await callRoute('pages/api/init.js', { method: 'POST' });
    assert.equal(status, 410);
  });
});

const { safeReturnTo } = require('../lib/navigation');
const { readDraft, saveDraft, clearDraft } = require('../lib/board-draft');
test('authentication redirects stay on the site and preserve compose context', () => {
  assert.equal(safeReturnTo('/?compose=1#boards'), '/?compose=1#boards');
  for (const value of ['https://evil.example', '//evil.example', '/\\evil.example', '/login?next=/login', ['/'], null]) assert.equal(safeReturnTo(value), '/#boards');
});
test('drafts survive the auth roundtrip and fail safely with disabled or corrupt storage', () => {
  const map = new Map(); const storage = { setItem: (key, value) => map.set(key, value), getItem: (key) => map.get(key), removeItem: (key) => map.delete(key) };
  saveDraft(storage, { mode: 'live', slot: 5, planId: 'week', text: 'My unpublished words' });
  assert.equal(readDraft(storage).text, 'My unpublished words');
  assert.equal(readDraft(storage, Date.now() + 8 * 86400000), null);
  clearDraft(storage);
  assert.equal(readDraft(storage), null);
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); }, removeItem() { throw Error('blocked'); } };
  assert.equal(readDraft(blocked), null); assert.doesNotThrow(() => saveDraft(blocked, {})); assert.doesNotThrow(() => clearDraft(blocked));
  storage.setItem('onemessage:board-draft', 'not JSON'); assert.equal(readDraft(storage), null);
  saveDraft(storage, { mode: 'live', slot: 999999, planId: 'forever', text: 'tampered' }); assert.equal(readDraft(storage), null);
});
test('a disconnected event subscriber cannot break a completed publication', () => {
  const { clients, broadcast } = require('../lib/events');
  let received = '';
  const broken = { write() { throw Error('gone'); } };
  const healthy = { write(value) { received += value; } };
  clients.add(broken); clients.add(healthy);
  assert.doesNotThrow(() => broadcast('board_update', { mode: 'live' }));
  assert.equal(clients.has(broken), false); assert.match(received, /event: board_update/);
  clients.clear();
});

test('the old history page redirects to the boards', () => {
  const sandbox = { module: { exports: {} } };
  const source = fs.readFileSync(path.join(project, 'pages/history.js'), 'utf8')
    .replace('export default ', 'module.exports.default = ')
    .replace('export function getServerSideProps', 'module.exports.getServerSideProps = function getServerSideProps');
  vm.runInNewContext(source, sandbox);
  assert.equal(sandbox.module.exports.getServerSideProps().redirect.destination, '/#boards');
});
