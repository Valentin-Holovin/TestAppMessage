export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(410).json({ error: "This format has been retired. Use the message boards instead." });
}
