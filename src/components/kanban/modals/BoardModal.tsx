import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { Board } from '@/types/kanban';

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(100),
  description: z.string().optional(),
  is_active: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface BoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board?: Board;
  onSubmit: (data: FormData) => Promise<void>;
  loading: boolean;
}

export function BoardModal({ open, onOpenChange, board, onSubmit, loading }: BoardModalProps) {
  const isEdit = !!board;
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', is_active: true },
  });

  useEffect(() => {
    if (open) {
      if (board) reset({ name: board.name, description: board.description || '', is_active: board.isActive });
      else reset({ name: '', description: '', is_active: true });
    }
  }, [open, board, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Quadro' : 'Novo Quadro'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Altere as informações do quadro.' : 'Crie um novo quadro para organizar seus cards.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" {...register('name')} placeholder="Ex: Quadro de Vendas" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...register('description')} placeholder="Descrição opcional" rows={3} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Ativo</Label>
            <Switch {...register('is_active')} />
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