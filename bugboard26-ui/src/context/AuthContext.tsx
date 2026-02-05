import { useState, useEffect, type ReactNode } from 'react';
import { AuthContext } from './AuthContext.shared';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';
import api from '../api/axios';



export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedEmail = localStorage.getItem('bugboard_user_email');

        if (storedToken && storedEmail) {
          // Token is automatically injected by axios interceptor
          const response = await api.get(`/utenti/email/${storedEmail}`);
          const userData = response.data;
          if (userData) {
            const user: User = {
              id: userData.email,
              email: userData.email,
              name: userData.nome,
              surname: userData.cognome,
              role: userData.ruolo,
              avatarUrl: `https://ui-avatars.com/api/?name=${userData.nome}+${userData.cognome}&background=random`
            };
            setCurrentUser(user);
          }
        }
      } catch (e) {
        console.error("Failed to restore session", e);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('bugboard_user_email');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Basic Auth: Encode credentials
      const token = btoa(`${email}:${password}`);
      localStorage.setItem('auth_token', token);

      // Verify credentials by attempting a protected call
      const response = await api.get(`/utenti/email/${email}`);
      const userData = response.data;

      if (userData) {
        const user: User = {
          id: userData.email,
          email: userData.email,
          name: userData.nome,
          surname: userData.cognome,
          role: userData.ruolo,
          avatarUrl: `https://ui-avatars.com/api/?name=${userData.nome}+${userData.cognome}&background=random`
        };
        setCurrentUser(user);
        localStorage.setItem('bugboard_user_email', user.email);
        setLoading(false);
        return true;
      } else {
        localStorage.removeItem('auth_token');
        setError('Utente non trovato.');
        setLoading(false);
        return false;
      }
    } catch (err: unknown) {
      console.error(err);
      localStorage.removeItem('auth_token');

      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        setError('Credenziali non valide.');
      } else {
        setError('Errore di connessione o utente non trovato.');
      }
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bugboard_user_email');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('selectedProjectId');
    navigate('/login');
  };

  const value = { currentUser, login, logout, loading, error };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

