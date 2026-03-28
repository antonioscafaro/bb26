import axios from 'axios';

/**
 * Mappa dei messaggi di errore del backend → messaggi UX-friendly.
 * Le chiavi corrispondono esattamente ai messaggi restituiti dal GlobalExceptionHandler
 * (definiti in ErrorMessages.java o inline nei service).
 */
const ERROR_MESSAGE_MAP: Record<string, string> = {
  // 404 - Risorse non trovate
  'Progetto non trovato': 'Il progetto non esiste più. Potrebbe essere stato eliminato.',
  'Utente non trovato': 'L\'utente non è stato trovato. Potrebbe essere stato rimosso dal sistema.',
  'Issue non trovata': 'L\'issue non esiste più. Potrebbe essere stata eliminata.',
  'Issue non esistente': 'L\'issue selezionata non esiste più.',
  'Etichetta non trovata': 'L\'etichetta non è stata trovata. Potrebbe essere stata rimossa.',
  'Etichetta non esistente': 'L\'etichetta selezionata non esiste più.',
  'Destinatario non trovato': 'Il destinatario della notifica non è stato trovato.',
  'Commento non trovato': 'Il commento non è stato trovato. Potrebbe essere stato eliminato.',
  'Notifica non trovata': 'La notifica non esiste più.',
  'Allegato non trovato': 'L\'allegato non è stato trovato. Il file potrebbe essere stato rimosso.',
  'Assegnatario non trovato': 'L\'assegnatario selezionato non è stato trovato nel sistema.',

  // 403 - Permessi
  'Non hai i permessi per modificare questa issue.': 'Non hai i permessi per modificare questa issue.',
  "L'autore non può modificare l'assegnatario": 'Solo un amministratore può cambiare l\'assegnatario di questa issue.',
  "L'assegnatario non può modificare la descrizione": 'Solo l\'autore o un amministratore può modificare la descrizione.',
  "L'issue è stata risolta e non può essere più modificata": 'Questa issue è stata risolta e non può più essere modificata.',
  "L'issue non è risolta e non può essere archiviata": 'Solo le issue risolte possono essere archiviate.',

  // 400 - Errori di validazione / business logic
  'Email già registrata': 'Questa email è già associata ad un altro utente.',
  "L'utente selezionato non è membro del progetto": 'L\'utente selezionato non è membro di questo progetto. Aggiungilo prima al progetto.',
  'Non puoi cancellare te stesso': 'Non è possibile eliminare il proprio account.',
  'Non hai i permessi per modificare questo utente': 'Non hai i permessi per modificare questo utente.',
  'Password non valida': 'La password inserita non è corretta.',
  "L'utente non è membro di questo progetto": 'L\'utente non fa parte di questo progetto.',
};

/**
 * Estrae un messaggio di errore UX-friendly da un errore Axios.
 * Il backend di BugBoard26 manda i messaggi di errore come testo semplice nel body della risposta.
 *
 * @param error - L'errore catturato (Axios o generico)
 * @param fallback - Messaggio di fallback se non è possibile estrarre il messaggio dal backend
 * @returns Il messaggio UX-friendly da mostrare all'utente
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && error.response) {
    const data = error.response.data;
    const backendMessage = typeof data === 'string' ? data.trim() : null;

    if (backendMessage) {
      // Cerca corrispondenza esatta
      const mapped = ERROR_MESSAGE_MAP[backendMessage];
      if (mapped) return mapped;

      // Cerca corrispondenze parziali (per messaggi con parametri dinamici, es. "Issue non trovata con id: 5")
      for (const [key, value] of Object.entries(ERROR_MESSAGE_MAP)) {
        if (backendMessage.includes(key)) return value;
      }

      // Il messaggio backend è già in italiano e comprensibile → usalo direttamente
      return backendMessage;
    }

    // Gestisci status code senza body di messaggio
    const status = error.response.status;
    if (status === 401) return 'Sessione scaduta. Effettua nuovamente il login.';
    if (status === 403) return 'Non hai i permessi per eseguire questa operazione.';
    if (status === 404) return 'La risorsa richiesta non è stata trovata.';
    if (status === 500) return 'Si è verificato un errore interno del server. Riprova più tardi.';
  }

  return fallback;
}
