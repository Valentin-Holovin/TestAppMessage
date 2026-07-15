const { getDb, run, get } = require("./db");
const crypto = require("crypto");

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function seed() {
  await getDb();

  const userCount = get("SELECT COUNT(*) as count FROM users").count;
  if (userCount > 0) return;

  const users = [
    { nickname: "Admin", email: "admin@onemessage.io", password: "admin123" },
    { nickname: "DiamondOwner", email: "diamond@example.com", password: "pass123" },
    { nickname: "GoldHodler", email: "gold@example.com", password: "pass123" },
    { nickname: "CoolUser", email: "cool@example.com", password: "pass123" },
    { nickname: "Pioneer", email: "pioneer@example.com", password: "pass123" },
  ];

  for (const u of users) {
    run(
      "INSERT INTO users (nickname, email, password_hash) VALUES (?, ?, ?)",
      [u.nickname, u.email, hashPassword(u.password)]
    );
  }

  // Purchase history with timestamps
  const purchases = [
    { userId: 1, text: "Welcome to OneMessage!", price: 1.0, hoursAgo: 72 },
    { userId: 2, text: "The future is decentralized.", price: 1.1, hoursAgo: 48 },
    { userId: 3, text: "Own your words.", price: 1.19, hoursAgo: 24 },
    { userId: 4, text: "This is the internet's voice.", price: 1.28, hoursAgo: 6 },
    { userId: 1, text: "This message is visible to the whole internet. Replace me!", price: 1.38, hoursAgo: 0 },
  ];

  for (let i = 0; i < purchases.length; i++) {
    const p = purchases[i];
    const msgId = i + 1;
    run(
      "INSERT INTO messages (text, owner_id, price, purchased_at, price_decreased_at) VALUES (?, ?, ?, datetime('now', ?), datetime('now', ?))",
      [p.text, p.userId, p.price, `-${p.hoursAgo} hours`, `-${p.hoursAgo} hours`]
    );
    run(
      "INSERT INTO purchases (buyer_id, message_id, price, created_at) VALUES (?, ?, ?, datetime('now', ?))",
      [p.userId, msgId, p.price, `-${p.hoursAgo} hours`]
    );
  }

  // Set some records
  run("INSERT INTO records (key, value, holder_id) VALUES (?, ?, ?)", ["longest_hold", 259200, 1]); // 3 days
  run("INSERT INTO records (key, value, holder_id) VALUES (?, ?, ?)", ["highest_price", 1.38, 1]);
  run("INSERT INTO records (key, value, holder_id) VALUES (?, ?, ?)", ["most_purchases", 2, 1]);
}

module.exports = { seed, hashPassword };
