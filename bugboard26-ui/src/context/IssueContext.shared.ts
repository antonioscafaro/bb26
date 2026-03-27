import { createContext, useContext } from 'react';
import type { Issue, User, Comment, Notification } from '../types';

// --- TIPI PER IL CONTEXT ---

export type ActionType =
    | { type: 'SET_ISSUES'; payload: Issue[] }
    | { type: 'SET_USERS'; payload: User[] }
    | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
    | { type: 'ADD_ISSUE'; payload: Issue }
    | { type: 'UPDATE_ISSUE'; payload: Issue }
    | { type: 'ADD_COMMENT'; payload: { issueId: string; comment: Comment } }
    | { type: 'ADD_USER'; payload: User }
    | { type: 'UPDATE_USER'; payload: User }
    | { type: 'DELETE_USER'; payload: { userId: string } }
    | { type: 'MARK_NOTIFICATION_AS_READ'; payload: { notificationId: string } };

export type IssueState = {
    issues: Issue[];
    users: User[];
    notifications: Notification[];
};

export type IssueContextType = {
    state: IssueState;
    dispatch: React.Dispatch<ActionType>;
    loading: boolean;
    createIssue: (issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'comments'>, file?: File) => Promise<void>;
    updateIssue: (issueId: string, issueData: Partial<Issue>) => Promise<void>;
    archiveIssue: (issueId: string) => Promise<void>;
    addComment: (issueId: string, commentData: Omit<Comment, 'id' | 'timestamp'>) => Promise<void>;
    createUser: (userData: Omit<User, 'id'> & { password?: string }) => Promise<void>;
    updateUser: (userId: string, userData: Partial<User>) => Promise<void>;
    deleteUser: (userId: string, currentUserEmail: string) => Promise<void>;
    markNotificationAsRead: (notificationId: string) => Promise<void>;
    markAllNotificationsAsRead: () => Promise<void>;
    fetchNotifications: () => Promise<void>;
};

export const IssueContext = createContext<IssueContextType | undefined>(undefined);

export const useIssues = (): IssueContextType => {
    const context = useContext(IssueContext);
    if (!context) {
        throw new Error('useIssues deve essere usato all\'interno di un IssueProvider');
    }
    return context;
};
