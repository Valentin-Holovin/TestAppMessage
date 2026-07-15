const { getDb, get } = require("../../../lib/db");
const { hashPassword } = require("../../../lib/seed");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await getDb();
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: "Login and password are required" });
    }

    const user = get(
      "SELECT id, nickname, email, password_hash, created_at FROM users WHERE nickname = ? OR email = ?",
      [login, login]
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.password_hash !== hashPassword(password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const { password_hash, ...safeUser } = user;

    res.status(200).json({ ok: true, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
