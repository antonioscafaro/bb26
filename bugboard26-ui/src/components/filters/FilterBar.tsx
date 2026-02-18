// src/components/filters/FilterBar.tsx
import { useMemo, forwardRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Icons } from '../common/Icons';
import { FilterChip } from './FilterChip';
import { SortControl } from './SortControl';
import type { Filters, Sorting } from '../../types/filters';
import { priorityConfig, typeConfig } from '../../config/uiConstants';
import { useIssues } from '../../context/IssueContext.shared';

export const FilterBar = forwardRef<HTMLButtonElement, {
  filters: Filters;
  setFilters: (f: Filters) => void;
  sorting: Sorting;
  setSorting: (s: Sorting) => void;
  onFilterButtonClick: () => void;
  hideAssigneeFilter?: boolean; // Nuova prop
}>(({ filters, setFilters, sorting, setSorting, onFilterButtonClick, hideAssigneeFilter = false }, ref) => {
  const { state: issueState } = useIssues();

  const activeFilters = useMemo(() => {
    const active: { id: string; label: string; action: () => void }[] = [];
    filters.types.forEach(type => {
      active.push({ id: `type-${type}`, label: `Tipo: ${typeConfig[type]?.label || type}`, action: () => setFilters({ ...filters, types: filters.types.filter(t => t !== type) }) });
    });
    filters.priorities.forEach(priority => {
      active.push({ id: `priority-${priority}`, label: `Priorità: ${priorityConfig[priority]?.name || priority}`, action: () => setFilters({ ...filters, priorities: filters.priorities.filter(p => p !== priority) }) });
    });
    if (!hideAssigneeFilter && filters.assigneeId !== 'all') { // Logica aggiornata
      const label = filters.assigneeId === 'unassigned' ? 'Non Assegnato' : issueState.users.find(u => u.id === filters.assigneeId)?.name || 'Sconosciuto';
      active.push({ id: 'assignee', label: `Assegnatario: ${label}`, action: () => setFilters({ ...filters, assigneeId: 'all' }) });
    }
    return active;
  }, [filters, setFilters, issueState.users, hideAssigneeFilter]);

  return (
    <div className="bg-surface rounded-m3-xl shadow-sm flex items-center justify-between p-2">
      <div className="flex items-center gap-2 overflow-hidden min-w-0">
        <button ref={ref} onClick={onFilterButtonClick} className="flex items-center gap-2 h-10 px-4 rounded-m3-xl border border-outline text-on-surface hover:bg-surface-variant transition-colors flex-shrink-0">
          <Icons.Filter />
          <span className="text-sm font-medium hidden sm:inline">Filtra</span>
        </button>
        {activeFilters.length > 0 && <div className="h-6 w-px bg-outline-variant mx-2 hidden sm:block" />}
        <div className="flex-grow overflow-hidden min-w-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2 no-scrollbar">
            <AnimatePresence>
              {activeFilters.map(f => <FilterChip key={f.id} label={f.label} onRemove={f.action} />)}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 pl-4">
        <SortControl sorting={sorting} setSorting={setSorting} />
      </div>
    </div>
  );
});