const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(process.cwd(), "data.db");

// API route bundles must share one connection within this server process.
const state = globalThis.__oneMessageDatabase ||= { db: null, ready: null, SQL: null, transaction: false };

async function getDb() {
  if (state.db) return state.db;
  if (!state.ready) {
    state.ready = (async () => {
      state.SQL = await initSqlJs();
      state.db = fs.existsSync(DB_PATH)
        ? new state.SQL.Database(fs.readFileSync(DB_PATH))
        : new state.SQL.Database();
      try {
        state.db.run("PRAGMA foreign_keys = ON");
        initSchema();
        return state.db;
      } catch (error) { state.db.close(); state.db = null; throw error; }
    })().catch((error) => { state.ready = null; throw error; });
  }
  return state.ready;
}

function initSchema() {
  state.db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nickname TEXT NOT NULL UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT,
      avatar_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  const authCols = all("PRAGMA table_info(users)");
  if (!authCols.some((column) => column.name === "firebase_uid")) {
    state.db.run("ALTER TABLE users ADD COLUMN firebase_uid TEXT");
  }
  state.db.run("CREATE UNIQUE INDEX IF NOT EXISTS users_firebase_uid ON users(firebase_uid)");

  // Migration: add password_hash if missing
  const cols = all("PRAGMA table_info(users)");
  if (cols && !cols.some((c) => c.name === "password_hash")) {
    state.db.run("ALTER TABLE users ADD COLUMN password_hash TEXT");
  }

  state.db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      owner_id INTEGER,
      price REAL DEFAULT 1.00,
      purchased_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (owner_id) REFERENCES users(id)
    )
  `);

  state.db.run(`
    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      buyer_id INTEGER NOT NULL,
      message_id INTEGER NOT NULL,
      price REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (buyer_id) REFERENCES users(id),
      FOREIGN KEY (message_id) REFERENCES messages(id)
    )
  `);

  state.db.run(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value REAL DEFAULT 0,
      holder_id INTEGER,
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (holder_id) REFERENCES users(id)
    )
  `);

  state.db.run(`
    CREATE TABLE IF NOT EXISTS board_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER NOT NULL REFERENCES users(id),
      mode TEXT NOT NULL CHECK(mode IN ('live', 'permanent')),
      slot INTEGER NOT NULL CHECK(slot >= 0),
      text TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER
    )
  `);
  state.db.run("CREATE INDEX IF NOT EXISTS board_slots ON board_messages(mode, slot, expires_at)");
  state.db.run("CREATE UNIQUE INDEX IF NOT EXISTS permanent_board_slots ON board_messages(slot) WHERE mode = 'permanent'");

  save();
}

function save() {
  if (!state.db) return;
  const data = state.db.export();
  // sql.js export reopens SQLite; restore connection-level constraints.
  state.db.run("PRAGMA foreign_keys = ON");
  const temporary = `${DB_PATH}.tmp`;
  fs.writeFileSync(temporary, Buffer.from(data));
  fs.renameSync(temporary, DB_PATH);
}

function transaction(callback) {
  if (state.transaction) throw new Error("Nested transactions are not supported");
  const before = state.db.export();
  state.db.run("PRAGMA foreign_keys = ON");
  state.db.run("BEGIN IMMEDIATE");
  state.transaction = true;
  try {
    const result = callback();
    if (result?.then) throw new Error("Transactions must be synchronous");
    state.db.run("COMMIT");
    state.transaction = false;
    save();
    return result;
  } catch (error) {
    // Restore both the connection and constraints, including save failures.
    state.transaction = false;
    state.db.close();
    state.db = new state.SQL.Database(before);
    state.db.run("PRAGMA foreign_keys = ON");
    throw error;
  }
}

function run(sql, params = []) {
  state.db.run(sql, params);
  const changes = state.db.getRowsModified();
  if (!state.transaction) save();
  return changes;
}

function get(sql, params = []) {
  const stmt = state.db.prepare(sql);
  try {
    if (params.length) stmt.bind(params);
    return stmt.step() ? stmt.getAsObject() : null;
  } finally { stmt.free(); }
}

function all(sql, params = []) {
  const stmt = state.db.prepare(sql);
  try {
    if (params.length) stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    return rows;
  } finally { stmt.free(); }
}

module.exports = { getDb, run, get, all, save, transaction };
