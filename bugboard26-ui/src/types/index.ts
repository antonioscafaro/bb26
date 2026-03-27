export type IssueStatus = 'todo' | 'inprogress' | 'inreview' | 'rejected' | 'done' | 'archived';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueType = 'bug' | 'feature' | 'documentation' | 'question';
export type UserRole = 'AMMINISTRATORE' | 'UTENTE';

export interface User {
  id: string;
  email: string;
  name: string;
  surname?: string;
  role?: UserRole;
  avatarUrl?: string;
}

export interface Mention {
  email: string;
  name: string;
  surname?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  timestamp: string;
  mentions?: Mention[];
}

export interface Attachment {
  id: number;
  idIssue: number;
  nome_file: string;
  tipo_file: string;
  data_caricamento: string;
}

export interface Label {
  nome: string;
  colore: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  type: IssueType;
  assignee?: User | null;
  reporter: User;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
  projectId: string;
  labels?: Label[];
  attachments?: Attachment[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  members: User[];
  createdAt?: string;
}

export type NotificationType = 'assignment' | 'mention' | 'project' | 'comment' | 'critical' | 'resolved';

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  date: string;
  recipientId: string;
  type?: NotificationType;
  issueId?: string;
}

export interface DragItem {
  id: string;
  status: IssueStatus;
  type: 'issue';
}

// --- BACKEND DTOs ---

export interface BackendUser {
  email: string;
  nome: string;
  cognome?: string;
  ruolo: string;
}

export interface BackendCommentAuthor {
  email?: string;
  nome: string;
  cognome?: string;
}

export interface BackendComment {
  id: number;
  testo: string;
  dataCreazione: string;
  autore: BackendCommentAuthor;
  idIssue?: number;
  menzionati?: BackendCommentAuthor[];
}

export interface BackendIssue {
  id: number;
  titolo: string;
  descrizione: string;
  statoIssue: string;
  prioritaIssue: string;
  tipoIssue: string;
  dataCreazione: string;
  dataUltimoAggiornamento: string;
  autore: BackendUser;
  assegnatario?: BackendUser;
  progetto?: { id: number; nome: string };
  commenti?: BackendComment[];
  allegati?: Attachment[];
  labels?: { nome: string; colore: string }[];
}

export interface BackendProject {
  id: number;
  nome: string;
  descrizione: string;
  data_creazione: string;
  creatore?: string | BackendUser;
}

export interface BackendNotification {
  id: number;
  testo: string;
  letto: boolean;
  dataCreazione: string;
  tipo_notifica: string;
  idIssue?: number;
}
