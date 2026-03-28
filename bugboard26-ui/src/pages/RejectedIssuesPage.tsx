import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { useIssues } from '../context/IssueContext.shared';
import { useProjects } from '../context/ProjectContext.shared';
import type { User } from '../types';
import { ISSUE_STATUS, USER_ROLE } from '../constants';
import { Header } from '../components/layout/Header';
import { IssueListPage } from '../components/issues/IssueListPage';
import { StatusIssueCard } from '../components/issues/StatusIssueCard';
import { useIsMobile } from '../hooks/useIsMobile';
import { Toast } from '../components/common/Toast';
import { getApiErrorMessage } from '../utils/apiErrors';

type PageContext = {
  currentUser: User;
  onMenuClick: () => void;
};

export const RejectedIssuesPage = () => {
  const { currentUser, onMenuClick } = useOutletContext<PageContext>();
  const { state, updateIssue } = useIssues();
  const { selectedProjectId } = useProjects();
  const isMobile = useIsMobile();
  const [exitingIssues, setExitingIssues] = useState<Set<string>>(new Set());
  const isAdmin = currentUser.role === USER_ROLE.ADMIN;

  const rejectedIssues = useMemo(() =>
    state.issues.filter(i =>
      i.status === 'rejected' &&
      i.projectId === selectedProjectId
    ),
    [state.issues, selectedProjectId]
  );

  const handleReopen = (issueId: string) => {
    const issue = rejectedIssues.find(i => i.id === issueId);
    if (!issue || !isAdmin) return;

    try {
      setExitingIssues(prev => new Set(prev).add(issueId));

      setTimeout(async () => {
        await updateIssue(issueId, { status: ISSUE_STATUS.TODO });

        Toast.success(`Issue "${issue.title}" riaperta in To Do`);

        setExitingIssues(prev => {
          const newSet = new Set(prev);
          newSet.delete(issueId);
          return newSet;
        });
      }, isMobile ? 300 : 400);

    } catch (error) {
      Toast.error(getApiErrorMessage(error, "Errore durante la riapertura dell'issue"));
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
        issues={rejectedIssues}
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
                actionIcon={<RotateCcw className="h-4 w-4" />}
                footerText="Rifiutata da Admin"
                disabled={isExiting}
                isAdmin={isAdmin}
              />
            </div>
          );
        }}
        onConfirmAction={handleReopen}
        confirmModalTitle="Conferma Riapertura"
        confirmModalBody={(title: string) => <p>Sei sicuro di voler riaprire l'issue <strong className="text-on-surface">{title}</strong>? Verrà spostata nella colonna "To Do".</p>}
        emptyStateTitle="Nessuna issue rifiutata"
        emptyStateSubtitle="Le issue rigettate durante la revisione appariranno qui."
      />
    </div>
  );
};