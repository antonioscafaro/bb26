import React, { useState, type ReactNode } from 'react';
import type { Issue, User } from '../../../types';
import { CommentSection } from './CommentSection';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { IssueModalSidebar } from './IssueModalSidebar';
import { ProtectedImage } from '../../common/ProtectedImage';
import api from '../../../api/axios';

/**
 * @typedef {Object} IssueModalBodyProps
 * @property {Issue} issue - L'oggetto issue da visualizzare.
 * @property {User} currentUser - L'utente attualmente loggato, per la sezione commenti.
 * @property {React.Dispatch<React.SetStateAction<Issue>>} setCurrentIssue - Funzione per aggiornare lo stato dell'issue.
 * @property {boolean} canEdit - Flag che indica se l'utente può modificare i dettagli.
 * @property {boolean} isAdmin - Flag che indica se l'utente è un amministratore.
 * @property {ReactNode} [children] - Eventuali elementi figli.
 */

/**
 * Componente che renderizza il corpo principale del modale di una Issue.
 * Include descrizione, allegati, commenti e una vista "accordion" dei dettagli per il mobile.
 * @param {IssueModalBodyProps} props - Le props del componente.
 */
export const IssueModalBody = ({ issue, currentUser, setCurrentIssue, canEdit, isAdmin, children, onClose }: {
    issue: Issue;
    currentUser: User;
    setCurrentIssue: React.Dispatch<React.SetStateAction<Issue>>;
    canEdit: boolean;
    isAdmin: boolean;
    children?: ReactNode;
    onClose?: () => void;
}) => {
    const [isDetailsOpen, setDetailsOpen] = useState(false);

    return (
        <div className="lg:w-2/3 overflow-y-auto px-6">
            {/* // Descrizione */}
            <h3 className="font-medium text-on-surface mb-2">Descrizione</h3>
            <p className="text-on-surface-variant whitespace-pre-wrap mb-6 text-sm">
                {issue.description}
            </p>

            {/* // Allegati */}
            {issue.attachments && issue.attachments.length > 0 && (
                <div className="mb-8">
                    <h3 className="font-medium text-on-surface mb-3">Allegati</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {issue.attachments.map((att) => (
                            <div key={att.id} className="relative group">
                                <a
                                    href={`http://localhost:8080/api/allegati/download/${att.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        api.get(`/allegati/download/${att.id}`, { responseType: 'blob' })
                                            .then(res => {
                                                const url = URL.createObjectURL(res.data);
                                                window.open(url, '_blank');
                                            })
                                            .catch(err => console.error("Error opening image", err));
                                    }}
                                >
                                    <ProtectedImage
                                        src={`/allegati/download/${att.id}`} // Relative path for api instance
                                        alt={att.nome_file}
                                        className="rounded-m3-l border border-outline-variant max-w-full h-auto max-h-96 object-contain cursor-pointer hover:shadow-lg transition-shadow"
                                    />
                                </a>
                                <p className="text-xs text-on-surface-variant mt-1">{att.nome_file}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* // Sezione Commenti */}
            <CommentSection
                comments={issue.comments || []}
                issueId={issue.id}
                currentUser={currentUser}
                isArchived={issue.status === 'archived'}
                isRejected={issue.status === 'rejected'}
            />

            {children}

            {/* // Dettagli a comparsa per Mobile */}
            <div className="lg:hidden mt-4 border-t border-outline-variant">
                <button
                    onClick={() => setDetailsOpen(!isDetailsOpen)}
                    className="w-full flex justify-between items-center py-4 text-left font-medium text-on-surface"
                >
                    Mostra Dettagli
                    <ChevronDown className={`transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                    {isDetailsOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pb-4">
                                <IssueModalSidebar
                                    issue={issue}
                                    canEdit={canEdit}
                                    isAdmin={isAdmin}
                                    setCurrentIssue={setCurrentIssue}
                                    isMobile
                                    onClose={onClose}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};