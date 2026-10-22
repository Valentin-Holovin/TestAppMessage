export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.status(410).json({ error: "Public database seeding is disabled. Register with Firebase to create an account." });
}
