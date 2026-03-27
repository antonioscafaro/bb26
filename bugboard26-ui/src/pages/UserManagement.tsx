// src/pages/UserManagement.tsx
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useIssues } from '../context/IssueContext.shared';
import { Toast } from '../components/common/Toast';
import { verifyPassword } from '../utils/verifyPassword';
import { useIsMobile } from '../hooks/useIsMobile';
import { PasswordConfirmModal } from '../components/common/PasswordConfirmModal';
import { useAuth } from '../context/AuthContext.shared';
import type { User } from '../types';
import { Header } from '../components/layout/Header';
import { Icons } from '../components/common/Icons';
import { ActionButton } from '../components/common/ActionButton';
import { CreateUserModal } from '../components/users/CreateUserModal';
import { UserCard } from '../components/users/UserCard';
import { AddUserCard } from '../components/users/AddUserCard';
import { EmptyState } from '../components/common/EmptyState';
import { BottomSheet } from '../components/common/BottomSheet';
import { USER_ROLE } from '../constants';

type PageContext = { onMenuClick: () => void; };

const containerVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
    exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.2 } }
};

/**
 * User management page with password confirmation for destructive actions
 * Includes toast notifications and improved table layout
 */
export const UserManagement = () => {
    const { onMenuClick } = useOutletContext<PageContext>();
    const { state, createUser, updateUser, deleteUser } = useIssues();
    const { currentUser } = useAuth();
    const { users } = state;
    const isMobile = useIsMobile();
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setModalOpen(true);
    };

    const handleSave = async (userToSave: Partial<User>) => {
        try {
            if (userToSave.id) {
                await updateUser(userToSave.id, userToSave as Partial<User>);
                Toast.success(`Utente "${userToSave.name}" aggiornato con successo!`);
            } else {
                await createUser(userToSave as Omit<User, 'id'> & { password?: string });
                Toast.success(`Utente "${userToSave.name}" creato con successo!`);
            }
        } catch {
            Toast.error('Errore durante il salvataggio dell\'utente');
        }
    };

    const handleRemove = (userToRemove: User) => {
        setUserToDelete(userToRemove);
        setPasswordModalOpen(true);
    };

    const handlePasswordConfirm = async (password: string) => {
        if (!userToDelete) return;

        await verifyPassword(password);

        try {
            await deleteUser(userToDelete.id, currentUser!.email);
            Toast.success(`Utente "${userToDelete.name}" eliminato con successo`);
            setUserToDelete(null);
        } catch (error) {
            Toast.error('Errore durante l\'eliminazione dell\'utente');
            throw error; // Re-throw to show error in password modal
        }
    };

    const modalTitle = selectedUser ? 'Modifica Utente' : 'Nuovo Utente';

    return (
        <>
            <div className="flex flex-col h-full bg-background">
                <Header onMenuClick={onMenuClick} />
                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-4 sm:p-6 flex-grow overflow-y-auto">

                    {users.length > 0 ? (
                        <>
                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-4">
                                <AnimatePresence>
                                    {users.map(user => (
                                        <UserCard
                                            key={user.id}
                                            user={user}
                                            onEdit={() => handleEdit(user)}
                                            onRemove={() => handleRemove(user)}
                                            isSelf={user.email === currentUser?.email}
                                        />
                                    ))}
                                </AnimatePresence>
                                <AddUserCard onClick={handleCreate} />
                            </div>

                            {/* Desktop Table */}
                            <motion.div variants={itemVariants} className="hidden md:block bg-surface shadow-sm rounded-m3-l overflow-hidden">
                                <table className="min-w-full text-sm">
                                    <thead className="border-b border-outline-variant">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-left font-medium text-on-surface-variant">Nome</th>
                                            <th scope="col" className="px-6 py-4 text-left font-medium text-on-surface-variant">Ruolo</th>
                                            <th scope="col" className="px-6 py-4 text-left font-medium text-on-surface-variant">Email</th>
                                            <th scope="col" className="px-6 py-4 text-right font-medium text-on-surface-variant">Azioni</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant">
                                        <AnimatePresence>
                                            {users.map(user => (
                                                <motion.tr
                                                    key={user.id}
                                                    layout
                                                    variants={itemVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    className="transition-colors hover:bg-surface-variant"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <img
                                                                className="h-10 w-10 rounded-full"
                                                                src={user.avatarUrl}
                                                                alt={user.name}
                                                            />
                                                            <div className="ml-4">
                                                                <div className="font-medium text-on-surface">{user.name}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-m3-sm ${user.role === USER_ROLE.ADMIN
                                                            ? 'bg-tertiary-container text-on-tertiary-container'
                                                            : 'bg-secondary-container text-on-secondary-container'
                                                            }`}>
                                                            {user.role === USER_ROLE.ADMIN ? 'Amministratore' : 'Utente'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-on-surface-variant">
                                                        {user.email || 'Non specificata'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <ActionButton
                                                                onClick={() => handleEdit(user)}
                                                                icon={<Icons.Edit />}
                                                                aria-label="Modifica utente"
                                                                className="text-on-surface-variant hover:bg-primary/10 hover:text-primary"
                                                            />
                                                            {user.email !== currentUser?.email && (
                                                                <ActionButton
                                                                    onClick={() => handleRemove(user)}
                                                                    icon={<Icons.Trash />}
                                                                    aria-label="Rimuovi utente"
                                                                    className="text-on-surface-variant hover:bg-error/10 hover:text-error"
                                                                />
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>

                                        {/* Add User Row */}
                                        <motion.tr
                                            layout
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="transition-colors hover:bg-surface-variant group cursor-pointer"
                                            onClick={handleCreate}
                                        >
                                            <td className="px-6 py-4" colSpan={3}>
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center transition-colors group-hover:border-primary">
                                                        <Icons.Plus className="h-5 w-5 text-on-surface-variant transition-colors group-hover:text-primary" />
                                                    </div>
                                                    <div className="ml-4 font-medium text-on-surface-variant transition-colors group-hover:text-primary">
                                                        Aggiungi nuovo utente
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right"></td>
                                        </motion.tr>
                                    </tbody>
                                </table>
                            </motion.div>
                        </>
                    ) : (
                        <EmptyState title="Nessun utente" subtitle="Crea il primo utente per iniziare." />
                    )}
                </motion.div>
            </div>

            {isMobile ? (
                <BottomSheet isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={modalTitle}>
                    <CreateUserModal
                        isOpen={isModalOpen}
                        onClose={() => setModalOpen(false)}
                        onSave={handleSave}
                        user={selectedUser}
                        isBottomSheet={true}
                    />
                </BottomSheet>
            ) : (
                <CreateUserModal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSave}
                    user={selectedUser}
                />
            )}

            <PasswordConfirmModal
                isOpen={isPasswordModalOpen}
                onClose={() => {
                    setPasswordModalOpen(false);
                    setUserToDelete(null);
                }}
                onConfirm={handlePasswordConfirm}
                title="Conferma Eliminazione Utente"
                description={`Sei sicuro di voler eliminare l'utente "${userToDelete?.name}"? Questa azione è irreversibile.`}
                destructiveAction
            />
        </>
    );
}