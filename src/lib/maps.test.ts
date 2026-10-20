import { getIcon, statusMeta } from './maps';

describe('maps', () => {
  it('maps known statuses', () => {
    expect(statusMeta('on_track')).toEqual({ label: 'On track', tone: 'ok' });
    expect(statusMeta('warning').tone).toBe('warn');
  });
  it('falls back for unknown statuses instead of throwing', () => {
    expect(statusMeta('paused_by_bank')).toEqual({ label: 'Paused by bank', tone: 'neutral' });
    expect(statusMeta('').label).toBe('Unknown');
  });
  it('falls back to a generic icon', () => {
    expect(getIcon('does-not-exist')).toBeDefined();
  });
});
