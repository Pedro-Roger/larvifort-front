import { useState } from 'react';
import { CheckCircle2, Circle, Edit, Trash2, Plus, GripVertical, User as UserIcon, Calendar, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Task, User } from '@/types/kanban';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SubtaskItemProps {
  task: Task;
  allSubtasks: Task[];
  assignees: User[];
  depth: number;
  onUpdate: (id: string, data: { title?: string; status?: Task['status'] }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddChild: (parentId: string, data: { title: string }) => Promise<void>;
}

export function SubtaskItem({ task, allSubtasks, assignees, depth, onUpdate, onDelete, onAddChild }: SubtaskItemProps) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const children = allSubtasks.filter(s => s.parentTaskId === task.id);

  const handleToggle = async () => {
    const newStatus: Task['status'] = task.status === 'completed' ? 'pending' : 'completed';
    await onUpdate(task.id, { status: newStatus });
  };

  const handleSaveEdit = async () => {
    if (editTitle.trim() && editTitle.trim() !== task.title) {
      await onUpdate(task.id, { title: editTitle.trim() });
    }
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditing(false);
  };

  const assignee = task.assignee || assignees.find(a => a.id === task.assigneeId);

  return (
    <div className={cn(depth > 0 && 'ml-6 border-l-2 border-border pl-4')}>
      <div className="flex items-center gap-2 py-1.5 min-h-[40px] group">
        <button onClick={handleToggle} className="flex-shrink-0 p-0.5 cursor-pointer">
          {task.status === 'completed'
            ? <CheckCircle2 className="w-4 h-4 text-green-500" />
            : <Circle className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          }
        </button>
        <GripVertical className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground cursor-grab active:cursor-grabbing flex-shrink-0 transition-colors" />

        {editing ? (
          <form onSubmit={e => { e.preventDefault(); handleSaveEdit(); }} className="flex-1 flex gap-2">
            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="h-8 flex-1" autoFocus onKeyDown={e => e.key === 'Escape' && handleCancelEdit()} />
            <Button type="submit" size="sm" className="h-8">Salvar</Button>
            <Button type="button" variant="ghost" size="sm" className="h-8" onClick={handleCancelEdit}>Cancelar</Button>
          </form>
        ) : (
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <span className={cn('text-sm truncate', task.status === 'completed' && 'line-through text-muted-foreground')}>
              {task.title || 'Sem título'}
            </span>
            {task.dueDate && (
              <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(task.dueDate), 'dd/MM')}
              </span>
            )}
            {assignee && (
              <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                <UserIcon className="w-3 h-3" />
                {assignee.name}
              </span>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditing(true)}>
                  <Edit className="h-3 w-3 mr-2" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddChild(task.id, { title: '' })}>
                  <Plus className="h-3 w-3 mr-2" /> Adicionar sub
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(task.id)}>
                  <Trash2 className="h-3 w-3 mr-2" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {expanded && children.length > 0 && (
        <div className="space-y-1">
          {children.map(child => (
            <SubtaskItem
              key={child.id}
              task={child}
              allSubtasks={allSubtasks}
              assignees={assignees}
              depth={depth + 1}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}
