import { useMemo } from 'react';
import { Column } from './Column';
import { AddColumn } from './AddColumn';
import type { BoardColumn, Task } from '@/types/kanban';
import { useKanbanFilters } from '@/hooks/kanban/useKanbanFilters';

interface BoardContainerProps {
  columns: BoardColumn[];
  tasks: Task[];
  onTaskMove: (taskId: string, toColumnId: string, position: string) => Promise<void>;
  onAddTask: (columnId: string) => void;
  onEditColumn: (column: BoardColumn) => void;
  onDeleteColumn: (columnId: string) => void;
  onEditTask?: (task: Task) => void;
}

export function BoardContainer({
  columns,
  tasks,
  onTaskMove,
  onAddTask,
  onEditColumn,
  onDeleteColumn,
  onEditTask,
}: BoardContainerProps) {
  const { filters } = useKanbanFilters();

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(search) ||
          t.client?.name?.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search)
      );
    }
    if (filters.assigneeId) {
      result = result.filter((t) => t.assigneeId === filters.assigneeId);
    }
    if (filters.priority) {
      result = result.filter((t) => t.priority === filters.priority);
    }
    return result;
  }, [tasks, filters]);

  const filteredItemsByStage = useMemo(() => {
    const map = new Map<string, Task[]>();
    filteredTasks.forEach((task) => {
      const colId = task.boardColumnId;
      if (colId) {
        const existing = map.get(colId) || [];
        existing.push(task);
        map.set(colId, existing);
      }
    });
    return map;
  }, [filteredTasks]);

  const hasActiveFilters = Boolean(
    filters.search || filters.assigneeId || filters.priority || filters.dateFrom || filters.dateTo
  );

  const columnsWithData = useMemo(
    () =>
      columns.map((col) => ({
        ...col,
        items: filteredItemsByStage.get(col.id) || [],
        totalItems: col.tasks?.length || 0,
      })),
    [columns, filteredItemsByStage]
  );

  return (
    <div className="flex w-full h-full min-w-0 overflow-hidden bg-[hsl(210,40%,98%)] dark:bg-[hsl(222,47%,11%)]">
      <div className="flex-1 h-full overflow-x-auto overflow-y-hidden px-4 py-4">
        <div className="flex gap-4 h-full pb-4" style={{ width: 'fit-content', minWidth: '100%' }}>
          {columnsWithData.map((column) => (
            <Column
              key={column.id}
              column={column}
              onTaskMove={onTaskMove}
              onAddTask={onAddTask}
              onEditColumn={onEditColumn}
              onDeleteColumn={onDeleteColumn}
              hasActiveFilters={hasActiveFilters}
              onEditTask={onEditTask || (() => {})}
            />
          ))}

          <AddColumn onClick={() => onAddTask('new-column')} />

          {columns.length === 0 && (
            <div className="flex items-center justify-center w-full h-full text-[hsl(215,16%,47%)] dark:text-[hsl(215,20%,55%)]">
              <p className="text-sm">Nenhuma etapa. Clique em "Adicionar etapa" para começar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
