import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Edit, Trash2, Plus, Users } from 'lucide-react';
import { useProjects } from '../context/ProjectContext.shared';
import { useAuth } from '../context/AuthContext.shared';
import { useIsMobile } from '../hooks/useIsMobile';
import { Header } from '../components/layout/Header';
import { Icons } from '../components/common/Icons';
import { ProjectFormModal } from '../components/projects/ProjectFormModal';
import { PasswordConfirmModal } from '../components/common/PasswordConfirmModal';
import { Toast } from '../components/common/Toast';
import api from '../api/axios';
import type { Project } from '../types';
import { ProjectUsersModal } from '../components/projects/ProjectUsersModal';
import { ActionButton } from '../components/common/ActionButton';
import { BottomSheet } from '../components/common/BottomSheet';
import { EmptyState } from '../components/common/EmptyState';
import { USER_ROLE } from '../constants';

type PageContext = { onMenuClick: () => void; };

const ProjectCard = ({ project, onClick, onEdit, onDelete, onManageUsers, isAdmin }: {
    project: Project,
    onClick: () => void,
    onEdit: () => void,
    onDelete: () => void,
    onManageUsers: () => void,
    isAdmin: boolean
}) => (
    <motion.div
        layout
        onClick={onClick}
        whileHover={{ y: -5, boxShadow: '0px 8px 20px rgba(0,0,0,0.08)' }}
        className="bg-surface rounded-m3-l p-6 shadow-sm cursor-pointer h-full flex flex-col group relative"
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    >
        <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center flex-shrink-0">
                <Icons.Dashboard className="text-on-primary-container" />
            </div>
            <h2 className="text-xl font-medium text-on-surface truncate">{project.name}</h2>
        </div>
        <p className="text-on-surface-variant text-sm mt-2 flex-grow">
            {project.description || "Nessuna descrizione per questo progetto."}
        </p>
        <div className="border-t border-outline-variant mt-4 pt-4 flex justify-between items-center">
            {isAdmin ? (
                <div className="flex items-center gap-2">
                    <ActionButton onClick={(e) => { e.stopPropagation(); onEdit(); }} icon={<Edit size={18} />} aria-label="Modifica progetto" className="text-on-surface-variant hover:bg-primary/10 hover:text-primary" />
                    <ActionButton onClick={(e) => { e.stopPropagation(); onManageUsers(); }} icon={<Users size={18} />} aria-label="Gestisci utenti" className="text-on-surface-variant hover:bg-primary/10 hover:text-primary" />
                    <ActionButton onClick={(e) => { e.stopPropagation(); onDelete(); }} icon={<Trash2 size={18} />} aria-label="Elimina progetto" className="text-on-surface-variant hover:bg-error/10 hover:text-error" />
                </div>
            ) : <div />}
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-variant transition-colors group-hover:bg-primary group-hover:text-on-primary ml-auto">
                <ArrowRight className="h-5 w-5" />
            </div>
        </div>
    </motion.div>
);

export const ProjectsPage = () => {
    const { onMenuClick } = useOutletContext<PageContext>();
    const { projects, setSelectedProjectId, createProject, updateProject, deleteProject } = useProjects();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const isMobile = useIsMobile();

    const [isFormOpen, setFormOpen] = useState(false);
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [isUsersModalOpen, setUsersModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const handleProjectClick = (projectId: string) => {
        setSelectedProjectId(projectId);
        navigate(`/project/${projectId}/board`);
    };

    const handleCreate = () => {
        setSelectedProject(null);
        setFormOpen(true);
    };

    const handleEdit = (project: Project) => {
        setSelectedProject(project);
        setFormOpen(true);
    };

    const handleDelete = (project: Project) => {
        setSelectedProject(project);
        setDeleteConfirmOpen(true);
    };

    const handleManageUsers = (project: Project) => {
        setSelectedProject(project);
        setUsersModalOpen(true);
    };

    const handleFormSubmit = async (projectData: Pick<Project, 'name' | 'description'>) => {
        try {
            if (selectedProject) {
                await updateProject(selectedProject.id, projectData);
                Toast.success('Progetto aggiornato!');
            } else {
                await createProject(projectData);
                Toast.success('Progetto creato!');
            }
            setFormOpen(false);
        } catch {
            Toast.error('Errore nel salvataggio del progetto.');
        }
    };

    const confirmDelete = async (password: string) => {
        if (!selectedProject) return;
        // Verify password via backend authentication
        try {
            const token = btoa(`${currentUser!.email}:${password}`);
            await api.get(`/utenti/email/${currentUser!.email}`, {
                headers: { Authorization: `Basic ${token}` }
            });
        } catch {
            throw new Error('Password non valida');
        }
        try {
            await deleteProject(selectedProject.id);
            Toast.success('Progetto eliminato!');
            setDeleteConfirmOpen(false);
        } catch (error) {
            Toast.error('Errore nell\'eliminazione del progetto.');
            throw error;
        }
    };

    const isAdmin = currentUser?.role === USER_ROLE.ADMIN;
    const isModalOpen = isFormOpen || isDeleteConfirmOpen || isUsersModalOpen;

    return (
        <div className="flex flex-col h-full bg-background">
            <Header onMenuClick={onMenuClick} />
            <motion.div
                variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                initial="hidden"
                animate="visible"
                className="p-4 sm:p-6 flex-grow overflow-y-auto"
            >
                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(project => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onClick={() => handleProjectClick(project.id)}
                                onEdit={() => handleEdit(project)}
                                onDelete={() => handleDelete(project)}
                                onManageUsers={() => handleManageUsers(project)}
                                isAdmin={isAdmin}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="Nessun progetto trovato"
                        subtitle={isAdmin ? "Crea il primo progetto per iniziare!" : "Non sei membro di nessun progetto attivo."}
                        icon={<Icons.Ghost className="h-16 w-16 text-on-surface-variant/50" />}
                    />
                )}
            </motion.div>

            {isAdmin && (
                <AnimatePresence>
                    {!isModalOpen && (
                        <motion.div
                            layoutId="fab-create-project"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className="absolute bottom-8 right-8 z-20"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCreate}
                                className="bg-primary-container text-on-primary-container rounded-m3-l h-14 w-14 flex items-center justify-center shadow-lg focus:outline-none"
                                aria-label="Crea un nuovo progetto"
                            >
                                <Plus />
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {isMobile ? (
                <BottomSheet isOpen={isFormOpen} onClose={() => setFormOpen(false)} title={selectedProject ? 'Modifica Progetto' : 'Nuovo Progetto'}>
                    <ProjectFormModal isOpen={isFormOpen} onClose={() => setFormOpen(false)} onSubmit={handleFormSubmit} project={selectedProject ?? undefined} isBottomSheet />
                </BottomSheet>
            ) : (
                <ProjectFormModal isOpen={isFormOpen} onClose={() => setFormOpen(false)} onSubmit={handleFormSubmit} project={selectedProject ?? undefined} layoutId={!selectedProject ? "fab-create-project" : undefined} />
            )}

            {isMobile ? (
                <BottomSheet isOpen={isUsersModalOpen} onClose={() => setUsersModalOpen(false)} title="Gestisci Utenti">
                    <ProjectUsersModal isOpen={isUsersModalOpen} onClose={() => setUsersModalOpen(false)} project={selectedProject || undefined} isBottomSheet />
                </BottomSheet>
            ) : (
                <ProjectUsersModal isOpen={isUsersModalOpen} onClose={() => setUsersModalOpen(false)} project={selectedProject ?? undefined} />
            )}


            <PasswordConfirmModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Conferma Eliminazione Progetto"
                description={`Sei sicuro di voler eliminare "${selectedProject?.name}"? Questa azione è irreversibile.`}
                destructiveAction
            />
        </div>
    );
};