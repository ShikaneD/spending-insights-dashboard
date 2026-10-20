import { useProfile } from '../api/queries';
import { formatZar } from '../lib/format';

export function Header() {
  const { data } = useProfile();
  return (
    <header className="app-header">
      <h1>Spending insights</h1>
      {data && (
        <p className="muted">
          {data.name} &middot; {data.accountType} account &middot; {formatZar(data.totalSpent, data.currency)} spent in total
        </p>
      )}
    </header>
  );
}
