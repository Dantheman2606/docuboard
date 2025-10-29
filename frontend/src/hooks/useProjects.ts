// src/hooks/useProjects.ts
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => api.getProjects(),
    staleTime: 1000 * 60 * 5
      // Simulate API or localStorage
    //   return [
    //     { id: "1", name: "Team Docs", description: "Collaborative notes and docs" },
    //     { id: "2", name: "Sprint Planning", description: "Kanban and backlog tracking" },
    //     { id: "3", name: "Design System", description: "UI components and tokens" },
    //   ];
    // },
  });
}


// queryKey: ["project", id],
//     queryFn: () => api.getProject(id),
//     enabled: !!id, // prevents running when no project selected
//     staleTime: 1000 * 60 * 5, // cache for 5 minutes