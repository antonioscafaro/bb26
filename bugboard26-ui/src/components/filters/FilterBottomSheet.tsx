import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../common/Button';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useIssues } from '../../context/IssueContext.shared';
import { priorityConfig, typeConfig } from '../../config/uiConstants';
import type { Filters, Sorting } from '../../types/filters';
import type { IssueType, IssuePriority } from '../../types';
import { Icons } from '../common/Icons';

const FilterChipButton = ({ label, icon, isActive, onClick }: {
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-1.5 border rounded-m3-sm text-sm font-medium transition-colors ${isActive
            ? 'bg-primary-container text-on-primary-container border-primary-container'
            : 'bg-surface text-on-surface-variant border-outline hover:bg-surface-variant/50'
            }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const sortOptions: { value: Sorting['by']; label: string }[] = [
    { value: 'createdAt', label: 'Data Creazione' },
    { value: 'priority', label: 'Priorità' },
    { value: 'title', label: 'Titolo' },
];

/**
 * Pannello inferiore (Bottom Sheet) per filtri e ordinamento su mobile.
 */
export const FilterBottomSheet = ({
    isOpen,
    onClose,
    onFiltersChange,
    currentFilters,
    onSortingChange,
    currentSorting,
    hideAssigneeFilter = false
}: {
    isOpen: boolean;
    onClose: () => void;
    onFiltersChange: (filters: Filters) => void;
    currentFilters: Filters;
    onSortingChange: (sorting: Sorting) => void;
    currentSorting: Sorting;
    hideAssigneeFilter?: boolean;
}) => {
    const { state: issueState } = useIssues();
    const [filters, setFilters] = useState(currentFilters);
    const [sorting, setSorting] = useState(currentSorting);

    useEffect(() => {
        if (isOpen) {
            setFilters(currentFilters);
            setSorting(currentSorting);
        }
    }, [currentFilters, currentSorting, isOpen]);

    const handleTypeToggle = (type: keyof typeof typeConfig) => {
        const newTypes = filters.types.includes(type) ? filters.types.filter(t => t !== type) : [...filters.types, type];
        setFilters(prev => ({ ...prev, types: newTypes }));
    };

    const handlePriorityToggle = (priority: keyof typeof priorityConfig) => {
        const newPriorities = filters.priorities.includes(priority) ? filters.priorities.filter(p => p !== priority) : [...filters.priorities, priority];
        setFilters(prev => ({ ...prev, priorities: newPriorities }));
    };

    const toggleDirection = () => {
        setSorting(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }));
    };

    const handleApply = () => {
        onFiltersChange(filters);
        onSortingChange(sorting);
        onClose();
    };

    const handleReset = () => {
        const resetFilters = { types: [], priorities: [], assigneeId: 'all' };
        const resetSorting: Sorting = { by: 'createdAt', direction: 'desc' };
        setFilters(resetFilters);
        setSorting(resetSorting);
        onFiltersChange(resetFilters);
        onSortingChange(resetSorting);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-m3-xl shadow-2xl flex flex-col max-h-[85vh]"
                    >
                        {/* Handle e Header */}
                        <div className="p-4 border-b border-outline-variant flex-shrink-0">
                            <div className="w-8 h-1 bg-outline-variant rounded-full mx-auto mb-3" />
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium text-lg text-on-surface">Filtra e Ordina</h3>
                                <button onClick={onClose} className="text-on-surface-variant hover:bg-surface-variant rounded-full p-1.5" aria-label="Chiudi">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Contenuto scorrevole */}
                        <div className="p-4 space-y-6 overflow-y-auto">
                            {/* Ordinamento */}
                            <div>
                                <label className="text-sm font-medium text-on-surface-variant mb-2 block">Ordina per</label>
                                <div className="flex items-center border border-outline rounded-m3-m overflow-hidden">
                                    <select
                                        value={sorting.by}
                                        onChange={e => setSorting(prev => ({ ...prev, by: e.target.value as Sorting['by'] }))}
                                        className="flex-grow bg-transparent focus:outline-none px-4 py-2 text-on-surface"
                                    >
                                        {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                    <button onClick={toggleDirection} className="w-12 h-10 flex items-center justify-center border-l border-outline">
                                        <motion.div animate={{ rotate: sorting.direction === 'asc' ? 0 : 180 }}>
                                            <Icons.ArrowUp />
                                        </motion.div>
                                    </button>
                                </div>
                            </div>

                            {/* Filtri */}
                            <div>
                                <label className="text-sm font-medium text-on-surface-variant mb-2 block">Tipo</label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(typeConfig).map(([key, { label, icon }]) => (
                                        <FilterChipButton key={key} label={label} icon={icon} isActive={filters.types.includes(key as IssueType)} onClick={() => handleTypeToggle(key as IssueType)} />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-on-surface-variant mb-2 block">Priorità</label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(priorityConfig).map(([key, { name }]) => (
                                        <FilterChipButton key={key} label={name} icon={<Icons.Priority />} isActive={filters.priorities.includes(key as IssuePriority)} onClick={() => handlePriorityToggle(key as IssuePriority)} />
                                    ))}
                                </div>
                            </div>
                            {!hideAssigneeFilter && (
                                <div>
                                    <label htmlFor="assignee-filter" className="text-sm font-medium text-on-surface-variant mb-2 block">Assegnatario</label>
                                    <select
                                        id="assignee-filter"
                                        value={filters.assigneeId}
                                        onChange={e => setFilters(prev => ({ ...prev, assigneeId: e.target.value }))}
                                        className="w-full border border-outline bg-surface rounded-m3-m focus:ring-2 focus:ring-primary focus:border-primary transition text-on-surface px-3 py-2"
                                    >
                                        <option value="all">Tutti</option>
                                        <option value="unassigned">Non Assegnato</option>
                                        {issueState.users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Azioni */}
                        <div className="p-4 border-t border-outline-variant flex justify-between items-center flex-shrink-0">
                            <Button variant="text" onClick={handleReset}>Resetta</Button>
                            <Button variant="filled" onClick={handleApply}>Applica</Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};