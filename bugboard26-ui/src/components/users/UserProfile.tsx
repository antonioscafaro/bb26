import { useState, useEffect, useRef } from 'react';
import type { User } from '../../types';
import { Icons } from '../common/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.shared';
import { useTheme } from '../../hooks/useTheme';

export const UserProfile = ({ currentUser }: { currentUser: User }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative mt-auto" ref={dropdownRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute bottom-full left-0 mb-2 w-full bg-surface rounded-m3-l shadow-xl border border-outline-variant origin-bottom-left overflow-hidden"
          >
            <div className="py-2">
              <p className="px-4 py-2 text-xs font-bold text-on-surface-variant">Tema</p>
              <button onClick={() => setTheme('light')} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-primary/10 flex items-center"><Icons.Sun /> Chiaro</button>
              <button onClick={() => setTheme('dark')} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-primary/10 flex items-center"><Icons.Moon /> Scuro</button>
              <button onClick={() => setTheme('system')} className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-primary/10 flex items-center"><Icons.System /> Sistema</button>
            </div>

            <div className="py-2 border-t border-outline-variant">
              <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 flex items-center"><Icons.LogOut /> Logout</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Apri menu utente"
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface-variant rounded-m3-l transition-colors"
      >
        <img
          src={currentUser.avatarUrl}
          alt={currentUser.name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-grow min-w-0">
          <p className="font-bold text-sm text-on-surface truncate">{currentUser.name}</p>
          <p className="text-xs text-on-surface-variant truncate">{currentUser.role}</p>
        </div>
      </motion.button>
    </div>
  );
};