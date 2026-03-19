import type { IssueStatus, IssuePriority, IssueType, UserRole, BackendIssue, Issue, BackendUser, User, BackendComment, Comment, BackendNotification, Notification, NotificationType } from '../types';

export const mapStatusToBackend = (status: IssueStatus): string => {
    switch (status) {
        case 'todo': return 'TODO';
        case 'inprogress': return 'IN_LAVORAZIONE';
        case 'inreview': return 'IN_REVISIONE';
        case 'done': return 'RISOLTA';
        case 'rejected': return 'CHIUSA';
        case 'archived': return 'ARCHIVIATA';
        default: return 'TODO';
    }
};

export const mapStatusFromBackend = (status: string): IssueStatus => {
    switch (status) {
        case 'TODO': return 'todo';
        case 'IN_LAVORAZIONE': return 'inprogress';
        case 'IN_REVISIONE': return 'inreview';
        case 'RISOLTA': return 'done';
        case 'CHIUSA': return 'rejected';
        case 'ARCHIVIATA': return 'archived';
        default: return 'todo';
    }
};

export const mapPriorityToBackend = (priority: IssuePriority): string => {
    switch (priority) {
        case 'low': return 'BASSA';
        case 'medium': return 'MEDIA';
        case 'high': return 'ALTA';
        case 'critical': return 'CRITICA';
        default: return 'BASSA';
    }
};

export const mapPriorityFromBackend = (priority: string): IssuePriority => {
    switch (priority) {
        case 'NESSUNA': return 'low';
        case 'BASSA': return 'low';
        case 'MEDIA': return 'medium';
        case 'ALTA': return 'high';
        case 'CRITICA': return 'critical';
        default: return 'low';
    }
};

export const mapTypeToBackend = (type: IssueType): string => {
    switch (type) {
        case 'bug': return 'BUG';
        case 'feature': return 'FEATURE';
        case 'question': return 'QUESTION';
        case 'documentation': return 'DOCUMENTATION';
        default: return 'BUG';
    }
};

export const mapTypeFromBackend = (type: string): IssueType => {
    switch (type) {
        case 'BUG': return 'bug';
        case 'FEATURE': return 'feature';
        case 'QUESTION': return 'question';
        case 'DOCUMENTATION': return 'documentation';
        default: return 'bug';
    }
};

export const mapRoleFromBackend = (role: string): UserRole => {
    return role === 'AMMINISTRATORE' ? 'AMMINISTRATORE' : 'UTENTE';
};

export const mapRoleToBackend = (role: UserRole): string => {
    return role === 'AMMINISTRATORE' ? 'AMMINISTRATORE' : 'UTENTE';
};

// --- Object Mappers ---

export const mapBackendUserToUser = (u: BackendUser): User => ({
    id: u.email,
    email: u.email,
    name: u.nome,
    surname: u.cognome,
    role: mapRoleFromBackend(u.ruolo),
    avatarUrl: `https://ui-avatars.com/api/?name=${u.nome}+${u.cognome}&background=random`
});

export const mapBackendCommentToComment = (c: BackendComment): Comment => ({
    id: c.id.toString(),
    content: c.testo || 'No content',
    timestamp: c.dataCreazione || new Date().toISOString(),
    author: {
        id: c.autore?.email || 'unknown',
        email: c.autore?.email || 'unknown',
        name: c.autore?.nome || 'Unknown',
        surname: c.autore?.cognome || '',
        role: 'UTENTE',
        avatarUrl: `https://ui-avatars.com/api/?name=${c.autore?.nome || '?'}+${c.autore?.cognome || '?'}&background=random`
    }
});

export const mapBackendIssueToIssue = (i: BackendIssue): Issue => ({
    id: i.id.toString(),
    title: i.titolo || 'Untitled',
    description: i.descrizione || '',
    status: mapStatusFromBackend(i.statoIssue),
    priority: mapPriorityFromBackend(i.prioritaIssue),
    type: mapTypeFromBackend(i.tipoIssue),
    createdAt: i.dataCreazione,
    updatedAt: i.dataUltimoAggiornamento,
    reporter: i.autore ? mapBackendUserToUser(i.autore) : {
        id: 'unknown',
        email: 'unknown',
        name: 'Unknown',
        role: 'UTENTE',
        avatarUrl: ''
    },
    assignee: i.assegnatario ? mapBackendUserToUser(i.assegnatario) : undefined,
    projectId: i.progetto ? i.progetto.id.toString() : '',
    comments: i.commenti ? i.commenti.map(mapBackendCommentToComment) : [],
    labels: i.labels || [],
    attachments: i.allegati || []
});

const mapNotificationType = (tipo: string): NotificationType => {
    switch (tipo) {
        case 'ASSEGNATA': return 'assignment';
        case 'PROGETTO': return 'project';
        case 'MENZIONE': return 'mention';
        case 'COMMENTO': return 'comment';
        case 'CRITICA': return 'critical';
        case 'RISOLTA': return 'resolved';
        default: return 'mention';
    }
};

export const mapBackendNotificationToNotification = (n: BackendNotification, currentUserId: string): Notification => ({
    id: n.id?.toString() || Math.random().toString(),
    message: n.testo || 'No content',
    date: n.dataCreazione ? new Date(n.dataCreazione).toISOString() : new Date().toISOString(),
    isRead: !!n.letto,
    type: mapNotificationType(n.tipo_notifica),
    issueId: n.idIssue ? n.idIssue.toString() : undefined,
    recipientId: currentUserId
});
