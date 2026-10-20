import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { CUSTOMER_ID, type Period } from '../lib/constants';
import { getJson } from './client';
import {
  categoriesSchema, filtersSchema, goalsSchema, profileSchema, summarySchema,
  transactionsSchema, trendsSchema,
} from './schemas';

export type SortBy = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
export interface Filters {
  period: Period;
  startDate?: string;
  endDate?: string;
}

const base = `/api/customers/${CUSTOMER_ID}`;
// A custom range overrides the preset (assumption: spec leaves precedence undefined).
const rangeParams = (f: Filters) =>
  f.startDate && f.endDate ? { startDate: f.startDate, endDate: f.endDate } : { period: f.period };

export const useProfile = () =>
  useQuery({ queryKey: ['profile'], queryFn: ({ signal }) => getJson(`${base}/profile`, profileSchema, {}, signal) });

export const useFilterOptions = () =>
  useQuery({ queryKey: ['filters'], staleTime: Infinity, queryFn: ({ signal }) => getJson(`${base}/filters`, filtersSchema, {}, signal) });

export const useSummary = (f: Filters) =>
  useQuery({
    queryKey: ['summary', rangeParams(f)],
    queryFn: ({ signal }) => getJson(`${base}/spending/summary`, summarySchema, rangeParams(f), signal),
  });

export const useCategories = (f: Filters) =>
  useQuery({
    queryKey: ['categories', rangeParams(f)],
    queryFn: ({ signal }) => getJson(`${base}/spending/categories`, categoriesSchema, rangeParams(f), signal),
  });

export const useTrends = (months = 12) =>
  useQuery({
    queryKey: ['trends', months],
    queryFn: ({ signal }) => getJson(`${base}/spending/trends`, trendsSchema, { months }, signal),
  });

export const useGoals = () =>
  useQuery({ queryKey: ['goals'], queryFn: ({ signal }) => getJson(`${base}/goals`, goalsSchema, {}, signal) });

export const useTransactions = (f: Filters, category: string, sortBy: SortBy) =>
  useInfiniteQuery({
    queryKey: ['transactions', f.startDate, f.endDate, category, sortBy],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      getJson(
        `${base}/transactions`,
        transactionsSchema,
        { limit: 20, offset: pageParam, category, sortBy, startDate: f.startDate, endDate: f.endDate },
        signal,
      ),
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.offset + last.pagination.limit : undefined,
  });
