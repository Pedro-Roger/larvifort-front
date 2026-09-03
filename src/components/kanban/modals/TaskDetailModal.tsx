import { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, CheckCircle2, Circle, ArrowUpDown, GripVertical, MessageSquare, CalendarClock, Copy, MoreVertical, ChevronDown, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Task, BoardColumn, User } from '@/types/kanban';
import { format } from 'date-fns';
import { getContactColor } from '@/lib/utils';
import { SubtaskItem } from './SubtaskItem';
import { ActivityTimeline } from './ActivityTimeline';

const PRIORITY_BADGE: Record<string, string> = {
  alta: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  media: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  baixa: 'bg-primary/10 text-primary',
};
const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-muted text-muted-foreground',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

interface TaskDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  columns: BoardColumn[];
  assignees: User[];
  onUpdate: (taskId: string, data: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onMove: (taskId: string, columnId: string) => Promise<void>;
  onCreateSubtask: (parentId: string, data: { title: string; description?: string; assigneeId?: string; dueDate?: string; priority?: Task['priority'] }) => Promise<void>;
  onUpdateSubtask: (subtaskId: string, data: { title?: string; status?: Task['status']; description?: string; assigneeId?: string; dueDate?: string; priority?: Task['priority'] }) => Promise<void>;
  onDeleteSubtask: (subtaskId: string) => Promise<void>;
  onReorderSubtasks?: (parentId: string, orderedIds: string[]) => Promise<void>;
}

export function TaskDetailModal({
  open, onOpenChange, task, columns, assignees,
  onUpdate, onDelete, onMove,
  onCreateSubtask, onUpdateSubtask, onDeleteSubtask, onReorderSubtasks: _onReorderSubtasks,
}: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'subtasks' | 'activity'>('details');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    boardColumnId: task.boardColumnId || '',
    priority: task.priority,
    dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
    assigneeId: task.assigneeId || '',
    tags: task.tags || [],
  });
  const [subtasks, setSubtasks] = useState<Task[]>(task.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    setFormData({
      title: task.title,
      description: task.description || '',
      boardColumnId: task.boardColumnId || '',
      priority: task.priority,
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
      assigneeId: task.assigneeId || '',
      tags: task.tags || [],
    });
    setSubtasks(task.subtasks || []);
  }, [task]);

  const handleSave = async () => {
    await onUpdate(task.id, {
      title: formData.title,
      description: formData.description,
      boardColumnId: formData.boardColumnId,
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
      assigneeId: formData.assigneeId || undefined,
    });
    setEditing(false);
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    await onCreateSubtask(task.id, { title: newSubtaskTitle.trim() });
    setNewSubtaskTitle('');
  };

  const handleUpdateSubtask = async (subtaskId: string, data: { title?: string; status?: Task['status'] }) => {
    await onUpdateSubtask(subtaskId, data);
    setSubtasks(prev => prev.map(s => s.id === subtaskId ? { ...s, ...data } as Task : s));
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    await onDeleteSubtask(subtaskId);
    setSubtasks(prev => prev.filter(s => s.id !== subtaskId));
  };

  const handleAddChild = async (parentId: string, data: { title: string }) => {
    await onCreateSubtask(parentId, data);
  };

  const rootSubtasks = subtasks.filter(s => !s.parentTaskId || s.parentTaskId === task.id);
  const completedCount = subtasks.filter(s => s.status === 'completed').length;
  const moveTargets = columns.filter(c => c.id !== task.boardColumnId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="flex flex-col gap-4 p-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: getContactColor(task.client?.name) }}
              >
                {task.client?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-lg font-bold truncate">{formData.title || 'Sem título'}</DialogTitle>
                  {task.boardColumn && (
                    <span
                      className="px-2 py-0.5 rounded-md text-xs font-medium shrink-0"
                      style={{ backgroundColor: `${task.boardColumn.color}15`, borderColor: `${task.boardColumn.color}40`, color: task.boardColumn.color }}
                    >
                      {task.boardColumn.name}
                    </span>
                  )}
                  <Badge className={PRIORITY_BADGE[formData.priority]}>{formData.priority}</Badge>
                </div>
                <DialogDescription className="mt-1">{task.client?.name || 'Cliente não vinculado'}</DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {moveTargets.length > 0 && (
                    <>
                      <DropdownMenuItem disabled>
                        <ArrowUpDown className="h-4 w-4 mr-2" /> Mover para...
                      </DropdownMenuItem>
                      {moveTargets.map(target => (
                        <DropdownMenuItem key={target.id} onClick={() => onMove(task.id, target.id)}>
                          <span className="w-2.5 h-2.5 rounded-full mr-2 shrink-0" style={{ backgroundColor: target.color }} />
                          {target.name}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText(task.id)}>
                    <Copy className="h-4 w-4 mr-2" /> Copiar ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={() => { onDelete(task.id); onOpenChange(false); }}>
                    <Trash2 className="h-4 w-4 mr-2" /> Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b" role="tablist">
            {(['details', 'subtasks', 'activity'] as const).map(tab => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-sm font-medium rounded-t-md transition-colors ${
                  activeTab === tab
                    ? 'bg-background text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'details' && 'Detalhes'}
                {tab === 'subtasks' && `Subtarefas (${completedCount}/${subtasks.length})`}
                {tab === 'activity' && 'Atividade'}
              </button>
            ))}
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'details' && (
            <div className="h-full overflow-y-auto p-6 space-y-6">
              {editing ? (
                <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="detail-title">Título *</Label>
                    <Input id="detail-title" value={formData.title} onChange={e => setFormData(d => ({ ...d, title: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="detail-desc">Descrição</Label>
                    <Textarea id="detail-desc" value={formData.description} onChange={e => setFormData(d => ({ ...d, description: e.target.value }))} rows={4} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Etapa</Label>
                      <Select value={formData.boardColumnId} onValueChange={v => setFormData(d => ({ ...d, boardColumnId: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {columns.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Prioridade</Label>
                      <Select value={formData.priority} onValueChange={v => setFormData(d => ({ ...d, priority: v as 'baixa' | 'media' | 'alta' }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vencimento</Label>
                      <Input type="date" value={formData.dueDate} onChange={e => setFormData(d => ({ ...d, dueDate: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Responsável</Label>
                      <Select value={formData.assigneeId} onValueChange={v => setFormData(d => ({ ...d, assigneeId: v }))}>
                        <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nenhum</SelectItem>
                          {assignees.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
                    <Button type="submit">Salvar</Button>
                  </div>
                </form>
              ) : (
                <>
                  {formData.description && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Descrição</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{formData.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Etapa</span>
                      <p className="font-medium">{task.boardColumn?.name || '—'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Prioridade</span>
                      <p className="font-medium capitalize">{formData.priority}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Vencimento</span>
                      <p className="font-medium">{formData.dueDate ? format(new Date(formData.dueDate), 'dd/MM/yyyy') : '—'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Responsável</span>
                      <p className="font-medium">{task.assignee?.name || '—'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Criado em</span>
                      <p className="font-medium">{format(new Date(task.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Atualizado em</span>
                      <p className="font-medium">{format(new Date(task.updatedAt), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                  </div>
                  {task.servicesInfo?.hasServices && (
                    <div className="p-3 bg-muted/30 rounded-lg text-sm">
                      <span className="text-muted-foreground">Valor total: </span>
                      <span className="font-semibold">{task.servicesInfo.formattedTotal}</span>
                    </div>
                  )}
                  <div className="flex justify-end pt-4 border-t">
                    <Button variant="outline" onClick={() => setEditing(true)}>
                      <Edit className="w-4 h-4 mr-2" /> Editar
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'subtasks' && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <div className="flex gap-2">
                  <Input
                    value={newSubtaskTitle}
                    onChange={e => setNewSubtaskTitle(e.target.value)}
                    placeholder="Nova subtarefa..."
                    className="flex-1"
                    onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                  />
                  <Button onClick={handleAddSubtask} disabled={!newSubtaskTitle.trim()}>
                    <Plus className="w-4 h-4 mr-1" /> Adicionar
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {rootSubtasks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Nenhuma subtarefa. Adicione uma acima.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {rootSubtasks.map(sub => (
                      <SubtaskItem
                        key={sub.id}
                        task={sub}
                        allSubtasks={subtasks}
                        assignees={assignees}
                        depth={0}
                        onUpdate={handleUpdateSubtask}
                        onDelete={handleDeleteSubtask}
                        onAddChild={handleAddChild}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <ActivityTimeline task={task} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
