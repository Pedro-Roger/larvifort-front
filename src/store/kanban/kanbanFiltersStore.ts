import { create } from 'zustand';
import type { TaskFilters } from '@/types/kanban';

interface FiltersState {
  filters: TaskFilters;
  setFilters: (f: Partial<TaskFilters>) => void;
  clearFilters: () => void;
}

export const useKanbanFiltersStore = create<FiltersState>((set) => ({
  filters: {},
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
  })),
  clearFilters: () => set({ filters: {} }),
}));