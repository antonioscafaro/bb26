import type { Issue, User, DragItem } from '../../types/index.ts';
import { typeConfig, priorityConfig } from '../../config/uiConstants';
import { motion, useReducedMotion } from 'framer-motion';
import { useIsMobile } from '../../hooks/useIsMobile';

interface IssueCardProps {
  issue: Issue;
  onClick: () => void;
  isSelected: boolean;
  dragAndDropProps?: {
    handleDragStart: (item: DragItem, e: React.DragEvent) => void;
    handleDragEnd: () => void;
    isDraggedItem: (id: string) => boolean;
  };
  isExiting?: boolean;
  currentUser: User;
}

/**
 * A card component that displays a summary of an issue.
 * Supports drag and drop on desktop with visual feedback
 */
export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onClick,
  isSelected,
  dragAndDropProps,
  isExiting = false,
  currentUser
}) => {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const priority = issue.priority ? priorityConfig[issue.priority] : null;

  const isDragging = dragAndDropProps?.isDraggedItem && dragAndDropProps.isDraggedItem(issue.id);
  const canMove =
    currentUser.role === 'AMMINISTRATORE' ||
    (issue.assignee && issue.assignee.email === currentUser.email) ||
    (issue.reporter && issue.reporter.email === currentUser.email);

  const canDrag = !isMobile && dragAndDropProps && !isExiting && canMove;

  const hoverProps = reduceMotion || isDragging || isExiting ? {} : {
    whileHover: { y: -4, transition: { duration: 0.15 } }
  };

  const cardProps = canDrag && dragAndDropProps ? {
    draggable: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onDragStart: (e: any) => {
      const dragItem: DragItem = {
        id: issue.id,
        status: issue.status,
        type: 'issue'
      };
      dragAndDropProps.handleDragStart(dragItem, e);
    },
    onDragEnd: dragAndDropProps.handleDragEnd
  } : {};

  return (
    <motion.div
      layout
      layoutId={isSelected ? undefined : `card-container-${issue.id}`}
      data-layout-id={`card-container-${issue.id}`}
      onClick={!isExiting ? onClick : undefined}
      style={{
        opacity: isSelected ? 0 : (isDragging ? 0.5 : 1),
        cursor: isExiting ? 'not-allowed' : (canDrag ? 'grab' : 'pointer')
      }}
      className={`bg-surface-variant rounded-m3-l p-4 w-full shadow-sm hover:shadow-lg transition-shadow duration-200 ${isDragging ? 'drag-preview' : ''
        } ${isExiting ? 'pointer-events-none' : ''
        }`}
      {...hoverProps}
      {...cardProps}
    >
      <motion.h3
        layoutId={isSelected ? undefined : `card-title-${issue.id}`}
        className="font-medium text-on-surface mb-2 truncate select-none"
      >
        {issue.title}
      </motion.h3>

      <div className="flex items-center text-sm text-on-surface-variant/80 mb-3 select-none">
        {issue.type && typeConfig[issue.type] ? (
          <>
            <span className="mr-1.5">{typeConfig[issue.type].icon}</span>
            <span>{typeConfig[issue.type].label}</span>
          </>
        ) : null}
      </div>

      <motion.div layout className="flex flex-wrap gap-2 mb-4 min-h-[26px]">
        {(issue.labels || []).slice(0, 3).map(label => (
          <span
            key={label}
            className="text-xs font-medium bg-secondary-container text-on-secondary-container px-2 py-1 rounded-m3-sm select-none"
          >
            {label}
          </span>
        ))}
      </motion.div>

      <div className="flex justify-between items-center select-none">
        {priority ? (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-m3-sm ${priority.bg} ${priority.text}`}>
            {priority.name}
          </span>
        ) : <div />}

        <div className="w-8 h-8 flex-shrink-0">
          {issue.assignee ? (
            <img
              src={issue.assignee.avatarUrl}
              alt={issue.assignee.name}
              width={32}
              height={32}
              loading="eager"
              className="w-full h-full rounded-full ring-2 ring-background"
              title={issue.assignee.name}
              draggable={false}
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full bg-surface border-2 border-dashed border-outline"
              title="Non assegnato"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};