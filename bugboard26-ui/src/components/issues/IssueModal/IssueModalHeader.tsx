import React, { useState, useEffect, useRef } from 'react';
import type { Issue } from '../../../types';
import { motion } from 'framer-motion';
import { X, Archive, ArchiveRestore, RotateCcw } from 'lucide-react';
import { useIssues } from '../../../context/IssueContext.shared';
import { Toast } from '../../common/Toast';

/**
 * Componente per l'header del modale di una Issue.
 * Mostra titolo (editabile per admin/autore), reporter e pulsanti di azione.
 */
export const IssueModalHeader = ({ issue, onClose, onArchive, onRestore, onReopen, isAdmin, canEditTitle, setCurrentIssue }: {
    issue: Issue;
    onClose: () => void;
    onArchive?: () => void;
    onRestore?: () => void;
    onReopen?: () => void;
    isAdmin: boolean;
    canEditTitle: boolean;
    setCurrentIssue: React.Dispatch<React.SetStateAction<Issue>>;
}) => {
    const isArchived = issue.status === 'archived';
    const isRejected = issue.status === 'rejected';
    const { updateIssue: updateIssueApi } = useIssues();

    // Editable title state with debounce
    const [localTitle, setLocalTitle] = useState(issue.title);
    const titleRef = useRef(localTitle);
    const isFirstRender = useRef(true);

    // Sync local title with issue prop when it changes (e.g., from SSE)
    useEffect(() => {
        setLocalTitle(issue.title);
    }, [issue.title]);

    useEffect(() => {
        titleRef.current = localTitle;
    }, [localTitle]);

    // Debounced API call for title
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            const currentTitle = titleRef.current;
            if (currentTitle !== issue.title && currentTitle.trim() !== '') {
                updateIssueApi(issue.id, { title: currentTitle })
                    .then(() => {
                        setCurrentIssue(prev => ({ ...prev, title: currentTitle }));
                        Toast.success('Titolo aggiornato');
                    })
                    .catch(() => {
                        Toast.error('Errore durante l\'aggiornamento del titolo');
                        setLocalTitle(issue.title);
                    });
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [localTitle, issue.title, issue.id, updateIssueApi, setCurrentIssue]);

    return (
        <div className="p-6 flex justify-between items-start flex-shrink-0">
            <div className="flex-1 min-w-0 mr-4">
                {canEditTitle ? (
                    <motion.input
                        value={localTitle}
                        onChange={(e) => setLocalTitle(e.target.value)}
                        className="text-2xl font-medium text-on-surface bg-transparent border-b-2 border-transparent focus:border-primary focus:outline-none transition w-full"
                        placeholder="Titolo issue..."
                    />
                ) : (
                    <motion.h2 className="text-2xl font-medium text-on-surface">
                        {issue.title}
                    </motion.h2>
                )}
                <p className="text-sm text-on-surface-variant mt-1">
                    Segnalato da <span className="font-medium">{issue.reporter.name}</span>
                </p>
            </div>
            <div className="flex items-center gap-2">
                {/* // Pulsanti di Azione Condizionali */}
                {isAdmin && !isArchived && !isRejected && onArchive && (
                    <button onClick={onArchive} className="text-on-surface-variant hover:bg-surface-variant rounded-full p-2" aria-label="Archivia issue">
                        <Archive size={24} />
                    </button>
                )}
                {isAdmin && isArchived && onRestore && (
                    <button onClick={onRestore} className="text-on-surface-variant hover:bg-surface-variant rounded-full p-2" aria-label="Ripristina issue">
                        <ArchiveRestore size={24} />
                    </button>
                )}
                {isAdmin && isRejected && onReopen && (
                    <button onClick={onReopen} className="text-on-surface-variant hover:bg-surface-variant rounded-full p-2" aria-label="Riapri issue">
                        <RotateCcw size={24} />
                    </button>
                )}
                <button onClick={onClose} className="text-on-surface-variant hover:bg-surface-variant rounded-full p-2" aria-label="Chiudi modale">
                    <X size={24} />
                </button>
            </div>
        </div>
    );
};