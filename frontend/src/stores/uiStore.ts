// /stores/uiStore.ts
import { create } from "zustand";

interface UIState {
  isSidebarOpen: boolean;
  currentProjectId: string | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCurrentProject: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  currentProjectId: null,

  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setCurrentProject: (id) => set({ currentProjectId: id }),
}));
