import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ArchiveRestore } from 'lucide-react';

import { useIssues } from '../context/IssueContext.shared';
import { useProjects } from '../context/ProjectContext.shared';
import { useIsMobile } from '../hooks/useIsMobile';
import { Toast } from '../components/common/Toast';
import { getApiErrorMessage } from '../utils/apiErrors';
import type { User } from '../types';
import { ISSUE_STATUS, USER_ROLE } from '../constants';

import { Header } from '../components/layout/Header';
import { IssueListPage } from '../components/issues/IssueListPage';
import { StatusIssueCard } from '../components/issues/StatusIssueCard';

type PageContext = {
  currentUser: User;
  onMenuClick: () => void;
};

/**
 * Page displaying archived issues with restore functionality
 * Includes exit animations and toast notifications
 */
export const ArchivedIssuesPage = () => {
  const { currentUser, onMenuClick } = useOutletContext<PageContext>();
  const { state, updateIssue } = useIssues();
  const { selectedProjectId } = useProjects();
  const isMobile = useIsMobile();
  const [exitingIssues, setExitingIssues] = useState<Set<string>>(new Set());
  const isAdmin = currentUser.role === USER_ROLE.ADMIN;

  const archivedIssues = useMemo(() =>
    state.issues.filter(i => i.status === 'archived' && i.projectId === selectedProjectId),
    [state.issues, selectedProjectId]
  );

  const handleRestore = async (issueId: string) => {
    const issue = archivedIssues.find(i => i.id === issueId);
    if (!issue || !isAdmin) return;

    try {
      // Add exit animation
      setExitingIssues(prev => new Set(prev).add(issueId));

      // Wait for animation to complete
      setTimeout(async () => {
        await updateIssue(issueId, { status: ISSUE_STATUS.TODO });

        Toast.success(`Issue "${issue.title}" ripristinata in To Do`);

        // Remove from exiting set
        setExitingIssues(prev => {
          const newSet = new Set(prev);
          newSet.delete(issueId);
          return newSet;
        });
      }, isMobile ? 300 : 400);

    } catch (error) {
      Toast.error(getApiErrorMessage(error, 'Errore durante il ripristino della issue'));
      setExitingIssues(prev => {
        const newSet = new Set(prev);
        newSet.delete(issueId);
        return newSet;
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <Header onMenuClick={onMenuClick} />
      <IssueListPage
        issues={archivedIssues}
        currentUser={currentUser}
        onMenuClick={onMenuClick}
        renderIssueCard={(props) => {
          const isExiting = exitingIssues.has(props.issue.id);
          return (
            <div
              className={isExiting ? (isMobile ? 'card-exit-mobile' : 'card-exit') : ''}
              style={{ pointerEvents: isExiting ? 'none' : 'auto' }}
            >
              <StatusIssueCard
                {...props}
                actionIcon={<ArchiveRestore className="h-4 w-4" />}
                footerText={`Archiviata da ${props.issue.reporter.name}`}
                disabled={isExiting}
                isAdmin={isAdmin}
              />
            </div>
          );
        }}
        onConfirmAction={handleRestore}
        confirmModalTitle="Conferma Ripristino"
        confirmModalBody={(title: string) => (
          <p>
            Sei sicuro di voler ripristinare l'issue <strong className="text-on-surface">{title}</strong>?
            Verrà spostata nella colonna "To Do".
          </p>
        )}
        emptyStateTitle="Nessuna issue archiviata"
        emptyStateSubtitle="Quando un'issue viene archiviata, appare qui."
      />
    </div>
  );
};