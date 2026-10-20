import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { App } from './App';

const renderApp = () =>
  render(<App queryClient={new QueryClient({ defaultOptions: { queries: { retry: false } } })} />);

describe('Dashboard', () => {
  it('renders every section from the mocked API', async () => {
    renderApp();
    expect(await screen.findByText(/John Doe/)).toBeInTheDocument();
    const overview = await screen.findByRole('region', { name: 'Overview' });
    expect(await within(overview).findByText('Total spent')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Spending by category' })).toBeInTheDocument();
    expect(await screen.findByText('Budget goals')).toBeInTheDocument();
  });

  it('paginates transactions with "Load more"', async () => {
    renderApp();
    const table = await screen.findByRole('region', { name: 'Transactions table' });
    await waitFor(() => expect(within(table).getAllByRole('row')).toHaveLength(21)); // header + 20
    await userEvent.click(screen.getByRole('button', { name: 'Load more' }));
    await waitFor(() => expect(within(table).getAllByRole('row')).toHaveLength(41));
  });

  it('shows an error with retry in one section without breaking the rest', async () => {
    server.use(http.get('/api/customers/:id/goals', () => HttpResponse.json({}, { status: 500 })));
    renderApp();
    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn.t load budget goals/i);
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(await screen.findByText(/John Doe/)).toBeInTheDocument();
  });

  it('refuses an end date before the start date', async () => {
    renderApp();
    await screen.findByText(/John Doe/);
    await userEvent.type(screen.getByLabelText('From'), '2024-09-10');
    await userEvent.type(screen.getByLabelText('To'), '2024-09-01');
    expect(await screen.findByRole('alert')).toHaveTextContent(/end date/i);
  });
});
