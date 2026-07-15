const { getDb } = require("../../lib/db");
const { seed } = require("../../lib/seed");

export default async function handler(req, res) {
  try {
    await getDb();
    await seed();
    res.status(200).json({ ok: true, message: "Database initialized and seeded" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
