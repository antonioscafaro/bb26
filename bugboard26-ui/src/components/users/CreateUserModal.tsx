import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff } from 'lucide-react';

import type { User } from '../../types';
import { USER_ROLE } from '../../constants';

import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';

export const CreateUserModal = ({ isOpen, onClose, onSave, user, isBottomSheet = false }: {
  isOpen: boolean,
  onClose: () => void,
  onSave: (user: Partial<User> & { password?: string }) => void,
  user?: User | null,
  isBottomSheet?: boolean
}) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<User['role']>(USER_ROLE.NORMAL);
  const [showPassword, setShowPassword] = useState(false);
  const isEditing = !!user;

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setSurname(user.surname || '');
      setEmail(user.email || '');
      setRole(user.role || USER_ROLE.NORMAL);
      setPassword('');
      setShowPassword(false);
    } else if (!isOpen) {
      setName('');
      setSurname('');
      setEmail('');
      setPassword('');
      setRole(USER_ROLE.NORMAL);
    }
  }, [user, isOpen]);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    onSave({ id: user?.id, name, surname, email, password, role });
    onClose();
  };

  const formContent = (
    <form onSubmit={handleSave} className="p-6 space-y-4">
      <div>
        <label htmlFor="user-name" className="block text-sm font-medium text-on-surface-variant mb-1">Nome</label>
        <Input type="text" id="user-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="user-surname" className="block text-sm font-medium text-on-surface-variant mb-1">Cognome</label>
        <Input type="text" id="user-surname" value={surname} onChange={(e) => setSurname(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="user-email" className="block text-sm font-medium text-on-surface-variant mb-1">Email</label>
        <Input type="email" id="user-email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="user-password" className="block text-sm font-medium text-on-surface-variant mb-1">
          Password{isEditing && <span className="text-xs text-on-surface-variant/60 ml-1">(lascia vuoto per non modificare)</span>}
        </label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            id="user-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!isEditing}
            placeholder={isEditing ? 'Nuova password...' : ''}
          />
          {password && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface-variant text-on-surface-variant"
              aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      </div>
      <div>
        <label htmlFor="user-role" className="block text-sm font-medium text-on-surface-variant mb-1">Ruolo</label>
        <Select id="user-role" value={role} onChange={(e) => setRole(e.target.value as User['role'])}>
          <option value={USER_ROLE.ADMIN}>Amministratore</option>
          <option value={USER_ROLE.NORMAL}>Utente</option>
        </Select>
      </div>
      <div className={`flex justify-end gap-2 ${isBottomSheet ? 'pt-4' : ''}`}>
        <Button variant="text" type="button" onClick={onClose}>Annulla</Button>
        <Button variant="filled" type="submit">Salva</Button>
      </div>
    </form>
  )

  if (isBottomSheet) {
    return formContent;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
          <motion.div onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} className="relative bg-surface shadow-2xl w-full h-dvh sm:h-auto sm:max-w-md sm:rounded-m3-xl flex flex-col">

            <div className="p-6 flex justify-between items-center border-b border-outline-variant flex-shrink-0">
              <h2 className="text-xl font-medium text-on-surface">{isEditing ? 'Modifica Utente' : 'Crea Nuovo Utente'}</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-variant" aria-label="Chiudi modale">
                <X size={24} className="text-on-surface-variant" />
              </button>
            </div>

            <div className="overflow-y-auto">
              {formContent}
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};