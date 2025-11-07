// components/Sidebar/DocumentsList.tsx
import { useRouter } from "next/router";
import { FileText, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/features/auth/hooks";

interface Document {
  id: string;
  title: string;
}

interface DocumentsListProps {
  documents?: Document[];
  isSidebarOpen: boolean;
  currentProjectId: string;
  currentPath: string;
  onAddDocument: () => void;
  onDeleteDocument: (docId: string) => void;
}

export function DocumentsList({
  documents,
  isSidebarOpen,
  currentProjectId,
  currentPath,
  onAddDocument,
  onDeleteDocument,
}: DocumentsListProps) {
  const router = useRouter();
  const { can } = usePermissions();
  const canCreate = can('create');
  const canDelete = can('delete');

  const handleNavigate = (docId: string) => {
    router.push(`/projects/${currentProjectId}/docs/${docId}`);
  };

  return (
    <div className="space-y-1">
      {/* Add New Doc Button */}
      {canCreate && (
        <button
          onClick={onAddDocument}
          className={cn(
            "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-primary/10 transition-colors border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 mb-3",
            !isSidebarOpen && "justify-center"
          )}
          aria-label="Create new document"
        >
          <Plus size={16} className="text-primary" />
          {isSidebarOpen && (
            <span className="text-primary font-medium">New Doc</span>
          )}
        </button>
      )}

      {/* Documents from backend */}
      {documents?.map((doc) => (
        <div
          key={doc.id}
          className={cn(
            "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors group",
            currentPath.includes(`/docs/${doc.id}`)
              ? "bg-muted font-medium"
              : ""
          )}
        >
          <button
            onClick={() => handleNavigate(doc.id)}
            className="flex items-center gap-2 flex-1 text-left min-w-0"
            aria-label={`Open document ${doc.title}`}
          >
            <FileText size={16} className="text-muted-foreground flex-shrink-0" />
            {isSidebarOpen && <span className="truncate">{doc.title}</span>}
          </button>
          {isSidebarOpen && canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteDocument(doc.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex-shrink-0"
              aria-label={`Delete ${doc.title}`}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
