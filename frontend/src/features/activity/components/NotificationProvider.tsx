// features/activity/components/NotificationProvider.tsx
"use client";

import { useNotifications } from '../hooks';
import { useAuthStore } from '@/features/auth/store/authStore';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  // Read userId directly from Zustand store (persisted across reloads)
  const userId = useAuthStore((state) => state.user?.id ?? null);

  // Use the notifications hook - it will poll and show toasts automatically
  useNotifications({
    userId,
    pollInterval: 10000, // Poll every 10 seconds
  });

  return <>{children}</>;
}
