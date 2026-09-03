import { useState, useEffect } from 'react';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { BoardColumn } from '@/types/kanban';

interface ReorderColumnsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: BoardColumn[];
  onSubmit: (orderedColumns: BoardColumn[]) => Promise<void>;
  loading: boolean;
}

export function ReorderColumnsModal({ open, onOpenChange, columns, onSubmit, loading }: ReorderColumnsModalProps) {
  const [ordered, setOrdered] = useState<BoardColumn[]>(() => [...columns].sort((a,b) => a.position - b.position));
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      // Sync with props when modal opens
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrdered(() => [...columns].sort((a,b) => a.position - b.position));
    }
  }, [open, columns]);

  const handleDragStart = (e: React.DragEvent, index: number) => { setDraggedIndex(index); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    const next = [...ordered];
    const item = next.splice(draggedIndex, 1)[0];
    next.splice(dropIndex, 0, item);
    setOrdered(next);
    setDraggedIndex(null);
  };
  const move = (from: number, dir: 'up'|'down') => {
    const to = dir === 'up' ? from - 1 : from + 1;
    if (to < 0 || to >= ordered.length) return;
    const next = [...ordered]; [next[from], next[to]] = [next[to], next[from]];
    setOrdered(next);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Reordenar Etapas</DialogTitle>
          <DialogDescription>Arraste para reordenar. A ordem define a visualização no quadro.</DialogDescription>
        </DialogHeader>
        <div className="py-4 overflow-y-auto flex-1">
          <div className="space-y-2">
            {ordered.map((col, index) => (
              <div key={col.id} className="group p-3 bg-background border border-border rounded-lg" draggable onDragStart={e => handleDragStart(e, index)} onDragOver={handleDragOver} onDrop={e => handleDrop(e, index)}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">{index + 1}</div>
                  <div className="flex-1"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: col.color }} /><h4 className="text-sm font-medium">{col.name}</h4></div></div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => move(index,'up')} disabled={index===0}><ArrowUp className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => move(index,'down')} disabled={index===ordered.length-1}><ArrowDown className="w-4 h-4" /></Button>
                    <div className="cursor-grab p-1"><GripVertical className="w-4 h-4 text-muted-foreground" /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={() => { const withPos = ordered.map((c,i) => ({...c, position: i+1})); onSubmit(withPos); }} disabled={loading}>{loading ? 'Salvando...' : 'Salvar ordem'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}