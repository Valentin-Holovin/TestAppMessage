const { getDb, get, run } = require("../../../lib/db");
const { increasePrice, MIN_PRICE } = require("../../../lib/price");
const { updateRecords } = require("../../../lib/records");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await getDb();
    const { text, nickname } = req.body;

    if (!text || !nickname) {
      return res.status(400).json({ error: "Text and nickname are required" });
    }

    const currentMessage = get(
      "SELECT id, price, owner_id, purchased_at FROM messages ORDER BY id DESC LIMIT 1"
    );
    const currentPrice = currentMessage ? currentMessage.price : MIN_PRICE;

    let user = get("SELECT id FROM users WHERE nickname = ?", [nickname]);
    if (!user) {
      run("INSERT INTO users (nickname) VALUES (?)", [nickname]);
      user = get("SELECT id FROM users WHERE nickname = ?", [nickname]);
    }

    // Create new message
    const newPrice = increasePrice(currentPrice);
    run(
      "INSERT INTO messages (text, owner_id, price, purchased_at, price_decreased_at) VALUES (?, ?, ?, datetime('now'), datetime('now'))",
      [text, user.id, newPrice]
    );

    const newMessage = get("SELECT id FROM messages ORDER BY id DESC LIMIT 1");

    // Record purchase
    run(
      "INSERT INTO purchases (buyer_id, message_id, price, created_at) VALUES (?, ?, ?, datetime('now'))",
      [user.id, newMessage.id, currentPrice]
    );

    // Update records
    updateRecords({ buyer_id: user.id, price: currentPrice });

    // Get activity level (purchases in last 24h)
    const recentPurchases = get(
      "SELECT COUNT(*) as count FROM purchases WHERE created_at > datetime('now', '-1 day')"
    );
    const activityLevel = recentPurchases.count >= 10 ? "high" : recentPurchases.count >= 3 ? "medium" : "low";

    res.status(200).json({
      ok: true,
      message: {
        id: newMessage.id,
        text,
        owner_id: user.id,
        owner_nickname: nickname,
        price: newPrice,
        purchased_at: new Date().toISOString(),
      },
      previousPrice: currentPrice,
      increasePercent: ((newPrice - currentPrice) / currentPrice * 100).toFixed(1),
      activity: activityLevel,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
