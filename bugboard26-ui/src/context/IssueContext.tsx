import React, { useReducer, type ReactNode, useEffect, useState, useCallback } from 'react';
import { IssueContext, type ActionType, type IssueState } from './IssueContext.shared';
import type { Issue, User, Comment, Notification, BackendIssue, BackendUser, BackendNotification } from '../types';
import api from '../api/axios';
import { useAuth } from './AuthContext.shared';
import {
  mapStatusToBackend, mapStatusFromBackend,
  mapPriorityToBackend, mapPriorityFromBackend,
  mapTypeToBackend, mapTypeFromBackend,
  mapRoleToBackend, mapRoleFromBackend
} from '../utils/mappers';




// --- REDUCER ---

const issueReducer = (state: IssueState, action: ActionType): IssueState => {
  switch (action.type) {
    case 'SET_ISSUES':
      return { ...state, issues: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'ADD_ISSUE':
      return { ...state, issues: [...state.issues, action.payload] };
    case 'UPDATE_ISSUE':
      return {
        ...state,
        issues: state.issues.map((issue) =>
          issue.id === action.payload.id ? action.payload : issue
        ),
      };
    case 'ADD_COMMENT':
      return {
        ...state,
        issues: state.issues.map((issue) =>
          issue.id === action.payload.issueId
            ? { ...issue, comments: [...(issue.comments || []), action.payload.comment] }
            : issue
        ),
      };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        ),
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload.userId),
      };
    case 'MARK_NOTIFICATION_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload.notificationId ? { ...n, isRead: true } : n
        ),
      };
    default:
      return state;
  }
};

// --- CONTEXT E PROVIDER ---



type IssueProviderProps = {
  children: ReactNode;
};

const initialState: IssueState = {
  issues: [],
  users: [],
  notifications: [],
};

export const IssueProvider = ({ children }: IssueProviderProps): React.ReactElement => {
  const [state, dispatch] = useReducer(issueReducer, initialState);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth(); // Access currentUser from AuthContext

  const fetchNotifications = useCallback(async () => {
    if (!currentUser?.email) return;
    try {
      const res = await api.get<BackendNotification[]>(`/notifiche/destinatario/${currentUser.email}`);
      console.log("Raw Notifications:", res.data);
      const mappedNotifications: Notification[] = res.data.map((n) => ({
        id: n.id?.toString() || Math.random().toString(),
        message: n.testo || 'No content',
        date: n.dataCreazione ? new Date(n.dataCreazione).toISOString() : new Date().toISOString(),
        isRead: !!n.letto,
        type: n.tipo_notifica === 'ASSEGNATA' ? 'assignment' : (n.tipo_notifica === 'PROGETTO' ? 'project' : 'mention'),
        issueId: n.idIssue ? n.idIssue.toString() : undefined,
        recipientId: currentUser.id // Added explicit recipientId to match type
      }));
      dispatch({ type: 'SET_NOTIFICATIONS', payload: mappedNotifications });
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  }, [currentUser]);


  const fetchAllData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [usersRes] = await Promise.all([
        api.get<BackendUser[]>('/utenti')
      ]);

      // Fetch all issues by iterating statuses
      const statuses = ['TODO', 'IN_LAVORAZIONE', 'IN_REVISIONE', 'RISOLTA', 'CHIUSA', 'ARCHIVIATA'];
      const issuePromises = statuses.map(status => api.get<BackendIssue[]>(`/issues/stato/${status}`));
      const issuesResponses = await Promise.all(issuePromises);
      const allIssues = issuesResponses.flatMap(res => res.data);

      console.log("Raw Issues Data:", allIssues);

      const mappedIssues: Issue[] = allIssues
        .filter((i) => i && i.id && i.titolo && i.autore) // Filter out clearly broken records
        .map((i) => ({
          id: i.id.toString(),
          title: i.titolo || 'Untitled',
          description: i.descrizione || '',
          status: mapStatusFromBackend(i.statoIssue),
          priority: mapPriorityFromBackend(i.prioritaIssue),
          type: mapTypeFromBackend(i.tipoIssue),
          createdAt: i.dataCreazione,
          updatedAt: i.dataUltimoAggiornamento,
          reporter: {
            id: i.autore?.email || 'unknown',
            email: i.autore?.email || 'unknown',
            name: i.autore?.nome || 'Unknown',
            surname: i.autore?.cognome || '',
            role: mapRoleFromBackend(i.autore?.ruolo),
            avatarUrl: `https://ui-avatars.com/api/?name=${i.autore?.nome || '?'}+${i.autore?.cognome || '?'}&background=random`
          },
          assignee: i.assegnatario ? {
            id: i.assegnatario.email,
            email: i.assegnatario.email,
            name: i.assegnatario.nome,
            surname: i.assegnatario.cognome,
            role: mapRoleFromBackend(i.assegnatario.ruolo),
            avatarUrl: `https://ui-avatars.com/api/?name=${i.assegnatario.nome}+${i.assegnatario.cognome}&background=random`
          } : undefined,
          projectId: i.progetto ? i.progetto.id.toString() : '',
          comments: i.commenti ? i.commenti.map((c) => ({
            id: c.id.toString(),
            content: c.testo || 'No content',
            timestamp: c.data_creazione || new Date().toISOString(),
            author: {
              id: 'unknown',
              email: 'unknown',
              name: c.autore?.nome || 'Unknown',
              surname: c.autore?.cognome || '',
              role: 'UTENTE',
              avatarUrl: `https://ui-avatars.com/api/?name=${c.autore?.nome || '?'}+${c.autore?.cognome || '?'}&background=random`
            }
          })) : [],
          labels: i.labels || [],
          attachments: i.allegati || []
        }));

      const mappedUsers: User[] = usersRes.data.map((u) => ({
        id: u.email,
        email: u.email,
        name: u.nome,
        surname: u.cognome,
        role: mapRoleFromBackend(u.ruolo),
        avatarUrl: `https://ui-avatars.com/api/?name=${u.nome}+${u.cognome}&background=random`
      }));

      dispatch({ type: 'SET_ISSUES', payload: mappedIssues });
      dispatch({ type: 'SET_USERS', payload: mappedUsers });

      // Fetch notifications if user is logged in
      if (currentUser) {
        await fetchNotifications();
      }

    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, fetchNotifications]);

  useEffect(() => {
    // Re-fetch when currentUser changes (e.g. login)
    if (currentUser) {
      fetchAllData();

      const handleNotificationUpdate = () => {
        console.log("Context: Refreshing notifications due to SSE event");
        fetchNotifications();
      };

      const handleIssueUpdate = () => {
        console.log("Context: Refreshing issues due to SSE event");
        fetchAllData(false); // Silent update
      };

      window.addEventListener('notification-update', handleNotificationUpdate);
      window.addEventListener('issue-update', handleIssueUpdate);

      return () => {
        window.removeEventListener('notification-update', handleNotificationUpdate);
        window.removeEventListener('issue-update', handleIssueUpdate);
      };
    }
  }, [currentUser, fetchAllData, fetchNotifications]);

  const createIssue = async (issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'comments'>, file?: File) => {
    try {
      const formData = new FormData();
      const issueDto = {
        titolo: issueData.title,
        descrizione: issueData.description,
        tipoIssue: mapTypeToBackend(issueData.type),
        prioritaIssue: mapPriorityToBackend(issueData.priority),
        emailAutore: issueData.reporter.email,
        idProgetto: parseInt(issueData.projectId),
        etichette: issueData.labels
      };

      formData.append('issueData', new Blob([JSON.stringify(issueDto)], { type: 'application/json' }));

      if (file) {
        formData.append('file', file);
      }

      const response = await api.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newIssue = response.data;

      const mappedIssue: Issue = {
        id: newIssue.id.toString(),
        title: newIssue.titolo,
        description: newIssue.descrizione,
        status: mapStatusFromBackend(newIssue.statoIssue),
        priority: mapPriorityFromBackend(newIssue.prioritaIssue),
        type: mapTypeFromBackend(newIssue.tipoIssue),
        createdAt: newIssue.dataCreazione,
        updatedAt: newIssue.dataUltimoAggiornamento,
        reporter: issueData.reporter,
        assignee: issueData.assignee,
        projectId: issueData.projectId,
        comments: [],
        labels: issueData.labels, // Backend might not return labels in IssueDTO immediately?
        attachments: newIssue.allegati || []
      };

      dispatch({ type: 'ADD_ISSUE', payload: mappedIssue });
    } catch (error) {
      console.error("Failed to create issue", error);
      throw error;
    }
  };

  const updateIssue = async (issueId: string, issueData: Partial<Issue>) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: Record<string, any> = { id: parseInt(issueId) };
      if (issueData.title) payload.titolo = issueData.title;
      if (issueData.description) payload.descrizione = issueData.description;
      if (issueData.status) payload.statoIssue = mapStatusToBackend(issueData.status);
      if (issueData.priority) payload.prioritaIssue = mapPriorityToBackend(issueData.priority);
      if (issueData.type) payload.tipoIssue = mapTypeToBackend(issueData.type);

      if (issueData.assignee) {
        payload.assegnatario = issueData.assignee.email;
      } else if (issueData.assignee === null) {
        payload.assegnatario = "";
      }

      if (issueData.labels !== undefined) payload.etichette = issueData.labels;

      const response = await api.put<BackendIssue>(`/issues/${issueId}`, payload);
      const updatedIssue = response.data;

      const existingIssue = state.issues.find(i => i.id === issueId);
      if (!existingIssue) {
        console.warn(`Issue ${issueId} non trovata nello stato locale durante l'aggiornamento.`);
        return; // Prevent crash
      }

      const mappedIssue: Issue = {
        ...existingIssue,
        title: updatedIssue.titolo || existingIssue.title,
        description: updatedIssue.descrizione || existingIssue.description,
        status: mapStatusFromBackend(updatedIssue.statoIssue),
        priority: mapPriorityFromBackend(updatedIssue.prioritaIssue),
        type: mapTypeFromBackend(updatedIssue.tipoIssue),
        updatedAt: updatedIssue.dataUltimoAggiornamento,
        assignee: updatedIssue.assegnatario ? {
          id: updatedIssue.assegnatario.email,
          email: updatedIssue.assegnatario.email,
          name: updatedIssue.assegnatario.nome,
          surname: updatedIssue.assegnatario.cognome || '',
          role: mapRoleFromBackend(updatedIssue.assegnatario.ruolo),
          avatarUrl: `https://ui-avatars.com/api/?name=${updatedIssue.assegnatario.nome}+${updatedIssue.assegnatario.cognome}&background=random`
        } : undefined,
        // Backend DTO typically doesn't return labels, so preserve existing ones unless provided in the update
        labels: issueData.labels || existingIssue.labels || [],
        attachments: updatedIssue.allegati || existingIssue.attachments || []
      };

      dispatch({ type: 'UPDATE_ISSUE', payload: mappedIssue });
    } catch (error) {
      console.error("Failed to update issue", error);
      throw error;
    }
  };

  const addComment = async (issueId: string, commentData: Omit<Comment, 'id' | 'timestamp'>) => {
    try {
      const payload = {
        autore: commentData.author.email,
        testo: commentData.content,
        idIssue: parseInt(issueId)
      };

      const response = await api.post('/commenti', payload);
      const newComment = response.data;

      const mappedComment: Comment = {
        id: newComment.id.toString(),
        content: newComment.testo,
        timestamp: newComment.data_creazione,
        author: commentData.author // Use the author from input as response lacks details
      };

      dispatch({ type: 'ADD_COMMENT', payload: { issueId, comment: mappedComment } });
    } catch (error) {
      console.error("Failed to add comment", error);
      throw error;
    }
  };

  const createUser = async (userData: Omit<User, 'id'> & { password?: string }) => {
    try {
      const response = await api.post('/utenti', {
        email: userData.email,
        nome: userData.name,
        cognome: userData.surname,
        password: userData.password, // Include password
        ruolo: mapRoleToBackend(userData.role || 'UTENTE')
      });
      const newUser = response.data;
      const mappedUser: User = {
        id: newUser.email,
        email: newUser.email,
        name: newUser.nome,
        surname: newUser.cognome,
        role: mapRoleFromBackend(newUser.ruolo),
        avatarUrl: `https://ui-avatars.com/api/?name=${newUser.nome}+${newUser.cognome}&background=random`
      };
      dispatch({ type: 'ADD_USER', payload: mappedUser });
    } catch (error) {
      console.error("Failed to create user", error);
      throw error;
    }
  };

  const updateUser = async (userId: string, userData: Partial<User>) => {
    try {
      const response = await api.put(`/utenti/${userId}`, {
        email: userData.email,
        nome: userData.name,
        cognome: userData.surname,
        ruolo: mapRoleToBackend(userData.role || 'UTENTE')
      });
      const updatedUser = response.data;
      const mappedUser: User = {
        id: updatedUser.email,
        email: updatedUser.email,
        name: updatedUser.nome,
        surname: updatedUser.cognome,
        role: mapRoleFromBackend(updatedUser.ruolo),
        avatarUrl: `https://ui-avatars.com/api/?name=${updatedUser.nome}+${updatedUser.cognome}&background=random`
      };
      dispatch({ type: 'UPDATE_USER', payload: mappedUser });
    } catch (error) {
      console.error("Failed to update user", error);
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await api.delete(`/utenti/${userId}`);
      dispatch({ type: 'DELETE_USER', payload: { userId } });
    } catch (error) {
      console.error("Failed to delete user", error);
      throw error;
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notifiche/id/${notificationId}/leggi`);
      dispatch({ type: 'MARK_NOTIFICATION_AS_READ', payload: { notificationId } });
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  return (
    <IssueContext.Provider value={{
      state,
      dispatch,
      loading,
      createIssue,
      updateIssue,
      addComment,
      createUser,
      updateUser,
      deleteUser,
      markNotificationAsRead,
      fetchNotifications
    }}>
      {children}
    </IssueContext.Provider>
  );
};

