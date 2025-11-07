import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import Layout from "@/components/Layout";
import { KanbanBoard } from "@/features/kanban/components";
import { useUIStore } from "@/stores/uiStore";
import { useProject } from "@/hooks/useProject";
import { api } from "@/lib/api";

export default function KanbanBoardPage() {
  const router = useRouter();
  const { id, boardId } = router.query;
  const projectId = typeof id === "string" ? id : "";
  const kanbanBoardId = typeof boardId === "string" ? boardId : "";
  
  const { setCurrentProject } = useUIStore();
  const { data: project, isLoading: projectLoading, isError: projectError } = useProject(projectId);
  const [boardName, setBoardName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);

  const { data: board, isLoading: boardLoading } = useQuery({
    queryKey: ["kanbanBoard", kanbanBoardId],
    queryFn: () => api.getKanbanBoard(kanbanBoardId),
    enabled: !!kanbanBoardId,
  });

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    }
  }, [projectId, setCurrentProject]);

  useEffect(() => {
    if (board?.name) {
      setBoardName(board.name);
    }
  }, [board?.name]);

  // Handle access denied error
  useEffect(() => {
    if (projectError) {
      router.push('/dashboard');
    }
  }, [projectError, router]);

  const handleNameChange = (newName: string) => {
    setBoardName(newName);
  };

  const handleNameBlur = async () => {
    setIsEditingName(false);
    if (boardName.trim() && boardName !== board?.name) {
      try {
        await api.updateKanbanBoard(kanbanBoardId, { name: boardName.trim() });
      } catch (error) {
        console.error("Failed to update board name:", error);
        // Revert to original name on error
        if (board?.name) {
          setBoardName(board.name);
        }
      }
    } else if (!boardName.trim() && board?.name) {
      // Revert if empty
      setBoardName(board.name);
    }
  };

  if (projectLoading || boardLoading) {
    return (
      <>
        <Head>
          <title>Loading Board - Docuboard</title>
        </Head>
        <Layout>
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </Layout>
      </>
    );
  }

  if (projectError) {
    return (
      <>
        <Head>
          <title>Access Denied - Docuboard</title>
        </Head>
        <Layout>
          <div className="flex flex-col items-center justify-center h-screen gap-4">
            <div className="text-6xl">🔒</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Access Denied
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to view this project.
            </p>
          </div>
        </Layout>
      </>
    );
  }

  if (!project || !board) {
    return (
      <>
        <Head>
          <title>{!project ? "Project Not Found" : "Board Not Found"} - Docuboard</title>
        </Head>
        <Layout>
          <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {!project ? "Project Not Found" : "Board Not Found"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              The {!project ? "project" : "board"} you're looking for doesn't exist.
            </p>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{boardName} - {project.name} - Docuboard</title>
      </Head>
      <Layout>
        <div className="h-full flex flex-col">
          {/* Page Header */}
          <div className="px-4 md:px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={boardName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onBlur={handleNameBlur}
                  onFocus={() => setIsEditingName(true)}
                  placeholder="Board Name"
                  className="w-full text-xl md:text-2xl font-bold bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {project.name}
                </p>
              </div>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="flex-1 bg-gray-50 dark:bg-gray-950 overflow-hidden">
            <KanbanBoard projectId={projectId} boardId={kanbanBoardId} />
          </div>
        </div>
      </Layout>
    </>
  );
}
