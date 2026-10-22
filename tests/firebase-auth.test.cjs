const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function server({ identity = { uid: 'verified-uid' }, failure, user = null, project = 'test-project' } = {}) {
  const queries = [];
  const sandbox = { module: { exports: {} }, process: { env: { FIREBASE_PROJECT_ID: project } }, require(name) {
    if (name === 'firebase-admin/app') return { getApps: () => [{ name: 'onemessage-auth' }] };
    if (name === 'firebase-admin/auth') return { getAuth: () => ({ verifyIdToken: async (token, revoked) => {
      assert.equal(token, 'test-token'); assert.equal(revoked, false);
      if (failure) throw failure;
      return identity;
    } }) };
    if (name === '../db') return { getDb: async () => {}, get: (sql, params) => { queries.push({ sql, params }); return user; } };
    throw new Error(name);
  } };
  vm.runInNewContext(fs.readFileSync('lib/firebase/server.js', 'utf8'), sandbox);
  return { ...sandbox.module.exports, queries };
}
const request = { headers: { authorization: 'Bearer test-token' } };
test('missing and malformed bearer tokens are rejected', async () => {
  const api = server();
  for (const authorization of ['', 'Basic test-token', 'Bearer one two']) {
    await assert.rejects(api.requireIdentity({ headers: { authorization } }), { status: 401 });
  }
});
test('missing project fails closed', async () => {
  await assert.rejects(server({ project: '' }).requireIdentity(request), { status: 503 });
});
test('expired, revoked and disabled identities are rejected', async () => {
  for (const code of ['auth/id-token-expired', 'auth/id-token-revoked', 'auth/user-disabled', 'auth/argument-error']) {
    await assert.rejects(server({ failure: { code } }).requireIdentity(request), { status: 401 });
  }
});
test('credential failures return a configuration error without exposing details', async () => {
  await assert.rejects(server({ failure: { code: 'app/invalid-credential', message: 'private secret' } }).requireIdentity(request), { status: 503, message: 'Unable to verify your session. Check Firebase server configuration.' });
});
test('profile authorization uses verified UID, ignoring a forged nickname', async () => {
  const user = { id: 7, nickname: 'real-owner' };
  const api = server({ user });
  assert.equal(await api.requireUser({ ...request, body: { nickname: 'Admin' } }), user);
  assert.deepEqual(Array.from(api.queries[0].params), ['verified-uid']);
  assert.match(api.queries[0].sql, /WHERE firebase_uid = \?/);
});
test('a verified identity without a local profile cannot purchase', async () => {
  await assert.rejects(server().requireUser(request), { status: 403 });
});
