import { useCategories, type Filters } from '../../api/queries';
import { CategoryIcon } from '../../components/CategoryIcon';
import { Section } from '../../components/Section';
import { formatZar } from '../../lib/format';

export function CategoryBreakdown({ filters }: { filters: Filters }) {
  const query = useCategories(filters);
  return (
    <Section id="categories" title="Spending by category" query={query} isEmpty={(d) => d.categories.length === 0}>
      {(d) => {
        const sorted = [...d.categories].sort((a, b) => b.amount - a.amount);
        const sum = sorted.reduce((s, c) => s + c.percentage, 0) || 1;
        let acc = 0;
        const stops = sorted.map((c) => {
          const from = acc;
          acc += (c.percentage / sum) * 100;
          return `${c.color} ${from}% ${acc}%`;
        });
        return (
          <div className="donut-wrap">
            <div
              className="donut"
              role="img"
              aria-label="Donut chart of spending by category. The list beside it has the exact values."
              style={{ background: `conic-gradient(${stops.join(',')})` }}
            />
            <ul className="list">
              {sorted.map((c) => (
                <li key={c.name} className="row">
                  <CategoryIcon name={c.icon} color={c.color} />
                  <span className="grow">
                    {c.name} <span className="muted">({c.transactionCount})</span>
                  </span>
                  <span className="num">{formatZar(c.amount)}</span>
                  <span className="muted num">{c.percentage}%</span>
                </li>
              ))}
            </ul>
          </div>
        );
      }}
    </Section>
  );
}
