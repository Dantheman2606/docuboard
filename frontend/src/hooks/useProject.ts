// /hooks/useProject.ts
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
// import { api } from "@/lib/api";


export const useProject = (id: string) => {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => api.getProject(id),
    enabled: !!id, // prevents running when no project selected
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  });
};
