import { useState } from 'react';
import type { Filters } from '../api/queries';
import { Header } from '../components/Header';
import { CategoryBreakdown } from '../features/categories/CategoryBreakdown';
import { PeriodSelector } from '../features/filters/PeriodSelector';
import { Goals } from '../features/goals/Goals';
import { SummaryCards } from '../features/summary/SummaryCards';
import { Transactions } from '../features/transactions/Transactions';
import { SpendingTrends } from '../features/trends/SpendingTrends';

export function DashboardPage() {
  const [filters, setFilters] = useState<Filters>({ period: '30d' });
  return (
    <div className="app">
      <Header />
      <main className="grid">
        <PeriodSelector filters={filters} onChange={setFilters} />
        <SummaryCards filters={filters} />
        <div className="grid two">
          <CategoryBreakdown filters={filters} />
          <SpendingTrends />
        </div>
        <Goals />
        <Transactions filters={filters} />
      </main>
    </div>
  );
}
