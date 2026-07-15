const { getDb, get, all } = require("../../../lib/db");
const { getHeldSeconds, formatHeld } = require("../../../lib/price");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await getDb();
    const { id } = req.query;

    const user = get(
      "SELECT id, nickname, email, avatar_url, created_at FROM users WHERE id = ? OR nickname = ?",
      [id, id]
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get messages owned by user
    const messages = all(`
      SELECT
        m.id,
        m.text,
        m.price,
        m.purchased_at,
        m.owner_id
      FROM messages m
      WHERE m.owner_id = ?
      ORDER BY m.id DESC
    `, [user.id]);

    // Get purchase stats
    const stats = get(`
      SELECT
        COUNT(*) as purchase_count,
        COALESCE(SUM(price), 0) as total_spent
      FROM purchases
      WHERE buyer_id = ?
    `, [user.id]);

    // Get badges from records
    const badges = all(`
      SELECT key, value FROM records WHERE holder_id = ?
    `, [user.id]);

    // Calculate longest hold from messages
    let longestHold = 0;
    for (const msg of messages) {
      if (msg.purchased_at) {
        const held = getHeldSeconds(msg.purchased_at);
        if (held > longestHold) longestHold = held;
      }
    }

    // Get earnings (when others bought messages the user owned)
    const earnings = get(`
      SELECT COALESCE(SUM(p.price), 0) as earned
      FROM purchases p
      JOIN messages m ON p.message_id = m.id
      WHERE m.owner_id = ?
    `, [user.id]);

    res.status(200).json({
      user: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
      },
      messages: messages.map((m) => ({
        id: m.id,
        text: m.text,
        price: m.price,
        purchased_at: m.purchased_at,
        hold: m.purchased_at ? formatHeld(getHeldSeconds(m.purchased_at)) : "—",
      })),
      stats: {
        purchaseCount: stats.purchase_count,
        totalSpent: Number(stats.total_spent).toFixed(2),
        earned: Number(earnings.earned).toFixed(2),
        longestHold: formatHeld(longestHold),
      },
      badges: badges.map((b) => ({
        key: b.key,
        value: b.key === "longest_hold" ? formatHeld(b.value) : b.key === "highest_price" ? `$${b.value.toFixed(2)}` : b.value,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
