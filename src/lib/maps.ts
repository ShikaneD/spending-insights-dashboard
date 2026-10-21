import {
  Car, Tag, Film, ShoppingBag, ShoppingCart, Utensils, Zap, type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  'shopping-cart': ShoppingCart,
  film: Film,
  car: Car,
  utensils: Utensils,
  'shopping-bag': ShoppingBag,
  zap: Zap,
};

/** Unknown icon names from the API fall back to a generic icon. */
export const getIcon = (name: string): LucideIcon => ICONS[name] ?? Tag;

export type Tone = 'ok' | 'warn' | 'bad' | 'neutral';

const STATUSES: Record<string, { label: string; tone: Tone }> = {
  on_track: { label: 'On track', tone: 'ok' },
  warning: { label: 'Near limit', tone: 'warn' },
  exceeded: { label: 'Over budget', tone: 'bad' },
};

/** Unknown statuses render a neutral, humanised label instead of crashing. */
export function statusMeta(status: string): { label: string; tone: Tone } {
  const known = STATUSES[status];
  if (known) return known;
  const text = status.replace(/_/g, ' ').trim();
  return { label: text ? text[0].toUpperCase() + text.slice(1) : 'Unknown', tone: 'neutral' };
}
