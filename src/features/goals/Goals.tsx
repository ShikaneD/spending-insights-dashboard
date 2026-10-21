import { useFilterOptions, useGoals } from '../../api/queries';
import { CategoryIcon } from '../../components/CategoryIcon';
import { Section } from '../../components/Section';
import { formatZar } from '../../lib/format';
import { statusMeta } from '../../lib/maps';

export function Goals() {
  const query = useGoals();
  const options = useFilterOptions();
  // Goals carry no icon, so look it up by category name from the filters endpoint.
  const categoryMeta = (name: string) => options.data?.categories.find((c) => c.name === name);

  return (
    <Section
      id="goals"
      title="Budget goals"
      query={{ ...query, data: query.data?.goals }}
      isEmpty={(g) => g.length === 0}
    >
      {(goals) => (
        <ul className="list">
          {goals.map((g) => {
            const status = statusMeta(g.status);
            const meta = categoryMeta(g.category);
            return (
              <li key={g.id}>
                <div className="row">
                  <CategoryIcon name={meta?.icon ?? ''} color={meta?.color ?? 'currentColor'} />
                  <strong className="grow">{g.category}</strong>
                  <span className={`badge ${status.tone}`}>{status.label}</span>
                </div>
                <progress value={Math.min(g.percentageUsed, 100)} max={100} aria-label={`${g.category} budget used`} />
                <p className="muted">
                  {formatZar(g.currentSpent)} of {formatZar(g.monthlyBudget)} ({Math.round(g.percentageUsed)}%) &middot; {g.daysRemaining} days left
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}