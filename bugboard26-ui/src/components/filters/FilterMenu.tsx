import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../common/Button';
import { X } from 'lucide-react';
import { useState, useLayoutEffect, useEffect } from 'react';
import { useIssues } from '../../context/IssueContext.shared';
import { priorityConfig, typeConfig } from '../../config/uiConstants';
import type { Filters } from '../../types/filters';
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

/**
 * Menu a tendina per la selezione dei filtri.
 */
export const FilterMenu = ({
    isOpen,
    onClose,
    anchorRef,
    onFiltersChange,
    currentFilters,
    hideAssigneeFilter = false
}: {
    isOpen: boolean;
    onClose: () => void;
    anchorRef: React.RefObject<HTMLButtonElement>;
    onFiltersChange: (filters: Filters) => void;
    currentFilters: Filters;
    hideAssigneeFilter?: boolean;
}) => {
    const { state: issueState } = useIssues();
    const [filters, setFilters] = useState(currentFilters);
    const [style, setStyle] = useState<React.CSSProperties>({});
    const [originClass, setOriginClass] = useState('origin-top-left');

    useEffect(() => {
        setFilters(currentFilters);
    }, [currentFilters, isOpen]);

    useLayoutEffect(() => {
        if (isOpen && anchorRef.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            const windowWidth = window.innerWidth;

            const newStyle: React.CSSProperties = { top: rect.bottom + 8 };
            let newOriginClass = 'origin-top';

            if (windowWidth < 640) {
                newStyle.left = 16;
                newStyle.right = 16;
            } else {
                newStyle.left = rect.left;
                newOriginClass = 'origin-top-left';
            }

            setStyle(newStyle);
            setOriginClass(newOriginClass);
        }
    }, [isOpen, anchorRef]);

    const handleTypeToggle = (type: keyof typeof typeConfig) => {
        const newTypes = filters.types.includes(type) ? filters.types.filter(t => t !== type) : [...filters.types, type];
        setFilters(prev => ({ ...prev, types: newTypes }));
    };

    const handlePriorityToggle = (priority: keyof typeof priorityConfig) => {
        const newPriorities = filters.priorities.includes(priority) ? filters.priorities.filter(p => p !== priority) : [...filters.priorities, priority];
        setFilters(prev => ({ ...prev, priorities: newPriorities }));
    };

    const handleApply = () => {
        onFiltersChange(filters);
        onClose();
    };

    const handleReset = () => {
        const resetFilters = { types: [], priorities: [], assigneeId: 'all' };
        setFilters(resetFilters);
        onFiltersChange(resetFilters);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <div onClick={onClose} className="fixed inset-0 z-40" />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                        style={style}
                        className={`fixed z-50 sm:w-80 bg-surface rounded-m3-l shadow-xl border border-outline-variant ${originClass}`}
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-outline-variant flex justify-between items-center">
                            <h3 className="font-medium text-on-surface">Filtra Issue</h3>
                            <button onClick={onClose} className="text-on-surface-variant hover:bg-surface-variant rounded-full p-1.5" aria-label="Chiudi menu filtri">
                                <X size={20} />
                            </button>
                        </div>
                        {/* Body */}
                        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
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
                                        className="w-full border border-outline bg-surface rounded-m3-sm focus:ring-2 focus:ring-primary focus:border-primary transition text-on-surface px-3 py-2"
                                    >
                                        <option value="all">Tutti</option>
                                        <option value="unassigned">Non Assegnato</option>
                                        {issueState.users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                        {/* Footer */}
                        <div className="p-4 border-t border-outline-variant flex justify-between items-center">
                            <Button variant="text" onClick={handleReset}>Resetta</Button>
                            <Button variant="filled" onClick={handleApply}>Applica</Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};