// /features/kanban/components/KanbanBoard.tsx
import { useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./KanbanColumn";
import { useKanban } from "../hooks/useKanban";
import { useKanbanStore } from "@/stores/kanbanStore";

interface KanbanBoardProps {
  projectId: string;
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { data: fetchedBoard, isLoading } = useKanban(projectId);
  const { boards, setBoard, moveCard } = useKanbanStore();

  // Initialize board from backend only if not already in store
  useEffect(() => {
    if (fetchedBoard && !boards[projectId]) {
      setBoard(projectId, fetchedBoard);
    }
  }, [fetchedBoard, projectId, boards, setBoard]);

  // Always use the Zustand store as source of truth (it syncs with backend)
  const board = boards[projectId] || fetchedBoard;

  const onDragEnd = (result: DropResult) => {
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
      projectId,
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
        <p className="text-gray-500">No board found for this project.</p>
      </div>
    );
  }

  return (
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
                projectId={projectId}
              />
            );
          })}
        </div>
      </div>
    </DragDropContext>
  );
}
