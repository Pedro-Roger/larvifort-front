import {
  MoreVertical,
  Phone,
  GripVertical,
  ArrowLeftRight,
  Edit,
  Trash2,
  Copy,
  User,
  Clock,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Task, BoardColumn } from '@/types/kanban';
import { getContactColor } from '@/lib/utils';

const PRIORITY_BADGE: Record<string, string> = {
  alta: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  media: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  baixa: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
};

interface TaskCardProps {
  task: Task;
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick: () => void;
  onEditTask: (task: Task) => void;
  onMoveTask: (task: Task, columnId: string) => void;
  onRemoveTask: (task: Task) => void;
  columns: BoardColumn[];
}

export function TaskCard({
  task,
  onDragStart,
  onDragEnd,
  onClick,
  onEditTask,
  onMoveTask,
  onRemoveTask,
  columns,
}: TaskCardProps) {
  const pBucket = task.priority;
  const moveTargets = columns.filter((c) => c.id !== task.boardColumnId);

  return (
    <div
      className="group relative bg-white dark:bg-[hsl(217,33%,17%)] rounded-lg p-3 border border-[hsl(214,32%,90%)] dark:border-[hsl(217,33%,25%)] hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all duration-150 cursor-pointer select-none"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
    >
      {/* Actions */}
      <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        {moveTargets.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-[hsl(215,16%,47%)] hover:text-[hsl(222,47%,11%)] hover:bg-[hsl(214,32%,95%)]" aria-label="Mover card">
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(215,16%,47%)]">Mover para</div>
              {moveTargets.map((target) => (
                <DropdownMenuItem key={target.id} onClick={() => onMoveTask(task, target.id)}>
                  <span className="w-2 h-2 rounded-full mr-2 shrink-0" style={{ backgroundColor: target.color }} />
                  {target.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-[hsl(215,16%,47%)] hover:text-[hsl(222,47%,11%)] hover:bg-[hsl(214,32%,95%)]">
              <MoreVertical className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={() => onEditTask(task)}>
              <Edit className="h-3.5 w-3.5 mr-2" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(task.id)}>
              <Copy className="h-3.5 w-3.5 mr-2" /> Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-[hsl(0,84%,60%)]" onClick={() => onRemoveTask(task)}>
              <Trash2 className="h-3.5 w-3.5 mr-2" /> Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <GripVertical className="w-3.5 h-3.5 text-[hsl(215,16%,47%)] cursor-grab active:cursor-grabbing" />
      </div>

      {/* Client Info */}
      <div className="flex items-start gap-2.5 mb-2 pr-12">
        <div
          className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-white text-[11px] font-semibold ring-2 ring-white dark:ring-[hsl(217,33%,17%)]"
          style={{ backgroundColor: getContactColor(task.client?.name) }}
        >
          {task.client?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium text-[hsl(222,47%,11%)] dark:text-[hsl(214,40%,96%)] truncate leading-tight">
            {task.client?.name || task.title || 'Sem título'}
          </h4>
          {task.client?.phone && (
            <div className="flex items-center gap-1 text-[11px] text-[hsl(215,16%,47%)] dark:text-[hsl(215,20%,55%)] mt-0.5">
              <Phone className="w-3 h-3 shrink-0" />
              <span className="truncate">{task.client.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <div className="mb-2 px-2.5 py-2 bg-[hsl(210,40%,98%)] dark:bg-[hsl(222,47%,11%)] rounded-md">
          <p className="text-[11px] text-[hsl(215,16%,47%)] dark:text-[hsl(215,20%,55%)] line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        </div>
      )}

      {/* Value */}
      {task.servicesInfo?.hasServices && task.servicesInfo.totalValue > 0 && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[hsl(215,16%,47%)] uppercase font-medium">Valor</span>
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">{task.servicesInfo.formattedTotal}</span>
        </div>
      )}

      {/* Tags */}
      <div className="flex items-center gap-1 flex-wrap mb-2">
        {pBucket && (
          <Badge className={`h-5 px-1.5 text-[10px] font-medium border ${PRIORITY_BADGE[pBucket]}`}>
            {pBucket.charAt(0).toUpperCase() + pBucket.slice(1)}
          </Badge>
        )}
        {task.tags?.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[11px] text-[hsl(215,16%,47%)] dark:text-[hsl(215,20%,55%)] pt-1.5 border-t border-[hsl(214,32%,95%)] dark:border-[hsl(217,33%,20%)]">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {task.dueDate
            ? new Date(task.dueDate).toLocaleDateString('pt-BR')
            : new Date(task.createdAt).toLocaleDateString('pt-BR')}
        </span>
        {task.assignee && (
          <span className="flex items-center gap-1 min-w-0">
            <User className="w-3 h-3 shrink-0" />
            <span className="truncate max-w-20">{task.assignee.name}</span>
          </span>
        )}
      </div>
    </div>
  );
}
