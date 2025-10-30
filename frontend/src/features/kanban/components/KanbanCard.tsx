// /features/kanban/components/KanbanCard.tsx
import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Card as CardType } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";
import { InlineEditor } from "./InlineEditor";
import { useKanbanStore } from "@/stores/kanbanStore";
import { useRouter } from "next/router";

interface KanbanCardProps {
  card: CardType;
  index: number;
}

const labelColors: Record<string, string> = {
  setup: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  UI: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  data: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  state: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  review: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  frontend: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  design: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
};

export function KanbanCard({ card, index }: KanbanCardProps) {
  const router = useRouter();
  const { id: projectId } = router.query;
  const { updateCard } = useKanbanStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  const handleTitleUpdate = (newTitle: string) => {
    if (newTitle.trim() && newTitle !== card.title) {
      updateCard(projectId as string, card.id, { title: newTitle.trim() });
    }
  };

  const handleDescUpdate = (newDesc: string) => {
    if (newDesc.trim() !== card.description) {
      updateCard(projectId as string, card.id, { description: newDesc.trim() });
    }
  };

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={provided.draggableProps.style}
        >
          <Card 
            style={{
              transform: snapshot.isDragging ? 'rotate(3deg) scale(1.05)' : 'rotate(0deg) scale(1)',
              transition: snapshot.isDragging 
                ? 'box-shadow 150ms ease, opacity 150ms ease' 
                : 'all 180ms cubic-bezier(0.2, 0, 0, 1)',
            }}
            className={`p-4 mb-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
              snapshot.isDragging 
                ? "shadow-2xl ring-2 ring-blue-400 dark:ring-blue-500 opacity-90" 
                : "hover:scale-[1.02] hover:shadow-lg hover:-translate-y-0.5"
            }`}
          >
            {/* Drag handle - separate from editable content */}
            <div 
              {...provided.dragHandleProps}
              className="cursor-grab active:cursor-grabbing -mx-4 -mt-4 px-4 pt-2 pb-1 mb-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-t-lg transition-colors"
            >
              <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto" />
            </div>

            <div className="space-y-3">
              {/* Editable Title */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingTitle(true);
                }}
                className={`${!isEditingTitle && 'cursor-text hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded px-1 -mx-1'}`}
              >
                {isEditingTitle ? (
                  <InlineEditor
                    content={card.title}
                    placeholder="Card title..."
                    onUpdate={handleTitleUpdate}
                    onBlur={() => setIsEditingTitle(false)}
                    className="font-medium text-sm text-gray-900 dark:text-gray-100"
                  />
                ) : (
                  <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 leading-tight">
                    {card.title}
                  </h3>
                )}
              </div>

              {/* Editable Description */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingDesc(true);
                }}
                className={`${!isEditingDesc && 'cursor-text hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded px-1 -mx-1'}`}
              >
                {isEditingDesc ? (
                  <InlineEditor
                    content={card.description || ''}
                    placeholder="Add description..."
                    onUpdate={handleDescUpdate}
                    onBlur={() => setIsEditingDesc(false)}
                    className="text-xs text-gray-600 dark:text-gray-400"
                  />
                ) : (
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {card.description || <span className="text-gray-400 dark:text-gray-500 italic">Add description...</span>}
                  </p>
                )}
              </div>

              {card.labels && card.labels.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {card.labels.map((label) => (
                    <span
                      key={label}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        labelColors[label] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1">
                {card.assignee && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>{card.assignee}</span>
                  </div>
                )}

                {card.dueDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(card.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
