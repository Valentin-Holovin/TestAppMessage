// Share subscribers across separately bundled Next.js API routes.
const clients = globalThis.__oneMessageSubscribers ||= new Set();
function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    if (client.destroyed || client.writableEnded) { clients.delete(client); continue; }
    try { client.write(payload); } catch { clients.delete(client); }
  }
}
module.exports = { clients, broadcast };
