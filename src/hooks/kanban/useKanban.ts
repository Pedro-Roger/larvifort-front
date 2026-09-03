import { useState, useEffect, useCallback } from 'react';
import { boardsService, columnsService, tasksService } from '@/services/kanban';
import type { Board, BoardColumn, Task } from '@/types/kanban';

interface KanbanState {
  board: Board | null;
  columns: BoardColumn[];
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

export function useKanban(boardId: string | null) {
  const [state, setState] = useState<KanbanState>({
    board: null,
    columns: [],
    tasks: [],
    loading: false,
    error: null,
  });

  const loadBoard = useCallback(async () => {
    if (!boardId) {
      setState({ board: null, columns: [], tasks: [], loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [board, columns, tasks] = await Promise.all([
        boardsService.get(boardId),
        columnsService.list(boardId),
        tasksService.listByBoard(boardId, {}),
      ]);

      setState({
        board,
        columns: columns.sort((a: BoardColumn, b: BoardColumn) => a.position - b.position),
        tasks,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Erro ao carregar board',
      }));
    }
  }, [boardId]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  const addTask = useCallback(async (task: Task) => {
    setState((prev) => ({ ...prev, tasks: [...prev.tasks, task] }));
  }, []);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    }));
  }, []);

  const removeTask = useCallback(async (taskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  }, []);

  const moveTask = useCallback(async (taskId: string, newColumnId: string, newPosition: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, boardColumnId: newColumnId, position: newPosition } : t
      ),
    }));
  }, []);

  return {
    ...state,
    refresh: loadBoard,
    addTask,
    updateTask,
    removeTask,
    moveTask,
  };
}