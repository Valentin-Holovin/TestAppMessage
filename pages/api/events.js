// SSE endpoint — clients subscribe here for real-time updates
const clients = new Set();

export const config = {
  api: { responseLimit: false },
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  // Send initial heartbeat
  res.write(":\n\n");

  clients.add(res);

  // Heartbeat every 30s to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(":\n\n");
  }, 30000);

  req.on("close", () => {
    clearInterval(heartbeat);
    clients.delete(res);
  });
}

// Broadcast to all connected clients
export function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    client.write(payload);
  }
}

export function getClientCount() {
  return clients.size;
}
