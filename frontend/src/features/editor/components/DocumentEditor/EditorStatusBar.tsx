// /features/editor/components/DocumentEditor/EditorStatusBar.tsx
"use client";

import { WifiOff, Wifi } from "lucide-react";

interface EditorStatusBarProps {
  isOnline: boolean;
  pendingSync?: boolean;
}

export function EditorStatusBar({ isOnline, pendingSync }: EditorStatusBarProps) {
  if (!isOnline) {
    return (
      <div className="bg-amber-500 text-white px-4 py-2 text-sm flex items-center gap-2 justify-center">
        <WifiOff size={16} />
        <span>You're offline. Changes will be saved locally and synced when you're back online.</span>
      </div>
    );
  }

  if (isOnline && pendingSync) {
    return (
      <div className="bg-blue-500 text-white px-4 py-2 text-sm flex items-center gap-2 justify-center">
        <Wifi size={16} />
        <span>Syncing changes to server...</span>
      </div>
    );
  }

  return null;
}
