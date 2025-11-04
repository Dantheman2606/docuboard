// features/activity/components/NotificationProvider.tsx
"use client";

import { useEffect, useState } from 'react';
import { useNotifications } from '../hooks';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserId(user._id || user.id);
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
      }
    }
  }, []);

  // Use the notifications hook - it will poll and show toasts automatically
  useNotifications({
    userId,
    pollInterval: 10000, // Poll every 10 seconds
  });

  return <>{children}</>;
}
