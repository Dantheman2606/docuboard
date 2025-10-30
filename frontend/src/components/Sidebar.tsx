"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useUIStore } from "@/stores/uiStore";
import { useProjects } from "@/hooks/useProjects";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileText, Grid, ChevronLeft, ChevronRight } from "lucide-react";
import { useProject } from "@/hooks/useProject";


import { useEffect } from "react";


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
  const [activeSection, setActiveSection] = useState<"docs" | "kanban">("docs");

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
            {project?.docs?.map((doc: { id: string; title: string }) => (
              <button
                key={doc.id}
                onClick={() =>
                  handleNavigate(`/projects/${project.id}/docs/${doc.id}`)
                }
                className={cn(
                  "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors",
                  router.asPath.includes(`/docs/${doc.id}`)
                    ? "bg-muted font-medium"
                    : ""
                )}
                aria-label={`Open document ${doc.title}`}
              >
                <FileText size={16} className="text-muted-foreground" />
                {isSidebarOpen && <span className="truncate">{doc.title}</span>}
              </button>
            ))}
          </div>
        ) : null}
      </ScrollArea>
    </aside>
  );
};

// Export the Sidebar component
export default Sidebar;
