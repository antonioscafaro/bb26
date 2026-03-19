import api from '../api/axios';

/**
 * Verifica la password dell'utente corrente tramite endpoint dedicato del backend.
 * Il backend confronta la password con l'hash BCrypt in database.
 *
 * @param password - Password inserita dall'utente per conferma
 * @throws Error se la password non è valida (401)
 */
export const verifyPassword = async (password: string): Promise<void> => {
    try {
        await api.post('/utenti/verify-password', { password });
    } catch {
        throw new Error('Password non valida');
    }
};
