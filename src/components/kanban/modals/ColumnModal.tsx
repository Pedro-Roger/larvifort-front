import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { BoardColumn, OrderStage } from '@/types/kanban';

const schema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  stage_type: z.enum(['active', 'completed', 'cancelled']),
  semanticKey: z.enum(['orcamento','negociacao','aprovado','disponibilidade','reservado','producao','pronto','entregue']).optional(),
});

type FormData = z.infer<typeof schema>;

interface ColumnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column?: BoardColumn;
  existingColumns: BoardColumn[];
  onSubmit: (data: FormData) => Promise<void>;
  loading: boolean;
}

const STAGE_COLORS = ['#6B7280','#3B82F6','#10B981','#F59E0B','#8B5CF6','#EC4899','#06B6D4','#059669','#EF4444','#8B5CF6'];

export function ColumnModal({ open, onOpenChange, column, existingColumns, onSubmit, loading }: ColumnModalProps) {
  const isEdit = !!column;
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', color: STAGE_COLORS[0], stage_type: 'active' as const, semanticKey: undefined },
  });

  const usedSemanticKeys = existingColumns.filter(c => c.id !== column?.id).map(c => c.semanticKey).filter(Boolean);
  const watchedColor = watch('color');

  useEffect(() => {
    if (open) {
      if (column) reset({ name: column.name, color: column.color, stage_type: ((column as BoardColumn & { stage_type?: string }).stage_type || 'active') as 'active' | 'completed' | 'cancelled', semanticKey: column.semanticKey });
      else reset({ name: '', color: STAGE_COLORS[existingColumns.length % STAGE_COLORS.length], stage_type: 'active' as const, semanticKey: undefined });
    }
  }, [open, column, existingColumns, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Etapa' : 'Nova Etapa'}</DialogTitle>
          <DialogDescription>Configure a coluna do quadro.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" {...register('name')} placeholder="Ex: Negociação" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex items-center gap-2">
              <input type="color" {...register('color')} className="w-10 h-10 rounded border" />
              <div className="flex gap-1 flex-wrap">
                {STAGE_COLORS.map(c => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => register('color').onChange({ target: { value: c } })}
                    className="w-8 h-8 rounded border-2"
                    style={{ backgroundColor: c, borderColor: watchedColor === c ? 'currentColor' : 'transparent' }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tipo da etapa</Label>
            <Select {...register('stage_type')}>
              <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativa (padrão)</SelectItem>
                <SelectItem value="completed">Concluída (sucesso)</SelectItem>
                <SelectItem value="cancelled">Cancelada/Perda</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Chave semântica (opcional)</Label>
            <Select {...register('semanticKey')}>
              <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma</SelectItem>
                {(['orcamento','negociacao','aprovado','disponibilidade','reservado','producao','pronto','entregue'] as OrderStage[]).map(k => (
                  <SelectItem key={k} value={k} disabled={usedSemanticKeys.includes(k)}>{k} {usedSemanticKeys.includes(k) && '(usado)'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Vincula automações AquaFort. Uma por quadro.</p>
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