const { getDb, get, run } = require("../../../lib/db");
const { hashPassword } = require("../../../lib/seed");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await getDb();
    const { nickname, email, password } = req.body;

    if (!nickname || !email || !password) {
      return res.status(400).json({ error: "Nickname, email and password are required" });
    }

    if (nickname.length < 2 || nickname.length > 20) {
      return res.status(400).json({ error: "Nickname must be 2-20 characters" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existing = get("SELECT id FROM users WHERE nickname = ? OR email = ?", [nickname, email]);
    if (existing) {
      return res.status(409).json({ error: "Nickname or email already taken" });
    }

    run(
      "INSERT INTO users (nickname, email, password_hash) VALUES (?, ?, ?)",
      [nickname, email, hashPassword(password)]
    );

    const user = get("SELECT id, nickname, email, created_at FROM users WHERE nickname = ?", [nickname]);

    res.status(201).json({ ok: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
