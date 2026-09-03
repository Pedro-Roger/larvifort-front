import { useState } from 'react';
import { Check, ChevronDown, User, CircleDot, Calendar, AlertCircle, Filter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useKanbanFilters } from '@/hooks/kanban/useKanbanFilters';
import { useProjectStore } from '@/store/kanban/projectStore';

const STATUS_OPTIONS = ['open', 'pending', 'resolved', 'snoozed'] as const;
const PRIORITY_OPTIONS = ['alta', 'media', 'baixa'] as const;
const PERIOD_OPTIONS = [
  { key: '', label: 'Todos' },
  { key: 'today', label: 'Hoje' },
  { key: '7d', label: 'Últimos 7 dias' },
  { key: '30d', label: 'Últimos 30 dias' },
  { key: 'month', label: 'Este mês' },
] as const;

const STATUS_COLOR: Record<string, string> = {
  open: '#359558',
  pending: '#F59E0B',
  resolved: '#9aa3b2',
  snoozed: '#8B5CF6',
};
const PRIORITY_COLOR: Record<string, string> = {
  alta: '#EF4444',
  media: '#F59E0B',
  baixa: '#359558',
};

export function FiltersPopover() {
  const { filters, setFilter, clearFilters, activeFilterCount, applyPeriod } = useKanbanFilters();
  const { agents } = useProjectStore();
  const [openSection, setOpenSection] = useState<string | null>('assignee');

  const uniqueAssignees = (agents || []).map((a) => ({ id: String(a.id), name: a.name, avatarUrl: a.avatarUrl }));

  const toggleSection = (section: string) => setOpenSection((s) => (s === section ? null : section));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-9 gap-2 whitespace-nowrap ${activeFilterCount > 0 ? 'border-primary/40 bg-primary/5 text-primary' : ''}`}
        >
          <Filter className="w-4 h-4" /> Filtros
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[300px] p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
          <span className="text-sm font-semibold text-foreground">Filtros</span>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs font-semibold text-primary hover:text-primary/70">
              Limpar todos
            </Button>
          )}
        </div>

        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1.5">
          <AccordionSection title="Responsável" icon={User} section="assignee" openSection={openSection} onToggle={toggleSection}>
            <FilterOption label="Todos" selected={!filters.assigneeId} onClick={() => setFilter('assigneeId', undefined)} />
            {uniqueAssignees.map((a) => (
              <FilterOption
                key={a.id}
                label={a.name}
                avatar={a.avatarUrl}
                selected={filters.assigneeId === a.id}
                onClick={() => setFilter('assigneeId', a.id)}
              />
            ))}
          </AccordionSection>

          <AccordionSection title="Status" icon={CircleDot} section="status" openSection={openSection} onToggle={toggleSection}>
            <FilterOption label="Todos" selected={!filters.status} onClick={() => setFilter('status', undefined)} />
            {STATUS_OPTIONS.map((s) => (
              <FilterOption
                key={s}
                label={s}
                colorDot={STATUS_COLOR[s]}
                selected={filters.status === s}
                onClick={() => setFilter('status', s)}
              />
            ))}
          </AccordionSection>

          <AccordionSection title="Período" icon={Calendar} section="period" openSection={openSection} onToggle={toggleSection}>
            {PERIOD_OPTIONS.map((p) => (
              <FilterOption
                key={p.key}
                label={p.label}
                selected={filters.period === p.key || (!filters.period && !p.key)}
                onClick={() => applyPeriod(p.key)}
              />
            ))}
          </AccordionSection>

          <AccordionSection title="Prioridade" icon={AlertCircle} section="priority" openSection={openSection} onToggle={toggleSection}>
            <FilterOption label="Todos" selected={!filters.priority} onClick={() => setFilter('priority', undefined)} />
            {PRIORITY_OPTIONS.map((p) => (
              <FilterOption
                key={p}
                label={p.charAt(0).toUpperCase() + p.slice(1)}
                colorDot={PRIORITY_COLOR[p]}
                selected={filters.priority === p}
                onClick={() => setFilter('priority', p)}
              />
            ))}
          </AccordionSection>
        </div>

        <div className="flex items-center justify-end gap-2 px-3 py-2.5 border-t border-border">
          <Button variant="outline" size="sm" onClick={clearFilters} disabled={activeFilterCount === 0}>
            Limpar
          </Button>
          <Button size="sm" onClick={() => {}}>
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface AccordionSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  section: string;
  openSection: string | null;
  onToggle: (section: string) => void;
  children: React.ReactNode;
}

function AccordionSection({ title, icon: Icon, section, openSection, onToggle, children }: AccordionSectionProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/40"
        onClick={() => onToggle(section)}
      >
        <span className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />{title}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${openSection === section ? 'rotate-180' : ''}`} />
      </button>
      {openSection === section && <div className="px-2 pb-2 space-y-0.5">{children}</div>}
    </div>
  );
}

interface FilterOptionProps {
  label: string;
  avatar?: string;
  colorDot?: string;
  selected: boolean;
  onClick: () => void;
}

function FilterOption({ label, avatar, colorDot, selected, onClick }: FilterOptionProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 w-full px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
    >
      {avatar && <img src={avatar} alt={label} className="w-6 h-6 rounded-full object-cover shrink-0" />}
      {colorDot && <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colorDot }} />}
      {!avatar && !colorDot && <span className="w-6 h-6 shrink-0" />}
      <span className="flex-1 text-left truncate text-foreground">{label}</span>
      {selected && <Check className="w-4 h-4 text-primary shrink-0" />}
    </button>
  );
}