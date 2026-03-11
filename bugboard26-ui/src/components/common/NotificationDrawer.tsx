import { useMemo } from 'react';
import { motion, AnimatePresence, type Variants, LayoutGroup } from 'framer-motion';
import { X } from 'lucide-react';
import { useIssues } from '../../context/IssueContext.shared';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Icons } from './Icons';
import type { Notification } from '../../types';

// --- JSDoc ---
/**
 * @typedef {Object} NotificationDrawerProps
 * @property {boolean} isOpen - Flag che determina se il drawer è visibile.
 * @property {() => void} onClose - Callback per chiudere il drawer.
 */

/**
 * Un pannello laterale (drawer) responsivo per visualizzare le notifiche.
 * Su desktop, appare come un pannello laterale a sinistra.
 * Su mobile, occupa l'intero schermo per una migliore leggibilità.
 * @param {NotificationDrawerProps} props - Le props del componente.
 */
export const NotificationDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) => {
  const { state, markNotificationAsRead, markAllNotificationsAsRead } = useIssues();
  const { notifications } = state;
  const isMobile = useIsMobile();

  // --- Memoization ---
  // Separa le notifiche lette da quelle non lette per raggrupparle.
  const [unreadNotifications, readNotifications] = useMemo(() => {
    const unread: Notification[] = [];
    const read: Notification[] = [];
    notifications.forEach(n => (n.isRead ? read.push(n) : unread.push(n)));
    return [unread, read];
  }, [notifications]);

  // --- Handlers ---
  const handleNotificationClick = (notificationId: string) => {
    markNotificationAsRead(notificationId);
    // In futuro, si potrebbe aggiungere la navigazione alla issue corrispondente.
    // *** MODIFICA: La chiusura automatica su mobile è stata rimossa come richiesto. ***
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
  };

  // --- Animazioni ---
  const drawerVariants: Variants = {
    hidden: { x: '-100%', transition: { type: 'spring', stiffness: 400, damping: 40 } },
    visible: { x: 0, transition: { type: 'spring', stiffness: 400, damping: 40 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <LayoutGroup>
          {/* Sfondo Overlay ("Scrim") */}
          <motion.div
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Contenuto del Drawer */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`fixed top-0 left-0 h-full bg-surface shadow-2xl z-50 flex flex-col
                       ${isMobile ? 'w-full' : 'w-96 border-r border-outline-variant'}`}
          >
            {/* Header del Drawer */}
            <header className="flex items-center justify-between p-4 border-b border-outline-variant flex-shrink-0">
              <h2 className="text-xl font-medium text-on-surface">Notifiche</h2>
              <button
                onClick={onClose}
                className="text-on-surface-variant hover:bg-surface-variant rounded-full p-2"
                aria-label="Chiudi notifiche"
              >
                <X size={24} />
              </button>
            </header>

            {/* Corpo del Drawer (lista notifiche) */}
            <div className="flex-grow overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Icons.Notification className="h-12 w-12 text-on-surface-variant/40 mb-4" />
                  <p className="font-medium text-on-surface-variant">Nessuna notifica</p>
                  <p className="text-sm text-on-surface-variant/80">Le nuove notifiche appariranno qui.</p>
                </div>
              ) : (
                <>
                  {unreadNotifications.length > 0 && (
                    <section className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-primary">Nuove</h3>
                        <button onClick={handleMarkAllAsRead} className="text-xs font-medium text-primary hover:underline">Segna tutte come lette</button>
                      </div>
                      <div className="space-y-2">
                        {unreadNotifications.map(n => (
                          <NotificationItem key={n.id} notification={n} onClick={handleNotificationClick} />
                        ))}
                      </div>
                    </section>
                  )}
                  {readNotifications.length > 0 && (
                    <section className="p-4 border-t border-outline-variant">
                      <h3 className="text-sm font-medium text-on-surface-variant mb-2">Lette</h3>
                      <div className="space-y-2">
                        {readNotifications.map(n => (
                          <NotificationItem key={n.id} notification={n} onClick={handleNotificationClick} />
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </LayoutGroup>
      )}
    </AnimatePresence>
  );
};


// --- Componente Interno per la singola notifica ---

/**
 * Componente per una singola riga di notifica.
 * @param {{notification: Notification, onClick: (id: string) => void}} props
 */
const NotificationItem = ({ notification, onClick }: { notification: Notification; onClick: (id: string) => void; }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onClick(notification.id)}
      className={`p-3 rounded-m3-m cursor-pointer transition-colors
                 ${!notification.isRead ? 'bg-primary/10 hover:bg-primary/20' : 'hover:bg-surface-variant'}`}
    >
      <p className={`text-sm ${!notification.isRead ? 'font-medium text-on-surface' : 'text-on-surface-variant'}`}>
        {notification.message}
      </p>
      <span className="text-xs text-on-surface-variant/80 mt-1 block">
        {new Date(notification.date).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
      </span>
    </motion.div>
  );
};