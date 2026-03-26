import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Comment as CommentType, User, UserRole } from '../../../types';
import { useIssues } from '../../../context/IssueContext.shared';
import { Toast } from '../../common/Toast';
import { Button } from '../../common/Button';
import api from '../../../api/axios';

interface CommentSectionProps {
    comments: CommentType[];
    issueId: string;
    projectId: string;
    currentUser: User;
    isArchived: boolean;
    isRejected: boolean;
    isDone: boolean;
}

/**
 * Comment section component for issue modal
 * Handles comment display, submission, and @mention autocomplete
 */
export const CommentSection: React.FC<CommentSectionProps> = ({
    comments,
    issueId,
    projectId,
    currentUser,
    isArchived,
    isRejected,
    isDone
}) => {
    const { addComment } = useIssues();
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mention autocomplete state
    const [projectMembers, setProjectMembers] = useState<User[]>([]);
    const [showMentionDropdown, setShowMentionDropdown] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionStartIndex, setMentionStartIndex] = useState(-1);
    const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch project members for mention autocomplete
    useEffect(() => {
        if (!projectId) return;
        const fetchMembers = async () => {
            try {
                const res = await api.get<Array<{ email: string; nome: string; cognome: string; ruolo: UserRole }>>(`/progetti/${projectId}/membri`);
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
                console.error("Failed to fetch project members for mentions");
            }
        };
        fetchMembers();
    }, [projectId]);

    // Filter members based on current mention query
    const filteredMembers = projectMembers.filter(member => {
        if (!mentionQuery) return true;
        const query = mentionQuery.toLowerCase();
        return (
            member.name.toLowerCase().includes(query) ||
            (member.surname?.toLowerCase().includes(query)) ||
            member.email.toLowerCase().includes(query) ||
            `${member.name} ${member.surname}`.toLowerCase().includes(query)
        );
    });

    // Handle textarea input changes for mention detection
    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const cursorPos = e.target.selectionStart;
        setNewComment(value);

        // Look backwards from cursor to find a @ trigger
        const textBeforeCursor = value.slice(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');

        if (lastAtIndex !== -1) {
            // Check that the @ is at start of word (preceded by space, newline, or is at position 0)
            const charBefore = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
            if (charBefore === ' ' || charBefore === '\n' || lastAtIndex === 0) {
                const query = textBeforeCursor.slice(lastAtIndex + 1);
                // Don't show dropdown if there's a space in the query (mention already completed or typing normally)
                if (!query.includes(' ') || query.includes('@')) {
                    setMentionStartIndex(lastAtIndex);
                    setMentionQuery(query);
                    setShowMentionDropdown(true);
                    setSelectedMentionIndex(0);
                    return;
                }
            }
        }

        setShowMentionDropdown(false);
        setMentionQuery('');
        setMentionStartIndex(-1);
    };

    // Insert selected mention into the textarea
    const insertMention = (member: User) => {
        const before = newComment.slice(0, mentionStartIndex);
        const after = newComment.slice(mentionStartIndex + 1 + mentionQuery.length);
        const mentionText = `@${member.email}`;
        const updatedComment = `${before}${mentionText} ${after}`;

        setNewComment(updatedComment);
        setShowMentionDropdown(false);
        setMentionQuery('');
        setMentionStartIndex(-1);

        // Refocus textarea and set cursor after the mention
        setTimeout(() => {
            if (textareaRef.current) {
                const newCursorPos = before.length + mentionText.length + 1;
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    // Handle keyboard navigation in mention dropdown
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!showMentionDropdown || filteredMembers.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedMentionIndex(prev =>
                prev < filteredMembers.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedMentionIndex(prev =>
                prev > 0 ? prev - 1 : filteredMembers.length - 1
            );
        } else if (e.key === 'Enter' && showMentionDropdown) {
            e.preventDefault();
            insertMention(filteredMembers[selectedMentionIndex]);
        } else if (e.key === 'Escape') {
            setShowMentionDropdown(false);
        }
    };

    // Scroll selected item into view
    useEffect(() => {
        if (showMentionDropdown && dropdownRef.current) {
            const selected = dropdownRef.current.children[selectedMentionIndex] as HTMLElement;
            if (selected) {
                selected.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedMentionIndex, showMentionDropdown]);

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

            await addComment(issueId, commentData);

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
            if (match.index > lastIndex) {
                parts.push(content.slice(lastIndex, match.index));
            }

            const email = match[1];
            const displayName = mentionMap.get(email);

            if (displayName) {
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
                parts.push(match[0]);
            }

            lastIndex = regex.lastIndex;
        }

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
            {!isArchived && !isRejected && !isDone && (
                <form onSubmit={handleSubmitComment} className="mt-6 pb-6">
                    <div className="flex items-start space-x-3">
                        <img
                            src={currentUser.avatarUrl}
                            alt={currentUser.name}
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1 relative">
                            <textarea
                                ref={textareaRef}
                                value={newComment}
                                onChange={handleCommentChange}
                                onKeyDown={handleKeyDown}
                                className="w-full border border-outline bg-surface rounded-m3-sm focus:ring-2 focus:ring-primary focus:border-primary transition text-on-surface placeholder-on-surface-variant px-4 py-3 resize-none"
                                placeholder="Aggiungi un commento... (usa @ per menzionare)"
                                rows={3}
                                disabled={isSubmitting}
                                maxLength={1000}
                            />

                            {/* Mention Autocomplete Dropdown */}
                            <AnimatePresence>
                                {showMentionDropdown && filteredMembers.length > 0 && (
                                    <motion.div
                                        ref={dropdownRef}
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute bottom-full left-0 right-0 mb-1 bg-surface border border-outline rounded-m3-sm shadow-lg max-h-48 overflow-y-auto z-50"
                                    >
                                        {filteredMembers.map((member, index) => (
                                            <button
                                                key={member.id}
                                                type="button"
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                                                    index === selectedMentionIndex
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'hover:bg-surface-variant/50 text-on-surface'
                                                }`}
                                                onClick={() => insertMention(member)}
                                                onMouseEnter={() => setSelectedMentionIndex(index)}
                                            >
                                                <img
                                                    src={member.avatarUrl}
                                                    alt={member.name}
                                                    className="w-7 h-7 rounded-full flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {member.name} {member.surname}
                                                    </p>
                                                    <p className="text-xs text-on-surface-variant truncate">
                                                        {member.email}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

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