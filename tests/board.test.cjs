const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const project = process.cwd();
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'onemessage-board-test-'));
process.chdir(temporary);
const db = require(path.join(project, 'lib/db'));
const { reservePlacement, listBoard } = require(path.join(project, 'lib/board'));
process.chdir(project);
test.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
const now = Date.UTC(2026, 9, 22, 12);

test('board reservations, expiration, history and expansion use the database correctly', async (t) => {
  await db.getDb();
  db.run("INSERT INTO users (nickname) VALUES ('Test owner')");
  const user = db.get('SELECT id FROM users').id;
  await t.test('all published plans have server-owned prices and correct expiry', async () => {
    for (const [i, [planId, cents, days]] of [['day', 50, 1], ['week', 200, 7], ['month', 500, 30], ['forever', 1000, null]].entries()) {
      const item = await reservePlacement(user, { planId, slot: i, text: '  Hello board  ', priceCents: 0, expires_at: 0 }, now);
      assert.equal(item.price_cents, cents);
      assert.equal(item.text, 'Hello board');
      assert.equal(item.expires_at, days ? now + days * 86400000 : null);
    }
  });
  await t.test('occupied cells cannot be overwritten, including concurrent requests', async () => {
    await assert.rejects(reservePlacement(user, { planId: 'week', slot: 0, text: 'Overwrite' }, now), { status: 409 });
    await assert.rejects(reservePlacement(user, { planId: 'week', slot: 12, text: 'Stale rate', expectedPriceCents: 1 }, now), { status: 409 });
    const results = await Promise.allSettled([1, 2].map(() => reservePlacement(user, { planId: 'day', slot: 10, text: 'Race' }, now)));
    assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
    assert.equal(results.find((r) => r.status === 'rejected').reason.status, 409);
  });
  await t.test('expiry frees the exact cell and preserves the old message in archive', async () => {
    const afterDay = now + 86400000;
    const live = await listBoard('live', 0, afterDay);
    assert.equal(live.items.some((item) => item.slot === 0), false);
    const archive = await listBoard('archive', 0, afterDay);
    assert.ok(archive.items.some((item) => item.slot === 0 && item.text === 'Hello board'));
    await reservePlacement(user, { planId: 'week', slot: 0, text: 'New owner message' }, afterDay);
    assert.equal((await listBoard('archive', 0, afterDay)).total, archive.total);
    assert.equal((await listBoard('live', 0, afterDay)).items.find((item) => item.slot === 0).text, 'New owner message');
  });
  await t.test('permanent placements never expire and cannot be replaced', async () => {
    assert.ok((await listBoard('permanent', 0, now + 1000 * 86400000)).items.some((item) => item.slot === 3));
    await assert.rejects(reservePlacement(user, { planId: 'forever', slot: 3, text: 'Replace permanent' }, now + 1000 * 86400000), { status: 409 });
  });
  await t.test('the permanent wall expands after the first page fills', async () => {
    await assert.rejects(reservePlacement(user, { planId: 'forever', slot: 10000, text: 'Skip pages' }, now), { status: 400 });
    for (let slot = 0; slot < 64; slot++) {
      if (slot !== 3) await reservePlacement(user, { planId: 'forever', slot, text: `Cell ${slot}` }, now);
    }
    assert.equal((await listBoard('permanent', 0, now)).pages, 2);
    const next = await reservePlacement(user, { planId: 'forever', slot: 64, text: 'A new page' }, now);
    assert.equal(next.slot, 64);
    assert.equal((await listBoard('permanent', 1, now)).items[0].text, 'A new page');
  });
  await t.test('invalid plans, cells and content are rejected', async () => {
    for (const body of [{ planId: 'free', slot: 2, text: 'hi' }, { planId: 'day', slot: 64, text: 'hi' }, { planId: 'day', slot: -1, text: 'hi' }, { planId: 'day', slot: 4.5, text: 'hi' }, { planId: 'day', slot: 5, text: '  ' }, { planId: 'day', slot: 5, text: 'x'.repeat(281) }]) {
      await assert.rejects(reservePlacement(user, body, now), { status: 400 });
    }
  });
});
