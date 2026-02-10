import { Navigate, Outlet, useOutletContext } from 'react-router-dom';
import type { User } from '../../types';
import { useAuth } from '../../context/AuthContext.shared';

/**
 * Controlla se l'utente loggato ha un ruolo permesso,
 * altrimenti lo reindirizza alla dashboard principale.
 * Passa anche il context ricevuto dal layout genitore ai figli.
 */
export const ProtectedRoute = ({ allowedRoles }: { allowedRoles: User['role'][] }) => {
    const { currentUser } = useAuth();
    const context = useOutletContext();

    if (!currentUser || !allowedRoles.includes(currentUser.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet context={context} />;
};