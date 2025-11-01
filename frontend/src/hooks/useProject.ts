// /hooks/useProject.ts
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      console.log(`📡 Fetching project ${id} from backend...`);
      const project = await api.getProject(id);
      console.log(`✅ Loaded project: ${project.name}`);
      return project;
    },
    enabled: !!id, // prevents running when no project selected
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
    retry: 1,
    retryDelay: 500,
  });
};
