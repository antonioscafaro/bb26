import { useState, useEffect } from 'react';
import type { DragItem } from '../types';

export interface DropResult {
  draggedId: string;
  sourceStatus: string;
  targetStatus: string;
}

/**
 * Custom hook for handling drag and drop functionality in kanban board
 * Provides desktop-only drag and drop with visual feedback
 */
export const useDragAndDrop = (onDrop: (result: DropResult) => void) => {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dropZone, setDropZone] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDragStart = (item: DragItem, event: React.DragEvent) => {
    if (isMobile) {
      event.preventDefault();
      return;
    }

    setDraggedItem(item);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', item.id);

    // Add visual feedback
    if (event.target instanceof HTMLElement) {
      event.target.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (event?: React.DragEvent) => { // Made event optional to match KanbanColumnProps if needed, or check usage
    if (isMobile) return;

    // Reset visual feedback
    if (event && event.target instanceof HTMLElement) {
      event.target.style.opacity = '1';
    }

    setDraggedItem(null);
    setDropZone(null);
  };

  const handleDragOver = (event: React.DragEvent) => {
    if (isMobile) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (status: string, event: React.DragEvent) => {
    if (isMobile) return;

    event.preventDefault();
    if (draggedItem && draggedItem.status !== status) {
      setDropZone(status);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    if (isMobile) return;

    // Only remove drop zone if leaving the entire drop area
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDropZone(null);
    }
  };

  const handleDrop = (targetStatus: string, event: React.DragEvent) => {
    if (isMobile) return;

    event.preventDefault();

    if (draggedItem && draggedItem.status !== targetStatus) {
      const result: DropResult = {
        draggedId: draggedItem.id,
        sourceStatus: draggedItem.status,
        targetStatus
      };

      onDrop(result);
    }

    setDraggedItem(null);
    setDropZone(null);
  };

  const isDragging = draggedItem !== null;
  const isDropZoneActive = (status: string) => dropZone === status;
  const isDraggedItem = (id: string) => draggedItem?.id === id;

  return {
    // State
    isDragging,
    isMobile,
    draggedItem,

    // Helpers
    isDropZoneActive,
    isDraggedItem,

    // Drag handlers
    handleDragStart,
    handleDragEnd,

    // Drop handlers
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop
  };
};
