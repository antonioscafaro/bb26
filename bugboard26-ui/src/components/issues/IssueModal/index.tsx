// src/components/issues/IssueModal/index.tsx
import React, { useState, useEffect, type ReactNode } from 'react';
import type { Issue, User } from '../../../types/index.ts';
import { motion, type Variants } from 'framer-motion';
import { IssueModalHeader } from './IssueModalHeader.tsx';
import { IssueModalBody } from './IssueModalBody.tsx';
import { IssueModalSidebar } from './IssueModalSidebar.tsx';
import { USER_ROLE } from '../../../constants.ts';
import { useIssues } from '../../../context/IssueContext.shared';

interface IssueModalProps {
  issue: Issue | null;
  onClose: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onReopen?: () => void;
  currentUser: User;
  children?: ReactNode;
  isConfirmationOpen?: boolean;
}

export const IssueModal: React.FC<IssueModalProps> = ({
  issue,
  onClose,
  onArchive,
  onRestore,
  onReopen,
  currentUser,
  children,
  isConfirmationOpen = false
}) => {
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(issue);
  const [isStatusChanging, setIsStatusChanging] = useState(false);

  useEffect(() => {
    if (issue) setCurrentIssue(issue);
  }, [issue]);

  // Sync entire issue from context when updates occur (SSE or local actions)
  const { state } = useIssues();

  useEffect(() => {
    if (currentIssue) {
      const updatedFromContext = state.issues.find(i => i.id === currentIssue.id);
      if (updatedFromContext) {
        // If status changed (e.g. moved to another column by someone else), close the modal
        // We check if local status is different from remote status. 
        // Note: For local actions, IssueModalSidebar handles closing, but this covers remote updates.
        if (updatedFromContext.status !== currentIssue.status) {
          onClose();
          return;
        }

        // Deep compare to avoid unnecessary re-renders, but ensure we catch all updates (labels, etc.)
        if (JSON.stringify(updatedFromContext) !== JSON.stringify(currentIssue)) {
          setCurrentIssue(updatedFromContext);
        }
      }
    }
  }, [state.issues, currentIssue, onClose]);

  if (!issue || !currentIssue) return null;

  const isArchived = currentIssue?.status === 'archived';
  const isRejected = currentIssue?.status === 'rejected';
  const isDone = currentIssue?.status === 'done';
  const isAdmin = currentUser.role === USER_ROLE.ADMIN;
  const isAssignee = currentIssue?.assignee?.id === currentUser.id;
  const isAuthor = currentIssue?.reporter?.id === currentUser.id;
  const canEdit = !isArchived && !isRejected && !isDone && (isAdmin || isAssignee || isAuthor);
  const canEditDescription = !isArchived && !isRejected && !isDone && (isAdmin || isAuthor);

  // Handle status change immediate blur removal
  const handleStatusChangeStart = () => {
    setIsStatusChanging(true);
  };

  // Modal exit animation - keep shared layout morph
  const modalExitVariant: Variants = {
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "circOut"
      }
    }
  };

  const shouldShowBlur = isConfirmationOpen && !isStatusChanging;

  return (
    <div className="fixed inset-0 z-50 flex justify-center overflow-y-auto p-0 sm:p-4">
      {/* Backdrop Overlay */}
      <motion.div
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "circOut" }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        layoutId={`card-container-${issue.id}`}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit="exit"
        variants={modalExitVariant}
        transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 1 }}
        className="relative bg-surface shadow-2xl w-full h-dvh sm:h-auto sm:max-w-5xl sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-m3-xl"
      >
        <div className={`flex flex-col h-full transition-all duration-200 ${shouldShowBlur ? 'blur-sm pointer-events-none' : ''}`}>
          {/* Header */}
          <IssueModalHeader
            issue={currentIssue}
            onClose={onClose}
            onArchive={onArchive}
            onRestore={onRestore}
            onReopen={onReopen}
            isAdmin={isAdmin}
            canEditTitle={canEditDescription}
            setCurrentIssue={setCurrentIssue as React.Dispatch<React.SetStateAction<Issue>>}
          />

          {/* Body and Sidebar */}
          <div className="flex-grow flex flex-col lg:flex-row min-h-0">
            <IssueModalBody
              issue={currentIssue}
              currentUser={currentUser}
              setCurrentIssue={setCurrentIssue as React.Dispatch<React.SetStateAction<Issue>>}
              canEdit={canEdit}
              canEditDescription={canEditDescription}
              isAdmin={isAdmin}
              isAssignee={isAssignee}
              onClose={onClose}
            >
              {children}
            </IssueModalBody>
            <IssueModalSidebar
              issue={currentIssue}
              canEdit={canEdit}
              isAdmin={isAdmin}
              isAssignee={isAssignee}
              setCurrentIssue={setCurrentIssue as React.Dispatch<React.SetStateAction<Issue>>}
              onClose={onClose}
              onStatusChangeStart={handleStatusChangeStart}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
