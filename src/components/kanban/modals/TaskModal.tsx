import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Task, BoardColumn, User, Client } from '@/types/kanban';

const schema = z.object({
  title: z.string().min(1, 'Título obrigatório').max(200),
  description: z.string().optional(),
  boardColumnId: z.string().min(1, 'Selecione uma etapa'),
  priority: z.enum(['baixa','media','alta']),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
  clientId: z.string().optional(),
  orderId: z.string().optional(),
  tags: z.array(z.string()),
  parentTaskId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  columns: BoardColumn[];
  assignees: User[];
  clients: Client[];
  orders: { id: string; display_id: string; client?: { name: string } }[];
  onSubmit: (data: FormData) => Promise<void>;
  loading: boolean;
  preselectedColumnId?: string;
}

export function TaskModal({ open, onOpenChange, task, columns, assignees, clients, orders, onSubmit, loading, preselectedColumnId }: TaskModalProps) {
  const isEdit = !!task;
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', boardColumnId: '', priority: 'media', dueDate: undefined, assigneeId: undefined, clientId: undefined, orderId: undefined, tags: [], parentTaskId: undefined },
  });

  useEffect(() => {
    if (open) {
      if (task) {
        reset({
          title: task.title,
          description: task.description || '',
          boardColumnId: task.boardColumnId || '',
          priority: task.priority,
          dueDate: task.dueDate ? format(parseISO(task.dueDate), 'yyyy-MM-dd') : undefined,
          assigneeId: task.assigneeId || undefined,
          clientId: task.clientId || undefined,
          orderId: undefined,
          tags: task.tags || [],
          parentTaskId: task.parentTaskId || undefined,
        });
      } else {
        reset({ title: '', description: '', boardColumnId: preselectedColumnId || columns[0]?.id || '', priority: 'media', dueDate: undefined, assigneeId: undefined, clientId: undefined, orderId: undefined, tags: [], parentTaskId: undefined });
      }
    }
  }, [open, task, columns, preselectedColumnId, reset]);

  const [tagInput, setTagInput] = useState('');
  const tags = watch('tags') || [];
  const addTag = () => { if (tagInput.trim()) { setValue('tags', [...tags, tagInput.trim()], { shouldValidate: true }); setTagInput(''); } };
  const removeTag = (t: string) => setValue('tags', tags.filter(x => x !== t), { shouldValidate: true });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Card' : 'Novo Card'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Altere as informações do card.' : 'Crie um novo card no quadro.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex-1 overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" {...register('title')} placeholder="Título do card" />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição / Notas</Label>
            <Textarea id="description" {...register('description')} placeholder="Detalhes, observações..." rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Etapa *</Label>
              <Select {...register('boardColumnId')}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {columns.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.boardColumnId && <p className="text-sm text-destructive">{errors.boardColumnId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select {...register('priority')}>
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
              <Label>Data de vencimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between" type="button">
                    <Calendar className="w-4 h-4 mr-2" />
                    {watch('dueDate') ? format(parseISO(watch('dueDate')!), 'dd/MM/yyyy') : 'Selecionar data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start">
                  <Input type="date" value={watch('dueDate') || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => register('dueDate').onChange(e)} className="w-[250px]" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Select {...register('assigneeId')}>
                <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {assignees.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select {...register('clientId')}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vincular Pedido (Order)</Label>
              <Select {...register('orderId')}>
                <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {orders.map(o => <SelectItem key={o.id} value={o.id}>#{o.display_id} - {o.client?.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map(t => (
                <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-sm">
                  {t} <button type="button" onClick={() => removeTag(t)} className="text-muted-foreground hover:text-foreground">×</button>
                </span>
              ))}
              <div className="flex gap-1">
                <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Adicionar tag" className="w-48" />
                <Button type="button" variant="outline" size="sm" onClick={addTag} disabled={!tagInput.trim()}>Add</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}