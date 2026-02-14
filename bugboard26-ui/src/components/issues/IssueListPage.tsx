// src/components/issues/IssueListPage.tsx
import { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import type { Issue, User } from '../../types';
import { USER_ROLE } from '../../constants';
import { IssueModal } from './IssueModal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { EmptyState } from '../common/EmptyState';

/**
 * @typedef {Object} IssueListPageProps
 * @property {Issue[]} issues
 * @property {User} currentUser
 * @property {(props: { issue: Issue; onClick: () => void; isOpen: boolean; onActionClick: (e: React.MouseEvent) => void; isAdmin: boolean; }) => React.ReactNode} renderIssueCard
 * @property {(id: string) => void} onConfirmAction
 * @property {string} confirmModalTitle
 * @property {(title: string) => React.ReactNode} confirmModalBody
 * @property {string} emptyStateTitle
 * @property {string} emptyStateSubtitle
 */

/**
 * Componente riutilizzabile per pagine che mostrano una lista di issue.
 * Gestisce la selezione, i modali e gli stati vuoti.
 * @param {IssueListPageProps} props
 */
export const IssueListPage = ({
    issues,
    currentUser,
    renderIssueCard,
    confirmModalTitle,
    confirmModalBody,
    onConfirmAction,
    emptyStateTitle,
    emptyStateSubtitle,
}: {
    issues: Issue[];
    currentUser: User;
    onMenuClick: () => void;
    renderIssueCard: (props: {
        issue: Issue;
        onClick: () => void;
        isOpen: boolean;
        onActionClick: (e: React.MouseEvent) => void;
        isAdmin: boolean;
    }) => React.ReactNode;
    confirmModalTitle: string;
    confirmModalBody: (issueTitle: string) => React.ReactNode;
    onConfirmAction: (issueId: string) => void;
    emptyStateTitle: string;
    emptyStateSubtitle: string;
}) => {
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [issueForConfirmation, setIssueForConfirmation] = useState<Issue | null>(null);
    const isAdmin = currentUser.role === USER_ROLE.ADMIN;

    const handleCardClick = (issue: Issue) => setSelectedIssue(issue);

    const handleActionClick = (issueToConfirm: Issue) => {
        setIssueForConfirmation(issueToConfirm);
        setConfirmOpen(true);
    };

    const executeAction = () => {
        if (!issueForConfirmation) return;
        const issueIdToAction = issueForConfirmation.id;
        setConfirmOpen(false);

        const performUpdate = () => {
            onConfirmAction(issueIdToAction);
            setIssueForConfirmation(null);
        };

        if (selectedIssue?.id === issueIdToAction) {
            setSelectedIssue(null);
            setTimeout(performUpdate, 300);
        } else {
            performUpdate();
        }
    };

    return (
        <>
            <LayoutGroup>
                <motion.div
                    variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                    initial="hidden"
                    animate="visible"
                    className="p-4 sm:p-6 flex-grow overflow-y-auto"
                >
                    {issues.length > 0 ? (
                        <div className="flex flex-wrap -m-2">
                            <AnimatePresence mode="popLayout">
                                {issues.map(issue => (
                                    <motion.div
                                        key={issue.id}
                                        variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                                        layout
                                        className="w-full md:w-1/2 lg:w-1/3 p-2"
                                    >
                                        {renderIssueCard({
                                            issue,
                                            onClick: () => handleCardClick(issue),
                                            isOpen: selectedIssue?.id === issue.id,
                                            onActionClick: (e) => { e.stopPropagation(); handleActionClick(issue); },
                                            isAdmin,
                                        })}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <EmptyState title={emptyStateTitle} subtitle={emptyStateSubtitle} />
                    )}
                </motion.div>

                <AnimatePresence>
                    {selectedIssue && (
                        <IssueModal
                            key={selectedIssue.id}
                            issue={selectedIssue}
                            onClose={() => setSelectedIssue(null)}
                            currentUser={currentUser}
                            isConfirmationOpen={isConfirmOpen}
                            onRestore={() => handleActionClick(selectedIssue)}
                            onReopen={() => handleActionClick(selectedIssue)}
                        />
                    )}
                </AnimatePresence>
            </LayoutGroup>

            <ConfirmationModal isOpen={isConfirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={executeAction} title={confirmModalTitle}>
                {confirmModalBody(issueForConfirmation?.title || '')}
            </ConfirmationModal>
        </>
    );
};