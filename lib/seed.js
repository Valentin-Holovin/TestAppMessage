const { getDb, run, get } = require("./db");
const crypto = require("crypto");

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function seed() {
  await getDb();

  const userCount = get("SELECT COUNT(*) as count FROM users").count;
  if (userCount > 0) return;

  // Only Admin account
  run(
    "INSERT INTO users (nickname, email, password_hash) VALUES (?, ?, ?)",
    ["Admin", "admin@onemessage.io", hashPassword("admin123")]
  );

  // Initial message
  run(
    "INSERT INTO messages (text, owner_id, price, purchased_at, price_decreased_at) VALUES (?, ?, 1.0, datetime('now'), datetime('now'))",
    ["This message is visible to the whole internet. Replace me!", 1]
  );
}

module.exports = { seed, hashPassword };
