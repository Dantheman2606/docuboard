// /hooks/useDocuments.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useDocuments = (projectId: string) => {
  return useQuery({
    queryKey: ["documents", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      return api.getDocuments(projectId);
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
