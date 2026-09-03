import { MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import type { Task } from '@/types/kanban';
import { getContactColor } from '@/lib/utils';

interface ActivityTimelineProps {
  task: Task;
}

export function ActivityTimeline({ task }: ActivityTimelineProps) {
  const activities: Array<{
    id: string;
    type: 'created' | 'updated' | 'subtask_progress' | 'comment';
    label: string;
    detail?: string;
    timestamp: string;
    initial: string;
  }> = [];

  activities.push({
    id: 'created',
    type: 'created',
    label: 'Card criado',
    detail: task.description ? 'Com descrição' : undefined,
    timestamp: task.createdAt,
    initial: task.assignee?.name?.[0] || 'S',
  });

  if (task.updatedAt !== task.createdAt) {
    activities.push({
      id: 'updated',
      type: 'updated',
      label: 'Card atualizado',
      timestamp: task.updatedAt,
      initial: task.assignee?.name?.[0] || 'U',
    });
  }

  if (task.subtasks && task.subtasks.length > 0) {
    const completed = task.subtasks.filter(s => s.status === 'completed').length;
    activities.push({
      id: 'subtask-progress',
      type: 'subtask_progress',
      label: `${completed} de ${task.subtasks.length} subtarefas concluídas`,
      timestamp: task.updatedAt,
      initial: 'S',
    });
  }

  if (activities.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-muted-foreground">
        Nenhuma atividade registrada
      </div>
    );
  }

  return (
    <div className="p-4 space-y-1 overflow-y-auto max-h-[400px]">
      {activities.map(act => (
        <div key={act.id} className="flex gap-3 py-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: getContactColor(act.initial) }}
          >
            {act.initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{act.label}</span>
            </div>
            {act.detail && <p className="text-xs text-muted-foreground mt-0.5">{act.detail}</p>}
            <p className="text-xs text-muted-foreground mt-0.5">
              {format(new Date(act.timestamp), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
        </div>
      ))}
      <div className="flex gap-3 py-3 text-muted-foreground">
        <MessageSquare className="w-4 h-4 mt-1 flex-shrink-0" />
        <p className="text-sm">Nenhum comentário ainda</p>
      </div>
    </div>
  );
}
