import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { useSummary, type Filters } from '../../api/queries';
import { Section } from '../../components/Section';
import { formatPercentChange, formatZar } from '../../lib/format';

function Kpi({ label, value, change }: { label: string; value: string; change?: number }) {
  const Arrow = change === undefined || change === 0 ? Minus : change > 0 ? ArrowUp : ArrowDown;
  return (
    <div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {change !== undefined && (
        <div className="muted">
          <Arrow aria-hidden="true" size={14} /> {formatPercentChange(change)} vs previous period
        </div>
      )}
    </div>
  );
}

export function SummaryCards({ filters }: { filters: Filters }) {
  const query = useSummary(filters);
  return (
    <Section id="summary" title="Overview" query={query}>
      {(d) => (
        <div className="kpis">
          <Kpi label="Total spent" value={formatZar(d.totalSpent)} change={d.comparedToPrevious.spentChange} />
          <Kpi label="Transactions" value={String(d.transactionCount)} change={d.comparedToPrevious.transactionChange} />
          <Kpi label="Average transaction" value={formatZar(d.averageTransaction)} />
          <Kpi label="Top category" value={d.topCategory} />
        </div>
      )}
    </Section>
  );
}
