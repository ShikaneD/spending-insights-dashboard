import type { Transaction } from '../api/schemas';
import { specTransactions } from './responses';

export const REF_MS = Date.UTC(2024, 8, 16, 18, 0, 0); // fixed "today" so 2024 sample dates stay relevant
export const DAY = 86_400_000;
// Generated data ends just before the spec's two sample transactions, so they stay at the top (1,248 + 2 = 1,250 total).
const GEN_END_MS = Date.UTC(2024, 8, 15, 10, 0, 0);

export const CATEGORY_META: Record<
  string,
  { color: string; icon: string; weight: number; min: number; max: number; merchants: string[]; notes: string[] }
> = {
  Groceries: { color: '#FF6B6B', icon: 'shopping-cart', weight: 30, min: 4500, max: 95000, merchants: ['Pick n Pay', 'Woolworths', 'Checkers', 'Shoprite'], notes: ['Weekly groceries', 'Top-up shop'] },
  Entertainment: { color: '#4ECDC4', icon: 'film', weight: 12, min: 9900, max: 60000, merchants: ['Netflix', 'Showmax', 'Ster-Kinekor', 'Spotify'], notes: ['Monthly subscription', 'Movie night'] },
  Transportation: { color: '#45B7D1', icon: 'car', weight: 18, min: 5000, max: 120000, merchants: ['Uber', 'Engen', 'Shell', 'Bolt'], notes: ['Fuel', 'Ride'] },
  Dining: { color: '#F7DC6F', icon: 'utensils', weight: 16, min: 6000, max: 60000, merchants: ['Nando\u2019s', 'Wimpy', 'Steers', 'Vida e Caff\u00e8'], notes: ['Lunch', 'Dinner out'] },
  Shopping: { color: '#BB8FCE', icon: 'shopping-bag', weight: 12, min: 15000, max: 250000, merchants: ['Takealot', 'Mr Price', 'Edgars', 'Incredible Connection'], notes: ['Clothing', 'Online order'] },
  Utilities: { color: '#85C1E9', icon: 'zap', weight: 12, min: 30000, max: 250000, merchants: ['City Power', 'Telkom', 'Vodacom', 'Rain'], notes: ['Electricity', 'Data and airtime'] },
};

const METHODS = ['Credit Card', 'Debit Card', 'Debit Order', 'EFT'];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generate(): Transaction[] {
  const rand = mulberry32(20240916);
  const names = Object.keys(CATEGORY_META);
  const totalWeight = names.reduce((s, n) => s + CATEGORY_META[n].weight, 0);
  const pick = <T,>(items: T[]) => items[Math.floor(rand() * items.length)];

  const raw = Array.from({ length: 1248 }, () => {
    let roll = rand() * totalWeight;
    const category = names.find((n) => (roll -= CATEGORY_META[n].weight) < 0) ?? names[0];
    const meta = CATEGORY_META[category];
    const cents = meta.min + Math.floor(rand() * (meta.max - meta.min));
    return {
      date: new Date(GEN_END_MS - Math.floor(rand() * 730 * DAY)).toISOString(),
      merchant: pick(meta.merchants),
      category,
      amount: cents / 100,
      description: pick(meta.notes),
      paymentMethod: pick(METHODS),
      icon: meta.icon,
      categoryColor: meta.color,
    };
  });

  return raw
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((t, i) => ({ ...t, id: `txn_${200000 - i}` }));
}

export const transactions: Transaction[] = [...specTransactions, ...generate()];