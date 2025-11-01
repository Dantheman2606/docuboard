// components/Sidebar/KanbanBoardsList.tsx
import { useRouter } from "next/router";
import { LayoutGrid, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanbanBoard {
  id: string;
  name: string;
}

interface KanbanBoardsListProps {
  boards?: KanbanBoard[];
  isSidebarOpen: boolean;
  currentProjectId: string;
  currentPath: string;
  onAddBoard: () => void;
  onDeleteBoard: (boardId: string) => void;
}

export function KanbanBoardsList({
  boards,
  isSidebarOpen,
  currentProjectId,
  currentPath,
  onAddBoard,
  onDeleteBoard,
}: KanbanBoardsListProps) {
  const router = useRouter();

  const handleNavigate = (boardId: string) => {
    router.push(`/projects/${currentProjectId}/kanban/${boardId}`);
  };

  return (
    <div className="space-y-1">
      {/* Add New Board Button */}
      <button
        onClick={onAddBoard}
        className={cn(
          "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-primary/10 transition-colors border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 mb-3",
          !isSidebarOpen && "justify-center"
        )}
        aria-label="Create new Kanban board"
      >
        <Plus size={16} className="text-primary" />
        {isSidebarOpen && (
          <span className="text-primary font-medium">New Board</span>
        )}
      </button>

      {/* Kanban Boards List */}
      {boards?.map((board) => (
        <div
          key={board.id}
          className={cn(
            "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors group",
            currentPath.includes(`/kanban/${board.id}`)
              ? "bg-muted font-medium"
              : ""
          )}
        >
          <button
            onClick={() => handleNavigate(board.id)}
            className="flex items-center gap-2 flex-1 text-left min-w-0"
            aria-label={`Open board ${board.name}`}
          >
            <LayoutGrid size={16} className="text-muted-foreground flex-shrink-0" />
            {isSidebarOpen && <span className="truncate">{board.name}</span>}
          </button>
          {isSidebarOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteBoard(board.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex-shrink-0"
              aria-label={`Delete ${board.name}`}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
