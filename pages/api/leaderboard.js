const { getDb, get, all } = require("../../lib/db");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await getDb();

    const leaders = all(`
      SELECT
        u.id,
        u.nickname,
        COUNT(DISTINCT p.message_id) as message_count,
        COALESCE(SUM(p.price), 0) as total_spent,
        COUNT(p.id) as purchase_count
      FROM users u
      LEFT JOIN purchases p ON p.buyer_id = u.id
      GROUP BY u.id
      ORDER BY total_spent DESC
      LIMIT 20
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
    res.status(500).json({ error: err.message });
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
