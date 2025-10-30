// /features/kanban/hooks/useKanban.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projects } from "@/lib/mockData";
import type { KanbanBoard, Card } from "@/lib/mockData";

/**
 * Custom hook for fetching Kanban board data
 * Currently fetches from mock data, but can be easily replaced with real API calls
 */
export const useKanban = (projectId: string) => {
  return useQuery({
    queryKey: ["kanban", projectId],
    queryFn: async (): Promise<KanbanBoard | null> => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      const project = projects.find((p) => p.id === projectId);
      return project?.board || null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!projectId,
  });
};

/**
 * Hook for updating card position (drag & drop)
 * This will be replaced with API call to backend
 */
export const useUpdateCardPosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      cardId,
      sourceColumnId,
      destinationColumnId,
      destinationIndex,
    }: {
      projectId: string;
      cardId: string;
      sourceColumnId: string;
      destinationColumnId: string;
      destinationIndex: number;
    }) => {
      // TODO: Replace with actual API call
      // await api.updateCardPosition(projectId, cardId, destinationColumnId, destinationIndex);
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      return { success: true };
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["kanban", variables.projectId] });
    },
  });
};

/**
 * Hook for updating card details
 */
export const useUpdateCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      cardId,
      updates,
    }: {
      projectId: string;
      cardId: string;
      updates: Partial<Card>;
    }) => {
      // TODO: Replace with actual API call
      // await api.updateCard(projectId, cardId, updates);
      
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["kanban", variables.projectId] });
    },
  });
};

/**
 * Hook for creating new cards
 */
export const useCreateCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      columnId,
      card,
    }: {
      projectId: string;
      columnId: string;
      card: Omit<Card, "id">;
    }) => {
      // TODO: Replace with actual API call
      // const newCard = await api.createCard(projectId, columnId, card);
      
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      return { success: true, id: `c${Date.now()}` };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["kanban", variables.projectId] });
    },
  });
};
