import { z } from 'zod';

export const profileSchema = z.object({
  customerId: z.string(),
  name: z.string(),
  email: z.string(),
  joinDate: z.string(),
  accountType: z.string(),
  totalSpent: z.number(),
  currency: z.string(),
});

export const summarySchema = z.object({
  period: z.string(),
  totalSpent: z.number(),
  transactionCount: z.number(),
  averageTransaction: z.number(),
  topCategory: z.string(),
  comparedToPrevious: z.object({ spentChange: z.number(), transactionChange: z.number() }),
});

export const categorySchema = z.object({
  name: z.string(),
  amount: z.number(),
  percentage: z.number(),
  transactionCount: z.number(),
  color: z.string(),
  icon: z.string(),
});

export const categoriesSchema = z.object({
  dateRange: z.object({ startDate: z.string(), endDate: z.string() }),
  totalAmount: z.number(),
  categories: z.array(categorySchema),
});

export const trendsSchema = z.object({
  trends: z.array(
    z.object({
      month: z.string(),
      totalSpent: z.number(),
      transactionCount: z.number(),
      averageTransaction: z.number(),
    }),
  ),
});

export const transactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  merchant: z.string(),
  category: z.string(),
  amount: z.number(),
  description: z.string(),
  paymentMethod: z.string(),
  icon: z.string(),
  categoryColor: z.string(),
});

export const transactionsSchema = z.object({
  transactions: z.array(transactionSchema),
  pagination: z.object({
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
  }),
});

export const goalsSchema = z.object({
  goals: z.array(
    z.object({
      id: z.string(),
      category: z.string(),
      monthlyBudget: z.number(),
      currentSpent: z.number(),
      percentageUsed: z.number(),
      daysRemaining: z.number(),
      status: z.string(), // open string: unknown statuses are handled in lib/maps
    }),
  ),
});

export const filtersSchema = z.object({
  categories: z.array(z.object({ name: z.string(), color: z.string(), icon: z.string() })),
  dateRangePresets: z.array(z.object({ label: z.string(), value: z.string() })),
});

export type Transaction = z.infer<typeof transactionSchema>;
