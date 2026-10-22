const PLANS = [
  { id: 'day', mode: 'live', days: 1, priceCents: 50, label: '1 day' },
  { id: 'week', mode: 'live', days: 7, priceCents: 200, label: '7 days' },
  { id: 'month', mode: 'live', days: 30, priceCents: 500, label: '30 days' },
  { id: 'forever', mode: 'permanent', days: null, priceCents: 1000, label: 'Forever' },
];
const PAGE_SIZE = 64;
module.exports = { PLANS, PAGE_SIZE };
