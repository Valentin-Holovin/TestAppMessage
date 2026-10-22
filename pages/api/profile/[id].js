const { getDb, get, all } = require("../../../lib/db");

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await getDb();
    const { id } = req.query;
    if (typeof id !== "string") return res.status(400).json({ error: "Invalid profile." });

    const user = get(
      "SELECT id, nickname, avatar_url, created_at FROM users WHERE id = ? OR nickname = ?",
      [id, id]
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const now = Date.now();
    const stats = get(`
      SELECT COUNT(*) AS count,
        COALESCE(SUM(CASE WHEN expires_at IS NULL OR expires_at > ? THEN 1 ELSE 0 END), 0) AS active,
        COALESCE(SUM(CASE WHEN mode = 'permanent' THEN 1 ELSE 0 END), 0) AS permanent
      FROM board_messages WHERE owner_id = ?
    `, [now, user.id]);

    res.status(200).json({
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
      },
      boardPlacements: all(`
        SELECT id, mode, slot, text, price_cents, created_at, expires_at
        FROM board_messages WHERE owner_id = ? ORDER BY id DESC LIMIT 100
      `, [user.id]).map((item) => ({ ...item, expired: item.expires_at !== null && item.expires_at <= now })),
      stats: {
        boardCount: stats.count,
        activeCount: stats.active,
        permanentCount: stats.permanent,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Unable to load profile." });
  }
}
