// Display-only formatting. Money is never added or multiplied in the UI.
export function formatZar(amount: number, currency = 'ZAR'): string {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency }).format(amount);
}

export function formatPercentChange(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${Math.abs(value).toFixed(1)}%`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', { dateStyle: 'medium', timeZone: 'UTC' });
}

export function formatMonth(key: string): string {
  return new Date(`${key}-01T00:00:00Z`).toLocaleDateString('en-ZA', {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  });
}
