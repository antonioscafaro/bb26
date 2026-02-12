import type { Issue, User, DragItem } from '../../types/index.ts';
import { IssueCard } from './IssueCard.tsx';
import { motion, type Variants } from 'framer-motion';
import React, { useMemo } from 'react';
import { Icons } from '../common/Icons.tsx';
import { useIsMobile } from '../../hooks/useIsMobile';

interface KanbanColumnProps {
  title: string;
  issues: Issue[];
  onCardClick: (issue: Issue) => void;
  selectedIssueId?: string;
  isModalOpen: boolean;
  exitingIssues?: Set<string>;
  dragAndDropProps?: {
    handleDragOver: (e: React.DragEvent) => void;
    handleDragEnter: (status: string, e: React.DragEvent) => void;
    handleDragLeave: (e: React.DragEvent) => void;
    handleDrop: (status: string, e: React.DragEvent) => void;
    isDropZoneActive: (status: string) => boolean;
    handleDragStart: (item: DragItem, e: React.DragEvent) => void;
    handleDragEnd: () => void;
    isDraggedItem: (id: string) => boolean;
  };
  status: string;
  currentUser: User;
}

const emptyStateMessages: Record<string, { title: string; subtitle: string }> = {
  "To Do": {
    title: "Tutto pulito!",
    subtitle: "Nessuna nuova issue da affrontare.",
  },
  "In Progress": {
    title: "Niente in lavorazione",
    subtitle: "Prenditi un caffè, te lo meriti.",
  },
  "In Review": {
    title: "Nessuna review pendente",
    subtitle: "Tutto sembra essere sotto controllo.",
  },
  "Done": {
    title: "Ancora nulla di fatto",
    subtitle: "Forza, completa qualche task!",
  },
};

const listVariants: Variants = {
  visible: {
    transition: { staggerChildren: 0.05 },
  },
  hidden: {},
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 25 } }
};

/**
 * Kanban column component with drag and drop support for desktop
 * Shows issues in a vertical layout with animations and empty states
 */
export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  issues,
  onCardClick,
  selectedIssueId,
  isModalOpen,
  exitingIssues = new Set(),
  dragAndDropProps,
  status,
  currentUser
}) => {
  const isMobile = useIsMobile();
  const emptyState = useMemo(() => emptyStateMessages[title] || { title: "Nessuna issue qui", subtitle: "Sembra tutto tranquillo." }, [title]);

  const columnProps = !isMobile && dragAndDropProps ? {
    onDragOver: dragAndDropProps.handleDragOver,
    onDragEnter: (e: React.DragEvent) => dragAndDropProps.handleDragEnter(status, e),
    onDragLeave: dragAndDropProps.handleDragLeave,
    onDrop: (e: React.DragEvent) => dragAndDropProps.handleDrop(status, e),
  } : {};

  const isActiveDropZone = !isMobile && dragAndDropProps?.isDropZoneActive && dragAndDropProps.isDropZoneActive(status);

  return (
    <div
      className={`bg-surface rounded-m3-xl p-3 flex flex-col max-h-full w-full min-w-0 md:w-80 lg:w-96 flex-shrink-0 overflow-visible transition-all duration-200 ${isActiveDropZone ? 'drop-zone-active' : ''
        }`}
      {...columnProps}
    >
      <h2 className="text-on-surface-variant font-medium mb-4 px-2 flex-shrink-0">
        {title} ({issues.length})
      </h2>

      <div className={`flex-grow overflow-y-auto no-scrollbar ${isModalOpen ? '!overflow-visible' : ''}`}>
        {issues.length > 0 ? (
          <motion.div
            key={`${title}-list`}
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {issues.map(issue => {
              const isExiting = exitingIssues.has(issue.id);

              return (
                <motion.div
                  key={issue.id}
                  variants={itemVariants}
                  className={isExiting ? (isMobile ? 'card-exit-mobile' : 'card-exit') : ''}
                  style={{
                    pointerEvents: isExiting ? 'none' : 'auto'
                  }}
                >
                  <IssueCard
                    issue={issue}
                    onClick={() => !isExiting && onCardClick(issue)}
                    isSelected={issue.id === selectedIssueId}
                    dragAndDropProps={dragAndDropProps}
                    isExiting={isExiting}
                    currentUser={currentUser}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key={`${title}-empty`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="border-2 border-dashed border-outline-variant rounded-m3-l min-h-[6rem] flex flex-col items-center justify-center text-center m-2 p-4"
          >
            <Icons.Ghost className="h-8 w-8 mb-2 text-on-surface-variant/40" />
            <p className="text-sm font-medium text-on-surface-variant">{emptyState.title}</p>
            <p className="text-xs text-on-surface-variant/80">{emptyState.subtitle}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};