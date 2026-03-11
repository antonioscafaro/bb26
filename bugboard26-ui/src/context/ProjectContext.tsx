import { useState, type ReactNode, useMemo, useEffect, useCallback } from 'react';
import { ProjectContext } from './ProjectContext.shared';
import { useParams } from 'react-router-dom';
import type { Project, User, BackendProject, BackendUser } from '../types';
import api from '../api/axios';
import { useAuth } from './AuthContext.shared';
import { mapRoleFromBackend } from '../utils/mappers';



export const ProjectProvider = ({ children }: { children: ReactNode }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const { currentUser } = useAuth();
    const [selectedProjectId, setSelectedProjectIdState] = useState<string | null>(() => localStorage.getItem('selectedProjectId'));
    const [loading, setLoading] = useState(false);

    const params = useParams();

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            // If user is ADMIN, fetch all. If NORMAL, fetch only assigned.
            let endpoint = '/progetti';
            if (currentUser && currentUser.role === 'UTENTE') {
                endpoint = `/progetti/membri/${currentUser.email}`;
            }

            const response = await api.get<BackendProject[]>(endpoint);
            const mappedProjects: Project[] = response.data.map((p) => ({
                id: p.id.toString(),
                name: p.nome,
                description: p.descrizione,
                createdAt: p.data_creazione,
                members: [] // Members are fetched separately if needed
            }));
            setProjects(mappedProjects);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            fetchProjects();

            const handleProjectUpdate = () => {
                console.log("Context: Refreshing projects due to SSE event");
                fetchProjects();
            };

            window.addEventListener('project-update', handleProjectUpdate);
            return () => {
                window.removeEventListener('project-update', handleProjectUpdate);
            };
        }
    }, [currentUser, fetchProjects]);

    const setSelectedProjectId = (id: string | null) => {
        setSelectedProjectIdState(id);
        if (id) {
            localStorage.setItem('selectedProjectId', id);
        } else {
            localStorage.removeItem('selectedProjectId');
        }
    };

    useEffect(() => {
        const projectIdFromUrl = params.projectId;
        if (projectIdFromUrl && projectIdFromUrl !== selectedProjectId) {
            setSelectedProjectId(projectIdFromUrl);
        }
    }, [params.projectId, selectedProjectId]);

    const selectedProject = useMemo(() => {
        return projects.find(p => p.id === selectedProjectId) || null;
    }, [projects, selectedProjectId]);

    // Fetch members for selected project
    useEffect(() => {
        if (selectedProjectId) {
            const fetchMembers = async () => {
                try {
                    const response = await api.get<BackendUser[]>(`/progetti/${selectedProjectId}/membri`);
                    const members: User[] = response.data.map((u) => ({
                        id: u.email,
                        email: u.email,
                        name: u.nome,
                        surname: u.cognome,
                        role: mapRoleFromBackend(u.ruolo),
                        avatarUrl: `https://ui-avatars.com/api/?name=${u.nome}+${u.cognome}&background=random`
                    }));

                    setProjects(prev => prev.map(p =>
                        p.id === selectedProjectId ? { ...p, members } : p
                    ));
                } catch (error) {
                    console.error("Failed to fetch project members", error);
                }
            };
            fetchMembers();
        }
    }, [selectedProjectId]);

    const createProject = async (projectData: Omit<Project, 'id' | 'members'>) => {
        try {
            const response = await api.post('/progetti', {
                nome: projectData.name,
                descrizione: projectData.description,
                creatore: currentUser?.email // Inject current user email as creator
            });
            const newProject = response.data;
            const mappedProject: Project = {
                id: newProject.id.toString(),
                name: newProject.nome,
                description: newProject.descrizione,
                createdAt: newProject.data_creazione,
                members: []
            };
            setProjects(prev => [...prev, mappedProject]);
        } catch (error) {
            console.error("Failed to create project", error);
            throw error;
        }
    };

    const updateProject = async (projectId: string, projectData: Partial<Project>) => {
        try {
            // Note: Backend expects ProgettoCreateRequestDTO for update
            await api.put(`/progetti/${projectId}`, {
                nome: projectData.name,
                descrizione: projectData.description
            });
            setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...projectData } : p));
        } catch (error) {
            console.error("Failed to update project", error);
            throw error;
        }
    };

    const deleteProject = async (projectId: string) => {
        try {
            await api.delete(`/progetti/${projectId}`);
            setProjects(prev => prev.filter(p => p.id !== projectId));
            if (selectedProjectId === projectId) {
                setSelectedProjectId(null);
            }
        } catch (error) {
            console.error("Failed to delete project", error);
            throw error;
        }
    };

    const value = { projects, selectedProjectId, setSelectedProjectId, selectedProject, createProject, updateProject, deleteProject, loading };

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    );
};

