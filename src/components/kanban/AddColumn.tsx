import { Plus } from 'lucide-react';

interface AddColumnProps {
  onClick: () => void;
}

export function AddColumn({ onClick }: AddColumnProps) {
  return (
    <div className="w-80 flex-shrink-0">
      <button
        onClick={onClick}
        className="bg-[hsl(210,40%,98%)] dark:bg-[hsl(217,33%,17%)]/50 rounded-lg p-6 h-full border-2 border-dashed border-[hsl(214,32%,90%)] dark:border-[hsl(217,33%,25%)] flex flex-col items-center justify-center text-[hsl(215,16%,47%)] dark:text-[hsl(215,20%,55%)] hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-600/10 transition-all duration-150 cursor-pointer"
      >
        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-2">
          <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-sm font-medium mb-0.5">Adicionar etapa</h3>
        <p className="text-xs text-center">Criar nova coluna no quadro</p>
      </button>
    </div>
  );
}
