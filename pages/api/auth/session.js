const { requireIdentity, httpError } = require("../../../lib/firebase/server");
const { getDb, get, run } = require("../../../lib/db");

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const identity = await requireIdentity(req);
    if (!identity.email) throw httpError(400, "An email address is required.");
    await getDb();
    let user = get("SELECT id, nickname, email, created_at FROM users WHERE firebase_uid = ?", [identity.uid]);
    if (!user) {
      const nickname = typeof req.body?.nickname === "string" ? req.body.nickname.trim() : "";
      if (nickname.length < 2 || nickname.length > 20) throw httpError(400, "Choose a nickname of 2–20 characters to finish your profile.");
      if (get("SELECT id FROM users WHERE nickname = ?", [nickname])) throw httpError(409, "This nickname is already taken. Choose another.");
      // Never link a legacy account by unverified email alone.
      if (get("SELECT id FROM users WHERE email = ?", [identity.email])) throw httpError(409, "A legacy account uses this email. Contact support to migrate it.");
      run("INSERT INTO users (nickname, email, firebase_uid) VALUES (?, ?, ?)", [nickname, identity.email, identity.uid]);
      user = get("SELECT id, nickname, email, created_at FROM users WHERE firebase_uid = ?", [identity.uid]);
    }
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.status ? error.message : "Unable to load your profile. Please try again." });
  }
}
