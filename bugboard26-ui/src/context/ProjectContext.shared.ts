import { createContext, useContext } from 'react';
import type { Project } from '../types';

export interface ProjectContextType {
    projects: Project[];
    selectedProjectId: string | null;
    setSelectedProjectId: (id: string | null) => void;
    selectedProject: Project | null;
    createProject: (projectData: Omit<Project, 'id' | 'members'>) => Promise<void>;
    updateProject: (projectId: string, projectData: Partial<Project>) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    loading: boolean;
}

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProjects deve essere usato all\'interno di un ProjectProvider');
    }
    return context;
};
