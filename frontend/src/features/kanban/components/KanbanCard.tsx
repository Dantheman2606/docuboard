// /features/kanban/components/KanbanCard.tsx
import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Card as CardType } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { Calendar, User, Trash2 } from "lucide-react";
import { InlineEditor } from "./InlineEditor";
import { useKanbanStore } from "@/stores/kanbanStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface KanbanCardProps {
  card: CardType;
  index: number;
  boardId: string;
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

export function KanbanCard({ card, index, boardId }: KanbanCardProps) {
  const { updateCard, updateCardWithActivity, deleteCard } = useKanbanStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [originalTitle, setOriginalTitle] = useState(card.title);
  const [originalDesc, setOriginalDesc] = useState(card.description);

  const handleTitleUpdate = (newTitle: string) => {
    // Update on every keystroke (no activity logging)
    updateCard(boardId, card.id, { title: newTitle.trim() });
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    // Only log activity if the title actually changed
    if (card.title !== originalTitle) {
      updateCardWithActivity(boardId, card.id, { title: card.title });
      setOriginalTitle(card.title);
    }
  };

  const handleDescUpdate = (newDesc: string) => {
    // Update on every keystroke (no activity logging)
    updateCard(boardId, card.id, { description: newDesc.trim() });
  };

  const handleDescBlur = () => {
    setIsEditingDesc(false);
    // Only log activity if the description actually changed
    if (card.description !== originalDesc) {
      updateCardWithActivity(boardId, card.id, { description: card.description });
      setOriginalDesc(card.description);
    }
  };

  const handleDelete = () => {
    deleteCard(boardId, card.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
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
            {/* Drag handle - larger area for easier dragging */}
            <div 
              {...provided.dragHandleProps}
              className="cursor-grab active:cursor-grabbing -mx-4 -mt-4 px-4 pt-3 pb-3 mb-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-t-lg transition-colors flex items-center justify-center"
            >
              <div className="flex gap-1.5 items-center">
                <div className="w-6 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                <div className="w-6 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                <div className="w-6 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>
            </div>

            <div className="space-y-3">
              {/* Title and Delete Button Row */}
              <div className="flex items-start justify-between gap-2">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isEditingTitle) {
                      setOriginalTitle(card.title);
                      setIsEditingTitle(true);
                    }
                  }}
                  className={`flex-1 ${!isEditingTitle && 'cursor-text hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded px-1 -mx-1'}`}
                >
                  {isEditingTitle ? (
                    <InlineEditor
                      content={card.title}
                      placeholder="Card title..."
                      onUpdate={handleTitleUpdate}
                      onBlur={handleTitleBlur}
                      className="font-medium text-sm text-gray-900 dark:text-gray-100"
                    />
                  ) : (
                    <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 leading-tight">
                      {card.title}
                    </h3>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleteDialogOpen(true);
                  }}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  aria-label="Delete card"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Editable Description */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isEditingDesc) {
                    setOriginalDesc(card.description);
                    setIsEditingDesc(true);
                  }
                }}
                className={`${!isEditingDesc && 'cursor-text hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded px-1 -mx-1'}`}
              >
                {isEditingDesc ? (
                  <InlineEditor
                    content={card.description || ''}
                    placeholder="Add description..."
                    onUpdate={handleDescUpdate}
                    onBlur={handleDescBlur}
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
    {/* Delete Confirmation Dialog */}
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Card</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{card.title}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
