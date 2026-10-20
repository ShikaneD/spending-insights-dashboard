import { useState } from 'react';
import { useFilterOptions, useTransactions, type Filters, type SortBy } from '../../api/queries';
import { CategoryIcon } from '../../components/CategoryIcon';
import { Section } from '../../components/Section';
import { formatDate, formatZar } from '../../lib/format';

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'date_desc', label: 'Newest first' },
  { value: 'date_asc', label: 'Oldest first' },
  { value: 'amount_desc', label: 'Highest amount' },
  { value: 'amount_asc', label: 'Lowest amount' },
];

// Assumption: the transactions endpoint has no `period` param, so presets do not filter this table;
// only a custom date range does. Documented in the README.
export function Transactions({ filters }: { filters: Filters }) {
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date_desc');
  const q = useTransactions(filters, category, sortBy);
  const options = useFilterOptions();
  const rows = q.data?.pages.flatMap((p) => p.transactions);
  const total = q.data?.pages.at(-1)?.pagination.total ?? 0;

  const controls = (
    <div className="filters">
      <label>
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {options.data?.categories.map((c) => <option key={c.name}>{c.name}</option>)}
        </select>
      </label>
      <label>
        Sort by
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
    </div>
  );

  return (
    <Section
      id="transactions"
      title="Transactions"
      actions={controls}
      query={{ data: rows, isPending: q.isPending, isError: q.isError, refetch: q.refetch }}
      isEmpty={(r) => r.length === 0}
    >
      {(items) => (
        <>
          <div className="table-wrap" tabIndex={0} role="region" aria-label="Transactions table">
            <table>
              <caption className="sr-only">Transactions</caption>
              <thead>
                <tr><th>Date</th><th>Merchant</th><th>Category</th><th>Method</th><th className="num">Amount</th></tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.id}>
                    <td>{formatDate(t.date)}</td>
                    <td>{t.merchant}<div className="muted">{t.description}</div></td>
                    <td><span className="row"><CategoryIcon name={t.icon} color={t.categoryColor} />{t.category}</span></td>
                    <td>{t.paymentMethod}</td>
                    <td className="num">{formatZar(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted" aria-live="polite">Showing {items.length} of {total}</p>
          {q.hasNextPage && (
            <button type="button" onClick={() => q.fetchNextPage()} disabled={q.isFetchingNextPage}>
              {q.isFetchingNextPage ? 'Loading...' : 'Load more'}
            </button>
          )}
        </>
      )}
    </Section>
  );
}
