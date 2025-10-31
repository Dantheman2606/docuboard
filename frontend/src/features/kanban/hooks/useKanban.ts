// /features/kanban/hooks/useKanban.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Commented out mock data - now using backend API
// import { projects } from "@/lib/mockData";
import type { KanbanBoard, Card } from "@/lib/mockData";
import { api } from "@/lib/api";

/**
 * Custom hook for fetching Kanban board data from backend by boardId
 */
export const useKanban = (boardId: string) => {
  return useQuery({
    queryKey: ["kanban", boardId],
    queryFn: async (): Promise<KanbanBoard | null> => {
      try {
        const board = await api.getKanbanBoard(boardId);
        return board as any; // Type conversion between API and mock data types
      } catch (error) {
        console.error('Failed to fetch kanban board:', error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!boardId,
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
