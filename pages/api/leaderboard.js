const { getDb, get, all } = require("../../lib/db");

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await getDb();

    const leaders = all(`
      SELECT u.id, u.nickname, COUNT(b.id) AS message_count,
        SUM(b.price_cents) / 100.0 AS total_spent, COUNT(b.id) AS purchase_count
      FROM users u JOIN board_messages b ON b.owner_id = u.id
      GROUP BY u.id ORDER BY message_count DESC, total_spent DESC, u.id ASC LIMIT 20
    `);

    const enriched = leaders.map((l, i) => ({
      rank: i + 1,
      id: l.id,
      nickname: l.nickname,
      total: `$${Number(l.total_spent).toFixed(2)}`,
      messages: l.message_count,
      purchases: l.purchase_count,
      badge: getBadge(i + 1),
    }));

    res.status(200).json({ leaders: enriched });
  } catch (err) {
    res.status(500).json({ error: "Unable to load rankings." });
  }
}

function getBadge(rank) {
  if (rank === 1) return "Diamond";
  if (rank === 2) return "Gold";
  if (rank === 3) return "Bronze";
  if (rank <= 5) return "Silver";
  if (rank <= 10) return "Emerald";
  return "Member";
}
