// src/components/layout/Header.tsx
import React, { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useProjects } from '../../context/ProjectContext.shared';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Icons } from '../common/Icons';
import { Breadcrumbs } from '../common/Breadcrumbs';

/**
 * Un header dinamico e contestuale che mostra un breadcrumb su desktop
 * e un titolo con icona su mobile.
 * @param {{ onMenuClick: () => void }} props
 */
export const Header = ({ onMenuClick }: { onMenuClick: () => void; }) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const params = useParams();
  const { selectedProject } = useProjects();

  const headerContent = useMemo(() => {
    const path = location.pathname;
    let icon: React.ReactNode | null = null;
    let pageTitle = '';
    let crumbs: { label: string; path?: string }[] = [];

    if (path.startsWith('/users')) {
      icon = <Icons.MyIssues />;
      pageTitle = 'Gestione Utenti';
      crumbs = [{ label: 'Area Admin' }, { label: 'Gestione Utenti' }];
    } else if (path.startsWith('/reports')) {
      icon = <Icons.Reports />;
      pageTitle = 'Reports';
      crumbs = [{ label: 'Area Admin' }, { label: 'Reports' }];
    }
    else if (params.projectId && selectedProject) {
      const projectCrumb = { label: selectedProject.name, path: `/project/${params.projectId}/board` };
      const baseCrumbs = [{ label: 'Progetti', path: '/' }, projectCrumb];

      if (path.endsWith('/board')) {
        icon = <Icons.Dashboard />;
        pageTitle = selectedProject.name;
        crumbs = [...baseCrumbs, { label: 'Dashboard' }];
      } else if (path.endsWith('/my-issues')) {
        icon = <Icons.MyIssues />;
        pageTitle = selectedProject.name;
        crumbs = [...baseCrumbs, { label: 'Le mie Issues' }];
      } else if (path.endsWith('/rejected')) {
        icon = <Icons.Rejected />;
        pageTitle = selectedProject.name;
        crumbs = [...baseCrumbs, { label: 'Rifiutate' }];
      } else if (path.endsWith('/archive')) {
        icon = <Icons.Archive />;
        pageTitle = selectedProject.name;
        crumbs = [...baseCrumbs, { label: 'Archivio' }];
      }
    }
    else {
      icon = <Icons.Dashboard />;
      pageTitle = 'I miei Progetti';
      crumbs = [{ label: 'I miei Progetti' }];
    }

    if (isMobile) {
      return (
        <div className="flex items-center gap-3 text-lg font-medium text-on-surface truncate">
          {icon}
          <span className="truncate">{pageTitle}</span>
        </div>
      );
    }
    return <Breadcrumbs crumbs={crumbs} />;
  }, [location.pathname, params.projectId, selectedProject, isMobile]);

  return (
    <header className="h-20 bg-surface flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-10 border-b border-outline-variant">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button onClick={onMenuClick} className="md:hidden text-on-surface flex-shrink-0 p-2 rounded-full hover:bg-surface-variant" aria-label="Apri menu">
          <Icons.Menu />
        </button>
        {headerContent}
      </div>
    </header>
  );
};