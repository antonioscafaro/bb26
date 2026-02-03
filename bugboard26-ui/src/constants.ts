import type { IssueStatus, IssuePriority, IssueType } from './types';

export const ISSUE_STATUS: Record<string, IssueStatus> = {
    TODO: 'todo',
    IN_PROGRESS: 'inprogress',
    IN_REVIEW: 'inreview',
    REJECTED: 'rejected',
    DONE: 'done',
    ARCHIVED: 'archived',
} as const;

export const ISSUE_PRIORITY: Record<string, IssuePriority> = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
} as const;

export const ISSUE_TYPE: Record<string, IssueType> = {
    BUG: 'bug',
    FEATURE: 'feature',
    DOCUMENTATION: 'documentation',
    QUESTION: 'question',
} as const;

export const USER_ROLE = {
    ADMIN: 'AMMINISTRATORE',
    NORMAL: 'UTENTE',
} as const;