// src/pages/KanbanPage.tsx
import { useState, useMemo, useEffect, useRef } from 'react';
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

import { Header } from '../components/layout/Header';
import { FilterBar } from '../components/filters/FilterBar';
import { FilterMenu } from '../components/filters/FilterMenu';
import { KanbanColumn } from '../components/issues/KanbanColumn';
import { IssueModal } from '../components/issues/IssueModal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { CreateIssueModal } from '../components/issues/CreateIssueModal';
import { BottomSheet } from '../components/common/BottomSheet';
import { Icons } from '../components/common/Icons';
import { FilterBottomSheet } from '../components/filters/FilterBottomSheet';

type PageContext = {
    currentUser: User;
    onMenuClick: () => void;
};

const priorityOrder: Record<IssuePriority, number> = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };

const TabButton = ({ title, isActive, onClick }: { title: string, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`relative flex-1 py-3 text-sm font-medium text-center transition-colors focus:outline-none ${isActive ? 'text-primary' : 'text-on-surface-variant hover:bg-surface-variant/60'
            }`}
    >
        {title}
        {isActive && (
            <motion.div
                className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary"
                layoutId="underline"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
        )}
    </button>
);

export const KanbanPage = () => {
    const { currentUser, onMenuClick } = useOutletContext<PageContext>();
    const { state, updateIssue, archiveIssue } = useIssues();
    const { issues } = state;
    const { selectedProjectId } = useProjects();

    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [activeColumn, setActiveColumn] = useState<IssueStatus | null>(null);
    const [exitingIssues, setExitingIssues] = useState<Set<string>>(new Set());
    const isMobile = useIsMobile();
    const [filters, setFilters] = useState<Filters>({ types: [], priorities: [], assigneeId: 'all' });
    const [sorting, setSorting] = useState<Sorting>({ by: 'createdAt', direction: 'desc' });
    const [isArchiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
    const [issueToArchive, setIssueToArchive] = useState<Issue | null>(null);
    const [isFilterMenuOpen, setFilterMenuOpen] = useState(false);
    const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);
    const [isCreateBottomSheetOpen, setCreateBottomSheetOpen] = useState(false);
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

    const handleArchiveRequest = () => {
        if (!selectedIssue) return;
        setIssueToArchive(selectedIssue);
        setArchiveConfirmOpen(true);
    };

    const executeArchive = async () => {
        if (!issueToArchive) return;
        const issueIdToArchive = issueToArchive.id;
        const archiveTitle = issueToArchive.title;

        setArchiveConfirmOpen(false);
        setSelectedIssue(null);

        const modalExitDelay = 220;
        const cardExitDuration = isMobile ? 300 : 400;

        setTimeout(() => {
            setExitingIssues(prev => new Set(prev).add(issueIdToArchive));
        }, modalExitDelay);

        setTimeout(async () => {
            await archiveIssue(issueIdToArchive);

            Toast.success(`Issue "${archiveTitle}" archiviata`);
            setIssueToArchive(null);

            setExitingIssues(prev => {
                const newSet = new Set(prev);
                newSet.delete(issueIdToArchive);
                return newSet;
            });
        }, modalExitDelay + cardExitDuration);
    };

    const filteredAndSortedIssues = useMemo(() => {
        if (!selectedProjectId) return [];
        let processedIssues = issues.filter(issue => issue.projectId === selectedProjectId);

        processedIssues = processedIssues.filter(issue => {
            const typeMatch = filters.types.length === 0 || (issue.type && filters.types.includes(issue.type));
            const priorityMatch = filters.priorities.length === 0 || (issue.priority && filters.priorities.includes(issue.priority));
            const assigneeMatch = filters.assigneeId === 'all' || (filters.assigneeId === 'unassigned' && !issue.assignee) || (issue.assignee && issue.assignee.id === filters.assigneeId);
            const statusMatch = issue.status !== 'archived' && issue.status !== 'rejected';
            return typeMatch && priorityMatch && assigneeMatch && statusMatch;
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

    const filterKey = JSON.stringify(filters) + JSON.stringify(sorting) + selectedProjectId;
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

    const isFabHidden = isCreateModalOpen || !!selectedIssue;

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.types.length > 0) count++;
        if (filters.priorities.length > 0) count++;
        if (filters.assigneeId !== 'all') count++;
        return count;
    }, [filters]);

    const handleCreateIssue = () => {
        if (isMobile) {
            setCreateBottomSheetOpen(true);
        } else {
            setCreateModalOpen(true);
        }
    };

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
                                filters={filters}
                                setFilters={setFilters}
                                sorting={sorting}
                                setSorting={setSorting}
                                onFilterButtonClick={() => setFilterMenuOpen(true)}
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
                {!isFabHidden && (
                    <motion.div layoutId="fab-create-issue" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} className="absolute bottom-8 right-8 z-20">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCreateIssue} className="bg-primary-container text-on-primary-container rounded-m3-l h-14 w-14 flex items-center justify-center shadow-lg focus:outline-none" aria-label="Crea una nuova issue">
                            <Icons.Plus />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isMobile ? (
                <CreateIssueModal isOpen={isCreateModalOpen} layoutId="fab-create-issue" onClose={() => setCreateModalOpen(false)} currentUser={currentUser} />
            ) : (
                <BottomSheet isOpen={isCreateBottomSheetOpen} onClose={() => setCreateBottomSheetOpen(false)} title="Nuova Issue">
                    <CreateIssueModal isOpen={isCreateBottomSheetOpen} onClose={() => setCreateBottomSheetOpen(false)} currentUser={currentUser} isBottomSheet />
                </BottomSheet>
            )}

            <AnimatePresence>
                {selectedIssue && (
                    <IssueModal issue={selectedIssue} onClose={handleCloseModal} currentUser={currentUser} onArchive={handleArchiveRequest} isConfirmationOpen={isArchiveConfirmOpen} />
                )}
            </AnimatePresence>

            <ConfirmationModal isOpen={isArchiveConfirmOpen} onClose={() => setArchiveConfirmOpen(false)} onConfirm={executeArchive} title="Conferma Archiviazione">
                <p>Sei sicuro di voler archiviare l'issue <strong className="text-on-surface">{issueToArchive?.title}</strong>? Potrai ripristinarla dalla pagina Archivio.</p>
            </ConfirmationModal>

            {isMobile ? (
                <FilterBottomSheet isOpen={isBottomSheetOpen} onClose={() => setBottomSheetOpen(false)} currentFilters={filters} onFiltersChange={setFilters} currentSorting={sorting} onSortingChange={setSorting} />
            ) : (
                <FilterMenu isOpen={isFilterMenuOpen} onClose={() => setFilterMenuOpen(false)} anchorRef={filterButtonRef as React.RefObject<HTMLButtonElement>} currentFilters={filters} onFiltersChange={setFilters} />
            )}
        </LayoutGroup>
    );
};
