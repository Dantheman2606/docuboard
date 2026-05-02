// /hooks/useProject.ts
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      console.log(`📡 Fetching project ${id} from backend...`);
      const project = await api.getProject(id);
      console.log(`✅ Loaded project: ${project.name}, your role: ${project.userRole}`);
      return project;
    },
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: "always",
    refetchOnMount: "always",
    refetchInterval: 1000 * 10,
    retry: 1,
    retryDelay: 500,
  });
};
