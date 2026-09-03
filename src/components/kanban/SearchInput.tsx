import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useKanbanFilters } from '@/hooks/kanban/useKanbanFilters';

interface SearchInputProps {
  placeholder?: string;
}

export function SearchInput({ placeholder = 'Buscar cards...' }: SearchInputProps) {
  const { filters, setFilter } = useKanbanFilters();
  const [inputValue, setInputValue] = useState<string>(filters.search || '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Sync input with URL changes (browser back/forward)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputValue(filters.search || '');
  }, [filters.search]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      setInputValue(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setFilter('search', value || undefined), 250);
    },
    [setFilter]
  );

  const handleClear = () => {
    handleChange('');
  };

  return (
    <div className="relative w-[300px] shrink-0">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        className="pl-9 h-9 text-sm"
      />
      {inputValue && (
        <button
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={handleClear}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}