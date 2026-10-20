import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { DashboardPage } from './DashboardPage';
import { ErrorBoundary } from './ErrorBoundary';

export function App({ queryClient }: { queryClient?: QueryClient }) {
  const [client] = useState(
    () =>
      queryClient ??
      new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false } } }),
  );
  return (
    <ErrorBoundary>
      <QueryClientProvider client={client}>
        <DashboardPage />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
