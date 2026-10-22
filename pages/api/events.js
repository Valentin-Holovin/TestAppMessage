const { clients } = require("../../lib/events");
export const config = { api: { responseLimit: false, externalResolver: true } };
export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
  res.write(": connected\n\n");
  clients.add(res);
  function cleanup() { clearInterval(heartbeat); clients.delete(res); }
  const heartbeat = setInterval(() => {
    if (res.destroyed || res.writableEnded) { cleanup(); return; }
    try { res.write(": heartbeat\n\n"); } catch { cleanup(); }
  }, 30000);
  heartbeat.unref?.();
  res.on("close", cleanup);
  res.on("error", cleanup);
}
