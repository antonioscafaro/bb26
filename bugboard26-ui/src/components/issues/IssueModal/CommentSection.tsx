import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Comment as CommentType, User } from '../../../types';
import { useIssues } from '../../../context/IssueContext.shared';
import { Toast } from '../../common/Toast';
import { Button } from '../../common/Button';

interface CommentSectionProps {
    comments: CommentType[];
    issueId: string;
    currentUser: User;
    isArchived: boolean;
    isRejected: boolean;
}

/**
 * Comment section component for issue modal
 * Handles comment display and submission with toast notifications
 */
export const CommentSection: React.FC<CommentSectionProps> = ({
    comments,
    issueId,
    currentUser,
    isArchived,
    isRejected
}) => {
    const { addComment } = useIssues();
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();

        const content = newComment.trim();
        if (!content || isSubmitting) return;

        setIsSubmitting(true);

        try {
            const commentData = {
                content,
                author: currentUser
            };

            // Add comment to issue
            await addComment(issueId, commentData);

            // Clear form and show success
            setNewComment('');
            Toast.success('Commento aggiunto con successo!');

        } catch {
            Toast.error('Errore durante l\'invio del commento');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    /**
     * Renders comment content with styled mentions.
     * Uses the mentions data provided by the backend (no frontend parsing logic).
     * @email patterns in text are matched to the backend-resolved mentions array.
     */
    const renderCommentContent = (content: string, mentions?: CommentType['mentions']) => {
        if (!mentions || mentions.length === 0) return content;

        // Build a lookup map from email -> display name using backend data
        const mentionMap = new Map<string, string>();
        for (const m of mentions) {
            const displayName = [m.name, m.surname].filter(Boolean).join(' ') || m.email;
            mentionMap.set(m.email, displayName);
        }

        // Match @email patterns in the text to locate where to render mention spans
        const regex = /\B@([\w.+%-]+@[\w.-]+\.[a-zA-Z]{2,})/g;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(content)) !== null) {
            // Text before this mention
            if (match.index > lastIndex) {
                parts.push(content.slice(lastIndex, match.index));
            }

            const email = match[1];
            const displayName = mentionMap.get(email);

            if (displayName) {
                // Render known mention as blue styled text
                parts.push(
                    <span
                        key={`mention-${match.index}`}
                        role="button"
                        tabIndex={0}
                        title={`Clicca per copiare: ${email}`}
                        style={{
                            color: '#3b82f6',
                            cursor: 'pointer',
                            fontWeight: 500,
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(email).then(() => {
                                Toast.success('Email copiata negli appunti!');
                            });
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                navigator.clipboard.writeText(email).then(() => {
                                    Toast.success('Email copiata negli appunti!');
                                });
                            }
                        }}
                    >
                        {displayName}
                    </span>
                );
            } else {
                // Email not resolved by backend — keep original text
                parts.push(match[0]);
            }

            lastIndex = regex.lastIndex;
        }

        // Remaining text after last mention
        if (lastIndex < content.length) {
            parts.push(content.slice(lastIndex));
        }

        return parts.length > 0 ? parts : content;
    };

    return (
        <>
            <h3 className="font-medium text-on-surface mb-4">
                Commenti ({comments.length})
            </h3>

            <div className="space-y-4 mb-8">
                <AnimatePresence mode="popLayout" initial={false}>
                    {comments.length > 0 ? (
                        comments.map(comment => (
                            <motion.div
                                key={comment.id}
                                layout
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="flex items-start space-x-3 p-3 bg-surface-variant/30 rounded-lg"
                            >
                                <img
                                    src={comment.author.avatarUrl}
                                    alt={comment.author.name}
                                    width={36}
                                    height={36}
                                    className="w-9 h-9 rounded-full flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-medium text-sm text-on-surface truncate">
                                            {comment.author.name}
                                        </p>
                                        <span className="text-xs text-on-surface-variant">
                                            {formatDate(comment.timestamp)}
                                        </span>
                                    </div>
                                    <p className="text-on-surface-variant text-sm whitespace-pre-wrap break-words">
                                        {renderCommentContent(comment.content, comment.mentions)}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-8 text-on-surface-variant"
                        >
                            <p className="text-sm">Nessun commento ancora.</p>
                            <p className="text-xs mt-1">Sii il primo a commentare questa issue!</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Comment Form */}
            {!isArchived && !isRejected && (
                <form onSubmit={handleSubmitComment} className="mt-6 pb-6">
                    <div className="flex items-start space-x-3">
                        <img
                            src={currentUser.avatarUrl}
                            alt={currentUser.name}
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full border border-outline bg-surface rounded-m3-sm focus:ring-2 focus:ring-primary focus:border-primary transition text-on-surface placeholder-on-surface-variant px-4 py-3 resize-none"
                                placeholder="Aggiungi un commento..."
                                rows={3}
                                disabled={isSubmitting}
                                maxLength={1000}
                            />
                            <div className="flex items-center justify-between mt-3">
                                <span className={`text-xs ${newComment.length > 900 ? 'text-error' : 'text-on-surface-variant'
                                    }`}>
                                    {newComment.length}/1000
                                </span>
                                <Button
                                    variant="filled"
                                    type="submit"
                                    disabled={!newComment.trim() || isSubmitting}
                                    className="ml-3"
                                >
                                    {isSubmitting ? 'Invio...' : 'Invia Commento'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            )}
        </>
    );
};