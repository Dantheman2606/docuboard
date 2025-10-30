import { useRouter } from "next/router";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import { KanbanBoard } from "@/features/kanban/components";
import { useUIStore } from "@/stores/uiStore";
import { useProject } from "@/hooks/useProject";

export default function KanbanPage() {
  const router = useRouter();
  const { id } = router.query;
  const projectId = typeof id === "string" ? id : "";
  
  const { setCurrentProject } = useUIStore();
  const { data: project, isLoading } = useProject(projectId);

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    }
  }, [projectId, setCurrentProject]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Project Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The project you're looking for doesn't exist.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-full flex flex-col">
        {/* Page Header */}
        <div className="px-4 md:px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {project.name} - Kanban Board
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {project.description}
              </p>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-950 overflow-hidden">
          <KanbanBoard projectId={projectId} />
        </div>
      </div>
    </Layout>
  );
}
