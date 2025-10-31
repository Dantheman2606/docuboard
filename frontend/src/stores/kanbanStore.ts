// /stores/kanbanStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { KanbanBoard, Card } from "@/lib/mockData";
import { api } from "@/lib/api";

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
  deleteCard: (projectId: string, cardId: string) => void;
  syncBoardToBackend: (projectId: string) => Promise<void>;
}

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set, get) => ({
      boards: {},

      setBoard: (projectId, board) => {
        // Always prefer backend data
        set((state) => ({
          boards: {
            ...state.boards,
            [projectId]: board,
          },
        }));
      },

      moveCard: (projectId, cardId, sourceColumnId, destinationColumnId, destinationIndex) => {
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
        });
        
        // Sync to backend after state update
        setTimeout(() => {
          const board = useKanbanStore.getState().boards[projectId];
          if (board) {
            const boardData = {
              projectId,
              columns: board.columns,
              cards: board.cards,
              columnOrder: board.columnOrder,
            };
            api.updateKanbanBoard(projectId, boardData as any).catch(console.error);
          }
        }, 0);
      },

      updateCard: (projectId, cardId, updates) => {
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
        });
        
        // Sync to backend after state update
        setTimeout(() => {
          const board = useKanbanStore.getState().boards[projectId];
          if (board) {
            const boardData = {
              projectId,
              columns: board.columns,
              cards: board.cards,
              columnOrder: board.columnOrder,
            };
            api.updateKanbanBoard(projectId, boardData as any).catch(console.error);
          }
        }, 0);
      },

      addCard: (projectId, columnId, card) => {
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
        });
        
        // Sync to backend after state update
        setTimeout(() => {
          const board = useKanbanStore.getState().boards[projectId];
          if (board) {
            const boardData = {
              projectId,
              columns: board.columns,
              cards: board.cards,
              columnOrder: board.columnOrder,
            };
            api.updateKanbanBoard(projectId, boardData as any).catch(console.error);
          }
        }, 0);
      },

      deleteCard: (projectId, cardId) => {
        set((state) => {
          const board = state.boards[projectId];
          if (!board) return state;

          // Find which column contains the card
          let columnIdWithCard: string | null = null;
          for (const [columnId, column] of Object.entries(board.columns)) {
            if (column.cardIds.includes(cardId)) {
              columnIdWithCard = columnId;
              break;
            }
          }

          if (!columnIdWithCard) return state;

          // Remove card from cards object
          const { [cardId]: _, ...remainingCards } = board.cards;

          // Remove card from column's cardIds
          const column = board.columns[columnIdWithCard];
          const updatedCardIds = column.cardIds.filter((id) => id !== cardId);

          return {
            boards: {
              ...state.boards,
              [projectId]: {
                ...board,
                cards: remainingCards,
                columns: {
                  ...board.columns,
                  [columnIdWithCard]: {
                    ...column,
                    cardIds: updatedCardIds,
                  },
                },
              },
            },
          };
        });

        // Sync to backend after state update
        setTimeout(() => {
          const board = useKanbanStore.getState().boards[projectId];
          if (board) {
            const boardData = {
              projectId,
              columns: board.columns,
              cards: board.cards,
              columnOrder: board.columnOrder,
            };
            api.updateKanbanBoard(projectId, boardData as any).catch(console.error);
          }
        }, 0);
      },

      syncBoardToBackend: async (projectId: string) => {
        const board = useKanbanStore.getState().boards[projectId];
        if (board) {
          try {
            const boardData = {
              projectId,
              columns: board.columns,
              cards: board.cards,
              columnOrder: board.columnOrder,
            };
            await api.updateKanbanBoard(projectId, boardData as any);
          } catch (error) {
            console.error('Failed to sync kanban board to backend:', error);
          }
        }
      },
    }),
    {
      name: "kanban-storage",
    }
  )
);
