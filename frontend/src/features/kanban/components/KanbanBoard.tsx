// /features/kanban/components/KanbanBoard.tsx
import { useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Eye } from "lucide-react";
import { KanbanColumn } from "./KanbanColumn";
import { useKanban } from "../hooks/useKanban";
import { useKanbanStore } from "@/stores/kanbanStore";
import { usePermissions } from "@/features/auth/hooks";
import toast from "react-hot-toast";

interface KanbanBoardProps {
  projectId: string;
  boardId: string;
}

export function KanbanBoard({ projectId, boardId }: KanbanBoardProps) {
  const { can } = usePermissions();
  const canEdit = can('edit');
  const { data: fetchedBoard, isLoading } = useKanban(boardId);
  const { boards, setBoard, moveCard } = useKanbanStore();

  // Initialize board from backend only if not already in store
  useEffect(() => {
    if (fetchedBoard && !boards[boardId]) {
      setBoard(boardId, fetchedBoard as any);
    }
  }, [fetchedBoard, boardId, boards, setBoard]);

  // Always use the Zustand store as source of truth (it syncs with backend)
  const board = boards[boardId] || fetchedBoard;

  const onDragEnd = (result: DropResult) => {
    // Prevent drag if user doesn't have edit permission
    if (!canEdit) {
      toast.error("You don't have permission to move cards");
      return;
    }

    const { source, destination, draggableId } = result;

    // Dropped outside the list
    if (!destination) return;

    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Move the card
    moveCard(
      boardId,
      draggableId,
      source.droppableId,
      destination.droppableId,
      destination.index
    );
  };

  if (isLoading && !board) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">No board found.</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      {!canEdit && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2 text-sm text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span>You have view-only access to this board</span>
        </div>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="h-full p-4 md:p-6 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 h-full min-w-full md:min-w-0 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            {board.columnOrder.map((columnId) => {
              const column = board.columns[columnId];
              const cards = column.cardIds
                .map((cardId) => board.cards[cardId])
                .filter(Boolean);

              return (
                <KanbanColumn 
                  key={column.id} 
                  column={column} 
                  cards={cards}
                  boardId={boardId}
                />
              );
            })}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
