import { formatMonth, formatPercentChange, formatZar } from './format';

describe('format', () => {
  it('formats ZAR with en-ZA grouping and decimal comma', () => {
    expect(formatZar(1250.3)).toMatch(/R\s?1\s250,30/);
  });
  it('signs percentage changes', () => {
    expect(formatPercentChange(12.5)).toBe('+12.5%');
    expect(formatPercentChange(-3.2)).toBe('-3.2%');
    expect(formatPercentChange(0)).toBe('0.0%');
  });
  it('formats month keys in UTC', () => {
    expect(formatMonth('2024-06')).toMatch(/Jun/);
  });
});
