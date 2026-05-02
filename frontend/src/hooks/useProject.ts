// /hooks/useProject.ts
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth";
import { useEffect } from "react";

export const useProject = (id: string) => {
  const { setCurrentProjectRole } = useAuthStore();

  const query = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      console.log(`📡 Fetching project ${id} from backend...`);
      const project = await api.getProject(id);
      console.log(`✅ Loaded project: ${project.name}`);
      return project;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    retryDelay: 500,
  });

  // Update current project role when project data changes
  useEffect(() => {
    if (query.data?.userRole) {
      setCurrentProjectRole(query.data.userRole as any);
    }
  }, [query.data?.userRole, setCurrentProjectRole]);

  return query;
};
