import { ArrowLeft, GitBranch, ChevronDown, MoreVertical, Edit, Trash2, Copy, ArrowUpDown, Star, Lock, FileText, Link2, X, Check } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { SearchInput } from './SearchInput';
import { FiltersPopover } from './FiltersPopover';
import { useProjectStore } from '@/store/kanban/projectStore';
import { useKanbanFilters } from '@/hooks/kanban/useKanbanFilters';
import { useNavigate } from 'react-router-dom';
import type { Board } from '@/types/kanban';
import { formatCurrency } from '@/lib/format';

interface KanbanHeaderProps {
  onEditBoard?: () => void;
  onDeleteBoard?: () => void;
  onReorderColumns?: () => void;
}

export function KanbanHeader({ onEditBoard, onDeleteBoard, onReorderColumns }: KanbanHeaderProps = {}) {
  const { projects, currentProjectId, currentBoardId, getCurrentBoard } = useProjectStore();
  const { filters, clearFilters } = useKanbanFilters();
  const navigate = useNavigate();
  const board = getCurrentBoard();
  const project = projects.find((p) => p.id === currentProjectId);

  const handlePipelineChange = (newBoardId: string) => {
    if (newBoardId !== currentBoardId) navigate(`/kanban/${newBoardId}`);
  };

  const totalCount = (board?.tasks?.length ?? 0) + (board?.columns?.reduce((sum, col) => sum + (col.tasks?.length ?? 0), 0) ?? 0);
  const filteredCount = totalCount;
  const stagesWithResults = board?.columns?.length ?? 0;

  return (
    <div className="flex-shrink-0 bg-white dark:bg-[hsl(217,33%,17%)] border-b border-[hsl(214,32%,90%)] dark:border-[hsl(217,33%,25%)]">
      <div className="px-4 py-3">
        {/* Top row */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/projects')}
              className="h-8 w-8 p-0 text-[hsl(215,16%,47%)] hover:text-[hsl(222,47%,11%)] hover:bg-[hsl(214,32%,95%)]"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <GitBranch className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {board?.isActive === false && <Lock className="w-3.5 h-3.5 text-[hsl(215,16%,47%)]" />}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="flex items-center gap-1 min-w-0 rounded-md hover:bg-[hsl(214,32%,95%)] dark:hover:bg-[hsl(217,33%,20%)] px-1 -mx-1 transition-colors">
                      <h1 className="text-base font-semibold text-[hsl(222,47%,11%)] dark:text-[hsl(214,40%,96%)] truncate">
                        {board?.name || 'Selecione um quadro'}
                      </h1>
                      <ChevronDown className="w-4 h-4 text-[hsl(215,16%,47%)] shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 max-h-72 overflow-y-auto">
                    {projects.flatMap((p) =>
                      (p.boards ?? []).map((b) => (
                        <DropdownMenuItem
                          key={b.id}
                          onClick={() => handlePipelineChange(b.id)}
                          className={b.id === board?.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''}
                        >
                          {(b as Board & { isActive?: boolean }).isActive === false && <Lock className="h-3.5 w-3.5 mr-2 text-[hsl(215,16%,47%)]" />}
                          <span className="truncate">{b.name}</span>
                          {b.id === board?.id && <Check className="h-3.5 w-3.5 ml-auto" />}
                        </DropdownMenuItem>
                      ))
                    ) || []}
                  </DropdownMenuContent>
                </DropdownMenu>
                {board && (board as Board & { isActive?: boolean }).isActive === false && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[hsl(214,32%,95%)] dark:bg-[hsl(217,33%,20%)] text-[hsl(215,16%,47%)]">Inativo</span>
                )}
                {board?.isDefault && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    <Star className="w-3 h-3" />Padrão
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-[hsl(215,16%,47%)] hover:text-blue-600 hover:bg-blue-50"
                  onClick={onEditBoard}
                >
                  <Edit className="w-3.5 h-3.5" />
                </Button>
              </div>
              <p className="text-xs text-[hsl(215,16%,47%)] dark:text-[hsl(215,20%,55%)] truncate">
                {board?.description || 'Sem descrição'}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs">
            <div className="text-center">
              <div className="font-semibold text-[hsl(222,47%,11%)] dark:text-[hsl(214,40%,96%)]">{totalCount}</div>
              <div className="text-[hsl(215,16%,47%)] dark:text-[hsl(215,20%,55%)]">Cards</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-[hsl(222,47%,11%)] dark:text-[hsl(214,40%,96%)]">{project?.boards?.length || 0}</div>
              <div className="text-[hsl(215,16%,47%)] dark:text-[hsl(215,20%,55%)]">Etapas</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                R$ {formatCurrency(board?.tasks?.reduce((sum: number, t: { value?: number; servicesInfo?: { totalValue?: number } }) => sum + (t.value ?? t.servicesInfo?.totalValue ?? 0), 0) ?? 0)}
              </div>
              <div className="text-[hsl(215,16%,47%)] dark:text-[hsl(215,20%,55%)]">Valor Total</div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[hsl(215,16%,47%)] hover:text-[hsl(222,47%,11%)] hover:bg-[hsl(214,32%,95%)]">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onEditBoard}>
                  <Edit className="h-4 w-4 mr-2" />Editar quadro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => board && navigator.clipboard.writeText(board.id)}>
                  <Copy className="h-4 w-4 mr-2" />Copiar ID
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onReorderColumns}>
                  <ArrowUpDown className="h-4 w-4 mr-2" />Reordenar etapas
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />Formulários de captura
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link2 className="h-4 w-4 mr-2" />Webhook de compra
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-[hsl(0,84%,60%)]" onClick={onDeleteBoard}>
                  <Trash2 className="h-4 w-4 mr-2" />Excluir quadro
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filters row */}
        <div className="border-t border-[hsl(214,32%,90%)] dark:border-[hsl(217,33%,25%)] mt-3 pt-3">
          <div className="flex items-center gap-3">
            <SearchInput />
            <FiltersPopover />
            {filters.search && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={clearFilters}
              >
                <X className="w-4 h-4 mr-1" />Limpar
              </Button>
            )}
            {(filters.assigneeId || filters.status || filters.dateFrom || filters.priority) && (
              <span className="text-xs text-[hsl(215,16%,47%)] dark:text-[hsl(215,20%,55%)] ml-auto">
                {filteredCount} de {totalCount} cards em {stagesWithResults} etapas
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
