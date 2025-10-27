// src/hooks/useProjects.ts
import { useQuery } from "@tanstack/react-query";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      // Simulate API or localStorage
      return [
        { id: "1", name: "Team Docs", description: "Collaborative notes and docs" },
        { id: "2", name: "Sprint Planning", description: "Kanban and backlog tracking" },
        { id: "3", name: "Design System", description: "UI components and tokens" },
      ];
    },
  });
}
