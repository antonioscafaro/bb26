import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import type { Issue, User, UserRole } from '../../../types';
import api from '../../../api/axios';
import { useIssues } from '../../../context/IssueContext.shared';
import { priorityConfig } from '../../../config/uiConstants';
import { Toast } from '../../common/Toast';
import { ISSUE_STATUS } from '../../../constants';
import { TagInput } from '../../common/TagInput';
import { Icons } from '../../common/Icons';
import { Select } from '../../common/Select';
import { Calendar, Clock } from 'lucide-react';

interface IssueModalSidebarProps {
    issue: Issue;
    canEdit: boolean;
    isAdmin: boolean;
    isAssignee: boolean;
    setCurrentIssue: React.Dispatch<React.SetStateAction<Issue>>;
    onClose?: () => void;
    isMobile?: boolean;
    onStatusChangeStart?: () => void;
}

export const IssueModalSidebar: React.FC<IssueModalSidebarProps> = ({
    issue,
    canEdit,
    isAdmin,
    isAssignee,
    setCurrentIssue,
    onClose,
    isMobile = false,
    onStatusChangeStart
}) => {
    const { state, updateIssue: updateIssueApi } = useIssues();
    const [projectMembers, setProjectMembers] = useState<User[]>([]);

    // Local labels state for debounced updates
    const [localLabels, setLocalLabels] = useState<string[]>(issue.labels || []);
    const labelsRef = useRef(localLabels);
    const isFirstRender = useRef(true);

    useEffect(() => {
        const fetchMembers = async () => {
            if (!issue.projectId) return;
            try {
                const res = await api.get<Array<{ email: string; nome: string; cognome: string; ruolo: UserRole }>>(`/progetti/${issue.projectId}/membri`);
                const members: User[] = res.data.map((u) => ({
                    id: u.email,
                    email: u.email,
                    name: u.nome,
                    surname: u.cognome,
                    role: u.ruolo,
                    avatarUrl: `https://ui-avatars.com/api/?name=${u.nome}+${u.cognome}&background=random`
                }));
                setProjectMembers(members);
            } catch {
                console.error("Failed to fetch project members");
            }
        };
        fetchMembers();
    }, [issue.projectId]);

    // Update issue function with toast notifications
    const updateIssue = useCallback(async (field: string, value: string | User | null | string[] | number, successMessage: string, shouldClose = false) => {
        try {
            const updatedIssue = { ...issue, [field]: value };

            setCurrentIssue(updatedIssue);

            await updateIssueApi(issue.id, { [field]: value });

            Toast.success(successMessage);
            if (shouldClose && onClose) {
                setTimeout(() => onClose(), 300);
            }
        } catch {
            Toast.error('Errore durante l\'aggiornamento');
            setCurrentIssue(issue);
        }
    }, [issue, setCurrentIssue, updateIssueApi, onClose]);

    // Handle status change
    const handleStatusChange = (newStatus: string) => {
        if (onStatusChangeStart) onStatusChangeStart();
        const statusNames: Record<string, string> = {
            'todo': 'To Do',
            'inprogress': 'In Progress',
            'inreview': 'In Review',
            'rejected': 'Rifiutata',
            'done': 'Completata',
            'archived': 'Archiviata'
        };

        updateIssue(
            'status',
            newStatus,
            `Stato cambiato in "${statusNames[newStatus] || newStatus}"`,
            true
        );
    };

    // Handle assignee change
    const handleAssigneeChange = (userId: string) => {
        const newAssignee = userId ? state.users.find(u => u.id === userId) || null : null;
        const message = newAssignee
            ? `Issue assegnata a ${newAssignee.name}`
            : 'Issue non assegnata';

        updateIssue('assignee', newAssignee, message);
    };

    // Handle priority change
    const handlePriorityChange = (newPriority: string) => {
        const priorityName = priorityConfig[newPriority as keyof typeof priorityConfig]?.name || newPriority;
        updateIssue(
            'priority',
            newPriority,
            `Priorità cambiata in "${priorityName}"`
        );
    };

    // Sync local labels with issue prop when it changes (e.g., from SSE)
    useEffect(() => {
        setLocalLabels(issue.labels || []);
    }, [issue.labels]);

    // Keep ref in sync with local state
    useEffect(() => {
        labelsRef.current = localLabels;
    }, [localLabels]);

    // Debounced API call for labels
    useEffect(() => {
        // Skip first render to avoid unnecessary API call on mount
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            const currentLabels = labelsRef.current;
            const issueLabels = issue.labels || [];
            // Only call API if labels actually changed
            if (JSON.stringify(currentLabels) !== JSON.stringify(issueLabels)) {
                updateIssue('labels', currentLabels, 'Etichette aggiornate');
            }
        }, 800); // 800ms debounce

        return () => clearTimeout(timer);
    }, [localLabels, issue.labels, updateIssue]);

    // Handle labels change - now just updates local state
    const handleLabelsChange = (newLabels: string[]) => {
        setLocalLabels(newLabels);
    };

    // --- Render Logic ---
    const renderStatusOptions = () => {
        const options = [
            <option key="todo" value={ISSUE_STATUS.TODO}>To Do</option>,
            <option key="inprogress" value={ISSUE_STATUS.IN_PROGRESS}>In Progress</option>,
            <option key="inreview" value={ISSUE_STATUS.IN_REVIEW}>In Review</option>,
            <option key="rejected" value={ISSUE_STATUS.REJECTED}>Rejected</option>,
            <option key="done" value={ISSUE_STATUS.DONE}>Done</option>
        ];

        if (issue.status === 'archived') {
            options.push(<option key="archived" value="archived">Archived</option>);
        }

        // Admin can change to any status
        if (isAdmin) {
            return options;
        }

        // Assignee: limited transitions
        if (isAssignee) {
            return options.filter(opt => {
                const value = opt.key as string;

                const allowedTransitions: string[] = [
                    ISSUE_STATUS.TODO,
                    ISSUE_STATUS.IN_PROGRESS,
                    ISSUE_STATUS.IN_REVIEW
                ];

                if (issue.status === ISSUE_STATUS.REJECTED) {
                    return value === ISSUE_STATUS.REJECTED || value === ISSUE_STATUS.IN_PROGRESS;
                }

                return allowedTransitions.includes(value) || value === issue.status;
            });
        }

        // Author (not assignee): cannot change status per permission matrix
        // Other users: show current status only (read-only)
        return options.filter(opt => opt.key === issue.status);
    };

    // Status can be changed by admin or assignee, not by author-only
    const canEditStatus = canEdit && (isAdmin || isAssignee);

    const containerClasses = isMobile
        ? "space-y-6"
        : "hidden lg:flex lg:flex-col lg:w-1/3 bg-surface-variant/50 lg:rounded-l-m3-xl overflow-y-auto p-6 space-y-6";

    return (
        <div className={containerClasses}>
            {/* Status */}
            <div className="flex items-center gap-3">
                <Icons.Status />
                <div className="flex-1">
                    <h4 className="font-medium text-sm text-on-surface-variant mb-1">Stato</h4>
                    <Select
                        value={issue.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={!canEditStatus}
                        className="py-2"
                    >
                        {renderStatusOptions()}
                    </Select>
                </div>
            </div>

            {/* Assignee - only admin can change */}
            <div className="flex items-center gap-3">
                <Icons.Assignee />
                <div className="flex-1">
                    <h4 className="font-medium text-sm text-on-surface-variant mb-1">Assegnatario</h4>
                    <Select
                        value={issue.assignee?.id || ''}
                        onChange={(e) => handleAssigneeChange(e.target.value)}
                        disabled={!isAdmin}
                        className="py-2"
                    >
                        <option value="">Non assegnato</option>
                        {projectMembers.length > 0 ? projectMembers.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        )) : state.users.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </Select>
                </div>
            </div>

            {/* Priority */}
            <div className="flex items-center gap-3">
                <Icons.Priority />
                <div className="flex-1">
                    <h4 className="font-medium text-sm text-on-surface-variant mb-1">Priorità</h4>
                    <Select
                        value={issue.priority || 'low'}
                        onChange={(e) => handlePriorityChange(e.target.value)}
                        disabled={!canEdit}
                        className="py-2"
                    >
                        {Object.entries(priorityConfig).map(([key, value]) => (
                            <option key={key} value={key}>{value.name}</option>
                        ))}
                    </Select>
                </div>
            </div>

            {/* Labels */}
            <div className="flex items-start gap-3">
                <Icons.Labels className="mt-1" />
                <motion.div className="flex-1">
                    <h4 className="font-medium text-sm text-on-surface-variant mb-2">Etichette</h4>
                    {canEdit ? (
                        <TagInput
                            tags={localLabels}
                            setTags={handleLabelsChange}
                        />
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {(issue.labels || []).length > 0 ? (
                                (issue.labels || []).map(label => (
                                    <span
                                        key={label}
                                        className="text-sm font-medium bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-m3-sm border border-outline"
                                    >
                                        {label}
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm text-on-surface-variant italic">
                                    Nessuna etichetta
                                </span>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Dates */}
            <div className="border-t border-outline-variant pt-4 space-y-3">
                <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-on-surface-variant flex-shrink-0" />
                    <div>
                        <h4 className="font-medium text-xs text-on-surface-variant">Creato il</h4>
                        <p className="text-sm text-on-surface">
                            {issue.createdAt
                                ? new Date(issue.createdAt).toLocaleString('it-IT', {
                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })
                                : '—'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Clock size={18} className="text-on-surface-variant flex-shrink-0" />
                    <div>
                        <h4 className="font-medium text-xs text-on-surface-variant">Ultimo aggiornamento</h4>
                        <p className="text-sm text-on-surface">
                            {issue.updatedAt
                                ? new Date(issue.updatedAt).toLocaleString('it-IT', {
                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })
                                : '—'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};