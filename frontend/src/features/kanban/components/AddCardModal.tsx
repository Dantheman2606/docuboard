// /features/kanban/components/AddCardModal.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useKanbanStore } from "@/stores/kanbanStore";
import type { Card } from "@/lib/mockData";
import { extractMentions } from "@/lib/mentionUtils";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { InlineEditor } from "./InlineEditor";

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  columnId: string;
}

const availableLabels = [
  "setup",
  "UI",
  "data",
  "state",
  "done",
  "review",
  "frontend",
  "design",
];

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

export function AddCardModal({ isOpen, onClose, boardId, columnId }: AddCardModalProps) {
  const { addCard } = useKanbanStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const newCard: Card = {
      id: `c${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      assignee: assignee.trim() || undefined,
      dueDate: dueDate || undefined,
      labels: selectedLabels.length > 0 ? selectedLabels : undefined,
    };

    addCard(boardId, columnId, newCard);
    
    // Check for mentions in the description
    if (description.trim()) {
      const mentionedUsernames = extractMentions(description);
      if (mentionedUsernames.length > 0) {
        try {
          const user = localStorage.getItem('user');
          if (user) {
            const userObj = JSON.parse(user);
            await api.createMentionNotifications({
              mentionedUsernames,
              mentionedBy: {
                id: userObj.id,
                name: userObj.name,
                username: userObj.username,
              },
              context: description.substring(0, 150),
              boardId: boardId,
              cardId: newCard.id,
            });
            toast.success(`Mentioned ${mentionedUsernames.length} user(s) in new card`);
          }
        } catch (error) {
          console.error('Failed to create mention notifications:', error);
        }
      }
    }
    
    handleClose();
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setAssignee("");
    setDueDate("");
    setSelectedLabels([]);
    onClose();
  };

  const toggleLabel = (label: string) => {
    setSelectedLabels((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Card title..."
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Description
            </label>
            <div 
              onClick={() => setIsEditingDescription(true)}
              className="w-full min-h-[80px] px-3 py-2 text-sm border-2 border-gray-300 dark:border-gray-700 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-text"
            >
              <InlineEditor
                content={description}
                placeholder="Add description... Type @ to mention users"
                onUpdate={(newDesc) => setDescription(newDesc)}
                className="text-sm min-h-[60px]"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              💡 Tip: Type <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">@</span> to mention users and notify them
            </p>
          </div>

          {/* Assignee */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Assignee
            </label>
            <Input
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Enter assignee name..."
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Due Date
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Labels */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Labels
            </label>
            <div className="flex flex-wrap gap-2">
              {availableLabels.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleLabel(label)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedLabels.includes(label)
                      ? `${labelColors[label]} ring-2 ring-offset-2 ring-blue-500`
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Add Card
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
