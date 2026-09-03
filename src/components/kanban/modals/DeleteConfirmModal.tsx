import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
  loading: boolean;
  itemName?: string;
}

export function DeleteConfirmModal({ open, onOpenChange, title, description, onConfirm, loading, itemName }: DeleteConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" />{title}</DialogTitle>
          <DialogDescription>{description} {itemName && <strong className="text-foreground">"{itemName}"</strong>}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button variant="destructive" onClick={async () => { await onConfirm(); onOpenChange(false); }} disabled={loading}>
            {loading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}