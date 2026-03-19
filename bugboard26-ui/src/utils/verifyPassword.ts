import axios from 'axios';

/**
 * Verifica la password dell'utente inviando una richiesta Basic Auth
 * ad un endpoint protetto del backend.
 *
 * Utilizza un'istanza axios raw (non quella con interceptor)
 * per evitare che il token salvato in localStorage sovrascriva le credenziali.
 *
 * @param email - Email dell'utente corrente
 * @param password - Password inserita dall'utente per conferma
 * @throws Error se la password non è valida (401)
 */
export const verifyPassword = async (email: string, password: string): Promise<void> => {
    const token = btoa(`${email}:${password}`);
    try {
        // GET /api/utenti è un endpoint protetto (richiede autenticazione)
        // A differenza di GET /api/utenti/email/** che è permitAll
        await axios.get('/api/utenti', {
            headers: { Authorization: `Basic ${token}` }
        });
    } catch {
        throw new Error('Password non valida');
    }
};
