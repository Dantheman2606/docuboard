"use client";

import { useRouter } from "next/router";
import { useUIStore } from "@/stores/uiStore";
import { useProjects } from "@/hooks/useProjects";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProject } from "@/hooks/useProject";
import { useDocuments } from "@/hooks/useDocuments";
import { useDocumentStore } from "@/stores/documentStore";
import { AddDocModal } from "@/features/editor/components";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSyncProjectId } from "./hooks/useSyncProjectId";
import { SidebarHeader } from "./SidebarHeader";
import { BackToProjectsButton } from "./BackToProjectsButton";
import { SectionTabs } from "./SectionTabs";
import { DocumentsList } from "./DocumentsList";
import { KanbanBoardsList } from "./KanbanBoardsList";
import { LogoutButton } from "./LogoutButton";
import { AddBoardModal } from "./modals/AddBoardModal";
import { DeleteConfirmationDialog } from "./modals/DeleteConfirmationDialog";
import { ActivityFeed } from "@/components/ActivityFeed";
import { ActivityButton } from "./ActivityButton";

const Sidebar = () => {
  useSyncProjectId();
  const router = useRouter();
  const { currentProjectId, isSidebarOpen, toggleSidebar } = useUIStore();
  const { data: project } = useProject(currentProjectId || "");
  const { data: documents } = useDocuments(currentProjectId || "");
  const [activeSection, setActiveSection] = useState<"docs" | "kanban">("docs");
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);
  const [isAddBoardModalOpen, setIsAddBoardModalOpen] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [deleteBoardId, setDeleteBoardId] = useState<string | null>(null);
  const [isActivityFeedOpen, setIsActivityFeedOpen] = useState(false);
  const { deleteDocument } = useDocumentStore();
  const queryClient = useQueryClient();

  // Fetch Kanban boards for the current project
  const { data: kanbanBoards = [] } = useQuery({
    queryKey: ["kanbanBoards", currentProjectId],
    queryFn: () => api.getKanbanBoards(currentProjectId || ""),
    enabled: !!currentProjectId,
  });

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

  const handleSectionChange = (section: "docs" | "kanban") => {
    setActiveSection(section);
    if (section === "kanban") {
      handleNavigate(`/projects/${project?.id}/kanban`);
    }
  };

  const handleCreateBoard = async (boardName: string) => {
    if (!currentProjectId) return;
    
    try {
      const newBoard = await api.createKanbanBoard({
        name: boardName,
        projectId: currentProjectId,
      });
      
      await queryClient.invalidateQueries({ queryKey: ["kanbanBoards", currentProjectId] });
      
      // Navigate to the new board
      router.push(`/projects/${currentProjectId}/kanban/${newBoard.id}`);
    } catch (error) {
      console.error("Failed to create board:", error);
    }
  };

  const handleDeleteBoard = async () => {
    if (!deleteBoardId || !currentProjectId) return;
    
    const isCurrentBoard = router.asPath.includes(`/kanban/${deleteBoardId}`);
    
    try {
      await api.deleteKanbanBoard(deleteBoardId);
      await queryClient.invalidateQueries({ queryKey: ["kanbanBoards", currentProjectId] });
      
      if (isCurrentBoard) {
        router.push(`/projects/${currentProjectId}/kanban`);
      }
      
      setDeleteBoardId(null);
    } catch (error) {
      console.error("Failed to delete board:", error);
      setDeleteBoardId(null);
    }
  };

  const handleDeleteDocument = async () => {
    if (!deleteDocId) return;
    
    const isCurrentDoc = router.asPath.includes(`/docs/${deleteDocId}`);
    
    deleteDocument(deleteDocId);
    
    await queryClient.invalidateQueries({ queryKey: ['documents', currentProjectId] });
    await queryClient.invalidateQueries({ queryKey: ['project', currentProjectId] });
    
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
      <SidebarHeader 
        projectName={project?.name} 
        isSidebarOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />
      
      <BackToProjectsButton 
        isSidebarOpen={isSidebarOpen}
        onNavigate={() => handleNavigate('/dashboard')}
      />

      <SectionTabs
        activeSection={activeSection}
        isSidebarOpen={isSidebarOpen}
        onSectionChange={handleSectionChange}
      />

      <ScrollArea className="flex-1 px-2 py-3">
        {activeSection === "docs" ? (
          <DocumentsList
            documents={documents || []}
            isSidebarOpen={isSidebarOpen}
            currentPath={router.asPath}
            onAddDocument={() => setIsAddDocModalOpen(true)}
            onDeleteDocument={setDeleteDocId}
            currentProjectId={currentProjectId}
          />
        ) : (
          <KanbanBoardsList
            boards={kanbanBoards}
            isSidebarOpen={isSidebarOpen}
            currentPath={router.asPath}
            onAddBoard={() => setIsAddBoardModalOpen(true)}
            onDeleteBoard={setDeleteBoardId}
            currentProjectId={currentProjectId}
          />
        )}
      </ScrollArea>

      <div className="px-2 border-t border-gray-200 dark:border-gray-700 pt-2">
        <ActivityButton 
          isSidebarOpen={isSidebarOpen}
          onClick={() => setIsActivityFeedOpen(true)}
        />
      </div>

      <LogoutButton isSidebarOpen={isSidebarOpen} />

      {/* Activity Feed */}
      <ActivityFeed
        isOpen={isActivityFeedOpen}
        onClose={() => setIsActivityFeedOpen(false)}
      />

      {/* Add Doc Modal */}
      {currentProjectId && (
        <AddDocModal
          isOpen={isAddDocModalOpen}
          onClose={() => setIsAddDocModalOpen(false)}
          projectId={currentProjectId}
        />
      )}

      {/* Add Board Modal */}
      <AddBoardModal
        isOpen={isAddBoardModalOpen}
        onClose={() => setIsAddBoardModalOpen(false)}
        onSubmit={handleCreateBoard}
      />

      {/* Delete Document Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={!!deleteDocId}
        title="Delete Document"
        description="Are you sure you want to delete this document? This action cannot be undone."
        onConfirm={handleDeleteDocument}
        onCancel={() => setDeleteDocId(null)}
      />

      {/* Delete Board Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={!!deleteBoardId}
        title="Delete Kanban Board"
        description="Are you sure you want to delete this board? All cards and data will be permanently removed. This action cannot be undone."
        onConfirm={handleDeleteBoard}
        onCancel={() => setDeleteBoardId(null)}
      />
    </aside>
  );
};

export default Sidebar;
