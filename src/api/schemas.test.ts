import { goalsSchema, summarySchema } from './schemas';

describe('schemas', () => {
  const summary = {
    period: '30d', totalSpent: 4250.75, transactionCount: 47, averageTransaction: 90.44,
    topCategory: 'Groceries', comparedToPrevious: { spentChange: 12.5, transactionChange: -3.2 },
  };
  it('accepts the documented summary payload', () => {
    expect(summarySchema.safeParse(summary).success).toBe(true);
  });
  it('rejects a malformed amount', () => {
    expect(summarySchema.safeParse({ ...summary, totalSpent: '4250.75' }).success).toBe(false);
  });
  it('accepts goal statuses the spec does not list', () => {
    const goal = { id: 'g', category: 'Dining', monthlyBudget: 1, currentSpent: 2, percentageUsed: 200, daysRemaining: 1, status: 'exceeded' };
    expect(goalsSchema.safeParse({ goals: [goal] }).success).toBe(true);
  });
});
