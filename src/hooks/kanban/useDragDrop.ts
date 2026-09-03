import { useState, useCallback, useRef } from 'react';
import type { Task, BoardColumn } from '@/types/kanban';

interface DragState {
  draggedTask: Task | null;
  draggedOverColumn: string | null;
  isDragging: boolean;
}

export function useDragDrop(
  _columns: BoardColumn[],
  tasks: Task[],
  onMoveTask: (taskId: string, newColumnId: string, newPosition: string) => void
) {
  const [dragState, setDragState] = useState<DragState>({
    draggedTask: null,
    draggedOverColumn: null,
    isDragging: false,
  });

  const dragSourceRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, task: Task) => {
      dragSourceRef.current = e.currentTarget;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('application/json', JSON.stringify(task));
      setDragState({
        draggedTask: task,
        draggedOverColumn: null,
        isDragging: true,
      });
    },
    []
  );

  const handleDragEnd = useCallback(() => {
    setDragState({
      draggedTask: null,
      draggedOverColumn: null,
      isDragging: false,
    });
    dragSourceRef.current = null;
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, columnId: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragState((prev) => ({ ...prev, draggedOverColumn: columnId }));
    },
    []
  );

  const handleDragLeave = useCallback(
    (_e: React.DragEvent<HTMLDivElement>, columnId: string) => {
      if (dragState.draggedOverColumn === columnId) {
        setDragState((prev) => ({ ...prev, draggedOverColumn: null }));
      }
    },
    [dragState.draggedOverColumn]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, columnId: string) => {
      e.preventDefault();
      const data = e.dataTransfer.getData('application/json');
      if (!data) return;

      try {
        const task: Task = JSON.parse(data);
        if (task.boardColumnId === columnId) {
          handleDragEnd();
          return;
        }

        const columnTasks = tasks
          .filter((t) => t.boardColumnId === columnId)
          .sort((a, b) => a.position.localeCompare(b.position));

        let newPosition: string;
        if (columnTasks.length === 0) {
          newPosition = 'a';
        } else {
          const lastTask = columnTasks[columnTasks.length - 1];
          newPosition = lastTask.position + 'a';
        }

        onMoveTask(task.id, columnId, newPosition);
      } catch {
        console.error('Invalid drag data');
      } finally {
        handleDragEnd();
      }
    },
    [tasks, onMoveTask, handleDragEnd]
  );

  const getDragProps = (task: Task) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => handleDragStart(e, task),
    onDragEnd: handleDragEnd,
  });

  const getColumnDropProps = (columnId: string) => ({
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => handleDragOver(e, columnId),
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => handleDragLeave(e, columnId),
    onDrop: (e: React.DragEvent<HTMLDivElement>) => handleDrop(e, columnId),
  });

  return {
    dragState,
    getDragProps,
    getColumnDropProps,
  };
}