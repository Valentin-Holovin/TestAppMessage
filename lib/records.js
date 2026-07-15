const { get, run } = require("./db");

function getRecord(key) {
  return get("SELECT * FROM records WHERE key = ?", [key]);
}

function setRecord(key, value, holderId = null) {
  const existing = getRecord(key);
  if (existing) {
    run(
      "UPDATE records SET value = ?, holder_id = ?, updated_at = datetime('now') WHERE key = ?",
      [value, holderId, key]
    );
  } else {
    run(
      "INSERT INTO records (key, value, holder_id) VALUES (?, ?, ?)",
      [key, value, holderId]
    );
  }
}

function getAllRecords() {
  const records = {};
  const rows = get(
    "SELECT r.*, u.nickname as holder_nickname FROM records r LEFT JOIN users u ON r.holder_id = u.id"
  );
  if (rows) {
    records.longest_hold = { value: rows.value, holder: rows.holder_nickname, updated: rows.updated_at };
  }

  // Get each record separately
  const longest = get("SELECT r.*, u.nickname as holder_nickname FROM records r LEFT JOIN users u ON r.holder_id = u.id WHERE r.key = 'longest_hold'");
  const highest = get("SELECT r.*, u.nickname as holder_nickname FROM records r LEFT JOIN users u ON r.holder_id = u.id WHERE r.key = 'highest_price'");
  const purchases = get("SELECT r.*, u.nickname as holder_nickname FROM records r LEFT JOIN users u ON r.holder_id = u.id WHERE r.key = 'most_purchases'");

  return {
    longestHold: longest || { value: 0, holder_nickname: null, updated_at: null },
    highestPrice: highest || { value: 0, holder_nickname: null, updated_at: null },
    mostPurchases: purchases || { value: 0, holder_nickname: null, updated_at: null },
  };
}

function updateRecords(purchase) {
  // Highest price
  const highest = getRecord("highest_price");
  if (!highest || purchase.price > highest.value) {
    setRecord("highest_price", purchase.price, purchase.buyer_id);
  }

  // Most purchases
  const userPurchases = get(
    "SELECT COUNT(*) as count FROM purchases WHERE buyer_id = ?",
    [purchase.buyer_id]
  );
  const mostPurchases = getRecord("most_purchases");
  if (!mostPurchases || userPurchases.count > mostPurchases.value) {
    setRecord("most_purchases", userPurchases.count, purchase.buyer_id);
  }
}

function updateLongestHold(userId, heldSeconds) {
  const longest = getRecord("longest_hold");
  if (!longest || heldSeconds > longest.value) {
    setRecord("longest_hold", heldSeconds, userId);
  }
}

module.exports = { getRecord, setRecord, getAllRecords, updateRecords, updateLongestHold };
