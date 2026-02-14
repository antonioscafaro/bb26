import type { Issue } from '../../../types';
import { motion } from 'framer-motion';
import { X, Archive, ArchiveRestore, RotateCcw } from 'lucide-react';

/**
 * @typedef {Object} IssueModalHeaderProps
 * @property {Issue} issue - L'oggetto issue da cui estrarre i dati per l'header.
 * @property {() => void} onClose - Callback per chiudere il modale.
 * @property {() => void} [onArchive] - Callback opzionale per l'azione di archiviazione.
 * @property {() => void} [onRestore] - Callback opzionale per l'azione di ripristino.
 * @property {() => void} [onReopen] - Callback opzionale per l'azione di riapertura.
 * @property {boolean} isAdmin - Flag che indica se l'utente corrente è un amministratore.
 */

/**
 * Componente per l'header del modale di una Issue.
 * Mostra titolo, reporter e pulsanti di azione.
 * @param {IssueModalHeaderProps} props - Le props del componente.
 */
export const IssueModalHeader = ({ issue, onClose, onArchive, onRestore, onReopen, isAdmin }: {
    issue: Issue;
    onClose: () => void;
    onArchive?: () => void;
    onRestore?: () => void;
    onReopen?: () => void;
    isAdmin: boolean;
}) => {
    const isArchived = issue.status === 'archived';
    const isRejected = issue.status === 'rejected';

    return (
        <div className="p-6 flex justify-between items-start flex-shrink-0">
            <div>
                <motion.h2 layoutId={`card-title-${issue.id}`} className="text-2xl font-medium text-on-surface">
                    {issue.title}
                </motion.h2>
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