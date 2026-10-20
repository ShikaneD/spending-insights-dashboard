import { useState } from 'react';
import { useFilterOptions, type Filters } from '../../api/queries';
import { DEFAULT_PRESETS, type Period } from '../../lib/constants';

interface Props {
  filters: Filters;
  onChange: (next: Filters) => void;
}

export function PeriodSelector({ filters, onChange }: Props) {
  const { data } = useFilterOptions();
  const presets = data?.dateRangePresets ?? DEFAULT_PRESETS;
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const invalid = Boolean(start && end && end < start);

  const update = (s: string, e: string) => {
    setStart(s);
    setEnd(e);
    if (s && e && e >= s) onChange({ period: filters.period, startDate: s, endDate: e });
    if (!s && !e) onChange({ period: filters.period });
  };
  const choosePreset = (value: string) => {
    setStart('');
    setEnd('');
    onChange({ period: value as Period });
  };

  return (
    <div className="card filters" role="group" aria-label="Date range">
      {presets.map((p) => (
        <button
          key={p.value}
          type="button"
          aria-pressed={!filters.startDate && filters.period === p.value}
          onClick={() => choosePreset(p.value)}
        >
          {p.label}
        </button>
      ))}
      <label>
        From
        <input type="date" value={start} max={end || undefined} onChange={(e) => update(e.target.value, end)} />
      </label>
      <label>
        To
        <input type="date" value={end} min={start || undefined} onChange={(e) => update(start, e.target.value)} />
      </label>
      {invalid && <p role="alert" className="error">The end date can&apos;t be before the start date.</p>}
    </div>
  );
}
