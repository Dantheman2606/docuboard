import { useRouter } from "next/router";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import { useUIStore } from "@/stores/uiStore";
import { useProject } from "@/hooks/useProject";

export default function ProjectPage() {
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

  useEffect(() => {
    // Redirect to the first doc if available, otherwise to kanban
    if (project && !isLoading) {
      if (project.docs && project.docs.length > 0) {
        router.push(`/projects/${projectId}/docs/${project.docs[0].id}`);
      } else {
        router.push(`/projects/${projectId}/kanban`);
      }
    }
  }, [project, projectId, router, isLoading]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </Layout>
  );
}
