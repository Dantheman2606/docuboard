// /stores/presenceStore.ts
import { create } from "zustand";

export interface UserPresence {
  id: string;
  name: string;
  color: string; // For cursor color in later Y.js phases
  isOnline: boolean;
}

interface PresenceState {
  usersOnline: UserPresence[];
  addUser: (user: UserPresence) => void;
  removeUser: (userId: string) => void;
  setUserOnline: (userId: string, online: boolean) => void;
  clearPresence: () => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  usersOnline: [],

  addUser: (user) =>
    set((state) => ({
      usersOnline: [...state.usersOnline.filter((u) => u.id !== user.id), user],
    })),

  removeUser: (userId) =>
    set((state) => ({
      usersOnline: state.usersOnline.filter((u) => u.id !== userId),
    })),

  setUserOnline: (userId, online) =>
    set((state) => ({
      usersOnline: state.usersOnline.map((u) =>
        u.id === userId ? { ...u, isOnline: online } : u
      ),
    })),

  clearPresence: () => set({ usersOnline: [] }),
}));
