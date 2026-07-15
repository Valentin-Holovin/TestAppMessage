/**
 * Price Economy Engine
 *
 * Increase on purchase, decrease over time.
 */

const MIN_PRICE = 1.0;

// Price increase tiers (on purchase)
function getIncreasePercent(price) {
  if (price <= 10) return 0.10;
  if (price <= 50) return 0.08;
  if (price <= 100) return 0.06;
  if (price <= 500) return 0.04;
  if (price <= 1000) return 0.03;
  return 0.02;
}

// Calculate new price after purchase
function increasePrice(currentPrice) {
  const percent = getIncreasePercent(currentPrice);
  const newPrice = currentPrice * (1 + percent);
  return Math.round(newPrice * 100) / 100;
}

// Price decrease over time (called periodically)
function decreasePrice(currentPrice, heldSeconds) {
  const hours = heldSeconds / 3600;

  let decreaseRate = 0;
  if (hours > 168) {
    // > 7 days
    decreaseRate = 0.03;
  } else if (hours > 24) {
    // > 24 hours
    decreaseRate = 0.02;
  } else if (hours > 6) {
    // > 6 hours
    decreaseRate = 0.01;
  }

  if (decreaseRate === 0) return currentPrice;

  // Per hour decrease
  const newPrice = currentPrice * (1 - decreaseRate / 100);
  return Math.max(MIN_PRICE, Math.round(newPrice * 100) / 100);
}

// Calculate held duration in seconds
function getHeldSeconds(purchasedAt) {
  const now = new Date();
  const purchased = new Date(purchasedAt);
  return Math.max(0, (now - purchased) / 1000);
}

// Format held duration for display
function formatHeld(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// Calculate countdown to next decrease
function getNextDecreaseCountdown(purchasedAt) {
  const heldSeconds = getHeldSeconds(purchasedAt);
  const hours = heldSeconds / 3600;

  // No decrease in first 6 hours
  if (hours < 6) {
    const secondsUntilDecrease = (6 - hours) * 3600;
    return {
      type: "wait",
      label: "Decrease starts in",
      seconds: Math.max(0, Math.round(secondsUntilDecrease)),
    };
  }

  // After 6 hours, decrease is hourly
  const currentHour = Math.floor(hours);
  const secondsUntilNextHour = (currentHour + 1) * 3600 - heldSeconds;
  return {
    type: "active",
    label: "Next decrease in",
    seconds: Math.max(0, Math.round(secondsUntilNextHour)),
  };
}

// Activity level based on recent purchases (last 24h)
function getActivityLevel(recentPurchaseCount) {
  if (recentPurchaseCount >= 10) return "high";
  if (recentPurchaseCount >= 3) return "medium";
  return "low";
}

module.exports = {
  MIN_PRICE,
  getIncreasePercent,
  increasePrice,
  decreasePrice,
  getHeldSeconds,
  formatHeld,
  getNextDecreaseCountdown,
  getActivityLevel,
};
