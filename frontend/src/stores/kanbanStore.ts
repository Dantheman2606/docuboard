// /stores/kanbanStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { KanbanBoard, Card } from "@/lib/mockData";

interface KanbanState {
  boards: Record<string, KanbanBoard>;
  setBoard: (projectId: string, board: KanbanBoard) => void;
  moveCard: (
    projectId: string,
    cardId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    destinationIndex: number
  ) => void;
  updateCard: (projectId: string, cardId: string, updates: Partial<Card>) => void;
  addCard: (projectId: string, columnId: string, card: Card) => void;
}

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set) => ({
      boards: {},

      setBoard: (projectId, board) =>
        set((state) => ({
          boards: {
            ...state.boards,
            [projectId]: board,
          },
        })),

      moveCard: (projectId, cardId, sourceColumnId, destinationColumnId, destinationIndex) =>
        set((state) => {
          const board = state.boards[projectId];
          if (!board) return state;

          const sourceColumn = board.columns[sourceColumnId];
          const destColumn = board.columns[destinationColumnId];

          if (!sourceColumn || !destColumn) return state;

          // Create a copy of the source column's card IDs
          const sourceCardIds = [...sourceColumn.cardIds];
          
          // Remove card from source
          const cardIndex = sourceCardIds.indexOf(cardId);
          if (cardIndex === -1) return state;
          sourceCardIds.splice(cardIndex, 1);

          // Create a copy of the destination column's card IDs
          let destCardIds = [...destColumn.cardIds];
          
          // If moving within the same column, use the updated sourceCardIds
          if (sourceColumnId === destinationColumnId) {
            destCardIds = sourceCardIds;
          } else {
            // Remove card from destination if it exists
            destCardIds = destCardIds.filter((id) => id !== cardId);
          }
          
          // Insert card at the destination index
          destCardIds.splice(destinationIndex, 0, cardId);

          return {
            boards: {
              ...state.boards,
              [projectId]: {
                ...board,
                columns: {
                  ...board.columns,
                  [sourceColumnId]: {
                    ...sourceColumn,
                    cardIds: sourceColumnId === destinationColumnId ? destCardIds : sourceCardIds,
                  },
                  ...(sourceColumnId !== destinationColumnId && {
                    [destinationColumnId]: {
                      ...destColumn,
                      cardIds: destCardIds,
                    },
                  }),
                },
              },
            },
          };
        }),

      updateCard: (projectId, cardId, updates) =>
        set((state) => {
          const board = state.boards[projectId];
          if (!board) return state;

          const card = board.cards[cardId];
          if (!card) return state;

          return {
            boards: {
              ...state.boards,
              [projectId]: {
                ...board,
                cards: {
                  ...board.cards,
                  [cardId]: {
                    ...card,
                    ...updates,
                  },
                },
              },
            },
          };
        }),

      addCard: (projectId, columnId, card) =>
        set((state) => {
          const board = state.boards[projectId];
          if (!board) return state;

          const column = board.columns[columnId];
          if (!column) return state;

          return {
            boards: {
              ...state.boards,
              [projectId]: {
                ...board,
                cards: {
                  ...board.cards,
                  [card.id]: card,
                },
                columns: {
                  ...board.columns,
                  [columnId]: {
                    ...column,
                    cardIds: [...column.cardIds, card.id],
                  },
                },
              },
            },
          };
        }),
    }),
    {
      name: "kanban-storage",
    }
  )
);
