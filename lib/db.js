const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(process.cwd(), "data.db");

let db = null;
let dbReady = null;

async function getDb() {
  if (db) return db;

  if (!dbReady) {
    dbReady = (async () => {
      const SQL = await initSqlJs();

      if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
      } else {
        db = new SQL.Database();
      }

      db.run("PRAGMA journal_mode = WAL");
      db.run("PRAGMA foreign_keys = ON");

      initSchema();

      return db;
    })();
  }

  return dbReady;
}

function initSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nickname TEXT NOT NULL UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT,
      avatar_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Migration: add password_hash if missing
  const cols = all("PRAGMA table_info(users)");
  if (cols && !cols.some((c) => c.name === "password_hash")) {
    db.run("ALTER TABLE users ADD COLUMN password_hash TEXT");
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      owner_id INTEGER,
      price REAL DEFAULT 1.00,
      purchased_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (owner_id) REFERENCES users(id)
    )
  `);

  db.run(`
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

  db.run(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value REAL DEFAULT 0,
      holder_id INTEGER,
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (holder_id) REFERENCES users(id)
    )
  `);

  // Migration: add price_decreased_at to messages
  const msgCols = all("PRAGMA table_info(messages)");
  if (msgCols && !msgCols.some((c) => c.name === "price_decreased_at")) {
    db.run("ALTER TABLE messages ADD COLUMN price_decreased_at TEXT");
  }

  save();
}

function save() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function run(sql, params = []) {
  db.run(sql, params);
  save();
}

function get(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);

  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }

  stmt.free();
  return null;
}

function all(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);

  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }

  stmt.free();
  return rows;
}

module.exports = { getDb, run, get, all, save };
