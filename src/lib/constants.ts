export const CUSTOMER_ID = '12345';
export const PERIODS = ['7d', '30d', '90d', '1y'] as const;
export type Period = (typeof PERIODS)[number];
export const DEFAULT_PRESETS = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Last year', value: '1y' },
];
