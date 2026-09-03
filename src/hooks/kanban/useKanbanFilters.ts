import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TaskFilters } from '@/types/kanban';

const FILTER_KEYS = ['search', 'assigneeId', 'status', 'priority', 'dateFrom', 'dateTo', 'period'] as const;

export function useKanbanFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo((): TaskFilters => {
    const f: TaskFilters = {};
    for (const key of FILTER_KEYS) {
      const val = searchParams.get(key);
      if (val) (f as Record<string, string>)[key] = val;
    }
    return f;
  }, [searchParams]);

  const setFilter = useCallback((key: keyof TaskFilters, value: string | undefined) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setFilters = useCallback((updates: Partial<TaskFilters>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, val] of Object.entries(updates)) {
        if (val) next.set(key, String(val));
        else next.delete(key);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const clearFilters = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      FILTER_KEYS.forEach((k) => next.delete(k));
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const activeFilterCount = useMemo(
    () =>
      (filters.assigneeId ? 1 : 0) +
      (filters.status ? 1 : 0) +
      (filters.dateFrom || filters.dateTo ? 1 : 0) +
      (filters.priority ? 1 : 0),
    [filters]
  );

  const applyPeriod = useCallback(
    (bucket: string) => {
      if (!bucket) {
        setFilters({ period: undefined, dateFrom: undefined, dateTo: undefined });
        return;
      }
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const today = new Date();
      let from = today;
      if (bucket === '7d') from = new Date(today.getTime() - 6 * 86400000);
      else if (bucket === '30d') from = new Date(today.getTime() - 29 * 86400000);
      else if (bucket === 'month') from = new Date(today.getFullYear(), today.getMonth(), 1);
      setFilters({ period: bucket, dateFrom: fmt(from), dateTo: fmt(today) });
    },
    [setFilters]
  );

  return { filters, setFilter, setFilters, clearFilters, activeFilterCount, applyPeriod };
}