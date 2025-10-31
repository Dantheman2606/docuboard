"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useUIStore } from "@/stores/uiStore";
import { useProjects } from "@/hooks/useProjects";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileText, Grid, ChevronLeft, ChevronRight, Plus, Home, Trash2 } from "lucide-react";
import { useProject } from "@/hooks/useProject";
import { useDocuments } from "@/hooks/useDocuments";
import { useDocumentStore } from "@/stores/documentStore";
import { AddDocModal } from "@/features/editor/components";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";


export function useSyncProjectId() {
  const router = useRouter();
  const { currentProjectId, setCurrentProject } = useUIStore();
  
  useEffect(() => {
    const path = router.asPath; // e.g., /projects/p2/docs/d1
    const match = path.match(/\/projects\/([^/]+)/);
    const idFromUrl = match ? match[1] : null;

    if (idFromUrl && idFromUrl !== currentProjectId) {
      setCurrentProject(idFromUrl);
    }
  }, [router.asPath]);
}


// Define the Sidebar component correctly
const Sidebar = () => {

  useSyncProjectId();
  const router = useRouter();
  const { currentProjectId, toggleSidebar, isSidebarOpen } = useUIStore();
  const { data: projects } = useProjects(); // Fetch all projects
  const { data: project } = useProject(currentProjectId || ""); // Fetch the current project
  const { data: documents } = useDocuments(currentProjectId || ""); // Fetch documents from backend
  const [activeSection, setActiveSection] = useState<"docs" | "kanban">("docs");
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const { deleteDocument } = useDocumentStore();
  const queryClient = useQueryClient();

  // Sync activeSection with current route
  useEffect(() => {
    if (router.asPath.includes('/kanban')) {
      setActiveSection('kanban');
    } else if (router.asPath.includes('/docs')) {
      setActiveSection('docs');
    }
  }, [router.asPath]);

  if (!currentProjectId) {
    return (
      <aside className="w-64 bg-muted/30 border-r flex flex-col items-center justify-center text-sm text-muted-foreground">
        <p>Select a project from the dashboard</p>
      </aside>
    );
  }

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  // Add this function to handle section changes
  const handleSectionChange = (section: "docs" | "kanban") => {
    setActiveSection(section);
    if (section === "kanban") {
      handleNavigate(`/projects/${project?.id}/kanban`);
    }
  };

  const handleDeleteDocument = async () => {
    if (!deleteDocId) return;
    
    // Check if we're currently on the document being deleted
    const isCurrentDoc = router.asPath.includes(`/docs/${deleteDocId}`);
    
    // Delete the document
    deleteDocument(deleteDocId);
    
    // Invalidate queries to refetch updated data
    await queryClient.invalidateQueries({ queryKey: ['documents', currentProjectId] });
    await queryClient.invalidateQueries({ queryKey: ['project', currentProjectId] });
    
    // If we're on the document being deleted, navigate away
    if (isCurrentDoc) {
      handleNavigate(`/projects/${currentProjectId}`);
    }
    
    setDeleteDocId(null);
  };

  return (
    <aside
      className={cn(
        "h-screen flex flex-col border-r bg-background transition-all duration-300 ease-in-out",
        isSidebarOpen ? "w-64" : "w-16"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className={cn("font-semibold text-lg truncate", !isSidebarOpen && "hidden")}>
          {project?.name || "Untitled Project"}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-muted-foreground"
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </Button>
      </div>

      {/* Back to Projects Button */}
      <div className="px-2 py-2 border-b">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2",
            !isSidebarOpen && "justify-center px-2"
          )}
          onClick={() => handleNavigate('/')}
          aria-label="Back to projects"
        >
          <Home size={18} />
          {isSidebarOpen && <span>All Projects</span>}
        </Button>
      </div>

      {/* Section Tabs */}
      <div className="flex justify-around py-2 border-b">
        <button
          className={cn(
            "flex items-center gap-2",
            isSidebarOpen ? "w-28 px-3" : "w-12 justify-center",
            "h-8 rounded-md text-sm font-medium transition-all",
            activeSection === "docs"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-primary"
          )}
          onClick={() => handleSectionChange("docs")}
          aria-label="Documents section"
        >
          <FileText size={20} />
          {isSidebarOpen && <span>Docs</span>}
        </button>

        <button
          className={cn(
            "flex items-center gap-2",
            isSidebarOpen ? "w-28 px-3" : "w-12 justify-center",
            "h-8 rounded-md text-sm font-medium transition-all",
            activeSection === "kanban"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-primary"
          )}
          onClick={() => handleSectionChange("kanban")}
          aria-label="Kanban section"
        >
          <Grid size={20} />
          {isSidebarOpen && <span>Kanban</span>}
        </button>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="flex-1 px-2 py-3">
        {activeSection === "docs" ? (
          <div className="space-y-1">
            {/* Add New Doc Button */}
            <button
              onClick={() => setIsAddDocModalOpen(true)}
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

            {/* Documents from backend */}
            {documents?.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors group",
                  router.asPath.includes(`/docs/${doc.id}`)
                    ? "bg-muted font-medium"
                    : ""
                )}
              >
                <button
                  onClick={() =>
                    handleNavigate(`/projects/${currentProjectId}/docs/${doc.id}`)
                  }
                  className="flex items-center gap-2 flex-1 text-left min-w-0"
                  aria-label={`Open document ${doc.title}`}
                >
                  <FileText size={16} className="text-muted-foreground flex-shrink-0" />
                  {isSidebarOpen && <span className="truncate">{doc.title}</span>}
                </button>
                {isSidebarOpen && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteDocId(doc.id);
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
        ) : null}
      </ScrollArea>

      {/* Add Doc Modal */}
      {currentProjectId && (
        <AddDocModal
          isOpen={isAddDocModalOpen}
          onClose={() => setIsAddDocModalOpen(false)}
          projectId={currentProjectId}
        />
      )}

      {/* Delete Document Confirmation Dialog */}
      <Dialog open={!!deleteDocId} onOpenChange={(open) => !open && setDeleteDocId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDocId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDocument}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
};

// Export the Sidebar component
export default Sidebar;
