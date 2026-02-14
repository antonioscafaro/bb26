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
                                        {comment.content}
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