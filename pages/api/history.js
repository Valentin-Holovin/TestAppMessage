const { getDb, all } = require("../../lib/db");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await getDb();

    const history = all(`
      SELECT
        m.id,
        m.text,
        m.price,
        m.purchased_at,
        u.id as owner_id,
        u.nickname as owner_nickname
      FROM messages m
      LEFT JOIN users u ON m.owner_id = u.id
      ORDER BY m.id DESC
      LIMIT 50
    `);

    res.status(200).json({ history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
