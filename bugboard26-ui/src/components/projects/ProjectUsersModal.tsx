import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Trash2, Plus } from 'lucide-react';
import { Toast } from '../common/Toast';
import { getApiErrorMessage } from '../../utils/apiErrors';

import { Button } from '../common/Button';
import { Select } from '../common/Select';
import type { User, Project, UserRole } from '../../types';
import { ActionButton } from '../common/ActionButton';
import api from '../../api/axios';

interface ProjectUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
  isBottomSheet?: boolean;
}

const UserCard = ({ user, onRemove, isLoading }: { user: User, onRemove: () => void, isLoading: boolean }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    whileHover={{ backgroundColor: 'var(--surface-variant)' }}
    className="flex items-center justify-between p-3 bg-surface rounded-lg"
  >
    <div className="flex items-center gap-3">
      <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
      <div>
        <h4 className="font-medium text-on-surface">{user.name}</h4>
        <p className="text-sm text-on-surface-variant">{user.email}</p>
      </div>
    </div>
    <ActionButton
      onClick={onRemove}
      disabled={isLoading}
      icon={<Trash2 className="h-4 w-4" />}
      aria-label="Rimuovi dal progetto"
      className="text-error hover:bg-red-50 dark:hover:bg-red-900/30"
    />
  </motion.div>
);

export const ProjectUsersModal: React.FC<ProjectUsersModalProps> = ({
  isOpen,
  onClose,
  project,
  isBottomSheet = false,
}) => {
  const [projectUsers, setProjectUsers] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && project) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [membersRes, allUsersRes] = await Promise.all([
            api.get<Array<{ email: string; nome: string; cognome: string; ruolo: UserRole }>>(`/progetti/${project.id}/membri`),
            api.get<Array<{ email: string; nome: string; cognome: string; ruolo: UserRole }>>('/utenti')
          ]);

          const members: User[] = membersRes.data.map((u) => ({
            id: u.email,
            email: u.email,
            name: u.nome,
            surname: u.cognome,
            role: u.ruolo,
            avatarUrl: `https://ui-avatars.com/api/?name=${u.nome}+${u.cognome}&background=random`
          }));

          const allUsers: User[] = allUsersRes.data.map((u) => ({
            id: u.email,
            email: u.email,
            name: u.nome,
            surname: u.cognome,
            role: u.ruolo,
            avatarUrl: `https://ui-avatars.com/api/?name=${u.nome}+${u.cognome}&background=random`
          }));

          setProjectUsers(members);
          const memberEmails = new Set(members.map(m => m.email));
          setAvailableUsers(allUsers.filter(u => !memberEmails.has(u.email)));

        } catch (error) {
          console.error("Failed to fetch project users", error);
          Toast.error(getApiErrorMessage(error, 'Errore nel caricamento degli utenti'));
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [isOpen, project]);

  const handleAddUser = async () => {
    const userToAdd = availableUsers.find(u => u.id === selectedUserId);
    if (!userToAdd || !project) return;

    setIsLoading(true);
    try {
      await api.post(`/progetti/${project.id}/membri`, {
        idProgetto: parseInt(project.id),
        utente: userToAdd.email // Sending email as ID because 'utente' field in DTO expects email string
      });

      setProjectUsers(prev => [...prev, userToAdd]);
      setAvailableUsers(prev => prev.filter(u => u.id !== selectedUserId));
      setSelectedUserId('');
      Toast.success(`${userToAdd.name} aggiunto al progetto`);
    } catch (error) {
      console.error(error);
      Toast.error(getApiErrorMessage(error, 'Errore nell\'aggiunta dell\'utente'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (user: User) => {
    if (!project) return;
    setIsLoading(true);
    try {
      await api.delete(`/progetti/${project.id}/membri/${user.email}`);

      setProjectUsers(prev => prev.filter(u => u.id !== user.id));
      setAvailableUsers(prev => [...prev, user]);
      Toast.success(`${user.name} rimosso dal progetto`);
    } catch (error) {
      console.error(error);
      Toast.error(getApiErrorMessage(error, 'Errore nella rimozione dell\'utente'));
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <div className={isBottomSheet ? 'p-4' : ''}>
      {/* Add User */}
      <div className="flex items-center gap-2 mb-6 px-6 pt-6">
        <div className="flex-grow">
          <Select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            disabled={availableUsers.length === 0}
            className="h-12"
          >
            <option value="" disabled>Seleziona un utente...</option>
            {availableUsers.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </Select>
        </div>
        <Button onClick={handleAddUser} disabled={!selectedUserId || isLoading} className="w-12 h-12 flex-shrink-0 !p-0"><Plus size={20} /></Button>
      </div>
      {/* Member List */}
      <div className="px-6 pb-6 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 220px)' }}>
        {projectUsers.length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-1">Nessun Membro</h3>
            <p className="text-sm">Aggiungi utenti per iniziare a collaborare.</p>
          </div>
        ) : (
          <AnimatePresence>
            {projectUsers.map((user) => (
              <UserCard key={user.id} user={user} onRemove={() => handleRemoveUser(user)} isLoading={isLoading} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );

  if (isBottomSheet) return modalContent;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-surface rounded-m3-xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-on-surface">Membri del Progetto</h2>
                  <p className="text-sm text-on-surface-variant">{project?.name}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            {modalContent}

            {/* Footer */}
            <div className="flex justify-end p-4 border-t border-outline-variant">
              <Button variant='text' onClick={onClose}>Chiudi</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};