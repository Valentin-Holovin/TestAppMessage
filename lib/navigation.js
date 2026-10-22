function safeReturnTo(value, fallback = '/#boards') {
  if (typeof value !== 'string' || !value.startsWith('/')) return fallback;
  try {
    const url = new URL(value, 'https://onemessage.local');
    if (url.origin !== 'https://onemessage.local' || ['/login', '/register'].includes(url.pathname)) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return fallback; }
}
module.exports = { safeReturnTo };
