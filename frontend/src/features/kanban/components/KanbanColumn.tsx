// /features/kanban/components/KanbanColumn.tsx
import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Column, Card as CardType } from "@/lib/mockData";
import { KanbanCard } from "./KanbanCard";
import { AddCardModal } from "./AddCardModal";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface KanbanColumnProps {
  column: Column;
  cards: CardType[];
  boardId: string;
}

const columnColors: Record<string, { bg: string; header: string; badge: string }> = {
  todo: {
    bg: "bg-slate-50 dark:bg-slate-900/30",
    header: "bg-slate-200 dark:bg-slate-800",
    badge: "bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
  },
  inprogress: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    header: "bg-blue-200 dark:bg-blue-800",
    badge: "bg-blue-300 dark:bg-blue-700 text-blue-700 dark:text-blue-300",
  },
  done: {
    bg: "bg-green-50 dark:bg-green-900/20",
    header: "bg-green-200 dark:bg-green-800",
    badge: "bg-green-300 dark:bg-green-700 text-green-700 dark:text-green-300",
  },
};

export function KanbanColumn({ column, cards, boardId }: KanbanColumnProps) {
  const colorScheme = columnColors[column.id] || columnColors.todo;
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);

  return (
    <div className="flex-shrink-0 w-full md:w-[calc(33.333%-0.67rem)] md:min-w-[320px] lg:min-w-[360px]">
      <Card className={`h-full flex flex-col ${colorScheme.bg} border-2 border-gray-200 dark:border-gray-700 transition-all duration-300`}>
        {/* Column Header */}
        <div className={`px-4 py-3 ${colorScheme.header} rounded-t-lg border-b-2 border-gray-300 dark:border-gray-600 flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-gray-800 dark:text-gray-100">
              {column.title}
            </h2>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${colorScheme.badge}`}>
              {cards.length}
            </span>
          </div>
        </div>

        {/* Cards Container - Fixed height with scrolling */}
        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex-1 p-3 overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent transition-all duration-300 ease-in-out relative ${
                snapshot.isDraggingOver 
                  ? "bg-blue-100/50 dark:bg-blue-900/40 ring-2 ring-blue-400 dark:ring-blue-500 ring-inset" 
                  : ""
              }`}
            >
              {/* Drop indicator overlay */}
              {snapshot.isDraggingOver && (
                <div className="absolute inset-0 border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-md pointer-events-none z-10 animate-pulse" />
              )}
              
              {cards.length === 0 && !snapshot.isDraggingOver ? (
                <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500 text-sm">
                  Drop cards here
                </div>
              ) : (
                cards.map((card, index) => (
                  <KanbanCard key={card.id} card={card} index={index} />
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Add Card Button */}
        <div className="p-3 flex-shrink-0">
          <button
            onClick={() => setIsAddCardOpen(true)}
            className="w-full py-2 px-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          >
            <Plus size={16} />
            Add Card
          </button>
        </div>
      </Card>

      {/* Add Card Modal */}
      <AddCardModal
        isOpen={isAddCardOpen}
        onClose={() => setIsAddCardOpen(false)}
        columnId={column.id}
        boardId={boardId}
      />
    </div>
  );
}
