// /stores/kanbanStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Card } from "@/lib/mockData";
import { api, type KanbanBoard } from "@/lib/api";

// Helper function to get current user from localStorage
const getCurrentUser = () => {
  if (typeof window === 'undefined') return { name: 'Unknown User' };
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return {
        id: user.id,
        name: user.name || user.username || 'Unknown User',
        username: user.username
      };
    }
  } catch (e) {
    console.error('Error getting user:', e);
  }
  return { name: 'Unknown User' };
};

interface KanbanState {
  boards: Record<string, KanbanBoard>;
  setBoard: (boardId: string, board: KanbanBoard) => void;
  moveCard: (
    boardId: string,
    cardId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    destinationIndex: number
  ) => void;
  updateCard: (boardId: string, cardId: string, updates: Partial<Card>) => void;
  updateCardWithActivity: (boardId: string, cardId: string, updates: Partial<Card>) => void;
  addCard: (boardId: string, columnId: string, card: Card) => void;
  deleteCard: (boardId: string, cardId: string) => void;
  syncBoardToBackend: (boardId: string) => Promise<void>;
}

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set, get) => ({
      boards: {},

      setBoard: (boardId, board) => {
        // Always prefer backend data
        set((state) => ({
          boards: {
            ...state.boards,
            [boardId]: board,
          },
        }));
      },

      moveCard: (boardId, cardId, sourceColumnId, destinationColumnId, destinationIndex) => {
        set((state) => {
          const board = state.boards[boardId];
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
              [boardId]: {
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
          const board = useKanbanStore.getState().boards[boardId];
          if (board) {
            api.updateKanbanBoard(boardId, board as any).catch(console.error);
            
            // Log activity
            const card = board.cards[cardId];
            const sourceCol = board.columns[sourceColumnId];
            const destCol = board.columns[destinationColumnId];
            
            if (sourceColumnId !== destinationColumnId) {
              api.createActivity({
                projectId: board.projectId,
                boardId: boardId,
                cardId: cardId,
                type: 'card_moved',
                action: `moved card "${card?.title || 'Untitled'}" from ${sourceCol?.title || 'column'} to ${destCol?.title || 'column'}`,
                user: getCurrentUser(),
                metadata: {
                  cardTitle: card?.title,
                  fromColumn: sourceCol?.title,
                  toColumn: destCol?.title,
                  fromColumnId: sourceColumnId,
                  toColumnId: destinationColumnId
                }
              }).catch(console.error);
            }
          }
        }, 0);
      },

      updateCard: (boardId, cardId, updates) => {
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return state;

          const card = board.cards[cardId];
          if (!card) return state;

          return {
            boards: {
              ...state.boards,
              [boardId]: {
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
        
        // Sync to backend after state update (no activity logging)
        setTimeout(() => {
          const board = useKanbanStore.getState().boards[boardId];
          if (board) {
            api.updateKanbanBoard(boardId, board as any).catch(console.error);
          }
        }, 0);
      },

      updateCardWithActivity: (boardId, cardId, updates) => {
        // First update the card
        const state = get();
        const board = state.boards[boardId];
        const card = board?.cards[cardId];
        
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return state;

          const card = board.cards[cardId];
          if (!card) return state;

          return {
            boards: {
              ...state.boards,
              [boardId]: {
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
        
        // Sync to backend and log activity
        setTimeout(() => {
          const board = useKanbanStore.getState().boards[boardId];
          if (board) {
            api.updateKanbanBoard(boardId, board as any).catch(console.error);
            
            // Log activity for card update
            const updatedCard = board.cards[cardId];
            const updatedFields = Object.keys(updates).join(', ');
            api.createActivity({
              projectId: board.projectId,
              boardId: boardId,
              cardId: cardId,
              type: 'card_updated',
              action: `updated card "${updatedCard?.title || 'Untitled'}" (${updatedFields})`,
              user: getCurrentUser(),
              metadata: {
                cardTitle: updatedCard?.title,
                updates: updates
              }
            }).catch(console.error);
          }
        }, 0);
      },

      addCard: (boardId, columnId, card) => {
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return state;

          const column = board.columns[columnId];
          if (!column) return state;

          return {
            boards: {
              ...state.boards,
              [boardId]: {
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
          const board = useKanbanStore.getState().boards[boardId];
          if (board) {
            api.updateKanbanBoard(boardId, board as any).catch(console.error);
            
            // Log activity for new card
            const column = board.columns[columnId];
            api.createActivity({
              projectId: board.projectId,
              boardId: boardId,
              cardId: card.id,
              type: 'card_created',
              action: `created card "${card.title}" in ${column?.title || 'column'}`,
              user: getCurrentUser(),
              metadata: {
                cardTitle: card.title,
                columnTitle: column?.title,
                columnId: columnId
              }
            }).catch(console.error);
          }
        }, 0);
      },

      deleteCard: (boardId, cardId) => {
        // Save the card title BEFORE deletion
        const state = get();
        const board = state.boards[boardId];
        const deletedCard = board?.cards[cardId];
        const deletedCardTitle = deletedCard?.title || 'Untitled';
        
        set((state) => {
          const board = state.boards[boardId];
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
              [boardId]: {
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
          const board = useKanbanStore.getState().boards[boardId];
          if (board) {
            api.updateKanbanBoard(boardId, board as any).catch(console.error);
            
            // Log activity for card deletion
            api.createActivity({
              projectId: board.projectId,
              boardId: boardId,
              cardId: cardId,
              type: 'card_deleted',
              action: `deleted card "${deletedCardTitle}"`,
              user: getCurrentUser(),
              metadata: {
                cardTitle: deletedCardTitle
              }
            }).catch(console.error);
          }
        }, 0);
      },

      syncBoardToBackend: async (boardId: string) => {
        const board = useKanbanStore.getState().boards[boardId];
        if (board) {
          try {
            await api.updateKanbanBoard(boardId, board as any);
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
