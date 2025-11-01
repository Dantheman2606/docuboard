// src/hooks/useProjects.ts
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      console.log('📡 Fetching projects from backend...');
      const projects = await api.getProjects();
      console.log(`✅ Loaded ${projects.length} project(s) from backend`);
      return projects;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    retryDelay: 500,
  });
}


// queryKey: ["project", id],
//     queryFn: () => api.getProject(id),
//     enabled: !!id, // prevents running when no project selected
//     staleTime: 1000 * 60 * 5, // cache for 5 minutes