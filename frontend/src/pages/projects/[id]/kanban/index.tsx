import { useRouter } from "next/router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import Layout from "@/components/Layout";
import { useUIStore } from "@/stores/uiStore";
import { useProject } from "@/hooks/useProject";
import { api } from "@/lib/api";
import { LayoutGrid } from "lucide-react";

export default function KanbanBoardsPage() {
  const router = useRouter();
  const { id } = router.query;
  const projectId = typeof id === "string" ? id : "";
  
  const { setCurrentProject } = useUIStore();
  const { data: project, isLoading: projectLoading } = useProject(projectId);

  const { data: boards = [], isLoading: boardsLoading } = useQuery({
    queryKey: ["kanbanBoards", projectId],
    queryFn: () => api.getKanbanBoards(projectId),
    enabled: !!projectId,
  });

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    }
  }, [projectId, setCurrentProject]);

  // Redirect to first board when boards are loaded
  useEffect(() => {
    if (!boardsLoading && boards.length > 0 && projectId) {
      router.replace(`/projects/${projectId}/kanban/${boards[0].id}`);
    }
  }, [boards, boardsLoading, projectId, router]);

  if (projectLoading || boardsLoading) {
    return (
      <>
        <Head>
          <title>Loading Boards - Docuboard</title>
        </Head>
        <Layout>
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </Layout>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Head>
          <title>Project Not Found - Docuboard</title>
        </Head>
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
      </>
    );
  }

  // Show empty state if no boards exist
  if (boards.length === 0) {
    return (
      <>
        <Head>
          <title>Kanban Boards - {project.name} - Docuboard</title>
        </Head>
        <Layout>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="p-8 rounded-full bg-sky-50">
                  <LayoutGrid size={48} className="text-sky-600" />
                </div>
                <p className="text-xl font-medium text-slate-700">No Kanban boards yet</p>
                <p className="text-slate-500">Your first board will be created automatically</p>
              </div>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  // Redirecting to first board...
  return (
    <>
      <Head>
        <title>Kanban Boards - {project.name} - Docuboard</title>
      </Head>
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    </>
  );
}
