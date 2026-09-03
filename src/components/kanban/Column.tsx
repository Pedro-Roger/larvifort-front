import { useRef, useState } from 'react';
import { Plus, MoreVertical, Trash2, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { TaskCard } from './TaskCard';
import type { BoardColumn, Task } from '@/types/kanban';
import { formatCurrency } from '@/lib/format';
import { calculateLexoRank } from '@/utils/lexorank';

interface ColumnProps {
  column: BoardColumn & { items: Task[]; totalItems: number };
  onTaskMove: (taskId: string, toColumnId: string, position: string) => Promise<void>;
  onAddTask: (columnId: string) => void;
  onEditColumn: (column: BoardColumn) => void;
  onDeleteColumn: (columnId: string) => void;
  hasActiveFilters: boolean;
  onEditTask: (task: Task) => void;
}

export function Column({
  column,
  onTaskMove,
  onAddTask,
  onEditColumn,
  onDeleteColumn,
  hasActiveFilters,
  onEditTask,
}: ColumnProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const isDraggingRef = useRef(false);
  const suppressClickRef = useRef(0);

  const stageSum = column.items.reduce(
    (t, item) => t + (item.value || item.servicesInfo?.totalValue || 0),
    0
  );

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.boardColumnId === column.id) {
      setDraggedTask(null);
      return;
    }
    const tasksInColumn = column.items;
    const newPosition = calculateLexoRank(tasksInColumn, e.clientY);
    await onTaskMove(draggedTask.id, column.id, newPosition);
    setDraggedTask(null);
    isDraggingRef.current = false;
    suppressClickRef.current = Date.now() + 200;
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
    suppressClickRef.current = Date.now() + 200;
  };

  return (
    <div className="flex-shrink-0" style={{ flex: '0 0 320px' }}>
      <div className="bg-[hsl(210,40%,98%)] dark:bg-[hsl(217,33%,17%)] border border-[hsl(214,32%,90%)] dark:border-[hsl(217,33%,25%)] rounded-lg h-full flex flex-col overflow-hidden">
        {/* Column Header */}
        <div className="flex-shrink-0 px-3 py-2.5 border-b border-[hsl(214,32%,90%)] dark:border-[hsl(217,33%,25%)]">
          <div className="h-1 rounded-full mb-2.5" style={{ backgroundColor: column.color }} />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-sm font-semibold text-[hsl(222,47%,11%)] dark:text-[hsl(214,40%,96%)] truncate">
                {column.name}
              </h3>
              <span className="inline-flex items-center justify-center bg-[hsl(214,32%,90%)] dark:bg-[hsl(217,33%,25%)] text-[hsl(215,16%,47%)] dark:text-[hsl(215,20%,55%)] rounded-full px-2 py-0.5 text-xs font-medium shrink-0">
                {hasActiveFilters ? `${column.items.length}/${column.totalItems}` : column.totalItems}
              </span>
              {stageSum > 0 && (
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                  R$ {formatCurrency(stageSum)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-[hsl(215,16%,47%)] hover:text-[hsl(222,47%,11%)] hover:bg-[hsl(214,32%,95%)]"
                onClick={() => onAddTask(column.id)}
                aria-label="Adicionar card"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-[hsl(215,16%,47%)] hover:text-[hsl(222,47%,11%)] hover:bg-[hsl(214,32%,95%)]"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => onEditColumn(column)}>
                    <Edit className="h-4 w-4 mr-2" /> Editar etapa
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-[hsl(0,84%,60%)]" onClick={() => onDeleteColumn(column.id)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Excluir etapa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Task Cards */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5" onDragOver={handleDragOver} onDrop={handleDrop}>
          {column.items.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={() => {
                setDraggedTask(task);
                isDraggingRef.current = true;
                suppressClickRef.current = Date.now() + 200;
              }}
              onDragEnd={handleDragEnd}
              onClick={() => {
                if (isDraggingRef.current || Date.now() <= suppressClickRef.current) return;
                onEditTask(task);
              }}
              onEditTask={onEditTask}
              onMoveTask={() => {}}
              onRemoveTask={() => {}}
              columns={[]}
            />
          ))}

          {column.items.length === 0 && (
            <div className="text-center py-8 text-xs text-[hsl(215,16%,47%)] dark:text-[hsl(215,20%,55%)]">
              {hasActiveFilters ? 'Nenhum card com os filtros atuais' : 'Nenhum card nesta etapa'}
            </div>
          )}

          <button
            type="button"
            onClick={() => onAddTask(column.id)}
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg text-xs font-medium text-[hsl(215,16%,47%)] dark:text-[hsl(215,20%,55%)] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-600/10 transition-colors border border-dashed border-[hsl(214,32%,90%)] dark:border-[hsl(217,33%,25%)] hover:border-blue-400 dark:hover:border-blue-500"
          >
            <Plus className="w-4 h-4" /> Adicionar card
          </button>
        </div>
      </div>
    </div>
  );
}
