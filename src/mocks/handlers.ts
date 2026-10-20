import { delay, http, HttpResponse } from 'msw';
import { CATEGORY_META, DAY, REF_MS, transactions } from './generateData';
import type { Transaction } from '../api/schemas';
import { specCategories, specGoals, specProfile, specSummary, specTrends } from './responses';

const PERIOD_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
const SORTS = ['date_desc', 'date_asc', 'amount_desc', 'amount_asc'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const day = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const cents = (txs: Transaction[]) => txs.reduce((s, t) => s + Math.round(t.amount * 100), 0);
const money = (c: number) => Math.round(c) / 100;
const round1 = (n: number) => Math.round(n * 10) / 10;
const change = (cur: number, prev: number) => (prev === 0 ? 0 : round1(((cur - prev) / prev) * 100));
const bad = (message: string) => HttpResponse.json({ message }, { status: 400 });
// The default view (30 days, no custom range) returns the spec's sample payloads exactly.
const isDefaultView = (url: URL) =>
  !url.searchParams.has('startDate') && !url.searchParams.has('endDate') && (url.searchParams.get('period') ?? '30d') === '30d';

interface Range { start: string; end: string }
const inRange = (t: Transaction, r: Range) => t.date.slice(0, 10) >= r.start && t.date.slice(0, 10) <= r.end;

function resolveRange(url: URL): Range | null {
  const start = url.searchParams.get('startDate');
  const end = url.searchParams.get('endDate');
  if (start || end) return start && end && DATE_RE.test(start) && DATE_RE.test(end) ? { start, end } : null;
  const days = PERIOD_DAYS[url.searchParams.get('period') ?? '30d'];
  return days ? { start: day(REF_MS - days * DAY), end: day(REF_MS) } : null;
}

function byCategory(txs: Transaction[]) {
  const groups = new Map<string, Transaction[]>();
  for (const t of txs) groups.set(t.category, [...(groups.get(t.category) ?? []), t]);
  return [...groups.entries()]
    .map(([name, items]) => ({ name, items, total: cents(items) }))
    .sort((a, b) => b.total - a.total);
}

// Append ?mockError=goals (summary | categories | trends | goals | transactions | profile) to demo error states.
const failing = (name: string) => new URLSearchParams(globalThis.location?.search ?? '').get('mockError') === name;
const latency = () => delay(import.meta.env.MODE === 'test' ? 0 : 300);

const endpoint = (name: string, path: string, build: (url: URL) => Response) =>
  http.get(`*/api/customers/:customerId/${path}`, async ({ request }) => {
    await latency();
    if (failing(name)) return HttpResponse.json({ message: 'Simulated failure' }, { status: 500 });
    return build(new URL(request.url));
  });

export const handlers = [
  endpoint('profile', 'profile', () => HttpResponse.json(specProfile)),

  endpoint('summary', 'spending/summary', (url) => {
    const range = resolveRange(url);
    if (!range) return bad('Invalid period or date range');
    if (isDefaultView(url)) return HttpResponse.json(specSummary);
    const spanMs = Date.parse(range.end) - Date.parse(range.start);
    const prevEnd = Date.parse(range.start) - DAY;
    const prev = transactions.filter((t) => inRange(t, { start: day(prevEnd - spanMs), end: day(prevEnd) }));
    const cur = transactions.filter((t) => inRange(t, range));
    const total = cents(cur);
    return HttpResponse.json({
      period: url.searchParams.get('period') ?? 'custom',
      totalSpent: money(total),
      transactionCount: cur.length,
      averageTransaction: cur.length ? money(total / cur.length) : 0,
      topCategory: byCategory(cur)[0]?.name ?? 'None',
      comparedToPrevious: {
        spentChange: change(total, cents(prev)),
        transactionChange: change(cur.length, prev.length),
      },
    });
  }),

  endpoint('categories', 'spending/categories', (url) => {
    const range = resolveRange(url);
    if (!range) return bad('Invalid period or date range');
    if (isDefaultView(url)) return HttpResponse.json(specCategories);
    const cur = transactions.filter((t) => inRange(t, range));
    const total = cents(cur);
    return HttpResponse.json({
      dateRange: { startDate: range.start, endDate: range.end },
      totalAmount: money(total),
      categories: byCategory(cur).map((g) => ({
        name: g.name,
        amount: money(g.total),
        percentage: total ? round1((g.total / total) * 100) : 0,
        transactionCount: g.items.length,
        color: CATEGORY_META[g.name].color,
        icon: CATEGORY_META[g.name].icon,
      })),
    });
  }),

  endpoint('trends', 'spending/trends', (url) => {
    const months = Number(url.searchParams.get('months') ?? 12);
    if (!Number.isInteger(months) || months < 1 || months > 24) return bad('months must be 1-24');
    // The spec sample covers Jan-Jun 2024 only, so that is all the mock has.
    return HttpResponse.json({ trends: specTrends.slice(-months) });
  }),

  endpoint('goals', 'goals', () => HttpResponse.json({ goals: specGoals })),

  endpoint('transactions', 'transactions', (url) => {
    const q = url.searchParams;
    const limit = Number(q.get('limit') ?? 20);
    const offset = Number(q.get('offset') ?? 0);
    const sortBy = q.get('sortBy') ?? 'date_desc';
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) return bad('limit must be 1-100');
    if (!Number.isInteger(offset) || offset < 0) return bad('offset must be >= 0');
    if (!SORTS.includes(sortBy)) return bad('Invalid sortBy');
    const start = q.get('startDate') ?? '0000-01-01';
    const end = q.get('endDate') ?? '9999-12-31';
    const category = q.get('category');
    const sorters: Record<string, (a: Transaction, b: Transaction) => number> = {
      date_desc: (a, b) => b.date.localeCompare(a.date),
      date_asc: (a, b) => a.date.localeCompare(b.date),
      amount_desc: (a, b) => b.amount - a.amount,
      amount_asc: (a, b) => a.amount - b.amount,
    };
    const all = transactions
      .filter((t) => inRange(t, { start, end }) && (!category || t.category === category))
      .sort(sorters[sortBy]);
    return HttpResponse.json({
      transactions: all.slice(offset, offset + limit),
      pagination: { total: all.length, limit, offset, hasMore: offset + limit < all.length },
    });
  }),

  endpoint('filters', 'filters', () =>
    HttpResponse.json({
      categories: Object.entries(CATEGORY_META).map(([name, m]) => ({ name, color: m.color, icon: m.icon })),
      dateRangePresets: [
        { label: 'Last 7 days', value: '7d' }, { label: 'Last 30 days', value: '30d' },
        { label: 'Last 90 days', value: '90d' }, { label: 'Last year', value: '1y' },
      ],
    }),
  ),
];