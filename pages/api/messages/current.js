const { getDb, get } = require("../../../lib/db");
const { decreasePrice, getHeldSeconds, formatHeld, getNextDecreaseCountdown, getActivityLevel } = require("../../../lib/price");
const { getAllRecords } = require("../../../lib/records");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await getDb();

    const msg = get(`
      SELECT
        m.id,
        m.text,
        m.price,
        m.purchased_at,
        m.price_decreased_at,
        u.id as owner_id,
        u.nickname as owner_nickname
      FROM messages m
      LEFT JOIN users u ON m.owner_id = u.id
      ORDER BY m.id DESC
      LIMIT 1
    `);

    // Calculate current price (with decrease)
    let currentPrice = msg ? msg.price : 1.0;
    if (msg && msg.purchased_at) {
      const heldSeconds = getHeldSeconds(msg.purchased_at);
      currentPrice = decreasePrice(msg.price, heldSeconds);
    }

    // Activity level
    const recentPurchases = get(
      "SELECT COUNT(*) as count FROM purchases WHERE created_at > datetime('now', '-1 day')"
    );
    const activity = getActivityLevel(recentPurchases.count);

    // Records
    const records = getAllRecords();

    // Format records for display
    const formattedRecords = {
      longestHold: records.longestHold.value
        ? { value: formatHeld(records.longestHold.value), holder: records.longestHold.holder_nickname, raw: records.longestHold.value }
        : { value: "—", holder: null, raw: 0 },
      highestPrice: records.highestPrice.value
        ? { value: `$${records.highestPrice.value.toFixed(2)}`, holder: records.highestPrice.holder_nickname }
        : { value: "—", holder: null },
      mostPurchases: records.mostPurchases.value
        ? { value: records.mostPurchases.value, holder: records.mostPurchases.holder_nickname }
        : { value: "—", holder: null },
    };

    res.status(200).json({
      message: msg
        ? {
            id: msg.id,
            text: msg.text,
            price: currentPrice,
            basePrice: msg.price,
            purchased_at: msg.purchased_at,
            owner_id: msg.owner_id,
            owner_nickname: msg.owner_nickname,
            held: msg.purchased_at ? formatHeld(getHeldSeconds(msg.purchased_at)) : "—",
            heldSeconds: msg.purchased_at ? getHeldSeconds(msg.purchased_at) : 0,
            countdown: msg.purchased_at ? getNextDecreaseCountdown(msg.purchased_at) : null,
          }
        : null,
      stats: {
        totalOwners: get("SELECT COUNT(DISTINCT owner_id) as count FROM messages").count,
        totalVolume: Number(get("SELECT COALESCE(SUM(price), 0) as total FROM purchases").total).toFixed(2),
        totalPurchases: get("SELECT COUNT(*) as count FROM purchases").count,
      },
      activity,
      records: formattedRecords,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
