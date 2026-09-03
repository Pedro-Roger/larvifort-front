import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { BoardContainer } from '@/components/kanban/BoardContainer';
import { KanbanHeader } from '@/components/kanban/KanbanHeader';
import { BoardModal } from '@/components/kanban/modals/BoardModal';
import { ColumnModal } from '@/components/kanban/modals/ColumnModal';
import { TaskModal } from '@/components/kanban/modals/TaskModal';
import { ReorderColumnsModal } from '@/components/kanban/modals/ReorderColumnsModal';
import { DeleteConfirmModal } from '@/components/kanban/modals/DeleteConfirmModal';
import { TaskDetailModal } from '@/components/kanban/modals/TaskDetailModal';
import { useKanban } from '@/hooks/kanban/useKanban';
import { useProjectStore } from '@/store/kanban/projectStore';
import { boardsService } from '@/services/kanban/boardsService';
import { columnsService } from '@/services/kanban/columnsService';
import { tasksService } from '@/services/kanban/tasksService';
import type { Board, BoardColumn, Task, User } from '@/types/kanban';

export default function KanbanPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { setCurrentProject, setCurrentBoard } = useProjectStore();
  const { board, columns, tasks, loading, refresh } = useKanban(boardId ?? null);

  const [assignees] = useState<User[]>([]);

  // Modals
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | undefined>(undefined);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [editingColumn, setEditingColumn] = useState<BoardColumn | undefined>(undefined);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [preselectedColumnId, setPreselectedColumnId] = useState<string>();
  const [showReorderColumns, setShowReorderColumns] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'board' | 'column' | 'task'; id: string; name: string } | null>(null);
  const [taskDetail, setTaskDetail] = useState<Task | null>(null);

  useEffect(() => {
    if (board) {
      setCurrentProject(board.projectId);
      setCurrentBoard(board.id);
    }
  }, [board, setCurrentProject, setCurrentBoard]);

  const bid = boardId!;

  const handleTaskMove = useCallback(async (taskId: string, toColumnId: string, position: string) => {
    const task = tasks.find(t => t.id === taskId);
    try {
      await tasksService.move(bid, taskId, {
        fromColumnId: task?.boardColumnId || '',
        toColumnId,
        position,
      });
      refresh();
      toast.success('Card movido');
    } catch {
      toast.error('Erro ao mover card');
    }
  }, [tasks, refresh, bid]);

  const handleAddTask = useCallback((columnId?: string) => {
    setPreselectedColumnId(columnId);
    setEditingTask(undefined);
    setShowTaskModal(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  }, []);

  const handleRemoveTask = useCallback((task: Task) => {
    setDeleteConfirm({ type: 'task', id: task.id, name: task.title });
  }, []);

  const handleEditColumn = useCallback((col: BoardColumn) => {
    setEditingColumn(col);
    setShowColumnModal(true);
  }, []);

  const handleDeleteColumn = useCallback((col: BoardColumn) => {
    setDeleteConfirm({ type: 'column', id: col.id, name: col.name });
  }, []);

  const handleReorderColumns = useCallback(() => {
    setShowReorderColumns(true);
  }, []);

  const handleEditBoard = useCallback(() => {
    if (board) {
      setEditingBoard(board);
      setShowBoardModal(true);
    }
  }, [board]);

  const handleDeleteBoard = useCallback(() => {
    if (board) setDeleteConfirm({ type: 'board', id: board.id, name: board.name });
  }, [board]);

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'board') await boardsService.delete(deleteConfirm.id);
      else if (deleteConfirm.type === 'column') await columnsService.delete(deleteConfirm.id);
      else await tasksService.delete(bid, deleteConfirm.id);
      toast.success('Excluído');
      setDeleteConfirm(null);
      refresh();
    } catch {
      toast.error('Erro ao excluir');
    }
  }, [deleteConfirm, refresh, bid]);

  const handleCreateSubtask = useCallback(async (parentId: string, data: { title: string; description?: string }) => {
    await tasksService.createSubtask(bid, parentId, { ...data, boardColumnId: columns[0]?.id || '' });
    refresh();
  }, [bid, columns, refresh]);

  const handleUpdateSubtask = useCallback(async (subtaskId: string, data: Partial<Task>) => {
    await tasksService.update(bid, subtaskId, data);
    refresh();
  }, [bid, refresh]);

  const handleDeleteSubtask = useCallback(async (subtaskId: string) => {
    await tasksService.delete(bid, subtaskId);
    refresh();
  }, [bid, refresh]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Quadro não encontrado
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden flex-col">
      <KanbanHeader
        onEditBoard={handleEditBoard}
        onDeleteBoard={handleDeleteBoard}
        onReorderColumns={handleReorderColumns}
      />
      <BoardContainer
        columns={columns}
        tasks={tasks}
        onTaskMove={handleTaskMove}
        onAddTask={handleAddTask}
        onEditColumn={handleEditColumn}
        onDeleteColumn={(colId) => {
          const col = columns.find(c => c.id === colId);
          if (col) handleDeleteColumn(col);
        }}
        onEditTask={(task) => setTaskDetail(task)}
      />

      <BoardModal
        open={showBoardModal}
        onOpenChange={setShowBoardModal}
        board={editingBoard}
        onSubmit={async (d) => {
          if (editingBoard) await boardsService.update(editingBoard.id, d);
          else await boardsService.create(board.projectId, d);
          setShowBoardModal(false);
          refresh();
        }}
        loading={false}
      />

      <ColumnModal
        open={showColumnModal}
        onOpenChange={setShowColumnModal}
        column={editingColumn}
        existingColumns={columns}
        onSubmit={async (d) => {
          if (editingColumn) await columnsService.update(editingColumn.id, d);
          else await columnsService.create(bid, d);
          setShowColumnModal(false);
          refresh();
        }}
        loading={false}
      />

      <TaskModal
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
        task={editingTask}
        columns={columns}
        assignees={assignees}
        clients={[]}
        orders={[]}
        onSubmit={async (d) => {
          if (editingTask) await tasksService.update(bid, editingTask.id, d);
          else await tasksService.create(bid, d);
          setShowTaskModal(false);
          refresh();
        }}
        loading={false}
        preselectedColumnId={preselectedColumnId}
      />

      <ReorderColumnsModal
        open={showReorderColumns}
        onOpenChange={setShowReorderColumns}
        columns={columns}
        onSubmit={async (ordered) => {
          await columnsService.reorder(bid, { columnIds: ordered.map(c => c.id) });
          setShowReorderColumns(false);
          refresh();
        }}
        loading={false}
      />

      <DeleteConfirmModal
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Confirmar exclusão"
        description="Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        loading={false}
        itemName={deleteConfirm?.name}
      />

      {taskDetail && (
        <TaskDetailModal
          open={!!taskDetail}
          onOpenChange={() => setTaskDetail(null)}
          task={taskDetail}
          columns={columns}
          assignees={assignees}
          onUpdate={async (id, d) => { await tasksService.update(bid, id, d); refresh(); }}
          onDelete={async (id) => { await tasksService.delete(bid, id); setTaskDetail(null); refresh(); }}
          onMove={async (id, colId) => {
            const task = tasks.find(t => t.id === id);
            await tasksService.move(bid, id, { toColumnId: colId, position: task?.position || '', fromColumnId: task?.boardColumnId || '' });
            setTaskDetail(null);
            refresh();
          }}
          onCreateSubtask={handleCreateSubtask}
          onUpdateSubtask={handleUpdateSubtask}
          onDeleteSubtask={handleDeleteSubtask}
        />
      )}
    </div>
  );
}
