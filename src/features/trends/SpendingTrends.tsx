import { useTrends } from '../../api/queries';
import { Section } from '../../components/Section';
import { formatMonth, formatZar } from '../../lib/format';

export function SpendingTrends() {
  const query = useTrends(12);
  const view = query.data ? query.data.trends : undefined;
  return (
    <Section id="trends" title="Monthly trend" query={{ ...query, data: view }} isEmpty={(t) => t.length === 0}>
      {(trends) => {
        const max = Math.max(...trends.map((t) => t.totalSpent), 1);
        return (
          <>
            <ol className="bars" aria-hidden="true">
              {trends.map((t) => (
                <li key={t.month} title={`${formatMonth(t.month)}: ${formatZar(t.totalSpent)}`}>
                  <div className="bar" style={{ height: `${(t.totalSpent / max) * 85}%` }} />
                  <span>{formatMonth(t.month)}</span>
                </li>
              ))}
            </ol>
            <table className="sr-only">
              <caption>Total spent per month</caption>
              <thead><tr><th>Month</th><th>Total spent</th><th>Transactions</th></tr></thead>
              <tbody>
                {trends.map((t) => (
                  <tr key={t.month}><td>{formatMonth(t.month)}</td><td>{formatZar(t.totalSpent)}</td><td>{t.transactionCount}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        );
      }}
    </Section>
  );
}
