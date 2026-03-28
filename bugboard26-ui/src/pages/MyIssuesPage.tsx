// src/pages/MyIssuesPage.tsx
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import type { Issue, User, IssuePriority, IssueStatus } from '../types';
import type { Filters, Sorting } from '../types/filters';
import { useIssues } from '../context/IssueContext.shared';
import { useProjects } from '../context/ProjectContext.shared';
import { useIsMobile } from '../hooks/useIsMobile';
import { useDragAndDrop, type DropResult } from '../hooks/useDragAndDrop';
import { Toast } from '../components/common/Toast';
import { getApiErrorMessage } from '../utils/apiErrors';
import { ISSUE_STATUS } from '../constants';
import api from '../api/axios';
import { mapBackendIssueToIssue } from '../utils/mappers';
import type { BackendIssue } from '../types';

import { Header } from '../components/layout/Header';
import { FilterBar } from '../components/filters/FilterBar';
import { FilterMenu } from '../components/filters/FilterMenu';
import { KanbanColumn } from '../components/issues/KanbanColumn';
import { IssueModal } from '../components/issues/IssueModal';
import { FilterBottomSheet } from '../components/filters/FilterBottomSheet';
import { Icons } from '../components/common/Icons';

type PageContext = {
    currentUser: User;
    onMenuClick: () => void;
};

const priorityOrder: Record<IssuePriority, number> = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };

const TabButton = ({ title, isActive, onClick }: { title: string, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`relative flex-shrink-0 flex-1 py-3 text-sm font-medium text-center transition-colors focus:outline-none ${isActive ? 'text-primary' : 'text-on-surface-variant hover:bg-surface-variant/60'
            }`}
    >
        {title}
        {isActive && (
            <motion.div
                className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary"
                layoutId="my-issues-kanban-underline"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
        )}
    </button>
);

export const MyIssuesPage = () => {
    const { currentUser, onMenuClick } = useOutletContext<PageContext>();
    const { updateIssue } = useIssues(); // Keep updateIssue for mutations
    const { selectedProjectId } = useProjects();

    // Local state for issues fetched from backend
    const [issues, setIssues] = useState<Issue[]>([]);
    // Removed isLoading if unused, or use it. Let's remove for now to clear error.

    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [activeColumn, setActiveColumn] = useState<IssueStatus | null>(null);
    const [exitingIssues, setExitingIssues] = useState<Set<string>>(new Set());
    const isMobile = useIsMobile();

    // Fetch issues from backend
    const fetchMyIssues = useCallback(async () => {
        // Vite uses import.meta.env
        if (import.meta.env.MODE === 'development') {
            // Debug log?
            // console.log("Fetching my issues in dev mode");
        }

        if (!currentUser?.email || !selectedProjectId) return;

        try {
            const response = await api.get<BackendIssue[]>(`/utenti/${currentUser.email}/issues?idProgetto=${selectedProjectId}`);
            const mappedIssues = response.data.map(mapBackendIssueToIssue);
            setIssues(mappedIssues);
        } catch (error) {
            console.error("Failed to fetch my issues", error);
            Toast.error(getApiErrorMessage(error, 'Errore nel caricamento delle tue issue'));
        }
    }, [currentUser?.email, selectedProjectId]);

    useEffect(() => {
        fetchMyIssues();
    }, [fetchMyIssues]);

    const [filters, setFilters] = useState<Omit<Filters, 'assigneeId'>>({ types: [], priorities: [] });
    const [sorting, setSorting] = useState<Sorting>({ by: 'createdAt', direction: 'desc' });

    const [isFilterMenuOpen, setFilterMenuOpen] = useState(false);
    const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);
    const filterButtonRef = useRef<HTMLButtonElement>(null);

    const handleDrop = async (result: DropResult) => {
        const { draggedId, targetStatus } = result;
        const issue = issues.find(i => i.id === draggedId);
        if (!issue) return;

        // Block drag FROM done — resolved issues cannot be moved out (backend constraint)
        if (issue.status === 'done') {
            Toast.error('Le issue risolte non possono essere modificate');
            return;
        }

        try {
            setExitingIssues(prev => new Set(prev).add(draggedId));
            setTimeout(async () => {
                await updateIssue(draggedId, { status: targetStatus as IssueStatus });

                // Optimistic update local state or re-fetch?
                // Re-fetch is safer for "Dumb Frontend".
                await fetchMyIssues();

                const statusNames: Record<string, string> = {
                    'todo': 'To Do',
                    'inprogress': 'In Progress',
                    'inreview': 'In Review',
                    'done': 'Done'
                };
                Toast.success(`Issue "${issue.title}" spostata in ${statusNames[targetStatus]}`);

                setExitingIssues(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(draggedId);
                    return newSet;
                });
            }, 400);

        } catch (error) {
            Toast.error(getApiErrorMessage(error, 'Errore nello spostamento della issue'));
            setExitingIssues(prev => {
                const newSet = new Set(prev);
                newSet.delete(draggedId);
                return newSet;
            });
        }
    };

    const dragAndDropProps = useDragAndDrop(handleDrop);

    useEffect(() => {
        if (isMobile && activeColumn === null) setActiveColumn('todo');
    }, [isMobile, activeColumn]);

    const handleCardClick = (issue: Issue) => setSelectedIssue(issue);
    const handleCloseModal = () => setSelectedIssue(null);

    const filteredAndSortedIssues = useMemo(() => {
        if (!selectedProjectId) return [];
        // The list is already filtered by backend (assigned to me + project id)
        // We only filter out status rejected/archived if we want to hide them from Kanban?
        // Usually Kanban shows everything active.
        // But "My Issues" usually implies active work.
        // Let's keep status filters but remove assignee/project checks.
        let processedIssues = issues.filter(issue =>
            issue.status !== 'archived' &&
            issue.status !== 'rejected'
        );

        processedIssues = processedIssues.filter(issue => {
            const typeMatch = filters.types.length === 0 || (issue.type && filters.types.includes(issue.type));
            const priorityMatch = filters.priorities.length === 0 || (issue.priority && filters.priorities.includes(issue.priority));
            return typeMatch && priorityMatch;
        });

        processedIssues.sort((a, b) => {
            let compareA: string | number;
            let compareB: string | number;
            switch (sorting.by) {
                case 'priority': compareA = a.priority ? priorityOrder[a.priority] : 0; compareB = b.priority ? priorityOrder[b.priority] : 0; break;
                case 'title': compareA = a.title.toLowerCase(); compareB = b.title.toLowerCase(); break;
                default: compareA = new Date(a.createdAt).getTime(); compareB = new Date(b.createdAt).getTime(); break;
            }
            if (compareA < compareB) return sorting.direction === 'asc' ? -1 : 1;
            if (compareA > compareB) return sorting.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return processedIssues;
    }, [issues, filters, sorting, selectedProjectId]);

    const filterKey = JSON.stringify(filters) + JSON.stringify(sorting);
    const todoIssues = filteredAndSortedIssues.filter(i => i.status === ISSUE_STATUS.TODO);
    const inProgressIssues = filteredAndSortedIssues.filter(i => i.status === ISSUE_STATUS.IN_PROGRESS);
    const inReviewIssues = filteredAndSortedIssues.filter(i => i.status === ISSUE_STATUS.IN_REVIEW);
    const doneIssues = filteredAndSortedIssues.filter(i => i.status === ISSUE_STATUS.DONE);

    const mobileColumnData = useMemo(() => {
        if (!activeColumn) return { title: 'To Do', issues: todoIssues };
        switch (activeColumn) {
            case ISSUE_STATUS.IN_PROGRESS: return { title: 'In Progress', issues: inProgressIssues };
            case ISSUE_STATUS.IN_REVIEW: return { title: 'In Review', issues: inReviewIssues };
            case ISSUE_STATUS.DONE: return { title: 'Done', issues: doneIssues };
            default: return { title: 'To Do', issues: todoIssues };
        }
    }, [activeColumn, todoIssues, inProgressIssues, inReviewIssues, doneIssues]);

    const handleFiltersChange = (newFilters: Filters) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { assigneeId: _assigneeId, ...rest } = newFilters;
        setFilters(rest);
    };

    const fullFiltersObject: Filters = { ...filters, assigneeId: currentUser.id };

    const activeFilterCount = useMemo(() => filters.types.length + filters.priorities.length, [filters]);

    return (
        <LayoutGroup>
            <div className="flex flex-col h-full bg-background">
                <Header onMenuClick={onMenuClick} />
                <div className="flex-grow flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 z-10 p-4 sm:p-6 bg-gradient-to-b from-background via-background to-transparent">
                        {isMobile ? (
                            <button onClick={() => setBottomSheetOpen(true)} className="w-full flex items-center justify-center gap-2 h-12 px-4 bg-surface rounded-m3-xl shadow-sm border border-outline text-on-surface">
                                <Icons.Filter />
                                <span className="text-sm font-medium">Filtra e Ordina</span>
                                {activeFilterCount > 0 && <span className="ml-2 bg-primary text-on-primary text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">{activeFilterCount}</span>}
                            </button>
                        ) : (
                            <FilterBar
                                ref={filterButtonRef}
                                filters={fullFiltersObject}
                                setFilters={handleFiltersChange}
                                sorting={sorting}
                                setSorting={setSorting}
                                onFilterButtonClick={() => setFilterMenuOpen(true)}
                                hideAssigneeFilter={true}
                            />
                        )}
                    </div>

                    <div className="flex-grow overflow-y-auto pt-24">
                        <div className="px-4 sm:px-6 pb-24 min-w-0">
                            {isMobile ? (
                                <>
                                    <div className="flex border-b border-outline-variant mb-4 overflow-x-auto overflow-y-hidden no-scrollbar">
                                        <TabButton title="To Do" isActive={activeColumn === 'todo'} onClick={() => setActiveColumn('todo')} />
                                        <TabButton title="In Progress" isActive={activeColumn === 'inprogress'} onClick={() => setActiveColumn('inprogress')} />
                                        <TabButton title="In Review" isActive={activeColumn === 'inreview'} onClick={() => setActiveColumn('inreview')} />
                                        <TabButton title="Done" isActive={activeColumn === 'done'} onClick={() => setActiveColumn('done')} />
                                    </div>
                                    <div className="overflow-visible w-full">
                                        {activeColumn && (
                                            <KanbanColumn
                                                key={`${activeColumn}-${filterKey}`}
                                                title={mobileColumnData.title}
                                                issues={mobileColumnData.issues}
                                                onCardClick={handleCardClick}
                                                selectedIssueId={selectedIssue?.id}
                                                isModalOpen={!!selectedIssue}
                                                exitingIssues={exitingIssues}
                                                dragAndDropProps={dragAndDropProps}
                                                status={activeColumn}
                                                currentUser={currentUser}
                                            />
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex gap-6 h-full w-full" key={filterKey}>
                                    <KanbanColumn title="To Do" issues={todoIssues} onCardClick={handleCardClick} selectedIssueId={selectedIssue?.id} isModalOpen={!!selectedIssue} exitingIssues={exitingIssues} dragAndDropProps={dragAndDropProps} status="todo" currentUser={currentUser} />
                                    <KanbanColumn title="In Progress" issues={inProgressIssues} onCardClick={handleCardClick} selectedIssueId={selectedIssue?.id} isModalOpen={!!selectedIssue} exitingIssues={exitingIssues} dragAndDropProps={dragAndDropProps} status="inprogress" currentUser={currentUser} />
                                    <KanbanColumn title="In Review" issues={inReviewIssues} onCardClick={handleCardClick} selectedIssueId={selectedIssue?.id} isModalOpen={!!selectedIssue} exitingIssues={exitingIssues} dragAndDropProps={dragAndDropProps} status="inreview" currentUser={currentUser} />
                                    <KanbanColumn title="Done" issues={doneIssues} onCardClick={handleCardClick} selectedIssueId={selectedIssue?.id} isModalOpen={!!selectedIssue} exitingIssues={exitingIssues} dragAndDropProps={dragAndDropProps} status="done" currentUser={currentUser} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {selectedIssue && <IssueModal issue={selectedIssue} onClose={handleCloseModal} currentUser={currentUser} />}
            </AnimatePresence>

            {isMobile ? (
                <FilterBottomSheet isOpen={isBottomSheetOpen} onClose={() => setBottomSheetOpen(false)} currentFilters={fullFiltersObject} onFiltersChange={handleFiltersChange} currentSorting={sorting} onSortingChange={setSorting} hideAssigneeFilter={true} />
            ) : (
                <FilterMenu isOpen={isFilterMenuOpen} onClose={() => setFilterMenuOpen(false)} anchorRef={filterButtonRef as React.RefObject<HTMLButtonElement>} currentFilters={fullFiltersObject} onFiltersChange={handleFiltersChange} hideAssigneeFilter={true} />
            )}
        </LayoutGroup>
    );
};